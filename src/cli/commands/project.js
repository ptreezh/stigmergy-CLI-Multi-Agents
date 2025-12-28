/**
 * Project Commands
 * Modular implementation for init, setup, deploy, upgrade, call commands
 */

const chalk = require('chalk');
const { handleStatusCommand } = require('./status');
const path = require('path');
const os = require('os');
const { getCLIPath, setupCLIPaths } = require('../../core/cli_tools');
const SmartRouter = require('../../core/smart_router');
const EnhancedCLIInstaller = require('../../core/enhanced_cli_installer');
const StigmergyInstaller = require('../../core/installer');
const { executeCommand } = require('../../utils');
const LocalSkillScanner = require('../../core/local_skill_scanner');
const CLIHelpAnalyzer = require('../../core/cli_help_analyzer');
const { CLI_TOOLS } = require('../../core/cli_tools');
const { ensureSkillsCache } = require('../utils/skills_cache');

// Import execution mode detection and CLI adapters
const ExecutionModeDetector = require('../../core/execution_mode_detector');
const { CLIAdapterManager } = require('../../core/cli_adapters');

// Create instances
const modeDetector = new ExecutionModeDetector();
const cliAdapterManager = new CLIAdapterManager();

/**
 * Handle upgrade command
 * @param {Object} options - Command options
 */
