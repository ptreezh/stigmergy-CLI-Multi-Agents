---
name: soul-compete
description: 竞争进化 - 基于双Agent循环的方案对比与最优选择
version: 1.0.0
tags: [competition, optimization, comparison]
requires: [two-agent-loop]
builtin: true
---

# Soul Compete - 竞争进化

## 概述

通过方案对比、竞争选择实现优胜劣汰，**基于双 Agent 循环**实现。

## 依赖

**核心基础**: [two-agent-loop](./two-agent-loop/SKILL.md)

所有竞争步骤都通过双 Agent 循环执行。

## 竞争流程 (使用双 Agent 循环)

### 步骤 1: 方案生成 (双循环)

```
主 Agent:
  派发 Subagent: 生成多个解决方案
    → 方案A: 快速方案
    → 方案B: 平衡方案
    → 方案C: 深度方案
  Code Review: 审查方案完整性
  修复如有问题
```

### 步骤 2: 独立执行 (双循环)

```
主 Agent:
  派发 Subagent 1: 执行方案A
  派发 Subagent 2: 执行方案B
  派发 Subagent 3: 执行方案C
  (并行或按序执行)

  每个完成后立即 Code Review
  记录执行数据
```

### 步骤 3: 评估对比 (双循环)

```
主 Agent:
  派发 Subagent: 多维度评估
    → 正确性评分
    → 效率评分
    → 质量评分
    → 可维护性评分
  Code Review: 审查评估客观性
  计算加权得分
```

### 步骤 4: 选择与进化 (双循环)

```
主 Agent:
  派发 Subagent: 提取最优方案模式
    → 记录成功模式
    → 提取可复用逻辑
    → 更新最佳实践
  Code Review: 审查模式质量

  同时记录失败方案原因:
    → 标记失败模式
    → 提炼教训
```

## 触发方式

- 关键词: "对比", "竞争", "compete", "优化"
- 遇到复杂决策自动触发
- Scheduler: 每周定时执行
- 手动: `使用 skill: soul-compete`

## 存储

```
~/.stigmergy/soul-state/
├── competition/
│   ├── winners/       # 获胜方案
│   ├── losers/       # 失败方案
│   └── benchmarks/   # 基准数据
```
