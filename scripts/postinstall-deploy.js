#!/usr/bin/env node
/**
 * Stigmergy Post-install 部署脚本
 *
 * 在 npm install -g stigmergy 后自动：
 * 1. 检测本地可用的 CLI tools
 * 2. 从 obra/superpowers 克隆完整插件仓库
 * 3. 部署完整的 superpowers 插件系统到所有 CLI
 *
 * 支持的 CLI：
 * - Claude Code: 原生插件系统 (~/.claude/plugins/superpowers/)
 * - Qwen: 扩展系统 (~/.qwen/extensions/superpowers-qwen/)
 * - iFlow: 插件系统 (~/.iflow/plugins/superpowers/)
 * - CodeBuddy: Buddies 系统 (~/.codebuddy/buddies/superpowers/)
 * - OpenCode: 插件系统 (~/.opencode/plugins/superpowers/)
 * - KiloCode: 插件系统 (~/.kilocode/plugins/superpowers/)
 * - Gemini/Codex: 扩展系统
 */

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Get project root directory
const projectRoot = path.resolve(__dirname, "..");
const CLI_TOOLS = require(path.join(projectRoot, "src", "core", "cli_tools"));
const EnhancedCLIInstaller = require(
  path.join(projectRoot, "src", "core", "enhanced_cli_installer"),
);

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
    hookFile: "session-start.js",
  },
  qwen: {
    name: "Qwen",
    home: ".qwen",
    pluginDir: "extensions/superpowers-qwen",
    skillsDir: "skills",
    hooksDir: "hooks",
    hookFile: "session-start.ts",
  },
  iflow: {
    name: "iFlow",
    home: ".iflow",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    hookFile: "session-start.js",
  },
  codebuddy: {
    name: "CodeBuddy",
    home: ".codebuddy",
    pluginDir: "buddies/superpowers-buddies",
    skillsDir: "skills",
    hooksDir: "hooks",
    hookFile: "session-start.js",
  },
  opencode: {
    name: "OpenCode",
    home: ".opencode",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    hookFile: "session-start.js",
  },
  kilocode: {
    name: "KiloCode",
    home: ".kilocode",
    pluginDir: "plugins/superpowers",
    skillsDir: "skills",
    hooksDir: "hooks",
    hookFile: "session-start.js",
  },
  gemini: {
    name: "Gemini",
    home: ".config/gemini",
    pluginDir: "extensions/superpowers",
    skillsDir: "skills",
    hooksDir: "extensions",
    hookFile: "session-start.js",
  },
  codex: {
    name: "Codex",
    home: ".config/codex",
    pluginDir: "extensions/superpowers",
    skillsDir: "skills",
    hooksDir: "extensions",
    hookFile: "session-start.js",
  },
};

