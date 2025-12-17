#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
 * Unified Entry Point
 * International Version - Pure English & ANSI Only
 * Version: 1.0.94
 */

// Import all components
const path = require('path');
const os = require('os');
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const yaml = require('js-yaml');
const fs = require('fs/promises');
const fsSync = require('fs');
const { spawnSync } = require('child_process');

// Import permission management components
const DirectoryPermissionManager = require('../core/directory_permission_manager');
const { setupCLIPaths, getCLIPath } = require('../core/cli_tools');

// Import our custom modules
const SmartRouter = require('../core/smart_router');
const CLIHelpAnalyzer = require('../core/cli_help_analyzer');
const { CLI_TOOLS } = require('../core/cli_tools');
const { errorHandler } = require('../core/error_handler');
const { executeCommand, executeJSFile } = require('../utils');
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

// Helper function to get appropriate working directory for CLI tools
function getWorkingDirectoryForTool(toolName) {
  switch (toolName) {
    case 'qwen':
      // For Qwen CLI, use user home directory to avoid module resolution issues
      return os.homedir();
    case 'claude':
      // For Claude CLI, use user home directory
      return os.homedir();
    case 'gemini':
      // For Gemini CLI, use user home directory
      return os.homedir();
    case 'iflow':
      // For iFlow CLI, use user home directory
      return os.homedir();
    case 'qodercli':
      // For Qoder CLI, use user home directory
      return os.homedir();
    default:
      // For other tools, use current directory
      return process.cwd();
  }
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
    console.log('  install         Auto-install missing CLI tools (with permission fix)');
    console.log('  upgrade         Upgrade all CLI tools to latest versions');
    console.log(
      '  deploy          Deploy hooks and integration to installed tools',
    );
    console.log('  setup           Complete setup and configuration');
    console.log(
      '  init            Initialize Stigmergy project in current directory',
    );
    console.log('  clean (c)       Clean temporary files and caches');
    console.log('  diagnostic (d)  Show system diagnostic information');
    console.log('  fix-perms       Fix directory permissions for installation');
    console.log('  perm-check      Check current directory permissions');
    console.log('  skill <action>  Manage skills across CLIs (install/read/list/sync/remove)');
    console.log('    skill-i <src>   Install skills (shortcut for: skill install)');
    console.log('    skill-l         List skills (shortcut for: skill list)');
    console.log('    skill-r <name>  Read skill (shortcut for: skill read)');
    console.log('    skill-v <name>  View/validate skill (auto-detect read or validate)');
    console.log('    skill-d <name>  Delete/remove skill (shortcut for: skill remove)');
    console.log('    skill           Sync skills to all CLI configs (shortcut for: skill sync)');
    console.log('  call "<prompt>" Execute prompt with auto-routed AI CLI');
    console.log('  <tool> "<prompt>" Directly route to specific AI CLI tool');
    console.log('    Supported tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex');
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
    try {
      console.log('[INIT] Initializing Stigmergy project in current directory...\n');

      // Quick path detection for better tool availability
      console.log('[INIT] Detecting CLI tool paths...');
      const pathSetup = await setupCLIPaths();

      console.log(`[INIT] CLI tool detection: ${pathSetup.report.summary.found}/${pathSetup.report.summary.total} tools found`);

      // Initialize project files in current directory
      await installer.createProjectFiles();

      console.log('[INIT] Project initialization completed successfully!');
      console.log('\n[INFO] Created:');
      console.log('  - PROJECT_SPEC.json (project specification)');
      console.log('  - PROJECT_CONSTITUTION.md (collaboration guidelines)');
      console.log('  - CLI path detection cache in ~/.stigmergy/cli-paths/');

      if (pathSetup.report.summary.missing > 0) {
        console.log('\n[INFO] For full CLI integration, run:');
        console.log('  stigmergy setup  # Complete setup with PATH configuration');
      }
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.init');
      console.log(`[ERROR] Project initialization failed: ${error.message}`);
      process.exit(1);
    }
    break;

  case 'setup':
    try {
      console.log('[SETUP] Starting complete Stigmergy setup...\n');

      // Step 0: Setup CLI paths detection and configuration
      console.log('[STEP 0] Setting up CLI path detection...');
      const pathSetup = await setupCLIPaths();

      console.log(`[PATH] Path detection complete:`);
      console.log(`  - Found: ${pathSetup.report.summary.found} CLI tools`);
      console.log(`  - Missing: ${pathSetup.report.summary.missing} CLI tools`);

      if (pathSetup.pathStatus.updated) {
        console.log('\n[PATH] ✓ All npm global directories are now available in PATH');
        console.log('[PATH] CLI tools will be globally accessible after terminal restart');
      } else {
        console.log('\n[PATH] ⚠️ PATH update failed:');
        console.log(`  Error: ${pathSetup.pathStatus.message}`);
        console.log('\n[PATH] Manual update required:');
        console.log('  Run the generated scripts to update PATH:');
        if (pathSetup.pathStatus.scriptPath) {
          console.log(`  - Script directory: ${pathSetup.pathStatus.scriptPath}`);
        }
        console.log('  - Windows: Run PowerShell as Administrator and execute the scripts');
        console.log('  - Unix/Linux: Source the shell script (source update-path.sh)');
      }

      // Step 1: Scan for CLI tools
      console.log('\n[STEP 1] Scanning for AI CLI tools...');
      const { available: setupAvailable, missing: setupMissing } =
            await installer.scanCLI();
      
      // Step 2: Install missing CLI tools
      if (Object.keys(setupMissing).length > 0) {
        console.log('\n[STEP 2] Installing missing tools...');
        console.log('[INFO] Missing tools found:');
        for (const [toolName, toolInfo] of Object.entries(setupMissing)) {
          console.log(`  - ${toolInfo.name}: ${toolInfo.install}`);
        }
        
        console.log('\n[INFO] To install missing tools, run:');
        for (const [toolName, toolInfo] of Object.entries(setupMissing)) {
          console.log(`  ${toolInfo.install}`);
        }
        
        console.log('\n[INFO] Or use the enhanced installer:');
        console.log('  node src/core/enhanced_installer.js');
      } else {
        console.log('\n[STEP 2] All required tools are already installed!');
      }

      // Step 3: Deploy hooks to available CLI tools
      if (Object.keys(setupAvailable).length > 0) {
        console.log('\n[STEP 3] Deploying hooks to available tools...');
        await installer.deployHooks(setupAvailable);
      } else {
        console.log('\n[STEP 3] No tools available for hook deployment');
      }

      console.log('\n🎉 Setup completed successfully!');
      console.log('\n[USAGE] Get started with these commands:');
      console.log('  stigmergy d        - System diagnostic (recommended first)');
      console.log('  stigmergy inst     - Install missing AI CLI tools');
      console.log('  stigmergy deploy   - Deploy hooks to installed tools');
      console.log('  stigmergy call     - Execute prompts with auto-routing');
      
    } catch (error) {
      console.error('[ERROR] Setup failed:', error.message);
      if (process.env.DEBUG === 'true') {
        console.error(error.stack);
      }
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
      console.log('[UPGRADE] Starting AI CLI tools upgrade process...\n');
      
      // 解析命令行选项
      const upgradeArgs = args.slice(1);
      const options = {
        dryRun: upgradeArgs.includes('--dry-run'),
        force: upgradeArgs.includes('--force'),
        verbose: upgradeArgs.includes('--verbose')
      };
      
      // 使用EnhancedCLIInstaller进行升级
      const EnhancedCLIInstaller = require(path.resolve(__dirname, '../core/enhanced_cli_installer'));
      const enhancedInstaller = new EnhancedCLIInstaller({
        verbose: process.env.DEBUG === 'true' || options.verbose,
        autoRetry: true,
        maxRetries: 2
      });

      // 获取已安装的工具列表 - 使用全局installer扫描
      const { available: installedTools } = await installer.scanCLI();

      if (Object.keys(installedTools).length === 0) {
        console.log('[INFO] No AI CLI tools found. Please install tools first with: stigmergy install');
        break;
      }

      console.log(`[INFO] Found ${Object.keys(installedTools).length} installed AI CLI tools:`);
      for (const [toolName, toolInfo] of Object.entries(installedTools)) {
        console.log(`  - ${toolInfo.name} (${toolName})`);
      }

      if (options.dryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made');
        console.log('   Use --force to execute the upgrade');
        break;
      }

      // 默认直接执行升级，无需用户确认
      console.log(`\n[UPGRADE] Upgrading ${Object.keys(installedTools).length} AI CLI tools...`);
      console.log('[INFO] Use --dry-run to preview upgrades without executing');

      console.log('\n🚀 Upgrading AI CLI tools with automatic permission handling...\n');

      // 批量升级所有工具，一次权限检测
      console.log(`[INFO] Starting batch upgrade of ${Object.keys(installedTools).length} tools...`);

      const upgradeToolInfos = {};
      for (const [toolName, toolInfo] of Object.entries(installedTools)) {
        upgradeToolInfos[toolName] = {
          ...toolInfo,
          install: `npm upgrade -g ${toolName}`,
          name: `${toolInfo.name} (Upgrade)`
        };
      }

      const upgradeResult = await enhancedInstaller.upgradeTools(
        Object.keys(installedTools),
        upgradeToolInfos
      );

      // 整理结果
      const results = {
        successful: [],
        failed: [],
        permissionHandled: []
      };

      for (const [toolName, installation] of Object.entries(upgradeResult.results.installations || {})) {
        if (installation.success) {
          results.successful.push(toolName);
          if (installation.permissionHandled) {
            results.permissionHandled.push(toolName);
          }
        } else {
          results.failed.push({
            tool: toolName,
            error: installation.error || 'Installation failed'
          });
        }
      }
      
      // 显示结果
      console.log('\n📊 UPGRADE RESULTS');
      console.log('='.repeat(50));

      if (results.successful.length > 0) {
        console.log(`\n✅ Successful (${results.successful.length}):`);
        results.successful.forEach(tool => {
          console.log(`  • ${tool}`);
        });
      }

      if (results.permissionHandled.length > 0) {
        console.log(`\n🔧 Auto-handled permissions (${results.permissionHandled.length}):`);
        results.permissionHandled.forEach(tool => {
          console.log(`  • ${tool}`);
        });
      }

      if (results.failed.length > 0) {
        console.log(`\n❌ Failed (${results.failed.length}):`);
        results.failed.forEach(result => {
          console.log(`  • ${result.tool}: ${result.error}`);
        });

        // Provide guidance for permission issues
        if (results.failed.length > 0) {
          console.log('\n💡 如果遇到权限问题，请尝试:');
          console.log('   Windows: 以管理员身份运行PowerShell，然后执行 stigmergy upgrade');
          console.log('   macOS/Linux: sudo stigmergy upgrade');
        }
      }

      if (results.permissionHandled.length > 0) {
        console.log('\n✅ 权限问题已自动处理');
        console.log(`🔧 自动提升权限升级了 ${results.permissionHandled.length} 个工具`);
      }

      console.log('\n🎉 Upgrade process completed!');
      
    } catch (error) {
      console.error('[ERROR] Upgrade failed:', error.message);
      if (process.env.DEBUG === 'true') {
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

      // Check directory permissions first
      const permissionManager = new DirectoryPermissionManager({ verbose: process.env.DEBUG === 'true' });
      const hasWritePermission = await permissionManager.checkWritePermission();

      if (!hasWritePermission) {
        console.log('\n⚠️  Current directory lacks write permission');
        console.log('🔧 Using permission-aware installation...');

        // Use permission-aware installer
        const permAwareInstaller = new PermissionAwareInstaller({
          verbose: process.env.DEBUG === 'true',
          skipPermissionCheck: false
        });

        const result = await permAwareInstaller.install();
        if (result.success) {
          console.log('\n✅ Permission-aware installation completed successfully!');
        } else {
          console.log('\n❌ Permission-aware installation failed');
          process.exit(1);
        }
        break;
      }

      // Normal installation if directory has write permission
      const { missing: missingTools, available: availableTools } = await installer.scanCLI();

      if (Object.keys(missingTools).length === 0) {
        console.log('[INFO] All AI CLI tools are already installed!');
        console.log('\nAvailable tools:');
        for (const [toolName, toolInfo] of Object.entries(availableTools)) {
          console.log(`  - ${toolInfo.name} (${toolName})`);
        }
      } else {
        console.log(`\n[INFO] Found ${Object.keys(missingTools).length} missing AI CLI tools:`);
        for (const [toolName, toolInfo] of Object.entries(missingTools)) {
          console.log(`  - ${toolInfo.name}: ${toolInfo.install}`);
        }

        // 默认自动安装所有缺失的工具
        console.log(`\n[AUTO-INSTALL] Installing ${Object.keys(missingTools).length} missing AI CLI tools...`);

        const selectedTools = Object.keys(missingTools);

        // Use EnhancedCLIInstaller with batch permission handling
        const EnhancedCLIInstaller = require(path.resolve(__dirname, '../core/enhanced_cli_installer'));
        const installer = new EnhancedCLIInstaller({
          verbose: process.env.DEBUG === 'true',
          autoRetry: true,
          maxRetries: 2
        });

        console.log(`[INFO] Installing ${selectedTools.length} CLI tools with optimized permission handling...`);
        const installResult = await installer.installTools(selectedTools, missingTools);

        if (installResult) {
          console.log(`\n[SUCCESS] Installed ${selectedTools.length} AI CLI tools!`);

          // Check if any permissions were handled automatically
          const installations = installer.results.installations || {};
          const permissionHandledTools = Object.entries(installations)
            .filter(([name, result]) => result.success && result.permissionHandled)
            .map(([name]) => name);

          if (permissionHandledTools.length > 0) {
            console.log('✅ 权限问题已自动处理');
            console.log(`🔧 自动提升权限安装了 ${permissionHandledTools.length} 个工具: ${permissionHandledTools.join(', ')}`);
          }

          // Show permission mode used
          console.log(`🔧 权限模式: ${installResult.permissionMode}`);
        } else {
          console.log('\n[WARN] Some tools may not have installed successfully. Check the logs above for details.');

          // Provide manual guidance for permission issues
          const failedInstallations = installer.results.failedInstallations || [];
          if (failedInstallations.length > 0) {
            console.log('\n💡 如果遇到权限问题，请尝试:');
            console.log('   Windows: 以管理员身份运行PowerShell，然后执行 stigmergy install');
            console.log('   macOS/Linux: sudo stigmergy install');
          }
        }
      }

      console.log('\n[INFO] Installation process completed.');
    } catch (error) {
      console.error('[ERROR] Installation failed:', error.message);
      if (process.env.DEBUG === 'true') {
        console.error(error.stack);
      }
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

  case 'call': {
    if (args.length < 2) {
      console.log('[ERROR] Usage: stigmergy call "<prompt>"');
      process.exit(1);
    }

    // Get the prompt (everything after the command)
    const prompt = args.slice(1).join(' ');

    // Use smart router to determine which tool to use
    const router = new SmartRouter();
    await router.initialize(); // Initialize the router first
    const route = await router.smartRoute(prompt);

    console.log(`[CALL] Routing to ${route.tool}: ${route.prompt}`);

    // Execute the routed command
    try {
      // Get the actual executable path for the tool using which/where command
      let toolPath = route.tool;
      try {
        const whichCmd = process.platform === 'win32' ? 'where' : 'which';
        const whichResult = spawnSync(whichCmd, [route.tool], {
          encoding: 'utf8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
        });
        
        if (whichResult.status === 0 && whichResult.stdout.trim()) {
          // Get the first match (most likely the one that would be executed)
          toolPath = whichResult.stdout.trim().split('\n')[0].trim();
        }
      } catch (whichError) {
        // If which/where fails, continue with the tool name
        if (process.env.DEBUG === 'true') {
          console.log(`[DEBUG] which/where command failed for ${route.tool}: ${whichError.message}`);
        }
      }

      // SPECIAL TEST CASE: Simulate a non-existent tool for testing
      // This is for demonstration purposes only
      /*
          if (route.tool === "nonexistenttool") {
            toolPath = "this_tool_definitely_does_not_exist_12345";
          }
          */

      console.log(
        `[DEBUG] Tool path: ${toolPath}, Prompt: ${route.prompt}`,
      );

      // For different tools, we need to pass the prompt differently
      // Use unified parameter handler for better parameter handling
      let toolArgs = [];

      try {
        // Get CLI pattern for this tool
        const cliPattern = await router.analyzer.getCLIPattern(route.tool);

        // Log the CLI pattern to debug command format issues
        if (process.env.DEBUG === 'true' && cliPattern) {
          console.log(`[DEBUG] CLI Pattern for ${route.tool}:`, JSON.stringify(cliPattern, null, 2));
        }

        // Use the unified CLI parameter handler
        const CLIParameterHandler = require('../core/cli_parameter_handler');
        toolArgs = CLIParameterHandler.generateArguments(
          route.tool,
          route.prompt,
          cliPattern,
        );
      } catch (patternError) {
        // Fallback to original logic if pattern analysis fails
        if (route.tool === 'claude') {
          // Claude CLI expects the prompt with -p flag for non-interactive mode
          toolArgs = ['-p', `"${route.prompt}"`];
        } else if (route.tool === 'qodercli' || route.tool === 'iflow') {
          // Qoder CLI and iFlow expect the prompt with -p flag
          toolArgs = ['-p', `"${route.prompt}"`];
        } else if (route.tool === 'codex') {
          // Codex CLI needs 'exec' subcommand for non-interactive mode
          toolArgs = ['exec', '-p', `"${route.prompt}"`];
        } else {
          // For other tools, pass the prompt with -p flag
          toolArgs = ['-p', `"${route.prompt}"`];
        }
      }

      // Use the reliable cross-platform execution function
      try {
        // Validate that the tool exists before attempting to execute
        if (!toolPath || typeof toolPath !== 'string') {
          throw new Error(`Invalid tool path: ${toolPath}`);
        }

        // Special handling for JS files to ensure proper execution
        if (toolPath.endsWith('.js') || toolPath.endsWith('.cjs')) {
          // Use safe JS file execution
          if (process.env.DEBUG === 'true') {
            console.log(
              `[EXEC] Safely executing JS file: ${toolPath} ${toolArgs.join(' ')}`,
            );
          }
          const result = await executeJSFile(toolPath, toolArgs, {
            stdio: 'inherit',
            shell: true,
          });

          if (!result.success) {
            console.log(
              `[WARN] ${route.tool} exited with code ${result.code}`,
            );
          }
          process.exit(result.code || 0);
        } else {
          // Regular command execution
          if (process.env.DEBUG === 'true') {
            console.log(`[EXEC] Running: ${toolPath} ${toolArgs.join(' ')}`);
          }
          
          // Special handling for Windows to construct the command properly
          let execCommand = toolPath;
          let execArgs = toolArgs;
          if (process.platform === 'win32') {
            // On Windows, we construct the full command line and pass it as a single string
            if (toolArgs.length > 0) {
              // For Windows, we need to properly quote the entire command line
              const argsString = toolArgs.map(arg => {
                // If arg contains spaces and is not already quoted, quote it
                if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                  return `"${arg}"`;
                }
                return arg;
              }).join(' ');
              execCommand = `${toolPath} ${argsString}`;
              execArgs = [];
              console.log(`[DEBUG] Windows full command: ${execCommand}`);
            }
          }
          
          // Special handling for Claude on Windows to bypass the wrapper script
          if (process.platform === 'win32' && route.tool === 'claude') {
            // Use detected path to avoid the wrapper script that interferes with parameter passing
            const detectedPath = await getCLIPath('claude');
            if (detectedPath) {
              execCommand = detectedPath;
              console.log(`[DEBUG] Using detected Claude path: ${execCommand}`);
            } else {
              execCommand = 'C:\\npm_global\\claude';
              console.log(`[DEBUG] Using default Claude path: ${execCommand}`);
            }

            if (toolArgs.length > 0) {
              const argsString = toolArgs.map(arg => {
                if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                  return `"${arg}"`;
                }
                return arg;
              }).join(' ');
              execCommand = `${execCommand} ${argsString}`;
              execArgs = [];
              console.log(`[DEBUG] Windows direct Claude command: ${execCommand}`);
            }
          }
          
          // Use detected paths for all CLI tools on all platforms
          const supportedTools = ['claude', 'copilot', 'qodercli', 'gemini', 'qwen', 'iflow', 'codebuddy', 'codex'];

          if (supportedTools.includes(route.tool)) {
            // Use detected path for all CLI tools regardless of platform
            const detectedPath = await getCLIPath(route.tool);
            if (detectedPath) {
              execCommand = detectedPath;
              console.log(`[DEBUG] Using detected ${route.tool} path: ${execCommand}`);
            } else {
              // Fallback to system PATH for tools not detected
              console.log(`[DEBUG] Using system PATH for ${route.tool}: ${route.tool}`);
            }
          }

          // Platform-specific command construction
          if (process.platform === 'win32') {
            // Special handling for Windows CLI tools
            if (route.tool === 'claude' && toolArgs.length > 0) {
              // Special parameter handling for Claude to avoid wrapper script issues
              const argsString = toolArgs.map(arg => {
                if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                  return `"${arg}"`;
                }
                return arg;
              }).join(' ');
              execCommand = `${execCommand} ${argsString}`;
              execArgs = [];
              console.log(`[DEBUG] Windows ${route.tool} direct command: ${execCommand}`);
            } else if (route.tool === 'copilot') {
              // Copilot doesn't use -p parameter format
              execArgs = [];
              console.log(`[DEBUG] Windows ${route.tool} direct command: ${execCommand}`);
            } else if (toolArgs.length > 0) {
              // For other Windows tools, construct full command line
              const argsString = toolArgs.map(arg => {
                if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                  return `"${arg}"`;
                }
                return arg;
              }).join(' ');
              execCommand = `${execCommand} ${argsString}`;
              execArgs = [];
              console.log(`[DEBUG] Windows full command: ${execCommand}`);
            }
          }
          
          // Apply the same Windows handling logic to ensure consistency
          // This ensures consistency between direct routing and call command routing
          if (process.platform === 'win32' && execArgs.length > 0) {
            // For Windows, we need to properly quote the entire command line
            const argsString = execArgs.map(arg => {
              // If arg contains spaces and is not already quoted, quote it
              if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                return `"${arg}"`;
              }
              return arg;
            }).join(' ');
            execCommand = `${execCommand} ${argsString}`;
            execArgs = [];
            console.log(`[DEBUG] Windows unified command: ${execCommand}`);
          }
          
          // Set environment for tools that need specific working directories
          const env = { ...process.env };
          if (route.tool === 'qwen') {
            // For Qwen CLI, clear NODE_PATH to avoid import conflicts
            delete env.NODE_PATH;
          }

          const result = await executeCommand(execCommand, execArgs, {
            stdio: 'inherit',
            shell: true,
            cwd: getWorkingDirectoryForTool(route.tool),
            env,
          });

          if (!result.success) {
            console.log(
              `[WARN] ${route.tool} exited with code ${result.code}`,
            );
          }
          process.exit(result.code || 0);
        }
      } catch (executionError) {
        // Check for specific errors that might not be actual failures
        const errorMessage = executionError.error?.message || executionError.message || executionError;

        // For some tools like Claude, they may output to stdout and return non-zero codes
        // without actually failing - handle these cases more gracefully
        if (errorMessage.includes('not recognized as an internal or external command') ||
            errorMessage.includes('command not found') ||
            errorMessage.includes('ENOENT')) {
          // This is a genuine error - tool is not installed
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
        } else {
          // For other execution errors, try to execute the command directly
          // which handles cases where the tool executed successfully but returned an error object
          console.log(`[EXEC] Running: ${toolPath} ${toolArgs.join(' ')}`);
          // Set environment for tools that need specific working directories
          const env = { ...process.env };
          if (route.tool === 'qwen') {
            delete env.NODE_PATH;
          }

          const result = await executeCommand(toolPath, toolArgs, {
            stdio: 'inherit',
            shell: true,
            cwd: getWorkingDirectoryForTool(route.tool),
            env,
          });

          if (!result.success) {
            console.log(`[WARN] ${route.tool} exited with code ${result.code}`);
          }
          process.exit(result.code || 0);
        }
      }
    } catch (error) {
      const cliError = await errorHandler.handleCLIError(
        route.tool,
        error,
        prompt,
      );
      console.log(
        `[ERROR] Failed to execute ${route.tool}:`,
        cliError.message,
      );
      process.exit(1);
    }
    break;
  }

  case 'auto-install':
    // Auto-install mode for npm postinstall - NON-INTERACTIVE with permission awareness
    // Force immediate output visibility during npm install

    // Detect npm environment for better output visibility
    const isNpmPostinstall = process.env.npm_lifecycle_event === 'postinstall';

    // Use stderr for critical messages in npm environment (more likely to be shown)
    const criticalLog = isNpmPostinstall ? console.error : console.log;

    criticalLog('🚀 STIGMERGY CLI AUTO-INSTALL STARTING');
    criticalLog('='.repeat(60));
    criticalLog('Installing cross-CLI integration and scanning for AI tools...');
    criticalLog('='.repeat(60));
    console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
    console.log('='.repeat(60));

    // Check directory permissions
    const autoPermissionManager = new DirectoryPermissionManager({ verbose: process.env.DEBUG === 'true' });
    const autoHasWritePermission = await autoPermissionManager.checkWritePermission();

    if (!autoHasWritePermission && !process.env.STIGMERGY_SKIP_PERMISSION_CHECK) {
      criticalLog('⚠️  Directory permission detected, setting up permission-aware installation...');

      try {
        const permResult = await autoPermissionManager.setupWorkingDirectory();
        if (permResult.success) {
          criticalLog('✅ Working directory configured with proper permissions');
        } else {
          criticalLog('⚠️  Could not configure working directory, continuing with limited functionality');
        }
      } catch (error) {
        criticalLog(`⚠️  Permission setup failed: ${error.message}`);
      }
    }

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

          // Check if auto-install is enabled for npm postinstall
          const autoInstallEnabled = process.env.STIGMERGY_AUTO_INSTALL !== 'false';

          if (autoInstallEnabled && !process.env.CI) {
            console.log('\n[AUTO-INSTALL] Installing missing CLI tools automatically...');
            console.log('[INFO] Set STIGMERGY_AUTO_INSTALL=false to disable this behavior');

            try {
              const selectedTools = Object.keys(autoMissing);

              // Use EnhancedCLIInstaller with batch permission handling
              const EnhancedCLIInstaller = require(path.resolve(__dirname, '../core/enhanced_cli_installer'));
              const installer = new EnhancedCLIInstaller({
                verbose: process.env.DEBUG === 'true',
                autoRetry: true,
                maxRetries: 2
              });

              console.log(`[INFO] Installing ${selectedTools.length} CLI tools with optimized permission handling...`);
              const installResult = await installer.installTools(selectedTools, autoMissing);

              if (installResult) {
                console.log(`[SUCCESS] Auto-installed ${selectedTools.length} CLI tools!`);

                // Check if permissions were handled automatically
                const installations = installer.results.installations || {};
                const permissionHandledTools = Object.entries(installations)
                  .filter(([name, result]) => result.success && result.permissionHandled)
                  .map(([name]) => name);

                if (permissionHandledTools.length > 0) {
                  console.log('✅ 权限问题已自动处理');
                  console.log(`🔧 自动提升权限安装了 ${permissionHandledTools.length} 个工具: ${permissionHandledTools.join(', ')}`);
                }

                // Show permission mode used
                console.log(`🔧 权限模式: ${installResult.permissionMode}`);
              } else {
                console.log('[WARN] Some tools may not have installed successfully');

                // Provide manual guidance for permission issues
                const failedInstallations = installer.results.failedInstallations || [];
                if (failedInstallations.length > 0) {
                  console.log('\n💡 如果遇到权限问题，请尝试:');
                  console.log('   Windows: 以管理员身份运行PowerShell，然后执行 stigmergy install');
                  console.log('   macOS/Linux: sudo stigmergy install');
                }
              }
            } catch (installError) {
              console.log(`[ERROR] Auto-install failed: ${installError.message}`);
              console.log('[INFO] You can manually install tools with: stigmergy install --auto');

              // Check if it's a permission error
              const permissionIndicators = ['EACCES', 'EPERM', 'permission denied', 'access denied'];
              const isPermissionError = permissionIndicators.some(indicator =>
                installError.message.toLowerCase().includes(indicator.toLowerCase())
              );

              if (isPermissionError) {
                console.log('\n💡 这看起来像是权限问题，请尝试:');
                console.log('   Windows: 以管理员身份运行PowerShell，然后执行 stigmergy install');
                console.log('   macOS/Linux: sudo stigmergy install');
              }
            }
          } else {
            console.log('\n[INFO] You can install missing tools with: stigmergy install --auto');
            if (process.env.CI) {
              console.log('[CI] Auto-install disabled in CI environment');
            }
          }
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

  // Skill命令简化别名
  case 'skill-i':    // install
  case 'skill-l':    // list
  case 'skill-v':    // validate/read
  case 'skill-r':    // read
  case 'skill-d':    // remove/delete
  case 'skill-m':    // remove (移除)
  case 'skill': {
    try {
      // Skill命令通过桥接器调用ES模块
      const { handleSkillCommand } = require('../commands/skill-handler');
      
      // 处理简化命令
      let skillAction;
      let skillArgs;
      
      switch (command) {
        case 'skill-i':
          skillAction = 'install';
          skillArgs = args.slice(1);
          break;
        case 'skill-l':
          skillAction = 'list';
          skillArgs = args.slice(1);
          break;
        case 'skill-v':
          // skill-v可以是validate或read，根据参数判断
          skillAction = args[1] && (args[1].endsWith('.md') || args[1].includes('/') || args[1].includes('\\')) 
            ? 'validate' 
            : 'read';
          skillArgs = args.slice(1);
          break;
        case 'skill-r':
          skillAction = 'read';
          skillArgs = args.slice(1);
          break;
        case 'skill-d':
        case 'skill-m':
          skillAction = 'remove';
          skillArgs = args.slice(1);
          break;
        default:
          // 标准skill命令
          skillAction = args[1];
          skillArgs = args.slice(2);
          
          // 如果没有子命令，默认执行sync
          if (!skillAction) {
            skillAction = 'sync';
            skillArgs = [];
          }
      }
      
      const skillOptions = {
        force: args.includes('--force'),
        verbose: args.includes('--verbose'),
        autoSync: !args.includes('--no-auto-sync')
      };

      const exitCode = await handleSkillCommand(skillAction, skillArgs, skillOptions);
      process.exit(exitCode || 0);
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'main.skill');
      console.error(`[ERROR] Skill command failed: ${error.message}`);
      process.exit(1);
    }
    break;
  }

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
        console.log('  • npm uninstall -g stigmergy - Uninstall Stigmergy completely (runs enhanced cleanup)');
        console.log('  • See remaining items after uninstall (individual CLI tools, docs, etc.)');
      }

    } catch (error) {
      console.error('[ERROR] Diagnostic failed:', error.message);
      process.exit(1);
    }
    break;
  }

  case 'fix-perms': {
    try {
      console.log('[FIX-PERMS] Setting up working directory with proper permissions...\n');

      const permAwareInstaller = new PermissionAwareInstaller({
        verbose: process.env.DEBUG === 'true',
        skipPermissionCheck: false,
        autoConfigureShell: true
      });

      const result = await permAwareInstaller.install();

      if (result.success) {
        console.log('\n✅ Permission setup completed successfully!');
        permAwareInstaller.permissionManager.displayResults(result.permissionSetup);
      } else {
        console.log('\n❌ Permission setup failed');
        console.log(`Error: ${result.error || 'Unknown error'}`);
        process.exit(1);
      }

    } catch (error) {
      console.error('[ERROR] Permission setup failed:', error.message);
      if (process.env.DEBUG === 'true') {
        console.error(error.stack);
      }
      process.exit(1);
    }
    break;
  }

  case 'perm-check': {
    try {
      console.log('[PERM-CHECK] Checking current directory permissions...\n');

      const permissionManager = new DirectoryPermissionManager({ verbose: process.env.DEBUG === 'true' });
      const hasWritePermission = await permissionManager.checkWritePermission();

      console.log(`📍 Current directory: ${process.cwd()}`);
      console.log(`🔧 Write permission: ${hasWritePermission ? '✅ Yes' : '❌ No'}`);

      if (!hasWritePermission) {
        console.log('\n💡 Suggestions:');
        console.log('1. Run: stigmergy fix-perms    # Fix permissions automatically');
        console.log('2. Change to user directory: cd ~');
        console.log('3. Create project directory: mkdir ~/stigmergy && cd ~/stigmergy');
        console.log('\n🔍 System Info:');
        const sysInfo = permissionManager.getSystemInfo();
        console.log(`   Platform: ${sysInfo.platform}`);
        console.log(`   Shell: ${sysInfo.shell}`);
        console.log(`   Home: ${sysInfo.homeDir}`);
      } else {
        console.log('\n✅ Current directory is ready for installation');
      }

    } catch (error) {
      console.error('[ERROR] Permission check failed:', error.message);
      if (process.env.DEBUG === 'true') {
        console.error(error.stack);
      }
      process.exit(1);
    }
    break;
  }

  default:
    // Check if the command matches a direct CLI tool name
    if (CLI_TOOLS[command]) {
      const toolName = command;
      const toolInfo = CLI_TOOLS[toolName];
      
      // Get the prompt (everything after the tool name)
      const prompt = args.slice(1).join(' ');
      
      if (!prompt) {
        console.log(`[ERROR] Usage: stigmergy ${toolName} "<prompt>"`);
        process.exit(1);
      }
      
      console.log(`[DIRECT] Routing to ${toolInfo.name}: ${prompt}`);
      
      // Use smart router to handle the execution
      const router = new SmartRouter();
      await router.initialize();
      
      // Create a route object similar to what smartRoute would return
      const route = {
        tool: toolName,
        prompt: prompt
      };
      
      // Execute the routed command (reusing the call command logic)
      try {
        // Get the actual executable path for the tool using which/where command
        let toolPath = toolName;
        try {
          const whichCmd = process.platform === 'win32' ? 'where' : 'which';
          const whichResult = spawnSync(whichCmd, [toolName], {
            encoding: 'utf8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
          });
          
          if (whichResult.status === 0 && whichResult.stdout.trim()) {
            // Get the first match (most likely the one that would be executed)
            toolPath = whichResult.stdout.trim().split('\n')[0].trim();
          }
        } catch (whichError) {
          // If which/where fails, continue with the tool name
          if (process.env.DEBUG === 'true') {
            console.log(`[DEBUG] which/where command failed for ${toolName}: ${whichError.message}`);
          }
        }
        
        console.log(`[DEBUG] Tool path: ${toolPath}, Prompt: ${route.prompt}`);
        
        // For different tools, we need to pass the prompt differently
        // Use unified parameter handler for better parameter handling
        let toolArgs = [];
        
        try {
          // Get CLI pattern for this tool
          console.log(`[DEBUG] Attempting to get CLI pattern for: ${route.tool}`);
          const cliPattern = await router.analyzer.getCLIPattern(route.tool);
          console.log(`[DEBUG] Got CLI pattern: ${JSON.stringify(cliPattern)}`);
          
          // Log the CLI pattern to debug command format issues
          if (process.env.DEBUG === 'true' && cliPattern) {
            console.log(
              `[DEBUG] CLI Pattern for ${route.tool}:`,
              JSON.stringify(cliPattern, null, 2),
            );
          }
          
          // Use the unified CLI parameter handler
          const CLIParameterHandler = require('../core/cli_parameter_handler');
          toolArgs = CLIParameterHandler.generateArguments(
            route.tool,
            route.prompt,
            cliPattern,
          );
          
          // Add debug logging for the final arguments
          console.log(`[DEBUG] Final toolArgs: ${JSON.stringify(toolArgs)}`);
        } catch (patternError) {
          // Fallback to original logic if pattern analysis fails
          console.log(`[DEBUG] Pattern analysis failed, using fallback logic: ${patternError.message}`);
          if (route.tool === 'claude') {
            // Claude CLI expects the prompt with -p flag for non-interactive mode
            toolArgs = ['-p', `"${route.prompt}"`];
          } else if (route.tool === 'qodercli' || route.tool === 'iflow') {
            // Qoder CLI and iFlow expect the prompt with -p flag
            toolArgs = ['-p', `"${route.prompt}"`];
          } else if (route.tool === 'codex') {
            // Codex CLI needs 'exec' subcommand for non-interactive mode
            toolArgs = ['exec', '-p', `"${route.prompt}"`];
          } else {
            // For other tools, pass the prompt with -p flag
            toolArgs = ['-p', `"${route.prompt}"`];
          }
          
          // Add debug logging for the fallback arguments
          console.log(`[DEBUG] Fallback toolArgs: ${JSON.stringify(toolArgs)}`);
        }
        
        // Use the reliable cross-platform execution function
        try {
          // Validate that the tool exists before attempting to execute
          if (!toolPath || typeof toolPath !== 'string') {
            throw new Error(`Invalid tool path: ${toolPath}`);
          }
          
          // Special handling for JS files to ensure proper execution
          if (toolPath.endsWith('.js') || toolPath.endsWith('.cjs')) {
            // Use safe JS file execution
            if (process.env.DEBUG === 'true') {
              console.log(
                `[EXEC] Safely executing JS file: ${toolPath} ${toolArgs.join(' ')}`,
              );
            }
            const result = await executeJSFile(toolPath, toolArgs, {
              stdio: 'inherit',
              shell: true,
            });
            
            if (!result.success) {
              console.log(
                `[WARN] ${route.tool} exited with code ${result.code}`,
              );
            }
            process.exit(result.code || 0);
          } else {
            // Regular command execution
            if (process.env.DEBUG === 'true') {
              console.log(`[EXEC] Running: ${toolPath} ${toolArgs.join(' ')}`);
            }
            console.log(`[DEBUG] About to execute: ${toolPath} with args: ${JSON.stringify(toolArgs)}`);
            
            // Special handling for Windows to construct the command properly
            let execCommand = toolPath;
            let execArgs = toolArgs;
            if (process.platform === 'win32') {
              // On Windows, we construct the full command line and pass it as a single string
              if (toolArgs.length > 0) {
                // For Windows, we need to properly quote the entire command line
                const argsString = toolArgs.map(arg => {
                  // If arg contains spaces and is not already quoted, quote it
                  if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                    return `"${arg}"`;
                  }
                  return arg;
                }).join(' ');
                execCommand = `${toolPath} ${argsString}`;
                execArgs = [];
                console.log(`[DEBUG] Windows full command: ${execCommand}`);
              }
            }
      
            // Use detected paths for all CLI tools on all platforms
            const supportedTools = ['claude', 'copilot', 'qodercli', 'gemini', 'qwen', 'iflow', 'codebuddy', 'codex'];

            if (supportedTools.includes(route.tool)) {
              // Use detected path for all CLI tools regardless of platform
              const detectedPath = await getCLIPath(route.tool);
              if (detectedPath) {
                execCommand = detectedPath;
                console.log(`[DEBUG] Using detected ${route.tool} path: ${execCommand}`);
              } else {
                // Fallback to system PATH for tools not detected
                console.log(`[DEBUG] Using system PATH for ${route.tool}: ${route.tool}`);
              }
            }

            // Platform-specific command construction
            if (process.platform === 'win32') {
              // Special handling for Windows CLI tools
              if (route.tool === 'claude' && toolArgs.length > 0) {
                // Special parameter handling for Claude to avoid wrapper script issues
                const argsString = toolArgs.map(arg => {
                  if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                    return `"${arg}"`;
                  }
                  return arg;
                }).join(' ');
                execCommand = `${execCommand} ${argsString}`;
                execArgs = [];
                console.log(`[DEBUG] Windows ${route.tool} direct command: ${execCommand}`);
              } else if (route.tool === 'copilot') {
                // Copilot doesn't use -p parameter format
                execArgs = [];
                console.log(`[DEBUG] Windows ${route.tool} direct command: ${execCommand}`);
              } else if (toolArgs.length > 0) {
                // For other Windows tools, construct full command line
                const argsString = toolArgs.map(arg => {
                  if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                    return `"${arg}"`;
                  }
                  return arg;
                }).join(' ');
                execCommand = `${execCommand} ${argsString}`;
                execArgs = [];
                console.log(`[DEBUG] Windows full command: ${execCommand}`);
              }
            }
      
        
            // Apply the same Windows handling logic to ensure consistency
            // This ensures consistency between direct routing and call command routing
            if (process.platform === 'win32' && execArgs.length > 0) {
              // For Windows, we need to properly quote the entire command line
              const argsString = execArgs.map(arg => {
                // If arg contains spaces and is not already quoted, quote it
                if (arg.includes(' ') && !(arg.startsWith('"') && arg.endsWith('"'))) {
                  return `"${arg}"`;
                }
                return arg;
              }).join(' ');
              execCommand = `${execCommand} ${argsString}`;
              execArgs = [];
              console.log(`[DEBUG] Windows unified command: ${execCommand}`);
            }
            
            const result = await executeCommand(execCommand, execArgs, {
              stdio: 'inherit',
              shell: true,
            });
            
            if (!result.success) {
              console.log(
                `[WARN] ${route.tool} exited with code ${result.code}`,
              );
            }
            process.exit(result.code || 0);
          }
        } catch (executionError) {
          // Check for specific errors that might not be actual failures
          const errorMessage =
              executionError.error?.message ||
              executionError.message ||
              executionError;
          
          // For some tools like Claude, they may output to stdout and return non-zero codes
          // without actually failing - handle these cases more gracefully
          if (
            errorMessage.includes(
              'not recognized as an internal or external command',
            ) ||
              errorMessage.includes('command not found') ||
              errorMessage.includes('ENOENT')
          ) {
            // This is a genuine error - tool is not installed
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
          } else {
            // For other execution errors, try to execute the command directly
            // which handles cases where the tool executed successfully but returned an error object
            console.log(`[EXEC] Running: ${toolPath} ${toolArgs.join(' ')}`);

            // Set environment for tools that need specific working directories
            const env = { ...process.env };
            if (route.tool === 'qwen') {
              delete env.NODE_PATH;
            }

            const result = await executeCommand(toolPath, toolArgs, {
              stdio: 'inherit',
              shell: true,
              cwd: getWorkingDirectoryForTool(route.tool),
              env,
            });
            
            if (!result.success) {
              console.log(
                `[WARN] ${route.tool} exited with code ${result.code}`,
              );
            }
            process.exit(result.code || 0);
          }
        }
      } catch (error) {
        const cliError = await errorHandler.handleCLIError(
          route.tool,
          error,
          prompt,
        );
        console.log(
          `[ERROR] Failed to execute ${route.tool}:`,
          cliError.message,
        );
        process.exit(1);
      }
    } else {
      console.log(`[ERROR] Unknown command: ${command}`);
      console.log('[INFO] Run "stigmergy --help" for usage information');
      process.exit(1);
    }
  }
}

module.exports = main;