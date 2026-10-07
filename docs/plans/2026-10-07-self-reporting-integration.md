# Self-Reporting Integration Spec

## 1. Current State Analysis

### Existing CLI Commands
| Command | Entry | Purpose |
|---------|-------|---------|
| `stigmergy init` | `src/cli/commands/project.js:466` | Creates `.stigmergy/` config in CWD |
| `stigmergy setup` | `src/cli/commands/project.js` | Full setup: install + deploy + init |
| `stigmergy deploy` | `src/cli/commands/project.js:116` | Deploys hooks + Superpowers plugin |
| `stigmergy auto-coordinator` | `src/cli/commands/auto-coordinator.js` | Periodic coordination loop |
| `stigmergy wiki-scan` | `src/cli/commands/wiki-scan.js` | Scans agent memory, builds ontology |

### Existing Infrastructure
- `bus/` directory at Stigmergy project root with `registry/`, `handoffs/`, `reviews/`, `shared/`
- `skills/stigmergy-coordinator/` — coordination skill for agents
- `wiki/orchestrator.js` — external scanner with ontology
- `src/core/agent_coordinator.js` — coordination engine
- `src/core/cli_adapters.js` — adapter management

### Critical Finding: Bus Location
**Current bus is at the Stigmergy installation root, NOT in user projects.**
- `wiki/orchestrator.js` uses `path.join(process.cwd(), 'bus')` — Stigmergy project CWD
- `skills/stigmergy-reporter/reporter.js` defaults to `./bus` — agent's CWD (WRONG)
- Agents run from arbitrary directories; they cannot assume `./bus` is the Stigmergy bus

**This is a fundamental design flaw that must be fixed before integration.**

### Gaps Identified
1. `init` does NOT create bus subdirectories at the correct location
2. `deploy` does NOT inject reporter skill OR configure bus path
3. `auto-coordinator` does NOT read self-reports from bus
4. `wiki-scan` does NOT merge external + self-reported data (partially addressed)
5. Reporter skill has WRONG default bus path (uses agent CWD instead of Stigmergy root)

---

## 2. Proposed Integration

### 2.0 Fix Bus Path Resolution (REQUIRED)

**Problem**: Reporter skill defaults to `./bus` which is the agent's CWD, not the Stigmergy project root.

**Solution**: Use a universal bus location at `~/.stigmergy/bus/` (user-specific, consistent across all agents and projects).

**Implementation**:
1. Update `skills/stigmergy-reporter/reporter.js`:
   - Default bus path: `path.join(os.homedir(), '.stigmergy', 'bus')`
   - Still respect `STIGMERGY_BUS_DIR` env var if set
   - Remove `./bus` fallback
2. Update `wiki/orchestrator.js`:
   - Use same default: `path.join(os.homedir(), '.stigmergy', 'bus')`
   - Add migration: if legacy `./bus` exists and `~/.stigmergy/bus/` doesn't, move it
3. Update `src/core/agent_coordinator.js`:
   - Use same default for loading self-reports
4. Update `src/cli/commands/auto-coordinator.js`:
   - Use same default for reports subcommand

**Migration Strategy**:
- On first run of `wiki-scan`, `auto-coordinator`, or `deploy`:
  1. Check if `~/.stigmergy/bus/` exists
  2. If not, check if `./bus` exists (legacy project-local bus)
  3. If legacy exists, move it to `~/.stigmergy/bus/`
  4. If neither exists, create `~/.stigmergy/bus/` with subdirectories
- This preserves existing data and is idempotent

**Rationale**: User-specific location ensures all agents (CLI, IDE, desktop) write to the same bus regardless of their CWD or project. This is simpler than per-project buses and matches the existing coordination model.

### 2.1 Enhance `stigmergy init`

**File**: `src/cli/commands/project.js` → `handleInitCommand`

**Current behavior**:
- Creates `.stigmergy/config.json` in project CWD
- Detects CLI paths
- Skips skills cache if called from setup

**New behavior**:
- **NO bus creation here** — init is project-local and should stay fast
- Bus will be created lazily on first `deploy`, `wiki-scan`, or `auto-coordinator run`

**Rationale**: Bus is user-level state at `~/.stigmergy/bus/`. Creating it during project init would surprise users by touching their home directory without explicit request.

### 2.2 Enhance `stigmergy deploy`

**File**: `src/cli/commands/project.js` → `handleDeployCommand`

**Current behavior**:
- Scans available CLI tools
- Deploys hooks for autoInstall tools
- Deploys Superpowers plugin system

