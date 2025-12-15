// task-template.js - 通用任务模板
import { launchMyDefaultBrowser, launchHeadlessPersistentBrowser } from './my-launcher.js';

/**
 * 执行网络任务的通用模板
 * @param {Function} taskFunction - 要执行的任务函数，接收page作为参数
 * @param {Object} options - 浏览器启动选项
 */
export async function runTask(taskFunction, options = {}) {
  try {
    // 启动浏览�?    const context = await launchMyDefaultBrowser(options);
    const page = await context.newPage();

    // 设置默认超时
    page.setDefaultTimeout(30000);

    try {
      // 执行任务
      await taskFunction(page, context);
      console.log('�?任务执行成功');
    } catch (error) {
      console.error('�?任务执行失败:', error.message);
      throw error;
    } finally {
      // 关闭浏览�?      await context.close();
      console.log('🔒 浏览器已关闭，会话已保存');
    }

  } catch (error) {
    console.error('🚨 发生严重错误:', error);
    throw error;
  }
}

/**
 * 检查登录状�? * @param {Page} page - Playwright页面对象
 * @param {string} loginSelector - 登录状态的CSS选择�? * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<boolean>} 是否已登�? */
export async function checkLoginStatus(page, loginSelector, timeout = 5000) {
  try {
    await page.locator(loginSelector).waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * 等待用户手动登录
 * @param {Page} page - Playwright页面对象
 * @param {string} message - 提示消息
 */
export async function waitForManualLogin(page, message = '请在浏览器中手动登录...') {
  console.log('�?等待用户手动登录');
  console.log(`>>> ${message}`);
  await page.pause();
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒�? * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用示例
if (import.meta.url === `file://${process.argv[1]}`) {
  // 示例任务：访问GitHub并检查登录状�?  runTask(async (page) => {
    await page.goto('https://github.com');

    const isLoggedIn = await checkLoginStatus(page, 'button[aria-label="View profile and more"]');

    if (isLoggedIn) {
      console.log('�?用户已登�?);
      // 继续执行已登录状态的任务
    } else {
      console.log('�?用户未登�?);
      await waitForManualLogin(page, '登录完成后继续执行任�?);
    }

    console.log('任务完成，即将关闭浏览器...');
    await delay(3000);
  });
}
