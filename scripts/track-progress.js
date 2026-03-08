#!/usr/bin/env node
/**
 * Stigmergy 进化进度跟踪器
 *
 * 功能：自动跟踪和报告进化进度
 * 特点：实时更新、生成报告、预测完成时间
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

/**
 * 加载规划文件
 */
function loadPlan() {
  const planPath = path.join(__dirname, '../docs/planning/task_plan.md');
  const content = fs.readFileSync(planPath, 'utf-8');
  return content;
}

/**
 * 加载进度文件
 */
function loadProgress() {
  const progressPath = path.join(__dirname, '../docs/planning/progress.md');
  const content = fs.readFileSync(progressPath, 'utf-8');
  return content;
}

/**
 * 解析阶段进度
 */
function parsePhaseProgress(plan, progress) {
  const phases = [];

  // 解析计划中的阶段
  const phaseRegex = /### (🎯|🧠|🔄|🤖|🚀|📊) 阶段 (\d+): ([^\n]+)/g;
  let match;
  const phaseList = [];

  while ((match = phaseRegex.exec(plan)) !== null) {
    phaseList.push({
      icon: match[1],
      number: parseInt(match[2]),
      name: match[3].trim()
    });
  }

  return phaseList;
}

/**
 * 获取实际统计数据
 */
function getActualStats() {
  const soulStateDir = path.join(require('os').homedir(), '.stigmergy', 'soul-state');

  const stats = {
    reflections: 0,
    evolvedSkills: 0,
    sessions: 0,
    evolutions: 0
  };

  // 统计反思记录
  const reflectionDir = path.join(soulStateDir, 'reflections');
  if (fs.existsSync(reflectionDir)) {
    const files = fs.readdirSync(reflectionDir).filter(f => f.endsWith('.json'));
    stats.reflections = files.length;
  }

  // 统计进化技能
  const skillsDir = path.join(soulStateDir, 'evolved-skills');
  if (fs.existsSync(skillsDir)) {
    const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));
    stats.evolvedSkills = files.length;
  }

  // 统计会话
  const memoryFile = path.join(soulStateDir, 'memory', 'sessions.jsonl');
  if (fs.existsSync(memoryFile)) {
    const content = fs.readFileSync(memoryFile, 'utf-8');
    stats.sessions = content.trim().split('\n').filter(l => l).length;
  }

  // 统计进化次数
  const evolutionLog = path.join(soulStateDir, 'evolution-log.jsonl');
  if (fs.existsSync(evolutionLog)) {
    const content = fs.readFileSync(evolutionLog, 'utf-8');
    stats.evolutions = content.trim().split('\n').filter(l => l).length;
  }

  return stats;
}

/**
 * 计算进度百分比
 */
function calculateProgress(stats) {
  // 基于成功标准的简化计算
  const targets = {
    reflections: 10,      // 目标：至少 10 次反思
    evolvedSkills: 10,    // 目标：至少 10 个技能
    sessions: 50,         // 目标：至少 50 个会话
    evolutions: 20        // 目标：至少 20 次进化
  };

  const progress = {
    reflections: Math.min(100, (stats.reflections / targets.reflections) * 100),
    evolvedSkills: Math.min(100, (stats.evolvedSkills / targets.evolvedSkills) * 100),
    sessions: Math.min(100, (stats.sessions / targets.sessions) * 100),
    evolutions: Math.min(100, (stats.evolutions / targets.evolutions) * 100)
  };

  // 总体进度
  progress.overall = (
    progress.reflections +
    progress.evolvedSkills +
    progress.sessions +
    progress.evolutions
  ) / 4;

  return progress;
}

/**
 * 生成进度条
 */
