# Architecture Research

**Domain:** Autonomous Agent Evolution System (Error-Resilient Loops)
**Researched:** 2026-04-12
**Confidence:** HIGH — based on established patterns (Erlang OTP, Netflix Hystrix, AWS retry guidance) applied to the Stigmergy Soul system's concrete failure modes.

## Research Question

How should an autonomous agent system be structured to survive failures gracefully? What is the right architecture for error-resilient autonomous loops, given: scheduler/merger/task-planner have no error recovery, and 100+ consecutive evolution failures?

---

## Standard Architecture

### System Overview

The proven model for fault-tolerant autonomous loops is a **Supervisor Tree** (Erlang OTP, adopted by Akka, Temporal, Kubernetes controllers). Every worker is supervised. Supervisors restart workers. The tree isolates blast radius.

```
┌────────────────────────────────────────────────────────────────────┐
│                     Evolution Supervisor (root)                     │
│  restart-policy: exponential-backoff, max-restarts: 10/hour        │
├───────────────┬───────────────────┬────────────────────────────────┤
│  Scheduler    │     Task Planner  │         Merger                 │
│  Supervisor   │     Supervisor    │         Supervisor             │
│               │                  │                                 │
│  ┌──────────┐ │  ┌─────────────┐ │  ┌────────────────────────┐    │
│  │Scheduler │ │  │Task Planner │ │  │Merger (idempotent ops) │    │
│  │+Circuit  │ │  │+Checkpoint  │ │  │+Rollback journal       │    │
│  │ Breaker  │ │  │+DLQ         │ │  │+Conflict resolver      │    │
│  └────┬─────┘ │  └──────┬──────┘ │  └────────────────────────┘    │
│       │       │         │        │                                 │
│  ┌────┴─────┐ │  ┌──────┴──────┐ │                                 │
│  │Evolution │ │  │ Skill       │ │                                 │
│  │Loop      │ │  │ Evolver     │ │                                 │
│  └──────────┘ │  └─────────────┘ │                                 │
├───────────────┴───────────────────┴────────────────────────────────┤
│                     Event Bus (error.occurred, task.failed)         │
├─────────────────────────────────────────────────────────────────────┤
│          Dead Letter Queue    │    Checkpoint Store                 │
│  (failed tasks, replayable)  │    (evolution progress snapshots)   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Failure Mode Without It |
|-----------|----------------|------------------------|
| Evolution Supervisor | Restart entire evolution loop on crash, track restart rate | Loop dies silently, no recovery |
| Scheduler Supervisor | Restart scheduler, apply circuit breaker after N failures | Timer fires but evolve() throws, loop stops |
| Circuit Breaker | Block calls when error rate is high, allow recovery window | 100+ rapid retries hammer failing subsystem |
| Task Planner + Checkpoint | Persist progress after each completed task | Full replay from scratch on every restart |
| Dead Letter Queue (DLQ) | Store failed evolution tasks for later replay | Failed cycles lost, no post-mortem possible |
| Merger + Rollback Journal | Write file merges atomically with undo log | Partial merges corrupt skill state |
| Bulkhead | Isolate scheduler failure from merger failure | One bad component poisons all others |

---

## Recommended Project Structure

```
src/core/
├── evolution/
│   ├── EvolutionSupervisor.js      # Root supervisor, manages all sub-supervisors
│   ├── CircuitBreaker.js           # Open/half-open/closed state machine
│   ├── RetryPolicy.js              # Exponential backoff + jitter
│   ├── DeadLetterQueue.js          # Persist & replay failed tasks
│   └── CheckpointStore.js          # Save/resume evolution progress
├── soul_scheduler.js               # Wrapped by Scheduler Supervisor
├── soul_task_planner.js            # Uses CheckpointStore, emits to DLQ on failure
├── soul_merger.js                  # Uses rollback journal, idempotent writes
└── soul_skill_evolver.js           # Supervised, circuit-broken
```

### Structure Rationale

- **evolution/**: Resilience infrastructure is cross-cutting — keep it separate from soul logic so it can be tested and reasoned about independently.
- **EvolutionSupervisor.js**: Single entry point that owns the restart policy. Nothing in the soul system starts itself — everything is launched through the supervisor.
- **CircuitBreaker.js**: Shared utility. Scheduler, task planner, and merger each get their own breaker instance so one tripped breaker doesn't block others (bulkhead).

---

## Architectural Patterns

### Pattern 1: Supervisor Tree

**What:** A parent process monitors child workers. When a child throws an unhandled exception, the parent restarts it. The parent tracks restart frequency — if restarts exceed a threshold (e.g., 5 crashes in 60 seconds), it either waits or escalates to its own parent.

**When to use:** Every long-running autonomous loop. Non-negotiable for systems that must self-recover without operator intervention.

**Trade-offs:** Adds startup complexity. Worth it unconditionally for autonomous loops.

**Example (Node.js, no external deps):**
```javascript
class EvolutionSupervisor {
  constructor(options = {}) {
    this.maxRestarts = options.maxRestarts || 5;
    this.windowMs = options.windowMs || 60_000;
    this.restartHistory = [];
    this.worker = null;
  }

