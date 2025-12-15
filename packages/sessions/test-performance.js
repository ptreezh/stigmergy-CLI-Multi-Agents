#!/usr/bin/env node

/**
 * Test performance and memory management features
 */

const { SessionScanner, ClaudeAdapter, Logger, LogLevel } = require('./dist/lib');

console.log('‚ö?Performance & Memory Management Test...');

async function testPerformance() {
  try {
    // Set logger to INFO to reduce noise during performance test
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.INFO);

    console.log('\nüîß Setting up scanner...');
    const adapter = new ClaudeAdapter();
    const scanner = new SessionScanner([adapter]);

    console.log('‚ú?Scanner initialized');

    // Test 1: Cache performance
    console.log('\nüìä Testing cache performance...');
    const start1 = Date.now();

    // First scan (should populate cache)
    const sessions1 = await scanner.scanAllSessions();
    const firstScanTime = Date.now() - start1;

    // Second scan (should use cache)
    const start2 = Date.now();
    const sessions2 = await scanner.scanAllSessions();
    const secondScanTime = Date.now() - start2;

    console.log(`   First scan: ${firstScanTime}ms (${sessions1.length} sessions)`);
    console.log(`   Second scan: ${secondScanTime}ms (${sessions2.length} sessions)`);
    console.log(`   Cache speedup: ${firstScanTime > 0 ? Math.round((firstScanTime - secondScanTime) / firstScanTime * 100) : 0}%`);

    // Test 2: Memory management with options
    console.log('\nüíæ Testing memory management...');
    const optionsTests = [
      { name: 'No limits', options: {} },
      { name: 'Max 10 sessions', options: { maxSessions: 10 } },
      { name: 'Min 5 messages', options: { minMessages: 5 } },
      { name: 'Max 30 days old', options: { maxAgeDays: 30 } }
    ];

    for (const test of optionsTests) {
      const start = Date.now();
      const filteredSessions = await scanner.scanAllSessions(test.options);
      const time = Date.now() - start;

      console.log(`   ${test.name}: ${time}ms (${filteredSessions.length} sessions)`);
    }

    // Test 3: Search performance
    console.log('\nüîç Testing search performance...');
    const searchTests = ['test', 'session', 'claude', 'user', 'message'];

    for (const searchTerm of searchTests) {
      const start = Date.now();
      const searchResults = await scanner.searchSessions(searchTerm);
      const time = Date.now() - start;

      console.log(`   Search "${searchTerm}": ${time}ms (${searchResults.length} results)`);
    }

    // Test 4: Statistics performance
    console.log('\nüìà Testing statistics generation...');
    const start = Date.now();
    const stats = await scanner.getSessionStatistics();
    const time = Date.now() - start;

    console.log(`   Statistics: ${time}ms`);
    console.log(`   Total sessions: ${stats.totalSessions}`);
    console.log(`   Total messages: ${stats.totalMessages}`);
    console.log(`   Average messages/session: ${stats.averageMessagesPerSession.toFixed(2)}`);
    if (stats.totalSizeBytes) {
      console.log(`   Total size: ${Math.round(stats.totalSizeBytes / 1024)}KB`);
    }

    // Test 5: Cache management
    console.log('\nüóÑÔ∏? Testing cache management...');
    console.log(`   Cache entries before clear: ${scanner.getCacheSize ? scanner.getCacheSize() : 'N/A'}`);

    scanner.clearCache();
    console.log('   ‚ú?Cache cleared');

    // Test 6: Concurrent operations
    console.log('\n‚ö?Testing concurrent operations...');
    const concurrentStart = Date.now();

    const promises = [
      scanner.scanAllSessions({ maxSessions: 5 }),
      scanner.scanAllSessions({ minMessages: 1 }),
      scanner.searchSessions('test'),
      scanner.getSessionStatistics()
    ];

    const results = await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;

    console.log(`   Concurrent operations: ${concurrentTime}ms`);
    console.log(`   Results: ${results.map(r => Array.isArray(r) ? r.length : 'stats').join(', ')}`);

    console.log('\nüéâ Performance test completed successfully!');

    // Test 7: Memory usage summary
    if (global.gc) {
      global.gc(); // Force garbage collection if available
      const memUsage = process.memoryUsage();
      console.log('\nüíæ Memory Usage Summary:');
      console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
      console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    }

  } catch (error) {
    console.error('‚ù?Performance test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPerformance();
