# Soul自然语言交互创建方案

## 🎯 问题分析

当前创建soul需要手工操作：
```bash
❌ 需要手工创建目录和文件
mkdir -p .stigmergy/skills
cat > .stigmergy/skills/soul.md <<EOF
...
EOF
```

**用户需求**：通过自然语言交互完成
```
用户: "帮我创建一个项目soul"
AI: 通过对话收集信息，自动创建
```

---

## ✅ 解决方案设计

### **方案1: 智能命令路由（推荐）** ⭐

**实现方式**：
```javascript
// 在智能路由中添加soul创建意图识别
// 文件: src/core/smart_router.js 或新建 soul_nlp_handler.js

const soulCreationPatterns = [
  /创建.*soul|创建.*灵魂|设置.*身份/,
  /帮我创建.*soul|给我弄个.*soul/,
  /项目身份|项目人设|项目配置/,
  /initialize.*soul|setup.*soul/,
];

function detectSoulCreationIntent(userInput) {
  for (const pattern of soulCreationPatterns) {
    if (pattern.test(userInput)) {
      return true;
    }
  }
  return false;
}
```

**用户交互流程**：
```bash
$ stigmergy call "帮我为这个项目创建一个soul"

🤖 Stigmergy检测到您想创建Soul，让我帮您设置...

📝 第1步：选择Soul类型
   1) 🎓 学术研究型 - 适合论文、研究项目
   2) 💻 技术开发型 - 适合编程项目
   3) 📊 数据分析型 - 适合数据科学项目
   4) 🎨 创意设计型 - 适合设计项目
   5) 📝 通用型 - 适合一般项目

您的选择 [1-5，默认2]:

📝 第2步：项目名称
   当前目录: my-project
   建议名称: MyProject

您的名称 [直接回车使用建议]:

📝 第3步：核心角色描述
   请简单描述这个项目的主要功能
   例如: "一个Web应用，帮助用户管理任务"

您的描述:

✅ Soul创建完成！

位置: .stigmergy/skills/soul.md
类型: 技术开发型
名称: MyProject

📝 下次启动CLI时，Soul将自动激活

🎉 您现在可以开始使用CLI了！
```

---

### **方案2: 对话式创建（更自然）**

**实现方式**：
```javascript
// 文件: src/cli/commands/soul-interactive.js

class InteractiveSoulCreator {
  async createFromConversation() {
    const inquirer = require('inquirer');

    // 通过对话收集信息
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectGoal',
        message: '请描述您的项目主要做什么？',
        validate: input => input.length > 0 || '请输入描述'
      },
      {
        type: 'list',
        name: 'projectType',
        message: '项目类型是什么？',
        choices: [
          { name: '💻 软件开发', value: 'technical' },
          { name: '🎓 学术研究', value: 'academic' },
          { name: '📊 数据分析', value: 'data' },
          { name: '🎨 创意设计', value: 'creative' },
        ]
      },
      {
        type: 'input',
        name: 'customName',
        message: 'Soul名称（可选）',
        default: () => this._generateSuggestedName()
      },
      {
        type: 'confirm',
        name: 'autoEvolve',
        message: '是否启用自动进化？',
        default: true
      }
    ]);

    // 根据回答生成soul配置
    return this._generateSoulConfig(answers);
  }
}
```

**实际使用**：
```bash
$ stigmergy soul create --interactive

🤖 让我们通过对话来创建您的Soul...

? 请描述您的项目主要做什么？
> 这是一个帮助开发者管理代码片段的工具

? 项目类型是什么？
  > 💻 软件开发

? Soul名称（可选）
> (MyProject)

? 是否启用自动进化？
> (Y/n) y

✅ Soul创建完成！

已生成配置:
📁 位置: .stigmergy/skills/soul.md
🎯 类型: 技术开发型
🤖 名称: CodeSnippetManager
🚀 自动进化: 已启用

💡 提示: 下次启动CLI时，Soul将自动激活
```

---

### **方案3: 项目自动检测（最智能）** 🌟

