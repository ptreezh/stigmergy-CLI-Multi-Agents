# Stack Research: Autonomous Decision-Making for AI Agents

**Domain:** Soul 自主决策 (Autonomous Decision-Making for Stigmergy Soul Agents)
**Researched:** 2026-04-12
**Confidence:** MEDIUM-HIGH (grounded in established 2025 agent architecture patterns; no live web research due to API unavailability — training data through August 2025)

---

## Executive Summary

Soul needs to decide **when to act autonomously** and **when to ask the user**. This document maps the 2025 technology landscape for implementing that decision layer in Node.js. Three paradigm families exist: rule-based (deterministic, fast, transparent), score-based (tunable, explainable), and LLM-based (flexible, but opaque and non-deterministic). The correct approach for Soul is a **layered hybrid**: rule-based for hard boundaries, score-based for confidence-gated decisions, LLM-as-coordinator only where neither can handle the variance.

The project's existing constraints (Node.js >= 16, no new external dependencies, deterministic outputs preferred) narrow the field sharply.

---

## Core Decision Framework Paradigms

### Paradigm 1: Rule-Based (Hard Boundary)

**What it is:** Explicit `if/else` or `switch` logic. A decision is made by checking whether a condition is true.

**When to use:** Any decision with a clear boundary — "is the user asking to delete a file?", "is this skill verified at Level 2?", "is the confidence above threshold?". This is the **foundation layer** and should handle 80%+ of Soul's decision routing.

**Why it works for Soul:** Soul already has hard boundaries (Gatekeeper Level 2 vs Level 3, trusted vs untrusted skills, CLI vs IM gateway). Hard rules are fully deterministic, fast, and auditable — exactly what an autonomous agent needs for its safety-critical path.

**Trade-offs:** Brittle at scale. 50+ rules become unmaintainable. Use for boundaries, not nuanced judgments.

**Confidence: HIGH**

---

### Paradigm 2: Score-Based (Confidence Threshold)

**What it is:** Score multiple dimensions (task risk, outcome confidence, reversibility), sum or weight them, compare against a threshold. Decision = "if score > threshold, act; else ask."

**When to use:** Decisions with gradations of risk or confidence — "should I auto-evolve this skill or ask first?", "is this output confident enough to claim Level 2?", "is this failure recoverable without alerting the user?".

**Why it works for Soul:** This is the **primary paradigm** for DECI-01 through DECI-05. It maps directly to confidence thresholds (DECI-02), decision boundary configs (DECI-03), and audit logs (DECI-04). A score-based layer is transparent (you can log every dimension), tunable (thresholds are configuration, not code), and deterministic (same inputs → same decision).

**Trade-offs:** Weights must be calibrated manually. A naive equal-weight sum may miss domain-specific risk factors. Requires defining what dimensions to score — non-obvious dimensions (reversibility, downstream blast radius, user attention cost) often matter most.

**Confidence: HIGH**

---

### Paradigm 3: LLM-Based (LLM-as-Coordinator)

**What it is:** Ask an LLM to make the decision given a structured context — "Should Soul act autonomously here? Options: [act, ask, abort]. Context: {description, risk_factors, confidence}."

**When to use:** Genuinely novel situations where rule/score logic would require enumerating thousands of cases. Use sparingly — only for the top-of-pyramid decisions that hard rules and scores cannot handle.

**Why it is risky for Soul:**
- Non-deterministic: same input can produce different decisions across runs
- Expensive: each decision triggers an LLM API call
- Opaque: decision rationale is natural language, not structured data
- Incompatible with deterministic requirement: "相同上下文 → 相同决策结果"

**Appropriate use in Soul:**
- Decision boundary classification: "Is this user's request within the configured scope?" (a single classification call, not per-decision)
- Decision audit narration: Generate human-readable rationale after a score-based decision
- NOT for primary decision routing: this should be the exception path, not the norm

**Confidence: MEDIUM (use for classification, not routing)**

