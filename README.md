# 🔧 Smart CLI Router - 多AI CLI工具协作管理系统

> **⚠️ 重要澄清：这不是一个独立的CLI工具，而是一个增强系统！**
>
> 请仔细阅读本文档，避免常见误解。特别关注 **❗� 关键澄清点** 部分。

## 📋 项目目标

**核心目标：** 让现有的AI CLI工具（Claude、Gemini、QwenCode等）能够相互感知并协作，而不是创建一个新的CLI工具。

### 🎯 具体目标

1. **第一次部署时的环境扫描**
   - 自动发现本地已安装的AI CLI工具
   - 生成每个CLI工具的安装配置清单
   - 记录每个CLI工具的配置目录路径

2. **插件文件管理**
   - 将对应的适配器文件拷贝到合适的配置目录中去
   - 为每个CLI工具安装协作感知插件
   - 初始化全局MD配置文件

3. **项目应用场景**
   - 在用户的项目目录下进行项目初始化
   - 生成这个项目的基础文档（README、协作指南等）
   - 让各CLI工具能够基于项目共同背景文件进行间接协同

4. **保持原有使用习惯**
   - 用户继续使用 `claude-cli`、`gemini-cli` 等原有命令
   - 通过插件系统增强现有CLI工具，而不是替代它们

## 🚀 使用场景

### 场景1：团队环境首次部署

```bash
# 团队管理员在新环境中部署
cd /team/workspace

# 一键扫描和配置所有AI工具
ai-cli-router deploy

# 输出：
🔍 扫描AI环境...
✅ 发现 Claude CLI v2.0.1 - 配置目录: ~/.config/claude/
✅ 发现 Gemini CLI v1.5.2 - 配置目录: ~/.config/gemini/
✅ 发现 QwenCode CLI v3.1.0 - 配置目录: ~/.config/qwencode/
...

📦 部署协作插件...
✅ Claude Hook插件已安装到 ~/.config/claude/hooks.json
✅ Gemini Extension插件已安装到 ~/.config/gemini/extensions.json
...

📝 生成全局配置...
✅ 全局协作配置已生成: ~/.ai-cli-router/global-config.json
```

### 场景2：新项目初始化

```bash
# 开发者创建新项目
cd ~/my-new-project

# 初始化项目（包含协作感知）
ai-cli-router init

# 输出：
🎯 AI CLI Router - 项目初始化完成
📊 项目类型: new_project
🤖 可用AI工具: 6 个
⏱️ 处理时间: 2.34 秒

📄 生成的文档:
   ✅ claude.md - 包含协作指南
   ✅ gemini.md - 包含协作指南
   ✅ project-config.json - 项目配置
   ✅ README.md - 项目说明
   ✅ collaboration-guide.md - 协作指南

🚀 快速开始:
现在您可以使用协作指令:
- 在Claude CLI中: "请用gemini帮我分析这个架构"
- 在Gemini CLI中: "调用qwencode生成Python代码"
- 各CLI工具能感知到彼此的存在并协作
```

### 场景3：现有项目增强

```bash
# 在已有项目中添加协作能力
cd ~/existing-project

# 增强现有项目
ai-cli-router enhance

# 输出：
🔍 检测现有文档...
✅ 发现 claude.md - 正在增强
✅ 发现 gemini.md - 正在增强

📝 添加协作章节:
- 在现有MD文件中添加"可用AI工具"章节
- 添加"协作协议"说明
- 添加"快速开始"指南

✅ 项目增强完成！现在各CLI工具可以协作了。
```

### 场景4：日常协作使用

```bash
# 用户继续使用原有CLI工具，但具备了协作能力

# 在Claude CLI中
claude-cli "请用gemini帮我分析这个React组件的性能"

# 在Gemini CLI中
gemini-cli "调用qwencode生成对应的优化代码"

# 在QwenCode CLI中
qwencode-cli "用iflow为这个组件创建部署工作流"

# 各工具通过项目配置文件感知其他工具的存在
```

## ❗️ 关键澄清点（避免误解！）

### 1. 项目的性质：增强系统，不是替代工具

**❌ 错误理解：** 这是一个新的AI CLI工具，用来替代现有的claude-cli、gemini-cli等

**✅ 正确理解：** 这是一个**增强系统**，为现有的AI CLI工具添加协作感知能力

- **不替代：** 用户继续使用原有的CLI工具
- **不改变：** 保持原有的命令行接口和使用习惯
- **只增强：** 让现有工具能够感知到其他CLI工具的存在

