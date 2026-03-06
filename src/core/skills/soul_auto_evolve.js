/**
 * Soul Auto-Evolve Skill - 从soul.md自动生成的技能
 *
 * 这是子智能体的每个核心技能：
 * 1. 自主规划学习计划
 * 2. 搜集权威资料并消化
 * 3. 基于应用反馈迭代优化
 * 4. 定时对齐使命和检查进化
 * 5. 生成新的学习进化任务清单
 * 6. 自主长时任务执行
 * 7. 夜间30分钟/白天4小时+汇报
 */

class SoulAutoEvolveSkill {
  constructor(soulIdentity, options = {}) {
    this.name = "soul-auto-evolve";
    this.displayName = `${soulIdentity.name || "Soul"} 自主进化`;
    this.description = "基于soul.md的自主学习进化技能";

    // 绑定的人设
    this.soulIdentity = soulIdentity;

    // 核心组件
    this.knowledgeBase = options.knowledgeBase || null;
    this.skillEvolver = options.skillEvolver || null;
    this.alignmentChecker = options.alignmentChecker || null;
    this.taskPlanner = options.taskPlanner || null;
    this.scheduler = options.scheduler || null;

    // 触发词
    this.triggers = [
      "自主学习",
      "进化",
      "学习计划",
      "对齐检查",
      " evolution",
      " auto-learn",
      "align",
    ];

    // 状态
    this.lastEvolveTime = null;
    this.lastAlignCheck = null;
    this.evolutionCount = 0;
    this.learningTasks = [];
    this.feedbackHistory = [];
  }

  /**
   * 执行技能
   */
  async execute(context) {
    const { task, params = {} } = context;

    // 解析任务
    const action = this._parseAction(task);

    switch (action) {
      case "learn":
      case "evolve":
        return await this._doEvolve(params);

      case "align":
      case "check":
        return await this._doAlignCheck(params);

      case "plan":
        return await this._doPlanLearning(params);

      case "feedback":
        return await this._doFeedback(params);

      case "status":
        return await this._doStatus(params);

      case "report":
        return await this._doReport(params);

      default:
        return await this._doComprehensiveAction(task, params);
    }
  }

  /**
   * 解析动作
   */
  _parseAction(task) {
    const taskLower = task.toLowerCase();

    if (
      taskLower.includes("学习") ||
      taskLower.includes("进化") ||
      taskLower.includes("learn") ||
      taskLower.includes("evolve")
    ) {
      return "learn";
    }

    if (
      taskLower.includes("对齐") ||
      taskLower.includes("检查") ||
      taskLower.includes("align") ||
      taskLower.includes("check")
    ) {
      return "align";
    }

    if (taskLower.includes("计划") || taskLower.includes("plan")) {
      return "plan";
    }

    if (taskLower.includes("反馈") || taskLower.includes("feedback")) {
      return "feedback";
    }

    if (taskLower.includes("状态") || taskLower.includes("status")) {
      return "status";
    }

    if (taskLower.includes("报告") || taskLower.includes("report")) {
      return "report";
    }

    return "auto";
  }

  /**
   * 执行进化
   */
  async _doEvolve(params = {}) {
    const startTime = Date.now();

    const result = {
      type: "evolve",
      success: true,
      timestamp: new Date().toISOString(),
      actions: [],
      knowledgeAdded: 0,
      skillsUpdated: 0,
      alignmentImproved: 0,
      errors: [],
    };

    try {
      // 1. 搜集权威资料
      result.actions.push("📚 搜集权威资料...");
      const sources = await this._collectAuthoritativeSources();

      // 2. 消化知识
      result.actions.push("🧠 消化知识...");
      for (const source of sources) {
        const knowledge = await this._digestKnowledge(source);
        if (knowledge && this.knowledgeBase) {
          this.knowledgeBase.add(knowledge);
          result.knowledgeAdded++;
        }
      }

      // 3. 进化技能
      result.actions.push("⚡ 进化技能...");
      if (this.skillEvolver) {
        const evolveResult = await this.skillEvolver.evolve();
        result.skillsUpdated = evolveResult?.skillsCreated?.length || 0;
      }

      // 4. 检查对齐
      result.actions.push("🎯 检查对齐...");
      const alignCheck = await this._checkAlignment();
      result.alignmentImproved = alignCheck.improved ? 1 : 0;

      // 5. 生成新任务（如果需要）
      if (result.knowledgeAdded > 0 || result.alignmentImproved > 0) {
        result.actions.push("📋 生成新任务...");
        await this._generateNewTasks();
      }

      this.lastEvolveTime = new Date();
      this.evolutionCount++;

      const duration = Date.now() - startTime;

      return {
        ...result,
        summary: `✅ 进化完成: +${result.knowledgeAdded}知识, ${result.skillsUpdated}技能更新, ${duration}ms`,
        soulAlignment: {
          name: this.soulIdentity.name,
          role: this.soulIdentity.role,
          mission: this.soulIdentity.mission?.ultimate,
        },
      };
    } catch (e) {
      result.success = false;
      result.errors.push(e.message);
      return result;
    }
  }

