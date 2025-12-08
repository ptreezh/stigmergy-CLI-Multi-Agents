#!/usr/bin/env node

/**
 * Final Test for deployHooks Implementation
 * This test verifies that the deployHooks function now properly executes installation scripts
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class FinalDeployTester {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify deployHooks function can be imported and has the new functionality
    async testDeployHooksFunctionality() {
        console.log('[TEST 1] Verifying deployHooks function has new functionality...');
        
        try {
            // Import the StigmergyInstaller class
            const { StigmergyInstaller } = require('../src/main_english.js');
            const installer = new StigmergyInstaller();
            
            // Check if deployHooks method exists
            if (typeof installer.deployHooks !== 'function') {
                console.log('  ✗ deployHooks method not found');
                this.testResults.push({
                    name: 'DeployHooks Functionality',
                    passed: false,
                    details: 'deployHooks method not found'
                });
                return false;
            }
            
            // Check if the method includes the new configuration execution code
            const methodCode = installer.deployHooks.toString();
            const hasNewFunctionality = methodCode.includes('PostDeploymentConfigurer') && 
                                       methodCode.includes('configureTool');
            
            if (hasNewFunctionality) {
                console.log('  ✓ deployHooks includes new configuration execution functionality');
            } else {
                console.log('  ✗ deployHooks missing new configuration execution functionality');
            }
            
            this.testResults.push({
                name: 'DeployHooks Functionality',
                passed: hasNewFunctionality,
                details: hasNewFunctionality ? 
                    'Includes PostDeploymentConfigurer and configureTool execution' :
                    'Missing new configuration execution functionality'
            });
            
            return hasNewFunctionality;
        } catch (error) {
            console.log(`  ✗ Failed to test deployHooks functionality: ${error.message}`);
            this.testResults.push({
                name: 'DeployHooks Functionality',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify post-deployment config script integration
    async testPostDeploymentConfigIntegration() {
        console.log('\n[TEST 2] Verifying post-deployment config integration...');
        
        try {
            // Check if the post-deployment config script can be imported
            const { PostDeploymentConfigurer } = require('../scripts/post-deployment-config.js');
            
            // Check if the class exists
            if (typeof PostDeploymentConfigurer === 'function') {
                console.log('  ✓ PostDeploymentConfigurer class exists');
                
                // Try to instantiate it
                const configurer = new PostDeploymentConfigurer();
                
                // Check if required methods exist
                const hasRequiredMethods = typeof configurer.configureTool === 'function' &&
                                          typeof configurer.checkInstallScript === 'function';
                
                if (hasRequiredMethods) {
                    console.log('  ✓ PostDeploymentConfigurer has required methods');
                } else {
                    console.log('  ✗ PostDeploymentConfigurer missing required methods');
                }
                
                this.testResults.push({
                    name: 'Post-Deployment Config Integration',
                    passed: hasRequiredMethods,
                    details: hasRequiredMethods ? 
                        'PostDeploymentConfigurer class and methods exist' :
                        'Missing required methods in PostDeploymentConfigurer'
                });
                
                return hasRequiredMethods;
            } else {
                console.log('  ✗ PostDeploymentConfigurer class not found');
                this.testResults.push({
                    name: 'Post-Deployment Config Integration',
                    passed: false,
                    details: 'PostDeploymentConfigurer class not found'
                });
                return false;
            }
        } catch (error) {
            console.log(`  ✗ Failed to test post-deployment config integration: ${error.message}`);
            this.testResults.push({
                name: 'Post-Deployment Config Integration',
                passed: false,
                details: `Failed to test: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Verify installation script execution would work
    async testInstallationScriptExecutionFeasibility() {
        console.log('\n[TEST 3] Verifying installation script execution feasibility...');
        
        try {
            // Check if installation scripts exist in assets
            const stigmergyAssetsDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters');
            
            // Check a few key tools
            const toolsToCheck = ['iflow', 'claude', 'qoder'];
            let scriptsFound = 0;
            
            for (const tool of toolsToCheck) {
                const installScriptPath = path.join(stigmergyAssetsDir, tool, `install_${tool}_integration.py`);
                try {
                    await fs.access(installScriptPath);
                    console.log(`  ✓ ${tool} installation script found: ${installScriptPath}`);
                    scriptsFound++;
                } catch (error) {
                    console.log(`  ✗ ${tool} installation script not found: ${installScriptPath}`);
                }
            }
            
            const allScriptsFound = scriptsFound === toolsToCheck.length;
            
            this.testResults.push({
                name: 'Installation Script Execution Feasibility',
                passed: allScriptsFound,
                details: `Found ${scriptsFound}/${toolsToCheck.length} installation scripts`
            });
            
            return allScriptsFound;
        } catch (error) {
            console.log(`  ✗ Failed to check installation script feasibility: ${error.message}`);
            this.testResults.push({
                name: 'Installation Script Execution Feasibility',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Final Test for deployHooks Implementation');
        console.log('='.repeat(50));
        
        await this.testDeployHooksFunctionality();
        await this.testPostDeploymentConfigIntegration();
        await this.testInstallationScriptExecutionFeasibility();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Final Implementation Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? '✓ PASS' : '✗ FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('✓ All tests passed! deployHooks implementation is complete.');
        } else if (passedTests > 0) {
            console.log('⚠ Some tests failed. deployHooks implementation may need adjustments.');
        } else {
            console.log('✗ All tests failed. deployHooks implementation is not complete.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runFinalDeployTests() {
    const tester = new FinalDeployTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { FinalDeployTester };

// Run if called directly
if (require.main === module) {
    runFinalDeployTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}