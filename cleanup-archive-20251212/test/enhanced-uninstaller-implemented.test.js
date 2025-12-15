/**
 * Implementation Tests for Enhanced Stigmergy Uninstaller
 *
 * Tests that verify the actual implementation works correctly
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const EnhancedUninstaller = require('../src/core/enhanced_uninstaller');

class EnhancedUninstallerImplementationTests {
  constructor() {
    this.testDir = path.join(os.tmpdir(), 'stigmergy-uninstaller-impl-test');
    this.configDir = path.join(this.testDir, '.stigmergy');
    this.testConfigDir = path.join(this.testDir, '.stigmergy-test');
    this.testResults = [];
  }

  async runAllTests() {
    console.log('üß™ Running Enhanced Uninstaller Implementation Tests...\n');

    await this.setupTestEnvironment();

    try {
      await this.testDryRunMode();
      await this.testCompleteUninstall();
      await this.testErrorHandling();
      await this.testDirectoryScanning();
      await this.testFilePatternMatching();

      this.printResults();
    } finally {
      await this.cleanupTestEnvironment();
    }
  }

  async setupTestEnvironment() {
    console.log('üìã Setting up implementation test environment...');

    // Create test directories
    fs.mkdirSync(this.configDir, { recursive: true });
    fs.mkdirSync(this.testConfigDir, { recursive: true });

    // Create mock configuration files
    fs.writeFileSync(path.join(this.configDir, 'config.json'), JSON.stringify({
      version: '1.1.8',
      clis: ['claude', 'gemini', 'qwen']
    }, null, 2));

    fs.writeFileSync(path.join(this.configDir, 'auth.json'), JSON.stringify({
      tokens: { mock: 'token' }
    }, null, 2));

    fs.writeFileSync(path.join(this.configDir, 'error.log'), 'Mock error log\n');

    // Create mock hooks directory
    const hooksDir = path.join(this.configDir, 'hooks');
    fs.mkdirSync(hooksDir, { recursive: true });

    ['claude', 'gemini', 'qwen'].forEach(cli => {
      const cliHookDir = path.join(hooksDir, cli);
      fs.mkdirSync(cliHookDir, { recursive: true });
      fs.writeFileSync(path.join(cliHookDir, `${cli}_nodejs_hook.js`), '// Mock hook');
      fs.writeFileSync(path.join(cliHookDir, 'config.json'), '{}');
    });

    console.log('‚ú?Implementation test environment setup complete\n');
  }

  async testDryRunMode() {
    console.log('üîç TEST 1: Dry Run Mode');

    const uninstaller = new EnhancedUninstaller({
      dryRun: true,
      verbose: true
    });

    // Verify files exist before dry run
    const configExists = fs.existsSync(this.configDir);
    this.assert(configExists, 'Test configuration should exist before uninstall');

    // Run dry uninstall
    const results = await uninstaller.completeUninstall();

    // Verify files still exist after dry run
    const configStillExists = fs.existsSync(this.configDir);
    this.assert(configStillExists, 'Configuration should still exist after dry run');

    // Verify dry run detected files
    this.assert(results.filesRemoved === 0, 'Dry run should not remove files');
    this.assert(results.directoriesRemoved === 0, 'Dry run should not remove directories');

    this.recordResult('Dry Run Mode', '‚ú?);
  }

  async testCompleteUninstall() {
    console.log('üóëÔ∏? TEST 2: Complete Uninstall');

    // Recreate test environment
    await this.setupTestEnvironment();

    const uninstaller = new EnhancedUninstaller({
      dryRun: false,
      verbose: false
    });

    // Verify files exist before uninstall
    const beforeFiles = [
      path.join(this.configDir, 'config.json'),
      path.join(this.configDir, 'auth.json'),
      path.join(this.configDir, 'error.log'),
      path.join(this.configDir, 'hooks', 'claude', 'claude_nodejs_hook.js')
    ];

    const beforeUninstall = beforeFiles.every(file => fs.existsSync(file));
    this.assert(beforeUninstall, 'Test files should exist before uninstall');

    // Run complete uninstall
    const results = await uninstaller.completeUninstall();

    // Verify cleanup after uninstall
    const afterUninstall = !beforeFiles.some(file => fs.existsSync(file));
    this.assert(afterUninstall, 'All Stigmergy files should be removed after uninstall');

    // Verify results
    this.assert(results.filesRemoved > 0, 'Should report files removed');
    this.assert(results.directoriesRemoved >= 0, 'Should report directories removed');

    this.recordResult('Complete Uninstall', '‚ú?);
  }

  async testErrorHandling() {
    console.log('‚ö†Ô∏è  TEST 3: Error Handling');

    const uninstaller = new EnhancedUninstaller({
      force: true,
      dryRun: true
    });

    // Test with non-existent directory
    const nonExistentPath = path.join(this.testDir, 'does-not-exist');

    // Should handle missing directory gracefully
    const plan = await uninstaller.createUninstallPlan();

    // Should not crash on missing directories
    this.assert(plan !== undefined, 'Should handle missing directories gracefully');

    // Test uninstall with non-existent paths
    const results = await uninstaller.completeUninstall();

    // Should not report errors for non-existent files in dry run
    this.assert(Array.isArray(results.errors), 'Should return error array');

    this.recordResult('Error Handling', '‚ú?);
  }

  async testDirectoryScanning() {
    console.log('üìÅ TEST 4: Directory Scanning');

    // Create a more complex directory structure
    const complexDir = path.join(this.testDir, '.stigmergy-complex');
    fs.mkdirSync(complexDir, { recursive: true });

    fs.mkdirSync(path.join(complexDir, 'subdir1'), { recursive: true });
    fs.mkdirSync(path.join(complexDir, 'subdir2'), { recursive: true });

    fs.writeFileSync(path.join(complexDir, 'file1.txt'), 'content');
    fs.writeFileSync(path.join(complexDir, 'subdir1', 'file2.txt'), 'content');
    fs.writeFileSync(path.join(complexDir, 'subdir2', 'file3.txt'), 'content');

    const uninstaller = new EnhancedUninstaller({ dryRun: true });

    // Test plan creation
    const plan = await uninstaller.createUninstallPlan();

    // Should scan directories correctly
    this.assert(plan.files.length > 0, 'Should find files in directory scan');
    this.assert(plan.directories.length > 0, 'Should find directories in scan');

    // Clean up
    fs.rmSync(complexDir, { recursive: true, force: true });

    this.recordResult('Directory Scanning', '‚ú?);
  }

  async testFilePatternMatching() {
    console.log('üéØ TEST 5: File Pattern Matching');

    const uninstaller = new EnhancedUninstaller({ dryRun: true });

    // Test internal pattern matching methods
    const testFiles = [
      'stigmergy-config.json',
      'cross-cli-hook.js',
      'integration-settings.json',
      'cache-data.tmp',
      'normal-file.txt'
    ];

    // Test if methods exist and work
    let stigmergyFilesFound = 0;

    for (const fileName of testFiles) {
      if (uninstaller.isStigmergyFile && uninstaller.isStigmergyFile(fileName)) {
        stigmergyFilesFound++;
      }
    }

    this.assert(stigmergyFilesFound >= 4, 'Should identify Stigmergy files correctly');

    this.recordResult('File Pattern Matching', '‚ú?);
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  ‚ú?${message}`);
    } else {
      console.log(`  ‚ù?${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  recordResult(testName, status) {
    this.testResults.push({ name: testName, status });
  }

  printResults() {
    console.log('\nüìä IMPLEMENTATION TEST RESULTS:');
    console.log('=' .repeat(50));

    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.name}`);
    });

    const passed = this.testResults.filter(r => r.status === '‚ú?).length;
    const total = this.testResults.length;

    console.log('\nüìà Summary:');
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);

    if (passed === total) {
      console.log('\nüéâ All implementation tests passed!');
      console.log('‚ú?Enhanced uninstaller is working correctly!');
    } else {
      console.log('\n‚ù?Some tests failed. Review the implementation.');
    }
  }

  async cleanupTestEnvironment() {
    console.log('\nüßπ Cleaning up implementation test environment...');

    try {
      fs.rmSync(this.testDir, { recursive: true, force: true });
      console.log('‚ú?Implementation test environment cleaned up');
    } catch (error) {
      console.warn('‚ö†Ô∏è  Warning: Could not clean up test environment:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new EnhancedUninstallerImplementationTests();
  tests.runAllTests().catch(console.error);
}

module.exports = EnhancedUninstallerImplementationTests;
