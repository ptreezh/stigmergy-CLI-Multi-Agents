/**
 * SoulScheduler - 灵魂调度器
 *
 * 核心功能：
 * 1. 智能调度：夜间30分钟/白天4小时进化
 * 2. 定时对齐检查
 * 3. 定时报告生成
 * 4. 与CLI Hooks/Skills/Subagent集成
 */

const EventEmitter = require("events");

class SoulScheduler extends EventEmitter {
  constructor(options = {}) {
    super();

    this.soulManager = options.soulManager;
    this.intervalHours = options.intervalHours || 24;

    // 调度配置
    this.config = {
      // 夜间配置 (23:00 - 7:00)
      night: {
        start: 23,
        end: 7,
        evolveIntervalMs: 30 * 60 * 1000, // 30分钟
        alignCheckIntervalMs: 15 * 60 * 1000, // 15分钟
      },
      // 白天配置 (7:00 - 23:00)
      day: {
        start: 7,
        end: 23,
        evolveIntervalMs: 4 * 60 * 60 * 1000, // 4小时
        alignCheckIntervalMs: 60 * 60 * 1000, // 1小时
      },
      // 报告配置
      report: {
        enable: true,
        time: "09:00", // 每天早上9点报告
        onEvolveComplete: true, // 每次进化完成报告
      },
      ...options,
    };

    // 定时器
    this.timers = {
      evolve: null,
      alignCheck: null,
      report: null,
      heartbeat: null,
    };

    // 状态
    this.isRunning = false;
    this.currentMode = null; // 'night' or 'day'
    this.nextEvolveTime = null;
    this.nextAlignCheckTime = null;
    this.scheduleLog = [];

    // Hooks集成
    this.hooksAdapter = null;
  }

  /**
   * 启动调度器
   */
  start() {
    if (this.isRunning) {
      console.log("[SoulScheduler] Already running");
      return;
    }

    this.isRunning = true;

    // 确定当前模式
    this._updateMode();

    // 启动各定时任务
    this._scheduleEvolve();
    this._scheduleAlignCheck();
    this._scheduleReport();
    this._startHeartbeat();

    // 立即执行一次对齐检查
    this._runAlignCheck();

    console.log(`[SoulScheduler] 🚀 Started in ${this.currentMode} mode`);
    console.log(
      `[SoulScheduler]   Next evolve: ${this.nextEvolveTime?.toLocaleTimeString()}`,
    );
    console.log(
      `[SoulScheduler]   Next align check: ${this.nextAlignCheckTime?.toLocaleTimeString()}`,
    );
  }

  /**
   * 停止调度器
   */
  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;

    // 清除所有定时器
    for (const [name, timer] of Object.entries(this.timers)) {
      if (timer) {
        clearTimeout(timer);
        this.timers[name] = null;
      }
    }

