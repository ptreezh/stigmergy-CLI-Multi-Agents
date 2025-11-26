# 项目结构文档

## 目录结构

```
smart-cli-router/
├── src/                           # 核心源代码
│   ├── cli_collaboration_agent.py # CLI协作智能体实现
│   ├── atomic_collaboration_handler.py # 原子性协作处理器
│   ├── universal_cli_setup.py     # 通用CLI设置管理器
│   └── cli_hook_system.py         # CLI钩子系统
├── tests/                         # 测试套件
│   ├── test_unit.py               # 单元测试
│   ├── test_integration.py        # 集成测试
│   └── test_runner.py             # 测试运行器
├── website/                       # 项目网站
│   ├── index.html                 # 主页
│   ├── en/index.html              # 英文版主页
│   ├── zh/index.html              # 中文版主页
│   ├── css/style.css              # 样式
│   └── js/main.js                 # 脚本
├── docs/                          # 文档
├── PROJECT_SPEC.json              # 项目协作规范模板
├── PROJECT_CONSTITUTION.md        # 项目协作宪法
├── TASKS.md                       # 任务列表模板
├── COLLABORATION_LOG.md           # 协作日志模板
├── deploy.py                      # 部署脚本
├── README.md                      # 项目说明
├── LICENSE                        # 许可证
├── requirements.txt               # 依赖
└── setup.py                       # 安装脚本
```

## 核心组件说明

### 1. cli_collaboration_agent.py
- ProjectContext: 项目背景管理器
- CLICollaborationAgent: CLI协作智能体

### 2. atomic_collaboration_handler.py
- AtomicFileHandler: 原子文件操作处理器
- 确保并发安全的任务管理

### 3. universal_cli_setup.py
- UniversalCLISetup: 通用CLI设置管理器
- 各种格式的智能路由生成器

### 4. 协作背景文件
- PROJECT_SPEC.json: 协作状态、任务列表、历史记录
- PROJECT_CONSTITUTION.md: 协作规则和协议
- TASKS.md: 人类可读任务列表
- COLLABORATION_LOG.md: 协作活动日志

## 架构模式

### Stigmergy间接协同机制
- 基于共享项目背景文件的协作
- 无中央协调器，智能体自主决策
- 环境驱动的协作模式

### 部署方式
1. 全局扫描系统中的CLI工具
2. 为现有工具添加协作钩子
3. 在项目目录中创建协作背景

### 使用方式
用户在任何目录可使用现有CLI，支持自然语言协作:
- claude "让gemini帮我翻译"
- gemini "请codebuddy优化代码"
- qwen "用claude分析算法"

## 远程仓库
项目已部署到: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents