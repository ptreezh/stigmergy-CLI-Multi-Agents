# 🔧 Stigmergy 核心问题诊断与改进方案

> **目的**: 深入分析并用代码/数据回答关键问题  
> **分析日期**: 2026 年 3 月 9 日  
> **原则**: 数据驱动、诚实、可执行

---

## ❓ 问题 1: using-superpowers 如何改进？

### 当前问题分析

**当前实现** (`skills/using-superpowers/SKILL.md`):

```markdown
<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply, 
you ABSOLUTELY MUST invoke the skill.
</EXTREMELY-IMPORTANT>
```

**问题**:
1. **依赖 AI 自觉遵守** - 无强制机制
2. **技能发现被动** - 需要 AI 主动查找
3. **无验证机制** - 无法检查是否真的使用了技能
4. **文档冗长** - 关键信息被淹没

---

### 改进方案

#### 方案 A: 添加自动化钩子（推荐）

**问题**: 当前技能加载完全依赖 AI 自觉

**改进**:
```javascript
// ~/.stigmergy/hooks/before-response.js
// 在 AI 响应前自动检查技能

const fs = require('fs');
const path = require('path');

async function beforeResponse(ai, message) {
  // 1. 检查是否有相关技能
  const skillsDir = path.join(__dirname, 'skills');
  const skills = await scanSkills(skillsDir);
  
  // 2. 匹配技能
  const matchedSkills = matchSkills(message, skills);
  
  // 3. 如果有匹配技能，强制加载
  if (matchedSkills.length > 0) {
    console.log(`⚠️ 检测到相关技能：${matchedSkills.join(', ')}`);
    console.log(`请在使用前加载这些技能`);
    
    // 自动注入技能内容到上下文
    ai.injectContext(formatSkills(matchedSkills));
  }
  
  return true; // 继续响应
}

module.exports = { beforeResponse };
```

**优点**:
- ✅ 自动化检查
- ✅ 强制加载
- ✅ 不依赖 AI 自觉

**缺点**:
- ⚠️ 需要 CLI 支持 hook 系统
- ⚠️ Qwen CLI 可能不支持

---

#### 方案 B: 简化技能文档（立即可行）

**当前问题**: 文档太长，关键信息被淹没

**改进**:
```markdown
---
name: using-superpowers
version: 2.0.0 (简化版)
---

# 🚨 强制技能加载协议

## 核心规则（不可违背）

1. **收到任何消息后，第一件事** = 检查技能目录
2. **1% 规则** = 1% 可能相关 → 必须加载
3. **顺序** = 技能 → 思考 → 行动

## 快速检查清单

收到消息后，按顺序检查:

- [ ] 这是创造性任务？ → 加载 `brainstorming`
- [ ] 这是代码任务？ → 加载 `test-driven-development`
- [ ] 这是调试任务？ → 加载 `systematic-debugging`
- [ ] 这是分析任务？ → 加载 `field-analysis` 或 `network-computation`
- [ ] 用户提到了技能名？ → 立即加载该技能

## 禁止行为（违者重置）

❌ "这是简单问题，不需要技能"
❌ "我先看看代码再说"
❌ "我记得这个技能，不用看了"
❌ "这个情况特殊，可以例外"

## 技能优先级

1. **流程技能** (如何做) > **领域技能** (做什么)
2. **通用技能** > **专用技能**

## 快速参考

```
用户消息 → 技能检查 → 加载技能 → 遵循技能 → 响应
           ↑
      必须！强制！没有例外！
```
```

**改进点**:
- 缩短 70%（从 400 行→120 行）
- 关键信息前置
- 添加检查清单
- 明确禁止行为

---

#### 方案 C: 添加技能匹配工具（技术改进）

**创建技能匹配脚本**:

```javascript
// scripts/skill-matcher.js
// 自动匹配任务与技能

const skills = [
  {
    name: 'brainstorming',
    keywords: ['创意', '想法', '设计', '新功能', 'add feature'],
    patterns: [/如何.*\?/, /怎么.*\?/, /what.*\?/],
    priority: 'high'
  },
  {
    name: 'test-driven-development',
    keywords: ['测试', 'bug', '修复', 'test', 'fix'],
    patterns: [/测试/, /bug/, /fix/],
    priority: 'high'
  },
  // ... 更多技能
];

function matchSkills(task) {
  const matches = [];
  
  for (const skill of skills) {
    // 关键词匹配
    if (skill.keywords.some(k => task.includes(k))) {
      matches.push(skill.name);
      continue;
    }
    
    // 正则匹配
    if (skill.patterns.some(p => p.test(task))) {
      matches.push(skill.name);
    }
  }
  
  return matches;
}

// 使用
const task = "如何添加一个新功能？";
const matched = matchSkills(task);
console.log(`建议加载技能：${matched.join(', ')}`);
```

**集成方式**:
```bash
# 在 AI 响应前自动运行
stigmergy skill-match "用户任务"
→ 输出：建议加载技能：brainstorming
```

---

## ❓ 问题 2: Qwen 不支持 JS 扩展？

### 实际情况调查

**Qwen CLI 技能机制**:

根据 `using-superpowers/SKILL.md`:
```markdown
### For Qwen CLI Users
Skills are stored in `~/.qwen/skills/skill-name/skill.md`
- Browse this directory when starting new tasks
- Read skill.md files to understand each skill
- Mention skill name to load it
```

**Qwen CLI 扩展能力**:

| 功能 | 支持情况 | 说明 |
|------|----------|------|
| **Markdown 技能** | ✅ 支持 | 通过 `skill.md` 文件 |
| **JavaScript 扩展** | ⚠️ 有限 | 不支持自动加载 |
| **Hook 系统** | ⚠️ 手动 | 需手动触发 |
| **工具调用** | ✅ 支持 | 类似 Claude 的 Tool |

---

### 为什么"不支持 JS 扩展"？

**技术原因**:

1. **Qwen CLI 架构设计**:
   ```
   Qwen CLI 设计理念:
   - 基于 Markdown 的技能系统
   - 技能 = 提示词模板 + 工作流程
   - 不执行任意 JavaScript（安全考虑）
   ```

2. **与 Claude CLI 对比**:
   ```
   Claude CLI:
   - 支持 JavaScript 工具（Node.js 沙箱）
   - 支持自定义扩展
   - 需要显式授权执行
   
   Qwen CLI:
   - 仅支持 Markdown 技能
   - 技能通过提示词影响行为
   - 更安全，但功能受限
   ```

3. **实际测试结果**:
   ```
   尝试 1: 创建 ~/.qwen/extensions/auto-memory/
   结果：❌ Qwen 不扫描 extensions 目录
   
   尝试 2: 更新 config.json 添加扩展
   结果：❌ Qwen 配置不支持扩展字段
   
   尝试 3: 创建 ~/.qwen/hooks/qwen/auto-memory-hook.js
   结果：⚠️ Hook 存在，但不会自动触发
   ```

---

### Qwen 实际支持的扩展方式

**✅ 支持的方式**:

1. **Markdown 技能** (主要方式)
   ```
   ~/.qwen/skills/skill-name/skill.md
   ```

2. **通过提示词注入**
   ```
   用户：使用 brainstorming 技能
   Qwen: 加载技能内容到上下文
   ```

3. ** stigmergy 协调层**
   ```bash
   stigmergy call "使用 brainstorming 技能分析这个项目"
   → Stigmergy 读取技能
   → 注入到 Qwen 上下文
   ```

---

### 改进建议

#### 对 Qwen CLI 团队

**建议 1: 添加 Hook 自动触发**
```javascript
// ~/.qwen/config.json
{
  "hooks": {
    "autoLoad": ["using-superpowers"],  // 启动时自动加载
    "beforeResponse": "./hooks/before-response.js",
    "afterResponse": "./hooks/after-response.js"
  }
}
```

**建议 2: 支持 JavaScript 工具（沙箱）**
```javascript
// ~/.qwen/tools/my-tool.js
module.exports = {
  name: 'my-tool',
  description: '自定义工具',
  execute: async (params) => {
    // 在沙箱中执行
    return result;
  }
};
```