    console.log("[SoulScheduler] ⏹ Stopped");
  }

  /**
   * 立即触发进化
   */
  async triggerEvolve() {
    console.log("[SoulScheduler] 🔥 Manually triggered evolution");

    this._log("evolve", "manual");

    if (this.soulManager?.learn) {
      const result = await this.soulManager.learn();

      // 发送Hook事件
      this.emit("evolveComplete", {
        timestamp: new Date().toISOString(),
        result,
        mode: this.currentMode,
      });

      // 触发Subagent通知
      await this._notifySubagents("evolve", result);

      return result;
    }

    return null;
  }

  /**
   * 立即触发对齐检查
   */
  async triggerAlignCheck() {
    console.log("[SoulScheduler] 🔍 Running alignment check");

    this._log("alignCheck", "manual");

    if (this.soulManager?.checkAlignment) {
      // 检查最近一次输出（如果有）
      const result = await this.soulManager.checkAlignment("periodic check");

      this.emit("alignCheck", {
        timestamp: new Date().toISOString(),
        result,
        mode: this.currentMode,
      });

      if (!result.aligned) {
        // 触发提醒
        this.emit("alignmentWarning", result);
      }

      return result;
    }

    return null;
  }

  /**
   * 设置Hooks适配器（用于集成到各CLI）
   */
  setHooksAdapter(adapter) {
    this.hooksAdapter = adapter;
    console.log("[SoulScheduler] 🔗 Hooks adapter connected");
  }

  /**
   * 注册到CLI Hook
   */
  async registerToCLI(cliName, cliAdapter) {
    console.log(`[SoulScheduler] Registering to ${cliName}...`);

    // 为CLI添加soul对齐检查hook
    if (cliAdapter?.onResponseGenerated) {
      const originalHandler = cliAdapter.onResponseGenerated.bind(cliAdapter);

      cliAdapter.onResponseGenerated = async (context) => {
        // 先执行原始处理
        const result = await originalHandler(context);

        // 进行对齐检查
        if (this.soulManager?.checkAlignment) {
          const alignment = await this.soulManager.checkAlignment(
            context.response || "",
          );

          if (!alignment.aligned) {
            // 对齐警告
            console.log(
              `[SoulScheduler] ⚠️ ${cliName} alignment warning:`,
              alignment.warnings,
            );

            // 可以选择修改输出或记录警告
            context.alignmentWarning = alignment;
          }
        }

        return result;
      };
    }

    // 为CLI添加技能调用hook
    if (cliAdapter?.onSkillInvoked) {
      const originalHandler = cliAdapter.onSkillInvoked.bind(cliAdapter);

      cliAdapter.onSkillInvoked = async (context) => {
        // 记录技能调用
        this._log("skill", context.skillName);

        // 检查是否是与soul相关的技能
        if (this.soulManager?.knowledgeBase) {
          // 可以在这里更新知识库
        }

        return await originalHandler(context);
      };
    }

    console.log(`[SoulScheduler] ✅ Registered to ${cliName}`);
  }

  /**
   * 更新调度模式（夜间/白天）
   */
  _updateMode() {
    const hour = new Date().getHours();
    const wasMode = this.currentMode;

    if (hour >= this.config.night.start || hour < this.config.night.end) {
      this.currentMode = "night";
    } else {
      this.currentMode = "day";
    }

    if (wasMode && wasMode !== this.currentMode) {
      console.log(
        `[SoulScheduler] 🔄 Mode changed: ${wasMode} → ${this.currentMode}`,
      );
      this._log("modeChange", { from: wasMode, to: this.currentMode });

      // 模式变化时重新调度
      this._reschedule();
    }
  }

  /**
   * 重新调度
   */
  _reschedule() {
    this._scheduleEvolve();
    this._scheduleAlignCheck();
  }

  /**
   * 调度进化任务
   */
  _scheduleEvolve() {
    if (this.timers.evolve) {
      clearTimeout(this.timers.evolve);
    }

    const interval =
      this.currentMode === "night"
        ? this.config.night.evolveIntervalMs
        : this.config.day.evolveIntervalMs;

    // 计算下次执行时间
    this.nextEvolveTime = new Date(Date.now() + interval);

    this.timers.evolve = setTimeout(async () => {
      if (!this.isRunning) return;

      console.log(
        `[SoulScheduler] ⏰ Scheduled evolution triggered (${this.currentMode} mode)`,
      );

      // 执行进化
      await this.triggerEvolve();

      // 更新模式（可能跨夜间/白天）
      this._updateMode();

      // 重新调度
      this._scheduleEvolve();
    }, interval);

    this._log("scheduled", {
      type: "evolve",
      interval: interval / 1000 / 60 + "min",
      mode: this.currentMode,
    });
  }

  /**
   * 调度对齐检查
   */
  _scheduleAlignCheck() {
    if (this.timers.alignCheck) {
      clearTimeout(this.timers.alignCheck);
    }

    const interval =
      this.currentMode === "night"
        ? this.config.night.alignCheckIntervalMs
        : this.config.day.alignCheckIntervalMs;

    this.nextAlignCheckTime = new Date(Date.now() + interval);

    this.timers.alignCheck = setTimeout(async () => {
      if (!this.isRunning) return;

      await this._runAlignCheck();

      this._updateMode();
      this._scheduleAlignCheck();
    }, interval);
  }

  /**
   * 运行对齐检查
   */
  async _runAlignCheck() {
    if (this.soulManager?.alignmentChecker) {
      const result =
        await this.soulManager.alignmentChecker.checkDailyAlignment();

      this._log("alignCheck", result);

      if (result.alignmentRate < 0.7) {
        console.log(
          `[SoulScheduler] ⚠️ Low alignment rate: ${result.alignmentRate * 100}%`,
        );
        this.emit("alignmentWarning", result);
      }
    }
  }

  /**
   * 调度报告
   */
  _scheduleReport() {
    if (!this.config.report.enable) return;

    const now = new Date();
    const [hour, minute] = this.config.report.time.split(":").map(Number);

    const nextReport = new Date(now);
    nextReport.setHours(hour, minute, 0, 0);

    if (nextReport <= now) {
      nextReport.setDate(nextReport.getDate() + 1);
    }

    const delay = nextReport - now;

    this.timers.report = setTimeout(async () => {
      if (!this.isRunning) return;

      // 生成报告
      if (this.soulManager?.skillEvolver) {
        await this.soulManager.skillEvolver.generateReport();
      }

      // 重新调度
      this._scheduleReport();
    }, delay);
  }

  /**
   * 启动心跳（监控模式变化）
   */
  _startHeartbeat() {
    this.timers.heartbeat = setInterval(() => {
      this._updateMode();
    }, 60 * 1000); // 每分钟检查一次
  }

  /**
   * 通知Subagent
   */
  async _notifySubagents(event, data) {
    // 发送事件到已注册的hooks
    if (this.hooksAdapter) {
      // 可以通过hooks通知其他组件
    }

    // 发出事件供其他模块监听
    this.emit("subagentNotify", { event, data });
  }

  /**
   * 记录日志
   */
  _log(type, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      mode: this.currentMode,
      data,
    };

    this.scheduleLog.push(entry);

    // 保持1000条记录
    if (this.scheduleLog.length > 1000) {
      this.scheduleLog = this.scheduleLog.slice(-1000);
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentMode: this.currentMode,
      nextEvolveTime: this.nextEvolveTime,
      nextAlignCheckTime: this.nextAlignCheckTime,
      timersActive: {
        evolve: !!this.timers.evolve,
        alignCheck: !!this.timers.alignCheck,
        report: !!this.timers.report,
        heartbeat: !!this.timers.heartbeat,
      },
      scheduleLogCount: this.scheduleLog.length,
    };
  }

  /**
   * 获取计划日志
   */
  getLog(hours = 24) {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.scheduleLog.filter(
      (e) => new Date(e.timestamp).getTime() > cutoff,
    );
  }
}

module.exports = SoulScheduler;
