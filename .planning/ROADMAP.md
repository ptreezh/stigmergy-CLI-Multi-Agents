# ROADMAP: Soul DECI (Soul 自主决策)

**Project:** Soul 自主决策 (DECI: Autonomous Decision-Making)
**Granularity:** Standard
**Phases:** 4
**Coverage:** 17/17 v1 requirements mapped

---

## Core Value

**Soul 在边界内自主行动，在边界外主动确认。**

DECI adds autonomous decision-making with confidence thresholds, audit logs, and emergency fallback to the existing Soul evolution system. Cannot be built on broken error handling — 11 empty catch blocks silently swallow all errors, making every downstream phase operate on invisible data.

---

## Phases

- [ ] **Phase 1: Error Visibility Foundation** - Fix 11 empty catch blocks, add error taxonomy, add evolution timeout, add decision audit log, fix knowledge extraction, fix skill evolution
- [ ] **Phase 2: Decision Framework** - Implement DECI-01/02/03/05/06: autonomous vs escalate logic, confidence thresholds, boundary config, self-check, emergency fallback
- [ ] **Phase 3: Evolution Resilience** - Add supervisor with exponential backoff, circuit breaker, checkpoint/resume, DLQ, atomic writes
- [ ] **Phase 4: Gatekeeper Integration** - Wire gatekeeper into evolution loop and CI, persist reports, block promotion below Level 3

---

## Phase Details

### Phase 1: Error Visibility Foundation

**Goal:** Every error in the Soul evolution system is visible, classified, and logged — not silently swallowed

**Depends on:** Nothing (first phase)

**Requirements:** OBS-01, OBS-02, OBS-03, OBS-04, OBS-05, OBS-06

**Success Criteria** (what must be TRUE):

1. `grep -rn '} catch' src/core/soul*.js src/core/soul/**/*.js` returns 0 empty catch blocks — every catch includes structured logging with error type, message, stack, timestamp, component name, and DLQ push
2. Error taxonomy classifies every caught error as PreconditionError, ProcessError, or ValidationError — each type triggers distinct recovery behavior (skip/retry/rotate)
3. Evolution timeout wrapper aborts any evolution cycle exceeding 10 minutes and logs a timeout event before returning control to the scheduler
4. Every decision made by DECI produces a DecisionLogger entry containing: input description, available options, chosen option, rationale, timestamp, and confidence score — entries persist to `.stigmergy/soul-state/decisions/`
5. `_extractKnowledge()` produces structured output (JSON or Markdown with frontmatter) containing at minimum: title, source URL, key concepts, and metadata — not a pass-through of the raw search snippet
6. `_evolveSkills()` creates non-empty skill files containing at minimum a skill.md skeleton and skill-manifest.json, and `_autoMerge()` either implements the merge logic or explicitly logs that it is disabled

**Plans:** TBD

**UI hint:** no

---

### Phase 2: Decision Framework

**Goal:** Soul can decide autonomously within configured boundaries, escalates uncertain decisions to the user, self-checks outcomes, and falls back gracefully on repeated failures

**Depends on:** Phase 1

**Requirements:** DECI-01, DECI-02, DECI-03, DECI-05, DECI-06

**Success Criteria** (what must be TRUE):

1. DecisionFramework classifies every decision as AUTONOMOUS, ESCALATE, or BLOCK — AUTONOMOUS when the decision is within configured boundaries AND confidence >= threshold; ESCALATE when confidence < threshold; BLOCK when decision is outside all boundaries
2. Decisions with confidence below the configured threshold (per decision type) trigger an IM confirmation prompt before proceeding — the system waits for user confirmation before taking action
3. Boundary config in `.stigmergy/soul-state/boundaries.json` is validated against a JSON schema at startup; invalid config causes a startup error with a descriptive message, not a silent fallback to unsafe defaults
4. DecisionVerifier detects when actual outcome diverges from expected outcome and logs a discrepancy event with both values — divergence triggers DECI-06 escalation
5. FallbackManager activates after N consecutive decision failures (N configurable, default 3): logs fallback activation, sends notification via EventBus, and awaits manual intervention or timeout before resuming autonomous operation

**Plans:** TBD

**UI hint:** no

---

### Phase 3: Evolution Resilience

**Goal:** The Soul evolution loop survives crashes, retries intelligently, resumes from checkpoints, and never corrupts skill state with partial writes

**Depends on:** Phase 1

**Requirements:** RES-01, RES-02, RES-03, RES-04, RES-05

**Success Criteria** (what must be TRUE):

1. EvolutionSupervisor restarts a crashed evolution loop within 5 seconds using exponential backoff — restart count and backoff interval are logged at each attempt
2. Circuit breaker opens after 5 consecutive failures of the same evolution strategy and remains open for 5 minutes before transitioning to half-open state — during open state, no retries are attempted and a circuit-open event is logged
3. CheckpointStore saves evolution progress after each step; on restart, completed steps are skipped and evolution resumes from the last checkpoint — verified by simulating a crash mid-evolution and confirming no completed steps are re-executed
4. Dead Letter Queue appends every failed evolution cycle with full context (input, error, strategy, timestamp) to an append-only JSONL file; a replay command can re-process any DLQ entry
5. Merger uses temp+rename pattern for all skill file writes; concurrent write test confirms no partial files appear in the skill directory and no existing files are corrupted

**Plans:** TBD

**UI hint:** no

---

### Phase 4: Gatekeeper Integration

**Goal:** Every evolution run passes through gatekeeper verification; CI blocks promotion of unverified skills; gatekeeper reports are persisted and auditable

**Depends on:** Phase 3

**Requirements:** GATE-01, GATE-02, GATE-03

**Success Criteria** (what must be TRUE):

1. GitHub Actions workflow exits non-zero when gatekeeper.js returns a non-zero exit code from an evolution run — CI run is blocked and reported as failed
2. Gatekeeper verification report is available as a workflow artifact named `soul-gatekeeper-report-{timestamp}.json` after every evolution run, regardless of pass or fail
3. Skills are not promoted (copied to production skill directories or committed) when gatekeeper verification is below Level 3 — promotion attempt when Level < 3 produces a log warning and is aborted

**Plans:** TBD

**UI hint:** no

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Error Visibility Foundation | 0/6 | Not started | - |
| 2. Decision Framework | 0/5 | Not started | - |
| 3. Evolution Resilience | 0/5 | Not started | - |
| 4. Gatekeeper Integration | 0/3 | Not started | - |

---

## Dependencies

```
Phase 1 ──┬──► Phase 2 ──┐
          └──► Phase 3 ──┴──► Phase 4
```

- Phase 2 depends on Phase 1 (DECI needs error signals from OBS)
- Phase 4 depends on Phase 3 (Gatekeeper gates a resilient evolution system, not a broken one)
- Phase 3 can start after Phase 1 (resilience built on visible errors)
- Phase 4 is the last phase — gatekeeper should gate a working, self-recovering system

## Open Questions (User Decisions Needed During Phases)

| Phase | Question | Options |
|-------|----------|---------|
| Phase 1 | What is minimum viable knowledge extraction output? | Structured JSON / Markdown with frontmatter / SQLite-vec insert |
| Phase 1 | What is minimum viable evolved skill? | skill.md + manifest / skill.md + tests + manifest |
| Phase 2 | What is the initial confidence scoring formula? | Simple weighted average / calibrated from audit log data |
| Phase 2 | What are the initial DECI-03 boundaries? | Conservative (read-only) / moderate (non-destructive) / user defines |

---

*Roadmap created: 2026-04-12*
*Derived from: research/SUMMARY.md, REQUIREMENTS.md*
