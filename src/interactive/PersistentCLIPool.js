/**
 * Persistent CLI Pool
 * 管理长期运行的 CLI 进程，实现真正的持续交互
 *
 * 核心功能：
 * 1. 保持 CLI 进程长期运行（不退出）
 * 2. 通过 stdin 动态发送任务
 * 3. 检测响应完成（通过提示符检测）
 * 4. 进程健康检查和自动重启
 */

const { spawn } = require("child_process");
const EventEmitter = require("events");

class CLIProcess extends EventEmitter {
  constructor(proc, cliName, config) {
    super();

    this.proc = proc;
    this.cliName = cliName;
    this.config = config;
    this.ready = false;
    this.outputBuffer = "";
    this.responseBuffer = "";
    this.currentTask = null;
    this.taskResolve = null;
    this.taskReject = null;
    this.lastActivity = Date.now();

    this._setupIOHandlers();
  }

  /**
   * 设置 IO 处理器
   * @private
   */
  _setupIOHandlers() {
    // 处理 stdout 输出
    this.proc.stdout.on("data", (data) => {
      const output = data.toString();
      this.outputBuffer += output;
      this.responseBuffer += output;
      this.lastActivity = Date.now();

      // 发出输出事件
      this.emit("output", output);

      // 🔥 关键修复：首次输出后即认为 ready（用于 qwen 这类没有明确提示符的 CLI）
      if (!this.ready && output.trim().length > 0) {
        this.ready = true;
        this.emit("ready");

        if (process.env.DEBUG === "true") {
          console.log(
            `[DEBUG] ${this.cliName} is now ready (first output received)`,
          );
        }
      }

      // 检测是否是提示符（表示等待输入）
      if (this._isPromptDetected(output)) {
        this.ready = true;
        this.emit("ready");

        // 如果有等待中的任务，解析响应
        if (this.taskResolve) {
          const response = this._extractResponse();
          this.taskResolve(response);
          this.taskResolve = null;
          this.taskReject = null;
          this.currentTask = null;
          this.responseBuffer = "";
        }
      }
    });

    // 处理 stderr 输出
    this.proc.stderr.on("data", (data) => {
      const error = data.toString();

      // 某些 CLI 使用 stderr 输出警告信息，不应该当作错误
      // qwen CLI 启动时会有一些警告，但不影响运行
      // 只记录但不触发 error 事件
      if (process.env.DEBUG === "true") {
        console.log(`[${this.cliName}] STDERR: ${error}`);
      }

      // 只在包含真正的致命错误时才发出错误事件
      // 过滤掉 qwen 的启动警告
      if (
        error.includes("FATAL") ||
        (error.includes("ERROR") &&
          !error.includes("ImportProcessor") &&
          !error.includes("extension"))
      ) {
        this.emit("error", error);
      }
    });

    // 处理进程退出
    this.proc.on("close", (code) => {
      this.ready = false;
      this.emit("close", code);

      // 如果有等待中的任务，拒绝它
      if (this.taskReject) {
        this.taskReject(
          new Error(`${this.cliName} process exited with code ${code}`),
        );
        this.taskResolve = null;
        this.taskReject = null;
      }
    });

    // 处理进程错误
    this.proc.on("error", (error) => {
      this.ready = false;
      this.emit("error", error);

      if (this.taskReject) {
        this.taskReject(error);
        this.taskResolve = null;
        this.taskReject = null;
      }
    });
  }

