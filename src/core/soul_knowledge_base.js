/**
 * SoulKnowledgeBase - 灵魂绑定知识库
 *
 * 核心功能：
 * 1. 存储与soul.md相关的知识
 * 2. 知识向量化和语义检索
 * 3. 知识持续更新和演进
 * 4. 与soul.md的对齐验证
 */

const fs = require("fs");
const path = require("path");

class SoulKnowledgeBase {
  constructor(options = {}) {
    this.soulIdentity = options.soulIdentity;
    this.basePath = options.basePath || "./knowledge";

    // 知识存储
    this.entries = new Map(); // id -> KnowledgeEntry
    this.tags = new Map(); // tag -> Set<entryId>
    this.keywords = new Map(); // keyword -> Set<entryId>

    // 元数据
    this.createdAt = new Date();
    this.lastUpdate = new Date();
    this.version = "1.0.0";

    // 加载已有知识
    this._load();
  }

  /**
   * 知识条目结构
   */
  createEntry(data) {
    return {
      id: this._generateId(),
      title: data.title,
      content: data.content,
      source: data.source,
      sourceType: data.sourceType || "manual",
      tags: data.tags || [],
      keywords: data.keywords || this._extractKeywords(data.content),
      expertise: data.expertise || this._classifyExpertise(data.content),
      soulAligned: true, // 默认与soul对齐，由对齐检查器验证
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: this.version,
      // 对齐信息
      alignmentScore: 1.0,
      lastAligned: new Date().toISOString(),
    };
  }

  /**
   * 添加知识条目
   */
  add(data) {
    const entry = this.createEntry(data);
    this.entries.set(entry.id, entry);

    // 更新索引
    this._indexEntry(entry);

    this.lastUpdate = new Date();
    this._save();

    return entry;
  }

  /**
   * 批量添加知识
   */
  addBatch(items) {
    const results = [];
    for (const item of items) {
      results.push(this.add(item));
    }
    return results;
  }

  /**
   * 更新知识条目
   */
  update(id, data) {
    const entry = this.entries.get(id);
    if (!entry) return null;

    // 更新字段
    if (data.title) entry.title = data.title;
    if (data.content) entry.content = data.content;
    if (data.tags) entry.tags = data.tags;
    if (data.source) entry.source = data.source;

    entry.keywords = this._extractKeywords(entry.content);
    entry.expertise = this._classifyExpertise(entry.content);
    entry.updatedAt = new Date().toISOString();
    entry.version = this._incrementVersion(entry.version);

    // 重新索引
    this._removeFromIndex(id);
    this._indexEntry(entry);

    this.lastUpdate = new Date();
    this._save();

    return entry;
  }

  /**
   * 删除知识条目
   */
  delete(id) {
    const entry = this.entries.get(id);
    if (!entry) return false;

    this._removeFromIndex(id);
    this.entries.delete(id);

    this.lastUpdate = new Date();
    this._save();

    return true;
  }

  /**
   * 搜索知识
   */
  search(query, options = {}) {
    const results = [];
    const queryLower = query.toLowerCase();
    const maxResults = options.maxResults || 10;

    // 搜索标题、内容、标签、关键词
    for (const entry of this.entries.values()) {
      let score = 0;

      // 标题匹配
      if (entry.title && entry.title.toLowerCase().includes(queryLower)) {
        score += 10;
      }

      // 内容匹配
      if (entry.content && entry.content.toLowerCase().includes(queryLower)) {
        score += 5;
      }

      // 标签匹配
      if (entry.tags) {
        for (const tag of entry.tags) {
          if (tag.toLowerCase().includes(queryLower)) {
            score += 3;
          }
        }
      }

      // 关键词匹配
      if (entry.keywords) {
        for (const kw of entry.keywords) {
          if (kw.toLowerCase().includes(queryLower)) {
            score += 2;
          }
        }
      }

      // 专业领域匹配
      if (entry.expertise) {
        if (typeof entry.expertise === 'string') {
          if (entry.expertise.toLowerCase().includes(queryLower)) {
            score += 4;
          }
        } else if (Array.isArray(entry.expertise)) {
          for (const exp of entry.expertise) {
            if (exp.toLowerCase().includes(queryLower)) {
              score += 4;
              break;
            }
          }
        } else if (typeof entry.expertise === 'object') {
          // 处理 {core: [...], related: [...]} 格式
          const allExpertise = [
            ...(entry.expertise.core || []),
            ...(entry.expertise.related || [])
          ];
          for (const exp of allExpertise) {
            if (exp.toLowerCase().includes(queryLower)) {
              score += 4;
              break;
            }
          }
        }
      }

      if (score > 0) {
        results.push({ entry, score });
      }
    }

    // 排序并返回
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults).map((r) => r.entry);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const entries = Array.from(this.entries.values());

