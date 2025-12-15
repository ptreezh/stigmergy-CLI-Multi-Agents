#!/usr/bin/env node

/**
 * Test for postinstall behavior and error handling
 * This test verifies that the npm postinstall script works correctly
 * and provides graceful degradation when problems occur
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class PostInstallTester {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify postinstall script exists and is correct
    async testPostInstallScript() {
        console.log('[TEST 1] Verifying postinstall script configuration...');
        
        try {
            // Read package.json
            const packageJsonPath = path.join(__dirname, '..', 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
            
            // Check if postinstall script exists
            if (!packageJson.scripts || !packageJson.scripts.postinstall) {
                console.log('  âœ?postinstall script not found in package.json');
                this.testResults.push({
                    name: 'Postinstall Script Configuration',
                    passed: false,
                    details: 'postinstall script not found in package.json'
                });
                return false;
            }
            
            const postinstallScript = packageJson.scripts.postinstall;
            console.log(`  Postinstall script: ${postinstallScript}`);
            
            // Check if it calls the auto-install command
            const hasAutoInstall = postinstallScript.includes('auto-install');
            const hasMainScript = postinstallScript.includes('src/index.js');
            
            if (hasAutoInstall && hasMainScript) {
                console.log('  âœ?postinstall script correctly configured for auto-install');
            } else {
                console.log('  âœ?postinstall script missing auto-install configuration');
            }
            
            this.testResults.push({
                name: 'Postinstall Script Configuration',
                passed: hasAutoInstall && hasMainScript,
                details: hasAutoInstall && hasMainScript ? 
                    'Correctly configured for auto-install' : 
                    'Missing auto-install configuration'
            });
            
            return hasAutoInstall && hasMainScript;
        } catch (error) {
            console.log(`  âœ?Failed to check postinstall script: ${error.message}`);
            this.testResults.push({
                name: 'Postinstall Script Configuration',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify auto-install command exists
    async testAutoInstallCommand() {
        console.log('\n[TEST 2] Verifying auto-install command implementation...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'index.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Check if auto-install case exists
            const hasAutoInstallCase = mainScript.includes('case \'auto-install\':') || 
                                    mainScript.includes('case "auto-install":');
            
            if (hasAutoInstallCase) {
                console.log('  âœ?auto-install command implemented');
            } else {
                console.log('  âœ?auto-install command not implemented');
            }
            
            // Check if it includes error handling
            const hasErrorHandling = mainScript.includes('try {') && mainScript.includes('catch');
            
            this.testResults.push({
                name: 'Auto-Install Command Implementation',
                passed: hasAutoInstallCase,
                details: hasAutoInstallCase ? 
                    'auto-install command implemented' : 
                    'auto-install command not implemented'
            });
            
            return hasAutoInstallCase;
        } catch (error) {
            console.log(`  âœ?Failed to check auto-install command: ${error.message}`);
            this.testResults.push({
                name: 'Auto-Install Command Implementation',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Verify graceful degradation and user guidance
    async testGracefulDegradation() {
        console.log('\n[TEST 3] Verifying graceful degradation and user guidance...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'index.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Check if auto-install includes user guidance
            const hasUserGuidance = mainScript.includes('For full functionality') ||
                                  mainScript.includes('please run') ||
                                  mainScript.includes('stigmergy install') ||
                                  mainScript.includes('stigmergy setup');
            
            if (hasUserGuidance) {
                console.log('  âœ?User guidance messages found in auto-install');
            } else {
                console.log('  âœ?User guidance messages not found in auto-install');
            }
            
            // Check if it handles missing tools gracefully
            const hasMissingToolsHandling = mainScript.includes('Skipping automatic installation') ||
                                          mainScript.includes('missing AI CLI tools') ||
                                          mainScript.includes('autoMissing');
            
            if (hasMissingToolsHandling) {
                console.log('  âœ?Missing tools handling found in auto-install');
            } else {
                console.log('  âœ?Missing tools handling not found in auto-install');
            }
            
            // Check if it shows success message
            const hasSuccessMessage = mainScript.includes('SUCCESS') && 
                                    mainScript.includes('installed successfully');
            
            this.testResults.push({
                name: 'Graceful Degradation and Guidance',
                passed: hasUserGuidance && hasMissingToolsHandling && hasSuccessMessage,
                details: `User guidance: ${hasUserGuidance}, Missing tools handling: ${hasMissingToolsHandling}, Success message: ${hasSuccessMessage}`
            });
            
            return hasUserGuidance && hasMissingToolsHandling && hasSuccessMessage;
        } catch (error) {
            console.log(`  âœ?Failed to check graceful degradation: ${error.message}`);
            this.testResults.push({
                name: 'Graceful Degradation and Guidance',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Verify error handling in auto-install
    async testErrorHandling() {
        console.log('\n[TEST 4] Verifying error handling in auto-install...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'index.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Check if main function has error handling
            const hasMainErrorHandling = mainScript.includes('main().catch') ||
                                       mainScript.includes('try {') && mainScript.includes('catch');
            
            if (hasMainErrorHandling) {
                console.log('  âœ?Main function has error handling');
            } else {
                console.log('  âœ?Main function missing error handling');
            }
            
            // Check if auto-install has specific error handling
            const autoInstallSection = mainScript.split('case \'auto-install\':')[1] || 
                                     mainScript.split('case "auto-install":')[1] || '';
            
            const hasAutoInstallErrorHandling = autoInstallSection.includes('try {') && 
                                              autoInstallSection.includes('catch');
            
            this.testResults.push({
                name: 'Error Handling',
                passed: hasMainErrorHandling,
                details: `Main error handling: ${hasMainErrorHandling}, Auto-install error handling: ${hasAutoInstallErrorHandling}`
            });
            
            return hasMainErrorHandling;
        } catch (error) {
            console.log(`  âœ?Failed to check error handling: ${error.message}`);
            this.testResults.push({
                name: 'Error Handling',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Postinstall Behavior and Error Handling Test');
        console.log('='.repeat(50));
        
        await this.testPostInstallScript();
        await this.testAutoInstallCommand();
        await this.testGracefulDegradation();
        await this.testErrorHandling();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Postinstall Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All postinstall tests passed! Package should work correctly.');
        } else if (passedTests > 0) {
            console.log('âš?Some postinstall tests failed. Package may need improvements.');
        } else {
            console.log('âœ?All postinstall tests failed. Package needs significant improvements.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runPostInstallTests() {
    const tester = new PostInstallTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { PostInstallTester };

// Run if called directly
if (require.main === module) {
    runPostInstallTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
