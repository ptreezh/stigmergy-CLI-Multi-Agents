# Soul 自主决策 Roadmap

**Project:** Soul 自主决策 (DECI: Autonomous Decision-Making)
**Version:** 1.0
**Created:** 2026-04-12
**Core Value:** Soul 在边界内自主行动，在边界外主动确认。

---

## Overview

The DECI roadmap is sequenced to fix the broken foundation first, then layer decision intelligence on top of visible, classified errors. Building autonomous decisions on invisible failures (100+ consecutive evolution failures caused by 11 empty catch blocks) would produce confidently wrong outcomes.

| Order | Rationale |
|-------|-----------|
| Phase 1 before all others | Error visibility is prerequisite for every other phase. DECI confidence thresholds need error signals. Circuit breaker needs error classification. Audit logs need non-silent errors. |
| Phase 2 before Phase 3 | DECI decision framework should be stable before building resilience around it. FallbackManager (DECI-06) integrates with circuit breaker, not the other way around. |
| Phase 3 before Phase 4 | Gatekeeper should gate a working evolution system, not a broken one. Running gatekeeper on 100+ failure state would block all evolution permanently. |
| Phase 4 last | Knowledge production and CI gate are enhancements on a working, self-recovering, autonomous system. |

---

## Phases

### Phase 1: Fix Error Visibility Foundation

**Goal:** Replace 11 empty catch blocks with structured logging, implement error taxonomy, and deliver minimum viable knowledge/skill extraction — giving every other phase the error signals it needs.

**Requirements:** ERR-01, ERR-02, ERR-03, ERR-04, DECI-04, EVOL-01, EVOL-02, EVOL-03, INTEG-03

**Dependencies:** None (prerequisite for all other phases)

**Estimated files to create/modify:**
- `src/core/coordination/error_handler.js` — add PreconditionError / ProcessError / ValidationError taxonomy
- `src/core/soul/failure_circuit_breaker.js` — add error classification methods
- `src/core/coordination/logger.js` — add DLQ push capability
- `src/core/soul/soul_skill_evolver.js` — minimum `_extractKnowledge()`, `_evolveSkills()`, `_autoMerge()`
- `src/core/soul/decision_auditor.js` — DECI-04 append-only JSONL audit log (NEW)
- `src/core/soul/soul_scheduler.js` — add evolution timeout wrapper (10 min max)
- 5 files with empty catch blocks — replace each with structured logging + DLQ push + rethrow
- `.stigmergy/soul-state/decisions/` — directory structure for INTEG-03

**Success Criteria:**
1. `grep -rn '} catch.* {}' src/` returns 0 results for the 11 known empty blocks
2. Every caught error is classified as PreconditionError / ProcessError / ValidationError in evolution-log.jsonl
3. Evolution cycle has a hard timeout of 10 minutes — no cycle hangs indefinitely
4. Critical path failures surface to operators (not silently swallowed) via Logger or EventBus
5. `.stigmergy/soul-state/decisions/{YYYY-MM-DD}.jsonl` exists and appends on every decision
6. `_extractKnowledge()` returns structured content (title + body + metadata), not a pass-through string
7. `_evolveSkills()` produces a real skill.md + skill-manifest.json, not a placeholder
8. `_autoMerge()` performs actual KB merging (tmp+rename), not a console.log stub

---

### Phase 2: Implement DECI Decision Framework

**Goal:** Deliver the full DECI-01 through DECI-06 decision layer — boundary filtering, confidence scoring, self-check, and fallback — wrapping existing Soul components without modifying them.

**Requirements:** DECI-01, DECI-01a, DECI-01b, DECI-01c, DECI-02, DECI-02a, DECI-02b, DECI-03, DECI-03a, DECI-03b, DECI-03c, DECI-05, DECI-05a, DECI-05b, DECI-05c, DECI-06, DECI-06a, DECI-06b, DECI-06c, DECI-06d, INTEG-01

**Dependencies:** Phase 1 (error taxonomy + audit log required for DECI to operate on real signals)

**Plans:** 3 plans in 3 waves