    // 按专业领域分组
    const byExpertise = {};
    for (const entry of entries) {
      let expKey = "general";
      if (typeof entry.expertise === 'string') {
        expKey = entry.expertise;
      } else if (Array.isArray(entry.expertise) && entry.expertise.length > 0) {
        expKey = entry.expertise[0];
      } else if (entry.expertise && entry.expertise.core && entry.expertise.core.length > 0) {
        expKey = entry.expertise.core[0];
      }
      byExpertise[expKey] = (byExpertise[expKey] || 0) + 1;
    }

    // 按标签分组
    const byTag = {};
    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          byTag[tag] = (byTag[tag] || 0) + 1;
        }
      }
    }

    // 对齐分数统计
    let totalAlignment = 0;
    let alignedCount = 0;
    for (const entry of entries) {
      if (entry.alignmentScore !== undefined) {
        totalAlignment += entry.alignmentScore;
        alignedCount++;
      }
    }

    return {
      total: entries.length,
      byExpertise,
      byTag,
      averageAlignment: alignedCount > 0 ? totalAlignment / alignedCount : 0,
      lastUpdate: this.lastUpdate,
    };
  }

  /**
   * 获取需要对齐的知识
   */
  getNeedsRealigned(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    const results = [];
    for (const entry of this.entries.values()) {
      if (entry.lastAligned && entry.lastAligned < cutoffStr) {
        results.push(entry);
      }
    }

    return results;
  }

  /**
   * 更新对齐分数
   */
  updateAlignmentScore(id, score) {
    const entry = this.entries.get(id);
    if (!entry) return null;

    entry.alignmentScore = score;
    entry.lastAligned = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();

    this.lastUpdate = new Date();
    this._save();

    return entry;
  }

  /**
   * 获取所有知识
   */
  getAll() {
    return Array.from(this.entries.values());
  }

  /**
   * 获取大小
   */
  getSize() {
    return this.entries.size;
  }

  // ==================== 私有方法 ====================

  _generateId() {
    return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _incrementVersion(version) {
    const parts = version.split(".");
    parts[parts.length - 1] = parseInt(parts[parts.length - 1]) + 1;
    return parts.join(".");
  }

  _extractKeywords(content) {
    if (!content) return [];

    // 简单提取：去除常用词，提取有意义的词
    const stopWords = new Set([
      "的",
      "是",
      "在",
      "了",
      "和",
      "与",
      "或",
      "以及",
      "对于",
      "关于",
      "the",
      "is",
      "at",
      "which",
      "on",
      "and",
      "or",
      "a",
      "an",
      "in",
    ]);

    const words = content
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // 返回前20个
    return [...new Set(words)].slice(0, 20);
  }

  _classifyExpertise(content) {
    if (!content) return "general";

    const contentLower = content.toLowerCase();

    // 简单分类
    const expertisePatterns = {
      javascript: ["javascript", "js", "node", "react", "vue", "angular"],
      python: ["python", "django", "flask", "pandas", "numpy"],
      java: ["java", "spring", "maven", "gradle"],
      devops: ["docker", "kubernetes", "k8s", "ci/cd", "jenkins", "gitlab"],
      ai: ["machine learning", "deep learning", "neural", "ai", "gpt", "llm"],
      web: ["http", "https", "rest", "api", "graphql", "html", "css"],
      database: ["sql", "mysql", "postgresql", "mongodb", "redis"],
      security: ["security", "auth", "encryption", "oauth", "jwt"],
    };

    for (const [expertise, patterns] of Object.entries(expertisePatterns)) {
      for (const pattern of patterns) {
        if (contentLower.includes(pattern)) {
          return expertise;
        }
      }
    }

    return "general";
  }

  _indexEntry(entry) {
    // 标签索引
    if (entry.tags) {
      for (const tag of entry.tags) {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag).add(entry.id);
      }
    }

    // 关键词索引
    if (entry.keywords) {
      for (const kw of entry.keywords) {
        if (!this.keywords.has(kw)) {
          this.keywords.set(kw, new Set());
        }
        this.keywords.get(kw).add(entry.id);
      }
    }
  }

  _removeFromIndex(id) {
    // 从标签索引移除
    for (const ids of this.tags.values()) {
      ids.delete(id);
    }

    // 从关键词索引移除
    for (const ids of this.keywords.values()) {
      ids.delete(id);
    }
  }

  _getStoragePath() {
    const dir = path.join(this.basePath, ".soul_kb");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, `${this.soulIdentity?.name || "default"}_kb.json`);
  }

  _load() {
    const filePath = this._getStoragePath();
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (data.entries) {
          for (const entry of data.entries) {
            this.entries.set(entry.id, entry);
            this._indexEntry(entry);
          }
        }
        this.version = data.version || "1.0.0";
        this.createdAt = new Date(data.createdAt || Date.now());
      } catch (e) {
        console.warn("[SoulKnowledgeBase] Failed to load:", e.message);
      }
    }
  }

  _save() {
    const filePath = this._getStoragePath();
    const data = {
      version: this.version,
      createdAt: this.createdAt,
      lastUpdate: this.lastUpdate,
      entries: Array.from(this.entries.values()),
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    // 同时导出为可读markdown格式，方便其他CLI使用
    this._exportToMarkdown();
  }

  /**
   * 导出知识为Markdown格式（便于其他CLI使用）
   */
  _exportToMarkdown() {
    const exportDir = path.join(this.basePath, "knowledge");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // 按 Expertise 分组导出
    const byExpertise = new Map();
    for (const entry of this.entries.values()) {
      const exp = entry.expertise || "general";
      if (!byExpertise.has(exp)) {
        byExpertise.set(exp, []);
      }
      byExpertise.get(exp).push(entry);
    }

    // 为每个专业领域创建markdown文件
    for (const [expertise, entries] of byExpertise) {
      const mdPath = path.join(exportDir, `${expertise}.md`);
      const mdContent = this._generateKnowledgeMarkdown(expertise, entries);
      fs.writeFileSync(mdPath, mdContent, "utf-8");
    }

    // 创建索引文件
    const indexPath = path.join(exportDir, "_index.md");
    const indexContent = this._generateIndexMarkdown(byExpertise);
    fs.writeFileSync(indexPath, indexContent, "utf-8");
  }

  /**
   * 生成知识Markdown内容
   */
  _generateKnowledgeMarkdown(expertise, entries) {
    const lines = [
      `# ${expertise} 知识库`,
      "",
      `> 自动生成于 ${new Date().toISOString()}`,
      `> 共 ${entries.length} 条知识`,
      "",
    ];

    for (const entry of entries.slice(0, 50)) {
      lines.push(`## ${entry.title}`);
      lines.push("");
      lines.push(`**来源**: ${entry.source}`);
      lines.push(`**标签**: ${entry.tags?.join(", ") || "无"}`);
      lines.push(`**对齐分数**: ${(entry.alignmentScore * 100).toFixed(0)}%`);
      lines.push("");
      lines.push(entry.content.substring(0, 2000));
      if (entry.content.length > 2000) {
        lines.push("...");
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * 生成索引Markdown
   */
  _generateIndexMarkdown(byExpertise) {
    const lines = [
      "# 知识库索引",
      "",
      `> 自动生成于 ${new Date().toISOString()}`,
      "",
      "## 按专业领域",
      "",
    ];

    for (const [expertise, entries] of byExpertise) {
      lines.push(`- [${expertise}](./${expertise}.md) - ${entries.length} 条`);
    }

    lines.push("");
    lines.push("## 统计");
    lines.push("");
    lines.push(`- 总知识条目: ${this.entries.size}`);
    lines.push(`- 最后更新: ${this.lastUpdate.toISOString()}`);
    lines.push("");

    return lines.join("\n");
  }

  /**
   * 导出为技能格式（供其他CLI直接使用）
   */
  exportAsSkill(skillName, options = {}) {
    const entries = Array.from(this.entries.values());
    if (entries.length === 0) {
      console.log("[SoulKnowledgeBase] No knowledge to export");
      return null;
    }

    const exportDir =
      options.exportDir ||
      path.join(
        this.basePath,
        "..",
        "..",
        "skills",
        this.soulIdentity?.name || "default",
      );
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const skillPath = path.join(exportDir, `${skillName}.md`);
    const skillContent = this._generateSkillMarkdown(skillName, entries);
    fs.writeFileSync(skillPath, skillContent, "utf-8");

    console.log(`[SoulKnowledgeBase] Exported skill to ${skillPath}`);
    return skillPath;
  }

  /**
   * 生成技能Markdown
   */
  _generateSkillMarkdown(name, entries) {
    const lines = [
      "---",
      `name: ${name}`,
      `description: AI生成的${name}技能知识库`,
      "author: stigmergy-evolution",
      "version: 1.0.0",
      "---",
      "",
      `# ${name} 技能`,
      "",
      "AI自动进化的技能知识库。",
      "",
      "## 知识内容",
      "",
    ];

    for (const entry of entries.slice(0, 20)) {
      lines.push(`### ${entry.title}`);
      lines.push("");
      lines.push(entry.content.substring(0, 1500));
      if (entry.content.length > 1500) {
        lines.push("...");
      }
      lines.push("");
      lines.push(`> 来源: ${entry.source}`);
      lines.push("");
    }

    return lines.join("\n");
  }
}

module.exports = SoulKnowledgeBase;
