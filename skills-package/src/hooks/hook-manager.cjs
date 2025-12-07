#!/usr/bin/env node

/**
 * Hook Manager - TDD Implementation
 * Phase 2: Hook System - GREEN Phase (Minimal implementation to pass tests)
 */

class HookManager {
    constructor() {
        this.hooks = new Map();
        this.config = {};
    }

    registerHook(cliType, hookPath) {
        try {
            // For TDD, resolve path from current file
            const path = require('path');
            const fs = require('fs');

            const fullPath = path.resolve(__dirname, '..', '..', hookPath);

            if (!fs.existsSync(fullPath)) {
                throw new Error(`Hook file not found: ${fullPath}`);
            }

            const HookClass = require(fullPath);
            const hookInstance = new HookClass();

            this.hooks.set(cliType, {
                instance: hookInstance,
                path: fullPath,
                registered: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error(`Failed to register hook for ${cliType}:`, error.message);
            return false;
        }
    }

    getAllHooks() {
        return Array.from(this.hooks.entries()).map(([cliType, hookData]) => ({
            cliType,
            instance: hookData.instance,
            path: hookData.path,
            registered: hookData.registered
        }));
    }

    hasHook(cliType) {
        return this.hooks.has(cliType);
    }

    getHook(cliType) {
        const hookData = this.hooks.get(cliType);
        return hookData ? hookData.instance : null;
    }

    routeCommand(input, context = {}) {
        const cliType = context.cliType || this.detectCLIType(context);

        if (!cliType || !this.hasHook(cliType)) {
            return {
                success: false,
                error: `No hook available for CLI type: ${cliType}`,
                processed: false
            };
        }

        const hook = this.getHook(cliType);
        const result = hook.processCommand(input, context);

        return {
            success: result.success,
            cliType: cliType,
            processed: true,
            skillDetected: result.skillDetected || false,
            skill: result.skill || null,
            result: result
        };
    }

    detectCLIType(context) {
        // Basic CLI type detection based on context
        if (context.cwd) {
            const cwd = context.cwd.toLowerCase();
            if (cwd.includes('claude') || context.command?.includes('claude')) {
                return 'claude';
            }
            if (cwd.includes('gemini') || context.command?.includes('gemini')) {
                return 'gemini';
            }
            if (cwd.includes('qwen') || context.command?.includes('qwen')) {
                return 'qwen';
            }
        }

        // Default to claude if no specific CLI detected
        return 'claude';
    }

    unregisterHook(cliType) {
        return this.hooks.delete(cliType);
    }

    clearAllHooks() {
        this.hooks.clear();
        return true;
    }
}

module.exports = HookManager;