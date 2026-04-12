/**
 * DecisionAuditor - Append-only JSONL audit log for Soul decisions
 *
 * Logs every decision to .stigmergy/soul-state/decisions/decisions_YYYY-MM-DD.jsonl.
 * Provides getRecentDecisions(days) and getAutonomyRate(days) queries.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_LOG_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'decisions'
);

class DecisionAuditor {
  constructor(options = {}) {
    this.logDir = options.logDir || DEFAULT_LOG_DIR;
    this._ensureDir();
  }

  _ensureDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  _dateFile() {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return path.join(this.logDir, `decisions_${date}.jsonl`);
  }

  /**
   * Append a decision record to today's audit log.
   * @param {Object} decision — { situation, context, options, selected, confidenceScore, finalDecision, outcome, escalated }
   * @returns {string} decisionId
   */
  log(decision) {
    const entry = {
      decisionId: `dec_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...decision,
    };
    // Append-only: no read-modify-write
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this._dateFile(), line, 'utf8');
    return entry.decisionId;
  }

  /**
   * Query decisions from the last N days.
   * @param {number} days
   * @returns {Array<Object>}
   */
  getRecentDecisions(days = 7) {
    const results = [];
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 86400000).toISOString().slice(0, 10);
      const file = path.join(this.logDir, `decisions_${date}.jsonl`);
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, 'utf8');
      for (const line of raw.split('\n').filter(Boolean)) {
        try { results.push(JSON.parse(line)); }
        catch { /* corrupt line — skip */ }
      }
    }
    return results;
  }

  /**
   * Compute autonomous vs. escalated ratio.
   * @param {number} days
   * @returns {{ autonomous: number, escalated: number, total: number, rate: number } | null}
   */
  getAutonomyRate(days = 7) {
    const decisions = this.getRecentDecisions(days);
    if (decisions.length === 0) return null;
    const autonomous = decisions.filter(
      d => d.finalDecision === 'ACT_AUTONOMOUSLY'
    ).length;
    const escalated = decisions.filter(
      d => d.finalDecision === 'ASK_USER' || d.finalDecision === 'HALT_AND_NOTIFY'
    ).length;
    return {
      autonomous,
      escalated,
      total: decisions.length,
      rate: Math.round((autonomous / decisions.length) * 100) / 100,
    };
  }
}

module.exports = DecisionAuditor;
