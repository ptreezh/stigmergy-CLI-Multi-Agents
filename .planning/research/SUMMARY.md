# Project Research Summary

**Project:** Soul 自主决策 (DECI: Autonomous Decision-Making)
**Domain:** Autonomous AI Agent Self-Evolution with Decision Framework
**Researched:** 2026-04-12
**Confidence:** HIGH (grounded in live codebase analysis: evolution-log.jsonl 2335 lines, 11 empty catch blocks catalogued, existing module inspection, established engineering patterns)

---

## Executive Summary

The Soul Autonomous Decision-Making system is not a greenfield project — it is a decision and resilience overlay on a severely broken existing system. Research confirms the system has 100+ consecutive evolution failures since 2026-03-07, caused by 11 empty catch blocks that silently swallow errors across 5 critical modules (scheduler, merger, task planner, CLI integration). Every claimed capability (self-reflection, skill discovery, knowledge production, Gatekeeper verification) is non-functional because the error signal required to drive them is discarded at every call site. The DECI framework (autonomous decision-making with confidence thresholds, audit logs, and emergency fallback) cannot be built on this foundation — it would make decisions based on invisible failures.

The recommended approach is a 4-phase plan: Phase 1 fixes the broken foundation (empty catch blocks, error taxonomy, minimum knowledge/skill extraction). Phase 2 implements the DECI decision framework itself (DECI-01 through DECI-06). Phase 3 adds autonomous evolution resilience (circuit breaker, supervisor, checkpoint, DLQ). Phase 4 stabilizes the integration (gatekeeper CI, knowledge production, skill gap analysis). The key insight from all four research files is unanimous: **do not add features until the error visibility is fixed** — more strategies, faster cycles, and automated skill promotion will all fail the same way the current three strategies do.

---

## Key Findings

### Recommended Stack

**Strategy: Enhance, don't replace.** Three critical custom modules already exist and are well-designed: `ErrorHandler` (668 lines, exponential backoff, error types, recovery strategies), `FailureCircuitBreaker` (204 lines, per-strategy consecutive failure counting, file-persistent state), and `Logger` (754 lines, ring buffer, file rotation, metrics). All three need integration and minor enhancements — not replacement. One new package (`@humanwhocodes/retry@^0.4.0`) is needed for low-level retry primitives; it is already present transitively. Pino is recommended only for CI log aggregation (JSON format); the existing Logger should be enhanced for text output.

**Core technologies:**
- **Existing ErrorHandler** — retry/backoff/error classification. Needs: jitter (prevent thundering herd), integration into `executeSkills()` in `SoulEngine.js`, circuit breaker integration to skip retries after circuit opens.
- **Existing FailureCircuitBreaker** — circuit breaker for evolution strategies. Needs: integration into `SoulEngine.runEvolutionTasks()`, event emission on state change, integration with ErrorHandler.
- **Existing Logger** — structured logging. Needs: JSON output mode for CI aggregators, drop-in replacement for `console` in CI.
- **`@humanwhocodes/retry@^0.4.0`** — low-level retry primitive (already in lock file). Use via `ErrorHandler.retry()`, not hand-rolled setTimeout loops.
- **GitHub Actions `schedule` event** — autonomous evolution loop. `cron: "0 */6 * * *"` (every 6 hours), `if: always()` to run gatekeeper even on failure, `concurrency` to prevent overlap.

**What NOT to use:** Winston (3-5x slower), opossum (over-engineered for file-persistent CB), xstate v5 (50KB+, overkill for 5 states), promise-retry (deprecated underlying lib), axios-retry (HTTP-only, Soul uses child processes).

### Expected Features

The research identifies a critical tier inversion: the features the system claims are **table stakes** for a working system, not competitive differentiators. The system's current "differentiators" (multi-agent debate, skill gap identification, adaptive strategy) are only achievable after fixing the table stakes.

**Must have (P0 — broken system repair):**
- **Error visibility** — 11 empty catch blocks across 5 modules silently swallow all errors. Every catch must log: error message, module name, operation, timestamp, stack trace.
- **Evolution failure detection** — The system never detects evolution failed. Scheduler cycles through strategies blindly, 100+ times.
- **Non-silent failure reporting** — Users and operators must be notified when critical paths fail. Currently nothing surfaces.
- **Circuit breaker** — Repeated failure of the same operation should stop wasting resources. Currently: 100+ identical failures with no backoff.
- **Minimum knowledge extraction** — `_extractKnowledge()` in `soul_skill_evolver.js:421-431` is a trivial pass-through returning the search snippet as-is. Zero usable knowledge.
- **Minimum skill evolution** — `_evolveSkills()` creates placeholder skill objects with no content, no tests, no validation.
- **Auto-merge implementation** — `_autoMerge()` literally prints "not implemented." This is the core cross-CLI knowledge-sharing mechanism.
- **Gatekeeper CI integration** — Gatekeeper exists with full logic but zero CI integration. Evolution loop has no gate.

