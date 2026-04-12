# CentralOrchestrator Core

TypeScript task planning and CLI selection engine. The heart of the orchestration layer.

## Files

- `CentralOrchestrator.ts` - Main orchestrator: task decomposition, CLI routing, result aggregation
- `CentralOrchestrator-Realtime.ts` - Realtime variant with enhanced terminal management
- `CentralOrchestrator-WithLock.ts` - Lock-aware variant for concurrent task safety
- `auto_classifier.js` - Automatic task type classification
- `evolution_reporter.js` - Reports orchestration evolution metrics
- `failure_circuit_breaker.js` - Circuit breaker for failing CLIs
- `global_knowledge_base.js` / `global_lessons.js` - Shared knowledge across orchestrations
- `global_soul_manager.js` - Global soul state during orchestration
- `knowledge_inheritance.js` - Inherits knowledge between tasks
- `project_soul_manager.js` - Project-scoped soul state
- `promotion_manager.js` - Promotes experimental features to production
