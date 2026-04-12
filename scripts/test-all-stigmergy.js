#!/usr/bin/env node

/**
 * Comprehensive Stigmergy Test Suite
 * Tests all functionality before publishing
 *
 * Usage:
 * node scripts/test-all-stigmergy.js [--skip-uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

// Simple chalk replacement
function colorize(text, ...codes) {
  const open = codes.map(c => `\x1b[${c}m`).join('');
  return `${open}${text}\x1b[0m`;
}

const chalk = {
  green: (text) => colorize(text, '32'),
  red: (text) => colorize(text, '31'),
  blue: (text) => colorize(text, '34'),
  gray: (text) => colorize(text, '90'),
  bold: Object.assign(
    (text) => colorize(text, '1'),
    {
      blue: (text) => colorize(text, '1', '34')
    }
  )
};

class StigmergyTestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    this.startTime = Date.now();
  }

  async test(name, testFn) {
    this.results.total++;
    process.stdout.write(`\r[${this.results.total}] Testing: ${name}... `);

    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'passed' });
      console.log(chalk.green(`✓ PASS`));
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'failed', error: error.message });
      console.log(chalk.red(`✗ FAIL`), chalk.gray(`: ${error.message}`));
    }
  }

  async runTestSuite() {
    console.log(chalk.bold.blue('\n🧪 Stigmergy Comprehensive Test Suite\n'));
    console.log(chalk.gray('='.repeat(60)));

    // Phase 1: Environment Check
    await this.environmentCheck();

    // Phase 2: Installation Test
    await this.installationTest();

    // Phase 3: Core Functionality Tests
    await this.coreFunctionalityTests();

    // 4. Phase 4: Skills Hub Tests
    await this.skillsHubTests();

    // Phase 5: CLI Tools Detection
    await this.cliToolsDetectionTests();

    // Phase 6: Integration Tests
    await this.integrationTests();

    // Phase 7: Uninstall Test (if not skipped)
    if (!process.argv.includes('--skip-uninstall')) {
      await this.uninstallTest();
    }

    // Print Summary
    this.printSummary();
  }

  async environmentCheck() {
    console.log(chalk.bold('\n📋 Phase 1: Environment Check\n'));

    await this.test('Node.js version >= 16.0.0', async () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      if (major < 16) {
        throw new Error(`Node.js ${version} is too old. Requires >= 16.0.0`);
      }
    });

    await this.test('Project structure exists', async () => {
      const requiredPaths = [
        'src/core',
        'src/cli',
        'src/commands',
        'templates',
        'package.json'
      ];

      for (const p of requiredPaths) {
        try {
          await fs.access(p);
        } catch (e) {
          throw new Error(`Required path missing: ${p}`);
        }
      }
    });

    await this.test('Dependencies installed', async () => {
      try {
        await fs.access('node_modules');
        const requiredDeps = ['commander', 'chalk', 'inquirer'];
        for (const dep of requiredDeps) {
          try {
            await fs.access(path.join('node_modules', dep));
          } catch (e) {
            throw new Error(`Dependency missing: ${dep}`);
          }
        }
      } catch (e) {
        throw new Error('Dependencies not installed. Run: npm install');
      }
    });
  }

  async installationTest() {
    console.log(chalk.bold('\n📦 Phase 2: Installation Test\n'));

    await this.test('npm link works', async () => {
      const result = spawnSync('npm', ['link'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`npm link failed: ${result.stderr.toString()}`);
      }
    });

    await this.test('stigmergy command available', async () => {
      const result = spawnSync('stigmergy', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('stigmergy command not found');
      }
    });

    await this.test('Version command works', async () => {
      const result = spawnSync('stigmergy', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`Version command failed: ${result.stderr.toString()}`);
      }
    });
  }

  async coreFunctionalityTests() {
    console.log(chalk.bold('\n⚙️  Phase 3: Core Functionality Tests\n'));

    await this.test('Help command', async () => {
      const result = spawnSync('stigmergy', ['--help'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Help command failed');
      }
      const output = result.stdout.toString();
      if (!output.includes('Stigmergy CLI')) {
        throw new Error('Help output missing expected content');
      }
    });

    await this.test('Status command', async () => {
      const result = spawnSync('stigmergy', ['status'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Status command failed');
      }
    });

    await this.test('Scan command', async () => {
      const result = spawnSync('stigmergy', ['scan', '--json'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Scan command failed');
      }
      const output = JSON.parse(result.stdout.toString());
      if (!Array.isArray(output)) {
        throw new Error('Scan output is not an array');
      }
    });
  }

  async skillsHubTests() {
    console.log(chalk.bold('\n🎯 Phase 4: Skills Hub Tests\n'));

    // Test 1: Init
    await this.test('Skills Hub init', async () => {
      const result = spawnSync('stigmergy', ['skills-hub', 'init'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`Skills Hub init failed: ${result.stderr.toString()}`);
      }
      const output = result.stdout.toString();
      if (!output.includes('initialized successfully')) {
        throw new Error('Init failed - expected success message not found');
      }
    });

    // Test 2: Status
    await this.test('Skills Hub status', async () => {
      const result = spawnSync('stigmergy', ['skills-hub', 'status'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Skills Hub status failed');
      }
    });

    // Test 3: Sync (dry-run)
    await this.test('Skills Hub sync (dry-run)', async () => {
      const result = spawnSync('stigmergy', ['skills-hub', 'sync', '--dry-run'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`Skills Hub sync failed: ${result.stderr.toString()}`);
      }
    });
  }

  async cliToolsDetectionTests() {
    console.log(chalk.bold('\n🔍 Phase 5: CLI Tools Detection Tests\n'));

    await this.test('Detect all CLI tools', async () => {
      const result = spawnSync('stigmergy', ['scan', '--json'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Scan command failed');
      }
      const output = JSON.parse(result.stdout.toString());
      if (!Array.isArray(output) || output.length === 0) {
        throw new Error('No CLI tools detected');
      }
    });

    await this.test('Check specific CLI tools', async () => {
      // Check for at least one tool
      const result = spawnSync('stigmergy', ['status', '--json'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Status check failed');
      }
      const output = JSON.parse(result.stdout.toString());
      if (!output.tools || Object.keys(output.tools).length === 0) {
        throw new Error('No tools found in status output');
      }
    });
  }

  async integrationTests() {
    console.log(chalk.bold('\n🔗 Phase 6: Integration Tests\n'));

    await this.test('Skills list command', async () => {
      const result = spawnSync('stigmergy', ['skill', 'list'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Skill list command failed');
      }
    });

    await this.test('Call command with simple prompt', async () => {
      const result = spawnSync('stigmergy', ['call', '--help'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('Call command help failed');
      }
    });
  }

  async uninstallTest() {
    console.log(chalk.bold('\n🗑️  Phase 7: Uninstall Test\n'));

    await this.test('npm unlink works', async () => {
      const result = spawnSync('npm', ['unlink', '-g'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`npm unlink failed: ${result.stderr.toString()}`);
      }
    });

    await this.test('Verify stigmergy command removed', async () => {
      const result = spawnSync('stigmergy', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      // Should fail after uninstall
      if (result.status === 0) {
        throw new Error('stigmergy command still works after uninstall');
      }
    });

    await this.test('Reinstall after uninstall', async () => {
      const result = spawnSync('npm', ['link', '-g'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error(`npm link failed after reinstall: ${result.stderr.toString()}`);
      }
    });

    await this.test('Verify stigmergy works after reinstall', async () => {
      const result = spawnSync('stigmergy', ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      if (result.status !== 0) {
        throw new Error('stigmergy command not working after reinstall');
      }
    });
  }

  printSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('📊 TEST SUMMARY'));
    console.log('='.repeat(60));

    console.log(`\nTotal Tests: ${this.results.total}`);
    console.log(chalk.green(`Passed: ${this.results.passed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    console.log(`Duration: ${duration}s`);

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\nPass Rate: ${passRate}%`);

    if (this.results.failed > 0) {
      console.log('\n' + chalk.red('❌ Failed Tests:'));
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach(t => {
          console.log(`   - ${t.name}: ${t.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 ALL TESTS PASSED! Stigmergy is ready for publishing!\n'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n⚠️  SOME TESTS FAILED. Please fix the issues before publishing.\n'));
      process.exit(1);
    }
  }
}

// Run tests
if (require.main === module) {
  const suite = new StigmergyTestSuite();
  suite.runTestSuite().catch(error => {
    console.error('\n❌ Test suite error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = StigmergyTestSuite;
