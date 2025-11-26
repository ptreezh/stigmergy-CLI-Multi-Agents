# 🔧 Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统

> **⚠️ 重要澄清：这不是一个独立的CLI工具，而是一个增强系统！**
>
> Stigmergy CLI 通过插件系统让现有的AI CLI工具能够相互协作，而不是替代它们。

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 快速开始

```bash
# 通过NPM全局安装（推荐）
npm install -g stigmergy-cli

# 初始化项目
stigmergy-cli init

# 智能部署（扫描环境+询问+自动安装）
stigmergy-cli deploy

# 或者使用npx（无需安装）
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ 核心特性

### 🎯 跨CLI直接协作
- **自然语言调用**: 在任何支持的CLI中直接调用其他AI工具
- **无缝集成**: 不改变现有CLI工具的使用方式
- **智能路由**: 自动识别协作意图并委派到合适的工具

### 📋 支持的CLI工具

#### 核心工具（必需）
- **Claude CLI** - Anthropic Claude CLI工具
- **Gemini CLI** - Google Gemini CLI工具

#### 扩展工具（可选）
- **QwenCode CLI** - 阿里云QwenCode CLI工具
- **iFlow CLI** - iFlow工作流CLI工具
- **Qoder CLI** - Qoder代码生成CLI工具
- **CodeBuddy CLI** - CodeBuddy编程助手CLI工具
- **GitHub Copilot CLI** - GitHub Copilot CLI工具
- **Codex CLI** - OpenAI Codex代码分析CLI工具

### 🧩 智能部署系统

```bash
# 智能部署（推荐）
stigmergy-cli deploy

# 输出示例：
🔍 扫描系统CLI工具状态...

  🔴 ❌ Claude CLI           | CLI: 未安装 | 集成: 未安装
  🟢 ✅ Gemini CLI          | CLI: 可用 | 集成: 已安装
  🔴 ❌ QwenCode CLI       | CLI: 未安装 | 集成: 未安装

📋 检测到以下未安装的工具:

🔴 未安装的CLI工具:
  - Claude CLI (必需) - Anthropic Claude CLI工具
  - QwenCode CLI (可选) - 阿里云QwenCode CLI工具

是否要尝试自动安装 2 个CLI工具？ (Y/n): Y
```

## 🎯 跨CLI协作示例

安装完成后，在任何支持的CLI中都可以直接调用其他工具：

### 在Claude CLI中
```bash
# 调用其他AI工具
请用gemini帮我翻译这段代码
调用qwen分析这个需求
用iflow创建工作流
让qoder生成Python代码
启动codebuddy助手
```

### 在Gemini CLI中
```bash
# 跨工具协作
用claude检查代码质量
让qwen帮我写文档
使用copilot生成代码片段
```

## 🛠️ 完整命令列表

```bash
# 基本命令
stigmergy-cli init          # 初始化项目
stigmergy-cli status        # 查看状态
stigmergy-cli scan          # 扫描环境

# 部署命令
stigmergy-cli deploy        # 智能部署（默认）
stigmergy-cli deploy-all    # 全量部署

# 项目管理
stigmergy-cli check-project # 检查项目
stigmergy-cli validate      # 验证配置
stigmergy-cli clean         # 清理环境

# 开发命令
npm run build              # 构建项目
npm run publish-to-npm     # 发布到NPM
npm run test               # 运行测试
```

## 📁 项目结构

```
stigmergy-CLI-Multi-Agents/
├── package.json          # NPM包配置
├── src/
│   ├── main.js          # 主入口文件
│   ├── deploy.js        # 智能部署脚本
│   ├── adapters/        # CLI适配器
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # 核心模块
├── adapters/            # CLI安装脚本
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # 配置模板
```

## 🔧 自动安装CLI工具

智能部署脚本支持自动安装所有CLI工具：

### 核心工具
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### 扩展工具
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 使用场景

### 场景1：个人开发者环境
```bash
# 新开发环境快速配置
git clone my-project
cd my-project
stigmergy-cli deploy

# 现在可以在任何CLI中跨工具协作
claude-cli "请用gemini帮我优化这段代码的性能"
```

### 场景2：团队协作
```bash
# 团队共享项目配置
git clone team-project
cd team-project
stigmergy-cli init

# 所有团队成员使用相同的协作背景
gemini-cli "用claude检查这个模块的设计模式"
```

### 场景3：多语言开发
```bash
# 不同AI工具专长互补
qwen-cli "用copilot生成前端组件"
iflow-cli "让gemini创建API文档"
```

## 🔧 开发环境设置

```bash
# 克隆项目
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 安装依赖
npm install

# 开发模式运行
npm run start
npm run status
npm run scan

# 构建和发布
npm run build
npm run publish-to-npm
```

## 🚀 发布新版本

```bash
# 更新版本号
npm version patch    # 补丁版本
npm version minor    # 次版本
npm version major    # 主版本

# 发布到NPM
npm run publish-to-npm

# 验证发布
npx stigmergy-cli --version
```

## 🛠️ 故障排除

### 常见问题

1. **Node.js版本不兼容**
   ```bash
   # 确保使用Node.js 16+
   node --version
   ```

2. **权限错误**
   ```bash
   # 使用管理员权限
   sudo npm install -g stigmergy-cli
   ```

3. **网络连接问题**
   ```bash
   # 设置NPM镜像
   npm config set registry https://registry.npmmirror.com
   ```

4. **CLI工具安装失败**
   ```bash
   # 手动安装特定工具
   npm install -g @anthropic-ai/claude-code
   ```

### 调试模式

```bash
# 详细调试输出
DEBUG=stigmergy:* stigmergy-cli deploy

# 仅扫描状态
stigmergy-cli scan
```

## 📚 更多信息

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **文档**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **问题反馈**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**🎯 Stigmergy CLI - 真正的跨CLI协作，让每个AI工具都能发挥最大价值！**