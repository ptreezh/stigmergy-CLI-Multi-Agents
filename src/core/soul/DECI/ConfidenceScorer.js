/**
 * ConfidenceScorer — DECI Layer 2: Five-dimension weighted average scorer.
 *
 * Deterministic: same DecisionContext -> same score every time.
 * No randomness, no external calls, no mutable state.
 *
 * Weights (user-locked DECI-02):
 *   task_familiarity  : 0.30 — times this task type completed successfully
 *   outcome_history   : 0.25 — recent decisions for this situation type
 *   risk_level        : 0.20 — inverse of context.riskLevel (higher risk = lower score)
 *   context_clarity   : 0.15 — input completeness score
 *   autonomy_budget   : 0.10 — remaining daily autonomous action budget
 *
 * Threshold: 0.65 (DECI-02a)
 * Below threshold -> ESCALATE (DECI-02b)
 */
const path = require('path');

// Default threshold config
const DEFAULT_THRESHOLD = 0.65;

class ConfidenceScorer {
  /**
   * @param {Object} opts
   * @param {number} opts.threshold — autonomy threshold (default: 0.65)
   */
  constructor(opts = {}) {
    this.threshold = opts.threshold || DEFAULT_THRESHOLD;

    // Weights (deterministic, immutable)
    this._weights = {
      task_familiarity: 0.30,
      outcome_history: 0.25,
      risk_level: 0.20,
      context_clarity: 0.15,
      autonomy_budget: 0.10,
    };

    // Verify weights sum to 1.0 (static sanity check)
    const sum = Object.values(this._weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.0001) {
      throw new Error(`[ConfidenceScorer] Weights must sum to 1.0, got ${sum}`);
    }
  }

  /**
   * Layer 2 confidence score computation.
   * @param {DecisionContext} context — DecisionContext instance with clamped [0,1] fields
   * @returns {{ score: number, dimensions: Object, threshold: number, decision: 'AUTONOMOUS'|'ESCALATE' }}
   */
  score(context) {
    // All dimension values are already [0, 1] from DecisionContext clamping
    // risk_level dimension: invert (high risk -> low score)
    // Formula: score = 1 - context.riskLevel (so high risk = low score contribution)
    const dimensions = {
      task_familiarity: context.taskFamiliarity,
      outcome_history: context.outcomeHistory,
      risk_level: 1 - context.riskLevel, // inverted: high risk = low score
      context_clarity: context.contextClarity,
      autonomy_budget: context.autonomyBudget,
    };

    // Weighted average
    let rawScore = 0;
    for (const [dim, weight] of Object.entries(this._weights)) {
      rawScore += dimensions[dim] * weight;
    }

    // Round to 4 decimal places for clean logging
    const score = Math.round(rawScore * 10000) / 10000;

    const decision = score >= this.threshold ? 'AUTONOMOUS' : 'ESCALATE';

    return {
      score,
      dimensions,
      threshold: this.threshold,
      decision,
    };
  }

  /**
   * Get dimension weights (for debugging/audit).
   * @returns {Object}
   */
  getWeights() {
    return { ...this._weights };
  }
}

module.exports = ConfidenceScorer;
