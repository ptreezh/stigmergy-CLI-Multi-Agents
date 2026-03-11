/**
 * Stigmergy Soul Engine
 * 借鉴 OpenClaw 的核心机制实现
 *
 * 核心组件：
 * 1. Agent Loop - 双层循环执行
 * 2. Memory - JSONL 持久化记忆
 * 3. Skill Loader - 动态技能加载
 * 4. Event Stream - 事件流系统
 *
 * @author Stigmergy Soul Evolution Team
 * @version 1.0.0
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

/**
 * 生成安全的唯一标识符
 * @param {string} prefix - ID前缀
 * @returns {string} 安全的唯一ID
 */
function generateSecureId(prefix = "id") {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString("hex");
  return `${prefix}_${timestamp}_${randomBytes}`;
}

/**
 * SoulEngine - 核心 Agent Loop 执行引擎
 *
 * 借鉴 OpenClaw 的双层循环设计：
 * - 外层循环：处理 follow-up 和持续进化
 * - 内层循环：执行技能和工具调用
 */
class SoulEngine {
  constructor(options = {}) {
    this.stigmergyDir =
      options.stigmergyDir || path.join(os.homedir(), ".stigmergy");
    this.soulStateDir = path.join(this.stigmergyDir, "soul-state");

    // 核心组件
    this.memory = new MemoryStore(this.soulStateDir);
    this.skillLoader = new SkillLoader(this.stigmergyDir, options);
    this.eventStream = new EventStream();

    // 配置
    this.config = {
      maxOuterTurns: options.maxOuterTurns || 10,
      maxInnerTurns: options.maxInnerTurns || 50,
      heartbeatInterval: options.heartbeatInterval || 60 * 60 * 1000, // 1小时
      autoEvolve: options.autoEvolve !== false,
      verbose: options.verbose || false,
    };

    // 状态
    this.isRunning = false;
    this.heartbeatTimer = null;
  }

  /**
   * 启动 Soul 引擎
   */
  async start() {
    console.log("🧠 Starting Soul Engine...");
    await this.initialize();
    this.isRunning = true;

    // 启动 Heartbeat
    if (this.config.autoEvolve) {
      this.startHeartbeat();
    }

    console.log("✅ Soul Engine started");
    return this;
  }

  /**
   * 初始化引擎
   */
  async initialize() {
    // 创建目录
    await fs.promises.mkdir(this.soulStateDir, { recursive: true });
    await fs.promises.mkdir(path.join(this.soulStateDir, "memory"), {
      recursive: true,
    });
    await fs.promises.mkdir(path.join(this.soulStateDir, "skills"), {
      recursive: true,
    });
    await fs.promises.mkdir(path.join(this.soulStateDir, "evolution"), {
      recursive: true,
    });

    // 初始化记忆
    await this.memory.initialize();

    // 加载技能
    await this.skillLoader.loadAllSkills();

    this.eventStream.push({
      type: "engine_start",
      timestamp: Date.now(),
      data: { config: this.config },
    });
  }

  /**
   * Agent Loop - 双层循环执行
   *
   * 借鉴 OpenClaw 的设计：
   * - 外层：处理 follow-up
   * - 内层：执行技能
   */
  async runAgentLoop(task, context = {}) {
    console.log(`\n🔄 Agent Loop started for task: ${task}`);

    const session = {
      id: this.generateSessionId(),
      task,
      context,
      startTime: Date.now(),
      events: [],
    };

    try {
      // 外层循环
      for (
        let outerTurn = 0;
        outerTurn < this.config.maxOuterTurns;
        outerTurn++
      ) {
        this.eventStream.push({
          type: "outer_loop_start",
          turn: outerTurn,
          sessionId: session.id,
        });

        // 内层循环
        for (
          let innerTurn = 0;
          innerTurn < this.config.maxInnerTurns;
          innerTurn++
        ) {
          const innerEvent = {
            type: "inner_loop_start",
            outerTurn,
            innerTurn,
            sessionId: session.id,
          };
          this.eventStream.push(innerEvent);

          // 执行技能
          const result = await this.executeSkills(task, context, session);

          // 检查是否完成
          if (result.done) {
            this.eventStream.push({
              type: "task_complete",
              sessionId: session.id,
              result: result.output,
            });
            return result;
          }

          // 更新上下文
          context = { ...context, ...result.context };
        }
      }
    } catch (error) {
      this.eventStream.push({
        type: "error",
        sessionId: session.id,
        error: error.message,
      });
      throw error;
    } finally {
      // 保存会话到记忆
      await this.memory.storeSession(session);
    }
  }

