// examples/google-login.js - Google登录示例
import { runTask, checkLoginStatus } from '../task-template.js';

runTask(async (page) => {
  console.log('🌐 访问Google主页...');
  await page.goto('https://www.google.com');

  // 访问Google账户页面
  console.log('📋 检查登录状�?..');
  await page.goto('https://accounts.google.com');

  // 检查是否已登录
  const isLoggedIn = await checkLoginStatus(page, '[data-email]', 3000);

  if (isLoggedIn) {
    console.log('�?Google账户已登�?);

    // 获取邮箱地址
    const emailElement = await page.locator('[data-email]').first();
    const email = await emailElement.getAttribute('data-email');
    console.log(`📧 当前邮箱: ${email}`);

    // 可以继续执行其他任务
    console.log('🔍 访问Google搜索...');
    await page.goto('https://www.google.com');
    await page.fill('textarea[name="q"]', 'Playwright automation');
    await page.press('textarea[name="q"]', 'Enter');
    await page.waitForSelector('#search');

  } else {
    console.log('�?Google账户未登�?);
    console.log('👤 请在浏览器中手动登录Google账户...');

    // 等待用户手动登录
    await page.pause();

    console.log('�?登录完成，会话已保存');
  }

  // 等待几秒钟观察结�?  await new Promise(resolve => setTimeout(resolve, 3000));
});
