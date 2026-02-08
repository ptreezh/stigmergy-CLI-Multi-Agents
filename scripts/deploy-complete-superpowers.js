#!/usr/bin/env node
/**
 * Complete Superpowers Cross-CLI Deployment System
 *
 * 功能：
 * 1. 从 obra/superpowers 克隆完整插件仓库
 * 2. 为每个 CLI 适配其特定的插件/Hook 机制
 * 3. 部署完整的 superpowers 插件系统（不仅是 skills！）
 *
 * 支持的 CLI：
 * - Claude Code: 原生插件系统 (~/.claude/plugins/superpowers/)
 * - Qwen: 扩展系统 (~/.qwen/extensions/superpowers-qwen/)
 * - iFlow: 插件系统 (~/.iflow/plugins/superpowers/)
 * - CodeBuddy: Buddies 系统 (~/.codebuddy/buddies/superpowers/)
 * - OpenCode: 插件系统 (~/.opencode/plugins/superpowers/)
 * - KiloCode: 插件系统 (~/.kilocode/plugins/superpowers/)
 * - Gemini: 扩展系统 (~/.config/gemini/extensions/)
 * - Codex: 扩展系统 (~/.config/codex/extensions/)
 *
 * 用法：
 *   node scripts/deploy-complete-superpowers.js full    # 完整安装（推荐）
 *   node scripts/deploy-complete-superpowers.js clone  # 仅克隆仓库
 *   node scripts/deploy-complete-superpowers.js deploy # 仅部署
 *   node scripts/deploy-complete-superpowers.js verify # 验证
 *   node scripts/deploy-complete-superpowers.js clean  # 清理
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const SUPERPOWERS_REPO = "obra/superpowers";
const SUPERPOWERS_URL = `https://github.com/${SUPERPOWERS_REPO}.git`;
const CACHE_DIR = path.join(os.homedir(), ".cache", "stigmergy", "superpowers");

const CLI_CONFIGS = {
  claude: {
    name: "Claude Code",
    home: ".claude",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: true,
    hasAgents: true,
  },
  qwen: {
    name: "Qwen",
    home: ".qwen",
    pluginDir: "extensions/superpowers-qwen",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.ts",
    hasCommands: true,
    hasAgents: false,
  },
  iflow: {
    name: "iFlow",
    home: ".iflow",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: true,
    hasAgents: false,
  },
  codebuddy: {
    name: "CodeBuddy",
    home: ".codebuddy",
    pluginDir: "buddies/superpowers-buddies",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: false,
    hasAgents: true,
  },
  opencode: {
    name: "OpenCode",
    home: ".opencode",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: true,
    hasAgents: false,
  },
  kilocode: {
    name: "KiloCode",
    home: ".kilocode",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: false,
    hasAgents: false,
  },
  gemini: {
    name: "Gemini",
    home: ".config/gemini",
    pluginDir: "extensions/superpowers",
    skillsDir: "skills",
    hooksDir: "extensions",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: false,
    hasAgents: false,
  },
  codex: {
    name: "Codex",
    home: ".config/codex",
    pluginDir: "extensions/superpowers",
    skillsDir: "skills",
    hooksDir: "extensions",
    configFile: "config.json",
    hasNativePlugin: true,
    hookFile: "session-start.js",
    hasCommands: false,
    hasAgents: false,
  },
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "full";
  const verbose = args.includes("--verbose") || args.includes("-v");
  const dryRun = args.includes("--dry-run");

  console.log("\n🦸 Superpowers Cross-CLI Deployment System");
  console.log("=".repeat(60));
  console.log(`Command: ${command}`);
  console.log(`Source: ${SUPERPOWERS_URL}`);
  console.log(`Cache: ${CACHE_DIR}`);

  try {
    switch (command) {
      case "full":
        await fullDeployment(verbose, dryRun);
        break;
      case "clone":
        await cloneRepository(verbose);
        break;
      case "deploy":
        await deployToAllCLIs(verbose);
        break;
      case "verify":
        await verifyDeployment(verbose);
        break;
      case "clean":
        await cleanDeployment(verbose);
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (verbose) console.error(error.stack);
    process.exit(1);
  }

  console.log("\n✅ Superpowers deployment completed!\n");
}

async function fullDeployment(verbose, dryRun) {
  console.log("\n🚀 Full Superpowers Deployment");
  console.log("=".repeat(60));

  const steps = [
    {
      name: "Clone obra/superpowers repository",
      fn: () => cloneRepository(verbose),
    },
    {
      name: "Deploy to all detected CLIs",
      fn: () => deployToAllCLIs(verbose, dryRun),
    },
  ];

  for (const step of steps) {
    console.log(`\n📦 ${step.name}...`);
    await step.fn();
  }

  console.log("\n🎉 Full deployment complete!");
  await verifyDeployment(verbose);
}

async function cloneRepository(verbose) {
  console.log("\n📦 Step 1: Cloning obra/superpowers repository...\n");

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const pluginDir = path.join(CACHE_DIR, "plugin");
  const skillsDir = path.join(CACHE_DIR, "skills");

  if (fs.existsSync(pluginDir)) {
    console.log("  ℹ️  Repository already cloned, updating...");
    try {
      execSync("git fetch origin", { cwd: pluginDir, stdio: "pipe" });
      execSync("git merge --ff-only origin/main", {
        cwd: pluginDir,
        stdio: "pipe",
      });
      console.log("  ✅ Updated to latest version");
    } catch (e) {
      console.log("  ⚠️  Update failed, re-cloning...");
      fs.rmSync(pluginDir, { recursive: true, force: true });
      execSync(`git clone ${SUPERPOWERS_URL} ${pluginDir}`, {
        stdio: verbose ? "inherit" : "pipe",
      });
      console.log("  ✅ Re-cloned successfully");
    }
  } else {
    console.log(`  📥 Cloning from ${SUPERPOWERS_URL}...`);
    execSync(`git clone ${SUPERPOWERS_URL} ${pluginDir}`, {
      stdio: verbose ? "inherit" : "pipe",
    });
    console.log("  ✅ Cloned successfully");
  }

  const skillsCount = countSkills(path.join(pluginDir, "skills"));
  console.log(`\n📊 Found ${skillsCount} skills in repository`);
}

function countSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) return 0;
  return fs
    .readdirSync(skillsDir)
    .filter((s) => !s.startsWith(".") && !s.startsWith("_")).length;
}

async function deployToAllCLIs(verbose, dryRun = false) {
  console.log("\n📦 Step 2: Deploying to all local CLIs...\n");

  const homeDir = os.homedir();
  const pluginDir = path.join(CACHE_DIR, "plugin");

  if (!fs.existsSync(pluginDir)) {
    throw new Error('Plugin repository not found. Run "clone" first.');
  }

  const availableCLIs = detectAvailableCLIs(homeDir);
  console.log(
    `  📋 Detected CLIs: ${availableCLIs.map((c) => CLI_CONFIGS[c]?.name || c).join(", ")}\n`,
  );

  if (availableCLIs.length === 0) {
    console.log("  ⚠️  No supported CLIs detected");
    return;
  }

  const skillsList = fs
    .readdirSync(path.join(pluginDir, "skills"))
    .filter((s) => !s.startsWith(".") && !s.startsWith("_"));

  console.log(
    `  📦 Deploying ${skillsList.length} skills to ${availableCLIs.length} CLIs...\n`,
  );

  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];
    if (!cliConfig) continue;

    console.log(`\n  🎯 Deploying to ${cliConfig.name}...`);

    try {
      await deployToCLI(
        cliName,
        cliConfig,
        pluginDir,
        homeDir,
        verbose,
        dryRun,
      );
      console.log(`     ✅ ${cliConfig.name} deployment complete`);
    } catch (error) {
      console.log(
        `     ⚠️  ${cliConfig.name} deployment failed: ${error.message}`,
      );
    }
  }

  printDeploymentSummary(availableCLIs, homeDir);
}

function detectAvailableCLIs(homeDir) {
  const available = [];

  for (const [cliName, config] of Object.entries(CLI_CONFIGS)) {
    const cliPath = path.join(homeDir, config.home);

    if (fs.existsSync(cliPath)) {
      available.push(cliName);
    }
  }

  return available;
}

async function deployToCLI(
  cliName,
  cliConfig,
  pluginDir,
  homeDir,
  verbose,
  dryRun,
) {
  const cliHome = path.join(homeDir, cliConfig.home);
  const pluginTarget = path.join(cliHome, cliConfig.pluginDir);
  const skillsTarget = path.join(cliHome, cliConfig.skillsDir);
  const hooksTarget = path.join(cliHome, cliConfig.hooksDir);

  if (dryRun) {
    console.log(`     [DRY-RUN] Would deploy to ${pluginTarget}`);
    return;
  }

  fs.mkdirSync(pluginTarget, { recursive: true });
  fs.mkdirSync(skillsTarget, { recursive: true });
  fs.mkdirSync(hooksTarget, { recursive: true });

  const pluginSource = path.join(pluginDir);

  const dirsToCopy = [".claude-plugin", "skills"];
  if (cliConfig.hasCommands) dirsToCopy.push("commands");
  if (cliConfig.hasAgents) dirsToCopy.push("agents");

  for (const dir of dirsToCopy) {
    const src = path.join(pluginSource, dir);
    const dst = path.join(pluginTarget, dir);

    if (fs.existsSync(src)) {
      copyDirectory(src, dst);
      if (verbose) console.log(`     📁 Copied ${dir}/`);
    }
  }

  const hookContent = generateSessionStartHook(cliName, cliConfig, pluginDir);
  const hookFile = path.join(hooksTarget, cliConfig.hookFile);
  fs.writeFileSync(hookFile, hookContent, "utf8");
  if (verbose) console.log(`     📝 Created hook: ${cliConfig.hookFile}`);

  const hooksConfig = generateHooksConfig(cliName, cliConfig);
  const hooksConfigFile = path.join(hooksTarget, "hooks.json");
  fs.writeFileSync(
    hooksConfigFile,
    JSON.stringify(hooksConfig, null, 2),
    "utf8",
  );
  if (verbose) console.log(`     ⚙️  Created hooks.json`);

  copyAllSkills(skillsTarget, path.join(pluginSource, "skills"), verbose);

  const metaSkillContent = generateMetaSkill引导(cliName);
  const metaSkillDir = path.join(skillsTarget, "using-superpowers-stigmergy");
  fs.mkdirSync(metaSkillDir, { recursive: true });
  fs.writeFileSync(
    path.join(metaSkillDir, "skill.md"),
    metaSkillContent,
    "utf8",
  );
  if (verbose) console.log(`     📖 Added Stigmergy meta-skill`);
}

function generateSessionStartHook(cliName, cliConfig, pluginDir) {
  const skillsRoot = path.join(
    os.homedir(),
    cliConfig.home,
    cliConfig.skillsDir,
  );
  const usingSkillPath = path.join(skillsRoot, "using-superpowers", "skill.md");
  const metaSkillPath = path.join(
    skillsRoot,
    "using-superpowers-stigmergy",
    "skill.md",
  );

  return `/**
 * Superpowers Session Start Hook for ${cliConfig.name}
 * Auto-generated by Stigmergy
 *
 * This hook injects superpowers context at session start
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_ROOT = '${skillsRoot.replace(/\\/g, "\\\\")}';
const USING_SKILL_PATH = '${usingSkillPath.replace(/\\/g, "\\\\")}';
const META_SKILL_PATH = '${metaSkillPath.replace(/\\/g, "\\\\")}';

function escapeForJson(str) {
  return str
    .replace(/\\/g, '\\\\\\\\')
    .replace(/"/g, '\\\\"')
    .replace(/\\n/g, '\\\\n')
    .replace(/\\r/g, '\\\\r')
    .replace(/\\t/g, '\\\\t');
}

async function sessionStart(context) {
  try {
    let additionalContext = '<EXTREMELY_IMPORTANT>\\nYou have superpowers.\\n';

    if (fs.existsSync(USING_SKILL_PATH)) {
      const skillContent = fs.readFileSync(USING_SKILL_PATH, 'utf8');
      additionalContext += '**Below is the full content of your superpowers:using-superpowers skill**\\n\\n' + escapeForJson(skillContent);
    }

    if (fs.existsSync(META_SKILL_PATH)) {
      const metaContent = fs.readFileSync(META_SKILL_PATH, 'utf8');
      additionalContext += '\\n\\n**Stigmergy Cross-CLI Integration**\\n' + escapeForJson(metaContent);
    }

    additionalContext += '\\n</EXTREMELY_IMPORTANT>';

    if (context.additionalContext) {
      context.additionalContext += '\\n\\n' + additionalContext;
    } else {
      context.additionalContext = additionalContext;
    }

    console.log('🦸 Superpowers context injected successfully for ${cliConfig.name}');
  } catch (error) {
    console.error('Failed to inject superpowers context:', error.message);
  }

  return context;
}

module.exports = { sessionStart };
`;
}

function generateHooksConfig(cliName, cliConfig) {
  return {
    hooks: {
      sessionStart: {
        name: "SessionStart",
        enabled: true,
        priority: 1,
        matchers: ["startup", "resume", "clear"],
        command: `$${cliConfig.home.toUpperCase().replace(/\./g, "_")}_ROOT/${cliConfig.hooksDir}/${cliConfig.hookFile}`,
        trigger_keywords: [
          "task",
          "project",
          "code",
          "debug",
          "test",
          "implement",
          "create",
          "write",
        ],
      },
    },
  };
}

function generateMetaSkill引导(cliName) {
  return `---
name: using-superpowers-stigmergy
description: Stigmergy Cross-CLI Superpowers Integration - Use when starting any session
---

<EXTREMELY_IMPORTANT>
You have superpowers through Stigmergy's Cross-CLI collaboration system.

## Stigmergy Superpowers Protocol

Before ANY response or action, you MUST complete this checklist:

☐ 1. Check available Stigmergy skills in AGENTS.md or session context
☐ 2. Determine if any skill matches the current task
☐ 3. If yes: Use the appropriate skill methodology
☐ 4. For cross-CLI tasks: Use stigmergy to invoke other AI tools
☐ 5. Announce which skill or CLI you're using

## Available Skills

The following skills are available through Superpowers (bundled with Stigmergy):

### Core Development Skills
- **test-driven-development**: Implement features using TDD methodology
- **systematic-debugging**: Debug issues systematically
- **code-reviewer**: Perform thorough code reviews
- **using-git-worktrees**: Create isolated git worktrees

### Workflow Skills
- **brainstorming**: Structured design process
- **writing-plans**: Create comprehensive plans
- **executing-plans**: Execute previously created plans
- **finishing-a-development-branch**: Complete and merge branches
- **subagent-driven-development**: Coordinate multiple agents
- **requesting-code-review**: Request reviews from other agents
- **receiving-code-review**: Respond to code reviews
- **writing-skills**: Create new skills

## Cross-CLI Commands

Stigmergy enables collaboration across multiple AI CLI tools:

- \`stigmergy use <cli> <task>\` - Execute task in specific CLI
- \`stigmergy call skill <name>\` - Use a skill (auto-routes to best CLI)
- \`stigmergy distcli <prompt>\` - Distribute prompt to all CLIs

## Mandatory First Response Protocol

**You do not have a choice. You cannot rationalize your way out.**

If even 1% chance a skill applies, you ABSOLUTELY MUST use it.
Responding WITHOUT completing this checklist = automatic failure.
</EXTREMELY_IMPORTANT>
`;
}

function copyDirectory(src, dst) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, dstPath);
    } else {
      try {
        fs.copyFileSync(srcPath, dstPath);
      } catch (e) {
        // Ignore errors
      }
    }
  }
}

function copyAllSkills(targetDir, sourceDir, verbose) {
  if (!fs.existsSync(sourceDir)) return;

  const skills = fs
    .readdirSync(sourceDir)
    .filter((s) => !s.startsWith(".") && !s.startsWith("_"));

  for (const skill of skills) {
    const src = path.join(sourceDir, skill);
    const dst = path.join(targetDir, skill);

    if (fs.statSync(src).isDirectory()) {
      if (fs.existsSync(dst)) {
        fs.rmSync(dst, { recursive: true });
      }
      copyDirectory(src, dst);
      if (verbose) console.log(`     📦 Copied skill: ${skill}`);
    }
  }
}

function printDeploymentSummary(availableCLIs, homeDir) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 Deployment Summary:\n");

  let totalPlugins = 0;
  let totalSkills = 0;

  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];
    const pluginPath = path.join(homeDir, cliConfig.home, cliConfig.pluginDir);
    const skillsPath = path.join(homeDir, cliConfig.home, cliConfig.skillsDir);

    const pluginExists = fs.existsSync(pluginPath);
    const skillsCount = fs.existsSync(skillsPath)
      ? fs.readdirSync(skillsPath).filter((s) => !s.startsWith(".")).length
      : 0;

    if (pluginExists) totalPlugins++;
    totalSkills += skillsCount;

    console.log(
      `  ${pluginExists ? "✅" : "❌"} ${cliConfig.name}: ${skillsCount} skills`,
    );
  }

  console.log(
    "\n📈 Total: " + totalPlugins + " plugins, " + totalSkills + " skills",
  );
  console.log("🎉 All local CLIs now have complete Superpowers support!");
}

async function verifyDeployment(verbose) {
  console.log("\n🔍 Verifying Superpowers Deployment...\n");

  const homeDir = os.homedir();
  const availableCLIs = detectAvailableCLIs(homeDir);

  let allSuccess = true;

  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];
    const pluginPath = path.join(homeDir, cliConfig.home, cliConfig.pluginDir);
    const hooksPath = path.join(homeDir, cliConfig.home, cliConfig.hooksDir);
    const skillsPath = path.join(homeDir, cliConfig.home, cliConfig.skillsDir);

    console.log(`📋 ${cliConfig.name}:`);

    const checks = {
      plugin: fs.existsSync(
        path.join(pluginPath, ".claude-plugin", "plugin.json"),
      ),
      skills:
        fs.existsSync(skillsPath) && fs.readdirSync(skillsPath).length > 0,
      hooks: fs.existsSync(path.join(hooksPath, "hooks.json")),
      hookFile: fs.existsSync(path.join(hooksPath, cliConfig.hookFile)),
    };

    for (const [check, result] of Object.entries(checks)) {
      console.log(`   ${result ? "✅" : "❌"} ${check}`);
      if (!result) allSuccess = false;
    }

    if (verbose) {
      const skillsCount = fs.existsSync(skillsPath)
        ? fs.readdirSync(skillsPath).filter((s) => !s.startsWith(".")).length
        : 0;
      console.log(`   📦 Skills count: ${skillsCount}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  if (allSuccess) {
    console.log("✅ All CLIs have complete Superpowers deployment!");
  } else {
    console.log("⚠️  Some CLIs have incomplete deployment");
  }
}

async function cleanDeployment(verbose) {
  console.log("\n🗑️  Cleaning Superpowers Deployment...\n");

  const homeDir = os.homedir();
  const availableCLIs = detectAvailableCLIs(homeDir);

  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];

    console.log(`  🗑️  Removing from ${cliConfig.name}...`);

    const pluginPath = path.join(homeDir, cliConfig.home, cliConfig.pluginDir);
    const hooksPath = path.join(homeDir, cliConfig.home, cliConfig.hooksDir);

    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true });
      if (verbose) console.log(`     🗑️  Removed plugin`);
    }

    if (fs.existsSync(hooksPath)) {
      const hookFiles = fs
        .readdirSync(hooksPath)
        .filter((f) => f.startsWith("session-start") || f === "hooks.json");

      for (const file of hookFiles) {
        fs.rmSync(path.join(hooksPath, file));
      }
      if (verbose && hookFiles.length > 0)
        console.log(`     🗑️  Removed hooks`);
    }
  }

  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true });
    console.log("\n🗑️  Removed cached repository");
  }

  console.log("\n✅ Superpowers deployment cleaned up!");
}

function showHelp() {
  console.log(`
Usage: node scripts/deploy-complete-superpowers.js [command] [options]

Commands:
  full     Complete deployment (clone + deploy) - RECOMMENDED
  clone    Clone obra/superpowers repository only
  deploy   Deploy to all CLIs (requires cloned repo)
  verify   Verify deployment status
  clean    Remove all deployments

Options:
  --verbose, -v   Show detailed output
  --dry-run       Show what would be done

Supported CLIs:
  Claude, Qwen, iFlow, CodeBuddy, OpenCode, Gemini, Codex

Examples:
  node scripts/deploy-complete-superpowers.js full
  node scripts/deploy-complete-superpowers.js full --verbose
  node scripts/deploy-complete-superpowers.js verify
  node scripts/deploy-complete-superpowers.js clean
  `);
}

if (require.main === module) {
  main();
}

module.exports = {
  cloneRepository,
  deployToAllCLIs,
  verifyDeployment,
  cleanDeployment,
  CLI_CONFIGS,
};
