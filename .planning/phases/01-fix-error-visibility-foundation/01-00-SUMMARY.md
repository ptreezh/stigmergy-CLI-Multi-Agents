---
phase: 01-fix-error-visibility-foundation
requirements:
  - ERR-01
  - ERR-02
  - ERR-03
  - ERR-04
  - DECI-04
  - EVOL-01
  - EVOL-02
  - EVOL-03
  - INTEG-03
status: complete
---

## Summary

01-00 establishes the executive summary for Phase 01. It maps 9 requirements to 11 files to be modified and 3 new files to be created, organized into 4 sequential waves. Child plans 01-01 and 01-02 contain the detailed task-level implementation.

Execute `01-01-PLAN.md` first. After Wave 3 is verified complete, execute `01-02-PLAN.md`.

---

## Wave Structure Overview

| Wave | Plan | Deliverables | Files |
|------|------|-------------|-------|
| Wave 1 | 01-01 | DeadLetterQueue.js, CheckpointStore.js, DecisionAuditor.js | 3 new |
| Wave 2 | 01-01 | 3 error classes + classifyEvolutionError() in error_handler.js; pushDLQ() in logger.js | 2 modified |
| Wave 3 | 01-01 | Functional stubs replaced in soul_skill_evolver.js; timeout wrapper in soul_scheduler.js | 2 modified |
| Wave 4 | 01-02 | 11 empty catch blocks replaced across 7 files | 7 modified |
