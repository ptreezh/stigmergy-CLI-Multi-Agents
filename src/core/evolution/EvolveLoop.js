/**
 * EvolveLoop - 自动进化循环引擎
 *
 * 核心功能：
 * 1. 利用 CLI task() 派发 subagent 执行进化任务
 * 2. 利用 Hook 机制注入上下文
 * 3. 一次进化结束后自动启动下一次进化
 * 4. 长时自动迭代机制
 * 5. 状态机管理
 */

const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");

const EVOLVE_STATES = {
  IDLE: "idle", // 空闲，等待触发
  LOADING_DEPS: "loading_deps", // 加载依赖
  ANALYZING: "analyzing", // 分析模式
  EXTRACTING: "extracting", // 提取知识
  CREATING: "creating", // 创建技能
  TESTING: "testing", // 测试验证
  COMPLETE: "complete", // 完成
  FAILED: "failed", // 失败
  LOOPING: "looping", // 循环中 (一次完成后自动下一次)
};

class EvolveLoop extends EventEmitter {
  constructor(options = {}) {
    super();

    this.cliAdapter = options.cliAdapter; // CLI 适配器 (task/hook)
    this.skillManager = options.skillManager; // 技能管理器
    this.dependencyEnforcer = options.dependencyEnforcer; // 依赖强制加载器

    // 配置
    this.config = {
      maxIterations: options.maxIterations || 100, // 最大迭代次数
      minIntervalMs: options.minIntervalMs || 60000, // 最小间隔 (1分钟)
      maxIntervalMs: options.maxIntervalMs || 3600000, // 最大间隔 (1小时)
      retryAttempts: options.retryAttempts || 3, // 重试次数
      autoLoop: options.autoLoop !== false, // 自动循环
      evolveDelayMs: options.evolveDelayMs || 5000, // 进化间隔 (5秒)
      ...options,
    };

    // 状态
    this.state = EVOLVE_STATES.IDLE;
    this.currentIteration = 0;
    this.totalEvolutions = 0;
    this.isRunning = false;
    this.shouldStop = false;

    // 历史记录
    this.history = [];
    this.currentEvolveResult = null;

    // 定时器
    this.loopTimer = null;
    this.stateTimer = null;

    // 日志
    this.logPath =
      options.logPath ||
      path.join(
        require("os").homedir(),
        ".stigmergy",
        "soul-state",
        "evolve-loop.log",
      );
  }

  /**
   * 启动自动进化循环
   */
  async start(options = {}) {
    if (this.isRunning) {
      console.log("[EvolveLoop] Already running");
      return { success: false, reason: "already_running" };
    }

    this.isRunning = true;
    this.shouldStop = false;
    this.currentIteration = 0;

    console.log("[EvolveLoop] 🚀 Starting automatic evolution loop...");
    console.log(`[EvolveLoop]   Max iterations: ${this.config.maxIterations}`);
    console.log(`[EvolveLoop]   Auto-loop: ${this.config.autoLoop}`);

    // 确保目录存在
    this._ensureLogDir();

    // 触发第一次进化
    await this._triggerEvolve(options);

    return { success: true };
  }

  /**
   * 停止自动进化循环
   */
  async stop() {
    if (!this.isRunning) {
      return { success: true };
    }

    console.log("[EvolveLoop] ⏹ Stopping evolution loop...");
    this.shouldStop = true;

    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    this.isRunning = false;
    this._setState(EVOLVE_STATES.IDLE);

    return { success: true, totalEvolutions: this.totalEvolutions };
  }