**实现方式**：
```javascript
// 文件: src/core/soul_auto_detector.js

class SoulAutoDetector {
  async detectAndSuggest() {
    const projectInfo = await this._analyzeProject();

    // 检测项目类型
    const detectedType = this._detectProjectType(projectInfo);

    // 生成建议配置
    const suggestion = this._generateSuggestion(detectedType, projectInfo);

    return suggestion;
  }

  _detectProjectType(projectInfo) {
    // 检测package.json
    if (projectInfo.hasPackageJson) {
      if (projectInfo.dependencies.react) return 'frontend';
      if (projectInfo.dependencies.express) return 'backend';
      if (projectInfo.dependencies.pandas) return 'data-science';
    }

    // 检测文件类型
    if (projectInfo.hasJupyterNotebooks) return 'data-science';
    if (projectInfo.hasLaTeX) return 'academic';
    if (projectInfo.hasDesignFiles) return 'creative';

    return 'general';
  }
}
```

**实际使用**：
```bash
$ cd my-project
$ stigmergy

🔍 Stigmergy检测到这是一个新项目...

📊 项目分析结果:
   - 类型: JavaScript/Node.js项目
   - 框架: React + Express
   - 建议Soul类型: 技术开发型

💡 建议: 是否为您创建项目Soul？
这将帮助CLI更好地理解您的项目。

[Y] 是的，创建  [n] 跳过  [c] 自定义

# 用户选择 Y

✅ 已自动创建项目Soul！

📁 位置: .stigmergy/skills/soul.md
🎯 类型: 技术开发型
🤖 名称: ReactExpressApp
🚀 自动进化: 已启用

🎉 Soul已激活！现在可以开始使用了。

下次提示将包含:
✅ 项目上下文
✅ 技术栈偏好
✅ 编码风格建议
```

---

## 🛠️ 实现代码

### **创建交互式soul创建命令**

```javascript
// 文件: src/cli/commands/soul-interactive.js

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

class InteractiveSoulCreator {
  constructor() {
    this.projectTypes = {
      technical: {
        name: '技术开发型',
        icon: '💻',
        template: 'technical',
        description: '专注于代码质量、架构设计、性能优化'
      },
      academic: {
        name: '学术研究型',
        icon: '🎓',
        template: 'academic',
        description: '专注于理论严谨、文献分析、研究方法'
      },
      data: {
        name: '数据分析型',
        icon: '📊',
        template: 'data',
        description: '专注于数据处理、统计分析、可视化'
      },
      creative: {
        name: '创意设计型',
        icon: '🎨',
        template: 'creative',
        description: '专注于用户体验、视觉设计、创意表达'
      },
      general: {
        name: '通用型',
        icon: '📝',
        template: 'general',
        description: '适用于各种项目类型'
      }
    };
  }

  async run() {
    console.log('\n🤖 让我们通过对话来创建您的项目Soul...\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectDescription',
        message: '📝 请简单描述您的项目主要做什么？',
        validate: input => {
          if (input.length < 10) {
            return '描述太短，请至少输入10个字符';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'projectType',
        message: '🎯 项目类型是什么？',
        choices: Object.entries(this.projectTypes).map(([key, val]) => ({
          name: `${val.icon} ${val.name} - ${val.description}`,
          value: key
        }))
      },
      {
        type: 'input',
        name: 'soulName',
        message: '🤖 Soul名称（可选，直接回车自动生成）',
        default: () => this._generateSuggestedName()
      },
      {
        type: 'checkbox',
        name: 'features',
        message: '⚙️  启用哪些功能？',
        choices: [
          { name: '🚀 自动进化', value: 'autoEvolve', checked: true },
          { name: '📊 知识库管理', value: 'knowledgeBase', checked: true },
          { name: '🎯 对齐检查', value: 'alignmentCheck', checked: true },
          { name: '💾 记忆管理', value: 'memoryManagement', checked: true },
        ]
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: '✅ 确认创建？',
        default: true
      }
    ]);

    if (!answers.confirm) {
      console.log('❌ 已取消创建');
      return;
    }

    // 创建soul
    await this._createSoul(answers);
  }

  _generateSuggestedName() {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);

    // 转换为Pascal Case
    return projectName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  async _createSoul(answers) {
    const { projectDescription, projectType, soulName, features } = answers;

    // 生成soul内容
    const soulContent = this._generateSoulContent({
      name: soulName,
      type: projectType,
      description: projectDescription,
      features
    });

    // 创建目录
    const soulDir = path.join(process.cwd(), '.stigmergy', 'skills');
    fs.mkdirSync(soulDir, { recursive: true });

    // 写入soul.md
    const soulPath = path.join(soulDir, 'soul.md');
    fs.writeFileSync(soulPath, soulContent, 'utf-8');

    // 显示成功信息
    console.log('\n✅ Soul创建成功！\n');
    console.log(`📁 位置: ${soulPath}`);
    console.log(`🎯 类型: ${this.projectTypes[projectType].name}`);
    console.log(`🤖 名称: ${soulName}`);
    console.log(`⚙️  功能: ${features.join(', ')}`);

    console.log('\n💡 提示:');
    console.log('   - Soul将在下次启动CLI时自动激活');
    console.log('   - 您可以随时编辑 .stigmergy/skills/soul.md 来调整配置');
    console.log('   - 使用 "stigmergy soul status" 查看状态\n');
  }

  _generateSoulContent(config) {
    const typeConfig = this.projectTypes[config.type];

    return `# Soul.md - ${config.name}

