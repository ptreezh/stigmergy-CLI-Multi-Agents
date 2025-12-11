/**
 * Safe Installation Cache Cleaner Test
 *
 * Tests that clean actual Stigmergy installations safely
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const CacheCleaner = require('../src/core/cache_cleaner');
const EnhancedUninstaller = require('../src/core/enhanced_uninstaller');

class SafeInstallationCleanerTest {
  constructor() {
    this.testResults = [];
    this.homeDir = os.homedir();
  }

  async runAllTests() {
    console.log('🧹 Running Safe Installation Cache Cleaner Tests...\n');

    try {
      await this.testCacheCleanerDryRun();
      await this.testUninstallerDryRun();
      await this.testSafeCacheCleaning();
      await this.testInstallationDetection();

      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.testResults.push({
        name: 'Test Suite',
        status: '❌',
        error: error.message
      });
    }
  }

  async testCacheCleanerDryRun() {
    console.log('🔍 TEST 1: Cache Cleaner Dry Run');

    try {
      const cleaner = new CacheCleaner({
        dryRun: true,
        verbose: true
      });

      // Check if Stigmergy installation exists
      const stigmergyDir = path.join(this.homeDir, '.stigmergy');
      const hasInstallation = fs.existsSync(stigmergyDir);

      console.log(`  📁 Stigmergy installation: ${hasInstallation ? 'Found' : 'Not found'}`);

      // Run dry run cache cleaning
      const results = await cleaner.cleanAllCaches({
        cleanStigmergy: true,
        cleanNPX: false,
        cleanNPM: false,
        cleanCLI: false,
        cleanTemp: false
      });

      // Verify dry run results
      this.assert(results.filesRemoved === 0, 'Dry run should not remove files');
      this.assert(results.bytesFreed === 0, 'Dry run should not free space');

      if (hasInstallation && results.filesRemoved === 0) {
        console.log('  ✅ Dry run correctly preserved files');
      }

      this.recordResult('Cache Cleaner Dry Run', '✅');

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      this.recordResult('Cache Cleaner Dry Run', '❌');
    }
  }

  async testUninstallerDryRun() {
    console.log('🗑️  TEST 2: Uninstaller Dry Run');

    try {
      const uninstaller = new EnhancedUninstaller({
        dryRun: true,
        verbose: false
      });

      // Check what would be uninstalled
      const plan = await uninstaller.createUninstallPlan();

      console.log(`  📋 Files that would be removed: ${plan.files.length}`);
      console.log(`  📁 Directories that would be removed: ${plan.directories.length}`);
      console.log(`  💾 Estimated space to free: ${this.formatBytes(plan.estimatedSize)}`);

      // Run dry uninstall
      const results = await uninstaller.completeUninstall();

      // Verify dry run results
      this.assert(results.filesRemoved === 0, 'Dry run should not remove files');
      this.assert(results.directoriesRemoved === 0, 'Dry run should not remove directories');

      this.recordResult('Uninstaller Dry Run', '✅');

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      this.recordResult('Uninstaller Dry Run', '❌');
    }
  }

  async testSafeCacheCleaning() {
    console.log('🧹 TEST 3: Safe Cache Cleaning');

    try {
      // Only clean temporary files that are safe to remove
      const cleaner = new CacheCleaner({
        dryRun: false,
        preserveRecent: 60 * 60 * 1000, // Preserve files from last hour
        force: true
      });

      // Only clean temporary files
      const results = await cleaner.cleanAllCaches({
        cleanStigmergy: false,
        cleanNPX: false,
        cleanNPM: false,
        cleanCLI: false,
        cleanTemp: true
      });

      console.log(`  🗑️  Temporary files removed: ${results.filesRemoved}`);
      console.log(`  💾 Space freed: ${this.formatBytes(results.bytesFreed)}`);

      this.recordResult('Safe Cache Cleaning', '✅');

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      this.recordResult('Safe Cache Cleaning', '❌');
    }
  }

  async testInstallationDetection() {
    console.log('🔍 TEST 4: Installation Detection');

    try {
      // Detect existing Stigmergy installations
      const installations = await this.detectInstallations();

      console.log(`  📊 Found ${installations.length} Stigmergy-related installations:`);

      installations.forEach((install, index) => {
        console.log(`    ${index + 1}. ${install.type}: ${install.path}`);
        console.log(`       Size: ${this.formatBytes(install.size)}`);
        console.log(`       Files: ${install.fileCount}`);
      });

      if (installations.length > 0) {
        console.log('\n  💡 Recommendations:');
        console.log('    - Use dry run mode before actual cleaning');
        console.log('    - Backup important configurations before uninstalling');
        console.log('    - Consider cleaning temporary files first');
      }

      this.recordResult('Installation Detection', '✅');

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      this.recordResult('Installation Detection', '❌');
    }
  }

  async detectInstallations() {
    const installations = [];
    const homeDir = this.homeDir;

    // Check main directories
    const checkPaths = [
      { path: path.join(homeDir, '.stigmergy'), type: 'Main Installation' },
      { path: path.join(homeDir, '.stigmergy-test'), type: 'Test Installation' },
      { path: path.join(homeDir, 'AppData', 'Local', 'npm-cache', '_npx'), type: 'NPX Cache' },
      { path: path.join(homeDir, '.npm', '_npx'), type: 'NPM Cache' }
    ];

    for (const check of checkPaths) {
      if (fs.existsSync(check.path)) {
        const stats = await this.getDirectoryStats(check.path);
        installations.push({
          type: check.type,
          path: check.path,
          size: stats.size,
          fileCount: stats.fileCount
        });
      }
    }

    // Check CLI configurations
    const supportedCLIs = ['claude', 'gemini', 'qwen', 'codebuddy'];
    for (const cli of supportedCLIs) {
      const cliPath = path.join(homeDir, `.${cli}`);
      if (fs.existsSync(cliPath)) {
        const stigmergyFiles = await this.countStigmergyFiles(cliPath);
        if (stigmergyFiles > 0) {
          installations.push({
            type: `${cli.toUpperCase()} Configuration`,
            path: cliPath,
            size: 0,
            fileCount: stigmergyFiles
          });
        }
      }
    }

    return installations;
  }

  async getDirectoryStats(dirPath) {
    let size = 0;
    let fileCount = 0;

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          const stats = await this.getDirectoryStats(fullPath);
          size += stats.size;
          fileCount += stats.fileCount;
        } else {
          try {
            const stat = fs.statSync(fullPath);
            size += stat.size;
            fileCount++;
          } catch (error) {
            // Skip files we can't stat
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return { size, fileCount };
  }

  async countStigmergyFiles(dirPath) {
    let count = 0;

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          count += await this.countStigmergyFiles(fullPath);
        } else if (this.isStigmergyFile(item.name)) {
          count++;
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return count;
  }

  isStigmergyFile(fileName) {
    const stigmergyPatterns = [
      'stigmergy',
      'cross-cli',
      'hook',
      'integration'
    ];

    const lowerFileName = fileName.toLowerCase();
    return stigmergyPatterns.some(pattern =>
      lowerFileName.includes(pattern.toLowerCase())
    );
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
    } else {
      console.log(`  ❌ ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  recordResult(testName, status) {
    this.testResults.push({ name: testName, status });
  }

  printResults() {
    console.log('\n📊 SAFE CLEANER TEST RESULTS:');
    console.log('=' .repeat(50));

    this.testResults.forEach(result => {
      if (result.error) {
        console.log(`${result.status} ${result.name}: ${result.error}`);
      } else {
        console.log(`${result.status} ${result.name}`);
      }
    });

    const passed = this.testResults.filter(r => r.status === '✅').length;
    const total = this.testResults.length;

    console.log('\n📈 Summary:');
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);

    if (passed === total) {
      console.log('\n🎉 All safe cleaner tests passed!');
      console.log('✅ Cache cleaning and uninstallation tools are working safely!');
    } else {
      console.log('\n❌ Some tests failed. Review the implementation.');
    }

    console.log('\n💡 Usage Recommendations:');
    console.log('1. Always use dry-run mode first: --dry-run');
    console.log('2. Clean temporary files before full uninstall: npm run clean-temp');
    console.log('3. Backup configurations before uninstalling');
    console.log('4. Use selective cleaning for specific targets');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new SafeInstallationCleanerTest();
  tests.runAllTests().catch(console.error);
}

module.exports = SafeInstallationCleanerTest;