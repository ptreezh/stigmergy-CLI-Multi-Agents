#!/usr/bin/env node
/**
 * Evolution Orchestrator - 中央进化编排器
 *
 * 最佳实践：不依赖各CLI原生hook系统，而是作为独立编排器
 * 通过 stigmergy 命令调用各CLI的能力
 *
 * 使用方式：
 *   node EvolveOrchestrator.js start    # 启动守护进程
 *   node EvolveOrchestrator.js trigger   # 触发单次进化
 *   node EvolveOrchestrator.js status   # 查看状态
 *   node EvolveOrchestrator.js stop     # 停止
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn, execSync } = require("child_process");

const CONFIG = {
  // 状态目录
  stateDir: path.join(os.homedir(), ".stigmergy", "soul-state"),
  stateFile: path.join(
    os.homedir(),
    ".stigmergy",
    "soul-state",
    "orchestrator-state.json",
  ),
  logFile: path.join(
    os.homedir(),
    ".stigmergy",
    "soul-state",
    "orchestrator.log",
  ),

  // 进化配置
  schedules: {
    // 夜间 (23:00-07:00): 30分钟
    night: { start: 23, end: 7, intervalMin: 30 },
    // 白天 (07:00-23:00): 4小时
    day: { start: 7, end: 23, intervalMin: 240 },
  },

  // 目标 CLI (用于执行进化任务)
  targetCLIs: ["claude", "qwen", "opencode"],

  // 最小间隔 (毫秒)
  minIntervalMs: 30 * 60 * 1000,
};

class EvolveOrchestrator {
  constructor() {
    this.state = this.loadState();
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * 启动守护进程
   */
  start() {
    if (this.isRunning) {
      console.log("[Orchestrator] Already running");
      return;
    }

    console.log("[Orchestrator] 🚀 Starting evolution orchestrator...");
    this.isRunning = true;
    this.saveState({ status: "running", startedAt: new Date().toISOString() });

    // 立即执行一次
    this.trigger();

    // 设置定时检查
    this.scheduleCheck();

    console.log("[Orchestrator] ✅ Orchestrator started");
    console.log(
      '[Orchestrator] 💡 Use "node EvolveOrchestrator.js status" to monitor',
    );
  }

  /**
   * 停止守护进程
   */
  stop() {
    console.log("[Orchestrator] 🛑 Stopping orchestrator...");
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.saveState({ status: "stopped", stoppedAt: new Date().toISOString() });
    console.log("[Orchestrator] ✅ Orchestrator stopped");
  }

  /**
   * 触发单次进化
   */
  trigger(options = {}) {
    const now = new Date();
    console.log(
      `\n[Orchestrator] 🔄 Trigger evolution at ${now.toISOString()}`,
    );

    try {
      // 1. 检查是否应该执行
      if (!options.force && !this.shouldEvolve(now)) {
        console.log("[Orchestrator] ⏭️ Skipping - not scheduled");
        return { skipped: true, reason: "not_scheduled" };
      }

      // 2. 执行进化流程 - 同步模式确保 CLI 执行完成
      // 关键：必须等待 CLI 完成，否则只是启动了命令而没有真正执行
      const result = this.executeEvolution({ async: false });

      // 3. 记录状态
      this.saveState({
        lastEvolution: now.toISOString(),
        lastResult: result,
      });

      // 4. 记录日志
      this.log({ timestamp: now.toISOString(), result });

      console.log("[Orchestrator] ✅ Evolution triggered successfully");
      return { success: true, result };
    } catch (error) {
      console.error("[Orchestrator] ❌ Evolution failed:", error.message);
      this.log({ timestamp: now.toISOString(), error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * 判断是否应该进化
   */
  shouldEvolve(now) {
    const hour = now.getHours();
    const schedule = this.getCurrentSchedule(hour);

    if (!schedule) {
      return false;
    }

    // 检查距离上次进化的时间
    const lastEvolution = this.state.lastEvolution;
    if (lastEvolution) {
      const lastTime = new Date(lastEvolution).getTime();
      const elapsed = now.getTime() - lastTime;

      if (
        elapsed <
        Math.max(schedule.intervalMin * 60 * 1000, CONFIG.minIntervalMs)
      ) {
        console.log(
          `[Orchestrator] ⏱️ Too soon since last evolution (${Math.round(elapsed / 60000)}min)`,
        );
        return false;
      }
    }

    // 随机触发 (避免每次都执行)
    return Math.random() > 0.3;
  }

  /**
   * 获取当前时间表
   */
  getCurrentSchedule(hour) {
    if (
      hour >= CONFIG.schedules.night.start ||
      hour < CONFIG.schedules.night.end
    ) {
      return CONFIG.schedules.night;
    }
    return CONFIG.schedules.day;
  }

  /**
   * 执行进化流程
   */
  executeEvolution(options = {}) {
    const { async = false } = options;

    const steps = [
      { name: "loadDependencies", fn: () => this.loadDependencies() },
      {
        name: "patternAnalysis",
        fn: () =>
          this.runSubagentTask("two-agent-loop", "分析近期任务执行模式", {
            async,
          }),
      },
      {
        name: "knowledgeExtraction",
        fn: () =>
          this.runSubagentTask("soul-evolution", "从模式中提取知识", { async }),
      },
      {
        name: "skillCreation",
        fn: () =>
          this.runSubagentTask("soul-evolution", "创建或优化技能", { async }),
      },
      {
        name: "verification",
        fn: () =>
          this.runSubagentTask("soul-evolution", "验证技能有效性", { async }),
      },
    ];

    const results = [];

    for (const step of steps) {
      console.log(`[Orchestrator] 📋 Step: ${step.name}`);
      try {
        const result = step.fn();
        results.push({ step: step.name, success: true, result });
      } catch (error) {
        console.error(
          `[Orchestrator] ❌ Step ${step.name} failed:`,
          error.message,
        );
        results.push({ step: step.name, success: false, error: error.message });

        if (step.name === "loadDependencies") {
          break;
        }
      }
    }

    return { steps: results, timestamp: new Date().toISOString() };
  }

  /**
   * 加载依赖
   */
  loadDependencies() {
    const deps = ["two-agent-loop", "soul-evolution"];
    const loaded = [];

    for (const dep of deps) {
      try {
        execSync(`stigmergy skill read ${dep}`, {
          encoding: "utf8",
          timeout: 10000,
          stdio: "pipe",
          shell: true,
        });
        loaded.push(dep);
        console.log(`[Orchestrator] ✅ Loaded: ${dep}`);
      } catch (e) {
        console.warn(`[Orchestrator] ⚠️ Could not load ${dep}`);
      }
    }

    return loaded;
  }

  /**
   * 运行 Subagent 任务 - 通过 stigmergy call 路由到真实 CLI
   * 关键：使用 execSync 而非 spawn，确保 CLI 真正执行
   */
  runSubagentTask(skillName, prompt, options = {}) {
    const { async = false } = options;
    console.log(`[Orchestrator] 🤖 Running with CLI model: ${skillName}`);

    // 关键：使用技能提示词格式，让 CLI 模型理解需要使用的技能
    const fullPrompt = `请使用 ${skillName} 技能完成以下任务：

${prompt}

## 技能说明
读取并应用 ${skillName} 技能的所有指导，执行双agent循环模式进行任务处理。
`;

    // 使用 execSync 同步调用 stigmergy call
    // 这会通过 SmartRouter 路由到合适的 CLI (如 Claude)
    // 然后 CLI 会使用其模型执行任务
    try {
      // 同步执行：等待 CLI 返回结果
      const result = execSync(
        `stigmergy call "${fullPrompt.replace(/"/g, '\\"')}"`,
        {
          encoding: "utf8",
          timeout: async ? 5000 : 300000, // 异步模式快速返回，同步模式等待结果
          shell: true,
        },
      );

      console.log(`[Orchestrator] ✅ CLI completed: ${skillName}`);
      return { output: result.substring(0, 1000), success: true };
    } catch (error) {
      // 如果是异步模式，快速返回
      if (async) {
        console.log(`[Orchestrator] ⏎ Launched async: ${skillName}`);
        return { output: "Launched", success: true, async: true };
      }

      console.error(`[Orchestrator] ❌ CLI failed: ${error.message}`);
      return { error: error.message, success: false };
    }
  }

  /**
   * 定时检查
   */
  scheduleCheck() {
    // 每5分钟检查一次
    this.intervalId = setInterval(
      () => {
        if (this.isRunning) {
          this.trigger();
        }
      },
      5 * 60 * 1000,
    );
  }

  /**
   * 加载状态
   */
  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, "utf8"));
      }
    } catch (e) {
      // ignore
    }
    return { status: "initial", createdAt: new Date().toISOString() };
  }

  /**
   * 保存状态
   */
  saveState(updates) {
    this.state = { ...this.state, ...updates };

    try {
      if (!fs.existsSync(CONFIG.stateDir)) {
        fs.mkdirSync(CONFIG.stateDir, { recursive: true });
      }
      fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.warn("[Orchestrator] Could not save state:", e.message);
    }
  }

  /**
   * 记录日志
   */
  log(entry) {
    try {
      if (!fs.existsSync(CONFIG.stateDir)) {
        fs.mkdirSync(CONFIG.stateDir, { recursive: true });
      }
      fs.appendFileSync(CONFIG.logFile, JSON.stringify(entry) + "\n");
    } catch (e) {
      // ignore
    }
  }

  /**
   * 查看状态
   */
  status() {
    console.log("\n=== Evolution Orchestrator Status ===");
    console.log(`Status: ${this.state.status || "unknown"}`);
    console.log(`Started: ${this.state.startedAt || "N/A"}`);
    console.log(`Last Evolution: ${this.state.lastEvolution || "Never"}`);
    console.log(`Target CLIs: ${CONFIG.targetCLIs.join(", ")}`);
    console.log("");
    console.log("Schedule:");
    console.log(
      `  Night (23:00-07:00): ${CONFIG.schedules.night.intervalMin}min`,
    );
    console.log(`  Day (07:00-23:00): ${CONFIG.schedules.day.intervalMin}min`);
    console.log("=====================================\n");

    return this.state;
  }
}

// ==================== CLI 入口 ====================

if (require.main === module) {
  const orchestrator = new EvolveOrchestrator();
  const command = process.argv[2] || "status";

  switch (command) {
    case "start":
      orchestrator.start();
      // 保持进程
      process.on("SIGINT", () => {
        orchestrator.stop();
        process.exit(0);
      });
      break;

    case "stop":
      orchestrator.stop();
      break;

    case "trigger":
      orchestrator.trigger({ force: true });
      break;

    case "status":
    default:
      orchestrator.status();
      break;
  }
}

module.exports = { EvolveOrchestrator, CONFIG };
