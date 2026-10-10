# Phase 3 Research: Autonomous Evolution Resilience

**Phase:** 03-autonomous-evolution-resilience
**Date:** 2026-10-09
**Status:** Research complete
**Method:** Inline codebase audit (direct reads/greps, no sub-agents)

---

## 1. Phase Goal (from ROADMAP.md:96)

> Make the evolution loop self-recovering and corruption-resistant — supervisor tree,
> circuit breaker, checkpoint/resume, DLQ replay, atomic writes, and scheduler singleton.

---

## 2. Roadmap File Targets vs. Actual Codebase State

| Roadmap target (ROADMAP.md:103-109) | Roadmap disposition | Actual state | Decision |
|---|---|---|---|
| `src/core/evolution/EvolutionSupervisor.js` | NEW | **Does not exist** — no `src/core/evolution/` dir at all | Create (NEW) |
| `src/core/evolution/CircuitBreakerIntegration.js` | NEW | **Does not exist** — no `src/core/evolution/` dir | Create (NEW) |
| `src/core/evolution/CheckpointStore.js` | NEW | **Does not exist** — no `src/core/evolution/` dir | Create (NEW) |
| `src/core/evolution/DeadLetterQueue.js` | NEW | **Already exists** at `src/core/soul/DeadLetterQueue.js` (110 lines, commit `a06ff3a8` Phase 1) | **Adopt existing; do NOT duplicate.** Roadmap path is stale |
| `src/core/soul/soul_auto_merger.js` | MODIFY | **Does not exist.** Merger logic lives inline in `soul_skill_evolver.js` `_autoMerge()` (lines 596-647 for merged KB; evolution merge inside evolve body) | Create as NEW module extracting inline merger, OR keep inline and make atomic. **Must ask/recommend** |
| `src/core/soul/soul_scheduler.js` | MODIFY | **Does not exist.** Only `src/core/scheduler/cron_scheduler.js` (generic cron, unrelated to evolution) | Create (NEW) |
| `src/core/coordination/error_handler.js` | MODIFY | **Exists** (713 lines). No circuit-breaker hook — has own RetryPolicy + classify | Modify: add circuit-breaker skip-retry hook |

**Key discovery:** `src/core/evolution/DeadLetterQueue.js` (roadmap NEW) is already implemented at
`src/core/soul/DeadLetterQueue.js` (commit `a06ff3a8`, Phase 1, ERR-02 line). Success criteria
#3/#4 reference the exact features this file already implements (JSONL append, errorType/
timestamp/retryCount, replay filtered to ProcessError). The plan must map this deliverable to
the EXISTING file and only wire it deeper (supervisor replay-on-start), not re-create it.

---

## 3. Verified Facts (file:line evidence)

### 3.1 Existing DeadLetterQueue — `src/core/soul/DeadLetterQueue.js`

- Path: `src/core/soul/DeadLetterQueue.js` (commit `a06ff3a8` "feat(phase1): create DeadLetterQueue.js with JSONL append/replay/rotate")
- Default store: `~/.stigmergy/soul-state/evolution-dlq.jsonl` (homedir + `.stigmergy/soul-state/`, lines 15-17)
- Entry shape on push: `{ id: crypto.randomUUID(), errorType: error.name, message, context: {...error.context, ...context}, stack, timestamp: new Date().toISOString(), retryCount: 0 }`
- `MAX_FILE_SIZE = 5MB` → rotation to `evolution-dlq-YYYY-MM-DD-1.jsonl` via `_rotateIfNeeded()`
- `_rewrite()` uses tmp file + renameSync (atomic, line ~103)
- `readAll()` → splits JSONL, filters empty lines
- `replay(handler)` → iterates entries; retries only `error instanceof ProcessError`; increments retryCount; rewrites via `_rewrite()`
- Consumers already wired: `src/cli/commands/superpowers.js:232-233` (push on failure), `src/cli/commands/project.js:531` (push)
- Coverage of success criteria: **#3 fully** (errorType, timestamp, retryCount in JSONL), **#4 replay-ProcessError fully** — replay exists but is NOT yet called by any supervisor loop (no supervisor exists)

