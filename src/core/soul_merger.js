/**
 * SoulMerger - 知识库合并器
 *
 * 最佳实践:
 * 1. 每天0时开始合并 (定时任务)
 * 2. 合并期间锁定 - 禁止进化
 * 3. 合并后解锁
 * 4. 合并不阻塞主进程 (异步)
 */

const fs = require("fs");
const path = require("path");

const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE_PATH = path.join(HOME, ".stigmergy", "skills");
const WIKI_PATH = path.join(BASE_PATH, ".soul_wiki");

// 合并锁文件
const LOCK_FILE = path.join(WIKI_PATH, "merge.lock");

class SoulMerger {
  constructor() {
    this.mergeHistory = [];
    this._loadHistory();
  }

  /**
   * 检查是否可以合并 (无锁)
   */
  canMerge() {
    return !fs.existsSync(LOCK_FILE);
  }

  /**
   * 获取锁
   */
  acquireLock() {
    if (fs.existsSync(LOCK_FILE)) {
      return false;
    }

    fs.writeFileSync(
      LOCK_FILE,
      JSON.stringify({
        lockedAt: new Date().toISOString(),
        pid: process.pid,
      }),
      "utf-8",
    );

    return true;
  }

  /**
   * 释放锁
   */
  releaseLock() {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  }

  /**
   * 获取锁状态
   */
  getLockStatus() {
    if (!fs.existsSync(LOCK_FILE)) {
      return { locked: false };
    }

    try {
      const data = JSON.parse(fs.readFileSync(LOCK_FILE, "utf-8"));
      return { locked: true, ...data };
    } catch (e) {
      return { locked: false };
    }
  }

  /**
   * 执行合并 (对指定soul)
   */
  async merge(soulName) {
    // 1. 检查锁
    if (!this.acquireLock()) {
      console.log("[Merger] ❌ Merge already in progress, skipped");
      return { success: false, reason: "locked" };
    }

    console.log(`\n🔄 [Merger] Starting merge for: ${soulName}`);
    console.log("   Lock acquired\n");

    try {
      // 2. 找到所有使用该soul的CLI
      const cliKBs = await this._findCLIKnowledgeBases(soulName);

      if (cliKBs.length === 0) {
        console.log("[Merger] No knowledge bases found");
        return { success: false, reason: "no-kb" };
      }

      console.log(`[Merger] Found ${cliKBs.length} sources:`);
      cliKBs.forEach((kb) =>
        console.log(`   - ${kb.cli}: ${kb.entries.length} entries`),
      );
      console.log("");

      // 3. 合并
      const merged = this._mergeKnowledgeBases(cliKBs);

      // 4. 保存合并结果
      const mergedPath = await this._saveMergedKB(soulName, merged);

      // 5. 记录历史
      const result = {
        soulName,
        timestamp: new Date().toISOString(),
        sources: cliKBs.map((kb) => kb.cli),
        originalTotal: cliKBs.reduce((sum, kb) => sum + kb.entries.length, 0),
        mergedTotal: merged.entries.length,
        deduplicated:
          cliKBs.reduce((sum, kb) => sum + kb.entries.length, 0) -
          merged.entries.length,
        path: mergedPath,
      };

      this._saveHistory(result);

      console.log(`[Merger] ✅ Complete:`);
      console.log(`   Original: ${result.originalTotal} entries`);
      console.log(`   Merged: ${result.mergedTotal} entries`);
      console.log(`   Deduplicated: ${result.deduplicated}\n`);

      return { success: true, ...result };
    } catch (error) {
      console.error("[Merger] ❌ Error:", error.message);
      return { success: false, error: error.message };
    } finally {
      // 6. 释放锁
      this.releaseLock();
      console.log("[Merger] 🔓 Lock released\n");
    }
  }