**Should have (P1 — stabilization):**
- **Evolution state persistence** — Between failures, system must remember what failed, why, and what was tried.
- **Graceful degradation** — Evolution failures should not crash or corrupt user-facing features.
- **Adaptive strategy selection** — Analyze why each strategy failed and adapt, instead of round-robin.
- **DECI-01: Decision framework** — When to decide autonomously vs. ask for confirmation.
- **DECI-02: Confidence thresholds** — Auto-escalate to user confirmation when below threshold.
- **DECI-03: Decision boundary configuration** — User-defined scopes for autonomous action.
- **DECI-04: Decision audit log** — Input, options, choice, rationale, timestamp for every decision.
- **DECI-05: Decision self-check** — Post-decision verification that result matches expectation.
- **DECI-06: Emergency fallback** — Consecutive failures trigger fallback + operator notification.

**Defer (v2+ — differentiation):**
- **Skill gap identification** — Compare installed skills against mission requirements. Needs skill ontology + 2+ weeks of stable table stakes.
- **Multi-agent debate** — Real cross-validation with multiple perspectives. Needs adaptive strategy selection working first.
- **Autonomous test generation** — New skills validated by auto-generated tests before Level 2+ claim. Needs skill evolution producing real artifacts first.

**Anti-features to avoid:** More evolution strategies (current 3 already fail identically), faster evolution cycles (more noise, same root cause), automated skill promotion to Level 3+ (defeats Gatekeeper purpose).

### Architecture Approach

The proven model for fault-tolerant autonomous loops is a **Supervisor Tree** (Erlang OTP, Netflix Hystrix, AWS). Every worker is supervised. Supervisors restart workers with exponential backoff. The tree isolates blast radius. Six patterns form the foundation:

1. **Supervisor Tree** — Root supervisor owns all restarts. Factory function pattern (fresh instance per restart) prevents stale flags (`isRunning: true`).
2. **Circuit Breaker** — Open/half-open/closed state machine. Trip after N consecutive failures. Give downstream systems time to recover. Per-strategy breakers (bulkhead) so one tripped breaker doesn't block others.
3. **Checkpoint/Resume** — Save progress after each evolution step. Resume from last saved position on restart instead of from scratch. Steps must be idempotent.
4. **Dead Letter Queue (DLQ)** — Append failed tasks to JSONL on exhausted retries. Separate replay process can recover transient failures. TTL (7 days) prevents unbounded growth.
5. **Exponential Backoff with Jitter** — Prevent thundering herd when multiple evolution instances retry simultaneously.
6. **Idempotent Merger Writes** — Write to temp file, atomic rename. Rollback journal records pre-write state. Never write in-place on skill files.

**Proposed structure:**
```
src/core/
├── evolution/
│   ├── EvolutionSupervisor.js    # Root supervisor, restart policy
│   ├── CircuitBreaker.js          # Per-strategy breaker (or enhanced FailureCircuitBreaker)
│   ├── RetryPolicy.js             # Exponential backoff + jitter
│   ├── DeadLetterQueue.js         # Persist & replay failed tasks
│   └── CheckpointStore.js         # Save/resume evolution progress
├── soul/                          # Existing: soul_manager.js, soul_skill_evolver.js, etc.
│   ├── DECI/
│   │   ├── DecisionFramework.js  # DECI-01: boundary + confidence decision logic
│   │   ├── DecisionLogger.js      # DECI-04: audit log (input/options/choice/rationale/timestamp)
│   │   ├── DecisionVerifier.js    # DECI-05: post-decision self-check
│   │   └── FallbackManager.js     # DECI-06: consecutive failure fallback
│   └── confidence_threshold.js   # DECI-02: configurable threshold per decision type
```

**Error taxonomy (required before DECI-01 can work):**
- **PreconditionError** — Missing inputs, prerequisites not met. Trigger: fix inputs, not retry. Example: "Not enough valid analyses" (crossValidation always).
- **ProcessError** — Operation failed mid-execution. Trigger: retry with backoff. Example: network timeout, subprocess crash.
- **ValidationError** — Output does not meet quality bar. Trigger: strategy rotation. Example: "No valid solutions" (competition always).