  /**
   * 执行技能
   */
  async executeSkills(task, context, session) {
    // 查找相关技能
    const relevantSkills = this.skillLoader.findRelevantSkills(task, context);

    if (this.config.verbose) {
      console.log(`Found ${relevantSkills.length} relevant skills`);
    }

    // 执行每个技能
    const results = [];
    for (const skill of relevantSkills) {
      try {
        this.eventStream.push({
          type: "skill_execution_start",
          skillName: skill.name,
          sessionId: session.id,
        });

        const result = await skill.execute(task, context, {
          memory: this.memory,
          eventStream: this.eventStream,
        });

        results.push({
          skill: skill.name,
          success: true,
          result,
        });

        this.eventStream.push({
          type: "skill_execution_complete",
          skillName: skill.name,
          sessionId: session.id,
          result,
        });
      } catch (error) {
        results.push({
          skill: skill.name,
          success: false,
          error: error.message,
        });

        this.eventStream.push({
          type: "skill_execution_error",
          skillName: skill.name,
          sessionId: session.id,
          error: error.message,
        });
      }
    }

    // 整合结果
    return this.aggregateResults(results);
  }

  /**
   * 整合技能执行结果
   */
  aggregateResults(results) {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    // 检查是否有技能标记任务完成
    const done = successful.some((r) => r.result?.done);

    // 收集输出
    const output = successful
      .map((r) => r.result?.output)
      .filter((o) => o)
      .join("\n\n");

    // 收集上下文更新
    const context = successful.reduce(
      (acc, r) => ({ ...acc, ...r.result?.context }),
      {},
    );

    return {
      done,
      output,
      context,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
      },
    };
  }

  /**
   * Heartbeat - 主动触发机制
   *
   * 定期主动执行进化任务
   */
  startHeartbeat() {
    console.log("💓 Starting Heartbeat...");

    const beat = async () => {
      try {
        this.eventStream.push({ type: "heartbeat_start" });

        // 执行进化任务
        await this.runEvolutionTasks();

        this.eventStream.push({ type: "heartbeat_complete" });
      } catch (error) {
        this.eventStream.push({
          type: "heartbeat_error",
          error: error.message,
        });
        console.error("Heartbeat error:", error);
      }
    };

    // 立即执行一次
    beat();

    // 定时执行
    this.heartbeatTimer = setInterval(beat, this.config.heartbeatInterval);
  }

  /**
   * 运行进化任务
   */
  async runEvolutionTasks() {
    console.log("\n🧬 Running evolution tasks...");

    // 1. 反思最近的学习
    const reflectionSkill = this.skillLoader.getSkill("soul-reflection");
    if (reflectionSkill) {
      await reflectionSkill.execute(
        "reflect",
        {},
        {
          memory: this.memory,
          eventStream: this.eventStream,
        },
      );
    }

    // 2. 学习新技能
    const evolveSkill = this.skillLoader.getSkill("soul-auto-evolve");
    if (evolveSkill) {
      await evolveSkill.execute(
        "learn",
        {},
        {
          memory: this.memory,
          eventStream: this.eventStream,
        },
      );
    }

    // 3. 清理和优化
    await this.memory.cleanup();
  }

  /**
   * 停止引擎
   */
  async stop() {
    console.log("\n🛑 Stopping Soul Engine...");

    this.isRunning = false;

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // 保存事件流
    await this.eventStream.save(path.join(this.soulStateDir, "evolution"));

    console.log("✅ Soul Engine stopped");
  }

  /**
   * 生成会话 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * MemoryStore - JSONL 持久化记忆系统
 *
 * 借鉴 OpenClaw 的会话持久化机制
 */
class MemoryStore {
  constructor(baseDir, options = {}) {
    this.memoryDir = path.join(baseDir, "memory");
    this.sessionsFile = path.join(this.memoryDir, "sessions.jsonl");
    this.verbose = options.verbose || false;

    // 内存缓存 - 优化频繁读取
    this.cache = new Map();
    this.cacheMaxSize = options.cacheMaxSize || 100;
    this.lastModified = 0;
  }

