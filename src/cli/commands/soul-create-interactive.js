/**
 * Interactive Soul Creation Command
 * 通过友好的对话式交互创建项目Soul
 */

const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

class InteractiveSoulCreator {
  constructor() {
    this.projectTypes = {
      technical: {
        name: "技术开发型",
        icon: "💻",
        template: "technical",
        description: "专注于代码质量、架构设计、性能优化",
        keywords: ["编程", "开发", "代码", "软件", "app", "web"],
      },
      academic: {
        name: "学术研究型",
        icon: "🎓",
        template: "academic",
        description: "专注于理论严谨、文献分析、研究方法",
        keywords: ["研究", "论文", "学术", "理论", "实验"],
      },
      data: {
        name: "数据分析型",
        icon: "📊",
        template: "data",
        description: "专注于数据处理、统计分析、可视化",
        keywords: ["数据", "分析", "统计", "机器学习", "ai"],
      },
      creative: {
        name: "创意设计型",
        icon: "🎨",
        template: "creative",
        description: "专注于用户体验、视觉设计、创意表达",
        keywords: ["设计", "ui", "ux", "创意", "视觉"],
      },
      general: {
        name: "通用型",
        icon: "📝",
        template: "general",
        description: "适用于各种项目类型",
        keywords: [],
      },
    };
  }

