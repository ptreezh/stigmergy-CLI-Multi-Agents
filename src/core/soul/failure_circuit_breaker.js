/**
 * FailureCircuitBreaker - 失败熔断器
 * 连续失败达到阈值时自动熔断，避免重复无效迭代
 */

const path = require('path');
const fs = require('fs').promises;

class FailureCircuitBreaker {
  /**
   * 初始化熔断器
   */
  constructor(options = {}) {
    const os = require('os');
    const defaultPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'circuit_breaker.json');
    
    if (options.statePath) {
      const statSync = require('fs').statSync;
      try {
        const stat = statSync(options.statePath);
        if (stat.isDirectory()) {
          this.statePath = path.join(options.statePath, 'circuit_breaker.json');
        } else {
          this.statePath = options.statePath;
        }
      } catch {
        this.statePath = options.statePath;
      }
    } else {
      this.statePath = defaultPath;
    }
    
    this.maxConsecutiveFailures = options.maxConsecutiveFailures || 10;
    this.cooldownMs = options.cooldownMs || 30 * 60 * 1000;
    this._state = null;
  }

  /**
   * 记录成功
   */
  async recordSuccess(strategy, context) {
    const state = await this._load();
    const key = this._key(strategy, context);

    if (!state[key]) {
      state[key] = this._defaultState();
    }

    state[key].consecutiveFailures = 0;
    state[key].totalSuccesses++;
    state[key].lastSuccessAt = new Date().toISOString();
    state[key].circuitOpen = false;
    state[key].lastStateChange = new Date().toISOString();

    await this._save(state);
  }

  /**
   * 记录失败
   * @returns {Object} {circuitOpen: boolean} 是否触发熔断
   */
  async recordFailure(strategy, context) {
    const state = await this._load();
    const key = this._key(strategy, context);

    if (!state[key]) {
      state[key] = this._defaultState();
    }

    state[key].consecutiveFailures++;
    state[key].totalFailures++;
    state[key].lastFailureAt = new Date().toISOString();

    // 检查是否达到熔断阈值
    const circuitOpen = state[key].consecutiveFailures >= this.maxConsecutiveFailures;
    if (circuitOpen && !state[key].circuitOpen) {
      state[key].circuitOpen = true;
      state[key].circuitOpenedAt = new Date().toISOString();
      state[key].lastStateChange = new Date().toISOString();
    }

    await this._save(state);

    return {
      circuitOpen,
      consecutiveFailures: state[key].consecutiveFailures,
      maxConsecutiveFailures: this.maxConsecutiveFailures
    };
  }

  /**
   * 检查是否应该执行
   */
  async shouldExecute(strategy, context) {
    const state = await this._load();
    const key = this._key(strategy, context);

    if (!state[key]) {
      return true;
    }

    const stats = state[key];

    // 熔断未开启
    if (!stats.circuitOpen) {
      return true;
    }

    // 检查是否过了冷却期
    const cooldownElapsed = Date.now() - new Date(stats.circuitOpenedAt).getTime() >= this.cooldownMs;

    if (cooldownElapsed) {
      // 冷却期已过，允许半开（尝试一次）
      stats.circuitOpen = false;
      stats.consecutiveFailures = 0;
      stats.lastStateChange = new Date().toISOString();
      await this._save(state);
      return true;
    }

    return false;
  }

  /**
   * 获取统计信息
   */
  async getStats(strategy, context) {
    const state = await this._load();
    const key = context ? this._key(strategy, context) : strategy;

    if (!state[key]) {
      return {
        consecutiveFailures: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        circuitOpen: false
      };
    }

    return state[key];
  }

  /**
   * 重置状态
   */
  async reset(strategy, context) {
    const state = await this._load();
    const key = this._key(strategy, context);

    state[key] = this._defaultState();
    await this._save(state);
  }

  // 私有方法

  _key(strategy, context) {
    return context ? `${strategy}:${context}` : strategy;
  }

  _defaultState() {
    return {
      consecutiveFailures: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      circuitOpen: false,
      circuitOpenedAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastStateChange: new Date().toISOString()
    };
  }

  async _load() {
    if (this._state) return this._state;

    const exists = await this._fileExists(this.statePath);
    if (!exists) {
      this._state = {};
      return this._state;
    }

    const content = await fs.readFile(this.statePath, 'utf-8');
    this._state = JSON.parse(content);
    return this._state;
  }

  async _save(state) {
    const dir = path.dirname(this.statePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.statePath, JSON.stringify(state, null, 2), 'utf-8');
    this._state = state;
  }

  async _fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = FailureCircuitBreaker;
