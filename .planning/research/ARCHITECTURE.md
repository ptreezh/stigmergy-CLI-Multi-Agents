# Soul 自主决策系统架构

**Domain:** Autonomous Decision-Making for AI Agents
**Analysis Date:** 2026-04-12
**Confidence:** HIGH — based on established agent architecture patterns (BDI, OODA, OpenAI AutoGPT/Swarm, ROS2 Behavior Trees) applied to the Stigmergy Soul system's concrete components and requirements (DECI-01 through DECI-06).

---

## 1. Research Question

How are autonomous decision-making systems typically structured? What are major components and how do they interact?

How does this map to the existing Stigmergy Soul system — layering on top, not replacing it?

---

## 2. Standard Architecture

### 2.1 Reference Models

Four canonical models inform this architecture:

| Model | Origin | Key Insight |
|-------|--------|-------------|
| **BDI** (Belief-Desire-Intention) | Bratman, 1987 — used in Jason, PRS | Deliberate goal-based reasoning: Beliefs (state) → Desires (goals) → Intentions (commitments) |
| **OODA** (Observe-Orient-Decide-Act) | Boyd, 1970s — military/ROS | Fast feedback loop: observe → orient → decide → act |
| **Behavior Trees** | ROS2, game AI — HALGEN, 2004 | Hierarchical, composable actions with selectors and sequencers |
| **LLM Agent Loop** | AutoGPT, LangChain, OpenAI Swarm | Plan → Tool Use → Observe → Loop; with explicit tool-result reflection |

**Decision for Soul:** Hybrid. Use OODA's fast loop for simple decisions (boundary-known, high confidence). Use BDI-inspired deliberation for complex multi-step decisions. Behavior Tree selectors model decision boundaries naturally as composable guard conditions.

### 2.2 Component Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DecisionEngine (top-level)                        │
│                                                                       │
│  Entrypoint: decide(situation) → DecisionResult                      │
│                                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Boundary    │  │ Context      │  │ Evaluator   │  │ Selector  │ │
│  │ Manager     │→ │ Gatherer     │→ │ (scoring)   │→ │ (ranking) │ │
│  │             │  │              │  │             │  │           │ │
│  │ - boundaries│  │ - knowledge  │  │ - boundary  │  │ - top-1   │ │
│  │ - thresholds│  │ - history    │  │   filter    │  │ - fallback│ │
│  │ - intents   │  │ - skills     │  │ - score     │  │   trigger │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────┘ │
│                            ↓                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Executor    │← │ Verifier      │  │ Auditor     │  │ Escalation│ │
│  │             │  │               │  │             │  │ Manager   │ │
│  │ - delegate  │  │ - expected vs │  │ - log JSONL │  │ - fallback│ │
│  │   to evolver│  │   actual      │  │ - decision  │  │   to user │ │
│  │   reflector │  │ - pass/fail   │  │   trail     │  │ - notify   │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Decision Flow: Input → Evaluation → Selection → Execution → Verification

```
1. INPUT (situation)
   User command or scheduled trigger
   { situation, context, urgency, constraints? }

2. CONTEXT GATHERING (ContextGatherer)
   Pull from KnowledgeBase + DecisionHistory + SoulIdentity
   → DecisionContext { facts, history, available_skills, constraints }

3. BOUNDARY FILTERING (BoundaryManager)
   Load boundaries.json
   Classify situation: AUTONOMOUS | BOUNDARY_EDGE | OUT_OF_BOUNDS
   → BoundaryClassification { level, matched_rules, confidence_delta }

4. OPTION GENERATION (Evaluator)
   Generate N candidate actions
   Score each against: alignment_score, success_likelihood, urgency
   → Option[] { action, score, reason, confidence }

5. CONFIDENCE CHECK
   If max(score) < confidence_threshold OR level == OUT_OF_BOUNDS:
     → ESCALATE to user with explanation
   Else:
     → Continue

6. SELECTION (Selector)
   Pick top-ranked option
   Record selection reason
   → SelectedAction { action, score, reason, decision_id }

7. EXECUTION (Executor)
   Route to appropriate subsystem:
     skill_evolution → SoulSkillEvolver
     self_reflection  → SoulReflector
     alignment_check  → SoulAlignmentChecker
     cli_execution    → CLI tools via smart_router
   → ExecutionResult { outcome, duration_ms, error? }

8. VERIFICATION (Verifier)
   Compare ExecutionResult against SelectedAction.expected_outcome
   → Verdict { passed: boolean, discrepancies: string[], retry: boolean }

9. POST-PROCESS
   If !passed AND retry == true: re-evaluate from step 4 (max 2 retries)
   If passed OR retries exhausted:
     Auditor.log(decision) → decisions/{date}.jsonl
     Emit decision.completed event
     Return DecisionResult to caller
```