  async run(options = {}) {
    console.log("\n" + chalk.blue.bold("🤖 让我们通过对话来创建您的项目Soul...\n"));

    // 检测是否已有soul
    const existingSoul = this._checkExistingSoul();
    if (existingSoul && !options.force) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `检测到已存在的Soul: ${existingSoul}\n是否覆盖？`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow("\n❌ 已取消创建\n"));
        return;
      }
    }

    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectDescription",
          message: "📝 请简单描述您的项目主要做什么？",
          validate: (input) => {
            if (input.length < 5) {
              return "描述太短，请至少输入5个字符";
            }
            return true;
          },
        },
        {
          type: "list",
          name: "projectType",
          message: "🎯 项目类型是什么？",
          choices: Object.entries(this.projectTypes).map(([key, val]) => ({
            name: `${val.icon} ${val.name} - ${val.description}`,
            value: key,
          })),
        },
        {
          type: "input",
          name: "soulName",
          message: "🤖 Soul名称（可选，直接回车自动生成）",
          default: () => this._generateSuggestedName(),
        },
        {
          type: "checkbox",
          name: "features",
          message: "⚙️  启用哪些功能？",
          choices: [
            { name: "🚀 自动进化", value: "autoEvolve", checked: true },
            { name: "📊 知识库管理", value: "knowledgeBase", checked: true },
            { name: "🎯 对齐检查", value: "alignmentCheck", checked: true },
            { name: "💾 记忆管理", value: "memoryManagement", checked: true },
          ],
        },
        {
          type: "confirm",
          name: "confirm",
          message: "✅ 确认创建？",
          default: true,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.yellow("\n❌ 已取消创建\n"));
        return;
      }

      // 创建soul
      await this._createSoul(answers);

      return true;
    } catch (error) {
      if (error.message === "User force closed the prompt with 0 null") {
        console.log(chalk.yellow("\n❌ 用户取消\n"));
      } else {
        console.error(chalk.red("\n❌ 创建失败:"), error.message);
      }
      return false;
    }
  }

  _checkExistingSoul() {
    const cwd = process.cwd();
    const possiblePaths = [
      path.join(cwd, ".stigmergy", "skills", "soul.md"),
      path.join(cwd, ".agent", "skills", "soul.md"),
      path.join(cwd, ".claude", "skills", "soul.md"),
    ];

    for (const soulPath of possiblePaths) {
      if (fs.existsSync(soulPath)) {
        return soulPath;
      }
    }

    return null;
  }

  _generateSuggestedName() {
    const cwd = process.cwd();
    const projectName = path.basename(cwd);

    // 转换为Pascal Case
    return projectName
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  async _createSoul(answers) {
    const { projectDescription, projectType, soulName, features } = answers;

    // 生成soul内容
    const soulContent = this._generateSoulContent({
      name: soulName,
      type: projectType,
      description: projectDescription,
      features,
    });

    // 创建目录
    const soulDir = path.join(process.cwd(), ".stigmergy", "skills");
    fs.mkdirSync(soulDir, { recursive: true });

    // 写入soul.md
    const soulPath = path.join(soulDir, "soul.md");
    fs.writeFileSync(soulPath, soulContent, "utf-8");

    // 显示成功信息
    console.log("\n" + chalk.green.bold("✅ Soul创建成功！\n"));
    console.log(chalk.gray("📁 位置:") + chalk.cyan(` ${soulPath}`));
    console.log(chalk.gray("🎯 类型:") + chalk.cyan(` ${this.projectTypes[projectType].name}`));
    console.log(chalk.gray("🤖 名称:") + chalk.cyan(` ${soulName}`));
    console.log(chalk.gray("⚙️  功能:") + chalk.cyan(` ${features.join(", ")}`));

    console.log("\n" + chalk.blue.bold("💡 提示:"));
    console.log("   - Soul将在下次启动CLI时自动激活");
    console.log("   - 您可以随时编辑 .stigmergy/skills/soul.md 来调整配置");
    console.log("   - 使用 'stigmergy soul status' 查看状态");
    console.log("   - 使用 'stigmergy soul evolve' 手动触发进化\n");
  }

  _generateSoulContent(config) {
    const typeConfig = this.projectTypes[config.type];
    const cwd = process.cwd();
    const projectName = path.basename(cwd);

    return `# Soul.md - ${config.name}

## 身份 Identity
- **名称**: ${config.name}
- **角色**: ${typeConfig.name}
- **类型**: ${typeConfig.template}
- **项目**: ${projectName}

## 项目描述
${config.description}

## 人格 Personality
- **核心特质**: 专业、高效、创新、细致
- **沟通风格**: 清晰、简洁、友好
- **价值观**: 质量、可维护性、用户体验
- **工作方式**: 系统性思考、注重细节、持续改进

## 使命 Mission
- **终极目标**: 提升${typeConfig.name}项目的开发效率和质量
- **核心职责**:
  1. 深入理解项目需求和架构
  2. 提供专业的技术建议和最佳实践
  3. 保证代码质量和可维护性
  4. 持续学习和引入新技术

## 专业知识域 Expertise
- **核心领域**: ${typeConfig.template}
- **知识深度**: 专家级
- **技术栈**: 基于项目实际技术栈
- **持续学习方向**:
  - 最新技术趋势和最佳实践
  - 设计模式和架构模式
  - 性能优化策略
  - 安全性考虑

## 学习策略 Learning Strategy
- **学习频率**: 持续学习
- **资料来源**:
  - 官方文档和API参考
  - 技术博客和社区讨论
  - 开源项目和案例分析
  - 同行评审和代码审查
- **学习重点**:
  - 项目相关的核心技术
  - 代码质量和最佳实践
  - 用户体验和性能优化

## 对齐标准 Alignment Criteria
- **偏差阈值**: < 70% 需要纠正
- **评估维度**:
  - 技术准确性
  - 代码质量标准
  - 最佳实践符合度
  - 项目需求符合度
  - 可维护性考虑

## 功能配置
${config.features.map((f) => `- **${f}**: enabled`).join("\n")}

## 项目特定规则
- 遵循项目的编码规范和风格指南
- 优先考虑项目的长期可维护性
- 平衡功能需求和代码质量
- 注重文档和注释的重要性

---
*创建时间: ${new Date().toISOString()}*
*项目路径: ${cwd}*
`;
  }
}

/**
 * Handle interactive soul creation command
 * @param {Object} options - Command options
 */
async function handleInteractiveSoulCreate(options = {}) {
  const creator = new InteractiveSoulCreator();
  const success = await creator.run(options);

  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

module.exports = {
  InteractiveSoulCreator,
  handleInteractiveSoulCreate,
};