---

## Decision Architecture: Three-Layer Model

The correct architecture for Soul is a **three-layer gate**:

```
User Input / Internal Trigger
        │
        ▼
┌─────────────────────────────────────────────────┐
│  Layer 1: HARD BOUNDARY (Rule-Based)           │
│  "Is this outside all configured boundaries?"   │
│                                                 │
│  if (hardBoundaryViolated) → ASK_USER          │
│  else → Layer 2                                 │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 2: CONFIDENCE GATE (Score-Based)        │
│  "Is our confidence above the threshold?"        │
│                                                 │
│  score = sum(dim1*w1 + dim2*w2 + ...)         │
│  if (score >= threshold) → ACT_AUTONOMOUSLY    │
│  else → ASK_USER                               │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 3: EMERGENCY FALLBACK (Rule-Based)      │
│  "Is this a continuous-failure scenario?"       │
│                                                 │
│  if (consecutiveFailures > MAX) → ESCALATE     │
│  else → Layer 2 (re-evaluate)                  │
└─────────────────────────────────────────────────┘
```

**Why three layers and not two:**
- Layer 1 alone (pure rule-based) requires enumerating every possible scenario — impossible for an evolving agent.
- Layer 2 alone (pure score-based) cannot handle hard constraints (e.g., "never delete production data") without encoding them as scores — which is fragile.
- Layer 3 is essential for autonomous agents: when a decision keeps failing, the system must recognize the pattern and escalate rather than retry indefinitely.

---

## Recommended Stack

### Zero New Dependencies (In-House Implementation)

Given the project constraint "无外部依赖" (no external dependencies), implement all three layers using only Node.js built-ins + existing project infrastructure.

| Component | Implementation | Rationale |
|-----------|----------------|-----------|
| Decision boundary engine | Custom ES module in `src/core/soul/decision_boundary.js` | Hard rules are simple `Map` + `match()` — no library needed |
| Confidence scorer | Custom ES module in `src/core/soul/confidence_scorer.js` | Weighted sum is ~30 lines; external libs add opacity |
| Decision audit log | Append to `decisions/` JSONL files | Already proven pattern with `evolution-log.jsonl` |
| Fallback/fallback tracker | Extend existing `FailureCircuitBreaker` | Already exists at `src/core/soul/failure_circuit_breaker.js` |

**Confidence: HIGH**

---

### If Future Relaxation Permits New Dependencies

Only if the "no new deps" constraint is lifted later:

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `zod` | `^3.25` | Decision input/output schema validation | Validates decision context objects before scoring; prevents garbage-in-garbage-out |
| `pino` | `^9.x` | Decision audit log (structured JSON) | Fast, low-overhead; decision logs go to same pino instance as existing logger |
| `json-rules-engine` | `^6.x` | Rule-based boundary management (optional) | Only if hard-rule count exceeds 50; not needed initially |

**Do NOT add:**
- `xstate` — over-engineering for this use case (50KB+, complex DSL)
- `deciders` or similar rule engines — adds a new language to debug
- LangChain agent frameworks — entirely wrong abstraction level (designed for LLM orchestration, not decision gating)

**Confidence: MEDIUM (conditional on dep constraint lift)**

---

## Layer 1: Hard Boundary (Rule-Based)

### Implementation

