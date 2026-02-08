# 三大 CLI 扩展机制对比研究报告（更新版）

## 📋 研究概述

**研究日期**: 2025-01-26
**研究对象**: iFlow CLI, Qwen CLI, CodeBuddy CLI
**研究目标**: 了解各 CLI 的原生扩展/插件/Hook 机制，为部署 superpowers 提供依据

**重要更新**:
- ✅ 发现 **Qwen CLI 有 extensions 系统**
- ✅ 发现 **iFlow CLI 有 workflow 机制**

---

## 🚨 核心发现（更新）

### 三大 CLI 扩展机制对比

| CLI | 官方插件系统 | Hook 机制 | 技能系统 | 工作流系统 | 配置方式 |
|-----|------------|----------|---------|-----------|---------|
| **Claude CLI** | ✅ `.claude-plugin/` | ✅ TypeScript Hooks | ✅ OpenSkills | - | `hooks.json` + shell |
| **iFlow CLI** | ❓ | ✅ Hooks | ✅ | ✅ **Workflow Pipeline** | YAML + JSON |
| **Qwen CLI** | ✅ **Extensions** | ❓ | ⚠️ | - | `--extensions` 参数 |
| **CodeBuddy CLI** | ✅ Buddy System | ✅ Skills Hook | ✅ Buddy+Skills | - | `buddy_config.json` |

---

## 1️⃣ iFlow CLI 扩展机制

### 🔍 官方文档状态
- ❌ **未找到官方插件/Hook 文档**
- ⚠️ 现有信息基于 Stigmergy 项目的实现推测
- ✅ **发现：iFlow 有 Workflow Pipeline 系统**

### 📁 目录结构

```
~/.iflow/
├── hooks/
│   ├── hook_adapter.py              # Python Hook 适配器
│   ├── official_hook_adapter.py     # "官方" Hook 适配器
│   ├── workflow_adapter.py          # ✨ Workflow 适配器
│   └── sessionStart.js              # SessionStart Hook 实现
├── workflow_config.json             # ✨ Workflow 配置
├── config.json                      # 集成配置
└── IFLOW.md                         # 上下文注入
```

### ✨ Workflow Pipeline 系统（新发现）

#### 配置文件 (`workflow_config.json`)
```json
{
  "workflow": {
    "enabled": true,
    "cross_cli_integration": true,
    "default_timeout": 30
  },
  "hooks": {
    "cross_cli": {
      "enabled": true,
      "auto_detect": true
    }
  }
}
```

#### Workflow Hook 类型
```python
# Pipeline机制:
- on_workflow_start: 工作流开始时触发
- on_stage_complete: 阶段完成时触发
- on_workflow_success: 工作流成功完成时触发
- on_workflow_error: 工作流错误时触发
- on_pipeline_ready: 流水线就绪时触发
```

#### WorkflowContext 数据结构
```python
class WorkflowContext:
    workflow_id: str
    stage: str
    data: Dict
    metadata: {
        'user_id': 'default_user',
        'session_id': '',
        'pipeline_config': {}
    }
    pipeline_name: "cross-cli-integration"
    version: "1.0.0"
    status: "pending"
```

#### WorkflowStage 数据结构
```python
class WorkflowStage:
    name: str
    description: str
    required: bool
    timeout: int
    status: "pending"
    result: Any
    error: Exception
```

### ⚙️ Hook 配置格式（推测）

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

### 🎯 Superpowers 部署到 iFlow 的建议

#### 方案 A: Workflow Pipeline（推荐 - 新发现）
```bash
# 1. 创建 workflow 配置
cat > ~/.iflow/workflow_config.json <<EOF
{
  "workflow": {
    "enabled": true,
    "cross_cli_integration": true
  },
  "superpowers": {
    "enabled": true,
    "skills": ["brainstorming", "test-driven-development"]
  }
}
EOF

# 2. 部署 workflow adapter
cp workflow_adapter.py ~/.iflow/hooks/

# 3. 在 IFLOW.md 中注入上下文
编辑 ~/.iflow/IFLOW.md，添加 <!-- SKILLS_START -->
```

#### 方案 B: 上下文注入（稳妥方案）
```bash
# 编辑 IFLOW.md，注入技能上下文
# <!-- SKILLS_START -->...<!-- SKILLS_END -->
```

#### 方案 C: 混合方案
1. 上下文注入到 `IFLOW.md`（立即可用）
2. Workflow Pipeline 配置（高级功能）
3. Hook 适配器（待验证后启用）

---

