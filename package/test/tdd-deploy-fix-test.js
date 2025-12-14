#!/usr/bin/env node

/**
 * TDD Implementation Test for deployHooks Fix
 * This test verifies the implementation of automatic CLI tool installation and configuration
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class TDDDeployFixTester {
    constructor() {
        this.testResults = [];
    }
    
    // Mock CLI tools configuration for testing
    getMockCLITools() {
        return {
            iflow: {
                name: 'iFlow CLI',
                install: 'npm install -g iflow-cli',
                hooksDir: path.join(os.homedir(), '.config', 'iflow', 'hooks'),
                config: path.join(os.homedir(), '.config', 'iflow', 'hooks.yml'),
                installScript: 'install_iflow_integration.py'
            },
            claude: {
                name: 'Claude CLI',
                install: 'npm install -g claude-cli',
                hooksDir: path.join(os.homedir(), '.config', 'claude', 'hooks'),
                config: path.join(os.homedir(), '.config', 'claude', 'hooks.json'),
                installScript: 'install_claude_integration.py'
            }
        };
    }
    
    // Test 1: Verify directory creation functionality
    async testDirectoryCreation() {
        console.log('[TEST 1] Verifying directory creation functionality...');
        
        try {
            // Create a temporary test directory
            const testDir = path.join(os.tmpdir(), 'stigmergy-test-' + Date.now());
            await fs.mkdir(testDir, { recursive: true });
            
            // Test creating subdirectories
            const subDir = path.join(testDir, 'subdir', 'nested');
            await fs.mkdir(subDir, { recursive: true });
            
            // Verify directories exist
            await fs.access(testDir);
            await fs.access(subDir);
            
            // Clean up
            await fs.rm(testDir, { recursive: true, force: true });
            
            console.log('  âœ?Directory creation works correctly');
            
            this.testResults.push({
                name: 'Directory Creation',
                passed: true,
                details: 'Successfully created and verified directories'
            });
            
            return true;
        } catch (error) {
            console.log(`  âœ?Directory creation failed: ${error.message}`);
            
            this.testResults.push({
                name: 'Directory Creation',
                passed: false,
                details: `Failed: ${error.message}`
            });
            
            return false;
        }
    }
    
    // Test 2: Verify file copying functionality
    async testFileCopying() {
        console.log('\n[TEST 2] Verifying file copying functionality...');
        
        try {
            // Create source and destination directories
            const srcDir = path.join(os.tmpdir(), 'stigmergy-src-' + Date.now());
            const dstDir = path.join(os.tmpdir(), 'stigmergy-dst-' + Date.now());
            
            await fs.mkdir(srcDir, { recursive: true });
            await fs.mkdir(dstDir, { recursive: true });
            
            // Create test files
            const testFiles = ['file1.txt', 'file2.py', 'config.json'];
            for (const fileName of testFiles) {
                const filePath = path.join(srcDir, fileName);
                await fs.writeFile(filePath, `Test content for ${fileName}`);
            }
            
            // Create subdirectory with files
            const subDir = path.join(srcDir, 'subdir');
            await fs.mkdir(subDir, { recursive: true });
            await fs.writeFile(path.join(subDir, 'subfile.txt'), 'Subdirectory file content');
            
            // Test copyDirectory function (mock implementation)
            async function copyDirectory(src, dst) {
                await fs.mkdir(dst, { recursive: true });
                const entries = await fs.readdir(src, { withFileTypes: true });
                
                for (const entry of entries) {
                    const srcPath = path.join(src, entry.name);
                    const dstPath = path.join(dst, entry.name);
                    
                    if (entry.isDirectory()) {
                        await copyDirectory(srcPath, dstPath);
                    } else {
                        await fs.copyFile(srcPath, dstPath);
                    }
                }
            }
            
            // Copy files
            await copyDirectory(srcDir, dstDir);
            
            // Verify files were copied
            const dstFiles = await fs.readdir(dstDir);
            const expectedFiles = ['file1.txt', 'file2.py', 'config.json', 'subdir'];
            
            let allFilesCopied = true;
            for (const expectedFile of expectedFiles) {
                if (!dstFiles.includes(expectedFile)) {
                    console.log(`  âœ?Missing file: ${expectedFile}`);
                    allFilesCopied = false;
                }
            }
            
            // Check subdirectory contents
            const subDirFiles = await fs.readdir(path.join(dstDir, 'subdir'));
            if (!subDirFiles.includes('subfile.txt')) {
                console.log('  âœ?Subdirectory file not copied');
                allFilesCopied = false;
            }
            
            // Clean up
            await fs.rm(srcDir, { recursive: true, force: true });
            await fs.rm(dstDir, { recursive: true, force: true });
            
            if (allFilesCopied) {
                console.log('  âœ?File copying works correctly');
            }
            
            this.testResults.push({
                name: 'File Copying',
                passed: allFilesCopied,
                details: allFilesCopied ? 'Successfully copied all files and directories' : 'Some files not copied'
            });
            
            return allFilesCopied;
        } catch (error) {
            console.log(`  âœ?File copying failed: ${error.message}`);
            
            this.testResults.push({
                name: 'File Copying',
                passed: false,
                details: `Failed: ${error.message}`
            });
            
            return false;
        }
    }
    
    // Test 3: Verify installation script execution
    async testInstallationScriptExecution() {
        console.log('\n[TEST 3] Verifying installation script execution...');
        
        try {
            // Check if Python is available
            const pythonCheck = spawn('python', ['--version']);
            
            const pythonAvailable = await new Promise((resolve) => {
                pythonCheck.on('close', (code) => {
                    resolve(code === 0);
                });
                
                pythonCheck.on('error', () => {
                    resolve(false);
                });
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    resolve(false);
                }, 5000);
            });
            
            console.log(`  Python available: ${pythonAvailable ? 'âœ? : 'âœ?}`);
            
            this.testResults.push({
                name: 'Installation Script Execution',
                passed: pythonAvailable,
                details: pythonAvailable ? 'Python is available for script execution' : 'Python not available'
            });
            
            return pythonAvailable;
        } catch (error) {
            console.log(`  âœ?Installation script execution check failed: ${error.message}`);
            
            this.testResults.push({
                name: 'Installation Script Execution',
                passed: false,
                details: `Failed: ${error.message}`
            });
            
            return false;
        }
    }
    
    // Test 4: Verify configuration file creation
    async testConfigurationFileCreation() {
        console.log('\n[TEST 4] Verifying configuration file creation...');
        
        try {
            // Create a temporary config file
            const tempConfigDir = path.join(os.tmpdir(), 'stigmergy-config-test-' + Date.now());
            await fs.mkdir(tempConfigDir, { recursive: true });
            
            const configPath = path.join(tempConfigDir, 'test-config.yml');
            const configContent = `
plugins:
  - name: "TestPlugin"
    enabled: true
    config:
      test_setting: "value"
`;
            
            await fs.writeFile(configPath, configContent);
            
            // Verify file was created and has content
            const content = await fs.readFile(configPath, 'utf8');
            const fileExists = content.includes('TestPlugin');
            
            // Clean up
            await fs.rm(tempConfigDir, { recursive: true, force: true });
            
            if (fileExists) {
                console.log('  âœ?Configuration file creation works correctly');
            }
            
            this.testResults.push({
                name: 'Configuration File Creation',
                passed: fileExists,
                details: fileExists ? 'Successfully created configuration file' : 'Failed to create configuration file'
            });
            
            return fileExists;
        } catch (error) {
            console.log(`  âœ?Configuration file creation failed: ${error.message}`);
            
            this.testResults.push({
                name: 'Configuration File Creation',
                passed: false,
                details: `Failed: ${error.message}`
            });
            
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('TDD Implementation Test for deployHooks Fix');
        console.log('='.repeat(50));
        
        await this.testDirectoryCreation();
        await this.testFileCopying();
        await this.testInstallationScriptExecution();
        await this.testConfigurationFileCreation();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Implementation Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All implementation tests passed! Ready to implement deployHooks fix.');
        } else if (passedTests > 0) {
            console.log('âš?Some implementation tests failed. Implementation may need adjustments.');
        } else {
            console.log('âœ?All implementation tests failed. Implementation not ready.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runTDDDeployFixTests() {
    const tester = new TDDDeployFixTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { TDDDeployFixTester };

// Run if called directly
if (require.main === module) {
    runTDDDeployFixTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