  /**
   * 检测输出中是否包含提示符
   * @private
   */
  _isPromptDetected(output) {
    // 常见的提示符模式
    const promptPatterns = [
      />$/, // 以 > 结尾
      /\$$/, // 以 $ 结尾
      new RegExp(`${this.cliName}>`), // cliName>
      /→.*$/, // 箭头提示符
      /❯.*$/, // 尖括号提示符
      /➜.*$/, // 箭头提示符2
      /\[.*\].*>\s*$/, // [上下文] >
      /Enter a command:/, // 明确的提示
      /Waiting for input:/, // 等待输入
    ];

    // 检查最后几行是否匹配提示符模式
    const lines = output.split("\n").slice(-3);
    for (const line of lines) {
      for (const pattern of promptPatterns) {
        if (pattern.test(line.trim())) {
          if (process.env.DEBUG === "true") {
            console.log(`[DEBUG] Prompt detected: ${line.trim()}`);
          }
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 从输出缓冲区提取响应内容
   * @private
   */
  _extractResponse() {
    // 移除最后一个提示符及其之前的内容
    // 简单实现：提取最后一个提示符之前的所有内容

    // 找到最后一个提示符的位置
    const lines = this.outputBuffer.split("\n");
    let promptIndex = -1;

    for (let i = lines.length - 1; i >= 0; i--) {
      if (this._isPromptDetected(lines[i])) {
        promptIndex = i;
        break;
      }
    }

    // 如果找到提示符，返回之前的内容
    if (promptIndex > 0) {
      const response = lines.slice(0, promptIndex).join("\n").trim();
      this.outputBuffer = lines.slice(promptIndex).join("\n");
      return response;
    }

    // 否则返回整个缓冲区
    const response = this.outputBuffer.trim();
    this.outputBuffer = "";
    return response;
  }

  /**
   * 等待进程就绪
   * 🔥 修复：对于像 qwen 这样不发送提示符的 CLI，等待一段时间后认为 ready
   */
  async waitForReady(timeout = 10000) {
    return new Promise((resolve, reject) => {
      // 如果已经 ready，直接返回
      if (this.ready) {
        resolve();
        return;
      }

      // 🔥 关键修复：等待一段时间后认为 ready
      // 因为某些 CLI（如 qwen）不会发送提示符，但已经准备好接收输入
      const readyTimer = setTimeout(() => {
        if (!this.ready) {
          this.ready = true;
          this.emit("ready");

          if (process.env.DEBUG === "true") {
            console.log(
              `[DEBUG] ${this.cliName} assumed ready after ${timeout}ms`,
            );
          }

          resolve();
        }
      }, timeout);

      // 如果检测到 ready 事件，清除定时器并 resolve
      this.once("ready", () => {
        clearTimeout(readyTimer);
        resolve();
      });

      // 如果进程关闭，清除定时器并 reject
      this.once("close", () => {
        clearTimeout(readyTimer);
        reject(new Error(`${this.cliName} process closed before ready`));
      });
    });
  }

  /**
   * 发送任务并获取响应
   * 🔥 策略A：使用固定超时（简单可靠）
   * 适用于 qwen 这类响应较慢但没有明确提示符的 CLI
   */
  async execute(task, options = {}) {
    const {
      timeout = 15000, // 🔥 固定 15 秒超时（qwen 需要约 9-13 秒才开始响应）
      verbose = process.env.DEBUG === "true",
    } = options;

    if (verbose) {
      console.log(
        `[${this.cliName}] Sending task: ${task.substring(0, 100)}...`,
      );
    }

    // 检查进程是否健康
    if (!this.isHealthy()) {
      throw new Error(`${this.cliName} process is not healthy`);
    }

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      let timer = null;

      // 设置最终超时
      timer = setTimeout(() => {
        // 时间到，提取当前所有输出
        const response = this.responseBuffer.trim();
        this.responseBuffer = "";
        this.currentTask = null;

        const executionTime = Date.now() - startTime;

        if (verbose) {
          console.log(
            `[${this.cliName}] Response complete (${response.length} chars, ${executionTime}ms)`,
          );
        }

        resolve({
          success: true,
          cli: this.cliName,
          output: response,
          executionTime: executionTime,
        });
      }, timeout);

      // 发送任务到 stdin
      try {
        this.proc.stdin.write(task + "\n");
        if (verbose) {
          console.log(
            `[${this.cliName}] Task sent, waiting ${timeout}ms for response...`,
          );
        }
      } catch (error) {
        if (timer) clearTimeout(timer);
        reject(
          new Error(`Failed to send task to ${this.cliName}: ${error.message}`),
        );
      }
    });
  }

  /**
   * 检查进程是否健康
   */
  isHealthy() {
    return this.proc && !this.proc.killed && this.ready;
  }

  /**
   * 获取进程状态
   */
  getStatus() {
    return {
      cliName: this.cliName,
      pid: this.proc.pid,
      ready: this.ready,
      healthy: this.isHealthy(),
      lastActivity: this.lastActivity,
      hasPendingTask: this.currentTask !== null,
      uptime: Date.now() - this.lastActivity,
    };
  }

  /**
   * 关闭进程
   */
  async shutdown() {
    if (this.proc && !this.proc.killed) {
      this.emit("shutdown");

      // 尝试优雅关闭
      try {
        this.proc.stdin.write("exit\n");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {}

      // 强制关闭
      this.proc.kill();
      this.ready = false;
    }
  }
}

class PersistentCLIPool {
  constructor(options = {}) {
    this.processes = {}; // { cliName: CLIProcess }
    this.shuttingDown = false; // 🔥 防止关闭时自动重启
    this.options = {
      autoRestart: true,
      healthCheckInterval: 30000, // 30 秒
      maxIdleTime: 300000, // 5 分钟无活动后关闭
      ...options,
    };

    // 启动健康检查
    if (this.options.autoRestart) {
      this._startHealthCheck();
    }
  }

  /**
   * 获取或创建 CLI 客户端
   */
  async getCLIClient(cliName) {
    // 如果进程已存在且健康，直接返回
    if (this.processes[cliName]?.isHealthy()) {
      return this.processes[cliName];
    }

    // 否则创建新进程
    return await this._createCLIClient(cliName);
  }

  /**
   * 创建持久的 CLI 客户端
   * @private
   */
  async _createCLIClient(cliName) {
    const config = this._getCLIConfig(cliName);

    console.log(`[POOL] Creating persistent ${cliName} process...`);

    // 使用交互模式启动进程（不带任务参数）
    const proc = spawn(config.command, config.interactiveArgs, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
      env: { ...process.env, FORCE_COLOR: "0" }, // 禁用颜色以简化输出检测
    });

    const client = new CLIProcess(proc, cliName, config);

    // 等待进程就绪
    try {
      await client.waitForReady(10000);
      console.log(`[POOL] ${cliName} process ready (PID: ${proc.pid})`);
    } catch (error) {
      console.error(`[POOL] Failed to start ${cliName}:`, error.message);
      proc.kill();
      throw error;
    }

    // 存储到池中
    this.processes[cliName] = client;

    // 监听进程关闭事件
    client.on("close", (code) => {
      console.log(`[POOL] ${cliName} process exited (code: ${code})`);
      delete this.processes[cliName];

      // 🔥 如果正在关闭，不自动重启
      if (this.shuttingDown) {
        return;
      }

      // 如果设置了自动重启，重新创建进程
      if (this.options.autoRestart && code !== 0) {
        console.log(`[POOL] Auto-restarting ${cliName}...`);
        setTimeout(() => {
          this._createCLIClient(cliName).catch((err) => {
            console.error(`[POOL] Failed to restart ${cliName}:`, err.message);
          });
        }, 1000);
      }
    });

    return client;
  }

  /**
   * 获取 CLI 配置
   * @private
   */
  _getCLIConfig(cliName) {
    const configs = {
      qwen: {
        command: "qwen",
        interactiveArgs: [], // 🔥 空参数：qwen 不支持 -i 与 piped stdin
        // qwen 不支持真正的持久 stdin 交互，不建议使用持久池
        // 使用 one-shot 模式代替
        persistent: false, // 标记为不支持持久模式
        prompt: "qwen> ",
        timeout: 30000,
      },
      iflow: {
        command: "iflow",
        interactiveArgs: [], // 同样不使用 -i
        prompt: "iflow> ",
        timeout: 30000,
      },
      claude: {
        command: "claude",
        interactiveArgs: [],
        prompt: "claude> ",
        timeout: 30000,
      },
      gemini: {
        command: "gemini",
        interactiveArgs: [],
        prompt: "gemini> ",
        timeout: 30000,
      },
      codebuddy: {
        command: "codebuddy",
        interactiveArgs: [],
        prompt: "buddy> ",
        timeout: 30000,
      },
      codex: {
        command: "codex",
        interactiveArgs: [],
        prompt: "codex> ",
        timeout: 30000,
      },
      qodercli: {
        command: "qodercli",
        interactiveArgs: [],
        prompt: "qoder> ",
        timeout: 30000,
      },
      copilot: {
        command: "copilot",
        interactiveArgs: [],
        prompt: "copilot> ",
        timeout: 30000,
      },
    };

    const config = configs[cliName];
    if (!config) {
      throw new Error(`Unknown CLI: ${cliName}`);
    }

    return config;
  }

  /**
   * 执行任务
   */
  async executeTask(cliName, task, options = {}) {
    try {
      const client = await this.getCLIClient(cliName);
      return await client.execute(task, options);
    } catch (error) {
      console.error(`[POOL] ${cliName} execution failed:`, error.message);

      // 如果进程不健康，尝试重启
      if (!this.processes[cliName]?.isHealthy()) {
        console.log(`[POOL] Restarting ${cliName}...`);
        delete this.processes[cliName];
        const client = await this._createCLIClient(cliName);
        return await client.execute(task, options);
      }

      throw error;
    }
  }

  /**
   * 启动健康检查
   * @private
   */
  _startHealthCheck() {
    setInterval(() => {
      for (const [cliName, client] of Object.entries(this.processes)) {
        const status = client.getStatus();

        // 检查进程是否超时
        if (!status.healthy) {
          console.log(`[HEALTH] ${cliName} process is unhealthy`);
          continue;
        }

        // 检查是否空闲太久
        const idleTime = Date.now() - status.lastActivity;
        if (idleTime > this.options.maxIdleTime && !status.hasPendingTask) {
          console.log(
            `[HEALTH] ${cliName} process idle for ${idleTime}ms, shutting down...`,
          );
          client.shutdown();
        }
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * 获取所有进程状态
   */
  getStatus() {
    const status = {};

    for (const [cliName, client] of Object.entries(this.processes)) {
      status[cliName] = client.getStatus();
    }

    return status;
  }

  /**
   * 关闭所有进程
   */
  async shutdownAll() {
    console.log("[POOL] Shutting down all CLI processes...");

    // 🔥 设置关闭标志，防止自动重启
    this.shuttingDown = true;

    const shutdownPromises = [];
    for (const [cliName, client] of Object.entries(this.processes)) {
      console.log(`[POOL] Shutting down ${cliName}...`);
      shutdownPromises.push(client.shutdown());
    }

    await Promise.all(shutdownPromises);
    this.processes = {};

    console.log("[POOL] All processes shut down");
  }

  /**
   * 重启特定 CLI
   */
  async restart(cliName) {
    if (this.processes[cliName]) {
      console.log(`[POOL] Restarting ${cliName}...`);
      await this.processes[cliName].shutdown();
      delete this.processes[cliName];
    }

    return await this._createCLIClient(cliName);
  }
}

module.exports = {
  PersistentCLIPool,
  CLIProcess,
};
