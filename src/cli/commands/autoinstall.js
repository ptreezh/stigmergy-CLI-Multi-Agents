/**
 * Auto-install Command
 * Modular implementation for automated CLI tool installation (npm postinstall)
 */

const chalk = require('chalk');
const { handleInstallCommand } = require('./install');

/**
 * Handle auto-install command - Automated installation for npm postinstall
 * @param {Object} options - Command options
 */
async function handleAutoInstallCommand(options = {}) {
  try {
    // Detect npm environment for better output visibility
    const isNpmPostinstall = process.env.npm_lifecycle_event === 'postinstall';

    // Use stderr for critical messages in npm environment (more likely to be shown)
    const criticalLog = isNpmPostinstall ? console.error : console.log;

    criticalLog(chalk.cyan('🚀 STIGMERGY CLI AUTO-INSTALL STARTING'));
    criticalLog('='.repeat(60));
    criticalLog('Installing cross-CLI integration and scanning for AI tools...');
    criticalLog('='.repeat(60));

    console.log(chalk.blue('[AUTO-INSTALL] Stigmergy CLI automated setup'));
    console.log('='.repeat(60));

    // Check if we're in npm postinstall environment
    if (isNpmPostinstall) {
      console.log(chalk.yellow('📦 Detected npm postinstall environment'));
      console.log(chalk.gray('Setting up CLI integrations automatically...'));
    }

    // Auto-install options - non-interactive mode
    const autoInstallOptions = {
      cli: 'all', // Install all available CLI tools
      verbose: options.verbose || process.env.DEBUG === 'true',
      force: options.force || false,
      nonInteractive: true, // Critical for automated installation
      autoDetect: true, // Auto-detect available tools
      skipPermissionCheck: process.env.STIGMERGY_SKIP_PERMISSION_CHECK === 'true'
    };

    console.log(chalk.blue('🔍 Scanning for available CLI tools...'));

    // Run the installation
    console.log(chalk.blue('🛠️  Starting automated CLI tool installation...'));

    const installResult = await handleInstallCommand(autoInstallOptions);

    if (installResult.success) {
      console.log(chalk.green('\n✅ Auto-install completed successfully!'));

      if (isNpmPostinstall) {
        criticalLog(chalk.green('✅ STIGMERGY CLI SETUP COMPLETE'));
        criticalLog(chalk.gray('You can now use: stigmergy <tool> <command>'));
      }

      // Show summary of what was installed
      if (installResult.installed && installResult.installed.length > 0) {
        console.log(chalk.blue('\n📋 Installation Summary:'));
        installResult.installed.forEach(tool => {
          console.log(`  ${chalk.green('✅')} ${tool}`);
        });
      }

      if (installResult.failed && installResult.failed.length > 0) {
        console.log(chalk.blue('\n❌ Failed Tools:'));
        installResult.failed.forEach(tool => {
          console.log(`  ${chalk.red('❌')} ${tool} (installation failed)`);
        });
      }

      if (installResult.existing && installResult.existing.length > 0) {
        console.log(chalk.blue('\n🔧 Already Available:'));
        installResult.existing.forEach(tool => {
          console.log(`  ${chalk.yellow('⚠️')} ${tool} (already installed)`);
        });
      }

    } else {
      console.log(chalk.red('\n❌ Auto-install encountered issues'));

      if (isNpmPostinstall) {
        criticalLog(chalk.red('❌ STIGMERGY CLI SETUP INCOMPLETE'));
        criticalLog(chalk.yellow('Run: stigmergy install to complete setup manually'));
      }

      if (installResult.error) {
        console.log(chalk.red(`Error: ${installResult.error}`));
      }
    }

    // Setup verification
    console.log(chalk.blue('\n🔍 Verifying installation...'));

    // Quick verification of core functionality
    const verificationChecks = [
      { name: 'Core modules accessible', check: () => require('../utils/formatters') && require('../utils/environment') },
      { name: 'Error handler available', check: () => require('../../core/error_handler') },
      { name: 'Smart router available', check: () => require('../../core/smart_router') }
    ];

    let verificationPassed = 0;
    for (const check of verificationChecks) {
      try {
        check.check();
        console.log(`  ${chalk.green('✅')} ${check.name}`);
        verificationPassed++;
      } catch (error) {
        console.log(`  ${chalk.red('❌')} ${check.name}`);
      }
    }

    if (verificationPassed === verificationChecks.length) {
      console.log(chalk.green('\n✅ All verification checks passed!'));

      if (isNpmPostinstall) {
        criticalLog(chalk.green('🎉 STIGMERGY CLI IS READY TO USE!'));
      }
    } else {
      console.log(chalk.yellow('\n⚠️  Some verification checks failed'));
      console.log(chalk.yellow('Run: stigmergy diagnostic for full system check'));
    }

    // Final summary for npm environment
    if (isNpmPostinstall) {
      criticalLog('='.repeat(60));
      criticalLog(chalk.cyan('🎯 STIGMERGY CLI AUTO-INSTALL FINISHED'));
      criticalLog('='.repeat(60));
    }

    return {
      success: installResult.success,
      verificationPassed,
      installed: installResult.installed || [],
      existing: installResult.existing || []
    };

  } catch (error) {
    const isNpmPostinstall = process.env.npm_lifecycle_event === 'postinstall';
    const criticalLog = isNpmPostinstall ? console.error : console.log;

    console.error(chalk.red('[ERROR] Auto-install failed:'), error.message);

    if (isNpmPostinstall) {
      criticalLog(chalk.red('💥 AUTO-INSTALL FAILED'));
      criticalLog(chalk.yellow('Run: stigmergy install --verbose for detailed installation'));
    }

    return { success: false, error: error.message };
  }
}

module.exports = {
  handleAutoInstallCommand
};