```javascript
// src/core/soul/decision_boundary.js
const { Readable } = require('fs');
const fs = require('fs');
const path = require('path');

class DecisionBoundary {
  constructor(configPath) {
    this.rules = [];
    this._load(configPath);
  }

  _load(configPath) {
    // Rules stored as JSON: [{ id, condition, action, priority }]
    // condition: { field, operator, value } — evaluated against decision context
    // action: 'ASK_USER' | 'ACT_AUTONOMOUSLY' | 'BLOCK'
    // priority: number — higher runs first; first matching rule wins
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      this.rules = JSON.parse(raw).rules.sort((a, b) => b.priority - a.priority);
    } catch {
      this.rules = [];
    }
  }

  evaluate(context) {
    for (const rule of this.rules) {
      if (this._matches(rule.condition, context)) {
        return { decision: rule.action, triggeredRule: rule.id };
      }
    }
    return { decision: null, triggeredRule: null }; // No boundary violation
  }

  _matches(condition, context) {
    const fieldValue = this._getNestedField(context, condition.field);
    switch (condition.operator) {
      case 'eq':       return fieldValue === condition.value;
      case 'neq':      return fieldValue !== condition.value;
      case 'gt':       return fieldValue > condition.value;
      case 'lt':       return fieldValue < condition.value;
      case 'in':       return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'contains': return String(fieldValue).includes(condition.value);
      case 'regex':    return new RegExp(condition.value).test(String(fieldValue));
      default:         return false;
    }
  }

  _getNestedField(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }
}

module.exports = DecisionBoundary;
```

### Boundary Configuration Schema

```json
{
  "rules": [
    {
      "id": "BLOCK_DESTROY_PRODUCTION",
      "priority": 100,
      "condition": { "field": "action.type", "operator": "eq", "value": "delete_production" },
      "action": "BLOCK"
    },
    {
      "id": "ASK_DELETE_ANYTHING",
      "priority": 90,
      "condition": { "field": "action.type", "operator": "in", "value": ["delete_file", "delete_skill", "delete_kb"] },
      "action": "ASK_USER"
    },
    {
      "id": "ASK_EXTERNAL_NETWORK_CHANGE",
      "priority": 80,
      "condition": { "field": "action.type", "operator": "eq", "value": "modify_gateway_config" },
      "action": "ASK_USER"
    },
    {
      "id": "BLOCK_UNVERIFIED_SKILL_PROMOTE",
      "priority": 95,
      "condition": { "field": "skill.verificationLevel", "operator": "lt", "value": 2 },
      "action": "BLOCK"
    },
    {
      "id": "AUTONOMOUS_INTERNAL_EVOLVE",
      "priority": 1,
      "condition": { "field": "action.type", "operator": "eq", "value": "soul_evolve" },
      "action": "ACT_AUTONOMOUSLY"
    },
    {
      "id": "AUTONOMOUS_KB_LOOKUP",
      "priority": 1,
      "condition": { "field": "action.type", "operator": "eq", "value": "knowledge_query" },
      "action": "ACT_AUTONOMOUSLY"
    }
  ]
}
```

### Rationale

Storing boundaries as JSON config (not hardcoded in JS) achieves three goals:
1. **User-editable**: Soul operators can modify boundaries without touching code
2. **Version-controlled**: Boundary changes are auditable via git
3. **Testable**: Boundary logic can be unit-tested by loading fixture JSON files

Priority ordering ensures that higher-risk rules (BLOCK) take precedence over lower-risk ones (ACT_AUTONOMOUSLY).

**Confidence: HIGH**

---

## Layer 2: Confidence Scorer (Score-Based)

### Decision Dimensions

Each decision is scored across five dimensions. Dimensions are weighted; weights are configurable via JSON.

| Dimension | Score Range | What It Measures | Rationale |
|-----------|-------------|-----------------|-----------|
| `task_familiarity` | 0.0–1.0 | Has Soul seen this type of task before? | Experience reduces uncertainty |
| `outcome_confidence` | 0.0–1.0 | How confident is the subsystem producing the output? | Gatekeeper Level maps to this directly |
| `reversibility` | 0.0–1.0 | Can this action be undone easily? | High reversibility → higher autonomy |
| `risk_magnitude` | 0.0–1.0 | How severe would a wrong decision be? | Inverse: high risk → lower autonomy |
| `attention_cost` | 0.0–1.0 | How much of the user's time would a wrong decision waste? | High attention cost → ask first |

**Combined score formula:**
```
autonomy_score = Σ(dimension_score[i] * weight[i])
threshold = configurable (default: 0.65)
```

