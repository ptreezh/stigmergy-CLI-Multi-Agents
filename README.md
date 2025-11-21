# 🤖 Smart CLI Router - AI工具智能路由器 | 智能CLI工具统一管理平台 | 异构智能体协作系统

[![Python Version](https://img.shields.io/badge/python-3.7%2B-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()
[![AI Tools](https://img.shields.io/badge/AI%20Tools-Claude%20%7C%20Gemini%20%7C%20Kimi%20%7C%20Qwen-orange.svg)]()

> 🚀 **智能CLI路由器** - 让多个AI CLI工具统一响应您的自然语言指令 | AI工具统一管理平台 | 智能命令行路由系统 | **异构智能体协作系统**

## ✨ 核心特性 | AI工具智能路由解决方案 | 异构智能体协作系统

- 🧠 **智能路由算法** - 根据自然语言自动选择最合适的AI工具 | AI智能路由 | 自然语言处理
- 🧩 **异构智能体协作** - 基于统一项目规范文档的多智能体间接协同 | 任务委派 | 分工协作
- 🌍 **跨平台兼容** - Windows、Linux、macOS全平台支持 | 跨平台CLI工具 | 多操作系统兼容
- 🔧 **多格式输出** - 支持CMD、PowerShell、Bash、Python四种格式 | CLI脚本生成 | 命令行工具
- 📦 **零配置部署** - 自动检测系统中可用的AI工具 | 一键部署 | 自动环境配置
- 🎯 **自然语言交互** - 支持中英文智能指令识别 | NLP命令解析 | 智能意图识别
- ⚡ **轻量高效** - 毫秒级路由决策，最小化资源占用 | 高性能CLI | 低资源消耗
- 🔄 **工具集成** - 支持Claude、Gemini、Kimi、Qwen等主流AI工具 | AI工具统一管理 | CLI工具集成
- 🛠️ **高度可扩展** - 轻松添加自定义AI工具 | 插件化架构 | 可扩展系统
- 👥 **多智能体协作** - 智能体基于项目目录和统一规范文档协作 | 自然语言协商 | 任务分解委派

## 🎯 支持的AI工具 | 主流AI CLI工具集成

| AI工具 | 描述 | 智能关键词 | 应用场景 |
|--------|------|-----------|----------|
| **Claude CLI** | Anthropic Claude AI助手 | `claude`, `anthropic` | 代码审查、逻辑推理、文本分析 |
| **Gemini CLI** | Google Gemini AI | `gemini`, `google`, `谷歌` | 文档生成、多语言翻译、创意写作 |
| **Kimi CLI** | 月之暗面Kimi智能助手 | `kimi`, `月之暗面`, `moonshot` | 中文处理、长文本理解、内容创作 |
| **Qwen CLI** | 阿里通义千问 | `qwen`, `通义`, `阿里` | 中文对话、知识问答、文本生成 |
| **Ollama** | 本地大模型运行器 | `ollama`, `本地`, `离线` | 私有部署、数据安全、离线使用 |
| **CodeBuddy** | 智能代码助手 | `codebuddy`, `代码助手`, `编程` | 代码重构、bug修复、代码优化 |
| **QoderCLI** | AI代码生成工具 | `qodercli`, `代码生成`, `编程` | 快速开发、代码模板、自动化编程 |
| **iFlow CLI** | 智能工作流助手 | `iflow`, `智能`, `助手`, `心流` | 工作流自动化、任务管理、效率提升 |

## 🚀 快速开始 | 5分钟上手AI工具智能路由

### 🎯 方法一：一键启动（推荐新手）

```bash
# 下载项目后直接运行
python quick_start.py
```

✅ 自动检测环境 → ✅ 生成配置 → ✅ 创建路由器 → ✅ 显示使用说明

### 🔧 方法二：智能部署（推荐自定义）

```bash
# 交互式配置
python deploy.py --interactive

# 自动部署
python deploy.py --auto
```

### 📋 方法三：检查可用工具

```bash
python src/universal_cli_setup.py --list
```

输出示例：
```
🔧 可用工具 (8个):
  ✅ claude     - Anthropic Claude
  ✅ gemini     - Google Gemini AI
  ✅ kimi       - 月之暗面Kimi
  ✅ qwen       - 阿里通义千问
  ✅ ollama     - Ollama本地模型
  ✅ codebuddy  - CodeBuddy代码助手
  ✅ qodercli   - QoderCLI代码生成
  ✅ iflow      - iFlow智能助手
```

### 2. 生成智能路由器

```bash
# Windows CMD格式
python src/universal_cli_setup.py --cli mytool --format cmd

# Linux/macOS Bash格式
python src/universal_cli_setup.py --cli mytool --format bash

# PowerShell格式
python src/universal_cli_setup.py --cli mytool --format powershell

# Python通用格式
python src/universal_cli_setup.py --cli mytool --format python
```

### 3. 开始使用

```bash
# 智能路由 - 无需手动指定工具
smart_mytool.cmd 用claude写Python代码
smart_mytool.cmd 用gemini分析数据问题
smart_mytool.cmd 用kimi写技术文章
smart_mytool.cmd 用ollama列出可用模型
```

## 📖 详细文档

- 📚 [完整部署指南](docs/UNIVERSAL_CLI_DEPLOYMENT_GUIDE.md)
- ⚡ [5分钟快速开始](docs/QUICK_START.md)
- 📊 [项目总结](docs/PROJECT_SUMMARY.md)

## 🛠️ 安装要求

- Python 3.7+
- 需要集成的AI CLI工具（可选）

## 📁 项目结构

```
smart-cli-router/
├── src/                          # 源代码
│   ├── universal_cli_setup.py    # 通用设置脚本
│   ├── smart_router_creator.py   # 简化版路由创建器
│   ├── kimi_wrapper.py          # Kimi CLI包装器
│   └── shell_integration.py     # Shell集成模块
├── docs/                         # 文档
│   ├── UNIVERSAL_CLI_DEPLOYMENT_GUIDE.md
│   ├── QUICK_START.md
│   └── PROJECT_SUMMARY.md
├── tests/                        # 测试
│   └── test_cross_platform.py   # 跨平台测试
├── examples/                     # 示例
└── README.md                     # 项目说明
```

## 🎮 使用示例

### 基本用法

```bash
# 生成路由器
python src/universal_cli_setup.py --cli ai --format cmd

# 智能调用
smart_ai.cmd 用claude解释机器学习
smart_ai.cmd 用gemini优化这段代码
smart_ai.cmd 用kimi写一篇博客
```

### 高级配置

```bash
# 使用自定义配置
python src/universal_cli_setup.py --config my_config.json --list

# 批量生成路由器
python src/smart_router_creator.py --all

# 测试跨平台兼容性
python tests/test_cross_platform.py
```

## 🔧 自定义配置

创建 `my_config.json`：

```json
{
  "version": "1.0.0",
  "tools": {
    "my_tool": {
      "command": {
        "windows": "mytool.cmd",
        "linux": "mytool",
        "darwin": "mytool"
      },
      "description": "我的自定义工具",
      "keywords": ["mytool", "自定义"],
      "priority": 10
    }
  },
  "route_keywords": ["用", "帮我", "请"],
  "default_tool": "claude"
}
```

## 🧪 测试

```bash
# 运行跨平台测试
python tests/test_cross_platform.py

# 测试特定功能
python src/universal_cli_setup.py --cli test --format cmd
```

## 🧩 异构智能体协作系统 | 多智能体间接协同

### 协作机制
本系统实现了基于统一项目规范文档的多智能体间接协同：

- **统一项目规范**：所有智能体通过共享的 `PROJECT_SPEC.json` 文件进行协作
- **自然语言协商**：智能体之间通过自然语言进行协商和沟通
- **任务委派**：当一个智能体无法解决或不确定时，可以将任务委派给其他智能体
- **分工协作**：多个智能体基于项目目录和统一规范文档完成任务分工

### 项目宪法
每个项目目录都应包含 `PROJECT_CONSTITUTION.md` 文件，定义协作规则：

```markdown
# 智能体协作宪法

## 项目目录宪法

### 1. 背景与理念
本项目目录是多智能体协作的核心基础设施。所有智能体（CLI工具）通过共享的项目目录进行间接协作，实现真正的分工协作和任务委派。

[更多内容见 PROJECT_CONSTITUTION.md]
```

### 协作流程
1. **任务识别**：智能体识别当前可处理的任务
2. **状态检查**：检查项目规范文档中的当前状态
3. **任务执行**：执行分配给自己的任务
4. **状态更新**：更新任务状态和项目信息
5. **协作委派**：需要时委派任务给其他智能体
6. **协作记录**：记录协作过程和决策

### 复制项目宪法
可以将项目宪法复制到新项目中：

```bash
# 将宪法复制到新项目目录
cp PROJECT_CONSTITUTION.md /path/to/new/project/
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有AI工具的开发者和开源社区的贡献！

- [Anthropic Claude](https://claude.ai)
- [Google Gemini](https://gemini.google.com)
- [月之暗面 Kimi](https://kimi.moonshot.cn)
- [阿里通义千问](https://qwen.aliyun.com)
- [Ollama](https://ollama.ai)

---

**让AI工具听从您的自然语言指令！** 🚀