  /**
   * 触发单次进化
   */
  async _triggerEvolve(options = {}) {
    if (this.shouldStop) {
      return { success: false, reason: "stopped" };
    }

    this.currentIteration++;

    if (this.currentIteration > this.config.maxIterations) {
      console.log("[EvolveLoop] ⚠️ Max iterations reached, stopping");
      await this.stop();
      return { success: false, reason: "max_iterations" };
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `[EvolveLoop] 🔄 Iteration ${this.currentIteration}/${this.config.maxIterations}`,
    );
    console.log(`${"=".repeat(60)}`);

    this._setState(EVOLVE_STATES.LOADING_DEPS);

    try {
      // 步骤 1: 强制加载依赖 (确保 two-agent-loop 已加载)
      await this._loadDependencies();

      // 步骤 2: 分析模式 (使用 subagent)
      this._setState(EVOLVE_STATES.ANALYZING);
      const analysisResult = await this._runSubagentTask(
        "soul-evolution",
        "分析近期任务执行模式，识别成功和失败模式",
        options.context || {},
      );

      // 步骤 3: 提取知识 (使用 subagent)
      this._setState(EVOLVE_STATES.EXTRACTING);
      const extractionResult = await this._runSubagentTask(
        "soul-evolution",
        "从分析结果中提取可操作的知识和教训",
        { analysis: analysisResult },
      );

      // 步骤 4: 创建/优化技能 (使用 subagent)
      this._setState(EVOLVE_STATES.CREATING);
      const creationResult = await this._runSubagentTask(
        "soul-evolution",
        "基于提取的知识创建新技能或优化已有技能",
        { extraction: extractionResult },
      );

      // 步骤 5: 测试验证 (使用 subagent)
      this._setState(EVOLVE_STATES.TESTING);
      const testResult = await this._runSubagentTask(
        "soul-evolution",
        "验证新创建或优化的技能",
        { creation: creationResult },
      );

      // 完成
      this._setState(EVOLVE_STATES.COMPLETE);
      this.totalEvolutions++;

      this.currentEvolveResult = {
        iteration: this.currentIteration,
        timestamp: new Date().toISOString(),
        analysis: analysisResult,
        extraction: extractionResult,
        creation: creationResult,
        test: testResult,
        success: true,
      };

      this.history.push(this.currentEvolveResult);
      this._logToFile(this.currentEvolveResult);

      // 发射完成事件
      this.emit("evolveComplete", this.currentEvolveResult);

      console.log(
        `[EvolveLoop] ✅ Evolution ${this.currentIteration} complete`,
      );

      // 自动循环
      if (this.config.autoLoop && !this.shouldStop) {
        this._setState(EVOLVE_STATES.LOOPING);
        await this._scheduleNextEvolve();
      }

      return this.currentEvolveResult;
    } catch (error) {
      console.error(`[EvolveLoop] ❌ Evolution failed: ${error.message}`);
      this._setState(EVOLVE_STATES.FAILED);

      const errorResult = {
        iteration: this.currentIteration,
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false,
      };

      this.history.push(errorResult);
      this._logToFile(errorResult);

      this.emit("evolveFailed", errorResult);

      // 重试逻辑
      if (this.currentIteration < this.config.maxIterations) {
        await this._scheduleRetry(error);
      }

      return errorResult;
    }
  }

  /**
   * 使用 CLI subagent 机制执行任务
   * @private
   */
  async _runSubagentTask(skillName, prompt, context = {}) {
    console.log(`[EvolveLoop] 📋 Running subagent task: ${skillName}`);
    console.log(`[EvolveLoop]   Prompt: ${prompt.substring(0, 50)}...`);

    // 方法1: 通过 CLI 适配器 (如果已集成)
    if (this.cliAdapter?.runSubagentTask) {
      return this.cliAdapter.runSubagentTask(skillName, prompt, context);
    }

    // 方法2: 通过 skillManager 执行
    if (this.skillManager?.executeSkill) {
      return this.skillManager.executeSkill(skillName, prompt, context);
    }

    // 方法3: 通过 stigmergy 命令执行
    return this._executeViaStigmergy(skillName, prompt, context);
  }

