#!/usr/bin/env node

/**
 * Qoder CLI Notification Hook Integration Installation Script
 * Install cross-CLI collaboration awareness capabilities for Qoder CLI
 * 
 * Usage:
 * node install_qoder_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// Qoder CLI configuration paths
const QODER_CONFIG_FILE = path.join(homedir(), '.qoder', 'config.json');

async function installQoderHooks() {
    /** Install Qoder Notification Hook configuration */
    // Read existing config configuration
    let existingConfig = {};
    try {
        const configExists = await fs.access(QODER_CONFIG_FILE).then(() => true).catch(() => false);
        if (configExists) {
            const configContent = await fs.readFile(QODER_CONFIG_FILE, 'utf8');
            existingConfig = JSON.parse(configContent);
        }
    } catch (error) {
        console.warn(`[WARNING] Failed to read existing config: ${error.message}`);
        existingConfig = {};
    }

    // Define cross-CLI collaboration Hook configuration
    const crossCliHooks = {
        "cross_cli_notification_hook": {
            "name": "CrossCLINotificationHook",
            "module": "src.adapters.qoder.notification_hook_adapter",
            "class": "QoderNotificationHookAdapter",
            "enabled": true,
            "priority": 100,
            "triggers": [
                "on_command_execution",
                "on_tool_detected",
                "on_collaboration_request"
            ],
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["claude", "gemini", "qwencode", "iflow", "codebuddy", "copilot"],
                "auto_detect": true,
                "timeout": 30,
                "notification_channel": "file_system",
                "error_handling": "continue"
            }
        }
    };

    // Merge configuration (preserve existing hooks, add collaboration features)
    const mergedConfig = { ...existingConfig };
    if (!mergedConfig.hooks) {
        mergedConfig.hooks = [];
    }

    // Check if cross-CLI notification Hook already exists
    const existingHookNames = mergedConfig.hooks.map(hook => hook.name || '');
    const crossCliHookName = "CrossCLINotificationHook";

    if (!existingHookNames.includes(crossCliHookName)) {
        mergedConfig.hooks.push(crossCliHooks.cross_cli_notification_hook);
    }

    // Write configuration file
    try {
        await fs.writeFile(QODER_CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');
        console.log(`[OK] Qoder configuration installed: ${QODER_CONFIG_FILE}`);
        console.log("Installed Hooks:");
        
        for (const hook of mergedConfig.hooks) {
            const hookName = hook.name;
            const status = hook.enabled ? "[OK]" : "[DISABLED]";
            console.log(`   - ${hookName}: ${status}`);
        }

        return true;
    } catch (error) {
        console.error(`[ERROR] Failed to install Qoder configuration: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** Copy adapter files to Qoder configuration directory */
    try {
        // Create adapter directory
        const adapterDir = path.dirname(QODER_CONFIG_FILE);
        await fs.mkdir(adapterDir, { recursive: true });

        // Copy adapter files
        const adapterFiles = [
            "notification_hook_adapter.py",
            "standalone_qoder_adapter.py"
        ];

        for (const fileName of adapterFiles) {
            const srcFile = path.join(__dirname, fileName);
            const dstFile = path.join(adapterDir, fileName);

            try {
                await fs.access(srcFile);
                await fs.copyFile(srcFile, dstFile);
                console.log(`[OK] Copied adapter file: ${fileName}`);
            } catch (error) {
                console.warn(`[WARNING] Source adapter file not found: ${fileName}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`[ERROR] Failed to copy adapter files: ${error.message}`);
        return false;
    }
}

async function verifyInstallation() {
    /** Verify installation */
    console.log("\n🔍 Verifying Qoder CLI integration installation...");

    // Check configuration file
    try {
        await fs.access(QODER_CONFIG_FILE);
    } catch (error) {
        console.error(`[ERROR] Qoder configuration file not found: ${QODER_CONFIG_FILE}`);
        return false;
    }

    // Read configuration file
    try {
        const configContent = await fs.readFile(QODER_CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // Check Hook configuration
        const hooks = config.hooks || [];
        const crossCliHookFound = hooks.some(hook => hook.name === 'CrossCLINotificationHook');

        if (!crossCliHookFound) {
            console.error("[ERROR] Cross-CLI Notification Hook not found in configuration");
            return false;
        }

        console.log("[OK] Installation verified successfully");
        return true;
    } catch (error) {
        console.error(`[ERROR] Installation verification failed: ${error.message}`);
        return false;
    }
}

async function uninstallQoderIntegration() {
    /** Uninstall Qoder integration */
    try {
        // Check configuration file
        const configExists = await fs.access(QODER_CONFIG_FILE).then(() => true).catch(() => false);
        if (!configExists) {
            console.warn("[WARNING] Qoder configuration file not found");
            return true;
        }

        // Read configuration file
        const configContent = await fs.readFile(QODER_CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // Remove cross-CLI notification Hook
        const hooks = config.hooks || [];
        const filteredHooks = hooks.filter(hook => hook.name !== 'CrossCLINotificationHook');
        config.hooks = filteredHooks;

        // Write updated configuration
        await fs.writeFile(QODER_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

        console.log("[OK] Qoder integration uninstalled successfully");
        return true;
    } catch (error) {
        console.error(`[ERROR] Failed to uninstall Qoder integration: ${error.message}`);
        return false;
    }
}

async function main() {
    /** Main function */
    const args = process.argv.slice(2);
    const options = {
        verify: args.includes('--verify'),
        uninstall: args.includes('--uninstall'),
        install: args.includes('--install') || args.length === 0
    };

    console.log("Qoder CLI Cross-CLI Collaboration Integration Installer");
    console.log("=".repeat(50));

    if (options.uninstall) {
        console.log("Uninstall mode...");
        await uninstallQoderIntegration();
    } else if (options.verify) {
        console.log("Verification mode...");
        await verifyInstallation();
    } else if (options.install) {
        console.log("Installing Qoder CLI Cross-CLI Collaboration Integration...");
        
        // 1. Install configuration
        const configSuccess = await installQoderHooks();

        // 2. Copy adapter files
        const adapterSuccess = await copyAdapterFiles();

        const success = configSuccess && adapterSuccess;

        if (success) {
            console.log("\nQoder CLI Cross-CLI Collaboration Integration installed successfully!");
            console.log("\nInstallation Summary:");
            console.log(`   [OK] Configuration file: ${QODER_CONFIG_FILE}`);
            console.log(`   [OK] Adapter directory: ${path.dirname(QODER_CONFIG_FILE)}`);
            console.log(`   [OK] Cross-CLI Collaboration Hook: Enabled`);
            
            console.log("\nNext steps:");
            console.log("   1. Run installation scripts for other CLI tools");
            console.log("   2. Use stigmergy-cli deploy --all to install all tools");
            console.log("   3. Use stigmergy-cli init to initialize your project");
        } else {
            console.log("\nQoder CLI Cross-CLI Collaboration Integration installation failed");
        }
    } else {
        console.log("Usage:");
        console.log("  node install_qoder_integration.js [--install|--verify|--uninstall]");
        console.log("  Default is install mode");
    }
}

// Run main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(`[FATAL] ${error.message}`);
        process.exit(1);
    });
}

export { 
    installQoderHooks, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallQoderIntegration 
};