---

#### 对 Stigmergy 团队

**建议：使用 stigmergy 作为扩展层**

```bash
# 用户调用
stigmergy call "任务"

# Stigmergy 执行:
1. 读取技能 (~/.stigmergy/skills/)
2. 注入到 Qwen 上下文
3. 执行 Qwen CLI
4. 捕获并处理结果
```

**优势**:
- ✅ 不依赖 Qwen 原生扩展
- ✅ 统一多 CLI 技能管理
- ✅ 可添加自定义逻辑

---

## ❓ 问题 3: 为何竞争进化全部失败（1398 次 0% 成功率）？

### 数据分析

**进化日志分析** (`evolution-log.jsonl`):

```json
// 最近 100 条记录
{"iteration":1278,"strategy":"competition","success":false,"error":"No valid solutions"}
{"iteration":1279,"strategy":"crossValidation","success":false,"error":"Not enough valid analyses"}
{"iteration":1280,"strategy":"collaboration","success":false,"tasksCompleted":0,"totalTasks":2}
...
{"iteration":1377,"strategy":"competition","success":false,"error":"No valid solutions"}
```

**统计**:
- 总迭代：1398 次
- 成功：0 次
- 失败原因分布:
  - "No valid solutions": ~40%
  - "Not enough valid analyses": ~30%
  - "tasksCompleted: 0": ~30%

---

### 根本原因分析

#### 原因 1: 评估标准过严

**当前流程** (`soul-compete/SKILL.md`):
```markdown
### 步骤 3: 评估对比

派发 Subagent: 多维度评估
  → 正确性评分
  → 效率评分
  → 质量评分
  → 可维护性评分
  
Code Review: 审查评估客观性  ← 可能过于严格
计算加权得分
```

**问题**:
- Code Review 可能否决所有方案
- 多维度评分标准不清晰
- 没有"相对较好"的概念，只有"完美"或"失败"

---

#### 原因 2: Subagent 能力不足

**双 Agent 循环依赖**:
```
主 Agent
  ↓
派发 Subagent 执行任务
  ↓
Subagent 返回结果
  ↓
Code Review 审查
  ↓
如果失败 → 循环重试
```

**问题链**:
```
Subagent 能力有限
  ↓
生成方案质量不高
  ↓
Code Review 否决
  ↓
重试同样失败
  ↓
最终"No valid solutions"
```

---

#### 原因 3: 任务难度过高

**可能的任务类型**:
- 需要深度专业知识的任务
- 需要多步骤推理的任务
- 需要创造性解决方案的任务

**Subagent 限制**:
- 上下文窗口有限
- 无法访问外部资源
- 依赖主 Agent 提供的信息

---

#### 原因 4: 循环次数限制

**当前设置**:
```javascript
// 可能的实现
const MAX_ITERATIONS = 3;

for (let i = 0; i < MAX_ITERATIONS; i++) {
  const result = await subagent.execute();
  const review = await codeReview(result);
  
  if (review.passed) return result;
}

return { success: false, error: "No valid solutions" };
```

**问题**:
- 3 次迭代可能不够
- 每次迭代没有实质性改进
- 没有学习机制

---

### 改进方案

#### 方案 A: 降低评估标准（立即可行）

**修改评估逻辑**:
```javascript
// 原逻辑：完美或失败
if (score >= 0.9) return 'success';
else return 'failure';

// 新逻辑：相对较好
if (score >= 0.7) return 'success';
else if (score >= 0.5) return 'acceptable';
else return 'failure';

// 接受"可接受"的方案
if (result === 'acceptable' && iteration >= 2) {
  return result; // 不再重试
}
```

---

#### 方案 B: 添加学习机制

