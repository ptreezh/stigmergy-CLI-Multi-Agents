#!/usr/bin/env node

/**
 * Unified Communication Platform Adapter - Usage Examples
 *
 * 统一通信平台适配器 - 使用示例
 *
 * 本文件展示如何使用UnifiedCommAdapter进行：
 * - 初始化适配器
 * - 发送推荐结果
 * - 处理Webhook回调
 * - 生成配置页面
 */

const UnifiedCommAdapter = require('../skills/unified-comm-adapter');
const http = require('http');

// ==================== 示例 1: 初始化适配器 ====================

function example1_Init() {
  console.log('\n📱 示例 1: 初始化统一通信适配器\n');

  const adapter = new UnifiedCommAdapter({
    wechat: {
      enabled: true,
      appId: process.env.WECHAT_APP_ID || 'wxXXXXXXXXXXXXXXXX',
      appSecret: process.env.WECHAT_APP_SECRET || 'XXXXXXXXXXXXXXXX'
    },
    feishu: {
      enabled: true,
      appId: process.env.FEISHU_APP_ID || 'cli_xxxxxxxxxxxxx',
      appSecret: process.env.FEISHU_APP_SECRET || 'XXXXXXXXXXXXXXXX',
      encryptKey: process.env.FEISHU_ENCRYPT_KEY || 'XXXXXXXXXXXXXXXX',
      verifyToken: process.env.FEISHU_VERIFY_TOKEN || 'XXXXXXXXXXXXXXXX'
    },
    dingtalk: {
      enabled: true,
      appKey: process.env.DINGTALK_APP_KEY || 'dingXXXXXXXXXXXXXXXX',
      appSecret: process.env.DINGTALK_APP_SECRET || 'XXXXXXXXXXXXXXXX'
    }
  });

  console.log('✅ 适配器初始化完成');
  console.log('   已配置平台:', Object.keys(adapter.platforms).filter(p => adapter.platforms[p].enabled));

  return adapter;
}

// ==================== 示例 2: 发送推荐结果 ====================

async function example2_SendRecommendations(adapter) {
  console.log('\n📤 示例 2: 发送推荐结果\n');

  // 模拟推荐结果
  const recommendations = [
    {
      skillName: 'dev-browser',
      score: 4.5,
      reasoning: '基于您最近的浏览器自动化任务，此技能可以帮助您进行Web自动化测试',
      rank: 1
    },
    {
      skillName: 'mathematical-statistics',
      score: 4.2,
      reasoning: '适合您的数据分析需求，提供完整的统计分析功能',
      rank: 2
    },
    {
      skillName: 'network-computation',
      score: 3.9,
      reasoning: '基于您对网络分析的兴趣，此技能提供强大的网络计算功能',
      rank: 3
    }
  ];

  try {
    // 发送到微信（需要真实的userOpenId）
    console.log('   发送到微信...');
    // const wechatResult = await adapter.sendRecommendation('wechat', 'user-openid', recommendations);
    console.log('   ℹ️  实际发送需要配置真实的微信AppID和AppSecret');
    console.log('   ℹ️  消息格式: 文本消息，包含前3个推荐');

    // 发送到飞书（需要真实的userId）
    console.log('\n   发送到飞书...');
    // const feishuResult = await adapter.sendRecommendation('feishu', 'user-id', recommendations);
    console.log('   ℹ️  实际发送需要配置真实的飞书应用凭证');
    console.log('   ℹ️  消息格式: 交互式卡片，支持点击操作');

    // 发送到钉钉（需要真实的userId）
    console.log('\n   发送到钉钉...');
    // const dingtalkResult = await adapter.sendRecommendation('dingtalk', 'user-id', recommendations);
    console.log('   ℹ️  实际发送需要配置真实的钉钉应用凭证');
    console.log('   ℹ️  消息格式: Markdown消息，支持富文本');

    console.log('\n✅ 推荐结果格式化完成');
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
  }
}

// ==================== 示例 3: 收集使用反馈 ====================

async function example3_CollectFeedback(adapter) {
  console.log('\n📝 示例 3: 收集使用反馈\n');

  const feedback = {
    rating: 5,
    effectiveness: 'HIGH',
    comments: '非常有用的技能，节省了大量时间'
  };

  try {
    // 从微信收集反馈
    console.log('   从微信收集反馈...');
    // await adapter.collectFeedback('wechat', 'user-openid', 'dev-browser', feedback);

    // 从飞书收集反馈
    console.log('   从飞书收集反馈...');
    // await adapter.collectFeedback('feishu', 'user-id', 'dev-browser', feedback);

    // 从钉钉收集反馈
    console.log('   从钉钉收集反馈...');
    // await adapter.collectFeedback('dingtalk', 'user-id', 'dev-browser', feedback);

    console.log('\n✅ 反馈收集接口已就绪');
    console.log('   ℹ️  实际使用需要配置Webhook回调URL');
  } catch (error) {
    console.error('❌ 收集失败:', error.message);
  }
}

// ==================== 示例 4: Webhook服务器 ====================