  async start(workerFactory) {
    this._workerFactory = workerFactory;
    await this._launch();
  }

  async _launch() {
    try {
      this.worker = this._workerFactory();
      await this.worker.run(); // long-running — resolves only on intentional stop
    } catch (error) {
      await this._handleCrash(error);
    }
  }

  async _handleCrash(error) {
    const now = Date.now();
    this.restartHistory = this.restartHistory.filter(t => now - t < this.windowMs);
    this.restartHistory.push(now);

    if (this.restartHistory.length > this.maxRestarts) {
      // Escalate: circuit-break the entire evolution loop
      await this._enterCooldown(error);
    } else {
      const delay = Math.min(1000 * 2 ** this.restartHistory.length, 30_000);
      await new Promise(r => setTimeout(r, delay));
      await this._launch();
    }
  }

  async _enterCooldown(error) {
    // Log to evolution-log.jsonl, emit event, wait 10 minutes
    console.error('[Supervisor] Too many crashes, entering cooldown:', error.message);
    await new Promise(r => setTimeout(r, 10 * 60_000));
    this.restartHistory = [];
    await this._launch();
  }
}
```

---

### Pattern 2: Circuit Breaker

**What:** A state machine with three states: CLOSED (normal), OPEN (failing — reject all calls immediately), HALF-OPEN (probe with one call to test recovery). Prevents cascading failures and gives downstream systems time to recover.

**When to use:** Wrap every external call that can fail (web search, GitHub API, SQLite-vec operations, file system writes). Wrap the entire evolution cycle call from the scheduler.

**Trade-offs:** Adds latency to failure detection. A breaker that trips too easily causes false positives. Tune `failureThreshold` and `recoveryTimeoutMs` based on observed failure rates.

**Example:**
```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs || 5 * 60_000; // 5 min
    this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
    this.failures = 0;
    this.lastFailureTime = null;
    this.name = options.name || 'unnamed';
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed < this.recoveryTimeoutMs) {
        throw new Error(`[CircuitBreaker:${this.name}] OPEN — refusing call`);
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);
      throw error;
    }
  }

  _onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  _onFailure(error) {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`[CircuitBreaker:${this.name}] OPEN after ${this.failures} failures`);
    }
  }

  isOpen() { return this.state === 'OPEN'; }
}
```

---

### Pattern 3: Checkpoint/Resume

**What:** After each meaningful unit of work completes, serialize current progress to disk. On restart, load the checkpoint and resume from the last saved position instead of from scratch.

**When to use:** Any multi-step process where steps take significant time (evolution cycles, task planning, skill creation). Essential when 100+ consecutive failures mean no step ever completes.

**Trade-offs:** Requires steps to be idempotent (safe to re-run). Adds I/O overhead. Worth it for any step taking >5 seconds.

**Example:**
```javascript
class CheckpointStore {
  constructor(checkpointPath) {
    this.checkpointPath = checkpointPath;
  }

  async save(stepName, state) {
    const checkpoint = {
      stepName,
      savedAt: new Date().toISOString(),
      state
    };
    await fs.promises.writeFile(
      this.checkpointPath,
      JSON.stringify(checkpoint, null, 2),
      'utf8'
    );
  }

