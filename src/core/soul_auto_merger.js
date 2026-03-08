/**
 * SoulAutoMerger - LLM驱动的智能合并
 *
 * 每次进化后由LLM决定是否合并
 *
 * 合并策略:
 * 1. 知识重复度超过阈值
 * 2. 超过指定时间未合并
 * 3. LLM判断需要合并
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE_PATH = path.join(HOME, ".stigmergy", "skills");

class SoulAutoMerger {
  constructor(options = {}) {
    this.config = {
      // 重复度阈值 (0-1)
      dedupThreshold: options.dedupThreshold || 0.3,
      // 强制合并间隔 (毫秒)
      forceMergeIntervalMs: options.forceMergeIntervalMs || 24 * 60 * 60 * 1000, // 24小时
      // 最小条目数 (少于不合并)
      minEntries: options.minEntries || 10,
      // 是否启用LLM决策
      useLLMDecision: options.useLLMDecision !== false,
      // LLM决策超时 (毫秒)
      llmTimeoutMs: options.llmTimeoutMs || 30000,
    };

    this.lastMergeTime = this._loadLastMergeTime();
    this.mergeHistory = [];

    // 确保wiki目录存在
    const wikiDir = path.join(BASE_PATH, ".soul_wiki");
    if (!fs.existsSync(wikiDir)) {
      fs.mkdirSync(wikiDir, { recursive: true });
    }
  }

  /**
   * 进化后自动调用 - LLM决策是否合并
   */
  async autoMergeAfterEvolution(cliName, evolutionResult) {
    console.log(`\n🤔 [AutoMerger] Evaluating merge for ${cliName}...`);

    // 1. 检查是否满足强制合并条件
    const shouldForceMerge = this._shouldForceMerge();
    if (shouldForceMerge) {
      console.log("[AutoMerger] ⏰ Force merge triggered (time interval)");
      return await this._executeMerge();
    }

    // 2. 检查知识重复度
    const duplication = await this._checkDuplication();
    if (duplication > this.config.dedupThreshold) {
      console.log(
        `[AutoMerger] 🔄 High duplication (${(duplication * 100).toFixed(1)}%) - merging`,
      );
      return await this._executeMerge();
    }

    // 3. LLM决策 (如果启用)
    if (this.config.useLLMDecision) {
      const llmDecision = await this._askLLM(
        cliName,
        evolutionResult,
        duplication,
      );
      if (llmDecision.shouldMerge) {
        console.log(
          `[AutoMerger] 🧠 LLM decided to merge: ${llmDecision.reason}`,
        );
        return await this._executeMerge();
      } else {
        console.log(
          `[AutoMerger] 🧠 LLM decided not to merge: ${llmDecision.reason}`,
        );
      }
    }

    console.log("[AutoMerger] ✅ No merge needed");
    return { merged: false, reason: "not-needed" };
  }

  /**
   * 是否强制合并
   */
  _shouldForceMerge() {
    const timeSinceLastMerge = Date.now() - (this.lastMergeTime || 0);
    return timeSinceLastMerge > this.config.forceMergeIntervalMs;
  }

  /**
   * 检查跨CLI知识重复度
   */
  async _checkDuplication() {
    const cliKBs = await this._loadAllKBs();

    if (cliKBs.length < 2) return 0;

    // 收集所有关键词
    const keywordMap = new Map();
    let totalKeywords = 0;

    for (const kb of cliKBs) {
      for (const entry of kb.entries) {
        for (const kw of entry.keywords || []) {
          totalKeywords++;
          if (!keywordMap.has(kw)) {
            keywordMap.set(kw, new Set());
          }
          keywordMap.get(kw).add(kb.cli);
        }
      }
    }

    // 统计重复
    let duplicatedKeywords = 0;
    for (const [, clis] of keywordMap) {
      if (clis.size > 1) {
        duplicatedKeywords++;
      }
    }

    return totalKeywords > 0 ? duplicatedKeywords / totalKeywords : 0;
  }

  /**
   * 加载所有CLI知识库
   */
  async _loadAllKBs() {
    const cliList = [
      "claude",
      "qwen",
      "opencode",
      "gemini",
      "iflow",
      "qoder",
      "codex",
    ];
    const kbs = [];

    for (const cli of cliList) {
      const kbPath = path.join(BASE_PATH, ".soul_kb", `${cli}_kb.json`);
      if (fs.existsSync(kbPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(kbPath, "utf-8"));
          kbs.push({ cli, entries: data.entries || [] });
        } catch (e) {}
      }
    }

    return kbs;
  }

  /**
   * 请求LLM决策
   */
  async _askLLM(cliName, evolutionResult, duplication) {
    const prompt = this._buildMergePrompt(
      cliName,
      evolutionResult,
      duplication,
    );

    return new Promise((resolve) => {
      const proc = spawn("stigmergy", ["call", prompt], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      proc.stdout.on("data", (d) => (output += d.toString()));
      proc.stderr.on("data", (d) => (output += d.toString()));

      proc.on("close", () => {
        // 解析LLM响应
        const shouldMerge =
          output.toLowerCase().includes("merge") ||
          output.toLowerCase().includes("yes") ||
          duplication > 0.5;

        resolve({
          shouldMerge,
          reason: output.substring(0, 200),
          fullResponse: output,
        });
      });

      setTimeout(() => {
        proc.kill();
        resolve({ shouldMerge: false, reason: "timeout", fullResponse: "" });
      }, this.config.llmTimeoutMs);
    });
  }

  /**
   * 构建LLM决策prompt
   */
  _buildMergePrompt(cliName, evolutionResult, duplication) {
    return `你是知识库合并决策助手。
    
当前状态:
- 触发进化的CLI: ${cliName}
- 新增知识: ${evolutionResult.knowledgeAdded}条
- 跨CLI知识重复度: ${(duplication * 100).toFixed(1)}%
- 距离上次合并: ${this.lastMergeTime ? Math.round((Date.now() - this.lastMergeTime) / 1000 / 60) + "分钟" : "未知"}

请回复是否需要合并知识库?
- 如果重复度高或多CLI有新知识,回复 "merge"
- 否则回复 "no merge"

只回复一个词，不要其他内容。`;
  }

  /**
   * 执行合并
   */
  async _executeMerge() {
    console.log("\n🔄 [AutoMerger] Executing merge...");

    // 使用已有的SoulMerger
    const SoulMerger = require("./soul_merger");
    const merger = new SoulMerger();

    // 找到所有soul
    const souls = await this._findAllSouls();
    const results = [];

    for (const soul of souls) {
      const result = await merger.merge(soul);
      results.push(result);
    }

    // 更新上次合并时间
    this.lastMergeTime = Date.now();
    this._saveLastMergeTime();

    return { merged: true, results };
  }

  /**
   * 查找所有soul
   */
  async _findAllSouls() {
    if (!fs.existsSync(BASE_PATH)) return [];

    const souls = [];
    const entries = fs.readdirSync(BASE_PATH, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const soulPath = path.join(BASE_PATH, entry.name, "soul.md");
        if (fs.existsSync(soulPath)) {
          souls.push(entry.name);
        }
      }
    }

    return souls;
  }

  /**
   * 加载上次合并时间
   */
  _loadLastMergeTime() {
    const stateFile = path.join(BASE_PATH, ".soul_wiki", "merge_state.json");
    if (fs.existsSync(stateFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        return data.lastMergeTime;
      } catch (e) {}
    }
    return null;
  }

  /**
   * 保存上次合并时间
   */
  _saveLastMergeTime() {
    const stateFile = path.join(BASE_PATH, ".soul_wiki", "merge_state.json");
    const dir = path.dirname(stateFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      stateFile,
      JSON.stringify({ lastMergeTime: this.lastMergeTime }, null, 2),
    );
  }
}

module.exports = SoulAutoMerger;