**Decision rule:**
```
if autonomy_score >= threshold → ACT_AUTONOMOUSLY
else → ASK_USER
```

### Reversibility Lookup Table

Rather than computing reversibility dynamically (expensive), pre-compute it per action type:

```javascript
const REVERSIBILITY_MAP = {
  'knowledge_query':           1.0,   // Always reversible
  'skill_creation':            0.9,   // Files can be deleted
  'skill_evolution':           0.8,   // Versioned; rollback possible
  'memo_write':                0.9,   // File deletion
  'boundary_config_update':    0.6,   // Config reloadable
  'gateway_config_update':     0.4,   // Requires restart
  'delete_file':               0.2,   // Harder to recover
  'delete_skill':              0.3,   // Skill gone unless git history
  'git_push':                  0.3,   // Remote state changed
  'env_var_modify':            0.1,   // Very hard to recover
  'production_data_delete':    0.0,   // Never autonomous
};
```

### Implementation

```javascript
// src/core/soul/confidence_scorer.js
const REVERSIBILITY_MAP = {
  'knowledge_query':           1.0,
  'skill_creation':            0.9,
  'skill_evolution':           0.8,
  'memo_write':                0.9,
  'boundary_config_update':    0.6,
  'gateway_config_update':     0.4,
  'delete_file':               0.2,
  'delete_skill':              0.3,
  'git_push':                  0.3,
  'env_var_modify':            0.1,
  'production_data_delete':    0.0,
};

const DEFAULT_WEIGHTS = {
  task_familiarity:     0.20,
  outcome_confidence:   0.35,  // Highest weight: Gatekeeper Level matters most
  reversibility:        0.20,
  risk_magnitude:        0.15,
  attention_cost:       0.10,
};

const DEFAULT_THRESHOLD = 0.65;

class ConfidenceScorer {
  constructor(options = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...options.weights };
    this.threshold = options.threshold ?? DEFAULT_THRESHOLD;
  }

  score(context) {
    const {
      actionType,
      taskHistoryCount = 0,   // How many times this action type has run
      verificationLevel = 0, // Gatekeeper Level 0-4
      riskMagnitude = 0.5,    // User-specified or computed
      attentionCost = 0.5,   // Estimated user time cost if wrong
    } = context;

    // task_familiarity: log-scale — first encounter is uncertain, 10+ is familiar
    const task_familiarity = Math.min(taskHistoryCount / 10, 1.0);

    // outcome_confidence: Gatekeeper Level maps directly
    const outcome_confidence = Math.min(verificationLevel / 4, 1.0);

    // reversibility: lookup table (never null — default to 0.5 for unknown types)
    const reversibility = REVERSIBILITY_MAP[actionType] ?? 0.5;

    // risk_magnitude: provided in context (0=trivial, 1=catastrophic)
    const risk = riskMagnitude;

    // attention_cost: provided in context (0=no cost, 1=minutes of user time)
    const attention = attentionCost;

    const raw =
      task_familiarity * this.weights.task_familiarity +
      outcome_confidence * this.weights.outcome_confidence +
      reversibility * this.weights.reversibility +
      (1 - risk) * this.weights.risk_magnitude +      // Invert: low risk → higher score
      (1 - attention) * this.weights.attention_cost;   // Invert: low cost → higher score

    return {
      autonomy_score: Math.round(raw * 100) / 100,
      dimensions: { task_familiarity, outcome_confidence, reversibility, risk, attention },
      threshold: this.threshold,
      decision: raw >= this.threshold ? 'ACT_AUTONOMOUSLY' : 'ASK_USER',
    };
  }
}

module.exports = ConfidenceScorer;
```

### Weight Calibration Notes

