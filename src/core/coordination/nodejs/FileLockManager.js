/**
 * File Lock Manager - 防止并发CLI之间的文件冲突
 * 使用文件锁确保同一时间只有一个CLI可以修改特定文件
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileLockManager {
  constructor(options = {}) {
    this.workDir = options.workDir || process.cwd();
    this.lockDir = path.join(this.workDir, '.stigmergy', 'locks');
    this.locks = new Map();  // 内存中的锁状态
    this.lockTimeout = options.lockTimeout || 300000;  // 默认5分钟超时

    this._ensureLockDir();
  }

  /**
   * 确保锁目录存在
   */
  _ensureLockDir() {
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  /**
   * 生成锁文件路径
   */
  _getLockPath(filePath) {
    // 使用文件路径的哈希作为锁文件名
    const hash = crypto.createHash('sha256').update(filePath).digest('hex');
    return path.join(this.lockDir, `${hash}.lock`);
  }

  /**
   * 尝试获取文件锁
   * @returns {boolean} 是否成功获取锁
   */
  acquireLock(filePath, cliName) {
    const lockPath = this._getLockPath(filePath);
    const now = Date.now();

    // 检查内存中的锁
    if (this.locks.has(filePath)) {
      const lock = this.locks.get(filePath);

      // 检查锁是否超时
      if (now - lock.timestamp < this.lockTimeout) {
        console.warn(`[LOCK] File already locked: ${filePath} by ${lock.cliName}`);
        return false;
      } else {
        // 锁已超时，释放它
        this.releaseLock(filePath, lock.cliName);
      }
    }

    // 创建锁文件
    try {
      const lockData = {
        filePath,
        cliName,
        acquiredAt: now,
        pid: process.pid
      };

      fs.writeFileSync(lockPath, JSON.stringify(lockData), 'utf8');

      // 记录到内存
      this.locks.set(filePath, {
        cliName,
        timestamp: now,
        lockPath
      });

      console.log(`[LOCK] Acquired by ${cliName}: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`[LOCK] Failed to acquire lock for ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * 释放文件锁
   */
  releaseLock(filePath, cliName) {
    const lockPath = this._getLockPath(filePath);

    // 检查是否是持有者
    if (this.locks.has(filePath)) {
      const lock = this.locks.get(filePath);

      if (lock.cliName !== cliName) {
        console.warn(`[LOCK] ${cliName} cannot release lock held by ${lock.cliName} for ${filePath}`);
        return false;
      }

      // 删除锁文件
      try {
        if (fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
        }

        this.locks.delete(filePath);
        console.log(`[LOCK] Released by ${cliName}: ${filePath}`);
        return true;
      } catch (error) {
        console.error(`[LOCK] Failed to release lock for ${filePath}:`, error.message);
        return false;
      }
    }

    return false;
  }

  /**
   * 检查文件是否被锁定
   */
  isLocked(filePath) {
    if (this.locks.has(filePath)) {
      const lock = this.locks.get(filePath);
      const now = Date.now();

      // 检查是否超时
      if (now - lock.timestamp < this.lockTimeout) {
        return true;
      } else {
        // 清理过期锁
        this.releaseLock(filePath, lock.cliName);
        return false;
      }
    }

    return false;
  }

  /**
   * 获取文件的锁定者
   */
  getLockHolder(filePath) {
    if (this.locks.has(filePath)) {
      const lock = this.locks.get(filePath);
      return lock.cliName;
    }
    return null;
  }

  /**
   * 清理所有锁（紧急情况）
   */
  releaseAllLocks() {
    console.log(`[LOCK] Releasing all locks (${this.locks.size} files)...`);

    for (const [filePath, lock] of this.locks.entries()) {
      try {
        if (fs.existsSync(lock.lockPath)) {
          fs.unlinkSync(lock.lockPath);
        }
      } catch (error) {
        console.error(`[LOCK] Failed to remove lock file: ${lock.lockPath}`);
      }
    }

    this.locks.clear();
    console.log('[LOCK] All locks released');
  }

  /**
   * 清理过期的锁
   */
  cleanupExpiredLocks() {
    const now = Date.now();
    const expired = [];

    for (const [filePath, lock] of this.locks.entries()) {
      if (now - lock.timestamp >= this.lockTimeout) {
        expired.push({ filePath, lock });
      }
    }

    if (expired.length > 0) {
      console.log(`[LOCK] Cleaning up ${expired.length} expired locks...`);

      expired.forEach(({ filePath, lock }) => {
        try {
          if (fs.existsSync(lock.lockPath)) {
            fs.unlinkSync(lock.lockPath);
          }
          this.locks.delete(filePath);
          console.log(`[LOCK] Cleaned expired lock: ${filePath} (held by ${lock.cliName})`);
        } catch (error) {
          console.error(`[LOCK] Failed to clean lock: ${filePath}`);
        }
      });
    }

    return expired.length;
  }

  /**
   * 获取锁状态
   */
  getStatus() {
    const locks = [];
    for (const [filePath, lock] of this.locks.entries()) {
      locks.push({
        filePath,
        cliName: lock.cliName,
        heldFor: Date.now() - lock.timestamp
      });
    }

    return {
      totalLocks: this.locks.size,
      locks: locks,
      lockTimeout: this.lockTimeout
    };
  }

  /**
   * 等待锁（带超时）
   */
  async waitForLock(filePath, cliName, timeout = 10000) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const tryAcquire = () => {
        if (this.acquireLock(filePath, cliName)) {
          resolve(true);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout waiting for lock: ${filePath}`));
        } else {
          // 100ms后重试
          setTimeout(tryAcquire, 100);
        }
      };

      tryAcquire();
    });
  }
}

module.exports = FileLockManager;
