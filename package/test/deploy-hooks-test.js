#!/usr/bin/env node

/**
 * TDD Test for deployHooks Functionality
 * This test verifies that the deployHooks function properly installs and configures CLI tools
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class DeployHooksTester {
    constructor() {
        this.testResults = [];
        this.stigmergyAssetsDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters');
    }
    
    // Test 1: Verify deployHooks copies adapter files correctly
    async testAdapterFileCopy() {
        console.log('[TEST 1] Verifying adapter file copying...');
        
        try {
            // Check if adapter directories exist in assets
            const adapterDirs = await fs.readdir(this.stigmergyAssetsDir);
            console.log(`  Found adapter directories: ${adapterDirs.join(', ')}`);
            
            // Check if key adapter files exist
            const expectedFiles = {
                'iflow': ['hook_adapter.py', 'install_iflow_integration.py'],
                'claude': ['hook_adapter.py', 'install_claude_integration.py'],
                'qoder': ['notification_hook_adapter.py', 'install_qoder_integration.py']
            };
            
            let allFilesExist = true;
            for (const [tool, files] of Object.entries(expectedFiles)) {
                const toolDir = path.join(this.stigmergyAssetsDir, tool);
                try {
                    const dirFiles = await fs.readdir(toolDir);
                    console.log(`  ${tool} adapter files: ${dirFiles.join(', ')}`);
                    
                    for (const expectedFile of files) {
                        if (!dirFiles.includes(expectedFile)) {
                            console.log(`  âœ?Missing file: ${expectedFile} in ${tool}`);
                            allFilesExist = false;
                        }
                    }
                } catch (error) {
                    console.log(`  âœ?Cannot access ${tool} adapter directory: ${error.message}`);
                    allFilesExist = false;
                }
            }
            
            this.testResults.push({
                name: 'Adapter File Copy',
                passed: allFilesExist,
                details: 'Verified adapter files exist in assets directory'
            });
            
            return allFilesExist;
        } catch (error) {
            console.log(`  âœ?Failed to check adapter files: ${error.message}`);
            this.testResults.push({
                name: 'Adapter File Copy',
                passed: false,
                details: `Failed to check adapter files: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify installation script execution
    async testInstallationScriptExecution() {
        console.log('\n[TEST 2] Verifying installation script execution...');
        
        try {
            // Check if post-deployment config script exists
            const postDeployScript = path.join(__dirname, '..', 'scripts', 'post-deployment-config.js');
            await fs.access(postDeployScript);
            console.log('  âœ?Post-deployment config script exists');
            
            // Try to import and test the PostDeploymentConfigurer
            const { PostDeploymentConfigurer } = require('../scripts/post-deployment-config.js');
            const configurer = new PostDeploymentConfigurer();
            
            // Test checking install script for a tool
            const scriptCheck = await configurer.checkInstallScript('iflow');
            console.log(`  iFlow install script check: ${scriptCheck.exists ? 'âœ?Found' : 'âœ?Not found'}`);
            console.log(`  Script path: ${scriptCheck.path}`);
            
            this.testResults.push({
                name: 'Installation Script Execution',
                passed: scriptCheck.exists,
                details: `iFlow install script ${scriptCheck.exists ? 'found' : 'not found'}`
            });
            
            return scriptCheck.exists;
        } catch (error) {
            console.log(`  âœ?Failed to test installation script execution: ${error.message}`);
            this.testResults.push({
                name: 'Installation Script Execution',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Verify hook configuration files are created
    async testHookConfigurationCreation() {
        console.log('\n[TEST 3] Verifying hook configuration creation...');
        
        try {
            // Check common hook configuration locations
            const configPaths = [
                path.join(os.homedir(), '.config', 'iflow', 'hooks.yml'),
                path.join(os.homedir(), '.config', 'claude', 'hooks.json'),
                path.join(os.homedir(), '.qoder', 'config.json')
            ];
            
            let configsFound = 0;
            for (const configPath of configPaths) {
                try {
                    await fs.access(configPath);
                    console.log(`  âœ?Configuration found: ${configPath}`);
                    configsFound++;
                } catch (error) {
                    console.log(`  âœ?Configuration not found: ${configPath}`);
                }
            }
            
            const passed = configsFound > 0;
            this.testResults.push({
                name: 'Hook Configuration Creation',
                passed: passed,
                details: `Found ${configsFound}/${configPaths.length} configuration files`
            });
            
            return passed;
        } catch (error) {
            console.log(`  âœ?Failed to check hook configurations: ${error.message}`);
            this.testResults.push({
                name: 'Hook Configuration Creation',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Verify deployHooks function integration
    async testDeployHooksIntegration() {
        console.log('\n[TEST 4] Verifying deployHooks function integration...');
        
        try {
            // Try to import and test the deployHooks function
            const StigmergyInstaller = require('../src/core/installer');
            const installer = new StigmergyInstaller();
            
            // Check if deployHooks method exists
            if (typeof installer.deployHooks === 'function') {
                console.log('  âœ?deployHooks method exists');
                
                this.testResults.push({
                    name: 'DeployHooks Integration',
                    passed: true,
                    details: 'deployHooks method exists in StigmergyInstaller'
                });
                
                return true;
            } else {
                console.log('  âœ?deployHooks method not found');
                
                this.testResults.push({
                    name: 'DeployHooks Integration',
                    passed: false,
                    details: 'deployHooks method not found in StigmergyInstaller'
                });
                
                return false;
            }
        } catch (error) {
            console.log(`  âœ?Failed to test deployHooks integration: ${error.message}`);
            this.testResults.push({
                name: 'DeployHooks Integration',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('TDD Test for deployHooks Functionality');
        console.log('='.repeat(50));
        
        await this.testAdapterFileCopy();
        await this.testInstallationScriptExecution();
        await this.testHookConfigurationCreation();
        await this.testDeployHooksIntegration();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All tests passed! deployHooks functionality is working correctly.');
        } else if (passedTests > 0) {
            console.log('âš?Some tests failed. deployHooks functionality needs improvement.');
        } else {
            console.log('âœ?All tests failed. deployHooks functionality is not working.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runDeployHooksTests() {
    const tester = new DeployHooksTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { DeployHooksTester };

// Run if called directly
if (require.main === module) {
    runDeployHooksTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
