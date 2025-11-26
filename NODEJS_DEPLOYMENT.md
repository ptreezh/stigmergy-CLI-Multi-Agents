# Stigmergy CLI - Node.js部署指南

## 🚀 快速开始

Stigmergy CLI现在完全支持Node.js和NPM部署！

### 1. 一键智能部署（推荐）

```bash
# 克隆项目
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 智能部署（自动检测CLI工具+询问+全局安装）
npm run deploy
```

**部署脚本会执行以下操作：**

1. **扫描系统状态** - 检测8个CLI工具的安装和集成状态
2. **询问用户确认** - 是否安装未安装的CLI工具和集成
3. **自动安装CLI工具** - 使用真实的全局安装命令：
   ```bash
   npm install -g @anthropic-ai/claude-code    # Claude CLI
   npm install -g @google/gemini-cli           # Gemini CLI
   npm install -g @qwen-code/qwen-code@latest  # QwenCode CLI
   npm install -g qoder-cli                   # Qoder CLI
   ```
4. **安装Stigmergy集成** - 为已安装的CLI工具配置协作插件
5. **构建和发布** - 构建项目并发布到NPM（可选）

### 2. 完整部署

```bash
# 全量部署（安装所有CLI工具+集成+构建+发布）
npm run deploy-all
```

### 3. 用户使用（发布后）

```bash
# 直接使用npx
npx stigmergy-cli init
npx stigmergy-cli status
npx stigmergy-cli deploy
```

## 🔧 智能部署流程

智能部署脚本会自动执行以下步骤：

### 1. 扫描系统状态
- 检查Claude CLI、Gemini CLI等8个工具是否已安装
- 检查Stigmergy集成是否已安装
- 显示详细的系统状态报告

### 2. 询问用户安装
```
🔍 扫描系统CLI工具状态...

  🔴 ❌ Claude CLI           | CLI: 未安装 | 集成: 未安装
  🟢 ✅ Gemini CLI          | CLI: 可用 | 集成: 已安装
  🔴 ❌ QwenCode CLI       | CLI: 未安装 | 集成: 未安装
  ...

📋 检测到以下未安装的工具:

🔴 未安装的CLI工具:
  - Claude CLI (必需) - Anthropic Claude CLI工具
  - QwenCode CLI (可选) - 阿里云QwenCode CLI工具

是否要尝试自动安装 2 个CLI工具？ (Y/n): Y
```

### 3. 自动安装CLI工具
如果用户同意，系统会：
- 尝试自动安装CLI工具（NPM、pip等）
- 提供手动安装指导（如果自动安装失败）
- 显示详细的安装进度和结果

### 4. 自动安装Stigmergy集成
- 为已安装的CLI工具安装Stigmergy协作插件
- 使用Python安装脚本完成集成配置
- 验证安装是否成功

### 5. 构建和发布
- 构建项目到dist目录
- 发布到NPM（可选）
- 提供使用说明

## 📦 CLI工具支持

### 核心工具（必需）
- **Claude CLI** - Anthropic Claude CLI工具
- **Gemini CLI** - Google Gemini CLI工具

### 扩展工具（可选）
- **QwenCode CLI** - 阿里云QwenCode CLI工具
- **iFlow CLI** - iFlow工作流CLI工具
- **Qoder CLI** - Qoder代码生成CLI工具
- **CodeBuddy CLI** - CodeBuddy编程助手CLI工具
- **GitHub Copilot CLI** - GitHub Copilot CLI工具
- **Codex CLI** - OpenAI Codex代码分析CLI工具

## 🛠️ 可用命令

```bash
# 基本命令
npm run start           # 启动服务
npm run status          # 查看状态
npm run scan            # 扫描环境
npm run init            # 初始化项目

# 部署命令
npm run deploy          # 智能部署（默认）
npm run deploy-all      # 全量部署
npm run publish         # 发布到NPM
npm run version         # 更新版本号

# 测试命令
npm run test            # 运行测试
npm run validate        # 验证项目
```

## 🎯 跨CLI协作示例

安装完成后，在任何支持的CLI中都可以直接调用其他工具：

```bash
# 在Claude CLI中调用其他工具
请用gemini帮我翻译这段代码
调用qwen分析这个需求
用iflow创建工作流

# 在Gemini CLI中调用其他工具
用claude检查代码质量
让qoder生成Python代码
启动codebuddy助手
```

## 🔧 开发环境设置

```bash
# 安装依赖
npm install

# 开发模式运行
node src/main.js --help

# 测试特定功能
node src/main.js status
node src/main.js scan

# 构建项目
npm run build

# 发布到NPM
npm run publish
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

## 🚀 发布新版本

```bash
# 更新版本号
npm version patch    # 补丁版本
npm version minor    # 次版本
npm version major    # 主版本

# 发布到NPM
npm run publish

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
   sudo npm run deploy
   ```

3. **网络连接问题**
   ```bash
   # 设置NPM镜像
   npm config set registry https://registry.npmmirror.com
   ```

4. **Python环境问题**
   ```bash
   # 确保Python 3.8+
   python --version
   ```

### 调试模式

```bash
# 详细调试输出
DEBUG=stigmergy:* npm run deploy

# 仅扫描状态
node src/deploy.js --scan
```

## 📚 更多信息

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **文档**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **问题反馈**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

---

**🎯 Stigmergy CLI - 真正的跨CLI协作，让每个AI工具都能发挥最大价值！**