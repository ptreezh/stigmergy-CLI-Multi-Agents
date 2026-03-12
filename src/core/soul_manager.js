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
const SoulTaskIntegration = require("./soul_task_integration");

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

    // 初始化Task集成
    this.taskIntegration = new SoulTaskIntegration({
      enabled: options.enableTaskIntegration !== false,
      taskContext: options.taskContext || null
    });
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

  /**
   * 查找Soul技能目录 - 优先使用项目本地路径
   *
   * 优先级顺序：
   * P0: 项目本地目录（确保有权限）
   * P1: 用户目录（作为fallback）
   * P2: 自动创建项目本地目录
   */
  _findSkillsPath() {
    const cwd = process.cwd();
    const home = process.env.HOME || process.env.USERPROFILE || "";

    // P0: 项目本地目录（优先级最高）
    const projectPaths = [
      path.join(cwd, ".stigmergy", "skills"),
      path.join(cwd, ".agent", "skills"),
      path.join(cwd, ".claude", "skills"),
    ];

    // P1: 用户目录（作为fallback）
    const userPaths = [
      path.join(home, ".stigmergy", "skills"),
      path.join(home, ".agent", "skills"),
      path.join(home, ".claude", "skills"),
    ];

    // 检查项目本地路径
    for (const p of projectPaths) {
      if (fs.existsSync(p) && this._isWritable(p)) {
        console.log(`[SoulManager] Using project local path: ${p}`);
        return p;
      }
    }

    // 检查用户目录路径
    for (const p of userPaths) {
      if (fs.existsSync(p) && this._isWritable(p)) {
        console.log(`[SoulManager] Using user directory path: ${p}`);
        return p;
      }
    }

    // P2: 自动创建项目本地目录
    const projectLocalPath = path.join(cwd, ".stigmergy", "skills");
    try {
      fs.mkdirSync(projectLocalPath, { recursive: true });
      console.log(`[SoulManager] Created project local path: ${projectLocalPath}`);
      return projectLocalPath;
    } catch (error) {
      console.log(`[SoulManager] Failed to create directory: ${error.message}`);
    }

    return null;
  }

  /**
   * 检查目录是否可写
   */
  _isWritable(dirPath) {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
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

  /**
   * 初始化自主系统
   */
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
    console.log(
      `[SoulManager] Task Integration: ${this.taskIntegration.enabled ? 'enabled' : 'disabled'}`,
    );
    return true;
  }

  /**
   * 设置Task上下文 - 允许外部设置Task API
   */
  setTaskContext(taskContext) {
    this.taskIntegration.setTaskContext(taskContext);
    console.log(`[SoulManager] Task context updated`);
  }

  /**
   * 执行进化 - 使用Task API集成
   */
  async evolve(direction = "general") {
    if (!this.skillEvolver) {
      return { success: false, error: "Not initialized" };
    }

    // 使用Task API包装进化操作
    return await this.taskIntegration.wrapOperation(
      'evolution',
      async () => await this.skillEvolver.evolve(direction),
      {
        subject: `执行Soul自主进化 - ${this.identity?.name || 'Unknown'}`,
        description: `分析近期交互，更新知识库和技能`,
        activeForm: '执行Soul自主进化中',
        metadata: {
          direction,
          cliName: this.cliName
        }
      }
    );
  }

  /**
   * 批量进化 - 使用Task API批量处理
   */
  async batchEvolve(directions) {
    if (!this.skillEvolver) {
      return { success: false, error: "Not initialized" };
    }

    const operations = directions.map(dir => ({
      subject: `进化方向: ${dir}`,
      description: `在${dir}领域进行知识和技能进化`,
      activeForm: `在${dir}领域进化中`,
      fn: async () => await this.skillEvolver.evolve(dir),
      metadata: { direction: dir }
    }));

    return await this.taskIntegration.wrapBatchOperation(
      'batch_evolution',
      operations,
      {
        subject: `批量Soul进化 - ${this.identity?.name || 'Unknown'}`,
        description: `在${directions.length}个领域进行知识和技能进化`,
        activeForm: '批量执行Soul进化中',
        metadata: {
          directions,
          cliName: this.cliName
        }
      }
    );
  }

  /**
   * 检查对齐 - 使用Task API
   */
  async checkAlignment(content) {
    if (!this.alignmentChecker) {
      return { aligned: true, score: 1.0 };
    }

    // 使用Task API包装对齐检查
    return await this.taskIntegration.wrapOperation(
      'alignment_check',
      async () => await this.alignmentChecker.check(content),
      {
        subject: '执行Soul对齐检查',
        description: '检查输出是否符合Soul身份定义',
        activeForm: '执行对齐检查中',
        metadata: {
          contentLength: content?.length || 0,
          cliName: this.cliName
        }
      }
    );
  }

  /**
   * 心跳检查 - 使用Task API
   */
  async heartbeat() {
    if (!this.memoryManager) {
      return null;
    }

    // 使用Task API包装心跳操作
    return await this.taskIntegration.wrapOperation(
      'heartbeat',
      async () => await this.memoryManager.heartbeat(),
      {
        subject: 'Soul系统心跳检查',
        description: '检查Soul系统状态、记忆同步、思维定势检测',
        activeForm: '执行心跳检查中',
        metadata: {
          cliName: this.cliName,
          timestamp: new Date().toISOString()
        }
      }
    );
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
