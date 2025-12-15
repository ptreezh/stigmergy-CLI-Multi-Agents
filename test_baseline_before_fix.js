#!/usr/bin/env node

/**
 * Pre-fix Baseline Test Suite
 * Tests all critical functionality before auto-fixing code quality issues
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

class BaselineTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(testName, status, message = '') {
    const result = {
      test: testName,
      status: status,
      message: message,
      timestamp: new Date().toISOString()
    };
    this.results.tests.push(result);

    if (status === 'PASS') {
      this.results.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else if (status === 'FAIL') {
      this.results.failed++;
      console.log(`❌ ${testName}: ${message}`);
    } else {
      console.log(`⚠️  ${testName}: ${message}`);
    }
  }

  testPackageJson() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.log('Package JSON Valid', 'PASS', `Version ${packageJson.version}`);
      this.log('Dependencies Check', 'PASS', `${Object.keys(packageJson.dependencies || {}).length} dependencies`);
      return true;
    } catch (error) {
      this.log('Package JSON Valid', 'FAIL', error.message);
      return false;
    }
  }

  testCLICommands() {
    const commands = [
      { cmd: 'node', args: ['src/index.js', '--help'], expect: /Stigmergy CLI/ },
      { cmd: 'node', args: ['src/index.js', 'version'], expect: /v1\.2\.6/ },
      { cmd: 'node', args: ['src/index.js', 'status'], expect: /STATUS.*AI CLI Tools/ }
    ];

    let allPassed = true;
    commands.forEach(({ cmd, args, expect }) => {
      try {
        const result = spawnSync(cmd, args, { encoding: 'utf8', timeout: 10000 });
        if (result.status === 0 && expect.test(result.stdout)) {
          this.log(`CLI Command ${args[1]}`, 'PASS', 'Command executed successfully');
        } else {
          this.log(`CLI Command ${args[1]}`, 'FAIL', `Exit code: ${result.status}`);
          allPassed = false;
        }
      } catch (error) {
        this.log(`CLI Command ${args[1]}`, 'FAIL', error.message);
        allPassed = false;
      }
    });
    return allPassed;
  }

  testCoreModules() {
    const coreModules = [
      'src/index.js',
      'src/cli/router.js',
      'src/core/installer.js',
      'src/core/smart_router.js',
      'src/core/error_handler.js'
    ];

    let allPassed = true;
    coreModules.forEach(module => {
      try {
        require.resolve(path.resolve(module));
        this.log(`Core Module ${module}`, 'PASS', 'Module loads successfully');
      } catch (error) {
        this.log(`Core Module ${module}`, 'FAIL', error.message);
        allPassed = false;
      }
    });
    return allPassed;
  }

  testHookFiles() {
    const hookDir = 'C:\\Users\\Zhang\\.stigmergy\\hooks';
    const expectedHooks = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot'];

    let allPassed = true;
    expectedHooks.forEach(hook => {
      const hookPath = path.join(hookDir, hook, `${hook}_nodejs_hook.js`);
      if (fs.existsSync(hookPath)) {
        this.log(`Hook File ${hook}`, 'PASS', 'Hook file exists');
      } else {
        this.log(`Hook File ${hook}`, 'FAIL', 'Hook file missing');
        allPassed = false;
      }
    });
    return allPassed;
  }

  testCLIIntegrations() {
    const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot'];
    let availableCount = 0;

    cliTools.forEach(tool => {
      try {
        const result = spawnSync('where', [tool], { encoding: 'utf8', timeout: 3000 });
        if (result.status === 0) {
          availableCount++;
          this.log(`CLI Tool ${tool}`, 'PASS', 'Tool is available');
        } else {
          this.log(`CLI Tool ${tool}`, 'FAIL', 'Tool not found');
        }
      } catch (error) {
        this.log(`CLI Tool ${tool}`, 'FAIL', error.message);
      }
    });

    this.log('CLI Availability Summary', availableCount >= 5 ? 'PASS' : 'FAIL',
             `${availableCount}/${cliTools.length} tools available`);
    return availableCount >= 5;
  }

  testFunctionImports() {
    const criticalFunctions = [
      { module: './src/core/installer', check: (mod) => typeof mod === 'function' },
      { module: './src/core/smart_router', check: (mod) => typeof mod === 'function' },
      { module: './src/core/memory_manager', check: (mod) => typeof mod === 'function' }
    ];

    let allPassed = true;
    criticalFunctions.forEach(({ module, check }) => {
      try {
        const mod = require(module);
        if (check(mod)) {
          this.log(`Module Export ${module}`, 'PASS', 'Module loads correctly');
        } else {
          this.log(`Module Export ${module}`, 'FAIL', 'Module export invalid');
          allPassed = false;
        }
      } catch (error) {
        this.log(`Module Export ${module}`, 'FAIL', error.message);
        allPassed = false;
      }
    });
    return allPassed;
  }

  testHookConfiguration() {
    const configFiles = [
      'C:\\Users\\Zhang\\.claude\\hooks.json',
      'C:\\Users\\Zhang\\.gemini\\hooks.json',
      'C:\\Users\\Zhang\\.qwen\\hooks.json'
    ];

    let validConfigs = 0;
    configFiles.forEach(configFile => {
      try {
        if (fs.existsSync(configFile)) {
          const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
          if (config.cross_cli_adapter && config.cross_cli_adapter.enabled) {
            validConfigs++;
            this.log(`Config File ${path.basename(configFile)}`, 'PASS', 'Valid configuration');
          } else {
            this.log(`Config File ${path.basename(configFile)}`, 'FAIL', 'Invalid configuration');
          }
        } else {
          this.log(`Config File ${path.basename(configFile)}`, 'FAIL', 'File not found');
        }
      } catch (error) {
        this.log(`Config File ${path.basename(configFile)}`, 'FAIL', error.message);
      }
    });

    this.log('Hook Configuration Summary', validConfigs >= 2 ? 'PASS' : 'FAIL',
             `${validConfigs}/${configFiles.length} configs valid`);
    return validConfigs >= 2;
  }

  async runAllTests() {
    console.log('🔍 Starting Pre-Fix Baseline Testing');
    console.log('=====================================');

    // Test 1: Package JSON
    this.testPackageJson();

    // Test 2: Core Modules
    this.testCoreModules();

    // Test 3: CLI Commands
    this.testCLICommands();

    // Test 4: Hook Files
    this.testHookFiles();

    // Test 5: CLI Integrations
    this.testCLIIntegrations();

    // Test 6: Function Exports
    this.testFunctionImports();

    // Test 7: Hook Configuration
    this.testHookConfiguration();

    // Save results
    this.saveResults();

    console.log('=====================================');
    console.log(`📊 Test Results: ${this.results.passed} passed, ${this.results.failed} failed`);

    if (this.results.failed === 0) {
      console.log('✅ All tests passed! Safe to proceed with auto-fix.');
    } else {
      console.log('❌ Some tests failed. Review before proceeding.');
    }

    return this.results.failed === 0;
  }

  saveResults() {
    const resultsFile = `baseline-test-results-${Date.now()}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Results saved to: ${resultsFile}`);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new BaselineTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = BaselineTester;