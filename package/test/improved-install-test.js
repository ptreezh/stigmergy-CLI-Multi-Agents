#!/usr/bin/env node

/**
 * Improved Test for CLI Installation with Better Error Handling
 * This test verifies installation commands with improved error handling
 * and Windows compatibility
 */

const { spawnSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');

class ImprovedInstallTester {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify npm availability with multiple methods
    async testNpmAvailability() {
        console.log('[TEST 1] Verifying npm availability with multiple methods...');
        
        try {
            // Method 1: Direct npm command
            console.log('  Testing direct npm command...');
            const npmDirect = spawnSync('npm', ['--version'], {
                encoding: 'utf8',
                timeout: 10000
            });
            
            console.log(`  Direct npm - Status: ${npmDirect.status}`);
            if (npmDirect.stdout) {
                console.log(`  Direct npm - Version: ${npmDirect.stdout.trim()}`);
            }
            
            // Method 2: npm through cmd.exe on Windows
            const isWindows = process.platform === 'win32';
            let npmThroughCmd = { status: null };
            
            if (isWindows) {
                console.log('  Testing npm through cmd.exe...');
                npmThroughCmd = spawnSync('cmd.exe', ['/c', 'npm', '--version'], {
                    encoding: 'utf8',
                    timeout: 10000
                });
                console.log(`  npm through cmd.exe - Status: ${npmThroughCmd.status}`);
            }
            
            // Method 3: Check PATH for npm
            console.log('  Checking PATH for npm...');
            const pathEnv = process.env.PATH || '';
            const hasNpmInPath = pathEnv.toLowerCase().includes('npm');
            console.log(`  npm in PATH: ${hasNpmInPath}`);
            
            const npmAvailable = npmDirect.status === 0 || npmThroughCmd.status === 0;
            
            this.testResults.push({
                name: 'npm Availability',
                passed: npmAvailable,
                details: `Direct: ${npmDirect.status === 0}, Cmd: ${npmThroughCmd.status === 0}, PATH: ${hasNpmInPath}`
            });
            
            return npmAvailable;
        } catch (error) {
            console.log(`  âœ?Failed to check npm availability: ${error.message}`);
            this.testResults.push({
                name: 'npm Availability',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Test Qoder CLI installation with shell options
    async testQoderInstallationWithShellOptions() {
        console.log('\n[TEST 2] Testing Qoder CLI installation with shell options...');
        
        try {
            const installCommand = 'npm install -g @qoder-ai/qodercli';
            const commandParts = installCommand.split(' ');
            const command = commandParts[0];
            const args = commandParts.slice(1);
            
            console.log(`  Installation command: ${installCommand}`);
            
            // Test 1: Without shell option
            console.log('  Testing without shell option...');
            const test1 = spawnSync(command, args, {
                encoding: 'utf8',
                timeout: 15000,
                stdio: 'pipe'
            });
            
            console.log(`  Without shell - Status: ${test1.status}`);
            
            // Test 2: With shell=true
            console.log('  Testing with shell=true...');
            const test2 = spawnSync(command, args, {
                encoding: 'utf8',
                timeout: 15000,
                stdio: 'pipe',
                shell: true
            });
            
            console.log(`  With shell - Status: ${test2.status}`);
            
            // Test 3: On Windows, try cmd.exe explicitly
            let test3 = { status: null };
            if (process.platform === 'win32') {
                console.log('  Testing with explicit cmd.exe...');
                const fullCommand = [command, ...args].join(' ');
                test3 = spawnSync('cmd.exe', ['/c', fullCommand], {
                    encoding: 'utf8',
                    timeout: 15000,
                    stdio: 'pipe'
                });
                console.log(`  Explicit cmd.exe - Status: ${test3.status}`);
            }
            
            // Determine which method works
            const worksWithoutShell = test1.status === 0;
            const worksWithShell = test2.status === 0;
            const worksWithCmd = test3.status === 0;
            
            console.log(`  Results - Without shell: ${worksWithoutShell}, With shell: ${worksWithShell}, With cmd: ${worksWithCmd}`);
            
            this.testResults.push({
                name: 'Qoder Installation Shell Options',
                passed: worksWithoutShell || worksWithShell || worksWithCmd,
                details: `Without shell: ${worksWithoutShell}, With shell: ${worksWithShell}, With cmd: ${worksWithCmd}`
            });
            
            return worksWithoutShell || worksWithShell || worksWithCmd;
        } catch (error) {
            console.log(`  âœ?Failed to test installation with shell options: ${error.message}`);
            this.testResults.push({
                name: 'Qoder Installation Shell Options',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Test spawn vs spawnSync behavior
    async testSpawnVsSpawnSync() {
        console.log('\n[TEST 3] Testing spawn vs spawnSync behavior...');
        
        try {
            const command = 'npm';
            const args = ['--version'];
            
            // Test spawnSync
            console.log('  Testing spawnSync...');
            const syncResult = spawnSync(command, args, {
                encoding: 'utf8',
                timeout: 10000,
                shell: true
            });
            
            console.log(`  spawnSync - Status: ${syncResult.status}`);
            
            // Test spawn
            console.log('  Testing spawn...');
            const spawnResult = await new Promise((resolve) => {
                const child = spawn(command, args, {
                    encoding: 'utf8',
                    timeout: 10000,
                    shell: true
                });
                
                let stdout = '';
                let stderr = '';
                
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                child.on('close', (code) => {
                    resolve({
                        status: code,
                        stdout: stdout,
                        stderr: stderr
                    });
                });
                
                child.on('error', (error) => {
                    resolve({
                        status: null,
                        error: error.message
                    });
                });
                
                // Timeout
                setTimeout(() => {
                    child.kill();
                    resolve({
                        status: null,
                        error: 'Timeout'
                    });
                }, 11000);
            });
            
            console.log(`  spawn - Status: ${spawnResult.status}`);
            if (spawnResult.error) {
                console.log(`  spawn - Error: ${spawnResult.error}`);
            }
            
            const bothWork = syncResult.status === 0 && spawnResult.status === 0;
            
            this.testResults.push({
                name: 'Spawn vs SpawnSync',
                passed: bothWork,
                details: `spawnSync: ${syncResult.status}, spawn: ${spawnResult.status}`
            });
            
            return bothWork;
        } catch (error) {
            console.log(`  âœ?Failed to test spawn behavior: ${error.message}`);
            this.testResults.push({
                name: 'Spawn vs SpawnSync',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Verify current installation implementation issues
    async testCurrentInstallationImplementation() {
        console.log('\n[TEST 4] Verifying current installation implementation...');
        
        try {
            // Simulate the current implementation from index.js
            const toolInfo = {
                name: 'Qoder CLI',
                install: 'npm install -g @qoder-ai/qodercli'
            };
            
            console.log(`  Simulating current implementation for: ${toolInfo.name}`);
            console.log(`  Install command: ${toolInfo.install}`);
            
            const installCmd = toolInfo.install.split(' ');
            console.log(`  Command parts: ${JSON.stringify(installCmd)}`);
            
            // Current implementation (similar to lines 512-518 in index.js)
            console.log('  Testing current implementation approach...');
            const result = spawnSync(installCmd[0], installCmd.slice(1), {
                encoding: 'utf8',
                timeout: 300000, // 5 minutes
                stdio: 'pipe', // Changed from 'inherit' to 'pipe' for testing
                env: process.env
            });
            
            console.log(`  Current implementation - Status: ${result.status}`);
            if (result.error) {
                console.log(`  Current implementation - Error: ${result.error.message}`);
            }
            if (result.stderr && result.stderr.length > 0) {
                const stderrPreview = result.stderr.substring(0, 200);
                console.log(`  Current implementation - Stderr preview: ${stderrPreview}${result.stderr.length > 200 ? '...' : ''}`);
            }
            
            // Test with shell=true
            console.log('  Testing current implementation with shell=true...');
            const resultWithShell = spawnSync(installCmd[0], installCmd.slice(1), {
                encoding: 'utf8',
                timeout: 300000,
                stdio: 'pipe',
                env: process.env,
                shell: true
            });
            
            console.log(`  Current implementation with shell - Status: ${resultWithShell.status}`);
            if (resultWithShell.error) {
                console.log(`  Current implementation with shell - Error: ${resultWithShell.error.message}`);
            }
            if (resultWithShell.stderr && resultWithShell.stderr.length > 0) {
                const stderrPreview = resultWithShell.stderr.substring(0, 200);
                console.log(`  Current implementation with shell - Stderr preview: ${stderrPreview}${resultWithShell.stderr.length > 200 ? '...' : ''}`);
            }
            
            this.testResults.push({
                name: 'Current Installation Implementation',
                passed: result.status === 0 || resultWithShell.status === 0,
                details: `Without shell: ${result.status}, With shell: ${resultWithShell.status}`
            });
            
            return result.status === 0 || resultWithShell.status === 0;
        } catch (error) {
            console.log(`  âœ?Failed to test current implementation: ${error.message}`);
            this.testResults.push({
                name: 'Current Installation Implementation',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Improved CLI Installation Test');
        console.log('='.repeat(40));
        
        await this.testNpmAvailability();
        await this.testQoderInstallationWithShellOptions();
        await this.testSpawnVsSpawnSync();
        await this.testCurrentInstallationImplementation();
        
        // Summary
        console.log('\n' + '='.repeat(40));
        console.log('Improved Installation Test Summary:');
        console.log('='.repeat(40));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All improved installation tests passed!');
        } else if (passedTests > 0) {
            console.log('âš?Some improved installation tests passed.');
        } else {
            console.log('âœ?All improved installation tests failed.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runImprovedInstallTests() {
    const tester = new ImprovedInstallTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { ImprovedInstallTester };

// Run if called directly
if (require.main === module) {
    runImprovedInstallTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
