#!/usr/bin/env node

/**
 * Deploy Soul Features - 自动部署 Soul 自我进化系统
 *
 * 确保 Soul 功能在安装后开箱即用，无需手动配置
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const home = process.env.HOME || process.env.USERPROFILE || "";
const stigmergyRoot = path.join(home, ".stigmergy");

// 支持的 CLI 工具
const cliTools = [
  "claude",
  "qwen",
  "gemini",
  "iflow",
  "codebuddy",
  "codex",
  "qodercli",
  "opencode",
  "kilocode"
];

// Soul 技能文件
const soulSkills = [
  { source: "skills/soul-auto-evolve/SKILL.md", target: "soul-auto-evolve.md" },
  { source: "skills/soul-reflection/SKILL.md", target: "soul-reflection.md" }
];

console.log("🧠 Deploying Soul 自我进化系统...\n");

/**
 * 确保目录存在
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

/**
 * 部署 Soul 技能到指定 CLI
 */
function deploySoulSkillsToCli(cliName) {
  const hooksDir = path.join(home, `.${cliName}`, "hooks", "skills");

  // 确保 hooks 目录存在
  ensureDirectory(hooksDir);

  let deployedCount = 0;

  for (const skill of soulSkills) {
    const sourcePath = path.join(process.cwd(), skill.source);
    const targetPath = path.join(hooksDir, skill.target);

    try {
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        deployedCount++;
      } else {
        console.log(`⚠️  Source file not found: ${sourcePath}`);
      }
    } catch (error) {
      console.log(`❌ Failed to deploy ${skill.target} to ${cliName}: ${error.message}`);
    }
  }

  return deployedCount;
}

/**
 * 创建 Soul 状态存储目录
 */
function setupSoulStateDirectories() {
  const stateDirs = [
    path.join(stigmergyRoot, "soul-state", "memories"),
    path.join(stigmergyRoot, "soul-state", "knowledge-base"),
    path.join(stigmergyRoot, "soul-state", "evolution-log"),
    path.join(stigmergyRoot, "soul-state", "alignment-checks")
  ];

  for (const dir of stateDirs) {
    ensureDirectory(dir);
  }
}

/**
 * 创建默认 Soul 配置
 */
function createDefaultSoulConfig() {
  const configDir = path.join(stigmergyRoot, "config");
  ensureDirectory(configDir);

  const defaultConfig = {
    version: "1.0.0",
    autoLearn: true,
    alignmentCheckOnResponse: true,
    learningIntervalHours: 24,
    evolutionEnabled: true,
    reflectionEnabled: true,
    memoryRetentionDays: 30
  };

  const configPath = path.join(configDir, "soul_default.json");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(`✅ Created default Soul config: ${configPath}`);
  }
}

/**
 * 验证部署状态
 */
function verifyDeployment() {
  console.log("\n📊 Deployment Verification:\n");

  let totalDeployed = 0;
  let totalExpected = cliTools.length * soulSkills.length;

  for (const cli of cliTools) {
    const hooksDir = path.join(home, `.${cli}`, "hooks", "skills");

    if (!fs.existsSync(hooksDir)) {
      console.log(`⚠️  ${cli}: Hooks directory not found`);
      continue;
    }

    let cliDeployed = 0;
    for (const skill of soulSkills) {
      const skillPath = path.join(hooksDir, skill.target);
      if (fs.existsSync(skillPath)) {
        cliDeployed++;
      }
    }

    totalDeployed += cliDeployed;
    const status = cliDeployed === soulSkills.length ? "✅" : "⚠️";
    console.log(`${status} ${cli}: ${cliDeployed}/${soulSkills.length} skills deployed`);
  }

  console.log(`\n📈 Total: ${totalDeployed}/${totalExpected} skills deployed`);

  return totalDeployed === totalExpected;
}

/**
 * 主部署函数
 */
async function deploySoulFeatures() {
  try {
    // 1. 创建状态存储目录
    console.log("📁 Setting up Soul state directories...");
    setupSoulStateDirectories();

    // 2. 创建默认配置
    console.log("\n⚙️  Creating default Soul configuration...");
    createDefaultSoulConfig();

    // 3. 部署技能到各个 CLI
    console.log("\n🚀 Deploying Soul skills to CLI tools...");

    for (const cli of cliTools) {
      const count = deploySoulSkillsToCli(cli);
      if (count > 0) {
        console.log(`✅ ${cli}: ${count} skills deployed`);
      }
    }

    // 4. 验证部署
    const success = verifyDeployment();

    if (success) {
      console.log("\n🎉 Soul 自我进化系统部署成功！");
      console.log("\n📝 使用方法:");
      console.log("   在任何支持的 CLI 中使用以下关键词:");
      console.log("   - '执行自主进化' 或 'auto evolve'");
      console.log("   - '进行自我反思' 或 'soul reflection'");
      console.log("\n   或者使用命令:");
      console.log("   stigmergy soul status");
      console.log("   stigmergy soul evolve");
      console.log("   stigmergy soul reflect");
    } else {
      console.log("\n⚠️  部署完成，但部分 CLI 工具可能需要手动配置");
    }

  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  deploySoulFeatures();
}

module.exports = { deploySoulFeatures };
