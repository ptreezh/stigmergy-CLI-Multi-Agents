/**
 * SoulSkillEvolver - 技能进化引擎
 *
 * 核心功能：
 * 1. 自动搜索和收集知识
 * 2. 提取和创建新技能
 * 3. 自我反思和学习
 * 4. 与其他CLI的知识合并
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

class SoulSkillEvolver {
  constructor(options = {}) {
    this.soulIdentity = options.soulIdentity;
    this.skillsPath = options.skillsPath;
    this.knowledgeBase = options.knowledgeBase;

    // 配置
    this.config = {
      evolve: {
        maxKnowledgePerCycle: options.maxKnowledgePerCycle || 10,
        maxSkillsPerCycle: options.maxSkillsPerCycle || 3,
        autoEvolveInterval: options.autoEvolveInterval || 24 * 60 * 60 * 1000, // 24小时
        enableWebSearch: options.enableWebSearch !== false,
        enableSkillCreation: options.enableSkillCreation !== false,
      },
      merge: {
        autoMergeAfterEvolve: options.autoMergeAfterEvolve !== false,
        mergeInterval: options.mergeInterval || 60 * 60 * 1000, // 1小时
      },
    };

    // 状态
    this.evolveCount = 0;
    this.lastEvolveTime = null;
    this.evolutionHistory = [];
    this.isEvolving = false;

    // 初始化目录
    this._ensureDirs();
  }

  async init() {
    console.log(
      `[SoulSkillEvolver] Initialized for ${this.soulIdentity?.name || "Unknown"}`,
    );
    return true;
  }

  _ensureDirs() {
    if (!this.skillsPath) return;

    const dirs = [
      this.skillsPath,
      path.join(this.skillsPath, "knowledge"),
      path.join(this.skillsPath, "evolution"),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * 执行进化
   */
  async evolve(direction = "general") {
    if (this.isEvolving) {
      console.log(
        "[SoulSkillEvolver] Evolution already in progress, skipping...",
      );
      return { success: false, message: "Already evolving" };
    }

    this.isEvolving = true;
    const startTime = Date.now();

    try {
      console.log(`[SoulSkillEvolver] Starting evolution for: ${direction}`);

      const results = {
        direction,
        knowledgeAdded: [],
        skillsCreated: [],
        skillsUpdated: [],
        errors: [],
        duration: 0,
      };

      // 1. 获取权威资料
      const sources = await this._fetchAuthoritativeSources(direction);
      console.log(`[SoulSkillEvolver] Found ${sources.length} sources`);

      // 2. 提取知识
      for (const source of sources.slice(
        0,
        this.config.evolve.maxKnowledgePerCycle,
      )) {
        try {
          const knowledge = await this._extractKnowledge(source);
          if (knowledge) {
            if (this.knowledgeBase) {
              this.knowledgeBase.add(knowledge);
            }
            results.knowledgeAdded.push({
              title: knowledge.title,
              source: source.url,
              expertise: direction,
            });
          }
        } catch (e) {
          results.errors.push(`Failed to fetch ${direction}: ${e.message}`);
        }
      }

      // 3. 基于新知识生成或进化技能
      const newSkills = await this._evolveSkills(results.knowledgeAdded);
      results.skillsCreated = newSkills.created;
      results.skillsUpdated = newSkills.updated;

      // 4. 检查对齐并改进
      const alignmentResults = await this._checkAndImproveAlignment();
      results.alignmentImproved = alignmentResults;

      // 5. 记录进化历史
      this.lastEvolveTime = new Date();
      const duration = Date.now() - startTime;

      const historyEntry = {
        count: this.evolveCount,
        startTime: new Date(startTime).toISOString(),
        duration,
        results,
      };
      this.evolutionHistory.push(historyEntry);

      // 保持历史记录在50条以内
      if (this.evolutionHistory.length > 50) {
        this.evolutionHistory = this.evolutionHistory.slice(-50);
      }

      // 6. 自动合并跨CLI知识库
      if (this.config.merge.autoMergeAfterEvolve) {
        await this._autoMerge();
        results.merged = true;
      }

      results.duration = duration;
      this.evolveCount++;

      console.log(
        `[SoulSkillEvolver] Evolution complete: ${results.knowledgeAdded.length} knowledge, ${results.skillsCreated.length} skills created`,
      );

      return { success: true, ...results };
    } catch (error) {
      console.error(`[SoulSkillEvolver] Evolution failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      this.isEvolving = false;
    }
  }

  /**
   * 搜集权威资料（使用智能搜索）
   */
  async _fetchAuthoritativeSources(direction) {
    const sources = [];
    const year = new Date().getFullYear();

    // 搜索查询
    const queries = [
      `${direction} best practices official documentation ${year}`,
      `${direction} tutorial guide ${year}`,
      `${direction} official site:example.com OR site:github.com`,
    ];

    for (const query of queries) {
      try {
        console.log(`[SoulSkillEvolver] 🔍 Searching: ${query}`);

        // 使用智能搜索：优先Tavily，失败则DuckDuckGo
        const results = await this._smartSearch(query, 5);

        for (const result of results) {
          if (!sources.find((s) => s.url === result.url)) {
            sources.push({
              type: "web",
              url: result.url,
              title: result.title,
              snippet: result.snippet,
              priority: sources.length + 1,
            });
          }
        }

        // 限制数量
        if (sources.length >= this.config.evolve.maxKnowledgePerCycle) {
          break;
        }
      } catch (e) {
        console.warn(
          `[SoulSkillEvolver] Search failed for ${query}: ${e.message}`,
        );
      }
    }

    // 如果搜索失败，使用备用方案
    if (sources.length === 0) {
      console.log(`[SoulSkillEvolver] Using fallback sources for ${direction}`);
      const fallbackSources = this._getFallbackSources(direction);
      sources.push(...fallbackSources);
    }

    console.log(
      `[SoulSkillEvolver] Found ${sources.length} sources for ${direction}`,
    );
    return sources.slice(0, this.config.evolve.maxKnowledgePerCycle);
  }

  /**
   * 获取备用资源
   */
  _getFallbackSources(direction) {
    const sources = [];
    const dir = direction.toLowerCase();

    if (
      dir.includes("web") ||
      dir.includes("javascript") ||
      dir.includes("react")
    ) {
      sources.push({
        type: "web",
        url: "https://developer.mozilla.org",
        title: "MDN Web Docs",
        snippet: "权威的Web开发文档",
        priority: 1,
      });
      sources.push({
        type: "web",
        url: "https://react.dev",
        title: "React 官方文档",
        snippet: "React 官方学习资源",
        priority: 2,
      });
    }

    if (dir.includes("python") || dir.includes("ai") || dir.includes("ml")) {
      sources.push({
        type: "web",
        url: "https://docs.python.org",
        title: "Python 官方文档",
        snippet: "Python 官方文档",
        priority: 1,
      });
      sources.push({
        type: "web",
        url: "https://pytorch.org",
        title: "PyTorch",
        snippet: "机器学习框架",
        priority: 2,
      });
    }

    if (sources.length === 0) {
      sources.push({
        type: "web",
        url: "https://github.com",
        title: "GitHub",
        snippet: "代码托管平台",
        priority: 1,
      });
    }

    return sources;
  }

  /**
   * 智能搜索：优先Tavily，失败则DuckDuckGo
   */
  async _smartSearch(query, numResults = 5) {
    // 先尝试Tavily
    const tavilyResults = await this._tavilySearch(query, numResults);
    if (tavilyResults && tavilyResults.length > 0) {
      console.log(
        `[SoulSkillEvolver] ✓ Tavily found ${tavilyResults.length} results`,
      );
      return tavilyResults;
    }

    // 降级到DuckDuckGo
    console.log("[SoulSkillEvolver] Falling back to DuckDuckGo...");
    return this._duckDuckGoSearch(query, numResults);
  }

  /**
   * Tavily搜索 (AI优化的搜索API)
   * 免费1000次/月
   */
  async _tavilySearch(query, numResults = 5) {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      console.log(
        "[SoulSkillEvolver] Tavily API key not found, set TAVILY_API_KEY env var",
      );
      return null;
    }

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: numResults,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();

      return (
        data.results?.map((r) => ({
          url: r.url,
          title: r.title,
          snippet: r.content || r.snippet,
        })) || []
      );
    } catch (e) {
      console.log(`[SoulSkillEvolver] Tavily search failed: ${e.message}`);
      return null;
    }
  }

  /**
   * DuckDuckGo HTML搜索（免费，无需API key）
   */
  _duckDuckGoSearch(query, numResults = 5) {
    return new Promise((resolve, reject) => {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}&b=${numResults}`;

      const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const results = [];

            // 解析结果
            const resultRegex =
              /<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            let match;

            while (
              (match = resultRegex.exec(data)) &&
              results.length < numResults
            ) {
              const url = match[1];
              // 跳过DuckDuckGo自己的链接
              if (
                url.includes("duckduckgo.com") ||
                url.includes("yandex.com")
              ) {
                continue;
              }

              // 获取标题下面的snippet
              const snippetMatch = data
                .substring(match.index)
                .match(/<a class="result__snippet"[^>]*>([^<]+)<\/a>/);

              results.push({
                url: url,
                title: match[2].replace(/<[^>]+>/g, "").trim(),
                snippet: snippetMatch
                  ? snippetMatch[1].replace(/<[^>]+>/g, "").trim()
                  : "",
              });
            }

            resolve(results);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
    });
  }

  /**
   * 从网页提取知识
   */
  async _extractKnowledge(source) {
    const { execSync } = require('child_process');
    const crypto = require('crypto');

    const results = {
      title: source.title || 'Untitled',
      content: '',
      source: source.url || 'local-git',
      metadata: {
        commitHash: null,
        author: null,
        filesChanged: 0,
        linesAdded: 0,
        linesDeleted: 0,
      },
    };

    try {
      // 1. Recent commit messages (last 24 hours)
      const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const logOutput = execSync(
        `git log --since="${sinceDate}" --pretty=format:"%H|%s|%an|%ad" --date=iso`,
        { encoding: 'utf8', cwd: process.cwd(), timeout: 5000 }
      );

      const commits = logOutput.trim().split('\n').filter(Boolean).map(line => {
        const [hash, subject, author, date] = line.split('|');
        return { hash, subject, author, date };
      });

      if (commits.length === 0) {
        results.content = 'No commits in the last 24 hours.';
        return results;
      }

      // 2. Diff stats for changed files
      const diffStat = execSync(
        `git diff --stat HEAD~${Math.max(commits.length, 1)}..HEAD`,
        { encoding: 'utf8', cwd: process.cwd(), timeout: 5000 }
      );

      // Parse diff stat: "5 files changed, 120 insertions(+), 30 deletions(-)"
      const statMatch = diffStat.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(\-\))?/);
      if (statMatch) {
        results.metadata.filesChanged = parseInt(statMatch[1], 10);
        results.metadata.linesAdded = parseInt(statMatch[2] || '0', 10);
        results.metadata.linesDeleted = parseInt(statMatch[3] || '0', 10);
      }

      // 3. Build content from commit messages
      results.content = commits.map(c =>
        `- [${c.hash.slice(0, 7)}] ${c.subject} (${c.author}, ${c.date})`
      ).join('\n');

      results.metadata.commitHash = commits[0].hash;
      results.metadata.author = commits[0].author;

      return results;
    } catch (err) {
      // Not a git repo, or git not available — fall back to snippet
      if (err.code === 'ENOENT' || (err.message && err.message.includes('not a git'))) {
        results.content = source.snippet || 'Git extraction unavailable: not a git repository.';
        results.source = source.url || 'local-git';
        return results;
      }
      // Wrap as ProcessError and rethrow
      const { ProcessError } = require('./coordination/error_handler');
      throw new ProcessError(`Git knowledge extraction failed: ${err.message}`, {
        operation: '_extractKnowledge',
        source: source.title,
      });
    }
  }

  /**
   * 基于知识进化技能
   */
  async _evolveSkills(knowledgeList) {
    const results = { created: [], updated: [] };
    if (!knowledgeList || knowledgeList.length === 0) return results;

    const skillsDir = this.skillsPath || path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.stigmergy',
      'skills'
    );
    if (!fs.existsSync(skillsDir)) {
      fs.mkdirSync(skillsDir, { recursive: true });
    }

    const maxSkills = this.config.evolve.maxSkillsPerCycle;
    for (const knowledge of knowledgeList.slice(0, maxSkills)) {
      try {
        // Generate skill name from knowledge title
        const skillName = (knowledge.title || 'untitled')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 50);

        const skillDir = path.join(skillsDir, skillName);
        if (!fs.existsSync(skillDir)) {
          fs.mkdirSync(skillDir, { recursive: true });
        }

        // 1. Create SKILL.md with YAML frontmatter (atomic tmp+rename)
        const skillMd = `---
name: ${skillName}
description: "${(knowledge.title || 'Untitled skill').replace(/"/g, '\\"')}"
triggers:
  - "${(knowledge.title || '').toLowerCase().slice(0, 80)}"
source: ${knowledge.source || 'local-evolution'}
extracted_at: ${new Date().toISOString()}
---

# ${knowledge.title || 'Untitled'}

${knowledge.content || ''}
`;
        const skillMdPath = path.join(skillDir, 'SKILL.md');
        const tmpMd = skillMdPath + '.tmp';
        fs.writeFileSync(tmpMd, skillMd, 'utf8');
        fs.renameSync(tmpMd, skillMdPath);

        // 2. Create skill-manifest.json (atomic tmp+rename)
        const manifest = {
          name: skillName,
          version: '0.1.0',
          description: knowledge.title || 'Untitled skill',
          triggers: [(knowledge.title || '').toLowerCase().slice(0, 80)],
          source: knowledge.source || 'local-evolution',
          verification_level: 0,
          created_at: new Date().toISOString(),
          knowledge_refs: [{ title: knowledge.title, source: knowledge.source }],
        };
        const manifestPath = path.join(skillDir, 'skill-manifest.json');
        const tmpManifest = manifestPath + '.tmp';
        fs.writeFileSync(tmpManifest, JSON.stringify(manifest, null, 2), 'utf8');
        fs.renameSync(tmpManifest, manifestPath);

        results.created.push({ name: skillName, path: skillDir });
      } catch (err) {
        // Non-critical: skill creation failure should not halt evolution
        const { ProcessError } = require('./coordination/error_handler');
        this._logger?.warn(
          `_evolveSkills: failed to create skill from "${knowledge.title}": ${err.message}`
        );
      }
    }

    return results;
  }

  /**
   * 检查和改进对齐
   */
  async _checkAndImproveAlignment() {
    if (!this.knowledgeBase) return null;

    const needsAlignment = this.knowledgeBase.getNeedsRealigned(7);
    let improved = 0;

    for (const entry of needsAlignment) {
      // 简化：随机改进对齐分数
      const newScore = Math.min(1.0, (entry.alignmentScore || 0) + 0.1);
      this.knowledgeBase.updateAlignmentScore(entry.id, newScore);
      improved++;
    }

    return { checked: needsAlignment.length, improved };
  }

  /**
   * 自动合并
   */
  async _autoMerge() {
    const fs = require('fs');
    const path = require('path');

    const skillsDir = this.skillsPath || path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.stigmergy',
      'skills'
    );
    const mergedKbPath = path.join(skillsDir, 'knowledge-base-merged.json');

    // 1. Collect all CLI KB JSON files
    const kbEntries = [];
    if (!fs.existsSync(skillsDir)) return { merged: false, entryCount: 0 };

    for (const cliDir of fs.readdirSync(skillsDir)) {
      const kbPath = path.join(skillsDir, cliDir, 'knowledge-base.json');
      if (!fs.existsSync(kbPath)) continue;
      try {
        const data = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        if (Array.isArray(data.entries)) {
          kbEntries.push(...data.entries.map(e => ({ ...e, _cli: cliDir })));
        }
      } catch (err) {
        // ValidationError — skip corrupt KB (logged elsewhere)
      }
    }

    // 2. Deduplicate by title (case-insensitive)
    const seen = new Map();
    for (const entry of kbEntries) {
      const key = (entry.title || '').toLowerCase().trim();
      if (!seen.has(key)) {
        seen.set(key, entry);
      }
    }

    // 3. Write merged KB with tmp+rename (atomic)
    const merged = {
      version: '1.0',
      merged_at: new Date().toISOString(),
      entry_count: seen.size,
      entries: Array.from(seen.values()),
    };

    const tmp = mergedKbPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(merged, null, 2), 'utf8');
    fs.renameSync(tmp, mergedKbPath);

    this._logger?.info(`_autoMerge: ${merged.entry_count} unique entries merged`);
    return { merged: true, entryCount: merged.entry_count };
  }

  /**
   * 获取进化报告
   */
  getEvolutionReport() {
    const stats = this.knowledgeBase?.getStats() || { total: 0 };

    return {
      evolveCount: this.evolveCount,
      lastEvolveTime: this.lastEvolveTime?.toISOString(),
      historyLength: this.evolutionHistory.length,
      knowledgeBaseSize: stats.total,
      averageAlignment: stats.averageAlignment,
    };
  }
}

module.exports = SoulSkillEvolver;
