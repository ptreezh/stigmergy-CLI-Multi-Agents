# Pitfalls Research

**Domain:** Autonomous Agent Self-Evolution Systems
**Researched:** 2026-04-12
**Confidence:** HIGH (grounded in codebase evidence: 2335-line evolution log, 11 empty catch blocks catalogued, CONCERNS.md audit, gatekeeper system analysis)

## Critical Pitfalls

### Pitfall 1: Silent Error Swallowing (Empty Catch Blocks)

**What goes wrong:** 11+ empty `} catch (e) {}` and `} catch (err) {}` blocks silently discard errors across the Soul system. The caller receives no signal that anything went wrong.

**Why it happens:** Developers add try/catch during development to make code "not crash" without investing in proper error handling. Empty catch blocks feel safe because they at least acknowledge the error. In a CLI tool, they are catastrophic because there is no crash report, no log entry, and no user notification.

**Confirmed locations in codebase:**

| File | Lines | What silently dies |
|------|-------|-------------------|
| `soul_system_scheduler.js` | 220, 250, 414, 516, 546 | Soul status polling, task plan loading, alignment config, script chmod, crontab uninstall |
| `soul_auto_merger.js` | 153, 275 | KB data loading, last merge time |
| `soul_cli_integration.js` | 73 | Skills path lookup failure |
| `soul_task_planner.js` | 468 | Reflection file parsing |
| `project.js` | 449 | (project subcommand error) |
| `superpowers.js` | 228, 280 | File copy operations, state injection |

**How to avoid:**
- ESLint rule: `no-empty` catches must log or rethrow
- Never merge code where `} catch` is followed by nothing but `}` on the same line
- Add `// eslint-disable-next-line no-empty` comments only after documenting WHY swallowing is intentional

**Warning signs:**
- Evolution iterations show zero tasks completed but no error in the log
- A scheduler reports "running" but takes no action
- KB merge history has gaps but no error entries
- Git worktree operations appear to succeed but files are missing

**Phase to address:** Phase 1 — this is foundational infrastructure damage that makes every other phase unreliable.

---

### Pitfall 2: Autonomous Loop With No Recovery Boundary

**What goes wrong:** The evolution loop (`soul_skill_evolver.js`, `soul_system_scheduler.js`) has no top-level try/catch. When any stage fails, the loop either crashes entirely or silently skips work. The evolution-log.jsonl (2335 lines) shows 100+ consecutive failures since 2026-03-07 across all three strategies (crossValidation, collaboration, competition) — the system has been failing continuously for over a month with no recovery.

**Why it happens:** Autonomous loops are designed to run unattended (cron, GitHub Actions, long-lived process). Without a recovery boundary, a single bad iteration breaks every subsequent iteration. The result is not graceful degradation — it is total system failure that accumulates damage (corrupted state, stale locks, gaps in knowledge).

**Evidence:**
- `evolution-log.jsonl`: every entry from ~1393 to 2335 shows `success: false`
- `soul_skill_evoler.js:162-164`: catch block logs but does not trigger any recovery
- `soul_scheduler_v2.js`: `setInterval` loop with no outer error boundary
- Strategy failures: crossValidation ("Not enough valid analyses"), collaboration (tasksCompleted: 0), competition ("No valid solutions")

**How to avoid:**
- Wrap the entire loop body in a try/catch/finally
- On error: log, unlock any held state, record failure in log, set exponential backoff timer, retry
- Implement a "circuit breaker": after N consecutive failures, pause evolution and alert
- Never leave a loop iteration without resolving its lock state (locked=true with no unlock)

**Warning signs:**
- Evolution log shows consecutive failures with no success interspersed
- `locked: true` entries in scheduler state persisting across restarts
- Process appears healthy (no crash) but evolution metrics never change
- Memory usage grows (accumulated stale state never cleaned)

**Phase to address:** Phase 2 — recovery boundaries are required before evolution can be trusted to run autonomously.

---

### Pitfall 3: Verification Gate Unintegrated From Execution

**What goes wrong:** Gatekeeper (`.gates/GATEKEEPER.md`, `.gates/gatekeeper.js`) defines a rigorous 5-checkpoint verification system (test authenticity, verification level, limitations, evidence, title accuracy) with a soul.md alignment hook. It is documented, deployed at Level 2, and explicitly marked "强制生效" (force effective). But it is not wired into the evolution loop or CI pipeline. The evolution-log shows all iterations have been declaring false completion — the gatekeeper was never on the gate.

