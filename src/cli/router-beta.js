#!/usr/bin/env node

/**
 * Stigmergy CLI - Modular Router
 * Multi-Agents Cross-AI CLI Tools Collaboration System
 * Modular implementation with separated concerns
 * Version: 2.0.0
 */

// Core imports
const path = require('path');
const os = require('os');
const { Command } = require('commander');
const chalk = require('chalk');

// Import CLI tools configuration
const { CLI_TOOLS } = require('../core/cli_tools');

// Import modular components
const { formatBytes } = require('./utils/formatters');
const { getWorkingDirectoryForTool, getEnvironmentForTool } = require('./utils/environment');

// Import execution mode detection and CLI adapters
const ExecutionModeDetector = require('../core/execution_mode_detector');
const { CLIAdapterManager } = require('../core/cli_adapters');

// Create instances
const modeDetector = new ExecutionModeDetector();
const cliAdapterManager = new CLIAdapterManager();
const { handleInstallCommand } = require('./commands/install');
const { handleStatusCommand } = require('./commands/status');
const { handleScanCommand } = require('./commands/scan');
const { handlePermCheckCommand, handleFixPermsCommand } = require('./commands/permissions');
const { handleDiagnosticCommand, handleCleanCommand } = require('./commands/system');
const { handleSkillMainCommand, printSkillsHelp } = require('./commands/skills');
const { handleErrorsCommand } = require('./commands/errors');
const { handleAutoInstallCommand } = require('./commands/autoinstall');
const { handleResumeCommand, printResumeHelp } = require('./commands/stigmergy-resume');
const { getCLIPath } = require('../core/cli_tools');
const {
  handleUpgradeCommand,
  handleDeployCommand,
  handleInitCommand,
  handleSetupCommand,
  handleCallCommand
} = require('./commands/project');
const SmartRouter = require('../core/smart_router');
const { errorHandler } = require('../core/error_handler');
const { executeCommand } = require('../utils');
const { setupGlobalErrorHandlers } = require('../core/error_handler');

// Set up global error handlers
setupGlobalErrorHandlers();

/**
 * Add OAuth authentication arguments to command
 * @param {Command} command - Commander command instance
 * @returns {Command} Command with OAuth args added
 */
function addOAuthAuthArgsCommand(command) {
  return command
    .option('--client-id <id>', 'OAuth client ID')
    .option('--client-secret <secret>', 'OAuth client secret')
    .option('--access-token <token>', 'OAuth access token')
    .option('--auth-url <url>', 'OAuth authentication URL');
}

/**
 * Add OAuth authentication arguments to command args for execution
 * @param {string} toolName - Name of the CLI tool
 * @param {Array} args - Current arguments array
 * @returns {Array} Arguments with OAuth auth added
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
 * Main CLI router function
 */
