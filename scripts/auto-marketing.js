#!/usr/bin/env node

/**
 * Stigmergy 宣传与 SEO 自动化执行脚本
 */

const fs = require('fs');
const path = require('path');

// 颜色配置
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 工具函数
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log('✓ 创建目录：' + dirPath, 'green');
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  log('✓ 创建文件：' + filePath, 'green');
}

function readFile(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
}

// 任务 1: 优化 GitHub README
function optimizeReadme() {
  log('\n📝 任务 1: 优化 GitHub README...', 'cyan');
  
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readmeContent = readFile(readmePath);
  
  if (!readmeContent) {
    log('⚠ README.md 不存在，跳过', 'yellow');
    return;
  }
  
  // 添加社会证明徽章
  const badges = '\n' +
    '[![Twitter Follow](https://img.shields.io/twitter/follow/stigmergy_cli?style=social)](https://twitter.com/stigmergy_cli)\n' +
    '[![Discord](https://img.shields.io/discord/placeholder?label=Discord&logo=discord)](https://discord.gg/placeholder)\n' +
    '[![npm](https://img.shields.io/npm/dm/stigmergy)](https://www.npmjs.com/package/stigmergy)\n';
  
  // 在第一个徽章后插入新徽章
  const firstBadgeIndex = readmeContent.indexOf('[![License: MIT]');
  if (firstBadgeIndex !== -1) {
    const insertPosition = readmeContent.indexOf(')', firstBadgeIndex) + 1;
    readmeContent = readmeContent.slice(0, insertPosition) + badges + readmeContent.slice(insertPosition);
    
    writeFile(readmePath, readmeContent);
    log('✓ README 已优化，添加社会证明徽章', 'green');
  } else {
    log('⚠ 未找到徽章位置，跳过', 'yellow');
  }
}

// 任务 2: 创建项目落地页
function createLandingPage() {
  log('\n🌐 任务 2: 创建项目落地页...', 'cyan');
  
  const webDir = path.join(__dirname, '..', 'web');
  createDirectory(webDir);
  
  const landingPage = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>Stigmergy CLI - Multi-AI Collaboration Platform</title>\n' +
'    <meta name="description" content="Coordinate 8+ AI CLI tools (Claude, Gemini, Qwen) from one interface. Smart routing, cross-CLI memory, remote control. Open source, 5-min setup.">\n' +
'    <meta name="keywords" content="AI CLI, multi-agent, collaboration, Claude, Gemini, Qwen, open source, developer tools">\n' +
'    <style>\n' +
'        * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }\n' +
'        header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 80px 0; }\n' +
'        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }\n' +
'        h1 { font-size: 3rem; margin-bottom: 20px; }\n' +
'        .cta-button { display: inline-block; background: white; color: #667eea; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; }\n' +
'        .features { padding: 80px 0; }\n' +
'        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }\n' +
'        .feature { padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <header>\n' +
'        <div class="container">\n' +
'            <h1>Stigmergy CLI</h1>\n' +
'            <p style="font-size: 1.5rem; margin-bottom: 40px;">Coordinate 8+ AI Assistants from One Interface</p>\n' +
'            <a href="https://github.com/ptreezh/stigmergy-CLI-Multi-Agents" class="cta-button">Get Started Free</a>\n' +
'        </div>\n' +
'    </header>\n' +
'    <section class="features">\n' +
'        <div class="container">\n' +
'            <h2 style="text-align: center;">Why Choose Stigmergy?</h2>\n' +
'            <div class="features-grid">\n' +
'                <div class="feature"><h3>Smart Routing</h3><p>Auto-selects best AI for each task</p></div>\n' +
'                <div class="feature"><h3>Cross-CLI Memory</h3><p>Shared context between tools</p></div>\n' +
'                <div class="feature"><h3>Remote Control</h3><p>Control from Telegram/Slack/Discord</p></div>\n' +
'                <div class="feature"><h3>12 Languages</h3><p>Global support</p></div>\n' +
'            </div>\n' +
'        </div>\n' +
'    </section>\n' +
'    <footer style="background: #1a202c; color: white; padding: 40px 0; text-align: center;">\n' +
'        <p>Made with ❤️ by the Stigmergy CLI Team</p>\n' +
'    </footer>\n' +
'</body>\n' +
'</html>';

  const landingPagePath = path.join(webDir, 'index.html');
  writeFile(landingPagePath, landingPage);
  
  // 创建部署指南
  const deployGuide = '# 落地页部署指南\n\n' +
'## 快速部署到 Vercel（免费）\n\n' +
'```bash\n' +
'npm install -g vercel\ncd web\nvercel\n```\n\n' +
'## 自定义域名\n\n' +
'推荐域名：stigmergy-cli.dev\n\n' +
'## Google Analytics\n\n' +
'替换 index.html 中的 G-XXXXXXXXXX 为你的跟踪 ID\n';

  const deployGuidePath = path.join(webDir, 'DEPLOY.md');
  writeFile(deployGuidePath, deployGuide);
  
  log('✓ 落地页已创建 (web/index.html)', 'green');
  log('✓ 部署指南已创建 (web/DEPLOY.md)', 'green');
}

