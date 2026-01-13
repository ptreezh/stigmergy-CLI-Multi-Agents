---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 1.0.0
---

# ResumeSession Skill

跨 CLI 会话恢复和历史管理技能，适用于 Qwen CLI。

## Description

此技能使 Qwen CLI 能够：
- 扫描和显示所有支持的 CLI 工具的会话（Claude、Gemini、Qwen、iFlow、CodeBuddy、Codex、QoderCLI）
- 按 CLI 工具、时间范围或搜索词过滤会话
- 从之前的会话中恢复上下文
- 提供多种视图格式（摘要、时间线、详细、上下文）

## Usage

### Basic Commands

使用 Bash 工具调用 ResumeSession 功能：

```bash
# 显示所有项目会话
Bash("stigmergy resume")

# 显示特定 CLI 的会话
Bash("stigmergy resume --cli qwen")

# 按内容搜索会话
Bash("stigmergy resume --search react")

# 仅显示今天的会话
Bash("stigmergy resume --today")

# 显示最近 7 天的会话
Bash("stigmergy resume --week")

# 显示最近 30 天的会话
Bash("stigmergy resume --month")

# 限制显示的会话数量
Bash("stigmergy resume --limit 5")

# 使用不同的视图格式
Bash("stigmergy resume --format timeline")
Bash("stigmergy resume --format detailed")
Bash("stigmergy resume --format context")

# 从最近的会话获取上下文
Bash("stigmergy resume --format context")
```

### Examples

```bash
# 显示所有与 React 相关的会话
Bash("stigmergy resume --search react")

# 显示最近的 Qwen 会话
Bash("stigmergy resume --cli qwen --today")

# 从最近的会话获取上下文
Bash("stigmergy resume --format context")

# 显示所有会话的时间线
Bash("stigmergy resume --format timeline")
```

## Features

- ✅ 跨 CLI 会话发现
- ✅ 项目感知过滤
- ✅ 基于时间的排序（最新的在前）
- ✅ 内容搜索
- ✅ 上下文恢复
- ✅ 多种视图格式

## Configuration

该技能自动检测当前项目路径并扫描所有支持的 CLI 工具的会话目录。

会话路径自动检测自：
- `~/.claude/projects` (Claude)
- `~/.config/gemini/tmp` (Gemini)
- `~/.qwen/projects` (Qwen)
- `~/.iflow/projects` (iFlow)
- `~/.codebuddy` (CodeBuddy)
- `~/.config/codex` (Codex)
- `~/.qoder/projects` (QoderCLI)

## Notes

此技能需要安装和配置 Stigmergy CLI。`stigmergy resume` 命令处理所有会话扫描和格式化逻辑。