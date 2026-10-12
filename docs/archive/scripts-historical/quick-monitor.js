#!/usr/bin/env node

const https = require('https');

async function main() {
  console.log('\n📱 获取二维码...\n');

  const qr = await new Promise(resolve => {
    https.get('https://ilinkai.weixin.qq.com/ilink/bot/get_bot_qrcode?bot_type=3', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });

  console.log('✅ 二维码链接:\n');
  console.log(qr.qrcode_img_content);
  console.log('\n⏳ 开始监控（每2秒查询一次，最多8分钟）...\n');

  let attempt = 0;
  while (attempt < 240) {
    attempt++;

    const status = await new Promise(resolve => {
      https.get(`https://ilinkai.weixin.qq.com/ilink/bot/get_qrcode_status?qrcode=${qr.qrcode}`,
        {headers: {'iLink-App-ClientVersion': '1'}}, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });
    });

    console.log(`[${attempt}/240] 状态: ${status.status}`);

    if (status.status === 'scaned') {
      console.log('\n👀 已扫码！请在微信中确认登录\n');
    } else if (status.status === 'confirmed') {
      console.log('\n✅ 登录成功！\n');
      console.log('Token:', status.bot_token.substring(0, 20) + '...');
      console.log('Bot ID:', status.ilink_bot_id);
      console.log('User ID:', status.ilink_user_id);
      return;
    } else if (status.status === 'expired') {
      console.log('\n❌ 二维码已过期\n');
      return;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n⏰ 超时\n');
}

main().catch(console.error);
