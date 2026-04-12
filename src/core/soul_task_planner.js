/**
 * SoulTaskPlanner - 灵魂绑定任务规划器
 *
 * 核心功能：
 * 1. 基于soul.md愿景制定长期计划
 * 2. 分解任务为可执行单元
 * 3. 自主执行和优化计划
 * 4. 持续反思和改进
 */

const fs = require("fs");
const path = require("path");
const DeadLetterQueue = require("./soul/DeadLetterQueue");

class SoulTaskPlanner {
  constructor(options = {}) {
    this.soulIdentity = options.soulIdentity;
    this.knowledgeBase = options.knowledgeBase;
    this.skillEvolver = options.skillEvolver;

    this.config = {
      planPath: options.planPath || "./soul_plans",
      maxConcurrentTasks: options.maxConcurrentTasks || 3,
      reflectionIntervalMs: options.reflectionIntervalMs || 24 * 60 * 60 * 1000, // 24小时
      ...options,
    };

    // 当前计划
    this.currentPlan = null;
    this.taskQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];

    // 反思状态
    this.lastReflection = null;
    this.reflectionHistory = [];

    // 确保计划目录存在
    if (!fs.existsSync(this.config.planPath)) {
      fs.mkdirSync(this.config.planPath, { recursive: true });
    }
  }

  /**
   * 基于愿景制定长期计划
   */
  async createPlan() {
    const identity = this.soulIdentity;
    const vision = identity.vision || {};

    const plan = {
      id: `plan_${Date.now()}`,
      createdAt: new Date().toISOString(),
      soulName: identity.name,
      vision: {
        shortTerm: vision.shortTerm || "",
        mediumTerm: vision.mediumTerm || "",
        longTerm: vision.longTerm || "",
      },
      goals: [],
      tasks: [],
      status: "active",
    };

    // 解析短期愿景
    if (vision.shortTerm) {
      const shortGoal = this._parseGoal("short", vision.shortTerm);
      plan.goals.push(shortGoal);
    }

    // 解析中期愿景
    if (vision.mediumTerm) {
      const mediumGoal = this._parseGoal("medium", vision.mediumTerm);
      plan.goals.push(mediumGoal);
    }

    // 解析长期愿景
    if (vision.longTerm) {
      const longGoal = this._parseGoal("long", vision.longTerm);
      plan.goals.push(longGoal);
    }

    // 为每个目标生成任务
    for (const goal of plan.goals) {
      const tasks = await this._generateTasks(goal);
      plan.tasks.push(...tasks);
    }

    this.currentPlan = plan;
    this._savePlan(plan);

    console.log(
      `[SoulTaskPlanner] 📋 Created plan with ${plan.tasks.length} tasks`,
    );

    return plan;
  }

  /**
   * 解析愿景为目标
   */
  _parseGoal(timeframe, vision) {
    return {
      id: `goal_${timeframe}_${Date.now()}`,
      timeframe, // short, medium, long
      vision,
      progress: 0,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 为目标生成任务
   */
  async _generateTasks(goal) {
    const tasks = [];
    const expertise = this.soulIdentity.expertise?.core || [];

    // 基于专业知识领域生成任务
    for (const exp of expertise) {
      const task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        goalId: goal.id,
        title: `深入学习 ${exp} 领域`,
        description: `围绕 ${exp} 进行系统学习和实践，${goal.vision}`,
        expertise: exp,
        timeframe: goal.timeframe,
        status: "pending",
        priority: goal.timeframe === "short" ? "high" : "medium",
        createdAt: new Date().toISOString(),
        subtasks: [
          { title: `搜集 ${exp} 权威资料`, status: "pending" },
          { title: "学习核心概念和理论", status: "pending" },
          { title: "实践应用分析", status: "pending" },
          { title: "总结和分享", status: "pending" },
        ],
      };
      tasks.push(task);
    }

    // 添加知识库建设任务
    const kbTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      goalId: goal.id,
      title: "建设专业知识库",
      description: "通过学习构建和丰富知识库",
      expertise: "knowledge-building",
      timeframe: goal.timeframe,
      status: "pending",
      priority: "high",
      createdAt: new Date().toISOString(),
      subtasks: [
        { title: "整理核心知识", status: "pending" },
        { title: "标注和分类", status: "pending" },
        { title: "验证知识准确性", status: "pending" },
      ],
    };
    tasks.push(kbTask);

    return tasks;
  }

  /**
   * 执行计划
   */
  async executePlan() {
    if (!this.currentPlan) {
      console.log("[SoulTaskPlanner] No active plan, creating one...");
      await this.createPlan();
    }

    const results = {
      executed: [],
      completed: [],
      failed: [],
    };

    // 按优先级和状态获取待执行任务
    const pendingTasks = this.currentPlan.tasks
      .filter((t) => t.status === "pending")
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, this.config.maxConcurrentTasks);

    console.log(`[SoulTaskPlanner] Executing ${pendingTasks.length} tasks...`);

    for (const task of pendingTasks) {
      try {
        const result = await this._executeTask(task);

        if (result.success) {
          results.completed.push(task);
          this.completedTasks.push(task);
        } else {
          results.failed.push(task);
          this.failedTasks.push(task);
        }

        results.executed.push(task);
      } catch (e) {
        console.error(`[SoulTaskPlanner] Task ${task.id} failed:`, e.message);
        results.failed.push(task);
        this.failedTasks.push(task);
      }
    }

    // 更新计划状态
    this._updatePlanProgress();
    this._savePlan(this.currentPlan);

    return results;
  }

  /**
   * 执行单个任务
   */
  async _executeTask(task) {
    console.log(`[SoulTaskPlanner] ▶ Executing task: ${task.title}`);

    task.status = "running";
    task.startedAt = new Date().toISOString();

    try {
      // 根据任务类型执行
      if (task.expertise === "knowledge-building") {
        // 知识库建设任务
        await this._buildKnowledge(task);
      } else {
        // 专业学习任务 - 触发技能进化
        if (this.skillEvolver) {
          await this.skillEvolver.evolve();
        }
      }

      // 标记子任务完成
      for (const subtask of task.subtasks) {
        subtask.status = "completed";
      }

      task.status = "completed";
      task.completedAt = new Date().toISOString();
      task.success = true;

      // 更新目标进度
      const goal = this.currentPlan?.goals.find((g) => g.id === task.goalId);
      if (goal) {
        const totalTasks = this.currentPlan.tasks.filter(
          (t) => t.goalId === goal.id,
        ).length;
        const completedTasks = this.currentPlan.tasks.filter(
          (t) => t.goalId === goal.id && t.status === "completed",
        ).length;
        goal.progress = (completedTasks / totalTasks) * 100;

        if (goal.progress >= 100) {
          goal.status = "completed";
        }
      }

      return { success: true, task };
    } catch (e) {
      task.status = "failed";
      task.error = e.message;
      task.completedAt = new Date().toISOString();

      return { success: false, task, error: e.message };
    }
  }

  /**
   * 知识库建设
   */
  async _buildKnowledge(task) {
    // 简单实现：添加一个知识条目
    if (this.knowledgeBase) {
      this.knowledgeBase.add({
        title: task.title,
        content: task.description,
        source: "auto-planner",
        sourceType: "planned",
        tags: [task.expertise, "planned"],
      });
    }
  }

  /**
   * 反思和优化
   */
  async reflect() {
    const reflection = {
      id: `ref_${Date.now()}`,
      timestamp: new Date().toISOString(),
      completedTasks: this.completedTasks.length,
      failedTasks: this.failedTasks.length,
      currentPlanProgress: this._calculateProgress(),
      insights: [],
      improvements: [],
    };

    // 分析失败任务
    if (this.failedTasks.length > 0) {
      reflection.insights.push(
        `有 ${this.failedTasks.length} 个任务失败，需要调整策略`,
      );
    }

    // 分析进度
    const progress = reflection.currentPlanProgress;
    if (progress < 30) {
      reflection.improvements.push("进度较慢，建议增加学习频率");
    } else if (progress > 80) {
      reflection.improvements.push("进展良好，可以挑战更高难度的任务");
    }

    // 检查是否需要更新愿景
    const daysSinceCreation = this.currentPlan
      ? (Date.now() - new Date(this.currentPlan.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      : 0;

    if (daysSinceCreation > 30) {
      reflection.improvements.push("计划已执行超过30天，建议回顾和更新愿景");
    }

    this.lastReflection = reflection;
    this.reflectionHistory.push(reflection);

    // 保持30条反思记录
    if (this.reflectionHistory.length > 30) {
      this.reflectionHistory = this.reflectionHistory.slice(-30);
    }

    // 保存反思
    this._saveReflection(reflection);

    console.log(
      `[SoulTaskPlanner] 💭 Reflection: ${reflection.insights.join(", ")}`,
    );

    return reflection;
  }

  /**
   * 优化计划
   */
  async optimizePlan() {
    if (!this.currentPlan) return null;

    // 先反思
    const reflection = await this.reflect();

    // 根据反思优化计划
    for (const improvement of reflection.improvements) {
      if (improvement.includes("增加学习频率")) {
        // 增加更多学习任务
        const newTask = this._generateTaskFromReflection(reflection);
        if (newTask) {
          this.currentPlan.tasks.push(newTask);
        }
      }

      if (improvement.includes("更新愿景")) {
        // 重新生成计划
        await this.createPlan();
      }
    }

    this._savePlan(this.currentPlan);

    console.log("[SoulTaskPlanner] ✅ Plan optimized");

    return this.currentPlan;
  }

  /**
   * 从反思生成任务
   */
  _generateTaskFromReflection(reflection) {
    const expertise = this.soulIdentity.expertise?.learningDirections?.[0];
    if (!expertise) return null;

    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: `强化学习: ${expertise}`,
      description: "基于反思的强化学习任务",
      expertise,
      timeframe: "short",
      status: "pending",
      priority: "high",
      createdAt: new Date().toISOString(),
      subtasks: [],
    };
  }

  /**
   * 计算计划进度
   */
  _calculateProgress() {
    if (!this.currentPlan || this.currentPlan.tasks.length === 0) return 0;

    const completed = this.currentPlan.tasks.filter(
      (t) => t.status === "completed",
    ).length;
    return (completed / this.currentPlan.tasks.length) * 100;
  }

  /**
   * 更新计划进度
   */
  _updatePlanProgress() {
    if (!this.currentPlan) return;

    this.currentPlan.progress = this._calculateProgress();

    if (this.currentPlan.progress >= 100) {
      this.currentPlan.status = "completed";
      this.currentPlan.completedAt = new Date().toISOString();
    }
  }

  /**
   * 获取计划状态
   */
  getStatus() {
    return {
      hasPlan: !!this.currentPlan,
      planId: this.currentPlan?.id,
      progress: this._calculateProgress(),
      totalTasks: this.currentPlan?.tasks?.length || 0,
      completedTasks: this.completedTasks.length,
      failedTasks: this.failedTasks.length,
      pendingTasks:
        this.currentPlan?.tasks?.filter((t) => t.status === "pending").length ||
        0,
      lastReflection: this.lastReflection,
    };
  }

  /**
   * 获取详细计划
   */
  getPlan() {
    return this.currentPlan;
  }

  /**
   * 保存计划
   */
  _savePlan(plan) {
    if (!plan) return;

    const filePath = path.join(this.config.planPath, `${plan.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(plan, null, 2), "utf-8");
  }

  /**
   * 保存反思
   */
  _saveReflection(reflection) {
    const filePath = path.join(this.config.planPath, "reflections.json");
    let reflections = [];

    if (fs.existsSync(filePath)) {
      try {
        reflections = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (err) {
        const { ValidationError } = require('./coordination/error_handler');
        const classified = new ValidationError(err.message, { operation: '_saveReflection', file: filePath });
        this.logger?.warn(`[SoulTaskPlanner] ValidationError: skipped corrupt reflections file: ${classified.message}`, { context: classified.context });
        const dlq = new DeadLetterQueue();
        try { dlq.push(classified, { operation: '_saveReflection' }); } catch (_) {}
        // Return empty reflections array, don't throw
      }
    }

    reflections.push(reflection);
    fs.writeFileSync(filePath, JSON.stringify(reflections, null, 2), "utf-8");
  }
}

module.exports = SoulTaskPlanner;
