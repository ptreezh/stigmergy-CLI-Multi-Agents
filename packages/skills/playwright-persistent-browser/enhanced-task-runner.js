/**
 * 增强版任务执行脚�? * 整合登录处理和任务执行的完整解决方案
 */

import { chromium } from 'playwright';
import LoginHandler from './login-handler.js';
import SessionVerifier from './session-verifier.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

class EnhancedTaskRunner {
  constructor(configPath = './config.json') {
    this.config = this.loadConfig(configPath);
    this.loginHandler = new LoginHandler(this.config.login);
    this.sessionVerifier = new SessionVerifier(this.config.verification);
    this.browser = null;
    this.page = null;
  }

  /**
   * 加载配置文件
   */
  loadConfig(configPath) {
    try {
      const configData = readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.warn('⚠️ 无法加载配置文件，使用默认配�?);
      return this.getDefaultConfig();
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      browser: {
        headless: false,
        viewport: { width: 1280, height: 720 },
        timeout: 30000
      },
      login: {
        timeout: 30000,
        loginCheckInterval: 2000,
        maxLoginAttempts: 3
      },
      verification: {
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 2000
      },
      sites: {
        'github.com': {
          url: 'https://github.com',
          loggedInSelectors: ['[data-testid="user-menu"]', '.user-avatar'],
          notLoggedInSelectors: ['a[href*="/login"]', '.sign-in-form'],
          loginUrlPatterns: ['/login', '/signin']
        },
        'taobao.com': {
          url: 'https://www.taobao.com',
          loggedInSelectors: ['.site-nav-user', '.user-nick'],
          notLoggedInSelectors: ['.login-box', '.sign-in'],
          loginUrlPatterns: ['/login', '/signin']
        }
      }
    };
  }

  /**
   * 获取站点配置
   */
  getSiteConfig(url) {
    const domain = new URL(url).hostname.replace('www.', '');
    return this.config.sites[domain] || this.getDefaultSiteConfig();
  }

  /**
   * 获取默认站点配置
   */
  getDefaultSiteConfig() {
    return {
      loggedInSelectors: [
        '.user-avatar',
        '.user-profile',
        '.user-menu',
        '[data-testid="user-menu"]'
      ],
      notLoggedInSelectors: [
        'a[href*="login"]',
        'a[href*="signin"]',
        '.login-button',
        '.signin-button'
      ],
      loginUrlPatterns: ['/login', '/signin', '/auth']
    };
  }

  /**
   * 执行完整任务流程
   */
  async runTask(url, taskFunction, options = {}) {
    const {
      forceLogin = false,
      skipLoginCheck = false,
      onLoginSuccess = null,
      onLoginRequired = null,
      onTaskComplete = null
    } = options;

    try {
      console.log('🚀 开始执行任务流�?..');
      console.log(`📍 目标网站: ${url}`);

      // 1. 检查是否需要登录处�?      if (!skipLoginCheck) {
        const siteConfig = this.getSiteConfig(url);

        if (!forceLogin) {
          console.log('🔍 检查现有会话状�?..');
          const sessionStatus = await this.sessionVerifier.verifyWithRetry(
            url,
            siteConfig
          );

          if (sessionStatus.isLoggedIn) {
            console.log('�?现有会话有效，直接执行任�?);
            return await this.executeTaskWithFreshBrowser(url, taskFunction, options);
          }
        }

        console.log('🔐 需要处理登录流�?..');
        if (onLoginRequired) {
          await onLoginRequired();
        }

        // 2. 执行登录流程
        const loginResult = await this.loginHandler.handleLogin(url, siteConfig);

        if (!loginResult.success) {
          throw new Error(`登录失败: ${loginResult.reason}`);
        }

        console.log('�?登录流程完成');

        if (onLoginSuccess) {
          await onLoginSuccess(loginResult);
        }

        // 3. 验证登录状�?        console.log('🔍 最终验证登录状�?..');
        const finalVerification = await this.sessionVerifier.verifyWithRetry(
          url,
          siteConfig
        );

        if (!finalVerification.isLoggedIn) {
          throw new Error('登录后验证失�?);
        }

        console.log('�?登录状态验证通过');
      }

      // 4. 执行任务
      return await this.executeTaskWithFreshBrowser(url, taskFunction, options);

    } catch (error) {
      console.error('�?任务执行失败:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 使用新的浏览器实例执行任�?   */
  async executeTaskWithFreshBrowser(url, taskFunction, options = {}) {
    try {
      console.log('🔄 启动新的浏览器实例执行任�?..');

      // 关闭之前的浏览器实例
      await this.cleanup();

      // 启动新的浏览�?      this.browser = await chromium.launchPersistentBrowser('./my-playwright-session', {
        headless: false,
        viewport: this.config.browser.viewport,
        args: [
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.page = await this.browser.newPage();

      // 访问目标网站
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.browser.timeout
      });

      // 等待页面稳定
      await this.page.waitForTimeout(3000);

      console.log('�?浏览器准备就绪，开始执行任�?..');

      // 执行用户任务
      const taskResult = await taskFunction(this.page, {
        url: url,
        browser: this.browser,
        config: this.config
      });

      console.log('🎉 任务执行完成!');

      if (options.onTaskComplete) {
        await options.onTaskComplete(taskResult);
      }

      return taskResult;

    } catch (error) {
      console.error('�?任务执行过程中出�?', error.message);
      throw error;
    }
  }

  /**
   * 执行多个任务
   */
  async runMultipleTasks(taskList, options = {}) {
    const results = [];

    for (let i = 0; i < taskList.length; i++) {
      const task = taskList[i];
      console.log(`📋 执行任务 ${i + 1}/${taskList.length}: ${task.name || '未命名任�?}`);

      try {
        const result = await this.runTask(task.url, task.function, {
          ...options,
          skipLoginCheck: i > 0 // 后续任务跳过登录检�?        });

        results.push({
          task: task.name || `任务${i + 1}`,
          success: true,
          result: result
        });

        // 任务间隔
        if (options.taskInterval && i < taskList.length - 1) {
          console.log(`⏱️  等待 ${options.taskInterval}ms 后执行下一个任务`);
          await new Promise(resolve => setTimeout(resolve, options.taskInterval));
        }

      } catch (error) {
        console.error(`�?任务 ${i + 1} 执行失败:`, error.message);
        results.push({
          task: task.name || `任务${i + 1}`,
          success: false,
          error: error.message
        });

        if (options.stopOnError) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * 截图保存
   */
  async takeScreenshot(filename = null) {
    if (!this.page) {
      throw new Error('浏览器页面未初始�?);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = filename || `screenshot-${timestamp}.png`;

    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    console.log(`📸 截图已保�? ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * 获取页面内容
   */
  async getPageContent(options = {}) {
    if (!this.page) {
      throw new Error('浏览器页面未初始�?);
    }

    const {
      format = 'text',
      selector = null
    } = options;

    let content;

    if (selector) {
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`找不到元�? ${selector}`);
      }

      if (format === 'html') {
        content = await element.innerHTML();
      } else {
        content = await element.textContent();
      }
    } else {
      if (format === 'html') {
        content = await this.page.content();
      } else {
        content = await this.page.textContent('body');
      }
    }

    return content;
  }

  /**
   * 等待元素出现
   */
  async waitForElement(selector, options = {}) {
    if (!this.page) {
      throw new Error('浏览器页面未初始�?);
    }

    const {
      timeout = 30000,
      visible = true
    } = options;

    try {
      const element = await this.page.waitForSelector(selector, {
        timeout: timeout,
        state: visible ? 'visible' : 'attached'
      });

      console.log(`�?元素已出�? ${selector}`);
      return element;
    } catch (error) {
      console.error(`�?等待元素超时: ${selector}`);
      throw error;
    }
  }

  /**
   * 安全点击元素
   */
  async safeClick(selector, options = {}) {
    if (!this.page) {
      throw new Error('浏览器页面未初始�?);
    }

    const {
      waitForSelector = true,
      timeout = 30000
    } = options;

    try {
      if (waitForSelector) {
        await this.waitForElement(selector, { timeout });
      }

      await this.page.click(selector);
      console.log(`�?已点击元�? ${selector}`);
    } catch (error) {
      console.error(`�?点击元素失败: ${selector}`, error.message);
      throw error;
    }
  }

  /**
   * 安全输入文本
   */
  async safeType(selector, text, options = {}) {
    if (!this.page) {
      throw new Error('浏览器页面未初始�?);
    }

    const {
      clear = true,
      waitForSelector = true,
      timeout = 30000
    } = options;

    try {
      if (waitForSelector) {
        await this.waitForElement(selector, { timeout });
      }

      if (clear) {
        await this.page.fill(selector, '');
      }

      await this.page.type(selector, text);
      console.log(`�?已输入文本到: ${selector}`);
    } catch (error) {
      console.error(`�?输入文本失败: ${selector}`, error.message);
      throw error;
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    try {
      if (this.browser) {
        console.log('🔒 关闭浏览�?..');
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    } catch (error) {
      console.error('�?清理资源时出�?', error.message);
    }
  }

  /**
   * 获取当前会话信息
   */
  async getSessionInfo() {
    return await this.sessionVerifier.getSessionInfo();
  }

  /**
   * 清理会话数据
   */
  async clearSession() {
    return await this.sessionVerifier.clearSession();
  }
}

export default EnhancedTaskRunner;

// 如果直接运行此脚本，执行示例任务
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new EnhancedTaskRunner();

  // 示例任务：访问GitHub并获取用户信�?  const exampleTask = async (page, context) => {
    console.log('📋 执行示例任务：获取GitHub用户信息');

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 尝试获取用户�?    try {
      const userMenu = await page.$('[data-testid="user-menu"]');
      if (userMenu) {
        await userMenu.click();
        await page.waitForTimeout(1000);

        const userNameElement = await page.$('.dropdown-item strong');
        if (userNameElement) {
          const userName = await userNameElement.textContent();
          console.log(`👤 当前用户: ${userName}`);
          return { userName: userName.trim(), success: true };
        }
      }
    } catch (error) {
      console.log('⚠️ 无法获取用户信息，可能需要登�?);
    }

    return { success: false, reason: '无法获取用户信息' };
  };

  // 执行示例任务
  runner.runTask('https://github.com', exampleTask)
    .then(result => {
      console.log('🎉 示例任务执行完成:', result);
    })
    .catch(error => {
      console.error('�?示例任务执行失败:', error.message);
    });
}
