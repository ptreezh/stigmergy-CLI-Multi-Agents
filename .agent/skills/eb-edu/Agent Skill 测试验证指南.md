# 电商 AI 实训平台 - Agent Skill 测试验证指南

**版本**: v1.0  
**创建日期**: 2026-03-30  
**目标**: 理解什么是 Agent Skill，如何验证 Agent Skill

---

## 什么是 Agent Skill？

### 核心概念

**Agent Skill 不是**：
- ❌ Python 脚本模拟用户操作
- ❌ 自动化测试脚本
- ❌ 命令行批处理

**Agent Skill 是**：
- ✅ 加载到 AI CLI 中的技能
- ✅ 利用 AI CLI 的 subagent 机制
- ✅ 让 AI Agent 扮演真实用户（学生）
- ✅ 与实训系统进行自然对话交互
- ✅ 验证 Skills 的可用性和效果

### Agent Skill 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│  AI CLI (Qwen / iFlow / CodeBuddy / ...)                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Subagent Mechanism                                        │ │
│  │ ┌───────────────────────────────────────────────────────┐ │ │
│  │ │ Student Subagent (AI Agent 扮演学生)                  │ │ │
│  │ │ - 学生 persona: 张三，20 岁，电商专业                   │ │ │
│  │ │ - 自然对话：提问、回答、完成任务                      │ │ │
│  │ │ - 能力发展：学习、实践、评估                          │ │ │
│  │ └───────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Training Skill (实训 Skill)                               │ │
│  │ - eb-edu-train-product-listing                           │ │
│  │ - eb-edu-train-order-processing                          │ │
│  │ - eb-edu-train-customer-service                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 如何验证 Agent Skill？

### 验证方法

**不是**：
```bash
# ❌ 错误方法：Python 脚本模拟
python agent-simulated-test.py

# ❌ 错误方法：命令行批处理
for skill in skills:
    run_command(f"python {skill}/skill.py --help")
```

**而是**：
```bash
# ✅ 正确方法：在 AI CLI 中加载 Skill
qwen "我要测试商品上架实训"

# ✅ 正确方法：Dispatch subagent 作为学生
# AI CLI dispatches subagent as student 张三
# Subagent interacts naturally with training skill
# Tester monitors and validates
```

### 验证流程

```
1. 准备阶段
   ↓
   - 检查 AI CLI 是否可用 (qwen, iflow, etc.)
   - 检查 Stigmergy 是否可用
   - 检查 Skills 是否已注册
   - 准备测试环境

2. Dispatch Subagent
   ↓
   - 创建学生 persona (姓名、年龄、专业、水平)
   - 设定测试目标 (测试哪个 Skill)
   - 说明测试要求 (自然交互、能力发展)

3. 监控交互
   ↓
   - 观察 Subagent 与 Training Skill 对话
   - 记录关键交互点
   - 识别问题和困惑

4. 验证结果
   ↓
   - Skill 是否成功加载？
   - LLM 引导是否有效？
   - 能力是否得到发展？
   - 场景是否对齐真实业务？

5. 文档和改進
   ↓
   - 编写测试报告
   - 记录发现的问题
   - 提出改进建议
   - 更新 Skills
```

---

## 测试用例

### 测试用例 1: 商品上架实训

**测试目标**：验证 `eb-edu-train-product-listing`

**Student Subagent Persona**：
```
姓名：张三
年龄：20 岁
专业：电商运营
水平：初学者
目标：学习如何在电商平台上架商品
```

**测试步骤**：
1. AI CLI 加载 Skill：`stigmergy skill call eb-edu-train-product-listing`
2. Subagent（张三）开始情境导入
3. Subagent 完成市场调研（LLM 引导）
4. Subagent 完成商品录入
5. Subagent 完成定价策略（LLM 引导）
6. Subagent 确认上架
7. Subagent 完成复盘总结（LLM 点评）

**验证点**：
- ✅ Skill 加载成功
- ✅ LLM 引导清晰有效
- ✅ Subagent 理解每个步骤
- ✅ 能力得到发展（市场调研、定价策略）
- ✅ 场景对齐真实业务

**预期对话**：
```
Subagent (张三): 你好！我是张三，电商专业学生。我要学习商品上架。

[System loads skill]

Subagent (张三): 我看到情境导入了，老板让我上架"夏季连衣裙"，成本 80 元。
接下来我该做什么？

[LLM guides to market research]

Subagent (张三): 我在分析竞品数据...
竞品 A: 159 元，月销 3000+
竞品 B: 259 元，月销 1000+
我觉得价格带是 159-259 元。

[LLM provides feedback]

Subagent (张三): 谢谢指导！我明白了，定价要考虑成本和竞品。
```

### 测试用例 2: 订单处理实训

**测试目标**：验证 `eb-edu-train-order-processing`

**Student Subagent Persona**：
```
姓名：李四
年龄：21 岁
专业：电商运营
水平：中级
目标：学习如何处理订单
```

