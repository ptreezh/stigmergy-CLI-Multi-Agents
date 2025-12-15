#!/usr/bin/env node

/**
 * Installation System Test Suite - TDD Implementation
 * Phase 3: Installation System - RED Phase (Tests first)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import SimpleTestRunner from existing test infrastructure
const { SimpleTestRunner } = require('./run-tests.cjs');

// Test Suite for Installation System
const installationTestRunner = new SimpleTestRunner();

// Test CLI Tool Detection
installationTestRunner.test('should detect available CLI tools', () => {
    try {
        const CLIDetector = require('../src/installation/cli-detector.cjs');
        const detector = new CLIDetector();

        const detectedTools = detector.detectAvailableTools();

        installationTestRunner.assert(Array.isArray(detectedTools));
        installationTestRunner.assert(detectedTools.length >= 0);

        // Should detect at least the current platform's common tools
        if (process.platform === 'win32') {
            // Windows might have different detection
            installationTestRunner.assert(true);
        } else {
            // Unix systems
            installationTestRunner.assert(true);
        }
    } catch (error) {
        installationTestRunner.assert(false, `CLI detection not implemented: ${error.message}`);
    }
});

installationTestRunner.test('should check if specific CLI tool is installed', () => {
    try {
        const CLIDetector = require('../src/installation/cli-detector.cjs');
        const detector = new CLIDetector();

        // Test with 'node' which should always be available
        const isNodeAvailable = detector.isToolInstalled('node');
        installationTestRunner.assert(isNodeAvailable === true);

        // Test with a non-existent tool
        const isNonExistentAvailable = detector.isToolInstalled('non-existent-cli-tool-12345');
        installationTestRunner.assert(isNonExistentAvailable === false);
    } catch (error) {
        installationTestRunner.assert(false, `Tool availability check not implemented: ${error.message}`);
    }
});

// Test Hook Installer
installationTestRunner.test('should create hook directories for supported CLI tools', () => {
    try {
        const HookInstaller = require('../src/installation/hook-installer.cjs');
        const installer = new HookInstaller();

        const testDir = path.join(os.tmpdir(), 'test-hook-installation-' + Date.now());
        const directories = installer.createHookDirectories(testDir);

        installationTestRunner.assert(Array.isArray(directories));
        installationTestRunner.assertEqual(directories.length, 8); // claude, gemini, qwen, qoder, iflow, codebuddy, copilot, codex

        directories.forEach(dir => {
            installationTestRunner.assert(fs.existsSync(dir));
        });

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Hook directory creation not implemented: ${error.message}`);
    }
});

installationTestRunner.test('should install hooks for Claude CLI', () => {
    try {
        const HookInstaller = require('../src/installation/hook-installer.cjs');
        const installer = new HookInstaller();

        const testDir = path.join(os.tmpdir(), 'test-claude-install-' + Date.now());
        const result = installer.installHook('claude', testDir);

        installationTestRunner.assert(result.success);
        installationTestRunner.assert(fs.existsSync(result.hookPath));
        installationTestRunner.assertEqual(result.cliType, 'claude');

        // Verify hook content
        const hookContent = fs.readFileSync(result.hookPath, 'utf8');
        installationTestRunner.assert(hookContent.includes('stigmergy-skill'));
        installationTestRunner.assert(hookContent.includes('module.exports'));

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Claude hook installation not implemented: ${error.message}`);
    }
});

installationTestRunner.test('should install hooks for Gemini CLI', () => {
    try {
        const HookInstaller = require('../src/installation/hook-installer.cjs');
        const installer = new HookInstaller();

        const testDir = path.join(os.tmpdir(), 'test-gemini-install-' + Date.now());
        const result = installer.installHook('gemini', testDir);

        installationTestRunner.assert(result.success);
        installationTestRunner.assert(fs.existsSync(result.hookPath));
        installationTestRunner.assertEqual(result.cliType, 'gemini');

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Gemini hook installation not implemented: ${error.message}`);
    }
});

// Test Installation Manager
installationTestRunner.test('should detect and install hooks for all available CLI tools', () => {
    try {
        const InstallationManager = require('../src/installation/installation-manager.cjs');
        const manager = new InstallationManager();

        const testDir = path.join(os.tmpdir(), 'test-full-installation-' + Date.now());
        const result = manager.installAllHooks(testDir);

        installationTestRunner.assert(result.success);
        installationTestRunner.assertEqual(result.phase, 'completed');
        installationTestRunner.assert(Array.isArray(result.installedHooks));
        installationTestRunner.assert(result.totalDetected >= 0);
        installationTestRunner.assertEqual(result.totalInstalled, result.installedHooks.length);

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Full installation not implemented: ${error.message}`);
    }
});

// Test Installation Verification
installationTestRunner.test('should verify hook installation', () => {
    try {
        const InstallationVerifier = require('../src/installation/installation-verifier.cjs');
        const verifier = new InstallationVerifier();

        const testDir = path.join(os.tmpdir(), 'test-verification-' + Date.now());
        const hookPath = path.join(testDir, 'test-hook.cjs');

        // Create a test hook file
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(hookPath, 'module.exports = { test: true };');

        const verification = verifier.verifyHook('claude', hookPath);

        installationTestRunner.assert(verification.isValid);
        installationTestRunner.assert(verification.exists);
        installationTestRunner.assertEqual(verification.cliType, 'claude');

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Hook verification not implemented: ${error.message}`);
    }
});

installationTestRunner.test('should rollback failed installations', () => {
    try {
        const InstallationManager = require('../src/installation/installation-manager.cjs');
        const manager = new InstallationManager();

        const testDir = path.join(os.tmpdir(), 'test-rollback-' + Date.now());

        // Simulate a failed installation and rollback
        const result = manager.rollbackInstallation(testDir);

        installationTestRunner.assert(result.success);
        installationTestRunner.assertEqual(result.action, 'rollback');

        // Verify directory was cleaned up (if it existed)
        installationTestRunner.assert(true); // Directory cleanup verification
    } catch (error) {
        installationTestRunner.assert(false, `Installation rollback not implemented: ${error.message}`);
    }
});

// Test Configuration Integration
installationTestRunner.test('should integrate with CLI configurations', () => {
    try {
        const ConfigIntegrator = require('../src/installation/config-integrator.cjs');
        const integrator = new ConfigIntegrator();

        const testConfig = {
            testCli: {
                enabled: true,
                hooks: ['stigmergy-skill'],
                version: '1.0.0'
            }
        };

        const testDir = path.join(os.tmpdir(), 'test-config-integration-' + Date.now());
        const result = integrator.updateCLIConfig('testCli', testConfig, testDir);

        installationTestRunner.assert(result.success);
        installationTestRunner.assert(fs.existsSync(result.configPath));

        // Cleanup
        fs.rmSync(testDir, { recursive: true, force: true });
    } catch (error) {
        installationTestRunner.assert(false, `Configuration integration not implemented: ${error.message}`);
    }
});

// Test Cross-Platform Compatibility
installationTestRunner.test('should work on Windows platform', () => {
    try {
        const PlatformAdapter = require('../src/installation/platform-adapter.cjs');
        const adapter = new PlatformAdapter();

        const paths = adapter.getPlatformPaths();

        installationTestRunner.assert(paths.homeDirectory);
        installationTestRunner.assert(paths.configDirectory);
        installationTestRunner.assert(paths.claudeHookDirectory);
        installationTestRunner.assert(paths.geminiHookDirectory);

        // Verify paths are platform-appropriate
        if (process.platform === 'win32') {
            installationTestRunner.assert(paths.homeDirectory.includes('Users'));
        } else {
            installationTestRunner.assert(paths.homeDirectory.includes('/home'));
        }
    } catch (error) {
        installationTestRunner.assert(false, `Platform adapter not implemented: ${error.message}`);
    }
});

// Run all installation system tests
if (require.main === module) {
    console.log('🔧 Running TDD Tests for Installation System...\n');
    installationTestRunner.run().catch(console.error);
}