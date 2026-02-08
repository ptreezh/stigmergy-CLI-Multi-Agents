#!/usr/bin/env node
/**
 * Simple File Lock Implementation
 * For coordinating concurrent access to shared files
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class FileLock {
  constructor(options = {}) {
    this.lockDir = options.lockDir || path.join(os.tmpdir(), "stigmergy-locks");
    this.timeout = options.timeout || 5000;
    this.retryInterval = options.retryInterval || 50;

    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  _getLockPath(filePath) {
    const normalized = path.normalize(filePath);
    const hash = require("crypto")
      .createHash("md5")
      .update(normalized)
      .digest("hex");
    return path.join(this.lockDir, `${hash}.lock`);
  }

  acquire(filePath) {
    const lockPath = this._getLockPath(filePath);
    const startTime = Date.now();

    while (Date.now() - startTime < this.timeout) {
      try {
        fs.mkdirSync(lockPath, { recursive: true });
        return true;
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
        const { sleep } = require("../utils");
        sleep(this.retryInterval);
      }
    }

    throw new Error(`Lock timeout for ${filePath}`);
  }

  release(filePath) {
    const lockPath = this._getLockPath(filePath);
    try {
      fs.rmdirSync(lockPath);
    } catch (e) {
      // Ignore errors
    }
  }

  async withLock(filePath, fn) {
    this.acquire(filePath);
    try {
      return await fn();
    } finally {
      this.release(filePath);
    }
  }
}

module.exports = FileLock;