### 3.2 Error taxonomy — `src/core/coordination/error_handler.js` (713 lines)

- `ErrorType` enum (lines ~38-57): `initialization_error, communication_error, adapter_error, health_check_error, fallback_error, timeout_error, validation_error, unknown_error`
- `RetryPolicy` enum (lines ~30-36): `IMMEDIATE, FIXED_DELAY, EXPONENTIAL_BACKOFF, LINEAR_BACKOFF, NO_RETRY`
- Per-type recovery strategy maps + retry policies (lines 70-105 for 7 of 8 types; default EXPONENTIAL_BACKOFF at line 43)
- `classify()` methods return ErrorType values (lines 311-360)
- Severity map (lines 373-380); retry policy switch (lines 400-412)
- `ErrorHandler extends EventEmitter`
- `createError(message, type = ErrorType.UNKNOWN_ERROR, context = {})` (line 598); sets `wrappedError.type`
- Exports: `ErrorHandler, ErrorType, RetryPolicy, PreconditionError, ProcessError, ValidationError`
- **Custom error classes exist here** (lines 665-704):
  - `PreconditionError` (name `'PreconditionError'`; examples: missing config, wrong state, empty input; recovery = fix inputs, do NOT retry)
  - `ProcessError` (name `'ProcessError'`; examples: network timeout, fs write failure, subprocess crash; recovery = retry with backoff, push to DLQ if persistent) ← **the recoverable type DLQ replay filters on**
  - `ValidationError` (name `'ValidationError'`; examples: JSON parse failure, schema violation; recovery = fix input, NOT retry)
- **Gap:** no circuit-breaker integration. `retry()`/`shouldRetry()` logic has no stateful open-circuit check. Roadmap wants: after circuit opens, skip retries (ROADMAP.md:109).

### 3.3 Evolution engine — `src/core/soul_skill_evolver.js` (665 lines)

Constructor config defaults (lines ~24-56):
- `config.evolve`: `{ maxKnowledgePerCycle: 10, maxSkillsPerCycle: 3, autoEvolveInterval: 24h, enableWebSearch: true, enableSkillCreation: true }`
- `config.merge`: `{ autoMergeAfterEvolve: true, mergeInterval: 1h }`

State: `evolveCount`, `lastEvolveTime`, `evolutionHistory` (in-memory), `isEvolving` (in-memory boolean guard)

Key methods (verified via grep/read):
- `evolve()` — wraps `_evolveKnowledge()` / `_evolveSkills()`; guarded by `isEvolving`
- `_evolveSkills()` — contains per-skill try/catch, `enrich()` calls, `_generateSkill`
- `_autoMerge()` (lines 596-647) — merges per-CLI `knowledge-base.json` files into `knowledge-base-merged.json`. **Verified: already atomic** — writes `mergedKbPath + '.tmp'` then `fs.renameSync(tmp, mergedKbPath)` (lines 641-643). Dedup by lowercase title; `_cli` tag added per entry.
- `_evolveSkills()` — **verified atomic** for skill-manifest: `manifestPath + '.tmp'` then `renameSync` (lines 557-559). Uses `require('./coordination/error_handler')` inline (line 564) — ProcessError already flows here.
- **Criterion #7 is already satisfied inline.** The roadmap's `soul_auto_merger.js` file does NOT exist; merger logic is inline `_autoMerge()`. Decision: extract to `soul_auto_merger.js` (roadmap file target + module boundary) OR keep inline. See decision #6.
- `_ensureDirs()` creates: `skillsPath`, `skillsPath/knowledge`, `skillsPath/evolution`
- Merge output path: `skillsPath/evolution/knowledge-base-merged.json` (to be confirmed)

No crash recovery / checkpointing. `evolutionHistory` is in-memory only — lost on restart.
No error taxonomy application beyond generic try/catch (Phase 1 ERR-01/ERR-02 done at handler level).

### 3.4 Orchestration hub — `src/core/soul_manager.js` (610 lines)

