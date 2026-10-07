# Self-Reporting Architecture

## Overview

The Stigmergy system now uses a **hybrid approach**: external scanning + agent self-reporting. This combines the best of both worlds:
- **External scanning**: Real-time activity detection without requiring agent cooperation
- **Self-reporting**: Accurate semantic data that only the agent itself can provide

## Architecture

```
bus/
├── onetime/<agent>.json       # One-time registration reports
├── daily/<agent>/<date>.json  # Daily activity reports
├── sessions/<agent>/<id>.json # Per-session reports
└── shared/
    └── knowledge.md           # Cross-agent shared knowledge
```

## Report Types

### One-Time Report
- **When**: First injection, or after config change
- **Content**: Installation path, capabilities, memory files, session format, projects
- **Frequency**: Once per agent

### Daily Report
- **When**: First session of the day
- **Content**: Yesterday's tasks, today's plan, blockers
- **Frequency**: Daily

### Session Report
- **When**: Session end
- **Content**: Working directory, files modified, tasks completed, key decisions
- **Frequency**: Per session

## Injection Status

### Successfully Injected (14 agents)
- claude, opencode, qoder, zcode, workbuddy, marvis, doubao
- kilocode, copilot, gemini, qwen, iflow, codebuddy, stigmergy

### Skipped (no skills directory found)
- kimi: `C:\Users\Zhang\.kimi\skills` not found
- poe: `C:\Users\Zhang\AppData\Roaming\Poe\skills` not found
- gbrain: `C:\Users\Zhang\.gbrain\skills` not found

## Usage

### For Agents
When you have time between tasks, run:
```bash
node skills/stigmergy-reporter/reporter.js onetime
node skills/stigmergy-reporter/reporter.js daily '{"yesterday":{...},"today":{...}}'
node skills/stigmergy-reporter/reporter.js session '{"workingDirectory":"...","filesModified":[...]}'
```

### For Orchestrator
The wiki scanner automatically loads all self-reports from `bus/` and merges them with external scan data. Self-reported data takes precedence over externally inferred data.

## Benefits

1. **Zero interference**: Agents report on their own schedule
2. **Accurate**: Agents know their own state better than external scanners
3. **Rich**: Semantic data (project progress, blockers, decisions) unavailable to external scanners
4. **Extensible**: New agents just need the skill injected
5. **Complementary**: Works alongside external scanning for real-time activity