**New behavior**:
- Create `~/.stigmergy/bus/` if it doesn't exist (idempotent):
  - `~/.stigmergy/bus/onetime/`
  - `~/.stigmergy/bus/daily/`
  - `~/.stigmergy/bus/sessions/`
  - `~/.stigmergy/bus/shared/`
- Install `stigmergy-reporter` skill to central skills directory:
  - Copy `skills/stigmergy-reporter/` to `~/.stigmergy/skills/stigmergy-reporter/`
  - Use existing `SkillSyncManager` or `SkillInstaller` to sync to all detected agent skill dirs
  - Log sync results per agent
- Do NOT fail entire deploy if one agent sync fails

**Rationale**: Deploy is the right place because:
1. It already modifies agent homes (hooks, skills)
2. User expects system-wide changes during deploy
3. Creating `~/.stigmergy/bus/` here is an explicit side-effect the user opted into
4. Reporter skill is installed once to `~/.stigmergy/skills/` and synced via existing skill distribution mechanism

### 2.3 Enhance `stigmergy setup`

**File**: `src/cli/commands/project.js` → `handleSetupCommand`

**Current behavior**:
- Calls `init` + `deploy` + additional setup

**New behavior**:
- No changes needed — setup will automatically include new deploy enhancements
- Bus creation + reporter injection happen during the deploy phase

### 2.4 Enhance `stigmergy auto-coordinator`

**File**: `src/cli/commands/auto-coordinator.js` + `src/core/agent_coordinator.js`

**Current behavior**:
- Scans agents
- Creates handoffs
- Routes tasks

**New behavior**:
- Add lazy bus creation: if `~/.stigmergy/bus/` doesn't exist, create it
- Add method `loadSelfReports()` to `AgentCoordinator`
- At start of each coordination cycle:
  1. Load all self-reports from `~/.stigmergy/bus/`
  2. Update agent registry with self-reported data
  3. Prioritize agents with blockers for task routing
  4. Surface daily blockers in status output
- Add `stigmergy auto-coordinator reports` subcommand:
  - Shows recent self-reports summary
  - Lists agents by last report time
  - Shows blockers across agents

---

## 3. Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ stigmergy   │     | Agent A      |     | Agent B     |
│ init/deploy |────▶| (idle)       │     | (idle)      │
│             │     | runs reporter│     | runs reporter│
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                          │                    │
                          ▼                    ▼
                   ┌────────────────────────────────┐
                   | ~/.stigmergy/bus/              |
                   | ├── onetime/A.json            │
                   | ├── daily/A/2026-10-07.json   │
                   | ├── sessions/A/ses_123.json   │
                   | ├── daily/B/2026-10-07.json   │
                   | └── shared/knowledge.md       │
                   └────────────────────────────────┘
                          │
                          ▼
                   ┌────────────────────────────────┐
                   | stigmergy wiki-scan            │
                   | stigmergy auto-coordinator     │
                   | (merge external + self-reports)│
                   └────────────────────────────────┘
