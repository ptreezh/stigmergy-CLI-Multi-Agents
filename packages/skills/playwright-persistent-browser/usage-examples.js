/**
 * Playwright 持久化浏览器 Skill 使用示例
 * 展示各种使用场景和最佳实�? */

import EnhancedTaskRunner from './enhanced-task-runner.js';

class UsageExamples {
  constructor() {
    this.runner = new EnhancedTaskRunner('./enhanced-config.json');
  }

  /**
   * 示例1: GitHub 登录并获取仓库信�?   */
  async example1_GitHubRepos() {
    console.log('📋 示例1: GitHub 登录并获取仓库信�?);

    const getReposTask = async (page, context) => {
      console.log('🔍 获取GitHub仓库信息...');

      try {
        // 导航到用户仓库页�?        await page.goto('https://github.com/settings/repositories', {
          waitUntil: 'networkidle'
        });

        // 等待页面加载
        await page.waitForTimeout(3000);

        // 获取仓库名称
        const repoElements = await page.$$('a[data-hovercard-type="repository"]');
        const repos = [];

        for (const element of repoElements.slice(0, 10)) { // 限制�?0�?          try {
            const repoName = await element.textContent();
            if (repoName && repoName.trim()) {
              repos.push(repoName.trim());
            }
          } catch (e) {
            continue;
          }
        }

        console.log(`📁 找到 ${repos.length} 个仓�?`);
        repos.forEach((repo, index) => {
          console.log(`  ${index + 1}. ${repo}`);
        });

        // 截图保存结果
        await this.runner.takeScreenshot('github-repos.png');

        return {
          success: true,
          repos: repos,
          count: repos.length
        };

      } catch (error) {
        console.error('�?获取仓库信息失败:', error.message);
        await this.runner.takeScreenshot('github-repos-error.png');
        throw error;
      }
    };

    try {
      const result = await this.runner.runTask('https://github.com', getReposTask);
      console.log('�?示例1执行成功:', result);
      return result;
    } catch (error) {
      console.error('�?示例1执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 示例2: 淘宝搜索商品
   */
  async example2_TaobaoSearch() {
    console.log('📋 示例2: 淘宝搜索商品');

    const searchTask = async (page, context) => {
      const keyword = 'iPhone 15';
      console.log(`🔍 在淘宝搜�? ${keyword}`);

      try {
        // 搜索商品
        const searchSelector = '#q';
        await this.runner.waitForElement(searchSelector);
        await this.runner.safeType(searchSelector, keyword);

        const searchButtonSelector = '.btn-search';
        await this.runner.safeClick(searchButtonSelector);

        // 等待搜索结果
        await page.waitForTimeout(5000);

        // 获取搜索结果
        const productSelectors = '.item';
        await page.waitForSelector(productSelectors, { timeout: 15000 });

        const products = await page.evaluate(() => {
          const items = document.querySelectorAll('.item');
          const results = [];

          for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];
            const titleElement = item.querySelector('.title a');
            const priceElement = item.querySelector('.price');
            const shopElement = item.querySelector('.shop');

            if (titleElement && priceElement) {
              results.push({
                title: titleElement.textContent.trim(),
                price: priceElement.textContent.trim(),
                shop: shopElement ? shopElement.textContent.trim() : '未知店铺'
              });
            }
          }

          return results;
        });

        console.log(`🛍�?找到 ${products.length} 个商�?`);
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.title} - ${product.price} (${product.shop})`);
        });

        // 截图保存
        await this.runner.takeScreenshot('taobao-search-results.png');

        return {
          success: true,
          keyword: keyword,
          products: products,
          count: products.length
        };

      } catch (error) {
        console.error('�?搜索失败:', error.message);
        await this.runner.takeScreenshot('taobao-search-error.png');
        throw error;
      }
    };

    try {
      const result = await this.runner.runTask('https://www.taobao.com', searchTask);
      console.log('�?示例2执行成功:', result);
      return result;
    } catch (error) {
      console.error('�?示例2执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 示例3: 知乎获取热门问题
   */
  async example3_ZhihuHotQuestions() {
    console.log('📋 示例3: 知乎获取热门问题');

    const getHotQuestions = async (page, context) => {
      console.log('🔍 获取知乎热门问题...');

      try {
        // 导航到知乎首�?        await page.goto('https://www.zhihu.com/hot', {
          waitUntil: 'networkidle'
        });

        // 等待内容加载
        await page.waitForTimeout(3000);

        // 获取热门问题
        const questions = await page.evaluate(() => {
          const items = document.querySelectorAll('.HotItem');
          const results = [];

          for (let i = 0; i < Math.min(items.length, 10); i++) {
            const item = items[i];
            const titleElement = item.querySelector('.HotItem-content .HotItem-title');
            const metricsElement = item.querySelector('.HotItem-metrics');

            if (titleElement) {
              results.push({
                title: titleElement.textContent.trim(),
                metrics: metricsElement ? metricsElement.textContent.trim() : '',
                rank: i + 1
              });
            }
          }

          return results;
        });

        console.log(`🔥 获取�?${questions.length} 个热门问�?`);
        questions.forEach((q) => {
          console.log(`  ${q.rank}. ${q.title} (${q.metrics})`);
        });

        // 截图保存
        await this.runner.takeScreenshot('zhihu-hot-questions.png');

        return {
          success: true,
          questions: questions,
          count: questions.length
        };

      } catch (error) {
        console.error('�?获取热门问题失败:', error.message);
        await this.runner.takeScreenshot('zhihu-hot-questions-error.png');
        throw error;
      }
    };

    try {
      const result = await this.runner.runTask('https://www.zhihu.com', getHotQuestions);
      console.log('�?示例3执行成功:', result);
      return result;
    } catch (error) {
      console.error('�?示例3执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 示例4: 多站点批量任�?   */
  async example4_MultipleSites() {
    console.log('📋 示例4: 多站点批量任�?);

    const tasks = [
      {
        name: 'GitHub 检�?,
        url: 'https://github.com',
        function: async (page, context) => {
          await page.waitForTimeout(2000);
          const isLoggedIn = !!(await page.$('[data-testid="user-menu"]'));
          return { site: 'GitHub', loggedIn: isLoggedIn };
        }
      },
      {
        name: '知乎 检�?,
        url: 'https://www.zhihu.com',
        function: async (page, context) => {
          await page.waitForTimeout(2000);
          const isLoggedIn = !!(await page.$('.AppHeader-profile'));
          return { site: '知乎', loggedIn: isLoggedIn };
        }
      },
      {
        name: '哔哩哔哩 检�?,
        url: 'https://www.bilibili.com',
        function: async (page, context) => {
          await page.waitForTimeout(2000);
          const isLoggedIn = !!(await page.$('.nav-user-info'));
          return { site: '哔哩哔哩', loggedIn: isLoggedIn };
        }
      }
    ];

    try {
      const results = await this.runner.runMultipleTasks(tasks, {
        taskInterval: 5000,
        stopOnError: false
      });

      console.log('📊 批量任务结果:');
      results.forEach(result => {
        const status = result.success ? '�? : '�?;
        console.log(`  ${status} ${result.task}:`, result.success ? result.result : result.error);
      });

      return {
        success: true,
        results: results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      };

    } catch (error) {
      console.error('�?批量任务执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 示例5: 自定义登录处�?   */
  async example5_CustomLoginHandling() {
    console.log('📋 示例5: 自定义登录处�?);

    const customTask = async (page, context) => {
      console.log('🔧 执行自定义任�?..');

      try {
        // 自定义登录成功后的操�?        await page.goto('https://github.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // 检查是否真的登录了
        const userMenu = await page.$('[data-testid="user-menu"]');
        if (!userMenu) {
          throw new Error('登录验证失败');
        }

        // 获取用户信息
        await userMenu.click();
        await page.waitForTimeout(1000);

        const userName = await page.evaluate(() => {
          const nameElement = document.querySelector('.dropdown-item strong');
          return nameElement ? nameElement.textContent.trim() : '未知用户';
        });

        console.log(`👤 当前登录用户: ${userName}`);

        // 执行一些操作，比如访问设置页面
        await page.goto('https://github.com/settings/profile');
        await page.waitForTimeout(2000);

        const profileName = await page.$('.user-profile-name');
        const displayName = profileName ? await profileName.textContent() : '未设�?;

        console.log(`📝 显示名称: ${displayName.trim()}`);

        // 截图保存
        await this.runner.takeScreenshot('custom-task-result.png');

        return {
          success: true,
          userName: userName,
          displayName: displayName.trim()
        };

      } catch (error) {
        console.error('�?自定义任务失�?', error.message);
        await this.runner.takeScreenshot('custom-task-error.png');
        throw error;
      }
    };

    const options = {
      onLoginRequired: async () => {
        console.log('🔐 检测到需要登录，准备登录流程...');
      },
      onLoginSuccess: async (loginResult) => {
        console.log('🎉 登录成功!');
      },
      onTaskComplete: async (result) => {
        console.log('🏁 任务完成:', result);
      }
    };

    try {
      const result = await this.runner.runTask('https://github.com', customTask, options);
      console.log('�?示例5执行成功:', result);
      return result;
    } catch (error) {
      console.error('�?示例5执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行所有示�?   */
  async runAllExamples() {
    console.log('🚀 开始运行所有示�?..\n');

    const examples = [
      { name: 'GitHub仓库获取', func: () => this.example1_GitHubRepos() },
      { name: '淘宝商品搜索', func: () => this.example2_TaobaoSearch() },
      { name: '知乎热门问题', func: () => this.example3_ZhihuHotQuestions() },
      { name: '多站点批量任�?, func: () => this.example4_MultipleSites() },
      { name: '自定义登录处�?, func: () => this.example5_CustomLoginHandling() }
    ];

    const results = [];

    for (const example of examples) {
      console.log(`\n📋 开始执�? ${example.name}`);
      try {
        const result = await example.func();
        results.push({
          name: example.name,
          success: true,
          result: result
        });
        console.log(`�?${example.name} 执行成功`);
      } catch (error) {
        results.push({
          name: example.name,
          success: false,
          error: error.message
        });
        console.error(`�?${example.name} 执行失败:`, error.message);
      }

      // 示例之间的间�?      if (examples.indexOf(example) < examples.length - 1) {
        console.log('⏱️  等待 5 秒后执行下一个示�?..\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('\n📊 所有示例执行完�?');
    console.log('总结:');
    results.forEach(result => {
      const status = result.success ? '�? : '�?;
      console.log(`  ${status} ${result.name}`);
    });

    return results;
  }

  /**
   * 清理资源
   */
  async cleanup() {
    await this.runner.cleanup();
  }
}

// 如果直接运行此脚本，执行所有示�?if (import.meta.url === `file://${process.argv[1]}`) {
  const examples = new UsageExamples();

  examples.runAllExamples()
    .then(results => {
      console.log('\n🎉 所有示例执行完�?');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n�?示例执行失败:', error.message);
      process.exit(1);
    });
}

export default UsageExamples;
