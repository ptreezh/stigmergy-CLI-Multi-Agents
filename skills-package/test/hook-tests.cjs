#!/usr/bin/env node

/**
 * Hook System Test Suite - TDD Implementation
 * Phase 2: Hook Base Class and CLI-Specific Hooks
 */

const fs = require('fs');
const path = require('path');

// Import SimpleTestRunner from existing test infrastructure
const { SimpleTestRunner } = require('./run-tests.cjs');

// Test Suite for Hook System
const hookTestRunner = new SimpleTestRunner();

// Test Hook Base Class
hookTestRunner.test('should initialize hook with CLI context', () => {
    // This test will fail until we implement BaseHook class
    try {
        const BaseHook = require('../src/hooks/base-hook.cjs');
        const hook = new BaseHook('claude', { name: 'claude', version: '1.0.0' });

        hookTestRunner.assertEqual(hook.cliType, 'claude');
        hookTestRunner.assertEqual(hook.config.name, 'claude');
        hookTestRunner.assertEqual(hook.config.version, '1.0.0');
        hookTestRunner.assert(hook.initialized);
    } catch (error) {
        hookTestRunner.assert(false, `BaseHook implementation missing: ${error.message}`);
    }
});

hookTestRunner.test('should parse skill commands correctly', () => {
    try {
        const BaseHook = require('../src/hooks/base-hook.cjs');
        const hook = new BaseHook('claude');

        const result = hook.parseCommand('/skill translate this text');

        hookTestRunner.assertEqual(result.isSkillCommand, true);
        hookTestRunner.assertEqual(result.skillType, 'skill');
        hookTestRunner.assertEqual(result.action, 'translate');
        hookTestRunner.assertEqual(result.parameters.join(' '), 'this text');
    } catch (error) {
        hookTestRunner.assert(false, `Command parsing not implemented: ${error.message}`);
    }
});

hookTestRunner.test('should validate skill parameters', () => {
    try {
        const BaseHook = require('../src/hooks/base-hook.cjs');
        const hook = new BaseHook('claude');

        const validParams = ['translate', 'this', 'text'];
        const isValid = hook.validateParameters('skill', validParams);

        hookTestRunner.assert(isValid);
    } catch (error) {
        hookTestRunner.assert(false, `Parameter validation not implemented: ${error.message}`);
    }
});

hookTestRunner.test('should handle errors gracefully', () => {
    try {
        const BaseHook = require('../src/hooks/base-hook.cjs');
        const hook = new BaseHook('claude');

        const result = hook.handleError(new Error('Test error'));

        hookTestRunner.assertEqual(result.success, false);
        hookTestRunner.assertEqual(result.error.message, 'Test error');
        hookTestRunner.assertNotEqual(result.timestamp, null);
    } catch (error) {
        hookTestRunner.assert(false, `Error handling not implemented: ${error.message}`);
    }
});

// Test Claude-Specific Hook
hookTestRunner.test('should process skill commands in Claude context', () => {
    try {
        const ClaudeHook = require('../src/hooks/claude-hook.cjs');
        const claudeHook = new ClaudeHook();

        const result = claudeHook.processCommand('/skill analyze security');

        hookTestRunner.assertEqual(result.cliType, 'claude');
        hookTestRunner.assert(result.skillDetected);
        hookTestRunner.assertEqual(result.skill, 'code-analysis');
    } catch (error) {
        hookTestRunner.assert(false, `Claude Hook implementation missing: ${error.message}`);
    }
});

hookTestRunner.test('should integrate with Claude CLI', () => {
    try {
        const ClaudeHook = require('../src/hooks/claude-hook.cjs');
        const claudeHook = new ClaudeHook();

        const claudeAvailable = claudeHook.isCLIAvailable();

        hookTestRunner.assert(typeof claudeAvailable === 'boolean');
    } catch (error) {
        hookTestRunner.assert(false, `Claude CLI integration not implemented: ${error.message}`);
    }
});

