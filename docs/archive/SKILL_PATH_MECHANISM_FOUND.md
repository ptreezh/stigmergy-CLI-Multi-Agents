# Skill路径机制真相

## 发现的关键证据

从 `src/core/local_skill_scanner.js` (第223-241行)：

```javascript
async scanAll() {
  const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'copilot', 'codex'];
  const results = {
    skills: {},
    agents: {},
    timestamp: new Date().toISOString()
  };

  for (const cli of cliTools) {
    const cliConfigPath = path.join(os.homedir(), `.${cli}`);  // ← ~/.qwen
    const skillsPath = path.join(cliConfigPath, 'skills');     // ← ~/.qwen/skills
    const agentsPath = path.join(cliConfigPath, 'agents');     // ← ~/.qwen/agents

    results.skills[cli] = await this.scanDirectory(skillsPath, 'skill');
    results.agents[cli] = await this.scanDirectory(agentsPath, 'agent');
  }

  return results;
}
```

## 真相1: Stigmergy扫描各CLI的独立路径

**Stigmergy扫描**:
```
~/.qwen/skills/
~/.codebuddy/skills/
~/.iflow/skills/
~/.qodercli/skills/
```

**不是**:
```
~/.stigmergy/skills/  ❌
```

## 真相2: Skill文件名要求

从 `scanDirectory` 方法（第246-296行）：

```javascript
// Try to find SKILL.md or AGENT.md
const skillMdPath = path.join(itemPath, 'SKILL.md');  // ← 大写！
const agentMdPath = path.join(itemPath, 'AGENT.md');  // ← 大写！
```

**这意味着**:
- ✅ 正确: `~/.qwen/skills/test-calculator/SKILL.md`
- ❌ 错误: `~/.qwen/skills/test-calculator/skill.md` (小写)

## 关键问题

**我们之前的测试创建的是小写的 `skill.md`！**

```javascript
// test-skill-deployment.js (第54行)
const skillFile = path.join(tempSkillPath, 'skill.md');  // ← 小写！
```

**所以即使部署到正确位置，Stigmergy也不会识别它！**

## Qwen为什么会提到Stigmergy？

从测试输出看：
```
"我将使用Stigmergy技能系统来调用test-qwen-skill技能..."
```

这不是因为qwen扫描`~/.stigmergy/skills/`，而是因为：
1. **Stigmergy的技能系统是一个抽象层**
2. Qwen通过stigmergy命令来调用skill
3. Skill文件实际在 `~/.qwen/skills/`，但通过stigmergy系统访问

## 正确的部署路径

**应该部署到**:
```
~/.qwen/skills/test-calculator/SKILL.md  (大写)
~/.codebuddy/skills/test-calculator/SKILL.md
~/.iflow/skills/test-calculator/SKILL.md
```

**而不是**:
```
~/.stigmergy/skills/test-calculator/skill.md  ❌
```

## 需要修复的地方

### 1. ConfigDeployer.js - 文件名错误

```javascript
// 当前 (错误)
const skillFile = path.join(targetDir, 'skill.md');

// 应该 (正确)
const skillFile = path.join(targetDir, 'SKILL.md');
```

### 2. 需要验证iflow的agents格式

iflow使用 `agent-name.md` 而不是 `AGENT.md`，这可能是不同的机制。

## 总结

1. ✅ **部署到各CLI独立路径是正确的**
   - `~/.qwen/skills/`
   - `~/.codebuddy/skills/`
   - 等等

2. ❌ **不需要部署到stigmergy统一路径**
   - Stigmergy只是协调层
   - 不存储实际的skill文件

3. ⚠️ **文件名必须是大写 `SKILL.md`**
   - 这就是为什么之前的测试失败！

4. ❓ **需要重新测试**
   - 使用正确的文件名格式
   - 部署到正确的CLI独立路径
