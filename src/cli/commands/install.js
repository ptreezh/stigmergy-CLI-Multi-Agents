/**
 * Install Command Module
 * Handles CLI tool installation commands
 */

const StigmergyInstaller = require('../../core/installer');
const chalk = require('chalk');
const { ensureSkillsCache } = require('../utils/skills_cache');

/**
 * Handle install command
 * @param {Object} options - Command options
 * @param {string} options.cli - Specific CLI to install
 * @param {boolean} options.verbose - Verbose output
 * @param {boolean} options.force - Force installation
 */
async function handleInstallCommand(options = {}) {
  const installer = new StigmergyInstaller();

  try {
    // Initialize or update skills/agents cache
    await ensureSkillsCache({ verbose: options.verbose || process.env.DEBUG === 'true' });

    console.log(chalk.blue('🚀 Starting CLI tools installation...'));

    // Handle auto-install mode (non-interactive)
    if (options.nonInteractive) {
      console.log(chalk.blue('[AUTO-INSTALL] Running in non-interactive mode'));

      // Scan for available and missing tools
      const { missing: missingTools, available: availableTools } = await installer.scanCLI();

      // Filter to only install tools with autoInstall: true
      const toolsToInstall = Object.entries(missingTools)
        .filter(([toolName]) => installer.router.tools[toolName]?.autoInstall === true);
      
      const filteredMissingTools = Object.fromEntries(toolsToInstall);

      if (Object.keys(filteredMissingTools).length === 0) {
        console.log(chalk.green('✅ All auto-install CLI tools are already installed!'));
        return {
          success: true,
          installed: [],
          existing: Object.keys(availableTools)
        };
      }

      // Install all missing tools in auto mode
      const selectedTools = Object.keys(filteredMissingTools);
      console.log(chalk.blue(`[AUTO-INSTALL] Installing ${selectedTools.length} tools: ${selectedTools.join(', ')}`));

      const installResult = await installer.installTools(selectedTools, filteredMissingTools);

      if (installResult.success) {
        console.log(chalk.green('✅ Auto-install completed successfully!'));
        return {
          success: true,
          installed: installResult.installed || [],
          failed: installResult.failed || [],
          existing: Object.keys(availableTools)
        };
      } else {
        console.log(chalk.yellow('⚠️ Some tools may not have installed successfully'));
        return {
          success: false,
          installed: installResult.installed || [],
          failed: installResult.failed || [],
          existing: Object.keys(availableTools),
          error: 'Some installations failed'
        };
      }
    }

    // Interactive install mode
    const { missing: missingTools, available: availableTools } = await installer.scanCLI();

    // Filter to only show tools with autoInstall: true
    const toolsToInstall = Object.entries(missingTools)
      .filter(([toolName]) => installer.router.tools[toolName]?.autoInstall === true);
    const filteredMissingTools = Object.fromEntries(toolsToInstall);

    if (Object.keys(filteredMissingTools).length === 0) {
      console.log(chalk.green('✅ All auto-install CLI tools are already installed!'));

      if (Object.keys(availableTools).length > 0) {
        console.log(chalk.cyan('\n📦 Available tools:'));
        Object.keys(availableTools).forEach(tool => {
          console.log(`  ✅ ${tool}`);
        });
      }

      return {
        success: true,
        installed: [],
        existing: Object.keys(availableTools)
      };
    }

    console.log(chalk.yellow(`\n⚠️ Found ${Object.keys(filteredMissingTools).length} missing tools:`));
    Object.entries(filteredMissingTools).forEach(([toolName, toolInfo]) => {
      console.log(`  - ${toolInfo.name}: ${toolInfo.install}`);
    });

    // For now, install all missing tools
    const selectedTools = Object.keys(filteredMissingTools);
    const installResult = await installer.installTools(selectedTools, filteredMissingTools);

    if (installResult.success) {
      console.log(chalk.green('✅ Installation completed successfully!'));

      if (installResult.installed && installResult.installed.length > 0) {
        console.log(chalk.cyan('\n📦 Installed tools:'));
        installResult.installed.forEach(tool => {
          console.log(`  ✅ ${tool}`);
        });
      }

      if (installResult.failed && installResult.failed.length > 0) {
        console.log(chalk.red('\n❌ Failed tools:'));
        installResult.failed.forEach(tool => {
          console.log(`  ❌ ${tool}`);
        });
      }

      return {
        success: true,
        installed: installResult.installed || [],
        failed: installResult.failed || [],
        existing: Object.keys(availableTools)
      };
    } else {
      console.log(chalk.red('❌ Installation failed!'));
      return {
        success: false,
        installed: installResult.installed || [],
        failed: installResult.failed || [],
        existing: Object.keys(availableTools),
        error: 'Installation failed'
      };
    }
  } catch (error) {
    console.log(chalk.red(`❌ Installation error: ${error.message}`));
    return {
      success: false,
      error: error.message,
      installed: []
    };
  }
}

module.exports = {
  handleInstallCommand
};