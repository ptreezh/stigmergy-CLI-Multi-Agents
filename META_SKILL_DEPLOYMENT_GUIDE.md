# Meta-Skill 部署指南 - 完整方法论注入

## 🎯 核心改进

从 **技能列表注入** 升级到 **完整方法论注入**

---

## ❌ 之前的错误实现

**只注入了技能元数据**：
```xml
<skill>
  <name>brainstorming</name>
  <description>Use before creative work</description>
  <trigger_keywords>design, create, brainstorm</trigger_keywords>
</skill>
```

**问题**：
- ❌ 没有告诉 AI **如何使用** 技能
- ❌ 没有强制执行的 **协议和检查清单**
- ❌ 没有 **警示信号** 防止错误思维
- ❌ 没有 **技能发现机制** 说明

---

## ✅ 新的正确实现

**注入完整的元技能**（类似 superpowers 的 using-superpowers）：

### 1. 强制协议（Mandatory Protocol）

```xml
<EXTREMELY_IMPORTANT>
You are using iFlow CLI with Stigmergy workflow integration.

## Mandatory First Response Protocol

Before ANY response or action in iFlow, you MUST complete this checklist:

☐ 1. Identify task type and complexity
☐ 2. Check if a workflow should be activated
☐ 3. Select appropriate workflow (brainstorming, TDD, debugging)
☐ 4. Follow workflow stages in order
☐ 5. Verify completion before finishing

**Responding WITHOUT completing this checklist = automatic failure**
</EXTREMELY_IMPORTANT>
```

### 2. 常见错误思维（Common Rationalizations）

| 错误思维 | 现实 | 为什么错了 |
|---------|------|---------|
| "I'll just start coding" | 没有计划你会错过边界情况 | Workflows 防止这个 |
| "This is too simple for a workflow" | 简单任务也有隐藏复杂性 | Workflows 可扩展 |
| "I know the workflow" | 遵循步骤 = 更好的质量 | 纪律防止错误 |
| "Let me skip planning stage" | 计划才是执行的核心工作 | 计划 = 工作 |
| "Verification takes too long" | 早期发现错误节省时间 | 验证防止债务 |

### 3. 完整的工作流方法论

**Brainstorming Workflow**:
- 阶段 1: Skill Activation (5s)
- 阶段 2: Task Planning (15s)
- 阶段 3: Execution (30s)
- 每个阶段的完成标准

**TDD Workflow**:
- Red → Green → Refactor
- 测试优先，实现其次
- 验证必不可少

**Debugging Workflow**:
- Understand → Isolate → Fix → Verify
- 系统化问题解决

### 4. 技能发现机制

```bash
# 直接调用（当前 CLI）
stigmergy skill read <skill-name>

# 跨 CLI 调用
stigmergy use <cli-name> skill <skill-name>

# 智能路由（自动选择）
stigmergy call skill <skill-name>
```

---

## 📁 新的文件结构

```
~/.iflow/
├── workflow_config.json              # ⭐ 工作流配置
├── hooks/
│   ├── meta_skill_hook.py           # ⭐ 元技能 Hook（新）
│   └── superpowers_workflow.py     # 原工作流 Hook
└── IFLOW.md                          # ⭐ 元技能内容（完整方法论）
    ├── <!-- META_SKILL_START -->    # 新：完整方法论
    │   └── [完整的使用指导...]
    └── [原有内容...]
```

---

## 🚀 新的部署方式

### 对于 iFlow CLI

```bash
# 部署完整的方法论（推荐）
node scripts/deploy-iflow-workflow-v2.js

# 验证部署
node scripts/test-iflow-workflow.js

# 查看注入的元技能内容
head -100 ~/.iflow/IFLOW.md
```

### 注入的内容层级

```
IFLOW.md
├── <!-- META_SKILL_START -->    ← 新：完整方法论（5-10KB）
│   ├── 强制协议
│   ├── 工作流选择指南
│   ├── 常见错误思维
│   └── 技能发现机制
├── ---                        ← 分隔符
└── [原有内容]
    ├── 之前的技能列表
    └── 其他配置
```

---

## 🎓 关键改进

### 1. 强制执行协议

**旧方式**（建议式）：
```xml
<usage>
Load skills using Stigmergy skill manager
</usage>
```

**新方式**（强制式）：
```xml
<EXTREMELY_IMPORTANT>
Before ANY response or action, you MUST complete this checklist:
☐ 1. Check if a workflow applies
☐ 2. Select appropriate workflow
☐ 3. Follow stages in order
**Automatic failure if skipped**
</EXTREMELY_IMPORTANT>
```

### 2. 预防错误思维

包含 **8+ 种常见错误思维**及其反驳：
- "I can do this directly" → 错误
- "This is too simple for a workflow" → 错误
- "I know this workflow" → 错误
- 每种都有详细的解释说明

### 3. 完整示例

对每种场景提供**正确的 vs 错误的**对比示例：
- 设计任务：正确（使用 workflow）vs 错误（直接开始）
- 实现任务：正确（TDD）vs 错误（跳过测试）
- 调试任务：正确（系统化）vs 错误（随机尝试）

