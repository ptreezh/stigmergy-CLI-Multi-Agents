# iFlow CLI Workflow 机制使用指南

## 📋 概述

iFlow CLI 拥有强大的 **Workflow Pipeline 系统**，允许通过工作流机制扩展功能。本指南说明如何部署和使用 superpowers 技能与 iFlow 的 workflow 系统集成。

---

## 🚀 快速开始

### 1. 部署 Workflow 集成

```bash
# 部署 superpowers workflow 集成
node scripts/deploy-iflow-workflow.js

# 验证部署
node scripts/test-iflow-workflow.js

# 查看部署状态（不修改文件）
node scripts/deploy-iflow-workflow.js --dry-run
```

### 2. 卸载（如果需要）

```bash
# 卸载 workflow 集成
node scripts/deploy-iflow-workflow.js --uninstall
```

---

## 📁 部署的文件

部署后，以下文件将被创建/修改：

```
~/.iflow/
├── workflow_config.json          # ⭐ Workflow 配置（核心）
├── hooks/
│   └── superpowers_workflow.py   # Workflow Hook 实现
└── IFLOW.md                      # ⭐ 技能上下文注入
```

---

## ⚙️ 配置说明

### workflow_config.json

```json
{
  "workflow": {
    "enabled": true,
    "cross_cli_integration": true,
    "superpowers_integration": true,
    "default_timeout": 30
  },
  "superpowers": {
    "enabled": true,
    "version": "4.1.1",
    "skills": [
      "brainstorming",
      "test-driven-development",
      "debugging",
      "collaboration",
      "verification-before-completion"
    ]
  },
  "pipeline": {
    "stages": [
      { "name": "skill_activation", "timeout": 5 },
      { "name": "task_planning", "timeout": 15 },
      { "name": "execution", "timeout": 30 },
      { "name": "verification", "timeout": 10 }
    ]
  },
  "workflows": {
    "brainstorming": {
      "trigger_keywords": ["design", "create", "brainstorm"],
      "stages": ["skill_activation", "task_planning", "execution"]
    },
    "test-driven-development": {
      "trigger_keywords": ["implement", "feature", "test"],
      "stages": ["skill_activation", "task_planning", "execution", "verification"]
    }
  }
}
```

---

## 🎯 可用的工作流

部署后，以下工作流将自动可用：

### 1. Brainstorming Workflow

**触发关键词**: `design`, `create`, `brainstorm`, `plan`, `architecture`

**阶段**:
- Skill Activation
- Task Planning
- Execution

**使用示例**:
```
Design a new API endpoint for user authentication
```

### 2. Test-Driven Development Workflow

**触发关键词**: `implement`, `feature`, `function`, `code`, `test`

**阶段**:
- Skill Activation
- Task Planning
- Execution
- Verification

**使用示例**:
```
Implement a function to validate email addresses
```

### 3. Debugging Workflow

**触发关键词**: `debug`, `fix`, `error`, `issue`, `problem`, `broken`

**阶段**:
- Skill Activation
- Execution
- Verification

**使用示例**:
```
Debug the authentication failing on login
```

---

## 🔧 Workflow Hooks

### on_workflow_start

工作流开始时触发，用于：
- 激活相关技能
- 读取配置
- 初始化上下文

**实现**: `~/.iflow/hooks/superpowers_workflow.py`

### on_stage_complete

每个阶段完成时触发，用于：
- 检查阶段结果
- 更新进度
- 记录日志

### on_workflow_success

工作流成功完成时触发，用于：
- 记录成功结果
- 清理资源
- 通知用户

### on_workflow_error

工作流错误时触发，用于：
- 记录错误
- 尝试恢复
- 通知用户

---

## 📊 Workflow Pipeline 阶段

### Stage 1: Skill Activation (5s timeout)

**目的**: 根据任务上下文激活适当的技能

**逻辑**:
1. 分析用户输入
2. 匹配关键词到技能
3. 激活相关技能
4. 加载技能上下文

### Stage 2: Task Planning (15s timeout)

**目的**: 使用激活的技能规划任务执行

**逻辑**:
1. 理解任务需求
2. 制定执行计划
3. 识别依赖关系
4. 估算时间和资源

### Stage 3: Execution (30s timeout)

**目的**: 执行实际任务

**逻辑**:
1. 按计划执行步骤
2. 应用技能指导
3. 处理中间结果
4. 记录进度

### Stage 4: Verification (10s timeout, optional)

**目的**: 验证结果正确性

