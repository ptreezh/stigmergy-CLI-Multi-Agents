# Agent Memory Deep-Scan Methodology

## Purpose
Systematic extraction of per-agent project progress, organizational context, and current work state from heterogeneous AI agent installations.

## Core Principles

### 1. Memory File Heterogeneity
**No standard `agent.md` exists.** Each agent uses different filenames, formats, and locations:
- opencode: `CONFIG.md`, `CROSS_CLI_GUIDE.md`
- qoder: `QODER.md`, `AGENTS.md`, `settings.json`
- workbuddy: `MEMORY.md`, `IDENTITY.md`, `BOOTSTRAP.md`, `.skill-list-cache.json`
- marvis: `schedules/*.yaml`, `messages/*.md`, databases only
- claude: `CONFIG.md`, `CROSS_CLI_GUIDE.md`, `settings.json`, `history.jsonl`
- zcode: `v2/bot-state.v2.json`, `v2/config.json`, `v2/setting.json`, `cli/log/*.jsonl`
- coze: `config.json` only

### 2. Evidence-First Scanning Hierarchy
Scan in this order, never skip levels:
1. **L1 Session history** - Recent commands, projects, session IDs
2. **L2 Project directories** - File modification timestamps, recent changes
3. **L3 Running processes** - Active PIDs, ports, uptime
4. **L4 Agent home storage** - Configuration, memory files, databases

**Rule**: Never report agent activity without evidence from at least L1 or L2.

### 3. Project Progress Location
**Project-specific progress summaries are in project directories, NOT agent home directories.**
- `D:\powerSale` → recent files, configs, test reports
- `E:\fintech` → stock-masters/, backtest reports, worktrees
- `D:\socienceAI` → HTML outputs, articles/, scripts/
- Agent homes only contain cross-cutting rules and tool configurations

## Scanning Protocol

### Phase 1: Agent Home Discovery
```
For each agent home directory:
1. List all files (including hidden)
2. Identify memory-like files by name pattern:
   - MEMORY.md, IDENTITY.md, BOOTSTRAP.md, CONFIG.md
   - AGENTS.md, QODER.md, CROSS_CLI_GUIDE.md
   - state.json, settings.json, config.json
   - history.jsonl, *.log, *.jsonl
   - schedules/, messages/, database/
3. Read each file fully
4. Extract:
   - User rules and constraints
   - Agent identity and capabilities
   - Cross-CLI integration rules
   - Recent activity timestamps
```

### Phase 2: Project Directory Mapping
```
For each discovered project path:
1. List recent files (sort by LastWriteTime desc)
2. Identify active subsystems (directories with recent changes)
3. Look for progress indicators:
   - Test reports, coverage data
   - Recent HTML/doc outputs
   - Configuration changes
   - Database updates
4. Map to agent(s) working on it
```

### Phase 3: Session History Analysis
```
For agents with session logs:
1. Read chronological entries
2. Extract project paths from session metadata
3. Identify recurring themes and user directives
4. Note pain points, blockers, corrections
5. Track methodology requirements (grill-down, TDD, worktree, etc.)
```

### Phase 4: Process and Runtime State
```
For active processes:
1. Check PIDs, ports, uptime
2. Identify workspace bindings
3. Note model/provider configurations
4. Check for rate limits or errors in logs
```

## Key Extraction Targets

### Per-Agent
- Identity files (name, vibe, purpose)
- User constraints (writing style, methodology requirements)
- Cross-CLI integration rules
- Recent activity timeline
- Current workspace bindings

### Per-Project
- Active subsystems and their states
- Recent changes (by file timestamp)
- Test coverage status
- Blockers and pain points
- User directives and corrections

### Cross-Agent
- Shared project paths
- Complementary capabilities
- Potential handoff opportunities
- Duplicate or conflicting work

## Anti-Patterns to Avoid

1. **Assuming file counts indicate progress** - Must trace to actual work directories
2. **Assuming standard filenames** - Each agent is different
3. **Ignoring project directories** - Most progress data lives there
4. **Skipping session history** - Contains critical user directives
5. **Treating running processes as activity** - May be idle shells

## Output Format

For each agent, produce:
```markdown
### {Agent Name} (`{home path}`)
- **Memory载体**: {primary memory files}
- **核心规则**: {user constraints, methodologies}
- **当前项目**: {project paths with evidence}
- **近期工作**: {specific tasks, outputs, changes}
- **当前状态**: {processes, sessions, rate limits}
```

For cross-agent mapping:
```markdown
## Cross-Agent Project Mapping
| 项目路径 | 涉及智能体 | 当前状态 |
|---------|-----------|---------|
```

## Lessons Learned

1. **Memory is distributed, not centralized** - Agent homes contain rules, projects contain progress
2. **File naming is chaotic** - Must enumerate and read, not assume
3. **Session history is gold** - Contains actual user directives and corrections
4. **Project directories tell the real story** - Agent homes tell configuration
5. **Evidence beats inference** - Always verify with L1/L2 data before concluding

## Agent-Specific Reference

### opencode
- Home: `~/.opencode`
- Key files: `CONFIG.md`, `CROSS_CLI_GUIDE.md`, `config.json`, `settings.json`
- Session data: `~/.local/share/opencode/` (SQLite db, 234MB log, snapshot storage)
- Project tracking: `injectedPaths` in session storage

### zcode
- Home: `~/.zcode`
- Key files: `v2/bot-state.v2.json`, `v2/setting.json`, `v2/config.json`, `cli/log/*.jsonl`
- Workspace binding: `bot-state.v2.json` → `bots[].workspacePath`
- Recent projects: `setting.json` → `recentProjects[]`

### qoder
- Home: `~/.qoder`
- Key files: `QODER.md` (33KB, skill guide), `AGENTS.md`, `settings.json`, `state.json`, `skill-usage.json`
- Trust dirs: `settings.json` → `permissions.trustDirectories[]`

### workbuddy
- Home: `~/.workbuddy`
- Key files: `MEMORY.md`, `IDENTITY.md`, `BOOTSTRAP.md`, `failover.json`, `mcp.json`, `.skill-list-cache.json`
- Activity signal: file modification counts (high variance, needs corroboration)

### marvis
- Home: `%APPDATA%\Tencent\Marvis\User\<id>`
- Key files: `schedules/*.yaml` (cron tasks), `messages/*.md` (execution receipts), `database/*.db`
- No traditional memory files - schedules and messages ARE the memory
- Data volume: `data.db` can exceed 14GB

### claude
- Home: `~/.claude`
- Key files: `CONFIG.md`, `CROSS_CLI_GUIDE.md`, `settings.json`, `history.jsonl` (session history)
- Session history: `history.jsonl` - most complete record of user directives

### coze
- Home: `~/.coze`
- Key files: `config.json` only (6 lines)
- Minimal local state - relies on cloud workspace

## Quick Reference: Scan Order

1. Enumerate agent home directory
2. Read all memory-like files (do not assume standard names)
3. Check project directories for recent file modifications
4. Parse session history if available
5. Correlate running processes with workspace bindings
6. Build cross-agent project map
7. Extract user constraints and methodology requirements
