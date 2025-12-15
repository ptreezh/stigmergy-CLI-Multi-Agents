// get-repos.js - 改进的脚本，用于获取GitHub仓库列表
import { launchMyDefaultBrowser } from './my-launcher.js';

(async () => {
  try {
    console.log('正在启动浏览�?..');

    // 1. 启动浏览�?    const context = await launchMyDefaultBrowser();
    const page = await context.newPage();

    // 2. 访问GitHub
    console.log('正在访问 GitHub...');
    await page.goto('https://github.com');
    await page.waitForLoadState('networkidle');

    // 3. 等待页面完全加载
    await page.waitForTimeout(3000);

    // 4. 多种方式检测登录状�?    let isLoggedIn = false;

    // 方法1: 检查头像按�?    try {
      const avatarButton = await page.locator('button[aria-label="View profile and more"]').first();
      if (await avatarButton.isVisible({ timeout: 2000 })) {
        isLoggedIn = true;
        console.log('�?检测到登录状�?(头像按钮)');
      }
    } catch (e) {
      console.log('方法1失败:', e.message);
    }

    // 方法2: 检查用户菜�?    if (!isLoggedIn) {
      try {
        const userMenu = await page.locator('[data-test-selector="profile-dropdown"]').first();
        if (await userMenu.isVisible({ timeout: 2000 })) {
          isLoggedIn = true;
          console.log('�?检测到登录状�?(用户菜单)');
        }
      } catch (e) {
        console.log('方法2失败:', e.message);
      }
    }

    // 方法3: 检查是否显�?Sign in"按钮
    if (!isLoggedIn) {
      try {
        const signInButton = await page.locator('a[href="/login"]').first();
        const isSignInVisible = await signInButton.isVisible({ timeout: 2000 });
        if (!isSignInVisible) {
          isLoggedIn = true;
          console.log('�?检测到登录状�?(无Sign in按钮)');
        }
      } catch (e) {
        console.log('方法3失败:', e.message);
      }
    }

    // 方法4: 检查页面内�?    if (!isLoggedIn) {
      try {
        const pageContent = await page.content();
        if (pageContent.includes('New repository') ||
            pageContent.includes('Your repositories') ||
            pageContent.includes('Pull requests')) {
          isLoggedIn = true;
          console.log('�?检测到登录状�?(页面内容分析)');
        }
      } catch (e) {
        console.log('方法4失败:', e.message);
      }
    }

    if (!isLoggedIn) {
      console.log('�?未能检测到登录状态，可能需要重新登�?);
      console.log('>>> 请在浏览器中确认登录状�?..');
      await page.pause();
    } else {
      console.log('�?已确认登录状态，正在获取仓库列表...');

      // 5. 获取用户�?      let username = '';
      try {
        // 尝试多种方式获取用户�?        const usernameSelectors = [
          'button[aria-label="View profile and more"]',
          '[data-test-selector="profile-dropdown"]',
          '.Header-link--profile',
          'meta[name="user-login"]'
        ];

        for (const selector of usernameSelectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              if (selector === 'meta[name="user-login"]') {
                username = await element.getAttribute('content');
              } else {
                const href = await element.getAttribute('href');
                username = href ? href.replace('/', '') : '';
              }
              if (username) {
                console.log(`�?获取到用户名: ${username}`);
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        console.log('获取用户名失败，将访问通用仓库页面');
      }

      // 6. 访问仓库页面
      try {
        if (username) {
          await page.goto(`https://github.com/${username}?tab=repositories`);
          console.log(`正在访问 ${username} 的仓库页�?..`);
        } else {
          // 如果获取不到用户名，访问通用仓库页面
          await page.goto('https://github.com/settings/repositories');
          console.log('正在访问仓库设置页面...');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 7. 获取仓库列表
        const repositories = [];

        // 尝试多种选择器获取仓�?        const repoSelectors = [
          'a[itemprop="name codeRepository"]',
          '.js-repo-list a',
          '[data-testid="repository-list"] a',
          'a[href*="/"][href$=""]', // 通用仓库链接
          '.repo-list-item a'
        ];

        for (const selector of repoSelectors) {
          try {
            const repoElements = await page.locator(selector).all();
            if (repoElements.length > 0) {
              console.log(`使用选择�?"${selector}" 找到 ${repoElements.length} 个仓库链接`);

              for (const element of repoElements.slice(0, 20)) { // 限制�?0�?                try {
                  const href = await element.getAttribute('href');
                  const text = await element.textContent();

                  if (href && href.includes('/') && !href.includes('settings') && !href.includes('new')) {
                    const repoName = text ? text.trim() : href.split('/').pop();
                    if (repoName && repoName.length > 0) {
                      repositories.push({
                        name: repoName,
                        url: `https://github.com${href}`,
                        fullName: href.replace(/^\//, '')
                      });
                    }
                  }
                } catch (e) {
                  continue;
                }
              }

              if (repositories.length > 0) {
                break; // 找到仓库就停止尝试其他选择�?              }
            }
          } catch (e) {
            continue;
          }
        }

        // 8. 输出结果
        if (repositories.length > 0) {
          console.log('\n📋 您的仓库列表�?);
          console.log('=====================================');
          repositories.forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.name}`);
            console.log(`   完整名称: ${repo.fullName}`);
            console.log(`   链接: ${repo.url}`);
            console.log('');
          });
          console.log(`总共找到 ${repositories.length} 个仓库`);
        } else {
          console.log('�?未能找到仓库信息');

          // 输出当前页面信息用于调试
          const pageTitle = await page.title();
          const currentUrl = page.url();
          console.log(`当前页面标题: ${pageTitle}`);
          console.log(`当前页面URL: ${currentUrl}`);
        }

      } catch (e) {
        console.error('访问仓库页面时出�?', e.message);
      }
    }

    console.log('\n脚本执行完毕�?秒后自动关闭...');
    await page.waitForTimeout(3000);

    // 9. 关闭浏览器并保存会话
    await context.close();
    console.log('浏览器已关闭，会话已保存�?);

  } catch (error) {
    console.error('执行过程中发生错�?', error);
    process.exit(1);
  }
})();
