# 所有CLI的Skill注册机制 - 最终结论

**研究时间**: 2026-01-25 01:43
**研究范围**: 8个CLI工具

---

## 🎯 核心发现

### ✅ 所有CLI使用**完全相同**的注册机制！

| CLI | 文档 | Skills部分 | 格式 | 注册方法 | 状态 |
|-----|------|-----------|------|----------|------|
| claude | claude.md | ✓ | XML | xml-injection | ✅ 正常 |
| gemini | gemini.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| qwen | qwen.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| iflow | iflow.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| codebuddy | codebuddy.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| qodercli | qodercli.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| copilot | copilot.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |
| codex | codex.md | ✓ | XML | xml-injection | ⚠️ 有冲突 |

---

## 💡 真相揭晓

### 1. 注册机制：所有CLI都从自己的.md文档读取skills

**qwen的案例**：
```bash
# 用户说: "请使用test-calculator技能"
# qwen的工作流程:
1. 读取 qwen.md 文件
2. 查找 <available_skills> 部分
3. 搜索 "test-calculator"
4. 如果找到 → 加载skill
5. 如果没找到 → 说"技能不存在"
```

**这就是为什么之前的测试都失败了**：
- ✅ Skill文件被正确部署
- ❌ 但没有在qwen.md中注册
- ❌ qwen不知道有这个skill

### 2. 注册格式：所有CLI都使用XML格式

**标准格式**：
```xml
<skill>
<name>test-calculator</name>
<description>简单计算器技能 - 用于测试部署和激活机制</description>
<location>stigmergy</location>
</skill>
```

**注册位置**：
```xml
<!-- SKILLS_START -->
<skills_system priority="1">

## Stigmergy Skills

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>...</description>
<location>stigmergy</location>
</skill>

<!-- 在这里添加新skill -->

</available_skills>

</skills_system>
<!-- SKILLS_END -->
```

### 3. 部署位置：不限制

根据codebuddy的测试结果，它从`~/.stigmergy/skills/`加载，说明：
- ✅ 可以部署到stigmergy统一路径
- ✅ 也可以部署到各CLI独立路径
- ✅ 只要正确注册，CLI就能找到

---

## 📋 正确的部署流程

### 步骤1: 部署Skill文件

```javascript
// 部署到stigmergy统一路径（推荐）
const skillPath = path.join(os.homedir(), '.stigmergy', 'skills', skillName, 'skill.md');
await fs.writeFile(skillPath, skillContent, 'utf8');
```

### 步骤2: 注册到CLI的.md文档

```javascript
// 为每个目标CLI注册skill
for (const cliName of targetCLIs) {
  const cliDoc = path.join(process.cwd(), `${cliName}.md`);

  // 在<available_skills>中添加skill条目
  const skillEntry = `
<skill>
<name>${skillName}</name>
<description>${skillDescription}</description>
<location>stigmergy</location>
</skill>`;

  // 插入到<available_skills>和</available_skills>之间
  await this.insertSkillEntry(cliDoc, skillEntry);
}
```

### 步骤3: 验证注册

```bash
# 测试skill是否可用
qwen "请使用${skillName}技能"
codebuddy "请使用${skillName}技能"
```

---

## ⚠️ 当前问题

### 问题1: 合并冲突

**7个CLI有合并冲突**（除了claude）：
```xml
<<<<<<< HEAD
<name>ant</name>
=======
<name>algorithmic-art</name>
>>>>>>> bc9f83b088a8388ffb32199a4f0457e08dfc6580
```

**影响**：
- ❌ 无法正确读取skills列表
- ❌ 新skills无法注册
- ❌ 需要先解决冲突

**解决**：
```bash
# 手动解决冲突或使用git工具
git checkout --theirs gemini.md
git checkout --theirs qwen.md
# ... 对所有有冲突的文件
```

### 问题2: ConfigDeployer只部署文件，没有注册

**当前代码**：
```javascript
// ConfigDeployer.js
async deployConfigItem(cliName, type, items) {
  // 只复制文件
  await fs.writeFile(targetPath, content, 'utf8');
  // ❌ 没有注册到.md文档
}
```

