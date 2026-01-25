# Agents和Skills部署验证报告

## ✅ 实际部署情况

### 部署位置

```
iflow的配置被扫描并打包，然后部署到：
├── ~/.iflow/agents/    ← iflow自己的agents
├── ~/.iflow/skills/    ← iflow自己的skills
├── ~/.qwen/agents/     ← 从iflow部署过来的agents
├── ~/.qwen/skills/     ← 从iflow部署过来的skills
├── ~/.codebuddy/agents/
├── ~/.codebuddy/skills/
├── ~/.qodercli/agents/
└── ~/.qodercli/skills/
```

### 目录结构验证

#### Agents目录 (~/.qwen/agents/)
```
ant-expert.md          ← Agent配置文件
chinese-localization-expert.md
digital-marx-expert.md
field-analysis-expert.md
grounded-theory-expert.md
literature-expert.md
README.md
```

Agent文件格式：
```yaml
---
name: ant-expert
description: 行动者网络理论专家...
model: claude-3-5-sonnet-20241022
core_skills:
  - ant
---
```

#### Skills目录 (~/.qwen/skills/)
```
brainstorming/          ← Skill包（子目录）
├── skill.md
code-analysis/
dispatching-parallel-agents/
...
```

Skill文件格式：
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work..."
---
```

### 部署逻辑

**ConfigDeployer.js (第192行)**:
```javascript
// 部署agents
await this.deployConfigItem(cliName, 'agents', cliConfig.agents.items);
// 部署到 ~/.qwen/agents/
```

**ConfigDeployer.js (第197行)**:
```javascript
// 部署skills
await this.deployConfigItem(cliName, 'skills', cliConfig.skills.items);
// 部署到 ~/.qwen/skills/
```

## ⚠️ 发现的问题

### 问题1: Agent定义文件的格式

**现状**：
- Agent文件 (ant-expert.md) 包含 `name` 和 `description`
- 格式类似skill，但有额外的 `model` 和 `core_skills` 字段

**问题**：
- 这看起来像agent配置，但没有验证目标CLI是否能识别和使用
- 不同CLI工具的agent格式可能不同

### 问题2: 没有自动激活机制

**现状**：
- ✅ 文件被复制到目标目录
- ❌ **但没有触发目标CLI自动激活或加载**

**缺失的功能**：
```javascript
// 当前：只是复制文件
await fs.writeFile(targetPath, content, 'utf8');

// 应该有：通知CLI重新加载配置
// 或者在CLI启动时自动扫描并加载
```

### 问题3: iflow.md也被部署到其他CLI

**deployment-manifest.json (第43-47行)**:
```json
{
  "source": "iflow",
  "target": "qwen",
  "type": "config",
  "targetPath": "C:\\Users\\Zhang\\.qwen\\iflow.md",
  "itemCount": 1
}
```

**问题**：
- 把 iflow.md 部署到 ~/.qwen/ 目录
- 这不太合理，应该是：
  - iflow.md → ~/.iflow/iflow.md
  - 或者完全不部署

## 📋 需要澄清的问题

### 1. Agents和Skills的区别？

| 特性 | Agents | Skills |
|-----|---------|--------|
| 目录 | ~/.cli/agents/ | ~/.cli/skills/ |
| 格式 | .md文件（Agent定义） | 子目录+skill.md |
| 用途 | 定义AI代理角色 | 定义可重用的技能 |
| 激活 | ❓ 未验证 | ❓ 未验证 |

### 2. 自动激活机制？

**关键问题**：部署后，目标CLI如何使用这些agents/skills？

**实际测试结果**（2026-01-24）：

✅ **qwen CLI已验证**：
- ✅ CLI启动时自动扫描`~/.qwen/skills/`目录
- ✅ 当用户**明确提及skill名称**时，CLI会识别并尝试加载
- ❌ 当用户输入关键词（如"计算"）时，**不会自动激活**相关skill

**测试案例**：
```
# 测试1: 关键词触发 - ❌ 未激活
用户: "请帮我计算 123 + 456"
结果: 直接给出答案，未加载test-calculator skill

# 测试2: 明确调用 - ✅ 成功识别
用户: "请使用test-calculator技能帮我计算平均值"
结果: CLI说"我需要先检查系统中是否存在名为'test-calculator'的技能"
```

**qwen的激活方式**：
- **方式A**: ✅ CLI启动时扫描并记录所有可用skills
- **方式B**: ✅ 用户明确提到skill名称时加载
- **方式C**: ❌ 关键词不会自动触发（尽管skill的description包含关键词）

**注意**：hooks.json中的`trigger_keywords`是用于"qwen_superpowers"功能，与skill激活无关。

### 3. 确认需求

用户需要澄清：
- [ ] 部署的agents是否应该自动在目标CLI中激活？
- [ ] 如何验证agents/skills是否被正确使用？
- [ ] iflow.md是否应该部署到其他CLI？
- [ ] 是否需要配置文件来声明激活哪些agents/skills？

## 🔧 建议的改进

### 1. 添加激活机制

```javascript
async deployCLIConfig(cliName, cliConfig) {
  // 1. 复制文件
  await this.deployConfigItem(cliName, 'agents', cliConfig.agents.items);

  // 2. 生成激活配置
  const activationConfig = {
    agents: cliConfig.agents.items.map(item => item.path),
    skills: cliConfig.skills.items.map(item => item.path),
    activatedAt: new Date().toISOString()
  };

  // 3. 写入激活配置文件
  const configPath = path.join(os.homedir(), `.${cliName}`, 'stigmergy-activation.json');
  await fs.writeFile(configPath, JSON.stringify(activationConfig, null, 2), 'utf8');
}
```

### 2. 修复iflow.md部署逻辑

```javascript
// 只部署到源CLI本身
if (cliName === sourceCLI) {
  await this.deployMarkdownConfig(cliName, cliConfig.markdown);
}
```

### 3. 添加验证命令

```bash
stigmergy verify-deployment  # 验证部署是否正确
stigmergy list-skills qwen   # 列出qwen可用的skills
stigmergy list-agents qwen   # 列出qwen可用的agents
```

## 🎯 回答用户的问题

### Q: Agents和Skills如何部署？
**A**: 通过ConfigDeployer，从iflow扫描，分别部署到目标CLI的agents/和skills/目录

### Q: 是否需要目标CLI自动激活？
**A**: ❌ 当前没有自动激活机制，只是复制文件

### Q: 部署到哪里？
**A**:
- Agents → ~/.qwen/agents/
- Skills → ~/.qwen/skills/
- iflow.md → ~/.qwen/iflow.md (❌ 这可能不对)

### Q: 确定正确吗？
**A**: ⚠️ 有问题：
- 部署位置正确（分开的目录）
- 但没有激活机制
- iflow.md部署逻辑有问题

### Q: 之前反馈说把agents部署为skills了？
**A**: 🤔 可能是误解，实际部署是分开的：
- agents目录存放.md文件
- skills目录存放子目录
- 但需要验证目标CLI是否能正确区分和使用

---

**建议**：
1. 澄清agents和skills的激活机制
2. 修复iflow.md的部署逻辑
3. 添加验证命令确认部署是否生效
