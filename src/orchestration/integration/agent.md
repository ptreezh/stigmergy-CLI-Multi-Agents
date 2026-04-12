# Orchestration Integration

Integrates orchestration capabilities with external systems.

## ResumeSessionIntegration

- `ResumeSessionIntegration.ts` - Session persistence and recovery
  - Saves task state to `sessions/`
  - Persists event history to `history/`
  - Manages `task_plan.md`, `findings.md`, `progress.md` files via `TaskPlanningFilesManager`
  - Enables resuming interrupted orchestration tasks across restarts