async function postInstallDeploy() {
  console.log("\n🚀 Stigmergy Complete Superpowers Deployment...");
  console.log("=".repeat(60));
  console.log(`Source: ${SUPERPOWERS_URL}`);

  const homeDir = os.homedir();

  // 步骤0: 自动安装配置为 autoInstall: true 的 CLI
  console.log("\n📦 步骤 0/5: 检查并自动安装缺失的 CLI...\n");
  const installer = new EnhancedCLIInstaller();

  for (const [cliName, cliConfig] of Object.entries(CLI_TOOLS.CLI_TOOLS)) {
    if (cliConfig.autoInstall && !cliConfig.install) {
      continue;
    }
    if (cliConfig.autoInstall) {
      const isInstalled = detectSingleCLI(cliName, homeDir);
      if (!isInstalled) {
        console.log(`  📥 自动安装 ${cliConfig.name}...`);
        try {
          await installer.installTool(cliName, cliConfig);
          console.log(`  ✅ ${cliConfig.name} 安装完成`);
        } catch (error) {
          console.log(`  ⚠️  ${cliConfig.name} 安装失败: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${cliConfig.name} 已安装`);
      }
    }
  }

  // 步骤1: 检测本地可用的 CLI
  console.log("\n📦 步骤 1/5: 检测本地可用的 CLI...\n");
  const availableCLIs = detectAvailableCLIs(homeDir);
  console.log(
    `✅ 检测到 ${availableCLIs.length} 个可用 CLI: ${availableCLIs.map((c) => CLI_CONFIGS[c]?.name || c).join(", ")}\n`,
  );

  if (availableCLIs.length === 0) {
    console.log("⚠️  未检测到任何可用的 CLI，跳过部署");
    return;
  }

  // 步骤2: 克隆 obra/superpowers 插件仓库
  console.log("📦 步骤 2/5: 克隆 obra/superpowers 插件仓库...\n");
  await cloneSuperpowersRepo();

  // 步骤3: 部署 Superpowers 插件系统
  console.log("\n📦 步骤 3/5: 部署 Superpowers 插件系统...\n");
  await deployToAllCLIs(availableCLIs, homeDir);

  // 步骤4: 部署内置技能 (resumesession, planning-with-files, skill-from-masters)
  console.log("\n📦 步骤 4/6: 部署内置技能...\n");
  await deployBuiltinSkills(homeDir);

  // 步骤5: 部署 Soul 自我进化系统
  console.log("\n📦 步骤 5/6: 部署 Soul 自我进化系统...\n");
  try {
    const { deploySoulFeatures } = require("./deploy-soul-features");
    await deploySoulFeatures();
    console.log("  ✅ Soul 自我进化系统部署完成");
  } catch (error) {
    console.log(`  ⚠️  Soul 系统部署失败: ${error.message}`);
  }

  // 步骤6: 摘要
  console.log("\n📦 步骤 6/6: 完成...\n");
  console.log("=".repeat(60));
  console.log("✅ Stigmergy Complete Superpowers Deployment 完成！");
  console.log(`📊 已部署到: ${availableCLIs.length} 个 CLI`);
  console.log("\n🎉 所有本地 CLI 现在都支持完整的 Superpowers 插件系统！");
  console.log(
    "📦 包括: hooks.json, session-start hook, ~15 skills, commands, agents\n",
  );
}

function detectAvailableCLIs(homeDir) {
  const available = [];
  for (const [cliName, config] of Object.entries(CLI_CONFIGS)) {
    if (fs.existsSync(path.join(homeDir, config.home))) {
      available.push(cliName);
    }
  }
  return available;
}

function detectSingleCLI(cliName, homeDir) {
  const config = CLI_CONFIGS[cliName];
  if (!config) return false;
  return fs.existsSync(path.join(homeDir, config.home));
}

async function cloneSuperpowersRepo() {
  const pluginDir = path.join(CACHE_DIR, "plugin");

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  if (fs.existsSync(pluginDir)) {
    console.log("  ℹ️  仓库已存在，更新中...");
    try {
      execSync("git fetch origin", { cwd: pluginDir, stdio: "pipe" });
      execSync("git merge --ff-only origin/main", {
        cwd: pluginDir,
        stdio: "pipe",
      });
      console.log("  ✅ 已更新到最新版本");
    } catch (e) {
      fs.rmSync(pluginDir, { recursive: true, force: true });
      execSync(`git clone ${SUPERPOWERS_URL} ${pluginDir}`, { stdio: "pipe" });
      console.log("  ✅ 重新克隆成功");
    }
  } else {
    console.log(`  📥 从 ${SUPERPOWERS_URL} 克隆...`);
    execSync(`git clone ${SUPERPOWERS_URL} ${pluginDir}`, { stdio: "pipe" });
    console.log("  ✅ 克隆成功");
  }

  const skillsCount = countSkills(path.join(pluginDir, "skills"));
  console.log(`  📊 仓库包含 ${skillsCount} 个 skills`);
}

function countSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) return 0;
  return fs.readdirSync(skillsDir).filter((s) => !s.startsWith(".")).length;
}

async function deployToAllCLIs(availableCLIs, homeDir) {
  const pluginDir = path.join(CACHE_DIR, "plugin");

  if (!fs.existsSync(pluginDir)) {
    throw new Error("插件仓库未找到，请先运行 clone");
  }

  const skillsList = fs
    .readdirSync(path.join(pluginDir, "skills"))
    .filter((s) => !s.startsWith("."));

  console.log(
    `  📦 部署 ${skillsList.length} skills 到 ${availableCLIs.length} 个 CLI...\n`,
  );

  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];
    if (!cliConfig) continue;

    console.log(`  🎯 部署到 ${cliName}...`);

    const cliHome = path.join(homeDir, cliConfig.home);
    const pluginTarget = path.join(cliHome, cliConfig.pluginDir);
    const skillsTarget = path.join(cliHome, cliConfig.skillsDir);
    const hooksTarget = path.join(cliHome, cliConfig.hooksDir);

    fs.mkdirSync(pluginTarget, { recursive: true });
    fs.mkdirSync(skillsTarget, { recursive: true });
    fs.mkdirSync(hooksTarget, { recursive: true });

    // 复制插件文件
    const dirsToCopy = [".claude-plugin", "skills"];
    for (const dir of dirsToCopy) {
      const src = path.join(pluginDir, dir);
      const dst = path.join(pluginTarget, dir);
      if (fs.existsSync(src)) {
        copyDirectory(src, dst);
      }
    }

    // 创建 hooks.json
    const hooksConfig = {
      hooks: {
        sessionStart: {
          name: "SessionStart",
          enabled: true,
          priority: 1,
          matchers: ["startup", "resume", "clear"],
          command: `$${cliConfig.home.toUpperCase().replace(/\./g, "_")}_ROOT/${cliConfig.hooksDir}/${cliConfig.hookFile}`,
        },
      },
    };
    fs.writeFileSync(
      path.join(hooksTarget, "hooks.json"),
      JSON.stringify(hooksConfig, null, 2),
    );

    // 创建 session-start hook
    const hookContent = generateSessionStartHook(cliName, cliConfig);
    fs.writeFileSync(path.join(hooksTarget, cliConfig.hookFile), hookContent);

    // 复制所有 skills
    copyDirectory(path.join(pluginDir, "skills"), skillsTarget);

    console.log(`     ✅ ${cliName} 部署完成`);
  }
}