---

## 3. Component Definitions

### 3.1 DecisionEngine (orchestrator)

**File:** `src/core/soul_decision_engine.js`

**Responsibility:** Top-level orchestrator. Owns the decision lifecycle: context → evaluation → selection → execution → verification. Does NOT implement logic itself — delegates to specialized components.

**Public API:**
```javascript
class SoulDecisionEngine {
  async decide(situation: Situation): Promise<DecisionResult>
  async decideAsync(situation: Situation): Promise<DecisionResult> // non-blocking variant
  async shouldEscalate(situation: Situation): Promise<EscalationReason | null>
}
```

**Boundary:** Only talks to specialized components. Does not read files or call CLIs directly.

**State:** Stateless between calls. All state persisted by sub-components.

---

### 3.2 BoundaryManager

**File:** `src/core/soul/decision/boundary_manager.js`

**Responsibility:** Load, validate, and query decision boundaries from `boundaries.json`. Classify incoming situations against boundary rules.

**Public API:**
```javascript
class BoundaryManager {
  async loadBoundaries(): Promise<BoundarySet>
  classify(situation: Situation, context: DecisionContext): BoundaryClassification
  isWithinBounds(action: Action): boolean
  getMatchedRules(situation: Situation): BoundaryRule[]
}
```

**Data:** `boundaries.json` schema (user-editable, version-controlled):
```json
{
  "version": "1.0.0",
  "defaultConfidenceThreshold": 0.7,
  "perCategory": {
    "skill_evolution": { "confidenceThreshold": 0.6, "maxAutonomousRetries": 2 },
    "reflection": { "confidenceThreshold": 0.8, "maxAutonomousRetries": 1 },
    "cli_execution": { "confidenceThreshold": 0.75, "requiresConfirmation": ["rm -rf", "git push --force"] }
  },
  "rules": [
    {
      "id": "no-destructive-git",
      "condition": { "action.type": "git", "action.flags": { "contains": "--force" } },
      "level": "OUT_OF_BOUNDS",
      "message": "Force-push to git is not permitted autonomously"
    },
    {
      "id": "skill-evolve-trusted-sources",
      "condition": { "source.type": "in", "source.value": ["github", "npm"] },
      "level": "AUTONOMOUS",
      "message": "Skill evolution from trusted sources is permitted"
    }
  ]
}
```

**Location:** `.stigmergy/soul-state/boundaries/boundaries.json`

---

### 3.3 ContextGatherer

**File:** `src/core/soul/decision/context_gatherer.js`

**Responsibility:** Aggregate all available context for a decision: knowledge base entries, recent decision history, available skills, current Soul identity state.

**Public API:**
```javascript
class ContextGatherer {
  async gather(situation: Situation): Promise<DecisionContext>
  async getRecentDecisions(count: number): Promise<Decision[]>
  async getRelevantKnowledge(situation: Situation): Promise<KnowledgeEntry[]>
}
```

**Inputs (read-only):**
- SoulKnowledgeBase (semantic search by situation keywords)
- DecisionHistory (last N decisions, used for pattern recognition)
- SoulIdentity (current mission/role for alignment filtering)

**Outputs:** `DecisionContext` — a structured snapshot of all relevant state at decision time.

---

### 3.4 Evaluator

**File:** `src/core/soul/decision/evaluator.js`

**Responsibility:** Generate candidate actions and score them. Each candidate receives: (a) a boundary-filter pass/fail, (b) a multi-factor score, (c) a human-readable reason.

**Scoring Factors:**
| Factor | Weight | Source |
|--------|--------|--------|
| `alignment_score` | 30% | SoulAlignmentChecker |
| `success_likelihood` | 25% | Historical success rate for similar decisions |
| `urgency` | 20% | Situation urgency field |
| `confidence` | 15% | Evaluator's own confidence in the scoring |
| `boundary_clearance` | 10% | BoundaryManager classification |

**Public API:**
```javascript
class Evaluator {
  async generateOptions(context: DecisionContext): Promise<Option[]>
  async score(option: Option, context: DecisionContext): Promise<ScoredOption>
}
```

---

### 3.5 Selector

**File:** `src/core/soul/decision/selector.js`

**Responsibility:** Given a list of scored options, pick the best one. Apply tie-breaking rules and escalation triggers.

**Public API:**
```javascript
class Selector {
  select(options: ScoredOption[], threshold: number): SelectionResult
}
```

**Logic:**
1. Filter out options with `boundary_clearance < threshold`
2. Sort remaining by composite score (descending)
3. Top result → return as `SelectedAction`
4. If no options remain → return `ESCALATE` with `reason`
5. If top score is within 0.1 of second place → log tie-breaking reason for audit

---

### 3.6 Executor