// 任务 3: 生成社交媒体帖子
function generateSocialMediaPosts() {
  log('\n📱 任务 3: 生成社交媒体帖子...', 'cyan');
  
  const postsDir = path.join(__dirname, '..', 'docs', 'social-posts');
  createDirectory(postsDir);
  
  // Twitter 线程
  const twitterThread = '# Twitter 发布线程\n\n' +
'## 主线程\n\n' +
'### 推文 1/7\n' +
'🚀 Introducing Stigmergy CLI - Your unified command center for AI assistants!\n\n' +
'Coordinate 8+ AI tools (Claude, Gemini, Qwen) from a single interface.\n\n' +
'✨ Smart routing\n' +
'🧠 Cross-CLI memory\n' +
'🌐 Remote control\n' +
'📦 Unified skills\n\n' +
'Try free: npm install -g stigmergy@beta\n\n' +
'### 推文 2/7\n' +
'The Problem:\n\n' +
'Developers use multiple AI assistants but switching breaks flow.\n\n' +
'### 推文 3/7\n' +
'The Solution:\n\n' +
'Stigmergy coordinates AI tools like a conductor leading an orchestra.\n\n' +
'Inspired by ant colonies (stigmergy)!\n\n' +
'### 推文 4/7\n' +
'Key Features:\n\n' +
'🎯 Smart Routing\n' +
'🧠 Cross-CLI Memory\n' +
'🌐 Remote Control\n' +
'📦 Unified Skills\n' +
'🌍 12 Languages\n' +
'⚡ Pure Node.js\n\n' +
'### 推文 5/7\n' +
'Getting Started:\n\n' +
'npm install -g stigmergy@beta\n' +
'stigmergy setup\n\n' +
'Docs: github.com/ptreezh/stigmergy-CLI-Multi-Agents\n\n' +
'#AI #DeveloperTools #OpenSource';

  writeFile(path.join(postsDir, 'TWITTER_POSTS.md'), twitterThread);
  
  // LinkedIn 帖子
  const linkedinPosts = '# LinkedIn 发布帖子\n\n' +
'## 发布日公告\n\n' +
'🚀 Excited to announce Stigmergy CLI!\n\n' +
'After months of development, we\'re launching a new approach to AI collaboration.\n\n' +
'Key features:\n' +
'✓ Smart Routing\n' +
'✓ Cross-CLI Memory\n' +
'✓ Remote Control\n' +
'✓ 12-Language Support\n\n' +
'Getting Started:\n' +
'npm install -g stigmergy@beta\n\n' +
'#AI #DeveloperTools #OpenSource';

  writeFile(path.join(postsDir, 'LINKEDIN_POSTS.md'), linkedinPosts);
  
  log('✓ Twitter 帖子已生成', 'green');
  log('✓ LinkedIn 帖子已生成', 'green');
}

// 任务 4: 创建博客文章
function createBlogPosts() {
  log('\n📝 任务 4: 创建博客文章...', 'cyan');
  
  const blogDir = path.join(__dirname, '..', 'docs', 'blog');
  createDirectory(blogDir);
  
  const blogPost2 = '# 如何使用 Stigmergy 协调多个 AI 助手\n\n' +
'## 步骤 1: 安装\n\n' +
'```bash\n' +
'npm install -g stigmergy@beta\n' +
'stigmergy setup\n' +
'```\n\n' +
'## 步骤 2: 使用智能路由\n\n' +
'```bash\n' +
'stigmergy call "create REST API with docs and tests"\n' +
'```\n\n' +
'## 步骤 3: 查看结果\n\n' +
'Stigmergy 自动协调多个 AI 完成所有任务！\n';

  writeFile(path.join(blogDir, 'how-to-coordinate-ai.md'), blogPost2);
  
  log('✓ 博客文章已创建', 'green');
}