Plans:
- [ ] 02-01-PLAN.md -- Wave 1: DecisionContext + DecisionBoundary + boundaries.json (Layer 1 + schema)
- [ ] 02-02-PLAN.md -- Wave 2: ConfidenceScorer + EmergencyFallback + SoulDecisionEngine (Layers 2/3 + orchestrator)
- [ ] 02-03-PLAN.md -- Wave 3: DecisionVerifier + FallbackManager + SoulManager INTEG-01 + barrel export

**Estimated files to create/modify:**
- `src/core/soul/DECI/DecisionContext.js` — shared context type (NEW)
- `src/core/soul/DECI/DecisionBoundary.js` — Layer 1 rule-based boundary checker (NEW)
- `src/core/soul/DECI/ConfidenceScorer.js` — Layer 2 5-dimension weighted scorer (NEW)
- `src/core/soul/DECI/EmergencyFallback.js` — Layer 3 implements state-machine pattern inspired by FailureCircuitBreaker (composition, per-strategy bulkhead) (NEW)
- `src/core/soul/DECI/SoulDecisionEngine.js` — 3-layer gate orchestrator (NEW)
- `src/core/soul/DECI/DecisionVerifier.js` — DECI-05 post-execution self-check (NEW)
- `src/core/soul/DECI/FallbackManager.js` — DECI-06 escalation levels (NEW)
- `src/core/soul/DECI/index.js` — barrel export (NEW)
- `.stigmergy/soul-state/boundaries/boundaries.json` — DECI-03 boundary config schema (NEW)
- `src/core/soul_manager.js` — integrate DecisionEngine before autonomous actions (INTEG-01) (MODIFY)

**Success Criteria:**
1. `SoulDecisionEngine.decide(context)` returns `{ final_decision: 'ACT_AUTONOMOUSLY' | 'ASK_USER' | 'BLOCK' | 'HALT_AND_NOTIFY' }` with layer-by-layer reasoning
2. Layer 1 (DecisionBoundary) correctly BLOCKs destructive operations defined in boundaries.json
3. Layer 2 (ConfidenceScorer) produces deterministic autonomy_score per decision type; below 0.65 threshold -> ESCALATE
4. Layer 3 (EmergencyFallback) escalates through NOMINAL -> DEGRADED -> ESCALATE -> ABORT based on consecutive failure count
5. DecisionVerifier returns PASS / FAIL / UNVERIFIABLE verdict after every autonomous action
6. `Auditor.getAutonomyRate(days)` returns ratio of autonomous vs. escalated decisions
7. Every decision record in decisions/{YYYY-MM-DD}.jsonl includes: decision_id, timestamp, situation, layer1/2/3 results, final_decision, outcome
8. DECI-03 boundaries.json is schema-validated at startup; invalid config throws with clear error

---

### Phase 3: Autonomous Evolution Resilience

**Goal:** Make the evolution loop self-recovering and corruption-resistant — supervisor tree, circuit breaker, checkpoint/resume, DLQ replay, atomic writes, and scheduler singleton.

**Requirements:** (Structural resilience — no new REQ-IDs; addresses Pitfalls 2, 3, 6)

**Dependencies:** Phase 1 (DLQ + circuit breaker need error taxonomy) and Phase 2 (FallbackManager integrated before supervisor wraps it)

**Estimated files to create/modify:**
- `src/core/evolution/EvolutionSupervisor.js` — root supervisor with exponential backoff (NEW)
- `src/core/evolution/CircuitBreakerIntegration.js` — per-strategy breakers, bulkhead, event emission (NEW)
- `src/core/evolution/CheckpointStore.js` — save/resume progress idempotently (NEW)
- `src/core/evolution/DeadLetterQueue.js` — persist failed tasks JSONL + replay mechanism (NEW)
- `src/core/soul/soul_auto_merger.js` — replace direct fs.writeFile with tmp+rename atomic writes
- `src/core/soul/soul_scheduler.js` — PID/flock singleton enforcement
- `src/core/coordination/error_handler.js` — integrate circuit breaker to skip retries after circuit opens

