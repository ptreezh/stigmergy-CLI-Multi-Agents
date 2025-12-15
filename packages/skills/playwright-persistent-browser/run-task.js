// run-task.js
import { launchMyDefaultBrowser, sessionExists, getSessionPath } from './my-launcher.js';

(async () => {
  try {
    // 1. 检查会话状�?    const hasSession = sessionExists();
    console.log(`会话状�? ${hasSession ? '存在' : '不存�?}`);
    console.log(`会话路径: ${getSessionPath()}`);

    // 2. 调用我们的封装函�?    const context = await launchMyDefaultBrowser();

    // 3. 在上下文中创建一个新页面
    const page = await context.newPage();

    // 4. 访问一个需要登录的网站（示例：GitHub�?    console.log('正在访问 GitHub...');
    await page.goto('https://github.com');

    // 5. 检查是否已登录 (通过检查右上角是否有头�?
    const avatarLocator = page.locator('button[aria-label="View profile and more"]');

    try {
      // 尝试�?秒内找到头像
      await avatarLocator.waitFor({ timeout: 5000 });
      console.log('�?状态：已登�?(检测到用户头像)');

      // 如果已登录，可以继续执行其他任务
      console.log('正在执行后续任务...');

      // 示例：获取用户名
      const username = await avatarLocator.getAttribute('href');
      if (username) {
        console.log(`当前用户: ${username.replace('/', '')}`);
      }

    } catch (e) {
      // 如果5秒内找不到，说明没登�?      console.log('�?状态：未登�?);
      console.log('>>> 请在打开的浏览器中手动登�?.. 登录后请手动关闭浏览器�?);

      // 暂停脚本，等待用户手动登�?      await page.pause();
      // 当你手动登录并关闭浏览器后，Cookie 就会被保�?    }

    // 如果已经登录，脚本会继续到这�?    console.log('脚本执行完毕�?秒后自动关闭...');
    await page.waitForTimeout(5000);

    // 6. 关闭上下文（这一步会确保所有新 Cookie 都被保存�?    await context.close();
    console.log('浏览器已关闭，会话已保存�?);

  } catch (error) {
    console.error('执行过程中发生错�?', error);
    process.exit(1);
  }
})();
