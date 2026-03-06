/**
 * AutoSupervisor - CLI自动监督与进化系统
 *
 * 每10分钟检查各可用CLI的会话状态，当某个CLI空闲时，
 * 自动启动自动化学习与进化任务
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class AutoSupervisor {
  // 支持的CLI列表
  static get SUPPORTED_CLIS() {
    return [
      "claude",
      "qwen",
      "gemini",
      "iflow",
      "codex",
      "qoder",
      "codebuddy",
      "copilot",
    ];
  }

  constructor(options = {}) {
    // 检查间隔，默认10分钟
    this.checkIntervalMs = options.checkIntervalMs || 10 * 60 * 1000;
    // 空闲阈值，默认5分钟
    this.idleThresholdMs = options.idleThresholdMs || 5 * 60 * 1000;
    // 是否启用
    this.enabled = options.enabled !== false;

    // 进化任务超时，默认10分钟
    this.evolutionTimeoutMs = options.evolutionTimeoutMs || 10 * 60 * 1000;

    // 运行状态
    this.isRunning = false;
    // 定时器
    this.timer = null;
    // 进化历史记录
    this.evolutionHistory = [];

    // 支持的CLI列表
    this.supportedCLIs = AutoSupervisor.SUPPORTED_CLIS;
  }

  /**
   * 启动监督循环
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[AutoSupervisor] 🚀 已启动");

    // 开始定时检查
    this._scheduleCheck();
  }

  /**
   * 停止监督
   */
  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log("[AutoSupervisor] ⏹️ 已停止");
  }

  /**
   * 定时调度检查
   * @private
   */
  _scheduleCheck() {
    if (!this.isRunning) return;

    this.timer = setTimeout(async () => {
      await this.checkAllCLIs();
      this._scheduleCheck(); // 循环
    }, this.checkIntervalMs);
  }

  /**
   * 检查所有CLI状态
   */
  async checkAllCLIs() {
    console.log(`\n[${new Date().toISOString()}] 🔍 检查CLI状态...`);

    for (const cliName of this.supportedCLIs) {
      // 检查CLI是否可用
      if (!(await this.isCLIAvailable(cliName))) {
        continue;
      }

      // 获取CLI状态
      const status = await this.getCLIStatus(cliName);

      // 判断是否空闲
      if (this.isIdle(status)) {
        console.log(`   ✅ ${cliName} 空闲 → 启动自动化学习`);
        await this.triggerAutoLearn(cliName);
      } else {
        console.log(
          `   ⏳ ${cliName} ${status.state} (idle: ${status.idleTimeStr})`,
        );
      }
    }
  }

  /**
   * 检查CLI是否可用
   * @param {string} cliName
   * @returns {Promise<boolean>}
   * @private
   */
  async isCLIAvailable(cliName) {
    try {
      const { execSync } = require("child_process");
      const cmd =
        process.platform === "win32" ? `where ${cliName}` : `which ${cliName}`;
      execSync(cmd, { encoding: "utf-8", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取CLI状态
   * @param {string} cliName
   * @returns {Promise<Object>}
   * @private
   */
  async getCLIStatus(cliName) {
    // 简化实现：检查CLI进程是否在运行
    // 实际实现可以集成 PersistentCLIPool
    try {
      const { execSync } = require("child_process");
      const cmd =
        process.platform === "win32"
          ? `tasklist /FI "IMAGENAME eq ${cliName}.exe" /NH`
          : `pgrep -f ${cliName}`;

      const output = execSync(cmd, { encoding: "utf-8", timeout: 5000 });
      const isRunning = output.toLowerCase().includes(cliName.toLowerCase());

      return {
        cliName,
        state: isRunning ? "active" : "idle",
        hasPendingTask: false,
        idleTime: isRunning ? 0 : this.idleThresholdMs + 1,
        idleTimeStr: isRunning ? "0s" : "idle",
      };
    } catch {
      // CLI未运行，视为空闲
      return {
        cliName,
        state: "idle",
        hasPendingTask: false,
        idleTime: this.idleThresholdMs + 1,
        idleTimeStr: "idle",
      };
    }
  }

  /**
   * 判断CLI是否空闲
   * @param {Object} status - CLI状态对象
   * @returns {boolean}
   */
  isIdle(status) {
    if (!status) return false;
    // 空闲条件：无待处理任务 且 处于idle状态
    return status.state === "idle" && !status.hasPendingTask;
  }

  /**
   * 触发自动化学习
   * @param {string} cliName - CLI名称
   */
  async triggerAutoLearn(cliName) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const soulPath = path.join(home, ".stigmergy", "skills", cliName, "soul.md");
    
    // 如果soul.md不存在，先创建
    if (!fs.existsSync(soulPath)) {
      console.log(`[AutoSupervisor] 📝 ${cliName} 创建Soul...`);
      try {
        fs.mkdirSync(path.join(home, ".stigmergy", "skills", cliName), { recursive: true });
        
        const soulTemplate = `# Soul.md - AI智能体编排大师

## 身份 Identity
- **名称**: ${cliName.toUpperCase()}-Master
- **角色**: AI智能体编排大师
- **类型**: 自主进化型智能体

## 人格 Personality
- **核心特质**: 超强自驱力、持续学习、追求卓越
- **沟通风格**: 简洁专业

## 使命 Mission
- 持续学习和进化，保持行业领先
- 培育专业子智能体团队
- 不断优化和改进

## 愿景 Vision
- 短期: 掌握核心技能
- 中期: 打造高效团队
- 长期: 成为顶级AI智能体编排大师

## 专业知识域 Expertise
- **核心领域**: ${cliName}生态系统、智能体编排、自动化
- **知识深度**: 专家级

## 学习策略 Learning Strategy
- **频率**: 每日持续学习
- **进化机制**: 定期自检和复盘

---
*由AutoSupervisor自动创建*  
*时间: ${new Date().toISOString()}*
`;
        fs.writeFileSync(soulPath, soulTemplate, "utf8");
        console.log(`[AutoSupervisor] ✅ ${cliName} Soul已创建`);
      } catch (e) {
        console.log(`[AutoSupervisor] ⚠️ ${cliName} Soul创建失败: ${e.message}`);
        return { cliName, error: e.message };
      }
    }
    
    const startTime = Date.now();

    console.log(`[AutoSupervisor] 📚 ${cliName} 启动自动进化...`);

    return new Promise((resolve) => {
      // 正确解析 stigmergy 安装路径
      let stigmergyPath;
      
      // 优先使用环境变量中的路径
      const stigmergyRoot = process.env.STIGMERGY_ROOT || 
        path.join(process.env.HOME || process.env.USERPROFILE || "", ".stigmergy");
      
      // 尝试多种方式找到 stigmergy
      const possiblePaths = [
        // 1. 环境变量指定
        process.env.STIGMERGY_CLI_PATH,
        // 2. npm global 安装路径
        path.join(stigmergyRoot, "bin", "stigmergy"),
        // 3. 从 npm 获取全局路径
        process.platform === "win32" 
          ? path.join(stigmergyRoot, "bin", "stigmergy.cmd")
          : path.join(stigmergyRoot, "bin", "stigmergy"),
        // 4. 尝试直接调用 stigmergy 命令
        "stigmergy",
      ].filter(p => p);
      
      // 使用第一个存在的路径
      for (const p of possiblePaths) {
        if (p === "stigmergy") {
          stigmergyPath = "stigmergy";
          break;
        }
        if (fs.existsSync(p)) {
          stigmergyPath = p;
          break;
        }
      }
      
      // 如果都没找到，使用 "stigmergy" 作为后备（依赖 PATH）
      if (!stigmergyPath) {
        stigmergyPath = "stigmergy";
      }
      
      console.log(`[AutoSupervisor] 使用路径: ${stigmergyPath}`);
      
      // 构建命令
      const cmdArgs = stigmergyPath === "stigmergy" 
        ? ["soul", "evolve", cliName]
        : ["soul", "evolve", cliName];
      
      const proc = spawn(stigmergyPath, cmdArgs, {
        stdio: ["pipe", "pipe", "pipe"],
        shell: process.platform === "win32",
        detached: false,
        env: { 
          ...process.env, 
          // 确保 PATH 包含 npm 全局路径
          PATH: process.env.PATH 
        }
      });

      let output = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });
      proc.stderr.on("data", (data) => {
        output += data.toString();
      });

      proc.on("close", (code) => {
        const duration = Date.now() - startTime;
        const result = {
          cliName,
          code,
          duration,
          timestamp: new Date().toISOString(),
          output: output.slice(0, 500),
        };

        this.evolutionHistory.push(result);
        // 保留最近100条记录
        if (this.evolutionHistory.length > 100) {
          this.evolutionHistory = this.evolutionHistory.slice(-100);
        }

        if (code === 0) {
          console.log(
            `[AutoSupervisor] ✅ ${cliName} 进化完成 (${duration}ms)`,
          );
        } else {
          console.log(
            `[AutoSupervisor] ⚠️ ${cliName} 进化退出 (code:${code}, ${duration}ms)`,
          );
          // 打印错误输出用于调试
          if (output) {
            console.log(`   输出: ${output.slice(0, 200)}`);
          }
        }
        resolve(result);
      });

      // 超时处理
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill();
          console.log(`[AutoSupervisor] ⏱️ ${cliName} 进化超时`);
          resolve({ cliName, timeout: true });
        }
      }, this.evolutionTimeoutMs);
    });
  }

  /**
   * 获取运行状态
   * @returns {Object}
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkIntervalMs: this.checkIntervalMs,
      idleThresholdMs: this.idleThresholdMs,
      historyCount: this.evolutionHistory.length,
    };
  }
}

module.exports = AutoSupervisor;
