# Automated Multi-Signal Agent-Project Correlation

## Problem

Current `wiki/orchestrator.js` uses a single signal: memory file content. This misses the majority of real agent→project associations because most agents do not write project paths into their memory files. Result: `marvis`, `opencode`, `kimi`, `kilocode`, `workbuddy`, `doubao` all run real projects but the scanner fails to attribute them.

## Steelman Constraints

1. **Zero user input**: Future users will NOT manually provide mappings.
2. **Fully automated**: Scan, correlate, output. No human in the loop.
3. **Evidence-based**: Every mapping must be traceable to a verifiable signal.
4. **Graceful degradation**: Missing tools (sqlite3, git) must not break the scan.
5. **Performance bounded**: Full scan must complete in <60s on this Windows machine.
6. **Backward compatible**: Existing `wiki/latest.json` schema must not break consumers.

## Proposed Solution: Multi-Signal Correlation Engine

### Signal Taxonomy

| Signal | Source | Confidence Weight | Coverage | Notes |
|--------|--------|-------------------|----------|-------|
| A | Agent marker dirs in project root (`.claude`, `.opencode`, etc.) | 3 | HIGH | Direct evidence of agent involvement |
| B | Running process cwd / command line | 3 | HIGH | Live activity, strongest signal |
| C | Agent home config (workspacePath, recentProjects, injectedPaths) | 2 | MEDIUM | Explicit but may be stale |
| D | File modification correlation | 1 | MEDIUM | Implicit, needs aggregation |
| E | Content path extraction from memory files | 1 | LOW-MED | Current single signal, kept for backward compat |
| F | Git log cross-reference | 2 | MEDIUM | Requires git in project dir |
| G | Workspace database (zcode bot-state, marvis schedules, workbuddy.db) | 3 | HIGH | Agent-specific high-value sources |

### Algorithm

1. **Collect signals** for all agents × all candidate projects
2. **Normalize paths**: map any path to known project root if it starts with that root
3. **Filter agent-internal paths**: drop anything under agent home directories
4. **Aggregate confidence**: sum weights for all signals that match an agent→project pair
5. **Time decay**: only signals within `RECENT_THRESHOLD_MS` (15 days) count
6. **Threshold**: include mapping if confidence >= 3 (single strong signal) or >= 2 signals
7. **Deduplicate**: collapse to project root paths

### Implementation Components

#### 1. `wiki/signals/process-scanner.js`
- Scan running processes via `tasklist` / `wmic process`
- Map process names to agent types
- Extract cwd and command line args
- Output: `[{ agent, cwd, command, pid }]`

#### 2. `wiki/signals/file-activity.js`
- Scan project directories for agent marker folders
- Scan agent home directories for recently modified files
- Correlate by timestamp proximity
- Output: `[{ agent, project, activityCount, lastActivity }]`

#### 3. `wiki/signals/content-extractor.js`
- Extract Windows paths from memory file content
- Normalize to known project roots
- Filter agent-internal paths
- Output: `[{ agent, project, source, confidence }]`

#### 4. `wiki/signals/workspace-db.js`
- Parse zcode `bot-state.v2.json` for workspacePath
- Parse marvis schedule YAML for project paths
- Parse workbuddy `usage-log.json` for recent activity
- Output: `[{ agent, project, source, confidence }]`

#### 5. `wiki/correlator.js`
- Aggregate all signals
- Compute confidence scores
- Apply time decay
- Output: `Map<projectPath, { agents: Set, evidence: Array, confidence: Map }>`

#### 6. Integration into `wiki/orchestrator.js`
- Replace `extractProjects` with multi-signal version
- Keep existing memory file scanning for backward compatibility
- Add new signals to pipeline
- Update `buildOntology` to include confidence scores in output

### Output Schema Changes

Add to `wiki/latest.json`:

```json
{
  "projects": {
    "D:\\powerSale": {
      "agents": ["zcode", "marvis", "claude", "opencode", "workbuddy"],
      "evidence": [
        { "agent": "marvis", "signal": "A", "source": "13_0_0.yaml", "confidence": 3 },
        { "agent": "opencode", "signal": "C", "source": "sessions/.../metadata.json", "confidence": 2 }
      ],
      "confidence": { "zcode": 6, "marvis": 5, "claude": 4, "opencode": 4, "workbuddy": 3 }
    }
  }
}
```

### Validation Criteria

1. `D:\powerSale` must show ≥5 agents (zcode, marvis, claude, opencode, workbuddy)
2. `E:\fintech` must show ≥2 agents (zcode, claude) - OR evidence explaining why not
3. `D:\socienceAI` must show ≥2 agents (claude, opencode)
4. `D:\ssciskills` must show ≥3 agents (claude, opencode, workbuddy)
5. Zero false positives from agent-internal paths
6. Scan completes in <60s

### Rollback

If multi-signal approach produces >10% false positives, fall back to signal A (agent markers) + signal C (explicit config) only. These are highest precision.