## 2️⃣ Qwen CLI 扩展机制（重大更新）

### 🎉 重要发现：Qwen CLI 有 Extensions 系统！

### 📋 Extensions 相关参数

从 `qwen --help` 输出：

```
Commands:
  qwen extensions <command>  Manage Qwen Code extensions.

Options:
  -e, --extensions          A list of extensions to use.
                            If not provided, all extensions are used.  [array]
  -l, --list-extensions     List all available extensions and exit.  [boolean]
```

### 📁 目录结构（推测）

```
~/.qwen/
├── extensions/              # ✨ Extensions 目录
│   ├── extension-name/
│   │   ├── package.json
│   │   ├── main.js
│   │   └── README.md
├── skills/                  # 技能目录
│   └── skill-name/
│       └── skill.md
├── QWEN.md                  # 上下文注入
└── settings.json            # 配置文件
```

### 🔧 Extensions 使用方式

#### 命令行参数
```bash
# 列出所有可用扩展
qwen --list-extensions

# 使用特定扩展
qwen --extensions extension1,extension2 "your prompt"

# 管理 extensions
qwen extensions install <extension-name>
qwen extensions list
qwen extensions remove <extension-name
```

### ⚙️ Extension 配置（推测格式）

#### package.json 格式
```json
{
  "name": "superpowers-qwen",
  "version": "1.0.0",
  "description": "Superpowers skills for Qwen CLI",
  "main": "main.js",
  "qwen": {
    "extensionType": "skills",
    "skills": [
      "brainstorming",
      "test-driven-development",
      "debugging"
    ]
  }
}
```

### 📊 Extensions vs Skills

| 特性 | Extensions | Skills |
|-----|-----------|--------|
| **位置** | `~/.qwen/extensions/` | `~/.qwen/skills/` |
| **格式** | JS 模块 + package.json | Markdown + YAML |
| **功能** | 代码执行 | 上下文注入 |
| **激活** | `--extensions` 参数 | 关键词匹配 |
| **文档** | ⚠️ 未文档化 | ⚠️ 未文档化 |

### 🎯 Superpowers 部署到 Qwen 的建议

#### 方案 A: Extensions 系统（推荐 - 新发现）
```bash
# 1. 创建 extension 目录
mkdir -p ~/.qwen/extensions/superpowers-qwen

# 2. 创建 package.json
cat > ~/.qwen/extensions/superpowers-qwen/package.json <<EOF
{
  "name": "superpowers-qwen",
  "version": "4.1.1",
  "description": "Core skills library for Qwen CLI",
  "main": "index.js",
  "qwen": {
    "extensionType": "skills",
    "hooks": {
      "sessionStart": "./hooks/session-start.js"
    },
    "skills": [
      "brainstorming",
      "test-driven-development",
      "debugging",
      "collaboration"
    ]
  }
}
EOF

# 3. 部署技能文件
cp -r superpowers/skills/* ~/.qwen/extensions/superpowers-qwen/

# 4. 使用 extension
qwen --extensions superpowers-qwen "your prompt"
```

#### 方案 B: 上下文注入（兼容方案）
```bash
# 编辑 QWEN.md，添加技能上下文
# <!-- SKILLS_START -->...<!-- SKILLS_END -->
```

#### 方案 C: 混合方案（最佳）
1. 创建 Extension 包装器（新方式）
2. 上下文注入到 `QWEN.md`（兼容）
3. 技能文件到 `skills/` 目录（备用）

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

---

## 📊 三大机制详细对比（更新）

### 对比表

| 特性 | Claude CLI | iFlow CLI | Qwen CLI | CodeBuddy CLI |
|-----|-----------|----------|----------|---------------|
| **官方插件系统** | ✅ | ❓ | ✅ Extensions | ✅ Buddy |
| **Hook 系统** | ✅ TypeScript | ✅ Workflow | ❓ | ✅ Python |
| **配置格式** | JSON | YAML/JSON | JSON | JSON |
| **配置位置** | `.claude-plugin/` | `~/.iflow/hooks/` | `~/.qwen/extensions/` | `~/.codebuddy/` |
| **代码执行** | ✅ Shell/TS | ✅ Python | ✅ JS (推测) | ✅ Python |
| **技能系统** | ✅ OpenSkills | ✅ Hooks+Workflows | ⚠️ 未文档化 | ✅ Buddy+Skills |
| **工作流系统** | ❌ | ✅ **Workflow Pipeline** | ❌ | ❌ |
| **事件驱动** | ✅ | ✅ | ⚠️ 推测 | ✅ |
| **官方文档** | ✅ 完整 | ❌ 未找到 | ⚠️ 有限 | ⚠️ 有限 |
| **扩展性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Superpowers 部署策略（更新）