  async initialize() {
    await fs.promises.mkdir(this.memoryDir, { recursive: true });
  }

  /**
   * 存储会话（追加到 JSONL）
   *
   * JSONL 格式：每行一个 JSON 对象
   * 优势：追加写入 O(1)，不需要重写整个文件
   */
  async storeSession(session) {
    const entry = {
      timestamp: Date.now(),
      session,
    };

    const line = JSON.stringify(entry) + "\n";
    await fs.promises.appendFile(this.sessionsFile, line);

    // 更新缓存
    this.cache.set(session.id, entry);
    this.evictCacheIfNeeded();

    if (this.verbose) {
      console.log(`💾 Session stored: ${session.id}`);
    }
  }

  /**
   * 缓存淘汰策略 (LRU)
   */
  evictCacheIfNeeded() {
    if (this.cache.size > this.cacheMaxSize) {
      // 删除最早的条目
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * 检索相关记忆
   *
   * 优化：使用流式读取处理大文件
   */
  async retrieveMemories(query, limit = 10) {
    const sessions = [];

    // 先检查缓存
    for (const [, entry] of this.cache) {
      if (this.isRelevant(entry.session, query)) {
        sessions.push(entry.session);
        if (sessions.length >= limit) return sessions;
      }
    }

    try {
      // 使用 readline 逐行读取，避免全量加载
      const content = await fs.promises.readFile(this.sessionsFile, "utf-8");
      const lines = content.trim().split("\n");

      // 从最新的记录开始读取（倒序）
      for (let i = lines.length - 1; i >= 0 && sessions.length < limit; i--) {
        try {
          const data = JSON.parse(lines[i]);
          if (this.isRelevant(data.session, query)) {
            sessions.push(data.session);
          }
        } catch (parseError) {
          // 忽略解析错误，继续处理
        }
      }
    } catch (error) {
      // 文件不存在是正常情况
      if (error.code !== "ENOENT") {
        console.error("Error retrieving memories:", error);
      }
    }

    return sessions;
  }

  /**
   * 判断记忆是否相关
   *
   * 优化：支持多关键词匹配
   */
  isRelevant(session, query) {
    if (!query) return true; // 空查询返回所有

    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const taskLower = session.task?.toLowerCase() || "";

    // 所有关键词都需要匹配
    return queryTerms.every((term) => taskLower.includes(term));
  }

  /**
   * 清理旧记忆
   *
   * 实现时间衰减清理策略
   */
  async cleanup(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
    // 默认30天
    const cutoffTime = Date.now() - maxAgeMs;

    try {
      const content = await fs.promises.readFile(this.sessionsFile, "utf-8");
      const lines = content.trim().split("\n");
      const validLines = [];

      let cleanedCount = 0;
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.timestamp >= cutoffTime) {
            validLines.push(line);
          } else {
            cleanedCount++;
          }
        } catch (parseError) {
          // 保留无法解析的行（可能需要人工检查）
          validLines.push(line);
        }
      }

      // 重写文件
      await fs.promises.writeFile(
        this.sessionsFile,
        validLines.join("\n") + "\n",
      );

      // 清理缓存
      for (const [id, entry] of this.cache) {
        if (entry.timestamp < cutoffTime) {
          this.cache.delete(id);
        }
      }

      if (this.verbose && cleanedCount > 0) {
        console.log(`🧹 Cleaned ${cleanedCount} old memory entries`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Error cleaning up memories:", error);
      }
    }
  }
}

/**
 * SkillLoader - 动态技能加载器
 *
 * 加载和管理可执行的 Soul 技能
 */
class SkillLoader {
  constructor(stigmergyDir, options = {}) {
    this.stigmergyDir = stigmergyDir;
    this.skillsDir = path.join(stigmergyDir, "skills");
    this.skills = new Map();
    this.verbose = options.verbose || false;
  }

  /**
   * 加载所有技能
   */
  async loadAllSkills() {
    console.log("\n📚 Loading Soul skills...");

    // 加载内置技能
    await this.loadBuiltinSkills();

    // 加载用户技能
    await this.loadUserSkills();

    console.log(`✅ Loaded ${this.skills.size} skills`);
  }

