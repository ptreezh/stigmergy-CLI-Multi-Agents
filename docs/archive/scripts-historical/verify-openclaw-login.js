#!/usr/bin/env node

/**
 * 验证 OpenClaw 登录是否真的能工作
 * 使用和 OpenClaw 完全相同的逻辑
 */

const https = require('https');

const API_BASE = 'https://ilinkai.weixin.qq.com';
const BOT_TYPE = '3';

// 模拟 OpenClaw 的 fetchQRCode 函数
async function fetchQRCode() {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/ilink/bot/get_bot_qrcode?bot_type=${BOT_TYPE}`;

    const headers = {
      'User-Agent': 'OpenClaw-Weixin/1.0',
      'Accept': 'application/json',
    };

    console.log(`\n📡 fetchQRCode: ${url}`);

    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   状态码: ${res.statusCode}`);

        try {
          const result = JSON.parse(data);
          console.log(`   响应:`, JSON.stringify(result, null, 2));

          if (result.ret === 0) {
            resolve({
              qrcode: result.qrcode,
              qrcodeUrl: result.qrcode_img_content
            });
          } else {
            reject(new Error(`获取 QR code 失败: ret=${result.ret}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 模拟 OpenClaw 的 pollQRStatus 函数
async function pollQRStatus(qrcode) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/ilink/bot/get_qrcode_status?qrcode=${qrcode}`;

    const headers = {
      'User-Agent': 'OpenClaw-Weixin/1.0',
      'Accept': 'application/json',
      'iLink-App-ClientVersion': '1',
    };

    const req = https.get(url, { headers }, (res) => {
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
    });

    req.on('error', reject);
    req.setTimeout(35000, () => {
      req.destroy();
      resolve({ status: 'wait' });  // 超时返回 wait
    });
    req.end();
  });
}

// 完整的登录流程测试
async function testOpenClawLogin() {
  console.log('='.repeat(70));
  console.log('🔍 测试 OpenClaw 登录流程');
  console.log('='.repeat(70));

  try {
    // 步骤1: 获取 QR code
    console.log('\n步骤1: 获取 QR code');
    const qrData = await fetchQRCode();
    console.log('\n✅ QR code 获取成功');
    console.log(`   QR code: ${qrData.qrcode}`);
    console.log(`   URL: ${qrData.qrcodeUrl}`);

    // 步骤2: 检查 URL 类型
    console.log('\n步骤2: 分析 QR code URL');
    if (qrData.qrcodeUrl.includes('liteapp.weixin.qq.com')) {
      console.log('   ⚠️  QR code 指向 liteapp.weixin.qq.com');
      console.log('   ⚠️  这是"添加机器人"流程，不是"登录认证"流程');
      console.log('\n📋 预期行为:');
      console.log('   1. 扫码后会提示添加机器人（如 clawbot）');
      console.log('   2. 状态会一直是 "wait"，不会变成 "scaned" 或 "confirmed"');
      console.log('   3. 不会获得 bot_token');
    } else {
      console.log('   ✅ QR code 可能指向正确的登录流程');
    }

    // 步骤3: 测试状态查询
    console.log('\n步骤3: 测试状态查询');
    console.log('   （请用微信扫描上面的二维码）');

    const startTime = Date.now();
    const timeout = 60000; // 1分钟
    let checkCount = 0;

    while (Date.now() - startTime < timeout) {
      checkCount++;
      process.stdout.write(`\r   检查状态中... (${checkCount})`);

      try {
        const status = await pollQRStatus(qrData.qrcode);

        if (status.status !== 'wait') {
          process.stdout.write('\r' + ' '.repeat(50) + '\r');
          console.log(`\n   状态变化: ${status.status}`);

          if (status.status === 'scaned') {
            console.log('   ✅ 已扫码！等待确认...');
          } else if (status.status === 'confirmed') {
            console.log('   🎉 登录成功！');
            console.log('   凭证:', {
              bot_token: status.bot_token ? '***' : '无',
              ilink_bot_id: status.ilink_bot_id,
              baseurl: status.baseurl,
              ilink_user_id: status.ilink_user_id
            });

            if (status.bot_token) {
              console.log('\n✅ OpenClaw 登录流程验证成功！');
              console.log('   这意味着 iLink Bot API 的登录认证流程是可以工作的');
              return true;
            } else {
              console.log('\n⚠️  状态是 confirmed 但没有 bot_token');
              console.log('   这可能意味着流程不完整');
            }
            break;
          } else if (status.status === 'expired') {
            process.stdout.write('\r' + ' '.repeat(50) + '\r');
            console.log('\n   ⚠️  QR code 已过期');
            break;
          }
        }
      } catch (error) {
        // 忽略错误，继续轮询
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    process.stdout.write('\r' + ' '.repeat(50) + '\r');
    console.log(`\n   最终状态: 在 ${checkCount} 次检查后，状态一直是 "wait"`);
    console.log('\n❌ OpenClaw 登录流程验证失败');
    console.log('   这意味着:');
    console.log('   1. QR code 没有被扫描');
    console.log('   2. 或者 QR code 指向的是错误的流程（添加机器人）');
    console.log('   3. OpenClaw 可能也面临着同样的问题');

    return false;

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    return false;
  }
}

// 执行测试
testOpenClawLogin().then(success => {
  console.log('\n' + '='.repeat(70));
  if (success) {
    console.log('✅ 结论: OpenClaw 登录流程可以工作');
    console.log('   建议使用相同的实现');
  } else {
    console.log('❌ 结论: OpenClaw 登录流程无法工作');
    console.log('   或需要特殊条件/配置');
    console.log('\n📋 建议的解决方案:');
    console.log('   1. 检查 OpenClaw 是否真的能成功登录');
    console.log('   2. 查看是否有特殊的配置或环境');
    console.log('   3. 考虑使用替代方案（如企业微信机器人 API）');
  }
  console.log('='.repeat(70) + '\n');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});
