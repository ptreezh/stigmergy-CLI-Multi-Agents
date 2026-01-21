#!/usr/bin/env node

/**
 * Enhanced CLI Installation Script
 *
 * This script provides comprehensive CLI tool installation with
 * proper permission handling, ensuring all npm install commands
 * work correctly regardless of the starting directory or platform.
 *
 * Usage:
 *   node enhanced-cli-install.js              # Install all missing CLI tools
 *   node enhanced-cli-install.js --tools claude gemini  # Install specific tools
 *   node enhanced-cli-install.js --check      # Check only, don't install
 *   node enhanced-cli-install.js --verbose    # Detailed output
 */

const EnhancedCLIInstaller = require('./src/core/enhanced_cli_installer');
const StigmergyInstaller = require('./src/core/installer');

// Parse command line arguments
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');
const isCheckOnly = args.includes('--check') || args.includes('-c');
const isHelp = args.includes('--help') || args.includes('-h');

// Extract tools to install
const toolsIndex = args.indexOf('--tools');
const specificTools = toolsIndex !== -1 ? args.slice(toolsIndex + 1) : [];

function showHelp() {
  console.log(`
Enhanced CLI Installation Tool
==============================

This tool installs CLI tools with comprehensive permission handling
across all platforms (Windows, macOS, Linux).

USAGE:
  node enhanced-cli-install.js [options]

OPTIONS:
  --tools <tool1> <tool2>    Install specific tools only
  --check, -c               Check for missing tools only, don't install
  --verbose, -v             Show detailed installation information
  --help, -h                Show this help message

AVAILABLE TOOLS:
  claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

EXAMPLES:
  node enhanced-cli-install.js                    # Install all missing tools
  node enhanced-cli-install.js --tools claude gemini  # Install specific tools
  node enhanced-cli-install.js --check           # Check status only
  node enhanced-cli-install.js --verbose         # Detailed installation

PLATFORMS SUPPORTED:
  Windows (PowerShell, cmd, Git Bash, WSL)
  macOS (zsh, bash)
  Linux (bash, zsh, fish, csh, tcsh)

PERMISSION FEATURES:
- Automatic directory permission detection
- Intelligent working directory selection
- Cross-platform npm configuration
- Shell environment integration
- Installation retry logic
- Detailed error reporting

FOR MORE HELP:
- Run: stigmergy diagnostic  # System diagnostic
- Run: stigmergy help        # Show all commands
`);
}

async function main() {
  console.log('🚀 Enhanced CLI Installation Tool');
  console.log('=================================\n');

  if (isHelp) {
    showHelp();
    return;
  }

  try {
    // Step 1: Check current status
    console.log('📋 Step 1: Checking current CLI tool status...');
    const installer = new StigmergyInstaller();
    const scanResult = await installer.scanCLI();

    console.log(`✓ Found ${Object.keys(scanResult.available).length} available CLI tools`);
    console.log(`✗ Found ${Object.keys(scanResult.missing).length} missing CLI tools`);

    if (Object.keys(scanResult.missing).length === 0) {
      console.log('\n✅ All CLI tools are already installed!');
      console.log('\n🎯 Current Status:');
      for (const [toolName, toolInfo] of Object.entries(scanResult.available)) {
        const status = toolInfo.installed ? '✓ Installed' : '✗ Not Installed';
        console.log(`  ${status} ${toolInfo.name} (${toolName})`);
      }
      return;
    }

    if (isCheckOnly) {
      console.log('\n📋 Missing Tools:');
      for (const [toolName, toolInfo] of Object.entries(scanResult.missing)) {
        console.log(`  ✗ ${toolInfo.name} (${toolName})`);
        console.log(`    Install with: ${toolInfo.install}`);
      }
      console.log('\n💡 To install missing tools, run:');
      console.log('  node enhanced-cli-install.js');
      console.log('  stigmergy install');
      return;
    }

    // Step 2: Determine which tools to install
    let toolsToInstall = Object.keys(scanResult.missing);

    if (specificTools.length > 0) {
      toolsToInstall = specificTools.filter(tool => scanResult.missing[tool]);
      if (toolsToInstall.length === 0) {
        console.log('\n✅ All specified tools are already installed!');
        return;
      }
      console.log(`\n🎯 Installing specific tools: ${toolsToInstall.join(', ')}`);
    } else {
      console.log(`\n🎯 Installing all missing tools: ${toolsToInstall.join(', ')}`);
    }

    // Step 3: Install with enhanced permission handling
    console.log('\n📦 Step 2: Installing CLI tools with enhanced permission handling...');

    const enhancedInstaller = new EnhancedCLIInstaller({
      verbose: isVerbose,
      autoRetry: true,
      maxRetries: 2,
      timeout: 300000 // 5 minutes per tool
    });

    const installResult = await enhancedInstaller.installTools(toolsToInstall, scanResult.missing);

    // Step 4: Display results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Installation Summary');
    console.log('='.repeat(60));

    console.log(`📊 Results: ${installResult.results.successful}/${installResult.total} tools installed successfully`);

    if (installResult.results.success) {
      console.log('\n🎉 All selected tools installed successfully!');
    } else {
      console.log(`\n⚠️  ${installResult.results.failed} tools failed to install`);
    }

    // Show final status
    console.log('\n🔄 Final Status Check...');
    const finalScanResult = await installer.scanCLI();
    console.log(`✓ Now have ${Object.keys(finalScanResult.available).length} available CLI tools`);
    console.log(`✗ Still missing ${Object.keys(finalScanResult.missing).length} CLI tools`);

    if (Object.keys(finalScanResult.missing).length > 0) {
      console.log('\n📋 Still Missing:');
      for (const [toolName, toolInfo] of Object.entries(finalScanResult.missing)) {
        console.log(`  ✗ ${toolInfo.name} (${toolName})`);
      }
    }

    console.log('\n💡 Next Steps:');
    console.log('1. Verify installations: stigmergy status');
    console.log('2. Deploy integration hooks: stigmergy deploy');
    console.log('3. Start using: stigmergy help');

    if (installResult.results && installResult.results.permissionSetup) {
      console.log('\n🔧 Environment Setup:');
      console.log('- Working directory was automatically configured');
      console.log('- npm was configured to use a user-writable directory');
      console.log('- You may need to restart your terminal for PATH changes');
      console.log('- Shell environment was configured for persistence');
      console.log(`- Permission mode used: ${installResult.permissionMode}`);
    }

    // Detailed results for verbose mode
    if (isVerbose) {
      console.log('\n📋 Detailed Installation Report:');
      console.log(JSON.stringify(installResult.results, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    if (isVerbose) {
      console.error(error.stack);
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check permissions: stigmergy perm-check');
    console.log('2. Fix permissions: stigmergy fix-perms');
    console.log('3. System diagnostic: stigmergy diagnostic');
    console.log('4. Manual install: npm install -g @anthropic-ai/claude-code');

    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught Exception:', error.message);
  if (isVerbose) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { main };