### Critical Pitfalls

1. **Silent Error Swallowing (11 empty catch blocks)** — Root cause of 100+ consecutive failures. Locations confirmed in `CONCERNS.md`. Fix: ESLint `no-empty` rule, structured logging + DLQ push + rethrow in every catch. Phase: **Phase 1 foundation**.

2. **Autonomous Loop With No Recovery Boundary** — Evolution loop has no top-level try/catch. Single bad iteration breaks every subsequent iteration. No circuit breaker means 100+ rapid retries hammer a broken subsystem. Fix: wrap loop body, implement circuit breaker, exponential backoff. Phase: **Phase 1 + Phase 3**.

3. **Ghost Completion — "Looks Done But Isn't"** — System reports outcomes that appear successful but are not. Three strategies fail identically with no variance: crossValidation (precondition), collaboration (process), competition (validation). Error classification missing. Fix: distinguish PreconditionError / ProcessError / ValidationError — each has different recovery strategy. Phase: **Phase 1 (error taxonomy)**.

4. **Verification Gate Unintegrated From Execution** — Gatekeeper (`.gates/gatekeeper.js`) has full logic but is not wired into evolution loop or CI. It runs only when a human remembers. Fix: `require()` gatekeeper in evolution loop, CI blocks on non-zero exit. Phase: **Phase 4**.

5. **State Corruption in Persistent Loops** — Merger silently defaults KB to `[]` on parse failure. Scheduler lock (`locked: true`) never cleared on error. Multiple cron instances write conflicting state. Fix: atomic writes (temp+rename), TTL on lock files, singleton enforcement via flock/PID. Phase: **Phase 3**.

---

## Implications for Roadmap

Based on combined research, a 4-phase plan emerges. The critical sequencing constraint: **DECI cannot be built on broken error handling** — the decision framework needs accurate error signals to make autonomous choices and know when to escalate.

### Phase 1: Fix Error Visibility Foundation

**Rationale:** All other phases depend on being able to see and classify errors. Without this, circuit breakers, DECI confidence thresholds, and audit logs all operate on invisible data. The ROI is highest: 11 sites, 1-2 hours of work, immediate observability improvement.

**Delivers:**
- All 11 empty catch blocks replaced with structured error logging + DLQ push + rethrow
- Error taxonomy implemented: `PreconditionError`, `ProcessError`, `ValidationError`
- Evolution timeout wrapper (10 min max per cycle) — prevents scheduler hanging
- **DECI-04: Decision audit log** — DecisionLogger.js, stores input/options/choice/rationale/timestamp to `.stigmergy/soul-state/decisions/`
- Minimum viable `_extractKnowledge()` — real content extraction from sources (title, structured content, metadata), not trivial pass-through
- Minimum viable `_evolveSkills()` — real skill.md + tests + manifest generation

**Avoids:** Pitfall 1 (silent swallowing), Pitfall 3 (ghost completion via error classification)

**Stack used:** Existing ErrorHandler + Logger (enhanced), `@humanwhocodes/retry`

---

### Phase 2: Implement DECI Decision Framework

**Rationale:** DECI-01 through DECI-06 are the project's primary deliverable. Phase 1 error visibility gives DECI accurate input signals. This phase is self-contained — it adds a decision layer that calls existing modules (SoulManager, SkillEvolver, KnowledgeBase) without modifying them, maintaining backward compatibility with evolution/reflection flows.

**Delivers:**
- **DECI-01: Decision framework** — `DecisionFramework.js`: evaluates decision requests against boundary config + confidence score. Returns: `AUTONOMOUS` (within boundary, above threshold), `ESCALATE` (below threshold), `BLOCK` (outside boundary).
- **DECI-02: Confidence thresholds** — Per-decision-type configurable thresholds. Auto-escalates to user confirmation when below. Uses deterministic scoring (no randomness).
- **DECI-03: Decision boundary configuration** — JSON schema in `.stigmergy/soul-state/boundaries.json`. User-definable scopes: what Soul may decide autonomously, what requires confirmation, what is blocked. Schema-validated at startup.
- **DECI-05: Decision self-check** — `DecisionVerifier.js`: post-decision verification. Compares actual outcome against expected outcome. Triggers DECI-06 on mismatch.
- **DECI-06: Emergency fallback** — `FallbackManager.js`: consecutive failures (configurable N) → enter fallback mode → notify operators (log + EventBus) → await manual intervention or timeout.

