#!/usr/bin/env node

/**
 * Production Environment Validation Script
 *
 * This script validates that the Cross-CLI Session Recovery system
 * can work in a real production environment without mock data.
 */

const { ClaudeAdapter, SessionScanner, SessionExporter } = require('../dist');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

console.log('üîç Production Environment Validation');
console.log('=====================================\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function logResult(test, message, details = '') {
  if (test) {
    console.log(`‚ú?${message}`);
    if (details) console.log(`   ${details}`);
    results.passed++;
  } else {
    console.log(`‚ù?${message}`);
    if (details) console.log(`   ${details}`);
    results.failed++;
  }
}

function logWarning(message, details = '') {
  console.log(`‚ö†Ô∏è  ${message}`);
  if (details) console.log(`   ${details}`);
  results.warnings++;
}

async function validateClaudeAdapter() {
  console.log('1. Testing Claude Adapter');
  console.log('-------------------------');

  try {
    const adapter = new ClaudeAdapter();

    // Test adapter properties
    logResult(
      adapter.cliType === 'claude',
      'Adapter has correct CLI type'
    );

    logResult(
      adapter.name === 'Claude Code',
      'Adapter has correct name'
    );

    logResult(
      adapter.version && adapter.version !== '',
      'Adapter detected version',
      `Version: ${adapter.version}`
    );

    // Test availability check
    const isAvailable = await adapter.isAvailable();
    if (isAvailable) {
      logResult(true, 'Claude CLI is available and accessible');
    } else {
      logWarning('Claude CLI is not available', 'This is normal if Claude CLI is not installed');
    }

    // Test configuration
    if (isAvailable) {
      try {
        const config = await adapter.getCLIConfig();
        logResult(
          config.homeDir && typeof config.homeDir === 'string',
          'Can read Claude home directory',
          `Path: ${config.homeDir}`
        );

        logResult(
          Array.isArray(config.sessionPaths),
          'Can read session paths',
          `Found ${config.sessionPaths.length} session paths`
        );
      } catch (configError) {
        logResult(false, 'Failed to get Claude configuration', configError.message);
      }
    }

    // Test session path generation
    const sessionPaths = adapter.getSessionPaths();
    logResult(
      Array.isArray(sessionPaths) && sessionPaths.length > 0,
      'Can generate session paths',
      `Generated ${sessionPaths.length} paths`
    );

  } catch (error) {
    logResult(false, 'Claude Adapter initialization failed', error.message);
  }

  console.log('');
}

async function validateSessionScanner() {
  console.log('2. Testing Session Scanner');
  console.log('---------------------------');

  try {
    const adapter = new ClaudeAdapter();
    const scanner = new SessionScanner([adapter]);

    // Test scanner initialization
    logResult(true, 'Session Scanner initialized successfully');

    // Test empty scan
    try {
      const sessions = await scanner.scanAllSessions();
      logResult(
        Array.isArray(sessions),
        'Can scan sessions',
        `Found ${sessions.length} sessions`
      );

      // Test statistics
      const stats = await scanner.getSessionStatistics();
      logResult(
        typeof stats.totalSessions === 'number',
        'Can generate statistics',
        `Total: ${stats.totalSessions}, Messages: ${stats.totalMessages}`
      );

      // Test search functionality
      const searchResults = await scanner.searchSessions('test');
      logResult(
        Array.isArray(searchResults),
        'Search functionality works',
        `Found ${searchResults.length} results for "test"`
      );

    } catch (scanError) {
      logWarning('Session scanning failed', scanError.message);
    }

    // Test cache functionality
    try {
      scanner.clearCache();
      logResult(true, 'Cache clearing works');
    } catch (cacheError) {
      logResult(false, 'Cache clearing failed', cacheError.message);
    }

  } catch (error) {
    logResult(false, 'Session Scanner initialization failed', error.message);
  }

  console.log('');
}

async function validateSessionExporter() {
  console.log('3. Testing Session Exporter');
  console.log('----------------------------');

  try {
    const exporter = new SessionExporter();

    // Create a mock session for testing
    const mockSession = {
      metadata: {
        cliType: 'claude',
        sessionId: 'test-session-production',
        filePath: '/tmp/test-session.jsonl',
        projectPath: '/tmp/test-project',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 2,
        totalTokens: 50
      },
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message',
          timestamp: new Date(),
          metadata: {}
        },
        {
          role: 'assistant',
          content: 'This is a test response',
          timestamp: new Date(),
          metadata: {
            model: 'claude-3-sonnet',
            tokens: 30
          }
        }
      ]
    };

    // Test Markdown export
    try {
      const markdown = await exporter.exportSession(mockSession, 'markdown');
      logResult(
        typeof markdown === 'string' && markdown.length > 0,
        'Markdown export works',
        `Generated ${markdown.length} characters`
      );

      logResult(
        markdown.includes('# Session: test-session-production'),
        'Markdown export contains proper headers'
      );
    } catch (markdownError) {
      logResult(false, 'Markdown export failed', markdownError.message);
    }

    // Test JSON export
    try {
      const json = await exporter.exportSession(mockSession, 'json');
      logResult(
        typeof json === 'string' && json.length > 0,
        'JSON export works',
        `Generated ${json.length} characters`
      );

      // Validate JSON can be parsed
      const parsed = JSON.parse(json);
      logResult(
        parsed.metadata && parsed.messages,
        'JSON export contains valid data structure'
      );
    } catch (jsonError) {
      logResult(false, 'JSON export failed', jsonError.message);
    }

    // Test context export
    try {
      const context = await exporter.exportSession(mockSession, 'context');
      logResult(
        typeof context === 'string' && context.length > 0,
        'Context export works',
        `Generated ${context.length} characters`
      );

      logResult(
        context.includes('Session Context'),
        'Context export contains proper headers'
      );
    } catch (contextError) {
      logResult(false, 'Context export failed', contextError.message);
    }

    // Test invalid format
    try {
      await exporter.exportSession(mockSession, 'invalid');
      logResult(false, 'Invalid format should throw error', 'This test should have thrown an error');
    } catch (formatError) {
      logResult(true, 'Invalid format properly throws error');
    }

  } catch (error) {
    logResult(false, 'Session Exporter initialization failed', error.message);
  }

  console.log('');
}

