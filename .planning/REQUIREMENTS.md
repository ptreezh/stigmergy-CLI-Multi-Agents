# Requirements: Soul 自主决策

**Defined:** 2026-04-12
**Core Value:** Soul 在边界内自主行动，在边界外主动确认

## v1 Requirements

### Error Visibility Foundation

- [ ] **OBS-01**: Replace all 11 empty catch blocks with structured error logging (scheduler ×5, merger ×2, CLI integration ×1, task_planner ×1, project ×1, superpowers ×2)
- [ ] **OBS-02**: Add error taxonomy classification (PreconditionError / ProcessError / ValidationError)
- [ ] **OBS-03**: Add evolution timeout to prevent indefinite hangs (10min default, configurable)
- [ ] **OBS-04**: Decision audit log — each decision records: input, options, choice, rationale, timestamp, confidence score
- [ ] **OBS-05**: Minimum knowledge extraction — fix `_extractKnowledge()` to produce structured output (JSON/Markdown)
- [ ] **OBS-06**: Minimum skill evolution — fix `_evolveSkills()` to create non-empty skill placeholders, fix `_autoMerge()` to implement or explicitly disable

### Decision Framework

- [ ] **DECI-01**: Decision framework — define "when to decide autonomously vs ask for confirmation" logic
- [ ] **DECI-02**: Confidence threshold — auto-escalate to user when decision confidence < threshold
- [ ] **DECI-03**: Decision boundary configuration — JSON schema for user-defined autonomous scope
- [ ] **DECI-05**: Decision self-check — post-decision verification that result matches expectation
- [ ] **DECI-06**: Emergency fallback — consecutive failures trigger fallback + notify user

### Evolution Resilience

- [ ] **RES-01**: Evolution supervisor — parent process restarts loop on crash with exponential backoff
- [ ] **RES-02**: Circuit breaker on evolution loop — open after N consecutive failures, stop rapid-retry death spiral
- [ ] **RES-03**: Checkpoint/resume in TaskPlanner — save progress after each step, skip completed steps on restart
- [ ] **RES-04**: Dead Letter Queue — append-only JSONL audit log for failed cycles with replay capability
- [ ] **RES-05**: Atomic state writes in merger — temp+rename pattern to prevent skill file corruption

### Gatekeeper Integration

- [ ] **GATE-01**: Gatekeeper CI integration — invoke gatekeeper.js from evolution loop, enforce exit codes
- [ ] **GATE-02**: Gatekeeper report artifact — persist verification report in each evolution run
- [ ] **GATE-03**: Evolution log gate — block skill promotion when gatekeeper < Level 3

## v2 Requirements

### Knowledge Production

- **KNOW-01**: Multi-agent debate — cross-validation / collaboration / competition strategy implementation
- **KNOW-02**: Skill gap analysis — autonomous identification of missing capabilities
- **KNOW-03**: Adaptive strategy selection — choose best evolution strategy based on context

### WeChat Integration

- **WECH-01**: WeChat QR login stub completion
- **WECH-02**: WeChat message gateway integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-agent vote consensus (multiple Soul instances) | Future version, single-Soul focus for v1 |
| Decision tree auto-learning | Needs historical data, manual boundary config for v1 |
| Decision LLM rephrasing | Premature optimization |
| pino logger replacing existing Logger | Logger has file rotation + metrics; coexist |
| WeChat full backend integration | Stub completion only; backend is separate concern |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OBS-01 | Phase 1 | Pending |
| OBS-02 | Phase 1 | Pending |
| OBS-03 | Phase 1 | Pending |
| OBS-04 | Phase 1 | Pending |
| OBS-05 | Phase 1 | Pending |
| OBS-06 | Phase 1 | Pending |
| DECI-01 | Phase 2 | Pending |
| DECI-02 | Phase 2 | Pending |
| DECI-03 | Phase 2 | Pending |
| DECI-05 | Phase 2 | Pending |
| DECI-06 | Phase 2 | Pending |
| RES-01 | Phase 3 | Pending |
| RES-02 | Phase 3 | Pending |
| RES-03 | Phase 3 | Pending |
| RES-04 | Phase 3 | Pending |
| RES-05 | Phase 3 | Pending |
| GATE-01 | Phase 4 | Pending |
| GATE-02 | Phase 4 | Pending |
| GATE-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 — roadmap created, all 17 v1 requirements mapped to phases 1-4*
