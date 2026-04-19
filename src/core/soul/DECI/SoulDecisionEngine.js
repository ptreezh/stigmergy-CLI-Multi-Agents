/**
 * SoulDecisionEngine — DECI: 3-layer decision gate orchestrator.
 *
 * Layers:
 *   Layer 1 (DecisionBoundary): Hard-rule boundary filtering
 *   Layer 2 (ConfidenceScorer): 5-dimension weighted autonomy score
 *   Layer 3 (EmergencyFallback): Consecutive-failure escalation states
 *
 * DECI-01: 3-layer gate (hard boundary -> confidence score -> emergency fallback)
 * INTEG-01: This engine is called by SoulManager before every autonomous action.
 *
 * Deterministic: same DecisionContext -> same final_decision every time.
 * No randomness anywhere.
 */
const crypto = require('crypto');
const DecisionBoundary = require('./DecisionBoundary');
const ConfidenceScorer = require('./ConfidenceScorer');
const EmergencyFallback = require('./EmergencyFallback');
const DecisionContext = require('./DecisionContext');

class SoulDecisionEngine {
  /**
   * @param {Object} opts
   * @param {string} opts.boundariesPath — path to boundaries.json (default: .stigmergy/soul-state/boundaries/boundaries.json)
   * @param {string} opts.projectRoot — project root for relative path resolution
   */
  constructor(opts = {}) {
    this.boundariesPath = opts.boundariesPath;
    this.projectRoot = opts.projectRoot || process.cwd();

    // Initialize all three layers
    this._layer1 = new DecisionBoundary({
      boundariesPath: this.boundariesPath,
      projectRoot: this.projectRoot,
    });
    this._layer2 = new ConfidenceScorer({
      threshold: this._layer1.defaultThreshold,
    });
    this._layer3 = new EmergencyFallback();

    // Decision counter for deterministic IDs within this session
    this._decisionCounter = 0;
  }

  /**
   * Make a decision for the given context.
   *
   * @param {DecisionContext|Object} context — DecisionContext instance or plain object
   * @returns {{ decision_id, timestamp, situation, layer1, layer2, layer3, final_decision, reasoning }}
   */
  decide(context) {
    // Normalize to DecisionContext
    const ctx = context instanceof DecisionContext
      ? context
      : new DecisionContext(context);

    const reasoning = [];
    const timestamp = new Date().toISOString();
    const decisionId = this._generateId(ctx, timestamp);

    // ===== Layer 1: Boundary Check =====
    const layer1Result = this._layer1.check(ctx);
    reasoning.push(`[Layer1] ${layer1Result.decision}: ${layer1Result.reason}`);

    // Short-circuit: BLOCK from Layer 1
    if (layer1Result.decision === 'BLOCK') {
      return this._buildResult({
        decisionId,
        timestamp,
        ctx,
        layer1: layer1Result,
        layer2: null,
        layer3: null,
        finalDecision: 'BLOCK',
        reasoning,
      });
    }

    // Short-circuit: AUTONOMOUS from Layer 1 (read-only operations)
    if (layer1Result.decision === 'AUTONOMOUS') {
      return this._buildResult({
        decisionId,
        timestamp,
        ctx,
        layer1: layer1Result,
        layer2: null,
        layer3: null,
        finalDecision: 'ACT_AUTONOMOUSLY',
        reasoning,
      });
    }

    // ===== Layer 2: Confidence Score (only for PASS from Layer 1) =====
    const layer2Result = this._layer2.score(ctx);
    reasoning.push(
      `[Layer2] score=${layer2Result.score.toFixed(4)}, threshold=${layer2Result.threshold}: ${layer2Result.decision}`
    );

    // Short-circuit: ESCALATE from Layer 2 (below threshold)
    if (layer2Result.decision === 'ESCALATE') {
      return this._buildResult({
        decisionId,
        timestamp,
        ctx,
        layer1: layer1Result,
        layer2: layer2Result,
        layer3: null,
        finalDecision: 'ASK_USER',
        reasoning,
      });
    }

    // ===== Layer 3: Emergency Fallback State Check =====
    const layer3State = this._layer3.getState();
    const layer3Result = {
      state: layer3State.state,
      consecutive_failures: layer3State.consecutive_failures,
    };
    reasoning.push(
      `[Layer3] state=${layer3State.state}, consecutive_failures=${layer3State.consecutive_failures}`
    );

    // ABORT state from Layer 3
    if (layer3State.state === 'ABORT') {
      const finalDecision = this._isCriticalOperation(ctx)
        ? 'HALT_AND_NOTIFY'
        : 'BLOCK';
      reasoning.push(`[Layer3] ABORT state -> ${finalDecision}`);
      return this._buildResult({
        decisionId,
        timestamp,
        ctx,
        layer1: layer1Result,
        layer2: layer2Result,
        layer3: layer3Result,
        finalDecision,
        reasoning,
      });
    }

    // DEGRADED/ESCALATE state -> prefer ASK_USER over ACT_AUTONOMOUSLY
    if (layer3State.state === 'ESCALATE') {
      reasoning.push('[Layer3] ESCALATE state -> ASK_USER');
      return this._buildResult({
        decisionId,
        timestamp,
        ctx,
        layer1: layer1Result,
        layer2: layer2Result,
        layer3: layer3Result,
        finalDecision: 'ASK_USER',
        reasoning,
      });
    }

    // NOMINAL or DEGRADED (Layer 2 above threshold) -> ACT_AUTONOMOUSLY
    reasoning.push('[Layer3] NOMINAL/DEGRADED with Layer2 above threshold -> ACT_AUTONOMOUSLY');
    return this._buildResult({
      decisionId,
      timestamp,
      ctx,
      layer1: layer1Result,
      layer2: layer2Result,
      layer3: layer3Result,
      finalDecision: 'ACT_AUTONOMOUSLY',
      reasoning,
    });
  }

