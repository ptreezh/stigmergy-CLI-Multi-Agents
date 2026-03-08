/**
 * Enhanced CLI Executor
 * 全自动执行CLI工具，支持自动重启、会话恢复和重试机制
 *
 * 功能：
 * 1. 检测交互式提示并自动终止
 * 2. 自动重启失败的CLI
 * 3. 使用 stigmergy resume 恢复会话
 * 4. 重试机制和备用CLI
 */

const { spawn } = require("child_process");
const os = require("os");
const path = require("path");

class EnhancedCLIExecutor {
  constructor(options = {}) {
    this.cliRegistry = options.cliRegistry || {};
    this.maxRetries = options.maxRetries || 2;
    this.enableSessionResume = options.enableSessionResume !== false;
    this.verbose = options.verbose || false;
  }

  /**
   * CLI 参数配置（确保非交互模式）
   */
  getCLIArgsConfig() {
    return {
      qwen: {
        direct: ["<task>", "-y"],
        alternative: ["call", "qwen", "<task>"],
        resumeCmd: ["resume", "qwen", "5"],
      },
      iflow: {
        direct: ["<task>", "-y"],
        alternative: ["call", "iflow", "<task>"],
        resumeCmd: ["resume", "iflow", "5"],
      },
      qodercli: {
        direct: ["<task>", "-y"],
        alternative: ["call", "qodercli", "<task>"],
        resumeCmd: ["resume", "qodercli", "5"],
      },
      gemini: {
        direct: ["<task>", "-y"],
        alternative: ["call", "gemini", "<task>"],
        resumeCmd: ["resume", "gemini", "5"],
      },
      codebuddy: {
        direct: ["-p", "<task>", "-y"],
        alternative: ["call", "codebuddy", "<task>"],
        resumeCmd: ["resume", "codebuddy", "5"],
      },
      codex: {
        direct: ["-p", "<task>", "-y"],
        alternative: ["call", "codex", "<task>"],
        resumeCmd: ["resume", "codex", "5"],
      },
      copilot: {
        direct: ["-p", "<task>", "--allow-all-tools"],
        alternative: ["call", "copilot", "<task>"],
        resumeCmd: ["resume", "copilot", "5"],
      },
      claude: {
        direct: [
          "-p",
          "<task>",
          "--dangerously-skip-permissions",
          "--allowed-tools",
          "Bash,Edit,Read,Write,RunCommand,ComputerTools",
        ],
        alternative: ["call", "claude", "<task>"],
        resumeCmd: ["resume", "claude", "5"],
      },
    };
  }

  /**
   * 备用CLI映射
   */
  getFallbackCLIMap() {
    return {
      qwen: "iflow",
      iflow: "qwen",
      gemini: "qwen",
      codebuddy: "qwen",
      codex: "qwen",
      copilot: "claude",
      claude: "qwen",
    };
  }

  /**
   * 执行CLI任务（增强版，支持自动恢复）
   */
  async executeCLI(cliName, task, options = {}) {
    const currentRetry = options.currentRetry || 0;
    const enableSessionResume = options.enableSessionResume !== false;

    this.log(
      `🤖 Executing with ${cliName} (attempt ${currentRetry + 1}/${this.maxRetries + 1})`,
    );
    this.log(
      `📋 Task: ${task.substring(0, 100)}${task.length > 100 ? "..." : ""}`,
    );

    const args = this._buildArgs(cliName, task);
    this.log(`🔧 Command: ${cliName} ${args.join(" ")}`);

    try {
      const result = await this._spawnProcess(cliName, args, task);

      // 如果执行失败，尝试恢复和重试
      if (
        !result.success &&
        enableSessionResume &&
        currentRetry < this.maxRetries
      ) {
        this.log("⚠️  Execution failed, attempting auto-recovery...");

        // 1. 恢复会话
        await this._recoverSession(cliName);

        // 2. 重新执行
        return await this.executeCLI(cliName, task, {
          currentRetry: currentRetry + 1,
          enableSessionResume: true,
        });
      }

      // 如果仍然失败，尝试备用CLI
      if (!result.success) {
        return await this._tryFallbackCLI(cliName, task);
      }

      return result;
    } catch (error) {
      this.log(`❌ Exception: ${error.message}`);
      return await this._tryFallbackCLI(cliName, task);
    }
  }

