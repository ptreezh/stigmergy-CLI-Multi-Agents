#!/usr/bin/env node

/**
 * Simple config test
 */

const { ClaudeAdapter } = require('./dist/lib');

console.log('üîß Testing Configuration...');

async function testConfig() {
  try {
    const adapter = new ClaudeAdapter();
    console.log('‚ú?Adapter created');

    console.log('Getting config...');
    const config = await adapter.getCLIConfig();

    console.log('‚ú?Config loaded:');
    console.log(`   Home: ${config.homeDir}`);
    console.log(`   Paths: ${config.sessionPaths.length}`);

    console.log('üéâ Config test passed!');

  } catch (error) {
    console.error('‚ù?Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConfig();
