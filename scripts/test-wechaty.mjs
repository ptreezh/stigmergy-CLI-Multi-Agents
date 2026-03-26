#!/usr/bin/env node

/**
 * Wechaty 基础测试脚本 (ESM版本)
 * 测试 Wechaty 是否能正常工作
 */

import { WechatyBuilder } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';

async function testWechaty() {
  console.log('='.repeat(70));
  console.log('🧪 Wechaty 基础测试');
  console.log('='.repeat(70));

  console.log('\n✅ Wechaty 已成功安装');
  console.log('   Puppet: wechaty-puppet-wechat\n');

  console.log('📋 测试项目:');
  console.log('   1. Wechaty 实例化');
  console.log('   2. 事件监听器');
  console.log('   3. 扫码登录流程\n');

  // 创建 Wechaty 实例
  console.log('🔧 创建 Wechaty 实例...');
  const bot = WechatyBuilder.build({
    name: 'test-wechaty-bot',
    puppet: 'wechaty-puppet-wechat',
  });
  console.log('✅ Wechaty 实例创建成功\n');

  // 设置事件监听
  console.log('📡 设置事件监听器...');

  let qrCodeReceived = false;
  let loginSuccess = false;

  bot
    .on('scan', (qrcode, status) => {
      if (!qrCodeReceived) {
        console.log('✅ 扫码事件监听器正常');
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📱 请扫描二维码登录微信');
        console.log('═══════════════════════════════════════════════════════════════\n');

        qrcodeTerminal.generate(qrcode, { small: true });

        console.log('\n提示:');
        console.log('  1. 打开微信，点击右上角 "+" → "扫一扫"');
        console.log('  2. 扫描上方二维码');
        console.log('  3. 在手机上确认登录\n');

        qrCodeReceived = true;
      }
    })
    .on('login', async (user) => {
      if (!loginSuccess) {
        console.log('\n✅ 登录成功！');
        console.log(`   用户: ${user.name()}`);
        console.log(`   ID: ${user.id}\n`);

        console.log('🎉 Wechaty 测试通过！');
        console.log('   • 实例化: ✅');
        console.log('   • 事件监听: ✅');
        console.log('   • 扫码登录: ✅\n');

        loginSuccess = true;

        // 登录成功后等待5秒，然后停止
        setTimeout(async () => {
          console.log('🛑 测试完成，正在停止机器人...\n');
          await bot.stop();
          process.exit(0);
        }, 5000);
      }
    })
    .on('message', async (message) => {
      const contact = message.talker();
      const text = message.text();

      console.log('\n📨 收到测试消息:');
      console.log(`   来自: ${contact.name()}`);
      console.log(`   内容: ${text}\n`);

      // 自动回复
      if (text === 'hello' || text === '你好') {
        await contact.say('Hello! Wechaty 测试成功！');
        console.log('✅ 已发送自动回复\n');
      }
    })
    .on('error', (error) => {
      console.error('❌ 错误:', error);
    });

  console.log('✅ 事件监听器设置完成\n');

  // 启动机器人
  console.log('🚀 启动机器人...\n');

  try {
    await bot.start();
    console.log('✅ 机器人已启动');
    console.log('   等待扫码登录...\n');

    // 处理退出信号
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 正在停止测试...\n');
      await bot.stop();
      console.log('✅ 测试已停止\n');
      process.exit(0);
    });

    // 60秒超时
    setTimeout(() => {
      if (!loginSuccess) {
        console.log('\n⏰ 测试超时（60秒）');
        console.log('   如果未扫码，请重新运行测试\n');
        bot.stop();
        process.exit(0);
      }
    }, 60000);

  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('\n💡 可能的原因:');
    console.error('  1. 网络连接问题');
    console.error('  2. 依赖安装不完整');
    console.error('  3. 系统防火墙阻止\n');
    process.exit(1);
  }
}

// 运行测试
testWechaty();