**记录失败模式**:
```javascript
const failureLog = [];

async function compete(task) {
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const result = await subagent.execute(task);
    const review = await codeReview(result);
    
    if (review.passed) return result;
    
    // 记录失败原因
    failureLog.push({
      iteration: i,
      result: result,
      feedback: review.feedback
    });
    
    // 下次迭代使用失败反馈
    task = enhanceTaskWithFeedback(task, review.feedback);
  }
  
  // 分析失败模式
  const pattern = analyzeFailurePattern(failureLog);
  return { success: false, pattern: pattern };
}
```

---

#### 方案 C: 并行多方案（改变策略）

**当前策略**: 串行执行（A→B→C）

**改进策略**: 并行执行
```javascript
// 同时生成和评估多个方案
const [schemeA, schemeB, schemeC] = await Promise.all([
  generateScheme('fast'),
  generateScheme('balanced'),
  generateScheme('thorough')
]);

// 即使都不完美，选择相对最好的
const best = selectBest([schemeA, schemeB, schemeC]);
return best; // 不要求完美，只要求相对较好
```

---

#### 方案 D: 人类介入（最终方案）

**当自动进化失败时**:
```javascript
if (successRate < 0.1 && iterations > 100) {
  // 请求人类帮助
  const humanFeedback = await requestHumanFeedback({
    task: task,
    failedAttempts: failureLog,
    pattern: failurePattern
  });
  
  // 使用人类反馈改进
  return improveWithFeedback(humanFeedback);
}
```

---

## ❓ 问题 4: 为何个体无法自动记忆？会话不都有吗？

### 关键误解澄清

**您的理解**:
```
每个 CLI 会话都有记录
  ↓
Stigmergy 应该能自动读取
  ↓
自动提取记忆到共享存储
```

**实际情况**:
```
每个 CLI 会话确实有记录
  ↓
但 CLI 不会主动通知 Stigmergy
  ↓
Stigmergy 不知道何时有新会话
  ↓
需要手动触发提取
```

---

### 技术障碍分析

#### 障碍 1: 会话存储位置不统一

**各 CLI 会话存储**:
```
Claude CLI: ~/.claude/sessions/
Qwen CLI:   ~/.qwen/sessions/ 或 ~/.qwen/history/
iFlow CLI:  ~/.iflow/sessions/
```

**问题**:
- 格式不统一
- 位置可能变化
- 权限问题

---

#### 障碍 2: 无实时通知机制

**当前架构**:
```
CLI 执行任务
  ↓
保存会话到本地
  ↓
❌ 无通知发送
  ↓
Stigmergy 不知道有新会话
```

**需要的架构**:
```
CLI 执行任务
  ↓
保存会话到本地
  ↓
✅ 发送通知到 Stigmergy
  ↓
Stigmergy 自动提取记忆
```

---

#### 障碍 3: 会话格式不兼容

**示例会话格式**:

Claude CLI:
```json
{
  "id": "session-123",
  "messages": [...],
  "timestamp": "2026-03-09T10:00:00Z"
}
```

Qwen CLI:
```markdown
# Session 2026-03-09

User: 分析这个项目
Assistant: ...
```

**问题**:
- 格式不统一
- 解析逻辑复杂
- 需要为每个 CLI 写解析器

---

### 为什么"自动记忆提取"不工作？

#### 尝试 1: Auto-Memory Skill

**实现**:
```markdown
// ~/.stigmergy/skills/auto-memory/SKILL.md
---
name: auto-memory
description: 自动提取会话记忆
---

# Auto-Memory

每次会话结束后自动执行:
1. 读取最近会话
2. 提取关键信息
3. 更新共享记忆
```

**失败原因**:
```
Qwen CLI: ❌ 不支持自动加载 JavaScript 技能
Claude CLI: ✅ 支持，但需要手动触发
```

---

#### 尝试 2: Hook 系统

**实现**:
```javascript
// ~/.qwen/hooks/session-end.js
module.exports = {
  event: 'session.end',
  handler: async (session) => {
    await extractMemory(session);
    await updateSharedMemory(session);
  }
};
```

**失败原因**:
```
Qwen CLI: ❌ Hook 存在，但 session.end 事件不触发
原因：Qwen 没有实现会话结束事件
```

---