**Success Criteria:**
1. After 5 consecutive failures on one strategy, circuit breaker trips — evolution pauses and alerts
2. Each evolution step saves a checkpoint; restart resumes from last completed step (not from scratch)
3. Failed tasks appear in `.stigmergy/soul-state/evolution-dlq.jsonl` with error type, timestamp, retry count
4. Replay process reads DLQ entries and retries those with recoverable error types (ProcessError)
5. Scheduler lock has TTL; expired locks are auto-cleared on startup
6. Concurrent scheduler invocations do not write conflicting state (flock or first-writer-wins)
7. Merger writes use atomic tmp+rename — no partial merges corrupt skill state on crash
8. Evolution loop body is wrapped in try/catch with exponential backoff — single crash does not break loop

---

### Phase 4: Knowledge Production & Gatekeeper Integration

**Goal:** Wire gatekeeper into the evolution loop (CI blocks on failure), enable real multi-agent knowledge cross-validation, identify skill gaps, and auto-generate tests for evolved skills.

**Requirements:** INTEG-02, plus v2 capabilities: DECI-07, DECI-08, DECI-09, DECI-10, DECI-11, DECI-12, DECI-13

**Dependencies:** Phase 1 (minimum knowledge extraction working), Phase 2 (DECI self-check + fallback), Phase 3 (checkpoint + DLQ operational)

**Estimated files to create/modify:**
- `src/core/evolution/EvolutionSupervisor.js` — invoke gatekeeper.js after each iteration (INTEG-02)
- `.gates/gatekeeper.js` — invoke programmatically from evolution loop (not just CLI)
- `src/core/evolution/MultiAgentCrossValidator.js` — real multi-perspective knowledge validation (NEW)
- `src/core/evolution/SkillGapAnalyzer.js` — compare installed skills vs. mission requirements (NEW)
- `src/core/evolution/AutonomousTestGenerator.js` — generate tests for evolved skills (NEW)
- `.github/workflows/evolution-gate.yml` — CI workflow running gatekeeper on evolution artifacts (NEW)
- `src/core/soul/DECI/ConfidenceCalibrator.js` — outcome-tracked calibration from audit log (NEW)