async function main() {
  const program = new Command();
  const packageJson = require('../../package.json');

  // Program setup
  program
    .version(packageJson.version)
    .description('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System')
    .name('stigmergy');

  // Version command (override the built-in --version)
  program
    .command('version')
    .description('Show version information')
    .action(() => {
      const packageJson = require('../../package.json');
      console.log(`Stigmergy CLI v${packageJson.version}`);
    });

  // Error reporting command
  program
    .command('errors')
    .description('Generate comprehensive error report')
    .option('--save', 'Save report to file')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleErrorsCommand(options);
    });

  // Install command
  program
    .command('install')
    .alias('inst')
    .alias('a')
    .description('Install CLI tools')
    .option('-c, --cli <cli>', 'Install specific CLI tool')
    .option('-v, --verbose', 'Verbose output')
    .option('-f, --force', 'Force installation')
    .option('--all', 'Install all CLI tools (ignore autoInstall filter)')
    .action(async (options) => {
      // 检测是否通过 'a' 别名调用，自动设置 --all 选项
      const commandName = process.argv[2];
      if (commandName === 'a') {
        options.all = true;
      }
      await handleInstallCommand(options);
    });

  // Project management commands
  program
    .command('upgrade')
    .description('Upgrade AI CLI tools to latest versions')
    .option('--dry-run', 'Show what would be upgraded without actually upgrading')
    .option('-f, --force', 'Force upgrade')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleUpgradeCommand(options);
    });

  program
    .command('deploy')
    .description('Deploy integration hooks to CLI tools')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleDeployCommand(options);
    });

  program
    .command('init')
    .description('Initialize Stigmergy project in current directory')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleInitCommand(options);
    });

  program
    .command('setup')
    .description('Complete Stigmergy setup (install + deploy + init)')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleSetupCommand(options);
    });

  program
    .command('call')
    .description('Smart AI tool routing based on prompt')
    .argument('<prompt>', 'Prompt to process with smart routing')
    .option('-i, --interactive', 'Run in interactive mode (continuous conversation)')
    .option('-p, --print', 'Run in one-time mode (print and exit)')
    .option('-v, --verbose', 'Verbose output')
    .action(async (prompt, options) => {
      await handleCallCommand(prompt, options);
    });

  // Status command
  program
    .command('status')
    .description('Check CLI tools status')
    .option('-c, --cli <cli>', 'Check status of specific CLI tool')
    .option('--json', 'Output in JSON format')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleStatusCommand(options);
    });

  // Scan command
  program
    .command('scan')
    .description('Scan for available CLI tools')
    .option('-d, --deep', 'Deep scan for CLI tools')
    .option('--json', 'Output in JSON format')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleScanCommand(options);
    });

  // Permission management commands
  program
    .command('fix-perms')
    .description('Fix directory permissions automatically')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleFixPermsCommand(options);
    });

  program
    .command('perm-check')
    .description('Check directory permissions')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handlePermCheckCommand(options);
    });

  // System commands
  program
    .command('clean')
    .alias('c')
    .description('Intelligent cache cleaning')
    .option('--dry-run', 'Show what would be cleaned without actually cleaning')
    .option('-q, --quiet', 'Suppress detailed output, show only summary')
    .option('-v, --verbose', 'Verbose output (show permission errors)')
    .action(async (options) => {
      await handleCleanCommand(options);
    });

  program
    .command('diagnostic')
    .aliases(['diag', 'd'])
    .description('System diagnostic')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleDiagnosticCommand(options);
    });

  // Skills management commands
  program
    .command('skill')
    .description('Skills management system')
    .argument('[subcommand]', 'Skill subcommand (install/list/read/validate/remove/sync)')
    .argument('[args...]', 'Additional arguments')
    .option('-v, --verbose', 'Verbose output')
    .option('-f, --force', 'Force operation')
    .option('--no-auto-sync', 'Disable auto-sync')
    .action(async (subcommand, args, options) => {
      if (!subcommand) {
        printSkillsHelp();
        return;
      }
      await handleSkillMainCommand(subcommand, args, options);
    });

  // Skill command aliases (shortcuts)
  program
    .command('skill-i')
    .description('Install a skill (alias for: skill install)')
    .argument('<source>', 'Skill source to install')
    .option('-v, --verbose', 'Verbose output')
    .action(async (source, options) => {
      await handleSkillMainCommand('install', [source], options);
    });

  program
    .command('skill-l')
    .description('List installed skills (alias for: skill list)')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
      await handleSkillMainCommand('list', [], options);
    });

  program
    .command('skill-r')
    .description('Read a skill (alias for: skill read)')
    .argument('<skill-name>', 'Name of skill to read')
    .option('-v, --verbose', 'Verbose output')
    .action(async (skillName, options) => {
      await handleSkillMainCommand('read', [skillName], options);
    });

  program
    .command('skill-v')
    .description('Validate/read skill (alias for: skill validate/read)')
    .argument('<path-or-name>', 'Path to validate or skill name to read')
    .option('-v, --verbose', 'Verbose output')
    .action(async (pathOrName, options) => {
      await handleSkillMainCommand('validate', [pathOrName], options);
    });

  program
    .command('skill-d')
    .description('Remove a skill (alias for: skill remove)')
    .argument('<skill-name>', 'Name of skill to remove')
    .option('-v, --verbose', 'Verbose output')
    .option('-f, --force', 'Force removal')
    .action(async (skillName, options) => {
      await handleSkillMainCommand('remove', [skillName], options);
    });

  program
    .command('skill-m')
    .description('Remove a skill (移除 alias for: skill remove)')
    .argument('<skill-name>', 'Name of skill to remove')
    .option('-v, --verbose', 'Verbose output')
    .option('-f, --force', 'Force removal')
    .action(async (skillName, options) => {
      await handleSkillMainCommand('remove', [skillName], options);
    });

  // Auto-install command (for npm postinstall)
  program
    .command('auto-install')
    .description('Automated installation for npm postinstall')
    .option('-v, --verbose', 'Verbose output')
    .option('-f, --force', 'Force installation')
    .action(async (options) => {
      await handleAutoInstallCommand(options);
    });

  // Resume session command
  program
    .command('resume')
    .description('Resume session - Cross-CLI session recovery and history management')
    .argument('[cli]', 'CLI tool to filter (claude, gemini, qwen, iflow, codebuddy, codex, qodercli)')
    .argument('[limit]', 'Maximum number of sessions to show')
    .option('-v, --verbose', 'Verbose output')
    .action(async (cli, limit, options) => {
      const args = [];
      if (cli) args.push(cli);
      if (limit) args.push(limit);
      await handleResumeCommand(args, options);
    });

  // Route commands to CLI tools
  for (const tool of ['claude', 'gemini', 'qwen', 'codebuddy', 'codex', 'iflow', 'qodercli', 'copilot']) {
    program
      .command(tool)
      .description(`Use ${tool} CLI tool`)
      .option('-i, --interactive', 'Run in interactive mode (continuous conversation)')
      .option('-p, --print', 'Run in one-time mode (print and exit)')
      .allowUnknownOption(true)
      .action(async (options, command) => {
        try {
          // Get the tool path directly (we know the tool name)
          const toolPath = await getCLIPath(tool);

          if (toolPath) {
            // Join args to form the prompt
            const prompt = command.args.join(' ');

            if (process.env.DEBUG === 'true') {
              console.log(`[DEBUG] Tool path: ${toolPath}`);
              console.log(`[DEBUG] Prompt: ${prompt}`);
            }

            // Detect execution mode
            const mode = modeDetector.detect({
              interactive: options.interactive,
              print: options.print,
              verbose: process.env.DEBUG === 'true'
            });

            const modeDescription = modeDetector.getModeDescription(mode);
            if (process.env.DEBUG === 'true' || options.interactive || options.print) {
              console.log(chalk.gray(`[MODE] ${modeDescription}`));
            }

            // Use CLI adapter to get appropriate arguments for the tool and mode
            const adaptedArgs = cliAdapterManager.getArguments(tool, mode, prompt);

            if (process.env.DEBUG === 'true') {
              console.log(`[DEBUG] Adapted args for ${tool} (${mode}): ${adaptedArgs.join(' ')}`);
            }

            // Use enhanced parameter handling for intelligent argument generation
            let toolArgs = adaptedArgs; // Start with adapted args

            try {
              if (process.env.DEBUG === 'true') {
                console.log('[DEBUG] Initializing parameter handler...');
              }
              const EnhancedCLIParameterHandler = require('../core/enhanced_cli_parameter_handler');
              const paramHandler = new EnhancedCLIParameterHandler();

              // Generate optimized arguments with agent/skill support
              // Skip for interactive mode to avoid double-processing
              if (mode === 'one-time') {
                const paramResult = await paramHandler.generateArgumentsWithRetry(
                  tool,
                  prompt,
                  {
                    maxRetries: 3,
                    enableAgentSkillOptimization: true
                  }
                );

                toolArgs = paramResult.arguments;

                if (process.env.DEBUG === 'true') {
                  console.log(`[DEBUG] Generated args: ${toolArgs.join(' ')}`);
                }
              }
            } catch (paramError) {
              // Fallback to adapted args if parameter handler fails
              if (process.env.DEBUG === 'true') {
                console.log(chalk.yellow(`[WARN] Parameter handler failed, using adapted args: ${paramError.message}`));
              }
            }

            // Add OAuth authentication if needed
            toolArgs = addOAuthAuthArgs(tool, toolArgs);

            console.log(chalk.gray(`[EXEC] ${tool}: ${prompt}`));

            // Set up environment for the tool
            const toolEnv = getEnvironmentForTool(tool);
            const workingDir = getWorkingDirectoryForTool(tool);

            const result = await executeCommand(toolPath, toolArgs, {
              stdio: 'inherit',
              shell: true,
              cwd: workingDir,
              env: toolEnv
            });

            if (!result.success) {
              console.log(chalk.yellow(`[WARN] ${tool} exited with code ${result.code}`));
            }
            process.exit(result.code || 0);
          } else {
            console.log(chalk.red(`[ERROR] Could not find ${tool}`));
            console.log(chalk.yellow('[INFO] Make sure the tool is installed: stigmergy install'));
            process.exit(1);
          }
        } catch (error) {
          if (process.env.DEBUG === 'true') {
            console.log(chalk.red(`[ERROR] Exception: ${error.message}`));
            console.log(chalk.red(error.stack));
          }
          const cliError = await errorHandler.handleCLIError(tool, error, command.args.join(' '));
          console.log(chalk.red(`[ERROR] Failed to execute ${tool}:`));
          console.log(chalk.red(cliError.message));
          process.exit(1);
        }
      });
    }

    // Add OAuth arguments for OAuth-enabled tools
    const oauthTools = ['gemini', 'claude']; // Tools that support OAuth
    oauthTools.forEach(tool => {
      const cmd = program.commands.find(c => c.name() === tool);
      if (cmd) {
        addOAuthAuthArgsCommand(cmd);
      }
    });

  // Parse command line arguments
  program.parse(process.argv);
}

module.exports = main;