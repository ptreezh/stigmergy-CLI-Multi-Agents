# 智能体协作系统 - 基于背景的间接协同（Stigmergy）

[![Python](https://img.shields.io/badge/python-3.7+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()
[![Stigmergy](https://img.shields.io/badge/collaboration-stigmergy-indigo.svg)]()

> 🚀 **智能体协作系统** - 实现基于项目背景的间接协同（Stigmergy），让多个AI CLI工具在内部实现自然语言协作 | 跨厂商AI工具统一协作平台 | 去中心化多智能体协作系统

## ✨ 核心特性

### 🧩 基于背景的间接协同（Stigmergy）
- **环境驱动协作**: 智能体通过项目背景文件(PROJECT_SPEC.json)实现协作
- **去中心化架构**: 无中央协调器，智能体基于背景状态自主决策
- **间接通信**: 通过环境状态而非直接通信实现协作

### 🎯 内部自然语言交互
- **无缝集成**: 直接增强现有CLI工具，保持原有使用习惯  
- **自然语言路由**: 在原始工具内部使用"让{工具}帮我{任务}"语法
- **智能任务委派**: 自动识别协作意图并委派到合适的智能体

### 🔐 原子性协作安全
- **并发防护**: 防止多个智能体重复认领同一任务
- **状态同步**: 通过原子文件操作确保协作状态一致
- **任务跟踪**: 完整的任务生命周期管理

## 🚀 快速开始

### 安装部署
```bash
# 克隆项目
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 全局部署协作系统
python deploy.py --global-setup
```

### 无环境配置要求
系统直接增强原始CLI工具，无需配置PATH环境，无需改变原始工具路径。

### 立即使用
```bash
# 原始功能保持不变
claude "帮我写Python代码"
gemini "分析这段数据"

# 新增协作功能（在原始工具内部）
claude "让gemini帮我翻译这份文档"     # Claude识别协作意图并路由
gemini "请codebuddy优化这段代码"      # Gemini识别协作意图并路由
qwen "用claude分析这个算法"         # Qwen识别协作意图并路由
```

## 🏗️ 系统架构

### Stigmergy协作机制
```
项目背景系统 (Project Context):
├── PROJECT_SPEC.json      # 任务状态、协作历史、当前状态
├── PROJECT_CONSTITUTION.md # 协作规则和宪法
├── TASKS.md              # 人类可读任务列表
└── COLLABORATION_LOG.md   # 协作日志

协作流程:
用户输入 → 原始CLI工具内部的协作增强器 → 分析协作意图 → 
更新项目背景 → 路由到目标工具 → 执行任务 → 更新协作状态
```

### 智能体协作示例
```bash
# 在任何项目目录
$ claude "让gemini帮我翻译README，让codebuddy审查代码"

# 系统内部协作流程:
# 1. Claude分析输入，识别协作意图
# 2. 在PROJECT_SPEC.json中创建翻译和审查任务
# 3. Gemini和CodeBuddy分别认领适合的任务
# 4. 各智能体更新协作状态和历史
```

## 🧩 支持的智能体

- **Claude** (Anthropic) - 逻辑分析与推理
- **Gemini** (Google) - 多语言处理与创意生成  
- **Qwen** (Alibaba) - 中文处理与对话
- **Kimi** (Moonshot) - 长文本处理与研究
- **Ollama** - 本地模型运行
- **CodeBuddy** - 代码生成与优化
- **QoderCLI** - 代码生成工具
- **iFlow** - 工作流助手
- **及任意CLI工具** - 支持通用CLI工具集成

## 💡 使用场景

### 1. 多智能体决策
```bash
claude "让gemini和qwen同时帮我分析这份需求文档"
```

### 2. 复杂项目协作
```bash
gemini "让codebuddy写代码，让claude审查，让qwen写文档"
```

### 3. 任务委派
```bash
qwen "请claude帮我分析算法复杂度" 
```

### 4. 交叉验证
```bash
claude "让gemini和qwen分别翻译，对比结果"
```

## 🧪 测试验证

运行核心测试验证功能完整性：
```bash
python -m unittest tests.test_unit -v
python -m unittest tests.test_integration -v
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)  
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌐 更多信息

- **项目网站**: http://www.socienceAI.com
- **GitHub仓库**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **技术邮箱**: 3061176@qq.com

---

**让AI工具在内部实现真正的协作！** 🤖