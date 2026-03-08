/**
 * SoulMemoryManager - Soul记忆管理系统
 *
 * 文件结构:
 * ├── soul.md              # 核心身份定义（静态）
 * ├── USER.md              # 服务对象定义
 * ├── AGENTS.md            # 操作规则（行为准则）
 * ├── memory/
 * │   └── YYYY-MM-DD.md    # 每日工作日志
 * ├── MEMORY.md            # 长期记忆（精选经验）
 * ├── LESSONS.md           # 失败教训总结
 * ├── BREAKTHROUGHS.md     # 思维突破记录
 * └── heartbeat-state.json  # 心跳状态
 */

const fs = require("fs");
const path = require("path");

const HOME = process.env.HOME || process.env.USERPROFILE;

class SoulMemoryManager {
  constructor(soulPath) {
    this.soulPath = soulPath;
    this.memoryPath = path.join(soulPath, "memory");
    this.stateFile = path.join(soulPath, "heartbeat-state.json");
    this.state = this._loadState();

    this._ensureDirectories();
  }

  _ensureDirectories() {
    const dirs = [
      this.soulPath,
      this.memoryPath,
      path.join(this.soulPath, ".state"),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  _loadState() {
    if (fs.existsSync(this.stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFile, "utf-8"));
      } catch (e) {
        return this._defaultState();
      }
    }
    return this._defaultState();
  }

  _defaultState() {
    return {
      lastHeartbeat: null,
      consecutiveFailures: 0,
      repeatedStrategies: {},
      behaviorRepetitions: {},
      lastReflection: null,
      breakthroughDetected: false,
      experienceLoop: {
        phase: "idle",
        context: null,
        expected: null,
        result: null,
        analysis: null,
        pattern: null,
        strategy: null,
      },
    };
  }

  _saveState() {
    fs.writeFileSync(
      this.stateFile,
      JSON.stringify(this.state, null, 2),
      "utf-8",
    );
  }

  // ========== 心跳机制 ==========

  /**
   * 心跳 - 每30分钟调用一次
   */
  async heartbeat() {
    const now = new Date().toISOString();
    this.state.lastHeartbeat = now;

    console.log(`\n💓 [Heartbeat] ${now}`);

    // 检查各项任务
    await this._checkMemorySync();
    await this._checkExperienceRecording();
    await this._detectThinkingRuts();
    await this._evaluateBreakthrough();

    // 定时自我反思 (每小时)
    const lastReflection = this.state.lastReflection
      ? new Date(this.state.lastReflection)
      : null;

    if (
      !lastReflection ||
      Date.now() - lastReflection.getTime() > 60 * 60 * 1000
    ) {
      await this._selfReflection();
    }

    this._saveState();

    return this.state;
  }

  // ========== 经验迭代循环 ==========

  /**
   * 记录行动 (开始阶段)
   */
  recordAction(context, expected, risks) {
    this.state.experienceLoop = {
      phase: "action",
      context,
      expected,
      result: null,
      analysis: null,
      pattern: null,
      strategy: null,
      timestamp: new Date().toISOString(),
    };
    this._saveState();
  }

  /**
   * 记录结果 (结果阶段)
   */
  recordResult(actualResult, deviation, unexpected) {
    this.state.experienceLoop.phase = "result";
    this.state.experienceLoop.result = {
      actual: actualResult,
      deviation,
      unexpected,
      timestamp: new Date().toISOString(),
    };
    this._saveState();
  }

  /**
   * 原因分析 (分析阶段)
   */
  recordAnalysis(cause, perspective) {
    this.state.experienceLoop.phase = "analysis";
    this.state.experienceLoop.analysis = {
      cause,
      perspective,
      timestamp: new Date().toISOString(),
    };
    this._saveState();
  }

  /**
   * 模式提炼 (提炼阶段)
   */
  recordPattern(pattern, reusable) {
    this.state.experienceLoop.phase = "pattern";
    this.state.experienceLoop.pattern = {
      pattern,
      reusable,
      timestamp: new Date().toISOString(),
    };

    // 如果是可复用模式，添加到MEMORY.md
    if (reusable) {
      this._addToMemory(pattern);
    }

    this._saveState();
  }

