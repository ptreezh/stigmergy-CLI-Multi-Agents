#!/usr/bin/env node

/**
 * 实时WeChat登录监控
 * 显示登录状态变化
 */

const { ILinkApiClient } = require('../skills/ilink-wechat-client');

const client = new ILinkApiClient();

console.log('\n🔍 开始监控WeChat登录状态...\n');

async function monitorLogin() {
  try {
    // 获取新的二维码
    console.log('📱 获取二维码...');
    const qrResponse = await client.getBotQrCode();

    console.log('\n✅ 二维码已生成！');
    console.log('\n📱 二维码链接:');
    console.log('   ' + qrResponse.qrcodeUrl);

    console.log('\n⏳ 开始监控登录状态...\n');
    console.log('='.repeat(70));

    let status = 'wait';
    let attempt = 0;
    const maxAttempts = 240; // 8分钟，每2秒一次

    while (attempt < maxAttempts) {
      attempt++;

      try {
        const statusResponse = await client.getQrCodeStatus(qrResponse.qrcode);

        switch (statusResponse.status) {
          case 'wait':
            if (status !== 'wait') {
              console.log('⏳ 等待扫码...');
              status = 'wait';
            }
            break;

          case 'scaned':
            if (status !== 'scaned') {
              console.log('\n👀 已扫码，请在微信中确认登录...');
              console.log('   打开微信，查看是否有确认提示');
              status = 'scaned';
            }
            break;

          case 'confirmed':
            console.log('\n✅ 登录成功！');
            console.log('='.repeat(70));

            // 保存凭证
            const credentials = {
              token: statusResponse.botToken,
              accountId: statusResponse.ilinkBotId,
              userId: statusResponse.ilinkUserId,
              baseUrl: statusResponse.baseUrl,
            };

            const fs = require('fs');
            const path = require('path');
            const credsPath = path.join(require('os').homedir(), '.stigmergy/ilink-wechat-credentials.json');

            // 确保目录存在
            const dir = path.dirname(credsPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            // 保存凭证
            fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));

            console.log('\n💾 凭证已保存到:');
            console.log('   ' + credsPath);

            console.log('\n🎉 下次使用时无需重复登录！');
            console.log('   运行: node scripts/start-wechat-hub.js shared\n');

            return credentials;

          case 'expired':
            console.log('\n❌ 二维码已过期');
            console.log('   请重新运行此脚本获取新二维码\n');
            return null;

          default:
            console.log('⚠️ 未知状态:', statusResponse.status);
        }

      } catch (error) {
        console.error('❌ 查询状态失败:', error.message);
      }

      // 等待2秒后再次查询
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n❌ 二维码已超时（8分钟）');
    console.log('   请重新运行此脚本\n');

  } catch (error) {
    console.error('\n❌ 登录失败:', error.message);
    console.error(error.stack);
  }
}

// 运行监控
monitorLogin().then(credentials => {
  if (credentials) {
    console.log('\n✅ 登录流程完成！');
    process.exit(0);
  } else {
    console.log('\n⚠️  登录未完成');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n❌ 监控失败:', error);
  process.exit(1);
});
