/**
 * Permission Management Commands
 * Modular implementation for fix-perms and perm-check commands
 */

const chalk = require('chalk');
const DirectoryPermissionManager = require('../../core/directory_permission_manager');

/**
 * Handle permission check command
 * @param {Object} options - Command options
 */
async function handlePermCheckCommand(options = {}) {
  try {
    console.log(chalk.cyan('[PERM-CHECK] Checking current directory permissions...\n'));

    const permissionManager = new DirectoryPermissionManager({
      verbose: options.verbose || process.env.DEBUG === 'true'
    });

    const hasWritePermission = await permissionManager.checkWritePermission();

    console.log(`📍 Current directory: ${process.cwd()}`);
    console.log(`🔧 Write permission: ${hasWritePermission ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);

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
      console.log(chalk.green('\n✅ Directory permissions are OK!'));
    }

    return { success: true, hasWritePermission };
  } catch (error) {
    console.error(chalk.red('[ERROR] Permission check failed:'), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle fix permissions command
 * @param {Object} options - Command options
 */
async function handleFixPermsCommand(options = {}) {
  try {
    console.log(chalk.cyan('[FIX-PERMS] Setting up working directory with proper permissions...\n'));

    // Using DirectoryPermissionManager for permission handling
    // This provides the core permission management functionality
    const permissionManager = new DirectoryPermissionManager({
      verbose: options.verbose || process.env.DEBUG === 'true',
      createStigmergyDir: true
    });

    const hasWritePermission = await permissionManager.checkWritePermission();

    if (hasWritePermission) {
      console.log(chalk.green('✅ Current directory already has proper permissions!'));
      return { success: true, alreadyFixed: true };
    }

    console.log(chalk.yellow('🔧 Attempting to fix permissions...'));

    // Try to create a .stigmergy directory in user home as fallback
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    const stigmergyDir = path.join(os.homedir(), '.stigmergy');

    try {
      await fs.mkdir(stigmergyDir, { recursive: true });
      console.log(chalk.green(`✅ Created Stigmergy directory: ${stigmergyDir}`));
      console.log(chalk.yellow('💡 Consider changing to this directory for your projects'));

      return { success: true, createdDirectory: stigmergyDir };
    } catch (mkdirError) {
      console.log(chalk.red('❌ Could not create directory or fix permissions'));
      console.log(chalk.red(`Error: ${mkdirError.message}`));

      console.log('\n🔧 Manual fix required:');
      console.log('1. Run in a directory where you have write permissions');
      console.log('2. Try: cd ~ && mkdir stigmergy-workspace && cd stigmergy-workspace');

      return { success: false, error: mkdirError.message };
    }

  } catch (error) {
    console.error(chalk.red('[ERROR] Permission setup failed:'), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    return { success: false, error: error.message };
  }
}

module.exports = {
  handlePermCheckCommand,
  handleFixPermsCommand
};