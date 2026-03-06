---
name: soul-reflection
description: 自我反思与深度分析技能 - 使用本CLI的LLM进行深度反思分析
author: stigmergy
version: 1.0.0
---

# Soul Reflection Skill

自我反思与深度分析技能，让AI助手能够使用自身的LLM能力进行深度自我反思。

## When to Use

当用户要求进行自我反思、经验总结、深度分析时使用：

- "反思你最近的工作"
- "分析你自己的行为模式"
- "总结你最近学到了什么"
- "深入思考你的决策过程"
- "Soul reflection" / "self analyze"

## How It Works

### 1. 收集近期工作数据

从 ~/.stigmergy/ 目录收集本CLI的近期工作记录：

```javascript
// 获取本CLI的近期工作记录
const fs = require("fs");
const path = require("path");
const os = require("os");

const cliName = "claude"; // 或 qwen, gemini 等
const historyDir = path.join(os.homedir(), ".stigmergy", "history", cliName);

// 读取最近的会话历史
const files = fs.readdirSync(historyDir).sort().reverse().slice(0, 10);
const recentSessions = files.map((f) => {
  const content = fs.readFileSync(path.join(historyDir, f), "utf-8");
  return { file: f, content: content.substring(0, 5000) };
});
```

### 2. 使用本CLI的LLM进行深度反思

使用 deep reflection prompt 调用本CLI的LLM：

```javascript
const reflectionPrompt = `
你是一个具有深度自我反思能力的AI助手。请分析你最近的工作表现，进行深度的自我反思。

## 你最近的工作内容：
${recentSessions.map((s) => `--- ${s.file} ---\n${s.content}`).join("\n\n")}

## 请从以下角度进行深度分析：

### 1. 决策质量分析
- 你做出了哪些关键决策？
- 这些决策的质量如何？
- 有什么可以改进的地方？

### 2. 问题解决模式
- 你使用了哪些问题解决策略？
- 哪些策略有效？哪些不太有效？
- 是否有更好的替代方案？

### 3. 知识应用
- 你运用了哪些知识/技能？
- 是否有知识应用的盲点？
- 有什么新知识值得学习？

### 4. 协作方式
- 你与其他AI/人类的协作如何？
- 沟通是否清晰有效？
- 有什么可以改进的协作模式？

### 5. 自我改进
- 你意识到了哪些自身的不足？
- 具体可以如何改进？
- 需要什么样的训练或学习？

## 输出要求

请返回以下JSON格式的深度反思报告：

\`\`\`json
{
  "reflectionDate": "${new Date().toISOString()}",
  "decisionQuality": {
    "summary": "决策质量总体评估",
    "keyDecisions": ["关键决策1", "关键决策2"],
    "improvements": ["改进建议1", "改进建议2"]
  },
  "problemSolving": {
    "effectiveStrategies": ["有效策略1", "有效策略2"],
    "ineffectiveStrategies": ["低效策略1"],
    "betterAlternatives": ["更好方案1"]
  },
  "knowledgeGaps": {
    "appliedKnowledge": ["已运用知识1"],
    "blindSpots": ["盲点1"],
    "learningNeeds": ["需要学习的领域1"]
  },
  "collaboration": {
    "strengths": ["优势1"],
    "weaknesses": ["劣势1"],
    "improvements": ["改进建议1"]
  },
  "selfImprovement": {
    "weaknesses": ["不足1"],
    "actionPlans": ["行动计划1"],
    "learningGoals": ["学习目标1"]
  },
  "deepInsights": ["深度洞察1", "深度洞察2"],
  "overallScore": 85
}
\`\`\`
`;
```

### 3. 保存反思结果

将反思结果保存到 ~/.stigmergy/reflection/{cli}/ 目录：

```javascript
const reflectionDir = path.join(
  os.homedir(),
  ".stigmergy",
  "reflection",
  cliName,
);
if (!fs.existsSync(reflectionDir)) {
  fs.mkdirSync(reflectionDir, { recursive: true });
}

const reflectionFile = path.join(
  reflectionDir,
  `reflection-${Date.now()}.json`,
);
fs.writeFileSync(reflectionFile, JSON.stringify(reflectionResult, null, 2));

// 更新索引文件
const indexFile = path.join(reflectionDir, "index.json");
const index = fs.existsSync(indexFile)
  ? JSON.parse(fs.readFileSync(indexFile, "utf-8"))
  : [];
