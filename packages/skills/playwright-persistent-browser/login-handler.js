/**
 * 登录处理脚本
 * 负责处理各种登录场景，包括手动登录和自动登录
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { resolve } from 'path';

class LoginHandler {
  constructor(config = {}) {
    this.config = {
      timeout: 30000,
      loginCheckInterval: 2000,
      maxLoginAttempts: 3,
      ...config
    };
    this.browser = null;
    this.page = null;
  }

  /**
   * 启动浏览器并准备登录
   */
  async launchBrowser() {
    try {
      console.log('🚀 启动浏览�?..');

      this.browser = await chromium.launchPersistentBrowser('./my-playwright-session', {
        headless: false, // 必须显示浏览器界�?        viewport: { width: 1280, height: 720 },
        args: [
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-blink-features=AutomationControlled',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      this.page = await this.browser.newPage();

      // 设置用户代理
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('�?浏览器启动成�?);
      return true;
    } catch (error) {
      console.error('�?浏览器启动失�?', error.message);
      return false;
    }
  }

  /**
   * 访问目标网站
   */
  async navigateToSite(url) {
    try {
      console.log(`🌐 访问网站: ${url}`);
      await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });
      console.log('�?页面加载完成');
      return true;
    } catch (error) {
      console.error('�?页面加载失败:', error.message);
      return false;
    }
  }

  /**
   * 检查登录状�?   * @param {Object} loginSelectors - 登录检测选择器配�?   */
  async checkLoginStatus(loginSelectors = {}) {
    const {
      notLoggedInSelectors = [], // 未登录时的选择�?      loggedInSelectors = [],     // 已登录时的选择�?      loginUrlPatterns = []      // 登录页面的URL模式
    } = loginSelectors;

    try {
      const currentUrl = this.page.url();

      // 检查是否在登录页面
      const isLoginPage = loginUrlPatterns.some(pattern =>
        new RegExp(pattern).test(currentUrl)
      );

      if (isLoginPage) {
        console.log('🔍 检测到登录页面');
        return { isLoggedIn: false, isLoginPage: true };
      }

      // 检查未登录标识
      for (const selector of notLoggedInSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            console.log(`🔍 检测到未登录标�? ${selector}`);
            return { isLoggedIn: false, reason: 'not_logged_in_selector' };
          }
        } catch (e) {
          // 选择器不存在，继续检查下一�?        }
      }

      // 检查已登录标识
      for (const selector of loggedInSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`🔍 检测到已登录标�? ${selector}`);
            return { isLoggedIn: true, reason: 'logged_in_selector' };
          }
        } catch (e) {
          // 选择器不存在，继续检查下一�?        }
      }

      // 默认检查常见登录标�?      const commonNotLoggedInSelectors = [
        'a[href*="login"]',
        'a[href*="signin"]',
        '.login-button',
        '.signin-button',
        '[data-testid="login"]',
        '[data-testid="signin"]'
      ];

      const commonLoggedInSelectors = [
        '.user-avatar',
        '.user-profile',
        '.user-menu',
        '[data-testid="user-menu"]',
        '.logout-button',
        'a[href*="logout"]'
      ];

      // 检查通用未登录标�?      for (const selector of commonNotLoggedInSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`🔍 检测到通用未登录标�? ${selector}`);
            return { isLoggedIn: false, reason: 'generic_not_logged_in' };
          }
        } catch (e) {
          continue;
        }
      }

      // 检查通用已登录标�?      for (const selector of commonLoggedInSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`🔍 检测到通用已登录标�? ${selector}`);
            return { isLoggedIn: true, reason: 'generic_logged_in' };
          }
        } catch (e) {
          continue;
        }
      }

      console.log('🔍 无法确定登录状态，假设未登�?);
      return { isLoggedIn: false, reason: 'unknown' };

    } catch (error) {
      console.error('�?登录状态检查失�?', error.message);
      return { isLoggedIn: false, reason: 'check_failed' };
    }
  }

  /**
   * 等待用户手动登录
   */
  async waitForManualLogin(message = '请在浏览器中完成登录操作') {
    console.log('�?等待用户手动登录...');
    console.log(`💡 ${message}`);

    return new Promise((resolve) => {
      let loginCheckCount = 0;
      const maxChecks = 150; // 5分钟检查周�?
      const checkLogin = async () => {
        loginCheckCount++;

        // 检查用户是否在控制台输入完�?        console.log(`⏱️  检查登录状�?.. (${loginCheckCount}/${maxChecks})`);

        // 这里可以添加更多的登录检测逻辑
        try {
          // 检查页面URL变化
          const currentUrl = this.page.url();
          console.log(`📍 当前页面: ${currentUrl}`);

          // 检查是否有登录成功的标�?          const loginResult = await this.checkLoginStatus();

          if (loginResult.isLoggedIn) {
            console.log('�?检测到登录成功!');
            resolve(true);
            return;
          }

          // 如果超过最大检查次数，返回失败
          if (loginCheckCount >= maxChecks) {
            console.log('�?等待登录超时');
            resolve(false);
            return;
          }

          // 继续等待
          setTimeout(checkLogin, this.config.loginCheckInterval);

        } catch (error) {
          console.error('�?登录检查过程出�?', error.message);
          setTimeout(checkLogin, this.config.loginCheckInterval);
        }
      };

      // 开始检�?      setTimeout(checkLogin, 3000); // 3秒后开始第一次检�?
      // 监听控制台输入，用户输入 'done' 表示登录完成
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', (key) => {
        if (key.toString() === 'done') {
          console.log('👤 用户确认登录完成');
          process.stdin.setRawMode(false);
          process.stdin.pause();
          resolve(true);
        }
      });
    });
  }

  /**
   * 保存登录会话
   */
  async saveSession() {
    try {
      console.log('💾 保存登录会话...');

      // 等待一会确保所有状态都已保�?      await this.page.waitForTimeout(2000);

      // 获取所有cookies
      const cookies = await this.page.context().cookies();
      console.log(`🍪 已保�?${cookies.length} 个cookies`);

      // 获取localStorage
      const localStorage = await this.page.evaluate(() => {
        return Object.keys(localStorage).reduce((obj, key) => {
          obj[key] = localStorage.getItem(key);
          return obj;
        }, {});
      });
      console.log(`📦 已保�?${Object.keys(localStorage).length} 个localStorage项`);

      console.log('�?会话保存完成');
      return true;
    } catch (error) {
      console.error('�?会话保存失败:', error.message);
      return false;
    }
  }

  /**
   * 关闭浏览�?   */
  async closeBrowser() {
    try {
      if (this.browser) {
        console.log('🔒 关闭浏览�?..');
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('�?浏览器已关闭');
      }
    } catch (error) {
      console.error('�?关闭浏览器失�?', error.message);
    }
  }

  /**
   * 重新启动浏览器并验证登录状�?   */
  async restartAndVerifyLogin(url, loginSelectors) {
    try {
      console.log('🔄 重新启动浏览�?..');

      // 关闭当前浏览�?      await this.closeBrowser();

      // 等待一会确保进程完全退�?      await new Promise(resolve => setTimeout(resolve, 2000));

      // 重新启动浏览�?      const launchSuccess = await this.launchBrowser();
      if (!launchSuccess) {
        return false;
      }

      // 访问目标网站
      const navigateSuccess = await this.navigateToSite(url);
      if (!navigateSuccess) {
        return false;
      }

      // 等待页面加载完成
      await this.page.waitForTimeout(3000);

      // 验证登录状�?      console.log('🔍 验证登录状�?..');
      const loginStatus = await this.checkLoginStatus(loginSelectors);

      if (loginStatus.isLoggedIn) {
        console.log('�?登录状态验证成�?');
        return true;
      } else {
        console.log('�?登录状态验证失败，可能需要重新登�?);
        return false;
      }

    } catch (error) {
      console.error('�?重启验证失败:', error.message);
      return false;
    }
  }

  /**
   * 完整的登录处理流�?   */
  async handleLogin(url, loginSelectors = {}) {
    try {
      console.log('🔐 开始登录处理流�?..');

      // 1. 启动浏览�?      const launchSuccess = await this.launchBrowser();
      if (!launchSuccess) {
        return { success: false, reason: 'browser_launch_failed' };
      }

      // 2. 访问目标网站
      const navigateSuccess = await this.navigateToSite(url);
      if (!navigateSuccess) {
        return { success: false, reason: 'navigation_failed' };
      }

      // 3. 检查登录状�?      const loginStatus = await this.checkLoginStatus(loginSelectors);

      if (loginStatus.isLoggedIn) {
        console.log('�?已经登录，无需处理登录流程');
        return { success: true, alreadyLoggedIn: true, page: this.page };
      }

      console.log('🔍 检测到需要登录，开始手动登录流�?..');

      // 4. 等待用户手动登录
      const loginSuccess = await this.waitForManualLogin();

      if (!loginSuccess) {
        return { success: false, reason: 'manual_login_timeout' };
      }

      // 5. 保存会话
      const saveSuccess = await this.saveSession();
      if (!saveSuccess) {
        console.warn('⚠️ 会话保存可能不完整，但继续执�?);
      }

      // 6. 重新启动浏览器并验证登录状�?      const verifySuccess = await this.restartAndVerifyLogin(url, loginSelectors);

      if (verifySuccess) {
        console.log('🎉 登录处理流程完成!');
        return {
          success: true,
          loginRequired: true,
          page: this.page,
          browser: this.browser
        };
      } else {
        return { success: false, reason: 'login_verification_failed' };
      }

    } catch (error) {
      console.error('�?登录处理流程失败:', error.message);
      return { success: false, reason: 'login_process_failed', error: error.message };
    }
  }
}

export default LoginHandler;