  /**
   * Record decision outcome for Layer 3 escalation tracking.
   * @param {boolean} success — true if decision outcome was successful
   */
  recordOutcome(success) {
    if (success) {
      this._layer3.recordSuccess();
    } else {
      this._layer3.recordFailure();
    }
  }

  /**
   * Reset Layer 3 state (for manual recovery).
   */
  resetFallback() {
    this._layer3.reset();
  }

  // --- private ---

  _generateId(ctx, timestamp) {
    // Deterministic ID: counter + timestamp ms + action hash (no random UUID)
    const actionHash = crypto
      .createHash('sha256')
      .update(ctx.action || '')
      .digest('hex')
      .slice(0, 8);
    this._decisionCounter++;
    return `deci_${this._decisionCounter}_${Date.now()}_${actionHash}`;
  }

  _buildResult({ decisionId, timestamp, ctx, layer1, layer2, layer3, finalDecision, reasoning }) {
    const result = {
      decision_id: decisionId,
      timestamp,
      situation: ctx.situation,
      layer1: {
        decision: layer1.decision,
        reason: layer1.reason,
        matchedRule: layer1.matchedRule,
      },
      final_decision: finalDecision,
      reasoning,
    };

    if (layer2 !== null) {
      result.layer2 = {
        score: layer2.score,
        threshold: layer2.threshold,
        decision: layer2.decision,
        dimensions: layer2.dimensions,
      };
    }

    if (layer3 !== null) {
      result.layer3 = {
        state: layer3.state,
        consecutive_failures: layer3.consecutive_failures,
      };
    }

    return result;
  }

  /**
   * Determine if an operation is critical (cannot be BLOCKed, only HALT_AND_NOTIFY).
   * @param {DecisionContext} ctx
   * @returns {boolean}
   */
  _isCriticalOperation(ctx) {
    // Critical = operations that if BLOCKed would prevent any recovery
    const criticalTypes = ['evolution', 'heartbeat', 'alignment-check'];
    return criticalTypes.includes(ctx.decisionType);
  }
}

module.exports = SoulDecisionEngine;
