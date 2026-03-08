---
name: soul-reflection
description: 自我反思 - 基于双Agent循环的分析与学习提取
version: 1.0.0
tags: [reflection, analysis, learning]
requires: [two-agent-loop]
---

# Soul Reflection - 自我反思

## 概述

分析最近执行的任务，识别模式和提取学习要点，**基于双 Agent 循环**实现。

## 依赖

**核心基础**: [two-agent-loop](./two-agent-loop/SKILL.md)

所有分析步骤都通过双 Agent 循环执行。

## 反思流程 (使用双 Agent 循环)

### 步骤 1: 数据收集 (双循环)

```
主 Agent:
  派发 Subagent: 收集任务数据
    → 读取会话记录
    → 统计完成情况
    → 识别错误
  Code Review: 审查数据完整性
  修复如有问题
```

### 步骤 2: 深度分析 (双循环)

```
主 Agent:
  派发 Subagent: 分析成功模式
    → 哪些做对了
    → 为什么对
    → 如何复制
  Code Review: 审查分析深度

  派发 Subagent: 分析失败模式
    → 哪里出了问题
    → 根本原因
    → 如何避免
  Code Review: 审查分析准确性
```

### 步骤 3: 改进建议 (双循环)

```
主 Agent:
  派发 Subagent: 生成改进计划
    → 短期改进 (1-2周)
    → 中期目标 (1个月)
    → 长期发展 (3个月)
  Code Review: 审查可操作性
  修复如有问题
```

## 触发方式

- 关键词: "反思", "reflect", "分析"
- Scheduler: 每小时快速 / 每周深度
- 手动: `使用 skill: soul-reflection`

## 存储

```
~/.stigmergy/soul-state/
├── reflections/
│   └── {timestamp}-reflection.json
├── improvement-plans/
│   └── current-plan.json
```

## 与其他技能

- **two-agent-loop**: 基础执行机制 (必须)
- **soul-evolution**: 基于反思结果进化
- **subagent-driven-development**: 参考实现