**File:** `src/core/soul/decision/executor.js`

**Responsibility:** Dispatch a `SelectedAction` to the appropriate subsystem. Wraps existing Soul components (SkillEvolver, Reflector, AlignmentChecker) with a common execution interface.

**Public API:**
```javascript
class Executor {
  async execute(action: SelectedAction): Promise<ExecutionResult>
  async executeAsync(action: SelectedAction): Promise<void> // non-blocking, for scheduled decisions
}
```

**Routing:**
| Action.type | Routes to |
|-------------|-----------|
| `skill_evolution` | SoulSkillEvolver.evolve() |
| `self_reflection` | SoulReflector.reflect() |
| `alignment_check` | SoulAlignmentChecker.check() |
| `cli_execution` | SmartRouter.route() |
| `abort` | Log and skip (used when boundary is OUT_OF_BOUNDS) |

**Error handling:** All subsystem errors are caught and returned as `ExecutionResult { success: false, error }` — NOT thrown. This prevents one subsystem failure from crashing the decision engine.

---

### 3.7 Verifier

**File:** `src/core/soul/decision/verifier.js`

**Responsibility:** Post-execution verification — compare actual outcome against expected outcome declared in the SelectedAction. This implements DECI-05.

**Public API:**
```javascript
class Verifier {
  async verify(action: SelectedAction, result: ExecutionResult): Promise<Verdict>
}
```

**Verdict outcomes:**
- `PASS` — outcome matches expected result within tolerance
- `FAIL` — outcome deviates; return `retry: true` to trigger re-evaluation
- `UNVERIFIABLE` — no verifiable outcome (e.g., "skill created" needs human check); skip verification, log as informational

---

### 3.8 Auditor

**File:** `src/core/soul/decision/auditor.js`

**Responsibility:** Persist every decision to the audit log. Provides replay and analysis capability. Implements DECI-04.

**Public API:**
```javascript
class Auditor {
  async log(decision: DecisionRecord): Promise<void>
  async query(filters: AuditQuery): Promise<DecisionRecord[]>
  async getRecent(count: number): Promise<DecisionRecord[]>
}
```

**Audit log entry schema:**
```json
{
  "decisionId": "uuid-v4",
  "timestamp": "2026-04-12T10:00:00.000Z",
  "situation": { "type": "skill_evolution", "topic": "frontend" },
  "context": { "knowledgeCount": 42, "recentDecisions": 5 },
  "options": [
    { "action": "evolve:frontend", "score": 0.82, "reasons": ["aligned", "trusted_source"] }
  ],
  "selected": { "action": "evolve:frontend", "score": 0.82 },
  "confidenceThreshold": 0.7,
  "outcome": "PASS",
  "verdict": { "passed": true, "discrepancies": [] },
  "executionDurationMs": 3400,
  "escalated": false,
  "retried": false,
  "soulIdentity": { "name": "Stigmergy-Soul", "cycle": 3 }
}
```

**Location:** `.stigmergy/soul-state/decisions/{YYYY-MM-DD}.jsonl` (one file per day, append-only)

---

### 3.9 EscalationManager

**File:** `src/core/soul/decision/escalation_manager.js`

**Responsibility:** Handle decisions that cannot be made autonomously. Present a clear explanation to the user and await confirmation or override.

**Public API:**
```javascript
class EscalationManager {
  async escalate(escalation: Escalation): Promise<UserResponse>
  async notifyUser(message: EscalationNotice): Promise<void>
}
```

**Escalation triggers:**
1. All option scores below `confidenceThreshold`
2. Situation classified as `OUT_OF_BOUNDS`
3. Verifier returns `FAIL` after max retries
4. Executor returns an unhandled error

**User response options:** `CONFIRM`, `MODIFY_AND_CONFIRM`, `REJECT`, `ADD_TO_BOUNDARIES`

---

## 4. Integration with Existing Soul System

### 4.1 Layer Position

The DecisionEngine is a **new top-level component** that sits alongside existing Soul components. It does not replace any existing flow. It wraps the existing evolution/reflection flows with a decision layer on top.

```
Current Soul Architecture (Layer 2: Core Services):
  src/core/soul_manager.js
  src/core/soul_knowledge_base.js
  src/core/soul_skill_evolver.js
  src/core/soul_alignment_checker.js
  src/core/soul_reflector.js
  src/core/soul_scheduler.js

New Layer (layered on top):
  src/core/soul_decision_engine.js        ← NEW: top-level orchestrator
  src/core/soul/decision/                  ← NEW: decision sub-components
    boundary_manager.js
    context_gatherer.js
    evaluator.js
    selector.js
    executor.js
    verifier.js
    auditor.js
    escalation_manager.js
```

### 4.2 Entry Points

