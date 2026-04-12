/**
 * SoulSystemScheduler - 系统级Soul调度器
 *
 * 核心功能：
 * 1. 使用系统cron定时触发（非进程内定时器）
 * 2. 检查CLI运行实例状态
 * 3. 查询当前任务计划
 * 4. 根据soul.md自动生成进化计划
 * 5. 触发各CLI的技能执行
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

class SoulSystemScheduler {
  constructor(options = {}) {
    this.cliName = options.cliName || "stigmergy";
    this.skillsPath = options.skillsPath || this._getDefaultSkillsPath();
    this.soulPath = path.join(this.skillsPath, "soul.md");

    // 调度配置
    this.config = {
      // 夜间 (23:00-7:00): 30分钟
      night: {
        enabled: true,
        cron: "*/30 * * * *", // 每30分钟
        offset: options.offsetMinutes || 0, // 偏移量，避免同时触发
      },
      // 白天 (7:00-23:00): 4小时
      day: {
        enabled: true,
        cron: "0 */4 * * *", // 每4小时
        offset: options.offsetMinutes || 0,
      },
      // 报告: 每天9点
      report: {
        enabled: true,
        cron: "0 9 * * *",
      },
      // 同步检查: 每5分钟
      sync: {
        enabled: true,
        cron: "*/5 * * * *",
      },
    };

    // 状态
    this.isRunning = false;
    this.currentMode = this._getCurrentMode();
    this.lastSyncTime = null;
    this.cronJobs = [];

    // CLI实例缓存
    this.cliInstances = new Map();
    this.taskPlans = new Map();

    // 进化计划
    this.evolutionPlan = null;
    this.lastEvolutionResult = null;
  }

  /**
   * 获取默认skills路径
   */
  _getDefaultSkillsPath() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(home, ".stigmergy", "skills");
  }

  /**
   * 获取当前模式 (day/night)
   */
  _getCurrentMode() {
    const hour = new Date().getHours();
    return hour >= 23 || hour < 7 ? "night" : "day";
  }

  /**
   * 检查soul.md是否存在
   */
  hasSoul() {
    return fs.existsSync(this.soulPath);
  }

  /**
   * 加载soul.md内容
   */
  loadSoul() {
    if (!this.hasSoul()) return null;
    return fs.readFileSync(this.soulPath, "utf8");
  }

  /**
   * 解析soul.md获取身份信息
   */
  parseSoulIdentity() {
    const content = this.loadSoul();
    if (!content) return null;

    const identity = {
      name: null,
      role: null,
      mission: null,
      expertise: [],
      personality: [],
    };

    // 解析关键字段
    const patterns = {
      name: /-\s*\*\*名称\*\*[:：]\s*(.+)/i,
      role: /-\s*\*\*角色\*\*[:：]\s*(.+)/i,
      mission: /-\s*\*\*终极目标\*\*[:：]\s*(.+)/i,
      expertise: /-\s*\*\*核心领域\*\*[:：]\s*(.+)/i,
      personality: /-\s*\*\*核心特质\*\*[:：]\s*(.+)/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        if (key === "expertise") {
          identity[key] = match[1].split(/[,，、]/).map((s) => s.trim());
        } else if (key === "personality") {
          identity[key] = match[1].split(/[,，、]/).map((s) => s.trim());
        } else {
          identity[key] = match[1].trim();
        }
      }
    }

    return identity;
  }

  /**
   * 扫描运行中的CLI实例
   */
  async scanCLIInstances() {
    this.cliInstances.clear();

    const knownCLIs = [
      "claude",
      "qwen",
      "gemini",
      "opencode",
      "iflow",
      "qoder",
      "codex",
      "kilocode",
      "codebuddy",
    ];

    // 检查各CLI进程
    for (const cli of knownCLIs) {
      try {
        // 使用tasklist (Windows) 或 ps (Unix)
        const cmd =
          process.platform === "win32"
            ? `tasklist /FI "IMAGENAME eq ${cli}*" /FO CSV /NH`
            : `pgrep -f "${cli}"`;

        const output = execSync(cmd, { encoding: "utf8", timeout: 5000 });
        const isRunning = output.trim().length > 0;

        if (isRunning) {
          this.cliInstances.set(cli, {
            running: true,
            pid: null, // 可以进一步解析
            lastSeen: new Date().toISOString(),
          });
        }
      } catch (e) {
        // 进程不存在是正常的
      }
    }

    return this.cliInstances;
  }

  /**
   * 检查CLI实例的当前任务
   */
  async getCLITaskStatus(cliName) {
    const status = {
      cli: cliName,
      running: false,
      currentTask: null,
      soulAligned: null,
      lastActivity: null,
    };

    // 检查进程
    try {
      const cmd =
        process.platform === "win32"
          ? `tasklist /FI "IMAGENAME eq ${cliName}*" /FO CSV /NH`
          : `pgrep -f "${cliName}"`;

      const output = execSync(cmd, { encoding: "utf8", timeout: 5000 });
      status.running = output.trim().length > 0;
    } catch (e) {
      status.running = false;
    }

    // 如果运行中，检查soul对齐状态
    if (status.running) {
      const soulStatusPath = path.join(
        process.env.HOME || process.env.USERPROFILE || "",
        ".stigmergy",
        "config",
        `soul-${cliName}.json`,
      );

      if (fs.existsSync(soulStatusPath)) {
        try {
          const soulStatus = JSON.parse(
            fs.readFileSync(soulStatusPath, "utf8"),
          );
          status.soulAligned = soulStatus.lastAlignmentScore || null;
          status.lastActivity = soulStatus.lastActivity || null;
        } catch (err) {
          const { PreconditionError } = require('./coordination/error_handler');
          const classified = new PreconditionError(err.message, { operation: 'loadSoulStatus', file: soulStatusPath });
          this._logger?.error(`[SoulSystemScheduler] PreconditionError: ${classified.message}`, { context: classified.context });
          this.dlq?.push(classified, { operation: 'loadSoulStatus' });
          throw classified;
        }
      }
    }

    return status;
  }

  /**
   * 加载当前任务计划
   */
  loadTaskPlans() {
    this.taskPlans.clear();

    const plansPath = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".stigmergy",
      "tasks",
    );

    if (!fs.existsSync(plansPath)) return this.taskPlans;

    // 加载所有任务计划文件
    const files = fs.readdirSync(plansPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const plan = JSON.parse(
            fs.readFileSync(path.join(plansPath, file), "utf8"),
          );
          this.taskPlans.set(file.replace(".json", ""), plan);
        } catch (err) {
          const { ValidationError } = require('./coordination/error_handler');
          const classified = new ValidationError(err.message, { operation: 'loadTaskPlans', file: path.join(plansPath, file) });
          this._logger?.error(`[SoulSystemScheduler] ValidationError: ${classified.message}`, { context: classified.context });
          this.dlq?.push(classified, { operation: 'loadTaskPlans' });
          // Don't throw — skip this plan, continue with others
        }
      }
    }

    return this.taskPlans;
  }

  /**
   * 根据当前状态生成进化计划
   */
  async generateEvolutionPlan() {
    if (!this.hasSoul()) {
      return { error: "No soul.md found" };
    }

    const identity = this.parseSoulIdentity();
    const cliStatus = await this.scanCLIInstances();
    const taskPlans = this.loadTaskPlans();

    // 生成计划
    const plan = {
      id: `evo_${Date.now()}`,
      createdAt: new Date().toISOString(),
      basedOn: {
        soulIdentity: identity.name,
        soulRole: identity.role,
        runningCLIs: Array.from(cliStatus.keys()),
        activePlans: taskPlans.size,
      },

      // 目标 - 从soul.md提取
      goals: [
        {
          id: "goal_1",
          type: "learn",
          description: `深化${identity.expertise[0] || "核心领域"}知识`,
          priority: "high",
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "goal_2",
          type: "align",
          description: "验证与soul.md人格一致性",
          priority: "medium",
          deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
      ],

      // 任务 - 基于当前状态
      tasks: [],

      // 建议
      recommendations: [],
    };

    // 分析运行中的CLI，生成对应任务
    for (const [cli, info] of cliStatus) {
      if (info.running) {
        plan.tasks.push({
          id: `task_${cli}`,
          cli: cli,
          action: "evolve",
          description: `在${cli}上执行soul进化`,
          prerequisites: [],
          estimatedTime: "5m",
        });
      }
    }

    // 如果有活跃计划，添加整合任务
    if (taskPlans.size > 0) {
      plan.tasks.push({
        id: "task_integrate",
        action: "integrate",
        description: "整合现有任务计划",
        prerequisites: plan.tasks.map((t) => t.id),
        estimatedTime: "2m",
      });
    }

    // 生成建议
    if (cliStatus.size === 0) {
      plan.recommendations.push("建议启动至少一个CLI以执行soul进化");
    }

    if (!identity.name) {
      plan.recommendations.push("soul.md缺少身份信息，建议补充");
    }

    this.evolutionPlan = plan;
    return plan;
  }

  /**
   * 执行进化
   */
  async executeEvolution() {
    console.log("[SoulSystemScheduler] 🔄 Starting evolution...");

    // 1. 检查当前状态
    const cliStatus = await this.scanCLIInstances();
    console.log(
      `   Running CLIs: ${Array.from(cliStatus.keys()).join(", ") || "none"}`,
    );

    // 2. 加载任务计划
    const taskPlans = this.loadTaskPlans();
    console.log(`   Active plans: ${taskPlans.size}`);

    // 3. 生成进化计划
    const plan = await this.generateEvolutionPlan();
    console.log(`   Evolution plan: ${plan.id}`);

    // 4. 对齐检查
    const alignment = await this.checkSoulAlignment();
    console.log(`   Soul alignment: ${Math.round(alignment.score * 100)}%`);

    // 5. 触发各CLI执行技能
    const results = [];
    for (const [cli, info] of cliStatus) {
      try {
        const result = await this.triggerCLIEvolution(cli, plan);
        results.push({ cli, success: true, result });
      } catch (e) {
        results.push({ cli, success: false, error: e.message });
      }
    }

    // 6. 记录结果
    this.lastEvolutionResult = {
      timestamp: new Date().toISOString(),
      plan: plan.id,
      alignment: alignment.score,
      results,
    };

    // 保存结果
    this._saveEvolutionResult();

    return this.lastEvolutionResult;
  }

  /**
   * 对齐检查
   */
  async checkSoulAlignment() {
    const identity = this.parseSoulIdentity();
    if (!identity) {
      return { aligned: false, score: 0, reason: "No soul.md" };
    }

    // 检查配置文件
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".stigmergy",
      "config",
      `soul-${this.cliName}.json`,
    );

    let lastAlignment = 0.8; // 默认
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        lastAlignment = config.lastAlignmentScore || 0.8;
      } catch (err) {
        const { ValidationError } = require('./coordination/error_handler');
        const classified = new ValidationError(err.message, { operation: 'loadAlignmentConfig', file: configPath });
        this._logger?.error(`[SoulSystemScheduler] ValidationError: ${classified.message}`, { context: classified.context });
        this.dlq?.push(classified, { operation: 'loadAlignmentConfig' });
        // Return default alignment 0.8, don't throw
      }
    }

    // 检查当前模式
    const currentMode = this._getCurrentMode();
    const isAligned = lastAlignment >= 0.7;

    return {
      aligned: isAligned,
      score: lastAlignment,
      mode: currentMode,
      identity: identity.name,
    };
  }

  /**
   * 触发CLI执行进化
   */
  async triggerCLIEvolution(cliName, plan) {
    // 使用stigmergy命令触发
    const cmd = process.platform === "win32" ? "stigmergy" : "stigmergy";

    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, ["soul", "evolve", cliName], {
        stdio: "pipe",
        detached: false,
      });

      let output = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Exit code: ${code}`));
        }
      });

      proc.on("error", reject);

      // 超时
      setTimeout(() => {
        proc.kill();
        resolve("Timeout");
      }, 60000);
    });
  }

  /**
   * 保存进化结果
   */
  _saveEvolutionResult() {
    const resultsDir = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".stigmergy",
      "evolution",
    );

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filePath = path.join(resultsDir, `evolution_${Date.now()}.json`);
    fs.writeFileSync(
      filePath,
      JSON.stringify(this.lastEvolutionResult, null, 2),
    );
  }

  /**
   * 安装系统定时任务 (cron)
   */
  installCronJobs() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const scriptPath = path.join(home, ".stigmergy", "bin", "soul-evolve.sh");
    const logPath = path.join(home, ".stigmergy", "logs", "soul-evolve.log");

    // 创建脚本
    const script = `#!/bin/bash