Default weights reflect these priorities:
- **outcome_confidence (0.35)**: Gatekeeper Level is the best proxy for output quality. An action verified at Level 3 should be close to fully autonomous.
- **task_familiarity (0.20)**: Experience matters, but Soul should be able to handle new situations if they're low-risk.
- **reversibility (0.20)**: Reversible actions deserve more autonomy — mistakes are recoverable.
- **risk_magnitude (0.15)**: Risk is important but not dominant (hard boundaries catch the catastrophic cases first).
- **attention_cost (0.10)**: Minor factor; user attention is valuable but not safety-critical.

Weights should be adjusted over time based on audit log analysis. If Soul frequently makes wrong decisions at high confidence scores, increase `risk_magnitude` weight.

**Confidence: HIGH**

---

## Layer 3: Emergency Fallback (Failure-Aware Escalation)

### Implementation

Extend the existing `FailureCircuitBreaker` rather than creating a new module.

```javascript
// DECI-06: Emergency fallback — extend FailureCircuitBreaker
// In src/core/soul/failure_circuit_breaker.js, add these methods:

getAutonomousEscalationLevel(context) {
  // Returns: 'NOMINAL' | 'DEGRADED' | 'ESCALATE' | 'ABORT'
  const { consecutiveFailures = 0, lastFailureType = null } = context;

  if (consecutiveFailures === 0) return 'NOMINAL';
  if (consecutiveFailures < 3)  return 'DEGRADED';
  if (consecutiveFailures < 5)  return 'ESCALATE';
  return 'ABORT';
}

getFallbackAction(context) {
  const level = this.getAutonomousEscalationLevel(context);
  switch (level) {
    case 'NOMINAL':   return 'CONTINUE_AUTONOMOUSLY';
    case 'DEGRADED':  return 'CONTINUE_WITH_LOGGING';  // Extra audit, no user alert
    case 'ESCALATE':  return 'ASK_USER';               // Alert user, request confirmation
    case 'ABORT':     return 'HALT_AND_NOTIFY';         // Stop autonomous loop, notify operator
  }
}
```

### Fallback Decision Matrix

| Escalation Level | Consecutive Failures | Fallback Action | Notification |
|-----------------|---------------------|-----------------|--------------|
| NOMINAL | 0 | Continue autonomously | None |
| DEGRADED | 1–2 | Continue with extra logging | None (internal only) |
| ESCALATE | 3–4 | Ask user before proceeding | User notification |
| ABORT | 5+ | Halt, stop autonomous loop | Operator alert + audit report |

**Confidence: HIGH (extends existing proven FailureCircuitBreaker)**

---

## Decision Audit Log

Every decision must be logged for post-hoc analysis. The audit log feeds DECI-04 and DECI-05.

### Schema

```json
{
  "timestamp": "2026-04-12T12:00:00.000Z",
  "decision_id": "dec_a1b2c3d4",
  "action": {
    "type": "skill_evolution",
    "target": "eb-edu/create-product",
    "params": { "strategy": "crossValidation" }
  },
  "layer1_boundary": {
    "decision": null,
    "triggeredRule": null,
    "passDuration_ms": 0.3
  },
  "layer2_confidence": {
    "decision": "ACT_AUTONOMOUSLY",
    "autonomy_score": 0.72,
    "threshold": 0.65,
    "dimensions": {
      "task_familiarity": 0.9,
      "outcome_confidence": 0.50,
      "reversibility": 0.8,
      "risk": 0.3,
      "attention": 0.4
    }
  },
  "layer3_fallback": {
    "decision": "CONTINUE_AUTONOMOUSLY",
    "escalation_level": "NOMINAL",
    "consecutive_failures": 0
  },
  "final_decision": "ACT_AUTONOMOUSLY",
  "outcome": null,
  "outcome_confirmed_at": null
}
```

```json
{
  "timestamp": "2026-04-12T12:05:00.000Z",
  "decision_id": "dec_e5f6g7h8",
  "action": {
    "type": "delete_skill",
    "target": "unverified-skill-v0.1",
    "params": {}
  },
  "layer1_boundary": {
    "decision": "ASK_USER",
    "triggeredRule": "ASK_DELETE_ANYTHING",
    "passDuration_ms": 0.2
  },
  "layer2_confidence": null,
  "layer3_fallback": null,
  "final_decision": "ASK_USER",
  "outcome": null,
  "outcome_confirmed_at": null
}
```