  /**
   * 加载内置技能
   */
  async loadBuiltinSkills() {
    // 找到项目根目录（向上查找 package.json）
    let rootDir = __dirname;
    while (rootDir !== path.dirname(rootDir)) {
      if (fs.existsSync(path.join(rootDir, "package.json"))) {
        break;
      }
      rootDir = path.dirname(rootDir);
    }

    const builtinSkillsPath = path.join(rootDir, "skills");

    // 调试信息
    if (this.verbose || process.env.DEBUG) {
      console.log(`[DEBUG] __dirname: ${__dirname}`);
      console.log(`[DEBUG] rootDir: ${rootDir}`);
      console.log(`[DEBUG] builtinSkillsPath: ${builtinSkillsPath}`);
      console.log(`[DEBUG] Skills exist: ${fs.existsSync(builtinSkillsPath)}`);

      if (fs.existsSync(builtinSkillsPath)) {
        const files = fs.readdirSync(builtinSkillsPath);
        console.log(
          `[DEBUG] Files in skills dir: ${files.filter((f) => f.endsWith(".js")).join(", ")}`,
        );
      }
    }

    // 加载 soul-reflection
    await this.loadSkill("soul-reflection", builtinSkillsPath);

    // 加载 soul-auto-evolve
    await this.loadSkill("soul-auto-evolve", builtinSkillsPath);

    // 加载新的可执行技能
    await this.loadSkill("soul-auto-search", builtinSkillsPath);
    await this.loadSkill("soul-auto-compute", builtinSkillsPath);
  }

  /**
   * 加载用户技能
   */
  async loadUserSkills() {
    const userSkillsDir = path.join(this.skillsDir, "user");

    try {
      const files = await fs.promises.readdir(userSkillsDir);

      for (const file of files) {
        if (file.endsWith(".js")) {
          const skillName = path.basename(file, ".js");
          await this.loadSkill(skillName, userSkillsDir);
        }
      }
    } catch (error) {
      // 目录不存在是正常情况
      if (error.code !== "ENOENT") {
        console.error("Error loading user skills:", error);
      }
    }
  }

  /**
   * 加载单个技能
   */
  async loadSkill(skillName, skillsDir) {
    try {
      const skillPath = path.join(skillsDir, skillName + ".js");

      if (!fs.existsSync(skillPath)) {
        console.log(`⚠️  Skill not found: ${skillName}`);
        return;
      }

      // 动态加载技能模块
      const SkillClass = require(skillPath);
      const skill = new SkillClass();

      this.skills.set(skillName, skill);

      console.log(`✅ Loaded skill: ${skillName}`);
    } catch (error) {
      console.error(`❌ Error loading skill ${skillName}:`, error.message);
    }
  }

  /**
   * 查找相关技能
   */
  findRelevantSkills(task, context) {
    const relevant = [];

    for (const [name, skill] of this.skills) {
      if (skill.canHandle(task, context)) {
        relevant.push(skill);
      }
    }

    return relevant;
  }

  /**
   * 获取指定技能
   */
  getSkill(skillName) {
    return this.skills.get(skillName);
  }
}

/**
 * EventStream - 事件流系统
 *
 * 借鉴 OpenClaw 的 EventStream 设计
 */
class EventStream {
  constructor() {
    this.events = [];
    this.listeners = new Map();
  }

  /**
   * 推送事件
   */
  push(event) {
    this.events.push({
      ...event,
      id: this.generateEventId(),
      timestamp: event.timestamp || Date.now(),
    });

    // 通知监听器
    this.notifyListeners(event);
  }

  /**
   * 生成事件 ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加监听器
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType).push(callback);
  }

  /**
   * 通知监听器
   */
  notifyListeners(event) {
    const listeners = this.listeners.get(event.type) || [];

    for (const callback of listeners) {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }

  /**
   * 保存事件流
   */
  async save(outputDir) {
    await fs.promises.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(outputDir, `events_${timestamp}.jsonl`);

    const lines = this.events.map((e) => JSON.stringify(e)).join("\n");
    await fs.promises.writeFile(outputFile, lines);

    console.log(`💾 Event stream saved: ${outputFile}`);
  }
}

module.exports = {
  SoulEngine,
  MemoryStore,
  SkillLoader,
  EventStream,
};
