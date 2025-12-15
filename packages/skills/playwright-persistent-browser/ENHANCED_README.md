# Playwright 持久化浏览器 Skill (增强版)

这是一个为 Claude Code 创建的增强版 Playwright 持久化浏览器 Skill，提供完整的网页自动化解决方案，包括智能登录检测、会话管理和任务执行。

## ✨ 主要功能

- 🚀 **智能登录处理** - 自动检测登录状态，处理手动登录流程
- 💾 **会话持久化** - 保存和复用浏览器会话（Cookie、LocalStorage等）
- 🔄 **自动重试验证** - 登录后自动重启浏览器并验证状态
- 🌐 **多站点支持** - 预配置主流网站的选择器和检测规则
- 📸 **截图功能** - 自动截图保存关键状态
- 🛡️ **安全可靠** - 禁用无头模式，必须显示浏览器界面
- 🎯 **任务管理** - 支持单任务和批量任务执行

## 📁 文件结构

```
playwright-persistent-browser/
├── SKILL.md                     # Claude Code Skill 定义文件
├── enhanced-config.json         # 增强配置文件
├── requirements.txt             # 依赖文件
├── ENHANCED_README.md          # 本文档
├── package.json                # Node.js 项目配置
├── config.json                 # 原始配置文件
├── enhanced-task-runner.js     # 增强任务执行器
├── login-handler.js            # 登录处理器
├── session-verifier.js         # 会话验证器
├── usage-examples.js           # 使用示例
├── my-launcher.js              # 浏览器启动器
├── run-task.js                 # 原始任务脚本
├── task-template.js            # 任务模板
├── get-repos.js               # GitHub 仓库获取示例
├── simple-get-repos.js        # 简化版仓库获取
├── my-playwright-session/      # 会话数据目录
├── examples/                  # 示例目录
└── templates/                 # 模板文件目录
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd C:\Users\admin\.claude\skills\playwright-persistent-browser
npm install
npm run install-browsers
```

### 2. 在 Claude Code 中使用

直接向 Claude 发出请求：

```
请帮我访问GitHub，检查登录状态，如果需要登录请等待我手动登录，然后获取我的仓库列表
```

```
请帮我访问淘宝，搜索"iPhone 15"并获取前5个商品信息
```

## 📖 使用方法

### 基本用法

1. **简单任务执行**：
   ```
   请访问 [网站URL] 并执行 [具体任务]
   ```

2. **登录相关任务**：
   ```
   请访问 [需要登录的网站]，处理登录流程，然后执行 [任务]
   ```

3. **多站点批量任务**：
   ```
   请依次访问以下网站：[网站1, 网站2, 网站3]，检查每个网站的登录状态
   ```

### 编程接口使用

```javascript
import EnhancedTaskRunner from './enhanced-task-runner.js';

const runner = new EnhancedTaskRunner();

// 定义任务函数
const myTask = async (page, context) => {
  await page.goto('https://github.com');
  await page.waitForTimeout(2000);

  const isLoggedIn = !!(await page.$('[data-testid="user-menu"]'));
  return { loggedIn: isLoggedIn };
};

// 执行任务
const result = await runner.runTask('https://github.com', myTask);
console.log('任务结果:', result);
```

## 🔧 配置说明

### 增强配置 (enhanced-config.json)

主要配置项：

```json
{
  "browser": {
    "headless": false,        // 必须为false，显示浏览器界面
    "viewport": { "width": 1280, "height": 720 }
  },
  "login": {
    "timeout": 300000,       // 登录超时时间 (5分钟)
    "manualLoginTimeout": 300000  // 手动登录等待时间
  },
  "sites": {
    "github.com": {
      "loggedInSelectors": ["[data-testid=\"user-menu\"]"],
      "notLoggedInSelectors": ["a[href*=\"/login\"]"]
    }
  }
}
```

### 支持的网站

当前预配置了以下主流网站：

- **GitHub** (github.com)
- **淘宝** (taobao.com)
- **京东** (jd.com)
- **知乎** (zhihu.com)
- **哔哩哔哩** (bilibili.com)
- **微博** (weibo.com)
- **抖音** (douyin.com)

## 🎯 使用示例

### 示例1: GitHub 仓库获取

```javascript
// 运行示例
node usage-examples.js
```

或者直接调用：

```javascript
import UsageExamples from './usage-examples.js';
const examples = new UsageExamples();
await examples.example1_GitHubRepos();
```

### 示例2: 淘宝商品搜索

```javascript
await examples.example2_TaobaoSearch();
```

### 示例3: 批量任务执行

```javascript
await examples.example4_MultipleSites();
```

## 🔍 登录检测机制

Skill 使用多重检测机制：

1. **URL模式检测** - 检查是否被重定向到登录页面
2. **选择器检测** - 查找登录/未登录的特征元素
3. **通用检测** - 检查常见的登录相关标识
4. **自定义检测** - 支持自定义验证逻辑

## 🛠️ 高级功能

### 自定义登录处理

```javascript
const options = {
  onLoginRequired: async () => {
    console.log('需要登录...');
  },
  onLoginSuccess: async (result) => {
    console.log('登录成功!');
  }
};

await runner.runTask(url, taskFunction, options);
```

### 截图功能

```javascript
// 手动截图
await runner.takeScreenshot('my-screenshot.png');

// 配置自动截图
const config = {
  screenshots: {
    enabled: true,
    onError: true,
    onLogin: true
  }
};
```

### 会话管理

```javascript
// 获取会话信息
const sessionInfo = await runner.getSessionInfo();

// 清理会话
await runner.clearSession();
```

## ⚠️ 重要限制

1. **禁止使用无头浏览器** - 必须显示浏览器界面
2. **会话文件独占** - 同一时间只能有一个进程使用会话
3. **手动登录依赖** - 某些网站需要手动完成登录
4. **浏览器依赖** - 需要安装 Playwright 浏览器

## 🔧 故障排除

### 常见问题

1. **浏览器启动失败**
   ```bash
   npm run install-browsers
   ```

2. **会话被锁定**
   - 检查其他进程
   - 重启系统
   - 删除 `my-playwright-session` 目录

3. **登录状态丢失**
   ```bash
   rm -rf ./my-playwright-session
   ```

4. **权限问题**
   - 确保对目录有写权限
   - 检查文件权限设置

### 调试模式

```javascript
// 启用详细日志
const runner = new EnhancedTaskRunner();
runner.config.logging.level = 'debug';
```

## 📊 性能优化

1. **合理设置超时时间** - 避免过长的等待
2. **使用选择器优化** - 提高元素查找效率
3. **批量任务间隔** - 避免请求过于频繁
4. **会话复用** - 减少重复登录

## 🔒 安全注意事项

1. **会话数据保护** - 包含敏感信息，不要共享
2. **定期清理会话** - 避免过期数据积累
3. **网络安全** - 在安全网络环境中使用
4. **账号安全** - 使用测试账号进行实验

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个 Skill：

1. 添加新的网站配置
2. 优化登录检测逻辑
3. 增加更多示例
4. 改进错误处理

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🆘 获取帮助

如果遇到问题：

1. 查看本文档的故障排除部分
2. 检查 `examples/` 目录中的示例
3. 查看控制台输出的详细日志
4. 提交 Issue 寻求帮助

---

**注意**: 这个 Skill 专为 Claude Code 设计，请在 Claude Code 环境中使用。