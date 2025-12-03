#!/usr/bin/env node

/**
 * QwenCode CLI Inheritance Integration Installation Script
 * Install cross-CLI collaboration awareness capabilities for QwenCode CLI
 * 
 * Usage:
 * node install_qwencode_integration.js [--verify|--uninstall]
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

// QwenCode CLI configuration paths
const QWENCODE_CONFIG_DIR = path.join(homedir(), '.config', 'qwencode');
const QWENCODE_CONFIG_FILE = path.join(QWENCODE_CONFIG_DIR, 'config.yml');

// Check if yaml library is installed
let yaml;
try {
    yaml = await import('js-yaml');
} catch (error) {
    console.warn('⚠️ js-yaml library not found, attempting to install...');
    try {
        execSync('npm install js-yaml', { stdio: 'inherit' });
        yaml = await import('js-yaml');
        console.log('[OK] js-yaml library installed successfully');
    } catch (installError) {
        console.error('❌ Unable to install js-yaml library, please install manually: npm install js-yaml');
        process.exit(1);
    }
}

async function createQwenCodeConfigDirectory() {
    /** Create QwenCode configuration directory */
    try {
        await fs.mkdir(QWENCODE_CONFIG_DIR, { recursive: true });
        console.log(`[OK] Created QwenCode configuration directory: ${QWENCODE_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] Failed to create QwenCode configuration directory: ${error.message}`);
    }
}

