/**
 * FallbackManager — DECI-06: Consecutive failure escalation levels.
 *
 * Coordinates DECI-05b (FAIL -> escalate) with Layer 3 EmergencyFallback.
 * Maps consecutive failure count to escalation levels with prescribed actions.
 *
 * Escalation levels (per user-locked DECI-06):
 *   NOMINAL  (0 failures)        — continue autonomously
 *   DEGRADED (1-2 failures)      — reduce autonomy, prefer ASK_USER
 *   ESCALATE (3-4 failures)      — most decisions -> ASK_USER
 *   ABORT    (5+ failures)        — BLOCK non-critical, HALT_AND_NOTIFY for critical
 *
 * FallbackManager uses EmergencyFallback for state persistence
 * but adds decision-level policy on top.
 */
const EmergencyFallback = require('./EmergencyFallback');

class FallbackManager {
  constructor() {
    this._fallback = new EmergencyFallback();
  }

  /**
   * Get escalation level and recommended action for current state.
   * @param {string} decisionType — 'critical'|'non_critical' (default: 'non_critical')
   * @returns {{ level: string, shouldEscalate: boolean, action: string, consecutive_failures: number }}
   *
   * Action mapping:
   *   NOMINAL  -> 'ACT_AUTONOMOUSLY'
   *   DEGRADED -> 'ASK_USER' (reduce autonomy)
   *   ESCALATE -> 'ASK_USER' (most decisions escalate)
   *   ABORT(critical)   -> 'HALT_AND_NOTIFY'
   *   ABORT(non_critical) -> 'BLOCK'
   */
  check(decisionType = 'non_critical') {
    const state = this._fallback.getState();
    const { state: level, consecutive_failures } = state;

    const isCritical = decisionType === 'critical';

    let action;
    switch (level) {
      case 'NOMINAL':
        action = 'ACT_AUTONOMOUSLY';
        break;
      case 'DEGRADED':
        action = 'ASK_USER';
        break;
      case 'ESCALATE':
        action = 'ASK_USER';
        break;
      case 'ABORT':
        action = isCritical ? 'HALT_AND_NOTIFY' : 'BLOCK';
        break;
      default:
        action = 'ASK_USER';
    }

    return {
      level,
      shouldEscalate: level !== 'NOMINAL',
      action,
      consecutive_failures,
      total_failures: state.total_failures,
    };
  }

  /**
   * Called when a decision fails — increments failure counter.
   * Coordinates with EmergencyFallback.
   * @returns {{ level: string, consecutive_failures: number }}
   */
  recordFailure() {
    return this._fallback.recordFailure();
  }

  /**
   * Called when a decision succeeds — resets failure counter.
   */
  recordSuccess() {
    this._fallback.recordSuccess();
  }

  /**
   * Manual recovery: reset all counters (operator intervention after ABORT).
   */
  reset() {
    this._fallback.reset();
  }

  /**
   * Get raw consecutive failure count.
   * @returns {number}
   */
  getConsecutiveFailures() {
    return this._fallback.getConsecutiveFailures();
  }
}

module.exports = FallbackManager;
