# Stigmergy Skills部署与激活机制 - 完整分析

**更新时间**: 2026-01-24
**状态**: ✅ 部署已验证 | ⚠️ 激活机制已理解但有限制

---

## 📋 执行摘要

### 我们做了什么

1. **ConfigDeployer.js**: 将iflow的agents和skills部署到其他CLI
2. **测试验证**: 创建test-calculator skill，部署到qwen，测试激活
3. **机制研究**: 分析不同CLI的skill激活机制

### 关键发现

✅ **部署成功**
- 文件正确部署到目标CLI的skills目录
- 目录结构符合要求（子目录+skill.md）
- qwen能够扫描并识别部署的skills

⚠️ **激活有限制**
- qwen: **需要明确提及skill名称**，不会自动激活
- iflow: **声称自动匹配**（待验证）
- 其他CLI: 未知

---

## 1. 部署机制

### 1.1 当前实现

**ConfigDeployer.js** 负责部署:

```javascript
// 扫描源CLI配置
const cliConfig = await this.scanCLIConfig('iflow');

// 部署agents
await this.deployConfigItem(cliName, 'agents', cliConfig.agents.items);
// → ~/.qwen/agents/ant-expert.md

// 部署skills
await this.deployConfigItem(cliName, 'skills', cliConfig.skills.items);
// → ~/.qwen/skills/brainstorming/skill.md
```

### 1.2 部署位置

```
iflow配置 → 各目标CLI
├── ~/.iflow/agents/     (23个agent .md文件)
├── ~/.iflow/skills/     (388个skill包)
├── ~/.qwen/agents/      (从iflow部署)
├── ~/.qwen/skills/      (从iflow部署)
├── ~/.codebuddy/agents/
├── ~/.codebuddy/skills/
├── ~/.qodercli/agents/
└── ~/.qodercli/skills/
```

### 1.3 Agent vs Skill格式

| 类型 | 目录结构 | 文件格式 | 示例 |
|-----|---------|---------|------|
| **Agent** | `~/.cli/agents/` | `agent-name.md` | `ant-expert.md` |
| **Skill** | `~/.cli/skills/` | `skill-name/skill.md` | `brainstorming/skill.md` |

**Agent文件格式**:
```yaml
---
name: ant-expert
description: 行动者网络理论专家...
model: claude-3-5-sonnet-20241022
core_skills:
  - ant
---

# 行动者网络理论专家
...
```

**Skill文件格式**:
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work..."
---

