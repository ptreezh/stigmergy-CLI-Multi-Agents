# 三大 CLI 扩展机制对比研究报告

## 📋 研究概述

**研究日期**: 2025-01-26
**研究对象**: iFlow CLI, Qwen CLI, CodeBuddy CLI
**研究目标**: 了解各 CLI 的原生扩展/插件/Hook 机制，为部署 superpowers 提供依据

---

## 🚨 核心发现

### 三大 CLI 扩展机制对比

| CLI | 官方插件系统 | Hook 机制 | 技能系统 | 配置方式 |
|-----|------------|----------|---------|---------|
| **Claude CLI** | ✅ `.claude-plugin/` | ✅ TypeScript Hooks | ✅ OpenSkills | `hooks.json` + shell scripts |
| **iFlow CLI** | ❓ 未找到官方文档 | ❓ 基于实现推测 | ✅ Hooks + Workflows | `~/.iflow/hooks/` + YAML |
| **Qwen CLI** | ❌ **无官方扩展** | ❌ **无 Hook 系统** | ⚠️ 未文档化 | `QWEN.md` 上下文注入 |
| **CodeBuddy CLI** | ✅ Buddy System | ✅ Skills Hook | ✅ Buddy + Skills | `buddy_config.json` |

---

## 1️⃣ iFlow CLI 扩展机制

### 🔍 官方文档状态
- ❌ **未找到官方插件/Hook 文档**
- ⚠️ 现有信息基于 Stigmergy 项目的实现推测

### 📁 目录结构（基于实现推测）

```
~/.iflow/
├── hooks/
│   ├── hook_adapter.py              # Python Hook 适配器
│   ├── official_hook_adapter.py     # "官方" Hook 适配器
│   ├── workflow_adapter.py          # 工作流适配器
│   └── sessionStart.js              # SessionStart Hook 实现
├── config.json                      # 集成配置
└── IFLOW.md                         # 上下文注入
```

### ⚙️ 配置格式（推测）

#### A. YAML Hook 配置 (`~/.config/iflow/hooks.yml`)
```yaml
cross_cli_adapter:
  module: src.adapters.iflow.hook_adapter
  class: IFlowHookAdapter
  enabled: true
  priority: 100
  events:
    - workflow_start
    - task_execute
    - pipeline_complete
    - user_input
```

#### B. JSON Hook 配置（"官方"适配器）
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup|resume",
      "hooks": [{
        "type": "command",
        "command": "python -m src.adapters.iflow.official_hook_adapter SessionStart",
        "timeout": 15
      }]
    }]
  }
}
```

### 🎯 Hook 类型（9种官方 Hook 推测）

1. `PreToolUse` - 工具执行前
2. `PostToolUse` - 工具执行后
3. `SetUpEnvironment` - 环境设置
4. `Stop` - 主会话结束
5. `SubagentStop` - 子代理会话结束
6. `SessionStart` - 会话开始
7. `SessionEnd` - 会话结束
8. `UserPromptSubmit` - 用户提示提交
9. `Notification` - 通知发送

### ⚠️ 关键问题

- **验证缺失**: 这些 Hook 类型未在官方文档中验证
- **实现来源**: Stigmergy 项目的 Python 适配器实现
- **实际支持**: 不确定 iFlow CLI 是否真的支持这些 Hook

---

## 2️⃣ Qwen CLI 扩展机制

### 🚨 核心发现：**无官方扩展机制**

Qwen CLI **没有官方的插件/Hook/扩展系统**！

### 📁 实际存在的扩展方式

#### A. 上下文注入（主要方式）
```markdown
<!-- ~/.qwen/QWEN.md -->
## Cross-CLI Communication

When you need to call other AI tools, use:
stigmergy <cli-name> "prompt"

<!-- SKILLS_START -->
<skills_system priority="1">
<available_skills>
<skill>
<name>brainstorming</name>
<description>Skill deployed from Stigmergy</description>
<location>stigmergy</location>
</skill>
</available_skills>
</skills_system>
<!-- SKILLS_END -->
```

#### B. Skills 目录（未文档化）
```
~/.qwen/skills/<skill-name>/
└── skill.md
```

**格式**:
```markdown
---
name: brainstorming
description: "You MUST use this before any creative work"
---

