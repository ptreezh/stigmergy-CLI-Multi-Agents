<<<<<<< HEAD
# Stigmergy-CLI 安装部署指南

> 🚀 **Zero Code Facility** - 零配置、一键部署的多AI CLI工具集成系统

## 🌟 快速开始

### 方法1: 一键安装（推荐）

#### Linux/macOS 用户
```bash
curl -sSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.sh | bash
```

#### Windows 用户
```powershell
# 在PowerShell中运行
powershell -Command "iwr -useb https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.bat | iex"
```

### 方法2: npm全局安装

```bash
npm install -g @stigmergy/deployer
stigmergy deploy
```

### 方法3: npx临时使用

```bash
npx @stigmergy/deployer deploy
```

### 方法4: 克隆仓库

```bash
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents/deployment
npm install
node deploy-with-install.js
```

## 🔧 系统要求

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Git** (可选，用于更新)

### 检查Node.js安装
```bash
node --version
npm --version
```

如未安装，请访问 [Node.js官网](https://nodejs.org/) 下载安装。

## 🎯 支持的AI CLI工具

| 工具 | 命令 | 安装命令 | 网址 |
|------|------|----------|------|
| **Claude Code** | `claude --version` | `npm install -g @anthropic-ai/claude-code` | [claude.ai/code](https://claude.ai/code) |
| **Google Gemini** | `gemini --version` | `npm install -g @google/generative-ai-cli` | [ai.google.dev](https://ai.google.dev/) |
| **通义千问** | `qwen --version` | `npm install -g @qwen-code/qwen-code` | [qwen.ai](https://qwen.ai/) |
| **月之暗面** | `kimi --version` | `npm install -g @moonshot/kimi-cli` | [kimi.moonshot.cn](https://kimi.moonshot.cn/) |
| **CodeBuddy** | `codebuddy --version` | `npm install -g @codebuddy/cli` | [codebuddy.ai](https://codebuddy.ai/) |
| **QoderCLI** | `qodercli --version` | `npm install -g qodercli` | [qoder.ai](https://qoder.ai/) |
| **iFlow** | `iflow --version` | `npm install -g iflow-cli` | [iflow.ai](https://iflow.ai/) |
| **GitHub Copilot** | `gh copilot --help` | `npm install -g @github/gh-copilot` | [github.com/features/copilot](https://github.com/features/copilot) |

## 🚀 使用方法

### 基本命令

```bash
# 部署系统
stigmergy deploy

# 扫描工具
stigmergy scan

# 查看状态
stigmergy status

# 清理配置
stigmergy clean
```

### 跨CLI协作

#### 🇨🇳 中文协作模式
```bash
# 在Claude中调用Gemini
claude "用gemini帮我分析这段代码的性能"

# 在Qwen中调用Kimi
qwen "请kimi帮我翻译这篇技术文档"

# 在Gemini中调用Claude
gemini "用claude帮我设计这个API架构"
```

#### 🇺🇸 英文协作模式
```bash
# 在Claude中调用Gemini
claude "use gemini to analyze this code performance"

# 在Qwen中调用Kimi
qwen "ask kimi to translate this technical document"

# 在Gemini中调用Claude
gemini "call claude to design this API architecture"
```

## 📁 配置文件

部署后，配置文件位于：

- **Windows**: `C:\Users\{用户名}\.stigmergy\`
- **macOS/Linux**: `~/.stigmergy/`

```
.stigmergy/
├── config.json              # 主配置文件
├── router.json              # 智能路由配置
├── scan-results.json        # CLI工具扫描结果
├── install-config.json      # 安装配置
├── adapters/                # 适配器配置目录
└── README.md               # 使用说明
```

## 🔧 高级功能

### 自动安装缺失工具

```bash
# 运行增强版部署工具（包含自动安装功能）
node deploy-with-install.js

# 或者单独运行安装程序
node deploy-with-install.js install
```

### 交互式安装

增强版部署工具提供：
- ✅ 自动检测缺失的AI CLI工具
- ✅ 一键安装所有缺失工具
- ✅ 选择性安装特定工具
- ✅ 显示手动安装命令

## 🌍 离线安装

对于无法访问互联网的环境：

1. **下载压缩包**
```bash
wget https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/archive/main.zip
unzip main.zip
cd stigmergy-CLI-Multi-Agents-main/deployment
```

2. **本地安装**
```bash
npm install
node deploy.js
```

## 🔄 更新和卸载

### 更新系统
```bash
# 方法1: npm更新
npm update -g @stigmergy/deployer

# 方法2: 重新部署
stigmergy deploy

# 方法3: 拉取最新代码
git pull origin main
cd deployment
npm install
node deploy.js
```

### 卸载
```bash
# 卸载npm包
npm uninstall -g @stigmergy/deployer

# 清理配置文件
stigmergy clean

# 手动删除配置目录（Windows）
rmdir /s "%USERPROFILE%\.stigmergy-cli"

# 手动删除配置目录（macOS/Linux）
rm -rf ~/.stigmergy
```

## 🛠️ 故障排除

### 常见问题

#### 1. Node.js版本过低
```bash
# 更新Node.js到最新LTS版本
nvm install --lts
nvm use --lts
```

#### 2. npm权限问题
```bash
# Linux/macOS
sudo npm install -g @stigmergy/deployer

# 或者配置npm权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### 3. 网络连接问题
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/

# 临时使用镜像
npm install -g @stigmergy/deployer --registry https://registry.npmmirror.com/
```

#### 4. CLI工具检测失败
```bash
# 检查PATH环境变量
echo $PATH  # Linux/macOS
echo %PATH%  # Windows

# 重新扫描
stigmergy scan
```

### 获取帮助

- 📖 **文档**: [项目README](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)

## 🎉 开始使用

安装完成后，你就可以：

1. **查看系统状态**: `stigmergy status`
2. **尝试跨CLI协作**: `claude "用gemini帮我写Python代码"`
3. **探索更多功能**: 查看生成的配置文件和文档

---

=======
# Stigmergy-CLI 安装部署指南

> 🚀 **Zero Code Facility** - 零配置、一键部署的多AI CLI工具集成系统

## 🌟 快速开始

### 方法1: 一键安装（推荐）

#### Linux/macOS 用户
```bash
curl -sSL https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.sh | bash
```

#### Windows 用户
```powershell
# 在PowerShell中运行
powershell -Command "iwr -useb https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main/install.bat | iex"
```

### 方法2: npm全局安装

```bash
npm install -g @stigmergy/deployer
stigmergy deploy
```

### 方法3: npx临时使用

```bash
npx @stigmergy/deployer deploy
```

### 方法4: 克隆仓库

```bash
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents/deployment
npm install
node deploy-with-install.js
```

## 🔧 系统要求

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Git** (可选，用于更新)

### 检查Node.js安装
```bash
node --version
npm --version
```

如未安装，请访问 [Node.js官网](https://nodejs.org/) 下载安装。

## 🎯 支持的AI CLI工具

| 工具 | 命令 | 安装命令 | 网址 |
|------|------|----------|------|
| **Claude Code** | `claude --version` | `npm install -g @anthropic-ai/claude-code` | [claude.ai/code](https://claude.ai/code) |
| **Google Gemini** | `gemini --version` | `npm install -g @google/generative-ai-cli` | [ai.google.dev](https://ai.google.dev/) |
| **通义千问** | `qwen --version` | `npm install -g @qwen-code/qwen-code` | [qwen.ai](https://qwen.ai/) |
| **月之暗面** | `kimi --version` | `npm install -g @moonshot/kimi-cli` | [kimi.moonshot.cn](https://kimi.moonshot.cn/) |
| **CodeBuddy** | `codebuddy --version` | `npm install -g @codebuddy/cli` | [codebuddy.ai](https://codebuddy.ai/) |
| **QoderCLI** | `qodercli --version` | `npm install -g qodercli` | [qoder.ai](https://qoder.ai/) |
| **iFlow** | `iflow --version` | `npm install -g iflow-cli` | [iflow.ai](https://iflow.ai/) |
| **GitHub Copilot** | `gh copilot --help` | `npm install -g @github/gh-copilot` | [github.com/features/copilot](https://github.com/features/copilot) |

## 🚀 使用方法

### 基本命令

```bash
# 部署系统
stigmergy deploy

# 扫描工具
stigmergy scan

# 查看状态
stigmergy status

# 清理配置
stigmergy clean
```

### 跨CLI协作

#### 🇨🇳 中文协作模式
```bash
# 在Claude中调用Gemini
claude "用gemini帮我分析这段代码的性能"

# 在Qwen中调用Kimi
qwen "请kimi帮我翻译这篇技术文档"

# 在Gemini中调用Claude
gemini "用claude帮我设计这个API架构"
```

#### 🇺🇸 英文协作模式
```bash
# 在Claude中调用Gemini
claude "use gemini to analyze this code performance"

# 在Qwen中调用Kimi
qwen "ask kimi to translate this technical document"

# 在Gemini中调用Claude
gemini "call claude to design this API architecture"
```

## 📁 配置文件

部署后，配置文件位于：

- **Windows**: `C:\Users\{用户名}\.stigmergy\`
- **macOS/Linux**: `~/.stigmergy/`

```
.stigmergy/
├── config.json              # 主配置文件
├── router.json              # 智能路由配置
├── scan-results.json        # CLI工具扫描结果
├── install-config.json      # 安装配置
├── adapters/                # 适配器配置目录
└── README.md               # 使用说明
```

## 🔧 高级功能

### 自动安装缺失工具

```bash
# 运行增强版部署工具（包含自动安装功能）
node deploy-with-install.js

# 或者单独运行安装程序
node deploy-with-install.js install
```

### 交互式安装

增强版部署工具提供：
- ✅ 自动检测缺失的AI CLI工具
- ✅ 一键安装所有缺失工具
- ✅ 选择性安装特定工具
- ✅ 显示手动安装命令

## 🌍 离线安装

对于无法访问互联网的环境：

1. **下载压缩包**
```bash
wget https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/archive/main.zip
unzip main.zip
cd stigmergy-CLI-Multi-Agents-main/deployment
```

2. **本地安装**
```bash
npm install
node deploy.js
```

## 🔄 更新和卸载

### 更新系统
```bash
# 方法1: npm更新
npm update -g @stigmergy/deployer

# 方法2: 重新部署
stigmergy deploy

# 方法3: 拉取最新代码
git pull origin main
cd deployment
npm install
node deploy.js
```

### 卸载
```bash
# 卸载npm包
npm uninstall -g @stigmergy/deployer

# 清理配置文件
stigmergy clean

# 手动删除配置目录（Windows）
rmdir /s "%USERPROFILE%\.stigmergy-cli"

# 手动删除配置目录（macOS/Linux）
rm -rf ~/.stigmergy
```

## 🛠️ 故障排除

### 常见问题

#### 1. Node.js版本过低
```bash
# 更新Node.js到最新LTS版本
nvm install --lts
nvm use --lts
```

#### 2. npm权限问题
```bash
# Linux/macOS
sudo npm install -g @stigmergy/deployer

# 或者配置npm权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### 3. 网络连接问题
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/

# 临时使用镜像
npm install -g @stigmergy/deployer --registry https://registry.npmmirror.com/
```

#### 4. CLI工具检测失败
```bash
# 检查PATH环境变量
echo $PATH  # Linux/macOS
echo %PATH%  # Windows

# 重新扫描
stigmergy scan
```

### 获取帮助

- 📖 **文档**: [项目README](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)

## 🎉 开始使用

安装完成后，你就可以：

1. **查看系统状态**: `stigmergy status`
2. **尝试跨CLI协作**: `claude "用gemini帮我写Python代码"`
3. **探索更多功能**: 查看生成的配置文件和文档

---

>>>>>>> temp-branch
**让AI工具协同工作，释放创造力的无限可能！** 🚀