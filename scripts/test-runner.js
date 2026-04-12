#!/usr/bin/env node

/**
 * Enhanced Test Runner for HookDeploymentManager Test Suite
 * Provides comprehensive testing with reporting and analysis
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class TestRunner {
  constructor() {
    this.testResults = {
      unit: { passed: 0, failed: 0, total: 0, duration: 0 },
      integration: { passed: 0, failed: 0, total: 0, duration: 0 },
      regression: { passed: 0, failed: 0, total: 0, duration: 0 },
      performance: { passed: 0, failed: 0, total: 0, duration: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    console.log(colors[type](`[${new Date().toLocaleTimeString()}] ${message}`));
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}...`);
    const startTime = Date.now();

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const duration = Date.now() - startTime;
      this.log(`${description} completed successfully (${duration}ms)`, 'success');

      return {
        success: true,
        output,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`${description} failed after ${duration}ms`, 'error');

      return {
        success: false,
        error: error.message,
        output: error.stdout,
        duration
      };
    }
  }

  parseJestOutput(output) {
    const lines = output.split('\n');
    const results = {
      passed: 0,
      failed: 0,
      total: 0,
      suites: 0
    };

    lines.forEach(line => {
      const match = line.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+failed/);
      if (match) {
        results.passed = parseInt(match[1]);
        results.failed = parseInt(match[2]);
        results.total = results.passed + results.failed;
      }

      const suiteMatch = line.match(/Test Suites:\s+(\d+)\s+passed,\s+(\d+)\s+failed/);
      if (suiteMatch) {
        results.suites = parseInt(suiteMatch[1]) + parseInt(suiteMatch[2]);
      }
    });

    return results;
  }

  async runUnitTests() {
    this.log('\n🧪 Running Unit Tests', 'info');

    const result = await this.runCommand(
      'npm run test:unit -- --verbose --json',
      'Unit Tests'
    );

    if (result.success) {
      const jestOutput = result.output;
      try {
        const jsonMatch = jestOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jestResults = JSON.parse(jsonMatch[0]);
          this.testResults.unit.passed = jestResults.numPassedTests || 0;
          this.testResults.unit.failed = jestResults.numFailedTests || 0;
          this.testResults.unit.total = jestResults.numTotalTests || 0;
          this.testResults.unit.duration = jestResults.testResults?.reduce(
            (total, test) => total + (test.duration || 0), 0
          ) || 0;
        } else {
          const parsed = this.parseJestOutput(result.output);
          Object.assign(this.testResults.unit, parsed);
        }
      } catch (parseError) {
        this.log('Failed to parse Jest output, using fallback parsing', 'warning');
        const parsed = this.parseJestOutput(result.output);
        Object.assign(this.testResults.unit, parsed);
      }
    } else {
      this.testResults.unit.failed = 1;
    }

    return result.success;
  }

  async runIntegrationTests() {
    this.log('\n🔗 Running Integration Tests', 'info');

    const result = await this.runCommand(
      'npm run test:integration -- --verbose',
      'Integration Tests'
    );

    if (result.success) {
      const parsed = this.parseJestOutput(result.output);
      Object.assign(this.testResults.integration, parsed);
      this.testResults.integration.duration = result.duration;
    } else {
      this.testResults.integration.failed = 1;
    }

    return result.success;
  }

  async runRegressionTests() {
    this.log('\n🔄 Running Regression Tests', 'info');

    const result = await this.runCommand(
      'npm run test:regression -- --verbose',
      'Regression Tests'
    );

    if (result.success) {
      const parsed = this.parseJestOutput(result.output);
      Object.assign(this.testResults.regression, parsed);
      this.testResults.regression.duration = result.duration;
    } else {
      this.testResults.regression.failed = 1;
    }

    return result.success;
  }

  async runPerformanceTests() {
    this.log('\n⚡ Running Performance Tests', 'info');

    const result = await this.runCommand(
      'npm run test:performance -- --verbose',
      'Performance Tests'
    );

    if (result.success) {
      const parsed = this.parseJestOutput(result.output);
      Object.assign(this.testResults.performance, parsed);
      this.testResults.performance.duration = result.duration;
    } else {
      this.testResults.performance.failed = 1;
    }

    return result.success;
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const allTests = Object.values(this.testResults);
    const totalPassed = allTests.reduce((sum, cat) => sum + cat.passed, 0);
    const totalFailed = allTests.reduce((sum, cat) => sum + cat.failed, 0);
    const totalTests = totalPassed + totalFailed;

    console.log('\n' + '='.repeat(80));
    console.log(chalk.bold.blue('📊 TEST SUITE REPORT'));
    console.log('='.repeat(80));

    // Summary
    console.log(chalk.bold('\n📋 SUMMARY:'));
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${chalk.green(totalPassed)}`);
    console.log(`Failed: ${chalk.red(totalFailed)}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

    // Category breakdown
    console.log(chalk.bold('\n📂 TEST CATEGORIES:'));

    const categories = [
      { name: 'Unit Tests', key: 'unit', icon: '🧪' },
      { name: 'Integration Tests', key: 'integration', icon: '🔗' },
      { name: 'Regression Tests', key: 'regression', icon: '🔄' },
      { name: 'Performance Tests', key: 'performance', icon: '⚡' }
    ];

    categories.forEach(category => {
      const results = this.testResults[category.key];
      const success = results.failed === 0;
      const status = success ? '✅' : '❌';
      const color = success ? chalk.green : chalk.red;

      console.log(`\n${category.icon} ${category.name}: ${status}`);
      console.log(`  Tests: ${results.total}`);
      console.log(`  Passed: ${color(results.passed)}`);
      console.log(`  Failed: ${results.failed > 0 ? chalk.red(results.failed) : results.failed}`);
      console.log(`  Duration: ${(results.duration / 1000).toFixed(2)}s`);
    });

    // Coverage information if available
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = fs.readJsonSync(coveragePath);
        console.log(chalk.bold('\n📈 COVERAGE SUMMARY:'));
        console.log(`Lines: ${coverage.total.lines.pct}%`);
        console.log(`Functions: ${coverage.total.functions.pct}%`);
        console.log(`Branches: ${coverage.total.branches.pct}%`);
        console.log(`Statements: ${coverage.total.statements.pct}%`);
      } catch (error) {
        this.log('Could not read coverage information', 'warning');
      }
    }

    console.log('\n' + '='.repeat(80));

    // Exit with appropriate code
    const exitCode = totalFailed > 0 ? 1 : 0;

    if (exitCode === 0) {
      console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED!'));
    } else {
      console.log(chalk.red.bold(`\n❌ ${totalFailed} TEST(S) FAILED!`));
    }

    return exitCode;
  }

  async runTestSuite() {
    console.log(chalk.bold.blue('🚀 Starting HookDeploymentManager Test Suite'));
    console.log(`Node.js version: ${process.version}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Working directory: ${process.cwd()}`);

    try {
      // Clean previous results
      await fs.remove('coverage');
      await fs.remove('test-results');

      const unitSuccess = await this.runUnitTests();
      const integrationSuccess = await this.runIntegrationTests();
      const regressionSuccess = await this.runRegressionTests();

      // Run performance tests only if others pass (to save time)
      let performanceSuccess = true;
      if (unitSuccess && integrationSuccess && regressionSuccess) {
        performanceSuccess = await this.runPerformanceTests();
      } else {
        this.log('Skipping performance tests due to failures in other categories', 'warning');
      }

      // Generate report and exit
      const exitCode = this.generateReport();
      process.exit(exitCode);

    } catch (error) {
      this.log(`Test runner error: ${error.message}`, 'error');
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const runner = new TestRunner();

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HookDeploymentManager Test Runner

Usage: node scripts/test-runner.js [options]

Options:
  --help, -h      Show this help message
  --unit-only     Run only unit tests
  --integration-only  Run only integration tests
  --regression-only  Run only regression tests
  --performance-only Run only performance tests
  --no-performance Skip performance tests
  --verbose       Enable verbose output

Examples:
  node scripts/test-runner.js                    # Run all tests
  node scripts/test-runner.js --unit-only       # Run only unit tests
  node scripts/test-runner.js --no-performance  # Skip performance tests
    `);
    process.exit(0);
  }

  // Handle specific test category requests
  if (args.includes('--unit-only')) {
    runner.runUnitTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else if (args.includes('--integration-only')) {
    runner.runIntegrationTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else if (args.includes('--regression-only')) {
    runner.runRegressionTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else if (args.includes('--performance-only')) {
    runner.runPerformanceTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    // Run all tests
    runner.runTestSuite();
  }
}

module.exports = TestRunner;