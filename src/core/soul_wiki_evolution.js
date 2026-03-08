/**
 * SoulWikiEvolution - Wiki风格的顺序进化机制
 *
 * 设计原则：
 * 1. 时间完全错开 - 伪并发，无真正同时执行
 * 2. 相互核查 - 每个CLI进化后验证其他CLI的知识
 * 3. 共识裁决 - 冲突时用majority vote
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class SoulWikiEvolution {
  constructor(options = {}) {
    this.cliList = options.cliList || [
      "claude",
      "qwen",
      "opencode",
      "gemini",
      "iflow",
      "qoder",
      "codex",
    ];
    this.currentIndex = 0;
    this.evolutionHistory = [];
    this.knowledgeStore = {};
    this.basePath = options.basePath || this._getDefaultBasePath();

    // 共识配置
    this.config = {
      // 每次进化的CLI数量 (1 = 完全顺序)
      concurrentLimit: 1,
      // 进化间隔 (毫秒)
      evolutionIntervalMs: options.evolutionIntervalMs || 5 * 60 * 1000, // 5分钟
      // 验证等待时间
      verifyWaitMs: options.verifyWaitMs || 2 * 60 * 1000, // 2分钟
      // 共识阈值 (超过此比例则接受)
      consensusThreshold: 0.6,
      // 最大知识条目
      maxKnowledgeEntries: 1000,
      // 知识来源权重
      sourceWeights: {
        official: 1.0,
        paper: 0.9,
        community: 0.7,
        blog: 0.5,
        manual: 0.8,
      },
    };

    // 状态
    this.isRunning = false;
    this.lastEvolution = null;
    this.pendingVerifications = [];
  }

  _getDefaultBasePath() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(home, ".stigmergy", "skills");
  }

  /**
   * 启动Wiki风格进化循环
   */
  async start(options = {}) {
    if (this.isRunning) {
      console.log("[SoulWiki] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[SoulWiki] Starting wiki-style evolution");
    console.log("  Mode: Sequential (one CLI at a time)");
    console.log(`  CLI order: ${this.cliList.join(" → ")}`);

    // 加载现有知识库
    await this._loadKnowledgeStore();

    // 开始循环
    this._runEvolutionLoop();
  }

  /**
   * 停止进化
   */
  stop() {
    this.isRunning = false;
    console.log("[SoulWiki] Stopped");
  }

  /**
   * 进化循环
   */
  async _runEvolutionLoop() {
    while (this.isRunning) {
      // 获取下一个CLI
      const cliName = this.cliList[this.currentIndex];

      console.log(
        `\n[SoulWiki] === Turn: ${cliName} (${this.currentIndex + 1}/${this.cliList.length}) ===`,
      );

      try {
        // 1. 当前CLI进化
        const result = await this._evolveCLI(cliName);

        // 2. 验证其他CLI的知识 (相互核查)
        await this._verifyWithOthers(cliName, result);

        // 3. 记录历史
        this._recordHistory(cliName, result);

        // 4. 更新索引
        this.currentIndex = (this.currentIndex + 1) % this.cliList.length;
      } catch (error) {
        console.error(`[SoulWiki] Error for ${cliName}:`, error.message);
      }

      // 等待下一个进化周期
      await this._sleep(this.config.evolutionIntervalMs);
    }
  }

  /**
   * 执行单个CLI的进化
   */
  async _evolveCLI(cliName) {
    return new Promise((resolve, reject) => {
      const output = [];

      const proc = spawn("stigmergy", ["soul", "evolve", cliName], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      proc.stdout.on("data", (data) => {
        output.push(data.toString());
      });

      proc.stderr.on("data", (data) => {
        output.push(data.toString());
      });

      proc.on("close", (code) => {
        const result = {
          cliName,
          success: code === 0,
          output: output.join(""),
          timestamp: new Date().toISOString(),
          knowledgeAdded: this._parseKnowledgeAdded(output.join("")),
        };
        resolve(result);
      });

      proc.on("error", reject);

      // 超时 5分钟
      setTimeout(
        () => {
          proc.kill();
          resolve({
            cliName,
            success: false,
            output: "Timeout",
            timestamp: new Date().toISOString(),
          });
        },
        5 * 60 * 1000,
      );
    });
  }

  /**
   * 解析进化输出的知识数量
   */
  _parseKnowledgeAdded(output) {
    const match = output.match(/Knowledge added:\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 加载知识库
   */
  async _loadKnowledgeStore() {
    const storePath = path.join(
      this.basePath,
      ".soul_wiki",
      "knowledge_store.json",
    );

    if (fs.existsSync(storePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        this.knowledgeStore = data.entries || {};
        console.log(
          `[SoulWiki] Loaded ${Object.keys(this.knowledgeStore).length} knowledge entries`,
        );
      } catch (e) {
        console.warn("[SoulWiki] Failed to load knowledge store:", e.message);
      }
    }
  }

  /**
   * 保存知识库
   */
  async _saveKnowledgeStore() {
    const storeDir = path.join(this.basePath, ".soul_wiki");

    if (!fs.existsSync(storeDir)) {
      fs.mkdirSync(storeDir, { recursive: true });
    }

    const storePath = path.join(storeDir, "knowledge_store.json");
    fs.writeFileSync(
      storePath,
      JSON.stringify(
        {
          entries: this.knowledgeStore,
          lastUpdate: new Date().toISOString(),
          version: "1.0.0",
        },
        null,
        2,
      ),
      "utf-8",
    );
  }

  /**
   * 相互核查 - 让其他CLI验证新添加的知识
   */
  async _verifyWithOthers(evolvedCLI, result) {
    if (!result.success || result.knowledgeAdded === 0) {
      console.log(`[SoulWiki] No new knowledge to verify for ${evolvedCLI}`);
      return;
    }

    console.log("[SoulWiki] Verifying with other CLIs...");

    const otherCLIs = this.cliList.filter((c) => c !== evolvedCLI);
    const verifications = [];

    // 并行请求其他CLI验证 (但不写入)
    const verifyPromises = otherCLIs.slice(0, 3).map(async (cliName) => {
      try {
        const verification = await this._requestVerification(
          cliName,
          evolvedCLI,
        );
        return { cliName, verification, success: true };
      } catch (e) {
        return { cliName, verification: null, success: false };
      }
    });

    const results = await Promise.all(verifyPromises);

    // 统计验证结果
    const agreeCount = results.filter(
      (r) => r.success && r.verification?.agreed,
    ).length;
    const totalCount = results.filter((r) => r.success).length;
    const consensus = totalCount > 0 ? agreeCount / totalCount : 0;

    console.log(
      `[SoulWiki] Verification: ${agreeCount}/${totalCount} agreed (${(consensus * 100).toFixed(0)}%)`,
    );

    // 共识决策
    if (consensus >= this.config.consensusThreshold) {
      console.log("[SoulWiki] ✅ Consensus reached - knowledge accepted");
      result.consensus = "accepted";
    } else if (consensus >= 0.3) {
      console.log("[SoulWiki] ⚠️ Partial consensus - knowledge needs review");
      result.consensus = "review";
      // 标记待审查
      await this._flagForReview(result);
    } else {
      console.log("[SoulWiki] ❌ No consensus - knowledge rejected");
      result.consensus = "rejected";
      // 移除刚添加的知识
      await this._rejectKnowledge(result);
    }
  }

  /**
   * 请求其他CLI验证
   */
  async _requestVerification(cliName, evolvedCLI) {
    return new Promise((resolve, reject) => {
      const proc = spawn(
        "stigmergy",
        ["soul", "check", `--source=${evolvedCLI}`],
        {
          stdio: ["pipe", "pipe", "pipe"],
        },
      );

      let output = "";
      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.on("close", (code) => {
        // 简单解析 - 如果输出包含 "aligned" 则同意
        const agreed = output.includes("aligned") || output.includes("pass");
        resolve({ agreed, output });
      });

      proc.on("error", reject);
      setTimeout(() => {
        proc.kill();
        resolve({ agreed: false, output: "timeout" });
      }, 30000);
    });
  }

  /**
   * 标记待审查
   */
  async _flagForReview(result) {
    const reviewDir = path.join(this.basePath, ".soul_wiki", "review");
    if (!fs.existsSync(reviewDir)) {
      fs.mkdirSync(reviewDir, { recursive: true });
    }

    const reviewFile = path.join(
      reviewDir,
      `${result.cliName}_${Date.now()}.json`,
    );
    fs.writeFileSync(reviewFile, JSON.stringify(result, null, 2), "utf-8");
    console.log(`[SoulWiki] Flagged for review: ${reviewFile}`);
  }

  /**
   * 拒绝知识 (回滚)
   */
  async _rejectKnowledge(result) {
    // 简单策略：删除最近添加的条目
    const storePath = path.join(
      this.basePath,
      ".soul_kb",
      `${result.cliName}_kb.json`,
    );
    if (fs.existsSync(storePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        // 移除最近添加的条目
        if (data.entries && data.entries.length > 0) {
          data.entries.pop(); // 移除最后一个
          fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
          console.log(
            `[SoulWiki] Rejected latest knowledge from ${result.cliName}`,
          );
        }
      } catch (e) {
        console.error("[SoulWiki] Failed to reject knowledge:", e.message);
      }
    }
  }

  /**
   * 记录历史
   */
  _recordHistory(cliName, result) {
    this.evolutionHistory.push({
      cliName,
      timestamp: result.timestamp,
      success: result.success,
      knowledgeAdded: result.knowledgeAdded,
      consensus: result.consensus || "unknown",
    });

    // 只保留最近100条
    if (this.evolutionHistory.length > 100) {
      this.evolutionHistory = this.evolutionHistory.slice(-100);
    }

    // 保存历史
    const historyPath = path.join(
      this.basePath,
      ".soul_wiki",
      "evolution_history.json",
    );
    fs.writeFileSync(
      historyPath,
      JSON.stringify(this.evolutionHistory, null, 2),
      "utf-8",
    );
  }

  /**
   * 获取下一个CLI (轮流转)
   */
  _getNextCLI() {
    const cli = this.cliList[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.cliList.length;
    return cli;
  }

  /**
   * 手动触发一轮进化
   */
  async triggerRound() {
    console.log("[SoulWiki] Manual trigger - single round");

    const cliName = this._getNextCLI();
    console.log(`[SoulWiki] Evolving: ${cliName}`);

    const result = await this._evolveCLI(cliName);
    await this._verifyWithOthers(cliName, result);
    this._recordHistory(cliName, result);

    return result;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentCLI: this.cliList[this.currentIndex],
      cliList: this.cliList,
      historyCount: this.evolutionHistory.length,
      lastEvolution: this.evolutionHistory[this.evolutionHistory.length - 1],
    };
  }

  /**
   * 睡眠
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = SoulWikiEvolution;
