#!/usr/bin/env node

/**
 * WeChat 分步登录指导
 * 解决"扫码后无响应"问题的详细指导版本
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

function displayQrCode(qrCode, index) {
  console.log('\n' + '='.repeat(70));
  console.log(`📱 二维码 #${index} - ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(70));

  console.log('\n🔴 重要：请仔细阅读以下说明！\n');

  console.log('❌ 错误操作（不会触发登录）：');
  console.log('   1. 在微信中直接点击链接');
  console.log('   2. 在微信聊天窗口粘贴链接');
  console.log('   这些操作不会触发"扫码"状态！\n');

  console.log('✅ 正确操作（会触发登录）：');
  console.log('   方法1：用微信"扫一扫"扫描下方二维码图案');
  console.log('   方法2：将二维码链接转换为二维码图片再扫描\n');

  console.log('📱 二维码图案（请用微信扫一扫扫描）:\n');
  qrcode.generate(qrCode.qrcodeUrl, { small: true });

  console.log('\n🔗 二维码链接:');
  console.log('   ' + qrCode.qrcodeUrl);
  console.log('\n   💡 提示：复制链接，用二维码生成器生成图片，再用微信扫一扫扫描\n');

  console.log('='.repeat(70));
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

  console.log('💾 凭证已保存: ' + credsPath);
  return credsPath;
}

async function stepByStepLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('📱 WeChat 分步登录指导');
  console.log('='.repeat(70));
  console.log('⚠️  专门解决"扫码后无响应"问题');
  console.log('='.repeat(70) + '\n');

  let currentQrCode = null;
  let qrCodeIndex = 0;
  let scanned = false;
  const startTime = Date.now();
  const MAX_DURATION = 300000; // 5分钟

  // 获取第一个二维码
  currentQrCode = await getBotQrCode();
  qrCodeIndex++;
  displayQrCode(currentQrCode, qrCodeIndex);

  console.log('🔍 状态说明：');
  console.log('   wait   = 等待扫码（没有人扫码）');
  console.log('   scaned = 已扫码（等待确认）');
  console.log('   confirmed = 登录成功');
  console.log('   expired = 二维码过期（会自动刷新）\n');

  while (Date.now() - startTime < MAX_DURATION) {
    const now = Date.now();

    try {
      // 如果没扫码，定期刷新二维码
      if (!scanned && now - currentQrCode.timestamp >= 8000) {
        console.log('🔄 二维码已过期，获取新二维码...\n');
        currentQrCode = await getBotQrCode();
        qrCodeIndex++;
        displayQrCode(currentQrCode, qrCodeIndex);
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
            console.log('\n\n🎉 太好了！检测到扫码！');
            console.log('📱 请在微信中查找并点击"确认登录"按钮');
            console.log('   查找微信聊天列表中的"iLink Bot"确认消息\n');
            console.log('⏳ 继续监控确认状态...\n');
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
            displayQrCode(currentQrCode, qrCodeIndex);
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
  console.log('💡 如果您已经扫码但没有看到响应，可能的原因：');
  console.log('   1. 在微信中点击了链接（错误）');
  console.log('   2. 应该用微信"扫一扫"扫描二维码图案');
  console.log('   3. 请重新运行脚本，使用"扫一扫"功能\n');
  return null;
}

stepByStepLogin().then(credentials => {
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
