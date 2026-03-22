#!/usr/bin/env node

/**
 * Cross-CLI Feedback Sharing Demo
 *
 * 演示跨CLI数据共享功能（单机多CLI场景）
 *
 * 验证等级: Level 1 - 功能演示
 *
 * ⚠️ 重要声明：
 * - 这是演示脚本，使用模拟数据
 * - 适用于单机多CLI场景
 * - 当前项目实际情况：用户很少
 * - 未测试真实跨机器场景
 */

const SharedFeedbackStorage = require('../skills/shared-feedback-storage');
const SkillFeedbackCollector = require('../skills/skill-feedback-collector');

/**
 * 模拟不同CLI的反馈收集
 */
async function simulateCLICUsage() {
  console.log('\n🎬 跨CLI数据共享演示');
  console.log('=' .repeat(70));
  console.log('场景: 单机多CLI协同（Claude + Gemini + Qwen）');
  console.log('=' .repeat(70));

  // 1. 初始化共享存储
  console.log('\n📦 步骤1: 初始化共享存储');
  const sharedStorage = new SharedFeedbackStorage({
    storageType: 'shared'
  });

  const storageInfo = sharedStorage.getStorageInfo();
  console.log(`   存储类型: ${storageInfo.storageType}`);
  console.log(`   存储路径: ${storageInfo.storagePath}`);
  console.log(`   当前反馈数: ${storageInfo.totalFeedbacks}`);

  // 2. 模拟Claude CLI使用dev-browser技能
  console.log('\n🤖 步骤2: Claude CLI使用dev-browser技能');
  const claudeCollector = new SkillFeedbackCollector({
    enableSharedStorage: true,
    autoSync: true
  });

  const claudeFeedback = await claudeCollector.recordFeedback(
    'dev-browser',
    'claude-agent-1',
    {
      rating: 5,
      effectiveness: 'highly_effective',
      reliability: 5,
      easeOfUse: 4,
      domain: 'automation',
      useCase: 'web-testing',
      pros: ['功能强大', '易于使用'],
      cons: ['偶尔卡顿']
    }
  );

  console.log(`   ✅ Claude反馈已记录并同步`);

  // 3. 模拟Gemini CLI使用mathematical-statistics技能
  console.log('\n🤖 步骤3: Gemini CLI使用mathematical-statistics技能');
  const geminiCollector = new SkillFeedbackCollector({
    enableSharedStorage: true,
    autoSync: true
  });

  const geminiFeedback = await geminiCollector.recordFeedback(
    'mathematical-statistics',
    'gemini-agent-1',
    {
      rating: 4,
      effectiveness: 'moderately_effective',
      reliability: 4,
      easeOfUse: 3,
      domain: 'analysis',
      useCase: 'statistical-analysis',
      pros: ['统计功能完整'],
      cons: ['文档不够详细']
    }
  );

  console.log(`   ✅ Gemini反馈已记录并同步`);

  // 4. 模拟Qwen CLI也使用dev-browser技能
  console.log('\n🤖 步骤4: Qwen CLI也使用dev-browser技能');
  const qwenCollector = new SkillFeedbackCollector({
    enableSharedStorage: true,
    autoSync: true
  });

  const qwenFeedback = await qwenCollector.recordFeedback(
    'dev-browser',
    'qwen-agent-1',
    {
      rating: 4,
      effectiveness: 'moderately_effective',
      reliability: 4,
      easeOfUse: 5,
      domain: 'automation',
      useCase: 'web-automation',
      pros: ['界面友好'],
      cons: ['功能较少']
    }
  );

  console.log(`   ✅ Qwen反馈已记录并同步`);

  // 5. 查看共享存储统计
  console.log('\n📊 步骤5: 查看共享存储统计');
  const stats = sharedStorage.getStatistics();
  console.log(`   总反馈数: ${stats.total}`);
  console.log(`   按技能:`);
  Object.entries(stats.bySkill).forEach(([skill, count]) => {
    console.log(`      - ${skill}: ${count}条`);
  });
  console.log(`   按Agent:`);
  Object.entries(stats.byAgent).forEach(([agent, count]) => {
    console.log(`      - ${agent}: ${count}条`);
  });

  // 6. 演示跨CLI数据访问
  console.log('\n🔄 步骤6: 演示跨CLI数据访问');
  console.log('   Claude CLI查看所有反馈（包括Gemini和Qwen的）:');

  // 重新初始化collector来测试从共享存储加载
  const claudeCollector2 = new SkillFeedbackCollector({
    enableSharedStorage: true,
    autoSync: true
  });
  const claudeStats = claudeCollector2.getStatistics();
  console.log(`   - Claude可见的总反馈数: ${claudeStats.total}`);
  console.log(`   - 本地反馈: ${claudeStats.localTotal}`);
  console.log(`   - 共享存储启用: ${claudeStats.sharedStorageEnabled}`);

  // 7. 演示协同过滤场景
  console.log('\n🎯 步骤7: 协同过滤场景演示');
  console.log('   假设Gemini Agent请求推荐...');

  // 获取Gemini的反馈
  const geminiAgentFeedback = geminiCollector.getAgentFeedback('gemini-agent-1');
  console.log(`   - Gemini的历史反馈: ${geminiAgentFeedback.length}条`);

  // 查找相似的agents
  const allFeedbacks = await sharedStorage.getAllFeedbacks();
  const otherAgents = [...new Set(allFeedbacks.map(f => f.agentId))]
    .filter(id => id !== 'gemini-agent-1');

  console.log(`   - 可参考的其他agents: ${otherAgents.join(', ')}`);

  // Claude和Qwen都使用过dev-browser，可以推荐给Gemini
  const devBrowserFeedbacks = allFeedbacks.filter(f => f.skillName === 'dev-browser');
  const avgRating = devBrowserFeedbacks.reduce((sum, f) => sum + f.feedback.rating, 0) / devBrowserFeedbacks.length;

  console.log(`   - dev-browser在其他CLI的评分: ${avgRating.toFixed(1)}/5`);
  console.log(`   ✅ 可以推荐给Gemini Agent`);

  // 8. 演示数据持久化
  console.log('\n💾 步骤8: 数据持久化验证');
  const healthCheck = sharedStorage.healthCheck();
  console.log(`   - 存储健康: ${healthCheck.healthy ? '✅' : '❌'}`);
  console.log(`   - 存储目录存在: ${healthCheck.checks.storageExists ? '✅' : '❌'}`);
  console.log(`   - 索引文件有效: ${healthCheck.checks.indexValid ? '✅' : '❌'}`);

  // 9. 总结
  console.log('\n' + '='.repeat(70));
  console.log('📋 演示总结');
  console.log('='.repeat(70));
  console.log('✅ 成功演示:');
  console.log('   1. 多CLI反馈数据共享（Claude/Gemini/Qwen）');
  console.log('   2. 自动同步到共享存储');
  console.log('   3. 跨CLI数据访问和统计');
  console.log('   4. 协同过滤场景（基于其他CLI反馈推荐）');
  console.log('   5. 数据持久化');
  console.log('');
  console.log('🎯 适用场景:');
  console.log('   - 单机多CLI开发环境');
  console.log('   - 小团队协作（共享文件系统）');
  console.log('   - 本地测试和演示');
  console.log('');
  console.log('⚠️  当前限制:');
  console.log('   - 仅限单机场景');
  console.log('   - 需要共享文件系统访问');
  console.log('   - 未实现云端同步');
  console.log('   - 未实现跨机器通信');
  console.log('');
  console.log('🚀 下一步改进:');
  console.log('   - 实现云端同步服务');
  console.log('   - 支持跨机器部署');
  console.log('   - 添加数据加密和安全验证');
  console.log('   - 实现冲突解决机制');
  console.log('='.repeat(70));

  return {
    success: true,
    totalFeedbacks: stats.total,
    sharedStoragePath: storageInfo.storagePath
  };
}

/**
 * 清理演示数据
 */
async function cleanupDemo() {
  console.log('\n🧹 清理演示数据...');

  const sharedStorage = new SharedFeedbackStorage();
  const deleted = await sharedStorage.cleanupExpiredFeedbacks(0); // 删除所有

  console.log(`   ✅ 已删除 ${deleted} 条演示数据`);
}

// 执行演示
if (require.main === module) {
  simulateCLICUsage()
    .then(result => {
      console.log('\n✅ 演示完成！');
      console.log('\n💡 提示: 演示数据已保存在共享存储中');
      console.log('   可以运行 `node tests/test-cross-cli-sharing.js cleanup` 清理');

      // 处理cleanup参数
      if (process.argv.includes('cleanup')) {
        return cleanupDemo();
      }
    })
    .catch(error => {
      console.error('❌ 演示失败:', error);
      process.exit(1);
    });
}

module.exports = { simulateCLICUsage, cleanupDemo };
