# ResumeSession - 跨 CLI 会话恢复工具

ResumeSession 是一个强大的工具，允许在不同 AI CLI 工具之间共享会话历史和上下文。通过简单的初始化，您可以在任何项目中使用 `/history` 命令来查看和恢复跨 CLI 的会话历史。

## 🚀 功能特性

- ✅ **自动 CLI 扫描** - 自动检测本地安装的 AI CLI 工具
- ✅ **交互式配置** - 通过友好的界面选择要集成的 CLI 工具
- ✅ **项目感知** - 只显示当前项目相关的会话历史
- ✅ **时间排序** - 按时间从近到远排序，最新的会话优先显示
- ✅ **跨 CLI 搜索** - 在所有支持的 CLI 工具中搜索会话内容
- ✅ **上下文恢复** - 一键恢复之前的讨论上下文，无缝继续工作
- ✅ **无干扰扫描** - 扫描时不会启动任何CLI工具或界面

## 🛠️ 支持的 CLI 工具

| CLI 工具 | 支持级别 | 状态 |
|---------|---------|------|
| 🟢 Claude CLI | Native | ✅ 完全支持 |
| 🔵 Gemini CLI | Native | ✅ 完全支持 |
| 🟡 Qwen CLI | Native | ✅ 完全支持 |
| 🔴 IFlow CLI | Hook-based | ✅ 支持 |
| 🟣 CodeBuddy CLI | External | ✅ 支持 |
| 🟠 QoderCLI | External | ✅ 支持 |
| 🟪 Codex CLI | External | ✅ 支持 |

## 📦 安装

```bash
npm install -g resumesession
```

## 🎯 快速开始

### 1. 初始化项目

在您的项目目录中运行：

```bash
resumesession init
```

ResumeSession 将：
- 🔍 扫描本地可用的 CLI 工具
- 🎛️ 让您交互式选择要集成的工具
- 🔨 自动生成集成代码
- 📁 创建配置文件

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

## 🔧 命令参考

### resumesession init

初始化项目以使用 ResumeSession。

```bash
resumesession init [options]
```

选项：
- `-f, --force` - 强制重新初始化

### resumesession status

查看当前项目的状态。

```bash
resumesession status
```

### resumesession scan

扫描系统中可用的 CLI 工具。

```bash
resumesession scan [options]
```

选项：
- `-v, --verbose` - 显示详细信息

## 🎮 使用场景

### 场景 1: 跨 CLI 继续工作
```
# 第一天：在 Claude CLI 中讨论 React 架构
# 第二天：在 Gemini CLI 中想继续昨天的工作

# 在项目中运行：
/history --format context

# 结果：自动获取昨天的讨论内容，无缝继续
```

### 场景 2: 项目知识搜索
```
# 查找项目中所有关于 "数据库优化" 的讨论
/history --search "数据库优化"

# 结果：显示所有 CLI 工具中相关的会话
```

### 场景 3: 团队协作
```
# 查看团队成员在不同 CLI 工具中的讨论
/history --format timeline

# 结果：按时间顺序显示所有相关讨论
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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

- 运行 `resumesession --help` 获取帮助
- 查看 [GitHub Issues](https://github.com/resumesession/resumesession/issues)
- 阅读详细文档：[ResumeSession 文档](https://resumesession.dev/docs)

---

**ResumeSession** - 让 AI CLI 工具之间的协作变得简单！🚀