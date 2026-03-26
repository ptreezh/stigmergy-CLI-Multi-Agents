#!/usr/bin/env node

/**
 * 修复版WeChat登录监控
 * 使用正确的长轮询实现，而不是频繁的短轮询
 *
 * 关键修复：
 * 1. 使用真正的长轮询（保持连接打开35秒）
 * 2. 而不是每2秒就发起一个新的请求
 * 3. 这应该能解决二维码快速过期的问题
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://ilinkai.weixin.qq.com';
const LONG_POLL_TIMEOUT = 35000; // 35秒长轮询超时
const QR_LOGIN_TIMEOUT = 480000; // 8分钟总超时

/**
 * 获取二维码
 */
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

/**
 * 长轮询查询二维码状态
 * 关键：使用长轮询而不是短轮询
 */
async function getQrCodeStatusLongPoll(qrcode) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ilinkai.weixin.qq.com',
      path: `/ilink/bot/get_qrcode_status?qrcode=${qrcode}`,
      headers: {
        'iLink-App-ClientVersion': '1'
      },
      timeout: LONG_POLL_TIMEOUT
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      // 长轮询超时是正常的，返回wait状态
      resolve({ status: 'wait' });
    });

    req.on('error', (error) => {
      // 网络错误
      reject(error);
    });
  });
}

/**
 * 监控登录过程
 */
async function monitorLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 登录监控 - 修复版（使用长轮询）');
  console.log('='.repeat(70) + '\n');

  // 获取二维码
  console.log('📱 正在获取二维码...');

  const qrResponse = await getBotQrCode();

  console.log('\n✅ 二维码已生成！\n');
  console.log('🌐 二维码链接（点击或复制到微信中打开）:');
  console.log('   ' + qrResponse.qrcode_img_content);
  console.log('\n' + '='.repeat(70));
  console.log('📱 请在微信中操作:');
  console.log('='.repeat(70));
  console.log('1. 复制上方链接');
  console.log('2. 在微信聊天窗口粘贴链接');
  console.log('3. 点击链接打开');
  console.log('4. 确认登录');
  console.log('='.repeat(70));
  console.log('⏳ 使用长轮询实时监控登录状态...\n');

  let lastStatus = 'unknown';
  const startTime = Date.now();

  while (Date.now() - startTime < QR_LOGIN_TIMEOUT) {
    try {
      // 使用长轮询查询状态
      const statusResponse = await getQrCodeStatusLongPoll(qrResponse.qrcode);
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

      // 如果状态是wait，继续长轮询
      // 如果状态是scaned，也继续长轮询等待确认
      if (currentStatus === 'wait' || currentStatus === 'scaned') {
        continue;
      }

    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      // 等待5秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n⏰ 超时（8分钟）');
  console.log('   二维码有效期已过，请重新运行此脚本\n');
}

monitorLogin().then(credentials => {
  if (credentials) {
    console.log('✅ 登录完成！');
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
