# STATE: Soul DECI (Soul 自主决策)

**Current phase:** Not started
**Focus:** Planning — awaiting user approval of roadmap

---

## Project Reference

**Project:** Soul 自主决策 (DECI)
**Core value:** Soul 在边界内自主行动，在边界外主动确认
**Granularity:** Standard
**Parallelization:** true
**Mode:** yolo

**What this project delivers:**
A decision framework (DECI) overlay on the existing Soul evolution system, enabling autonomous decision-making within user-defined boundaries. The framework adds confidence thresholds, audit logs, post-decision self-checks, and emergency fallback. Built on a fixed error visibility foundation (11 empty catch blocks causing 100+ consecutive failures since 2026-03-07).

---

## Current Position

**Phase:** None — planning phase
**Plan:** None
**Status:** Awaiting roadmap approval

Progress: [--------------------] 0/4 phases

| Phase | Progress | Status |
|-------|----------|--------|
| 1. Error Visibility Foundation | 0/6 criteria | Not started |
| 2. Decision Framework | 0/5 criteria | Not started |
| 3. Evolution Resilience | 0/5 criteria | Not started |
| 4. Gatekeeper Integration | 0/3 criteria | Not started |

---

## Performance Metrics

| Metric | Value | Note |
|--------|-------|------|
| v1 Requirements | 17 | OBS-01..06, DECI-01..03,05,06, RES-01..05, GATE-01..03 |
| Requirements mapped | 17/17 | 100% coverage |
| Phases | 4 | Standard granularity |
| Phase dependencies | 3 chains | P1->P2, P1->P3, P3->P4 |

---

## Accumulated Context

### Known Issues (from research)

- **11 empty catch blocks** silently swallow errors across 5 modules (scheduler x5, merger x2, CLI integration x1, task_planner x1, project x1, superpowers x2) — root cause of 100+ consecutive evolution failures since 2026-03-07
- **Error taxonomy missing** — no PreconditionError/ProcessError/ValidationError classification, so every recovery strategy retries blindly
- **Gatekeeper unintegrated** — full logic exists in `.gates/gatekeeper.js` but zero CI integration, never blocks evolution
- **Minimum knowledge extraction non-functional** — `_extractKnowledge()` returns raw search snippet, not structured output
- **Minimum skill evolution non-functional** — `_evolveSkills()` creates empty placeholders; `_autoMerge()` prints "not implemented"
- **Scheduler lock never cleared** — `locked: true` never reset on error, so subsequent evolution cycles never run
- **Merger silently defaults KB to []** on parse failure — corrupt knowledge base causes permanent data loss

### Architecture Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Enhance existing ErrorHandler + Logger, do not replace | 668L + 754L of proven code; only needs integration | Open |
| Per-strategy circuit breakers (bulkhead) | One strategy failure should not block others | Open |
| DecisionFramework as overlay, not replacement | Backward compatible with existing evolution/reflection flows | Open |
| Supervisor tree pattern for restart | Erlang OTP, Netflix Hystrix proven; factory function prevents stale flags | Open |
| Temp+rename for atomic writes | POSIX rename is atomic; no new dependencies | Open |

### Open Questions (User Decisions Needed)

| Question | Phase | Options |
|----------|-------|---------|
| Minimum viable knowledge extraction output format | Phase 1 | Structured JSON / Markdown with frontmatter / SQLite-vec insert |
| Minimum viable evolved skill definition | Phase 1 | skill.md + manifest / skill.md + tests + manifest |
| Initial confidence scoring formula | Phase 2 | Simple weighted average / calibrated from audit log |
| Initial DECI-03 boundary config | Phase 2 | Conservative (read-only) / moderate (non-destructive) |

---

## Session Continuity

**Last session:** Roadmap creation
**Next action:** User approves roadmap -> `/gsd-plan-phase 1` to plan Phase 1 (Error Visibility Foundation)

---

*State initialized: 2026-04-12*
