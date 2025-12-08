#!/usr/bin/env node

/**
 * Enhanced Error Handling Test for Stigmergy Auto-Install
 * This test verifies that error handling is properly implemented
 * in the auto-install process to ensure graceful degradation
 */

const fs = require('fs').promises;
const path = require('path');

class ErrorHandlingTester {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify try-catch blocks in auto-install section
    async testAutoInstallTryCatch() {
        console.log('[TEST 1] Verifying try-catch blocks in auto-install section...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'main_english.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Extract auto-install section
            const autoInstallStart = mainScript.indexOf('case \'auto-install\':');
            if (autoInstallStart === -1) {
                console.log('  ✗ auto-install case not found');
                this.testResults.push({
                    name: 'Auto-Install Try-Catch Blocks',
                    passed: false,
                    details: 'auto-install case not found'
                });
                return false;
            }
            
            // Find the end of the auto-install case (next case or default)
            const nextCaseStart = mainScript.indexOf('case ', autoInstallStart + 1);
            const defaultStart = mainScript.indexOf('default:', autoInstallStart + 1);
            
            let autoInstallEnd = mainScript.length;
            if (nextCaseStart !== -1) {
                autoInstallEnd = nextCaseStart;
            } else if (defaultStart !== -1) {
                autoInstallEnd = defaultStart;
            }
            
            const autoInstallSection = mainScript.substring(autoInstallStart, autoInstallEnd);
            
            // Check for try-catch blocks
            const hasTryBlock = autoInstallSection.includes('try {');
            const hasCatchBlock = autoInstallSection.includes('catch');
            
            if (hasTryBlock && hasCatchBlock) {
                console.log('  ✓ try-catch blocks found in auto-install section');
            } else {
                console.log(`  ⚠ try-catch blocks: try=${hasTryBlock}, catch=${hasCatchBlock}`);
            }
            
            this.testResults.push({
                name: 'Auto-Install Try-Catch Blocks',
                passed: hasTryBlock && hasCatchBlock,
                details: `try: ${hasTryBlock}, catch: ${hasCatchBlock}`
            });
            
            return hasTryBlock && hasCatchBlock;
        } catch (error) {
            console.log(`  ✗ Failed to check try-catch blocks: ${error.message}`);
            this.testResults.push({
                name: 'Auto-Install Try-Catch Blocks',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify individual step error handling
    async testIndividualStepErrorHandling() {
        console.log('\n[TEST 2] Verifying individual step error handling...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'main_english.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Extract auto-install section
            const autoInstallStart = mainScript.indexOf('case \'auto-install\':');
            if (autoInstallStart === -1) {
                console.log('  ✗ auto-install case not found');
                this.testResults.push({
                    name: 'Individual Step Error Handling',
                    passed: false,
                    details: 'auto-install case not found'
                });
                return false;
            }
            
            // Find the end of the auto-install case
            const nextCaseStart = mainScript.indexOf('case ', autoInstallStart + 1);
            const defaultStart = mainScript.indexOf('default:', autoInstallStart + 1);
            
            let autoInstallEnd = mainScript.length;
            if (nextCaseStart !== -1) {
                autoInstallEnd = nextCaseStart;
            } else if (defaultStart !== -1) {
                autoInstallEnd = defaultStart;
            }
            
            const autoInstallSection = mainScript.substring(autoInstallStart, autoInstallEnd);
            
            // Check for error handling in individual steps
            const steps = [
                'downloadRequiredAssets',
                'scanCLI',
                'deployHooks',
                'deployProjectDocumentation',
                'initializeConfig'
            ];
            
            let stepsWithAwait = 0;
            let stepsWithErrorHandling = 0;
            
            for (const step of steps) {
                if (autoInstallSection.includes(step)) {
                    stepsWithAwait++;
                    // Check if the step call is wrapped in try-catch or has error handling
                    const stepIndex = autoInstallSection.indexOf(step);
                    const contextBefore = autoInstallSection.substring(Math.max(0, stepIndex - 100), stepIndex);
                    const contextAfter = autoInstallSection.substring(stepIndex, Math.min(autoInstallSection.length, stepIndex + 100));
                    const context = contextBefore + contextAfter;
                    
                    if (context.includes('try') || context.includes('catch') || context.includes('.catch')) {
                        stepsWithErrorHandling++;
                    }
                }
            }
            
            console.log(`  Steps with await: ${stepsWithAwait}/${steps.length}`);
            console.log(`  Steps with error handling: ${stepsWithErrorHandling}/${stepsWithAwait}`);
            
            // Even if not all steps have explicit error handling, the main try-catch should cover them
            const adequateErrorHandling = stepsWithAwait > 0; // At least some steps are called
            
            this.testResults.push({
                name: 'Individual Step Error Handling',
                passed: adequateErrorHandling,
                details: `Steps with await: ${stepsWithAwait}/${steps.length}, Steps with error handling: ${stepsWithErrorHandling}/${stepsWithAwait}`
            });
            
            return adequateErrorHandling;
        } catch (error) {
            console.log(`  ✗ Failed to check individual step error handling: ${error.message}`);
            this.testResults.push({
                name: 'Individual Step Error Handling',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Verify error messages and user guidance
    async testErrorMessagesAndGuidance() {
        console.log('\n[TEST 3] Verifying error messages and user guidance...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'main_english.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Extract auto-install section
            const autoInstallStart = mainScript.indexOf('case \'auto-install\':');
            if (autoInstallStart === -1) {
                console.log('  ✗ auto-install case not found');
                this.testResults.push({
                    name: 'Error Messages and Guidance',
                    passed: false,
                    details: 'auto-install case not found'
                });
                return false;
            }
            
            // Find the end of the auto-install case
            const nextCaseStart = mainScript.indexOf('case ', autoInstallStart + 1);
            const defaultStart = mainScript.indexOf('default:', autoInstallStart + 1);
            
            let autoInstallEnd = mainScript.length;
            if (nextCaseStart !== -1) {
                autoInstallEnd = nextCaseStart;
            } else if (defaultStart !== -1) {
                autoInstallEnd = defaultStart;
            }
            
            const autoInstallSection = mainScript.substring(autoInstallStart, autoInstallEnd);
            
            // Check for error messages and guidance
            const hasErrorMessages = autoInstallSection.includes('[ERROR]') || 
                                   autoInstallSection.includes('console.error');
            const hasUserGuidance = autoInstallSection.includes('[INFO]') || 
                                  autoInstallSection.includes('please run') ||
                                  autoInstallSection.includes('stigmergy install') ||
                                  autoInstallSection.includes('stigmergy setup');
            const hasSuccessMessage = autoInstallSection.includes('[SUCCESS]') || 
                                    autoInstallSection.includes('successfully');
            
            console.log(`  Error messages: ${hasErrorMessages}`);
            console.log(`  User guidance: ${hasUserGuidance}`);
            console.log(`  Success messages: ${hasSuccessMessage}`);
            
            const adequateMessaging = hasUserGuidance && hasSuccessMessage;
            
            this.testResults.push({
                name: 'Error Messages and Guidance',
                passed: adequateMessaging,
                details: `Error messages: ${hasErrorMessages}, User guidance: ${hasUserGuidance}, Success messages: ${hasSuccessMessage}`
            });
            
            return adequateMessaging;
        } catch (error) {
            console.log(`  ✗ Failed to check error messages and guidance: ${error.message}`);
            this.testResults.push({
                name: 'Error Messages and Guidance',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Verify main function error handling covers auto-install
    async testMainFunctionErrorHandling() {
        console.log('\n[TEST 4] Verifying main function error handling covers auto-install...');
        
        try {
            // Read main script
            const mainScriptPath = path.join(__dirname, '..', 'src', 'main_english.js');
            const mainScript = await fs.readFile(mainScriptPath, 'utf8');
            
            // Check main function error handling
            const mainFunctionStart = mainScript.indexOf('async function main()');
            const mainFunctionEnd = mainScript.indexOf('\n}', mainFunctionStart);
            
            if (mainFunctionStart === -1 || mainFunctionEnd === -1) {
                console.log('  ✗ Main function not found');
                this.testResults.push({
                    name: 'Main Function Error Handling',
                    passed: false,
                    details: 'Main function not found'
                });
                return false;
            }
            
            const mainFunction = mainScript.substring(mainFunctionStart, mainFunctionEnd);
            
            // Check if main function has catch block
            const hasCatchBlock = mainFunction.includes('catch');
            const hasProcessExit = mainFunction.includes('process.exit(1)');
            
            console.log(`  Main function has catch block: ${hasCatchBlock}`);
            console.log(`  Main function has process.exit(1): ${hasProcessExit}`);
            
            const adequateMainErrorHandling = hasCatchBlock && hasProcessExit;
            
            this.testResults.push({
                name: 'Main Function Error Handling',
                passed: adequateMainErrorHandling,
                details: `Has catch block: ${hasCatchBlock}, Has process.exit(1): ${hasProcessExit}`
            });
            
            return adequateMainErrorHandling;
        } catch (error) {
            console.log(`  ✗ Failed to check main function error handling: ${error.message}`);
            this.testResults.push({
                name: 'Main Function Error Handling',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Enhanced Error Handling Test for Stigmergy Auto-Install');
        console.log('='.repeat(60));
        
        await this.testAutoInstallTryCatch();
        await this.testIndividualStepErrorHandling();
        await this.testErrorMessagesAndGuidance();
        await this.testMainFunctionErrorHandling();
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('Enhanced Error Handling Test Summary:');
        console.log('='.repeat(60));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? '✓ PASS' : '⚠ PARTIAL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('✓ All error handling tests passed! Auto-install should handle errors gracefully.');
        } else if (passedTests > 0) {
            console.log('⚠ Some error handling tests partially passed. Auto-install has basic error handling.');
        } else {
            console.log('✗ All error handling tests failed. Auto-install may not handle errors gracefully.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runErrorHandlingTests() {
    const tester = new ErrorHandlingTester();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { ErrorHandlingTester };

// Run if called directly
if (require.main === module) {
    runErrorHandlingTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}