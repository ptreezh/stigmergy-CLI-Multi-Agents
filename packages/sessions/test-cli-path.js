#!/usr/bin/env node

/**
 * Test CLI path detection functionality
 */

const { ClaudeAdapter } = require('./dist/lib');

console.log('üîç Testing CLI Path Detection...');

async function testCLIPath() {
  try {
    const adapter = new ClaudeAdapter();
    console.log('‚ú?Claude adapter initialized');

    // Test CLI path detection
    console.log('\nüõ§Ô∏? Testing CLI path detection...');
    const cliPath = await adapter.getCLIPath();

    if (cliPath) {
      console.log(`‚ú?Claude CLI found at: ${cliPath}`);

      // Verify the path actually exists
      const fs = require('fs-extra');
      if (fs.existsSync(cliPath)) {
        console.log('‚ú?Path verification: File exists');
      } else {
        console.log('‚ö†Ô∏è  Path verification: File does not exist');
      }
    } else {
      console.log('‚ù?Claude CLI not found in system PATH');
    }

    // Test availability check
    console.log('\nüì° Testing availability check...');
    const isAvailable = await adapter.isAvailable();
    console.log(`‚ú?Availability check result: ${isAvailable ? 'Available' : 'Not Available'}`);

    // Test configuration loading
    console.log('\n‚öôÔ∏è  Testing configuration loading...');
    try {
      const config = await adapter.getCLIConfig();
      console.log('‚ú?Configuration loaded successfully');
      console.log(`   Home Directory: ${config.homeDir}`);
      console.log(`   Session Paths: ${config.sessionPaths.length} found`);

      // Test session path validation
      console.log('\nüìÇ Testing session path validation...');
      for (let i = 0; i < config.sessionPaths.length; i++) {
        const sessionPath = config.sessionPaths[i];
        console.log(`   Path ${i + 1}: ${sessionPath}`);

        if (fs.existsSync(sessionPath)) {
          const stats = fs.statSync(sessionPath);
          console.log(`     ‚ú?Exists (${stats.isDirectory() ? 'Directory' : 'File'})`);

          if (stats.isDirectory()) {
            try {
              const files = fs.readdirSync(sessionPath);
              console.log(`     üìÅ Contains ${files.length} items`);
            } catch (err) {
              console.log(`     ‚ö†Ô∏è  Cannot read directory: ${err.message}`);
            }
          }
        } else {
          console.log(`     ‚ù?Does not exist`);
        }
      }

    } catch (configError) {
      console.log(`‚ù?Configuration loading failed: ${configError.message}`);
    }

    console.log('\nüéâ CLI path detection test completed!');

  } catch (error) {
    console.error('‚ù?Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCLIPath();