  /**
   * 策略调整 (调整阶段)
   */
  adjustStrategy(oldStrategy, newStrategy, reason) {
    this.state.experienceLoop.phase = "strategy";
    this.state.experienceLoop.strategy = {
      old: oldStrategy,
      new: newStrategy,
      reason,
      timestamp: new Date().toISOString(),
    };
    this._saveState();
  }

  /**
   * 完成一轮迭代
   */
  completeLoop() {
    const loop = this.state.experienceLoop;

    // 记录到每日日志
    this._recordToDailyLog(loop);

    // 重置
    this.state.experienceLoop = {
      phase: "idle",
      context: null,
      expected: null,
      result: null,
      analysis: null,
      pattern: null,
      strategy: null,
    };

    // 检查失败次数
    if (loop.result && loop.result.deviation > 0.5) {
      this.state.consecutiveFailures++;
    } else {
      this.state.consecutiveFailures = 0;
    }

    this._saveState();
  }

  // ========== 思维定势检测 ==========

  /**
   * 检测思维定势
   */
  async _detectThinkingRuts() {
    const { consecutiveFailures, repeatedStrategies, behaviorRepetitions } =
      this.state;

    // 检测连续失败
    if (consecutiveFailures >= 3) {
      console.log(`[RutDetection] ⚠️ 连续失败 ${consecutiveFailures} 次`);
      return this._triggerBreakthrough("consecutive_failures");
    }

    // 检测相同策略失败
    for (const [strategy, count] of Object.entries(repeatedStrategies)) {
      if (count >= 2) {
        console.log(`[RutDetection] ⚠️ 策略 "${strategy}" 失败 ${count} 次`);
        return this._triggerBreakthrough("repeated_strategy");
      }
    }

    // 检测行为重复
    for (const [behavior, count] of Object.entries(behaviorRepetitions)) {
      if (count >= 5) {
        console.log(`[RutDetection] ⚠️ 行为 "${behavior}" 重复 ${count} 次`);
        return this._triggerBreakthrough("behavior_repetition");
      }
    }

    console.log("[RutDetection] ✅ 无思维定势");
    return false;
  }

  /**
   * 触发突破
   */
  async _triggerBreakthrough(triggerType) {
    console.log(`\n🚀 [Breakthrough] 触发: ${triggerType}`);

    this.state.breakthroughDetected = true;

    // 记录到BREAKTHROUGHS.md
    const breakthrough = {
      trigger: triggerType,
      timestamp: new Date().toISOString(),
      state: {
        consecutiveFailures: this.state.consecutiveFailures,
        repeatedStrategies: this.state.repeatedStrategies,
      },
    };

    this._addToBreakthroughs(breakthrough);

    // 清空失败计数，重新开始
    this.state.consecutiveFailures = 0;
    this.state.repeatedStrategies = {};
    this.state.behaviorRepetitions = {};

    this._saveState();

    return breakthrough;
  }

  // ========== 自我反思 ==========

  async _selfReflection() {
    console.log("\n🧠 [SelfReflection] 进行自我反思...");

    const loop = this.state.experienceLoop;

    if (loop.phase === "idle" || !loop.context) {
      console.log("[SelfReflection] 无活动可反思");
      return;
    }

    // 生成反思报告
    const reflection = {
      timestamp: new Date().toISOString(),
      loop,
      insights: this._generateInsights(loop),
      adjustments: this._generateAdjustments(loop),
    };

    // 记录反思
    this._recordReflection(reflection);

    this.state.lastReflection = new Date().toISOString();
    this._saveState();

    return reflection;
  }

  _generateInsights(loop) {
    // 简化版 - 可以接入LLM生成深刻洞察
    const insights = [];

    if (loop.result?.deviation > 0.5) {
      insights.push("预期与实际偏差较大，需要调整策略");
    }

    if (loop.analysis?.cause) {
      insights.push(`根因: ${loop.analysis.cause}`);
    }

    return insights;
  }

  _generateAdjustments(loop) {
    const adjustments = [];

    if (loop.result?.deviation > 0.7) {
      adjustments.push("建议大幅调整方法");
    }

    return adjustments;
  }

  // ========== 记忆管理 ==========

  _checkMemorySync() {
    console.log("[Heartbeat] 检查记忆同步...");
    // 检查各记忆文件是否存在，不存在则创建
  }