### 2. 统一入口的作用：管理工具，不是使用工具

**❌ 错误理解：** 用户以后都用 `ai-cli-router` 命令，不再使用claude-cli、gemini-cli等

**✅ 正确理解：** `ai-cli-router` 是一个**管理和部署工具**，只在以下场景使用：

- **环境部署时：** `ai-cli-router deploy` - 一次性配置所有工具
- **项目初始化时：** `ai-cli-router init` - 为项目添加协作能力
- **状态管理时：** `ai-cli-router status` - 查看所有工具状态

**日常开发时：** 用户仍然使用
```bash
claude-cli "你的日常命令"
gemini-cli "你的日常命令"
qwencode-cli "你的日常命令"
```

### 3. 协作机制：基于配置文件的间接协作

**❌ 错误理解：** 各CLI工具之间通过API直接通信，实时同步

**✅ 正确理解：** 通过**项目共享配置文件**实现Stigmergy间接协作

- **无直接通信：** CLI工具之间不建立网络连接
- **无实时监听：** 不监听文件系统变化
- **基于配置：** 通过读取项目中的统一配置文件感知环境
- **异步协作：** 在合适的时机基于配置信息进行协作调用

### 4. 部署方式：一次部署，持续使用

**❌ 错误理解：** 每次使用前都要运行 `ai-cli-router`

**✅ 正确理解：** 这是一次性的环境配置工具

- **首次部署：** 在新环境中运行一次 `ai-cli-router deploy`
- **项目使用：** 在每个项目中运行一次 `ai-cli-router init`
- **日常使用：** 直接使用原有的CLI工具，具备协作能力

### 5. 技术实现：原生集成，不是包装器

**❌ 错误理解：** 通过包装器调用各个CLI工具

**✅ 正确理解：** 使用每个CLI工具的**原生扩展机制**

- **Claude CLI：** 官方Hook系统 (hooks.json)
- **Gemini CLI：** 官方Extension系统 (extensions.json)
- **QwenCode CLI：** 官方类继承机制 (config.yml)
- **iFlow CLI：** 官方工作流集成 (hooks.yml)
- **其他工具：** 各自的最优集成方式

### 6. 项目价值：增强现有工具，不是创造新工具

**❌ 错误理解：** 这个项目的价值是创造一个新的AI CLI工具

**✅ 正确理解：** 项目的价值是**让现有的AI CLI工具更强大**

- **增强而非替代：** 保持用户习惯，增强工具能力
- **协作价值：** 1+1>2 的效果，多工具协同创造更大价值
- **渐进式采用：** 可以先部署部分工具，逐步扩展协作网络

## 🏗️ 核心架构

### 第一次部署（一次性设置）

```bash
# 1. 环境扫描 - 发现所有AI CLI工具
ai-cli-router scan

# 2. 插件部署 - 为每个工具安装协作插件
ai-cli-router deploy --all

# 3. 全局配置 - 生成统一配置
ai-cli-router setup --global
```

### 项目应用（每个项目一次）

```bash
# 在项目中启用协作
ai-cli-router init

# 生成的项目结构：
my-project/
├── .ai-cli-project/
│   ├── project-config.json      # 项目配置
│   ├── collaboration-guide.md  # 协作指南
│   └── tool-status.json       # 工具状态
├── claude.md                 # Claude配置 + 协作指南
├── gemini.md                 # Gemini配置 + 协作指南
├── qwencode.md               # QwenCode配置 + 协作指南
└── README.md                  # 项目说明
```

### 日常协作使用

```bash
# 用户继续使用原有CLI工具，但现在具备协作能力：

# 在Claude CLI中调用其他工具
claude-cli "请用gemini帮我分析这个API的性能"

# 在Gemini CLI中调用其他工具
gemini-cli "调用qwencode生成性能优化代码"

# 自动检测和路由
# - 检测到跨CLI调用意图
# - 自动路由到目标工具
# - 返回格式化的协作结果
```

## 🛠️ 技术实现

### 支持的CLI工具

