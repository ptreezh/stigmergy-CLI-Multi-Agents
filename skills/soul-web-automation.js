/**
 * Soul Web Automation - 网页自动化技能
 *
 * **对齐 OpenClaw 的网页操作能力**
 *
 * 功能：
 * - 浏览器自动化控制
 * - 智能表单填写
 * - 数据抓取和提取
 * - 网页截图
 * - UI 自动化测试
 * - 动态内容交互
 *
 * 借鉴：OpenClaw 的 browser automation + web scraping 技能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const CrossPlatformUtils = require('../src/utils/cross-platform-utils');

/**
 * SoulWebAutomation 技能类
 */
class SoulWebAutomation {
  constructor() {
    this.name = 'soul-web-automation';
    this.description = '强大的网页自动化操作能力';
    this.triggers = [
      'browser', '浏览器',
      'web automation', '网页自动化',
      'scrape', '抓取',
      'screenshot', '截图',
      'form', '表单',
      'click', '点击',
      'navigate', '导航'
    ];

    // 支持的浏览器和工具
    this.browserTools = {
      playwright: {
        enabled: this.checkPlaywright(),
        priority: 1,
        capabilities: ['full', 'screenshot', 'pdf', 'form', 'scraping']
      },
      puppeteer: {
        enabled: this.checkPuppeteer(),
        priority: 2,
        capabilities: ['full', 'screenshot', 'pdf', 'form', 'scraping']
      },
      selenium: {
        enabled: this.checkSelenium(),
        priority: 3,
        capabilities: ['full', 'form', 'testing']
      }
    };

    // 临时目录
    this.tempDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state', 'web-temp');
  }

  /**
   * 判断是否可以处理该任务
   */
  canHandle(task, context) {
    const taskLower = task.toLowerCase();
    return this.triggers.some(trigger => taskLower.includes(trigger));
  }

  /**
   * 执行技能
   */
  async execute(task, context, { memory, eventStream }) {
    console.log('\n🌐 [Soul Web Automation] 开始网页自动化...');

    try {
      // 1. 解析任务
      const parsedTask = this.parseTask(task, context);

      // 2. 选择最佳浏览器工具
      const tool = this.selectBestTool(parsedTask);

      if (!tool) {
        return {
          done: true,
          output: '❌ 未找到可用的浏览器自动化工具\n\n' +
                  '推荐安装：\n' +
                  '  npm install -g playwright\n' +
                  '  # 或\n' +
                  '  npm install -g puppeteer'
        };
      }

      console.log(`  🔧 使用工具: ${tool}`);

      // 3. 执行任务
      const result = await this.executeWebTask(parsedTask, tool);

      // 4. 保存结果
      await this.saveResult(result);

      // 推送事件
      eventStream.push({
        type: 'web_automation_complete',
        data: {
          tool,
          task: parsedTask.type,
          success: result.success
        }
      });

      return {
        done: true,
        output: this.formatOutput(result),
        context: {
          tool,
          resultPath: result.savePath,
          taskType: parsedTask.type
        }
      };

    } catch (error) {
      console.error('❌ Web automation error:', error);
      return {
        done: true,
        output: `⚠️ 网页自动化失败: ${error.message}\n\n` +
                '可能的原因：\n' +
                '  1. 网络连接问题\n' +
                '  2. 目标网站不可访问\n' +
                '  3. 浏览器工具未正确安装\n' +
                '  4. 权限不足'
      };
    }
  }

