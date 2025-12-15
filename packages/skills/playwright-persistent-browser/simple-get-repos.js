// simple-get-repos.js - 简化版本，直接使用非持久化浏览�?import { chromium } from 'playwright';

(async () => {
  try {
    console.log('正在启动浏览�?..');

    // 使用非持久化浏览器，但导入已有的cookies
    const browser = await chromium.launch({
      headless: false,  // 非无头模�?      slowMo: 100,
      args: [
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();

    // 如果有保存的cookies文件，尝试加�?    try {
      const fs = await import('fs');
      if (fs.existsSync('./cookies.json')) {
        const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf8'));
        await context.addCookies(cookies);
        console.log('�?已加载保存的cookies');
      }
    } catch (e) {
      console.log('未找到或加载cookies失败，需要重新登�?);
    }

    console.log('正在访问 GitHub...');
    await page.goto('https://github.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 检查登录状�?    let isLoggedIn = false;

    // 方法1: 检查是否有登录相关的元�?    try {
      const loginIndicators = [
        'button[aria-label="View profile and more"]',
        '[data-test-selector="profile-dropdown"]',
        'meta[name="user-login"]'
      ];

      for (const selector of loginIndicators) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            isLoggedIn = true;
            console.log(`�?检测到登录状�?(${selector})`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.log('登录检测失�?', e.message);
    }

    // 方法2: 检查页面内�?    if (!isLoggedIn) {
      const pageContent = await page.content();
      if (pageContent.includes('New repository') ||
          pageContent.includes('Your repositories') ||
          pageContent.includes('Pull requests') ||
          !pageContent.includes('Sign in')) {
        isLoggedIn = true;
        console.log('�?检测到登录状�?(页面内容分析)');
      }
    }

    if (!isLoggedIn) {
      console.log('�?未登录，请在浏览器中手动登录...');
      console.log('登录完成后，按回车键继续...');

      // 等待用户输入
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });

      // 保存cookies供下次使�?      try {
        const cookies = await context.cookies();
        const fs = await import('fs');
        fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
        console.log('�?已保存登录状�?);
      } catch (e) {
        console.log('保存cookies失败:', e.message);
      }
    }

    console.log('正在获取仓库列表...');

    // 获取用户�?    let username = '';
    try {
      const metaTag = await page.locator('meta[name="user-login"]').first();
      if (await metaTag.isVisible()) {
        username = await metaTag.getAttribute('content');
      }
    } catch (e) {
      // 尝试其他方法
      try {
        const avatarButton = await page.locator('button[aria-label="View profile and more"]').first();
        if (await avatarButton.isVisible()) {
          const href = await avatarButton.getAttribute('href');
          username = href ? href.replace('/', '') : '';
        }
      } catch (e2) {
        console.log('无法获取用户�?);
      }
    }

    console.log(`当前用户: ${username || '未知'}`);

    // 访问仓库页面
    let reposPageUrl = '';
    if (username) {
      reposPageUrl = `https://github.com/${username}?tab=repositories`;
    } else {
      reposPageUrl = 'https://github.com/settings/repositories';
    }

    console.log(`正在访问仓库页面: ${reposPageUrl}`);
    await page.goto(reposPageUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 获取仓库列表
    const repositories = [];

    // 尝试多种选择�?    const repoSelectors = [
      'a[itemprop="name codeRepository"]',
      '.js-repo-list a',
      '[data-testid="repository-list"] a',
      '.repo-list-item a',
      'a[href*="/"][href$=""]'
    ];

    for (const selector of repoSelectors) {
      try {
        const repoElements = await page.locator(selector).all();
        if (repoElements.length > 0) {
          console.log(`使用选择�?"${selector}" 找到 ${repoElements.length} 个链接`);

          for (const element of repoElements.slice(0, 50)) {
            try {
              const href = await element.getAttribute('href');
              const text = await element.textContent();

              if (href && href.includes('/') && !href.includes('settings') &&
                  !href.includes('new') && !href.includes('login') && !href.includes('signup')) {

                const cleanHref = href.startsWith('http') ? new URL(href).pathname : href;
                const repoName = text ? text.trim() : cleanHref.split('/').pop();

                if (repoName && repoName.length > 0 && repoName !== 'GitHub') {
                  repositories.push({
                    name: repoName,
                    url: href.startsWith('http') ? href : `https://github.com${cleanHref}`,
                    fullName: cleanHref.replace(/^\//, '')
                  });
                }
              }
            } catch (e) {
              continue;
            }
          }

          if (repositories.length > 0) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // 输出结果
    if (repositories.length > 0) {
      console.log('\n📋 您的GitHub仓库列表�?);
      console.log('=====================================');

      // 去重并排�?      const uniqueRepos = Array.from(
        new Map(repositories.map(repo => [repo.fullName, repo])).values()
      ).sort((a, b) => a.name.localeCompare(b.name));

      uniqueRepos.forEach((repo, index) => {
        console.log(`${index + 1}. ${repo.name}`);
        console.log(`   完整名称: ${repo.fullName}`);
        console.log(`   链接: ${repo.url}`);
        console.log('');
      });

      console.log(`\n总共找到 ${uniqueRepos.length} 个仓库`);
    } else {
      console.log('�?未能找到仓库信息');

      const pageTitle = await page.title();
      const currentUrl = page.url();
      console.log(`当前页面标题: ${pageTitle}`);
      console.log(`当前页面URL: ${currentUrl}`);

      console.log('\n调试信息：当前页面的主要链接�?);
      const allLinks = await page.locator('a[href*="/"]').all();
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        try {
          const href = await allLinks[i].getAttribute('href');
          const text = await allLinks[i].textContent();
          console.log(`- ${text?.trim() || '无文�?}: ${href}`);
        } catch (e) {
          continue;
        }
      }
    }

    console.log('\n按回车键关闭浏览�?..');
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    await browser.close();
    console.log('浏览器已关闭�?);

  } catch (error) {
    console.error('执行过程中发生错�?', error);
    process.exit(1);
  }
})();