  /**
   * 执行对齐检查
   */
  async _doAlignCheck(params = {}) {
    const output = params.output || params.content || "";

    if (!this.alignmentChecker) {
      return { aligned: true, message: "No alignment checker available" };
    }

    const result = await this.alignmentChecker.check(output);

    this.lastAlignCheck = new Date();

    return {
      type: "align-check",
      timestamp: new Date().toISOString(),
      aligned: result.aligned,
      overallScore: result.overallScore,
      personalityScore: result.personalityScore,
      missionScore: result.missionScore,
      expertiseScore: result.expertiseScore,
      warnings: result.warnings || [],
      suggestions: result.suggestions || [],
      summary: result.aligned
        ? `✅ 对齐检查通过 (${Math.round(result.overallScore * 100)}%)`
        : `⚠️ 对齐需要改进 (${Math.round(result.overallScore * 100)}%)`,
    };
  }

  /**
   * 规划学习
   */
  async _doPlanLearning(params = {}) {
    if (!this.taskPlanner) {
      return { message: "No task planner available" };
    }

    // 创建或更新计划
    const plan = await this.taskPlanner.createPlan();

    // 执行计划
    const execution = await this.taskPlanner.executePlan();

    return {
      type: "plan",
      timestamp: new Date().toISOString(),
      plan: {
        id: plan.id,
        goals: plan.goals.length,
        tasks: plan.tasks.length,
        progress: plan.progress,
      },
      execution: {
        executed: execution.executed?.length || 0,
        completed: execution.completed?.length || 0,
        failed: execution.failed?.length || 0,
      },
      summary: `📋 计划包含 ${plan.goals.length} 个目标, ${plan.tasks.length} 个任务`,
    };
  }

  /**
   * 处理反馈
   */
  async _doFeedback(params = {}) {
    const feedback = params.feedback || params.content || "";

    // 记录反馈
    const feedbackEntry = {
      id: `fb_${Date.now()}`,
      content: feedback,
      timestamp: new Date().toISOString(),
      source: params.source || "manual",
    };

    this.feedbackHistory.push(feedbackEntry);

    // 分析反馈
    const analysis = await this._analyzeFeedback(feedback);

    // 如果需要调整，生成新任务
    if (analysis.needsAdjustment) {
      await this._generateAdjustmentTasks(analysis);
    }

    return {
      type: "feedback",
      timestamp: new Date().toISOString(),
      feedbackId: feedbackEntry.id,
      analysis,
      summary: `📝 已记录反馈并${analysis.needsAdjustment ? "生成调整任务" : "进行分析"}`,
    };
  }

  /**
   * 状态查询
   */
  async _doStatus(params = {}) {
    const knowledgeSize = this.knowledgeBase?.getSize() || 0;
    const alignStatus = this.alignmentChecker?.getStatus?.() || {};
    const plannerStatus = this.taskPlanner?.getStatus?.() || {};
    const schedulerStatus = this.scheduler?.getStatus?.() || {};

    return {
      type: "status",
      timestamp: new Date().toISOString(),
      identity: {
        name: this.soulIdentity.name,
        role: this.soulIdentity.role,
        expertise: this.soulIdentity.expertise?.core,
      },
      stats: {
        evolutionCount: this.evolutionCount,
        lastEvolve: this.lastEvolveTime?.toISOString(),
        lastAlignCheck: this.lastAlignCheck?.toISOString(),
        knowledgeBaseSize: knowledgeSize,
        feedbackCount: this.feedbackHistory.length,
      },
      alignment: alignStatus,
      planning: plannerStatus,
      scheduler: {
        mode: schedulerStatus.currentMode,
        nextEvolve: schedulerStatus.nextEvolveTime,
        running: schedulerStatus.isRunning,
      },
      summary: `📊 ${this.soulIdentity.name} - ${knowledgeSize} 知识条目, ${this.evolutionCount} 次进化`,
    };
  }

  /**
   * 生成报告
   */
  async _doReport(params = {}) {
    const status = await this._doStatus();
    const dailyAlign =
      (await this.alignmentChecker?.checkDailyAlignment?.()) || {};

    const report = {
      type: "report",
      timestamp: new Date().toISOString(),
      period: params.period || "daily",
      identity: status.identity,
      stats: status.stats,
      alignment: {
        today: dailyAlign,
        rate: status.alignment?.alignmentRate || 0,
      },
      scheduler: status.scheduler,
      recommendations: this._generateRecommendations(status),
    };

    return report;
  }

