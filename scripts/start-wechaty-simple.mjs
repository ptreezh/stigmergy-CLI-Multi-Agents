#!/usr/bin/env node

/**
 * Wechaty Bot 简化启动脚本
 * 基础版本，直接使用 Wechaty
 */

import { WechatyBuilder } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';

async function startWechatyBot() {
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

  let loginTime = null;

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
      loginTime = new Date();
      console.log('\n🎉 登录成功！');
      console.log(`   用户: ${user.name()}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   时间: ${loginTime.toLocaleString()}\n`);

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('💡 使用提示:');
      console.log('  • 直接给机器人发消息即可对话');
      console.log('  • 发送 "hello" 或 "你好" 测试自动回复');
      console.log('  • 发送 "帮助" 查看可用命令');
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
          loginTime: loginTime.toISOString()
        }, null, 2));
        console.log(`✅ 登录凭证已保存到: ${credentialsPath}\n`);
      } catch (error) {
        console.error('保存凭证失败:', error.message);
      }
    })
    .on('logout', (user) => {
      const sessionDuration = loginTime
        ? `${Math.round((Date.now() - loginTime.getTime()) / 1000 / 60)} 分钟`
        : '未知';

      console.log(`\n⚠️  用户 ${user.name()} 已登出`);
      console.log(`   会话时长: ${sessionDuration}\n`);
    })
    .on('message', async (message) => {
      // 跳过自己发送的消息
      if (message.self()) {
        return;
      }

      try {
        const contact = message.talker();
        const text = message.text();
        const room = message.room();

        console.log('\n📨 收到消息:');
        console.log(`   来自: ${contact.name()}`);
        if (room) {
          console.log(`   群聊: ${room.topic()}`);
        }
        console.log(`   内容: ${text}`);

        // 简单的自动回复逻辑
        if (text === 'hello' || text === '你好' || text === 'hi') {
          await contact.say('你好！我是 Stigmergy AI 助手，很高兴为你服务！');
          console.log('   ✅ 已发送自动回复\n');
        }
        else if (text === '帮助' || text === 'help') {
          const helpText = `📋 可用命令:
  • hello/你好 - 测试回复
  • 帮助/help - 显示此帮助
  • 时间 - 查看当前时间
  • 关于 - 关于机器人`;

          await contact.say(helpText);
          console.log('   ✅ 已发送帮助信息\n');
        }
        else if (text === '时间' || text === 'time') {
          const now = new Date();
          await contact.say(`当前时间: ${now.toLocaleString()}`);
          console.log('   ✅ 已发送时间信息\n');
        }
        else if (text === '关于' || text === 'about') {
          const aboutText = `🤖 Stigmergy WeChat Bot
  基于 Wechaty 构建
  开源免费，MIT 许可证

  功能:
  • 智能对话
  • 任务执行
  • 多 CLI 协调

  更多信息: https://github.com/stigmergy`;

          await contact.say(aboutText);
          console.log('   ✅ 已发送关于信息\n');
        }
        else {
          // 默认回复
          await contact.say(`收到你的消息: "${text}"\n\n这是一个简单的 Wechaty Bot 演示。\n完整的多模态功能正在开发中，敬请期待！`);
          console.log('   ✅ 已发送默认回复\n');
        }

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
      console.error('\n❌ Wechaty 错误:', error.message);
    })
    .on('pair', (data) => {
      console.log('\n🔗 配对事件:', data);
    })
    .on('ready', () => {
      console.log('\n✅ 机器人已就绪，等待消息...\n');
    });

  // 启动机器人
  try {
    console.log('🔧 正在启动机器人...\n');
    await bot.start();

    // 处理退出信号
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止机器人...\n');

      const sessionDuration = loginTime
        ? `${Math.round((Date.now() - loginTime.getTime()) / 1000 / 60)} 分钟`
        : '未知';

      console.log(`会话时长: ${sessionDuration}`);
      await bot.stop();

      console.log('✅ 已安全退出\n');
      process.exit(0);
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⏳ 等待扫码登录...\n');

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n💡 可能的解决方案:');
    console.error('  1. 确保已安装依赖: npm install wechaty wechaty-puppet-wechat qrcode-terminal file-box');
    console.error('  2. 确保网络连接正常');
    console.error('  3. 检查是否有防火墙阻止');
    console.error('  4. 尝试重新安装依赖: npm uninstall wechaty && npm install wechaty\n');
    process.exit(1);
  }
}

// 启动
console.log('正在启动 Wechaty Bot...\n');
startWechatyBot();