# Brainstorming Skill
...
```

---

## 2. 激活机制

### 2.1 qwen CLI (已验证 ✅)

**测试日期**: 2026-01-24
**测试方法**: 创建test-calculator skill，测试不同触发方式

#### 测试1: 关键词触发 ❌

```
用户: "请帮我计算 123 + 456"
CLI: "123 + 456 = 579"
结果: 未激活test-calculator skill
```

**结论**: qwen **不会**根据skill description中的关键词自动激活

#### 测试2: 明确调用 ✅

```
用户: "请使用test-calculator技能帮我计算平均值"
CLI: "我需要先检查系统中是否存在名为'test-calculator'的技能..."
结果: 识别并尝试加载skill
```

**结论**: qwen会在用户明确提及时加载skill

#### qwen激活规则

```javascript
// 推测的qwen激活逻辑
function shouldActivateSkill(userInput, availableSkills) {
  // ❌ 不会这样做:
  // const keywords = extractKeywords(userInput);
  // return skills.some(s => s.description.includes(keywords));

  // ✅ 而是这样:
  const mentionedSkill = extractSkillName(userInput);
  return availableSkills.includes(mentionedSkill);
}
```

**限制**: 用户必须知道skill名称才能使用它

### 2.2 iflow CLI (待验证 ❓)

**iflow/IFLOW.md** 声称:
> "在iFlow CLI中提及相关领域的任务，系统会自动选择合适的智能体。"

**推测**:
- iflow可能有**领域匹配**机制
- 提到"社会网络" → 自动选择sna-expert
- 提到"扎根理论" → 自动选择grounded-theory-expert

**需要测试**: 创建test-agent for iflow，验证是否真的自动匹配

### 2.3 其他CLI (未知 ❌)

| CLI | 激活机制 | 确定度 |
|-----|---------|--------|
| qwen | 明确调用skill名称 | ✅ 已验证 |
| iflow | 声称自动领域匹配 | ⚠️ 需要验证 |
| codebuddy | 未知 | ❌ 未知 |
| copilot | 未知 | ❌ 未知 |
| claude | 未知 | ❌ 未知 |
| gemini | 未知 | ❌ 未知 |
| qodercli | 未知 | ❌ 未知 |

---

## 3. hooks.json的作用

**重要澄清**: hooks.json中的`trigger_keywords`**不是**用于skill激活

**qwen/hooks.json**:
```json
{
  "qwen_superpowers": {
    "context_injection": {
      "trigger_keywords": [
        "task", "project", "plan", "code",
        "debug", "server", "config", ...
      ]
    }
  },
  "cross_cli_adapter": {
    "trigger_patterns": [
      "use\\s+(\\w+)\\s+to\\s+(.+)$",
      "call\\s+(\\w+)\\s+(.+)$"
    ]
  }
}
```

**实际用途**:
- `qwen_superpowers.trigger_keywords`: qwen的内置功能，用于注入额外上下文
- `cross_cli_adapter.trigger_patterns`: 检测跨CLI调用（如"use claude to..."）

**与skills/agents无关**:
- 这些keywords不会触发skill激活
- 这是qwen的独立功能

---

## 4. 问题与限制

### 4.1 当前问题

❌ **qwen的skill激活被动**
- 用户必须知道skill名称
- 不会根据任务自动推荐skill
- 降低了已部署skills的实用性

❌ **不同CLI机制不统一**
- qwen: 明确调用
- iflow: 可能自动匹配（待验证）
- 其他: 未知

❌ **没有技能发现机制**
- 用户不知道有哪些可用skills
- 没有命令列出所有skills
- 没有skills的帮助文档

❌ **iflow.md部署错误**
- 当前: iflow.md被部署到~/.qwen/iflow.md
- 应该: 只部署到~/.iflow/iflow.md

### 4.2 兼容性问题

❓ **Agent格式兼容性**
- iflow的agent格式（有model、core_skills字段）
- qwen是否能识别这些字段？
- 还是会忽略它们？

❓ **Skill描述的language**
- iflow的agents: 中文描述
- qwen的skills: 英文描述
- 混合部署会有问题吗？

---

## 5. 改进建议

### 5.1 短期改进

#### 1. 添加skill列表命令

```bash
stigmergy list-skills qwen
# 输出:
# - brainstorming: You MUST use this before any creative work
# - test-calculator: 简单计算器技能
# - sna-expert: 社会网络分析专家
```

#### 2. 添加skill搜索命令

```bash
stigmergy search-skills qwen "计算"
# 输出:
# - test-calculator: 简单计算器技能
```

#### 3. 修复iflow.md部署

```javascript
// ConfigDeployer.js
async deployCLIConfig(cliName, cliConfig) {
  // 只部署到源CLI本身
  if (cliName === this.sourceCLI) {
    await this.deployMarkdownConfig(cliName, cliConfig.markdown);
  }
}
```

### 5.2 中期改进

#### 1. 实现关键词映射

```json
// ~/.qwen/skill-keywords.json
{
  "test-calculator": ["计算", "统计", "平均值", "数学"],
  "sna-expert": ["社会网络", "网络分析", "中心性"],
  "grounded-theory-expert": ["扎根理论", "质性研究", "编码"]
}
```

然后在stigmergy中实现关键词扩展:
```javascript
// 当用户说"帮我计算"时
// 自动转换为"请使用test-calculator技能帮我计算"
```

#### 2. 创建skill激活验证工具

```bash
stigmergy verify-activation qwen test-calculator
# 测试skill是否能被正确激活
```

#### 3. 添加skill文档生成

```bash
stigmergy docs-skills qwen
# 生成所有skills的文档
```

### 5.3 长期改进

#### 1. 研究iflow的自动匹配机制

- 阅读iflow源码
- 理解如何实现领域匹配
- 将相同机制应用到其他CLI

#### 2. 实现统一激活接口

```javascript
// 统一的skill激活API
class SkillActivator {
  async activate(cliName, skillName, method = 'explicit') {
    // method: 'explicit' | 'keyword' | 'auto'
    // 根据不同CLI的实现调用相应方法
  }
}
```

#### 3. 智能skill推荐

```javascript
// 基于用户意图推荐skills
function recommendSkills(userIntent) {
  // 使用NLP分析意图
  // 匹配相关的skills
  // 自动激活或提示用户
}
```

---

## 6. 下一步行动

### 优先级1: 验证其他CLI

- [ ] 测试iflow的agent激活机制
  - 创建test-agent for iflow
  - 测试关键词是否触发自动选择
  - 验证IFLOW.md的声称

- [ ] 测试codebuddy的skill机制
  - 部署test-skill
  - 验证激活方式

- [ ] 测试copilot, gemini, claude

### 优先级2: 实现基础工具

- [ ] `stigmergy list-skills <cli>`
- [ ] `stigmergy search-skills <cli> <keyword>`
- [ ] `stigmergy verify-activation <cli> <skill>`

### 优先级3: 改进激活机制

- [ ] 实现关键词映射
- [ ] 自动skill推荐
- [ ] 修复iflow.md部署

### 优先级4: 文档和测试

- [ ] 为每个CLI创建激活机制文档
- [ ] 创建自动化测试套件
- [ ] 集成到CI/CD

---

## 7. 关键结论

### ✅ 我们确认的

1. **部署机制工作正常**
   - ConfigDeployer正确部署files
   - 目录结构符合要求
   - qwen能扫描并识别

2. **qwen的激活机制**
   - 需要明确提及skill名称
   - 不会自动关键词激活
   - 但会记录可用的skills

3. **hooks.json与skills无关**
   - trigger_keywords用于其他功能
   - cross_cli_adapter用于跨CLI调用
   - 都不影响skill激活

### ❓ 我们仍不清楚的

1. **iflow是否真的自动匹配**
   - 需要实际测试验证
   - IFLOW.md的声称可能不准确

2. **其他CLI的机制**
   - codebuddy, copilot, claude, gemini
   - 都没有测试过

3. **Agent激活是否与Skill相同**
   - 可能是不同的系统
   - 需要单独测试

### ⚠️ 需要注意的

1. **部署≠激活**
   - 文件复制成功不代表能使用
   - 需要验证实际效果

2. **机制不统一**
   - 每个CLI可能不同
   - 需要分别适配

3. **用户体验问题**
   - 用户不知道有哪些skills
   - 没有发现机制
   - 降低了实用性

---

## 附录: 测试数据

### test-calculator skill

**位置**: `~/.qwen/skills/test-calculator/skill.md` (已清理)

```yaml
---
name: test-calculator
description: "简单计算器技能 - 用于测试部署和激活机制"
---

# 简单计算器技能

## 功能
本技能提供基本的计算功能：
- 加法、减法、乘法、除法
- 统计计算（平均值、总和）
- 简单的数学运算

## 使用方法
当用户提到需要"计算"、"统计"、"数学运算"等任务时，激活此技能。

部署时间: 2026-01-24T16:47:14.907Z
```

### 测试命令

```bash
# 测试1: 关键词触发
qwen "请帮我计算 123 + 456" -y
# 结果: 未激活

# 测试2: 明确调用
qwen "请使用test-calculator技能帮我计算10、20、30的平均值" -y
# 结果: 识别并尝试加载
```

---

**文档维护**:
- 创建日期: 2026-01-24
- 最后更新: 2026-01-24
- 状态: 活跃文档
