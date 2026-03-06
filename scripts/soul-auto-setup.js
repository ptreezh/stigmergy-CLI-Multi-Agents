#!/usr/bin/env node
/**
 * Soul Auto Setup - 自动配置Soul进化系统
 * 在 postinstall-deploy.js 之后运行
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const homeDir = os.homedir();

const CLI_HOMES = {
  claude: ".claude",
  qwen: ".qwen",
  iflow: ".iflow",
  gemini: ".config/gemini",
  codex: ".config/codex",
  codebuddy: ".codebuddy",
  kilocode: ".kilocode",
  opencode: ".opencode",
  qodercli: ".qoder",
  copilot: ".copilot",
};

const CLI_DISPLAY_NAMES = {
  claude: "Claude",
  qwen: "Qwen",
  gemini: "Gemini",
  iflow: "iFlow",
  codex: "Codex",
  qodercli: "Qoder",
  codebuddy: "CodeBuddy",
  kilocode: "KiloCode",
  kode: "Kode",
  opencode: "OpenCode",
  copilot: "Copilot",
};

async function main() {
  console.log("\n🧠 自动配置Soul进化系统...\n");

  const stigmergyRoot = path.join(homeDir, ".stigmergy");
  const skillsRoot = path.join(stigmergyRoot, "skills");
  const schedulerRoot = path.join(stigmergyRoot, "scheduler");
  const tasksDir = path.join(schedulerRoot, "tasks");

  // 检测可用的CLI
  const availableCLIs = [];
  for (const [cli, home] of Object.entries(CLI_HOMES)) {
    if (fs.existsSync(path.join(homeDir, home))) {
      availableCLIs.push(cli);
    }
  }

  console.log(
    `检测到 ${availableCLIs.length} 个CLI: ${availableCLIs.join(", ")}`,
  );

  let soulCreated = 0;

  // 为每个CLI创建soul.md和目录
  for (const cliName of availableCLIs) {
    const cliSkillsPath = path.join(skillsRoot, cliName);
    const soulFile = path.join(cliSkillsPath, "soul.md");

    fs.mkdirSync(path.join(cliSkillsPath, "knowledge"), { recursive: true });
    fs.mkdirSync(path.join(cliSkillsPath, "evolution"), { recursive: true });

    if (!fs.existsSync(soulFile)) {
      const displayName = CLI_DISPLAY_NAMES[cliName] || cliName;
      const soulContent = `# Soul.md - ${displayName}智能体

## 身份 Identity
- **名称**: ${cliName.toUpperCase()}-Master
- **角色**: ${displayName}智能体编排大师
- **类型**: 自主进化型智能体

## 人格 Personality
- **核心特质**: 超强自驱力、持续学习、追求卓越
- **沟通风格**: 简洁专业

## 使命 Mission
- 持续学习和进化，保持行业领先
- 培育专业子智能体团队
- 不断优化和改进

## 愿景 Vision
- 短期: 掌握核心技能
- 中期: 打造高效团队
- 长期: 成为顶级AI智能体编排大师

## 能力 Capabilities
- 自主学习新技能
- 跨CLI协作
- 自我反思与改进
- 知识积累与传承
`;
      fs.writeFileSync(soulFile, soulContent);
      console.log(`  ✅ 创建soul.md: ${cliName}`);
      soulCreated++;
    } else {
      console.log(`  ℹ️  soul.md已存在: ${cliName}`);
    }
  }

  // 创建定时任务配置
  fs.mkdirSync(tasksDir, { recursive: true });

  // Claude进化任务
  const claudeTaskFile = path.join(tasksDir, "auto-evolve-claude.json");
  if (!fs.existsSync(claudeTaskFile)) {
    const claudeTask = {
      id: "auto-evolve-claude",
      name: "Claude Auto Evolve",
      type: "cli",
      cron: "0 2,8,14,20 * * *",
      enabled: true,
      cli: "claude",
      command: "stigmergy soul evolve claude",
      description: "每天2,8,14,20点自动进化",
      timeout: 600000,
      retry: 1,
    };
    fs.writeFileSync(claudeTaskFile, JSON.stringify(claudeTask, null, 2));
    console.log(`  ✅ 添加定时任务: auto-evolve-claude`);
  } else {
    console.log(`  ℹ️  定时任务已存在: auto-evolve-claude`);
  }

  // Qwen进化任务
  if (availableCLIs.includes("qwen")) {
    const qwenTaskFile = path.join(tasksDir, "auto-evolve-qwen.json");
    if (!fs.existsSync(qwenTaskFile)) {
      const qwenTask = {
        id: "auto-evolve-qwen",
        name: "Qwen Auto Evolve",
        type: "cli",
        cron: "0 3,9,15,21 * * *",
        enabled: true,
        cli: "qwen",
        command: "stigmergy soul evolve qwen",
        description: "每天3,9,15,21点自动进化",
        timeout: 600000,
        retry: 1,
      };
      fs.writeFileSync(qwenTaskFile, JSON.stringify(qwenTask, null, 2));
      console.log(`  ✅ 添加定时任务: auto-evolve-qwen`);
    }
  }

  console.log(`\n✅ Soul进化系统配置完成！`);
  console.log(`   soul.md: ${soulCreated}个`);
  console.log(
    `   定时任务: ${fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json")).length}个`,
  );
  console.log(`\n   运行 'stigmergy scheduler start' 启动定时任务`);
}

main().catch(console.error);
