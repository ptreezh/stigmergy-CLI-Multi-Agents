/**
 * RalphLoop - 自主循环执行引擎
 *
 * 实现 Ralph Wiggum 模式：AI 循环执行直到任务完成
 *
 * 核心原理：
 * 1. 读取 plan.md 任务列表
 * 2. 选择下一个未完成任务
 * 3. 调用目标 CLI 执行
 * 4. 运行质量检查
 * 5. 标记完成并记录学习
 * 6. 重复直到全部完成
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const os = require("os");

class RalphLoop {
  constructor(options = {}) {
    this.cli = options.cli || "claude";
    this.ralphRoot =
      options.ralphRoot || path.join(os.homedir(), ".stigmergy", "ralph");
    this.cliPath = options.cliPath || this.cli;
    this.maxIterations = options.maxIterations || 10;
    this.completionPromise = options.completionPromise || null;
    this.quiet = options.quiet || false;

    // 状态
    this.isRunning = false;
    this.currentIteration = 0;
    this.currentTask = null;
    this.tasks = [];
    this.history = [];

    // 创建 CLI 目录
    this.cliDir = path.join(this.ralphRoot, this.cli);
    this.planFile = path.join(this.cliDir, "plan.md");
    this.progressFile = path.join(this.cliDir, "progress.txt");
    this.stateFile = path.join(this.cliDir, "state.json");
    this.logFile = path.join(this.cliDir, "ralph.log");
  }

  /**
   * 初始化 CLI 目录
   */
  init() {
    if (!fs.existsSync(this.cliDir)) {
      fs.mkdirSync(this.cliDir, { recursive: true });
    }
    return this;
  }

  /**
   * 设置计划文件
   */
  setPlan(planPath) {
    this.planFile = path.resolve(planPath);
    return this;
  }

  /**
   * 解析 plan.md 任务列表
   * 支持格式：
   * - [ ] 未完成任务
   * - [x] 已完成任务
   */
  parsePlan() {
    if (!fs.existsSync(this.planFile)) {
      throw new Error(`Plan file not found: ${this.planFile}`);
    }

    const content = fs.readFileSync(this.planFile, "utf-8");
    const lines = content.split("\n");
    this.tasks = [];

    for (const line of lines) {
      // 匹配 - [ ] 或 - [x] 格式
      const match = line.match(/^-\s*\[([ x])\]\s*(.+)$/);
      if (match) {
        this.tasks.push({
          done: match[1].toLowerCase() === "x",
          title: match[2].trim(),
          line: line,
        });
      }
    }

    return this.tasks;
  }

  /**
   * 获取下一个未完成任务
   */
  getNextTask() {
    return this.tasks.find((t) => !t.done);
  }

  /**
   * 标记任务完成
   */
  markTaskComplete(taskIndex) {
    if (this.tasks[taskIndex]) {
      this.tasks[taskIndex].done = true;
      this.savePlan();
    }
  }

  /**
   * 保存更新后的 plan
   */
  savePlan() {
    const lines = [];
    for (const task of this.tasks) {
      const checkbox = task.done ? "[x]" : "[ ]";
      lines.push(`- ${checkbox} ${task.title}`);
    }
    fs.writeFileSync(this.planFile, lines.join("\n"), "utf-8");
  }

  /**
   * 追加学习日志
   */
  appendProgress(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.progressFile, entry, "utf-8");
  }

  /**
   * 保存状态
   */
  saveState() {
    const state = {
      cli: this.cli,
      isRunning: this.isRunning,
      currentIteration: this.currentIteration,
      currentTask: this.currentTask,
      lastRun: new Date().toISOString(),
    };
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2), "utf-8");
  }

  /**
   * 加载状态
   */
  loadState() {
    if (fs.existsSync(this.stateFile)) {
      const state = JSON.parse(fs.readFileSync(this.stateFile, "utf-8"));
      this.currentIteration = state.currentIteration || 0;
      return state;
    }
    return null;
  }

  /**
   * 执行单个任务
   */
  async executeTask(task) {
    this.currentTask = task.title;
    this.log(`Executing: ${task.title}`);

    return new Promise((resolve, reject) => {
      // 构建命令：根据不同 CLI 使用不同调用方式
      let cmd, args;

      if (this.cli === "claude") {
        cmd = "claude";
        args = ["-p", task.title];
      } else if (this.cli === "qwen") {
        cmd = "qwen";
        args = ["--prompt", task.title];
      } else if (this.cli === "gemini") {
        cmd = "gemini";
        args = ["--prompt", task.title];
      } else if (this.cli === "iflow") {
        cmd = "iflow";
        args = ["run", task.title];
      } else if (this.cli === "codex") {
        cmd = "codex";
        args = ["--prompt", task.title];
      } else if (this.cli === "codebuddy") {
        cmd = "codebuddy";
        args = ["--task", task.title];
      } else if (this.cli === "kilocode") {
        cmd = "kilocode";
        args = ["--task", task.title];
      } else if (this.cli === "qodercli") {
        cmd = "qodercli";
        args = ["--execute", task.title];
      } else if (this.cli === "copilot") {
        cmd = "copilot";
        args = ["--task", task.title];
      } else {
        // 默认使用 stigmergy call
        cmd = "stigmergy";
        args = ["call", `--cli=${this.cli}`, task.title];
      }

      const proc = spawn(cmd, args, {
        shell: process.platform === "win32",
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        const result = {
          code,
          stdout,
          stderr,
          success: code === 0,
        };

        // 检查是否包含完成承诺
        if (this.completionPromise && stdout.includes(this.completionPromise)) {
          result.completed = true;
        }

        resolve(result);
      });

      proc.on("error", (error) => {
        reject(error);
      });

      // 超时处理：10分钟
      setTimeout(() => {
        proc.kill();
        reject(new Error("Task timeout"));
      }, 600000);
    });
  }

  /**
   * 运行单个迭代
   */
  async runIteration() {
    this.currentIteration++;
    this.log(
      `=== Iteration ${this.currentIteration}/${this.maxIterations} ===`,
    );

    const task = this.getNextTask();
    if (!task) {
      this.log("All tasks completed!");
      return { done: true, reason: "all_complete" };
    }

    this.appendProgress(
      `Iteration ${this.currentIteration}: Working on "${task.title}"`,
    );

    try {
      const result = await this.executeTask(task);

      if (result.success) {
        // 找到任务索引并标记完成
        const taskIndex = this.tasks.indexOf(task);
        this.markTaskComplete(taskIndex);
        this.appendProgress(`✓ Completed: ${task.title}`);
        this.log(`✓ Task completed: ${task.title}`);
      } else {
        this.appendProgress(
          `✗ Failed: ${task.title} (exit code: ${result.code})`,
        );
        this.log(`✗ Task failed: ${task.title}`);
      }

      // 检查是否满足完成条件
      if (result.completed) {
        return { done: true, reason: "completion_promise" };
      }

      return { done: false, result };
    } catch (error) {
      this.appendProgress(`✗ Error: ${task.title} - ${error.message}`);
      this.log(`✗ Error: ${error.message}`);
      return { done: false, error: error.message };
    }
  }

  /**
   * 运行完整循环
   */
  async run() {
    this.init();
    this.parsePlan();
    this.isRunning = true;
    this.saveState();

    this.log(`Starting Ralph Loop for ${this.cli}`);
    this.log(`Plan: ${this.planFile}`);
    this.log(`Max iterations: ${this.maxIterations}`);

    const startTime = Date.now();

    while (this.currentIteration < this.maxIterations) {
      // 检查是否全部完成
      const nextTask = this.getNextTask();
      if (!nextTask) {
        this.log("All tasks completed!");
        break;
      }

      const result = await this.runIteration();

      if (result.done) {
        this.log(`Stopping: ${result.reason}`);
        break;
      }
    }

    const duration = Date.now() - startTime;
    this.log(`Ralph Loop finished. Duration: ${duration}ms`);
    this.log(`Iterations: ${this.currentIteration}`);

    this.isRunning = false;
    this.saveState();

    return {
      iterations: this.currentIteration,
      duration,
      completed: !this.getNextTask(),
    };
  }

  /**
   * 打印日志
   */
  log(message) {
    if (!this.quiet) {
      console.log(`[Ralph:${this.cli}] ${message}`);
    }
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.logFile, `[${timestamp}] ${message}\n`, "utf-8");
  }

  /**
   * 获取状态
   */
  getStatus() {
    const state = this.loadState();
    const taskCount = this.tasks.length;
    const completedCount = this.tasks.filter((t) => t.done).length;

    return {
      cli: this.cli,
      isRunning: this.isRunning,
      currentIteration: this.currentIteration,
      tasks: {
        total: taskCount,
        completed: completedCount,
        remaining: taskCount - completedCount,
      },
      lastRun: state?.lastRun,
    };
  }

  /**
   * 创建示例 plan.md
   */
  static createSamplePlan(cliName, outputPath) {
    const template = `# Ralph Plan for ${cliName}

## 任务列表

- [ ] 任务1: 描述
- [ ] 任务2: 描述
- [ ] 任务3: 描述

## 使用方法

1. 编辑任务列表
2. 运行: stigmergy ralph ${cliName} start
`;
    fs.writeFileSync(outputPath, template, "utf-8");
    return outputPath;
  }
}

module.exports = RalphLoop;