async function installQwenCodePlugins() {
    /** Install QwenCode Plugin configuration */
    // Read existing config configuration
    let existingConfig = {};
    try {
        const configExists = await fs.access(QWENCODE_CONFIG_FILE).then(() => true).catch(() => false);
        if (configExists) {
            const configContent = await fs.readFile(QWENCODE_CONFIG_FILE, 'utf8');
            existingConfig = yaml.load(configContent) || {};
        }
    } catch (error) {
        console.warn(`⚠️ Failed to read existing config configuration: ${error.message}`);
        existingConfig = {};
    }

    // Define cross-CLI collaboration Plugin configuration
    const crossCliPlugins = {
        "cross_cli_inheritance_adapter": {
            "name": "CrossCLIAdapterPlugin",
            "module": "src.adapters.qwencode.inheritance_adapter",
            "class": "QwenCodeInheritanceAdapter",
            "enabled": true,
            "priority": 100,
            "base_class": "BaseQwenCodePlugin",
            "handlers": [
                "on_prompt_received",
                "on_code_generated",
                "on_error_occurred",
                "on_file_created",
                "on_before_save"
            ],
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["claude", "gemini", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": true,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        }
    };

    // Merge configuration (preserve existing configuration, add collaboration features)
    const mergedConfig = { ...existingConfig };
    if (!mergedConfig.plugins) {
        mergedConfig.plugins = [];
    }

    // Check if cross-CLI plugin already exists
    const existingPlugins = mergedConfig.plugins || [];
    const crossCliPluginExists = existingPlugins.some(
        plugin => plugin.name === 'CrossCLIAdapterPlugin'
    );

    if (!crossCliPluginExists) {
        mergedConfig.plugins.push(crossCliPlugins.cross_cli_inheritance_adapter);
    }

    // Write config configuration file
    try {
        const yamlContent = yaml.dump(mergedConfig, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
        });
        
        await fs.writeFile(QWENCODE_CONFIG_FILE, yamlContent, 'utf8');
        console.log(`[OK] QwenCode configuration installed: ${QWENCODE_CONFIG_FILE}`);
        console.log("🔗 Installed Plugins:");
        
        for (const plugin of mergedConfig.plugins) {
            if (plugin.name === 'CrossCLIAdapterPlugin') {
                console.log(`   - ${plugin.name}: [OK] Cross-CLI collaboration awareness`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to install QwenCode configuration: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** Copy adapter files to QwenCode configuration directory */
    try {
        // Create adapter directory
        const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // Copy adapter files
        const adapterFiles = [
            'inheritance_adapter.py'
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
    /** Verify if installation was successful */
    console.log('\n🔍 Verifying QwenCode CLI integration installation...');

    // Check configuration directory
    try {
        await fs.access(QWENCODE_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ Configuration directory does not exist: ${QWENCODE_CONFIG_DIR}`);
        return false;
    }

    // Check config file
    try {
        await fs.access(QWENCODE_CONFIG_FILE);
    } catch (error) {
        console.error(`❌ Config configuration file does not exist: ${QWENCODE_CONFIG_FILE}`);
        return false;
    }

    // Check adapter directory
    const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ Adapter directory does not exist: ${adapterDir}`);
        return false;
    }

    // Read and verify config configuration
    try {
        const configContent = await fs.readFile(QWENCODE_CONFIG_FILE, 'utf8');
        const config = yaml.load(configContent);

        // Check if key plugin exists
        const plugins = config.plugins || [];
        const hasCrossCliPlugin = plugins.some(plugin => plugin.name === 'CrossCLIAdapterPlugin');
        
        if (!hasCrossCliPlugin) {
            console.warn('⚠️ Missing cross-CLI collaboration plugin: CrossCLIAdapterPlugin');
        }

        console.log('[OK] QwenCode CLI integration installation verification passed');
        return true;
    } catch (error) {
        console.error(`❌ Failed to verify config configuration: ${error.message}`);
        return false;
    }
}

async function uninstallQwenCodeIntegration() {
    /** Uninstall QwenCode integration */
    try {
        // Delete config configuration
        try {
            await fs.unlink(QWENCODE_CONFIG_FILE);
            console.log(`[OK] Deleted QwenCode Config configuration: ${QWENCODE_CONFIG_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ Failed to delete Config configuration: ${error.message}`);
            }
        }

        // Delete adapter directory
        const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] Deleted QwenCode adapter directory: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ Failed to delete adapter directory: ${error.message}`);
            }
        }

        console.log('[OK] QwenCode CLI integration uninstallation completed');
        return true;
    } catch (error) {
        console.error(`❌ Failed to uninstall QwenCode integration: ${error.message}`);
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

    console.log('QwenCode CLI Cross-CLI Collaboration Integration Installer');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] Uninstall mode...');
        await uninstallQwenCodeIntegration();
    } else if (options.verify) {
        console.log('🔍 Verification mode...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 Installation mode...');
        
        // 1. Create configuration directory
        await createQwenCodeConfigDirectory();

        // 2. Install Plugin configuration
        const pluginSuccess = await installQwenCodePlugins();

        // 3. Copy adapter files
        const adapterSuccess = await copyAdapterFiles();

        const success = pluginSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 QwenCode CLI Cross-CLI Collaboration Integration Installation Successful!');
            console.log('\n[INFO] Installation Summary:');
            console.log(`   [OK] Configuration Directory: ${QWENCODE_CONFIG_DIR}`);
            console.log(`   [OK] Config File: ${QWENCODE_CONFIG_FILE}`);
            console.log(`   [OK] Adapter Directory: ${path.join(QWENCODE_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] Cross-CLI Collaboration Plugin: Enabled`);
            
            console.log('\n[INSTALL] Next Steps:');
            console.log('   1. Run installation scripts for other CLI tools');
            console.log('   2. Use stigmergy-cli deploy --all to install all tools');
            console.log('   3. Use stigmergy-cli init to initialize the project');
        } else {
            console.log('\n❌ QwenCode CLI Cross-CLI Collaboration Integration Installation Failed');
        }
    } else {
        console.log('Usage:');
        console.log('  node install_qwencode_integration.js [--install|--verify|--uninstall]');
        console.log('  Default is installation mode');
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
    createQwenCodeConfigDirectory, 
    installQwenCodePlugins, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallQwenCodeIntegration 
};