### Audit Log Implementation

```javascript
// src/core/soul/decision_auditor.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DecisionAuditor {
  constructor(logDir = '.stigmergy/soul-state/decisions') {
    this.logDir = logDir;
    this._ensureDir();
  }

  _ensureDir() {
    try { fs.mkdirSync(this.logDir, { recursive: true }); } catch { /* dir exists */ }
  }

  _dateFile() {
    return path.join(this.logDir, `decisions_${new Date().toISOString().slice(0, 10)}.jsonl`);
  }

  log(decision) {
    const entry = {
      ...decision,
      decision_id: `dec_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    fs.promises.appendFile(this._dateFile(), JSON.stringify(entry) + '\n').catch(() => {});
    return entry.decision_id;
  }

  async getRecentDecisions(days = 7) {
    const results = [];
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 86400000).toISOString().slice(0, 10);
      const file = path.join(this.logDir, `decisions_${date}.jsonl`);
      try {
        const raw = await fs.promises.readFile(file, 'utf8');
        raw.split('\n').filter(Boolean).forEach(line => {
          try { results.push(JSON.parse(line)); } catch {}
        });
      } catch { /* file absent */ }
    }
    return results;
  }

  async getAutonomyRate(days = 7) {
    const decisions = await this.getRecentDecisions(days);
    if (decisions.length === 0) return null;
    const autonomous = decisions.filter(d => d.final_decision === 'ACT_AUTONOMOUSLY').length;
    return { autonomous, total: decisions.length, rate: autonomous / decisions.length };
  }
}

module.exports = DecisionAuditor;
```

### DECI-05: Decision Self-Check (Post-Decision Verification)

After an autonomous decision executes, verify the outcome matches the expectation:

```javascript
// src/core/soul/decision_self_checker.js
class DecisionSelfChecker {
  async verify(decisionId, expectedOutcome) {
    const confirmed = await this._queryActualOutcome(decisionId);
    const matches = this._outcomesMatch(expectedOutcome, confirmed);
    return { decisionId, expected: expectedOutcome, actual: confirmed, matches };
  }

  _outcomesMatch(expected, actual) {
    if (!expected || !actual) return false;
    if (typeof expected === 'boolean') return expected === actual;
    if (typeof expected === 'object') {
      return Object.keys(expected).every(k => expected[k] === actual[k]);
    }
    return expected === actual;
  }
}
```

Self-check results feed back into the confidence scorer: if a decision was wrong, decrement `task_familiarity` for that action type until the weight recalibration proves the system learned.

**Confidence: MEDIUM (DECI-05 self-check design is sound; calibration loop needs real data)**

---

## Putting It Together: Decision Engine

```javascript
// src/core/soul/decision_engine.js
const DecisionBoundary = require('./decision_boundary');
const ConfidenceScorer = require('./confidence_scorer');
const DecisionAuditor = require('./decision_auditor');
const FailureCircuitBreaker = require('./failure_circuit_breaker');

class SoulDecisionEngine {
  constructor(options = {}) {
    this.boundary = new DecisionBoundary(options.boundaryConfigPath);
    this.scorer = new ConfidenceScorer(options.scoringWeights);
    this.auditor = new DecisionAuditor(options.auditLogDir);
    this.circuitBreaker = options.circuitBreaker || new FailureCircuitBreaker();
    this.pendingDecisions = new Map();
  }

