#!/usr/bin/env node

/**
 * Test CLI Help Analyzer - Comprehensive Testing Suite
 * Tests the CLI help analyzer functionality with real CLI tools
 */

const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');

async function testCLIHelpAnalyzer() {
    console.log('=== CLI Help Analyzer Test Suite ===');

    const analyzer = new CLIHelpAnalyzer();

    // Initialize analyzer
    console.log('1. Initializing analyzer...');
    const initialized = await analyzer.initialize();
    console.log(`   Initialization: ${initialized ? 'SUCCESS' : 'FAILED'}`);

    if (!initialized) {
        console.error('Cannot proceed with tests - analyzer initialization failed');
        return;
    }

    // Test individual CLI analysis
    console.log('\n2. Testing individual CLI analysis...');

    // Test with available CLIs
    const testCLIs = ['claude', 'gemini', 'node', 'npm'];

    for (const cliName of testCLIs) {
        console.log(`\n   Testing ${cliName}:`);
        try {
            const result = await analyzer.analyzeCLI(cliName);
            console.log(`     Status: SUCCESS`);
            console.log(`     CLI Type: ${result.cliType}`);
            console.log(`     Commands found: ${result.patterns?.commands?.length || 0}`);
            console.log(`     Options found: ${result.patterns?.options?.length || 0}`);
            console.log(`     Examples found: ${result.examples?.length || 0}`);
            console.log(`     Interaction mode: ${result.interactionMode}`);
            console.log(`     Help method: ${result.helpMethod}`);
        } catch (error) {
            console.log(`     Status: FAILED - ${error.message}`);
        }
    }

    // Test pattern caching
    console.log('\n3. Testing pattern caching...');
    try {
        const cached = await analyzer.getCachedAnalysis('claude');
        if (cached) {
            console.log('   Cache retrieval: SUCCESS');
            console.log(`   Cache age: ${Math.round((Date.now() - new Date(cached.timestamp)) / 1000 / 60)} minutes`);
        } else {
            console.log('   Cache retrieval: NO CACHE FOUND');
        }
    } catch (error) {
        console.log(`   Cache retrieval: FAILED - ${error.message}`);
    }

    // Test failure recovery
    console.log('\n4. Testing failure recovery...');
    try {
        const recoveryResult = await analyzer.updatePatternOnFailure('nonexistent-cli', new Error('Command not found'), 'nonexistent-cli --help');
        console.log(`   Failure recovery: ${recoveryResult ? 'SUCCESS' : 'FAILED (expected for nonexistent CLI)'}`);
    } catch (error) {
        console.log(`   Failure recovery: FAILED - ${error.message}`);
    }

    // Test batch analysis
    console.log('\n5. Testing batch analysis...');
    try {
        const batchResults = await analyzer.analyzeAllCLI();
        console.log(`   Batch analysis: SUCCESS`);
        console.log(`   CLIs analyzed: ${Object.keys(batchResults).length}`);

        for (const [cliName, result] of Object.entries(batchResults)) {
            if (result.success) {
                console.log(`     ${cliName}: SUCCESS (${result.cliType})`);
            } else {
                console.log(`     ${cliName}: FAILED - ${result.error}`);
            }
        }
    } catch (error) {
        console.log(`   Batch analysis: FAILED - ${error.message}`);
    }

    // Test persistent storage
    console.log('\n6. Testing persistent storage...');
    try {
        const config = await analyzer.loadPersistentConfig();
        console.log(`   Storage loading: SUCCESS`);
        console.log(`   Stored patterns: ${Object.keys(config.cliPatterns).length}`);
        console.log(`   Failed attempts: ${Object.keys(config.failedAttempts).length}`);
        console.log(`   Last updated: ${config.lastUpdated}`);
    } catch (error) {
        console.log(`   Storage loading: FAILED - ${error.message}`);
    }

    console.log('\n=== Test Suite Complete ===');
}

// Test CLI Help Analyzer integration with Smart Router
async function testIntegrationWithSmartRouter() {
    console.log('\n=== Integration Test: Help Analyzer + Smart Router ===');

    try {
        // Import main module to get SmartRouter
        const main = require('./src/main');

        // Check if SmartRouter has help analysis capability
        if (main.SmartRouter && main.SmartRouter.prototype.analyzeCLIHelp) {
            console.log('1. SmartRouter help analysis integration: FOUND');

            // Test the integrated help analysis
            const router = new main.SmartRouter();
            console.log('2. Testing integrated help analysis...');

            try {
                const analysis = await router.analyzeCLIHelp('node');
                if (analysis) {
                    console.log(`   Integrated analysis: SUCCESS`);
                    console.log(`   Commands: ${analysis.commands?.length || 0}`);
                    console.log(`   Options: ${analysis.options?.length || 0}`);
                } else {
                    console.log('   Integrated analysis: NO RESULT');
                }
            } catch (error) {
                console.log(`   Integrated analysis: FAILED - ${error.message}`);
            }
        } else {
            console.log('1. SmartRouter help analysis integration: NOT FOUND');
        }

    } catch (error) {
        console.log(`Integration test: FAILED - ${error.message}`);
    }
}

// Main test execution
async function runTests() {
    try {
        await testCLIHelpAnalyzer();
        await testIntegrationWithSmartRouter();
        console.log('\nAll tests completed!');
    } catch (error) {
        console.error('Test suite failed:', error);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = { testCLIHelpAnalyzer, testIntegrationWithSmartRouter };