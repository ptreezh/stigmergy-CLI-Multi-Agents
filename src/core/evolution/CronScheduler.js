/**
 * CronScheduler - 定时进化计划器
 *
 * 核心功能：
 * 1. 基于 cron 表达式的定时触发
 * 2. 智能时间窗口 (夜间30分钟/白天4小时)
 * 3. 与 EvolveLoop 集成实现持续自动迭代
 * 4. 支持暂停/恢复/手动触发
 */

const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

class CronScheduler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.evolveLoop = options.evolveLoop; // 进化循环实例

    // 定时配置
    this.config = {
      // Cron 表达式 (默认: 每天 0点和12点)
      cronExpression: options.cronExpression || "0 0,12 * * *",

      // 智能时间窗口
      smartSchedule: options.smartSchedule !== false,
      nightStart: options.nightStart || 23, // 夜间开始 (23:00)
      nightEnd: options.nightEnd || 7, // 夜间结束 (07:00)
      nightIntervalMs: options.nightIntervalMs || 30 * 60 * 1000, // 夜间30分钟
      dayIntervalMs: options.dayIntervalMs || 4 * 60 * 60 * 1000, // 白天4小时

      // 报告配置
      reportEnabled: options.reportEnabled !== false,
      reportTime: options.reportTime || "09:00", // 每天9点报告

      // 状态文件
      stateFile:
        options.stateFile ||
        path.join(
          require("os").homedir(),
          ".stigmergy",
          "soul-state",
          "scheduler-state.json",
        ),

      ...options,
    };

    // 状态
    this.isRunning = false;
    this.currentMode = "day"; // 'day' or 'night'
    this.nextEvolveTime = null;
    this.nextReportTime = null;
    this.lastEvolveTime = null;
    this.scheduleLog = [];

    // 定时器
    this.timers = {
      evolve: null,
      report: null,
      modeCheck: null,
    };

    // 加载状态
    this._loadState();
  }

  /**
   * 启动定时调度器
   */
  start() {
    if (this.isRunning) {
      console.log("[CronScheduler] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[CronScheduler] 🚀 Starting scheduler...");

    // 确定当前模式
    this._updateMode();

    // 调度进化
    this._scheduleEvolve();

    // 调度报告
    if (this.config.reportEnabled) {
      this._scheduleReport();
    }

    // 定期检查模式变化
    this._scheduleModeCheck();

    console.log(`[CronScheduler]   Mode: ${this.currentMode}`);
    console.log(
      `[CronScheduler]   Next evolve: ${this.nextEvolveTime?.toLocaleString()}`,
    );

    // 立即触发一次进化
    this._triggerEvolveNow();

    // 保存状态
    this._saveState();
  }

  /**
   * 停止定时调度器
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // 清除所有定时器
    for (const [name, timer] of Object.entries(this.timers)) {
      if (timer) {
        clearTimeout(timer);
        this.timers[name] = null;
      }
    }

    console.log("[CronScheduler] ⏹ Stopped");
    this._saveState();
  }

  /**
   * 手动触发立即进化
   */
  async triggerNow() {
    console.log("[CronScheduler] 🔥 Manual trigger");
    return this._triggerEvolveNow();
  }

  /**
   * 立即触发进化
   * @private
   */
  async _triggerEvolveNow() {
    if (!this.evolveLoop?.start) {
      console.warn("[CronScheduler] No evolveLoop instance");
      return { success: false, error: "no_evolve_loop" };
    }

    try {
      console.log("[CronScheduler] 🚀 Triggering evolution now...");

      // 如果已经在运行，触发一次新的
      if (this.evolveLoop.isRunning) {
        // 触发额外的一次
        await this.evolveLoop._triggerEvolve();
      } else {
        // 启动进化循环
        await this.evolveLoop.start();
      }

      this.lastEvolveTime = new Date().toISOString();
      this._log("evolve", "manual");

      this.emit("evolveTriggered", { timestamp: this.lastEvolveTime });

      return { success: true, timestamp: this.lastEvolveTime };
    } catch (error) {
      console.error(`[CronScheduler] Trigger failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 调度进化
   * @private
   */
  _scheduleEvolve() {
    const intervalMs =
      this.currentMode === "night"
        ? this.config.nightIntervalMs
        : this.config.dayIntervalMs;

    // 计算下次进化时间
    this.nextEvolveTime = new Date(Date.now() + intervalMs);

    console.log(
      `[CronScheduler] ⏰ Scheduling evolve in ${intervalMs / 1000 / 60} minutes`,
    );

    this.timers.evolve = setTimeout(() => {
      if (!this.isRunning) return;

      // 触发进化
      this._triggerEvolveNow();

      // 更新模式
      this._updateMode();

      // 继续调度
      this._scheduleEvolve();
    }, intervalMs);
  }

  /**
   * 调度报告
   * @private
   */
  _scheduleReport() {
    const [hour, minute] = this.config.reportTime.split(":").map(Number);
    const now = new Date();
    let reportTime = new Date(now);
    reportTime.setHours(hour, minute, 0, 0);

    // 如果已过今天的时间，设置到明天
    if (reportTime <= now) {
      reportTime.setDate(reportTime.getDate() + 1);
    }

    const delay = reportTime - now;
    this.nextReportTime = reportTime;

    console.log(
      `[CronScheduler] 📊 Next report: ${reportTime.toLocaleString()}`,
    );

    this.timers.report = setTimeout(() => {
      if (!this.isRunning) return;

      this._generateReport();

      // 继续调度明天的报告
      this._scheduleReport();
    }, delay);
  }

  /**
   * 定期检查模式变化
   * @private
   */
  _scheduleModeCheck() {
    // 每小时检查一次
    this.timers.modeCheck = setTimeout(
      () => {
        if (!this.isRunning) return;

        const oldMode = this.currentMode;
        this._updateMode();

        if (oldMode !== this.currentMode) {
          console.log(
            `[CronScheduler] 🌙 Mode changed: ${oldMode} → ${this.currentMode}`,
          );

          // 模式变化时重新调度进化
          if (this.timers.evolve) {
            clearTimeout(this.timers.evolve);
            this._scheduleEvolve();
          }

          this.emit("modeChanged", { from: oldMode, to: this.currentMode });
        }

        // 继续检查
        this._scheduleModeCheck();
      },
      60 * 60 * 1000,
    ); // 1小时
  }

  /**
   * 更新当前模式 (白天/夜间)
   * @private
   */
  _updateMode() {
    if (!this.config.smartSchedule) {
      this.currentMode = "day";
      return;
    }

    const hour = new Date().getHours();

    if (hour >= this.config.nightStart || hour < this.config.nightEnd) {
      this.currentMode = "night";
    } else {
      this.currentMode = "day";
    }
  }

  /**
   * 生成报告
   * @private
   */
  _generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      nextEvolve: this.nextEvolveTime?.toISOString(),
      lastEvolve: this.lastEvolveTime,
      totalEvolutions: this.evolveLoop?.totalEvolutions || 0,
      historyLength: this.evolveLoop?.history?.length || 0,
    };

    console.log("\n" + "=".repeat(50));
    console.log("[CronScheduler] 📊 Evolution Report");
    console.log("=".repeat(50));
    console.log(`  Mode: ${report.mode}`);
    console.log(`  Total evolutions: ${report.totalEvolutions}`);
    console.log(`  Last evolution: ${report.lastEvolve || "none"}`);
    console.log(`  Next evolve: ${report.nextEvolve || "N/A"}`);
    console.log("=".repeat(50) + "\n");

    // 写入报告文件
    this._writeReport(report);

    this.emit("reportGenerated", report);

    return report;
  }

  /**
   * 写入报告文件
   * @private
   */
  _writeReport(report) {
    try {
      const reportDir = path.dirname(this.config.stateFile);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const reportPath = path.join(reportDir, "reports", `${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    } catch (e) {
      console.warn(`[CronScheduler] Failed to write report: ${e.message}`);
    }
  }

  /**
   * 记录日志
   * @private
   */
  _log(type, trigger) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      trigger,
      mode: this.currentMode,
    };

    this.scheduleLog.push(entry);

    // 只保留最近100条
    if (this.scheduleLog.length > 100) {
      this.scheduleLog = this.scheduleLog.slice(-100);
    }

    this._saveState();
  }

  /**
   * 加载状态
   * @private
   */
  _loadState() {
    try {
      if (fs.existsSync(this.config.stateFile)) {
        const data = JSON.parse(fs.readFileSync(this.config.stateFile, "utf8"));
        this.lastEvolveTime = data.lastEvolveTime;
        this.scheduleLog = data.scheduleLog || [];
        console.log("[CronScheduler] State loaded");
      }
    } catch (e) {
      // 忽略错误
    }
  }

  /**
   * 保存状态
   * @private
   */
  _saveState() {
    try {
      const stateDir = path.dirname(this.config.stateFile);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }

      fs.writeFileSync(
        this.config.stateFile,
        JSON.stringify(
          {
            lastEvolveTime: this.lastEvolveTime,
            scheduleLog: this.scheduleLog,
            updatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    } catch (e) {
      console.warn(`[CronScheduler] Failed to save state: ${e.message}`);
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentMode: this.currentMode,
      nextEvolveTime: this.nextEvolveTime?.toISOString(),
      nextReportTime: this.nextReportTime?.toISOString(),
      lastEvolveTime: this.lastEvolveTime,
      config: {
        smartSchedule: this.config.smartSchedule,
        nightIntervalMs: this.config.nightIntervalMs,
        dayIntervalMs: this.config.dayIntervalMs,
      },
    };
  }
}

module.exports = { CronScheduler };