  /**
   * 构建CLI参数
   */
  _buildArgs(cliName, task) {
    const config = this.getCLIArgsConfig()[cliName];
    if (!config) {
      return ["-p", task];
    }

    return config.direct.map((arg) => (arg === "<task>" ? task : arg));
  }

  /**
   * 启动进程并监控执行
   */
  async _spawnProcess(cliName, args, task) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let output = "";
      let errorOutput = "";
      let interactionDetected = false;

      // 交互式提示模式
      const interactionPatterns = [
        />> ?>|\(y\/n\)|Continue\?|Press any key|输入|确认/i,
      ];

      const childProcess = spawn(cliName, args, {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        env: { ...process.env, FORCE_COLOR: "0" },
      });

      // 检测交互式输出
      childProcess.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;

        // 检测交互提示
        for (const pattern of interactionPatterns) {
          if (pattern.test(text)) {
            interactionDetected = true;
            this.log("⚠️  Detected interactive prompt, terminating...");
            childProcess.kill("SIGTERM");
            break;
          }
        }

        process.stdout.write(data);
      });

      childProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });

      childProcess.on("close", (code) => {
        const executionTime = Date.now() - startTime;

        this.log(
          `✅ Execution completed in ${executionTime}ms (exit code: ${code})`,
        );

        if (interactionDetected) {
          resolve({
            success: false,
            cli: cliName,
            task: task,
            error: "Interactive prompt detected",
            exitCode: code,
            needsRecovery: true,
          });
        } else if (code !== 0) {
          resolve({
            success: false,
            cli: cliName,
            task: task,
            error: errorOutput || `Exit code ${code}`,
            exitCode: code,
            needsRecovery: true,
          });
        } else {
          resolve({
            success: true,
            cli: cliName,
            task: task,
            output: output,
            executionTime,
            exitCode: code,
          });
        }
      });

      childProcess.on("error", (error) => {
        resolve({
          success: false,
          cli: cliName,
          task: task,
          error: error.message,
          needsRecovery: true,
        });
      });

      // 超时控制（可选）
      const timeout = 120000; // 2分钟
      if (timeout > 0) {
        setTimeout(() => {
          if (!childProcess.killed) {
            this.log(`⏱️  Timeout after ${timeout}ms, terminating...`);
            childProcess.kill("SIGTERM");
            setTimeout(() => childProcess.kill("SIGKILL"), 5000);
          }
        }, timeout);
      }
    });
  }

  /**
   * 恢复CLI会话
   */
  async _recoverSession(cliName) {
    this.log(`💾 Recovering session for ${cliName}...`);

    return new Promise((resolve) => {
      const process = spawn("stigmergy", ["resume", cliName, "5"], {
        stdio: "inherit",
        shell: true,
      });

      process.on("close", (code) => {
        this.log(`✅ Session recovery completed (code=${code})`);
        resolve();
      });

      setTimeout(() => resolve(), 10000); // 10秒超时
    });
  }

  /**
   * 尝试备用CLI
   */
  async _tryFallbackCLI(failedCli, task) {
    const fallbackMap = this.getFallbackCLIMap();
    const fallback = fallbackMap[failedCli];

    if (!fallback || !this.cliRegistry[fallback]?.available) {
      this.log(`❌ No available fallback CLI for ${failedCli}`);
      return null;
    }

    this.log(`🔄 Trying fallback CLI: ${fallback}...`);

    try {
      return await this.executeCLI(fallback, task, {
        currentRetry: this.maxRetries, // 避免无限循环
        enableSessionResume: false,
      });
    } catch (error) {
      this.log(`❌ Fallback CLI ${fallback} also failed: ${error.message}`);
      return null;
    }
  }

  /**
   * 日志输出
   */
  log(message) {
    if (this.verbose) {
      console.log(`[CLI_EXECUTOR] ${message}`);
    }
  }
}

module.exports = EnhancedCLIExecutor;
