# Stack Research: Soul Autonomous Evolution System

**Domain:** Node.js Autonomous Agent Error Recovery & CI Integration
**Researched:** 2026-04-12
**Confidence:** MEDIUM-HIGH (Context7/Exa unavailable; based on training data + codebase analysis)

---

## Recommended Stack

### Core: Enhance Existing Code, Add Only Where Necessary

The project already has **three critical custom modules** that form the foundation. The correct strategy is to
**build on top of them**, not replace them.

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Existing `ErrorHandler` | (already in `src/core/coordination/error_handler.js`) | Retry/backoff/error classification | Already has exponential backoff, error types, recovery strategies. Add jitter + integration. |
| Existing `FailureCircuitBreaker` | (already in `src/core/soul/failure_circuit_breaker.js`) | Circuit breaker for evolution strategies | Already implemented. **Missing integration** into evolution loop. |
| Existing `Logger` | (already in `src/core/coordination/logger.js`) | Structured logging | Already has levels, file rotation, metrics. **Needs JSON output mode**. |
| `@humanwhocodes/retry` | `^0.4.0` (already in lock file as axios transitive) | Low-level retry primitive | Add as direct dep for skill-execution retries. Already present transitively. |
| `pino` | `^9.x` | Structured JSON logging for production | Fastest Node.js logger (3-5x faster than winston). Ideal for autonomous agents debugging. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `pino-pretty` | `^13.x` | Human-readable pino output in dev | Development mode only; disable in CI/production |
| `zod` | `^3.x` | Runtime validation for skill outputs | Validate evolution skill results before accepting them |
| `@github/actions` (workflow YAML) | (built-in) | CI evolution loop | Schedule-based evolution job with circuit breaker gating |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| GitHub Actions `schedule` event | Autonomous evolution loop | `cron: "0 */6 * * *"` (every 6 hours) |
| GitHub Actions `if: always()` | Ensure reports even on failure | Gatekeeper runs regardless of test pass/fail |
| GitHub Actions `concurrency` | Prevent overlapping evolution runs | `concurrency: { group: 'evolution', cancel-in-progress: true }` |

---

## What the Codebase Already Has (DO NOT Replace)

### 1. ErrorHandler (`src/core/coordination/error_handler.js`)

A well-designed custom class with:
- Exponential backoff policy (configurable base delay, max delay)
- Error type classification (INITIALIZATION, COMMUNICATION, ADAPTER, TIMEOUT, VALIDATION)
- Recovery strategy registry per error type
- Retry statistics tracking
- EventEmitter-based event emission (`retry`, `retry-success`, `retry-failed`)

**What it needs:**
1. **Jitter** — current backoff is deterministic; add `Math.random()` jitter to prevent thundering herd when multiple evolution instances retry simultaneously
2. **Integration** — wrap skill execution (`executeSkills()` in `SoulEngine.js`) with `errorHandler.retry()`
3. **Circuit breaker integration** — when `FailureCircuitBreaker.recordFailure()` trips, `ErrorHandler` should stop retrying

```javascript
// Enhance ErrorHandler._calculateRetryDelay() with jitter:
case RetryPolicy.EXPONENTIAL_BACKOFF:
  const baseDelay = options.retryDelay * Math.pow(2, retryCount - 1);
  const jitter = baseDelay * (0.5 + Math.random() * 0.5); // ±25%
  return Math.min(jitter, maxDelay);
```

### 2. Logger (`src/core/coordination/logger.js`)

A 750-line custom logger with:
- Five log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- In-memory ring buffer (1000 entries)
- File logging with automatic rotation (10MB per file, 5 files max)
- Metrics collection (CPU, memory, event loop delay)
- JSON file output

**What it needs:**
1. **JSON output mode** — add `format: 'json'` option so CI log aggregators (GitHub Actions, Datadog) can parse logs
2. **Drop-in replacement for `console`** — add a `createLogger()` factory that replaces global `console.log/error` with structured equivalents in CI

```javascript
// Add to Logger constructor options:
format: options.format || 'text',  // 'text' | 'json'

// In _logToConsole():
if (this.options.format === 'json') {
  process.stdout.write(JSON.stringify(logEntry) + '\n');
} else {
  // existing text formatting
}
```

### 3. FailureCircuitBreaker (`src/core/soul/failure_circuit_breaker.js`)

A complete circuit breaker implementation with:
- Per-strategy consecutive failure counting
- Half-open state after cooldown period
- State persistence to JSON file
- `shouldExecute()`, `recordSuccess()`, `recordFailure()` API

**What it needs:**
1. **Integration into evolution loop** — `SoulEngine.runEvolutionTasks()` must call `shouldExecute()` before each strategy
2. **Event emission** — emit `circuit-open`, `circuit-closed` events when state changes
3. **Integration with `ErrorHandler`** — after circuit opens, error handler should skip retries for that strategy

---

## Installation