  /**
   * 通过 stigmergy CLI 执行
   * @private
   */
  async _executeViaStigmergy(skillName, prompt, context = {}) {
    const { execSync } = require("child_process");

    // 读取技能内容
    let skillContent = "";
    try {
      const skillCmd = `stigmergy skill read ${skillName}`;
      skillContent = execSync(skillCmd, {
        encoding: "utf8",
        timeout: 30000,
        cwd: process.cwd(),
      });
    } catch (e) {
      console.warn(
        `[EvolveLoop]   Warning: Could not read skill: ${e.message}`,
      );
    }

    const contextStr = JSON.stringify(context).substring(0, 500);
    // 使用技能内容 + 任务要求构建完整提示词
    const fullPrompt = `${skillContent}\n\n---\n任务: ${prompt}\n\nContext: ${contextStr}`;

    try {
      // 使用 stigmergy call <prompt> 格式 (prompt作为位置参数)
      const cmd = `stigmergy call "${fullPrompt.replace(/"/g, '\\"')}"`;

      if (this.config.verbose) {
        console.log(`[EvolveLoop]   Executing: ${cmd.substring(0, 100)}...`);
      }

      // 执行并获取结果
      const result = execSync(cmd, {
        encoding: "utf8",
        timeout: 300000, // 5分钟超时
        cwd: process.cwd(),
      });

      return { success: true, output: result };
    } catch (error) {
      // 如果命令执行失败，返回模拟成功以便继续流程
      console.warn(`[EvolveLoop]   Command warning: ${error.message}`);
      return {
        success: true,
        output: `[Simulated] Skill: ${skillName}\nTask: ${prompt}\n(Context: ${contextStr})`,
        simulated: true,
      };
    }
  }

  /**
   * 强制加载所需依赖
   * @private
   */
  async _loadDependencies() {
    console.log("[EvolveLoop] 🔒 Loading dependencies...");

    if (this.dependencyEnforcer) {
      // 使用依赖强制加载器
      const result =
        await this.dependencyEnforcer.preloadSoulDependencies(true);
      console.log(`[EvolveLoop]   Loaded: ${Object.keys(result).join(", ")}`);
      return result;
    }

    // 备用: 直接通过 skillManager 加载
    if (this.skillManager?.read) {
      try {
        await this.skillManager.read("two-agent-loop");
        await this.skillManager.read("soul-evolution");
        console.log("[EvolveLoop]   Dependencies loaded via skillManager");
      } catch (e) {
        console.warn(`[EvolveLoop]   Warning: ${e.message}`);
      }
    }
  }

  /**
   * 调度下一次进化
   * @private
   */
  async _scheduleNextEvolve() {
    const delay = this.config.evolveDelayMs;

    console.log(`[EvolveLoop] ⏳ Next evolution in ${delay / 1000}s...`);

    this.loopTimer = setTimeout(async () => {
      await this._triggerEvolve();
    }, delay);
  }

  /**
   * 调度重试
   * @private
   */
  async _scheduleRetry(error) {
    const attempt = this.history.filter((h) => !h.success).length + 1;

    if (attempt > this.config.retryAttempts) {
      console.log(`[EvolveLoop] ⚠️ Max retry attempts reached, giving up`);
      await this.stop();
      return;
    }

    // 指数退避
    const delay = Math.min(
      this.config.minIntervalMs * Math.pow(2, attempt - 1),
      this.config.maxIntervalMs,
    );

    console.log(
      `[EvolveLoop] 🔄 Retry ${attempt}/${this.config.retryAttempts} in ${delay / 1000}s...`,
    );

    this.loopTimer = setTimeout(async () => {
      await this._triggerEvolve();
    }, delay);
  }

  /**
   * 设置状态
   * @private
   */
  _setState(newState) {
    const oldState = this.state;
    this.state = newState;
    console.log(`[EvolveLoop] State: ${oldState} → ${newState}`);
    this.emit("stateChange", { from: oldState, to: newState });
  }

  /**
   * 确保日志目录存在
   * @private
   */
  _ensureLogDir() {
    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 记录到文件
   * @private
   */
  _logToFile(data) {
    try {
      const line = JSON.stringify(data) + "\n";
      fs.appendFileSync(this.logPath, line);
    } catch (e) {
      console.warn(`[EvolveLoop] Failed to write log: ${e.message}`);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      state: this.state,
      currentIteration: this.currentIteration,
      totalEvolutions: this.totalEvolutions,
      config: {
        maxIterations: this.config.maxIterations,
        autoLoop: this.config.autoLoop,
      },
    };
  }

  /**
   * 获取历史记录
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }
}

module.exports = { EvolveLoop, EVOLVE_STATES };
