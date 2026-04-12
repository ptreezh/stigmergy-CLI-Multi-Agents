#!/usr/bin/env node

/**
 * Install/Uninstall Test Script
 * Tests the complete installation and uninstallation workflow
 */

const fs = require('fs').promises;
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

class InstallUninstallTester {
  constructor() {
    this.currentDir = process.cwd();
    this.packageName = 'stigmergy';
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${timestamp}] [${level}] ${message}\x1b[0m`);
  }

  exec(command, description) {
    this.log(`Executing: ${description || command}`, 'INFO');
    const result = spawnSync(command, {
      stdio: 'pipe',
      shell: true,
      cwd: this.currentDir
    });

    if (result.status !== 0) {
      const error = result.stderr.toString() || result.stdout.toString();
      throw new Error(`Command failed: ${command}\nError: ${error}`);
    }

    this.log(`Success: ${description || command}`, 'OK');
    return result.stdout.toString();
  }

  async checkInstalled() {
    this.log('Checking if stigmergy is installed...', 'INFO');

    try {
      const result = spawnSync('stigmergy', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      return result.status === 0;
    } catch (e) {
      return false;
    }
  }

  async getCurrentVersion() {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    return packageJson.version;
  }

  async testUninstall() {
    this.log('\n=== Testing Uninstall Process ===\n', 'INFO');

    // Step 1: Check if installed
    const isInstalled = await this.checkInstalled();
    if (!isInstalled) {
      this.log('Stigmergy is not installed, skipping uninstall test', 'WARN');
      return;
    }

    // Step 2: Run npm unlink
    this.log('Running npm unlink -g...', 'INFO');
    try {
      this.exec('npm unlink -g', 'Uninstall stigmergy globally');
    } catch (error) {
      this.log(`npm unlink failed: ${error.message}`, 'WARN');
    }

    // Step 3: Verify command removed
    this.log('Verifying command is removed...', 'INFO');
    const stillInstalled = await this.checkInstalled();
    if (stillInstalled) {
      throw new Error('Command still works after npm unlink');
    }

    this.log('✅ Uninstall successful', 'OK');
  }

  async testInstall() {
    this.log('\n=== Testing Install Process ===\n', 'INFO');

    // Step 1: Check if already installed
    const wasInstalled = await this.checkInstalled();
    if (wasInstalled) {
      this.log('Stigmergy already installed, skipping install test', 'WARN');
      return;
    }

    // Step 2: Run npm link
    this.log('Running npm link -g...', 'INFO');
    this.exec('npm link -g', 'Install stigmergy globally');

    // Step 3: Verify command available
    this.log('Verifying command is available...', 'INFO');
    const isInstalled = await this.checkInstalled();
    if (!isInstalled) {
      throw new Error('Command not available after npm link');
    }

    // Step 4: Test basic functionality
    this.log('Testing basic functionality...', 'INFO');
    const version = this.exec('stigmergy --version', 'Test version command');
    if (!version || version.trim().length === 0) {
      throw new Error('Version command returned empty output');
    }

    this.log('✅ Install successful', 'OK');
  }

  async testReinstall() {
    this.log('\n=== Testing Reinstall Process ===\n', 'INFO');

    // Force reinstall
    this.log('Running npm link -g (reinstall)...', 'INFO');
    this.exec('npm link -g', 'Reinstall stigmergy globally');

    // Verify
    const isInstalled = await this.checkInstalled();
    if (!isInstalled) {
      throw new Error('Command not available after reinstall');
    }

    // Test functionality
    this.exec('stigmergy --version', 'Test version after reinstall');
    this.exec('stigmergy --help', 'Test help after reinstall');

    this.log('✅ Reinstall successful', 'OK');
  }

  async runFullTest() {
    try {
      // Get current version
      const version = await this.getCurrentVersion();
      this.log(`Testing Stigmergy v${version}`, 'INFO');
      this.log('Working directory: ' + this.currentDir, 'INFO');
      this.log(`Node.js version: ${process.version}`, 'INFO');
      this.log('OS: ' + os.platform(), 'INFO');

      // Test 1: Current installation
      if (await this.checkInstalled()) {
        this.log('Stigmergy is currently installed', 'INFO');
      } else {
        this.log('Stigmergy is not installed', 'INFO');
        await this.testInstall();
      }

      // Test 2: Uninstall
      if (process.argv.includes('--skip-uninstall')) {
        this.log('Skipping uninstall test (--skip-uninstall flag provided)', 'INFO');
      } else {
        await this.testUninstall();
        // Test 3: Reinstall after uninstall
        await this.testReinstall();
      }

      this.log('\n✅ All install/uninstall tests passed!', 'INFO');
      this.log('\n💡 You can now run the full test suite:', 'INFO');
      this.log('   node scripts/test-all-stigmergy.js', 'INFO');

    } catch (error) {
      this.log(`\n❌ Test failed: ${error.message}`, 'ERROR');
      this.log('\n💡 To fix issues:', 'INFO');
      this.log('   1. Check if dependencies are installed: npm install', 'INFO');
      this.log('   2. Try manual install: npm link -g', 'INFO');
      this.log('   3. Check Node.js version: node --version (should be >= 16.0.0)', 'INFO');
      throw error;
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new InstallUninstallTester();
  tester.runFullTest().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = InstallUninstallTester;
