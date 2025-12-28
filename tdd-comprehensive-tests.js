#!/usr/bin/env node

/**
 * TDD Step 2: Comprehensive Test Suite
 * Tests for ALL functionality that must be implemented
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TDD Step 2: Comprehensive Test Suite');
console.log('='.repeat(60));

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 2,
  verbose: false
};

// All commands that must be tested
const REQUIRED_COMMANDS = [
  // Basic commands (already implemented)
  { name: 'install', args: ['--help'], expected: 'Usage:' },
  { name: 'status', args: ['--help'], expected: 'Usage:' },
  { name: 'scan', args: ['--help'], expected: 'Usage:' },

  // Version commands (missing)
  { name: 'version', args: [], expected: '1.3.0-beta.0' },
  { name: '--version', args: [], expected: '1.3.0-beta.0' },

  // Permission management (missing - CRITICAL)
  { name: 'fix-perms', args: ['--help'], expected: 'Usage:' },
  { name: 'perm-check', args: [], expected: 'permissions' },

  // System maintenance (missing - HIGH PRIORITY)
  { name: 'clean', args: ['--help'], expected: 'Usage:' },
  { name: 'diagnostic', args: ['--help'], expected: 'Usage:' },
  { name: 'diag', args: [], expected: 'diagnostic' },
  { name: 'd', args: [], expected: 'diagnostic' },

  // Skills management (missing - HIGH PRIORITY)
  { name: 'skill', args: ['--help'], expected: 'Usage:' },
  { name: 'skill-i', args: [], expected: 'skill install' },
  { name: 'skill-l', args: [], expected: 'skill list' },
  { name: 'skill-v', args: [], expected: 'skill read/validate' },
  { name: 'skill-r', args: [], expected: 'skill read' },
  { name: 'skill-d', args: [], expected: 'skill remove' },
  { name: 'skill-m', args: [], expected: 'skill remove' },

  // Project management (missing)
  { name: 'init', args: ['--help'], expected: 'Usage:' },
  { name: 'setup', args: ['--help'], expected: 'Usage:' },
  { name: 'deploy', args: ['--help'], expected: 'Usage:' },
  { name: 'upgrade', args: ['--help'], expected: 'Usage:' },

  // Other missing commands
  { name: 'errors', args: [], expected: 'error report' },
  { name: 'call', args: ['--help'], expected: 'Usage:' },
  { name: 'auto-install', args: [], expected: 'auto-install' },
  { name: 'resume', args: ['--help'], expected: 'Usage:' },
  { name: 'resume', args: [], expected: 'Usage:' }
];

// CLI tool routing tests
const CLI_TOOL_TESTS = [
  { tool: 'claude', args: ['--version'], shouldWork: true },
  { tool: 'gemini', args: ['--version'], shouldWork: true },
  { tool: 'qwen', args: ['--version'], shouldWork: true },
  { tool: 'codebuddy', args: ['--version'], shouldWork: true },
  { tool: 'codex', args: ['--version'], shouldWork: true },
  { tool: 'iflow', args: ['--version'], shouldWork: true },
  { tool: 'qodercli', args: ['--version'], shouldWork: true },
  { tool: 'copilot', args: ['--version'], shouldWork: true }
];

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
    this.failures = [];
  }

  async runTest(command, args, expected, description = '') {
    this.results.total++;

    try {
      const fullArgs = [command, ...args];
      const cmd = `node src/index.js ${fullArgs.join(' ')}`;

      console.log(`🧪 Testing: ${cmd}`);

      const result = execSync(cmd, {
        encoding: 'utf8',
        timeout: TEST_CONFIG.timeout,
        stdio: 'pipe'
      });

      // Check if test passed
      const passed = expected.includes('Usage:')
        ? result.includes('Usage:') || result.includes('Options:')
        : result.toLowerCase().includes(expected.toLowerCase());

      if (passed) {
        console.log(`  ✅ PASS`);
        this.results.passed++;
        return true;
      } else {
        console.log(`  ❌ FAIL - Expected "${expected}" but got different output`);
        if (TEST_CONFIG.verbose) {
          console.log(`     Output: ${result.substring(0, 200)}...`);
        }
        this.results.failed++;
        this.failures.push({ command, args, expected, actual: result.substring(0, 100) });
        return false;
      }

    } catch (error) {
      // Check if it's an "unknown command" error (expected for missing commands)
      if (error.message.includes('unknown command') || error.status === 1) {
        console.log(`  ❌ FAIL - Command not implemented`);
        this.results.failed++;
        this.failures.push({ command, args, expected, error: 'Command not implemented' });
        return false;
      } else {
        // Some other error occurred
        console.log(`  ⚠️  ERROR - ${error.message}`);
        this.results.failed++;
        this.failures.push({ command, args, expected, error: error.message });
        return false;
      }
    }
  }

  async runAllTests() {
    console.log('\n📋 Running Comprehensive Test Suite...');
    console.log('');

    // Test all required commands
    console.log('🔧 Testing Required Commands:');
    for (const test of REQUIRED_COMMANDS) {
      await this.runTest(test.name, test.args, test.expected, test.description);
    }

    console.log('\n🛠️  Testing CLI Tool Routing:');
    for (const test of CLI_TOOL_TESTS) {
      if (test.shouldWork) {
        await this.runTest(test.tool, test.args, '', `CLI tool ${test.tool} routing`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary:');
    console.log('');

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);

    console.log(`📈 Statistics:`);
    console.log(`  • Total tests: ${this.results.total}`);
    console.log(`  • Passed: ${this.results.passed} (${passRate}%)`);
    console.log(`  • Failed: ${this.results.failed}`);
    console.log(`  • Skipped: ${this.results.skipped}`);
    console.log('');

    if (this.results.failed > 0) {
      console.log('❌ Failed Tests:');
      this.failures.forEach((failure, index) => {
        console.log(`  ${index + 1}. ${failure.command} ${failure.args.join(' ')}`);
        if (failure.error) {
          console.log(`     Error: ${failure.error}`);
        } else {
          console.log(`     Expected: "${failure.expected}"`);
        }
      });
      console.log('');
    }

    // Critical assessment
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED - System is ready for release!');
    } else {
      console.log('🚨 CRITICAL ISSUES FOUND - System is NOT ready for release');

      if (this.results.failed > 10) {
        console.log('💥 SEVERE: Major functionality missing - BLOCK RELEASE');
      } else if (this.results.failed > 5) {
        console.log('⚠️  WARNING: Significant functionality missing - DELAY RELEASE');
      } else {
        console.log('🔧 MINOR: Some functionality missing - FIX BEFORE RELEASE');
      }
    }

    console.log('');
    console.log('🎯 TDD Assessment:');
    console.log(`✅ Commands implemented: ${this.results.passed}/${this.results.total}`);
    console.log(`❌ Commands missing: ${this.results.failed}/${this.results.total}`);
    console.log(`📈 Implementation completeness: ${passRate}%`);

    return {
      ready: this.results.failed === 0,
      completeness: parseFloat(passRate),
      failed: this.results.failed,
      total: this.results.total
    };
  }
}

// Run the test suite
async function main() {
  const testRunner = new TestRunner();
  const results = await testRunner.runAllTests();

  console.log('\n' + '='.repeat(60));
  console.log('🎯 TDD Step 2 Complete - Comprehensive Testing');

  if (results.ready) {
    console.log('✅ System passed all tests - Ready for integration testing');
  } else {
    console.log('❌ System failed tests - Requires implementation work');
    console.log(`🔧 Next step: Implement ${results.failed} missing commands`);
  }

  // Exit with appropriate code
  process.exit(results.ready ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestRunner;