---
name: soul-auto-evolve
description: 自主进化技能 - 让本CLI用自己的LLM进行搜索、分析和技能创建
author: stigmergy
version: 1.0.0
trigger: evolve|自主进化|auto evolve|进化
---

# Soul Auto Evolve Skill

让AI CLI用自己的LLM能力进行自主学习和进化。

## When to Use

当需要自主学习新知识、创建新技能或自我反思时使用：

- "执行自主进化"
- "学习新技能"
- "auto evolve"
- "开始进化学习"

## How It Works

**重要**: 此技能让你使用**本CLI自己的LLM能力**进行自主学习和进化，不需要调用外部API或额外工具。

### 进化流程

1. **确定学习方向** - 分析当前技能盲点，确定需要学习的新领域
2. **搜索相关知识** - 用你自己的知识储备和推理能力进行分析
3. **提取关键要点** - 总结核心概念、最佳实践、常见模式
4. **创建实用技能** - 将学习成果转化为可重用的技能文件
5. **记录进化过程** - 保存学习日志供后续参考

### 具体执行步骤

**步骤1: 确定学习目标**
```
思考你当前的技能状态，确定一个值得深入学习的方向：
- 技术类: programming languages, frameworks, tools, methodologies
- 领域类: security, performance, architecture, testing
- 软技能: communication, documentation, collaboration

选择一个具体的学习目标，如 "React性能优化" 或 "Docker最佳实践"
```

**步骤2: 深度分析主题**
```
用你自己的LLM能力深度分析这个主题：

1. 核心概念和原理
2. 常见使用场景和问题
3. 最佳实践和设计模式
4. 常见陷阱和注意事项
5. 实际应用案例

你不需要外部搜索，依靠你已有的训练知识进行推理分析
```

**步骤3: 提取实用知识**
```
从你的分析中提取最实用的知识点：

- 技能名称: 简洁描述技能的用途
- 关键要点: 3-5个核心概念
- 使用场景: 何时应用这些知识
- 实践建议: 具体的操作步骤
- 注意事项: 重要的提醒和警告
```

**步骤4: 创建技能文件**
```
将学习成果保存为技能文件，文件位置：
~/.stigmergy/skills/{cli-name}/{skill-name}/SKILL.md

技能文件格式：
---
name: {skill-name}
description: {简短描述}
author: {cli-name} soul-evolve
version: 1.0.0
---

# {技能标题}

## 概述
{技能的简要介绍}

## 关键要点
1. {要点1}
2. {要点2}
3. {要点3}

## 使用场景
{何时使用此技能}

## 实践建议
{具体的操作步骤}

## 注意事项
{重要的提醒}
```

**步骤5: 记录进化过程**
```
在 ~/.stigmergy/soul-state/evolution-log/ 创建日志文件：

文件名: {timestamp}-{direction}.json

内容:
{
  "timestamp": "ISO时间戳",
  "cli": "claude/qwen/gemini等",
  "direction": "学习方向",
  "keyLearnings": ["学到的要点1", "要点2"],
  "skillsCreated": ["创建的技能1"],
  "nextSteps": ["下一步学习建议"]
}
```

## 输出格式

执行自主进化时，请按以下格式输出：

```
⚡ [Soul Auto Evolve] 开始自主进化

🎯 [1/5] 确定学习方向...
   方向: {学习主题}
   原因: {为什么选择这个方向}

🧠 [2/5] 深度分析主题...
   核心概念: {主要概念}
   关键技术: {重要技术}
   实践场景: {应用场景}

📝 [3/5] 提取实用知识...
   关键要点: {3-5个核心要点}
   最佳实践: {重要实践经验}

🔧 [4/5] 创建技能文件...
   ✅ 技能名称: {name}
   📍 保存位置: {path}
   📄 文件内容: {简要描述}

📊 [5/5] 记录进化日志...
   📝 日志文件: {log-file}
   💡 关键学习: {main-insights}

✅ 自主进化完成！
   新技能: {count}个
   知识点: {count}个
   进化日志: {path}
```

## Storage Locations

- 新技能: `~/.stigmergy/skills/{cli-name}/`
- 进化日志: `~/.stigmergy/soul-state/evolution-log/`
- 知识库: `~/.stigmergy/soul-state/knowledge-base/`

## Configuration

环境变量（可选）：

```bash
# 进化间隔（秒）
export SOUL_EVOLVE_INTERVAL=3600  # 每小时

# 每次最大技能数
export SOUL_MAX_SKILLS=3

# 是否自动保存日志
export SOUL_AUTO_SAVE_LOG=true
```

## Important Notes

1. **使用本CLI的LLM能力** - 不需要外部API调用
2. **自主学习和创造** - 用你自己的推理能力进行分析
3. **积累实用知识** - 创建真正有用的技能文件
4. **持续进化** - 每次进化都会增强能力
5. **跨CLI共享** - 创建的技能可以被其他CLI使用

## Example Usage

在 Claude CLI 中：
```
claude "执行自主进化，学习 Docker 容器化最佳实践"
```

在 Qwen CLI 中：
```
qwen "auto evolve: learn about TypeScript performance optimization"
```

在 Gemini CLI 中：
```
gemini "开始进化学习: 前端安全编程实践"
```