**Why it happens:** Gatekeeper was built as a human-facing discipline ("run this checklist before reporting") rather than an automated enforcement layer. Documenting a gate without automating it is a common mistake — it creates the appearance of rigor without the function. The system passes the gate only when a human remembers to run it.

**Consequences of this specific gap:**
- 100+ consecutive evolution failures go unreported as failures
- Each failure reports completion metrics that don't match reality
- The Soul's self-assessment becomes unreliable (it thinks it succeeded when it failed)
- Systematic error patterns are not surfaced because each failure appears normal

**How to avoid:**
- Automated gates must be invoked programmatically, not just documented
- Gatekeeper.js should be `require()`d and called from within the evolution loop
- CI should block on gatekeeper failure (exit code != 0)
- A "gatekeeper report" should be an output artifact of every evolution iteration

**Warning signs:**
- Gatekeeper exists but evolution failures are not reflected in any gatekeeper report
- `evolution-log.jsonl` entries show no gatekeeper reference
- Phase completion is declared without any verification level annotation
- No gatekeeper CI step in GitHub Actions workflow

**Phase to address:** Phase 2 — gatekeeper automation is prerequisite to any autonomous evolution.

---

### Pitfall 4: State Corruption in Persistent Autonomous Loops

**What goes wrong:** The auto-merger (`soul_auto_merger.js:153, 275`) silently swallows KB load and merge time errors. The scheduler (`soul_system_scheduler.js:250`) silently swallows task plan parse errors. Combined with the scheduler's cron overlap (multiple jobs at 23:00-7:00, every 30 minutes), this creates race conditions where stale state overwrites fresh state, and no error stops the overwrite.

**Why it happens:** Persistent loops accumulate state over time. Unlike one-shot scripts, a loop that runs every 30 minutes cannot be "re-run from scratch" to recover. If a state file is corrupted or a lock is not released, subsequent iterations operate on bad state. Without transaction-like behavior (read-modify-write with validation), a single bad iteration corrupts the state for all future iterations.

**Specific risks in this codebase:**
- `soul_auto_merger.js`: KB data silently defaults to `[]` on parse failure — downstream code then treats empty KB as valid
- `soul_scheduler_v2.js`: Lock file (`locked: true`) set but never cleared on error — evolution loop halts
- `soul_task_planner.js:468`: Reflections silently skipped on parse error — task planning runs without reflection context
- Cron overlap: multiple concurrent scheduler invocations can write conflicting state

**How to avoid:**
- All state writes must be atomic (write to temp file, then rename)
- State reads must validate schema before use; invalid state should throw rather than default silently
- Lock files must have TTL; expired locks must be automatically cleared
- Concurrent writes must use file locking (flock) or a database

**Warning signs:**
- Evolution outputs become progressively less coherent over time
- KB appears to have duplicate or contradictory entries
- Scheduler reports conflicting task statuses
- Merge history has gaps or out-of-order timestamps

**Phase to address:** Phase 3 — state integrity requires transactional state management.

---

### Pitfall 5: Secret Drift in Unverified Integrations

**What goes wrong:** Multiple files reference `WECHAT_APP_SECRET`, `FEISHU_APP_SECRET`, `DINGTALK_APP_SECRET` (input fields in `unified-comm-adapter.js`, usage examples in docs, quickstart guide). But `wechat-hub.js:207,245` contains TODO comments indicating QR login is not implemented. The secrets are referenced everywhere but validated at runtime nowhere. If a secret is missing or rotated, the failure mode is silent (catch block) or an unhelpful error.

**Why it happens:** Environment variable patterns are established before the integration is complete. As long as the code path is not reached in testing, the missing validation goes undetected. This is particularly dangerous with autonomous systems — the code may run unattended (cron, GitHub Actions) and fail silently every time it tries to use the unconfigured integration.

**How to avoid:**
- Validate all required secrets at startup; exit with a clear error if any are missing
- Never catch and swallow secret-related errors — always surface them
- Document which integrations require which secrets in a single config reference
- Add secrets to gatekeeper checklist: "Are all required secrets present in the environment?"

**Warning signs:**
- Integration fails only in production/CI, not in local dev (local has .env, CI does not)
- WeChat TODO comments still present after multiple iterations
- Secrets referenced in documentation but not in `.env.example`
- No startup validation of third-party API credentials

**Phase to address:** Phase 3 — secrets and integration validation should be part of the production readiness gate.

---