  /**
   * 解析任务
   */
  parseTask(task, context) {
    const taskLower = task.toLowerCase();

    // 截图任务
    if (taskLower.includes('screenshot') || taskLower.includes('截图')) {
      const urlMatch = task.match(/https?:\/\/[^\s]+/);
      return {
        type: 'screenshot',
        url: urlMatch ? urlMatch[0] : (context.url || null),
        outputPath: context.outputPath || null
      };
    }

    // 表单填写任务
    if (taskLower.includes('form') || taskLower.includes('表单')) {
      return {
        type: 'form',
        url: context.url || null,
        formData: context.formData || {},
        submit: context.submit !== false
      };
    }

    // 数据抓取任务
    if (taskLower.includes('scrape') || taskLower.includes('抓取') || taskLower.includes('爬虫')) {
      return {
        type: 'scrape',
        url: context.url || null,
        selectors: context.selectors || {},
        format: context.format || 'json'
      };
    }

    // 导航任务
    if (taskLower.includes('navigate') || taskLower.includes('导航') || taskLower.includes('goto')) {
      const urlMatch = task.match(/https?:\/\/[^\s]+/);
      return {
        type: 'navigate',
        url: urlMatch ? urlMatch[0] : (context.url || null)
      };
    }

    // 点击任务
    if (taskLower.includes('click') || taskLower.includes('点击')) {
      return {
        type: 'click',
        url: context.url || null,
        selector: context.selector || null
      };
    }

    // 默认：导航和探索
    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    return {
      type: 'explore',
      url: urlMatch ? urlMatch[0] : (context.url || 'https://example.com')
    };
  }

  /**
   * 选择最佳工具
   */
  selectBestTool(parsedTask) {
    // 按优先级检查工具
    for (const [name, config] of Object.entries(this.browserTools)) {
      if (config.enabled) {
        // 检查工具是否支持所需功能
        if (this.toolSupportsTask(config, parsedTask)) {
          return name;
        }
      }
    }
    return null;
  }

  /**
   * 检查工具是否支持任务
   */
  toolSupportsTask(config, task) {
    const requiredCaps = {
      'screenshot': ['screenshot'],
      'form': ['form'],
      'scrape': ['scraping'],
      'navigate': ['full'],
      'click': ['full'],
      'explore': ['full']
    };

    const needed = requiredCaps[task.type] || ['full'];
    return needed.some(cap => config.capabilities.includes(cap));
  }

  /**
   * 执行网页任务
   */
  async executeWebTask(task, tool) {
    await fs.promises.mkdir(this.tempDir, { recursive: true });

    switch (tool) {
      case 'playwright':
        return await this.executeWithPlaywright(task);
      case 'puppeteer':
        return await this.executeWithPuppeteer(task);
      case 'selenium':
        return await this.executeWithSelenium(task);
      default:
        throw new Error('Unsupported tool');
    }
  }

