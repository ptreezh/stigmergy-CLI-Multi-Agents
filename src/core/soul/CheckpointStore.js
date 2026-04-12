/**
 * CheckpointStore - Event-driven checkpointing for evolution timeout
 *
 * Persists evolution cycle progress to .stigmergy/soul-state/evolution-checkpoint.json.
 * Each step calls checkpoint.save(stepId, partialResults) to record progress.
 * checkTimeout() compares elapsed time vs 10-minute threshold.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_CHECKPOINT_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'evolution-checkpoint.json'
);
const EVOLUTION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

class CheckpointStore {
  constructor(options = {}) {
    this.checkpointPath = options.checkpointPath || DEFAULT_CHECKPOINT_PATH;
    this.timeoutMs = options.timeoutMs || EVOLUTION_TIMEOUT_MS;
  }

  /**
   * Begin a new evolution checkpoint.
   * @returns {Object} checkpoint object
   */
  begin() {
    const checkpoint = {
      evolutionId: `evo_${crypto.randomUUID().slice(0, 8)}`,
      startedAt: new Date().toISOString(),
      lastCheckpoint: new Date().toISOString(),
      currentStep: null,
      completedSteps: [],
      partialResults: {},
    };
    this._save(checkpoint);
    return checkpoint;
  }

  /**
   * Save a step checkpoint.
   * @param {string} stepId — unique step identifier
   * @param {Object} partial — partial results from this step
   */
  save(stepId, partial = {}) {
    const checkpoint = this._load();
    if (!checkpoint) return;
    checkpoint.lastCheckpoint = new Date().toISOString();
    checkpoint.currentStep = stepId;
    if (stepId && !checkpoint.completedSteps.includes(stepId)) {
      checkpoint.completedSteps.push(stepId);
    }
    checkpoint.partialResults = { ...checkpoint.partialResults, ...partial };
    this._save(checkpoint);
  }

  /**
   * Check if evolution has exceeded the timeout.
   * @returns {{ timedOut: boolean, elapsedMs: number }}
   */
  checkTimeout() {
    const checkpoint = this._load();
    if (!checkpoint) return { timedOut: false, elapsedMs: 0 };
    const elapsedMs = Date.now() - new Date(checkpoint.startedAt).getTime();
    return { timedOut: elapsedMs > this.timeoutMs, elapsedMs };
  }

  /**
   * Clear checkpoint after evolution completes.
   */
  clear() {
    try { fs.unlinkSync(this.checkpointPath); } catch { /* ignore */ }
  }

  _load() {
    if (!fs.existsSync(this.checkpointPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(this.checkpointPath, 'utf8'));
    } catch {
      return null;
    }
  }

  _save(checkpoint) {
    const dir = path.dirname(this.checkpointPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = this.checkpointPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(checkpoint, null, 2), 'utf8');
    fs.renameSync(tmp, this.checkpointPath);
  }
}

module.exports = CheckpointStore;
