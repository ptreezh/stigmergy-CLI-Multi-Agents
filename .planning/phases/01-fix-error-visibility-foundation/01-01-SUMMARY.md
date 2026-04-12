# 01-01-SUMMARY: New Infrastructure Files + Error Taxonomy

**Phase:** 01-fix-error-visibility-foundation
**Plan:** 01-01
**Status:** Complete
**Executed:** 2026-04-12

---

## What Was Built

### New Files (3)

| File | Purpose | Key Methods |
|------|---------|-------------|
| `src/core/soul/DeadLetterQueue.js` | JSONL append-only DLQ with rotation | `push()`, `readAll()`, `replay()`, `_rotateIfNeeded()`, `_rewrite()` |
| `src/core/soul/CheckpointStore.js` | Event-driven evolution checkpointing | `begin()`, `save()`, `checkTimeout()`, `clear()`, `_load()`, `_save()` |
| `src/core/soul/DecisionAuditor.js` | Append-only JSONL decision audit log | `log()`, `getRecentDecisions()`, `getAutonomyRate()` |

### Modified Files (4)

| File | Change |
|------|--------|
| `src/core/coordination/error_handler.js` | Added `PreconditionError`, `ProcessError`, `ValidationError` classes + updated `module.exports` |
| `src/core/coordination/logger.js` | Added `pushDLQ(entry)` method to Logger class |
| `src/core/soul_skill_evolver.js` | Replaced 3 stubs: `_extractKnowledge()` (git), `_evolveSkills()` (skill creation), `_autoMerge()` (KB deduplication) |
| `src/core/soul_scheduler.js` | Added `CheckpointStore` + `DeadLetterQueue` integration to `triggerEvolve()` with timeout wrapper |

### Key Decisions Honored from 01-CONTEXT.md

- **Zero new npm deps**: All implementations use only `fs`, `path`, `crypto` (built-in Node.js)
- **DLQ as JSONL append-only**: `fs.appendFileSync` per R-02; rotation at 5MB
- **Atomic writes via tmp+rename**: `_rewrite()` in DLQ, `_save()` in CheckpointStore, skill creation in `_evolveSkills`, KB merge in `_autoMerge`
- **Checkpoint schema**: Matches R-04 exactly — `{ evolutionId, startedAt, lastCheckpoint, currentStep, completedSteps, partialResults }`
- **Error taxonomy**: PreconditionError / ProcessError / ValidationError placed in `error_handler.js` per D-01
- **DecisionAuditor log dir**: `.stigmergy/soul-state/decisions/` with `decisions_YYYY-MM-DD.jsonl` per D-07
- **10-minute timeout**: `EVOLUTION_TIMEOUT_MS = 10 * 60 * 1000` in CheckpointStore

### Deviations from Plan

- `_extractKnowledge()` gracefully falls back to `source.snippet` when not in a git repo (git unavailable is not a ProcessError in practice — it returns results rather than throwing)
- `triggerEvolve()` in soul_scheduler wraps `soulManager.learn()` in the step loop rather than replacing it entirely — existing soulManager behavior is preserved
- `PushDLQ()` uses a `try/catch` with fallback to `logger.error()` rather than propagating — safe for cases where DLQ dir itself is unwritable

---

## Verification Results

```
node -e "require('./src/core/soul/DeadLetterQueue.js')"       # OK
node -e "require('./src/core/soul/CheckpointStore.js')"       # OK
node -e "require('./src/core/soul/DecisionAuditor.js')"       # OK
grep -l "class PreconditionError" error_handler.js            # OK
grep -l "class ProcessError" error_handler.js                 # OK
grep -l "class ValidationError" error_handler.js               # OK
grep -l "pushDLQ" logger.js                                  # OK
grep -l "execSync" soul_skill_evolver.js  (>= 1)             # 3 found
grep -l "SKILL.md" soul_skill_evolver.js  (>= 1)             # 2 found
grep -l "seen.set" soul_skill_evolver.js  (>= 1)             # 1 found
node -e "require('./src/core/soul_skill_evolver.js')"         # OK
node -e "require('./src/core/soul_scheduler.js')"             # OK
grep -l "CheckpointStore" soul_scheduler.js                   # OK
```

## Requirements Covered

| Requirement | Status |
|-------------|--------|
| ERR-01 (DLQ) | Done — DeadLetterQueue.js |
| ERR-02 (Error taxonomy) | Done — 3 classes in error_handler.js |
| ERR-03 (Evolution timeout) | Done — CheckpointStore + scheduler integration |
| ERR-04 (Non-silent failures) | Done — Logger.pushDLQ + DLQ push in scheduler |
| DECI-04 (Decision audit log) | Done — DecisionAuditor.js |
| EVOL-01 (_extractKnowledge) | Done — git-based implementation |
| EVOL-02 (_evolveSkills) | Done — SKILL.md + skill-manifest.json creation |
| EVOL-03 (_autoMerge) | Done — KB deduplication + tmp+rename |
| INTEG-03 (decision state dir) | Done — `.stigmergy/soul-state/decisions/` |

---

*Summary created: 2026-04-12*
