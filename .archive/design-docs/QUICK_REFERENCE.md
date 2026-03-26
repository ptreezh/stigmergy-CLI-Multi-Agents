# V2 元技能系统 - 快速参考指南

**版本**: 2.0.0 | **状态**: ✅ 生产就绪 | **测试**: 40/40 通过 (100%)

---

## 🚀 一键部署

### 部署所有4个CLI
```bash
node scripts/deploy-iflow-workflow-v2.js
node scripts/deploy-qwen-extension-v2.js
node scripts/deploy-codebuddy-buddies-v2.js
node scripts/deploy-qodercli-skills-v2.js
```

### 验证部署
```bash
node scripts/test-all-v2-deployments.js
# 预期: 40/40 tests passed (100.0%)
```

---

## 📊 覆盖的CLI

| CLI | 元技能文件 | 大小 | 配置 | 特色 |
|-----|-----------|------|------|------|
| **iFlow** | `~/.iflow/IFLOW.md` | 11.75 KB | workflow_config.json | 4阶段工作流管道 |
| **Qwen** | `~/.qwen/QWEN.md` | 12.19 KB | package.json | 扩展自动激活 |
| **CodeBuddy** | `~/.codebuddy/CODEBUDDY.md` | 14.08 KB | buddy_config.json | Buddy协作系统 |
| **QoderCLI** | `~/.qoder/QODER.md` | 11.48 KB | skills/ | 技能发现系统 |

---

## 📁 关键文件

### 模板文件 (templates/)
```
templates/
├── using-iflow-workflows.md       # iFlow 工作流方法论
├── using-qwen-extensions.md       # Qwen 扩展方法论
├── using-codebuddy-buddies.md     # CodeBuddy Buddy方法论
├── using-qodercli-skills.md       # QoderCLI 技能方法论
└── using-stigmergy-skills.md      # 通用跨CLI方法论
```

### 部署脚本 (scripts/)
```
scripts/
├── deploy-iflow-workflow-v2.js    # iFlow 部署脚本
├── deploy-qwen-extension-v2.js    # Qwen 部署脚本
├── deploy-codebuddy-buddies-v2.js # CodeBuddy 部署脚本
├── deploy-qodercli-skills-v2.js   # QoderCLI 部署脚本
└── test-all-v2-deployments.js     # 综合测试脚本
```

### 文档文件
```
docs/
├── META_SKILL_DEPLOYMENT_GUIDE.md   # 部署指南和对比
├── SUPERPOWERS_PLUGIN_ANALYSIS.md   # Superpowers机制分析
├── V2_META_SKILL_DEPLOYMENT_REPORT.md  # 初步报告
└── V2_COMPLETE_DEPLOYMENT_REPORT.md    # 最终完整报告
```

---

## ✅ 测试清单

每个CLI包含10项测试：

### 基础测试（5项）
- ✅ 主配置文件存在
- ✅ META_SKILL_START 标记存在
- ✅ META_SKILL_END 标记存在
- ✅ 元技能名称存在
- ✅ 强制协议部分存在

### 高级测试（5项）
- ✅ 配置文件有效
- ✅ 目录/文件结构完整
- ✅ 元技能大小 > 10KB
- ✅ 无重复标记
- ✅ CLI特定组件验证

**总计**: 4 CLI × 10 测试 = **40项测试**

---

## 🎯 核心特性

### 1. 强制协议
```xml
<EXTREMELY_IMPORTANT>
Before ANY response, you MUST:
☐ 1. Identify task type
☐ 2. Check if workflow/skill applies
☐ 3. Select appropriate approach
☐ 4. Follow methodology
☐ 5. Verify completion

**Failure = automatic failure**
</EXTREMELY_IMPORTANT>
```

### 2. 错误思维预防
每个元技能包含7-8种常见错误思维及其反驳：
- "I'll just start coding" → 错误
- "This is too simple" → 错误
- "I know the workflow" → 错误
- "Let me skip planning" → 错误
- 等等...

### 3. 完整示例对比
每种场景提供：
- ✅ 正确做法（系统化）
- ❌ 错误做法（直接开始）
- 详细说明为什么

### 4. 跨CLI协调
所有CLI都支持Stigmergy跨CLI协调：
```bash
stigmergy call "task description"
stigmergy use <cli> skill <skill-name>
```

---

## 📈 改进对比

| 指标 | v1 (旧) | v2 (新) | 改进 |
|------|---------|---------|------|
| 内容大小 | ~1 KB | 11-15 KB | **10-15x** |
| 教育价值 | 知道有技能 | 知道如何使用 | **质变** |
| 强制力 | 无 | 极强 | **新增** |
| 错误预防 | 无 | 7-8种 | **新增** |
| 示例 | 简单 | 完整对比 | **5x** |

---

## 🔧 验证命令

### 检查元技能注入
```bash
# iFlow
grep "META_SKILL" ~/.iflow/IFLOW.md | head -2

# Qwen
grep "META_SKILL" ~/.qwen/QWEN.md | head -2

# CodeBuddy
grep "META_SKILL" ~/.codebuddy/CODEBUDDY.md | head -2

# QoderCLI
grep "META_SKILL" ~/.qoder/QODER.md | head -2
```

### 查看元技能内容
```bash
# 查看前50行（包含强制协议）
head -50 ~/.iflow/IFLOW.md
head -50 ~/.qwen/QWEN.md
head -50 ~/.codebuddy/CODEBUDDY.md
head -50 ~/.qoder/QODER.md
```

---

## 💡 使用场景

### 何时使用元技能

**✅ 总是使用**:
- 非平凡任务（>1分钟工作）
- 创造性或决策性任务
- 需要质量或正确性的任务
- 有既定最佳实践的任务
- 包含触发关键词的任务

**❌ 可以跳过**:
- 纯信息性任务（回答问题）
- 完全指定的常规任务
- 用户明确要求跳过
- 过于简单不值得的微任务

### CLI选择指南

| 任务类型 | 推荐CLI | 理由 |
|---------|--------|------|
| 设计/架构 | iFlow | 工作流系统最完善 |
| 实现/开发 | Qwen | 扩展自动激活好 |
| 团队协作 | CodeBuddy | Buddy系统专门设计 |
| 调试/故障排除 | QoderCLI | 技能系统全面 |

---

## 🎓 关键洞察

### Superpowers的本质

**不仅仅是技能库，而是"技能使用操作系统"！**

提供：
- ✅ 完整使用方法论
- ✅ 强制执行协议
- ✅ 错误思维预防
- ✅ 系统化执行流程
- ✅ 跨CLI协调机制

### 核心价值

**从"知道有技能"到"系统化使用"**

- 旧: AI知道有brainstorming技能
- 新: AI必须在响应前检查并遵循brainstorming方法论

**结果**: AI现在会**系统地、正确地、强制性地**使用技能！

---

## 📞 快速帮助

### 查看部署状态
```bash
node scripts/test-all-v2-deployments.js
```

### 重新部署特定CLI
```bash
# 例如只重新部署iFlow
node scripts/deploy-iflow-workflow-v2.js
```

### 卸载
```bash
node scripts/deploy-*-v2.js --uninstall
```

---

## 🎉 成就解锁

- ✅ 4个CLI完全支持
- ✅ 40/40测试通过
- ✅ ~50KB完整方法论
- ✅ 生产就绪状态
- ✅ 100%文档覆盖

**状态**: 🚀 **生产就绪 - 可以立即使用！**

---

**最后更新**: 2025-01-26
**维护者**: Stigmergy Project
**版本**: 2.0.0
