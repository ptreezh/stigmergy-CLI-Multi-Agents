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

## 🚀 自动迭代机制 (核心特性)

### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                   Soul Evolution System                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. SkillDependencyEnforcer (强制依赖加载)                 │   │
│  │    - 加载 soul-evolution → 强制加载 two-agent-loop       │   │
│  │    - 递归检查所有依赖                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. EvolveLoop (自动进化循环)                             │   │
│  │    - 利用 CLI task() 派发 subagent                       │   │
│  │    - 一次进化结束 → 自动触发下一次                       │   │
│  │    - 状态机: idle→analyzing→extracting→creating→loop  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. CronScheduler (定时计划)                              │   │
│  │    - 夜间: 每30分钟触发进化                              │   │
│  │    - 白天: 每4小时触发进化                               │   │
│  │    - 支持手动触发                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. SkillGenerator (技能自主创建)                         │   │
│  │    - 从经验教训提取 → 自动创建新技能                     │   │
│  │    - 优化已有技能                                        │   │
│  │    - 写入 ~/.stigmergy/skills/                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 核心流程

```
一次进化周期:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ 加载依赖 │ → │ 分析模式 │ → │ 提取知识 │ → │ 创建技能 │ → │ 测试验证 │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
       ↓                                        ↓
       └────────── 自动触发下一次进化 ←─────────┘
                          ↓
              (持续迭代，直到达到最大次数)
```

### 强制依赖加载

**加载 soul-evolution 时，系统会自动强制加载 two-agent-loop：**

```javascript
// 伪代码示例
const { createSoulEvolutionSystem } = require("./src/core/evolution");
const system = await createSoulEvolutionSystem({
  cliAdapter, // CLI 适配器
  skillManager, // 技能管理器
  autoStart: true, // 自动启动
});

// 启动后，系统会自动：
// 1. 强制加载 two-agent-loop
// 2. 启动 EvolveLoop 自动循环
// 3. 启动 CronScheduler 定时触发
// 4. 监听进化完成事件，自动创建新技能
```

### 定时计划

| 时间段             | 进化间隔 | 说明     |
| ------------------ | -------- | -------- |
| 夜间 (23:00-07:00) | 30分钟   | 密集进化 |
| 白天 (07:00-23:00) | 4小时    | 常规进化 |

### 长时自动任务

系统利用 CLI 的机制实现长时自动任务：

- **Task 机制**: 通过 `task()` 派发 subagent 执行具体任务
- **Hook 机制**: 通过 hooks 注入上下文，保持状态
- **持续迭代**: 一次进化完成后自动启动下一次

### 自主技能创建

每次进化完成后，系统会自动：

1. **分析进化结果** - 提取经验教训和改进要点
2. **决策创建/优化** - 判断是创建新技能还是优化已有技能
3. **自动生成** - 生成 SKILL.md 文件
4. **写入存储** - 保存到 `~/.stigmergy/skills/`

## 触发方式

| 方式         | 说明                                             |
| ------------ | ------------------------------------------------ |
| **自动启动** | `createSoulEvolutionSystem({ autoStart: true })` |
| **手动触发** | `system.triggerEvolve()`                         |
| **定时触发** | CronScheduler 自动控制                           |
| **关键词**   | "进化", "evolve", "自主学习"                     |

## 启动示例

```javascript
// 方式1: 一键启动完整系统
const { createSoulEvolutionSystem } = require("./src/core/evolution");
const system = await createSoulEvolutionSystem({
  cliAdapter: myCliAdapter, // CLI 适配器
  autoStart: true,
});

// 方式2: 分步控制
const system = await createSoulEvolutionSystem();
await system.loadSkill("soul-evolution"); // 强制加载依赖
await system.start(); // 启动自动进化
const status = system.getStatus(); // 查看状态
await system.stop(); // 停止

// 方式3: 手动触发单次进化
await system.triggerEvolve();
```

## 与其他技能

- **two-agent-loop**: 基础执行机制 (强制依赖)
- **soul-reflection**: 反思当前状态
- **soul-compete**: 竞争进化
- **soul-co-evolve**: 协同进化
- **subagent-driven-development**: 参考实现

## 存储结构

```
~/.stigmergy/
├── skills/                      # 自动创建的技能
│   ├── auto-xxx-skill-xxx/
│   │   └── SKILL.md
│   └── ...
└── soul-state/
    ├── evolve-loop.log         # 进化日志
    ├── scheduler-state.json     # 调度状态
    └── evolutions/             # 进化记录
        ├── evolution-xxx.json
        └── ...
```

## 状态监控

```javascript
const status = system.getStatus();
// 返回:
// {
//   isRunning: true,
//   loop: { state, currentIteration, totalEvolutions },
//   scheduler: { currentMode, nextEvolveTime },
//   createdSkills: [...]
// }
```