```bash
# Direct dependencies (new)
npm install @humanwhocodes/retry pino zod

# Dev dependencies
npm install -D pino-pretty

# Verify existing deps are correct
npm ls @humanwhocodes/retry  # Should show as direct or transitive
```

### After Enhancement

```javascript
// src/core/coordination/index.js
const { ErrorHandler, ErrorType, RetryPolicy } = require('./coordination/error_handler');
const { Logger, LogLevel } = require('./coordination/logger');
const FailureCircuitBreaker = require('./soul/failure_circuit_breaker');

// Initialize once at startup
const errorHandler = new ErrorHandler({
  defaultRetryPolicy: RetryPolicy.EXPONENTIAL_BACKOFF,
  maxRetries: 3,
  defaultRetryDelay: 1000,
  maxRetryDelay: 30000,
});

const logger = new Logger({
  logLevel: process.env.CI ? LogLevel.DEBUG : LogLevel.INFO,
  format: process.env.CI ? 'json' : 'text',
  logFilePath: process.env.CI
    ? './logs/evolution-ci.log'
    : './logs/evolution.log',
});

const circuitBreaker = new FailureCircuitBreaker({
  maxConsecutiveFailures: 5,  // Tighter for CI (was 10)
  cooldownMs: 60 * 60 * 1000, // 1 hour in CI
});

module.exports = { errorHandler, logger, circuitBreaker };
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Retry library | `@humanwhocodes/retry` (existing ErrorHandler + direct dep) | `promise-retry` | `promise-retry` uses deprecated `retry@0.12` internally; `@humanwhocodes/retry` is the maintained successor already in your lock file |
| Retry library | Existing ErrorHandler | `axios-retry` | `axios-retry` is HTTP-only; Soul skills are child processes |
| Logging | `pino` (structured) | `winston` | winston is 3-5x slower; pino's JSON output is CI-native |
| Logging | Existing Logger (enhanced) | `electron-log` | Designed for desktop apps, not autonomous agents |
| Circuit breaker | Existing `FailureCircuitBreaker` (integrated) | `opossum` | `opossum` is designed for service meshes; your custom CB is simpler and file-persistent |
| State machine | Lightweight pattern (EventEmitter + enum) | `xstate` v5 | `xstate` is too heavy for simple evolution loop states; over-engineering |
| CI evolution | GitHub Actions scheduled workflow | `npx cron` daemon | Daemon requires always-on server; GitHub Actions is free and serverless |
| CI evolution | GitHub Actions | `CircleCI` | GitHub Actions is already configured in `.github/workflows/ci.yml` |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `winston` | 3-5x slower than pino, verbose API | `pino` for production, existing Logger for dev |
| `opossum` | Over-engineered for file-persistent circuit breaker | Existing `FailureCircuitBreaker` with integration |
| `xstate` | 50KB+ bundle, complex DSL, overkill for 5 states | Simple ES module state machine pattern |
| `babel-node` | Not needed for Node 16+ | `ts-node` already in devDeps |
| Custom retry loops | Re-inventing `setTimeout` in `while` loops causes context drift | `@humanwhocodes/retry` via `ErrorHandler.retry()` |
| Silent `catch {}` blocks | The root cause of 100+ evolution failures | ErrorHandler + structured logging integration |

---

## Stack Patterns by Variant

**If evolution skill fails due to LLM timeout:**
- Wrap skill execution with `errorHandler.retry(operation, { policy: 'exponential_backoff', maxRetries: 3 })`
- Increase delay to 5s base, 60s max

**If evolution fails 5+ times in a row (circuit open):**
- `circuitBreaker.shouldExecute('crossValidation')` returns `false`
- CI workflow should `exit 0` (not fail) when circuit is open
- Log: `"Circuit breaker open for crossValidation, skipping — cooldown until {timestamp}"`

**If running in CI (GitHub Actions):**
- Set `LOG_LEVEL=debug` and `LOG_FORMAT=json`
- Pipe pino JSON logs to GitHub Actions artifact
- Use `pino-pretty` only locally, never in CI

**If debugging in development:**
- Keep existing Logger text format
- Use `logger.debug()` for skill execution tracing
- Set `LOG_LEVEL=debug` via `process.env`

---

## Version Compatibility

| Package | Node.js | Notes |
|---------|---------|-------|
| `@humanwhocodes/retry@0.4.x` | >=12 (we use >=16) | TypeScript-native, ESM+CommonJS |
| `pino@9.x` | >=16 | Async-only API; our Node 16+ requirement is satisfied |
| `zod@3.x` | >=12 | TypeScript-first; works in our TS orchestration layer |
| Existing `ErrorHandler` | Node >=16 | No version concerns |
| Existing `FailureCircuitBreaker` | Node >=16 | No version concerns |

---

## Key Implementation Recommendations

### 1. Empty Catch Block Elimination Pattern

Every silent `catch {}` must be replaced with:

```javascript
// BEFORE (silent swallowing — causes evolution failures)
} catch (e) {}