- `skillEvolver = new SoulSkillEvolver(...)` (line 246) — composed, not singleton
- `evolve(direction)` (line 407): DECI pre-action gate → `taskIntegration.wrapOperation('evolution', ...)` → `postActionVerify`
- `batchEvolve(directions)` (line 490): `wrapBatchOperation(...)`
- Heartbeat: `startHeartbeat(30min)` interval → `_heartbeatTask`
- `initAutonomousSystem()` — starts heartbeat + any autonomous scheduling
- **No scheduler singleton, no supervisor tree, no checkpoint store, no circuit breaker wiring**

### 3.5 Scheduler landscape — `src/core/scheduler/cron_scheduler.js`

- Generic `CronScheduler extends EventEmitter` (cron-parser based, task timeout default 300s), data dir `.stigmergy/scheduler`, uses `TaskHistory`
- **Unrelated to evolution loop.** No PID/flock singleton, no TTL lock for evolution
- Roadmap `soul_scheduler.js` (PID/flock singleton enforcement, success criteria #5/#6) has NO existing counterpart → must be NEW

### 3.6 Call-sites of evolution (integration surface)

- `src/cli/commands/soul.js:118` (`evolve`), `:138` (`batchEvolve`), `:145` (autonomous trigger)
- `src/core/soul_manager.js:407` (`evolve`), `:433` (postActionVerify), `:490` (`batchEvolve`)
- `src/core/soul_skill_evolver.js` — all internal
- DLQ consumers: `superpowers.js:232`, `project.js:531` (push only; replay exists but unused by loop)

---

## 4. Gap Analysis → Deliverables

| Success criterion (ROADMAP.md:112-119) | Current state | Gap to close |
|---|---|---|
| #1 5 consecutive failures → breaker trips, pause + alert | No breaker exists | NEW `CircuitBreakerIntegration.js`, wire into evolver per-strategy |
| #2 checkpoint per step; restart resumes | No checkpointing; `isEvolving` in-memory only | NEW `CheckpointStore.js`; save/resume idempotent |
| #3 failed tasks in `evolution-dlq.jsonl` w/ type+ts+retries | **DONE** (`DeadLetterQueue.js`) | Verify wiring; ensure evolution loop pushes on failure |
| #4 replay retries recoverable (ProcessError) | **DONE** (replay exists) | Supervisor must call `replay()` on start; verify recoverable classification |
| #5 scheduler lock TTL; expired auto-cleared on startup | No evolution scheduler | NEW `soul_scheduler.js` with PID/flock + TTL lock |
| #6 concurrent invocations no conflicting writes | No lock at all; `isEvolving` not cross-process | Same `soul_scheduler.js` (flock or first-writer-wins) |
| #7 merger atomic tmp+rename, no partial merge | Merge in `soul_skill_evolver.js` — write pattern UNVERIFIED | Verify `_autoMerge`/merge writes; convert to tmp+rename if not already |
| #8 loop body try/catch + exponential backoff | Evolve has per-skill try/catch, but no supervisor-level backoff | NEW `EvolutionSupervisor.js` wrapping evolve/batchEvolve |

## 5. File Plan (recommended)

1. **NEW** `src/core/evolution/EvolutionSupervisor.js` — root supervisor: exponential backoff wrapper, loop try/catch, checkpoint invocation, DLQ replay-on-start
2. **NEW** `src/core/evolution/CircuitBreakerIntegration.js` — per-strategy breakers (N=5), bulkhead, EventEmitter; exposes `shouldSkipRetry(strategy)` + `recordSuccess/Failure`, emits open/close events to the existing ErrorHandler for alert
3. **NEW** `src/core/evolution/CheckpointStore.js` — idempotent save/resume of `evolutionHistory` + current step; file under `~/.stigmergy/soul-state/evolution-checkpoint.json`
4. **NEW** `src/core/soul/soul_scheduler.js` — PID/flock-style singleton enforce; lock file with TTL (e.g., 10 min); expired-lock auto-clear on startup; first-writer-wins
5. **MODIFY** `src/core/coordination/error_handler.js` — integrate breaker skip-retry hook (after circuit opens, retry() returns NO_RETRY + emits alert)
6. **DECISION (RESOLVED 2026-10-10 user-confirmed)** `soul_auto_merger.js`: roadmap intends standalone merger module. Inline `_autoMerge()` (lines 596-647) is already atomic (tmp+rename). **RULING: keep merger inline, regression-test only (criterion #7 satisfied inline); NO `soul_auto_merger.js` extraction.** User confirmed "Keep inline" on 2026-10-10.
7. **Mapping** `src/core/evolution/DeadLetterQueue.js` → actually `src/core/soul/DeadLetterQueue.js` (existing)

## 6. Integration points (must not break)

- `soul_manager.js` is the single entry point for evolution (CLI → soul.js → soul_manager → skillEvolver). Supervisor should wrap at `soul_manager.js` level so all call-sites (soul.js:118/138/145) get resilience automatically.
- DECI gates (pre-action gate, postActionVerify) must wrap OUTSIDE supervisor recovery, not inside — gate PRESERVED as source of truth for "should evolve at all".
- Error taxonomy must flow: evolver throws `ProcessError` (recoverable → DLQ replay / retry) vs `PreconditionError`/`ValidationError` (→ no retry; checkpoint-marked failed).

---

## Validation Architecture

### 7.1 Test strategy (Jest, match existing `tests/unit/` patterns)

| Suite | Tests | Verifies |
|---|---|---|
| `tests/unit/evolution_supervisor.test.js` | backoff schedule doubles after failure; loop continues after 1 crash; replay-on-start invokes DLQ | Criteria #8 |
| `tests/unit/circuit_breaker.test.js` | 5 consecutive failures → open; success closes; alert emitted; skip-retry returns NO_RETRY when open | Criteria #1 |
| `tests/unit/checkpoint_store.test.js` | save → resume continues from last step (not scratch); resume with no checkpoint starts fresh; idempotent re-save | Criteria #2 |
| `tests/unit/dlq_replay.test.js` | ProcessError entries retried+retryCount incremented; Precondition/Validation entries skipped; tmp+rename used on rewrite | Criteria #3/#4 |
| `tests/unit/soul_scheduler.test.js` | first-writer-wins on concurrent start; expired lock auto-cleared; TTL respected | Criteria #5/#6 |
| `tests/unit/atomic_merger.test.js` | merger writes via tmp+rename; simulated crash leaves no partial file | Criteria #7 |
| `tests/unit/error_handler_circuit.test.js` | open circuit → retry() returns NO_RETRY; alert event emitted | Integration |

### 7.2 Coverage

- New/modified files must hit existing thresholds (branches 70%, functions 75%, lines/statements 80%).
- Negative-path tests required for: circuit open, expired lock, checkpoint corruption (invalid JSON → fresh start), DLQ rewrite with concurrent append.

### 7.3 Quality gates

- `npm run lint` clean on all touched files.
- `npx jest tests/unit/<new suites>` green.
- No `as any`/`@ts-ignore`; error messages contextual.
- Cross-check: a manual simulated crash (kill process mid-merge) must show no partial `knowledge-base-merged.json`.

---

## Assumptions / Risks

1. **Roadmap stale paths** (`src/core/evolution/DeadLetterQueue.js` vs existing `src/core/soul/DeadLetterQueue.js`): resolved by adopting existing file; documented in final report.
2. **Merger write pattern VERIFIED atomic** — `soul_skill_evolver.js:641-643` (merged KB) and `:557-559` (skill-manifest) both use tmp+rename. Criterion #7 already satisfied inline. The only remaining atomicity question: `soul_knowledge_base.js:_save()` line 449 uses **direct** `fs.writeFileSync` (NON-atomic) for the DNA-level KB file — verify whether this file is written by the merger path (it is the evolver's own KB, spilled by `_autoMerge`? No — `_autoMerge` writes `knowledge-base-merged.json`; `_save` writes `{name}_kb.json`). **Criterion #7 scope = `knowledge-base-merged.json` only → satisfied. `_save()` non-atomicity is out-of-scope but worth noting to user.**
3. **`isEvolving` in-memory guard** insufficient for cross-process concurrency — criterion #6 requires real lock (flock on Windows = `process.pid` file + TTL, since libuv flock available but simpler PID-file approach is cross-platform).
4. No new REQ-IDs per roadmap — Phase 3 is structural resilience only.