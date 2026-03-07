#!/usr/bin/env node
/**
 * 增强版经验提取命令
 * 基于CLI模型算力的智能经验提取和技能生成
 */

const EnhancedExperienceManager = require('../src/core/memory/EnhancedExperienceManager');

async function extractCommand() {
  console.log('🚀 启动LLM驱动的经验提取...\n');

  const manager = new EnhancedExperienceManager();

  try {
    // 步骤1: 扫描并分析会话
    console.log('步骤 1/3: 扫描并分析CLI会话');
    console.log('='.repeat(50));
    const scanResult = await manager.scanAndAnalyzeSessions();

    if (scanResult.extractedInsights === 0) {
      console.log('\n⚠️  未提取到新的经验，可能原因:');
      console.log('   1. 最近没有CLI会话活动');
      console.log('   2. 会话内容不适合提取经验');
      console.log('   3. CLI调用失败');
      return;
    }

    // 步骤2: 分析并生成技能
    console.log('\n步骤 2/3: 分析经验并生成技能');
    console.log('='.repeat(50));
    await manager.analyzeAndGenerateSkills();

    // 步骤3: 总结报告
    console.log('\n步骤 3/3: 生成总结报告');
    console.log('='.repeat(50));
    console.log(`\n✅ 经验提取完成！`);
    console.log(`   - 扫描会话: ${scanResult.totalSessions}`);
    console.log(`   - 成功分析: ${scanResult.analyzedSessions}`);
    console.log(`   - 提取洞察: ${scanResult.extractedInsights}`);
    console.log(`\n📝 记忆文件: ${manager.stigmergyMd}`);
    console.log(`📂 技能目录: ${manager.skillsDir}`);

  } catch (error) {
    console.error('\n❌ 经验提取失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  extractCommand().then(() => {
    console.log('\n✨ 完成！');
    process.exit(0);
  }).catch(error => {
    console.error('\n💥 执行失败:', error);
    process.exit(1);
  });
}

module.exports = { extractCommand };
