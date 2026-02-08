/**
 * CronScheduler - 跨平台定时任务调度器
 */

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const EventEmitter = require("events");
const cronParser = require("cron-parser");

const PlatformUtils = require("./platform_utils");
const TaskHistory = require("./task_history");

class CronScheduler extends EventEmitter {
  constructor(config = {}) {
    super();
    this.platform = PlatformUtils.getPlatform();

    this.config = {
      dataDir:
        config.dataDir || path.join(process.cwd(), ".stigmergy", "scheduler"),
      maxHistory: config.maxHistory || 100,
      timezone: config.timezone || "Asia/Shanghai",
      autoStart: config.autoStart || false,
      ...config,
    };

    this.tasks = new Map();
    this.runningJobs = new Map();
    this.isRunning = false;
    this.intervalId = null;

    this.history = new TaskHistory({
      dataDir: this.config.dataDir,
      maxHistory: this.config.maxHistory,
    });

    this.ensureDataDir();
    this.loadAllTasks();

    if (this.config.autoStart) {
      this.start();
    }
  }

  ensureDataDir() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
    const tasksDir = path.join(this.config.dataDir, "tasks");
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }
  }

  createTask(options) {
    const task = {
      id: options.id || this.generateId(),
      name: options.name || "未命名任务",
      type: options.type || "cli",
      cron: options.cron,
      enabled: options.enabled !== false,
      description: options.description || "",
      cli: options.cli || null,
      command: options.command || null,
      platform: options.platform || null,
      message: options.message || null,
      webhook: options.webhook || null,
      webhookMethod: options.webhookMethod || "POST",
      webhookHeaders: options.webhookHeaders || {},
      webhookBody: options.webhookBody || null,
      script: options.script || null,
      scriptArgs: options.scriptArgs || [],
      timeout: options.timeout || 300000,
      retry: options.retry || 0,
      retryDelay: options.retryDelay || 60000,
      lastRun: null,
      nextRun: null,
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!task.cron) {
      throw new Error("必须提供 cron 表达式");
    }

    const validation = this.validateTask(task);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    task.nextRun = this.getNextRunTime(task.cron);
    if (!task.nextRun) {
      throw new Error("无效的 cron 表达式");
    }

    this.saveTask(task);
    this.tasks.set(task.id, task);
    this.emit("taskCreated", task);

    return task;
  }

  validateTask(task) {
    const validators = {
      cli: () => {
        if (!task.cli && !task.command) {
          return { valid: false, error: "CLI 任务必须提供 cli 或 command" };
        }
        return { valid: true };
      },
      gateway: () => {
        if (!task.platform && !task.message) {
          return {
            valid: false,
            error: "Gateway 任务必须提供 platform 或 message",
          };
        }
        return { valid: true };
      },
      webhook: () => {
        if (!task.webhook) {
          return { valid: false, error: "Webhook 任务必须提供 webhook URL" };
        }
        try {
          new URL(task.webhook);
        } catch {
          return { valid: false, error: "无效的 Webhook URL" };
        }
        return { valid: true };
      },
      script: () => {
        if (!task.script) {
          return { valid: false, error: "Script 任务必须提供 script 路径" };
        }
        if (!fs.existsSync(task.script)) {
          return { valid: false, error: `脚本文件不存在: ${task.script}` };
        }
        return { valid: true };
      },
    };

    const validator = validators[task.type];
    return validator ? validator() : { valid: true };
  }

  getAllTasks() {
    return Array.from(this.tasks.values()).sort((a, b) => {
      if (a.enabled !== b.enabled) return b.enabled - a.enabled;
      if (!a.nextRun || !b.nextRun) return 0;
      return new Date(a.nextRun) - new Date(b.nextRun);
    });
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  updateTask(id, updates) {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`任务不存在: ${id}`);

    const updatedTask = {
      ...task,
      ...updates,
      id: task.id,
      createdAt: task.createdAt,
      updatedAt: new Date().toISOString(),
    };

    if (updates.cron) {
      updatedTask.nextRun = this.getNextRunTime(updatedTask.cron);
      if (!updatedTask.nextRun) throw new Error("无效的 cron 表达式");
    }

    const validation = this.validateTask(updatedTask);
    if (!validation.valid) throw new Error(validation.error);

    this.saveTask(updatedTask);
    this.tasks.set(id, updatedTask);
    this.emit("taskUpdated", updatedTask);
    return updatedTask;
  }

  deleteTask(id) {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`任务不存在: ${id}`);
    this.tasks.delete(id);
    this.deleteTaskFile(id);
    this.emit("taskDeleted", task);
    return task;
  }

  toggleTask(id) {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`任务不存在: ${id}`);
    task.enabled = !task.enabled;
    task.updatedAt = new Date().toISOString();
    if (task.enabled) task.nextRun = this.getNextRunTime(task.cron);
    this.saveTask(task);
    this.tasks.set(id, task);
    this.emit("taskToggled", task);
    return task;
  }

  async runTask(id) {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`任务不存在: ${id}`);
    if (this.runningJobs.has(id)) throw new Error(`任务正在执行中: ${id}`);
    return this.executeTask(task);
  }

  async executeTask(task) {
    this.runningJobs.set(task.id, { startTime: Date.now(), status: "running" });
    task.lastRun = new Date().toISOString();
    task.runCount++;
    this.saveTask(task);
    this.emit("taskStarted", task);

    const historyEntry = {
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      startTime: new Date().toISOString(),
      platform: this.platform.os,
      status: "running",
    };

    try {
      let result;
      switch (task.type) {
        case "cli":
          result = await this.executeCLI(task);
          break;
        case "gateway":
          result = await this.executeGateway(task);
          break;
        case "webhook":
          result = await this.executeWebhook(task);
          break;
        case "script":
          result = await this.executeScript(task);
          break;
        default:
          throw new Error(`不支持的任务类型: ${task.type}`);
      }

      historyEntry.status = "success";
      historyEntry.endTime = new Date().toISOString();
      historyEntry.duration =
        Date.now() - new Date(historyEntry.startTime).getTime();
      historyEntry.output = result?.output || "";
      historyEntry.exitCode = result?.exitCode || 0;
      this.history.add(historyEntry);
      this.runningJobs.delete(task.id);

      if (task.enabled) {
        task.nextRun = this.getNextRunTime(task.cron);
        this.saveTask(task);
      }

      this.emit("taskCompleted", { task, result });
      return result;
    } catch (error) {
      historyEntry.status = "failed";
      historyEntry.endTime = new Date().toISOString();
      historyEntry.duration =
        Date.now() - new Date(historyEntry.startTime).getTime();
      historyEntry.error = error.message;
      this.history.add(historyEntry);
      this.runningJobs.delete(task.id);
      this.emit("taskFailed", { task, error });
      if (task.retry > 0) {
        setTimeout(() => this.executeTask(task), task.retryDelay);
      }
      throw error;
    }
  }

  async executeCLI(task) {
    const cliPath = this.findCLIPath(task.cli);
    if (!cliPath) throw new Error(`CLI 未安装: ${task.cli}`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`超时`)), task.timeout);
      let stdout = "",
        stderr = "";

      const cmd = this.platform.isWindows ? "cmd.exe" : cliPath;
      const args = this.platform.isWindows
        ? ["/c", cliPath, task.command, ...task.args]
        : [task.command, ...task.args];

      const child = spawn(cmd, args, {
        shell: this.platform.isWindows,
        timeout: task.timeout,
        maxBuffer: 10 * 1024 * 1024,
        encoding: "utf8",
      });

      child.stdout.on("data", (d) => (stdout += d.toString()));
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve({ exitCode: code, output: stdout.trim() });
        else reject(new Error(`退出码: ${code}`));
      });
      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  findCLIPath(cliName) {
    try {
      const result = execSync(
        this.platform.isWindows ? `where ${cliName}` : `which ${cliName}`,
        { encoding: "utf8", timeout: 5000 },
      );
      return result.trim().split("\n")[0];
    } catch {
      return null;
    }
  }

  async executeGateway(task) {
    const gatewayUrl =
      process.env.STIGMERGY_GATEWAY_URL || "http://localhost:3000";
    try {
      const response = await fetch(`${gatewayUrl}/api/v1/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: task.platform,
          message: task.message,
          taskId: task.id,
          taskName: task.name,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error(`Gateway: ${response.status}`);
      const result = await response.json();
      return { exitCode: 0, output: JSON.stringify(result) };
    } catch (error) {
      if (error.code === "ECONNREFUSED")
        throw new Error(`Gateway 未运行: ${gatewayUrl}`);
      throw error;
    }
  }

  async executeWebhook(task) {
    try {
      const fetchOptions = {
        method: task.webhookMethod,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Stigmergy-Scheduler/1.0",
          ...task.webhookHeaders,
        },
      };
      if (task.webhookBody) {
        fetchOptions.body =
          typeof task.webhookBody === "string"
            ? task.webhookBody
            : JSON.stringify(task.webhookBody);
      }
      const response = await fetch(task.webhook, fetchOptions);
      const responseText = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        exitCode: 0,
        output: `Status: ${response.status}, Body: ${responseText.substring(0, 500)}`,
      };
    } catch (error) {
      if (error.code === "ECONNREFUSED")
        throw new Error(`Webhook 无法访问: ${task.webhook}`);
      throw error;
    }
  }

  async executeScript(task) {
    const scriptExt = path.extname(task.script);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`超时`)), task.timeout);
      let stdout = "",
        stderr = "";

      let cmd, args;
      if (this.platform.isWindows) {
        if (scriptExt === ".ps1") {
          cmd = "powershell.exe";
          args = [
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            task.script,
            ...task.scriptArgs,
          ];
        } else if (scriptExt === ".bat" || scriptExt === ".cmd") {
          cmd = "cmd.exe";
          args = ["/c", task.script, ...task.scriptArgs];
        } else {
          cmd = "node";
          args = [task.script, ...task.scriptArgs];
        }
      } else {
        if (scriptExt === ".sh") {
          cmd = "bash";
          args = [task.script, ...task.scriptArgs];
        } else if (scriptExt === ".py") {
          cmd = "python3";
          args = [task.script, ...task.scriptArgs];
        } else {
          cmd = "node";
          args = [task.script, ...task.scriptArgs];
        }
      }

      const child = spawn(cmd, args, {
        shell: false,
        timeout: task.timeout,
        maxBuffer: 10 * 1024 * 1024,
        encoding: "utf8",
      });

      child.stdout.on("data", (d) => (stdout += d.toString()));
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve({ exitCode: code, output: stdout.trim() });
        else reject(new Error(`退出码: ${code}`));
      });
      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.checkAndRunTasks(), 1000);
    this.emit("started");
  }

  stop() {
    if (!this.isRunning) return;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.emit("stopped");
  }

  checkAndRunTasks() {
    const now = new Date();
    for (const [id, task] of this.tasks) {
      if (!task.enabled || this.runningJobs.has(id) || !task.nextRun) continue;
      if (new Date(task.nextRun) <= now) {
        this.executeTask(task).catch(() => {});
        task.nextRun = this.getNextRunTime(task.cron);
        this.saveTask(task);
      }
    }
  }

  getTaskHistory(taskId = null, limit = 50) {
    return this.history.get(taskId, limit);
  }

  getStatus() {
    return {
      running: this.isRunning,
      platform: this.platform,
      taskCount: this.tasks.size,
      enabledTaskCount: Array.from(this.tasks.values()).filter((t) => t.enabled)
        .length,
      runningJobCount: this.runningJobs.size,
      nextScheduledTask: this.getNextScheduledTask(),
    };
  }

  getNextScheduledTask() {
    return (
      Array.from(this.tasks.values())
        .filter((t) => t.enabled && t.nextRun)
        .sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun))[0] || null
    );
  }

  saveTask(task) {
    const filePath = path.join(this.config.dataDir, "tasks", `${task.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(task, null, 2));
  }

  deleteTaskFile(id) {
    const filePath = path.join(this.config.dataDir, "tasks", `${id}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  loadAllTasks() {
    const tasksDir = path.join(this.config.dataDir, "tasks");
    if (!fs.existsSync(tasksDir)) return;

    const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const task = JSON.parse(
          fs.readFileSync(path.join(tasksDir, file), "utf8"),
        );
        if (task.enabled && task.cron) {
          task.nextRun = this.getNextRunTime(task.cron);
        }
        this.tasks.set(task.id, task);
      } catch (error) {
        console.error(`[Scheduler] 加载任务失败: ${file} - ${error.message}`);
      }
    }
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getNextRunTime(cron) {
    try {
      const interval = cronParser.parseExpression(cron, {
        tz: this.config.timezone,
      });
      return interval.next().toDate();
    } catch {
      return null;
    }
  }
}

module.exports = CronScheduler;
