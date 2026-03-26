#!/usr/bin/env node

/**
 * 快速检查WeChat登录状态
 */

const { ILinkApiClient } = require('../skills/ilink-wechat-client');

async function checkStatus() {
  const client = new ILinkApiClient();

  console.log('\n🔍 检查登录状态...\n');

  try {
    // 尝试使用保存的凭证
    const fs = require('fs');
    const path = require('path');
    const credsPath = path.join(require('os').homedir(), '.stigmergy/ilink-wechat-credentials.json');

    if (fs.existsSync(credsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

      console.log('✅ 找到保存的凭证:');
      console.log('   Account ID:', credentials.accountId);
      console.log('   User ID:', credentials.userId);

      // 尝试连接
      console.log('\n🔗 尝试连接...');
      client.token = credentials.token;
      client.accountId = credentials.accountId;
      client.userId = credentials.userId;

      try {
        await client.getConfig();
        console.log('✅ 凭证有效！已成功登录！');
        console.log('\n🎉 你现在可以:');
        console.log('   1. 启动Hub: node scripts/start-wechat-hub.js shared');
        console.log('   2. 开始多CLI测试\n');
        return true;
      } catch (error) {
        console.log('⚠️  凭证已过期，请重新登录');
        return false;
      }

    } else {
      console.log('❌ 未找到登录凭证');
      console.log('\n📱 请运行以下命令进行登录:');
      console.log('   node scripts/monitor-wechat-login.js\n');
      return false;
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    return false;
  }
}

checkStatus().then(success => {
  process.exit(success ? 0 : 1);
});