**测试步骤**：
1. AI CLI 加载 Skill
2. Subagent 完成订单确认（LLM 引导）
3. Subagent 完成配货打包
4. Subagent 完成发货物流
5. Subagent 完成异常处理（LLM 引导）
6. Subagent 完成复盘总结

**验证点**：
- ✅ Skill 加载成功
- ✅ LLM 引导清晰有效
- ✅ Subagent 理解订单处理流程
- ✅ 能力得到发展（订单确认、异常处理）
- ✅ 场景对齐真实业务

### 测试用例 3: 客户服务实训

**测试目标**：验证 `eb-edu-train-customer-service`

**Student Subagent Persona**：
```
姓名：王五
年龄：19 岁
专业：电商运营
水平：初学者
目标：学习如何服务客户
```

**测试步骤**：
1. AI CLI 加载 Skill
2. Subagent 处理客户咨询（LLM 引导）
3. Subagent 处理客户投诉（LLM 引导）
4. Subagent 完成客户维护
5. Subagent 完成复盘总结

**验证点**：
- ✅ Skill 加载成功
- ✅ LLM 引导清晰有效
- ✅ Subagent 学会客户沟通
- ✅ 能力得到发展（沟通、投诉处理）
- ✅ 场景对齐真实业务

---

## 验证清单

### Skill 加载验证
- [ ] Skill 可以在 AI CLI 中加载
- [ ] Skill 元数据有效
- [ ] Skill 触发词工作正常

### LLM 引导验证
- [ ] LLM 理解实训场景
- [ ] LLM 提供清晰的逐步引导
- [ ] LLM 反馈有帮助且可操作
- [ ] LLM 适应 Subagent 的回应

### 能力发展验证
- [ ] 实训发展真实能力
- [ ] 学习目标清晰
- [ ] 评估标准明确
- [ ] Subagent 能展示学到的技能

### 场景对齐验证
- [ ] 实训对齐真实业务场景
- [ ] 任务匹配真实工作任务
- [ ] 数据真实可信
- [ ] 流程符合行业标准

---

## 测试报告模板

```markdown
# Agent Skill 测试报告 - [Skill 名称]

**测试日期**: YYYY-MM-DD  
**测试人员**: [姓名]  
**Student Subagent**: [姓名、年龄、专业、水平]

## 测试结果

### Skill 加载
- [ ] ✅/❌ Skill 加载成功
- [ ] ✅/❌ 元数据有效
- [ ] ✅/❌ 触发词工作正常

### LLM 引导
- [ ] ✅/❌ LLM 理解场景
- [ ] ✅/❌ 引导清晰有效
- [ ] ✅/❌ 反馈有帮助
- [ ] ✅/❌ 适应学生回应

### 能力发展
- [ ] ✅/❌ 发展真实能力
- [ ] ✅/❌ 目标清晰
- [ ] ✅/❌ 评估明确
- [ ] ✅/❌ 学生展示技能

### 场景对齐
- [ ] ✅/❌ 对齐真实业务
- [ ] ✅/❌ 任务匹配工作
- [ ] ✅/❌ 数据真实
- [ ] ✅/❌ 流程符合标准

## 对话记录

[粘贴关键对话片段]

## 发现的问题

[列出发现的问题]

## 改进建议

[提出改进建议]

## 总体评估

[通过/失败] + 理由
```

---

## 关键原则

### 必须做的
- ✅ **Dispatch subagent** - 必须使用 AI CLI 的 subagent 机制
- ✅ **自然交互** - Subagent 作为真实学生自然对话
- ✅ **能力聚焦** - 关注学生学到了什么，不只是完成
- ✅ **真实场景对齐** - 实训必须匹配真实工作场景
- ✅ **持续改进** - 用测试结果改进 Skills

### 绝不能做的
- ❌ **跳过 subagent dispatch** - 必须使用 AI CLI subagent 机制
- ❌ **脚本化交互** - 不能是预设脚本，必须是自然对话
- ❌ **忽略学生困惑** - 必须立即解决困惑
- ❌ **只关注完成** - 必须验证能力发展
- ❌ **孤立测试** - 必须对照真实场景验证

---

## 下一步

### 1. 配置 AI CLI 环境

```bash
# 检查 Qwen CLI
qwen --version

# 检查 Stigmergy
stigmergy --version

# 注册 Skills
# (配置 Stigmergy 识别 eb-edu-* skills)
```

### 2. 准备测试环境

```bash
# 创建测试工作区
mkdir tests/agent-skill-tests

# 准备测试文档
# - test-training-skill skill.md
# - 测试用例文档
# - 测试报告模板
```

### 3. 执行测试

```bash
# 在 AI CLI 中
qwen "我要测试商品上架实训"

# Dispatch subagent as student
# Monitor interaction
# Validate results
```

### 4. 编写报告

```bash
# 编写测试报告
# docs/tests/YYYY-MM-DD-train-product-listing-test-report.md

# 记录发现的问题
# 提出改进建议
# 更新 Skills
```

---

**Agent Skill 测试验证指南版本**: v1.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台质量保障团队  
**状态**: ✅ 理解 Agent Skill 概念 | ✅ 掌握验证方法 | ✅ 准备执行真实测试
