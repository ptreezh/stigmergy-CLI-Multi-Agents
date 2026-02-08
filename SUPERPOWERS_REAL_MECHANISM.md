# Superpowers 真实配置机制分析报告

## 📋 执行摘要

通过直接访问 GitHub 上的 obra/superpowers 仓库，我发现了 superpowers 在 Claude CLI 上的**真实配置机制**，与我之前的理解完全不同。

---

## 🔍 核心发现

### 1. 目录结构

```
superpowers/
├── .claude-plugin/              # Claude CLI 插件配置
│   ├── plugin.json             # 插件元数据（仅13行）
│   └── marketplace.json        # 市场信息
├── hooks/
│   ├── hooks.json              # Hooks 配置（仅1个 hook）
│   ├── session-start.sh        # SessionStart Hook 实现
│   └── run-hook.cmd            # Windows 支持
├── skills/                     # 技能文件
│   ├── using-superpowers/
│   │   └── SKILL.md           # 元技能
│   ├── brainstorming/
│   │   └── SKILL.md
│   ├── test-driven-development/
│   │   └── SKILL.md
│   └── ...
└── lib/                        # 辅助库
```

### 2. plugin.json - 仅包含元数据

**路径**: `.claude-plugin/plugin.json`

```json
{
  "name": "superpowers",
  "description": "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques",
  "version": "4.1.1",
  "author": {
    "name": "Jesse Vincent",
    "email": "jesse@fsck.com"
  },
  "homepage": "https://github.com/obra/superpowers",
  "repository": "https://github.com/obra/superpowers",
  "license": "MIT",
  "keywords": ["skills", "tdd", "debugging", "collaboration", "best-practices", "workflows"]
}
```

**关键点**：
- ✅ 不包含 hooks 配置
- ✅ 不包含 skills 列表
- ✅ 仅是描述性元数据

### 3. hooks.json - Hooks 配置

**路径**: `hooks/hooks.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

**配置详解**：

| 字段 | 值 | 说明 |
|-----|---|-----|
| `hooks.SessionStart` | Array | SessionStart 生命周期钩子 |
| `matcher` | "startup\|resume\|clear\|compact" | 触发时机：启动、恢复、清除、压缩 |
| `type` | "command" | Hook 类型：执行命令 |
| `command` | `${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh` | 执行的脚本路径 |

**关键点**：
- ✅ 只定义了 **1 个 hook**：SessionStart
- ✅ hook 类型是 **command**（不是 function）
- ✅ hook 运行时输出 **JSON** 到 stdout
- ✅ JSON 包含 `additionalContext` 字段

### 4. session-start.sh - Hook 实现

**路径**: `hooks/session-start.sh`

```bash
#!/usr/bin/env bash
# SessionStart hook for superpowers plugin
set -euo pipefail

# Determine plugin root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Read using-superpowers content
using_superpowers_content=$(cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md" 2>&1 || echo "Error reading using-superpowers skill")

# Escape outputs for JSON
escape_for_json() {
  local input="$1"
  local output=""
  local i char

  for (( i=0; i<${#input}; i++ )); do
    char="${input:$i:1}"
    case "$char" in
      $'\\') output+='\\' ;;
      '"') output+='\"' ;;
      $'\n') output+='\\n' ;;
      $'\r') output+='\\r' ;;
      $'\t') output+='\\t' ;;
      *) output+="$char" ;;
    esac
  done

  printf '%s' "$output"
}

using_superpowers_escaped=$(escape_for_json "$using_superpowers_content")

# Output context injection as JSON
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\\nYou have superpowers.\\n\\n**Below is the full content of your 'superpowers:using-superpowers' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**\\n\\n${using_superpowers_escaped}\\n</EXTREMELY_IMPORTANT>"
  }
}
EOF

exit 0
```

**执行流程**：

```
1. Claude CLI 启动
   ↓
2. 读取 hooks.json
   ↓
3. 匹配 "startup|resume|clear|compact"
   ↓
4. 执行 session-start.sh
   ↓
5. 脚本读取 SKILL.md 文件
   ↓
6. 输出 JSON 到 stdout
   ↓
7. Claude CLI 解析 JSON
   ↓
8. 提取 additionalContext 字段
   ↓
9. 注入到 AI 上下文
```

**关键点**：
- ✅ Hook 返回 **JSON 格式**
- ✅ 使用 `hookSpecificOutput.additionalContext` 注入上下文
- ✅ 读取 `SKILL.md` 文件内容
- ✅ 使用 `<EXTREMELY_IMPORTANT>` 标记
- ✅ 退出码 0 表示成功

---

## 🎯 配置的目的

### plugin.json 的目的

| 字段 | 目的 |
|-----|------|
| `name` | 插件唯一标识符 |
| `description` | 插件功能说明 |
| `version` | 版本号，用于更新检查 |
| `author` | 作者信息 |
| `homepage/repository` | 源码链接 |
| `keywords` | 插件市场搜索关键词 |

### hooks.json 的目的

| 配置 | 目的 |
|-----|------|
| `SessionStart` | 在 Claude CLI 启动时自动注入技能上下文 |
| `matcher` | 控制何时触发（启动、恢复会话等） |
| `type: command` | 告诉 Claude CLI 执行外部脚本 |
| `command` | 指定要执行的脚本路径 |

### session-start.sh 的目的

| 步骤 | 目的 |
|-----|------|
| 读取 SKILL.md | 获取技能完整内容 |
| JSON 转义 | 确保内容正确嵌入 JSON |
| 输出 JSON | 返回给 Claude CLI 解析 |
| additionalContext | 注入到 AI 的上下文中 |

---

## 📊 上下文注入格式

### JSON 输出格式

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill...**\n\n[完整的 SKILL.md 内容]\n\n</EXTREMELY_IMPORTANT>"
  }
}
```

