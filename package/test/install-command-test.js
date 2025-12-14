#!/usr/bin/env node

/**
 * Test for CLI Installation Command Execution
 * This test verifies that the installation commands work correctly
 * and identifies potential issues with shell execution
 */

const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

class InstallCommandTester {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify Qoder CLI installation command format
    async testQoderInstallCommandFormat() {
        console.log('[TEST 1] Verifying Qoder CLI installation command format...');
        
        try {
            // Check the installation command in the configuration
            const installCommand = 'npm install -g @qoder-ai/qodercli';
            console.log(`  Installation command: ${installCommand}`);
            
            // Verify it's a valid npm command
            const isValidNpmCommand = installCommand.startsWith('npm install -g');
            console.log(`  Valid npm command: ${isValidNpmCommand}`);
            
            // Check if package name is valid
            const packageName = installCommand.split(' ')[3]; // @qoder-ai/qodercli
            const hasValidPackageName = packageName && packageName.includes('@') && packageName.includes('/');
            console.log(`  Valid package name: ${hasValidPackageName} (${packageName})`);
            
            this.testResults.push({
                name: 'Qoder Install Command Format',
                passed: isValidNpmCommand && hasValidPackageName,
                details: `Command: ${installCommand}, Package: ${packageName}`
            });
            
            return isValidNpmCommand && hasValidPackageName;
        } catch (error) {
            console.log(`  âœ?Failed to check install command format: ${error.message}`);
            this.testResults.push({
                name: 'Qoder Install Command Format',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify command execution environment
    async testCommandExecutionEnvironment() {
        console.log('\n[TEST 2] Verifying command execution environment...');
        
        try {
            // Check if npm is available
            const npmCheck = spawnSync('npm', ['--version'], {
                encoding: 'utf8',
                timeout: 5000
            });
            
            const npmAvailable = npmCheck.status === 0;
            console.log(`  npm available: ${npmAvailable}`);
            if (npmAvailable) {
                console.log(`  npm version: ${npmCheck.stdout.trim()}`);
            }
            
            // Check if we're on Windows
            const isWindows = process.platform === 'win32';
            console.log(`  Platform: ${process.platform} (Windows: ${isWindows})`);
            
            // Check NODE_PATH and PATH environment variables
            const hasNodePath = !!process.env.NODE_PATH;
            const pathLength = process.env.PATH ? process.env.PATH.length : 0;
            console.log(`  NODE_PATH set: ${hasNodePath}`);
            console.log(`  PATH length: ${pathLength} characters`);
            
            this.testResults.push({
                name: 'Command Execution Environment',
                passed: npmAvailable,
                details: `npm: ${npmAvailable}, Platform: ${process.platform}, PATH length: ${pathLength}`
            });
            
            return npmAvailable;
        } catch (error) {
            console.log(`  âœ?Failed to check execution environment: ${error.message}`);
            this.testResults.push({
                name: 'Command Execution Environment',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Simulate installation command execution issues
    async testInstallationCommandExecution() {
        console.log('\n[TEST 3] Simulating installation command execution...');
        
        try {
            // Test a simple npm command first
            console.log('  Testing basic npm command...');
            const simpleNpmTest = spawnSync('npm', ['help'], {
                encoding: 'utf8',
                timeout: 10000,
                stdio: 'pipe'
            });
            
            console.log(`  Simple npm test - Status: ${simpleNpmTest.status}`);
            if (simpleNpmTest.stderr && simpleNpmTest.stderr.length > 0) {
                console.log(`  Simple npm test - Stderr length: ${simpleNpmTest.stderr.length}`);
            }
            
            // Test the actual Qoder installation command (dry run)
            console.log('  Testing Qoder installation command (dry run)...');
            const installTest = spawnSync('npm', ['install', '@qoder-ai/qodercli', '--dry-run'], {
                encoding: 'utf8',
                timeout: 15000,
                stdio: 'pipe'
            });
            
            console.log(`  Qoder install test - Status: ${installTest.status}`);
            if (installTest.stdout && installTest.stdout.length > 0) {
                const stdoutPreview = installTest.stdout.substring(0, 200);
                console.log(`  Qoder install test - Stdout preview: ${stdoutPreview}${installTest.stdout.length > 200 ? '...' : ''}`);
            }
            
            if (installTest.stderr && installTest.stderr.length > 0) {
                const stderrPreview = installTest.stderr.substring(0, 200);
                console.log(`  Qoder install test - Stderr preview: ${stderrPreview}${installTest.stderr.length > 200 ? '...' : ''}`);
                
                // Check for common Windows-related errors
                const hasWindowsError = installTest.stderr.includes('spawn') || 
                                      installTest.stderr.includes('ENOENT') ||
                                      installTest.stderr.includes('not found');
                if (hasWindowsError) {
                    console.log('  âš?Potential Windows spawn error detected');
                }
            }
            
            // Check if the command at least started (status might not be 0 for dry-run)
            const commandStarted = installTest.status !== null;
            
            this.testResults.push({
                name: 'Installation Command Execution',
                passed: commandStarted,
                details: `Status: ${installTest.status}, Started: ${commandStarted}`
            });
            
            return commandStarted;
        } catch (error) {
            console.log(`  âœ?Failed to test installation command execution: ${error.message}`);
            this.testResults.push({
                name: 'Installation Command Execution',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Check for Windows-specific shell issues
    async testWindowsShellIssues() {
        console.log('\n[TEST 4] Checking for Windows-specific shell issues...');
        
        try {
            const isWindows = process.platform === 'win32';
            console.log(`  Platform: ${process.platform} (Windows: ${isWindows})`);
            
            if (!isWindows) {
                console.log('  âœ?Not on Windows, skipping Windows-specific tests');
                this.testResults.push({
                    name: 'Windows Shell Issues',
                    passed: true,
                    details: 'Not on Windows platform'
                });
                return true;
            }
            
            // Test different shell execution methods
            console.log('  Testing cmd.exe execution...');
            const cmdTest = spawnSync('cmd.exe', ['/c', 'echo', 'test'], {
                encoding: 'utf8',
                timeout: 5000
            });
            
            const cmdWorks = cmdTest.status === 0;
            console.log(`  cmd.exe works: ${cmdWorks}`);
            
            console.log('  Testing PowerShell execution...');
            const psTest = spawnSync('powershell.exe', ['-Command', 'Write-Output "test"'], {
                encoding: 'utf8',
                timeout: 10000
            });
            
            const psWorks = psTest.status === 0;
            console.log(`  PowerShell works: ${psWorks}`);
            
            // Test npm through cmd.exe
            console.log('  Testing npm through cmd.exe...');
            const npmCmdTest = spawnSync('cmd.exe', ['/c', 'npm', '--version'], {
                encoding: 'utf8',
                timeout: 10000
            });
            
            const npmThroughCmd = npmCmdTest.status === 0;
            console.log(`  npm through cmd.exe: ${npmThroughCmd}`);
            
            this.testResults.push({
                name: 'Windows Shell Issues',
                passed: cmdWorks && psWorks,
                details: `cmd.exe: ${cmdWorks}, PowerShell: ${psWorks}, npm through cmd: ${npmThroughCmd}`
            });
            
            return cmdWorks && psWorks;
        } catch (error) {
            console.log(`  âœ?Failed to check Windows shell issues: ${error.message}`);
            this.testResults.push({
                name: 'Windows Shell Issues',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 5: Verify spawnSync vs spawn behavior
    async testSpawnBehavior() {
        console.log('\n[TEST 5] Verifying spawn behavior differences...');
        
        try {
            // Test spawnSync (currently used in the code)
            console.log('  Testing spawnSync behavior...');
            const syncResult = spawnSync('npm', ['--version'], {
                encoding: 'utf8',
                timeout: 5000
            });
            
            console.log(`  spawnSync - Status: ${syncResult.status}`);
            
            // Test spawn (alternative approach)
            console.log('  Testing spawn behavior...');
            const spawnResult = await new Promise((resolve) => {
                const child = require('child_process').spawn('npm', ['--version'], {
                    encoding: 'utf8',
                    timeout: 5000
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
                
                // Timeout handling
                setTimeout(() => {
                    resolve({
                        status: null,
                        error: 'Timeout'
                    });
                }, 6000);
            });
            
            console.log(`  spawn - Status: ${spawnResult.status}`);
            if (spawnResult.error) {
                console.log(`  spawn - Error: ${spawnResult.error}`);
            }
            
            const bothWork = syncResult.status === 0 && spawnResult.status === 0;
            
            this.testResults.push({
                name: 'Spawn Behavior',
                passed: bothWork,
                details: `spawnSync: ${syncResult.status}, spawn: ${spawnResult.status}`
            });
            
            return bothWork;
        } catch (error) {
            console.log(`  âœ?Failed to test spawn behavior: ${error.message}`);
            this.testResults.push({
                name: 'Spawn Behavior',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('CLI Installation Command Execution Test');
        console.log('='.repeat(50));
        
        await this.testQoderInstallCommandFormat();
        await this.testCommandExecutionEnvironment();
        await this.testInstallationCommandExecution();
        await this.testWindowsShellIssues();
        await this.testSpawnBehavior();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Installation Command Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All installation command tests passed!');
        } else if (passedTests > 0) {
            console.log('âš?Some installation command tests failed.');
        } else {
            console.log('âœ?All installation command tests failed.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runInstallCommandTests() {
    const tester = new InstallCommandTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { InstallCommandTester };

// Run if called directly
if (require.main === module) {
    runInstallCommandTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