**Success Criteria:**
1. `gatekeeper.js` is `require()`d and invoked programmatically from the evolution loop — non-zero exit blocks CI
2. Every evolution iteration produces a gatekeeper report as a required artifact
3. Multi-agent cross-validation (collaboration strategy) produces real competing outputs, not "Not enough valid analyses"
4. SkillGapAnalyzer outputs a list of missing capabilities against mission requirements from SOUL.md
5. AutonomousTestGenerator produces a test file (tests/agent/*.test.js) for every evolved skill before Level 2 claim
6. ConfidenceCalibrator computes calibration accuracy from decision audit log; updates weights after N decisions
7. DECI-02 outcome calibration curve is stored per decision type — high-confidence wrong decisions decrement task_familiarity weight

---

## Phase Transition Triggers

| Transition | Trigger |
|-----------|---------|
| Phase 1 -> Phase 2 | All 8 Phase 1 success criteria pass; evolution-log.jsonl shows classified errors |
| Phase 2 -> Phase 3 | DECI-01 through DECI-06 all return non-null decisions; audit log has 10+ entries |
| Phase 3 -> Phase 4 | 5 consecutive evolution cycles complete without loop crash; DLQ replay succeeds |
| Project complete | All v1 requirements validated |

---

## Requirement Coverage Summary

| Requirement | Phase | Status |
|-------------|-------|--------|
| ERR-01: Replace 11 empty catch blocks | Phase 1 | Done (commits a06ff3a8, 4683f5b9) |
| ERR-02: Error taxonomy (3 types) | Phase 1 | Done |
| ERR-03: Evolution timeout wrapper (10 min) | Phase 1 | Done |
| ERR-04: Non-silent failure reporting | Phase 1 | Done |
| DECI-04: Decision audit log (append-only JSONL) | Phase 1 | Done |
| EVOL-01: Minimum viable _extractKnowledge() | Phase 1 | Done |
| EVOL-02: Minimum viable _evolveSkills() | Phase 1 | Done |
| EVOL-03: Auto-merge _autoMerge() | Phase 1 | Done |
| INTEG-03: Decision state directory structure | Phase 1 | Done |
| DECI-01: SoulDecisionEngine (3-layer gate) | Phase 2 | Pending (02-02) |
| DECI-01a: DecisionBoundary (Layer 1) | Phase 2 | Pending (02-01) |
| DECI-01b: ConfidenceScorer (Layer 2) | Phase 2 | Pending (02-02) |
| DECI-01c: EmergencyFallback (Layer 3) | Phase 2 | Pending (02-02) |
| DECI-02: Per-decision-type confidence thresholds | Phase 2 | Pending (02-02) |
| DECI-02a: Default threshold 0.65 | Phase 2 | Pending (02-02) |
| DECI-02b: Below threshold -> escalate | Phase 2 | Pending (02-02) |
| DECI-02c: Outcome-tracked calibration | Phase 2 | Deferred to Phase 4 |
| DECI-03: boundaries.json schema | Phase 2 | Pending (02-01) |
| DECI-03a: Block rules (destructive always escalate) | Phase 2 | Pending (02-01) |
| DECI-03b: Autonomous rules (read-only, trusted) | Phase 2 | Pending (02-01) |
| DECI-03c: Schema validated at startup | Phase 2 | Pending (02-01) |
| DECI-05: DecisionVerifier (post-execution self-check) | Phase 2 | Pending (02-03) |
| DECI-05a: PASS / FAIL / UNVERIFIABLE verdict | Phase 2 | Pending (02-03) |
| DECI-05b: FAIL -> trigger DECI-06 fallback | Phase 2 | Pending (02-03) |
| DECI-05c: Self-check feeds confidence calibration | Phase 2 | Pending (02-03) |
| DECI-06: FallbackManager (consecutive failure escalation) | Phase 2 | Pending (02-03) |
| DECI-06a: NOMINAL (0 failures) | Phase 2 | Pending (02-03) |
| DECI-06b: DEGRADED (1-2 failures) | Phase 2 | Pending (02-03) |
| DECI-06c: ESCALATE (3-4 failures) | Phase 2 | Pending (02-03) |
| DECI-06d: ABORT (5+ failures) | Phase 2 | Pending (02-03) |
| INTEG-01: DecisionEngine integrated into SoulManager | Phase 2 | Pending (02-03) |
| INTEG-02: gatekeeper.js invoked from evolution loop | Phase 4 | Pending |
| Circuit breaker integration | Phase 3 | Pending |
| EvolutionSupervisor (root supervisor) | Phase 3 | Pending |
| CheckpointStore (save/resume) | Phase 3 | Pending |
| Dead Letter Queue (persist + replay) | Phase 3 | Pending |
| Atomic writes in Merger | Phase 3 | Pending |
| Scheduler singleton (PID/flock) | Phase 3 | Pending |
| Multi-agent knowledge production | Phase 4 | Pending |
| Skill gap identification | Phase 4 | Pending |
| Autonomous test generation | Phase 4 | Pending |

**Total tracked requirements: 40 (19 v1 primary + 6 ERR/EVOL/INTEG + 6 Phase 3 structural + 6 Phase 4 v2)**
**v2 capabilities (DECI-07 through DECI-13): planned for Phase 4 extension**

---

## Constraints

- **No new npm dependencies** — all implementations use Node.js built-ins + existing ErrorHandler + Logger + FailureCircuitBreaker
- **Backward compatible** — existing evolution/reflection flows unchanged; DECI layer wraps, not replaces
- **Deterministic outputs** — same context always produces same decision (no randomness)
- **All decision state in `.stigmergy/soul-state/decisions/`** — consistent with existing Soul state directory
- **Tech:** Node.js >= 16, ESM/CommonJS mixed

---

*Roadmap created: 2026-04-12 based on research/SUMMARY.md, research/STACK.md, research/FEATURES.md, research/PITFALLS.md, research/ARCHITECTURE.md, REQUIREMENTS.md, PROJECT.md*
*Phase 2 plans added: 2026-04-12*