**Direct trigger:** `stigmergy soul decide "situation description"`
Routes to: `SoulDecisionEngine.decide(situation)`

**Integrated trigger (recommended):** Before every autonomous action in `SoulManager`, the DecisionEngine is consulted:

```javascript
// In SoulManager — before any autonomous action
const decision = await soulDecisionEngine.decide({
  type: 'pre_autonomous_action',
  action: 'skill_evolution',
  topic: 'frontend',
  urgency: 'normal'
});

if (decision.escalated) {
  await escalationManager.escalate(decision.escalation);
  return; // wait for user response
}

const result = await executor.execute(decision.selected);
```

### 4.3 Data Flow to/from Existing Components

```
SoulKnowledgeBase ──read──→ ContextGatherer ──context──→ Evaluator
                                                              ↓ scored options
SoulAlignmentChecker ──check──→ Evaluator ───────────────→ Selector
                                                              ↓ selected action
SoulSkillEvolver ←──────────────────────── Executor ←──────┘
SoulReflector ←─────────────────────────────────────────────┘
SoulScheduler ──tick event──→ DecisionEngine.decide() ──→ Auditor
SoulManager ←──────────────────────────────────────────────┘ (result)
EventBus ←──────────────── decision.completed ──────────────┘
```

### 4.4 State Directory

All decision state lives in `.stigmergy/soul-state/decisions/`, consistent with existing Soul state directory.

```
.stigmergy/soul-state/
├── decisions/
│   ├── 2026-04-12.jsonl   # append-only audit log
│   └── 2026-04-13.jsonl
├── boundaries/
│   └── boundaries.json     # user-editable, version-controlled
└── checkpoints/           # (from error-resilience architecture)
    └── evolution.json
```

---

## 5. Build Order

Dependencies between components (build in order):

```
Phase 1: Infrastructure (no dependencies on other new components)
  1. Auditor          — log() must work first for debugging
  2. BoundaryManager   — pure JSON loading + rule matching, no deps

Phase 2: Context (depends on Phase 1)
  3. ContextGatherer  — reads SoulKnowledgeBase + audit log

Phase 3: Decision Logic (depends on Phases 1 + 2)
  4. Evaluator         — scoring logic, uses BoundaryManager + ContextGatherer
  5. Selector          — depends on Evaluator output types
  6. Verifier          — depends on Evaluator + Executor (can be added after)

Phase 4: Execution (depends on Phases 2 + 3)
  7. Executor          — depends on Selector output, routes to existing components
  8. EscalationManager — depends on Auditor + BoundaryManager

Phase 5: Integration
  9. SoulDecisionEngine — wire all components together
  10. SoulManager integration — DecisionEngine consulted before autonomous actions
```

**Why this order:** Each phase produces a usable artifact. Phase 1 gives you an audit log. Phase 2 gives you context. Phase 3 gives you decisions (log-only, no execution). Phase 4 actually does things. Phase 5 connects to Soul.

---

## 6. Component Boundaries Summary

| Component | Reads | Writes | Calls |
|-----------|-------|--------|-------|
| DecisionEngine | situation | decision result | all sub-components |
| BoundaryManager | boundaries.json | — | — |
| ContextGatherer | SoulKnowledgeBase, audit log | — | — |
| Evaluator | BoundaryManager, ContextGatherer | — | SoulAlignmentChecker |
| Selector | Evaluator output | — | — |
| Executor | SelectedAction | — | SoulSkillEvolver, SoulReflector, SmartRouter |
| Verifier | ExecutionResult, SelectedAction | — | — |
| Auditor | — | decisions/{date}.jsonl | — |
| EscalationManager | decision, boundaries | user notification | — |

**Data flow direction:** situation → ContextGatherer → Evaluator → Selector → Executor → Verifier → Auditor

---

## 7. Sources

- Bratman, M. E. (1987). *Intention, Plans, and Practical Reason* — BDI model
- Boyd, J. R. (1995). "The Essence of Winning and Losing" — OODA loop
- Colledanchise, M. & Ogren, P. (2018). *Behavior Trees in Robotics and AI* — BT architecture
- AutoGPT architecture: https://github.com/Significant-Gravitas/AutoGPT
- LangChain Agent architecture: https://docs.langchain.com/docs/modules/agents/
- OpenAI Swarm: https://github.com/openai/swarm
- ROS2 Behavior Trees: https://docs.ros.org/en/humble/Tutorials/Understanding/Understanding-Behavior-Trees.html
- Confidence: HIGH for BDI/OODA/BT patterns (academic + industry validated). HIGH for LangChain/AutoGPT patterns (open source with production use). MEDIUM for Stigmergy-specific integration (based on code structure analysis, not runtime testing).

---

*Architecture research for: Soul 自主决策 (Autonomous Decision-Making)*
*Researched: 2026-04-12*