async function handleUpgradeCommand(options = {}) {
  try {
    console.log(chalk.cyan('[UPGRADE] Starting AI CLI tools upgrade process...\n'));

    // Initialize or update skills/agents cache
    await ensureSkillsCache({ verbose: process.env.DEBUG === 'true' });

    const upgradeOptions = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || process.env.DEBUG === 'true'
    };

    // Use enhanced CLI installer for upgrade
    const enhancedInstaller = new EnhancedCLIInstaller({
      verbose: upgradeOptions.verbose,
      autoRetry: true,
      maxRetries: 2
    });

    // Get installed tools
    const installer = new StigmergyInstaller({ verbose: upgradeOptions.verbose });
    const { available: installedTools } = await installer.scanCLI();

    if (Object.keys(installedTools).length === 0) {
      console.log(chalk.yellow('[INFO] No CLI tools found to upgrade'));
      console.log(chalk.blue('💡 Run: stigmergy install to install CLI tools first'));
      return { success: true, upgraded: 0 };
    }

    console.log(chalk.blue(`[INFO] Found ${Object.keys(installedTools).length} CLI tools to upgrade`));

    if (upgradeOptions.dryRun) {
      console.log(chalk.yellow('[DRY RUN] Would upgrade the following tools:'));
      Object.keys(installedTools).forEach(tool => {
        console.log(`  • ${tool}`);
      });
      return { success: true, upgraded: Object.keys(installedTools).length };
    }

    // Perform upgrade
    console.log(chalk.blue('[INFO] Starting upgrade process...'));
    const toolsToUpgrade = Object.keys(installedTools);

    const upgradeResult = await enhancedInstaller.upgradeTools(toolsToUpgrade, installedTools);

    if (upgradeResult) {
      console.log(chalk.green(`\n✅ Successfully upgraded ${toolsToUpgrade.length} CLI tools!`));
      return { success: true, upgraded: toolsToUpgrade.length };
    } else {
      console.log(chalk.red('\n❌ Upgrade process encountered issues'));
      return { success: false, upgraded: 0 };
    }

  } catch (error) {
    console.error(chalk.red('[ERROR] Upgrade failed:'), error.message);
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
    console.log(chalk.cyan('[DEPLOY] Starting hook deployment...\n'));

    const installer = new StigmergyInstaller({ verbose: options.verbose });
    const { available: deployedTools } = await installer.scanCLI();

    if (Object.keys(deployedTools).length === 0) {
      console.log(chalk.yellow('[INFO] No CLI tools found for deployment'));
      console.log(chalk.blue('💡 Run: stigmergy install to install CLI tools first'));
      return { success: true, deployed: 0 };
    }

    console.log(chalk.blue(`[INFO] Deploying hooks for ${Object.keys(deployedTools).length} tools...`));

    await installer.deployHooks(deployedTools);

    console.log(chalk.green('\n✅ Hook deployment completed successfully!'));
    return { success: true, deployed: Object.keys(deployedTools).length };

  } catch (error) {
    console.error(chalk.red('[ERROR] Deployment failed:'), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle init command
 * @param {Object} options - Command options
 */
async function handleInitCommand(options = {}) {
  try {
    console.log(chalk.cyan('[INIT] Initializing Stigmergy project in current directory...\n'));

    // Initialize or update skills/agents cache
    await ensureSkillsCache({ verbose: true });

    // Quick path detection for better tool availability
    console.log(chalk.blue('[INIT] Detecting CLI tool paths...'));
    const pathSetup = await setupCLIPaths();

    console.log(`[INIT] CLI tool detection: ${pathSetup.report.summary.found}/${pathSetup.report.summary.total} tools found`);

    // Quick setup for basic project structure
    const projectDir = process.cwd();
    const stigmergyDir = path.join(projectDir, '.stigmergy');

    const fs = require('fs').promises;

    // Create .stigmergy directory
    await fs.mkdir(stigmergyDir, { recursive: true });

    // Create basic config
    const config = {
      version: '1.3.8',
      created: new Date().toISOString(),
      project: path.basename(projectDir)
    };

    await fs.writeFile(
      path.join(stigmergyDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log(chalk.green(`✅ Stigmergy project initialized in: ${projectDir}`));
    console.log(chalk.blue(`📁 Configuration created: ${stigmergyDir}/config.json`));
    console.log(chalk.gray('\n💡 Next steps:'));
    console.log(chalk.gray('  • stigmergy install    # Install CLI tools'));
    console.log(chalk.gray('  • stigmergy deploy     # Deploy integration hooks'));
    console.log(chalk.gray('  • stigmergy status     # Check tool status'));

    if (pathSetup.report.summary.missing > 0) {
      console.log(chalk.gray('\n💡 For full CLI integration, run:'));
      console.log(chalk.gray('  • stigmergy setup  # Complete setup with PATH configuration'));
    }

    return { success: true, projectDir };

  } catch (error) {
    console.error(chalk.red('[ERROR] Initialization failed:'), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle setup command
 * @param {Object} options - Command options
 */
async function handleSetupCommand(options = {}) {
  try {
    console.log(chalk.cyan('[SETUP] Starting complete Stigmergy setup...\n'));

    // Initialize or update skills/agents cache (explicit call, will also be called in init)
    await ensureSkillsCache({ verbose: true });

    // Step 0: Setup CLI paths detection and configuration
    console.log(chalk.blue('[STEP 0] Setting up CLI path detection...'));
    const pathSetup = await setupCLIPaths();

    console.log(`[PATH] Path detection complete:`);
    console.log(`  - Found: ${pathSetup.report.summary.found} CLI tools`);
    console.log(`  - Missing: ${pathSetup.report.summary.missing} CLI tools`);

    if (pathSetup.pathStatus.updated) {
      console.log(chalk.green('\n[PATH] ✓ All npm global directories are now available in PATH'));
      console.log(chalk.gray('[PATH] CLI tools will be globally accessible after terminal restart'));
    } else {
      console.log(chalk.yellow('\n[PATH] ⚠️ PATH update failed:'));
      console.log(chalk.gray(`  Error: ${pathSetup.pathStatus.message}`));
      console.log(chalk.gray('\n[PATH] Manual update required:'));
      console.log(chalk.gray('  Run the generated scripts to update PATH:'));
      if (pathSetup.pathStatus.scriptPath) {
        console.log(chalk.gray(`  - Script directory: ${pathSetup.pathStatus.scriptPath}`));
      }
      console.log(chalk.gray('  - Windows: Run PowerShell as Administrator and execute the scripts'));
      console.log(chalk.gray('  - Unix/Linux: Source the shell script (source update-path.sh)'));
    }

    // Initialize project (will call ensureSkillsCache again, that's ok)
    await handleInitCommand({ verbose: options.verbose });

    // Install CLI tools
    const installer = new StigmergyInstaller({ verbose: options.verbose });
    const { available: setupAvailable, missing: setupMissing } = await installer.scanCLI();

    if (Object.keys(setupMissing).length > 0) {
      console.log(chalk.yellow('\n[STEP 1] Missing tools found:'));
      for (const [toolName, toolInfo] of Object.entries(setupMissing)) {
        console.log(`  - ${toolInfo.name}: ${toolInfo.install}`);
      }

      console.log(chalk.blue('\n[INFO] To install missing tools, run:'));
      for (const [toolName, toolInfo] of Object.entries(setupMissing)) {
        console.log(`  ${toolInfo.install}`);
      }
    } else {
      console.log(chalk.green('\n[STEP 1] All required tools are already installed!'));
    }

    // Deploy hooks to available CLI tools
    if (Object.keys(setupAvailable).length > 0) {
      console.log(chalk.blue('\n[STEP 2] Deploying hooks to available tools...'));
      await installer.deployHooks(setupAvailable);
    } else {
      console.log(chalk.yellow('\n[STEP 2] No tools available for hook deployment'));
    }

    // Verify setup
    console.log(chalk.blue('\n[STEP 3] Verifying installation...'));
    await handleStatusCommand({ verbose: false });

    console.log(chalk.green('\n🎉 Setup completed successfully!'));
    console.log(chalk.blue('\n[USAGE] Get started with these commands:'));
    console.log(chalk.gray('  stigmergy d        - System diagnostic (recommended first)'));
    console.log(chalk.gray('  stigmergy inst     - Install missing AI CLI tools'));
    console.log(chalk.gray('  stigmergy deploy   - Deploy hooks to installed tools'));
    console.log(chalk.gray('  stigmergy call     - Execute prompts with auto-routing'));

    return { success: true };

  } catch (error) {
    console.error(chalk.red('[ERROR] Setup failed:'), error.message);
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
  if (toolName === 'qwen') {
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
      if (toolName === 'qwen' && process.env.QWEN_ACCESS_TOKEN) {
        return [...args, '--access-token', process.env.QWEN_ACCESS_TOKEN];
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
      verbose
    });

    const modeDescription = modeDetector.getModeDescription(mode);
    if (verbose) {
      console.log(chalk.gray(`[MODE] ${modeDescription}`));
    }

    // Get adapted arguments for the tool and mode
    let toolArgs = cliAdapterManager.getArguments(route.tool, mode, route.prompt);

    // Add OAuth authentication if needed
    toolArgs = addOAuthAuthArgs(route.tool, toolArgs);

    // Use enhanced parameter handling for one-time mode only
    if (mode === 'one-time') {
      try {
        const EnhancedCLIParameterHandler = require('../../core/enhanced_cli_parameter_handler');
        const paramHandler = new EnhancedCLIParameterHandler();

        // Generate optimized arguments with agent/skill support
        // Add timeout protection for parameter generation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Parameter generation timeout')), 30000); // 30 second timeout for parameter generation
        });

        const paramPromise = paramHandler.generateArgumentsWithRetry(
          route.tool,
          route.prompt,
          {
            maxRetries,
            enableAgentSkillOptimization: true
          }
        );

        const paramResult = await Promise.race([paramPromise, timeoutPromise]);

        toolArgs = paramResult.arguments;

        // Re-add OAuth authentication (paramResult might overwrite)
        toolArgs = addOAuthAuthArgs(route.tool, toolArgs);

        if (verbose) {
          console.log(chalk.gray(`[DEBUG] Generated args: ${toolArgs.join(' ')}`));
        }
      } catch (paramError) {
        console.log(chalk.yellow(`[WARN] Parameter generation failed: ${paramError.message}, using basic arguments`));
        // Fallback to basic arguments if enhanced parameter generation fails
        if (verbose) {
          console.log(chalk.gray(`[DEBUG] Falling back to basic args: ${toolArgs.join(' ')}`));
        }
      }
    } else {
      if (verbose) {
        console.log(chalk.gray(`[DEBUG] Adapted args: ${toolArgs.join(' ')}`));
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
      console.log(chalk.gray(`[DEBUG] Executing: ${toolPath} ${toolArgs.join(' ')}`));
      console.log(chalk.gray(`[DEBUG] Working directory: ${cwd}`));
      console.log(chalk.gray(`[DEBUG] Mode: ${mode}`));
    }

    console.log(chalk.gray(`[EXEC] ${route.tool}: ${route.prompt}`)); // Add this to match direct command format

    // Execute the command
    // For interactive mode, we need stdio: 'inherit' to allow user interaction
    // For one-time mode, we should use 'inherit' to ensure CLI tools can properly execute
    const stdioOption = mode === 'interactive' ? 'inherit' : 'inherit'; // Use 'inherit' for both modes to ensure proper CLI execution

    console.log(chalk.gray(`[DEBUG] About to execute command with args: ${toolArgs.join(' ')}`)); // Debug log
    console.log(chalk.gray(`[DEBUG] Using stdio option: ${stdioOption}`)); // Debug log
    const result = await executeCommand(toolPath, toolArgs, {
      stdio: stdioOption,
      shell: true,
      cwd,
      env,
      timeout: 300000 // 5 minutes
    });
    console.log(chalk.gray(`[DEBUG] Command execution completed`)); // Debug log

    return { success: true, tool: route.tool, result, mode };

  } catch (error) {
    if (verbose) {
      console.error(chalk.red('[ERROR] Execution failed:'), error.message);
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
      console.log(chalk.blue('\n💡 Examples:'));
      console.log(chalk.gray('  • stigmergy call "Write a Python function to sort a list"'));
      console.log(chalk.gray('  • stigmergy call "Create a React component with TypeScript"'));
      console.log(chalk.gray('  • stigmergy call "Help me debug this JavaScript code"'));
      console.log(chalk.gray('\n  • stigmergy call -i "Start interactive session"'));
      console.log(chalk.gray('  • stigmergy call --print "Quick answer"'));
      return { success: false, error: 'Prompt required' };
    }

    // Use smart router to determine which tool to use
    const router = new SmartRouter();
    await router.initialize();
    const route = await router.smartRoute(prompt);

    console.log(chalk.blue(`[CALL] Routing to ${route.tool}: ${route.prompt}`));

    // Use enhanced execution with parameter handling and mode detection
    await executeSmartRoutedCommand(route, {
      verbose: options.verbose || process.env.DEBUG === 'true',
      maxRetries: options.maxRetries || 3,
      interactive: options.interactive,
      print: options.print
    });

    return { success: true, tool: route.tool };

  } catch (error) {
    console.error(chalk.red('[ERROR] Call command failed:'), error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleUpgradeCommand,
  handleDeployCommand,
  handleInitCommand,
  handleSetupCommand,
  handleCallCommand
};