---

## 🆚 与 Superpowers 对比

| 方面 | Superpowers | Stigmergy 新实现 |
|-----|-----------|--------------|
| **注入内容** | 完整使用方法论 | ✅ **完整工作流方法论** |
| **强制协议** | ✅ 5步检查清单 | ✅ 5阶段工作流 |
| **错误思维** | ✅ 8+ 种常见错误 | ✅ 8+ 种工作流错误 |
| **技能发现** | ✅ 三级发现系统 | ✅ 跨CLI 技能加载 |
| **强制力** | "Automatic failure" | "Automatic failure" |
| **内容大小** | ~5-10KB | ✅ **5-10KB 完整方法论** |

---

## 📊 对比总结

### 旧实现 vs 新实现

| 特性 | 旧实现 ❌ | 新实现 ✅ |
|------|-----------|----------|
| **注入内容** | 技能卡片列表 | 完整方法论 |
| **教育价值** | 低（只说有技能） | **高（教如何使用）** |
| **强制力** | 无 | 极强（mandatory） |
| **错误预防** | 无 | **8+ 种错误思维** |
| **用户指导** | 简单说明 | **完整示例对比** |
| **Token成本** | 几百行 | **数千行**（值得！） |

---

## 🎯 为什么这个改进至关重要

### 1. 从"知道有技能"到"知道如何使用"

**旧方式**：
- AI 知道有 brainstorming 技能
- 但不知道什么时候使用、如何使用、为什么重要

**新方式**：
- AI 明白**必须**在响应前检查技能
- AI 知道**如何**激活和使用技能
- AI 理解**为什么**这很重要

### 2. 从"随意使用"到"系统化执行"

**旧方式**：
- AI 可能忘记使用技能
- AI 可能跳过流程
- 质量不一致

**新方式**：
- **强制协议**确保系统性执行
- 工作流阶段确保完整性
- 验证阶段确保质量

### 3. 从"元数据"到"方法论"

**旧方式**：
```xml
<skill>
  <name>brainstorming</name>
  <description>Use before creative work</description>
</skill>
```

**新方式**：
```xml
<EXTREMELY_IMPORTANT>
## Brainstorming Workflow

### When to Use
- Trigger keywords: design, create, brainstorm, plan, architecture
- Best For: System architecture design, API design, feature planning

### Process
1. Diverge: Generate 3-5 alternatives
2. Explore: Analyze pros/cons
3. Converge: Select best option
4. Document: Record decision rationale

### Example
User: "Design a RESTful API"
✓ Correct: Use workflow → Generate options → Evaluate → Select
✗ Wrong: Start designing immediately → First idea → Locked in
</EXTREMELY_IMPORTANT>
```

---

## 🚀 快速开始

### 部署新版本

```bash
# 1. 部署完整方法论（iFlow）
node scripts/deploy-iflow-workflow-v2.js

# 2. 验证部署
node scripts/test-iflow-workflow.js

# 3. 查看注入的元技能
head -50 ~/.iflow/IFLOW.md
```

### 注入的内容示例

```
# ~/.iflow/IFLOW.md 的开头

<!-- META_SKILL_START -->
<EXTREMELY_IMPORTANT>
You are using iFlow CLI with Stigmergy workflow integration.

**Below is the complete guide for using iFlow's Workflow Pipeline system**

## Mandatory First Response Protocol

Before ANY response or action in iFlow, you MUST complete this checklist:

☐ 1. Identify task type and complexity
☐ 2. Check if a workflow should be activated
☐ 3. Select appropriate workflow (brainstorming, TDD, debugging)
☐ 4. Follow workflow stages in order
☐ 5. Verify completion before finishing

**Responding WITHOUT completing this checklist = automatic failure**

[... 还有 5-10KB 的完整使用指导 ...]

</EXTREMELY_IMPORTANT>
<!-- META_SKILL_END -->

---

[原有内容...]
```

---

## 📚 相关文档

1. **元技能模板**: `templates/using-iflow-workflows.md`
2. **部署脚本**: `scripts/deploy-iflow-workflow-v2.js`
3. **测试脚本**: `scripts/test-iflow-workflow.js`
4. **Superpowers 分析**: `SUPERPOWERS_PLUGIN_ANALYSIS.md`

---

**版本**: 2.0.0
**更新日期**: 2025-01-26
**关键改进**: 从技能列表注入 → 完整方法论注入

---

## 🎉 总结

**关键洞察**：Superpowers 不仅仅是技能库，而是**技能使用操作系统**！

**Stigmergy 现在提供**：
- ✅ 完整的使用方法论（不仅仅是技能列表）
- ✅ 强制执行的协议和检查清单
- ✅ 错误思维的预防和纠正
- ✅ 系统化的工作流执行
- ✅ 跨 CLI 技能协调

**结果**：AI 现在会**系统地、正确地**使用技能，而不是"知道有技能但不知道怎么用"！