### 注入到 AI 的上下文

```xml
<EXTREMELY_IMPORTANT>
You have superpowers.

**Below is the full content of your 'superpowers:using-superpowers' skill - your introduction to using skills. For all other skills, use the 'Skill' tool:**

[这里插入 using-superpowers/SKILL.md 的完整内容]

</EXTREMELY_IMPORTANT>
```

**关键特征**：
- ✅ 使用 `<EXTREMELY_IMPORTANT>` 标记强调重要性
- ✅ 简短说明："You have superpowers"
- ✅ 提示使用 Skill 工具加载其他技能
- ✅ 完整的 using-superpowers 技能内容

---

## ❌ 我之前的错误理解

### 错误 1：认为需要复杂的技能扫描系统

**我的错误实现**：
- ❌ SkillScanner.js - 扫描 skills 目录
- ❌ SkillManager.js - 管理技能列表
- ❌ 技能匹配算法

**实际情况**：
- ✅ Claude CLI 有**内置的 Skill 系统**
- ✅ 自动扫描 `~/.claude/skills/` 目录
- ✅ 不需要额外代码

### 错误 2：认为需要自己创建 using-superpowers

**我的错误实现**：
- ❌ 自己编写 using-superpowers/SKILL.md
- ❌ 自己设计技能格式

**实际情况**：
- ✅ superpowers 仓库中已有完整的 SKILL.md
- ✅ 应该直接复制使用

### 错误 3：认为需要复杂的 HookManager

**我的错误实现**：
- ❌ HookManager.js - 400+ 行代码
- ❌ ContextInjector.js - 400+ 行代码
- ❌ PluginDeployer.js - 400+ 行代码

**实际情况**：
- ✅ 只需要简单的配置文件
- ✅ hooks.json 仅 10 行
- ✅ session-start.sh 仅 50 行

---

## ✅ 正确的实现策略

### 对于 Claude CLI

**已有的机制**：
- ✅ `.claude-plugin/plugin.json` - 元数据
- ✅ `hooks/hooks.json` - Hook 配置
- ✅ `hooks/session-start.sh` - Hook 实现
- ✅ `skills/*/SKILL.md` - 技能文件

**部署方式**：
```bash
# 从 GitHub 安装
/plugin install https://github.com/obra/superpowers.git

# 或手动安装
git clone https://github.com/obra/superpowers.git ~/.claude/plugins/superpowers
```

### 对于 iflow/Qwen/CodeBuddy

**这些 CLI 的特点**：
- ❌ 不支持 `.claude-plugin` 目录
- ❌ 不支持 hooks.json 的 command 类型
- ✅ 支持 `~/.cli-name/skills/` 目录
- ✅ 支持关键词自动匹配

**适配策略**：

#### 1. 技能文件格式

```yaml
---
name: brainstorming
description: Use before creative work
trigger_keywords:
  - design
  - create
  - brainstorm
  - plan
---

# Brainstorming Skill

...内容...
```

#### 2. 部署方式

```bash
# 复制技能文件到 CLI 的 skills 目录
cp -r superpowers/skills/* ~/.iflow/skills/
cp -r superpowers/skills/* ~/.qwen/skills/
cp -r superpowers/skills/* ~/.codebuddy/skills/
```

#### 3. 激活机制

- **iFlow**: 关键词匹配
- **Qwen**: trigger_keywords
- **CodeBuddy**: trigger_patterns

---

## 📋 对比总结

| 特性 | Claude CLI | iflow/Qwen/CodeBuddy |
|-----|-----------|---------------------|
| 插件目录 | `.claude-plugin/` | 不支持 |
| Hooks | `hooks/hooks.json` | 不支持 command 类型 |
| 上下文注入 | SessionStart Hook | 关键词匹配 |
| 技能目录 | `~/.claude/skills/` | `~/.cli-name/skills/` |
| 技能格式 | SKILL.md | SKILL.md + YAML frontmatter |
| 激活方式 | Skill 工具 | 自动匹配 |

---

## 🎯 结论

### Superpowers 的核心机制

1. **Hooks 配置**：通过 hooks.json 定义 SessionStart hook
2. **Hook 实现**：通过 session-start.sh 脚本读取 SKILL.md
3. **上下文注入**：通过 JSON 的 additionalContext 字段
4. **技能系统**：使用 Claude CLI 内置的 Skill 工具

### 对其他 CLI 的适配

由于 iflow/qwen/codebuddy 不支持 hooks.json 的 command 类型，需要：

1. ✅ **直接部署技能文件**到 `~/.cli-name/skills/`
2. ✅ **使用 YAML frontmatter** 定义触发关键词
3. ✅ **依赖 CLI 的自动匹配**机制

### 不需要的组件

- ❌ SkillScanner.js
- ❌ SkillManager.js
- ❌ HookManager.js
- ❌ ContextInjector.js
- ❌ PluginDeployer.js
- ❌ 复杂的部署脚本

---

**报告完成日期**: 2025-01-25
**基于**: obra/superpowers GitHub 仓库 (Commit: 4b6cef9, Jan 24, 2026)
