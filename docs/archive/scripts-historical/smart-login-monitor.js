#!/usr/bin/env node

/**
 * 智能WeChat登录监控
 * 适应10秒二维码有效期，自动刷新并持续监控
 *
 * 核心策略：
 * 1. 每8秒自动刷新二维码（适应10秒有效期）
 * 2. 扫码后持续监控，不因为刷新而中断
 * 3. 提供清晰的扫码指导和状态反馈
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://ilinkai.weixin.qq.com';
const QR_REFRESH_INTERVAL = 8000; // 8秒刷新一次
const QR_CHECK_INTERVAL = 2000; // 2秒检查一次状态
const MAX_DURATION = 600000; // 最多运行10分钟

/**
 * 获取新二维码
 */
async function getBotQrCode() {
  return new Promise((resolve, reject) => {
    https.get(`${API_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            qrcode: result.qrcode,
            qrcodeUrl: result.qrcode_img_content,
            timestamp: Date.now()
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 检查二维码状态
 */
async function checkQrCodeStatus(qrcode) {
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

/**
 * 智能登录监控
 */
async function smartLoginMonitor() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 智能登录监控');
  console.log('='.repeat(70));
  console.log('⚡  二维码有效期: ~10秒');
  console.log('🔄  自动刷新: 每8秒');
  console.log('='.repeat(70) + '\n');

  let currentQrCode = null;
  let qrCodeIndex = 0;
  let lastCheckTime = 0;
  const startTime = Date.now();

  // 获取第一个二维码
  currentQrCode = await getBotQrCode();
  qrCodeIndex++;
  displayQrCode(currentQrCode, qrCodeIndex);

  // 主循环
  while (Date.now() - startTime < MAX_DURATION) {
    const now = Date.now();

    try {
      // 1. 检查状态（每2秒）
      if (now - lastCheckTime >= QR_CHECK_INTERVAL) {
        lastCheckTime = now;

        const statusResponse = await checkQrCodeStatus(currentQrCode.qrcode);

        switch (statusResponse.status) {
          case 'wait':
            // 正常等待，继续
            process.stdout.write('.');

            // 2. 刷新二维码（每8秒）
            if (now - currentQrCode.timestamp >= QR_REFRESH_INTERVAL) {
              console.log('\n🔄 二维码已过期，获取新二维码...');
              currentQrCode = await getBotQrCode();
              qrCodeIndex++;
              displayQrCode(currentQrCode, qrCodeIndex);
            }
            break;

          case 'scaned':
            console.log('\n\n👀 已扫码！请在微信中查找并点击"确认登录"按钮');
            console.log('   查找微信聊天列表中的"iLink Bot"确认消息\n');

            // 扫码后继续监控，不刷新二维码
            while (Date.now() - startTime < MAX_DURATION) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              const confirmStatus = await checkQrCodeStatus(currentQrCode.qrcode);

              if (confirmStatus.status === 'confirmed') {
                return handleLoginSuccess(confirmStatus);
              } else if (confirmStatus.status === 'expired') {
                console.log('\n❌ 二维码已过期，请重新开始\n');
                return null;
              } else {
                process.stdout.write('.');
              }
            }
            break;

          case 'confirmed':
            return handleLoginSuccess(statusResponse);

          case 'expired':
            console.log('\n🔄 二维码已过期，获取新二维码...');
            currentQrCode = await getBotQrCode();
            qrCodeIndex++;
            displayQrCode(currentQrCode, qrCodeIndex);
            break;
        }
      }

      // 短暂休眠避免过度消耗CPU
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('\n❌ 错误:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n\n⏰ 超时（10分钟）');
  return null;
}

/**
 * 显示二维码
 */
function displayQrCode(qrCode, index) {
  console.log('\n' + '='.repeat(70));
  console.log(`📱 二维码 #${index}`);
  console.log('='.repeat(70));
  console.log('🌐 二维码链接（点击或复制到微信中打开）:');
  console.log('   ' + qrCode.qrcodeUrl);
  console.log('\n📱 操作步骤:');
  console.log('   1. 复制上方链接');
  console.log('   2. 在微信聊天窗口粘贴链接');
  console.log('   3. 点击链接打开');
  console.log('   4. 确认登录');
  console.log('='.repeat(70));
  console.log('⏳ 等待扫码... (二维码每8秒自动刷新)\n');
}

/**
 * 处理登录成功
 */
function handleLoginSuccess(statusResponse) {
  console.log('\n\n✅ 登录成功！\n');
  console.log('='.repeat(70));

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
  console.log('\n🎉 登录完成！现在你可以:');
  console.log('   1. 启动Hub: node scripts/start-wechat-hub.js shared');
  console.log('   2. 开始多CLI并发测试');
  console.log('   3. 使用其他支持微信的CLI工具\n');
  console.log('='.repeat(70) + '\n');

  return credentials;
}

// 运行监控
smartLoginMonitor().then(credentials => {
  if (credentials) {
    console.log('✅ 登录流程完成！');
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