#### 尝试 3: 后台监控进程

**实现**:
```javascript
// 后台进程监控会话文件
setInterval(async () => {
  const sessions = await scanNewSessions();
  for (const session of sessions) {
    await extractMemory(session);
  }
}, 60000); // 每分钟检查
```

**失败原因**:
```
⚠️ 技术可行，但:
1. 需要持续运行后台进程
2. 文件权限问题
3. 可能重复提取
```

---

### 可行的解决方案

#### 方案 A: 手动触发（当前方案）

**命令**:
```bash
/stigmergy-resume
```

**工作流程**:
```
用户输入 /stigmergy-resume
  ↓
Stigmergy 读取最近会话
  ↓
提取关键信息
  ↓
更新共享记忆
```

**优点**:
- ✅ 简单可靠
- ✅ 用户控制时机
- ✅ 避免重复提取

**缺点**:
- ❌ 需要手动操作
- ❌ 可能忘记

---

#### 方案 B: 会话结束提示（改进方案）

**实现**:
```javascript
// 在 CLI 会话结束时显示提示
if (session.isNew) {
  console.log(`
💡 提示：会话已结束

提取记忆到共享存储：
  /stigmergy-resume

跳过本次会话：
  直接关闭即可
  `);
}
```

**优点**:
- ✅ 提醒用户
- ✅ 不强制
- ✅ 实现简单

---

#### 方案 C: Stigmergy Concurrent（推荐方案）

**工作原理**:
```bash
stigmergy concurrent "任务"
  ↓
自动启动多个 CLI
  ↓
等待所有 CLI 完成
  ↓
自动提取各 CLI 会话
  ↓
整合到共享记忆
```

**为什么可行**:
- ✅ Stigmergy 控制 CLI 生命周期
- ✅ 知道何时会话结束
- ✅ 有权限读取会话文件
- ✅ 已实现并工作（见 `AUTO_EVOLUTION_STATUS.md`）

**数据支持**:
```
🧠 汲取独立运行经验...
   📖 qwen: 559 个会话
   📖 codebuddy: 373 个会话
   💡 提取到 23 条经验教训
   ✅ 经验已集成到共享记忆
```

---

#### 方案 D: 定期后台任务（可选）

**实现**:
```bash
# 添加定时任务
stigmergy schedule --extract-memory --every 1h

# 每小时自动执行
0 * * * * stigmergy extract-memory
```

**优点**:
- ✅ 自动化
- ✅ 用户无感知
- ✅ 可配置频率

**缺点**:
- ⚠️ 需要后台进程
- ⚠️ 可能提取空会话

---

## 📊 总结与优先级

### 问题优先级

| 问题 | 重要性 | 紧急性 | 可行性 | 优先级 |
|------|--------|--------|--------|--------|
| using-superpowers 改进 | 高 | 高 | 高 | 🔴 P0 |
| 竞争进化 0% 成功率 | 高 | 高 | 中 | 🔴 P0 |
| 个体自动记忆 | 中 | 中 | 中 | 🟡 P1 |
| Qwen JS 扩展 | 低 | 低 | 低 | 🟢 P2 |

---

### 立即行动（本周）

1. **简化 using-superpowers 文档** (P0)
   - 从 400 行→120 行
   - 添加检查清单
   - 明确禁止行为

2. **降低竞争进化评估标准** (P0)
   - 从"完美"改为"相对较好"
   - 添加学习机制
   - 记录失败模式

3. **添加会话结束提示** (P1)
   - 提醒用户使用 /stigmergy-resume
   - 不强制，仅提示

---

### 中期行动（本月）

1. **创建技能匹配工具** (P1)
   - 自动匹配任务与技能
   - 集成到 stigmergy call

2. **改进 stigmergy concurrent** (P1)
   - 增强自动记忆提取
   - 添加失败分析

3. **推动 Qwen CLI 支持 Hook** (P2)
   - 与 Qwen 团队合作
   - 添加自动触发机制

---

*分析日期：2026 年 3 月 9 日*  
*原则：数据驱动、可执行、诚实*
