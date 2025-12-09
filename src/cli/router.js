const path = require('path');
const os = require('os');
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const yaml = require('js-yaml');
const fs = require('fs/promises');
const fsSync = require('fs');

// Import our custom modules
const SmartRouter = require('../core/smart_router');
const CLIHelpAnalyzer = require('../core/cli_help_analyzer');
const { CLI_TOOLS } = require('../core/cli_tools');
const { errorHandler } = require('../core/error_handler');
const { executeCommand, executeJSFile } = require('../utils');
const { UserAuthenticator } = require('../auth');
const MemoryManager = require('../core/memory_manager');
const StigmergyInstaller = require('../core/installer');
const { maxOfTwo, isAuthenticated } = require('../utils/helpers');

// Set up global error handlers using our error handler module
const { setupGlobalErrorHandlers } = require('../core/error_handler');
setupGlobalErrorHandlers();

async function main() {
  const args = process.argv.slice(2);

  // Debug mode
  if (process.env.DEBUG === 'true') {
    console.log('[DEBUG] Main function called with args:', process.argv);
  }

  // Create instances
  const memory = new MemoryManager();
  const installer = new StigmergyInstaller();
  const router = new SmartRouter();

  // Handle help command early
  if (
    args.length === 0 ||
    args.includes('-h') ||
    args.includes('--help') ||
    args.includes('help')
  ) {
    console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
    console.log('=====================================================================');
    console.log('');
    console.log('Usage: stigmergy <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  help, --help     Show this help message');
    console.log('  version, --version Show version information');
    console.log('  status          Check CLI tools status');
    console.log('  scan            Scan for available AI CLI tools');
    console.log('  install         Auto-install missing CLI tools');
    console.log(
      '  deploy          Deploy hooks and integration to installed tools',
    );
    console.log('  setup           Complete setup and configuration');
    console.log(
      '  init            Initialize Stigmergy configuration (alias for setup)',
    );
    console.log('  call "<prompt>" Execute prompt with auto-routed AI CLI');
    console.log('  fibonacci <n>   Calculate the nth Fibonacci number');
    console.log('  fibonacci seq <n> Generate the first n Fibonacci numbers');
    console.log('  errors          Display error report and statistics');
    console.log('');
    console.log('[WORKFLOW] Automated Workflow:');
    console.log('  1. npm install -g stigmergy        # Install Stigmergy');
    console.log(
      '  2. stigmergy install             # Auto-scan & install CLI tools',
    );
    console.log('  3. stigmergy setup               # Deploy hooks & config');
    console.log('  4. stigmergy call "<prompt>"   # Start collaborating');
    console.log('');
    console.log(
      'For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents',
    );
    return;
  }

  const command = args[0];

  switch (command) {
  case 'version':
  case '--version': {
    // Use the version from package.json instead of hardcoding
    const packageJson = require('../../package.json');
    console.log(`Stigmergy CLI v${packageJson.version}`);
    break;
  }

  case 'errors':
    try {
      console.log('[ERRORS] Generating Stigmergy CLI error report...\n');
      await errorHandler.printErrorReport();
    } catch (error) {
      console.error(
        '[ERROR] Failed to generate error report:',
        error.message,
      );
      process.exit(1);
    }
    break;

  case 'init':
    // Alias for setup command
    console.log('[INIT] Initializing Stigmergy CLI...');
    // Fall through to setup case

  case 'setup':
    try {
      console.log('[SETUP] Starting complete Stigmergy setup...\n');

      // Step 1: Download required assets
      await installer.downloadRequiredAssets();

      // Step 2: Scan for CLI tools
      const { available: setupAvailable, missing: setupMissing } =
            await installer.scanCLI();
      const setupOptions = await installer.showInstallOptions(setupMissing);

      // Step 3: Install missing CLI tools if user chooses
      if (setupOptions.length > 0) {
        const selectedTools = await installer.getUserSelection(
          setupOptions,
          setupMissing,
        );
        if (selectedTools.length > 0) {
          console.log(
            '\n[INFO] Installing selected tools (this may take several minutes for tools that download binaries)...',
          );
          await installer.installTools(selectedTools, setupMissing);
        }
      } else {
        console.log('\n[INFO] All required tools are already installed!');
      }

      // Step 4: Deploy hooks to available CLI tools
      await installer.deployHooks(setupAvailable);

      // Step 5: Deploy project documentation
      await installer.deployProjectDocumentation();

      // Step 6: Initialize configuration
      await installer.initializeConfig();

      // Step 7: Show usage instructions
      installer.showUsageInstructions();
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.setup');
      console.log(`[ERROR] Setup failed: ${error.message}`);
      console.log('\n[TROUBLESHOOTING] To manually complete setup:');
      console.log('1. Run: stigmergy deploy   # Deploy hooks manually');
      console.log('2. Run: stigmergy setup    # Try setup again');
      process.exit(1);
    }
    break;

  case 'status':
    try {
      const { available, missing } = await installer.scanCLI();
      console.log('\n[STATUS] AI CLI Tools Status Report');
      console.log('=====================================');

      if (Object.keys(available).length > 0) {
        console.log('\n✅ Available Tools:');
        for (const [toolName, toolInfo] of Object.entries(available)) {
          console.log(`  - ${toolInfo.name} (${toolName})`);
        }
      }

      if (Object.keys(missing).length > 0) {
        console.log('\n❌ Missing Tools:');
        for (const [toolName, toolInfo] of Object.entries(missing)) {
          console.log(`  - ${toolInfo.name} (${toolName})`);
          console.log(`    Install command: ${toolInfo.install}`);
        }
      }

      console.log(
        `\n[SUMMARY] ${Object.keys(available).length} available, ${Object.keys(missing).length} missing`,
      );
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.status');
      console.log(`[ERROR] Failed to get status: ${error.message}`);
      process.exit(1);
    }
    break;

  case 'scan':
    try {
      await installer.scanCLI();
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.scan');
      console.log(`[ERROR] Failed to scan CLI tools: ${error.message}`);
      process.exit(1);
    }
    break;

  case 'install':
    try {
      console.log('[INSTALL] Starting AI CLI tools installation...');
      const { missing: missingTools } = await installer.scanCLI();
      const options = await installer.showInstallOptions(missingTools);

      if (options.length > 0) {
        const selectedTools = await installer.getUserSelection(
          options,
          missingTools,
        );
        if (selectedTools.length > 0) {
          console.log(
            '\n[INFO] Installing selected tools (this may take several minutes for tools that download binaries)...',
          );
          await installer.installTools(selectedTools, missingTools);
        }
      } else {
        console.log('\n[INFO] All required tools are already installed!');
      }
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.install');
      console.log(`[ERROR] Installation failed: ${error.message}`);
      process.exit(1);
    }
    break;

  case 'deploy':
    try {
      const { available: deployedTools } = await installer.scanCLI();
      await installer.deployHooks(deployedTools);
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.deploy');
      console.log(`[ERROR] Deployment failed: ${error.message}`);
      process.exit(1);
    }
    break;

  
  case 'fibonacci': {
    if (args.length < 2) {
      console.log('[ERROR] Please provide a number');
      console.log('Usage: stigmergy fibonacci <n>');
      console.log('Calculates the nth Fibonacci number or generates a sequence of n Fibonacci numbers');
      console.log('Examples:');
      console.log('  stigmergy fibonacci 10     # Calculates the 10th Fibonacci number');
      console.log('  stigmergy fibonacci seq 10 # Generates the first 10 Fibonacci numbers');
      process.exit(1);
    }

    const Calculator = require('../calculator');
    const calc = new Calculator();

    try {
      if (args[1] === 'seq' && args.length >= 3) {
        // Generate a sequence of Fibonacci numbers
        const n = parseInt(args[2]);
        if (isNaN(n)) {
          console.log('[ERROR] Invalid number provided');
          process.exit(1);
        }

        const sequence = calc.fibonacciSequence(n);
        console.log(`First ${n} Fibonacci numbers:`);
        console.log(sequence.join(', '));
      } else {
        // Calculate a single Fibonacci number
        const n = parseInt(args[1]);
        if (isNaN(n)) {
          console.log('[ERROR] Invalid number provided');
          process.exit(1);
        }

        const result = calc.fibonacci(n);
        console.log(`F(${n}) = ${result}`);
      }
    } catch (error) {
      console.log(`[ERROR] ${error.message}`);
      process.exit(1);
    }
    break;
  }

  case 'call': {
    if (args.length < 2) {
      console.log('[ERROR] Please provide a prompt');
      console.log('Usage: stigmergy call "<your prompt>"');
      process.exit(1);
    }

    // Extract prompt from quotes or join remaining args
    let prompt = '';
    if (args[1].startsWith('"') && args[args.length - 1].endsWith('"')) {
      // Quoted prompt
      prompt = args.slice(1).join(' ').slice(1, -1);
    } else {
      // Unquoted prompt
      prompt = args.slice(1).join(' ');
    }

    try {
      console.log(`[ROUTE] Analyzing prompt: ${prompt}`);

      // Route to appropriate AI CLI tool
      const route = await router.smartRoute(prompt);
      console.log(`[ROUTE] Selected tool: ${route.tool}`);

      // Prepare tool arguments
      let toolArgs = [];
      
      try {
        // Get CLI pattern for this tool
        const cliPattern = await router.analyzer.getCLIPattern(route.tool);

        // Use the unified CLI parameter handler
        const CLIParameterHandler = require('../core/cli_parameter_handler');
        toolArgs = CLIParameterHandler.generateArguments(
          route.tool,
          route.prompt,
          cliPattern,
        );
      } catch (patternError) {
        // Fallback to original logic if pattern analysis fails
        const CLIParameterHandler = require('../core/cli_parameter_handler');
        toolArgs = CLIParameterHandler.getToolSpecificArguments(route.tool, route.prompt);
      }
      
      const toolPath = route.tool;

      console.log(`[EXEC] Running: ${toolPath} ${toolArgs.join(' ')}`);

      // Execute the AI CLI tool
      const startTime = Date.now();
      try {
        const result = await executeCommand(toolPath, toolArgs);

        if (result.success) {
          console.log('[RESULT] Success!');
          console.log(result.output);

          // Save to memory
          await memory.addInteraction(route.tool, prompt, result.output);

          // Exit with the same code as the executed command
          process.exit(result.code || 0);
        }
      } catch (executionError) {
        const cliError = await errorHandler.handleCLIError(
          route.tool,
          executionError.error || executionError,
          toolArgs.join(' '),
        );

        // Provide clear ANSI English error message
        console.log('==================================================');
        console.log('ERROR: Failed to execute AI CLI tool');
        console.log('==================================================');
        console.log(`Tool: ${route.tool}`);
        console.log(`Error: ${cliError.message}`);
        if (executionError.stderr) {
          console.log(`Stderr: ${executionError.stderr}`);
        }
        console.log('');
        console.log('Possible solutions:');
        console.log('1. Check if the AI CLI tool is properly installed');
        console.log('2. Verify the tool is in your system PATH');
        console.log('3. Try reinstalling the tool with: stigmergy install');
        console.log('4. Run stigmergy status to check tool availability');
        console.log('');
        console.log('For manual execution, you can run:');
        console.log(`${toolPath} ${toolArgs.join(' ')}`);
        console.log('==================================================');

        process.exit(1);
      }
    } catch (error) {
      console.log(
        `[ERROR] Failed to route prompt:`,
        error.message,
      );
      process.exit(1);
    }
    break;
  }

  case 'auto-install':
    // Auto-install mode for npm postinstall - NON-INTERACTIVE
    console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
    console.log('='.repeat(60));

    try {
      // Step 1: Download required assets
      try {
        console.log('[STEP] Downloading required assets...');
        await installer.downloadRequiredAssets();
        console.log('[OK] Assets downloaded successfully');
      } catch (error) {
        console.log(`[WARN] Failed to download assets: ${error.message}`);
        console.log('[INFO] Continuing with installation...');
      }

      // Step 2: Scan for CLI tools
      let autoAvailable = {},
        autoMissing = {};
      try {
        console.log('[STEP] Scanning for CLI tools...');
        const scanResult = await installer.scanCLI();
        autoAvailable = scanResult.available;
        autoMissing = scanResult.missing;
        console.log('[OK] CLI tools scanned successfully');
      } catch (error) {
        console.log(`[WARN] Failed to scan CLI tools: ${error.message}`);
        console.log('[INFO] Continuing with installation...');
      }

      // Step 3: Show summary to user after installation
      try {
        if (Object.keys(autoMissing).length > 0) {
          console.log(
            '\n[INFO] Found ' +
                  Object.keys(autoMissing).length +
                  ' missing AI CLI tools:',
          );
          for (const [toolName, toolInfo] of Object.entries(autoMissing)) {
            console.log(`  - ${toolInfo.name} (${toolName})`);
          }
          console.log(
            '\n[INFO] Auto-install mode detected. Skipping automatic installation of missing tools.',
          );
          console.log(
            '[INFO] For full functionality, please run "stigmergy install" after installation completes.',
          );
        } else {
          console.log(
            '\n[INFO] All AI CLI tools are already installed! No additional tools required.',
          );
        }
      } catch (error) {
        console.log(`[WARN] Failed to show tool summary: ${error.message}`);
      }

      // Step 4: Deploy hooks to available CLI tools
      try {
        console.log('[STEP] Deploying hooks to available CLI tools...');
        await installer.deployHooks(autoAvailable);
        console.log('[OK] Hooks deployed successfully');
      } catch (error) {
        console.log(`[ERROR] Failed to deploy hooks: ${error.message}`);
        console.log(
          '[INFO] You can manually deploy hooks later by running: stigmergy deploy',
        );
      }

      // Step 5: Deploy project documentation
      try {
        console.log('[STEP] Deploying project documentation...');
        await installer.deployProjectDocumentation();
        console.log('[OK] Documentation deployed successfully');
      } catch (error) {
        console.log(
          `[WARN] Failed to deploy documentation: ${error.message}`,
        );
        console.log('[INFO] Continuing with installation...');
      }

      // Step 6: Initialize configuration
      try {
        console.log('[STEP] Initializing configuration...');
        await installer.initializeConfig();
        console.log('[OK] Configuration initialized successfully');
      } catch (error) {
        console.log(
          `[ERROR] Failed to initialize configuration: ${error.message}`,
        );
        console.log(
          '[INFO] You can manually initialize configuration later by running: stigmergy setup',
        );
      }

      // Step 7: Show final message to guide users
      console.log('\n[SUCCESS] Stigmergy CLI installed successfully!');
      console.log(
        '[USAGE] Run "stigmergy setup" to complete full configuration and install missing AI CLI tools.',
      );
      console.log(
        '[USAGE] Run "stigmergy install" to install only missing AI CLI tools.',
      );
      console.log(
        '[USAGE] Run "stigmergy --help" to see all available commands.',
      );
    } catch (fatalError) {
      await errorHandler.logError(fatalError, 'ERROR', 'main.auto-install');
      console.error(
        '[FATAL] Auto-install process failed:',
        fatalError.message,
      );
      console.log('\n[TROUBLESHOOTING] To manually complete installation:');
      console.log('1. Run: stigmergy setup    # Complete setup');
      console.log('2. Run: stigmergy install  # Install missing tools');
      console.log('3. Run: stigmergy deploy   # Deploy hooks manually');
      process.exit(1);
    }
    break;

  default:
    console.log(`[ERROR] Unknown command: ${command}`);
    console.log('[INFO] Run "stigmergy --help" for usage information');
    process.exit(1);
  }
}

module.exports = main;