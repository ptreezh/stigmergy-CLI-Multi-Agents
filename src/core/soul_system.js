/**
 * Soul System - 智能体灵魂系统
 *
 * 导出所有Soul相关模块
 */

const SoulManager = require("./soul_manager");
const SoulKnowledgeBase = require("./soul_knowledge_base");
const SoulSkillEvolver = require("./soul_skill_evolver");
const SoulAlignmentChecker = require("./soul_alignment_checker");
const SoulTaskPlanner = require("./soul_task_planner");
const SoulScheduler = require("./soul_scheduler");

/**
 * 创建完整的Soul系统实例
 */
async function createSoulSystem(options) {
  const {
    cliName,
    skillsPath,
    autoLearn = true,
    learningIntervalHours = 24,
  } = options;

  // 1. 创建SoulManager
  const soulManager = new SoulManager({
    cliName,
    skillsPath,
    autoLearn,
    learningIntervalHours,
  });

  // 2. 检测soul.md
  const hasSoul = await soulManager.detectSoul(skillsPath);

  if (!hasSoul) {
    console.log(`[SoulSystem] No soul.md found in ${skillsPath}`);
    return null;
  }

  // 3. 加载soul.md
  await soulManager.loadSoul();

  // 4. 初始化组件
  await soulManager.initAutonomousSystem();

  // 5. 启动调度器
  if (autoLearn) {
    soulManager.scheduler.start();
  }

  return soulManager;
}

/**
 * 集成到CLI Hooks
 */
async function integrateToCLI(soulManager, cliAdapter) {
  if (!soulManager || !cliAdapter) {
    throw new Error("soulManager and cliAdapter are required");
  }

  // 注册到CLI的对齐检查hook
  await soulManager.scheduler.registerToCLI(
    cliAdapter.cliName || "unknown",
    cliAdapter,
  );

  console.log(`[SoulSystem] Integrated with CLI adapter`);

  return soulManager;
}

module.exports = {
  SoulManager,
  SoulKnowledgeBase,
  SoulSkillEvolver,
  SoulAlignmentChecker,
  SoulTaskPlanner,
  SoulScheduler,
  createSoulSystem,
  integrateToCLI,
};
