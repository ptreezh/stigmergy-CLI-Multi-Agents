/**
 * 会话验证脚本
 * 负责验证和检查浏览器会话的登录状�? */

import { chromium } from 'playwright';

class SessionVerifier {
  constructor(config = {}) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 2000,
      ...config
    };
  }

  /**
   * 验证指定网站的登录状�?   */
  async verifyLoginStatus(url, verificationOptions = {}) {
    const {
      loggedInSelectors = [],
      notLoggedInSelectors = [],
      loginUrlPatterns = [],
      customVerification = null
    } = verificationOptions;

    let browser = null;
    let context = null;
    let page = null;

    try {
      console.log(`🔍 开始验证登录状�? ${url}`);

      // 启动浏览器并加载现有会话
      browser = await chromium.launchPersistentBrowser('./my-playwright-session', {
        headless: false,
        viewport: { width: 1280, height: 720 }
      });

      context = browser.contexts()[0];
      page = await context.newPage();

      // 访问目标网站
      console.log('🌐 访问目标网站...');
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });

      // 等待页面完全加载
      await page.waitForTimeout(3000);

      // 获取当前URL信息
      const currentUrl = page.url();
      console.log(`📍 当前页面: ${currentUrl}`);

      // 检查是否被重定向到登录页面
      const isLoginPage = loginUrlPatterns.some(pattern =>
        new RegExp(pattern).test(currentUrl)
      );

      if (isLoginPage) {
        console.log('�?被重定向到登录页面，会话已失�?);
        return {
          isLoggedIn: false,
          reason: 'redirected_to_login',
          currentUrl: currentUrl
        };
      }

      // 检查未登录标识
      for (const selector of notLoggedInSelectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`�?检测到未登录标�? ${selector}`);
            return {
              isLoggedIn: false,
              reason: 'not_logged_in_selector',
              selector: selector,
              currentUrl: currentUrl
            };
          }
        } catch (e) {
          // 选择器不存在，继续检�?        }
      }

      // 检查已登录标识
      for (const selector of loggedInSelectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible()) {
            console.log(`�?检测到已登录标�? ${selector}`);

            // 执行自定义验证（如果提供�?            if (customVerification) {
              const customResult = await customVerification(page);
              if (!customResult.isValid) {
                return {
                  isLoggedIn: false,
                  reason: 'custom_verification_failed',
                  details: customResult.details,
                  currentUrl: currentUrl
                };
              }
            }

            return {
              isLoggedIn: true,
              reason: 'logged_in_selector',
              selector: selector,
              currentUrl: currentUrl
            };
          }
        } catch (e) {
          // 选择器不存在，继续检�?        }
      }

      // 通用登录状态检�?      const genericResult = await this.performGenericLoginCheck(page);
      if (genericResult.isLoggedIn) {
        return {
          ...genericResult,
          currentUrl: currentUrl
        };
      }

      console.log('⚠️ 无法确定登录状态，默认为未登录');
      return {
        isLoggedIn: false,
        reason: 'login_status_unclear',
        currentUrl: currentUrl
      };

    } catch (error) {
      console.error('�?登录状态验证失�?', error.message);
      return {
        isLoggedIn: false,
        reason: 'verification_error',
        error: error.message
      };
    } finally {
      // 清理资源
      try {
        if (page) await page.close();
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (e) {
        console.error('清理资源时出�?', e.message);
      }
    }
  }

  /**
   * 通用登录状态检�?   */
  async performGenericLoginCheck(page) {
    const commonLoggedInSelectors = [
      '.user-avatar',
      '.user-profile',
      '.user-menu',
      '[data-testid="user-menu"]',
      '.user-info',
      '.profile-image',
      '.account-info',
      'img[alt*="avatar"]',
      'img[alt*="profile"]'
    ];

    const commonNotLoggedInSelectors = [
      'a[href*="login"]',
      'a[href*="signin"]',
      '.login-button',
      '.signin-button',
      '[data-testid="login"]',
      '[data-testid="signin"]',
      '.sign-in-form',
      '.login-form'
    ];

    // 检查通用已登录标�?    for (const selector of commonLoggedInSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`�?检测到通用已登录标�? ${selector}`);
          return {
            isLoggedIn: true,
            reason: 'generic_logged_in',
            selector: selector
          };
        }
      } catch (e) {
        continue;
      }
    }

    // 检查通用未登录标�?    for (const selector of commonNotLoggedInSelectors) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`�?检测到通用未登录标�? ${selector}`);
          return {
            isLoggedIn: false,
            reason: 'generic_not_logged_in',
            selector: selector
          };
        }
      } catch (e) {
        continue;
      }
    }

    // 检查页面标题和内容
    const title = await page.title();
    const url = page.url();

    // 检查标题中是否包含登录相关关键�?    const loginKeywords = ['login', 'signin', 'sign in', 'log in', '登录', '登陆'];
    const hasLoginKeywords = loginKeywords.some(keyword =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasLoginKeywords) {
      console.log('�?页面标题包含登录关键�?);
      return {
        isLoggedIn: false,
        reason: 'title_contains_login_keywords',
        title: title
      };
    }

    // 检查URL中是否包含登录相关路�?    const loginPaths = ['/login', '/signin', '/auth', '/oauth', '/login.php', '/signin.php'];
    const hasLoginPath = loginPaths.some(path =>
      url.toLowerCase().includes(path.toLowerCase())
    );

    if (hasLoginPath) {
      console.log('�?URL包含登录路径');
      return {
        isLoggedIn: false,
        reason: 'url_contains_login_path',
        url: url
      };
    }

    // 检查是否存在登录表�?    const hasLoginForm = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const form of forms) {
        const action = form.getAttribute('action') || '';
        const inputs = form.querySelectorAll('input[type="password"], input[name*="password"], input[name*="login"], input[name*="email"], input[name*="username"]');

        if (inputs.length > 0 && (
          action.includes('login') ||
          action.includes('signin') ||
          action.includes('auth')
        )) {
          return true;
        }
      }
      return false;
    });

    if (hasLoginForm) {
      console.log('�?检测到登录表单');
      return {
        isLoggedIn: false,
        reason: 'login_form_detected'
      };
    }

    return {
      isLoggedIn: false,
      reason: 'no_clear_indicators'
    };
  }

  /**
   * 多次重试验证
   */
  async verifyWithRetry(url, verificationOptions = {}) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      console.log(`🔄 验证尝试 ${attempt}/${this.config.retryAttempts}`);

      try {
        const result = await this.verifyLoginStatus(url, verificationOptions);

        if (result.isLoggedIn) {
          console.log('�?登录状态验证成�?);
          return result;
        }

        if (result.reason === 'verification_error') {
          lastError = result.error;
          console.log(`�?验证过程出错，准备重�?..`);

          if (attempt < this.config.retryAttempts) {
            console.log(`⏱️  等待 ${this.config.retryDelay}ms 后重试`);
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          }
        } else {
          // 非验证错误，直接返回结果
          return result;
        }

      } catch (error) {
        lastError = error.message;
        console.log(`�?验证尝试 ${attempt} 失败:`, error.message);

        if (attempt < this.config.retryAttempts) {
          console.log(`⏱️  等待 ${this.config.retryDelay}ms 后重试`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    console.log(`�?所�?${this.config.retryAttempts} 次验证尝试都失败了`);
    return {
      isLoggedIn: false,
      reason: 'all_attempts_failed',
      error: lastError
    };
  }

  /**
   * 获取会话信息
   */
  async getSessionInfo() {
    let browser = null;
    let context = null;

    try {
      console.log('📊 获取会话信息...');

      browser = await chromium.launchPersistentBrowser('./my-playwright-session', {
        headless: false
      });

      context = browser.contexts()[0];

      // 获取cookies
      const cookies = await context.cookies();

      // 创建新页面来获取localStorage
      const page = await context.newPage();
      await page.goto('about:blank');

      const localStorage = await page.evaluate(() => {
        return Object.keys(localStorage).reduce((obj, key) => {
          obj[key] = localStorage.getItem(key);
          return obj;
        }, {});
      });

      await page.close();

      return {
        cookiesCount: cookies.length,
        localStorageCount: Object.keys(localStorage).length,
        cookies: cookies.map(cookie => ({
          name: cookie.name,
          domain: cookie.domain,
          expires: cookie.expires
        })),
        localStorageKeys: Object.keys(localStorage)
      };

    } catch (error) {
      console.error('�?获取会话信息失败:', error.message);
      return {
        error: error.message
      };
    } finally {
      try {
        if (browser) await browser.close();
      } catch (e) {
        console.error('清理资源时出�?', e.message);
      }
    }
  }

  /**
   * 清理会话
   */
  async clearSession() {
    try {
      console.log('🗑�? 清理会话数据...');

      const { rimraf } = await import('rimraf');
      await rimraf('./my-playwright-session');

      console.log('�?会话清理完成');
      return true;
    } catch (error) {
      console.error('�?会话清理失败:', error.message);
      return false;
    }
  }
}

export default SessionVerifier;