// 任务 5: 创建示例项目
function createExampleProjects() {
  log('\n💡 任务 5: 创建示例项目...', 'cyan');
  
  const examplesDir = path.join(__dirname, '..', 'examples');
  createDirectory(examplesDir);
  
  // REST API 示例
  const restApiDir = path.join(examplesDir, 'rest-api-demo');
  createDirectory(restApiDir);
  
  const restApiReadme = '# REST API 示例\n\n' +
'## 快速开始\n\n' +
'```bash\n' +
'cd examples/rest-api-demo\n' +
'stigmergy call "complete project setup"\n' +
'```\n\n' +
'## 输出\n\n' +
'- ✅ Express.js 项目结构\n' +
'- ✅ 用户认证模块\n' +
'- ✅ API 文档\n' +
'- ✅ 单元测试\n';

  writeFile(path.join(restApiDir, 'README.md'), restApiReadme);
  
  // 数据分析示例
  const dataDir = path.join(examplesDir, 'data-pipeline');
  createDirectory(dataDir);
  
  const dataReadme = '# 数据分析管道示例\n\n' +
'## 使用方式\n\n' +
'```bash\n' +
'cd examples/data-pipeline\n' +
'stigmergy call "analyze dataset and generate report"\n' +
'```\n';

  writeFile(path.join(dataDir, 'README.md'), dataReadme);
  
  log('✓ REST API 示例已创建', 'green');
  log('✓ 数据分析示例已创建', 'green');
}

// 任务 6: 生成 SEO 元标签
function generateSEOTags() {
  log('\n🔍 任务 6: 生成 SEO 元标签...', 'cyan');
  
  const seoContent = '<!-- SEO Meta Tags -->\n' +
'<title>Stigmergy CLI - Multi-AI Collaboration Platform</title>\n' +
'<meta name="description" content="Coordinate 8+ AI CLI tools from one interface">\n' +
'<meta name="keywords" content="AI CLI, multi-agent, collaboration">\n' +
'<meta property="og:title" content="Stigmergy CLI">\n' +
'<meta property="twitter:card" content="summary_large_image">\n';

  const seoPath = path.join(__dirname, '..', 'docs', 'seo-meta-tags.html');
  writeFile(seoPath, seoContent);
  
  log('✓ SEO 元标签已生成', 'green');
}

// 任务 7: 创建检查清单
function createChecklists() {
  log('\n📋 任务 7: 创建检查清单...', 'cyan');
  
  const checklist = '# 宣传与 SEO 执行检查清单\n\n' +
'## 第 1 周：基础建设\n\n' +
'- [ ] Twitter 账号注册\n' +
'- [ ] LinkedIn 公司页面\n' +
'- [ ] Discord 服务器\n' +
'- [ ] 部署落地页\n' +
'- [ ] 安装 Google Analytics\n\n' +
'## 第 2 周：内容创建\n\n' +
'- [ ] 发布第一篇博客\n' +
'- [ ] 录制演示视频\n' +
'- [ ] 准备 Product Hunt 材料\n\n' +
'## 第 3 周：Product Hunt 发布\n\n' +
'- [ ] Product Hunt 上线\n' +
'- [ ] Hacker News Show HN\n' +
'- [ ] 社交媒体同步宣传\n';

  const checklistPath = path.join(__dirname, '..', 'docs', 'EXECUTION_CHECKLIST.md');
  writeFile(checklistPath, checklist);
  
  log('✓ 执行检查清单已创建', 'green');
}

// 主函数
function main() {
  log('\n========================================', 'bright');
  log('🚀 Stigmergy 宣传与 SEO 自动化执行', 'cyan');
  log('========================================\n', 'bright');
  
  const startTime = Date.now();
  
  try {
    optimizeReadme();
    createLandingPage();
    generateSocialMediaPosts();
    createBlogPosts();
    createExampleProjects();
    generateSEOTags();
    createChecklists();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n========================================', 'bright');
    log('✅ 所有任务完成！', 'green');
    log('========================================', 'bright');
    log('\n⏱️  执行时间：' + duration + '秒\n', 'yellow');
    
    log('\n📂 已创建的文件:', 'cyan');
    log('  - web/index.html (落地页)', 'blue');
    log('  - web/DEPLOY.md (部署指南)', 'blue');
    log('  - docs/social-posts/*.md (社交媒体帖子)', 'blue');
    log('  - docs/blog/*.md (博客文章)', 'blue');
    log('  - examples/*/README.md (示例项目)', 'blue');
    log('  - docs/seo-meta-tags.html (SEO 标签)', 'blue');
    log('  - docs/EXECUTION_CHECKLIST.md (检查清单)', 'blue');
    
    log('\n🎯 下一步:', 'cyan');
    log('  1. 查看 docs/QUICK_START_MARKETING.md', 'blue');
    log('  2. 手动注册社交媒体账号（需要验证码）', 'blue');
    log('  3. 部署落地页：cd web && vercel', 'blue');
    log('  4. 准备 Product Hunt 发布', 'blue');
    
    log('\n⚠️  注意：以下任务需要手动执行:', 'yellow');
    log('   - 社交媒体注册（需要邮箱验证）', 'yellow');
    log('   - Product Hunt 发布（需要创始人账户）', 'yellow');
    log('   - 域名购买（需要支付）', 'yellow');
    log('   - 博客发布（需要平台账户）', 'yellow');
    log('\n');
    
  } catch (error) {
    log('\n❌ 执行出错:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

main();
