/**
 * Comprehensive Enhanced Features Test
 *
 * Tests all enhanced installation and uninstallation features together
 */

const EnhancedInstaller = require('../src/core/enhanced_installer');
const EnhancedUninstaller = require('../src/core/enhanced_uninstaller');
const CacheCleaner = require('../src/core/cache_cleaner');

class ComprehensiveEnhancedFeaturesTest {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('ğŸ§ª Running Comprehensive Enhanced Features Tests...\n');

    try {
      await this.testEnhancedInstallerPlan();
      await this.testCacheCleanerStandalone();
      await this.testEnhancedUninstallerPlan();
      await this.testIntegrationWorkflow();

      this.printResults();
    } catch (error) {
      console.error('â?Test suite failed:', error.message);
      this.testResults.push({
        name: 'Test Suite',
        status: 'â?,
        error: error.message
      });
    }
  }

  async testEnhancedInstallerPlan() {
    console.log('ğŸ“‹ TEST 1: Enhanced Installer Plan Creation');

    try {
      const installer = new EnhancedInstaller({
        dryRun: true,
        verbose: false
      });

      // Create installation plan
      const plan = await installer.createInstallationPlan();

      // Verify plan structure
      this.assert(plan !== undefined, 'Should create installation plan');
      this.assert(typeof plan.estimatedTime === 'number', 'Should estimate installation time');
      this.assert(typeof plan.estimatedSpace === 'number', 'Should estimate required space');

      console.log(`  âœ?Plan created with ${plan.installation.toolCount} tools to install`);
      console.log(`  â±ï¸  Estimated time: ${Math.ceil(plan.estimatedTime / 1000)} seconds`);
      console.log(`  ğŸ’¾ Estimated space: ${this.formatBytes(plan.estimatedSpace)}`);

      this.recordResult('Enhanced Installer Plan', 'âœ?);

    } catch (error) {
      console.log(`  â?Error: ${error.message}`);
      this.recordResult('Enhanced Installer Plan', 'â?);
    }
  }

  async testCacheCleanerStandalone() {
    console.log('ğŸ§¹ TEST 2: Cache Cleaner Standalone');

    try {
      const cleaner = new CacheCleaner({
        dryRun: true,
        verbose: false
      });

      // Test selective cleaning
      const testDir = require('os').tmpdir();
      await cleaner.selectiveClean(testDir, {
        preservePatterns: ['*.log'],
        removePatterns: ['*.tmp']
      });

      // Test performance mode (dry run)
      await cleaner.cleanWithPerformance(testDir, {
        batchSize: 10,
        parallel: false
      });

      console.log('  âœ?Selective cleaning test passed');
      console.log('  âœ?Performance mode test passed');

      this.recordResult('Cache Cleaner Standalone', 'âœ?);

    } catch (error) {
      console.log(`  â?Error: ${error.message}`);
      this.recordResult('Cache Cleaner Standalone', 'â?);
    }
  }

  async testEnhancedUninstallerPlan() {
    console.log('ğŸ—‘ï¸? TEST 3: Enhanced Uninstaller Plan');

    try {
      const uninstaller = new EnhancedUninstaller({
        dryRun: true,
        verbose: false
      });

      // Create uninstall plan
      const plan = await uninstaller.createUninstallPlan();

      // Verify plan structure
      this.assert(plan !== undefined, 'Should create uninstall plan');
      this.assert(Array.isArray(plan.files), 'Should list files to remove');
      this.assert(Array.isArray(plan.directories), 'Should list directories to remove');

      console.log(`  âœ?Uninstall plan created`);
      console.log(`  ğŸ“ Files to remove: ${plan.files.length}`);
      console.log(`  ğŸ“‚ Directories to remove: ${plan.directories.length}`);
      console.log(`  ğŸ’¾ Estimated space to free: ${this.formatBytes(plan.estimatedSize)}`);

      this.recordResult('Enhanced Uninstaller Plan', 'âœ?);

    } catch (error) {
      console.log(`  â?Error: ${error.message}`);
      this.recordResult('Enhanced Uninstaller Plan', 'â?);
    }
  }

  async testIntegrationWorkflow() {
    console.log('ğŸ”„ TEST 4: Integration Workflow');

    try {
      // Test 1: Cache cleaner dry run
      const cleaner = new CacheCleaner({ dryRun: true });
      const cleanResults = await cleaner.cleanAllCaches({
        cleanStigmergy: false,
        cleanNPX: false,
        cleanNPM: false,
        cleanCLI: false,
        cleanTemp: true
      });

      this.assert(cleanResults.filesRemoved === 0, 'Dry run should not remove files');

      // Test 2: Enhanced installer dry run
      const installer = new EnhancedInstaller({
        dryRun: true,
        cleanBeforeInstall: true,
        cleanTempFiles: true
      });

      const installResults = await installer.enhancedInstall({
        cleanStigmergy: false,
        cleanNPX: false,
        cleanNPM: false,
        cleanCLI: false,
        cleanTemp: true
      });

      this.assert(installResults.cacheCleaning.success, 'Cache cleaning should succeed in dry run');

      // Test 3: Enhanced uninstaller dry run
      const uninstaller = new EnhancedUninstaller({ dryRun: true });
      const uninstallResults = await uninstaller.completeUninstall();

      this.assert(uninstallResults.filesRemoved === 0, 'Dry run uninstall should not remove files');

      console.log('  âœ?Cache cleaner workflow test passed');
      console.log('  âœ?Enhanced installer workflow test passed');
      console.log('  âœ?Enhanced uninstaller workflow test passed');

      this.recordResult('Integration Workflow', 'âœ?);

    } catch (error) {
      console.log(`  â?Error: ${error.message}`);
      this.recordResult('Integration Workflow', 'â?);
    }
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  âœ?${message}`);
    } else {
      console.log(`  â?${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  recordResult(testName, status) {
    this.testResults.push({ name: testName, status });
  }

  printResults() {
    console.log('\nğŸ“Š COMPREHENSIVE ENHANCED FEATURES TEST RESULTS:');
    console.log('=' .repeat(60));

    this.testResults.forEach(result => {
      if (result.error) {
        console.log(`${result.status} ${result.name}: ${result.error}`);
      } else {
        console.log(`${result.status} ${result.name}`);
      }
    });

    const passed = this.testResults.filter(r => r.status === 'âœ?).length;
    const total = this.testResults.length;

    console.log('\nğŸ“ˆ Summary:');
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);

    if (passed === total) {
      console.log('\nğŸ‰ All enhanced features tests passed!');
      console.log('âœ?Enhanced installation and uninstallation features are ready!');
      console.log('\nğŸ“š Available Features:');
      console.log('  ğŸ” Dry run mode for all operations');
      console.log('  ğŸ§¹ Comprehensive cache cleaning');
      console.log('  ğŸ“¦ Enhanced installer with pre-cleaning');
      console.log('  ğŸ—‘ï¸? Complete uninstaller with full cleanup');
      console.log('  âš?Performance-optimized operations');
      console.log('  ğŸ¯ Selective cleaning with patterns');
      console.log('  ğŸ›¡ï¸? Error recovery and force mode');
    } else {
      console.log('\nâ?Some tests failed. Review the implementation.');
    }

    console.log('\nğŸ’¡ Usage Examples:');
    console.log('  # Create installation plan');
    console.log('  node -e "const EI=require(\'./src/core/enhanced_installer\'); new EI().createInstallationPlan()"');
    console.log('');
    console.log('  # Quick cache clean');
    console.log('  node -e "const EI=require(\'./src/core/enhanced_installer\'); new EI().quickCacheClean()"');
    console.log('');
    console.log('  # Dry run uninstall');
    console.log('  node -e "const EU=require(\'./src/core/enhanced_uninstaller\'); new EU({dryRun:true}).completeUninstall()"');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new ComprehensiveEnhancedFeaturesTest();
  tests.runAllTests().catch(console.error);
}

module.exports = ComprehensiveEnhancedFeaturesTest;
