# Stigmergy CLI Source Root

Unified entry point (`src/index.js`) delegating to `src/cli/router-beta.js` for all CLI commands.

## Subsystems

| Subsystem | Purpose |
|-----------|---------|
| `cli/` | Command parsing, routing, and handler dispatch |
| `commands/` | Skill-related command modules (OpenSkills integration) |
| `core/` | CLI detection, coordination, soul evolution, skills, memory |
| `adapters/` | Tool-specific adapters for Claude, Gemini, Qwen, iFlow, etc. |
| `orchestration/` | TypeScript task planning, worktree management, event bus |
| `gateway/` | Remote CLI orchestration via Feishu, Telegram, Slack, Discord |
| `interactive/` | Interactive mode with persistent CLI pool and shared context |
| `incubator/` | Experimental features: skill registry, CLI generator, progress tracker |
| `communication/` | Cross-platform messaging adapter layer |
| `utils/` | Shared helpers (cross-platform utilities, formatters) |

## Entry Points

- `index.js` - Main entry point
- `cli/router-beta.js` - Modular command router (replaces deprecated router.js)
