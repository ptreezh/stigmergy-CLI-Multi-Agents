# Task Orchestration (TypeScript)

TypeScript layer for advanced task planning, execution, and cross-agent coordination.

## Submodules

| Module | Purpose |
|--------|---------|
| `core/` | CentralOrchestrator, task planning and CLI selection |
| `managers/` | GitWorktreeManager, StateLockManager, TaskPlanningFiles, EnhancedTerminalManager, ResultAggregator |
| `events/` | EventBus for cross-agent event publishing and recording |
| `hooks/` | HookInstaller, HookSystem for CLI coordination hooks |
| `integration/` | ResumeSessionIntegration for session recovery |
| `config/` | FILE_PATHS, CLI_HOOKS_DIR, PERFORMANCE_CONFIG |
| `types/` | Shared TypeScript interfaces (Task, SubTask, LockState, etc.) |
| `wechat/` | WechatChannel for WeChat integration |
| `utils/` | Shared utilities |

## Build

- Compiled to `dist/orchestration/` via `tsconfig.build.json`
- `npm run build:orchestration` builds only this layer
