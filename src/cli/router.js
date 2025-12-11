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
const UpgradeManager = require('../core/upgrade_manager');
const { maxOfTwo, isAuthenticated } = require('../utils/helpers');

// Set up global error handlers using our error handler module
const { setupGlobalErrorHandlers } = require('../core/error_handler');
setupGlobalErrorHandlers();

// Helper function to format bytes
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

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
    console.log('  upgrade         Upgrade all CLI tools to latest versions');
    console.log(
      '  deploy          Deploy hooks and integration to installed tools',
    );
    console.log('  setup           Complete setup and configuration');
    console.log(
      '  init            Initialize Stigmergy configuration (alias for setup)',
    );
    console.log('  clean (c)       Clean temporary files and caches');
    console.log('  diagnostic (d)  Show system diagnostic information');
    
    console.log('  fibonacci <n>   Calculate the nth Fibonacci number');
    console.log('  fibonacci seq <n> Generate the first n Fibonacci numbers');
    console.log('  errors          Display error report and statistics');
    console.log('');
    console.log('[QUICK START] Getting Started:');
    console.log('  1. npm install -g stigmergy      # Install Stigmergy (auto-cleans cache)');
    console.log('  2. stigmergy d                    # System diagnostic');
    console.log('  3. stigmergy inst                 # Install missing AI CLI tools');
    console.log('  4. stigmergy deploy               # Deploy hooks for CLI integration');
    
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

  case 'upgrade': {
    try {
      console.log('[UPGRADE] Starting CLI tools upgrade process...');
      const upgrader = new UpgradeManager();
      await upgrader.initialize();

      // 解析命令行选项
      const upgradeArgs = args.slice(1);
      const options = {
        dryRun: upgradeArgs.includes('--dry-run'),
        force: upgradeArgs.includes('--force'),
        verbose: upgradeArgs.includes('--verbose'),
        diagnose: upgradeArgs.includes('--diagnose'),
        suggest: upgradeArgs.includes('--suggest')
      };

      if (options.diagnose) {
        console.log('\n🔍 DIAGNOSTIC MODE - Checking for issues...\n');
        const deprecations = await upgrader.checkDeprecations();

        if (deprecations.length === 0) {
          console.log('✅ No issues detected.');
        } else {
          console.log('❌ Issues found:');
          deprecations.forEach((dep, index) => {
            console.log(`\n${index + 1}. ${dep.type || 'Unknown'}`);
            if (dep.dependency) console.log(`   Dependency: ${dep.dependency}`);
            console.log(`   Issues: ${dep.issues.join(', ')}`);
          });
        }
        break;
      }

      if (options.suggest) {
        console.log('\n💡 SUGGESTION MODE - Generating recommendations...\n');
        const plan = await upgrader.generateUpgradePlan(options);

        console.log('📋 Recommendations:');
        if (plan.upgrades.length > 0) {
          console.log('\n🔺 Available Upgrades:');
          plan.upgrades.forEach(upgrade => {
            console.log(`  • ${upgrade.tool}: ${upgrade.from} → ${upgrade.to}`);
          });
        }

        if (plan.fixes.length > 0) {
          console.log('\n🔧 Recommended Fixes:');
          plan.fixes.forEach(fix => {
            console.log(`  • ${fix.type}: ${fix.description}`);
          });
        }

        if (plan.upgrades.length === 0 && plan.fixes.length === 0) {
          console.log('✅ Everything is up to date!');
        }
        break;
      }

      // 生成升级计划
      console.log('\n📋 Generating upgrade plan...\n');
      const plan = await upgrader.generateUpgradePlan(options);

      // 显示计划
      console.log('📊 UPGRADE PLAN');
      console.log('='.repeat(50));

      if (plan.upgrades.length > 0) {
        console.log('\n🔺 CLI Tool Upgrades:');
        plan.upgrades.forEach(upgrade => {
          console.log(`  • ${upgrade.tool.padEnd(12)} ${upgrade.from} → ${upgrade.to}`);
        });
      } else {
        console.log('\n✅ All CLI tools are up to date');
      }

      if (plan.fixes.length > 0) {
        console.log('\n🔧 Issues to Fix:');
        plan.fixes.forEach(fix => {
          console.log(`  • ${fix.type}: ${fix.description}`);
        });
      }

      if (plan.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        plan.warnings.forEach(warning => {
          console.log(`  • ${warning.tool || 'Unknown'}: ${warning.error}`);
        });
      }

      if (options.dryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made');
        console.log('   Use --force to execute the upgrade plan');
        break;
      }

      // 确认执行
      if (!options.force) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to proceed with this upgrade plan?',
          default: false
        }]);

        if (!confirm) {
          console.log('\n❌ Upgrade cancelled by user');
          break;
        }
      }

      // 执行升级
      console.log('\n🚀 Executing upgrade plan...\n');
      const results = await upgrader.executeUpgrade(plan, options);

      // 显示结果
      console.log('\n📊 UPGRADE RESULTS');
      console.log('='.repeat(50));

      if (results.successful.length > 0) {
        console.log(`\n✅ Successful (${results.successful.length}):`);
        results.successful.forEach(result => {
          const name = result.tool || result.type;
          console.log(`  • ${name}`);
        });
      }

      if (results.failed.length > 0) {
        console.log(`\n❌ Failed (${results.failed.length}):`);
        results.failed.forEach(result => {
          const name = result.tool || result.type;
          console.log(`  • ${name}: ${result.error}`);
        });
      }

      // 记录日志
      await upgrader.logUpgrade(plan, results);

      console.log('\n🎉 Upgrade process completed!');

    } catch (error) {
      console.error('[ERROR] Upgrade failed:', error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
    break;
  }

  case 'install':
  case 'inst':
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

  

  case 'auto-install':
    // Auto-install mode for npm postinstall - NON-INTERACTIVE
    // Force immediate output visibility during npm install
    console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
    console.log('='.repeat(60));

    // Force stdout flush to ensure visibility during npm install
    if (process.stdout && process.stdout.write) {
      process.stdout.write('');
      if (process.stdout.flush) {
        process.stdout.flush();
      }
    }

    // Add a small delay to ensure output is visible
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Step 1: Download required assets
      try {
        console.log('[STEP] Downloading required assets...');
        // Force flush to ensure visibility
        if (process.stdout.flush) process.stdout.flush();

        await installer.downloadRequiredAssets();
        console.log('[OK] Assets downloaded successfully');
        if (process.stdout.flush) process.stdout.flush();
      } catch (error) {
        console.log(`[WARN] Failed to download assets: ${error.message}`);
        console.log('[INFO] Continuing with installation...');
        if (process.stdout.flush) process.stdout.flush();
      }

      // Step 2: Scan for CLI tools
      let autoAvailable = {},
        autoMissing = {};
      try {
        console.log('[STEP] Scanning for CLI tools...');
        if (process.stdout.flush) process.stdout.flush();

        const scanResult = await installer.scanCLI();
        autoAvailable = scanResult.available;
        autoMissing = scanResult.missing;
        console.log('[OK] CLI tools scanned successfully');
        if (process.stdout.flush) process.stdout.flush();
      } catch (error) {
        console.log(`[WARN] Failed to scan CLI tools: ${error.message}`);
        console.log('[INFO] Continuing with installation...');
        if (process.stdout.flush) process.stdout.flush();
      }

      // Step 4: Show usage instructions using existing scan results
      try {
        console.log('\n' + '='.repeat(60));
        console.log('[SUCCESS] Stigmergy CLI installation completed!');
        console.log('='.repeat(60));

        console.log(`\n[SCAN RESULT] Found ${Object.keys(autoAvailable).length} available AI CLI tools:`);

        if (Object.keys(autoAvailable).length > 0) {
          for (const [toolName, toolInfo] of Object.entries(autoAvailable)) {
            const status = toolInfo.installed ? '✓ Installed' : '✗ Not Installed';
            console.log(`  ✓ ${toolInfo.name} (${toolName}) - ${status}`);
            if (toolInfo.path) {
              console.log(`    Path: ${toolInfo.path}`);
            }
            if (toolInfo.version) {
              console.log(`    Version: ${toolInfo.version}`);
            }
          }
        } else {
          console.log('  [INFO] No AI CLI tools found on your system');
        }

        if (Object.keys(autoMissing).length > 0) {
          console.log(`\n[MISSING] ${Object.keys(autoMissing).length} tools not found:`);
          for (const [toolName, toolInfo] of Object.entries(autoMissing)) {
            console.log(`  ✗ ${toolInfo.name} (${toolName})`);
            console.log(`    Install with: ${toolInfo.installCommand}`);
          }
          console.log('\n[INFO] You can install missing tools with: stigmergy install');
        }

        console.log('\n[USAGE] Get started with these commands:');
        console.log('  stigmergy d        - System diagnostic (recommended first)');
        console.log('  stigmergy inst     - Install missing CLI tools');
        console.log('  stigmergy deploy   - Deploy hooks for CLI integration');
        console.log('  stigmergy c        - Clean caches if needed');
        console.log('\n[INFO] Stigmergy CLI enables collaboration between multiple AI CLI tools!');
        console.log('[INFO] Try "stigmergy" to see all available commands and abbreviations.');

      } catch (error) {
        console.log(`[WARN] Failed to show usage instructions: ${error.message}`);
        if (process.stdout.flush) process.stdout.flush();
      }

      // Step 4: Deploy hooks to available CLI tools (with Linux-specific error handling)
      try {
        console.log('[STEP] Deploying hooks to available CLI tools...');
        if (process.stdout.flush) process.stdout.flush();

        await installer.deployHooks(autoAvailable);
        console.log('[OK] Hooks deployed successfully');
        if (process.stdout.flush) process.stdout.flush();
      } catch (error) {
        // Linux-specific error handling
        const errorMessage = error.message || error.toString();
        console.log(`[ERROR] Failed to deploy hooks: ${errorMessage}`);

        if (process.platform === 'linux') {
          if (errorMessage.includes('EACCES') || errorMessage.includes('permission')) {
            console.log('[LINUX-INFO] Permission denied. This may be normal if hooks are being placed in system directories.');
            console.log('[LINUX-INFO] You can try running with sudo or check directory permissions.');
          } else if (errorMessage.includes('ENOENT') || errorMessage.includes('no such file')) {
            console.log('[LINUX-INFO] Some directories do not exist. This is normal for tools that are not installed.');
          } else if (errorMessage.includes('EPERM')) {
            console.log('[LINUX-INFO] Operation not permitted. This may be due to filesystem permissions.');
          }
        }

        console.log('[INFO] You can manually deploy hooks later by running: stigmergy deploy');
        if (process.stdout.flush) process.stdout.flush();
      }

      // Step 5: Deploy project documentation
      try {
        console.log('[STEP] Deploying project documentation...');
        if (process.stdout.flush) process.stdout.flush();

        await installer.deployProjectDocumentation();
        console.log('[OK] Documentation deployed successfully');
        if (process.stdout.flush) process.stdout.flush();
      } catch (error) {
        console.log(
          `[WARN] Failed to deploy documentation: ${error.message}`,
        );
        console.log('[INFO] Continuing with installation...');
        if (process.stdout.flush) process.stdout.flush();
      }

      // Step 6: Initialize configuration
      try {
        console.log('[STEP] Initializing configuration...');
        if (process.stdout.flush) process.stdout.flush();

        await installer.initializeConfig();
        console.log('[OK] Configuration initialized successfully');
        if (process.stdout.flush) process.stdout.flush();
      } catch (error) {
        console.log(
          `[ERROR] Failed to initialize configuration: ${error.message}`,
        );
        console.log(
          '[INFO] You can manually initialize configuration later by running: stigmergy setup',
        );
        if (process.stdout.flush) process.stdout.flush();
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

      // Force final flush to ensure all output is visible
      if (process.stdout.flush) process.stdout.flush();
      if (process.stderr.flush) process.stderr.flush();
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

  case 'clean':
  case 'c': {
    try {
      console.log('[CLEAN] Starting intelligent cache cleaning...\n');

      // Import our enhanced cache cleaner
      const CacheCleaner = require('../core/cache_cleaner');
      const cleaner = new CacheCleaner({
        dryRun: false,
        force: true,
        verbose: true,
        preserveRecent: 60 * 60 * 1000 // Preserve files from last hour
      });

      // Show options if arguments provided
      if (args.includes('--dry-run')) {
        console.log('[DRY RUN] Preview mode - no files will be deleted\n');
        await cleaner.cleanAllCaches({
          cleanStigmergy: args.includes('--stigmergy') || args.includes('--all'),
          cleanNPX: args.includes('--npx') || args.includes('--all'),
          cleanNPM: args.includes('--npm') || args.includes('--all'),
          cleanCLI: args.includes('--cli') || args.includes('--all'),
          cleanTemp: true // Always clean temp files
        });
        break;
      }

      // Default clean: safe options
      console.log('[OPTIONS] Running safe cache cleaning...');
      console.log('[INFO] This will remove temporary files and NPX cache only\n');

      const results = await cleaner.cleanAllCaches({
        cleanStigmergy: false,  // Don't clean main config
        cleanNPX: true,          // Clean NPX cache (safe)
        cleanNPM: false,         // Don't clean NPM cache during normal run
        cleanCLI: false,         // Don't clean CLI configs during normal run
        cleanTemp: true          // Clean temporary files (always safe)
      });

      console.log('\n[SUMMARY] Cache cleaning completed:');
      console.log(`  📄 Files removed: ${results.filesRemoved}`);
      console.log(`  📁 Directories removed: ${results.directoriesRemoved}`);
      console.log(`  💾 Space freed: ${formatBytes(results.bytesFreed)}`);

      if (results.errors.length > 0) {
        console.log(`\n⚠️  Warnings: ${results.errors.length} files couldn't be removed`);
      }

    } catch (error) {
      console.error('[ERROR] Cache cleaning failed:', error.message);
      process.exit(1);
    }
    break;
  }

  case 'diagnostic':
  case 'diag':
  case 'd': {
    try {
      console.log('[DIAGNOSTIC] Stigmergy CLI System Diagnostic...\n');

      // System information
      const packageJson = require('../../package.json');
      console.log(`📦 Stigmergy CLI v${packageJson.version}`);
      console.log(`🔧 Node.js: ${process.version}`);
      console.log(`💻 Platform: ${process.platform} (${process.arch})\n`);

      // Check cache cleaner availability
      try {
        const CacheCleaner = require('../core/cache_cleaner');
        const cleaner = new CacheCleaner({ dryRun: true });

        const plan = await cleaner.createInstallationPlan();
        console.log('🧹 Cache Analysis:');
        console.log(`  📊 Estimated space to clean: ${formatBytes(plan.estimatedSize)}`);
        console.log(`  🗂️  Temporary files detected: ${plan.files.length}`);
      } catch (error) {
        console.log('⚠️  Cache cleaner not available');
      }

      // CLI tools status
      try {
        const { available, missing } = await installer.scanCLI();
        console.log('\n🔧 CLI Tools Status:');
        console.log(`  ✅ Available: ${Object.keys(available).length}`);
        console.log(`  ❌ Missing: ${Object.keys(missing).length}`);

        if (Object.keys(missing).length > 0) {
          console.log('\nMissing Tools:');
          for (const [toolName, toolInfo] of Object.entries(missing)) {
            console.log(`  - ${toolInfo.name}`);
          }
        }
      } catch (error) {
        console.log('⚠️  CLI scan failed');
      }

      // Installation suggestions
      console.log('\n💡 Recommendations:');
      console.log('  • Run "stigmergy install" to install missing CLI tools');
      console.log('  • Run "stigmergy clean" to free up disk space');
      console.log('  • Run "stigmergy setup" for complete configuration');

      if (args.includes('--verbose')) {
        console.log('\n📋 Advanced Options:');
        console.log('  • stigmergy clean --all      - Clean all caches');
        console.log('  • stigmergy clean --dry-run - Preview cleaning');
        console.log('  • npm run uninstall        - Uninstall Stigmergy completely');
      }

    } catch (error) {
      console.error('[ERROR] Diagnostic failed:', error.message);
      process.exit(1);
    }
    break;
  }

  default:
    console.log(`[ERROR] Unknown command: ${command}`);
    console.log('[INFO] Run "stigmergy --help" for usage information');
    process.exit(1);
  }
}

module.exports = main;