  async load() {
    try {
      const raw = await fs.promises.readFile(this.checkpointPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return null; // No checkpoint — start fresh
    }
  }

  async clear() {
    try { await fs.promises.unlink(this.checkpointPath); } catch { /* no-op */ }
  }
}

// Usage in SoulTaskPlanner
async executePlan() {
  const checkpoint = await this.checkpointStore.load();
  const startStep = checkpoint?.stepName ?? 'fetchSources';

  const steps = ['fetchSources', 'extractKnowledge', 'createSkill', 'alignCheck'];
  const startIndex = steps.indexOf(startStep);

  for (const step of steps.slice(startIndex)) {
    await this[step]();
    await this.checkpointStore.save(step, { completedAt: new Date().toISOString() });
  }

  await this.checkpointStore.clear();
}
```

---

### Pattern 4: Dead Letter Queue (DLQ)

**What:** When a task fails after all retries are exhausted, write it to a persistent queue (append to a JSONL file) instead of discarding it. A separate process can replay DLQ entries when conditions improve.

**When to use:** Evolution cycles that fail due to transient errors (network down, API rate-limited) should not be lost — they contain the intent to evolve. This is particularly important given the 100+ failure streak: those failures should be in a DLQ, not silently dropped.

**Trade-offs:** Requires a replay mechanism. DLQ can grow unbounded — add a max-age TTL.

**Example:**
```javascript
class DeadLetterQueue {
  constructor(dlqPath) {
    this.dlqPath = dlqPath;
  }

  async push(task, error, retryCount) {
    const entry = {
      enqueuedAt: new Date().toISOString(),
      task,
      error: { message: error.message, stack: error.stack },
      retryCount,
      ttlExpires: new Date(Date.now() + 7 * 24 * 60 * 60_000).toISOString() // 7 days
    };
    await fs.promises.appendFile(this.dlqPath, JSON.stringify(entry) + '\n');
  }