### Pitfall 6: Ghost Completion — "Looks Done But Isn't"

**What goes wrong:** The evolution system reports outcomes that appear successful but are not. `collaboration` strategy returns `tasksCompleted: 0, totalTasks: 2` with `success: false` — but the failure is logged without any circuit-breaker or escalation. The system tries again in 30 minutes and fails the same way. The `crossValidation` strategy reports "Not enough valid analyses" — implying analyses were attempted, but none were valid. The system has been ghost-completing (producing outputs that look like progress) for 35+ days.

**Why it happens:** No distinction is made between "failed to start" (precondition error) and "failed mid-process" (partial completion). Both report as `success: false` with an error string. Without classification, the recovery system cannot choose the right response. Precondition failures (missing KB data, no valid analyses to validate) require fixing the precondition — not retrying the same operation.

**Evidence in evolution-log.jsonl:**
- `crossValidation` — always "Not enough valid analyses": precondition failure, not process failure
- `collaboration` — always tasksCompleted: 0: task creation failure, not execution failure
- `competition` — always "No valid solutions": generation failure, not validation failure

**How to avoid:**
- Error taxonomy: distinguish PreconditionError, ProcessError, ValidationError
- PreconditionError triggers different recovery (fix inputs, not retry loop)
- ProcessError triggers retry with exponential backoff
- ValidationError triggers strategy rotation
- Track failure classification in evolution log alongside error message

**Warning signs:**
- Same error message repeating across all iterations (not varying over time)
- Error messages indicate missing inputs rather than processing failures
- No variance in failure type across strategies (all three fail the same way)
- Iteration count increasing but no change in error pattern

**Phase to address:** Phase 2 — error classification is required for intelligent recovery.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Empty catch block | Code "doesn't crash" in dev | Silent failures, impossible debugging | Never — even if intentionally swallowing, log a warning |
| Skipping startup validation | Faster initial development | Failures surface late with cryptic symptoms | Only in throwaway prototyping |
| Hardcoded defaults on parse failure | Avoids null checks | Bad data treated as valid data | Only with explicit schema validation afterward |
| Ignoring ESLint `no-empty` rule | Removes lint noise | Empty catches proliferate | Never |
| Skip CI integration of gatekeeper | "It works locally" | Gatekeeper becomes decoration | Never for autonomous systems |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-----------------|
| WeChat QR Login | Treating TODO stubs as implemented | Block on incomplete integration; gatekeeper should reject partial implementations |
| WeChat/Feishu/Dingtalk secrets | Referencing env vars without runtime validation | Validate presence at startup, exit with clear error if missing |
| Tavily search (soul_skill_evolver.js:346) | Swallowing Tavily failures with console.log | Surface as PreconditionError if search is required for downstream |
| Git worktree operations | Assuming success when no error is thrown | Verify file existence after write operations |
| Cron-based evolution scheduler | Overlapping job invocations | Use a PID file or flock to ensure single-instance |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Cron overlap (23:00-7:00 every 30min) | Multiple scheduler instances writing conflicting state | flock or PID-based singleton enforcement | Any overnight evolution cycle |
| In-memory KB with file persistence | Stale state on crash recovery | Load-and-validate schema on startup; invalidate stale entries | Process killed mid-write |
| Growing evolution-log.jsonl (2335+ entries) | File I/O slowdown on append | Log rotation; archive old entries; use structured DB | After ~10,000 entries |
| Skills loading at session start (47 skills) | Linear increase in startup time | Lazy-load skills on demand, not upfront | More than 100 skills |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| WeChat/Feishu/Dingtalk secrets in source | Secret exposure in git history | Never commit secrets; use .env + .env.example |
| Skills path lookup failure silently swallowed (soul_cli_integration.js:73) | Injection risk if path fallback is insecure | Validate resolved path; fail closed on error |
| No secret runtime validation | Production failures with cryptic errors | Startup validation with clear error messages |
| Auto-merger runs git operations without error recovery | Git state corruption on partial failure | Implement rollback on merge failure |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Silent evolution failures | User has no idea the system stopped learning | Evolution status command with recent failure summary |
| Empty catch in CLI commands | User sees no output, thinks command succeeded | At minimum, `console.warn('[X] failed, continuing: ' + e.message)` |
| Ghost completion (0 tasks done but no error shown) | User trusts stale knowledge base | Explicit reporting: "0 analyses found, cannot validate. Skipping iteration." |
| No gatekeeper CI enforcement | Phase completion claims are unreliable | Automated gatekeeper report as a required artifact |