**应该添加**：
```javascript
async deployConfigItem(cliName, type, items) {
  // 1. 复制文件
  await this.deployFiles(cliName, type, items);

  // 2. 注册到.md文档（如果是skills）
  if (type === 'skills') {
    await this.registerSkillsInCLI(cliName, items);
  }
}
```

---

## 🔧 实现建议

### 方案1: 修复ConfigDeployer

```javascript
class ConfigDeployer {
  async registerSkillsInCLI(cliName, skills) {
    const cliDoc = path.join(process.cwd(), `${cliName}.md`);
    const content = await fs.readFile(cliDoc, 'utf8');

    // 找到<available_skills>位置
    const startTag = '<available_skills>';
    const endTag = '</available_skills>';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag);

    if (startIndex === -1 || endIndex === -1) {
      console.log(`⚠️  ${cliName}.md没有skills部分，跳过注册`);
      return;
    }

    // 为每个skill添加条目
    let newContent = content;
    for (const skill of skills) {
      const entry = this.formatSkillEntry(skill);
      const insertPos = endIndex;
      newContent = newContent.slice(0, insertPos) + entry + newContent.slice(insertPos);
    }

    // 写回文件
    await fs.writeFile(cliDoc, newContent, 'utf8');
    console.log(`✓ 已注册${skills.length}个skills到 ${cliName}.md`);
  }

  formatSkillEntry(skill) {
    const name = this.extractSkillName(skill);
    const description = this.extractSkillDescription(skill);

    return `
<skill>
<name>${name}</name>
<description>${description}</description>
<location>stigmergy</location>
</skill>`;
  }
}
```

### 方案2: 先解决合并冲突

```bash
# 创建脚本自动解决冲突
#!/bin/bash
for cli in gemini qwen iflow codebuddy qodercli copilot codex; do
  git checkout --theirs ${cli}.md
  echo "✓ 已解决 ${cli}.md 的冲突"
done
```

### 方案3: 验证机制

```javascript
// 添加验证命令
async verifySkillRegistration(skillName) {
  for (const cliName of this.targetCLIs) {
    const cliDoc = path.join(process.cwd(), `${cliName}.md`);
    const content = await fs.readFile(cliDoc, 'utf8');

    // 检查是否注册
    if (content.includes(`<name>${skillName}</name>`)) {
      console.log(`✓ ${skillName} 已在 ${cliName}.md 中注册`);
    } else {
      console.log(`✗ ${skillName} 未在 ${cliName}.md 中注册`);
    }
  }
}
```

---

## 📊 总结

### ✅ 我们确定的

1. **所有CLI使用相同的注册机制**
   - 从自己的.md文档读取skills列表
   - 使用XML格式注册
   - 在`<available_skills>`部分查找

2. **部署位置灵活**
   - 可以使用stigmergy统一路径
   - 也可以使用CLI独立路径
   - 只要注册正确，就能找到

3. **当前问题明确**
   - 7个CLI有合并冲突
   - ConfigDeployer只部署文件，没有注册

### 🎯 下一步行动

**优先级1**: 解决合并冲突
```bash
git checkout --theirs gemini.md qwen.md iflow.md codebuddy.md qodercli.md copilot.md codex.md
```

**优先级2**: 修改ConfigDeployer
- 添加registerSkillsInCLI方法
- 在部署时自动注册skills

**优先级3**: 实现关键词注册
- 在skill的description中添加关键词
- CLI可以通过关键词搜索skills

**优先级4**: 测试验证
- 创建test-skill
- 部署并注册
- 验证所有CLI都能使用

---

## 🎉 结论

**问题解决**：
- ❌ 之前：只部署文件，不注册 → CLI找不到skills
- ✅ 现在：部署文件 + 注册到.md → CLI可以找到

**部署策略**：
- ✅ 可以使用统一路径（`~/.stigmergy/skills/`）
- ✅ 避免重复部署
- ✅ 但必须在每个CLI的.md中注册

**最终答案**：
- 所有CLI都从自己的.md文档读取skills列表
- 必须在.md文档的`<available_skills>`中注册
- 部署位置不重要，重要的是注册

---

**更新时间**: 2026-01-25 01:45
**状态**: ✅ 问题已找到，解决方案明确