  async decide(context) {
    // Layer 1: Hard boundary check
    const layer1 = this.boundary.evaluate(context);
    if (layer1.decision === 'BLOCK') {
      return this._logAndReturn({ ...context, layer1, final_decision: 'BLOCK' });
    }
    if (layer1.decision === 'ASK_USER') {
      return this._logAndReturn({ ...context, layer1, final_decision: 'ASK_USER' });
    }

    // Layer 3: Emergency fallback check
    const failureContext = {
      consecutiveFailures: this.circuitBreaker.failures || 0,
    };
    const escalationLevel = this.circuitBreaker.getAutonomousEscalationLevel(failureContext);
    const fallbackAction = this.circuitBreaker.getFallbackAction(failureContext);

    if (fallbackAction === 'HALT_AND_NOTIFY') {
      return this._logAndReturn({ ...context, layer1, layer3_fallback: { escalationLevel, fallbackAction }, final_decision: 'HALT_AND_NOTIFY' });
    }
    if (fallbackAction === 'ASK_USER') {
      return this._logAndReturn({ ...context, layer1, layer3_fallback: { escalationLevel, fallbackAction }, final_decision: 'ASK_USER' });
    }

    // Layer 2: Confidence scoring
    const layer2 = this.scorer.score(context);
    const final = layer2.decision === 'ACT_AUTONOMOUSLY' ? 'ACT_AUTONOMOUSLY' : 'ASK_USER';

    return this._logAndReturn({ ...context, layer1, layer2, layer3_fallback: { escalationLevel, fallbackAction }, final_decision: final });
  }

  _logAndReturn(decision) {
    const id = this.auditor.log(decision);
    return { ...decision, decision_id: id };
  }

  // Call after action executes to record outcome
  async recordOutcome(decisionId, outcome) {
    this.pendingDecisions.set(decisionId, outcome);
    if (outcome.success) {
      this.circuitBreaker.recordSuccess();
    } else {
      const { circuitOpen } = this.circuitBreaker.recordFailure();
      if (circuitOpen) {
        // DECI-06: notify operator
        console.warn(`[SoulDecision] Circuit breaker OPENED after consecutive failures`);
      }
    }
  }
}