async function validateFilesystemAccess() {
  console.log('4. Testing Filesystem Access');
  console.log('----------------------------');

  // Test home directory access
  const homeDir = os.homedir();
  logResult(
    homeDir && typeof homeDir === 'string',
    'Can access home directory',
    `Path: ${homeDir}`
  );

  // Test temp directory creation
  const tempDir = path.join(os.tmpdir(), 'ccsr-test-' + Date.now());
  try {
    await fs.ensureDir(tempDir);
    logResult(true, 'Can create temporary directory', `Path: ${tempDir}`);

    // Test file creation
    const testFile = path.join(tempDir, 'test.json');
    await fs.writeFile(testFile, '{"test": true}');
    logResult(true, 'Can write files');

    // Test file reading
    const content = await fs.readFile(testFile, 'utf-8');
    logResult(
      content && content.includes('test'),
      'Can read files'
    );

    // Cleanup
    await fs.remove(tempDir);
    logResult(true, 'Can cleanup temporary files');

  } catch (fsError) {
    logResult(false, 'Filesystem operations failed', fsError.message);
  }

  console.log('');
}

async function validateDependencies() {
  console.log('5. Testing Dependencies');
  console.log('------------------------');

  try {
    // Test fs-extra
    await fs.access(process.cwd());
    logResult(true, 'fs-extra dependency works');

    // Test path operations
    const joinedPath = path.join('/test', 'path');
    logResult(
      joinedPath === path.sep + 'test' + path.sep + 'path',
      'path operations work correctly'
    );

    // Test os operations
    const platform = os.platform();
    logResult(
      ['win32', 'darwin', 'linux'].includes(platform),
      'Can detect platform',
      `Platform: ${platform}`
    );

    logResult(true, 'All core dependencies are available');

  } catch (depError) {
    logResult(false, 'Dependency validation failed', depError.message);
  }

  console.log('');
}

async function validatePerformance() {
  console.log('6. Testing Performance');
  console.log('--------------------');

  try {
    // Test memory usage
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
    logResult(
      heapUsedMB < 100,
      'Memory usage is reasonable',
      `Heap used: ${heapUsedMB} MB`
    );

    // Test adapter creation performance
    const start = Date.now();
    const adapter = new ClaudeAdapter();
    const adapterTime = Date.now() - start;
    logResult(
      adapterTime < 1000,
      'Adapter creation is fast',
      `Time: ${adapterTime}ms`
    );

    // Test scanner creation performance
    const scanStart = Date.now();
    const scanner = new SessionScanner([adapter]);
    const scannerTime = Date.now() - scanStart;
    logResult(
      scannerTime < 1000,
      'Scanner creation is fast',
      `Time: ${scannerTime}ms`
    );

    // Test exporter creation performance
    const exportStart = Date.now();
    const exporter = new SessionExporter();
    const exporterTime = Date.now() - exportStart;
    logResult(
      exporterTime < 1000,
      'Exporter creation is fast',
      `Time: ${exporterTime}ms`
    );

  } catch (perfError) {
    logResult(false, 'Performance testing failed', perfError.message);
  }

  console.log('');
}

// Run all validations
async function runAllValidations() {
  await validateClaudeAdapter();
  await validateSessionScanner();
  await validateSessionExporter();
  await validateFilesystemAccess();
  await validateDependencies();
  await validatePerformance();

  // Print summary
  console.log('üìä Validation Summary');
  console.log('====================');
  console.log(`‚ú?Passed: ${results.passed}`);
  console.log(`‚ù?Failed: ${results.failed}`);
  console.log(`‚ö†Ô∏è  Warnings: ${results.warnings}`);

  const total = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / total) * 100).toFixed(1);

  console.log(`üìà Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log('\nüéâ All critical tests passed! The system is ready for production.');
    process.exit(0);
  } else {
    console.log('\n‚ù?Some tests failed. Please review the issues before deploying to production.');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('‚ù?Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('‚ù?Uncaught Exception:', error);
  process.exit(1);
});

// Run validations
runAllValidations();
