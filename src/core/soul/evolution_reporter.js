/**
 * EvolutionReporter - 自动化进化报告
 * 分析evolution-log.jsonl生成健康趋势和失败模式报告
 */

const path = require('path');
const fs = require('fs').promises;

class EvolutionReporter {
  /**
   * 初始化报告器
   */
  constructor(options = {}) {
    const os = require('os');
    const defaultLogPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'evolution-log.jsonl');
    const defaultReportPath = path.join(os.homedir(), '.stigmergy', 'soul-global', 'reports');

    if (options.logPath) {
      const statSync = require('fs').statSync;
      try {
        const stat = statSync(options.logPath);
        this.logPath = stat.isDirectory() ? path.join(options.logPath, 'evolution-log.jsonl') : options.logPath;
      } catch {
        this.logPath = options.logPath;
      }
    } else {
      this.logPath = defaultLogPath;
    }

    this.reportPath = options.reportPath || defaultReportPath;
  }

  /**
   * 生成进化报告
   */
  async generateReport() {
    const logs = await this._loadLogs();

    const totalIterations = logs.length;
    const successfulIterations = logs.filter(l => l.result && l.result.success).length;
    const failedIterations = logs.filter(l => l.result && !l.result.success).length;
    const successRate = totalIterations > 0 ? (successfulIterations / totalIterations * 100).toFixed(1) : 0;

    const healthTrend = await this.getHealthTrend();
    const failurePatterns = await this.detectFailurePatterns();

    return {
      generatedAt: new Date().toISOString(),
      totalIterations,
      successfulIterations,
      failedIterations,
      successRate: parseFloat(successRate),
      healthTrend,
      failurePatterns,
      recentEvolutions: logs.slice(-5).map(l => ({
        iteration: l.iteration,
        strategy: l.strategy,
        success: l.result?.success,
        timestamp: l.timestamp
      }))
    };
  }

  /**
   * 获取健康趋势
   */
  async getHealthTrend() {
    const logs = await this._loadLogs();

    return logs
      .filter(l => l.result && l.result.healthScore !== undefined)
      .map(l => ({
        iteration: l.iteration,
        healthScore: l.result.healthScore,
        timestamp: l.timestamp
      }));
  }

  /**
   * 检测失败模式
   */
  async detectFailurePatterns() {
    const logs = await this._loadLogs();
    const failures = logs.filter(l => l.result && !l.result.success);

    const patterns = [];

    // 检测连续失败
    let consecutiveFailures = 0;
    let maxConsecutive = 0;
    let currentStrategy = null;

    for (const log of logs) {
      if (log.result && !log.result.success) {
        if (currentStrategy === log.strategy) {
          consecutiveFailures++;
        } else {
          currentStrategy = log.strategy;
          consecutiveFailures = 1;
        }
        maxConsecutive = Math.max(maxConsecutive, consecutiveFailures);
      } else {
        consecutiveFailures = 0;
        currentStrategy = null;
      }
    }

    if (maxConsecutive >= 10) {
      patterns.push({
        type: 'consecutive_failures',
        count: maxConsecutive,
        severity: 'critical',
        message: `检测到连续${maxConsecutive}次失败，建议熔断`
      });
    }

    // 检测策略失败率
    const strategyStats = {};
    for (const log of failures) {
      const strategy = log.strategy || 'unknown';
      strategyStats[strategy] = (strategyStats[strategy] || 0) + 1;
    }

    for (const [strategy, count] of Object.entries(strategyStats)) {
      const total = logs.filter(l => l.strategy === strategy).length;
      const failRate = total > 0 ? (count / total * 100).toFixed(1) : 0;

      if (parseFloat(failRate) > 50) {
        patterns.push({
          type: 'strategy_failure_rate',
          strategy,
          failureRate: parseFloat(failRate),
          totalAttempts: total,
          severity: failRate > 90 ? 'critical' : 'warning',
          message: `策略"${strategy}"失败率${failRate}% (${count}/${total})`
        });
      }
    }

    return patterns;
  }

  /**
   * 保存报告到文件
   */
  async saveReport(report) {
    await fs.mkdir(this.reportPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.reportPath, `evolution-report-${timestamp}.json`);

    await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
    return filePath;
  }

  // 私有方法

  async _loadLogs() {
    const exists = await this._fileExists(this.logPath);
    if (!exists) return [];

    const content = await fs.readFile(this.logPath, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
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

module.exports = EvolutionReporter;