**逻辑**:
1. 检查完成标准
2. 运行验证测试
3. 审查代码/输出
4. 确认质量

---

## 💡 使用技巧

### 自动工作流选择

iFlow workflow 系统会根据关键词自动选择合适的工作流：

```
# 自动选择 brainstorming workflow
"Plan the architecture for a microservices system"

# 自动选择 TDD workflow
"Implement a user login function with tests"

# 自动选择 debugging workflow
"Fix the bug causing null pointer exception"
```

### 手动技能激活

你也可以在提示词中明确指定技能：

```
"Use the brainstorming skill to design a new feature"
"Apply test-driven development to implement this"
"Debug this issue using systematic debugging"
```

### 工作流阶段控制

可以通过描述来控制工作流执行到特定阶段：

```
"Plan the implementation (don't execute yet)"
"Execute the planned task"
"Verify the completed work"
```

---

## 🧪 测试部署

运行测试套件验证部署：

```bash
node scripts/test-iflow-workflow.js
```

测试包括：
1. ✅ 配置文件存在性
2. ✅ 配置结构有效性
3. ✅ Workflow Hooks 存在性
4. ✅ 上下文注入正确性
5. ✅ 工作流定义完整性
6. ✅ 技能配置正确性

---

## 🔍 故障排查

### 问题：工作流未激活

**检查**:
```bash
# 验证配置
cat ~/.iflow/workflow_config.json | grep enabled

# 检查 Hook
ls -la ~/.iflow/hooks/superpowers_workflow.py
```

**解决**:
```bash
# 重新部署
node scripts/deploy-iflow-workflow.js
```

### 问题：技能未加载

**检查**:
```bash
# 验证 IFLOW.md 包含技能部分
grep -A 5 "SKILLS_START" ~/.iflow/IFLOW.md
```

**解决**:
```bash
# 重新注入上下文
node scripts/deploy-iflow-workflow.js
```

### 问题：工作流卡住

**检查**:
```bash
# 查看超时设置
cat ~/.iflow/workflow_config.json | grep timeout
```

**解决**:
编辑 `workflow_config.json` 增加超时时间

---

## 📚 高级配置

### 自定义工作流

编辑 `~/.iflow/workflow_config.json` 添加自定义工作流：

```json
{
  "workflows": {
    "my-custom-workflow": {
      "description": "My custom workflow",
      "trigger_keywords": ["custom", "specific"],
      "stages": ["skill_activation", "execution"]
    }
  }
}
```

### 添加新技能

1. 在 `workflow_config.json` 中添加技能名称：
```json
{
  "superpowers": {
    "skills": [
      "brainstorming",
      "my-custom-skill"
    ]
  }
}
```

2. 在 `IFLOW.md` 中添加技能定义：
```markdown
<skill>
<name>my-custom-skill</name>
<description>Description of my custom skill</description>
<location>superpowers</location>
<trigger_keywords>custom, specific</trigger_keywords>
</skill>
```

### 调整 Pipeline 阶段

编辑 `pipeline.stages` 配置：

```json
{
  "pipeline": {
    "stages": [
      {
        "name": "my-custom-stage",
        "description": "My custom stage",
        "required": true,
        "timeout": 20
      }
    ]
  }
}
```

---

## 🎓 最佳实践

### 1. 使用描述性提示词

好的示例：
```
"Design a RESTful API for user management with authentication"
```

不好的示例：
```
"user api"
```

### 2. 利用工作流阶段

明确你的意图：
```
"Plan the database schema first (don't implement yet)"
"Now implement the planned schema"
"Finally, verify the implementation"
```

### 3. 结合技能使用

```
"Use brainstorming to explore approaches, then TDD to implement"
```

### 4. 提供足够的上下文

```
"Implement a login function using JWT tokens for the React frontend"
```

---

## 🔗 相关资源

- **Superpowers 官方仓库**: https://github.com/obra/superpowers
- **iFlow CLI 文档**: https://github.com/QwenLM/qwen-code
- **Stigmergy 项目**: https://github.com/your-org/stigmergy-cli-multi-agents

---

## 📝 更新日志

### v1.0.0 (2025-01-26)
- ✅ 初始版本
- ✅ 支持 3 个核心工作流
- ✅ 5 个 superpowers 技能
- ✅ 完整的 Pipeline 系统
- ✅ 自动化部署和测试

---

**文档版本**: 1.0.0
**最后更新**: 2025-01-26
**维护者**: Stigmergy Project
