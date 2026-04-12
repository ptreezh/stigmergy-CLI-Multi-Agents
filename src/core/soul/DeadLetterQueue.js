/**
 * Dead Letter Queue - Persistent DLQ for failed evolution tasks
 *
 * Persists classified errors as JSONL append-only file.
 * Replay filters recoverable (ProcessError) entries and retries via handler.
 * Rotation when file exceeds 5MB.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_DLQ_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.stigmergy',
  'soul-state',
  'evolution-dlq.jsonl'
);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

class DeadLetterQueue {
  constructor(options = {}) {
    this.dlqPath = options.dlqPath || DEFAULT_DLQ_PATH;
    this._ensureDir();
  }

  _ensureDir() {
    const dir = path.dirname(this.dlqPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Append a classified error to the DLQ.
   * @param {Error} error — instanceof PreconditionError|ProcessError|ValidationError
   * @param {Object} context — additional metadata (operation, file, etc.)
   */
  push(error, context = {}) {
    const entry = {
      id: crypto.randomUUID(),
      errorType: error.name,
      message: error.message,
      context: { ...error.context, ...context },
      stack: error.stack,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.dlqPath, line, 'utf8');
    this._rotateIfNeeded();
  }

  /**
   * Read all DLQ entries.
   * @returns {Array<Object>}
   */
  readAll() {
    if (!fs.existsSync(this.dlqPath)) return [];
    const raw = fs.readFileSync(this.dlqPath, 'utf8');
    return raw.split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    }).filter(Boolean);
  }

  /**
   * Replay recoverable entries (ProcessError only).
   * @param {Function} handler — async (entry) => boolean (true = resolved, remove from DLQ)
   */
  async replay(handler) {
    const entries = this.readAll();
    const remaining = [];
    for (const entry of entries) {
      if (entry.errorType === 'ProcessError') {
        const resolved = await handler(entry).catch(() => false);
        if (!resolved) {
          entry.retryCount++;
          remaining.push(entry);
        }
        // else: resolved — drop from DLQ
      } else {
        // Non-recoverable — keep in DLQ as-is
        remaining.push(entry);
      }
    }
    this._rewrite(remaining);
  }

  _rotateIfNeeded() {
    try {
      const stats = fs.statSync(this.dlqPath);
      if (stats.size > MAX_FILE_SIZE) {
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const rotated = this.dlqPath.replace('.jsonl', `-${date}-1.jsonl`);
        fs.renameSync(this.dlqPath, rotated);
      }
    } catch { /* ignore — file may not exist yet */ }
  }

  _rewrite(entries) {
    // Atomic: write to tmp, then rename
    const tmp = this.dlqPath + '.tmp';
    const content = entries.map(e => JSON.stringify(e)).join('\n') + '\n';
    fs.writeFileSync(tmp, content, 'utf8');
    fs.renameSync(tmp, this.dlqPath);
  }
}

module.exports = DeadLetterQueue;