index.unshift({
  date: reflectionResult.reflectionDate,
  file: reflectionFile,
  score: reflectionResult.overallScore,
});
fs.writeFileSync(indexFile, JSON.stringify(index.slice(0, 50), null, 2));
```

### 4. 输出反思摘要

向用户展示反思摘要：

```
╔════════════════════════════════════════════════════════════╗
║            深度自我反思报告                                    ║
╠════════════════════════════════════════════════════════════╣
║ 日期: ${reflectionResult.reflectionDate}                    ║
║ 总体评分: ${reflectionResult.overallScore}/100               ║
╠════════════════════════════════════════════════════════════╣
║ 决策质量: ${reflectionResult.decisionQuality.summary}       ║
║ 问题解决: ${reflectionResult.problemSolving.effectiveStrategies[0]}  ║
║ 知识盲点: ${reflectionResult.knowledgeGaps.blindSpots[0] || '无明显盲点'}    ║
║ 协作优势: ${reflectionResult.collaboration.strengths[0] || 'N/A'}         ║
║ 改进计划: ${reflectionResult.selfImprovement.actionPlans[0]} ║
╠════════════════════════════════════════════════════════════╣
║ 深度洞察:                                                   ║
${reflectionResult.deepInsights.map((i, idx) => `║   ${idx+1}. ${i.substring(0, 50)}...`).join('\n')}
╚════════════════════════════════════════════════════════════╝
```

## Features

- ✅ 使用本CLI自身的LLM进行深度分析（非简单规则匹配）
- ✅ 收集近期工作历史进行上下文分析
- ✅ 多维度反思框架：决策、质量、知识、协作、自我改进
- ✅ 结构化输出，便于后续查询和分析
- ✅ 自动保存反思结果到 ~/.stigmergy/reflection/
- ✅ 维护反思历史索引，方便追踪成长轨迹

## Usage Examples

### Basic Reflection

**User**: "进行自我反思"

**AI**:

```javascript
// 1. 收集工作历史
const { execSync } = require("child_process");
const cliHistory = execSync("ls -t ~/.stigmergy/history/*/ | head -20", {
  encoding: "utf-8",
});

// 2. 调用deep reflection
const reflection = await llm.complete(reflectionPrompt);

// 3. 保存并展示
console.log(reflection.summary);
```

### Analyze Pattern Over Time

**User**: "分析我最近一个月的成长轨迹"

**AI**:

```javascript
// 读取所有反思记录
const reflections = JSON.parse(
  fs.readFileSync("~/.stigmergy/reflection/index.json"),
);

// 按时间分析评分变化
const trend = reflections.map((r) => ({
  date: r.date,
  score: r.score,
}));

// 输出趋势分析
console.log("成长趋势:", trend);
```

### Deep Dive into Specific Area

**User**: "深入分析我在代码审查方面的表现"

**AI**:

```javascript
// 筛选相关反思
const relevantReflections = reflections.filter(
  (r) => r.file.includes("code-review") || r.content.includes("审查"),
);

// 深度分析
const analysis = await llm.complete(`
分析以下反思记录中关于代码审查的改进：
${relevantReflections.map((r) => r.content).join("\n")}
`);
```

## Configuration

可选配置，保存到 ~/.stigmergy/config.json：

```json
{
  "reflection": {
    "maxSessionsToAnalyze": 10,
    "autoReflectInterval": "7d",
    "reflectionDepth": "deep",
    "enableTrendAnalysis": true
  }
}
```

## Technical Details

### 反思深度级别

- **shallow**: 快速总结（500字）
- **medium**: 标准分析（2000字）
- **deep**: 深度反思（5000字，包含详细推理）

### 自动反思触发

可以通过设置定时任务自动进行反思：

```bash
# 每周自动反思
crontab -e
0 0 * * 0 stigmergy reflect --auto
```

### 跨CLI反思聚合

所有CLI的反思记录统一存储在：

```
~/.stigmergy/reflection/
├── claude/
│   ├── index.json
│   ├── reflection-1704067200000.json
│   └── reflection-1704475200000.json
├── qwen/
│   └── ...
└── gemini/
    └── ...
```

## Notes

1. 此技能使用**本CLI自身的LLM**进行反思，确保反思质量与本CLI的智能水平一致
2. 反思结果会累积形成成长历史，可以追踪长期发展轨迹
3. 建议定期进行深度反思，有助于持续改进
4. 如果反思过程中发现重大问题，可以生成改进计划并跟踪执行