module.exports = SoulDecisionEngine;
```

---

## What NOT to Use and Why

| Avoid | Reason | Use Instead |
|-------|--------|-------------|
| `xstate` | Designed for complex state machine workflows; 50KB+, complex DSL; overkill for 3-layer decision gate | Custom ES module (~200 lines total) |
| `LangChain agents` | Entirely wrong abstraction level — orchestrates LLM calls, not decision gating | Rule-based + score-based layers above |
| `opossum` | Service mesh circuit breaker; file persistence not built-in | Existing `FailureCircuitBreaker` (extended) |
| `winston` | 3-5x slower than pino; JSON format is verbose | `pino` (if dep constraint lifted) |
| Decision tree ML models | Requires training data; non-deterministic outputs; interpretability worse than score-based | Weighted sum scorer with human-readable weights |
| Pure LLM routing | Non-deterministic, expensive, opaque; violates deterministic constraint | LLM only for boundary classification, not primary routing |
| `json-rules-engine` (initial phase) | New dependency; 7 rules don't need a rule engine | Custom `DecisionBoundary` class |
| Dynamic weight learning | Adds complexity without benefit until audit data exists | Static weights with manual calibration |

---

## Alternatives Considered

### Option A: Pure Rule-Based

**Pros:** Simplest possible implementation, fully deterministic, zero dependencies.
**Cons:** Requires enumerating every scenario. 50+ rules become unmaintainable. Cannot handle gradations of confidence.
**Verdict:** Use for Layer 1 hard boundaries only.

### Option B: Pure Score-Based

**Pros:** Handles gradations, tunable without code changes, auditable.
**Cons:** Hard boundaries must be encoded as extreme scores (fragile), weights require calibration, unfamiliar action types get arbitrary scores.
**Verdict:** Use for Layer 2 only, not as the sole paradigm.

### Option C: Pure LLM-Based

**Pros:** Handles any scenario, no rule enumeration needed.
**Cons:** Non-deterministic, expensive, opaque, violates deterministic constraint.
**Verdict:** Not appropriate for primary routing. Appropriate for boundary classification and post-hoc narration.

### Option D: Hybrid Three-Layer (Recommended)

**Pros:** Combines the strengths of all three paradigms. Hard rules catch the catastrophic cases. Score-based handles the nuanced middle. LLM handles classification only where rules/scores cannot.
**Cons:** Three components to maintain, more complex than any single approach.
**Verdict:** **RECOMMENDED** — complexity is justified by the safety and transparency requirements.

---

## Version Compatibility

| Component | Node.js | Notes |
|-----------|---------|-------|
| `DecisionBoundary` | >=16 | Uses `fs.promises`, `crypto.randomUUID()` (Node 14.17+) |
| `ConfidenceScorer` | >=16 | Pure arithmetic; no dependencies |
| `DecisionAuditor` | >=16 | Uses `fs.promises`, `crypto` |
| `FailureCircuitBreaker` extension | >=16 | Already in codebase, no changes to existing deps |
| `pino` (if used) | >=16 | Async-only; satisfied |
| `zod` (if used) | >=12 | TypeScript-first; works in TS orchestration layer |

---

## Implementation Roadmap

| Phase | Components | Effort | Priority |
|-------|-----------|--------|----------|
| Phase 1 | DecisionBoundary (Layer 1) + JSON config schema | ~2 hours | P0 |
| Phase 1 | ConfidenceScorer (Layer 2) + default weights | ~1 hour | P0 |
| Phase 1 | DecisionAuditor + JSONL audit log | ~1 hour | P0 |
| Phase 2 | DecisionEngine (Layer 1 + 2 wiring) | ~1 hour | P0 |
| Phase 2 | Layer 3 fallback (extend FailureCircuitBreaker) | ~1 hour | P0 |
| Phase 3 | DECI-05 self-check verification loop | ~2 hours | P1 |
| Phase 3 | Weight calibration from audit data | ~2 hours | P1 |
| Phase 4 | LLM boundary classification (optional) | ~2 hours | P2 |

**Total new code: ~400 lines** across 4 new modules. No new external dependencies required.

---

## Sources

- [LangChain Agents documentation](https://python.langchain.com/docs/concepts/agents/) — agent decision patterns; MEDIUM confidence (training data)
- [AWS Architecture Blog: Decision Trees vs Rule Engines](https://aws.amazon.com/blogs/architecture/) — rule-based vs score-based decision patterns; MEDIUM confidence (training data)
- [Temporal.io Workflow Patterns](https://docs.temporal.io/concepts/what-is-a-workflow) — checkpoint/resume and failure isolation; HIGH confidence
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html) — pattern reference; HIGH confidence
- [Anthropic Claude Code: Decision-Making Patterns](https://docs.anthropic.com/) — agent autonomy best practices; MEDIUM confidence (training data through August 2025)
- [Project constraint analysis: DECI-01 through DECI-06](D:\stigmergy-CLI-Multi-Agents\.planning\PROJECT.md) — HIGH confidence (project source)
- [Existing FailureCircuitBreaker: src/core/soul/failure_circuit_breaker.js](D:\stigmergy-CLI-Multi-Agents\src\core\soul\failure_circuit_breaker.js) — HIGH confidence (codebase inspection)
- [Existing evolution-log.jsonl patterns](D:\stigmergy-CLI-Multi-Agents\.planning\research\FEATURES.md) — decision audit log schema informed by log analysis; HIGH confidence
- [Gatekeeper Level definitions: .gates/GATEKEEPER.md](D:\stigmergy-CLI-Multi-Agents\.gates\GATEKEEPER.md) — Level 0-4 verification maps to outcome_confidence dimension; HIGH confidence

---
*Stack research for: Soul Autonomous Decision-Making*
*Researched: 2026-04-12*
*Focus: Decision framework patterns, confidence scoring, boundary configuration, audit logging, emergency fallback*
