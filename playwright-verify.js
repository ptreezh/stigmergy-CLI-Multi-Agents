const { chromium } = require('playwright');

async function verifyIntegration() {
  console.log('🔍 验证通信平台快速集成方案...\n');

  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // 验证1: 访问Wechaty GitHub
  console.log('📱 验证1: Wechaty GitHub仓库');
  try {
    await page.goto('https://github.com/wechaty/wechaty');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'wechaty-github.png', fullPage: true });
    console.log('   ✅ 已保存GitHub截图: wechaty-github.png');

    // 检查stars数量
    try {
      const stars = await page.locator('[href*="/stargazers"]').first().textContent();
      console.log('   GitHub Stars:', stars);
    } catch (e) {}

    // 检查最后更新时间
    try {
      const updateTime = await page.locator('relative-time').first().getAttribute('datetime');
      console.log('   最后更新:', updateTime ? updateTime.split('T')[0] : '未知');
    } catch (e) {}
  } catch (e) {
    console.log('   ❌ GitHub访问失败:', e.message);
  }

  await page.waitForTimeout(2000);

  // 验证2: 访问飞书官方文档
  console.log('\n🎯 验证2: 飞书官方快速开始文档');
  try {
    await page.goto('https://open.feishu.cn/document/home/develop-a-bot-in-5-mins/create-an-app');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'feishu-quick-start.png', fullPage: true });
    console.log('   ✅ 已保存飞书文档截图: feishu-quick-start.png');

    const title = await page.title();
    console.log('   页面标题:', title);

    // 检查是否包含关键信息
    const content = await page.content();
    console.log('   包含"5分钟":', content.includes('5分钟') ? '✅' : '❌');
    console.log('   包含"快速开始":', content.includes('快速开始') ? '✅' : '❌');
    console.log('   包含"企业自建":', content.includes('企业自建') ? '✅' : '❌');
  } catch (e) {
    console.log('   ❌ 飞书文档访问失败:', e.message);
  }

  await page.waitForTimeout(2000);

  // 验证3: 访问企业微信文档
  console.log('\n💼 验证3: 企业微信自建应用文档');
  try {
    await page.goto('https://developer.work.weixin.qq.com/document/path/90679');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'wechat-work-app.png', fullPage: true });
    console.log('   ✅ 已保存企业微信文档截图: wechat-work-app.png');

    const title = await page.title();
    console.log('   页面标题:', title);

    const content = await page.content();
    console.log('   包含"自建应用":', content.includes('自建应用') ? '✅' : '❌');
    console.log('   包含"立即":', content.includes('立即') ? '✅' : '❌');
  } catch (e) {
    console.log('   ❌ 企业微信文档访问失败:', e.message);
  }

  await page.waitForTimeout(2000);

  // 验证4: 搜索Bottender
  console.log('\n🤖 验证4: Bottender框架');
  try {
    await page.goto('https://github.com/Yoctol/bottender');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'bottender-github.png', fullPage: true });
    console.log('   ✅ 已保存Bottender截图: bottender-github.png');

    const title = await page.title();
    console.log('   页面标题:', title);
  } catch (e) {
    console.log('   ❌ Bottender访问失败:', e.message);
  }

  await page.waitForTimeout(2000);

  // 验证5: 搜索腾讯云SCF微信模板
  console.log('\n☁️  验证5: 腾讯云SCF微信模板');
  try {
    await page.goto('https://cloud.tencent.com/document/product/583');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tencent-scf-doc.png', fullPage: true });
    console.log('   ✅ 已保存腾讯云文档截图: tencent-scf-doc.png');

    const title = await page.title();
    console.log('   页面标题:', title);
  } catch (e) {
    console.log('   ❌ 腾讯云文档访问失败:', e.message);
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('✅ 验证完成！');
  console.log('\n📊 生成的验证截图:');
  console.log('   - wechaty-github.png (Wechaty GitHub)');
  console.log('   - feishu-quick-start.png (飞书快速开始)');
  console.log('   - wechat-work-app.png (企业微信自建应用)');
  console.log('   - bottender-github.png (Bottender框架)');
  console.log('   - tencent-scf-doc.png (腾讯云SCF)');
  console.log('='.repeat(70));
}

verifyIntegration().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
