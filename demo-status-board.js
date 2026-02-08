#!/usr/bin/env node

/**
 * 项目全局状态看板 - 快速演示
 * 展示跨 CLI 会话的间接协同机制
 */

const fs = require('fs').promises;
const path = require('path');

async function demo() {
  console.log('========================================');
  console.log('  项目全局状态看板 - 快速演示');
  console.log('========================================\n');

  const statusFile = path.join(process.cwd(), '.stigmergy', 'status', 'PROJECT_STATUS.md');

  // 检查状态文件是否存在
  try {
    await fs.access(statusFile);
    console.log('✓ 发现项目状态文件\n');

    // 读取并显示状态文件
    const content = await fs.readFile(statusFile, 'utf8');
    console.log('─'.repeat(60));
    console.log(content);
    console.log('─'.repeat(60));
    console.log('');

    console.log('💡 这是您的项目全局状态看板！');
    console.log('');
    console.log('🔑 关键特性：');
    console.log('  1. 持久化 - 所有会话共享同一个状态文件');
    console.log('  2. 人类可读 - Markdown 格式，可以直接查看');
    console.log('  3. 版本控制 - 可以纳入 Git 管理');
    console.log('  4. 间接协同 - CLI 们通过状态文件协同工作');
    console.log('');
    console.log('📂 文件位置:');
    console.log(`   ${statusFile}`);
    console.log('');
    console.log('🚀 使用方式：');
    console.log('   stigmergy interactive  # 启动交互模式');
    console.log('   > status               # 查看项目状态');
    console.log('   > context              # 查看上下文详情');
    console.log('   > use qwen             # 切换到 qwen');
    console.log('   > 你好                 # 执行任务（自动记录到状态看板）');
    console.log('');

  } catch (error) {
    console.log('✗ 还没有项目状态文件');
    console.log('');
    console.log('💡 启动交互模式以自动创建状态看板：');
    console.log('   stigmergy interactive');
    console.log('   > status');
    console.log('');
  }

  console.log('========================================');
  console.log('  详细文档');
  console.log('========================================\n');

  console.log('📖 完整架构文档:');
  console.log('   PROJECT_STATUS_BOARD_ARCHITECTURE.md');
  console.log('');
  console.log('📖 Planning with Files 技能:');
  console.log('   skills/planning-with-files/SKILL.md');
  console.log('');
  console.log('📖 实现源码:');
  console.log('   src/core/ProjectStatusBoard.js');
  console.log('   src/interactive/InteractiveModeController.js');
  console.log('');
}

demo();
