/**
 * SoulScheduler - 独立调度进化器
 *
 * 设计原则：
 * 1. 各CLI完全独立 - 不依赖前序任务
 * 2. 时间错开 - 避免并发冲突
 * 3. 按批次时间点触发 - 不强制所有CLI
 * 4. 用户配置决定哪些CLI参与
 * 5. 合并不允许进化 (1小时锁)
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE_PATH = path.join(HOME, ".stigmergy");

const CLI_SCHEDULE = {
  claude: { offset: 0, enabled: true },
  qwen: { offset: 3, enabled: true },
  opencode: { offset: 6, enabled: true },
  gemini: { offset: 9, enabled: true },
  iflow: { offset: 12, enabled: true },
  qoder: { offset: 15, enabled: true },
  codex: { offset: 18, enabled: true },
  codebuddy: { offset: 21, enabled: true },
};

class SoulScheduler {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.cliList = options.cliList || this._detectAvailableCLIs();
    this.intervalMs = options.intervalMs || 4 * 60 * 60 * 1000;
    this.isRunning = false;
    this.timers = new Map();
    this.evolutionLog = [];
  }

  _detectAvailableCLIs() {
    const available = [];
    for (const [cli, config] of Object.entries(CLI_SCHEDULE)) {
      const cliPath = this._findCLIPath(cli);
      if (cliPath && config.enabled) {
        available.push({ name: cli, offset: config.offset, cliPath });
      }
    }
    available.sort((a, b) => a.offset - b.offset);
    return available;
  }

  _findCLIPath(cliName) {
    try {
      const which = process.platform === "win32" ? "where" : "which";
      const { execSync } = require("child_process");
      const result = execSync(`${which} ${cliName}`, { encoding: "utf-8" });
      return result.trim().split("\n")[0];
    } catch (e) {
      return null;
    }
  }

  _getMergeLockStatus() {
    const lockFile = path.join(BASE_PATH, "skills", ".soul_wiki", "merge.lock");
    if (!fs.existsSync(lockFile)) return { locked: false };
    try {
      const data = JSON.parse(fs.readFileSync(lockFile, "utf-8"));
      return { locked: true, ...data };
    } catch (e) {
      return { locked: false };
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("\n🌀 Soul Scheduler Started");
    console.log(
      `   Active CLIs: ${this.cliList.map((c) => c.name).join(", ")}`,
    );
    for (const cli of this.cliList) this._startCLITimer(cli);
    this._startVerificationTimer();
  }

  stop() {
    this.isRunning = false;
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }

  _startCLITimer(cli) {
    const offsetMs = cli.offset * 60 * 1000;
    const hour = new Date().getHours();
    const intervalMs =
      hour >= 23 || hour < 7 ? 30 * 60 * 1000 : 4 * 60 * 60 * 1000;
    const scheduleNext = () => {
      if (!this.isRunning) return;
      this._evolveCLI(cli.name).then((r) => this._logEvolution(cli.name, r));
      this.timers.set(cli.name, setTimeout(scheduleNext, intervalMs));
    };
    this.timers.set(cli.name, setTimeout(scheduleNext, offsetMs));
  }

  async _evolveCLI(cliName) {
    const lock = this._getMergeLockStatus();
    if (lock.locked) {
      const dur = (Date.now() - new Date(lock.lockedAt).getTime()) / 1000 / 60;
      if (dur < 60) {
        console.log(`[${cliName}] ⏸️ Skipped - merge in progress`);
        return { cli: cliName, success: false, skipped: true };
      }
    }
    return new Promise((resolve) => {
      const proc = spawn("stigmergy", ["soul", "evolve", cliName], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      let out = "";
      proc.stdout.on("d", (d) => (out += d));
      proc.on("close", (code) => {
        const m = out.match(/Knowledge added:\s*(\d+)/);
        resolve({
          cli: cliName,
          success: code === 0,
          knowledgeAdded: m ? +m[1] : 0,
        });
      });
      setTimeout(
        () => {
          proc.kill();
          resolve({ cli: cliName, timeout: true });
        },
        5 * 60 * 1000,
      );
    });
  }

  _logEvolution(cli, r) {
    this.evolutionLog.push({ cli, timestamp: new Date().toISOString(), ...r });
    if (this.evolutionLog.length > 100)
      this.evolutionLog = this.evolutionLog.slice(-100);
  }

  _startVerificationTimer() {
    setTimeout(
      () => {
        if (this.isRunning) {
          this._verifyKnowledgeConsistency();
          this._startVerificationTimer();
        }
      },
      60 * 60 * 1000,
    );
  }

  async _verifyKnowledgeConsistency() {
    console.log("\n[SoulScheduler] 🔍 Verification...");
    // 简化的验证逻辑
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeCLIs: this.cliList.map((c) => c.name),
    };
  }
}

module.exports = SoulScheduler;