  _checkExperienceRecording() {
    console.log("[Heartbeat] 检查经验记录...");
  }

  _evaluateBreakthrough() {
    console.log("[Heartbeat] 评估突破时机...");
  }

  _addToMemory(pattern) {
    const memoryFile = path.join(this.soulPath, "MEMORY.md");
    const entry = `\n## ${new Date().toISOString()}\n${JSON.stringify(pattern, null, 2)}\n`;

    if (fs.existsSync(memoryFile)) {
      fs.appendFileSync(memoryFile, entry);
    } else {
      fs.writeFileSync(memoryFile, `# MEMORY.md - 长期记忆\n${entry}`);
    }
  }

  _addToBreakthroughs(breakthrough) {
    const file = path.join(this.soulPath, "BREAKTHROUGHS.md");
    const entry = `\n## ${breakthrough.timestamp}\n**触发**: ${breakthrough.trigger}\n\n\`\`\`json\n${JSON.stringify(breakthrough, null, 2)}\n\`\`\`\n`;

    if (fs.existsSync(file)) {
      fs.appendFileSync(file, entry);
    } else {
      fs.writeFileSync(file, `# BREAKTHROUGHS.md - 思维突破记录\n${entry}`);
    }
  }

  _recordToDailyLog(loop) {
    const today = new Date().toISOString().split("T")[0];
    const logFile = path.join(this.memoryPath, `${today}.md`);

    const entry = `
## ${new Date().toISOString()}

**阶段**: ${loop.phase}
**上下文**: ${JSON.stringify(loop.context)}
**预期**: ${JSON.stringify(loop.expected)}
**结果**: ${JSON.stringify(loop.result)}
**分析**: ${JSON.stringify(loop.analysis)}
**模式**: ${JSON.stringify(loop.pattern)}
**策略调整**: ${JSON.stringify(loop.strategy)}
`;

    if (fs.existsSync(logFile)) {
      fs.appendFileSync(logFile, entry);
    } else {
      fs.writeFileSync(logFile, `# ${today} - 工作日志\n${entry}`);
    }
  }

  _recordReflection(reflection) {
    const file = path.join(this.soulPath, "LESSONS.md");
    const entry = `
## ${reflection.timestamp}

**洞察**:
${reflection.insights.map((i) => `- ${i}`).join("\n")}

**调整**:
${reflection.adjustments.map((a) => `- ${a}`).join("\n")}
`;

    if (fs.existsSync(file)) {
      fs.appendFileSync(file, entry);
    } else {
      fs.writeFileSync(file, `# LESSONS.md - 失败教训总结\n${entry}`);
    }
  }

  // ========== API ==========

  getState() {
    return this.state;
  }

  getMemoryPath() {
    return this.memoryPath;
  }

  // ========== 30分钟心跳调度器 ==========

  /**
   * 启动30分钟心跳调度器
   */
  startHeartbeat(intervalMs) {
    if (intervalMs === undefined) intervalMs = 30 * 60 * 1000;

    if (this.heartbeatInterval) {
      console.log("[Heartbeat] 心跳调度器已在运行");
      return;
    }

    console.log(`[Heartbeat] 启动30分钟心跳调度器 (间隔: ${intervalMs}ms)`);

    this.heartbeat().then(() => {
      console.log("[Heartbeat] 初始心跳完成");
    });

    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.heartbeat();
        console.log(`[Heartbeat] 周期心跳完成: ${new Date().toISOString()}`);
      } catch (e) {
        console.error("[Heartbeat] 心跳错误:", e.message);
      }
    }, intervalMs);

    this.state.heartbeatStartedAt = new Date().toISOString();
    this.state.heartbeatIntervalMs = intervalMs;
    this._saveState();
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log("[Heartbeat] 心跳调度器已停止");
      this.state.heartbeatStoppedAt = new Date().toISOString();
      this._saveState();
    }
  }

  getHeartbeatStatus() {
    return {
      running: !!this.heartbeatInterval,
      startedAt: this.state.heartbeatStartedAt,
      stoppedAt: this.state.heartbeatStoppedAt,
      intervalMs: this.state.heartbeatIntervalMs || 30 * 60 * 1000,
      lastHeartbeat: this.state.lastHeartbeat,
    };
  }
}

module.exports = SoulMemoryManager;