| CLI工具 | 集成方式 | 配置文件 | 协作能力 |
|---------|---------|----------|----------|
| **Claude CLI** | Hook系统 | `~/.config/claude/hooks.json` | ✅ 完整 |
| **Gemini CLI** | Extension系统 | `~/.config/gemini/extensions.json` | ✅ 完整 |
| **QwenCode CLI** | 类继承 | `~/.config/qwencode/config.yml` | ✅ 完整 |
| **iFlow CLI** | 工作流集成 | `~/.config/iflow/hooks.yml` | ✅ 完整 |
| **Qoder CLI** | 环境变量钩子 | `~/.qoder/config.json` | ✅ 完整 |
| **CodeBuddy CLI** | 技能系统 | `~/.codebuddy/buddy_config.json` | ✅ 完整 |
| **Copilot CLI** | MCP服务器 | `~/.copilot/mcp-config.json` | ✅ 完整 |
| **Codex CLI** | 斜杠命令 | `~/.config/codex/slash_commands.json` | ✅ 完整 |

### 协作协议

#### 中文协作协议
```bash
# 支持的中文模式
"请用{cli}帮我{task}"        # 请用gemini帮我分析代码
"调用{cli}来{task}"            # 调用qwencode来生成接口
"用{cli}帮我{task}"            # 用iflow帮我部署应用
```

#### 英文协作协议
```bash
# 支持的英文模式
"use {cli} to {task}"           # use gemini to analyze code
"call {cli} to {task}"           # call qwencode to generate api
"ask {cli} for {task}"           # ask iflow to deploy app
```

## 📦 安装和部署

### 1. 系统要求
- Python 3.8+
- 已安装至少1个支持的AI CLI工具
- 支持的操作系统：Windows、macOS、Linux

### 2. 安装步骤

```bash
# 克隆项目
git clone https://github.com/your-org/smart-cli-router.git
cd smart-cli-router

# 安装依赖
pip install -r requirements.txt

# 安装到系统
pip install -e .
```

### 3. 首次部署

```bash
# 一键部署所有CLI工具的协作插件
ai-cli-router deploy

# 检查部署状态
ai-cli-router status

# 输出示例：
✅ Claude CLI - Hook已注册 (v2.0.1)
✅ Gemini CLI - Extension已加载 (v1.5.2)
✅ QwenCode CLI - 插件已安装 (v3.1.0)
⚠️  iFlow CLI - 需要手动配置
❌ Qoder CLI - 未安装
```

## 🚀 快速开始

### 1. 环境准备
```bash
# 确保已安装AI CLI工具
which claude-cli gemini-cli qwencode-cli iflow-cli

# 扫描环境
ai-cli-router scan
```

### 2. 项目初始化
```bash
# 创建新项目
mkdir my-project && cd my-project

# 初始化协作能力
ai-cli-router init

# 或者增强现有项目
cd existing-project
ai-cli-router enhance
```

### 3. 开始协作
```bash
# 现在可以在任意CLI工具中使用协作指令
claude-cli "请用gemini帮我分析这个架构设计"

# 系统会自动：
# 1. 检测到跨CLI调用意图
# 2. 路由到gemini-cli
# 3. 执行任务并返回结果
# 4. 格式化显示协作结果
```

## 📖 文档结构

```
docs/
├── README.md                 # 本文档
├── DEPLOYMENT_GUIDE.md       # 部署指南
├── COLLABORATION_GUIDE.md     # 协作指南
├── API_REFERENCE.md          # API参考
├── TROUBLESHOOTING.md        # 故障排除
└── examples/                # 使用示例
    ├── basic_usage.md
    ├── team_setup.md
    └── advanced_collaboration.md
```

## ❓ 常见问题

### Q1: 这会替代我现有的CLI工具吗？
**A:** 不会！这是增强系统，您继续使用原有的CLI工具。

### Q2: 需要每次使用前都运行ai-cli-router吗？
**A:** 不需要！只在部署和项目初始化时使用。

### Q3: 各CLI工具之间是实时通信吗？
**A:** 不是！通过项目配置文件实现间接协作，无网络通信。

### Q4: 支持哪些CLI工具？
**A:** 目前支持8个主流AI CLI工具，详见架构表格。

### Q5: 如何添加新的CLI工具？
**A:** 通过适配器模式，每种工具都有对应的集成方式。

## 🤝 贡献指南

我们欢迎社区贡献！特别是：
- 新CLI工具的适配器实现
- 协作协议的扩展
- 部署脚本的改进
- 文档和示例的完善

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**⚠️ 再次提醒：** 如果您对项目目标、使用场景或技术实现有任何疑问，请重新阅读 **❗️ 关键澄清点** 部分，或查看 [详细文档](docs/)。