// Test Gemini-Specific Hook
hookTestRunner.test('should process skill commands in Gemini context', () => {
    try {
        const GeminiHook = require('../src/hooks/gemini-hook.cjs');
        const geminiHook = new GeminiHook();

        const result = geminiHook.processCommand('/skill generate function');

        hookTestRunner.assertEqual(result.cliType, 'gemini');
        hookTestRunner.assert(result.skillDetected);
        hookTestRunner.assertEqual(result.skill, 'code-generation');
    } catch (error) {
        hookTestRunner.assert(false, `Gemini Hook implementation missing: ${error.message}`);
    }
});

// Test Hook Manager
hookTestRunner.test('should manage multiple hooks', () => {
    try {
        const HookManager = require('../src/hooks/hook-manager.cjs');
        const manager = new HookManager();

        // Use absolute paths for TDD
        const path = require('path');
        const claudePath = path.join(__dirname, '..', 'src', 'hooks', 'claude-hook.cjs');
        const geminiPath = path.join(__dirname, '..', 'src', 'hooks', 'gemini-hook.cjs');

        const claudeRegistered = manager.registerHook('claude', claudePath);
        const geminiRegistered = manager.registerHook('gemini', geminiPath);

        hookTestRunner.assert(claudeRegistered);
        hookTestRunner.assert(geminiRegistered);

        const hooks = manager.getAllHooks();
        hookTestRunner.assertEqual(hooks.length, 2);
        hookTestRunner.assert(manager.hasHook('claude'));
        hookTestRunner.assert(manager.hasHook('gemini'));
    } catch (error) {
        hookTestRunner.assert(false, `Hook Manager implementation missing: ${error.message}`);
    }
});

hookTestRunner.test('should route commands to appropriate hooks', () => {
    try {
        const HookManager = require('../src/hooks/hook-manager.cjs');
        const manager = new HookManager();

        // First register a hook
        const path = require('path');
        const claudePath = path.join(__dirname, '..', 'src', 'hooks', 'claude-hook.cjs');
        manager.registerHook('claude', claudePath);

        // Mock routing logic
        const result = manager.routeCommand('/skill translate this', { cliType: 'claude' });

        hookTestRunner.assertEqual(result.cliType, 'claude');
        hookTestRunner.assert(result.processed);
    } catch (error) {
        hookTestRunner.assert(false, `Command routing not implemented: ${error.message}`);
    }
});

// Test Hook Configuration
hookTestRunner.test('should load hook configuration', () => {
    try {
        const HookConfig = require('../src/hooks/hook-config.cjs');
        const config = new HookConfig();

        const claudeConfig = config.getConfig('claude');

        hookTestRunner.assertNotEqual(claudeConfig, null);
        hookTestRunner.assertEqual(claudeConfig.enabled, true);
        hookTestRunner.assert(Array.isArray(claudeConfig.skills));
    } catch (error) {
        hookTestRunner.assert(false, `Hook Configuration not implemented: ${error.message}`);
    }
});

hookTestRunner.test('should save hook configuration', () => {
    try {
        const HookConfig = require('../src/hooks/hook-config.cjs');
        const config = new HookConfig();

        const testConfig = { enabled: true, skills: ['translation'], priority: 'high' };
        const saved = config.setConfig('test-cli', testConfig);

        hookTestRunner.assert(saved);

        const retrieved = config.getConfig('test-cli');
        hookTestRunner.assertEqual(retrieved.enabled, true);
        hookTestRunner.assertEqual(retrieved.priority, 'high');
    } catch (error) {
        hookTestRunner.assert(false, `Configuration saving not implemented: ${error.message}`);
    }
});

// Run all hook system tests
if (require.main === module) {
    console.log('🔧 Running TDD Tests for Hook System...\n');
    hookTestRunner.run().catch(console.error);
}