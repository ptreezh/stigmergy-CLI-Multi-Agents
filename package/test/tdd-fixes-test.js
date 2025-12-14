#!/usr/bin/env node

/**
 * TDD Test Suite for Critical Issues
 * Tests that will initially fail, then drive fixes
 */

const assert = require('assert');
const path = require('path');

// Test 1: Tool Selection Logic
function testToolSelection() {
    console.log('TEST 1: Tool Selection Logic');
    console.log('-------------------------------');

    // This test will fail initially because tool selection is broken
    const testCases = [
        {
            args: ['skills', 'execute', 'translation', '--text=hello', '--to=zh', '--tool=claude'],
            expectedTool: 'claude',
            description: 'Should parse --tool=claude parameter'
        },
        {
            args: ['skills', 'execute', 'code-analysis', '--file=app.js', '--tool=gemini'],
            expectedTool: 'gemini',
            description: 'Should parse --tool=gemini parameter'
        }
    ];

    return testCases;
}

// Test 2: Module Import
function testModuleImport() {
    console.log('TEST 2: Module Import');
    console.log('------------------------');

    try {
        // Use CommonJS version to fix ES6 module issues
        const SkillsManager = require('../package/src/skills/skills-manager.cjs');
        const manager = new SkillsManager();

        assert(typeof manager.init === 'function', 'Manager should have init method');
        assert(typeof manager.listSkills === 'function', 'Manager should have listSkills method');
        assert(typeof manager.executeSkill === 'function', 'Manager should have executeSkill method');
        assert(typeof manager.buildCommand === 'function', 'Manager should have buildCommand method');

        console.log('‚ú?Module import test passed');
        return true;
    } catch (error) {
        console.log(`‚ù?Module import test failed: ${error.message}`);
        return false;
    }
}

// Test 3: Skills Registry Loading
function testSkillsRegistryLoading() {
    console.log('TEST 3: Skills Registry Loading');
    console.log('---------------------------------');

    try {
        const fs = require('fs');
        const registryPath = path.join(__dirname, '../package/src/skills/skills/skills-registry.json');

        if (!fs.existsSync(registryPath)) {
            throw new Error(`Skills registry not found at ${registryPath}`);
        }

        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

        // Validate registry structure
        assert(typeof registry === 'object', 'Registry should be an object');
        assert(Object.keys(registry).length > 0, 'Registry should contain skills');

        // Validate each skill structure
        for (const [skillId, skill] of Object.entries(registry)) {
            assert(skill.name, `Skill ${skillId} should have a name`);
            assert(skill.description, `Skill ${skillId} should have a description`);
            assert(skill.category, `Skill ${skillId} should have a category`);
            assert(Array.isArray(skill.tools), `Skill ${skillId} should have tools array`);
            assert(skill.template, `Skill ${skillId} should have a template`);
        }

        console.log(`‚ú?Skills registry test passed - ${Object.keys(registry).length} skills loaded`);
        return true;
    } catch (error) {
        console.log(`‚ù?Skills registry test failed: ${error.message}`);
        return false;
    }
}

// Test 4: Skills Execution
async function testSkillsExecution() {
    console.log('TEST 4: Skills Execution');
    console.log('-------------------------');

    try {
        const SkillsManager = require('../package/src/skills/skills-manager.cjs');
        const manager = new SkillsManager();

        // Initialize manager
        await manager.init();

        // Test skill execution
        const result = await manager.executeSkill('translation', {
            text: 'hello world',
            to: 'zh'
        }, 'claude');

        assert(result.skillId === 'translation', 'Should execute translation skill');
        assert(result.tool === 'claude', 'Should use specified tool');
        assert(result.command.includes('claude'), 'Command should include tool name');
        assert(result.result.success, 'Execution should succeed');

        console.log('‚ú?Skills execution test passed');
        return true;
    } catch (error) {
        console.log(`‚ù?Skills execution test failed: ${error.message}`);
        return false;
    }
}

// Test 5: Parameter Parsing
function testParameterParsing() {
    console.log('TEST 5: Parameter Parsing');
    console.log('---------------------------');

    const testCases = [
        {
            args: ['--text=hello', '--to=zh', '--tool=claude'],
            expected: {
                text: 'hello',
                to: 'zh',
                tool: 'claude'
            },
            description: 'Should parse key=value parameters'
        },
        {
            args: ['--file', 'app.js', '--line', '10'],
            expected: {
                file: 'app.js',
                line: '10'
            },
            description: 'Should handle space-separated parameters'
        }
    ];

    return testCases;
}

// Main test runner
async function runTests() {
    console.log('==============================================');
    console.log('TDD DRIVEN DEVELOPMENT - CRITICAL ISSUES');
    console.log('==============================================');
    console.log('');

    const results = [];

    // Test 1: Tool selection (will be implemented in main.js)
    console.log('Test 1: Tool Selection Logic');
    console.log('‚ö†Ô∏è  TODO: This test drives handleSkillsCommand fixes');
    console.log('');

    // Test 2: Module import
    results.push(testModuleImport());
    console.log('');

    // Test 3: Skills registry
    results.push(testSkillsRegistryLoading());
    console.log('');

    // Test 4: Skills execution
    results.push(await testSkillsExecution());
    console.log('');

    // Test 5: Parameter parsing
    console.log('Test 5: Parameter Parsing');
    console.log('‚ö†Ô∏è  TODO: This test drives parameter parsing fixes');
    console.log('');

    // Summary
    const passed = results.filter(r => r === true).length;
    const total = results.length;

    console.log('==============================================');
    console.log('TDD TEST SUMMARY');
    console.log('==============================================');
    console.log(`Tests passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('üéâ All tests passed! Critical issues are fixed.');
    } else {
        console.log('‚ö†Ô∏è  Some tests failed. Time to implement fixes!');
    }

    return passed === total;
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testToolSelection,
    testModuleImport,
    testSkillsRegistryLoading,
    testParameterParsing,
    runTests
};
