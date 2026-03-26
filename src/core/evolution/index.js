/**
 * Soul Evolution System - 主入口
 *
 * 整合所有进化组件：
 * - SkillDependencyEnforcer: 强制依赖加载
 * - EvolveLoop: 自动进化循环
 * - CronScheduler: 定时计划
 * - SkillGenerator: 技能自主创建
 *
 * 使用方式:
 * const { createSoulEvolutionSystem } = require('./src/core/evolution');
 * const system = await createSoulEvolutionSystem({ cliAdapter });
 * system.start(); // 启动自动进化
 */

const { SkillDependencyEnforcer } = require("./SkillDependencyEnforcer");
const { EvolveLoop } = require("./EvolveLoop");
const { CronScheduler } = require("./CronScheduler");
const { SkillGenerator } = require("./SkillGenerator");

/**
 * 创建 Soul 进化系统
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 进化系统实例
 */
async function createSoulEvolutionSystem(options = {}) {
  const {
    cliAdapter = null,
    skillManager = null,
    skillReader = null,
    verbose = false,
    autoStart = false,
  } = options;

  console.log("[SoulEvolution] 🔧 Creating Soul Evolution System...");

  // 1. 创建依赖强制加载器
  const dependencyEnforcer = new SkillDependencyEnforcer({
    skillReader,
    skillManager,
    verbose,
  });

  // 2. 创建技能生成器
  const skillGenerator = new SkillGenerator({
    verbose,
  });

  // 3. 创建进化循环 (依赖其他组件)
  const evolveLoop = new EvolveLoop({
    cliAdapter,
    skillManager,
    dependencyEnforcer,
    verbose,
    autoLoop: true, // 自动循环
    maxIterations: 100, // 最大100次迭代
    evolveDelayMs: 5000, // 5秒间隔
  });

  // 监听进化完成事件，自动创建技能
  evolveLoop.on("evolveComplete", async (result) => {
    console.log(
      "[SoulEvolution] 📝 Evolution complete, analyzing for skill creation...",
    );

    try {
      // 从进化结果中提取经验教训
      const experience = {
        lessons: _extractLessons(result),
        patterns: _extractPatterns(result),
        improvements: _extractImprovements(result),
        context: result,
      };

      // 创建或优化技能
      const skillResult = await skillGenerator.createFromExperience(experience);

      if (skillResult.success) {
        console.log(
          `[SoulEvolution] 🎉 Skill ${skillResult.type}: ${skillResult.name}`,
        );
      }
    } catch (e) {
      console.warn(`[SoulEvolution] Skill creation failed: ${e.message}`);
    }
  });

  // 4. 创建定时调度器
  const scheduler = new CronScheduler({
    evolveLoop,
    smartSchedule: true,
    nightIntervalMs: 30 * 60 * 1000, // 夜间30分钟
    dayIntervalMs: 4 * 60 * 60 * 1000, // 白天4小时
  });

  // 5. 创建统一的系统接口
  const system = {
    // 组件
    dependencyEnforcer,
    evolveLoop,
    scheduler,
    skillGenerator,

    // 状态
    isRunning: false,

    /**
     * 启动自动进化系统
     */
    async start() {
      console.log("[SoulEvolution] 🚀 Starting Soul Evolution System...");

      // 预加载依赖
      console.log("[SoulEvolution] 📦 Preloading dependencies...");
      await dependencyEnforcer.preloadSoulDependencies();

      // 启动定时调度器
      scheduler.start();

      this.isRunning = true;
      console.log("[SoulEvolution] ✅ Soul Evolution System started");

      return { success: true };
    },

    /**
     * 停止自动进化系统
     */
    async stop() {
      console.log("[SoulEvolution] ⏹ Stopping Soul Evolution System...");

      scheduler.stop();
      await evolveLoop.stop();

      this.isRunning = false;
      console.log("[SoulEvolution] ✅ Soul Evolution System stopped");

      return { success: true, totalEvolutions: evolveLoop.totalEvolutions };
    },

    /**
     * 手动触发一次进化
     */
    async triggerEvolve() {
      return scheduler.triggerNow();
    },

    /**
     * 强制加载技能及其依赖
     */
    async loadSkill(skillName) {
      return dependencyEnforcer.enforceAndLoad(skillName);
    },

    /**
     * 获取系统状态
     */
    getStatus() {
      return {
        isRunning: this.isRunning,
        loop: evolveLoop.getStatus(),
        scheduler: scheduler.getStatus(),
        createdSkills: skillGenerator.listCreatedSkills(),
      };
    },
  };

  // 自动启动 (可选)
  if (autoStart) {
    await system.start();
  }

  return system;
}

/**
 * 从进化结果中提取经验教训
 * @private
 */
function _extractLessons(result) {
  const lessons = [];

  if (result.analysis?.lessons) {
    lessons.push(...result.analysis.lessons);
  }

  if (result.extraction?.keyPoints) {
    result.extraction.keyPoints.forEach((kp) => {
      lessons.push(kp);
    });
  }

  return lessons;
}

/**
 * 从进化结果中提取模式
 * @private
 */
function _extractPatterns(result) {
  const patterns = [];

  if (result.analysis?.patterns) {
    patterns.push(...result.analysis.patterns);
  }

  return patterns;
}

/**
 * 从进化结果中提取改进要点
 * @private
 */
function _extractImprovements(result) {
  const improvements = [];

  if (result.creation?.improvements) {
    improvements.push(...result.creation.improvements);
  }

  if (result.test?.suggestions) {
    result.test.suggestions.forEach((s) => {
      improvements.push(s);
    });
  }

  return improvements;
}

module.exports = {
  createSoulEvolutionSystem,
  SkillDependencyEnforcer,
  EvolveLoop,
  CronScheduler,
  SkillGenerator,
};
