#!/usr/bin/env node

/**
 * 层级化项目状态看板演示
 * 展示单一看板 vs 多看板模式
 */

const { HierarchicalStatusBoard } = require('./src/core/HierarchicalStatusBoard');
const path = require('path');

async function demoSingleBoardMode() {
  console.log('\n========================================');
  console.log('  模式1: 单一看板（推荐用于小型项目）');
  console.log('========================================\n');

  const board = new HierarchicalStatusBoard();

  // 初始化（默认单一看板模式）
  await board.initialize({
    name: 'MySmallProject',
    phase: 'development'
  });

  console.log('✓ 初始化单一看板');
  console.log(`  看板路径: ${board.getCurrentBoard().statusFilePath}\n`);

  // 记录不同模块的工作
  await board.recordTask('qwen', '设计数据库模型', { success: true });
  console.log('✓ 记录后端任务');

  await board.recordTask('iflow', '实现用户API', { success: true });
  console.log('✓ 记录后端任务');

  await board.recordTask('claude', '编写API文档', { success: true });
  console.log('✓ 记录文档任务');

  await board.recordFinding('qwen', 'design', '后端使用 PostgreSQL');
  console.log('✓ 记录后端发现');

  await board.recordFinding('claude', 'documentation', '文档使用 Swagger');
  console.log('✓ 记录文档发现\n');

  // 生成报告
  const report = await board.generateReport();
  console.log('📊 项目状态:');
  console.log('─'.repeat(60));
  console.log(report);
  console.log('─'.repeat(60));

  console.log('✅ 适用场景:');
  console.log('   - 小型项目（< 10个模块）');
  console.log('   - 团队规模小（< 5人）');
  console.log('   - 模块间紧密耦合\n');
}

async function demoMultiBoardMode() {
  console.log('\n========================================');
  console.log('  模式2: 多看板（推荐用于大型项目）');
  console.log('========================================\n');

  const board = new HierarchicalStatusBoard();

  // 初始化主看板
  await board.initialize({
    name: 'MyLargeProject',
    phase: 'development'
  });

  console.log('✓ 初始化主看板\n');

  // 创建子看板
  console.log('Step 1: 创建子模块看板');
  await board.createSubBoard('./backend', 'backend', {
    name: 'MyLargeProject-Backend',
    phase: 'implementation'
  });
  console.log('✓ 创建后端独立看板');

  await board.createSubBoard('./frontend', 'frontend', {
    name: 'MyLargeProject-Frontend',
    phase: 'implementation'
  });
  console.log('✓ 创建前端独立看板');

  await board.createSubBoard('./docs', 'docs', {
    name: 'MyLargeProject-Docs',
    phase: 'documentation'
  });
  console.log('✓ 创建文档独立看板\n');

  // 在不同看板上工作
  console.log('Step 2: 在后端看板上工作');
  await board.switchBoard('backend');
  await board.recordTask('qwen', '设计用户表结构', { success: true });
  await board.recordFinding('qwen', 'design', '使用 PostgreSQL + Sequelize');
  console.log('✓ 后端看板: 记录数据库设计');

  await board.switchBoard('frontend');
  console.log('\nStep 3: 切换到前端看板');
  await board.recordTask('iflow', '实现登录页面', { success: true });
  await board.recordFinding('iflow', 'implementation', '使用 React + TypeScript');
  console.log('✓ 前端看板: 记录UI实现');

  await board.switchBoard('docs');
  console.log('\nStep 4: 切换到文档看板');
  await board.recordTask('claude', '编写API文档', { success: true });
  await board.recordFinding('claude', 'documentation', '使用 OpenAPI 规范');
  console.log('✓ 文档看板: 记录文档工作');

  // 切换回主看板
  await board.switchBoard('default');
  console.log('\nStep 5: 切换回主看板');
  await board.recordTask('gemini', '项目整体架构评审', { success: true });
  console.log('✓ 主看板: 记录全局任务\n');

  // 生成报告
  const report = await board.generateReport();
  console.log('📊 层级化项目状态:');
  console.log('─'.repeat(60));
  console.log(report);
  console.log('─'.repeat(60));

  console.log('✅ 适用场景:');
  console.log('   - 大型项目（> 10个模块）');
  console.log('   - 团队规模大（> 5人）');
  console.log('   - 模块间松耦合，可独立开发\n');

  // 展示跨看板上下文
  console.log('Step 6: 获取全局上下文');
  const globalContext = await board.getGlobalContext({
    includeSubBoards: true,
    maxHistory: 3
  });

  console.log('🌍 跨看板全局上下文:');
  console.log('─'.repeat(60));
  console.log(globalContext);
  console.log('─'.repeat(60));
}

