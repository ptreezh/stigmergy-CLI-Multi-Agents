/**
 * Soul Command - Soul系统命令行接口
 *
 * stigmergy soul init <cli-name|skill-name>
 * stigmergy soul status
 * stigmergy soul evolve <cli-name|skill-name>
 * stigmergy soul check [content]
 * stigmergy soul create <type> <name>
 */

const fs = require("fs");
const path = require("path");

class SoulCommand {
  constructor() {
    this.commands = {
      init: this.init.bind(this),
      status: this.status.bind(this),
      evolve: this.evolve.bind(this),
      check: this.check.bind(this),
      create: this.create.bind(this),
    };
  }

  async execute(args) {
    const command = args[0] || "status";
    const commandFn = this.commands[command];
    if (!commandFn) {
      console.log(`Unknown command: ${command}`);
      console.log("Available: init, status, evolve, check, create");
      return;
    }
    await commandFn(args.slice(1));
  }

  async init(args) {
    const input = args[0] || "auto";
    const cliNames = [
      "auto",
      "claude",
      "qwen",
      "opencode",
      "gemini",
      "iflow",
      "qoder",
      "codex",
      "kilocode",
      "codebuddy",
    ];
    const cliName = cliNames.includes(input) ? input : "auto";
    const skillName = cliNames.includes(input) ? null : input;

    console.log(`\n🔧 Initializing Soul System`);
    if (cliName !== "auto") console.log(`   CLI: ${cliName}`);
    if (skillName) console.log(`   Skill: ${skillName}`);
    console.log("");

    const SoulManager = require("../../core/soul_manager");
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const targetSkill = skillName || cliName;
    const skillsPath = path.join(home, ".stigmergy", "skills", targetSkill);

    const manager = new SoulManager({
      cliName,
      skillsPath,
      autoLearn: true,
    });

    const hasSoul = await manager.detectSoul(skillsPath);
    if (!hasSoul) {
      console.log(`❌ No soul.md found in ${skillsPath}`);
      console.log(`   Use 'stigmergy soul create' first`);
      return;
    }

    await manager.initAutonomousSystem();
    console.log(`\n✅ Soul System initialized for ${cliName}`);
    console.log(`   Identity: ${manager.identity?.name || "Unknown"}`);
  }

  async status(args) {
    console.log("\n📊 Soul System Status\n");

    const home = process.env.HOME || process.env.USERPROFILE || "";
    const configPath = path.join(home, ".stigmergy", "config");
    const skillsPath = path.join(home, ".stigmergy", "skills");

    console.log("📁 Default config location:");
    console.log(`   ${path.join(configPath, "soul_default.json")}`);
    console.log(`   ${path.join(configPath, "soul-{cli}.json")}`);

    // 检查soul目录
    if (fs.existsSync(skillsPath)) {
      const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
      const souls = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      if (souls.length > 0) {
        console.log("\n📚 Registered Souls:");
        for (const soul of souls) {
          const soulFile = path.join(skillsPath, soul, "soul.md");
          const exists = fs.existsSync(soulFile);
          console.log(`   ${exists ? "✅" : "❌"} ${soul}`);
        }
      }
    }

    console.log("");
  }

  async evolve(args) {
    const cliName = args[0] || "claude";
    console.log(`\n⚡ Triggering evolution`);
    console.log(`   CLI: ${cliName}\n`);

    const SoulSkillEvolver = require("../../core/soul_skill_evolver");
    const home = process.env.HOME || process.env.USERPROFILE || "";
    const skillsPath = path.join(home, ".stigmergy", "skills", cliName);

    if (!fs.existsSync(skillsPath)) {
      console.log(`❌ Soul not found: ${cliName}`);
      return;
    }

    const SoulKnowledgeBase = require("../../core/soul_knowledge_base");
    const kb = new SoulKnowledgeBase({
      soulIdentity: { name: cliName },
      basePath: skillsPath,
    });

    const evolver = new SoulSkillEvolver({
      soulIdentity: { name: cliName },
      skillsPath,
      knowledgeBase: kb,
    });

    await evolver.init();
    const result = await evolver.evolve();

    console.log(`\n✅ Evolution complete:`);
    console.log(`   Knowledge added: ${result.knowledgeAdded || 0}`);
    console.log(`   Skills created: ${result.skillsCreated || 0}`);
    console.log(`   Skills updated: ${result.skillsUpdated || 0}`);
  }

