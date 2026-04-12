# Phase 1: Fix Error Visibility Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 01-fix-error-visibility-foundation
**Areas discussed:** Error taxonomy approach, DLQ format, Minimum viable evolution, Evolution timeout mechanism

---

## Gray Area A: Error Taxonomy Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Custom error classes | class PreconditionError extends Error { constructor(msg, context) { super(msg); this.name='PreconditionError'; this.context=context } } — better instanceof, stack traces, and context preservation | ✓ |
| Extend ErrorType enum | Add PRECONDITION_ERROR/PROCESS_ERROR/VALIDATION_ERROR to existing ErrorHandler.ErrorType enum — simpler, one module to import | |
| Both (hybrid) | Custom classes WITH matching ErrorType entries — best of both but more code | |

**User's choice:** Custom error classes
**Notes:** Separate custom error classes give better instanceof checks and preserve stack traces. Each class accepts message + context properties.

---

## Gray Area B: DLQ Format

| Option | Description | Selected |
|--------|-------------|----------|
| JSONL append-only file | .stigmergy/soul-state/evolution-dlq.jsonl — one JSON object per line, append-only, matches audit log pattern. Simple replay: readlines + JSON.parse | ✓ |
| Rotating JSON array | .stigmergy/soul-state/evolution-dlq.json — JSON array, rotate when >1MB. Easier to read/debug but requires full rewrite on rotation | |
| In-memory only (no persistence) | DLQ lives in memory during scheduler run, emits events for external monitoring. Lost on crash — but soul-state already persisted elsewhere | |

**User's choice:** JSONL append-only file
**Notes:** Consistent with decision audit log pattern. Append-only avoids read-modify-write race conditions.

---

## Gray Area C: Minimum Viable _extractKnowledge()

| Option | Description | Selected |
|--------|-------------|----------|
| Git diffs + commit messages (recommended) | Parse git log --since='24h' for commit messages, git diff for changed files. Lowest effort, highest signal — commits already contain human-authored insights | ✓ |
| Pattern matching in source files | Scan .js/.md files for TODO/FIXME/comments + function signatures. Richer output but more complex — multiple regex passes over the codebase | |
| LLM analysis of recent changes | Feed recent git diffs to LLM with a prompt like 'extract 3 actionable insights'. Best quality but requires LLM call per evolution cycle | |

**User's choice:** Git diffs + commit messages (recommended)
**Notes:** Zero-dependency (child_process git commands), highest signal-to-noise ratio. Returns: `{ title, content, source, metadata: { commitHash, author, filesChanged } }`.

---

## Gray Area D: Evolution Timeout

| Option | Description | Selected |
|--------|-------------|----------|
| Signal-based abort (recommended) | setTimeout(() => controller.abort(), 10*60*1000) wrapping the evolution cycle. Clean, simple, Node.js native. Steps must check signal periodically | |
| Event-driven checkpointing | Each evolution step saves a checkpoint timestamp. Loop self-terminates if last checkpoint >10min ago. More resilient but requires all steps to cooperate | ✓ |
| try/catch + finally guard | Wrap loop body in try/finally, set a 'running' flag. External monitor kills process if flag stays true >10min. Most robust but requires external watchdog process | |

**User's choice:** Event-driven checkpointing
**Notes:** Each step calls `checkpointStore.save(stepId, { timestamp, completed })`. Loop checks: `if (Date.now() - checkpoint.startTime > 10 * 60 * 1000) throw new ProcessError('Evolution timeout')`. Persists to `.stigmergy/soul-state/evolution-checkpoint.json`. Graceful — saves partial progress, can resume.

---

## Claude's Discretion

No areas deferred to Claude — all 4 gray areas had clear user preferences.

## Deferred Ideas

None — discussion stayed within Phase 1 scope.

