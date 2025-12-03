#!/usr/bin/env node

/**
 * iFlow CLI Hook Integration Installation Script
 * Install cross-CLI collaboration awareness capabilities for iFlow CLI
 * 
 * Usage:
 * node install_iflow_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { execSync } from 'child_process';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// iFlow CLI configuration paths
const IFLOW_CONFIG_DIR = path.join(homedir(), '.config', 'iflow');
const IFLOW_HOOKS_FILE = path.join(IFLOW_CONFIG_DIR, 'hooks.yml');

// Check if yaml library is installed
let yaml;
try {
    yaml = await import('js-yaml');
} catch (error) {
    console.warn('⚠️ js-yaml library not found, will try to install...');
    try {
        execSync('npm install js-yaml', { stdio: 'inherit' });
        yaml = await import('js-yaml');
        console.log('[OK] js-yaml library installed successfully');
    } catch (installError) {
        console.error('❌ Unable to install js-yaml library, please install manually: npm install js-yaml');
        process.exit(1);
    }
}

async function createIFlowConfigDirectory() {
    /** Create iFlow configuration directory */
    try {
        await fs.mkdir(IFLOW_CONFIG_DIR, { recursive: true });
        console.log(`[OK] Created iFlow configuration directory: ${IFLOW_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] Failed to create iFlow configuration directory: ${error.message}`);
    }
}

