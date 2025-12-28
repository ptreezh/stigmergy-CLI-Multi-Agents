#!/usr/bin/env node

/**
 * Stigmergy CLI Permission Fix Script
 *
 * This script helps macOS and Linux users fix directory permission issues
 * when they start terminal in system directories without write permissions.
 *
 * Usage:
 *   node fix-permissions.js              # Interactive mode
 *   node fix-permissions.js --auto       # Automatic mode
 *   node fix-permissions.js --check      # Check permissions only
 *   node fix-permissions.js --help       # Show help
 */

// PermissionAwareInstaller functionality is fused into EnhancedCLIInstaller
const EnhancedCLIInstaller = require('./src/core/enhanced_cli_installer');
const DirectoryPermissionManager = require('./src/core/directory_permission_manager');

// Parse command line arguments
const args = process.argv.slice(2);
const isAuto = args.includes('--auto');
const isCheck = args.includes('--check');
const isHelp = args.includes('--help') || args.includes('-h');
const isVerbose = args.includes('--verbose') || args.includes('-v');

function showHelp() {
  console.log(`
Stigmergy CLI Permission Fix Tool
==================================

This tool helps resolve directory permission issues that prevent
Stigmergy CLI installation on macOS and Linux systems.

USAGE:
  node fix-permissions.js [options]

OPTIONS:
  --auto       Automatic mode without prompts
  --check      Check current permissions only
  --verbose    Show detailed information
  --help, -h   Show this help message

EXAMPLES:
  node fix-permissions.js          # Interactive permission fix
  node fix-permissions.js --auto   # Automatic permission fix
  node fix-permissions.js --check  # Check permissions only

WHAT IT DOES:
1. Checks if current directory has write permission
2. Finds or creates a writable working directory
3. Configures npm to use a writable global directory
4. Updates shell configuration for persistent setup
5. Installs Stigmergy CLI and AI tools

SUPPORTED PLATFORMS:
- macOS (zsh, bash)
- Linux (bash, zsh, fish, csh, tcsh)

FOR MORE HELP:
- Visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- Run: stigmergy diagnostic  # System diagnostic
- Run: stigmergy help        # Show all commands
`);
}

async function main() {
  console.log('🔧 Stigmergy CLI Permission Fix Tool');
  console.log('===================================\n');

  if (isHelp) {
    showHelp();
    return;
  }

  try {
    const permissionManager = new DirectoryPermissionManager({
      verbose: isVerbose
    });

    // Check permissions first
    console.log('📋 Checking current directory permissions...');
    const hasWritePermission = await permissionManager.checkWritePermission();
    const currentDir = process.cwd();

    console.log(`📍 Current directory: ${currentDir}`);
    console.log(`🔧 Write permission: ${hasWritePermission ? '✅ Yes' : '❌ No'}`);

    if (hasWritePermission) {
      console.log('\n✅ Current directory has proper permissions!');
      console.log('💡 You can run: npm install -g stigmergy');
      return;
    }

    if (isCheck) {
      console.log('\n❌ Current directory lacks write permission');
      console.log('\n💡 Suggestions:');
      console.log('1. Run: node fix-permissions.js --auto   # Fix automatically');
      console.log('2. Change to user directory: cd ~');
      console.log('3. Create project directory: mkdir ~/stigmergy && cd ~/stigmergy');
      return;
    }

    // Fix permissions
    console.log('\n🔧 Setting up permission-aware installation...');

    const permAwareInstaller = new EnhancedCLIInstaller({
      verbose: isVerbose,
      autoRetry: true,
      maxRetries: 2
    });

    console.log('🚀 Starting permission-aware installation...\n');

    // Scan for missing tools first
    const scanResult = await permAwareInstaller.scanCLI();
    const missingTools = scanResult.missing;
    
    if (Object.keys(missingTools).length === 0) {
      console.log('✅ All CLI tools are already installed!');
      console.log('\n🚀 Next Steps:');
      console.log('1. Restart your terminal or run: source ~/.zshrc (or ~/.bashrc)');
      console.log('2. Verify installation: stigmergy status');
      console.log('3. Start using: stigmergy help');
      return;
    }

    // Install missing tools with enhanced permission handling
    const toolsToInstall = Object.keys(missingTools);
    const result = await permAwareInstaller.installTools(toolsToInstall, missingTools);

    if (result.success) {
      console.log('\n🎉 Permission fix completed successfully!');
      console.log('✅ Working directory configured');
      console.log('✅ npm global directory configured');
      console.log('✅ Shell environment configured');
      console.log('✅ Stigmergy CLI and tools installed');

      // Show next steps
      console.log('\n🚀 Next Steps:');
      console.log('1. Restart your terminal or run: source ~/.zshrc (or ~/.bashrc)');
      console.log('2. Verify installation: stigmergy status');
      console.log('3. Start using: stigmergy help');

      // Show results if verbose
      if (isVerbose && result.permissionMode && result.permissionMode !== 'standard') {
        console.log('\n📋 Detailed Results:');
        console.log(`Permission mode used: ${result.permissionMode}`);
      }

    } else {
      console.log('\n❌ Permission fix failed');
      console.log(`Error: ${result.error || 'Unknown error'}`);

      console.log('\n🔧 Manual Fix Options:');
      console.log('1. Change to your home directory: cd ~');
      console.log('2. Create a working directory: mkdir ~/stigmergy-workspace');
      console.log('3. Change to that directory: cd ~/stigmergy-workspace');
      console.log('4. Set npm global prefix: export npm_config_prefix="~/stigmergy-workspace/.npm-global"');
      console.log('5. Update PATH: export PATH="~/stigmergy-workspace/.npm-global/bin:$PATH"');
      console.log('6. Install: npm install -g stigmergy');

      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Permission fix failed:', error.message);
    if (isVerbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main };