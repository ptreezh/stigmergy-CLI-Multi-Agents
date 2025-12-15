// my-launcher.js
import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import fs from 'fs';

// 在这�?硬编�?你的"大脑"文件夹路�?const MY_SESSION_PATH = path.join(os.homedir(), '.claude', 'skills', 'playwright-persistent-browser', 'my-playwright-session');

/**
 * 启动一个默认使用持久化会话的浏览器
 * @param {Object} options - 启动选项
 * @returns {Promise<BrowserContext>} 返回浏览器上下文
 */
export async function launchMyDefaultBrowser(options = {}) {

  console.log(`[启动器]: 正在加载/保存会话�? ${MY_SESSION_PATH}`);

  const launchOptions = {
    headless: false, // 默认必须�?false，至少第一次登录时如此
    slowMo: 100,
    viewport: { width: 1280, height: 720 },
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    ...options, // 允许外部覆盖
  };

  // 核心：告�?Playwright 总是使用这个文件�?  return await chromium.launchPersistentContext(MY_SESSION_PATH, launchOptions);
}

/**
 * 启动无头模式的持久化浏览�? * @param {Object} options - 启动选项
 * @returns {Promise<BrowserContext>} 返回浏览器上下文
 */
export async function launchHeadlessPersistentBrowser(options = {}) {
  return await launchMyDefaultBrowser({
    headless: true,
    slowMo: 50,
    ...options
  });
}

/**
 * 检查会话是否存�? * @returns {boolean} 返回会话是否存在
 */
export function sessionExists() {
  return fs.existsSync(MY_SESSION_PATH) &&
         fs.existsSync(path.join(MY_SESSION_PATH, 'Default', 'Cookies'));
}

/**
 * 获取会话路径
 * @returns {string} 返回会话路径
 */
export function getSessionPath() {
  return MY_SESSION_PATH;
}
