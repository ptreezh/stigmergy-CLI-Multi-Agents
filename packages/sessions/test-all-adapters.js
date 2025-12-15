#!/usr/bin/env node

/**
 * Test all CLI adapters for cross-CLI session recovery
 */

const {
  ClaudeAdapter,
  GeminiAdapter,
  QwenAdapter,
  IFlowAdapter,
  CodeBuddyAdapter,
  QoderCLIAdapter,
  CodexAdapter,
  CLIDiscovery,
  SessionScanner
} = require('./dist/lib');

console.log('üåç Cross-CLI Session Recovery System Test');
console.log('=======================================\n');

async function testAllAdapters() {
  const adapters = [
    new ClaudeAdapter(),
    new GeminiAdapter(),
    new QwenAdapter(),
    new IFlowAdapter(),
    new CodeBuddyAdapter(),
    new QoderCLIAdapter(),
    new CodexAdapter()
  ];

  console.log(`üîß Testing ${adapters.length} CLI Adapters...\n`);

  for (let i = 0; i < adapters.length; i++) {
    const adapter = adapters[i];
    console.log(`${i + 1}. ${adapter.name} (${adapter.cliType})`);
    console.log(`   Version: ${adapter.version}`);

    try {
      // Test availability
      const isAvailable = await adapter.isAvailable();
      console.log(`   Available: ${isAvailable ? '‚ú?Yes' : '‚ù?No'}`);

      if (isAvailable) {
        // Test configuration
        try {
          const config = await adapter.getCLIConfig();
          console.log(`   Session paths: ${config.sessionPaths.length}`);
          console.log(`   Home directory: ${config.homeDir}`);
        } catch (configError) {
          console.log(`   ‚ö†Ô∏è  Config error: ${configError.message}`);
        }
      }

      // Test session paths generation
      const sessionPaths = adapter.getSessionPaths();
      console.log(`   Generated paths: ${sessionPaths.length}`);

      // Test extractProjectPath method
      try {
        const projectPath = await adapter.extractProjectPath({ metadata: { projectPath: '/test/project' } });
        console.log(`   Project path extraction: ${projectPath ? '‚ú?Working' : '‚ö†Ô∏è  Null'}`);
      } catch (methodError) {
        console.log(`   ‚ö†Ô∏è  Method error: ${methodError.message}`);
      }

    } catch (error) {
      console.log(`   ‚ù?Error: ${error.message}`);
    }

    console.log('');
  }
}

async function testDiscoveryService() {
  console.log('üîç Testing CLI Discovery Service...\n');

  try {
    const discovery = CLIDiscovery.getInstance();

    // Test discovery
    const discovered = await discovery.discoverAllCLIs();
    console.log(`Discovery found ${discovered.length} CLI tools`);

    // Test statistics
    const stats = discovery.getDiscoveryStats();
    console.log(`   Total: ${stats.total}`);
    console.log(`   Available: ${stats.available}`);
    console.log(`   Unavailable: ${stats.unavailable}`);

    // Test scanner with discovered adapters
    const availableAdapters = discovery.getAvailableAdapters();
    if (availableAdapters.length > 0) {
      console.log(`\nüìä Testing SessionScanner with ${availableAdapters.length} available adapters...`);

      const scanner = new SessionScanner(availableAdapters);
      const scanResults = await scanner.scanAllSessions({ maxSessions: 5 });
      console.log(`   Scan completed: ${scanResults.length} sessions found`);

      const statistics = await scanner.getSessionStatistics();
      console.log(`   Statistics: ${statistics.totalSessions} sessions, ${statistics.totalMessages} messages`);
    }

    // Generate report
    console.log(`\nüìã Discovery Report:`);
    const report = discovery.generateDiscoveryReport();
    console.log(report.substring(0, 500) + '...');

  } catch (error) {
    console.error('‚ù?Discovery service error:', error.message);
    console.error(error.stack);
  }
}

async function runCrossTest() {
  console.log('üöÄ Running Cross-CLI Integration Test...\n');

  try {
    // Initialize discovery
    const discovery = CLIDiscovery.getInstance();
    await discovery.discoverAllCLIs();

    // Test cross-CLI session access
    const allCLIs = discovery.getAllDiscoveredCLIs();
    console.log(`üîó Testing cross-CLI access with ${allCLIs.length} CLI tools:`);

    for (const cli of allCLIs) {
      const status = cli.available ? '‚ú? : '‚ù?;
      console.log(`   ${status} ${cli.name} (${cli.cliType}) - ${cli.sessionPaths.length} session paths`);
    }

    // Test universal session scanner
    const universalAdapters = discovery.getAvailableAdapters();
    if (universalAdapters.length > 0) {
      const universalScanner = new SessionScanner(universalAdapters);

      console.log(`\nüåê Universal Session Scanner Active:`);
      console.log(`   Adapters loaded: ${universalAdapters.length}`);
      console.log(`   Capabilities: Cross-CLI session recovery, unified search, unified export`);

      // Test search across all CLI tools
      const searchResults = await universalScanner.searchSessions('test');
      console.log(`   Cross-CLI search "test": ${searchResults.length} results`);

      // Test CLI-specific filtering
      for (const adapter of universalAdapters) {
        const cliSessions = await universalScanner.scanSessionsByCLI(adapter.cliType);
        console.log(`   ${adapter.cliType} sessions: ${cliSessions.length}`);
      }
    }

    console.log(`\n‚ú?Cross-CLI Session Recovery System is ready!`);
    console.log(`\nüí° Usage Examples:`);
    console.log(`   ccsr discover - Find all available CLI tools`);
    console.log(`   ccsr list --cli claude - List Claude sessions`);
    console.log(`   ccsr search "help me code" - Search across all CLI tools`);
    console.log(`   ccsr export <session-id> --format markdown - Export any session`);

  } catch (error) {
    console.error('‚ù?Cross-CLI test error:', error.message);
  }
}

async function main() {
  await testAllAdapters();
  await testDiscoveryService();
  await runCrossTest();

  console.log('\nüéâ Cross-CLI Session Recovery System Test Completed!');
}

main().catch(error => {
  console.error('‚ù?Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