async function demoDecisionGuide() {
  console.log('\n========================================');
  console.log('  如何选择看板模式？');
  console.log('========================================\n');

  console.log('决策树:');
  console.log('');
  console.log('1. 项目规模');
  console.log('   小型（< 10个模块，< 5人） → 单一看板');
  console.log('   大型（> 10个模块，> 5人）   → 进入2');
  console.log('');
  console.log('2. 模块耦合度');
  console.log('   紧耦合（频繁跨模块协作）     → 单一看板');
  console.log('   松耦合（模块独立开发）       → 进入3');
  console.log('');
  console.log('3. 团队组织');
  console.log('   单一团队（所有人在一起）     → 单一看板');
  console.log('   多团队（分布式团队）        → 多看板');
  console.log('');
  console.log('4. 频率考虑');
  console.log('   某模块特别活跃（日均>50次提交）→ 该模块独立看板');
  console.log('   各模块频率均衡                → 单一看板');
  console.log('');

  console.log('========================================');
  console.log('  推荐配置');
  console.log('========================================\n');

  console.log('【推荐1】默认：单一看板');
  console.log('  stigmergy/i');
  console.log('  > use qwen');
  console.log('  qwen> 做后端开发');
  console.log('  > use iflow');
  console.log('  iflow> 做前端开发');
  console.log('  # 所有工作都在同一看板\n');

  console.log('【推荐2】大型项目：多看板');
  console.log('  # 初始化多看板模式');
  console.log('  > board init multi');
  console.log('  > board create backend ./backend');
  console.log('  > board create frontend ./frontend');
  console.log('  ');
  console.log('  # 切换到后端看板');
  console.log('  > board switch backend');
  console.log('  > use qwen');
  console.log('  qwen> 开发后端API');
  console.log('  ');
  console.log('  # 切换到前端看板');
  console.log('  > board switch frontend');
  console.log('  > use iflow');
  console.log('  iflow> 开发前端页面');
  console.log('  ');
  console.log('  # 查看全局状态');
  console.log('  > board status');
  console.log('  ');
  console.log('  # 获取跨看板上下文');
  console.log('  > board context --global\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   层级化项目状态看板 - 使用演示           ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // 演示单一看板模式
  await demoSingleBoardMode();

  // 演示多看板模式
  await demoMultiBoardMode();

  // 决策指南
  await demoDecisionGuide();

  console.log('========================================');
  console.log('  总结');
  console.log('========================================\n');

  console.log('✅ 已实现:');
  console.log('  1. 每个项目目录独立看板');
  console.log('  2. 支持单一看板模式（默认）');
  console.log('  3. 支持多看板模式（大型项目）');
  console.log('  4. 看板间独立但可相互引用');
  console.log('  5. 跨看板全局上下文');
  console.log('  6. 灵活切换看板');
  console.log('');

  console.log('📁 文件结构:');
  console.log('  单一看板:');
  console.log('    my-project/.stigmergy/status/PROJECT_STATUS.md');
  console.log('');
  console.log('  多看板:');
  console.log('    my-project/.stigmergy/status/');
  console.log('      ├── PROJECT_STATUS.md      ← 主看板');
  console.log('      ├── config.json             ← 看板配置');
  console.log('    my-project/backend/.stigmergy/status/');
  console.log('      └── PROJECT_STATUS.md      ← 后端独立看板');
  console.log('    my-project/frontend/.stigmergy/status/');
  console.log('      └── PROJECT_STATUS.md      ← 前端独立看板');
  console.log('');

  console.log('🎯 核心原则:');
  console.log('  ✓ 每个项目目录独立看板');
  console.log('  ✓ 不同目录的协同不会混淆');
  console.log('  ✓ 子目录可选独立看板');
  console.log('  ✓ 根据项目规模灵活选择\n');
}

main().catch(console.error);