# Brainstorming Ideas Into Designs
[Instructions...]
```

### ❌ 不存在的功能

| 功能 | 状态 | 说明 |
|-----|------|-----|
| Plugin API | ❌ | 无插件系统 |
| Hook System | ❌ | 无 Hook 系统 |
| Code Execution | ❌ | 无法执行 TypeScript/JavaScript |
| Event Lifecycle | ❌ | 无事件系统 |
| `hooks.json` | ❌ | **Qwen CLI 不读取此文件** |

### 📊 package.json 分析

```json
{
  "name": "@qwen-code/qwen-code",
  "version": "0.7.2",
  "bin": { "qwen": "cli.js" },
  "files": ["cli.js", "vendor", "*.sb", "README.md", "locales"],
  "engines": { "node": ">=20.0.0" }
}
```

**未包含**:
- ❌ No `plugin` configuration
- ❌ No `hook` system
- ❌ No `skill` loading mechanism
- ❌ No `extension` API

### ✅ 实际可用的扩展方法

1. **编辑 `QWEN.md`** - 上下文注入（推荐）
2. **创建 `skills/` 目录** - 技能文件（未验证是否自动加载）
3. **包装脚本** - Shell wrapper（高级）

---

## 3️⃣ CodeBuddy CLI 扩展机制

### 🎯 Buddy System（主要机制）

CodeBuddy CLI 使用 **Buddy System** 进行扩展。

### 📁 目录结构

```
~/.codebuddy/
├── buddy_config.json          # Buddy 配置
├── skills_hooks.json          # Skills Hook 配置
├── hooks/                     # Hook 脚本
├── buddies/                   # Buddy 模块
│   └── [skill_name]/
│       ├── skill.json         # 技能元数据
│       ├── main.py            # 入口点
│       └── hooks.json         # Hook 处理器
└── CROSS_CLI_GUIDE.md         # 跨 CLI 文档
```

### ⚙️ 配置格式

#### `buddy_config.json`
```json
{
  "version": "1.0.0",
  "skills": [
    {
      "name": "CrossCLICoordinationSkill",
      "description": "Cross-CLI tool coordination skill",
      "module": "src.adapters.codebuddy.skills_hook_adapter",
      "class": "CodeBuddySkillsHookAdapter",
      "enabled": true,
      "priority": 100,
      "triggers": [
        "on_skill_activation",
        "on_user_command"
      ],
      "config": {
        "cross_cli_enabled": true,
        "supported_clis": ["claude", "gemini", "qwen", "iflow", "qoder", "copilot"],
        "auto_route": true,
        "timeout": 30,
        "collaboration_mode": "active"
      }
    }
  ]
}
```

### 🎯 Hook 类型

| Hook 类型 | 说明 |
|----------|-----|
| `PRE_COMMAND` | 命令执行前 |
| `POST_COMMAND` | 命令执行后 |
| `ERROR` | 错误处理 |
| `SESSION_START` | 会话初始化 |
| `SESSION_END` | 会话清理 |
| `SKILL_REGISTER` | 技能注册 |
| `CROSS_CLI_REQUEST` | 跨 CLI 协调 |

### 🏗️ Buddy System 架构

```python
@dataclass
class BuddySkill:
    """Buddy技能数据类"""
    name: str
    description: str
    version: str = "1.0.0"
    capabilities: List[str]
    priority: int = 50
    supported_clis: List[str]
    protocols: List[str]
    cross_cli_enabled: bool = True
    auto_collaboration: bool = False
    requires_authorization: bool = False
    dependencies: List[str]
    metadata: Dict[str, Any]
