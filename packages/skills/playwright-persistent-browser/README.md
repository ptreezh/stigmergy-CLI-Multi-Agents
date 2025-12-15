# Playwright 持久化浏览器上下文

这是一个基于Playwright的持久化浏览器上下文工具集，支持保存和复用浏览器登录状态。

## 功能特性

- ✅ 持久化浏览器会话（Cookie、LocalStorage等）
- ✅ 自动登录状态检测
- ✅ 通用任务模板
- ✅ 配置化管理
- ✅ 支持手动登录流程

## 安装依赖

```bash
npm install
npm run install-browsers
```

## 快速开始

### 1. 首次运行（播种阶段）

```bash
npm start
```

这将：
1. 启动浏览器并访问GitHub
2. 检测登录状态
3. 如果未登录，等待手动登录
4. 登录完成后自动保存会话

### 2. 后续运行（复用阶段）

```bash
npm start
```

这将：
1. 加载已保存的会话
2. 直接以登录状态运行
3. 执行任务并更新会话

## 文件说明

- `my-launcher.js` - 浏览器启动器，封装了持久化上下文逻辑
- `run-task.js` - 主任务脚本，演示GitHub登录检查
- `task-template.js` - 通用任务模板，可用于自定义任务
- `config.json` - 配置文件，包含站点和浏览器设置
- `package.json` - 项目依赖管理

## 使用自定义任务

```javascript
import { runTask, checkLoginStatus } from './task-template.js';

// 自定义任务示例
runTask(async (page) => {
  await page.goto('https://your-target-site.com');

  // 检查登录状态
  const isLoggedIn = await checkLoginStatus(page, '.user-avatar');

  if (!isLoggedIn) {
    console.log('需要登录...');
    // 等待手动登录或执行自动登录逻辑
  }

  // 执行你的任务逻辑
  await page.click('.some-button');
  await page.waitForSelector('.result');
});
```

## 配置说明

编辑 `config.json` 来自定义：

- `session.path` - 会话存储路径
- `browser` - 浏览器启动参数
- `sites` - 站点配置（URL、登录选择器等）
- `timeouts` - 各种超时设置

## 会话管理

- 会话数据存储在 `my-playwright-session` 目录
- 包含Cookie、LocalStorage、浏览历史等
- 同一时间只能有一个进程使用会话
- 使用 `npm run clean` 清理会话

## 注意事项

⚠️ **重要**：
- 会话文件夹与本地Chrome用户数据完全独立
- 浏览器配置文件在同一时间只能被一个进程使用
- 不适用于自动化测试（会污染测试环境）
- 适合自动化脚本和爬虫场景

## 故障排除

1. **浏览器启动失败**：运行 `npm run install-browsers`
2. **会话被锁定**：检查是否有其他进程在使用，或重启系统
3. **登录状态丢失**：删除 `my-playwright-session` 目录重新登录

## API 参考

### launchMyDefaultBrowser(options)
启动默认持久化浏览器

### launchHeadlessPersistentBrowser(options)
启动无头模式持久化浏览器

### runTask(taskFunction, options)
执行通用任务

### checkLoginStatus(page, selector, timeout)
检查登录状态

### waitForManualLogin(page, message)
等待用户手动登录