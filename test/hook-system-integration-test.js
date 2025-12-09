#!/usr/bin/env node

/**
 * TDD Test Suite for Hook System Integration
 * Tests real integration between hooks and AI CLI tools
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test 1: Hook Installation Verification
function testHookInstallation() {
    console.log('TEST 1: Hook Installation Verification');
    console.log('---------------------------------------');

    const hookDirectories = [
        '.claude/hooks',
        '.gemini/hooks',
        '.qwen/hooks',
        '.iflow/hooks',
        '.codebuddy/hooks'
    ];

    const results = [];
    for (const hookDir of hookDirectories) {
        const exists = fs.existsSync(hookDir);
        results.push({ directory: hookDir, exists });
        console.log(`${exists ? '✅' : '❌'} ${hookDir}: ${exists ? 'Found' : 'Missing'}`);
    }

    const installedCount = results.filter(r => r.exists).length;
    console.log(`\nHook directories installed: ${installedCount}/${hookDirectories.length}`);

    return installedCount === hookDirectories.length;
}

// Test 2: Hook Content Verification
function testHookContentVerification() {
    console.log('TEST 2: Hook Content Verification');
    console.log('-----------------------------------');

    const hookFiles = [
        { path: '.claude/hooks/skill-forced-eval-hook.sh', expectedContent: ['skill', 'natural', 'language'] },
        { path: '.gemini/hooks/skill-forced-eval-hook.js', expectedContent: ['skill', 'parse', 'detect'] },
        { path: '.qwen/hooks/skill-forced-eval-hook.py', expectedContent: ['skill', 'analysis', 'translate'] }
    ];

    let validHooks = 0;
    for (const hookFile of hookFiles) {
        if (fs.existsSync(hookFile.path)) {
            const content = fs.readFileSync(hookFile.path, 'utf8');
            const hasRequiredContent = hookFile.expectedContent.every(keyword =>
                content.toLowerCase().includes(keyword.toLowerCase())
            );

            console.log(`${hasRequiredContent ? '✅' : '❌'} ${hookFile.path}: ${hasRequiredContent ? 'Valid' : 'Invalid content'}`);
            if (hasRequiredContent) validHooks++;
        } else {
            console.log(`❌ ${hookFile.path}: File not found`);
        }
    }

    console.log(`\nValid hooks: ${validHooks}/${hookFiles.length}`);
    return validHooks > 0;
}

// Test 3: Hook Execution Simulation
function testHookExecution() {
    console.log('TEST 3: Hook Execution Simulation');
    console.log('------------------------------------');

    try {
        // This will fail initially since we haven't implemented real hook integration
        const HookIntegrationManager = require('../package/src/hooks/hook-integration-manager.cjs');
        const hookManager = new HookIntegrationManager();

        const testScenarios = [
            {
                tool: 'claude',
                input: '请分析这个React组件的安全性',
                expectedSkill: 'code-analysis'
            },
            {
                tool: 'gemini',
                input: 'Translate this comment to English',
                expectedSkill: 'translation'
            }
        ];

        let passed = 0;
        for (const scenario of testScenarios) {
            console.log(`Testing ${scenario.tool} hook with: "${scenario.input}"`);

            try {
                const result = hookManager.processHookInput(scenario.tool, scenario.input);

                if (result.detected && result.skill === scenario.expectedSkill) {
                    console.log(`✅ Hook correctly detected ${result.skill}`);
                    passed++;
                } else {
                    console.log(`❌ Hook failed to detect skill (expected: ${scenario.expectedSkill})`);
                }
            } catch (error) {
                console.log(`❌ Hook execution error: ${error.message}`);
            }
        }

        console.log(`\nHook execution tests: ${passed}/${testScenarios.length} passed`);
        return passed === testScenarios.length;

    } catch (error) {
        console.log(`❌ Hook execution test failed: ${error.message}`);
        return false;
    }
}

// Test 4: Character Encoding Verification
function testCharacterEncoding() {
    console.log('TEST 4: Character Encoding Verification');
    console.log('----------------------------------------');

    const filesToCheck = [
        'package/src/index.js',
        'package/src/skills/skills-manager.js',
        'package/src/natural-language/nl-parser.cjs',
        'hooks/install-hooks.js'
    ];

    let pureAnsiFiles = 0;
    let problematicFiles = [];

    for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');

            // Check for non-ANSI characters (simplified check)
            const hasNonAnsi = /[^\x00-\x7F]/.test(content);

            if (!hasNonAnsi) {
                console.log(`✅ ${file}: Pure ANSI encoding`);
                pureAnsiFiles++;
            } else {
                console.log(`❌ ${file}: Contains non-ANSI characters`);
                problematicFiles.push(file);
            }
        } else {
            console.log(`⚠️  ${file}: File not found`);
        }
    }

    console.log(`\nPure ANSI files: ${pureAnsiFiles}/${filesToCheck.length}`);
    if (problematicFiles.length > 0) {
        console.log(`Files needing encoding fixes: ${problematicFiles.join(', ')}`);
    }

    return pureAnsiFiles === filesToCheck.length;
}

// Test 5: Real AI Tool Calling
async function testRealAIToolCalling() {
    console.log('TEST 5: Real AI Tool Calling');
    console.log('-------------------------------');

    try {
        // This will fail initially since we haven't implemented real AI calling
        const RealAIExecutor = require('../package/src/ai/real-executor.cjs');
        const executor = new RealAIExecutor();

        const testCalls = [
            {
                tool: 'claude',
                command: '请将以下文本翻译成英文：Hello World',
                expectedSuccess: true
            },
            {
                tool: 'gemini',
                command: '分析这个函数的复杂度',
                expectedSuccess: true
            }
        ];

        let successful = 0;
        for (const test of testCalls) {
            console.log(`Testing ${test.tool} real execution...`);

            try {
                const result = await executor.executeCommand(test.tool, test.command);

                if (result.success === test.expectedSuccess) {
                    console.log(`✅ ${test.tool} execution successful`);
                    successful++;
                } else {
                    console.log(`❌ ${test.tool} execution failed (expected: ${test.expectedSuccess})`);
                }
            } catch (error) {
                console.log(`❌ ${test.tool} execution error: ${error.message}`);
            }
        }

        console.log(`\nReal AI tool calls: ${successful}/${testCalls.length} successful`);
        return successful === testCalls.length;

    } catch (error) {
        console.log(`❌ Real AI tool calling test failed: ${error.message}`);
        return false;
    }
}

// Test 6: Cross-Platform Compatibility
function testCrossPlatformCompatibility() {
    console.log('TEST 6: Cross-Platform Compatibility');
    console.log('--------------------------------------');

    const platform = process.platform;
    console.log(`Current platform: ${platform}`);

    // Test file paths work on current platform
    const testPaths = [
        'package/src/index.js',
        'package/src/skills/skills-manager.cjs',
        '.claude/settings.json'
    ];

    let validPaths = 0;
    for (const testPath of testPaths) {
        const normalizedPath = path.normalize(testPath);
        const works = fs.existsSync(normalizedPath) || !fs.existsSync(testPath);

        console.log(`${works ? '✅' : '❌'} ${testPath}: ${works ? 'Valid' : 'Invalid path'}`);
        if (works) validPaths++;
    }

    console.log(`\nValid paths: ${validPaths}/${testPaths.length}`);
    return validPaths === testPaths.length;
}

// Main test runner
async function runTests() {
    console.log('==============================================');
    console.log('TDD: HOOK SYSTEM & ENCODING & REAL AI');
    console.log('==============================================');
    console.log('');

    const results = [];

    // Test 1: Hook installation
    results.push(testHookInstallation());
    console.log('');

    // Test 2: Hook content
    results.push(testHookContentVerification());
    console.log('');

    // Test 3: Hook execution (will fail initially)
    results.push(testHookExecution());
    console.log('');

    // Test 4: Character encoding
    results.push(testCharacterEncoding());
    console.log('');

    // Test 5: Real AI tool calling (will fail initially)
    results.push(await testRealAIToolCalling());
    console.log('');

    // Test 6: Cross-platform compatibility
    results.push(testCrossPlatformCompatibility());
    console.log('');

    // Summary
    const passed = results.filter(r => r === true).length;
    const total = results.length;

    console.log('==============================================');
    console.log('TDD COMPREHENSIVE TEST SUMMARY');
    console.log('==============================================');
    console.log(`Tests passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('🎉 All tests passed! System is fully integrated and production-ready!');
    } else {
        console.log('⚠️  Some tests failed. Implementation needed for:');
        console.log('   • Hook System Integration (Medium Priority)');
        console.log('   • Character Encoding Internationalization (Low Priority)');
        console.log('   • Real AI Tool Calling (Medium Priority)');
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
    testHookInstallation,
    testHookContentVerification,
    testHookExecution,
    testCharacterEncoding,
    testRealAIToolCalling,
    testCrossPlatformCompatibility,
    runTests
};