## 身份 Identity
- **名称**: ${config.name}
- **角色**: ${typeConfig.name}
- **类型**: ${typeConfig.template}

## 项目描述
${config.description}

## 人格 Personality
- **核心特质**: 专业、高效、创新
- **沟通风格**: 清晰、简洁、友好
- **价值观**: 质量、可维护性、用户体验

## 使命 Mission
- **终极目标**: 提升${typeConfig.name}项目的开发效率和质量
- **核心职责**:
  1. 理解项目需求和架构
  2. 提供专业的技术建议
  3. 保证代码质量和最佳实践
  4. 持续学习和改进

## 专业知识域 Expertise
- **核心领域**: ${typeConfig.template}
- **知识深度**: 专家级
- **持续学习方向**:
  - 最新技术趋势
  - 最佳实践
  - 设计模式

## 学习策略 Learning Strategy
- **频率**: 持续学习
- **资料来源**:
  - 官方文档
  - 技术博客
  - 开源项目
  - 社区讨论

## 对齐标准 Alignment Criteria
- **偏差阈值**: < 70% 需要纠正
- **评估维度**:
  - 技术准确性
  - 代码质量
  - 最佳实践符合度

## 功能配置
${config.features.map(f => `- **${f}**: enabled`).join('\n')}
`;
  }
}

module.exports = InteractiveSoulCreator;
```

---

## 📝 使用示例

### **方式1: 交互式命令**
```bash
$ stigmergy soul create --interactive

🤖 让我们通过对话来创建您的项目Soul...
[...对话过程...]

✅ Soul创建成功！
```

### **方式2: 智能检测**
```bash
$ stigmergy

🔍 检测到新项目，是否创建Soul？[Y/n]
```

### **方式3: 自然语言**
```bash
$ stigmergy call "帮我为这个React项目创建一个技术开发型的soul"

🤖 好的，让我为您创建...

✅ Soul创建完成！
```

---

## 🎯 总结

| 方式 | 优点 | 适用场景 |
|------|------|----------|
| **手工创建** | 简单直接 | 熟悉系统的用户 |
| **交互式创建** | 友好直观 | 新用户 |
| **智能检测** | 最智能 | 新项目 |
| **自然语言** | 最自然 | 所有用户 |

**推荐组合**：
1. 首次使用 → 智能检测 + 交互式创建
2. 后续调整 → 手工编辑或自然语言

**实现优先级**：
1. ⭐⭐⭐ 交互式命令（立即可实现）
2. ⭐⭐ 智能检测（需要项目分析逻辑）
3. ⭐ 自然语言（需要NLP集成）

需要我实现哪个方案？
