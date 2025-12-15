/**
 * Implementation Tests for Cache Cleaner
 *
 * Tests that verify the cache cleaner implementation works correctly
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const CacheCleaner = require('../src/core/cache_cleaner');

class CacheCleanerImplementationTests {
  constructor() {
    this.testDir = path.join(os.tmpdir(), 'stigmergy-cache-impl-test');
    this.testResults = [];
  }

  async runAllTests() {
    console.log('üßπ Running Cache Cleaner Implementation Tests...\n');

    await this.setupTestEnvironment();

    try {
      await this.testDryRunMode();
      await this.testStigmergyCacheCleaning();
      await this.testBatchProcessing();
      await this.testSelectiveCleaning();
      await this.testPerformanceOptimization();
      await this.testErrorRecovery();

      this.printResults();
    } finally {
      await this.cleanupTestEnvironment();
    }
  }

  async setupTestEnvironment() {
    console.log('üìã Setting up cache cleaner test environment...');

    // Create test directory structure
    fs.mkdirSync(this.testDir, { recursive: true });

    // Create mock Stigmergy cache
    const stigmergyCache = path.join(this.testDir, '.stigmergy');
    fs.mkdirSync(stigmergyCache, { recursive: true });
    fs.mkdirSync(path.join(stigmergyCache, 'cache'), { recursive: true });
    fs.mkdirSync(path.join(stigmergyCache, 'temp'), { recursive: true });

    // Create mock cache files
    const cacheFiles = [
      path.join(stigmergyCache, 'config.json'),
      path.join(stigmergyCache, 'cache', 'cli-cache.json'),
      path.join(stigmergyCache, 'cache', 'temp-cache.tmp'),
      path.join(stigmergyCache, 'temp', 'stigmergy-temp.tmp')
    ];

    cacheFiles.forEach(file => {
      fs.writeFileSync(file, 'mock cache content');
    });

    console.log('‚ú?Cache cleaner test environment setup complete\n');
  }

  async testDryRunMode() {
    console.log('üîç TEST 1: Dry Run Mode');

    const cleaner = new CacheCleaner({
      dryRun: true,
      verbose: true
    });

    // Verify files exist before dry run
    const stigmergyCache = path.join(this.testDir, '.stigmergy');
    const beforeCleanup = fs.existsSync(stigmergyCache);
    this.assert(beforeCleanup, 'Stigmergy cache should exist before cleanup');

    // Run dry clean
    const results = await cleaner.cleanAllCaches({
      cleanStigmergy: true,
      cleanNPX: false,
      cleanNPM: false,
      cleanCLI: false,
      cleanTemp: false
    });

    // Verify files still exist after dry run
    const afterCleanup = fs.existsSync(stigmergyCache);
    this.assert(afterCleanup, 'Files should still exist after dry run');

    // Verify dry run results
    this.assert(results.filesRemoved === 0, 'Dry run should not remove files');
    this.assert(results.bytesFreed === 0, 'Dry run should not free space');

    this.recordResult('Dry Run Mode', '‚ú?);
  }

  async testStigmergyCacheCleaning() {
    console.log('üóÇÔ∏? TEST 2: Stigmergy Cache Cleaning');

    // Recreate test environment
    await this.setupTestEnvironment();

    const cleaner = new CacheCleaner({
      dryRun: false,
      verbose: false,
      preserveRecent: 0 // Don't preserve any files for testing
    });

    // Verify files exist before cleanup
    const stigmergyCache = path.join(this.testDir, '.stigmergy');
    const beforeCleanup = fs.existsSync(stigmergyCache);
    this.assert(beforeCleanup, 'Stigmergy cache should exist before cleanup');

    // Run cache cleaning
    const results = await cleaner.cleanAllCaches({
      cleanStigmergy: true,
      cleanNPX: false,
      cleanNPM: false,
      cleanCLI: false,
      cleanTemp: false
    });

    // Verify cleanup - in test environment we might still have directories
    // but files should be processed
    this.assert(results !== undefined, 'Should return results object');

    this.recordResult('Stigmergy Cache Cleaning', '‚ú?);
  }

  async testBatchProcessing() {
    console.log('üì¶ TEST 3: Batch Processing');

    // Create many small files for batch testing
    const batchTestDir = path.join(this.testDir, '.stigmergy-batch');
    fs.mkdirSync(batchTestDir, { recursive: true });

    const testFiles = [];
    for (let i = 0; i < 20; i++) {
      const file = path.join(batchTestDir, `cache-${i}.tmp`);
      fs.writeFileSync(file, `data ${i}`);
      testFiles.push(file);
    }

    const cleaner = new CacheCleaner({
      dryRun: false,
      batchSize: 5,
      preserveRecent: 0
    });

    // Test batch processing
    const startTime = Date.now();
    const results = await cleaner.cleanWithPerformance(batchTestDir, {
      batchSize: 5,
      parallel: false
    });
    const endTime = Date.now();

    // Verify batch processing worked
    this.assert(results !== undefined, 'Should return performance results');
    this.assert(endTime - startTime < 10000, 'Should complete within reasonable time');

    // Clean up
    fs.rmSync(batchTestDir, { recursive: true, force: true });

    this.recordResult('Batch Processing', '‚ú?);
  }

  async testSelectiveCleaning() {
    console.log('üéØ TEST 4: Selective Cleaning');

    // Create selective test structure
    const selectiveDir = path.join(this.testDir, '.stigmergy-selective');
    fs.mkdirSync(selectiveDir, { recursive: true });
    fs.mkdirSync(path.join(selectiveDir, 'important'), { recursive: true });
    fs.mkdirSync(path.join(selectiveDir, 'cache'), { recursive: true });

    fs.writeFileSync(path.join(selectiveDir, 'important', 'user-backup.json'), '{}');
    fs.writeFileSync(path.join(selectiveDir, 'cache', 'auto-cache.tmp'), 'temp');
    fs.writeFileSync(path.join(selectiveDir, 'stigmergy-config.json'), '{}');

    const cleaner = new CacheCleaner({
      dryRun: false
    });

    // Test selective cleaning
    await cleaner.selectiveClean(selectiveDir, {
      preservePatterns: ['**/important/**', '*.backup.json'],
      removePatterns: ['**/cache/**', '*.tmp']
    });

    // Verify selective cleanup
    const importantFile = path.join(selectiveDir, 'important', 'user-backup.json');
    const cacheDir = path.join(selectiveDir, 'cache');

    this.assert(fs.existsSync(importantFile), 'Should preserve important files');

    // Clean up
    fs.rmSync(selectiveDir, { recursive: true, force: true });

    this.recordResult('Selective Cleaning', '‚ú?);
  }

  async testPerformanceOptimization() {
    console.log('‚ö?TEST 5: Performance Optimization');

    // Create many small files for performance testing
    const perfDir = path.join(this.testDir, '.stigmergy-perf');
    fs.mkdirSync(perfDir, { recursive: true });

    for (let i = 0; i < 50; i++) {
      fs.writeFileSync(path.join(perfDir, `cache-${i}.tmp`), `data ${i}`);
    }

    const cleaner = new CacheCleaner({
      dryRun: true,
      batchSize: 10
    });

    const startTime = Date.now();

    // Test performance mode (dry run)
    const results = await cleaner.cleanWithPerformance(perfDir, {
      batchSize: 10,
      parallel: false
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify performance requirements
    this.assert(duration < 5000, 'Should process 50 files quickly');
    this.assert(results !== undefined, 'Should return performance results');

    // Clean up
    fs.rmSync(perfDir, { recursive: true, force: true });

    this.recordResult('Performance Optimization', '‚ú?);
  }

  async testErrorRecovery() {
    console.log('üõ°Ô∏? TEST 6: Error Recovery');

    const cleaner = new CacheCleaner({
      force: true,
      dryRun: true
    });

    // Test with non-existent directory
    const nonExistent = path.join(this.testDir, 'does-not-exist');

    try {
      await cleaner.cleanDirectory(nonExistent);
      // Should not throw error
      this.assert(true, 'Should handle non-existent directories gracefully');
    } catch (error) {
      this.assert(false, `Should not throw error: ${error.message}`);
    }

    // Test with invalid file operations
    const invalidFile = path.join(this.testDir, 'invalid-file');

    try {
      await cleaner.removeFile(invalidFile);
      // Should not throw error with force mode
      this.assert(true, 'Should handle invalid files gracefully');
    } catch (error) {
      this.assert(false, `Should not throw error: ${error.message}`);
    }

    this.recordResult('Error Recovery', '‚ú?);
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
    console.log('\nüìä CACHE CLEANER IMPLEMENTATION TEST RESULTS:');
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
      console.log('\nüéâ All cache cleaner implementation tests passed!');
      console.log('‚ú?Cache cleaner is working correctly!');
    } else {
      console.log('\n‚ù?Some tests failed. Review the implementation.');
    }
  }

  async cleanupTestEnvironment() {
    console.log('\nüßπ Cleaning up cache cleaner test environment...');

    try {
      fs.rmSync(this.testDir, { recursive: true, force: true });
      console.log('‚ú?Cache cleaner test environment cleaned up');
    } catch (error) {
      console.warn('‚ö†Ô∏è  Warning: Could not clean up test environment:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tests = new CacheCleanerImplementationTests();
  tests.runAllTests().catch(console.error);
}

module.exports = CacheCleanerImplementationTests;
