const { chromium } = require('playwright');

async function searchIntegration() {
  console.log('🚀 启动Playwright浏览器自动化...\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  console.log('🔍 开始搜索微信/飞书快速集成方案...\n');

  // 搜索1: 微信快速集成
  console.log('📱 搜索1: 微信快速集成方案');
  await page.goto('https://www.bing.com/search?q=微信+快速集成+扫码授权+企业微信');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'search-wechat.png' });
  console.log('   ✅ 已保存搜索结果截图: search-wechat.png');

  // 提取搜索结果标题
  const wechatResults = await page.locator('.b_title').allTextContents();
  console.log('   前3个结果:');
  wechatResults.slice(0, 3).forEach((r, i) => console.log(`   ${i+1}. ${r}`));

  await page.waitForTimeout(2000);

  // 搜索2: 飞书快速集成
  console.log('\n🎯 搜索2: 飞书快速集成方案');
  await page.goto('https://www.bing.com/search?q=飞书+5分钟创建应用+企业自建');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'search-feishu.png' });
  console.log('   ✅ 已保存搜索结果截图: search-feishu.png');

  const feishuResults = await page.locator('.b_title').allTextContents();
  console.log('   前3个结果:');
  feishuResults.slice(0, 3).forEach((r, i) => console.log(`   ${i+1}. ${r}`));

  await page.waitForTimeout(2000);

  // 搜索3: Wechaty
  console.log('\n🔐 搜索3: Wechaty扫码授权方案');
  await page.goto('https://www.bing.com/search?q=wechaty+微信+扫码+机器人+GitHub');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'search-wechaty.png' });
  console.log('   ✅ 已保存搜索结果截图: search-wechaty.png');

  const wechatyResults = await page.locator('.b_title').allTextContents();
  console.log('   前3个结果:');
  wechatyResults.slice(0, 3).forEach((r, i) => console.log(`   ${i+1}. ${r}`));

  await page.waitForTimeout(2000);

  // 访问Wechaty官网验证
  console.log('\n🔗 验证Wechaty官网');
  await page.goto('https://www.wechaty.io/');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'wechaty-home.png', fullPage: true });
  console.log('   ✅ 已保存Wechaty首页截图: wechaty-home.png');

  // 获取页面信息
  const title = await page.title();
  console.log('   页面标题:', title);

  // 检查GitHub链接
  try {
    const githubLink = await page.locator('a[href*="github"]').first().getAttribute('href');
    console.log('   GitHub链接:', githubLink || '未找到');
  } catch (e) {
    console.log('   GitHub链接: 未找到');
  }

  // 访问飞书官方文档
  console.log('\n🔗 验证飞书官方文档');
  await page.goto('https://open.feishu.cn/document/home/develop-a-bot-in-5-mins/create-an-app');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'feishu-doc.png', fullPage: true });
  console.log('   ✅ 已保存飞书文档截图: feishu-doc.png');

  const feishuTitle = await page.title();
  console.log('   页面标题:', feishuTitle);

  // 检查是否包含"5分钟"字样
  const pageContent = await page.content();
  const has5Minutes = pageContent.includes('5分钟') || pageContent.includes('5 mins');
  console.log('   包含"5分钟"字样:', has5Minutes ? '✅ 是' : '❌ 否');

  await page.waitForTimeout(2000);

  // 访问企业微信文档
  console.log('\n🔗 验证企业微信文档');
  await page.goto('https://developer.work.weixin.qq.com/document/path/90679');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'wechat-work-doc.png', fullPage: true });
  console.log('   ✅ 已保存企业微信文档截图: wechat-work-doc.png');

  const wechatWorkTitle = await page.title();
  console.log('   页面标题:', wechatWorkTitle);

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('✅ 搜索和验证完成！');
  console.log('\n📊 生成的截图文件:');
  console.log('   - search-wechat.png (微信集成搜索)');
  console.log('   - search-feishu.png (飞书集成搜索)');
  console.log('   - search-wechaty.png (Wechaty搜索)');
  console.log('   - wechaty-home.png (Wechaty官网)');
  console.log('   - feishu-doc.png (飞书官方文档)');
  console.log('   - wechat-work-doc.png (企业微信文档)');
  console.log('='.repeat(70));
}

searchIntegration().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
