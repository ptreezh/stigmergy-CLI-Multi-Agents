#!/usr/bin/env node

/**
 * Integration Test: CLI Help Analysis + Smart Routing
 * Tests the complete integration between CLI help analyzer and smart routing system
 */

const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { SmartRouter } = require('./src/main');

async function testHelpAnalysisIntegration() {
    console.log('=== Integration Test: Help Analysis + Smart Routing ===');

    const analyzer = new CLIHelpAnalyzer();
    const router = new SmartRouter();

    // Initialize systems
    console.log('1. Initializing systems...');
    await analyzer.initialize();
    console.log('   CLI Help Analyzer: READY');

    // Test help analysis integration
    console.log('\n2. Testing help analysis integration...');

    const testCLI = 'claude';
    console.log(`   Analyzing ${testCLI}...`);

    try {
        // Get comprehensive analysis from advanced analyzer
        const advancedAnalysis = await analyzer.analyzeCLI(testCLI);
        console.log(`   Advanced analysis: SUCCESS`);
        console.log(`     CLI Type: ${advancedAnalysis.cliType}`);
        console.log(`     Commands: ${advancedAnalysis.patterns.commands.length}`);
        console.log(`     Options: ${advancedAnalysis.patterns.options.length}`);
        console.log(`     Interaction Mode: ${advancedAnalysis.interactionMode}`);

        // Get basic analysis from smart router
        const basicAnalysis = await router.analyzeCLIHelp(testCLI);
        console.log(`   Basic analysis: ${basicAnalysis ? 'SUCCESS' : 'FAILED'}`);
        if (basicAnalysis) {
            console.log(`     Commands: ${basicAnalysis.commands?.length || 0}`);
            console.log(`     Options: ${basicAnalysis.options?.length || 0}`);
        }

        // Test routing decisions based on help analysis
        console.log('\n3. Testing routing with help analysis context...');

        const testInputs = [
            'help me write code',
            'translate this text',
            'generate documentation',
            'explain this function',
            'use claude to debug'
        ];

        for (const input of testInputs) {
            const route = router.smartRoute(input);
            console.log(`   Input: "${input}"`);
            console.log(`     Route: ${route.tool} -> "${route.prompt}"`);

            // Verify the tool exists in help analyzer
            const toolAnalysis = await analyzer.getCLIPattern(route.tool);
            console.log(`     Tool Analysis: ${toolAnalysis ? 'AVAILABLE' : 'NOT FOUND'}`);
            if (toolAnalysis) {
                console.log(`     Tool Mode: ${toolAnalysis.interactionMode}`);
            }
        }

    } catch (error) {
        console.error(`   Analysis failed: ${error.message}`);
    }

    // Test failure recovery integration
    console.log('\n4. Testing failure recovery integration...');

    try {
        // Simulate a failed CLI call
        const failedCLI = 'nonexistent-cli';
        const error = new Error('Command not found');
        const attemptedCommand = `${failedCLI} --help`;

        console.log(`   Simulating failure for ${failedCLI}...`);

        // Update pattern on failure
        const recoveryResult = await analyzer.updatePatternOnFailure(failedCLI, error, attemptedCommand);
        console.log(`   Failure recovery: ${recoveryResult ? 'SUCCESS' : 'HANDLED'}`);

        // Check persistent storage for failure tracking
        const config = await analyzer.loadPersistentConfig();
        const failureRecord = config.failedAttempts[failedCLI];
        if (failureRecord) {
            console.log(`   Failure recorded: YES (${failureRecord.attempts} attempts)`);
        } else {
            console.log(`   Failure recorded: NO`);
        }

    } catch (error) {
        console.log(`   Failure recovery test: ${error.message}`);
    }

    // Test persistent pattern usage
    console.log('\n5. Testing persistent pattern usage...');

    try {
        // Load all cached patterns
        const config = await analyzer.loadPersistentConfig();
        const patterns = config.cliPatterns;

        console.log(`   Cached patterns: ${Object.keys(patterns).length}`);

        // Test using cached patterns for routing
        for (const [cliName, pattern] of Object.entries(patterns)) {
            if (pattern.success) {
                // Verify routing can use this pattern
                const testRoute = router.smartRoute(`use ${cliName} to help`);
                console.log(`   ${cliName}: Routing ${testRoute.tool === cliName ? 'CORRECT' : 'MISMATCH'}`);
            }
        }

    } catch (error) {
        console.log(`   Pattern usage test: FAILED - ${error.message}`);
    }

    // Test real CLI execution with help analysis
    console.log('\n6. Testing real CLI execution with help analysis...');

    try {
        // Test with a CLI that should be available
        const testExecution = await router.executeTool('claude', ['--version']);
        if (testExecution.code === 0) {
            console.log(`   CLI execution: SUCCESS`);
            console.log(`     Output: ${testExecution.output?.trim() || '[No output]'}`);
        } else {
            console.log(`   CLI execution: FAILED (${testExecution.code})`);
            console.log(`     Error: ${testExecution.error?.trim() || '[No error info]'}`);
        }
    } catch (error) {
        console.log(`   CLI execution: ERROR - ${error.message}`);
    }

    console.log('\n=== Integration Test Complete ===');
}

// Test complete workflow
async function testCompleteWorkflow() {
    console.log('\n=== Complete Workflow Test ===');

    console.log('1. User initiates CLI analysis...');
    const analyzer = new CLIHelpAnalyzer();
    await analyzer.initialize();

    console.log('2. System scans available CLI tools...');
    const analysisResults = await analyzer.analyzeAllCLI();
    const successfulAnalysis = Object.values(analysisResults).filter(r => r.success).length;
    console.log(`   Successfully analyzed: ${successfulAnalysis} CLIs`);

    console.log('3. User requests smart routing...');
    const router = new SmartRouter();

    const userRequests = [
        'translate this document using gemini',
        'debug my code with claude',
        'generate API documentation',
        'explain this algorithm'
    ];

    console.log('4. Processing user requests with help analysis context...');
    for (const request of userRequests) {
        console.log(`\n   Request: "${request}"`);

        // Route the request
        const route = router.smartRoute(request);
        console.log(`     Routed to: ${route.tool}`);

        // Get tool analysis
        const toolAnalysis = await analyzer.getCLIPattern(route.tool);
        if (toolAnalysis) {
            console.log(`     Tool type: ${toolAnalysis.cliType}`);
            console.log(`     Interaction mode: ${toolAnalysis.interactionMode}`);
            console.log(`     Available commands: ${toolAnalysis.patterns.commands.length}`);
        }

        // Simulate execution (dry run)
        console.log(`     Execution: ${route.tool} "${route.prompt}"`);
    }

    console.log('\n=== Workflow Test Complete ===');
}

// Main test execution
async function runIntegrationTests() {
    try {
        await testHelpAnalysisIntegration();
        await testCompleteWorkflow();
        console.log('\n✅ All integration tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Integration tests failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runIntegrationTests();
}

module.exports = { testHelpAnalysisIntegration, testCompleteWorkflow };