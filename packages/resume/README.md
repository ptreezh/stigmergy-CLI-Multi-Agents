# ResumeSession - 跨 CLI 会话恢复工具

ResumeSession 是一个强大的工具，允许在不同 AI CLI 工具之间共享会话历史和上下文。通过为各个 CLI 工具生成集成代码，您可以在任何 CLI 中使用 `/history` 命令来查看和搜索跨 CLI 的会话历史。

## 🚀 功能特性

- ✅ **跨CLI会话扫描** - 自动扫描7个主流AI CLI工具的会话历史
- ✅ **项目感知** - 只显示当前项目相关的会话历史
- ✅ **时间排序** - 按时间从近到远排序，最新的会话优先显示
- ✅ **跨CLI搜索** - 在所有CLI工具中搜索会话内容
- ✅ **多种格式** - 支持摘要、时间线、详细、上下文等多种显示格式
- ✅ **模板化集成** - 基于模板文件生成集成代码，易于维护
- ✅ **零依赖运行** - 生成的集成代码完全独立，无需外部依赖

## 🛠️ 支持的 CLI 工具

| CLI 工具 | 会话路径 | 格式 | 状态 |
|---------|---------|------|------|
| 🟢 Claude CLI | `~/.claude/sessions/*.json` | JSON | ✅ 完全支持 |
| 🔵 Gemini CLI | `~/.gemini/sessions/*.json` | JSON | ✅ 完全支持 |
| 🟡 Qwen CLI | `~/.qwen/projects/<项目>/chats/*.jsonl` | JSONL | ✅ 完全支持 |
| 🔴 IFlow CLI | `~/.iflow/projects/<项目>/session-*.jsonl` | JSONL | ✅ 完全支持 |
| 🟣 CodeBuddy CLI | `~/.codebuddy/history.jsonl` | JSONL | ✅ 完全支持 |
| 🟠 QoderCLI | `~/.qodercli/projects/<项目>/*.jsonl` | JSONL | ✅ 完全支持 |
| 🟪 Codex CLI | `~/.codex/sessions/YYYY/MM/DD/*.jsonl` | JSONL | ✅ 完全支持 |

## 📦 安装

```bash
npm install resumesession
```

> 💡 **注意**: ResumeSession 现在作为独立包发布，版本1.2.1，包含完整的跨CLI会话恢复功能。

## 🎯 快速开始

### 1. 生成集成代码

使用 CodeGenerator 为指定的 CLI 工具生成集成代码：

```typescript
import { CodeGenerator } from '@stigmergy/resume';

const generator = new CodeGenerator();
const config = {
  version: '1.0.4',
  enableCrossProjectQuery: true,
  enableContextRecovery: true
};

// 为 Qwen CLI 生成集成代码
await generator.generateIntegration('qwen', '/path/to/project', config);
```

生成的集成代码将自动部署到对应 CLI 的目录中。

### 2. 使用 /history 命令

在已集成的 CLI 工具中使用：

```bash
# 显示所有项目会话（最新优先）
/history

# 显示特定 CLI 的会话
/history --cli claude

# 搜索特定内容
/history --search "react"

# 显示今天的会话
/history --today

# 时间线视图
/history --format timeline

# 获取上下文恢复
/history --format context
```

## 📖 详细使用指南

### 命令选项

| 选项 | 描述 | 示例 |
|------|------|------|
| `--cli <工具>` | 显示特定 CLI 的会话 | `/history --cli gemini` |
| `--search <关键词>` | 搜索会话内容 | `/history --search "组件"` |
| `--limit <数量>` | 限制显示的会话数 | `/history --limit 5` |
| `--format <格式>` | 显示格式 | `/history --format timeline` |
| `--today` | 今天的会话 | `/history --today` |
| `--week` | 最近 7 天的会话 | `/history --week` |
| `--month` | 最近 30 天的会话 | `/history --month` |

### 显示格式

- **summary** (默认) - 摘要视图，按 CLI 分组显示
- **timeline** - 时间线视图，按时间顺序显示
- **detailed** - 详细视图，显示完整会话信息
- **context** - 上下文视图，用于恢复讨论

## 🏗️ 项目结构

初始化后，您的项目将包含以下文件：

```
project-folder/
├── .resumesession               # ResumeSession 配置文件
├── .claude/
│   └── hooks/
│       └── resumesession-history.js # Claude CLI 集成
├── .gemini/
│   └── extensions/
│       └── resumesession-history.js # Gemini CLI 集成
├── .qwen/
│   └── plugins/
│       └── resumesession-history.js # Qwen CLI 集成
├── stigmergy/
│   └── commands/
│       └── history.js          # IFlow CLI 集成
└── RESUMESESSION.md             # 使用说明
```

## 🏛️ 架构设计

### 模板文件系统

ResumeSession 使用独立的模板文件来生成集成代码，避免了字符串转义问题：

```
packages/resume/
├── templates/                    # 模板文件目录
│   ├── claude-integration.template.js
│   ├── gemini-integration.template.js
│   ├── qwen-integration.template.js
│   ├── iflow-integration.template.js
│   ├── codebuddy-integration.template.js
│   ├── codex-integration.template.js
│   └── qodercli-integration.template.js
└── src/
    └── utils/
        └── CodeGenerator.ts      # 模板读取和变量替换
```

### 核心模块

- **SessionScanner** - 扫描和解析各 CLI 的会话文件
- **SessionFilter** - 按 CLI、时间、关键词过滤会话
- **HistoryFormatter** - 格式化输出（summary/timeline/detailed/context）
- **HistoryQuery** - 统一的查询接口
- **CodeGenerator** - 基于模板生成集成代码

## 🎮 使用场景

### 场景 1: 跨 CLI 继续工作
```
# 第一天：在 Claude CLI 中讨论 React 架构
# 第二天：在 Gemini CLI 中想继续昨天的工作

# 在 Gemini CLI 中运行：
/history --format context

# 结果：自动获取昨天在 Claude 中的讨论内容，无缝继续
```

### 场景 2: 项目知识搜索
```
# 查找项目中所有关于 "数据库优化" 的讨论
/history --search "数据库优化"

# 结果：显示所有 CLI 工具中相关的会话
```

### 场景 3: 查看特定 CLI 的历史
```
# 只查看 Qwen CLI 的会话记录
/history --cli qwen --format timeline

# 结果：按时间顺序显示 Qwen CLI 的所有会话
```

## 🔍 工作原理

1. **CLI 检测** - ResumeSession 扫描系统中的 AI CLI 工具
2. **会话扫描** - 读取各 CLI 工具的会话文件
3. **项目匹配** - 根据项目路径过滤相关会话
4. **智能排序** - 按时间戳排序（最新优先）
5. **上下文恢复** - 提供完整的讨论上下文

## 🛡️ 安全特性

- **无干扰扫描** - 扫描 CLI 工具时不会启动任何应用程序
- **只读操作** - 只读取会话文件，不会修改任何内容
- **本地处理** - 所有数据都在本地处理，不上传到云端

## 🛠️ 开发

### 构建项目

```bash
npm run build
```

### 运行测试

```bash
# 测试所有模板生成
node test-all-templates.js

# 测试特定 CLI
node test-template-system.js
```

## 📄 许可证

MIT License

---

**ResumeSession** - 跨 CLI 会话恢复工具，让不同 AI CLI 工具之间的上下文共享变得简单！🚀