# Phase 1: Fix Error Visibility Foundation - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace 11 empty catch blocks with structured logging + DLQ push + rethrow, implement 3-type error taxonomy (PreconditionError / ProcessError / ValidationError), add evolution timeout wrapper (10 min max per cycle), deliver minimum viable `_extractKnowledge()` / `_evolveSkills()` / `_autoMerge()`, and set up append-only decision audit log. All decision state lives in `.stigmergy/soul-state/`.

</domain>

<decisions>
## Implementation Decisions

### Error Taxonomy (ERR-02)
- **D-01:** Create separate `PreconditionError` / `ProcessError` / `ValidationError` custom error classes in `src/core/coordination/error_handler.js` (or a dedicated `errors/` subdirectory)
  - Each class extends `Error`, sets `this.name`, accepts `message` + `context` properties
  - Used in all 17 empty `} catch (e) {}` blocks across 7 files in `src/`
  - `PreconditionError` — precondition not met (wrong state, missing inputs)
  - `ProcessError` — operation failed during execution (recoverable)
  - `ValidationError` — input validation failed (not recoverable by retry)

### Dead Letter Queue (ERR-01, ERR-04)
- **D-02:** DLQ persisted as **JSONL append-only file** at `.stigmergy/soul-state/evolution-dlq.jsonl`
  - One JSON object per line: `{ errorType, message, context, timestamp, retryCount }`
  - Append-only (no read-modify-write cycles)
  - Replay: read lines, JSON.parse, filter recoverable (ProcessError), retry
  - Rotation: when file >5MB, rename to `evolution-dlq-YYYY-MM-DD-N.jsonl` and start fresh

### Minimum Viable Evolution (EVOL-01, EVOL-02, EVOL-03)
- **D-03:** `_extractKnowledge()` — parse `git log --since="24 hours ago" --pretty=format:"%H|%s|%an"` for commit messages, plus `git diff --stat` for changed files
  - Returns: `{ title: string, content: string, source: string, metadata: { commitHash, author, filesChanged } }`
  - No LLM calls in minimum viable — pure git introspection
- **D-04:** `_evolveSkills()` — creates `skill.md` with frontmatter (name, description, triggers) + body from extracted knowledge. Creates `skill-manifest.json` with skill identity
- **D-05:** `_autoMerge()` — reads all CLI KB JSON files, deduplicates by title, writes merged array with tmp+rename atomic write pattern

### Evolution Timeout (ERR-03)
- **D-06:** Event-driven **checkpointing** approach:
  - Each evolution step calls `checkpointStore.save(stepId, { timestamp, completed })`
  - Loop body checks: `if (Date.now() - checkpoint.startTime > 10 * 60 * 1000) throw new ProcessError('Evolution timeout')`
  - CheckpointStore persists to `.stigmergy/soul-state/evolution-checkpoint.json`
  - Graceful: saves partial progress, can resume from last checkpoint

### Decision Audit Log (DECI-04, INTEG-03)
- **D-07:** Audit log at `.stigmergy/soul-state/decisions/{YYYY-MM-DD}.jsonl`
  - Append-only, one record per decision
  - Fields: `decisionId (uuid)`, `timestamp (ISO)`, `situation`, `context`, `options[]`, `selected`, `confidenceScore`, `finalDecision`, `outcome`, `escalated`
  - Directory created by Phase 1 even if DECI engine lands in Phase 2

### Non-Silent Failure Reporting (ERR-04)
- **D-08:** Critical path failures (PreconditionError, unhandled) surface via:
  1. Logger.error() with structured context
  2. DLQ push with error classification
  3. EventBus.emit('soul:error', { type, error, context }) — for external monitoring

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Scope
- `.planning/ROADMAP.md` § Phase 1 — full requirements list and success criteria
- `.planning/REQUIREMENTS.md` § ERR-01 through EVOL-03, INTEG-03 — requirement definitions

### Existing Code
- `src/core/coordination/error_handler.js` — existing ErrorHandler class to extend with custom error classes
- `src/core/soul/failure_circuit_breaker.js` — existing FailureCircuitBreaker, DECI Layer 3 extends this
- `src/core/coordination/logger.js` — existing Logger, needs DLQ push method added
- `src/core/soul/soul_skill_evolver.js` lines 421-479 — existing stub methods: `_extractKnowledge()`, `_evolveSkills()`, `_autoMerge()`
- `src/core/soul/decision_auditor.js` — DEPRECATED file, replaced by decision audit in DECI-04 (do not use)

### Research Context
- `.planning/research/STACK.md` — three-layer architecture, zero-npm-deps constraint, implementation code patterns
- `.planning/research/PITFALLS.md` § CRITICAL — silent error swallowing (#1), recovery-blind loop (#2) drove Phase 1 prioritization
- `.planning/research/ARCHITECTURE.md` § 3.8 Auditor — audit log schema, auditor API

### Empty Catch Blocks (ERR-01 targets)
- `src/adapters/qoder/install_qoder_integration.js` — 6 empty catch blocks (file existence checks)
- `src/core/soul_auto_merger.js` — 2 empty catch blocks
- `src/core/soul_system_scheduler.js` — 5 empty catch blocks
- `src/core/soul_cli_integration.js`, `src/core/cli_path_detector.js`, `src/cli/commands/project.js`, `src/cli/commands/superpowers.js`, `src/core/soul_task_planner.js` — 1 each
- Plus 1 in `src/interactive/PersistentCLIPool.js` (unrelated, not evolution critical)
- Total: 17 empty catch blocks in src/ (ROADMAP said 11 — count includes only evolution-critical files for ERR-01)

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `FailureCircuitBreaker` — already implements consecutive failure tracking, cooldown. DECI Layer 3 extends this.
- `Logger` — already has file logging with rotation. Add `logger.pushDLQ(entry)` method rather than new class.
- `ErrorHandler` — already has EventEmitter, retry policy, error history. Add custom error classes to same module.

### Established Patterns
- File state persistence: JSON files in `.stigmergy/soul-state/` (already consistent)
- Atomic writes: `fs.writeFile + fs.rename` (tmp+rename pattern used in soul_auto_merger.js)

### Integration Points
- SoulScheduler wraps evolution loop — add timeout checkpoint here
- SoulSkillEvolver calls `_extractKnowledge` / `_evolveSkills` / `_autoMerge` on lines 107/124/151
- Decision audit log directory created in SoulManager.init()

</codebase_context>

<specifics>
## Specific Ideas

- Git-based knowledge extraction: use `simple-git` npm package OR child_process `git` commands — child_process is zero-dependency
- DLQ replay triggered by: (a) manual command `stigmergy soul replay-dlq`, (b) startup of SoulScheduler if DLQ has entries
- Error classification heuristic: wrap each catch block with `if (e instanceof ProcessError) dlq.push(e)` pattern

</specifics>

<deferred>
## Deferred Ideas

None — all discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-fix-error-visibility-foundation*
*Context gathered: 2026-04-12*
