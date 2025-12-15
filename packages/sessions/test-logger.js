#!/usr/bin/env node

/**
 * Test Logger functionality
 */

const { Logger, LogLevel, ClaudeAdapter } = require('./dist/lib');

console.log('📝 Testing Logger System...');

async function testLogger() {
  try {
    // Set log level to DEBUG to see all messages
    const logger = Logger.getInstance();
    logger.setLogLevel(LogLevel.DEBUG);

    console.log('\n🔧 Testing basic logging...');

    // Test basic logging
    Logger.adapterInfo('Test adapter info message');
    Logger.adapterWarn('Test adapter warning message');
    Logger.adapterError('Test adapter error message', new Error('Test error'));
    Logger.adapterDebug('Test adapter debug message', { test: 'metadata' });

    console.log('\n🔍 Testing adapter with logging...');

    // Test adapter with logging
    const adapter = new ClaudeAdapter();
    const isAvailable = await adapter.isAvailable();

    console.log(`\n�?Adapter availability: ${isAvailable}`);

    console.log('\n📊 Testing log retrieval...');

    // Test log retrieval
    const errorLogs = logger.getLogs(LogLevel.ERROR);
    const adapterLogs = logger.getLogs(undefined, 'ADAPTER');

    console.log(`   Error logs: ${errorLogs.length}`);
    console.log(`   Adapter logs: ${adapterLogs.length}`);

    console.log('\n💾 Testing log export...');

    // Test log export
    const exportedLogs = logger.exportLogs();
    console.log(`   Exported logs size: ${exportedLogs.length} characters`);

    console.log('\n🎉 Logger test completed successfully!');

  } catch (error) {
    console.error('�?Logger test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLogger();
