/**
 * DecisionContext — shared input type for all DECI decision layers.
 * Immutable: constructor sets all fields; no setters or mutators.
 */
class DecisionContext {
  /**
   * @param {Object} opts
   * @param {string} opts.situation — human-readable description of what needs deciding
   * @param {string} opts.action — the proposed action (e.g. "git push --force", "grep -r 'TODO' .")
   * @param {string} opts.operationCategory — one of: destructive | non_destructive | always_safe | unknown
   * @param {number} opts.contextClarity — 0.0-1.0, how clear the input/goal is
   * @param {number} opts.riskLevel — 0.0-1.0, how risky this action is
   * @param {number} opts.taskFamiliarity — 0.0-1.0, how familiar Soul is with this task type
   * @param {number} opts.outcomeHistory — 0.0-1.0, historical success rate for similar decisions
   * @param {number} opts.autonomyBudget — 0.0-1.0, remaining daily autonomous budget
   * @param {string} opts.decisionType — type identifier (e.g. "evolution", "skill-creation", "memory-merge")
   */
  constructor(opts) {
    this.situation = opts.situation || '';
    this.action = opts.action || '';
    this.operationCategory = opts.operationCategory || 'unknown';
    this.contextClarity = this._clamp(opts.contextClarity ?? 0.5);
    this.riskLevel = this._clamp(opts.riskLevel ?? 0.5);
    this.taskFamiliarity = this._clamp(opts.taskFamiliarity ?? 0.5);
    this.outcomeHistory = this._clamp(opts.outcomeHistory ?? 0.5);
    this.autonomyBudget = this._clamp(opts.autonomyBudget ?? 1.0);
    this.decisionType = opts.decisionType || 'unknown';
  }

  _clamp(v) {
    return Math.max(0, Math.min(1, Number(v) || 0));
  }

  /** Return a plain object snapshot (for logging/serialization). */
  toJSON() {
    return {
      situation: this.situation,
      action: this.action,
      operationCategory: this.operationCategory,
      contextClarity: this.contextClarity,
      riskLevel: this.riskLevel,
      taskFamiliarity: this.taskFamiliarity,
      outcomeHistory: this.outcomeHistory,
      autonomyBudget: this.autonomyBudget,
      decisionType: this.decisionType,
    };
  }
}

module.exports = DecisionContext;
