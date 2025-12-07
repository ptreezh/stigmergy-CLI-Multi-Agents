#!/usr/bin/env node

/**
 * TDD Test for Natural Language Integration
 * Tests the integration between natural language parsing and CLI tools
 */

const assert = require('assert');

async function testNaturalLanguageIntegration() {
    console.log('TEST: Natural Language Integration');
    console.log('----------------------------------');

    try {
        const NaturalLanguageIntegration = require('../package/src/natural-language/nl-integration.cjs');
        const integration = new NaturalLanguageIntegration();

        // Test 1: Basic natural language processing
        console.log('Test 1: Basic natural language processing');
        const result1 = await integration.processNaturalLanguageInput("请帮我把这段中文翻译成英文", "claude");

        assert(result1.success === true, 'Should successfully process translation request');
        assert(result1.skill === 'translation', 'Should detect translation skill');
        assert(result1.parameters.to === 'en', 'Should detect target language');
        console.log('✅ Basic natural language processing test passed');

        // Test 2: Multi-language support
        console.log('Test 2: Multi-language support');
        const result2 = await integration.processNaturalLanguageInput("Analyze the security of this React component", "gemini");

        assert(result2.success === true, 'Should process English input');
        assert(result2.skill === 'code-analysis', 'Should detect code analysis skill');
        assert(result2.parameters.focus === 'security', 'Should detect security focus');
        console.log('✅ Multi-language support test passed');

        // Test 3: Skill detection confidence
        console.log('Test 3: Skill detection confidence');
        const result3 = await integration.processNaturalLanguageInput("Generate Python code for user login", "qwen");

        assert(result3.confidence > 5, 'Should have high confidence for clear patterns');
        assert(result3.parameters.language === 'python', 'Should extract programming language');
        console.log('✅ Skill detection confidence test passed');

        // Test 4: Hook response creation
        console.log('Test 4: Hook response creation');
        const hookResponse = integration.createHookResponse("translate this to Spanish", "claude");

        assert(hookResponse.shouldIntercept === true, 'Should intercept skill requests');
        assert(hookResponse.skill === 'translation', 'Should identify correct skill');
        assert(hookResponse.options.includes('execute_skill'), 'Should provide execution option');
        console.log('✅ Hook response creation test passed');

        // Test 5: CLI command processing
        console.log('Test 5: CLI command processing');
        const cliResult = await integration.processCliCommand(['analyze', 'this', 'code', 'for', 'security'], 'gemini');

        assert(cliResult.success === true, 'Should process CLI command successfully');
        assert(cliResult.skill === 'code-analysis', 'Should detect skill from CLI args');
        console.log('✅ CLI command processing test passed');

        // Test 6: Help message generation
        console.log('Test 6: Help message generation');
        const helpMessage = integration.createEnhancedHelp('claude');

        assert(helpMessage.includes('Natural Language Skills'), 'Should include integration info');
        assert(helpMessage.includes('translate'), 'Should include translation examples');
        console.log('✅ Help message generation test passed');

        console.log('✅ Natural language integration test passed');
        return true;

    } catch (error) {
        console.log(`❌ Natural language integration test failed: ${error.message}`);
        return false;
    }
}

async function testEndToEndScenarios() {
    console.log('TEST: End-to-End Natural Language Scenarios');
    console.log('---------------------------------------------');

    try {
        const NaturalLanguageIntegration = require('../package/src/natural-language/nl-integration.cjs');
        const integration = new NaturalLanguageIntegration();

        const scenarios = [
            {
                name: 'Chinese to English Translation',
                input: '请帮我把这段API文档翻译成英文',
                expectedSkill: 'translation',
                expectedParams: { to: 'en', text: '这段API文档' }
            },
            {
                name: 'React Component Analysis',
                input: '分析这个React组件的性能问题',
                expectedSkill: 'code-analysis',
                expectedParams: { focus: 'performance', file: 'React组件' }
            },
            {
                name: 'Python Code Generation',
                input: '生成一个用户认证的Python函数',
                expectedSkill: 'code-generation',
                expectedParams: { requirement: '用户认证函数', language: 'python' }
            }
        ];

        let passed = 0;
        for (const scenario of scenarios) {
            console.log(`\nTesting scenario: ${scenario.name}`);
            console.log(`Input: "${scenario.input}"`);

            const result = await integration.processNaturalLanguageInput(scenario.input, 'claude');

            if (result.success &&
                result.skill === scenario.expectedSkill) {
                console.log(`✅ Passed: Detected ${result.skill} with confidence ${result.confidence}`);
                passed++;
            } else {
                console.log(`❌ Failed: Expected ${scenario.expectedSkill}, got ${result.skill || 'none'}`);
            }
        }

        console.log(`\nEnd-to-end scenarios: ${passed}/${scenarios.length} passed`);
        return passed === scenarios.length;

    } catch (error) {
        console.log(`❌ End-to-end scenarios test failed: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('==============================================');
    console.log('TDD: NATURAL LANGUAGE INTEGRATION');
    console.log('==============================================');
    console.log('');

    const results = [];

    // Test 1: Natural language integration
    results.push(await testNaturalLanguageIntegration());
    console.log('');

    // Test 2: End-to-end scenarios
    results.push(await testEndToEndScenarios());
    console.log('');

    // Summary
    const passed = results.filter(r => r === true).length;
    const total = results.length;

    console.log('==============================================');
    console.log('TDD INTEGRATION TEST SUMMARY');
    console.log('==============================================');
    console.log(`Integration tests passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('🎉 All integration tests passed!');
        console.log('✅ Natural language skills integration is ready for CLI tools!');
    } else {
        console.log('⚠️  Some integration tests failed. Review implementation.');
    }

    return passed === total;
}

// Run tests if called directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = {
    testNaturalLanguageIntegration,
    testEndToEndScenarios,
    runTests
};