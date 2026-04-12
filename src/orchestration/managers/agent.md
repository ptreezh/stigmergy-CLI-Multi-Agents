# Orchestration Managers

TypeScript manager classes for task execution infrastructure.

## Managers

| Manager | Purpose |
|---------|---------|
| `GitWorktreeManager.ts` | Manages git worktrees for parallel development branches |
| `StateLockManager.ts` | File-based distributed locking for concurrent tasks |
| `TaskPlanningFiles.ts` | Manages `task_plan.md`, `findings.md`, `progress.md` files |
| `EnhancedTerminalManager.ts` | Enhanced terminal session management |
| `ResultAggregator.ts` | Aggregates results from parallel sub-tasks |
| `__tests__/` | Unit tests for all managers |
