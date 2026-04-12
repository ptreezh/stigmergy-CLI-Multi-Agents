# Phase 2: Implement DECI Decision Framework - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Source:** User decisions (inline, no discuss-phase run)

<domain>
## Phase Boundary

Implement SoulDecisionEngine with 3-layer gate (boundary -> confidence -> fallback), post-execution verifier, and FallbackManager, wrapping existing Soul components without modifying them.

**DECI 3-layer gate:**
- Layer 1 (DecisionBoundary): Hard rule-based boundary checker
- Layer 2 (ConfidenceScorer): 5-dimension weighted average, deterministic
- Layer 3 (EmergencyFallback): Extends FailureCircuitBreaker, consecutive failure escalation

</domain>

<decisions>
## Implementation Decisions (Locked by User)

### DECI-02: Confidence Scoring Formula
- **Decision:** Simple weighted average — fixed weights, no runtime calibration needed
- **Rationale:** Fast startup; audit log calibration deferred to Phase 4 (DECI-02c)
- **5 dimensions:** task_familiarity (0.3), outcome_history (0.25), risk_level (0.20), context_clarity (0.15), autonomy_budget (0.10)
- **Threshold:** 0.65 — below escalates, above autonomous

### DECI-03: Boundary Config
- **Decision:** Moderate (non-destructive) — read operations + non-destructive writes autonomous; destructive ops always escalate
- **Rationale:** Allows meaningful autonomous action while preventing catastrophic damage
- **Destructive = BLOCK unconditionally:** git push --force, rm -rf, DROP TABLE, chmod -R 0, network exfil, secret write
- **Non-destructive = Layer 2 decides:** file writes (no delete), git add/commit/push (no force), API calls (no delete), CLI installs
- **Read-only = always autonomous:** grep, cat, ls, git status, curl (GET)

### DECI Architecture
- DecisionFramework as overlay, NOT replacement — backward compatible with existing evolution/reflection flows
- Supervisor tree pattern for restart (Erlang OTP / Netflix Hystrix proven; factory function prevents stale flags)
- Temp+rename for atomic config writes — POSIX rename is atomic; no new dependencies
- Per-strategy circuit breakers (bulkhead) — one strategy failure should not block others

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/ROADMAP.md` — Phase 2 full spec: goals, requirements, dependencies, success criteria
- `.planning/REQUIREMENTS.md` — All DECI-01~06, INTEG-01 requirement definitions
- `.planning/STATE.md` — Phase dependencies, open questions, architecture decisions
- `src/core/soul/failure_circuit_breaker.js` — Existing circuit breaker (DECI Layer 3 extends this)
- `src/core/soul_manager.js` — SoulManager (DECI Layer 1,2,3 integrate as overlay here)
- `src/core/coordination/error_handler.js` — Error taxonomy (PreconditionError, ProcessError, ValidationError)
- `src/core/coordination/logger.js` — Logger (DLQ push capability exists)
- `src/core/soul/decision_auditor.js` — DECI-04 audit log (append-only JSONL, already exists from Phase 1)

</canonical_refs>

<specifics>
## Specific Ideas

### DecisionEngine Interface
```
decide(context: DecisionContext): {
  decision_id: string,
  timestamp: ISO8601,
  situation: string,
  layer1: { decision: 'PASS'|'BLOCK', reason: string },
  layer2: { score: number, threshold: 0.65, decision: 'AUTONOMOUS'|'ESCALATE' },
  layer3: { state: 'NOMINAL'|'DEGRADED'|'ESCALATE'|'ABORT', consecutive_failures: number },
  final_decision: 'ACT_AUTONOMOUSLY'|'ASK_USER'|'BLOCK'|'HALT_AND_NOTIFY',
  reasoning: string[]
}
```

### boundaries.json Schema
```json
{
  "version": "1.0",
  "default_threshold": 0.65,
  "rules": [
    { "pattern": "git push --force", " action": "BLOCK", "reason": "Destructive git operation" },
    { "pattern": "rm -rf /**",       "action": "BLOCK", "reason": "Recursive delete" },
    { "pattern": "DROP TABLE",       "action": "BLOCK", "reason": "Database destructive" },
    { "pattern": "chmod -R 0",       "action": "BLOCK", "reason": "Permission destruction" },
    { "pattern": "POST/PUT*/DELETE http*://*", "action": "LAYER2", "reason": "Non-destructive HTTP" },
    { "pattern": "read-only operation",        "action": "AUTONOMOUS", "reason": "No side effects" }
  ],
  "operation_categories": {
    "destructive": ["force-push", "delete-recursive", "drop-table", "chmod-zero"],
    "non_destructive": ["read", "write-file", "git-add", "git-commit", "api-get", "api-post"],
    "always_safe": ["grep", "cat", "ls", "git-status", "curl-GET"]
  }
}
```

### 5-Dimension Confidence Scorer Weights
| Dimension | Weight | Source |
|-----------|--------|--------|
| task_familiarity | 0.30 | Audit log: times this task type completed successfully |
| outcome_history | 0.25 | Audit log: recent decisions for this situation type |
| risk_level | 0.20 | Derived from DECI-03 operation category |
| context_clarity | 0.15 | Input completeness score (0-1) |
| autonomy_budget | 0.10 | Remaining daily autonomous action budget |

### FallbackManager Escalation States
| State | Consecutive Failures | Action |
|-------|---------------------|--------|
| NOMINAL | 0 | Normal autonomous operation |
| DEGRADED | 1-2 | Reduce autonomy, prefer ASK_USER |
| ESCALATE | 3-4 | Most decisions → ASK_USER |
| ABORT | 5+ | BLOCK all non-critical, HALT_AND_NOTIFY for critical |

</specifics>

<deferred>
## Deferred Ideas

- DECI-02c: Outcome-tracked calibration (weights adjusted from audit log) — deferred to Phase 4
- DECI-07 through DECI-13 (v2 capabilities) — Phase 4
- ConfidenceCalibrator — Phase 4 (DECI-02c)
- Multi-agent knowledge production — Phase 4

</deferred>

---

*Phase: 02-implement-deci-decision-framework*
*Context gathered: 2026-04-12 via user decisions (inline)*