  /**
   * 查找所有CLI的知识库
   */
  async _findCLIKnowledgeBases(soulName) {
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
      const kbPath = path.join(
        BASE_PATH,
        soulName,
        ".soul_kb",
        `${soulName}_kb.json`,
      );

      // 也检查CLI特定路径
      const cliPath = path.join(
        BASE_PATH,
        ".soul_kb",
        `${soulName}_${cli}_kb.json`,
      );

      const filePath = fs.existsSync(kbPath)
        ? kbPath
        : fs.existsSync(cliPath)
          ? cliPath
          : null;

      if (filePath) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          kbs.push({
            cli,
            path: filePath,
            entries: data.entries || [],
          });
        } catch (e) {
          console.warn(`[Merger] Failed to read ${cli} KB:`, e.message);
        }
      }
    }

    return kbs;
  }

  /**
   * 合并知识库 (去重 + 冲突裁决)
   */
  _mergeKnowledgeBases(cliKBs) {
    // 1. 收集所有条目
    let allEntries = [];
    for (const kb of cliKBs) {
      allEntries = allEntries.concat(
        kb.entries.map((e) => ({
          ...e,
          _source: kb.cli, // 标记来源
        })),
      );
    }

    console.log(`[Merger] Total entries before dedup: ${allEntries.length}`);

    // 2. 关键词去重 (保留最新的)
    const seen = new Map(); // keyword -> entry

    for (const entry of allEntries) {
      const keywords = entry.keywords || [];
      const key = keywords.slice(0, 3).sort().join("|"); // 前3个关键词作为key

      if (!seen.has(key)) {
        seen.set(key, entry);
      } else {
        // 冲突裁决: 保留更新时间最新的
        const existing = seen.get(key);
        const existingTime = new Date(existing.updatedAt || 0).getTime();
        const entryTime = new Date(entry.updatedAt || 0).getTime();

        if (entryTime > existingTime) {
          // 合并贡献者
          const existingContributors = existing._contributors || [
            existing._source,
          ];
          if (!existingContributors.includes(entry._source)) {
            existingContributors.push(entry._source);
          }

          seen.set(key, {
            ...entry,
            _contributors: existingContributors,
          });
        } else {
          // 保留旧的，添加新贡献者
          const contributors = entry._contributors || [entry._source];
          if (!contributors.includes(existing._source)) {
            contributors.push(existing._source);
          }
          existing._contributors = contributors;
        }
      }
    }

    const merged = Array.from(seen.values());

    console.log(`[Merger] After dedup: ${merged.length}`);

    // 3. 清理内部字段
    return {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      lastMerge: new Date().toISOString(),
      entries: merged.map((e) => {
        const { _source, _contributors, ...rest } = e;
        return {
          ...rest,
          contributors: _contributors || [_source],
          lastMerged: new Date().toISOString(),
        };
      }),
    };
  }

  /**
   * 保存合并后的KB
   */
  async _saveMergedKB(soulName, merged) {
    const mergedDir = path.join(BASE_PATH, soulName, ".soul_kb");
    const mergedPath = path.join(mergedDir, `${soulName}_merged.json`);

    if (!fs.existsSync(mergedDir)) {
      fs.mkdirSync(mergedDir, { recursive: true });
    }

    fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2), "utf-8");

    return mergedPath;
  }

  /**
   * 加载历史
   */
  _loadHistory() {
    const historyPath = path.join(WIKI_PATH, "merge_history.json");
    if (fs.existsSync(historyPath)) {
      try {
        this.mergeHistory = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
      } catch (e) {
        this.mergeHistory = [];
      }
    }
  }

  /**
   * 保存历史
   */
  _saveHistory(result) {
    this.mergeHistory.push(result);

    // 只保留最近30条
    if (this.mergeHistory.length > 30) {
      this.mergeHistory = this.mergeHistory.slice(-30);
    }

    if (!fs.existsSync(WIKI_PATH)) {
      fs.mkdirSync(WIKI_PATH, { recursive: true });
    }

    const historyPath = path.join(WIKI_PATH, "merge_history.json");
    fs.writeFileSync(
      historyPath,
      JSON.stringify(this.mergeHistory, null, 2),
      "utf-8",
    );
  }

  /**
   * 获取历史
   */
  getHistory() {
    return this.mergeHistory;
  }

  /**
   * 调度合并 (每天0时)
   */
  scheduleDailyMerge() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // 明天0时

    const delay = midnight.getTime() - now.getTime();

    console.log(
      `[Merger] ⏰ Scheduled daily merge at: ${midnight.toLocaleString()}`,
    );
    console.log(`   Delay: ${Math.round(delay / 1000 / 60)} minutes\n`);

    setTimeout(() => {
      this._dailyMergeLoop();
    }, delay);
  }

  /**
   * 每日合并循环
   */
  async _dailyMergeLoop() {
    while (true) {
      // 找到所有soul目录
      const souls = await this._findAllSouls();

      console.log(`\n🕛 [Merger] Daily merge started at 0:00`);
      console.log(`   Found ${souls.length} souls to merge\n`);

      for (const soul of souls) {
        await this.merge(soul);
        // 每个soul之间稍作延迟
        await new Promise((r) => setTimeout(r, 1000));
      }

      // 下一次0时
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();

      console.log(
        `[Merger] ⏰ Next daily merge in ${Math.round(delay / 1000 / 60 / 60)} hours\n`,
      );

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  /**
   * 查找所有soul
   */
  async _findAllSouls() {
    if (!fs.existsSync(BASE_PATH)) return [];

    const entries = fs.readdirSync(BASE_PATH, { withFileTypes: true });
    const souls = [];

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
}

module.exports = SoulMerger;