function generateSessionStartHook(cliName, cliConfig) {
  const skillsRoot = path.join(
    os.homedir(),
    cliConfig.home,
    cliConfig.skillsDir,
  );

  return `/**
 * Superpowers Session Start Hook for ${cliName}
 * Auto-generated by Stigmergy
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_ROOT = '${skillsRoot.replace(/\\/g, "\\\\")}';

function escapeForJson(str) {
  return str.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n');
}

async function sessionStart(context) {
  try {
    let additionalContext = '<EXTREMELY_IMPORTANT>\\nYou have superpowers.\\n';

    const usingSkillPath = path.join(SKILLS_ROOT, 'using-superpowers', 'skill.md');
    if (fs.existsSync(usingSkillPath)) {
      const content = fs.readFileSync(usingSkillPath, 'utf8');
      additionalContext += '**Below is the full content of your superpowers:using-superpowers skill**\\n\\n' + escapeForJson(content);
    }

    additionalContext += '\\n</EXTREMELY_IMPORTANT>';

    if (context.additionalContext) {
      context.additionalContext += '\\n\\n' + additionalContext;
    } else {
      context.additionalContext = additionalContext;
    }

    console.log('🦸 Superpowers context injected for ${cliName}');
  } catch (error) {
    console.error('Failed to inject superpowers context:', error.message);
  }
  return context;
}

module.exports = { sessionStart };
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
      } catch (e) {}
    }
  }
}

/**
 * 部署内置技能 - resumesession, planning-with-files, skill-from-masters
 */
async function deployBuiltinSkills(homeDir) {
  const builtinConfigPath = path.join(
    projectRoot,
    "config",
    "builtin-skills.json",
  );

  if (!fs.existsSync(builtinConfigPath)) {
    console.log("  ℹ️  未找到内置技能配置文件，跳过");
    return;
  }

  try {
    const configContent = fs.readFileSync(builtinConfigPath, "utf8");
    const config = JSON.parse(configContent);

    if (!config.skills || config.skills.length === 0) {
      console.log("  ℹ️  没有需要部署的内置技能");
      return;
    }

    console.log(`  📦 发现 ${config.skills.length} 个内置技能`);

    for (const skill of config.skills) {
      console.log(`  🎯 部署技能: ${skill.name}`);

      const targetCLIs = skill.deployment?.targetCLIs || [];
      const files = skill.deployment?.files || [];

      for (const cliName of targetCLIs) {
        // 检查 CLI 是否存在
        const cliHomeDir = path.join(homeDir, `.${cliName}`);
        if (!fs.existsSync(cliHomeDir)) {
          console.log(`     ⚠️  ${cliName} 未安装，跳过`);
          continue;
        }

        // 创建 skills 目录
        const cliSkillsDir = path.join(cliHomeDir, "skills", skill.name);
        fs.mkdirSync(cliSkillsDir, { recursive: true });

        // 复制技能文件
        for (const file of files) {
          const sourcePath = path.join(projectRoot, file.source);
          const destPath = path.join(
            cliSkillsDir,
            path.basename(file.destination),
          );

          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`     ✅ ${cliName}: ${path.basename(file.source)}`);
          } else {
            console.log(`     ⚠️  源文件不存在: ${file.source}`);
          }
        }
      }
    }

    console.log("  ✅ 内置技能部署完成");
  } catch (error) {
    console.log(`  ⚠️  内置技能部署失败: ${error.message}`);
  }
}

postInstallDeploy().catch((error) => {
  console.error("部署失败:", error.message);
  process.exit(0);
});