function generateProgressBar(percent, width = 30) {
  const filled = Math.round(width * percent / 100);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent.toFixed(1)}%`;
}

/**
 * 显示进度报告
 */
function showProgressReport() {
  console.log('');
  log(colors.cyan, '╔════════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║' + colors.bright + '   Stigmergy 自主进化进度报告' + colors.reset + colors.cyan + '                            ║');
  log(colors.cyan, '╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // 加载文件
  const plan = loadPlan();
  const progress = loadProgress();

  // 解析阶段
  const phases = parsePhaseProgress(plan, progress);

  // 获取统计数据
  const stats = getActualStats();

  // 计算进度
  const progressPercent = calculateProgress(stats);

  // 显示整体进度
  log(colors.blue, '📊 整体进度');
  log(colors.green, `  ${generateProgressBar(progressPercent.overall)}\n`);

  // 显示各维度进度
  log(colors.blue, '📈 各维度进度\n');

  log(colors.cyan, `  反思记录:`);
  log(colors.green, `    ${generateProgressBar(progressPercent.reflections, 20)}`);
  log(colors.cyan, `    实际: ${stats.reflections} / 目标: 10\n`);

  log(colors.cyan, `  进化技能:`);
  log(colors.green, `    ${generateProgressBar(progressPercent.evolvedSkills, 20)}`);
  log(colors.cyan, `    实际: ${stats.evolvedSkills} / 目标: 10\n`);

  log(colors.cyan, `  会话记忆:`);
  log(colors.green, `    ${generateProgressBar(progressPercent.sessions, 20)}`);
  log(colors.cyan, `    实际: ${stats.sessions} / 目标: 50\n`);

  log(colors.cyan, `  进化次数:`);
  log(colors.green, `    ${generateProgressBar(progressPercent.evolutions, 20)}`);
  log(colors.cyan, `    实际: ${stats.evolutions} / 目标: 20\n`);

  // 显示阶段列表
  log(colors.blue, '🎯 阶段规划\n');

  for (const phase of phases) {
    log(colors.cyan, `  ${phase.icon} 阶段 ${phase.number}: ${phase.name}`);
  }

  console.log('');

  // 显示下一步
  log(colors.blue, '🚀 下一步行动\n');

  if (progressPercent.overall < 20) {
    log(colors.yellow, '  • 阶段 1: 实现双 Agent Loop 基础架构');
    log(colors.cyan, '  • 创建 Planner Agent');
    log(colors.cyan, '  • 创建 Executor Agent');
    log(colors.cyan, '  • 实现通信协议\n');
  } else if (progressPercent.overall < 40) {
    log(colors.yellow, '  • 阶段 2: 实现自我评估系统');
    log(colors.cyan, '  • 设计能力评估框架');
    log(colors.cyan, '  • 实现自我评估 Agent');
    log(colors.cyan, '  • 创建评估报告\n');
  } else if (progressPercent.overall < 60) {
    log(colors.yellow, '  • 阶段 3: 实现闭环进化系统');
    log(colors.cyan, '  • 设计进化循环架构');
    log(colors.cyan, '  • 实现自动技能生成');
    log(colors.cyan, '  • 实现 A/B 测试框架\n');
  } else {
    log(colors.yellow, '  • 继续推进当前阶段');
    log(colors.cyan, '  • 查看详细计划: docs/planning/task_plan.md\n');
  }

  // 显示时间估算
  log(colors.blue, '⏱️  时间估算\n');

  const totalWeeks = 30; // 总计 30 周
  const elapsedWeeks = Math.floor((progressPercent.overall / 100) * totalWeeks);
  const remainingWeeks = totalWeeks - elapsedWeeks;

  log(colors.cyan, `  已用时间: 约 ${elapsedWeeks} 周`);
  log(colors.cyan, `  剩余时间: 约 ${remainingWeeks} 周`);
  log(colors.cyan, `  预计完成: ${new Date(Date.now() + remainingWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`);

  // 显示提示
  log(colors.yellow, '💡 提示:');
  log(colors.cyan, '  • 查看详细计划: cat docs/planning/task_plan.md');
  log(colors.cyan, '  • 查看研究发现: cat docs/planning/findings.md');
  log(colors.cyan, '  • 更新进度: 编辑 docs/planning/progress.md');
  log(colors.cyan, '  • 启动进化: node scripts/start-evolution.js\n');
}

/**
 * 主函数
 */
async function main() {
  try {
    showProgressReport();
  } catch (error) {
    log(colors.red, '❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { main, showProgressReport };