## "Looks Done But Isn't" Checklist

- [ ] **Evolution loop:** Exists but has no recovery boundary — verify top-level try/catch with exponential backoff
- [ ] **Gatekeeper:** Documented but not automated — verify gatekeeper.js is invoked from evolution loop with non-zero exit on failure
- [ ] **WeChat integration:** Referenced in docs and code but TODO stubs remain — verify QR login is implemented before counting integration as complete
- [ ] **Secret validation:** Env vars referenced everywhere, validated nowhere — verify startup fails clearly when secrets are missing
- [ ] **Empty catch blocks:** 11+ confirmed in CONCERNS.md — verify ESLint `no-empty` rule is enforced and all catches are non-empty
- [ ] **Auto-merger:** Has no rollback on git operation failure — verify partial merges are detected and reverted
- [ ] **Scheduler cron overlap:** Multiple jobs at same time — verify singleton enforcement before calling scheduler healthy
- [ ] **Evolution log:** 2335 entries, all failures — verify error classification (precondition vs process) before declaring evolution loop recovered

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Empty catch blocks | LOW (fix 11 sites) | Replace each with `console.error('[Module] X failed: ', e.message)` — no logic change needed |
| Autonomous loop crash | HIGH (recover from stale state) | Stop scheduler, clear locks (`locked: false`), clear stale task plans, restart evolution with precondition check |
| Ghost completion (all strategies failing same way) | HIGH (rebuild trust in evolution outputs) | Audit evolution-log for classification, fix precondition errors first, implement circuit breaker |
| State corruption | HIGH (may require manual KB repair) | Isolate corrupted KB entries, replay from last known-good state, implement atomic writes going forward |
| Secret drift | MEDIUM (configure and validate) | Add to .env.example, add startup validation, document required vs optional secrets |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| Empty catch blocks (silent failures) | Phase 1: Error Handling Foundation | ESLint `no-empty` passes on all Soul modules; `grep -r '} catch.* {}' src/core/soul*.js` returns 0 results |
| No recovery boundary in evolution loop | Phase 1: Error Handling Foundation | Evolution loop has top-level try/catch; consecutive failures trigger circuit breaker after 3 attempts |
| Gatekeeper not integrated into CI | Phase 2: Gatekeeper Automation | `npm run gatekeeper` runs in CI; non-zero exit blocks commit; gatekeeper report artifact in every run |
| State corruption in persistent loops | Phase 3: State Integrity | Lock files have TTL; state writes are atomic (temp+rename); schema validation on state load |
| Secret drift | Phase 3: Production Readiness | Startup validates all required secrets; missing secrets cause clear exit with list of missing vars |
| Ghost completion / error misclassification | Phase 2: Error Classification | Evolution log distinguishes PreconditionError / ProcessError / ValidationError; circuit breaker respects error type |
| WeChat incomplete integration | Phase 3: Production Readiness | `wechat-hub.js` TODO comments resolved; QR login tested end-to-end; gatekeeper rejects TODO-stubs |

## Sources

- `.planning/codebase/CONCERNS.md` — Codebase audit 2026-04-12 (empty catch blocks, evolution failures, security considerations)
- `.gates/GATEKEEPER.md` — Gatekeeper system definition (5 checkpoints, soul.md alignment, enforcement rules)
- `evolution-log.jsonl` — 2335 lines, consecutive failures from 2026-03-08 (crossValidation, collaboration, competition)
- `src/core/soul_system_scheduler.js` — Empty catches at lines 220, 250, 414, 516, 546; cron overlap at lines 24-28
- `src/core/soul_auto_merger.js` — Empty catches at lines 153, 275; no rollback on git failure
- `src/core/soul_cli_integration.js` — Empty catch at line 73 (skills path lookup)
- `src/core/soul_task_planner.js` — Empty catch at line 468 (reflection parse)
- `src/core/soul_skill_evolver.js` — Error classification missing; no circuit breaker
- `skills/wechat-hub.js` — TODO comments at lines 207, 245 (QR login not implemented)
- `skills/unified-comm-adapter.js` — Secret input fields at lines 130-183 (no runtime validation)
- `src/cli/commands/project.js:449` — Empty catch (project subcommand)
- `src/cli/commands/superpowers.js:228,280` — Empty catches (file copy, state injection)

---
*Pitfalls research for: Soul Autonomous Evolution System*
*Researched: 2026-04-12*
