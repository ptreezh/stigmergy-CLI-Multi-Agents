---
name: soul-evolution
description: 自主进化 - 基于双Agent循环的自我学习与进化
version: 1.0.0
tags: [evolution, learning, self-improvement]
requires: [two-agent-loop]
builtin: true
---

# Soul Evolution - 自主进化系统

## 概述

使用**双 Agent 循环**作为基础机制，实现自我学习和进化。

## 依赖

**核心基础**: [two-agent-loop](./two-agent-loop/SKILL.md)

所有进化步骤都通过双 Agent 循环执行。

## 进化流程 (使用双 Agent 循环)

### 步骤 1: 模式分析 (双循环)

```
主 Agent:
  派发 Subagent: 分析近期任务模式
    → 分析成功模式
    → 分析失败模式
    → 识别改进机会
  Code Review: 审查分析结果
  修复如有问题
```

### 步骤 2: 知识提取 (双循环)

```
主 Agent:
  派发 Subagent: 从模式中提取可操作知识
    → 提取最佳实践
    → 提取错误教训
    → 生成改进建议
  Code Review: 审查知识质量
  修复如有问题
```

### 步骤 3: 技能创建 (双循环)

```
主 Agent:
  派发 Subagent: 基于知识创建新技能
    → 生成技能框架
    → 编写技能文档
    → 创建示例
  Code Review: 审查技能质量
  修复如有问题
```

### 步骤 4: 验证测试 (双循环)

```
主 Agent:
  派发 Subagent: 验证新技能
    → 测试技能功能
    → 验证实用性
    → 评估价值
  Code Review: 审查测试结果
  修复如有问题
```

## 触发方式

- 关键词: "进化", "evolve", "自主学习"
- Scheduler: 每周定时执行
- 手动: `使用 skill: soul-evolution`

## 与其他技能

- **two-agent-loop**: 基础执行机制 (必须)
- **soul-reflection**: 反思当前状态
- **subagent-driven-development**: 参考实现

## 存储

```
~/.stigmergy/soul-state/
├── evolutions/        # 进化记录
├── evolved-skills/    # 创建的技能
└── evolution-log.jsonl
```