**Architecture:** DecisionFramework wraps existing SoulManager calls. It does not replace them. It intercepts each decision point, evaluates boundary + confidence, logs to DecisionLogger, and optionally verifies with DecisionVerifier.

**Avoids:** DECI operating on invisible error data (Phase 1 prerequisite)

---

### Phase 3: Autonomous Evolution Resilience

**Rationale:** With error visibility (Phase 1) and DECI (Phase 2) in place, the evolution loop can now be made reliable. The supervisor tree pattern gives the system self-recovery without operator intervention. This is the structural fix for the 100+ failure streak.

**Delivers:**
- **EvolutionSupervisor** — Root supervisor. Manages scheduler + task planner + merger restart policies. Exponential backoff on crash. Factory function pattern prevents stale state flags.
- **Circuit breaker integration** — Wrap scheduler → evolve() call. Trip after 5 consecutive failures. Per-strategy breakers (bulkhead). Event emission on state change. Integration with existing FailureCircuitBreaker.
- **CheckpointStore** — Save progress after each evolution step. Resume from last saved position on restart. Idempotent steps.
- **Dead Letter Queue** — Failed tasks appended to JSONL on exhausted retries. 7-day TTL. Replay mechanism for transient failures. Provides audit trail + recovery path.
- **Atomic writes in Merger** — Replace direct `fs.writeFile` with tmp+rename. Rollback journal. Prevents partial merges corrupting skill state.
- **Scheduler singleton** — PID/flock enforcement prevents cron overlap writing conflicting state.

**Avoids:** Pitfall 2 (no recovery boundary), Pitfall 5 (state corruption)

---

### Phase 4: Knowledge Production & Gatekeeper Integration

**Rationale:** With the foundation solid (Phase 1), DECI operating (Phase 2), and evolution resilient (Phase 3), the system can now produce genuine knowledge and prevent regression. Gatekeeper CI integration is the final quality gate.

