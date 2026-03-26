#!/usr/bin/env node

/**
 * 实时WeChat登录监控 v2
 * 使用最新的API和更可靠的状态查询
 */

const https = require('https');

const API_BASE = 'https://ilinkai.weixin.qq.com';

async function getBotQrCode() {
  return new Promise((resolve, reject) => {
    https.get(`${API_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`, (res) => {
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
}

async function getQrCodeStatus(qrcode) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ilinkai.weixin.qq.com',
      path: `/ilink/bot/get_qrcode_status?qrcode=${qrcode}`,
      headers: {
        'iLink-App-ClientVersion': '1'
      }
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
}

async function monitorLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 实时登录监控');
  console.log('='.repeat(70) + '\n');

  try {
    // 获取二维码
    console.log('📱 获取二维码...');
    const qrResponse = await getBotQrCode();

    console.log('\n✅ 二维码已生成！\n');
    console.log('📱 二维码链接:');
    console.log('   ' + qrResponse.qrcode_img_content);
    console.log('\n' + '='.repeat(70));
    console.log('🔍 开始监控登录状态...');
    console.log('='.repeat(70) + '\n');

    let lastStatus = 'wait';
    let attempt = 0;
    const maxAttempts = 240; // 8分钟

    while (attempt < maxAttempts) {
      attempt++;

      try {
        const statusResponse = await getQrCodeStatus(qrResponse.qrcode);

        if (statusResponse.status !== lastStatus) {
          lastStatus = statusResponse.status;

          switch (statusResponse.status) {
            case 'wait':
              console.log('⏳ 等待扫码...');
              break;

            case 'scaned':
              console.log('\n👀 已扫码！请在微信中确认登录...');
              console.log('   查找微信聊天列表中的"iLink Bot"确认消息\n');
              break;

            case 'confirmed':
              console.log('\n✅ 登录成功！' + '\n');
              console.log('='.repeat(70));

              // 保存凭证
              const fs = require('fs');
              const path = require('path');
              const credsPath = path.join(require('os').homedir(), '.stigmergy/ilink-wechat-credentials.json');

              const credentials = {
                token: statusResponse.bot_token,
                accountId: statusResponse.ilink_bot_id,
                userId: statusResponse.ilink_user_id,
                baseUrl: statusResponse.baseurl,
              };

              // 确保目录存在
              const dir = path.dirname(credsPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              // 保存凭证
              fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));

              console.log('💾 凭证已保存到:');
              console.log('   ' + credsPath + '\n');

              console.log('🎉 下次使用时无需重复登录！');
              console.log('   运行: node scripts/start-wechat-hub.js shared\n');
              console.log('='.repeat(70) + '\n');

              return credentials;

            case 'expired':
              console.log('\n❌ 二维码已过期');
              console.log('   请重新运行此脚本\n');
              return null;
          }
        }

      } catch (error) {
        console.error('❌ 查询失败:', error.message);
      }

      // 等待2秒
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n❌ 超时（8分钟）');
    console.log('   请重新运行此脚本\n');

  } catch (error) {
    console.error('\n❌ 登录失败:', error.message);
  }
}

// 运行监控
monitorLogin().then(credentials => {
  if (credentials) {
    console.log('✅ 登录流程完成！');
    process.exit(0);
  } else {
    console.log('⚠️  登录未完成');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ 监控失败:', error);
  process.exit(1);
});
