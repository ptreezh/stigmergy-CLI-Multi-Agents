---
phase: 3
slug: autonomous-evolution-resilience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | jest.config.js |
| **Quick run command** | `npx jest tests/unit/evolution_supervisor.test.js tests/unit/circuit_breaker.test.js tests/unit/checkpoint_store.test.js tests/unit/dlq_replay.test.js tests/unit/soul_scheduler.test.js tests/unit/atomic_merger.test.js tests/unit/error_handler_circuit.test.js` |
| **Full suite command** | `npm run test:unit` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command above (suites touched by the task)
- **After every plan wave:** Run `npm run test:unit`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-XX | 01 | 1 | SC-1 (crit #1) | T-3-01 / — | Breaker trips after 5 consecutive failures; evolution pauses + alert | unit | `npx jest tests/unit/circuit_breaker.test.js` | ❌ W0 | ⬜ pending |
| 3-01-XX | 01 | 1 | SC-2 (crit #2) | T-3-01 / — | Checkpoint saved per step; resume from last completed | unit | `npx jest tests/unit/checkpoint_store.test.js` | ❌ W0 | ⬜ pending |
| 3-01-XX | 01 | 1 | SC-3+4 (crit #3,#4) | T-3-01 / — | Failure persisted to evolution-dlq.jsonl (type+ts+retry); replay retries ProcessError only | unit | `npx jest tests/unit/dlq_replay.test.js` | ✅ existing DLQ | ⬜ pending |
| 3-02-XX | 02 | 2 | SC-5+6 (crit #5,#6) | T-3-02 / — | Lock TTL + auto-clear; no conflicting concurrent writes | unit | `npx jest tests/unit/soul_scheduler.test.js` | ❌ W0 | ⬜ pending |
| 3-02-XX | 02 | 2 | SC-7 (crit #7) | T-3-01 / — | Merger writes atomic tmp+rename (no partial merge) | unit | `npx jest tests/unit/atomic_merger.test.js` | ✅ inline verified | ⬜ pending |
| 3-03-XX | 03 | 2 | SC-8 (crit #8) | T-3-01 / — | Loop try/catch + exponential backoff; single crash survives | unit | `npx jest tests/unit/evolution_supervisor.test.js` | ❌ W0 | ⬜ pending |
| 3-03-XX | 03 | 2 | SC-1..8 flow | T-3-01 / — | error_handler skips retry when breaker open (NO_RETRY) | unit | `npx jest tests/unit/error_handler_circuit.test.js` | ❌ W0 | ⬜ pending |

*Task IDs finalized after PLAN.md (wave 1 = supervisor tree, wave 2 = scheduler + atomic, wave 3 = loop wrap + breaker hook).*
*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/unit/circuit_breaker.test.js` — stubs for SC-1
- [ ] `tests/unit/checkpoint_store.test.js` — stubs for SC-2
- [ ] `tests/unit/dlq_replay.test.js` — stubs for SC-3/SC-4
- [ ] `tests/unit/soul_scheduler.test.js` — stubs for SC-5/SC-6
- [ ] `tests/unit/atomic_merger.test.js` — stubs for SC-7
- [ ] `tests/unit/evolution_supervisor.test.js` — stubs for SC-8
- [ ] `tests/unit/error_handler_circuit.test.js` — stubs for breaker-retry hook

*Framework (jest 29.x) already installed — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Simulated mid-write crash leaves no partial merged KB | SC-7 | Process-kill timing is not deterministic in unit tests | Start evolver merge with large KB, kill process mid-write, assert `knowledge-base-merged.json` is either absent or complete (never partial). Scripted as focused integration case in `tests/unit/atomic_merger.test.js`. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

## Appendix A — Pre-existing verified conditions

| # | Fact | Evidence |
|---|---|---|
| V0 | `src/core/soul/DeadLetterQueue.js` exists (110 lines, Phase 1 commit `a06ff3a8`), JSONL append/replay/rotate, ProcessError-filtered replay | file read; git log |
| V1 | DLQ default path `~/.stigmergy/soul-state/evolution-dlq.jsonl`; entry has errorType/timestamp/retryCount | DLQ.js:15-17, push shape |
| V2 | DLQ already consumed: `superpowers.js:232`, `project.js:531` (push only) | grep |
| V3 | `error_handler.js` (713 lines): ErrorType enum (8), RetryPolicy enum (5), PreconditionError/ProcessError/ValidationError classes, `createError()` at :598, no circuit-breaker hook | full read |
| V4 | `soul_manager.js` = sole evolution entry (evolve :407, batchEvolve :490, DECI gates, heartbeat 30min); no supervisor/scheduler wrapper | full read |
| V5 | `soul_skill_evolver.js` (665 lines): isEvolving guard, inline `_autoMerge()` :596-647 **already atomic** (tmp+rename :641-643), manifest writes atomic (:557-559), `_save()` in knowledge_base NON-atomic (direct writeFileSync :449, out of criterion #7 scope) | full read + grep |
| V6 | `src/core/evolution/` does not exist; `soul_scheduler.js`, `soul_auto_merger.js`, `failure_circuit_breaker.js` do not exist | glob/grep |
| V7 | Roadmap Phase 3 files (ROADMAP.md:103-109): 3 NEW evolution modules + DLQ (exists elsewhere) + merger/scheduler (don't exist) + error_handler modify | ROADMAP read |

## Appendix B — Gates run before plan write

| Gate | Input | Output |
|---|---|---|
| Security threat model | `security_enforcement` absent → enabled (ASVS L1, block-on high) | PLAN.md must include `<threat_model>` block |
| UI contract | `ui_phase:true`, `ui_safety_gate:true`; phase has NO frontend indicators (only "circuit" matched "ui" — false positive) | no UI-SPEC needed |
| Schema push | Phase changes no schema/API surface (internal resilience only) | no migration |

## Appendix C — Open decisions carried to plan

1. **soul_auto_merger.js**: roadmap file-list says create; criterion #7 already satisfied inline (V5). **RESOLVED 2026-10-10 (user confirmed "Keep inline")** → keep merger inline, regression-test only; NO `soul_auto_merger.js` extraction (zero behavior change either way).
2. **soul_scheduler.js location**: roadmap puts it under `src/core/soul/` (soul_* naming) though it is a NEW file. Honored as `src/core/soul/soul_scheduler.js`.
3. **DLQ mapping**: roadmap `src/core/evolution/DeadLetterQueue.js` (NEW) → actual `src/core/soul/DeadLetterQueue.js` (exists). Plan will wire supervisor replay-on-start; no duplicate file.
4. **Circuit breaker granularity**: per-strategy (per requirement #1 "on one strategy"). Minimum viable: per-strategy counters keyed by evolve direction/strategy name.