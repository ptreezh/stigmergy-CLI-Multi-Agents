#!/usr/bin/env node

/**
 * Layered Test Runner
 * Executes tests in layers with appropriate filtering based on CLI availability
 */

const { spawn } = require('child_process');
const path = require('path');
const CLIAvailabilityChecker = require('../src/test/cli-availability-checker');

class LayeredTestRunner {
  constructor() {
    this.baseDir = path.resolve(__dirname, '..');
    this.coverageDir = path.join(this.baseDir, 'coverage');
  }

  /**
   * Run all test layers
   */
  async runAll(options = {}) {
    console.log('🧪 Stigmergy CLI Layered Test Runner');
    console.log('=====================================\n');

    const { skipE2E = false, onlyAvailable = false } = options;

    // Check CLI availability
    console.log('1. Checking CLI tool availability...');
    const availabilityChecker = new CLIAvailabilityChecker();
    await availabilityChecker.printAvailabilityReport();

    // Layer 1: Unit Tests
    console.log('\n2. Running Unit Tests...');
    const unitResult = await this.runUnitTests();

    // Layer 2: Integration Tests
    console.log('\n3. Running Integration Tests...');
    const integrationResult = await this.runIntegrationTests();

    // Layer 3: E2E Tests (optional)
    let e2eResult = null;
    if (!skipE2E) {
      console.log('\n4. Running E2E Tests...');
      e2eResult = await this.runE2ETests(onlyAvailable);
    }

    // Generate report
    this.printSummary({
      unit: unitResult,
      integration: integrationResult,
      e2e: e2eResult
    });

    // Exit with appropriate code
    const allPassed = this.allTestsPassed(unitResult, integrationResult, e2eResult);
    process.exit(allPassed ? 0 : 1);
  }

  /**
   * Run unit tests
   */
  async runUnitTests() {
    return this.runJest('tests/unit', {
      coverage: true,
      coverageDirectory: 'coverage/unit',
      testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/tests/integration/']
    });
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    return this.runJest('tests/integration', {
      coverage: true,
      coverageDirectory: 'coverage/integration',
      testPathIgnorePatterns: ['<rootDir>/tests/unit/', '<rootDir>/tests/e2e/']
    });
  }

  /**
   * Run E2E tests
   */
  async runE2ETests(onlyAvailable = false) {
    const env = onlyAvailable ? { ONLY_AVAILABLE_CLIS: 'true' } : {};

    return this.runJest('tests/e2e', {
      coverage: false, // Usually not needed for E2E
      testTimeout: 60000, // Longer timeout for E2E
      maxWorkers: 1, // Run E2E tests serially to avoid conflicts
      env
    });
  }

  /**
   * Run Jest with specific options
   */
  async runJest(testPath, options = {}) {
    return new Promise((resolve) => {
      const args = [
        testPath,
        '--verbose',
        '--no-cache',
        `--testTimeout=${options.testTimeout || 30000}`,
        `--maxWorkers=${options.maxWorkers || 4}`
      ];

      if (options.coverage) {
        args.push('--coverage');
        args.push(`--coverageDirectory=${options.coverageDirectory}`);
      }

      if (options.testPathIgnorePatterns) {
        options.testPathIgnorePatterns.forEach(pattern => {
          args.push('--testPathIgnorePatterns=' + pattern);
        });
      }

        const jestPath = process.platform === 'win32'
        ? path.join(this.baseDir, 'node_modules', '.bin', 'jest.cmd')
        : path.join(this.baseDir, 'node_modules', '.bin', 'jest');

      const child = spawn(jestPath, args, {
        cwd: this.baseDir,
        stdio: 'pipe',
        env: { ...process.env, ...options.env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr
        });
      });
    });
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed(unit, integration, e2e) {
    const results = [unit, integration];
    if (e2e) results.push(e2e);

    return results.every(result => result && result.success);
  }

  /**
   * Print test summary
   */
  printSummary(results) {
    console.log('\n=====================================');
    console.log('Test Layer Summary:');
    console.log('=====================================');

    const layers = [
      { name: 'Unit Tests', result: results.unit },
      { name: 'Integration Tests', result: results.integration },
      { name: 'E2E Tests', result: results.e2e, optional: true }
    ];

    let allPassed = true;

    layers.forEach(layer => {
      if (!layer.result) {
        console.log(`${layer.name}: SKIPPED`);
        return;
      }

      const status = layer.result.success ? 'PASS' : 'FAIL';
      console.log(`${layer.name}: ${status} (exit code: ${layer.result.exitCode})`);

      if (!layer.result.success) {
        allPassed = false;
      }
    });

    console.log('=====================================');
    console.log(`Overall: ${allPassed ? '�?ALL TESTS PASSED' : '�?SOME TESTS FAILED'}`);
    console.log('=====================================\n');

    if (allPassed) {
      console.log('🎉 Ready for deployment!');
    } else {
      console.log('�?Please fix failing tests before deployment.');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  if (args.includes('--skip-e2e')) {
    options.skipE2E = true;
  }

  if (args.includes('--only-available')) {
    options.onlyAvailable = true;
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/run-layered-tests.js [options]

Options:
  --skip-e2e        Skip end-to-end tests
  --only-available  Only test with available CLI tools
  --help, -h       Show this help message

Examples:
  node scripts/run-layered-tests.js
  node scripts/run-layered-tests.js --skip-e2e
  node scripts/run-layered-tests.js --only-available
    `);
    process.exit(0);
  }

  const runner = new LayeredTestRunner();
  await runner.runAll(options);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = LayeredTestRunner;
