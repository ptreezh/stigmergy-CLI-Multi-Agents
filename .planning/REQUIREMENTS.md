# Requirements: Soul 自主决策最佳实践方案

**Defined:** 2026-04-12
**Core Value:** Soul 在边界内自主行动，在边界外主动确认。

## v1 Requirements

### Error Handling Foundation

- [ ] **ERR-01**: Replace all 11 empty catch blocks with structured error logging + DLQ push + rethrow
- [ ] **ERR-02**: Implement error taxonomy: PreconditionError / ProcessError / ValidationError
- [ ] **ERR-03**: Add evolution timeout wrapper (10 min max per cycle)
- [ ] **ERR-04**: Non-silent failure reporting — critical path failures surface to operators

### DECI-01: Decision Framework

- [ ] **DECI-01**: SoulDecisionEngine — 3-layer decision gate (hard boundary → confidence score → emergency fallback)
- [ ] **DECI-01a**: Layer 1: DecisionBoundary — rule-based, JSON-configurable boundaries
- [ ] **DECI-01b**: Layer 2: ConfidenceScorer — 5-dimension weighted scoring
- [ ] **DECI-01c**: Layer 3: EmergencyFallback — extends existing FailureCircuitBreaker

### DECI-02: Confidence Thresholds

- [ ] **DECI-02**: Per-decision-type configurable confidence thresholds
- [ ] **DECI-02a**: Default threshold: 0.65 (configurable per action category)
- [ ] **DECI-02b**: Confidence below threshold → auto-escalate to user confirmation
- [ ] **DECI-02c**: Outcome-tracked calibration — track calibration accuracy over time

### DECI-03: Decision Boundary Configuration

- [ ] **DECI-03**: `boundaries.json` schema — user-editable, version-controlled
- [ ] **DECI-03a**: Block rules: destructive operations always escalate
- [ ] **DECI-03b**: Autonomous rules: read-only, trusted operations
- [ ] **DECI-03c**: Schema validated at startup, invalid config → clear error

### DECI-04: Decision Audit Log

- [ ] **DECI-04**: Append-only JSONL audit log: decisions/{YYYY-MM-DD}.jsonl
- [ ] **DECI-04a**: Every decision log: decision_id, timestamp, situation, options, selected, confidence_score, outcome, escalated
- [ ] **DECI-04b**: Auditor.query() — filter by date range, decision type, outcome
- [ ] **DECI-04c**: Auditor.getAutonomyRate() — autonomous vs escalated ratio

### DECI-05: Decision Self-Check

- [ ] **DECI-05**: DecisionVerifier — post-execution vs. expected outcome comparison
- [ ] **DECI-05a**: PASS / FAIL / UNVERIFIABLE verdict for each autonomous action
- [ ] **DECI-05b**: FAIL → trigger DECI-06 fallback after retries exhausted
- [ ] **DECI-05c**: Self-check results feed back into confidence calibration

### DECI-06: Emergency Fallback

- [ ] **DECI-06**: FallbackManager — consecutive failures (configurable N) → fallback mode
- [ ] **DECI-06a**: NOMINAL (0 failures) → continue autonomously
- [ ] **DECI-06b**: DEGRADED (1-2) → continue with extra logging
- [ ] **DECI-06c**: ESCALATE (3-4) → ask user before proceeding
- [ ] **DECI-06d**: ABORT (5+) → halt loop, notify operator, await manual intervention

### Minimum Viable Evolution

- [ ] **EVOL-01**: Minimum viable `_extractKnowledge()` — real content extraction
- [ ] **EVOL-02**: Minimum viable `_evolveSkills()` — real skill.md + tests + manifest
- [ ] **EVOL-03**: Auto-merge `_autoMerge()` — real knowledge merging

### Integration

- [ ] **INTEG-01**: DecisionEngine integrated into SoulManager before autonomous actions
- [ ] **INTEG-02**: gatekeeper.js invoked programmatically from evolution loop
- [ ] **INTEG-03**: All decision state in `.stigmergy/soul-state/decisions/`

## v2 Requirements

- **DECI-07**: Multi-option reasoning trace — log each candidate option's analysis
- **DECI-08**: Explainable output — human-readable decision rationale
- **DECI-09**: Cross-session context — persist decision context to Soul memory
- **DECI-10**: Adaptive strategy selection — analyze failure patterns to pick right strategy
- **DECI-11**: Decision boundary dynamic tightening
- **DECI-12**: Skill gap identification
- **DECI-13**: Autonomous test generation for evolved skills

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-Soul voting consensus | Single Soul场景不需要 |
| Decision tree auto-learning | 手动配置边界更安全 |
| LLM-as-primary-router | 非确定性、违背确定性约束 |
| External rule engine | Soul决策需自包含 |
| WeChat integration | 独立track，优先级低于DECI |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ERR-01 | Phase 1 | Pending |
| ERR-02 | Phase 1 | Pending |
| ERR-03 | Phase 1 | Pending |
| ERR-04 | Phase 1 | Pending |
| DECI-04 | Phase 1 | Pending |
| EVOL-01 | Phase 1 | Pending |
| EVOL-02 | Phase 1 | Pending |
| EVOL-03 | Phase 1 | Pending |
| INTEG-03 | Phase 1 | Pending |
| DECI-01 | Phase 2 | Pending |
| DECI-01a | Phase 2 | Pending |
| DECI-01b | Phase 2 | Pending |
| DECI-01c | Phase 2 | Pending |
| DECI-02 | Phase 2 | Pending |
| DECI-03 | Phase 2 | Pending |
| DECI-05 | Phase 2 | Pending |
| DECI-06 | Phase 2 | Pending |
| INTEG-01 | Phase 2 | Pending |
| INTEG-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total (grouped by REQ-ID prefix)
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after research synthesis*
