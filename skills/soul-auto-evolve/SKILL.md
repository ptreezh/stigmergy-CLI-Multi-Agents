---
name: soul-auto-evolve
description: 自主进化技能 - 让本CLI用自己的LLM进行搜索、分析和技能创建
author: stigmergy
version: 1.0.0
trigger: evolve|自主进化|auto evolve
---

# Soul Auto Evolve Skill

让AI CLI用自己的LLM能力进行自主学习和进化。

## When to Use

当需要自主学习新知识、创建新技能或自我反思时使用：

- "执行自主进化"
- "学习新技能"
- "自我反思"
- "auto evolve"

## How It Works

### 1. 搜索知识

用本CLI的LLM思考需要搜索什么，然后执行搜索：

```javascript
// 思考要搜索什么
const searchTopics = await llm.complete(`
你是一个专业的AI助手。请根据当前任务生成3个搜索查询。

任务：学习 ${direction}
请生成中英文搜索关键词，每个一行。
`);

// 使用webfetch或curl获取搜索结果
const { execSync } = require("child_process");

// 示例：使用DuckDuckGo搜索
const results = execSync(
  `curl -s "https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTopic)}"`,
  { encoding: "utf8" },
);
```

### 2. 分析内容

用本CLI的LLM分析获取的内容：

```javascript
const analysis = await llm.complete(`
你是一个专业的技术分析专家。请分析以下内容，提取关键知识点。

内容：
${content}

请用JSON格式返回：
{
  "title": "主题",
  "keyPoints": ["要点1", "要点2"],
  "actionable": "可操作的建议",
  "tags": ["标签1", "标签2"]
}
`);
```

### 3. 创建技能

分析完成后，创建新的skill文件：

```javascript
const fs = require("fs");
const path = require("path");

const skillDir = path.join(os.homedir(), ".stigmergy/skills", skillName);
fs.mkdirSync(skillDir, { recursive: true });

const skillContent = `---
name: ${skillName}
description: ${analysis.description}
---

# ${analysis.title}

## Key Points
${analysis.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## How to Use
${analysis.actionable}

## Examples
${analysis.examples || "暂无示例"}
`;

fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillContent);
```

### 4. 自我反思

分析最近的工作，提取经验教训：

```javascript
const reflection = await llm.complete(`
你是一个具有深度自我反思能力的AI助手。

请分析你最近的工作表现，从以下角度进行反思：
1. 成功的决策有哪些？
2. 失败的尝试有哪些？
3. 有什么可以改进的地方？
4. 学到了什么新知识？

请用JSON格式返回：
{
  "successPatterns": [],
  "failurePatterns": [],
  "improvements": [],
  "learnings": [],
  "overallScore": 85
}
`);
```

## 执行流程

### 步骤1：确定学习方向

分析当前状态，确定需要学习的方向：

```javascript
const direction = await llm.complete(`
当前任务是自主进化。请确定一个值得学习的新方向。

考虑因素：
- 当前技能的盲点
- 有用的新技能
- 项目需求

请只返回一个方向名称，如 "web-security" 或 "typescript-advanced"。
`);
```

### 步骤2：执行搜索

用搜索API或web抓取获取资料：

```javascript
// 使用 Tavily API（如果有）
const Tavily = process.env.TAVILY_API_KEY;
// 或使用 DuckDuckGo 免费搜索

// 抓取关键URL的内容
const content = await fetch(url).then((r) => r.text());
```

### 步骤3：LLM分析

用本CLI的LLM分析内容：

```javascript
const analysis = await llm.complete(`
${promptWithContent}
`);
```

### 步骤4：创建技能

将分析结果保存为skill：

```javascript
// 创建 skill/SKILL.md
```

### 步骤5：记录反思

保存进化日志：

```javascript
const evolutionLog = {
  timestamp: new Date().toISOString(),
  direction,
  skillsCreated,
  insights,
};
// 保存到 ~/.stigmergy/skills/{cli}/evolution/log.json
```

## Storage Locations

- 技能存储：`~/.stigmergy/skills/{cli}/`
- 知识库：`~/.stigmergy/skills/{cli}/knowledge/`
- 进化日志：`~/.stigmergy/skills/{cli}/evolution/log.json`
- 反思记录：`~/.stigmergy/reflection/{cli}/`

## Example Output

执行后的输出示例：

```
⚡ [Soul Auto Evolve] Starting autonomous evolution for: web-security

🔍 [1/4] Determining learning direction...
   Direction: web-security

🌐 [2/4] Searching for knowledge...
   - Found: 5 sources
   - Analyzed: 3 articles

📝 [3/4] Creating new skill...
   ✅ Created: web-security-basics
   ✅ Created: csrf-prevention

📊 [4/4] Self-reflection...
   - Success: Used LLM to analyze patterns
   - Improvement: Should search more authoritative sources
   - Score: 82/100

✅ Evolution complete!
   Skills created: 2
   Knowledge entries: 15
   Reflection score: 82
```

## Configuration

环境变量：

```bash
# Tavily API (可选，免费1000次/月)
export TAVILY_API_KEY=your_api_key

# 进化间隔（毫秒）
export SOUL_EVOLVE_INTERVAL=3600000  # 1小时

# 最大每次创建技能数
export SOUL_MAX_SKILLS=3
```

## Notes

1. 此skill利用**本CLI自己的LLM**进行处理，不是调用外部API
2. 进化是自主的，不需要人工干预
3. 每次进化会记录日志，供后续反思使用
4. 建议设置定时任务自动执行（如每小时）
