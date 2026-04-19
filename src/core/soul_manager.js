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
const SkillOntologySearch = require("./skill_ontology_search");
const SkillOrchestrator = require("./skill_orchestrator");
const { SoulDecisionEngine, DecisionContext, DecisionVerifier, FallbackManager } = require("./soul/DECI");
const DecisionAuditor = require("./soul/DecisionAuditor");

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
    this.ontologySearch = null;
    this.orchestrator = null;
    this.isInitialized = false;
    this.lastLearningTime = null;
    this.lastAlignmentCheck = null;

    // DECI decision engine (INTEG-01)
    this.decisionEngine = null;
    this.decisionVerifier = null;
    this.decisionAuditor = null;
    this.deciEnabled = options.deciEnabled !== false; // default enabled
    this._pendingDecision = null;
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
      personality: { traits: [], style: "", values: "" },
      mission: { ultimate: "", responsibilities: [] },
      vision: { short: "", mid: "", long: "" },
      expertise: { core: [], related: [], depth: "" },
      learningStrategy: {},
      alignmentCriteria: {},
    };

    // 解析内容
    const lines = content.split("\n");
    let currentSection = "";

    for (const line of lines) {
      const match = line.match(/^##\s+(.+)/);
      if (match) {
        currentSection = match[1].trim();
        continue;
      }

      // 身份 Identity
      if (line.includes("**名称**:")) {
        identity.name = line.match(/\*\*名称\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }
      if (line.includes("**角色**:")) {
        identity.role = line.match(/\*\*角色\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }
      if (line.includes("**类型**:")) {
        identity.type = line.match(/\*\*类型\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }

      // 人格 Personality
      if (currentSection.includes("人格") && line.includes("**核心特质**:")) {
        const traitsMatch = line.match(/\*\*核心特质\*\*:\s*(.+)/);
        if (traitsMatch) {
          identity.personality.traits = traitsMatch[1].split(/[,、，]/).map(t => t.trim());
        }
      }

      // 使命 Mission
      if (currentSection.includes("使命") && line.includes("**终极目标**:")) {
        identity.mission.ultimate = line.match(/\*\*终极目标\*\*:\s*(.+)/)?.[1]?.trim() || "";
      }

      // 专业知识域 Expertise
      if (currentSection.includes("专业") && line.includes("**核心领域**:")) {
        const coreMatch = line.match(/\*\*核心领域\*\*:\s*(.+)/);
        if (coreMatch) {
          identity.expertise.core = coreMatch[1].split(/[,、，]/).map(t => t.trim());
        }
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

    // 初始化技能本体论搜索
    this.ontologySearch = new SkillOntologySearch({
      skillsPath: this.skillsPath,
    });

    // 初始化技能编排引擎
    this.orchestrator = new SkillOrchestrator({
      skillsPath: this.skillsPath,
    });

    console.log(
      `[SoulManager] Initialized for ${this.identity?.name || "Unknown"}`,
    );
    console.log(
      `[SoulManager] Task Integration: ${this.taskIntegration.enabled ? 'enabled' : 'disabled'}`,
    );
    console.log(
      `[SoulManager] Skill Ontology: ${this.ontologySearch ? 'loaded' : 'not found'}`,
    );

    // Initialize DECI decision engine (INTEG-01)
    await this.initDecisionEngine();

    return true;
  }

  /**
   * Initialize DECI decision engine
   */
  async initDecisionEngine() {
    if (!this.deciEnabled) return;
    this.decisionEngine = new SoulDecisionEngine({
      projectRoot: this.skillsPath,
    });
    this.decisionVerifier = new DecisionVerifier();
    this.decisionAuditor = new DecisionAuditor();
    console.log(
      `[SoulManager] DECI Decision Engine: ${this.deciEnabled ? 'enabled' : 'disabled'}`,
    );
  }

  /**
   * DECI pre-action gate — called before every autonomous action.
   * @param {string} decisionType — operation type identifier
   * @param {Object} context — { situation, action, ...DecisionContext fields }
   * @returns {Object|null} — null if action should proceed, object with decision info if blocked/escalated
   */
  async preActionHook(decisionType, context) {
    if (!this.deciEnabled || !this.decisionEngine) return null;

    const ctx = new DecisionContext({
      situation: context.situation || `Soul ${decisionType} decision`,
      action: context.action || decisionType,
      operationCategory: context.operationCategory || this._categorizeOperation(decisionType),
      contextClarity: context.contextClarity || 0.7,
      riskLevel: context.riskLevel || this._defaultRiskLevel(decisionType),
      taskFamiliarity: context.taskFamiliarity || 0.5,
      outcomeHistory: context.outcomeHistory || 0.5,
      autonomyBudget: context.autonomyBudget || 1.0,
      decisionType,
    });

    const result = this.decisionEngine.decide(ctx);

    // Log to audit (Phase 1 DECI-04)
    if (this.decisionAuditor) {
      this.decisionAuditor.log({
        situation: result.situation,
        context: ctx.toJSON(),
        options: null,
        selected: result.final_decision,
        confidenceScore: result.layer2 ? result.layer2.score : null,
        finalDecision: result.final_decision,
        outcome: null, // filled in after execution
        escalated: result.final_decision !== 'ACT_AUTONOMOUSLY',
      });
    }

    if (result.final_decision === 'BLOCK') {
      console.warn(`[SoulManager] DECI BLOCKED: ${result.situation} — ${result.layer1.reason}`);
      return result;
    }

    if (result.final_decision === 'HALT_AND_NOTIFY') {
      console.error(`[SoulManager] DECI HALT: ${result.situation} — consecutive failures: ${result.layer3?.consecutive_failures}`);
      return result;
    }

    if (result.final_decision === 'ASK_USER') {
      console.log(`[SoulManager] DECI ESCALATE: ${result.situation} — confidence ${result.layer2?.score?.toFixed(4)} below threshold`);
      return result;
    }

    // ACT_AUTONOMOUSLY — proceed, store for post-verification
    this._pendingDecision = result;
    return null;
  }

  /**
   * Post-action verification — call after autonomous action completes.
   * @param {Object} outcome — { success: boolean, error?: string }
   * @param {boolean} skipVerification — true if outcome cannot be verified
   */
  async postActionVerify(outcome, skipVerification = false) {
    if (!this.deciEnabled || !this._pendingDecision) return;

    const verdict = this.decisionVerifier.verify(this._pendingDecision, outcome, { skipVerification });
    this.decisionVerifier.recordVerdict(verdict, this._pendingDecision.decisionType || 'autonomous');

    const success = verdict.verdict === 'PASS';
    this.decisionEngine.recordOutcome(success);

    this._pendingDecision = null;
  }

  _categorizeOperation(decisionType) {
    const readOnly = ['heartbeat', 'alignment-check'];
    return readOnly.includes(decisionType) ? 'always_safe' : 'non_destructive';
  }

  _defaultRiskLevel(decisionType) {
    const riskMap = {
      evolve: 0.3,
      'batch-evolve': 0.4,
      heartbeat: 0.1,
      'alignment-check': 0.1,
      'reorganize-ontology': 0.2,
    };
    return riskMap[decisionType] || 0.3;
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

    // INTEG-01: DECI pre-action gate
    const blocked = await this.preActionHook('evolve', {
      situation: `Soul evolution in direction: ${direction}`,
      action: `evolve(${direction})`,
      operationCategory: 'non_destructive',
      riskLevel: 0.3,
    });
    if (blocked) {
      return {
        success: false,
        error: 'DECI blocked/escalated',
        decision: blocked.final_decision,
        reason: blocked.layer1?.reason || blocked.layer2?.score,
      };
    }

    let result;
    try {
      // 使用Task API包装进化操作
      result = await this.taskIntegration.wrapOperation(
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
      await this.postActionVerify({ success: result?.success === true });
    } catch (e) {
      await this.postActionVerify({ success: false, error: e.message });
      throw e;
    }

    // 进化后自动整理技能本体论
    if (result?.success) {
      await this.reorganizeOntology();
    }

    return result;
  }

  /**
   * 自动整理技能本体论
   */
  async reorganizeOntology() {
    if (!this.ontologySearch) return { success: false, error: "Ontology search not initialized" };

    console.log("[SoulManager] Reorganizing skill ontology...");

    // 扫描新技能
    const stats = this.ontologySearch.getStats();
    console.log(`[SoulManager] Current ontology stats:`, JSON.stringify(stats, null, 2));

    return {
      success: true,
      stats,
      searchCapabilities: this.ontologySearch ? 'ready' : 'not available',
      orchestrationTemplates: this.orchestrator ? this.orchestrator.listTemplates().length : 0,
    };
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

    // INTEG-01: DECI pre-action gate
    const blocked = await this.preActionHook('alignment-check', {
      situation: 'Soul alignment verification',
      action: 'alignment-check',
      operationCategory: 'always_safe',
      riskLevel: 0.1,
    });
    if (blocked) {
      return {
        aligned: false,
        score: 0,
        error: 'DECI blocked/escalated',
        decision: blocked.final_decision,
      };
    }

    let result;
    try {
      result = await this.taskIntegration.wrapOperation(
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
      await this.postActionVerify({ success: true });
    } catch (e) {
      await this.postActionVerify({ success: false, error: e.message });
    }

    return result;
  }

  /**
   * 心跳检查 - 使用Task API
   */
  async heartbeat() {
    if (!this.memoryManager) {
      return null;
    }

    // INTEG-01: DECI pre-action gate
    const blocked = await this.preActionHook('heartbeat', {
      situation: 'Soul system heartbeat check',
      action: 'heartbeat',
      operationCategory: 'always_safe',
      riskLevel: 0.1,
    });
    if (blocked) {
      return { error: 'DECI blocked/escalated', decision: blocked.final_decision };
    }

    let result;
    try {
      result = await this.taskIntegration.wrapOperation(
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
      await this.postActionVerify({ success: !!result });
    } catch (e) {
      await this.postActionVerify({ success: false, error: e.message });
    }

    return result;
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