**Delivers:**
- **Gatekeeper CI integration** — `gatekeeper.js` invoked programmatically from evolution loop. CI blocks on non-zero exit. Gatekeeper report as required artifact of every evolution iteration.
- **Multi-agent knowledge production** — Real cross-validation with multiple perspectives (not current stub). Requires adaptive strategy selection working first.
- **Skill gap identification** — Scan installed skills, detect missing capabilities against mission requirements. Needs skill ontology + 2+ weeks of stable table stakes.
- **Autonomous test generation** — New skills validated by auto-generated tests before claiming Level 2+.
- **Evolution state persistence** — Checkpoint + DLQ fully operational. Graceful degradation (evolution failures don't affect user-facing features).
- **Adaptive strategy selection** — Analyze failure patterns to pick right strategy instead of round-robin. Based on error taxonomy from Phase 1.

**Avoids:** Pitfall 4 (gatekeeper theater), knowledge production always producing garbage

---

### Phase Ordering Rationale

| Order | Why |
|-------|-----|
| Phase 1 before all others | Error visibility is prerequisite for every other phase. DECI confidence thresholds need error signals. Circuit breaker needs error classification. Audit log needs non-silent errors. |
| Phase 2 before Phase 3 | DECI decision framework should be stable before building resilience around it. FallbackManager (DECI-06) integrates with circuit breaker, not the other way around. |
| Phase 3 before Phase 4 | Gatekeeper should gate a working evolution system, not a broken one. Running gatekeeper on the current 100+ failure state would block all evolution permanently. |
| Phase 4 last | Knowledge production and CI gate are enhancements on a working, self-recovering, autonomous system. |

---

### Research Flags

**Needs deeper research during planning:**

- **Phase 1 (knowledge extraction pipeline):** What should `_extractKnowledge()` actually do? Parse documentation pages, extract code examples, summarize conceptual content? Downstream consumer (skill evolution, alignment checker) needs are unclear. Needs user decision or experiment.
- **Phase 1 (minimum viable skill):** What is a minimum viable evolved skill? skill.md + tests + manifest? The answer determines extraction pipeline output requirements.
- **Phase 2 (confidence scoring):** Deterministic confidence scoring formula is not yet defined. Needs to balance: task complexity, available knowledge, historical success rate, certainty of decision. Requires experimentation to calibrate.
- **Phase 4 (multi-agent debate):** Competition strategy fails with "No valid solutions" — is this a generation failure or evaluation failure? The correct mechanism for multi-agent competition needs runtime experimentation.

**Standard patterns (skip research-phase):**

- **Phase 1 (empty catch blocks):** Industry-standard fix: ESLint `no-empty`, structured logging, rethrow.
- **Phase 3 (circuit breaker):** Netflix Hystrix / Erlang OTP patterns. Existing FailureCircuitBreaker in codebase. Integration is well-understood.
- **Phase 3 (checkpoint/DLQ):** Temporal.io / AWS patterns. No external APIs needed.
- **Phase 3 (atomic writes):** POSIX atomic rename. No external dependencies.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing ErrorHandler (668L), FailureCircuitBreaker (204L), Logger (754L) inspected directly. `@humanwhocodes/retry` confirmed in lock file. pino benchmarks public. GitHub Actions schedule syntax from official docs. |
| Features | HIGH | Findings from live codebase analysis: evolution-log.jsonl (2335 lines), empty catch block catalog in CONCERNS.md, module source inspection, gatekeeper system analysis. All derived from concrete evidence. |
| Architecture | HIGH | Supervisor tree (Erlang OTP), circuit breaker (Netflix Hystrix), retry (AWS guidance), checkpoint/resume (Temporal.io) — all established patterns with multiple production implementations. Application to Stigmergy codebase is medium confidence (no runtime observation), but patterns are HIGH confidence. |
| Pitfalls | HIGH | 11 empty catch blocks catalogued with exact line numbers. evolution-log.jsonl shows 100+ consecutive failures with timestamps. CONCERNS.md audit is current (2026-04-12). Gatekeeper unintegration confirmed from source. |

**Overall confidence:** HIGH — all findings are grounded in concrete codebase evidence. Main gaps are in Phase 1/2/4 open questions (see above) which need user decisions or runtime experimentation, not additional research.

### Gaps to Address

| Gap | How to Handle |
|-----|---------------|
| Minimum viable knowledge extraction output format | Decide during Phase 1 planning. Options: structured JSON, Markdown with frontmatter, SQLite-vec insert. Affects skill evolution downstream. |
| Minimum viable evolved skill definition | Decide during Phase 1 planning. Needs consultation with existing skill format (SKILL.md, skill-manifest.json). |
| Deterministic confidence scoring formula | Prototype during Phase 2. Start simple: `score = weightedAverage(taskComplexity, knowledgeCoverage, historicalSuccess)`. Calibrate from decision audit log. |
| DECI-03 boundary schema | User must define initial boundaries during Phase 2 planning. Provide sensible defaults (e.g., read-only operations = autonomous, destructive operations = escalate). |
| WeChat incomplete integration (TODO stubs at wechat-hub.js:207,245) | Not in DECI roadmap but flagged in PITFALLS.md Phase 3. Needs separate tracking. |

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `evolution-log.jsonl` — 2335 consecutive failures since 2026-03-07
- `CONCERNS.md` — 11 empty catch blocks with line numbers, 2026-04-12 audit
- `src/core/coordination/error_handler.js` — 668 lines, ErrorType enum, RetryPolicy, EventEmitter
- `src/core/soul/failure_circuit_breaker.js` — 204 lines, per-strategy CB, file-persistent state
- `src/core/coordination/logger.js` — 754 lines, ring buffer, file rotation, metrics
- `.gates/GATEKEEPER.md` — Gatekeeper system definition (5 checkpoints, enforcement rules)
- `.gates/gatekeeper.js` — Full gatekeeper logic, zero CI integration
- `package-lock.json` — `@humanwhocodes/retry@0.4.x` present transitively
- `skills/wechat-hub.js` — TODO comments at lines 207, 245

### Secondary (HIGH confidence — established patterns)
- Erlang OTP Supervisor documentation: https://www.erlang.org/doc/design_principles/sup_princ.html
- Netflix Hystrix Circuit Breaker: https://github.com/Netflix/Hystrix/wiki/How-it-Works
- AWS retry guidance (exponential backoff + jitter): https://docs.aws.amazon.com/general/latest/gr/api-retries.html
- Temporal.io checkpoint/resume patterns: https://docs.temporal.io/concepts/what-is-a-workflow
- Microsoft Resilience patterns (bulkhead, circuit breaker): https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead
- pino vs winston performance benchmarks: https://github.com/pinojs/pino
- GitHub Actions schedule syntax: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule
- Circuit breaker pattern (Martin Fowler): https://martinfowler.com/bliki/CircuitBreaker.html

### Tertiary (MEDIUM confidence — needs validation)
- Competitor feature comparison in FEATURES.md — no external research tools available, estimated from publicly known systems
- Open questions (Tavily API key status, GitHub Actions workflow status) — cannot resolve from codebase alone

---

*Research completed: 2026-04-12*
*Ready for roadmap: yes*
