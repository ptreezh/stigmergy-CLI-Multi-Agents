#!/usr/bin/env node

/**
 * 简单的 iLink Bot 登录测试
 * 使用和 OpenClaw 完全相同的逻辑
 */

const https = require('https');
const qrcode = require('qrcode-terminal');

const API_BASE = 'https://ilinkai.weixin.qq.com';

async function getQrCode() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function checkStatus(qrcode) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/ilink/bot/get_qrcode_status?qrcode=${qrcode}`;

    const options = {
      headers: {
        'iLink-App-ClientVersion': '1'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 iLink Bot 登录测试（和 OpenClaw 相同的方式）');
  console.log('='.repeat(70));

  try {
    // 获取 QR code
    console.log('\n📱 获取二维码...\n');
    const qrResult = await getQrCode();

    if (qrResult.ret !== 0) {
      console.error('❌ 获取二维码失败:', qrResult);
      return;
    }

    console.log('✅ 二维码获取成功\n');
    console.log('二维码信息:');
    console.log(`  qrcode: ${qrResult.qrcode}`);
    console.log(`  URL: ${qrResult.qrcode_img_content}\n`);

    // 显示 QR code
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('请用微信扫描下方二维码');
    console.log('═══════════════════════════════════════════════════════════════\n');
    qrcode.generate(qrResult.qrcode_img_content, { small: true });
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('⏳ 等待扫码... (每2秒检查一次，最多等待5分钟)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 轮询状态
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5分钟
    let scanned = false;

    while (Date.now() - startTime < timeout) {
      try {
        const status = await checkStatus(qrResult.qrcode);

        switch (status.status) {
          case 'wait':
            process.stdout.write('.');
            break;

          case 'scaned':
            if (!scanned) {
              console.log('\n\n✅ 已扫码！请在微信中确认登录\n');
              scanned = true;
            }
            process.stdout.write('.');
            break;

          case 'confirmed':
            console.log('\n\n🎉 登录成功！\n');
            console.log('凭证信息:');
            console.log(JSON.stringify({
              bot_token: status.bot_token,
              ilink_bot_id: status.ilink_bot_id,
              baseurl: status.baseurl,
              ilink_user_id: status.ilink_user_id
            }, null, 2));
            console.log('\n✅ 登录流程完成！');
            console.log('   这证明 iLink Bot API 的登录流程是可以工作的\n');
            return;

          case 'expired':
            console.log('\n\n⚠️  二维码已过期，请重新运行脚本\n');
            return;
        }

      } catch (error) {
        // 忽略错误，继续轮询
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n\n⏰ 超时（5分钟）\n');
    console.log('如果扫码后没有响应，可能的原因：');
    console.log('  1. 在微信中点击了链接（错误）');
    console.log('  2. 应该用微信"扫一扫"扫描二维码图案');
    console.log('  3. 或添加了机器人但没有登录认证\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

main();
