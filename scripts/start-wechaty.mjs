#!/usr/bin/env node

/**
 * Wechaty Bot 快速启动脚本
 * 简单易用的微信机器人
 */

import { WechatyBuilder } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import { MultimodalWeChatIntegration } from '../src/orchestration/wechat/MultimodalWeChatIntegration.js';

async function startWechatyBot(cliType = 'claude') {
  console.log('='.repeat(70));
  console.log('🚀 Stigmergy WeChat Bot (基于 Wechaty)');
  console.log('='.repeat(70));
  console.log('\n✨ 优势:');
  console.log('  • 无需企业微信 - 使用个人微信');
  console.log('  • 开箱即用 - 扫码即用');
  console.log('  • 功能丰富 - 文本/图片/文件/群聊');
  console.log('  • 开源免费 - MIT 许可证\n');

  // 创建 Wechaty 实例
  const bot = WechatyBuilder.build({
    name: 'stigmergy-wechat-bot',
    puppet: 'wechaty-puppet-wechat',
  });

  // 创建多模态集成
  const integration = new MultimodalWeChatIntegration({
    cliType: cliType,
    wechatClient: bot  // 直接传递 bot 实例
  });

  // 设置事件监听
  bot
    .on('scan', (qrcode, status) => {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('📱 请扫描二维码登录微信');
      console.log('═══════════════════════════════════════════════════════════════\n');

      qrcodeTerminal.generate(qrcode, { small: true });

      console.log('\n提示:');
      console.log('  1. 打开微信，点击右上角 "+" → "扫一扫"');
      console.log('  2. 扫描上方二维码');
      console.log('  3. 在手机上确认登录\n');
    })
    .on('login', async (user) => {
      console.log('\n🎉 登录成功！');
      console.log(`   用户: ${user.name()}`);
      console.log(`   ID: ${user.id}\n`);

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('💡 使用提示:');
      console.log('  • 直接给机器人发消息即可对话');
      console.log('  • 支持命令: "切换 claude cli", "执行 xxx"');
      console.log('  • 支持多模态: 文本/图片/语音（部分）');
      console.log('  • 按 Ctrl+C 退出\n');

      // 保存登录凭证
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');

      const credentialsDir = path.join(os.homedir(), '.stigmergy');
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
    })
    .on('logout', (user) => {
      console.log(`\n⚠️  用户 ${user.name()} 已登出\n`);
    })
    .on('message', async (message) => {
      // 跳过自己发送的消息
      if (message.self()) {
        return;
      }

      try {
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
    })
    .on('error', (error) => {
      console.error('Wechaty 错误:', error);
    });

  // 启动机器人
  try {
    await bot.start();

    // 处理退出信号
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止机器人...\n');
      await bot.stop();
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
