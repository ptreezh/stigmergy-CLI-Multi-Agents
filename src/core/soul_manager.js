/**
 * SoulManager - 子智能体灵魂管理器
 *
 * 核心功能：
 * 1. 检测soul.md存在
 * 2. 解析soul.md定义的身份、人格、使命
 * 3. 绑定技能和知识库
 * 4. 协调自主学习和对齐检查
 * 5. 记忆管理
 */

const fs = require("fs");
const path = require("path");

class SoulManager {
  constructor(options = {}) {
    this.cliName = options.cliName || "unknown";
    this.skillsPath = options.skillsPath || null;
    this.soulPath = null;
    this.identity = null;
    this.knowledgeBase = null;
    this.skillEvolver = null;
    this.alignmentChecker = null;
    this.taskPlanner = null;
    this.scheduler = null;
    this.memoryManager = null;
    this.isInitialized = false;
    this.lastLearningTime = null;
    this.lastAlignmentCheck = null;
    this.config = {
      autoLearn: options.autoLearn !== false,
      alignmentCheckOnResponse: options.alignmentCheckOnResponse !== false,
      learningIntervalHours: options.learningIntervalHours || 24,
      ...options,
    };
  }

  async detectSoul(skillsPath) {
    if (!skillsPath) skillsPath = this._findSkillsPath();
    if (!skillsPath || !fs.existsSync(skillsPath)) return false;
    const soulFile = await this._findSoulFile(skillsPath);
    if (soulFile) {
      this.soulPath = soulFile;
      this.skillsPath = skillsPath;
      return true;
    }
    return false;
  }

  _findSkillsPath() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const paths = [
      path.join(home, ".agent/skills"),
      path.join(home, ".claude/skills"),
      path.join(home, ".stigmergy/skills"),
      path.join(process.cwd(), ".agent/skills"),
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  async _findSoulFile(dirPath, depth = 0) {
    if (depth > 5 || !fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "soul.md" && entry.isFile()) {
        return path.join(dirPath, "soul.md");
      }
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const soulFile = await this._findSoulFile(
          path.join(dirPath, entry.name),
          depth + 1,
        );
        if (soulFile) return soulFile;
      }
    }
    return null;
  }

  async loadSoul() {
    if (!this.soulPath) return false;
    const content = fs.readFileSync(this.soulPath, "utf-8");
    this.identity = this._parseSoulContent(content);
    this.isInitialized = true;
    return this.identity;
  }

  _parseSoulContent(content) {
    const identity = {
      name: "",
      role: "",
      type: "",
      personality: {},
      mission: {},
      vision: {},
      expertise: {},
      learningStrategy: {},
      alignmentCriteria: {},
    };

    // 简单解析 - 提取关键字段
    const lines = content.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const match = line.match(/^##\s+(.+)/);
      if (match) {
        currentSection = match[1].trim();
        continue;
      }

      if (line.includes("**名称**:")) {
        identity.name = line.match(/\*\*名称\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }
      if (line.includes("**角色**:")) {
        identity.role = line.match(/\*\*角色\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }
    }

    return identity;
  }

  async initAutonomousSystem() {
    if (!this.isInitialized) await this.loadSoul();

    const SoulKnowledgeBase = require("./soul_knowledge_base");
    const SoulSkillEvolver = require("./soul_skill_evolver");
    const SoulAlignmentChecker = require("./soul_alignment_checker");
    const SoulMemoryManager = require("./soul_memory_manager");

    // 初始化记忆管理器
    this.memoryManager = new SoulMemoryManager(this.skillsPath);

    // 初始化知识库
    this.knowledgeBase = new SoulKnowledgeBase({
      soulIdentity: this.identity,
      basePath: this.skillsPath,
    });

    // 初始化技能进化器
    this.skillEvolver = new SoulSkillEvolver({
      soulIdentity: this.identity,
      skillsPath: this.skillsPath,
      knowledgeBase: this.knowledgeBase,
    });
    await this.skillEvolver.init();

    // 初始化对齐检查器
    this.alignmentChecker = new SoulAlignmentChecker({
      soulIdentity: this.identity,
      knowledgeBase: this.knowledgeBase,
    });

    console.log(
      `[SoulManager] Initialized for ${this.identity?.name || "Unknown"}`,
    );
    return true;
  }

  async evolve() {
    if (!this.skillEvolver) {
      return { success: false, error: "Not initialized" };
    }
    return await this.skillEvolver.evolve();
  }

  async checkAlignment(content) {
    if (!this.alignmentChecker) {
      return { aligned: true, score: 1.0 };
    }
    return await this.alignmentChecker.check(content);
  }

  async heartbeat() {
    if (this.memoryManager) {
      return await this.memoryManager.heartbeat();
    }
    return null;
  }

  getState() {
    return {
      cliName: this.cliName,
      soulPath: this.soulPath,
      identity: this.identity,
      isInitialized: this.isInitialized,
      hasKnowledgeBase: !!this.knowledgeBase,
      hasMemoryManager: !!this.memoryManager,
    };
  }
}

module.exports = SoulManager;