  // ==================== 私有方法 ====================

  /**
   * 搜集权威资料
   */
  async _collectAuthoritativeSources() {
    const directions = this.soulIdentity.expertise?.learningDirections ||
      this.soulIdentity.expertise?.core || ["general"];

    const sources = [];

    for (const direction of directions.slice(0, 3)) {
      // 这里会调用外部搜索API
      // 模拟返回结构
      sources.push({
        direction,
        url: `https://example.com/${direction}`,
        title: `${direction} - 权威资料`,
        content: `关于${direction}的专业内容...`,
        type: "auto-collected",
      });
    }

    return sources;
  }

  /**
   * 消化知识
   */
  async _digestKnowledge(source) {
    if (!source?.content) return null;

    return {
      title: source.title,
      content: source.content,
      source: source.url,
      sourceType: source.type || "collected",
      tags: [
        this.soulIdentity.role,
        ...(this.soulIdentity.expertise?.core || []),
      ],
      expertise: [this.soulIdentity.expertise?.core?.[0] || "general"],
    };
  }

  /**
   * 检查对齐
   */
  async _checkAlignment() {
    if (!this.alignmentChecker) {
      return { improved: false };
    }

    // 检查知识库中的知识是否对齐
    const needsRealign = this.knowledgeBase?.getNeedsRealignment?.(7) || [];
    let improved = false;

    for (const entry of needsRealign.slice(0, 5)) {
      const score = this.alignmentChecker._calculateAlignment?.(entry) || 0.7;
      if (score >= 0.7) {
        this.knowledgeBase?.updateAlignmentScore?.(entry.id, score);
        improved = true;
      }
    }

    return { improved, count: needsRealign.length };
  }

  /**
   * 生成新任务
   */
  async _generateNewTasks() {
    if (!this.taskPlanner) return;

    // 基于当前进度生成新任务
    const newTask = {
      id: `task_${Date.now()}`,
      type: "auto-generated",
      title: `深化学习: ${this.soulIdentity.expertise?.learningDirections?.[0] || "核心领域"}`,
      createdAt: new Date().toISOString(),
      priority: "medium",
    };

    this.learningTasks.push(newTask);
  }

  /**
   * 分析反馈
   */
  async _analyzeFeedback(feedback) {
    const feedbackLower = feedback.toLowerCase();

    // 检查反馈类型
    const isPositive =
      feedbackLower.includes("好") ||
      feedbackLower.includes("正确") ||
      feedbackLower.includes("good") ||
      feedbackLower.includes("correct");
    const isNegative =
      feedbackLower.includes("错") ||
      feedbackLower.includes("不好") ||
      feedbackLower.includes("wrong") ||
      feedbackLower.includes("incorrect");

    // 检查是否需要调整
    const needsAdjustment =
      isNegative ||
      feedbackLower.includes("需要改进") ||
      feedbackLower.includes("needs improvement");

    // 提取关键词
    const keywords = feedback.match(/[\u4e00-\u9fa5a-zA-Z]{2,}/g) || [];

    return {
      isPositive,
      isNegative,
      needsAdjustment,
      keywords,
      sentiment: isPositive ? "positive" : isNegative ? "negative" : "neutral",
    };
  }

  /**
   * 生成调整任务
   */
  async _generateAdjustmentTasks(analysis) {
    if (!this.taskPlanner) return;

    // 创建反思任务
    const reflectionTask = {
      id: `task_reflect_${Date.now()}`,
      type: "reflection",
      title: "基于反馈的反思和调整",
      analysis,
      createdAt: new Date().toISOString(),
      priority: "high",
    };

    this.learningTasks.push(reflectionTask);
  }

  /**
   * 生成建议
   */
  _generateRecommendations(status) {
    const recommendations = [];

    // 基于进化次数
    if (status.stats.evolutionCount < 10) {
      recommendations.push("建议增加学习频率以加速进化");
    }

    // 基于对齐率
    if (status.alignment?.alignmentRate < 0.8) {
      recommendations.push("对齐率偏低，建议加强人设一致性");
    }

    // 基于知识库大小
    if (status.stats.knowledgeBaseSize < 50) {
      recommendations.push("知识库规模较小，建议扩展学习范围");
    }

    return recommendations;
  }

  /**
   * 综合动作（默认）
   */
  async _doComprehensiveAction(task, params = {}) {
    // 默认执行完整的学习循环
    return await this._doEvolve(params);
  }
}

module.exports = SoulAutoEvolveSkill;