  async check(args) {
    const content = args.join(" ") || "Hello";
    console.log(`\n🎯 Running alignment check...`);
    console.log(`   Content: "${content.substring(0, 50)}..."\n`);

    const SoulAlignmentChecker = require("../../core/soul_alignment_checker");
    const checker = new SoulAlignmentChecker({
      soulIdentity: { name: "test" },
    });

    const result = await checker.check(content);
    console.log(`   Aligned: ${result.aligned ? "✅ Yes" : "❌ No"}`);
    console.log(`   Score: ${(result.score * 100).toFixed(1)}%`);
  }

  async create(args) {
    const type = args[0] || "academic";
    const name = args[1] || "my-soul";

    console.log(`\n📦 Creating soul: ${name} (${type})`);

    const home = process.env.HOME || process.env.USERPROFILE || "";
    const soulDir = path.join(home, ".stigmergy", "skills", name);

    if (fs.existsSync(soulDir)) {
      console.log(`\n❌ Soul already exists: ${name}`);
      return;
    }

    fs.mkdirSync(soulDir, { recursive: true });
    fs.mkdirSync(path.join(soulDir, "memory"), { recursive: true });

    const soulContent = this._generateSoulTemplate(type, name);
    fs.writeFileSync(path.join(soulDir, "soul.md"), soulContent, "utf-8");

    console.log(`\n✅ Created soul.md at: ${soulDir}`);
    console.log(`   Type: ${type}`);
    console.log(`   Name: ${name}`);
    console.log(`\n📝 You can now initialize with:`);
    console.log(`   stigmergy soul init ${name}`);
  }

  _generateSoulTemplate(type, name) {
    const templates = {
      academic: `# Soul.md - ${name}

## 身份 Identity
- **名称**: ${name}
- **角色**: 学术研究员
- **类型**: 学术研究型

## 人格 Personality
- **核心特质**: 严谨、批判、深入、创新
- **沟通风格**: 学术规范、逻辑严密
- **价值观**: 事实优先、证据说话

## 使命 Mission
- **终极目标**: 推动学术研究发展
- **核心职责**:
  1. 准确解读理论
  2. 结合实践分析
  3. 促进学术交流

## 专业知识域 Expertise
- **核心领域**: ${type}
- **知识深度**: 专家级
- **持续学习方向**:
  - 最新研究进展
  - 权威文献

## 学习策略 Learning Strategy
- **频率**: 每日学习
- **资料来源**: 官方文档、学术论文

## 对齐标准 Alignment Criteria
- **偏差阈值**: < 70% 需要纠正
`,

      technical: `# Soul.md - ${name}

## 身份 Identity
- **名称**: ${name}
- **角色**: 技术专家
- **类型**: 技术开发型

## 人格 Personality
- **核心特质**: 严谨、高效、创新
- **沟通风格**: 直接、简洁、专业

## 使命 Mission
- **终极目标**: 解决技术难题
- **核心职责**:
  1. 优化系统性能
  2. 保证代码质量

## 专业知识域 Expertise
- **核心领域**: 软件开发
- **知识深度**: 专家级

## 学习策略 Learning Strategy
- **频率**: 每日学习
- **资料来源**: 技术博客、官方文档
`,

      general: `# Soul.md - ${name}

## 身份 Identity
- **名称**: ${name}
- **角色**: AI助手
- **类型**: 通用型

## 人格 Personality
- **核心特质**: 友好、专业、helpful
- **沟通风格**: 清晰、简洁

## 使命 Mission
- **终极目标**: 帮助用户完成任务

## 专业知识域 Expertise
- **核心领域**: 广泛
- **知识深度**: 中级

## 学习策略 Learning Strategy
- **频率**: 按需学习
`,
    };

    return templates[type] || templates.general;
  }
}

module.exports = SoulCommand;

if (require.main === module) {
  const cmd = new SoulCommand();
  cmd.execute(process.argv.slice(2));
}