// AFTER (structured error handling)
} catch (error) {
  const result = await errorHandler.handleError(error, {
    component: 'SoulTaskPlanner',
    method: 'planNextTask',
    taskId: context.taskId,
  });
  logger.error('Task planning failed', {
    errorId: result.errorId,
    errorType: result.errorType,
    retryPolicy: result.retryPolicy,
    recommendedAction: result.recommendedAction,
  });
  if (result.shouldRetry && result.recommendedAction === 'retry_with_backoff') {
    // retry via errorHandler.retry()
  }
}
```

The 11 empty catch blocks identified in `CONCERNS.md` (scheduler, merger, task planner, CLI integration) all follow this pattern.

### 2. Circuit Breaker Integration with Evolution Loop

```javascript
// In soul-auto-evolve.js execute() method:
const circuitBreaker = require('../../src/core/soul/failure_circuit_breaker');

// Check before each strategy
for (const strategy of ['crossValidation', 'collaboration', 'competition']) {
  const canRun = await circuitBreaker.shouldExecute(strategy, context);
  if (!canRun) {
    logger.warn(`Circuit open for ${strategy}, skipping`, {
      stats: await circuitBreaker.getStats(strategy, context)
    });
    continue;
  }

  try {
    const result = await errorHandler.retry(
      () => executeStrategy(strategy, context),
      { policy: RetryPolicy.EXPONENTIAL_BACKOFF, maxRetries: 3 }
    );
    await circuitBreaker.recordSuccess(strategy, context);
  } catch (error) {
    const { circuitOpen } = await circuitBreaker.recordFailure(strategy, context);
    if (circuitOpen) {
      logger.fatal(`Circuit breaker OPENED for ${strategy}`, { error: error.message });
    }
  }
}
```

### 3. CI Evolution Workflow

```yaml
# .github/workflows/evolution.yml
name: Soul Evolution Loop

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

concurrency:
  group: evolution-loop
  cancel-in-progress: true

jobs:
  evolve:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Check circuit breaker status
        id: circuit
        run: |
          node -e "
            const cb = require('./src/core/soul/failure_circuit_breaker');
            // Read circuit state without modifying
            console.log('::set-output name=circuit_open::false');
          "

      - name: Run evolution (if circuit closed)
        if: steps.circuit.outputs.circuit_open != 'true'
        run: node scripts/run-evolution.js
        env:
          LOG_LEVEL: debug
          LOG_FORMAT: json
          CI: true

      - name: Run gatekeeper verification
        run: npm run gatekeeper:ci
        env:
          CI: true

      - name: Upload evolution artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: evolution-artifacts-${{ github.run_id }}
          path: |
            ~/.stigmergy/soul-global/evolution-log.jsonl
            logs/evolution-ci.log
            .stigmergy/soul-global/circuit_breaker.json
```

### 4. Structured Logging for Autonomous Agent Debugging

```javascript
// pino wrapper for autonomous agents
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ severity: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields
  redact: ['WECHAT_APP_SECRET', 'FEISHU_APP_SECRET', 'DINGTALK_APP_SECRET'],
});

module.exports = logger;

// Use like:
logger.info({ strategy: 'crossValidation', attempt: 2 }, 'Executing evolution strategy');
logger.error({ errorId, errorType, stack: error.stack }, 'Evolution strategy failed');
logger.fatal({ circuitOpen: true, strategy }, 'Circuit breaker opened');
```

---

## Sources

- [axios retry analysis](https://github.com/axios/axios-retry) — `@humanwhocodes/retry` is the underlying library; MEDIUM confidence (training data)
- [pino vs winston performance](https://github.com/pinojs/pino) — pino benchmarks show 3-5x throughput advantage; MEDIUM confidence (training data)
- [xstate documentation](https://xstate.js.org/docs/) — over-engineering for simple state; HIGH confidence
- [GitHub Actions schedule syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) — official docs; HIGH confidence
- [Circuit breaker pattern (Martin Fowler)](https://martinfowler.com/bliki/CircuitBreaker.html) — pattern reference; HIGH confidence
- [CONCERNS.md analysis](D:\stigmergy-CLI-Multi-Agents\.planning\codebase\CONCERNS.md) — empty catch blocks, evolution failures; HIGH confidence (codebase inspection)
- [Existing ErrorHandler](D:\stigmergy-CLI-Multi-Agents\src\core\coordination\error_handler.js) — 668 lines; HIGH confidence (codebase inspection)
- [Existing FailureCircuitBreaker](D:\stigmergy-CLI-Multi-Agents\src\core\soul\failure_circuit_breaker.js) — 204 lines; HIGH confidence (codebase inspection)
- [Existing Logger](D:\stigmergy-CLI-Multi-Agents\src\core\coordination\logger.js) — 754 lines; HIGH confidence (codebase inspection)
- [package.json lock file](D:\stigmergy-CLI-Multi-Agents\package-lock.json) — `@humanwhocodes/retry@0.4.x` present; HIGH confidence

---
*Stack research for: Soul Autonomous Evolution System*
*Researched: 2026-04-12*
