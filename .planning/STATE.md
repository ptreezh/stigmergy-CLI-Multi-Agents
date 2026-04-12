# Project State

## Current Phase

Phase 1 — context gathered, ready to plan.

## Phase History

| Phase | Name | Context | Plan | Execute | Verified |
|-------|------|---------|------|---------|---------|
| 01 | Fix Error Visibility Foundation | ✓ 2026-04-12 | — | — | — |

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-12)

**Core value:** Soul 在边界内自主行动，在边界外主动确认。

## Progress Summary

| Phase | Requirements | Success Criteria | Status |
|-------|-------------|-----------------|--------|
| 1. Error Visibility Foundation | 9 (ERR-01~04, DECI-04, EVOL-01~03, INTEG-03) | 8 | Not started |
| 2. DECI Decision Framework | 21 (DECI-01~06, INTEG-01) | 8 | Not started |
| 3. Autonomous Evolution Resilience | 6 structural (no new REQ-IDs) | 8 | Not started |
| 4. Knowledge Production & Gatekeeper | 1 (INTEG-02) + 6 v2 | 7 | Not started |

**Total:** 40 tracked requirements across 4 phases

## Phase Dependencies

```
Phase 1 ──┬── Phase 2 ──┐
          └── Phase 3 ──┴── Phase 4
```

- Phase 2 depends on Phase 1 (DECI confidence thresholds and audit log need classified errors)
- Phase 3 depends on Phase 1 (DLQ and circuit breaker need error taxonomy) and Phase 2 (FallbackManager integrated before supervisor wraps it)
- Phase 4 depends on Phases 1 + 2 + 3 (gatekeeper gates a working, self-recovering system)

## Known Blockers (before Phase 1 can start)

None — all prerequisites are documented and ready to implement.

## Open Questions (user decisions needed during execution)

| Question | Phase | Options |
|----------|-------|---------|
| Minimum viable knowledge extraction output format | Phase 1 | Structured JSON / Markdown with frontmatter / SQLite-vec insert |
| Minimum viable evolved skill definition | Phase 1 | skill.md + manifest / skill.md + tests + manifest |
| Initial confidence scoring formula | Phase 2 | Simple weighted average / calibrated from audit log data |
| Initial DECI-03 boundary config | Phase 2 | Conservative (read-only) / moderate (non-destructive) |

## Architecture Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Enhance existing ErrorHandler + Logger, do not replace | 668L + 754L of proven code; only needs integration | Open |
| Per-strategy circuit breakers (bulkhead) | One strategy failure should not block others | Open |
| DecisionFramework as overlay, not replacement | Backward compatible with existing evolution/reflection flows | Open |
| Supervisor tree pattern for restart | Erlang OTP, Netflix Hystrix proven; factory function prevents stale flags | Open |
| Temp+rename for atomic writes | POSIX rename is atomic; no new dependencies | Open |
| DECI 3-layer gate: boundary -> confidence -> fallback | Hard rules catch catastrophic cases; score-based handles nuance; circuit breaker handles failure cascades | Open |

## Root Cause Evidence

The 100+ consecutive evolution failures since 2026-03-07 are directly caused by 11 empty catch blocks catalogued in `CONCERNS.md`:

| File | Lines | Impact |
|------|-------|--------|
| `soul_system_scheduler.js` | 220, 250, 414, 516, 546 | Status polling, task plan loading, alignment config, script chmod, crontab uninstall |
| `soul_auto_merger.js` | 153, 275 | KB data loading, last merge time |
| `soul_cli_integration.js` | 73 | Skills path lookup failure |
| `soul_task_planner.js` | 468 | Reflection file parsing |
| `project.js` | 449 | Project subcommand error |
| `superpowers.js` | 228, 280 | File copy operations, state injection |

---

*State initialized: 2026-04-12*
*Roadmap: .planning/ROADMAP.md*