async function installIFlowHooks() {
    /** Install iFlow Hook configuration */
    // Read existing hooks configuration
    let existingHooks = {};
    try {
        const hooksExists = await fs.access(IFLOW_HOOKS_FILE).then(() => true).catch(() => false);
        if (hooksExists) {
            const hooksContent = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
            existingHooks = yaml.load(hooksContent) || {};
        }
    } catch (error) {
        console.warn(`⚠️ Failed to read existing hooks configuration: ${error.message}`);
        existingHooks = {};
    }

    // Define cross-CLI collaboration Hook configuration
    const crossCliHooks = {
        "cross_cli_hook_adapter": {
            "name": "CrossCLIHookAdapter",
            "module": "src.adapters.iflow.hook_adapter",
            "class": "IFlowHookAdapter",
            "enabled": true,
            "priority": 100,
            "hooks": [
                "on_command_start",
                "on_command_end",
                "on_user_input",
                "on_workflow_stage",
                "on_pipeline_execute",
                "on_output_render",
                "on_error"
            ],
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["claude", "gemini", "qwencode", "qoder", "codebuddy", "copilot"],
                "auto_detect": true,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        }
    };

    // Merge configuration (preserve existing hooks, add collaboration features)
    const mergedHooks = { ...existingHooks };
    if (!mergedHooks.plugins) {
        mergedHooks.plugins = [];
    }

    // Check if cross-CLI Hook already exists
    const existingPluginNames = mergedHooks.plugins.map(plugin => plugin.name || '');
    const crossCliHookExists = existingPluginNames.includes('CrossCLIHookAdapter');

    if (!crossCliHookExists) {
        mergedHooks.plugins.push(crossCliHooks.cross_cli_hook_adapter);
    }

    // Write hooks configuration file
    try {
        const yamlContent = yaml.dump(mergedHooks, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
        });
        
        await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');
        console.log(`[OK] iFlow Hook configuration installed: ${IFLOW_HOOKS_FILE}`);
        console.log("🔗 Installed Hooks:");
        
        for (const plugin of mergedHooks.plugins) {
            if (plugin.name === 'CrossCLIHookAdapter') {
                console.log(`   - ${plugin.name}: [OK] Cross-CLI collaboration awareness`);
                console.log(`     Supported CLIs: ${plugin.config.supported_clis.join(', ')}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to install iFlow Hook configuration: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** Copy adapter files to iFlow configuration directory */
    try {
        // Create adapter directory
        const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // Copy adapter files
        const adapterFiles = [
            'workflow_adapter.py',
            'hook_adapter.py'
        ];

        for (const fileName of adapterFiles) {
            const srcFile = path.join(__dirname, fileName);
            const dstFile = path.join(adapterDir, fileName);

            try {
                await fs.access(srcFile);
                await fs.copyFile(srcFile, dstFile);
                console.log(`[OK] Copied adapter file: ${fileName}`);
            } catch (error) {
                console.warn(`⚠️ Adapter file does not exist: ${fileName}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`❌ Failed to copy adapter files: ${error.message}`);
        return false;
    }
}

async function verifyInstallation() {
    /** Verify installation was successful */
    console.log('\n🔍 Verifying iFlow CLI integration installation...');

    // Check configuration directory
    try {
        await fs.access(IFLOW_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ Configuration directory does not exist: ${IFLOW_CONFIG_DIR}`);
        return false;
    }

    // Check hooks file
    try {
        await fs.access(IFLOW_HOOKS_FILE);
    } catch (error) {
        console.error(`❌ Hooks configuration file does not exist: ${IFLOW_HOOKS_FILE}`);
        return false;
    }

    // Check adapter directory
    const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ Adapter directory does not exist: ${adapterDir}`);
        return false;
    }

    // Read and verify hooks configuration
    try {
        const hooksContent = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        const hooks = yaml.load(hooksContent);

        // Check if key plugin exists
        const plugins = hooks.plugins || [];
        const hasCrossCliPlugin = plugins.some(plugin => plugin.name === 'CrossCLIHookAdapter');
        
        if (!hasCrossCliPlugin) {
            console.warn('⚠️ Missing cross-CLI collaboration plugin: CrossCLIHookAdapter');
        }

        console.log('[OK] iFlow CLI integration installation verification passed');
        return true;
    } catch (error) {
        console.error(`❌ Failed to verify hooks configuration: ${error.message}`);
        return false;
    }
}

async function uninstallIFlowIntegration() {
    /** Uninstall iFlow integration */
    try {
        // Delete hooks configuration
        try {
            await fs.unlink(IFLOW_HOOKS_FILE);
            console.log(`[OK] Deleted iFlow Hooks configuration: ${IFLOW_HOOKS_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ Failed to delete Hooks configuration: ${error.message}`);
            }
        }

        // Delete adapter directory
        const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] Deleted iFlow adapter directory: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ Failed to delete adapter directory: ${error.message}`);
            }
        }

        console.log('[OK] iFlow CLI integration uninstallation completed');
        return true;
    } catch (error) {
        console.error(`❌ Failed to uninstall iFlow integration: ${error.message}`);
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

    console.log('iFlow CLI Cross-CLI Collaboration Integration Installer');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] Uninstall mode...');
        await uninstallIFlowIntegration();
    } else if (options.verify) {
        console.log('🔍 Verification mode...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 Installation mode...');
        
        // 1. Create configuration directory
        await createIFlowConfigDirectory();

        // 2. Install Hook configuration
        const hookSuccess = await installIFlowHooks();

        // 3. Copy adapter files
        const adapterSuccess = await copyAdapterFiles();

        const success = hookSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 iFlow CLI Cross-CLI Collaboration Integration Installation Successful!');
            console.log('\n[INFO] Installation Summary:');
            console.log(`   [OK] Configuration Directory: ${IFLOW_CONFIG_DIR}`);
            console.log(`   [OK] Hooks File: ${IFLOW_HOOKS_FILE}`);
            console.log(`   [OK] Adapter Directory: ${path.join(IFLOW_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] Cross-CLI Collaboration Hook: Enabled`);
            
            console.log('\n[INSTALL] Next Steps:');
            console.log('   1. Run installation scripts for other CLI tools');
            console.log('   2. Use stigmergy-cli deploy --all to install all tools');
            console.log('   3. Use stigmergy-cli init to initialize project');
        } else {
            console.log('\n[ERROR] iFlow CLI Cross-CLI Collaboration Integration Installation Failed');
        }
    } else {
        console.log('Usage:');
        console.log('  node install_iflow_integration.js [--install|--verify|--uninstall]');
        console.log('  Default is install mode');
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
    createIFlowConfigDirectory, 
    installIFlowHooks, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallIFlowIntegration 
};