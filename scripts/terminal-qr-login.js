#!/usr/bin/env node

/**
 * 终端二维码登录
 * 直接在终端显示ASCII二维码，支持真实扫码
 */

const https = require('https');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://ilinkai.weixin.qq.com';

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

function displayQrCode(qrCodeUrl, index) {
  console.log('\n' + '='.repeat(70));
  console.log(`📱 二维码 #${index} - ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(70));

  // 在终端显示ASCII二维码
  console.log('\n📱 请用微信扫一扫扫描下方二维码:\n');
  qrcode.generate(qrCodeUrl, { small: true });

  console.log('\n🔗 或者复制链接到微信:');
  console.log('   ' + qrCodeUrl);

  console.log('\n' + '='.repeat(70));
  console.log('⏳ 等待扫码... (二维码每8秒自动刷新)');
  console.log('='.repeat(70) + '\n');
}

function saveCredentials(credentials) {
  const credsPath = path.join(require('os').homedir(), '.stigmergy/ilink-wechat-credentials.json');
  const dir = path.dirname(credsPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(credsPath, JSON.stringify(credentials, null, 2));

  console.log('💾 凭证已保存到: ' + credsPath);
  return credsPath;
}

async function terminalQrLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 终端二维码登录');
  console.log('='.repeat(70));
  console.log('⚡  二维码有效期: ~10秒');
  console.log('🔄  自动刷新: 每8秒');
  console.log('📱  扫码方式: 微信扫一扫');
  console.log('='.repeat(70) + '\n');

  let currentQrCode = null;
  let qrCodeIndex = 0;
  let scanned = false;
  const startTime = Date.now();
  const MAX_DURATION = 300000; // 5分钟

  // 获取第一个二维码
  currentQrCode = await getBotQrCode();
  qrCodeIndex++;
  displayQrCode(currentQrCode.qrcodeUrl, qrCodeIndex);

  while (Date.now() - startTime < MAX_DURATION) {
    const now = Date.now();

    try {
      // 如果没扫码，定期刷新二维码
      if (!scanned && now - currentQrCode.timestamp >= 8000) {
        console.log('🔄 二维码已过期，获取新二维码...\n');
        currentQrCode = await getBotQrCode();
        qrCodeIndex++;
        displayQrCode(currentQrCode.qrcodeUrl, qrCodeIndex);
        continue;
      }

      // 检查状态
      const statusResponse = await checkQrCodeStatus(currentQrCode.qrcode);

      switch (statusResponse.status) {
        case 'wait':
          if (!scanned) {
            process.stdout.write('.');
          }
          break;

        case 'scaned':
          if (!scanned) {
            scanned = true;
            console.log('\n\n👀 检测到扫码！');
            console.log('📱 请在微信中查找并点击"确认登录"按钮');
            console.log('   查找微信聊天列表中的确认消息\n');
            console.log('⏳ 等待确认...\n');
          }
          process.stdout.write('.');
          break;

        case 'confirmed':
          console.log('\n\n✅ 登录成功！\n');
          console.log('='.repeat(70));

          const credentials = {
            token: statusResponse.bot_token,
            accountId: statusResponse.ilink_bot_id,
            userId: statusResponse.ilink_user_id,
            baseUrl: statusResponse.baseurl,
          };

          const credsPath = saveCredentials(credentials);

          console.log('\n🎉 登录完成！现在你可以:');
          console.log('   1. 启动Hub: node scripts/start-wechat-hub.js shared');
          console.log('   2. 开始多CLI并发测试\n');
          console.log('='.repeat(70) + '\n');
          return credentials;

        case 'expired':
          if (!scanned) {
            console.log('\n🔄 二维码已过期，获取新二维码...\n');
            currentQrCode = await getBotQrCode();
            qrCodeIndex++;
            displayQrCode(currentQrCode.qrcodeUrl, qrCodeIndex);
          } else {
            console.log('\n❌ 二维码已过期，请重新开始\n');
            return null;
          }
          break;
      }

      // 短暂休眠
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error('\n❌ 错误:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n⏰ 超时（5分钟）\n');
  return null;
}

terminalQrLogin().then(credentials => {
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
