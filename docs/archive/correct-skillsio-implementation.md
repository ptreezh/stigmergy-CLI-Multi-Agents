# ResumeSession 技能 - 正确的 Skills.io 规范实现

## 🎯 核心理解

**Skills.io 规范的正确理解**：

### 技能的本质

1. **技能是描述文件**（SKILL.md）
   - 定义技能的名称、描述、用法
   - 提供指导和最佳实践
   - **不是可执行的程序或工具**

2. **技能由宿主 CLI 加载**
   - 部署到宿主 CLI 的 skills 目录
   - 例如：`~/.claude/skills/resumesession/`
   - 宿主 CLI 读取并解析 SKILL.md

3. **实际执行由宿主 CLI 负责**
   - 技能告诉宿主 CLI 如何执行某个功能
   - 宿主 CLI 调用自己的代码来实现
   - 或者宿主 CLI 调用外部工具/命令

## ❌ 错误的实现方式

### 1. 依赖 Stigmergy 的独立工具
- ❌ 技能文件中包含硬编码的 Stigmergy 路径
- ❌ 需要用户手动部署独立工具
- ❌ 违反了技能的定义（技能应该只是描述）

### 2. 技能本身就是可执行程序
- ❌ SKILL.md 包含可执行的 JavaScript 代码
- ❌ 技能变成了工具而不是指导
- ❌ 无法被宿主 CLI 正确管理和更新

## ✅ 正确的实现方式

### 方式 1：指导使用宿主 CLI 的原生功能（推荐）

**适用场景**：宿主 CLI 本身就有会话恢复功能

```markdown
---
name: resumesession
description: Cross-CLI session recovery and history management skill
---

# ResumeSession Skill

## Usage

### Claude CLI

Claude CLI has built-in session history viewing. Use:

```bash
# View session history in Claude CLI
/history

# Search for specific content in history
/history search <keyword>

# Filter by time range
/history --today
```

### iFlow CLI

iFlow CLI provides session management. Use:

```bash
# View iFlow session list
iflow sessions

# Resume a specific session
iflow resume <session-id>
```

## Advanced Integration

For external tools when native capabilities are insufficient:

### External Script Integration

If you need to integrate an external session recovery tool:

1. **Create a script** in your project directory:
   ```bash
   #!/bin/bash
   # Custom session recovery script
   node /path/to/external-tool.js
   ```

2. **Reference from skill**:
   ```bash
   # Using Claude's native capabilities
   bash /path/to/custom-script.sh
   ```

3. **Or use built-in commands**:
   ```bash
   # Claude's built-in command
   claude resume latest
   ```

## Notes

This skill provides guidance on session recovery methods. The actual implementation depends on:
- Host CLI capabilities
- Integration approach
- User requirements

**Best Practice**: Use the host CLI's native session management features whenever possible.
```

**优点**：
- ✅ 符合 Skills.io 规范
- ✅ 技能只是描述和指导
- ✅ 利用宿主 CLI 原生功能
- ✅ 更好的性能和集成
- ✅ 易于维护和更新

**缺点**：
- ⚠️ 受限于宿主 CLI 的能力
- ⚠️ 如果宿主 CLI 功能有限，需要外部集成

### 方式 2：指导使用 Stigmergy 的跨 CLI 功能

**适用场景**：需要跨 CLI 会话比较和恢复

```markdown
---
name: resumesession
description: Cross-CLI session recovery and history management skill
---

# ResumeSession Skill

## Description

This skill enables session recovery across multiple CLI tools.

## Usage

### Using Stigmergy's Cross-CLI Capabilities

Stigmergy provides built-in session scanning across all supported CLIs:

```bash
# Scan for latest session across all CLIs
stigmergy scan-sessions

# Find latest session from specific CLI
stigmergy scan-sessions --cli claude

# List all sessions with timestamps
stigmergy list-sessions
```

### Manual Session Recovery

If Stigmergy is not available or needs custom behavior:

1. **Direct File Access**:
   ```bash
   # Claude sessions
   ls -lt ~/.claude/projects/*/*.jsonl | head -1

   # iFlow sessions
   ls -lt ~/.iflow/projects/*/*.json | head -1
   ```

2. **Session Parsing**:
   - Sessions are stored in `.jsonl` format (one JSON per line)
   - Parse and display relevant messages
   - Filter by date/time as needed

3. **Context Recovery**:
   - Display session metadata (time, file name)
   - Show recent conversation content
   - Provide context for continuing

## Implementation Guide

### For Tool Developers

If implementing a session recovery tool:

1. **Make it CLI-friendly**:
   ```javascript
   // Accept CLI arguments
   // Use stdout/stderr for output
   // Exit with appropriate codes
   ```

2. **Handle session formats**:
   - JSONL (newline-delimited JSON)
   - JSON (single session object)
   - Session-specific formats

3. **Multi-CLI Support**:
   - Support multiple CLI storage paths
   - Detect available CLIs automatically
   - Handle missing CLIs gracefully

## Notes

This skill provides methodology guidance for session recovery. Implementations may vary based on:
- Available CLI tools
- User environment
- Integration requirements

**Recommended**: Use Stigmergy's built-in cross-CLI session capabilities when available.
```

