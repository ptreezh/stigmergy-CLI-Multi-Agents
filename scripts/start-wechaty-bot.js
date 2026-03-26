#!/usr/bin/env node

/**
 * Wechaty Bot 启动脚本
 * 简单易用的微信机器人
 */

const WechatyClient = require('../src/orchestration/wechat/WechatyClient');
const MultimodalWeChatIntegration = require('../src/orchestration/wechat/MultimodalWeChatIntegration');
const path = require('path');

async function startWechatyBot(cliType = 'claude') {
  console.log('='.repeat(70));
  console.log('🚀 Stigmergy WeChat Bot (基于 Wechaty)');
  console.log('='.repeat(70));
  console.log('\n✨ 优势:');
  console.log('  • 无需企业微信 - 使用个人微信');
  console.log('  • 开箱即用 - 扫码即用');
  console.log('  • 功能丰富 - 文本/图片/文件/群聊');
  console.log('  • 开源免费 - MIT 许可证\n');

  // 创建 Wechaty 客户端
  const wechatClient = new WechatyClient({
    name: 'stigmergy-wechat-bot'
  });

  // 创建多模态集成
  const integration = new MultimodalWeChatIntegration({
    cliType: cliType,
    wechatClient: wechatClient
  });

  // 设置登录回调
  wechatClient.onLoginReady(async (user) => {
    console.log('🎉 登录成功！Bot 已就绪\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💡 使用提示:');
    console.log('  • 直接给机器人发消息即可对话');
    console.log('  • 支持命令: "切换 claude cli", "执行 xxx"');
    console.log('  • 支持多模态: 文本/图片/语音（部分）');
    console.log('  • 按 Ctrl+C 退出\n');

    // 保存登录凭证
    const fs = require('fs');
    const credentialsDir = path.join(require('os').homedir(), '.stigmergy');
    const credentialsPath = path.join(credentialsDir, 'wechaty-credentials.json');

    try {
      fs.mkdirSync(credentialsDir, { recursive: true });
      fs.writeFileSync(credentialsPath, JSON.stringify({
        botName: user.name(),
        botId: user.id,
        loginTime: new Date().toISOString()
      }, null, 2));
      console.log(`✅ 登录凭证已保存到: ${credentialsPath}\n`);
    } catch (error) {
      console.error('保存凭证失败:', error.message);
    }
  });

  // 添加消息处理器
  wechatClient.onMessage(async (message) => {
    // 跳过自己发送的消息
    if (message.self()) {
      return;
    }

    try {
      // 使用多模态集成处理消息
      const contact = message.talker();
      const text = message.text();
      const messageType = message.type();

      // 转换为统一格式
      const unifiedMessage = {
        from: contact.id,
        fromName: contact.name(),
        type: messageType,
        content: text,
        originalMessage: message
      };

      // 处理消息
      await integration.handleMessage(unifiedMessage);

    } catch (error) {
      console.error('处理消息错误:', error.message);

      // 发送错误提示
      try {
        const contact = message.talker();
        await contact.say(`抱歉，处理消息时出错: ${error.message}`);
      } catch (e) {
        // 忽略
      }
    }
  });

  // 启动机器人
  try {
    await wechatClient.start();

    // 处理退出信号
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止机器人...\n');
      await wechatClient.stop();
      console.log('✅ 已安全退出\n');
      process.exit(0);
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⏳ 等待扫码登录...\n');

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n💡 可能的解决方案:');
    console.error('  1. 确保已安装依赖: npm install');
    console.error('  2. 确保网络连接正常');
    console.error('  3. 检查是否有防火墙阻止\n');
    process.exit(1);
  }
}

// 从命令行获取 CLI 类型
const cliType = process.argv[2] || 'claude';

// 启动
startWechatyBot(cliType);
