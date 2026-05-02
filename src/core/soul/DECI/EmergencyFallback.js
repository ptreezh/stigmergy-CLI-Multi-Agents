/**
 * EmergencyFallback — DECI Layer 3: Consecutive-failure escalation states.
 *
 * Reads/writes state from .stigmergy/soul-state/fallback-state.json
 * Implements the same JSON state-file pattern as FailureCircuitBreaker
 * (composition, not inheritance — standalone sync fs vs async)
 *
 * States (per user-locked DECI-06):
 *   NOMINAL  (0 failures)         — continue autonomously
 *   DEGRADED (1-2 failures)       — reduce autonomy, prefer ASK_USER
 *   ESCALATE (3-4 failures)      — most decisions -> ASK_USER
 *   ABORT    (5+ failures)        — BLOCK all non-critical, HALT_AND_NOTIFY for critical
 *
 * This class is stateless for queries (getState, getConsecutiveFailures).
 * Mutations happen via recordSuccess() and recordFailure().
 */
const path = require('path');
const fs = require('fs');

const STATE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'fallback-state.json'
);

class EmergencyFallback {
  constructor() {
    this.statePath = STATE_PATH;
    this._state = null; // in-memory cache
  }

  /**
   * Get current escalation state based on consecutive failures.
   * @returns {{ state: 'NOMINAL'|'DEGRADED'|'ESCALATE'|'ABORT', consecutive_failures: number, total_failures: number }}
   */
  getState() {
    const state = this._load();
    const failures = state.consecutiveFailures || 0;

    let escalationState;
    if (failures === 0) {
      escalationState = 'NOMINAL';
    } else if (failures <= 2) {
      escalationState = 'DEGRADED';
    } else if (failures <= 4) {
      escalationState = 'ESCALATE';
    } else {
      escalationState = 'ABORT';
    }

    return {
      state: escalationState,
      consecutive_failures: failures,
      total_failures: state.totalFailures || 0,
    };
  }

  /**
   * Get consecutive failure count.
   * @returns {number}
   */
  getConsecutiveFailures() {
    return this.getState().consecutive_failures;
  }

  /**
   * Record a successful decision outcome.
   * Resets consecutive failure counter.
   */
  recordSuccess() {
    const state = this._load();
    state.consecutiveFailures = 0;
    state.totalSuccesses = (state.totalSuccesses || 0) + 1;
    state.lastSuccessAt = new Date().toISOString();
    state.lastStateChange = new Date().toISOString();
    this._save(state);
  }

  /**
   * Record a failed decision outcome.
   * Increments consecutive failure counter.
   * @returns {{ state: string, consecutive_failures: number, total_failures: number }}
   */
  recordFailure() {
    const state = this._load();
    state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
    state.totalFailures = (state.totalFailures || 0) + 1;
    state.lastFailureAt = new Date().toISOString();
    state.lastStateChange = new Date().toISOString();
    this._save(state);
    return this.getState();
  }

  /**
   * Reset all counters (for recovery after manual intervention).
   */
  reset() {
    this._save({
      consecutiveFailures: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastStateChange: new Date().toISOString(),
    });
  }

  // --- private ---

  _load() {
    if (this._state) return this._state;
    try {
      if (fs.existsSync(this.statePath)) {
        this._state = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      } else {
        this._state = this._defaultState();
      }
    } catch {
      this._state = this._defaultState();
    }
    return this._state;
  }

  _defaultState() {
    return {
      consecutiveFailures: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastStateChange: new Date().toISOString(),
    };
  }

  _save(state) {
    const dir = path.dirname(this.statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf8');
    this._state = state;
  }
}

module.exports = EmergencyFallback;
