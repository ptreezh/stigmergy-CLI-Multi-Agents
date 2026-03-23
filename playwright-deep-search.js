const { chromium } = require('playwright');

async function deepSearchAndVerify() {
  console.log('🔍 深度搜索和验证\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // 访问GitHub搜索具体项目
  console.log('📦 搜索GitHub项目\n');

  const searchTerms = [
    'claude code wechat',
    'anthropic wechat bot',
    'claude cli wechat integration',
    'wechat claude ai',
    'claude-code wechat'
  ];

  const results = {};

  for (const term of searchTerms) {
    console.log(`\n搜索: "${term}"`);
    try {
      await page.goto(`https://github.com/search?q=${encodeURIComponent(term)}&type=repositories`);
      await page.waitForTimeout(5000);

      const filename = `github-${term.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename });

      // 获取搜索结果
      try {
        const repoTitles = await page.locator('a[data-testid="search"]').allTextContents();
        console.log(`   找到 ${repoTitles.length} 个仓库`);

        if (repoTitles.length > 0) {
          console.log('   前3个:');
          repoTitles.slice(0, 3).forEach((t, i) => console.log(`   ${i+1}. ${t}`));
        }

        results[term] = { count: repoTitles.length, top: repoTitles.slice(0, 3) };
      } catch (e) {
        console.log('   ⚠️  无法获取结果列表');
      }

      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('   ❌ 搜索失败:', e.message);
    }
  }

  // 访问微信官方开放平台
  console.log('\n\n📱 访问微信官方平台\n');

  const wechatUrls = [
    'https://open.weixin.qq.com/',
    'https://developers.weixin.qq.com/doc/',
    'https://developer.work.weixin.qq.com/'
  ];

  for (const url of wechatUrls) {
    try {
      console.log(`\n访问: ${url}`);
      await page.goto(url);
      await page.waitForTimeout(5000);

      const filename = `wechat-${url.split('//')[1].replace(/[\/\.]/g, '-')}.png`;
      await page.screenshot({ path: filename });

      const title = await page.title();
      console.log('   标题:', title);

      // 检查页面内容
      const content = await page.content();
      console.log('   包含"机器人":', content.includes('机器人') ? '✅' : '❌');
      console.log('   包含"API":', content.includes('API') ? '✅' : '❌');
      console.log('   包含"协议":', content.includes('协议') ? '✅' : '❌');

    } catch (e) {
      console.log('   ❌ 访问失败:', e.message);
    }
  }

  // 搜索具体的实现方案
  console.log('\n\n🔍 搜索具体实现方案\n');

  const implementationSearches = [
    '微信扫码登录 Claude',
    'WeChat QR code Claude AI',
    '企业微信 Claude 集成',
    '飞书 Claude 集成',
    '钉钉 Claude 集成'
  ];

  for (const term of implementationSearches) {
    console.log(`\n搜索: "${term}"`);
    try {
      await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(term)}`);
      await page.waitForTimeout(3000);

      const filename = `impl-${term.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename });
      console.log('   ✅ 已保存:', filename);

      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('   ⚠️  搜索失败');
    }
  }

  // 访问Anthropic官网文档
  console.log('\n\n🤖 访问Anthropic文档\n');

  try {
    console.log('访问: https://docs.anthropic.com');
    await page.goto('https://docs.anthropic.com');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'anthropic-docs.png', fullPage: true });

    const title = await page.title();
    console.log('   标题:', title);

    // 检查是否有API相关内容
    const content = await page.content();
    console.log('   包含"API":', content.includes('API') ? '✅' : '❌');
    console.log('   包含"integration":', content.includes('integration') ? '✅' : '❌');
    console.log('   包含"WeChat":', content.includes('WeChat') ? '✅' : '❌');
  } catch (e) {
    console.log('   ❌ 访问失败:', e.message);
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('✅ 深度搜索完成！');
  console.log('='.repeat(70));
}

deepSearchAndVerify().catch(error => {
  console.error('❌ 搜索失败:', error);
  process.exit(1);
});
