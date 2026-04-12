# Core Functionality

Central engine of Stigmergy CLI. Handles CLI detection, skill management, coordination, and soul evolution.

## Submodules

| Module | Path | Purpose |
|--------|------|---------|
| `coordination/` | `core/coordination/` | Cross-CLI communication, intent routing, nodejs hook deployment |
| `soul/` | `core/soul/` | Soul alignment, wiki evolution, knowledge routing, promotion |
| `soul_engine/` | `core/soul_engine/` | SoulEngine autonomous evolution (reflection, skill discovery, knowledge production) |
| `skills/` | `core/skills/` | OpenSkills integration: StigmergySkillManager, SkillSyncManager |
| `memory/` | `core/memory/` | Memory management |
| `config/` | `core/config/` | Configuration loading |
| `plugins/` | `core/plugins/` | HookManager, ContextInjector, PluginDeployer |
| `scheduler/` | `core/scheduler/` | CronScheduler, task history |
| `hooks/` | `core/hooks/` | Coordination hooks (evolution, skill-created, verification) |
| `evolution/` | `core/evolution/` | EvolveLoop, EvolveOrchestrator, SkillGenerator |
| `extraction/` | `core/extraction/` | Data extraction |
| `multilingual/` | `core/multilingual/` | i18n support |

## Key Files

- `cli_tools.js` - Defines all supported AI CLI tools with install commands, hooks dirs, OAuth configs
- `cli_path_detector.js` - Detects and caches paths to available CLI tools
- `cli_adapters.js` - Normalizes parameter differences (interactive vs one-time modes) across tools
- `smart_router.js` - Analyzes user input and auto-selects the best AI tool
- `soul_manager.js` / `soul_knowledge_base.js` - Soul system management
