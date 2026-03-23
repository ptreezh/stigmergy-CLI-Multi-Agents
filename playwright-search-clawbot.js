const { chromium } = require('playwright');

async function searchClawbotAndClaude() {
  console.log('🔍 搜索微信Clawbot协议和Claude CLI微信扫码方案\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // 搜索1: 微信Clawbot协议
  console.log('📱 搜索1: 微信Clawbot官方协议');
  await page.goto('https://www.bing.com/search?q=微信+Clawbot+协议+官网+2026');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'search-clawbot.png', fullPage: true });
  console.log('   ✅ 已保存: search-clawbot.png');

  const clawbotResults = await page.locator('.b_title').allTextContents();
  console.log('   前5个结果:');
  clawbotResults.slice(0, 5).forEach((r, i) => console.log(`   ${i+1}. ${r}`));

  await page.waitForTimeout(2000);

  // 搜索2: Claude CLI微信扫码
  console.log('\n🤖 搜索2: Claude CLI微信扫码访问方案');
  await page.goto('https://www.bing.com/search?q=Claude+CLI+微信+扫码+访问+GitHub');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'search-claude-wechat.png', fullPage: true });
  console.log('   ✅ 已保存: search-claude-wechat.png');

  const claudeResults = await page.locator('.b_title').allTextContents();
  console.log('   前5个结果:');
  claudeResults.slice(0, 5).forEach((r, i) => console.log(`   ${i+1}. ${r}`));

  await page.waitForTimeout(2000);

  // 搜索3: WeChat机器人协议
  console.log('\n🔧 搜索3: WeChat机器人开发协议');
  await page.goto('https://www.bing.com/search?q=WeChat+机器人+协议+开发文档+2026');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'search-wechat-protocol.png', fullPage: true });
  console.log('   ✅ 已保存: search-wechat-protocol.png');

  await page.waitForTimeout(2000);

  // 搜索4: GitHub - Claude WeChat integration
  console.log('\n📦 搜索4: GitHub Claude微信集成项目');
  await page.goto('https://www.bing.com/search?q=site:github.com+Claude+WeChat+扫码');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'search-github-claude-wechat.png', fullPage: true });
  console.log('   ✅ 已保存: search-github-claude-wechat.png');

  await page.waitForTimeout(2000);

  // 访问可能的GitHub项目
  console.log('\n🔗 验证可能的GitHub项目');

  // 尝试访问一些可能的项目
  const possibleProjects = [
    'https://github.com/search?q=Claude+WeChat+bot',
    'https://github.com/search?q=claude-code+wechat',
    'https://github.com/search?q=anthropic+wechat+integration'
  ];

  for (const url of possibleProjects.slice(0, 2)) {
    try {
      console.log(`   访问: ${url}`);
      await page.goto(url);
      await page.waitForTimeout(3000);
      const filename = `github-search-${Date.now()}.png`;
      await page.screenshot({ path: filename });
      console.log('   ✅ 已保存:', filename);
    } catch (e) {
      console.log('   ⚠️  访问失败:', e.message);
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('✅ 搜索完成！');
  console.log('\n📊 生成的搜索截图:');
  console.log('   - search-clawbot.png (微信Clawbot)');
  console.log('   - search-claude-wechat.png (Claude CLI微信扫码)');
  console.log('   - search-wechat-protocol.png (WeChat协议)');
  console.log('   - search-github-claude-wechat.png (GitHub项目)');
  console.log('='.repeat(70));
}

searchClawbotAndClaude().catch(error => {
  console.error('❌ 搜索失败:', error);
  process.exit(1);
});
