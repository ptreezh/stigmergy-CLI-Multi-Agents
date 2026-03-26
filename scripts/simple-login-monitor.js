#!/usr/bin/env node

/**
 * 简化版WeChat登录监控
 * 直接使用API，更可靠
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function monitorLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 登录监控 - 简化版');
  console.log('='.repeat(70) + '\n');

  // 获取二维码
  console.log('📱 正在获取二维码...');

  const qrResponse = await new Promise((resolve, reject) => {
    https.get('https://ilinkai.weixin.qq.com/ilink/bot/get_bot_qrcode?bot_type=3', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });

  console.log('\n✅ 二维码已生成！\n');
  console.log('🌐 二维码链接（点击或复制到微信中打开）:');
  console.log('   ' + qrResponse.qrcode_img_content + '\n');

  console.log('='.repeat(70));
  console.log('📱 请在微信中操作:');
  console.log('='.repeat(70));
  console.log('1. 复制上方链接');
  console.log('2. 在微信聊天窗口粘贴链接');
  console.log('3. 点击链接打开');
  console.log('4. 确认登录');
  console.log('='.repeat(70));
  console.log('⏳ 实时监控登录状态...\n');

  let lastStatus = 'unknown';
  let attempt = 0;
  const maxAttempts = 240; // 8分钟，每2秒一次

  while (attempt < maxAttempts) {
    attempt++;

    try {
      const statusResponse = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'ilinkai.weixin.qq.com',
          path: `/ilink/bot/get_qrcode_status?qrcode=${qrResponse.qrcode}`,
          headers: { 'iLink-App-ClientVersion': '1' }
        };

        https.get(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      const currentStatus = statusResponse.status;

      // 只在状态变化时打印
      if (currentStatus !== lastStatus) {
        lastStatus = currentStatus;

        switch (currentStatus) {
          case 'wait':
            console.log('⏳ 状态: 等待扫码...');
            break;

          case 'scaned':
            console.log('\n👀 状态: 已扫码！');
            console.log('   📱 请检查微信，查找并点击"确认登录"按钮\n');
            break;

          case 'confirmed':
            console.log('\n✅ 状态: 登录成功！\n');
            console.log('='.repeat(70));

            // 保存凭证
            const credentials = {
              token: statusResponse.bot_token,
              accountId: statusResponse.ilink_bot_id,
              userId: statusResponse.ilink_user_id,
              baseUrl: statusResponse.baseurl,
            };

            const credsPath = path.join(require('os').homedir(), '.stigmergy/ilink-wechat-credentials.json');
            const dir = path.dirname(credsPath);

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));

            console.log('💾 凭证已保存:');
            console.log('   ' + credsPath);
            console.log('\n🎉 登录成功！现在你可以:');
            console.log('   1. 启动Hub: node scripts/start-wechat-hub.js shared');
            console.log('   2. 开始多CLI并发测试\n');
            console.log('='.repeat(70) + '\n');

            return credentials;

          case 'expired':
            console.log('\n❌ 状态: 二维码已过期');
            console.log('   请重新运行此脚本获取新二维码\n');
            return null;
        }
      }

    } catch (error) {
      console.error('❌ 查询失败 (' + attempt + '):', error.message);
    }

    // 等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n⏰ 超时（8分钟）');
  console.log('   二维码有效期已过，请重新运行此脚本\n');
}

monitorLogin().then(credentials => {
  if (credentials) {
    console.log('✅ 登录完成！' + credentials.accountId);
    process.exit(0);
  } else {
    console.log('⚠️  登录未完成');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n❌ 错误:', error.message);
  console.error(error.stack);
  process.exit(1);
});