**优点**：
- ✅ 完全符合 Skills.io 规范
- ✅ 技能只是描述和指导
- ✅ 灵活，可以适应不同宿主 CLI
- ✅ 易于维护

**缺点**：
- ⚠️ 需要宿主 CLI 有相关功能
- ⚠️ 可能需要多个技能版本（适配不同宿主）

### 方式 3：混合方式（推荐用于 Stigmergy）

**适用场景**：Stigmergy 需要提供自己的会话恢复能力

```markdown
---
name: resumesession
description: Cross-CLI session recovery and history management skill
---

# ResumeSession Skill for Stigmergy

## Description

This skill integrates with Stigmergy's cross-CLI session management system.

## Usage

### Stigmergy Commands

Stigmergy provides built-in session recovery commands:

```bash
# Find and recover latest session (default)
stigmergy resume

# List all sessions
stigmergy resume --list

# Show summary only
stigmergy resume --summary

# Filter by CLI
stigmergy resume --cli claude
```

### Integration with Stigmergy

This skill works with Stigmergy's native session recovery system. No external dependencies needed.

## Implementation

The session recovery is handled by Stigmergy's core system:
- Cross-CLI path detection
- Session file parsing
- Time-based comparison
- Content extraction and formatting

## Notes

This skill is designed specifically for Stigmergy CLI. It leverages Stigmergy's built-in cross-CLI session management capabilities.

**Advantages**:
- ✅ Native integration with Stigmergy
- ✅ No external dependencies
- ✅ Consistent with Stigmergy's architecture
- ✅ Automatic updates with Stigmergy

**Disadvantages**:
- ❌ Only works with Stigmergy CLI
```

**优点**：
- ✅ 最符合 Skills.io 规范（技能是描述）
- ✅ 与宿主系统（Stigmergy）完美集成
- ✅ 利用 Stigmergy 的原生能力
- ✅ 自动更新，无需用户干预

## 📋 技能文件结构（正确的 Skills.io 规范）

### 正确的技能文件

```markdown
---
name: resumesession
description: 技能的简短描述
author: 作者名
version: 1.0.0
---

# 技能标题

## Description

技能的详细描述。

## Usage

### 基本用法
命令示例

### 高级用法
高级选项和参数

## Notes
注意事项和最佳实践
```

### 关键原则

1. **技能是描述性文件**（SKILL.md）
   - 定义技能的用途
   - 说明如何使用
   - 不包含可执行代码

2. **技能被宿主 CLI 加载**
   - 部署到 `~/.claude/skills/`
   - 宿主 CLI 读取并解析
   - 根据技能内容执行相应操作

3. **实际执行由宿主 CLI 负责**
   - 技能描述如何使用宿主 CLI 的功能
   - 或者描述如何调用外部工具
   - 执行逻辑在宿主 CLI 的代码中

## 🎯 对比总结

| 方面 | 错误方式（独立工具） | 正确方式（Skills.io 规范）|
|------|---------------------|-------------------------|
| 技能本质 | ❌ 技能是工具 | ✅ 技能是描述文件 |
| 部署方式 | ❌ 单独部署 npm 包 | ✅ 部署到宿主 CLI |
| 执行方式 | ❌ 直接执行 JS 脚本 | ✅ 宿主 CLI 执行 |
| 集成度 | ❌ 无集成，独立运行 | ✅ 与宿主系统集成 |
| 维护性 | ❌ 需要手动更新 | ✅ 随宿主 CLI 自动更新 |
| 规范符合 | ❌ 不符合 | ✅ 完全符合 |
| 适用范围 | ⚠️ 适用于所有 CLI | ⚠️ 受限于宿主 CLI |

## 🎯 最终推荐

**推荐实现方式**：方式 3（与 Stigmergy 混合）

理由：
1. ✅ 符合 Skills.io 规范
2. ✅ 利用 Stigmergy 的原生能力
3. ✅ 不依赖外部工具
4. ✅ 自动更新和集成
5. ✅ 最适合当前项目架构

**实施步骤**：
1. 修改 `SKILL.md` 为方式 3 的格式
2. 确保 Stigmergy 有 `resume` 或类似的会话恢复命令
3. 测试跨 CLI 会话发现和恢复功能
4. 部署技能到目标 CLI
