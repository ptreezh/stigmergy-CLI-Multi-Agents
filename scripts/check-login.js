#!/usr/bin/env node

/**
 * 登录状态检查器
 * 在你完成微信登录后运行此脚本，会自动检测并保存凭证
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function checkAndSaveLogin() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 WeChat 登录状态检查');
  console.log('='.repeat(70) + '\n');

  // 获取最新的二维码
  console.log('📱 获取二维码...');
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
  console.log('🌐 二维码链接:');
  console.log('   ' + qrResponse.qrcode_img_content + '\n');

  console.log('='.repeat(70));
  console.log('📱 请在微信中完成登录:');
  console.log('='.repeat(70));
  console.log('1. 复制上方链接');
  console.log('2. 在微信聊天窗口粘贴');
  console.log('3. 点击链接打开');
  console.log('4. 点击 "确认登录"');
  console.log('='.repeat(70));
  console.log('\n⏳ 登录完成后，按回车键自动检测状态...\n');

  // 等待用户按回车
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n🔍 检测登录状态...\n');

  // 检查状态
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

  console.log('当前状态:', statusResponse.status);

  if (statusResponse.status === 'confirmed') {
    console.log('\n✅ 登录成功！\n');

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

    console.log('💾 凭证已保存到:');
    console.log('   ' + credsPath + '\n');

    console.log('🎉 登录完成！现在你可以:');
    console.log('   1. 启动Hub: node scripts/start-wechat-hub.js shared');
    console.log('   2. 开始多CLI并发测试\n');
    console.log('='.repeat(70) + '\n');

  } else if (statusResponse.status === 'scaned') {
    console.log('\n👀 已扫码！请在微信中点击 "确认登录"');
    console.log('   完成后再次运行此脚本检测状态\n');

  } else if (statusResponse.status === 'wait') {
    console.log('\n⏳ 等待扫码...');
    console.log('   请先完成微信登录，然后再次运行此脚本\n');

  } else if (statusResponse.status === 'expired') {
    console.log('\n❌ 二维码已过期');
    console.log('   请重新运行此脚本获取新二维码\n');
  }
}

checkAndSaveLogin().catch(error => {
  console.error('\n❌ 错误:', error.message);
  console.error(error.stack);
  process.exit(1);
});
