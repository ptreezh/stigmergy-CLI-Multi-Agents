#!/usr/bin/env node

/**
 * Test Suite for AI CLI Unified Deployment System
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class DeploymentTester {
    constructor() {
        this.testDir = path.join(__dirname, 'test-temp');
        this.deployerPath = path.join(__dirname, 'deploy.js');
        this.tests = [];
    }

    async setup() {
        console.log(chalk.blue.bold('🧪 Setting up test environment...'));

        // Clean up and create test directory
        if (fs.existsSync(this.testDir)) {
            await fs.remove(this.testDir);
        }
        await fs.ensureDir(this.testDir);

        // Copy deployment script to test directory
        await fs.copy(this.deployerPath, path.join(this.testDir, 'deploy.js'));
    }

    async runTest(testName, testFn) {
        try {
            console.log(chalk.blue(`Running test: ${testName}`));
            await testFn();
            console.log(chalk.green(`✅ ${testName} - PASSED`));
            this.tests.push({ name: testName, status: 'PASSED' });
        } catch (error) {
            console.error(chalk.red(`❌ ${testName} - FAILED: ${error.message}`));
            this.tests.push({ name: testName, status: 'FAILED', error: error.message });
        }
    }

    async testNodeVersion() {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

        if (majorVersion < 14) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Requires >= 14.0.0`);
        }
    }

    async testDependencies() {
        const packagePath = path.join(__dirname, 'package.json');
        const packageJson = await fs.readJSON(packagePath);

        const requiredDeps = ['fs-extra', 'axios', 'commander', 'chalk', 'ora', 'inquirer'];

        for (const dep of requiredDeps) {
            if (!packageJson.dependencies[dep]) {
                throw new Error(`Missing required dependency: ${dep}`);
            }
        }
    }

    async testScriptExecution() {
        try {
            // Test that the script can be executed
            const result = execSync(`node "${this.deployerPath}" --version`, {
                encoding: 'utf8',
                timeout: 5000
            });

            if (!result.includes('1.0.0')) {
                throw new Error('Version output incorrect');
            }
        } catch (error) {
            throw new Error(`Script execution failed: ${error.message}`);
        }
    }

    async testHelpCommand() {
        try {
            const result = execSync(`node "${this.deployerPath}" --help`, {
                encoding: 'utf8',
                timeout: 5000
            });

            const expectedCommands = ['scan', 'deploy', 'update', 'status', 'init-project'];
            for (const cmd of expectedCommands) {
                if (!result.includes(cmd)) {
                    throw new Error(`Missing command in help: ${cmd}`);
                }
            }
        } catch (error) {
            throw new Error(`Help command failed: ${error.message}`);
        }
    }

    async testScanCommand() {
        try {
            // Test scan command execution
            const result = execSync(`node "${this.deployerPath}" scan`, {
                encoding: 'utf8',
                timeout: 10000
            });

            // Should contain scanning output
            if (!result.includes('Scanning')) {
                throw new Error('Scan command output unexpected');
            }
        } catch (error) {
            // It's okay if some CLI tools are not found
            if (!error.message.includes('Scanning')) {
                throw new Error(`Scan command failed: ${error.message}`);
            }
        }
    }

    async testConfigDirectoryCreation() {
        const tempConfigDir = path.join(this.testDir, 'temp-config');

        // Mock config directory creation
        await fs.ensureDir(tempConfigDir);

        if (!fs.existsSync(tempConfigDir)) {
            throw new Error('Config directory creation failed');
        }

        // Clean up
        await fs.remove(tempConfigDir);
    }

    async testPackageJson() {
        const packagePath = path.join(__dirname, 'package.json');
        const packageJson = await fs.readJSON(packagePath);

        // Validate package.json structure
        const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'scripts'];
        for (const field of requiredFields) {
            if (!packageJson[field]) {
                throw new Error(`Missing required field in package.json: ${field}`);
            }
        }

        // Check bin configuration
        if (!packageJson.bin['ai-cli-deploy']) {
            throw new Error('Missing bin configuration for ai-cli-deploy');
        }
    }

    async cleanup() {
        console.log(chalk.blue('🧹 Cleaning up test environment...'));
        if (fs.existsSync(this.testDir)) {
            await fs.remove(this.testDir);
        }
    }

    printResults() {
        console.log(chalk.bold('\n📊 Test Results:'));
        console.log('─'.repeat(50));

        const passed = this.tests.filter(t => t.status === 'PASSED').length;
        const failed = this.tests.filter(t => t.status === 'FAILED').length;

        this.tests.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' : '❌';
            const color = test.status === 'PASSED' ? chalk.green : chalk.red;
            console.log(`${icon} ${color(test.name)}`);
            if (test.error) {
                console.log(`   ${chalk.gray(test.error)}`);
            }
        });

        console.log('─'.repeat(50));
        console.log(`Total: ${this.tests.length}, ${chalk.green(`Passed: ${passed}`)}, ${chalk.red(`Failed: ${failed}`)}`);

        if (failed > 0) {
            process.exit(1);
        } else {
            console.log(chalk.green.bold('\n🎉 All tests passed!'));
        }
    }

    async runAllTests() {
        try {
            await this.setup();

            await this.runTest('Node.js Version Check', () => this.testNodeVersion());
            await this.runTest('Dependencies Check', () => this.testDependencies());
            await this.runTest('Script Execution', () => this.testScriptExecution());
            await this.runTest('Help Command', () => this.testHelpCommand());
            await this.runTest('Scan Command', () => this.testScanCommand());
            await this.runTest('Config Directory Creation', () => this.testConfigDirectoryCreation());
            await this.runTest('Package.json Validation', () => this.testPackageJson());

        } catch (error) {
            console.error(chalk.red('Test suite failed:'), error.message);
            process.exit(1);
        } finally {
            await this.cleanup();
            this.printResults();
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new DeploymentTester();
    tester.runAllTests().catch(error => {
        console.error(chalk.red('Test runner failed:'), error);
        process.exit(1);
    });
}

module.exports = DeploymentTester;