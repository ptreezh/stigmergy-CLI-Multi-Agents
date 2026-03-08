---
name: soul-co-evolve
description: 协同进化 - 基于双Agent循环的多CLI协作学习
version: 1.0.0
tags: [collaboration, evolution, multi-agent]
requires: [two-agent-loop]
builtin: true
---

# Soul Co-Evolve - 协同进化

## 概述

多 CLI 协作学习，共享知识与经验，**基于双 Agent 循环**实现。

## 依赖

**核心基础**: [two-agent-loop](./two-agent-loop/SKILL.md)

所有协作步骤都通过双 Agent 循环执行。

## 协作流程 (使用双 Agent 循环)

### 步骤 1: 知识发布 (双循环)

```
主 Agent (当前 CLI):
  派发 Subagent: 分析并打包自身知识
    → 近期学习成果
    → 最佳实践
    → 问题解决方案
  Code Review: 审查知识包质量
  修复后发布到共享存储
```

### 步骤 2: 知识获取 (双循环)

```
主 Agent:
  派发 Subagent: 获取其他 CLI 知识
    → 读取 Claude 知识库
    → 读取 Qwen 知识库
    → 读取 Gemini 知识库
  Code Review: 审查知识相关性
  过滤无关内容
```

### 步骤 3: 知识融合 (双循环)

```
主 Agent:
  派发 Subagent: 融合多源知识
    → 去重
    → 优先级排序
    → 识别互补点
  Code Review: 审查融合质量
  修复如有问题
```

### 步骤 4: 能力提升 (双循环)

```
主 Agent:
  派发 Subagent: 基于融合知识提升
    → 更新提示词
    → 优化工作流
    → 增强技能
  Code Review: 审查改进方案
  实施并验证
```

## 触发方式

- 关键词: "协同", "co-evolve", "协作"
- Scheduler: 每天定时执行
- 手动: `使用 skill: soul-co-evolve`

## 存储

```
~/.stigmergy/soul-state/
├── co-evolution/
│   ├── shared/        # 共享知识
│   ├── received/      # 接收的知识
│   └── my-shared/    # 我分享的知识
```