```

---

## 📊 三大机制详细对比

### 对比表

| 特性 | Claude CLI | iFlow CLI | Qwen CLI | CodeBuddy CLI |
|-----|-----------|----------|----------|---------------|
| **官方插件系统** | ✅ | ❓ | ❌ | ✅ |
| **Hook 系统** | ✅ TypeScript | ⚠️ 推测 | ❌ | ✅ Python |
| **配置格式** | JSON | YAML/JSON | Markdown | JSON |
| **配置位置** | `.claude-plugin/` | `~/.iflow/hooks/` | `~/.qwen/QWEN.md` | `~/.codebuddy/` |
| **代码执行** | ✅ Shell/TS | ⚠️ Python | ❌ | ✅ Python |
| **技能系统** | ✅ OpenSkills | ⚠️ Hooks+Workflows | ⚠️ 未文档化 | ✅ Buddy+Skills |
| **事件驱动** | ✅ | ⚠️ 推测 | ❌ | ✅ |
| **官方文档** | ✅ 完整 | ❌ 未找到 | ❌ 无扩展系统 | ⚠️ 有限 |
| **扩展性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Superpowers 部署建议

### 对于 Claude CLI（✅ 已实现）

**部署方式**:
```bash
# 从 GitHub 安装
/plugin install https://github.com/obra/superpowers.git
```

**机制**:
1. `.claude-plugin/plugin.json` - 元数据
2. `hooks/hooks.json` - Hook 配置
3. `hooks/session-start.sh` - Hook 实现
4. `skills/*/SKILL.md` - 技能文件

---

### 对于 iFlow CLI（⚠️ 需验证）

**建议方案 A**: 使用 Hook 适配器（需验证）
```bash
# 部署 Hook 配置
cp hooks/iflow_hooks.json ~/.iflow/hooks.json

# 部署 Hook 实现
cp hooks/iflow_sessionStart.py ~/.iflow/hooks/
```

**建议方案 B**: 使用上下文注入（最稳妥）
```bash
# 编辑 IFLOW.md，注入技能上下文
# <!-- SKILLS_START -->...<!-- SKILLS_END -->
```

**建议方案 C**: 混合方案
1. 上下文注入到 `IFLOW.md`（立即可用）
2. Hook 适配器（待验证后启用）

---

### 对于 Qwen CLI（✅ 已有方案）

**推荐方案**: 上下文注入

```bash
# 1. 复制技能文件到 Qwen 技能目录
cp -r superpowers/skills/* ~/.qwen/skills/

# 2. 编辑 QWEN.md，添加技能引用
# <!-- SKILLS_START -->...<!-- SKILLS_END -->
```

**⚠️ 注意**:
- ❌ 不要依赖 `hooks.json`（Qwen 不读取）
- ✅ 只能使用上下文注入
- ✅ 技能目录存在但加载机制未文档化

---

### 对于 CodeBuddy CLI（✅ 已有方案）

**推荐方案**: Buddy System

```bash
# 1. 创建 Buddy 配置
cat > ~/.codebuddy/buddy_config.json <<EOF
{
  "version": "1.0.0",
  "skills": [
    {
      "name": "superpowers-brainstorming",
      "description": "Brainstorming skill from superpowers",
      "module": "skills.brainstorming",
      "enabled": true,
      "priority": 100
    }
  ]
}
EOF

# 2. 部署技能文件
cp -r superpowers/skills/* ~/.codebuddy/buddies/
```

---

## 🔧 Stigmergy 组件评估

### 已创建的组件

| 组件 | 功能 | 适用 CLI | 状态 |
|-----|------|---------|------|
| `HookManager.js` | 管理 Hook 配置 | iFlow, CodeBuddy | ⚠️ 需验证 |
| `ContextInjector.js` | 注入上下文 | Qwen, iFlow | ✅ 可用 |
| `PluginDeployer.js` | 集成部署 | 全部 | ✅ 部分可用 |

### 组件与 CLI 机制对应

#### iFlow CLI
- ❓ **HookManager**: 需验证 iFlow 是否真的支持 Hook
- ✅ **ContextInjector**: 完全适用，通过 IFLOW.md 注入
- ⚠️ **PluginDeployer**: 部分适用，上下文注入部分可用

#### Qwen CLI
- ❌ **HookManager**: **不适用** - Qwen 无 Hook 系统
- ✅ **ContextInjector**: **完全适用** - QWEN.md 上下文注入
- ⚠️ **PluginDeployer**: 部分适用，只使用上下文注入功能

#### CodeBuddy CLI
- ✅ **HookManager**: **适用** - 支持 Buddy/Skills Hook
- ✅ **ContextInjector**: 适用 - 通过配置文件注入
- ✅ **PluginDeployer**: **适用** - 完整部署支持

---

## 📋 下一步行动

### 立即行动
1. ✅ **保留组件**: HookManager, ContextInjector, PluginDeployer
2. ✅ **调整部署策略**: 根据各 CLI 实际机制调整
3. ⚠️ **验证 iFlow**: 确认 iFlow 是否真的支持 Hook

### 短期任务
1. **iFlow CLI**:
   - [ ] 查找官方文档验证 Hook 机制
   - [ ] 测试上下文注入是否工作
   - [ ] 确定 Hook 配置格式

2. **Qwen CLI**:
   - [ ] 测试 QWEN.md 上下文注入
   - [ ] 验证 skills/ 目录加载机制
   - [ ] 更新部署脚本移除 hooks.json

3. **CodeBuddy CLI**:
   - [ ] 验证 buddy_config.json 格式
   - [ ] 测试 Buddy 技能加载
   - [ ] 确认 Hook 类型

### 长期规划
1. **为每个 CLI 创建专门的部署脚本**
2. **编写 CLI 特定的集成文档**
3. **创建统一的部署接口**

---

## 🎓 结论

### 关键洞察

1. **Claude CLI**: ✅ 完美支持，官方 Hook 系统
2. **iFlow CLI**: ⚠️ 机制不明确，需要验证
3. **Qwen CLI**: ❌ 无扩展系统，只能上下文注入
4. **CodeBuddy CLI**: ✅ 有 Buddy System，相对完整

### Superpowers 部署策略

| CLI | 推荐方式 | 难度 | 可靠性 |
|-----|---------|-----|--------|
| Claude | Hook + Shell 脚本 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| iFlow | 上下文注入为主 | ⭐⭐⭐ | ⭐⭐⭐ |
| Qwen | 仅上下文注入 | ⭐ | ⭐⭐⭐⭐ |
| CodeBuddy | Buddy System | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### Stigmergy 组件决策

**保留**:
- ✅ `HookManager.js` - 为 Claude 和 CodeBuddy 使用
- ✅ `ContextInjector.js` - 为所有 CLI 使用（通用）
- ✅ `PluginDeployer.js` - 作为统一部署接口

**优化方向**:
1. 为不同 CLI 使用不同的部署策略
2. 添加 CLI 类型检测和自适应
3. 针对无 Hook 系统的 CLI 降级到上下文注入

---

**报告完成日期**: 2025-01-26
**研究方法**: 代码分析 + 配置文件检查 + 官方仓库调研
**可靠性**: 中等（部分 CLI 缺乏官方文档验证）