function example4_WebhookServer(adapter) {
  console.log('\n🔗 示例 4: Webhook服务器\n');

  // 创建HTTP服务器
  const server = http.createServer(async (req, res) => {
    // 处理微信Webhook
    if (req.url === '/webhook/wechat' && req.method === 'POST') {
      console.log('   收到微信Webhook');
      try {
        await adapter.handleWebhook('wechat', req, res);
      } catch (error) {
        console.error('   处理失败:', error.message);
        res.statusCode = 500;
        res.end('error');
      }
      return;
    }

    // 处理飞书Webhook
    if (req.url === '/webhook/feishu' && req.method === 'POST') {
      console.log('   收到飞书Webhook');
      try {
        await adapter.handleWebhook('feishu', req, res);
      } catch (error) {
        console.error('   处理失败:', error.message);
        res.statusCode = 500;
        res.end('error');
      }
      return;
    }

    // 处理钉钉Webhook
    if (req.url === '/webhook/dingtalk' && req.method === 'POST') {
      console.log('   收到钉钉Webhook');
      try {
        await adapter.handleWebhook('dingtalk', req, res);
      } catch (error) {
        console.error('   处理失败:', error.message);
        res.statusCode = 500;
        res.end('error');
      }
      return;
    }

    // 配置页面
    if (req.url === '/config' && req.method === 'GET') {
      const html = adapter.generateConfigPage();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(html);
      return;
    }

    // 404
    res.statusCode = 404;
    res.end('Not Found');
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`✅ Webhook服务器已启动`);
    console.log(`   监听端口: ${PORT}`);
    console.log(`   微信回调: http://your-domain:${PORT}/webhook/wechat`);
    console.log(`   飞书回调: http://your-domain:${PORT}/webhook/feishu`);
    console.log(`   钉钉回调: http://your-domain:${PORT}/webhook/dingtalk`);
    console.log(`   配置页面: http://localhost:${PORT}/config`);
  });

  return server;
}

// ==================== 示例 5: 集成到协同过滤引擎 ====================

async function example5_IntegrateWithCF() {
  console.log('\n🔗 示例 5: 集成到协同过滤引擎\n');

  // 模拟协同过滤引擎
  class MockCollaborativeFilteringEngine {
    constructor() {
      this.commAdapter = new UnifiedCommAdapter({
        wechat: {
          enabled: true,
          appId: process.env.WECHAT_APP_ID,
          appSecret: process.env.WECHAT_APP_SECRET
        }
      });
    }

    async recommendAndNotify(agentId, context) {
      console.log(`   为Agent ${agentId} 生成推荐...`);

      // 模拟推荐结果
      const recommendations = [
        {
          skillName: 'dev-browser',
          score: 4.5,
          reasoning: '基于您的使用历史',
          rank: 1
        }
      ];

      console.log(`   生成了 ${recommendations.length} 个推荐`);

      // 获取Agent的通信平台配置
      const agentPlatform = this.getAgentPlatform(agentId);
      const agentUserId = this.getAgentUserId(agentId);

      if (agentPlatform && agentUserId) {
        console.log(`   发送通知到 ${agentPlatform}...`);
        await this.commAdapter.sendRecommendation(
          agentPlatform,
          agentUserId,
          recommendations
        );
        console.log('   ✅ 通知已发送');
      } else {
        console.log('   ⚠️  Agent未配置通信平台');
      }

      return recommendations;
    }

    getAgentPlatform(agentId) {
      // 从数据库获取Agent的通信平台配置
      return 'wechat'; // 模拟返回
    }

    getAgentUserId(agentId) {
      // 从数据库获取Agent的通信平台用户ID
      return 'mock-user-id'; // 模拟返回
    }
  }

  const engine = new MockCollaborativeFilteringEngine();
  await engine.recommendAndNotify('agent-123', { domain: 'automation' });

  console.log('\n✅ 集成示例完成');
}

// ==================== 主函数 ====================

async function main() {
  console.log('🚀 统一通信平台适配器 - 使用示例\n');
  console.log('=' .repeat(60));

  try {
    // 示例 1: 初始化
    const adapter = example1_Init();

    // 示例 2: 发送推荐
    await example2_SendRecommendations(adapter);

    // 示例 3: 收集反馈
    await example3_CollectFeedback(adapter);

    // 示例 5: 集成到CF引擎
    await example5_IntegrateWithCF();

    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有示例执行完成\n');

    console.log('📖 下一步:');
    console.log('   1. 配置环境变量（各平台的AppID和AppSecret）');
    console.log('   2. 启动Webhook服务器（示例 4）');
    console.log('   3. 在各平台配置回调URL');
    console.log('   4. 测试消息发送和Webhook接收');
    console.log('\n💡 提示: 运行 node examples/unified-comm-adapter-usage.js start-server 启动Webhook服务器');

  } catch (error) {
    console.error('❌ 执行失败:', error);
  }
}

// ==================== 命令行参数处理 ====================

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'start-server') {
    // 只启动Webhook服务器
    console.log('🚀 启动Webhook服务器模式\n');
    const adapter = example1_Init();
    const server = example4_WebhookServer(adapter);

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n\n👋 关闭服务器...');
      server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
      });
    });
  } else {
    // 运行所有示例
    main();
  }
}

module.exports = {
  example1_Init,
  example2_SendRecommendations,
  example3_CollectFeedback,
  example4_WebhookServer,
  example5_IntegrateWithCF
};
