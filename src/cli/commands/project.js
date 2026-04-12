/**
 * Project Commands
 * Modular implementation for init, setup, deploy, upgrade, call commands
 */

const chalk = require("chalk");
const { handleStatusCommand } = require("./status");
const path = require("path");
const os = require("os");
const { getCLIPath, setupCLIPaths } = require("../../core/cli_tools");
const SmartRouter = require("../../core/smart_router");
const EnhancedCLIInstaller = require("../../core/enhanced_cli_installer");
const StigmergyInstaller = require("../../core/installer");
const { executeCommand } = require("../../utils");
const LocalSkillScanner = require("../../core/local_skill_scanner");
const CLIHelpAnalyzer = require("../../core/cli_help_analyzer");
const { CLI_TOOLS } = require("../../core/cli_tools");
const { ensureSkillsCache } = require("../utils/skills_cache");
const packageJson = require("../../../package.json");

// Import execution mode detection and CLI adapters
const ExecutionModeDetector = require("../../core/execution_mode_detector");
const { CLIAdapterManager } = require("../../core/cli_adapters");

// Create instances
const modeDetector = new ExecutionModeDetector();
const cliAdapterManager = new CLIAdapterManager();

/**
 * Handle upgrade command
 * @param {Object} options - Command options
 */
async function handleUpgradeCommand(options = {}) {
  try {
    console.log(
      chalk.cyan("[UPGRADE] Starting AI CLI tools upgrade process...\n"),
    );

    // Initialize or update skills/agents cache
    await ensureSkillsCache({ verbose: process.env.DEBUG === "true" });

    const upgradeOptions = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || process.env.DEBUG === "true",
    };

    // Use enhanced CLI installer for upgrade
    const enhancedInstaller = new EnhancedCLIInstaller({
      verbose: upgradeOptions.verbose,
      autoRetry: true,
      maxRetries: 2,
    });

    // Get installed tools
    const installer = new StigmergyInstaller({
      verbose: upgradeOptions.verbose,
    });
    const { available: installedTools } = await installer.scanCLI();

    if (Object.keys(installedTools).length === 0) {
      console.log(chalk.yellow("[INFO] No CLI tools found to upgrade"));
      console.log(
        chalk.blue("💡 Run: stigmergy install to install CLI tools first"),
      );
      return { success: true, upgraded: 0 };
    }

    console.log(
      chalk.blue(
        `[INFO] Found ${Object.keys(installedTools).length} CLI tools to upgrade`,
      ),
    );

    if (upgradeOptions.dryRun) {
      console.log(chalk.yellow("[DRY RUN] Would upgrade the following tools:"));
      Object.keys(installedTools).forEach((tool) => {
        console.log(`  • ${tool}`);
      });
      return { success: true, upgraded: Object.keys(installedTools).length };
    }

    // Perform upgrade
    console.log(chalk.blue("[INFO] Starting upgrade process..."));
    const toolsToUpgrade = Object.keys(installedTools);

    const upgradeResult = await enhancedInstaller.upgradeTools(
      toolsToUpgrade,
      installedTools,
    );

    if (upgradeResult) {
      console.log(
        chalk.green(
          `\n✅ Successfully upgraded ${toolsToUpgrade.length} CLI tools!`,
        ),
      );
      return { success: true, upgraded: toolsToUpgrade.length };
    } else {
      console.log(chalk.red("\n❌ Upgrade process encountered issues"));
      return { success: false, upgraded: 0 };
    }
  } catch (error) {
    console.error(chalk.red("[ERROR] Upgrade failed:"), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Handle deploy command
 * @param {Object} options - Command options
 */
async function handleDeployCommand(options = {}) {
  try {
    console.log(chalk.cyan("[DEPLOY] Starting hook deployment...\n"));

    const installer = new StigmergyInstaller({ verbose: options.verbose });
    const { available: deployedTools } = await installer.scanCLI();

    // 如果 options.all 为 true，部署所有工具；否则只部署 autoInstall: true 的工具
    let filteredDeployedTools;
    if (options.all) {
      console.log(
        chalk.blue(
          "[INFO] Deploying hooks for ALL available tools (--all mode)",
        ),
      );
      filteredDeployedTools = deployedTools;
    } else {
      console.log(
        chalk.blue("[INFO] Deploying hooks for auto-install tools only"),
      );
      const toolsToDeploy = Object.entries(deployedTools).filter(
        ([toolName]) => installer.router.tools[toolName]?.autoInstall === true,
      );
      filteredDeployedTools = Object.fromEntries(toolsToDeploy);
    }

    if (Object.keys(filteredDeployedTools).length === 0) {
      console.log(chalk.yellow("[INFO] No CLI tools found for deployment"));
      console.log(
        chalk.blue("💡 Run: stigmergy install to install CLI tools first"),
      );
      return { success: true, deployed: 0 };
    }

    console.log(
      chalk.blue(
        `[INFO] Deploying hooks for ${Object.keys(filteredDeployedTools).length} tools...`,
      ),
    );

    await installer.deployHooks(filteredDeployedTools);

    // 部署完整的 Superpowers 插件系统
    console.log(
      chalk.blue("\n[DEPLOY] Deploying complete Superpowers plugin system..."),
    );
    await deployCompleteSuperpowers();

    console.log(chalk.green("\n✅ Hook deployment completed successfully!"));
    console.log(
      chalk.blue("\n🎉 Superpowers complete plugin system deployed!"),
    );
    return {
      success: true,
      deployed: Object.keys(filteredDeployedTools).length,
    };
  } catch (error) {
    console.error(chalk.red("[ERROR] Deployment failed:"), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Deploy complete Superpowers plugin system to all CLIs
 * Clones obra/superpowers and deploys full plugin (hooks + skills + commands + agents)
 */
async function deployCompleteSuperpowers() {
  const { execSync } = require("child_process");
  let fs, path, os;

  try {
    fs = require("fs");
    path = require("path");
    os = require("os");
    console.log("[DEBUG] Modules loaded successfully");
  } catch (e) {
    console.error("[DEBUG] Module load error:", e.message);
    throw e;
  }

  const SUPERPOWERS_REPO = "obra/superpowers";
  const SUPERPOWERS_URL = `https://github.com/${SUPERPOWERS_REPO}.git`;
  const CACHE_DIR = path.join(
    os.homedir(),
    ".cache",
    "stigmergy",
    "superpowers",
  );

  const CLI_CONFIGS = {
    claude: {
      home: ".claude",
      pluginDir: "plugins/superpowers",
      skillsDir: "skills",
      hooksDir: "hooks",
      hookFile: "session-start.js",
    },
    qwen: {
      home: ".qwen",
      pluginDir: "extensions/superpowers-qwen",
      skillsDir: "skills",
      hooksDir: "hooks",
      hookFile: "session-start.ts",
    },
    iflow: {
      home: ".iflow",
      pluginDir: "plugins/superpowers",
      skillsDir: "skills",
      hooksDir: "hooks",
      hookFile: "session-start.js",
    },
    codebuddy: {
      home: ".codebuddy",
      pluginDir: "buddies/superpowers-buddies",
      skillsDir: "skills",
      hooksDir: "hooks",
      hookFile: "session-start.js",
    },
    opencode: {
      home: ".opencode",
      pluginDir: "plugins/superpowers",
      skillsDir: "skills",
      hooksDir: "hooks",
      hookFile: "session-start.js",
    },
    gemini: {
      home: ".config/gemini",
      pluginDir: "extensions/superpowers",
      skillsDir: "skills",
      hooksDir: "extensions",
      hookFile: "session-start.js",
    },
    codex: {
      home: ".config/codex",
      pluginDir: "extensions/superpowers",
      skillsDir: "skills",
      hooksDir: "extensions",
      hookFile: "session-start.js",
    },
  };

  const homeDir = os.homedir();

  // 检测可用的 CLI
  const availableCLIs = Object.entries(CLI_CONFIGS)
    .filter(([_, config]) => fs.existsSync(path.join(homeDir, config.home)))
    .map(([name]) => name);

  console.log(chalk.blue(`  📋 Detected CLIs: ${availableCLIs.length}`));

  if (availableCLIs.length === 0) {
    console.log(chalk.yellow("  ⚠️  No supported CLIs detected"));
    return;
  }

  // 克隆 Superpowers 仓库
  const pluginDir = path.join(CACHE_DIR, "plugin");
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  if (!fs.existsSync(pluginDir)) {
    console.log(chalk.blue("  📥 Cloning obra/superpowers..."));
    try {
      execSync(`git clone ${SUPERPOWERS_URL} ${pluginDir}`, { stdio: "pipe" });
      console.log(chalk.green("  ✅ Superpowers repository cloned"));
    } catch (e) {
      console.log(chalk.yellow("  ⚠️  Clone failed, trying update..."));
      return;
    }
  } else {
    console.log(chalk.blue("  🔄 Updating Superpowers repository..."));
    try {
      execSync("git fetch origin", { cwd: pluginDir, stdio: "pipe" });
      execSync("git merge --ff-only origin/main", {
        cwd: pluginDir,
        stdio: "pipe",
      });
      console.log(chalk.green("  ✅ Superpowers updated"));
    } catch (e) {
      console.log(chalk.yellow("  ⚠️  Update failed, using existing"));
    }
  }

  // 部署到每个 CLI
  console.log(chalk.blue(`  📦 Deploying to ${availableCLIs.length} CLIs...`));

  for (const cliName of availableCLIs) {
    try {
      console.log(`[DEBUG] Processing ${cliName}...`);
      const cliConfig = CLI_CONFIGS[cliName];
      if (!cliConfig) {
        console.log(`[DEBUG] No config for ${cliName}, skipping`);
        continue;
      }

      console.log(
        `[DEBUG] cliConfig for ${cliName}:`,
        JSON.stringify(cliConfig),
      );

      const cliHome = path.join(homeDir, cliConfig.home);
      console.log(`[DEBUG] cliHome for ${cliName}:`, cliHome);
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
          copyDirectoryRecursive(src, dst);
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
      copyDirectoryRecursive(path.join(pluginDir, "skills"), skillsTarget);

      console.log(chalk.green(`     ✅ ${cliName}`));
    } catch (e) {
      console.error(`[DEBUG] Error processing ${cliName}:`, e.message);
      console.error(e.stack);
    }
  }

  // 统计部署
  let totalSkills = 0;
  for (const cliName of availableCLIs) {
    const cliConfig = CLI_CONFIGS[cliName];
    const skillsPath = path.join(homeDir, cliConfig.home, cliConfig.skillsDir);
    if (fs.existsSync(skillsPath)) {
      totalSkills += fs
        .readdirSync(skillsPath)
        .filter((s) => !s.startsWith(".")).length;
    }
  }

  console.log(
    chalk.green(
      `\n  🎉 Superpowers deployed: ${availableCLIs.length} CLIs, ${totalSkills} skills total`,
    ),
  );
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

function copyDirectoryRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, dstPath);
    } else {
      try {
        fs.copyFileSync(srcPath, dstPath);
      } catch (err) {
        const { ProcessError } = require('../../core/coordination/error_handler');
        const classified = new ProcessError(err.message, { operation: 'copyDirectoryRecursive', src: srcPath, dst: dstPath });
        console.error(`[project.js] ProcessError: failed to copy file from ${srcPath} to ${dstPath}: ${classified.message}`);
        classified.context = classified.context || {};
        const DLQ = require('../../core/soul/DeadLetterQueue');
        try { new DLQ().push(classified, { operation: 'copyDirectoryRecursive' }); } catch (_) {}
        throw classified;
      }
    }
  }
}

/**
 * Handle init command
 * @param {Object} options - Command options
 */
async function handleInitCommand(options = {}) {
  try {
    console.log(
      chalk.cyan(
        "[INIT] Initializing Stigmergy project in current directory...\n",
      ),
    );

    // Initialize or update skills/agents cache (skip if called from setup)
    if (!options.skipSkillsCache) {
      await ensureSkillsCache({ verbose: true });
    }

    // Quick path detection for better tool availability (skip if called from setup)
    if (!options.skipPathSetup) {
      console.log(chalk.blue("[INIT] Detecting CLI tool paths..."));
      const pathSetup = await setupCLIPaths();

      console.log(
        `[INIT] CLI tool detection: ${pathSetup.report.summary.found}/${pathSetup.report.summary.total} tools found`,
      );
    }

    // Quick setup for basic project structure
    const projectDir = process.cwd();
    const stigmergyDir = path.join(projectDir, ".stigmergy");

    const fs = require("fs").promises;

    // Create .stigmergy directory
    await fs.mkdir(stigmergyDir, { recursive: true });

    // Create basic config
    const config = {
      version: packageJson.version,
      created: new Date().toISOString(),
      project: path.basename(projectDir),
    };

    await fs.writeFile(
      path.join(stigmergyDir, "config.json"),
      JSON.stringify(config, null, 2),
    );

    console.log(
      chalk.green(`✅ Stigmergy project initialized in: ${projectDir}`),
    );
    console.log(
      chalk.blue(`📁 Configuration created: ${stigmergyDir}/config.json`),
    );
    console.log(chalk.gray("\n💡 Next steps:"));
    console.log(chalk.gray("  • stigmergy install    # Install CLI tools"));
    console.log(
      chalk.gray("  • stigmergy deploy     # Deploy integration hooks"),
    );
    console.log(chalk.gray("  • stigmergy status     # Check tool status"));

    if (pathSetup.report.summary.missing > 0) {
      console.log(chalk.gray("\n💡 For full CLI integration, run:"));
      console.log(
        chalk.gray(
          "  • stigmergy setup  # Complete setup with PATH configuration",
        ),
      );
    }

    return { success: true, projectDir };
  } catch (error) {
    console.error(chalk.red("[ERROR] Initialization failed:"), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle setup command
 * @param {Object} options - Command options
 */
async function handleSetupCommand(options = {}) {
  const fs = require("fs");
  const os = require("os");

  // Check last setup timestamp
  const configDir = path.join(os.homedir(), ".stigmergy");
  const timestampFile = path.join(configDir, "last-setup-timestamp");
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  try {
    if (fs.existsSync(timestampFile)) {
      const lastSetup = parseInt(fs.readFileSync(timestampFile, "utf8"), 10);
      const timeSinceLastSetup = Date.now() - lastSetup;
      if (timeSinceLastSetup < ONE_DAY_MS && !options.force) {
        const hoursSince = Math.round(timeSinceLastSetup / (1000 * 60 * 60));
        console.log(
          chalk.yellow(
            `[SETUP] ⏭️  Setup was performed ${hoursSince} hours ago. Use --force to override.`,
          ),
        );
        return;
      }
    }
  } catch (e) {
    // Ignore timestamp errors
  }

  // Record this setup timestamp
  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(timestampFile, Date.now().toString(), "utf8");
  } catch (e) {
    // Ignore write errors
  }

  try {
    console.log(chalk.cyan("[SETUP] Starting complete Stigmergy setup...\n"));

    // Initialize or update skills/agents cache (explicit call, will also be called in init)
    await ensureSkillsCache({ verbose: true });

    // Step 0: Setup CLI paths detection and configuration
    console.log(chalk.blue("[STEP 0] Setting up CLI path detection..."));
    const pathSetup = await setupCLIPaths();

    console.log(`[PATH] Path detection complete:`);
    console.log(`  - Found: ${pathSetup.report.summary.found} CLI tools`);
    console.log(`  - Missing: ${pathSetup.report.summary.missing} CLI tools`);

    if (pathSetup.pathStatus.updated) {
      console.log(
        chalk.green(
          "\n[PATH] ✓ All npm global directories are now available in PATH",
        ),
      );
      console.log(
        chalk.gray(
          "[PATH] CLI tools will be globally accessible after terminal restart",
        ),
      );
    } else {
      console.log(chalk.yellow("\n[PATH] ⚠️ PATH update failed:"));
      console.log(chalk.gray(`  Error: ${pathSetup.pathStatus.message}`));
      console.log(chalk.gray("\n[PATH] Manual update required:"));
      console.log(chalk.gray("  Run the generated scripts to update PATH:"));
      if (pathSetup.pathStatus.scriptPath) {
        console.log(
          chalk.gray(
            `  - Script directory: ${pathSetup.pathStatus.scriptPath}`,
          ),
        );
      }
      console.log(
        chalk.gray(
          "  - Windows: Run PowerShell as Administrator and execute the scripts",
        ),
      );
      console.log(
        chalk.gray(
          "  - Unix/Linux: Source the shell script (source update-path.sh)",
        ),
      );
    }

    // Initialize project (skip redundant steps already done above)
    await handleInitCommand({ verbose: options.verbose, skipPathSetup: true, skipSkillsCache: true });

    // Install CLI tools
    const installer = new StigmergyInstaller({ verbose: options.verbose });
    const { available: setupAvailable, missing: setupMissing } =
      await installer.scanCLI();

    // Actually install missing tools first
    if (Object.keys(setupMissing).length > 0) {
      console.log(chalk.yellow("\n[STEP 1] Installing missing tools:"));
      for (const [toolName, toolInfo] of Object.entries(setupMissing)) {
        console.log(`  - Installing ${toolInfo.name}...`);
        try {
          await installer.install(toolName);
          console.log(chalk.green(`  ✅ ${toolInfo.name} installed`));
        } catch (err) {
          console.log(
            chalk.red(`  ❌ ${toolInfo.name} failed: ${err.message}`),
          );
        }
      }
      // Re-scan after installation
      const { available: newAvailable } = await installer.scanCLI();
      Object.assign(setupAvailable, newAvailable);
    } else {
      console.log(
        chalk.green("\n[STEP 1] All required tools are already installed!"),
      );
    }

    // Deploy hooks to available CLI tools (AFTER installation)
    if (Object.keys(setupAvailable).length > 0) {
      console.log(
        chalk.blue("\n[STEP 2] Deploying hooks to available tools..."),
      );
      await installer.deployHooks(setupAvailable);

      // Deploy built-in Superpowers (AFTER hooks, offline capable)
      console.log(chalk.blue("\n[STEP 3] Deploying built-in Superpowers..."));
      try {
        const {
          deployBuiltinSuperpowers,
        } = require("../../../scripts/postinstall-deploy");
        const projectRoot = path.resolve(__dirname, "../../..");
        const fs = require("fs");

        // Detect available CLIs
        const os = require("os");
        const CLI_CONFIGS = {
          claude: {
            home: ".claude",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          qwen: {
            home: ".qwen",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.ts",
          },
          iflow: {
            home: ".iflow",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          codebuddy: {
            home: ".codebuddy",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          opencode: {
            home: ".opencode",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          kilocode: {
            home: ".kilocode",
            hooksDir: "hooks",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          gemini: {
            home: ".config/gemini",
            hooksDir: "extensions",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
          codex: {
            home: ".config/codex",
            hooksDir: "extensions",
            skillsDir: "skills",
            hookFile: "session-start.js",
          },
        };

        const homeDir = os.homedir();
        const availableCLIs = Object.keys(CLI_CONFIGS).filter((cli) =>
          fs.existsSync(path.join(homeDir, CLI_CONFIGS[cli].home)),
        );

        if (availableCLIs.length > 0) {
          await deployBuiltinSuperpowers(availableCLIs, homeDir);
          console.log(chalk.green("  ✅ Built-in Superpowers deployed"));
        }
      } catch (error) {
        console.log(
          chalk.yellow(
            `  ⚠️  Built-in Superpowers deploy skipped: ${error.message}`,
          ),
        );
      }
    } else {
      console.log(
        chalk.yellow("\n[STEP 2] No tools available for hook deployment"),
      );
    }

    // Verify setup
    console.log(chalk.blue("\n[STEP 4] Verifying installation..."));
    await handleStatusCommand({ verbose: false });

    console.log(chalk.green("\n🎉 Setup completed successfully!"));
    console.log(chalk.blue("\n[USAGE] Get started with these commands:"));
    console.log(
      chalk.gray(
        "  stigmergy d        - System diagnostic (recommended first)",
      ),
    );
    console.log(
      chalk.gray("  stigmergy inst     - Install missing AI CLI tools"),
    );
    console.log(
      chalk.gray("  stigmergy deploy   - Deploy hooks to installed tools"),
    );
    console.log(
      chalk.gray("  stigmergy call     - Execute prompts with auto-routing"),
    );

    return { success: true };
  } catch (error) {
    console.error(chalk.red("[ERROR] Setup failed:"), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get working directory for a specific CLI tool
 */
function getWorkingDirectoryForTool(toolName) {
  const toolConfig = CLI_TOOLS[toolName];
  if (toolConfig && toolConfig.workingDirectory) {
    return toolConfig.workingDirectory;
  }
  return process.cwd();
}

/**
 * Get environment for a specific CLI tool
 */
function getEnvironmentForTool(toolName) {
  const env = { ...process.env };

  // Tool-specific environment handling
  if (toolName === "qwen") {
    // Qwen CLI requires NODE_PATH to be unset
    delete env.NODE_PATH;
  }

  return env;
}

/**
 * Add OAuth authentication arguments to command args
 */
function addOAuthAuthArgs(toolName, args = []) {
  const toolConfig = CLI_TOOLS[toolName];

  if (toolConfig && toolConfig.oauth) {
    const oauth = toolConfig.oauth;
    if (oauth.authRequired) {
      // Qwen-specific OAuth handling
      if (toolName === "qwen" && process.env.QWEN_ACCESS_TOKEN) {
        return [...args, "--access-token", process.env.QWEN_ACCESS_TOKEN];
      }
    }
  }

  return args;
}

/**
 * Execute a smart routed command with full parameter handling and mode detection
 * @param {Object} route - Route object with tool and prompt
 * @param {Object} options - Execution options
 */
async function executeSmartRoutedCommand(route, options = {}) {
  const { verbose = false, maxRetries = 3, interactive, print } = options;

  try {
    // Detect execution mode
    const mode = modeDetector.detect({
      interactive,
      print,
      verbose,
    });

    const modeDescription = modeDetector.getModeDescription(mode);
    if (verbose) {
      console.log(chalk.gray(`[MODE] ${modeDescription}`));
    }

    // Get adapted arguments for the tool and mode
    // 🔥 路由模式强制使用自动模式
    // Save auto-mode flags before enhanced handler can overwrite them
    const baseToolArgs = cliAdapterManager.getArguments(
      route.tool,
      mode,
      route.prompt,
      true,
    );
    // Extract auto-mode flags (everything except the last -p/prompt pair)
    const autoModeFlags = baseToolArgs.slice(0, baseToolArgs.length - 2);
    let toolArgs = [...baseToolArgs];

    // Add OAuth authentication if needed
    toolArgs = addOAuthAuthArgs(route.tool, toolArgs);

    // Use enhanced parameter handling for one-time mode only
    if (mode === "one-time") {
      try {
        const EnhancedCLIParameterHandler = require("../../core/enhanced_cli_parameter_handler");
        const paramHandler = new EnhancedCLIParameterHandler();

        // Generate optimized arguments with agent/skill support
        // Add timeout protection for parameter generation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Parameter generation timeout")),
            30000,
          ); // 30 second timeout for parameter generation
        });

        const paramPromise = paramHandler.generateArgumentsWithRetry(
          route.tool,
          route.prompt,
          {
            maxRetries,
            enableAgentSkillOptimization: true,
          },
        );

        const paramResult = await Promise.race([paramPromise, timeoutPromise]);

        // Merge: preserve auto-mode flags + enhanced prompt args
        // paramResult.arguments may be ["--print", '"/ant 什么是翻译"'] or ["-p", '"/ant 什么是翻译"']
        // We need: autoModeFlags + paramResult.arguments (dedup --print if present in both)
        const enhancedArgs = paramResult.arguments || [];
        const mergedArgs = [...autoModeFlags];
        for (const arg of enhancedArgs) {
          // Skip duplicate --print (already in autoModeFlags)
          if (arg === "--print" && mergedArgs.includes("--print")) continue;
          mergedArgs.push(arg);
        }
        toolArgs = mergedArgs;

        // Re-add OAuth authentication
        toolArgs = addOAuthAuthArgs(route.tool, toolArgs);

        if (verbose) {
          console.log(
            chalk.gray(`[DEBUG] Generated args: ${toolArgs.join(" ")}`),
          );
        }
      } catch (paramError) {
        console.log(
          chalk.yellow(
            `[WARN] Parameter generation failed: ${paramError.message}, using basic arguments`,
          ),
        );
        // Fallback to basic arguments if enhanced parameter generation fails
        if (verbose) {
          console.log(
            chalk.gray(
              `[DEBUG] Falling back to basic args: ${toolArgs.join(" ")}`,
            ),
          );
        }
      }
    } else {
      if (verbose) {
        console.log(chalk.gray(`[DEBUG] Adapted args: ${toolArgs.join(" ")}`));
      }
    }

    // Get tool path
    const toolPath = await getCLIPath(route.tool);
    if (!toolPath) {
      throw new Error(`Tool ${route.tool} not found`);
    }

    // Prepare execution environment
    const cwd = getWorkingDirectoryForTool(route.tool);
    const env = getEnvironmentForTool(route.tool);

    if (verbose) {
      console.log(
        chalk.gray(`[DEBUG] Executing: ${toolPath} ${toolArgs.join(" ")}`),
      );
      console.log(chalk.gray(`[DEBUG] Working directory: ${cwd}`));
      console.log(chalk.gray(`[DEBUG] Mode: ${mode}`));
    }

    console.log(chalk.gray(`[EXEC] ${route.tool}: ${route.prompt}`)); // Add this to match direct command format

    // Execute the command
    // For interactive mode, we need stdio: 'inherit' to allow user interaction
    // For one-time mode, we should use 'inherit' to ensure CLI tools can properly execute
    const stdioOption = mode === "interactive" ? "inherit" : "inherit"; // Use 'inherit' for both modes to ensure proper CLI execution

    console.log(
      chalk.gray(
        `[DEBUG] About to execute command with args: ${toolArgs.join(" ")}`,
      ),
    ); // Debug log
    console.log(chalk.gray(`[DEBUG] Using stdio option: ${stdioOption}`)); // Debug log
    const result = await executeCommand(toolPath, toolArgs, {
      stdio: stdioOption,
      shell: true,
      cwd,
      env,
      timeout: 300000, // 5 minutes
    });
    console.log(chalk.gray(`[DEBUG] Command execution completed`)); // Debug log

    return { success: true, tool: route.tool, result, mode };
  } catch (error) {
    if (verbose) {
      console.error(chalk.red("[ERROR] Execution failed:"), error.message);
    }
    throw error;
  }
}

/**
 * Handle call command - Smart tool routing
 * @param {string} prompt - Prompt to process
 * @param {Object} options - Command options
 */
async function handleCallCommand(prompt, options = {}) {
  try {
    if (!prompt) {
      console.log(chalk.red('[ERROR] Usage: stigmergy call "<prompt>"'));
      console.log(chalk.blue("\n💡 Examples:"));
      console.log(
        chalk.gray(
          '  • stigmergy call "Write a Python function to sort a list"',
        ),
      );
      console.log(
        chalk.gray(
          '  • stigmergy call "Create a React component with TypeScript"',
        ),
      );
      console.log(
        chalk.gray('  • stigmergy call "Help me debug this JavaScript code"'),
      );
      console.log(
        chalk.gray('\n  • stigmergy call -i "Start interactive session"'),
      );
      console.log(chalk.gray('  • stigmergy call --print "Quick answer"'));
      return { success: false, error: "Prompt required" };
    }

    // Use smart router to determine which tool to use
    const router = new SmartRouter();
    await router.initialize();
    const route = await router.smartRoute(prompt);

    console.log(chalk.blue(`[CALL] Routing to ${route.tool}: ${route.prompt}`));

    // Use enhanced execution with parameter handling and mode detection
    await executeSmartRoutedCommand(route, {
      verbose: options.verbose || process.env.DEBUG === "true",
      maxRetries: options.maxRetries || 3,
      interactive: options.interactive,
      print: options.print,
    });

    return { success: true, tool: route.tool };
  } catch (error) {
    console.error(chalk.red("[ERROR] Call command failed:"), error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleUpgradeCommand,
  handleDeployCommand,
  handleInitCommand,
  handleSetupCommand,
  handleCallCommand,
};