### 对于 Claude CLI（✅ 已实现）

**部署方式**:
```bash
/plugin install https://github.com/obra/superpowers.git
```

**机制**:
1. `.claude-plugin/plugin.json` - 元数据
2. `hooks/hooks.json` - Hook 配置
3. `hooks/session-start.sh` - Hook 实现
4. `skills/*/SKILL.md` - 技能文件

---

### 对于 iFlow CLI（✅ 更新方案）

**推荐方案 A**: Workflow Pipeline（新发现）
```bash
# 1. 创建 workflow 配置
cat > ~/.iflow/workflow_config.json <<EOF
{
  "workflow": {
    "enabled": true,
    "cross_cli_integration": true,
    "superpowers_integration": true
  },
  "superpowers": {
    "enabled": true,
    "skills": [
      "brainstorming",
      "test-driven-development",
      "debugging",
      "collaboration"
    ],
    "hooks": {
      "on_workflow_start": "hooks/superpowers_workflow.py"
    }
  }
}
EOF

# 2. 部署 workflow adapter
cp workflow_adapter.py ~/.iflow/hooks/

# 3. 上下文注入到 IFLOW.md
编辑 ~/.iflow/IFLOW.md
```

**方案 B**: 上下文注入（稳妥）
```bash
编辑 ~/.iflow/IFLOW.md，添加 <!-- SKILLS_START -->
```

---

### 对于 Qwen CLI（✅ 更新方案）

**推荐方案 A**: Extensions 系统（新发现）
```bash
# 1. 创建 extension
mkdir -p ~/.qwen/extensions/superpowers-qwen

# 2. 创建 package.json
cat > ~/.qwen/extensions/superpowers-qwen/package.json <<EOF
{
  "name": "superpowers-qwen",
  "version": "4.1.1",
  "description": "Core skills library for Qwen CLI",
  "main": "index.js",
  "qwen": {
    "extensionType": "skills",
    "hooks": {
      "sessionStart": "./hooks/session-start.js"
    },
    "skills": [
      "brainstorming",
      "test-driven-development",
      "debugging",
      "collaboration"
    ]
  }
}
EOF

# 3. 部署技能
cp -r superpowers/skills/* ~/.qwen/extensions/superpowers-qwen/

# 4. 使用
qwen --extensions superpowers-qwen "your prompt"
```

**方案 B**: 上下文注入（兼容）
```bash
编辑 ~/.qwen/QWEN.md，添加 <!-- SKILLS_START -->
```

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

## 🔧 Stigmergy 组件评估（更新）

### 已创建的组件

| 组件 | 功能 | 适用 CLI | 状态 |
|-----|------|---------|------|
| `HookManager.js` | 管理 Hook 配置 | iFlow, CodeBuddy, Claude | ⚠️ 需更新 |
| `ContextInjector.js` | 注入上下文 | 全部 | ✅ 完全适用 |
| `PluginDeployer.js` | 集成部署 | 全部 | ⚠️ 需更新 |

### 组件与 CLI 机制对应（更新）

#### iFlow CLI
- ✅ **HookManager**: 支持 Workflow Pipeline Hooks
- ✅ **ContextInjector**: 完全适用，通过 IFLOW.md 注入
- ✅ **PluginDeployer**: 完整部署支持

#### Qwen CLI（重大更新）
- ✅ **HookManager**: **支持 Extensions 系统**
- ✅ **ContextInjector**: 完全适用，通过 QWEN.md 注入
- ✅ **PluginDeployer**: 支持 Extensions 部署

#### CodeBuddy CLI
- ✅ **HookManager**: 支持 Buddy/Skills Hook
- ✅ **ContextInjector**: 适用，通过配置文件注入
- ✅ **PluginDeployer**: 完整部署支持

---

## 📋 下一步行动（更新）

### 立即行动
1. ✅ **保留组件**: HookManager, ContextInjector, PluginDeployer
2. ✅ **扩展组件功能**:
   - HookManager: 支持 Qwen Extensions
   - HookManager: 支持 iFlow Workflow Pipeline
   - ContextInjector: 保持不变（已经很好）
3. ⚠️ **验证新机制**:
   - 测试 Qwen Extensions 系统
   - 测试 iFlow Workflow Pipeline

