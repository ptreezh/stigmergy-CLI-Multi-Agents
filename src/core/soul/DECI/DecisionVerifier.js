/**
 * DecisionVerifier — DECI Layer 5: Post-execution self-check.
 *
 * After every autonomous action, compare actual outcome vs. expected.
 * Returns PASS / FAIL / UNVERIFIABLE verdict.
 *
 * DECI-05a: PASS / FAIL / UNVERIFIABLE verdict
 * DECI-05b: FAIL -> trigger DECI-06 fallback
 * DECI-05c: Self-check results feed into confidence calibration
 *
 * The verifier stores recent verdict history (last N verdicts) for
 * DECI-05c calibration. SoulDecisionEngine reads this to adjust
 * outcome_history dimension for future decisions of the same type.
 */
const path = require('path');
const fs = require('fs');

const VERDICT_HISTORY_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'verdict-history.json'
);

const MAX_HISTORY = 100;

class DecisionVerifier {
  constructor() {
    this._history = null;
  }

  /**
   * Verify a decision outcome.
   *
   * @param {Object} decision — the decision result from SoulDecisionEngine.decide()
   * @param {Object} outcome — actual outcome { success: boolean, error?: string, details?: any }
   * @param {Object} opts — optional verification parameters
   * @param {boolean} opts.skipVerification — set true if outcome cannot be verified
   * @returns {{ verdict: 'PASS'|'FAIL'|'UNVERIFIABLE', reason: string, decisionId: string }}
   *
   * Verdict rules:
   *   PASS        — decision.result.final_decision === 'ACT_AUTONOMOUSLY' && outcome.success === true
   *   FAIL        — decision.result.final_decision === 'ACT_AUTONOMOUSLY' && outcome.success === false
   *   UNVERIFIABLE — decision.result.final_decision !== 'ACT_AUTONOMOUSLY' (user blocked/asked)
   *                  OR opts.skipVerification === true
   */
  verify(decision, outcome, opts = {}) {
    const decisionId = decision.decision_id;
    const finalDecision = decision.final_decision;

    // UNVERIFIABLE: non-autonomous decisions don't need verification
    if (finalDecision !== 'ACT_AUTONOMOUSLY') {
      return {
        verdict: 'UNVERIFIABLE',
        reason: `Non-autonomous decision (${finalDecision}) — no outcome to verify`,
        decisionId,
      };
    }

    // UNVERIFIABLE: caller flagged as unmeasurable
    if (opts.skipVerification) {
      return {
        verdict: 'UNVERIFIABLE',
        reason: 'Outcome cannot be automatically verified',
        decisionId,
      };
    }

    // PASS / FAIL: autonomous decision with measurable outcome
    if (outcome && outcome.success === true) {
      return {
        verdict: 'PASS',
        reason: 'Expected outcome achieved',
        decisionId,
      };
    }

    // FAIL
    return {
      verdict: 'FAIL',
      reason: outcome && outcome.error
        ? `Expected outcome not achieved: ${outcome.error}`
        : 'Expected outcome not achieved',
      decisionId,
    };
  }

  /**
   * Store verdict in history for DECI-05c calibration.
   * @param {Object} verdict — result from verify()
   * @param {string} decisionType — type identifier (e.g. 'evolution', 'skill-creation')
   */
  recordVerdict(verdict, decisionType) {
    const history = this._loadHistory();
    history.push({
      decisionId: verdict.decisionId,
      verdict: verdict.verdict,
      reason: verdict.reason,
      decisionType: decisionType || 'unknown',
      timestamp: new Date().toISOString(),
    });

    // Keep only last MAX_HISTORY entries
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
    }

    this._saveHistory(history);
  }

  /**
   * Get recent verdict rate for a decision type (for DECI-05c calibration).
   * @param {string} decisionType
   * @param {number} window — number of recent verdicts to consider (default: 20)
   * @returns {{ total: number, passRate: number, verdictCounts: Object } | null}
   */
  getVerdictRate(decisionType, window = 20) {
    const history = this._loadHistory();
    const relevant = history
      .filter(e => e.decisionType === decisionType)
      .slice(-window);

    if (relevant.length === 0) return null;

    const passCount = relevant.filter(e => e.verdict === 'PASS').length;
    return {
      total: relevant.length,
      passRate: Math.round((passCount / relevant.length) * 1000) / 1000,
      verdictCounts: {
        PASS: relevant.filter(e => e.verdict === 'PASS').length,
        FAIL: relevant.filter(e => e.verdict === 'FAIL').length,
        UNVERIFIABLE: relevant.filter(e => e.verdict === 'UNVERIFIABLE').length,
      },
    };
  }

  // --- private ---

  _loadHistory() {
    if (this._history) return this._history;
    try {
      if (fs.existsSync(VERDICT_HISTORY_PATH)) {
        this._history = JSON.parse(fs.readFileSync(VERDICT_HISTORY_PATH, 'utf8'));
      } else {
        this._history = [];
      }
    } catch {
      this._history = [];
    }
    return this._history;
  }

  _saveHistory(history) {
    const dir = path.dirname(VERDICT_HISTORY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VERDICT_HISTORY_PATH, JSON.stringify(history, null, 2), 'utf8');
    this._history = history;
  }
}

module.exports = DecisionVerifier;