  async replay(handler) {
    const raw = await fs.promises.readFile(this.dlqPath, 'utf8');
    const entries = raw.split('\n').filter(Boolean).map(JSON.parse);
    const now = new Date();
    const valid = entries.filter(e => new Date(e.ttlExpires) > now);

    for (const entry of valid) {
      try {
        await handler(entry.task);
      } catch (error) {
        await this.push(entry.task, error, entry.retryCount + 1);
      }
    }

    await fs.promises.writeFile(this.dlqPath, ''); // Clear after replay
  }
}
```

---

### Pattern 5: Exponential Backoff with Jitter

**What:** Retry a failed operation with increasing wait times. Add random jitter to prevent the "thundering herd" problem where all retries fire simultaneously.

**When to use:** Any operation that can fail transiently (network calls, CLI subprocess execution). Used inside each supervised component before escalating to the circuit breaker.

**Example:**
```javascript
async function withRetry(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 1000;
  const maxDelayMs = options.maxDelayMs || 30_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      const exponential = baseDelayMs * (2 ** (attempt - 1));
      const jitter = Math.random() * baseDelayMs;
      const delay = Math.min(exponential + jitter, maxDelayMs);

      console.warn(`[Retry] Attempt ${attempt} failed, waiting ${Math.round(delay)}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

### Pattern 6: Idempotent Merger Writes

**What:** Every file write in the merger is wrapped in a write-then-rename atomic swap. A rollback journal records the pre-write state. If the process crashes mid-merge, the journal allows rolling back to a known-good state.

**When to use:** Any merge operation touching skill files, knowledge base, or soul state. This is non-negotiable — partial writes to SKILL.md corrupt the skill system.

**Example:**
```javascript
async function atomicWrite(targetPath, newContent) {
  const tmpPath = targetPath + '.tmp.' + Date.now();
  const backupPath = targetPath + '.bak';

  // Backup current
  if (fs.existsSync(targetPath)) {
    await fs.promises.copyFile(targetPath, backupPath);
  }

  // Write to temp
  await fs.promises.writeFile(tmpPath, newContent, 'utf8');

  // Atomic rename (POSIX-atomic on same filesystem)
  await fs.promises.rename(tmpPath, targetPath);

  // Clean backup on success
  try { await fs.promises.unlink(backupPath); } catch { /* no-op */ }
}

async function rollbackWrite(targetPath) {
  const backupPath = targetPath + '.bak';
  if (fs.existsSync(backupPath)) {
    await fs.promises.rename(backupPath, targetPath);
  }
}
```

---

## Data Flow

### Error-Resilient Evolution Cycle

```
stigmergy soul evolve (CLI trigger)
    ↓
EvolutionSupervisor.start()
    ↓
Scheduler (wrapped in CircuitBreaker)
    ↓ — if OPEN → log "skipped, circuit open" → emit error.occurred
    ↓ — if CLOSED →
SoulTaskPlanner.executePlan()
    ├── CheckpointStore.load() → resume from last step if available
    ├── Step: fetchSources → withRetry(3 attempts, backoff)
    │       ↓ failure after 3 → DeadLetterQueue.push()
    ├── CheckpointStore.save('fetchSources')
    ├── Step: extractKnowledge → withRetry(3 attempts)
    ├── CheckpointStore.save('extractKnowledge')
    ├── Step: createSkill → withRetry(3 attempts)
    │       ↓ uses atomicWrite() for all file mutations
    ├── CheckpointStore.save('createSkill')
    ├── Step: alignCheck
    └── CheckpointStore.clear() — only on full success
    ↓
SoulMerger.merge()
    ├── atomicWrite() for each target file
    └── rollbackWrite() in catch block
    ↓
EventBus.publish({ type: 'evolution.completed' })
    ↓
evolution-log.jsonl append (structured, always)
```

### Failure Escalation Flow

```
Operation fails
    ↓
withRetry (up to 3 attempts, backoff)
    ↓ — all attempts exhausted →
CircuitBreaker._onFailure()
    ↓ — threshold reached → state = OPEN
    ↓
DeadLetterQueue.push(task, error)
    ↓
EventBus.publish({ type: 'error.occurred', severity: 'HIGH' })
    ↓
EvolutionSupervisor._handleCrash()
    ↓ — restart count within window →
    ↓ exponential backoff delay → _launch() again
    ↓ — too many restarts →
    ↓ _enterCooldown(10 min) → _launch() again
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single machine, 1 CLI | Current approach — in-process supervisor, file-based DLQ, SQLite checkpoint |
| Multiple CLIs, same machine | Add StateLockManager around DLQ and CheckpointStore reads to prevent races |
| Multiple machines | Replace file-based DLQ/checkpoint with Redis or a proper queue (BullMQ). Out of scope for current cycle. |

### Scaling Priorities

1. **First bottleneck:** Empty catch blocks swallow errors silently. Fix this before adding any new resilience infrastructure. Replace all `catch (e) {}` with `catch (e) { logger.error(...); eventBus.publish('error.occurred', e); }`.
2. **Second bottleneck:** Scheduler restart on crash. Implement EvolutionSupervisor first — it gives the highest return for the 100+ failure streak problem because it ensures the loop restarts rather than dying.

---

## Anti-Patterns

### Anti-Pattern 1: Empty Catch Blocks

**What people do:** `try { await evolve(); } catch (e) {}`

**Why it's wrong:** Errors disappear. The evolution log shows "failure" entries but the actual error message is gone. Debugging becomes impossible. This is the root cause of 100+ consecutive failures — the system fails, swallows the error, and retries immediately without any diagnostic information.

**Do this instead:**
```javascript
try {
  await evolve();
} catch (error) {
  logger.error('[SoulScheduler] Evolution failed', {
    error: error.message,
    stack: error.stack,
    cycle: this.cycleCount
  });
  eventBus.publish({ type: 'error.occurred', data: { error, component: 'scheduler' } });
  await dlq.push({ type: 'evolution', cycleCount: this.cycleCount }, error, 0);
  throw error; // Re-throw so supervisor can handle restart
}
```

---

### Anti-Pattern 2: Tight Coupling Between Scheduler and Evolver

**What people do:** `this.soulManager.evolve()` called directly inside the scheduler timer callback, no isolation.

**Why it's wrong:** If `evolve()` hangs (e.g., waiting on a network call that never returns), the timer callback never completes, the scheduler itself becomes unresponsive, and subsequent ticks queue up indefinitely.

**Do this instead:** Run evolution in a separate async context with a timeout:
```javascript
async _runEvolutionWithTimeout() {
  const timeoutMs = 10 * 60_000; // 10 minutes max per cycle
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Evolution timed out')), timeoutMs)
  );
  return Promise.race([this.soulManager.evolve(), timeout]);
}
```

---

### Anti-Pattern 3: Global State in Scheduler

**What people do:** Store `this.isRunning`, `this.currentMode`, `this.timers` as plain object properties with no reset on restart.

**Why it's wrong:** When the supervisor restarts the scheduler, stale flags (`isRunning: true`) prevent it from starting. The supervisor's restart effectively becomes a no-op.

**Do this instead:** Factory function pattern — each restart creates a fresh instance:
```javascript
// In EvolutionSupervisor
await this._launch();

_launch() {
  const scheduler = new SoulScheduler(this.config); // Fresh instance
  return scheduler.run();
}
```

---

### Anti-Pattern 4: Consecutive Failure Without DLQ

**What people do:** On failure, log "evolution failed", wait for next timer tick, retry from scratch.

**Why it's wrong:** After 100 failures, every failure intent is lost. There is no record of what was attempted, what the error was, or what state the system was in. Post-mortem is impossible.

**Do this instead:** Every failure appends to `evolution-log.jsonl` with full context, and the task is pushed to the DLQ. The DLQ provides both the audit trail and the replay mechanism.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub API (skill fetching) | withRetry + CircuitBreaker | Rate limit = 60 req/hour unauthenticated. Circuit open on 429. |
| SQLite-vec | withRetry (3x) + file lock | WAL mode prevents most write conflicts. Still needs retry on SQLITE_BUSY. |
| File system (skill writes) | atomicWrite + rollbackWrite | Never write in-place. Always tmp → rename. |
| EventBus | Fire-and-forget publish | Never await event bus publish in critical path — it should not block evolution. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Scheduler → TaskPlanner | Direct async call, wrapped in CircuitBreaker | Scheduler must not catch TaskPlanner errors — let them propagate to supervisor |
| TaskPlanner → Merger | Direct async call | Merger errors must propagate. Merger owns its own rollback. |
| Any component → DLQ | Direct push (append to file) | DLQ push must never throw — use its own internal try-catch |
| Any component → EventBus | Fire-and-forget | `eventBus.publish(...).catch(e => console.error('EventBus error', e))` |

---

## Concrete Recommendations for Stigmergy Soul

Ordered by impact-to-effort ratio:

### Step 1: Replace all empty catch blocks (1-2 hours, highest impact)

11 empty catch blocks are the reason 100+ failures produce no actionable diagnostics. Replace every `catch (e) {}` with structured logging + DLQ push + rethrow.

### Step 2: Add evolution timeout (30 minutes)

Wrap `soulManager.evolve()` in `Promise.race([evolve(), timeout(10min)])`. This prevents the scheduler from hanging indefinitely on a stalled network call.

### Step 3: Implement EvolutionSupervisor (4-8 hours)

Replace the ad-hoc scheduler start with a supervisor. The supervisor owns all restarts. Single file, no external dependencies.

### Step 4: Add CircuitBreaker to scheduler → evolve call (2 hours)

Wrap the `evolve()` call. Trip after 5 consecutive failures. Recovery window: 5 minutes. This prevents rapid retry loops from hammering a broken subsystem.

### Step 5: Add CheckpointStore to TaskPlanner (4 hours)

Save progress after each of the 7 evolution steps. On restart, skip already-completed steps. This converts each full-cycle failure into a partial retry.

### Step 6: Implement DLQ (2 hours)

Simple JSONL append file. Every exhausted-retry failure goes here. Provides audit trail and replay capability.

### Step 7: Atomic writes in Merger (2 hours)

Replace direct `fs.writeFile` calls with `atomicWrite()`. Add rollback in catch. This prevents partial merges from corrupting skill state.

---

## Sources

- Erlang OTP Supervisor documentation: https://www.erlang.org/doc/design_principles/sup_princ.html
- Netflix Hystrix Circuit Breaker (archived): https://github.com/Netflix/Hystrix/wiki/How-it-Works
- AWS retry guidance (exponential backoff): https://docs.aws.amazon.com/general/latest/gr/api-retries.html
- Temporal.io workflow patterns (checkpoint/resume): https://docs.temporal.io/concepts/what-is-a-workflow
- Microsoft Resilience patterns (bulkhead, circuit breaker): https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead
- Confidence: HIGH for supervisor tree, circuit breaker, retry patterns (industry standard, multiple implementations). MEDIUM for Stigmergy-specific application (based on code inspection, not runtime observation of failures).

---

*Architecture research for: Stigmergy Soul Autonomous Evolution System*
*Researched: 2026-04-12*
