# AI CLI Unified Deployment System

基于 Node.js 的 AI CLI 统一集成系统部署工具，替代 Python 版本，提供跨平台自动扫描和远程更新功能。

## 功能特性

### 🔍 智能扫描
- 自动检测本地安装的 8 个 AI CLI 工具
- 跨平台支持 (Windows, macOS, Linux)
- 版本识别和安装路径检测

### 🚀 一键部署
- 自动配置全局目录结构
- CLI 工具原生集成配置
- 跨 CLI 调用系统设置

### 🔄 远程更新
- GitHub 集成
- 版本检查和自动更新
- 回滚支持

### 🏗️ 项目协作
- 项目宪法生成
- 任务管理系统初始化
- AI CLI 协同功能

## 安装

### 从源码安装

```bash
# 克隆项目
git clone https://github.com/ai-cli-unified/smart-cli-router.git
cd smart-cli-router/deployment

# 安装依赖
npm install

# 全局安装
npm run install-global
```

### 直接安装

```bash
npm install -g ai-cli-unified-deployer
```

## 使用方法

### 扫描 CLI 工具

```bash
ai-cli-deploy scan
```

扫描结果示例：
```
🔍 Scanning for AI CLI tools...

✅ Available CLI Tools (5):
  • claude: Claude CLI version 1.0.0
  • gemini: Gemini CLI version 2.1.0
  • codex: Codex CLI version 1.5.0
  • qwencode: QwenCode CLI version 3.0.0
  • codebuddy: CodeBuddy CLI version 1.2.0

❌ Unavailable CLI Tools (3):
  • copilot: Not installed or not in PATH
  • iflow: Not installed or not in PATH
  • qoder: Not installed or not in PATH

Summary: 5/8 CLI tools detected
```

### 部署系统

```bash
# 基础部署
ai-cli-deploy deploy

# 强制覆盖现有配置
ai-cli-deploy deploy --force

# 安装到全局位置
ai-cli-deploy deploy --global
```

### 检查部署状态

```bash
ai-cli-deploy status
```

状态输出示例：
```
📊 AI CLI Integration System Status
──────────────────────────────────────────────────
Version: 1.0.0
Platform: win32
Installation Date: 11/24/2024
Collaboration: Enabled

CLI Tools Status:
  ✅ claude
  ✅ gemini
  ✅ codex
  ✅ qwencode
  ✅ codebuddy
  ❌ copilot
  ❌ iflow
  ❌ qoder
```

### 更新系统

```bash
# 从默认仓库更新
ai-cli-deploy update

# 从指定仓库更新
ai-cli-deploy update --remote https://api.github.com/repos/your-repo/releases/latest
```

### 初始化项目协作

```bash
# 在项目目录下运行
ai-cli-deploy init-project
```

这将创建：
- `PROJECT_CONSTITUTION.json` - 项目宪法
- `TASKS.json` - 任务管理
- `PROJECT_STATE.json` - 项目状态

## 支持的 CLI 工具

| 工具 | 检测命令 | 配置方法 | 集成状态 |
|------|----------|----------|----------|
| Claude | `claude --version` | Hooks 系统 | ✅ 完全支持 |
| Gemini | `gemini --version` | Extension 系统 | ✅ 完全支持 |
| Codex | `codex --version` | 斜杠命令 + MCP | ✅ 完全支持 |
| QwenCode | `qwencode --version` | 类继承 | ✅ 完全支持 |
| CodeBuddy | `codebuddy --version` | Skills Hooks | ✅ 完全支持 |
| Copilot | `gh copilot --version` | MCP | ✅ 完全支持 |
| iFlow | `iflow --version` | Workflows | ✅ 完全支持 |
| Qoder | `qoder --version` | 通知钩子 | ✅ 完全支持 |

## 配置文件位置

### 全局配置
- Windows: `%USERPROFILE%\.config\ai-cli-unified\`
- macOS/Linux: `~/.config/ai-cli-unified/`

### CLI 专用配置
- Claude: `~/.config/claude/hooks.json`
- Gemini: `~/.config/germini/extensions.json`
- 其他工具: `~/.config/ai-cli-unified/adapters/{tool}/`

## 测试

运行测试套件：

```bash
npm test
# 或
node test.js
```

测试覆盖：
- Node.js 版本兼容性
- 依赖检查
- 脚本执行
- 命令功能
- 配置创建

## 开发

### 项目结构

```
deployment/
├── package.json          # 项目配置
├── deploy.js             # 主部署脚本
├── test.js               # 测试套件
└── README.md             # 文档
```

### 添加新的 CLI 工具支持

1. 在 `deploy.js` 的 `cliTools` 数组中添加工具名称
2. 在 `detectionPatterns` 中定义检测模式
3. 在 `deploySingleCLI` 中添加部署逻辑
4. 添加相应测试

## 故障排除

### 常见问题

**Q: 扫描不到某个 CLI 工具？**
A: 确保工具已安装并在 PATH 中，或检查其配置目录是否存在

**Q: 部署失败？**
A: 检查权限设置，确保有写入配置目录的权限

**Q: 更新失败？**
A: 检查网络连接和 GitHub 仓库访问权限

### 调试模式

```bash
DEBUG=ai-cli:* ai-cli-deploy scan
```

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

---

注意：此部署系统不依赖 Python，完全基于 Node.js 实现，确保在任何 Node.js >= 14.0.0 的环境中正常运行。