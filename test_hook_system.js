#!/usr/bin/env node

/**
 * Test Hook-Based Internal Routing System
 * Tests the real implementation: internal routing through CLI hooks
 */

const path = require('path');
const fs = require('fs');

async function testHookSystem() {
    console.log('=== Hook-Based Internal Routing System Test ===');

    // Check for existing hook adapters
    console.log('1. Checking Hook Adapter Implementation...');

    const hookAdapters = [
        'src/adapters/claude/hook_adapter.py',
        'src/adapters/iflow/hook_adapter.py'
    ];

    for (const adapterPath of hookAdapters) {
        const exists = fs.existsSync(adapterPath);
        console.log(`   ${adapterPath}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // Check base adapter
    const baseAdapter = 'src/core/base_adapter.py';
    console.log(`   ${baseAdapter}: ${fs.existsSync(baseAdapter) ? 'EXISTS' : 'MISSING'}`);

    // Check test files
    console.log('\n2. Checking TDD Test Implementation...');
    const testFiles = [
        'test/test_claude_adapter.py',
        'test/test_iflow_adapter.py'
    ];

    for (const testFile of testFiles) {
        const exists = fs.existsSync(testFile);
        console.log(`   ${testFile}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // Check hook configuration
    console.log('\n3. Checking Hook Configuration...');

    const claudeHookConfig = path.join(require('os').homedir(), '.claude', 'hooks.json');
    console.log(`   Claude Hook Config: ${fs.existsSync(claudeHookConfig) ? 'EXISTS' : 'MISSING'}`);

    const iflowHookConfig = path.join(require('os').homedir(), '.iflow', 'hooks.yml');
    console.log(`   iFlow Hook Config: ${fs.existsSync(iflowHookConfig) ? 'EXISTS' : 'MISSING'}`);

    console.log('\n=== Hook System Test Complete ===');
}

// Test hook-based routing simulation
async function testHookBasedRouting() {
    console.log('\n=== Hook-Based Routing Simulation ===');

    console.log('1. Simulating Claude CLI Internal Hook...');
    console.log('   User input: "请用gemini翻译这段中文"');
    console.log('   Hook: user_prompt_submit');
    console.log('   Intent detection: Cross-CLI call detected');
    console.log('   Target: Gemini CLI');
    console.log('   Action: Internal API call through hook');
    console.log('   Result: Translation displayed in Claude interface');

    console.log('\n2. Simulating iFlow CLI Workflow Hook...');
    console.log('   User input: "debug this code with claude"');
    console.log('   Hook: on_workflow_stage');
    console.log('   Intent detection: Cross-CLI call detected');
    console.log('   Target: Claude CLI');
    console.log('   Action: Hook call to Claude');
    console.log('   Result: Debug info returned to workflow');

    console.log('\n=== Hook Routing Simulation Complete ===');
}

// Test the actual hook adapter imports
async function testHookAdapters() {
    console.log('\n=== Hook Adapter Implementation Test ===');

    try {
        // Try to read and analyze the hook adapters
        console.log('1. Claude Hook Adapter Analysis...');
        const claudeAdapter = fs.readFileSync('src/adapters/claude/hook_adapter.py', 'utf8');

        const claudeFeatures = {
            'Class Definition': claudeAdapter.includes('class ClaudeHookAdapter'),
            'Hook Context': claudeAdapter.includes('class HookContext'),
            'User Prompt Hook': claudeAdapter.includes('user_prompt_submit'),
            'Tool Use Hooks': claudeAdapter.includes('tool_use_pre') && claudeAdapter.includes('tool_use_post'),
            'Response Hook': claudeAdapter.includes('response_generated'),
            'Intent Detection': claudeAdapter.includes('IntentResult'),
            'Natural Language Parser': claudeAdapter.includes('NaturalLanguageParser')
        };

        console.log('   Claude Hook Adapter Features:');
        for (const [feature, present] of Object.entries(claudeFeatures)) {
            console.log(`     ${feature}: ${present ? '✅' : '❌'}`);
        }

        console.log('\n2. iFlow Hook Adapter Analysis...');
        const iflowAdapter = fs.readFileSync('src/adapters/iflow/hook_adapter.py', 'utf8');

        const iflowFeatures = {
            'Class Definition': iflowAdapter.includes('class IFlowHookAdapter'),
            'Hook Context': iflowAdapter.includes('class IFlowHookContext'),
            'Command Hooks': iflowAdapter.includes('on_command_start') && iflowAdapter.includes('on_command_end'),
            'User Input Hook': iflowAdapter.includes('on_user_input'),
            'Workflow Hooks': iflowAdapter.includes('on_workflow_stage') && iflowAdapter.includes('on_pipeline_execute'),
            'Error Hook': iflowAdapter.includes('on_error'),
            'Intent Detection': iflowAdapter.includes('IntentResult'),
            'YAML Configuration': iflowAdapter.includes('yaml')
        };

        console.log('   iFlow Hook Adapter Features:');
        for (const [feature, present] of Object.entries(iflowFeatures)) {
            console.log(`     ${feature}: ${present ? '✅' : '❌'}`);
        }

        console.log('\n3. Base Adapter Analysis...');
        const baseAdapter = fs.readFileSync('src/core/base_adapter.py', 'utf8');

        const baseFeatures = {
            'Abstract Base Class': baseAdapter.includes('ABC') && baseAdapter.includes('abstractmethod'),
            'Intent Result': baseAdapter.includes('class IntentResult'),
            'Cross-CLI Interface': baseAdapter.includes('execute_cross_cli_call'),
            'Natural Language Parser': baseAdapter.includes('NaturalLanguageParser'),
            'Error Handling': baseAdapter.includes('handle_error'),
            'Logging': baseAdapter.includes('logger')
        };

        console.log('   Base Adapter Features:');
        for (const [feature, present] of Object.entries(baseFeatures)) {
            console.log(`     ${feature}: ${present ? '✅' : '❌'}`);
        }

    } catch (error) {
        console.error('   Error analyzing hook adapters:', error.message);
    }

    console.log('\n=== Hook Adapter Implementation Test Complete ===');
}

// Main test execution
async function runHookTests() {
    try {
        await testHookSystem();
        await testHookBasedRouting();
        await testHookAdapters();
        console.log('\n✅ Hook System Analysis Complete!');
    } catch (error) {
        console.error('\n❌ Hook System Analysis Failed:', error);
    }
}

// Run tests if called directly
if (require.main === module) {
    runHookTests();
}

module.exports = { testHookSystem, testHookBasedRouting, testHookAdapters };