```

**Key**: Bus is at `~/.stigmergy/bus/`, NOT in project directories. This is the universal coordination point.

---

## 4. File Changes Summary

### New Files
- `skills/stigmergy-reporter/SKILL.md` ✅
- `skills/stigmergy-reporter/reporter.js` ⚠️ needs bus path fix
- `skills/stigmergy-reporter/templates/onetime.md` ✅
- `skills/stigmergy-reporter/templates/daily.md` ✅
- `skills/stigmergy-reporter/templates/session.md` ✅
- `docs/self-reporting-architecture.md` ✅
- `docs/plans/2026-10-07-self-reporting-integration.md` ✅ (this file)

### Modified Files
- `src/cli/commands/project.js` — enhance `handleDeployCommand` to sync reporter skill via existing skill sync mechanism
- `src/core/agent_coordinator.js` — add `loadSelfReports()` method
- `src/cli/commands/auto-coordinator.js` — add `reports` subcommand
- `wiki/orchestrator.js` — ⚠️ needs bus path fix from `./bus` to `~/.stigmergy/bus/`
- `skills/stigmergy-reporter/reporter.js` — ⚠️ needs bus path fix

### No Changes Needed
- `package.json` — scripts already exist
- `src/cli/router-beta.js` — commands already registered
- Individual agent skill directories — reporter skill will be synced from central location

---

## 5. Testing Plan

### Unit Tests
1. `handleDeployCommand` creates `~/.stigmergy/bus/` subdirectories and injects reporter skill
2. `handleInitCommand` does NOT create bus directories (project-local only)
3. `AgentCoordinator.loadSelfReports()` parses valid/invalid JSON
4. `reporter.js` generates valid onetime/daily/session reports to `~/.stigmergy/bus/`
5. Migration logic moves legacy `./bus` to `~/.stigmergy/bus/` when needed

### Integration Tests
1. Full flow: init → deploy → generate report → wiki-scan reads it
2. Multiple agents reporting to same bus
3. Malformed report handling (skip, don't crash)
4. Bus path resolution from agent skill location

### E2E Tests
1. `stigmergy setup` on fresh machine creates bus + injects reporter
2. `stigmergy auto-coordinator run` reads self-reports
3. `stigmergy wiki-scan` shows self-reported projects

---

## 6. Rollback Plan

### If init enhancement fails
- Bus directories are additive, no existing config touched
- Rollback: delete `~/.stigmergy/bus/` directory

### If deploy injection fails
- Superpowers deployment already has try/catch per CLI
- Reporter injection follows same pattern
- Rollback: delete `<cli-home>/skills/stigmergy-reporter/`

### If auto-coordinator enhancement fails
- Existing coordination loop unaffected
- New method is additive
- Rollback: revert `agent_coordinator.js` changes

### If bus path change breaks things
- Both old (`./bus`) and new (`~/.stigmergy/bus/`) paths are tried
- No data loss, just duplicate writes during transition

---

## 7. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Agent home doesn't exist | Skip with warning, don't fail deploy |
| Bus directory already exists | `mkdir -p` equivalent, no error |
| Self-report JSON is malformed | Catch parse error, warn, skip file |
| Multiple agents write to same bus | File-based, no locking needed (append-only) |
| Agent reports same project multiple times | Normalize paths, deduplicate in wiki-scan |
| Very large self-report files | Ignore files > 10MB (existing threshold) |
| Agent CWD is not Stigmergy project | Use `~/.stigmergy/bus/` universal location |
| Desktop agent has no skills dir | Skill sync will skip; agent must support central skills path or manual config |
| User deletes `~/.stigmergy/bus/` | Next `deploy`/`wiki-scan`/`auto-coordinator run` recreates it; no data loss in agent homes |
| Multiple Stigmergy versions | Each version uses same `~/.stigmergy/bus/`; backward compatible |

---

## 8. Open Questions

### Resolved
1. **Q**: Should `stigmergy init` inject reporter skill immediately, or only on `deploy`?
   - **A**: Only on `deploy`, to keep init fast and focused

2. **Q**: Should reporter skill be injected into ALL agents or only verified ones?
   - **A**: All detected agents with a skills directory, same as Superpowers deployment

3. **Q**: Should self-reports be gitignored?
   - **A**: Yes, `~/.stigmergy/bus/*/` should be in global gitignore; `shared/` may be committed if user chooses

4. **Q**: Should there be a `stigmergy report` command for manual report generation?
   - **A**: No, agents run reporter.js directly. User doesn't need this.

5. **Q**: Where should the bus live — project-local or user-global?
   - **A**: User-global at `~/.stigmergy/bus/`. Project-local buses create synchronization nightmares across agents working in different directories.

6. **Q**: How do agents find the bus if they don't know the Stigmergy install path?
   - **A**: Universal path `~/.stigmergy/bus/` is hardcoded in reporter skill. No per-agent config needed.

### Remaining
7. **Q**: Should desktop agents (kimi, poe, gbrain) without skills dirs get a different injection mechanism?
   - **Proposed**: With centralized skill sync, these agents need to support loading skills from `~/.stigmergy/skills/` or equivalent. If not, they cannot use the reporter skill automatically. Document manual config for these agents.

---

## 9. Success Criteria

1. `stigmergy deploy` creates `~/.stigmergy/bus/` with 4 subdirectories (lazy creation also works via wiki-scan/auto-coordinator)
2. `stigmergy deploy` installs reporter skill to `~/.stigmergy/skills/` and syncs to all detected agent skill directories via existing skill sync mechanism
3. `stigmergy wiki-scan` loads self-reports from `~/.stigmergy/bus/` without errors
4. `stigmergy auto-coordinator run` reads and uses self-report data
5. Zero breaking changes to existing commands
6. All existing tests pass
7. Reporter skill correctly resolves bus path regardless of agent CWD
8. Legacy `./bus` data is automatically migrated to `~/.stigmergy/bus/`