  /**
   * 使用 Playwright 执行
   */
  async executeWithPlaywright(task) {
    try {
      // 动态导入 Playwright
      const { chromium } = require('playwright');

      const browser = await chromium.launch({
        headless: true
      });

      const page = await browser.newPage();

      let result = {
        success: false,
        tool: 'playwright',
        task: task.type
      };

      try {
        switch (task.type) {
          case 'screenshot':
            result = await this.screenshotPlaywright(page, task);
            break;

          case 'form':
            result = await this.fillFormPlaywright(page, task);
            break;

          case 'scrape':
            result = await this.scrapeDataPlaywright(page, task);
            break;

          case 'navigate':
          case 'explore':
            result = await this.navigatePlaywright(page, task);
            break;

          case 'click':
            result = await this.clickPlaywright(page, task);
            break;

          default:
            throw new Error('Unsupported task type');
        }

        result.success = true;

      } finally {
        await browser.close();
      }

      return result;

    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Playwright 未安装。运行: npm install -g playwright');
      }
      throw error;
    }
  }

  /**
   * Playwright 截图
   */
  async screenshotPlaywright(page, task) {
    if (!task.url) {
      throw new Error('需要提供 URL');
    }

    console.log(`  📸 截图: ${task.url}`);

    await page.goto(task.url, { waitUntil: 'networkidle' });

    // 等待页面完全加载
    await page.waitForTimeout(2000);

    // 生成文件名
    const timestamp = Date.now();
    const filename = task.outputPath ||
                     CrossPlatformUtils.buildPath(this.tempDir, `screenshot-${timestamp}.png`);

    await page.screenshot({
      path: filename,
      fullPage: true
    });

    return {
      type: 'screenshot',
      savePath: filename,
      url: task.url,
      size: fs.statSync(filename).size
    };
  }

  /**
   * Playwright 表单填写
   */
  async fillFormPlaywright(page, task) {
    if (!task.url) {
      throw new Error('需要提供 URL');
    }

    console.log(`  📝 填写表单: ${task.url}`);

    await page.goto(task.url, { waitUntil: 'networkidle' });

    // 填写表单数据
    for (const [selector, value] of Object.entries(task.formData)) {
      try {
        await page.fill(selector, value);
        console.log(`    ✓ 填写: ${selector} = ${value}`);
      } catch (error) {
        console.log(`    ⚠️ 跳过: ${selector} (${error.message})`);
      }
    }

    // 如果需要提交
    if (task.submit) {
      await page.press('form', 'Enter');
      await page.waitForTimeout(2000);
    }

    // 截图作为证据
    const timestamp = Date.now();
    const filename = CrossPlatformUtils.buildPath(this.tempDir, `form-${timestamp}.png`);
    await page.screenshot({ path: filename });

    return {
      type: 'form',
      savePath: filename,
      url: task.url,
      fieldsFilled: Object.keys(task.formData).length
    };
  }

  /**
   * Playwright 数据抓取
   */
  async scrapeDataPlaywright(page, task) {
    if (!task.url) {
      throw new Error('需要提供 URL');
    }

    console.log(`  🕷️ 抓取数据: ${task.url}`);

    await page.goto(task.url, { waitUntil: 'networkidle' });

    // 等待动态内容加载
    await page.waitForTimeout(3000);

    // 提取数据
    const data = await page.evaluate((selectors) => {
      const result = {};

      // 提取标题
      if (selectors.title) {
        const titleEl = document.querySelector(selectors.title);
        result.title = titleEl ? titleEl.textContent.trim() : '';
      }

      // 提取所有链接
      const links = Array.from(document.querySelectorAll('a'));
      result.links = links
        .map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }))
        .filter(link => link.href && link.text);

      // 提取图片
      const images = Array.from(document.querySelectorAll('img'));
      result.images = images
        .map(img => ({
          src: img.src,
          alt: img.alt || ''
        }))
        .filter(img => img.src);

      // 提取文本内容
      result.text = document.body.textContent.trim();

      return result;
    }, task.selectors);

    // 保存数据
    const timestamp = Date.now();
    const filename = CrossPlatformUtils.buildPath(this.tempDir, `scraped-${timestamp}.json`);
    await fs.promises.writeFile(filename, JSON.stringify(data, null, 2));

    return {
      type: 'scrape',
      savePath: filename,
      url: task.url,
      data: {
        title: data.title,
        linksCount: data.links.length,
        imagesCount: data.images.length,
        textLength: data.text.length
      }
    };
  }

  /**
   * Playwright 导航
   */
  async navigatePlaywright(page, task) {
    if (!task.url) {
      throw new Error('需要提供 URL');
    }

    console.log(`  🧭 导航到: ${task.url}`);

    await page.goto(task.url, { waitUntil: 'networkidle' });

    // 获取页面信息
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.textContent.substring(0, 500)
      };
    });

    return {
      type: 'navigate',
      url: task.url,
      pageInfo
    };
  }

  /**
   * Playwright 点击
   */
  async clickPlaywright(page, task) {
    if (!task.url) {
      throw new Error('需要提供 URL');
    }

    if (!task.selector) {
      throw new Error('需要提供选择器');
    }

    console.log(`  🖱️ 点击: ${task.url} 上的 ${task.selector}`);

    await page.goto(task.url, { waitUntil: 'networkidle' });

    await page.click(task.selector);

    // 等待导航
    await page.waitForTimeout(2000);

    const currentUrl = page.url();

    return {
      type: 'click',
      url: task.url,
      selector: task.selector,
      navigatedTo: currentUrl
    };
  }

  /**
   * 使用 Puppeteer 执行（备用方案）
   */
  async executeWithPuppeteer(task) {
    try {
      const puppeteer = require('puppeteer');

      const browser = await puppeteer.launch({
        headless: 'new'
      });

      const page = await browser.newPage();

      let result = {
        success: false,
        tool: 'puppeteer',
        task: task.type
      };

      try {
        // 类似 Playwright 的实现
        if (task.type === 'screenshot' && task.url) {
          await page.goto(task.url, { waitUntil: 'networkidle0' });
          const timestamp = Date.now();
          const filename = task.outputPath ||
                           CrossPlatformUtils.buildPath(this.tempDir, `screenshot-${timestamp}.png`);
          await page.screenshot({ path: filename, fullPage: true });
          result = { type: 'screenshot', savePath: filename, url: task.url };
        } else {
          throw new Error('Puppeteer 任务类型实现中...');
        }

        result.success = true;

      } finally {
        await browser.close();
      }

      return result;

    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('Puppeteer 未安装。运行: npm install -g puppeteer');
      }
      throw error;
    }
  }

  /**
   * 使用 Selenium 执行（备用方案）
   */
  async executeWithSelenium(task) {
    // Selenium 需要额外的驱动程序，这里提供基础框架
    throw new Error('Selenium 支持需要额外配置。建议使用 Playwright 或 Puppeteer。');
  }

  /**
   * 检查 Playwright 是否可用
   */
  checkPlaywright() {
    try {
      require('playwright');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查 Puppeteer 是否可用
   */
  checkPuppeteer() {
    try {
      require('puppeteer');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查 Selenium 是否可用
   */
  checkSelenium() {
    // Selenium 需要额外的驱动，暂时返回 false
    return false;
  }

  /**
   * 保存结果
   */
  async saveResult(result) {
    if (!result.savePath) {
      return;
    }

    console.log(`💾 结果已保存: ${result.savePath}`);
  }

  /**
   * 格式化输出
   */
  formatOutput(result) {
    let output = '\n🌐 网页自动化完成\n';
    output += '==================\n\n';

    output += `🔧 使用工具: ${result.tool}\n`;
    output += `📝 任务类型: ${result.type}\n`;
    output += `✅ 状态: ${result.success ? '成功' : '失败'}\n`;

    if (result.savePath) {
      output += `\n💾 结果文件: ${result.savePath}\n`;
    }

    if (result.url) {
      output += `🔗 URL: ${result.url}\n`;
    }

    // 根据任务类型显示特定信息
    switch (result.type) {
      case 'screenshot':
        if (result.size) {
          output += `📊 文件大小: ${(result.size / 1024).toFixed(2)} KB\n`;
        }
        break;

      case 'form':
        if (result.fieldsFilled) {
          output += `📊 填写字段: ${result.fieldsFilled}\n`;
        }
        break;

      case 'scrape':
        if (result.data) {
          output += `\n📊 抓取统计:\n`;
          output += `  标题: ${result.data.title}\n`;
          output += `  链接: ${result.data.linksCount}\n`;
          output += `  图片: ${result.data.imagesCount}\n`;
          output += `  文本: ${result.data.textLength} 字符\n`;
        }
        break;

      case 'navigate':
        if (result.pageInfo) {
          output += `\n📄 页面信息:\n`;
          output += `  标题: ${result.pageInfo.title}\n`;
          output += `  URL: ${result.pageInfo.url}\n`;
        }
        break;

      case 'click':
        if (result.navigatedTo) {
          output += `\n🎯 导航到: ${result.navigatedTo}\n`;
        }
        break;
    }

    output += '\n💡 使用示例:\n';
    output += '  截图: browser screenshot https://example.com\n';
    output += '  抓取: browser scrape https://example.com\n';
    output += '  表单: browser form https://example.com --formData \'{"#email":"test@example.com"}\'\n';

    return output;
  }
}

module.exports = SoulWebAutomation;
