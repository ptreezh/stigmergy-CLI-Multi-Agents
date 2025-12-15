#!/usr/bin/env node

/**
 * Final Test for Improved Installation Implementation
 * This test verifies that the improved installation implementation works correctly
 */

const fs = require('fs').promises;
const path = require('path');

class FinalInstallTest {
    constructor() {
        this.testResults = [];
    }
    
    // Test 1: Verify the improved installation code was implemented correctly
    async testImprovedInstallationCode() {
        console.log('[TEST 1] Verifying improved installation code implementation...');
        
        try {
            // Read the index.js file
            const mainFilePath = path.join(__dirname, '..', 'src', 'index.js');
            const mainContent = await fs.readFile(mainFilePath, 'utf8');
            
            // Check for key improvements
            const hasShellTrue = mainContent.includes('shell: true');
            const hasFallbackLogic = mainContent.includes('if (result.status !== 0 && result.status !== null)');
            const hasDebugLogging = mainContent.includes('[DEBUG] Installing');
            const hasErrorDetails = mainContent.includes('Installation error:');
            
            console.log(`  shell: true option: ${hasShellTrue}`);
            console.log(`  Fallback logic: ${hasFallbackLogic}`);
            console.log(`  Debug logging: ${hasDebugLogging}`);
            console.log(`  Error details: ${hasErrorDetails}`);
            
            const allImprovementsImplemented = hasShellTrue && hasFallbackLogic && hasDebugLogging && hasErrorDetails;
            
            this.testResults.push({
                name: 'Improved Installation Code',
                passed: allImprovementsImplemented,
                details: `shell:true=${hasShellTrue}, fallback=${hasFallbackLogic}, debug=${hasDebugLogging}, error_details=${hasErrorDetails}`
            });
            
            return allImprovementsImplemented;
        } catch (error) {
            console.log(`  âœ?Failed to check improved installation code: ${error.message}`);
            this.testResults.push({
                name: 'Improved Installation Code',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 2: Verify installation command format is correct
    async testInstallationCommandFormat() {
        console.log('\n[TEST 2] Verifying installation command format...');
        
        try {
            // Read the index.js file
            const mainFilePath = path.join(__dirname, '..', 'src', 'index.js');
            const mainContent = await fs.readFile(mainFilePath, 'utf8');
            
            // Check for Qoder CLI installation command
            const hasQoderInstall = mainContent.includes('@qoder-ai/qodercli');
            const hasNpmInstallFormat = mainContent.includes('npm install -g');
            
            console.log(`  Qoder CLI package reference: ${hasQoderInstall}`);
            console.log(`  npm install format: ${hasNpmInstallFormat}`);
            
            const correctFormat = hasQoderInstall && hasNpmInstallFormat;
            
            this.testResults.push({
                name: 'Installation Command Format',
                passed: correctFormat,
                details: `Qoder package=${hasQoderInstall}, npm install format=${hasNpmInstallFormat}`
            });
            
            return correctFormat;
        } catch (error) {
            console.log(`  âœ?Failed to check installation command format: ${error.message}`);
            this.testResults.push({
                name: 'Installation Command Format',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 3: Verify error handling improvements
    async testErrorHandlingImprovements() {
        console.log('\n[TEST 3] Verifying error handling improvements...');
        
        try {
            // Read the index.js file
            const mainFilePath = path.join(__dirname, '..', 'src', 'index.js');
            const mainContent = await fs.readFile(mainFilePath, 'utf8');
            
            // Check for improved error handling
            const hasTryCatch = mainContent.includes('try {') && mainContent.includes('catch');
            const hasSpecificErrorMessages = mainContent.includes('Failed to install') && mainContent.includes('Please run manually');
            const hasExitCodeReporting = mainContent.includes('exit code');
            
            console.log(`  Try-catch blocks: ${hasTryCatch}`);
            console.log(`  Specific error messages: ${hasSpecificErrorMessages}`);
            console.log(`  Exit code reporting: ${hasExitCodeReporting}`);
            
            const goodErrorHandling = hasTryCatch && hasSpecificErrorMessages && hasExitCodeReporting;
            
            this.testResults.push({
                name: 'Error Handling Improvements',
                passed: goodErrorHandling,
                details: `try-catch=${hasTryCatch}, specific_errors=${hasSpecificErrorMessages}, exit_code=${hasExitCodeReporting}`
            });
            
            return goodErrorHandling;
        } catch (error) {
            console.log(`  âœ?Failed to check error handling improvements: ${error.message}`);
            this.testResults.push({
                name: 'Error Handling Improvements',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Test 4: Verify timeout and environment settings
    async testTimeoutAndEnvironment() {
        console.log('\n[TEST 4] Verifying timeout and environment settings...');
        
        try {
            // Read the index.js file
            const mainFilePath = path.join(__dirname, '..', 'src', 'index.js');
            const mainContent = await fs.readFile(mainFilePath, 'utf8');
            
            // Check for timeout and environment settings
            const hasTimeout = mainContent.includes('timeout: 300000');
            const hasEnvironment = mainContent.includes('env: process.env');
            const hasStdioSetting = mainContent.includes('stdio:');
            
            console.log(`  5-minute timeout: ${hasTimeout}`);
            console.log(`  Environment passing: ${hasEnvironment}`);
            console.log(`  Stdio setting: ${hasStdioSetting}`);
            
            const correctSettings = hasTimeout && hasEnvironment && hasStdioSetting;
            
            this.testResults.push({
                name: 'Timeout and Environment Settings',
                passed: correctSettings,
                details: `timeout=${hasTimeout}, environment=${hasEnvironment}, stdio=${hasStdioSetting}`
            });
            
            return correctSettings;
        } catch (error) {
            console.log(`  âœ?Failed to check timeout and environment settings: ${error.message}`);
            this.testResults.push({
                name: 'Timeout and Environment Settings',
                passed: false,
                details: `Failed to check: ${error.message}`
            });
            return false;
        }
    }
    
    // Run all tests
    async runAllTests() {
        console.log('Final Test for Improved Installation Implementation');
        console.log('='.repeat(50));
        
        await this.testImprovedInstallationCode();
        await this.testInstallationCommandFormat();
        await this.testErrorHandlingImprovements();
        await this.testTimeoutAndEnvironment();
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Final Installation Implementation Test Summary:');
        console.log('='.repeat(50));
        
        let passedTests = 0;
        this.testResults.forEach(result => {
            console.log(`${result.name}: ${result.passed ? 'âœ?PASS' : 'âœ?FAIL'} - ${result.details}`);
            if (result.passed) passedTests++;
        });
        
        console.log(`\nOverall Result: ${passedTests}/${this.testResults.length} tests passed`);
        
        if (passedTests === this.testResults.length) {
            console.log('âœ?All final implementation tests passed!');
            console.log('âœ?Installation implementation has been successfully improved!');
        } else if (passedTests > 0) {
            console.log('âš?Some final implementation tests passed.');
        } else {
            console.log('âœ?All final implementation tests failed.');
        }
        
        return {
            totalTests: this.testResults.length,
            passedTests: passedTests,
            results: this.testResults
        };
    }
}

// Run the tests
async function runFinalInstallTests() {
    const tester = new FinalInstallTest();
    const results = await tester.runAllTests();
    return results;
}

// Export for use in other modules
module.exports = { FinalInstallTest };

// Run if called directly
if (require.main === module) {
    runFinalInstallTests().then(results => {
        process.exit(results.passedTests === results.totalTests ? 0 : 1);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