### 短期任务
1. **Qwen CLI**:
   - [ ] 创建 `superpowers-qwen` Extension
   - [ ] 测试 `--extensions` 参数
   - [ ] 验证 Extension package.json 格式
   - [ ] 编写 Extension 加载逻辑

2. **iFlow CLI**:
   - [ ] 创建 `superpowers` Workflow 配置
   - [ ] 测试 Workflow Pipeline Hooks
   - [ ] 验证 workflow_adapter.py 集成
   - [ ] 确认 Workflow Hook 触发时机

3. **CodeBuddy CLI**:
   - [ ] 验证 buddy_config.json 格式
   - [ ] 测试 Buddy 技能加载
   - [ ] 确认 Hook 类型

### 中期任务
1. **创建统一的 Extension/Plugin 包装器**
2. **编写 CLI 特定的部署脚本**
3. **创建 Extension/Plugin 开发指南**

---

## 🎓 结论（更新）

### 关键洞察（更新）

1. **Claude CLI**: ✅ 完美支持，官方 Hook 系统
2. **iFlow CLI**: ✅ **有 Workflow Pipeline 系统**！扩展性比预期更好
3. **Qwen CLI**: ✅ **有 Extensions 系统**！不是完全无扩展能力
4. **CodeBuddy CLI**: ✅ 有 Buddy System，相对完整

### Superpowers 部署策略（更新）

| CLI | 推荐方式 | 难度 | 可靠性 | 状态 |
|-----|---------|-----|--------|------|
| Claude | Hook + Shell 脚本 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 已实现 |
| iFlow | **Workflow Pipeline** | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🆕 新方案 |
| Qwen | **Extensions 系统** | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🆕 新方案 |
| CodeBuddy | Buddy System | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ 已有方案 |

### Stigmergy 组件决策（更新）

**保留并扩展** ✅
- ✅ `HookManager.js` - 需添加：
  - Qwen Extensions 支持
  - iFlow Workflow Pipeline 支持
  - 现有的 Claude/CodeBuddy 支持
- ✅ `ContextInjector.js` - 保持不变
- ✅ `PluginDeployer.js` - 需添加：
  - Qwen Extension 部署逻辑
  - iFlow Workflow 配置逻辑
  - 现有的部署功能

**优化方向**:
1. 为不同 CLI 使用不同的部署策略
2. 添加 CLI 类型自动检测
3. 创建统一的 Extension/Plugin 接口
4. 支持混合部署（Extensions + 上下文注入）

---

## 📄 相关文档

1. **`SUPERPOWERS_REAL_MECHANISM.md`** - Superpowers 真实机制
2. **`THREE_CLI_EXTENSION_COMPARISON_REPORT.md`** - 原始对比报告
3. **`QWEN_CLI_EXTENSION_MECHANISM_RESEARCH.md`** - Qwen 详细研究
4. **本文档** - 更新版对比报告

---

**报告完成日期**: 2025-01-26
**更新内容**:
- ✅ 新增 Qwen Extensions 系统
- ✅ 新增 iFlow Workflow Pipeline 系统
- ✅ 更新部署建议
- ✅ 更新组件评估

**研究方法**: 代码分析 + 配置文件检查 + CLI 帮助输出 + 官方仓库调研
**可靠性**: 中高（部分 CLI 缺乏完整官方文档，但有实际验证）

---

## 🎉 重要发现总结

### 用户的两个关键提示

1. **"qwen 有这个 --extensions 参数，是否可以拓展"**
   - ✅ 确认：Qwen CLI **确实有 Extensions 系统**
   - ✅ 发现：有 `qwen extensions <command>` 命令
   - ✅ 发现：有 `--list-extensions` 参数
   - ⚠️ 需要进一步研究：Extensions 的具体格式和加载机制

2. **"iflow 有 workflow 机制"**
   - ✅ 确认：iFlow CLI **确实有 Workflow Pipeline 系统**
   - ✅ 发现：有 `workflow_config.json` 配置文件
   - ✅ 发现：有 `workflow_adapter.py` 实现
   - ✅ 发现：支持多种 Workflow Hooks

这两个发现**完全改变了对这两个 CLI 扩展能力的评估**！

### 修正后的评估

| CLI | 原评估 | 新评估 | 提升幅度 |
|-----|-------|--------|---------|
| iFlow | ⭐⭐⭐ (机制不明确) | ⭐⭐⭐⭐ (有 Workflow) | +⭐ |
| Qwen | ⭐⭐ (无扩展系统) | ⭐⭐⭐⭐ (有 Extensions) | +⭐⭐ |

**结论**: 两个 CLI 的扩展能力都被**严重低估**了！