# Soul Evolution Cron Job
# Generated by SoulSystemScheduler

SOUL_HOME="${home}/.stigmergy"
LOG_FILE="${logPath}"

echo "$(date): Running soul evolution..." >> $LOG_FILE
node "$SOUL_HOME/bin/soul-evolve.js" >> $LOG_FILE 2>&1
`;

    // 写入脚本
    const binDir = path.dirname(scriptPath);
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }
    fs.writeFileSync(scriptPath, script);

    // 设置执行权限
    try {
      fs.chmodSync(scriptPath, "755");
    } catch (err) {
      const { ProcessError } = require('./coordination/error_handler');
      const classified = new ProcessError(err.message, { operation: 'chmodScript', file: scriptPath });
      this._logger?.warn(`[SoulSystemScheduler] ProcessError (non-critical): ${classified.message}`, { context: classified.context });
      this.dlq?.push(classified, { operation: 'chmodScript' });
      // Don't throw — chmod failure is non-critical
    }

    // 添加crontab
    const cronEntry = `*/30 * * * * ${scriptPath}`;

    try {
      const currentCrontab = execSync("crontab -l", { encoding: "utf8" });
      if (!currentCrontab.includes("soul-evolve.sh")) {
        execSync(`echo "${cronEntry}" | crontab -`);
      }
    } catch (e) {
      // crontab为空或不存在
      execSync(`echo "${cronEntry}" | crontab -`);
    }

    console.log("[SoulSystemScheduler] ✅ Cron jobs installed");
    return true;
  }

  /**
   * 卸载系统定时任务
   */
  uninstallCronJobs() {
    try {
      const currentCrontab = execSync("crontab -l", { encoding: "utf8" });
      const lines = currentCrontab
        .split("\n")
        .filter((line) => !line.includes("soul-evolve.sh"));
      execSync(`echo "${lines.join("\n")}" | crontab -`);
      console.log("[SoulSystemScheduler] ✅ Cron jobs uninstalled");
    } catch (err) {
      const { ProcessError } = require('./coordination/error_handler');
      const classified = new ProcessError(err.message, { operation: 'uninstallCron' });
      this._logger?.warn(`[SoulSystemScheduler] ProcessError (non-critical): ${classified.message}`, { context: classified.context });
      this.dlq?.push(classified, { operation: 'uninstallCron' });
      // Don't throw — cron uninstall failure is non-critical
    }
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      running: this.isRunning,
      currentMode: this.currentMode,
      hasSoul: this.hasSoul(),
      identity: this.parseSoulIdentity(),
      runningCLIs: Array.from(this.cliInstances.keys()),
      activePlans: this.taskPlans.size,
      lastEvolution: this.lastEvolutionResult?.timestamp,
      nextEvolve: this._getNextEvolveTime(),
    };
  }

  /**
   * 获取下次进化时间
   */
  _getNextEvolveTime() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 23 || hour < 7) {
      // 夜间模式: 30分钟后
      return new Date(now.getTime() + 30 * 60 * 1000);
    } else {
      // 白天模式: 下个4小时
      const next = new Date(now);
      next.setHours(Math.ceil(hour / 4) * 4, 0, 0, 0);
      if (next <= now) {
        next.setHours(next.getHours() + 4);
      }
      return next;
    }
  }
}

module.exports = SoulSystemScheduler;
