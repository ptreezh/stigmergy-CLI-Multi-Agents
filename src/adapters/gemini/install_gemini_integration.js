#!/usr/bin/env node

/**
 * Gemini CLI Extension integration installer
 * Install cross-CLI collaboration awareness capability for Gemini CLI
 * 
 * Usage:
 * node install_gemini_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Gemini CLI config path
const GEMINI_CONFIG_DIR = path.join(os.homedir(), '.config', 'gemini');
const GEMINI_EXTENSIONS_FILE = path.join(GEMINI_CONFIG_DIR, 'extensions.json');

class GeminiIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Create Gemini config directory
   */
  async createGeminiConfigDirectory() {
    try {
      await fs.mkdir(GEMINI_CONFIG_DIR, { recursive: true });
      console.log(`[OK] Created Gemini config directory: ${GEMINI_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to create Gemini config directory: ${error.message}`);
      return false;
    }
  }

  /**
   * Install Gemini Extension configuration
   */
  async installGeminiExtensions() {
    try {
      // Read existing extensions config
      let existingExtensions = {};
      try {
        const data = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
        existingExtensions = JSON.parse(data);
      } catch (error) {
        console.log(`[WARN] Failed to read existing extensions config: ${error.message}`);
        existingExtensions = {};
      }

      // Define cross-CLI collaboration Extension configuration
      const crossCliExtensions = {
        cross_cli_preprocessor: {
          module: 'src.adapters.gemini.extension_adapter',
          class: 'GeminiExtensionAdapter',
          enabled: true,
          priority: 100,
          config: {
            cross_cli_enabled: true,
            supported_clis: ['claude', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
            auto_detect: true,
            timeout: 30,
            error_handling: 'continue',
            collaboration_mode: 'active'
          }
        },
        cross_cli_response_processor: {
          module: 'src.adapters.gemini.extension_adapter',
          class: 'GeminiExtensionAdapter',
          enabled: true,
          priority: 90,
          config: {
            cross_cli_enabled: true,
            format_cross_cli_results: true,
            add_collaboration_header: true,
            include_tool_status: true
          }
        }
      };

      // Merge config (preserve existing config, add collaboration feature)
      const mergedExtensions = { ...existingExtensions, ...crossCliExtensions };

      // Write extensions config file
      await fs.writeFile(GEMINI_EXTENSIONS_FILE, JSON.stringify(mergedExtensions, null, 2), 'utf8');
      
      console.log(`[OK] Gemini Extension configuration installed: ${GEMINI_EXTENSIONS_FILE}`);
      console.log('Installed Extensions:');
      Object.keys(crossCliExtensions).forEach(extName => {
        console.log(`   - ${extName}: [OK] Cross-CLI collaboration awareness`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to install Gemini Extension configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Copy adapter files to Gemini config directory
   */
  async copyAdapterFile() {
    try {
      // Create adapter directory
      const adapterDir = path.join(GEMINI_CONFIG_DIR, 'adapters');
      await fs.mkdir(adapterDir, { recursive: true });

      // Get current script directory
      const currentDir = __dirname;
      const adapterSource = path.join(currentDir, 'extension_adapter.js');
      const adapterDest = path.join(adapterDir, 'extension_adapter.js');

      // Copy adapter file
      try {
        await fs.access(adapterSource);
        await fs.copyFile(adapterSource, adapterDest);
        console.log(`[OK] Copied adapter file: ${adapterDest}`);
      } catch (error) {
        console.log(`[WARN] Adapter source file does not exist: ${adapterSource}`);
        // Adapter file is not mandatory
      }

      return true;
    } catch (error) {
      console.log(`[WARN] Failed to copy adapter file: ${error.message}`);
      return true; // Adapter file is not mandatory
    }
  }

  /**
   * Verify installation
   */
  async verifyInstallation() {
    const checks = [
      { name: 'Gemini config directory', path: GEMINI_CONFIG_DIR },
      { name: 'Gemini Extensions file', path: GEMINI_EXTENSIONS_FILE }
    ];

    let allPassed = true;
    for (const check of checks) {
      try {
        await fs.access(check.path);
        console.log(`[OK] ${check.name}`);
      } catch (error) {
        console.log(`[FAIL] ${check.name}`);
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Uninstall integration
   */
  async uninstallIntegration() {
    try {
      // Remove cross-CLI adapters from extensions config
      try {
        const data = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
        const extensionsConfig = JSON.parse(data);

        // Remove cross-CLI adapters
        const extensionsToRemove = ['cross_cli_preprocessor', 'cross_cli_response_processor'];
        let removedCount = 0;
        
        extensionsToRemove.forEach(extName => {
          if (extName in extensionsConfig) {
            delete extensionsConfig[extName];
            removedCount++;
          }
        });

        // Save updated config
        if (removedCount > 0) {
          await fs.writeFile(GEMINI_EXTENSIONS_FILE, JSON.stringify(extensionsConfig, null, 2), 'utf8');
          console.log(`[OK] Removed ${removedCount} cross-CLI adapters from Gemini Extensions config`);
        }
      } catch (error) {
        console.log(`[WARN] Failed to process extensions config: ${error.message}`);
      }

      // Delete adapter file
      try {
        const adapterFile = path.join(GEMINI_CONFIG_DIR, 'adapters', 'extension_adapter.js');
        await fs.unlink(adapterFile);
        console.log('[OK] Deleted Gemini adapter file');
      } catch (error) {
        // File may not exist, ignore error
      }

      console.log('[OK] Gemini CLI cross-CLI integration uninstalled');
      return true;
    } catch (error) {
      console.log(`[ERROR] Uninstall failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Create Cross-CLI communication guide
   */
  async createCrossCliGuide() {
    try {
      const guideContent = `# Gemini CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;

      const guidePath = path.join(GEMINI_CONFIG_DIR, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(guidePath, guideContent, 'utf8');
      console.log(`[OK] Created Cross-CLI communication guide: ${guidePath}`);
      return true;
    } catch (error) {
      console.log(`[WARN] Failed to create Cross-CLI communication guide: ${error.message}`);
      return false;
    }
  }

  /**
   * Main installation process
   */
  async install() {
    console.log('Gemini CLI Cross-CLI Integration Installer');
    console.log('='.repeat(50));

    // Step 1. Create config directory
    console.log('\nStep 1. Create config directory...');
    const configDirSuccess = await this.createGeminiConfigDirectory();

    // Step 2. Install Extension config
    console.log('\nStep 2. Install Extension config...');
    const extensionsSuccess = await this.installGeminiExtensions();

    // Step 3. Copy adapter files
    console.log('\nStep 3. Copy adapter files...');
    const adapterSuccess = await this.copyAdapterFile();

    // Step 4. Create Cross-CLI communication guide
    console.log('\nStep 4. Create Cross-CLI communication guide...');
    const guideSuccess = await this.createCrossCliGuide();

    // Step 5. Verify installation
    console.log('\nStep 5. Verify installation...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && extensionsSuccess && adapterSuccess && guideSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] Installation took: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] Gemini CLI cross-CLI integration installed successfully!');
    } else {
      console.log('\n[WARNING] Warnings occurred during installation, please check above output');
    }

    return overallSuccess;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const uninstall = args.includes('--uninstall');

  const installer = new GeminiIntegrationInstaller();

  if (uninstall) {
    return await installer.uninstallIntegration();
  } else if (verify) {
    return await installer.verifyInstallation();
  } else {
    return await installer.install();
  }
}

// 导出模块
module.exports = GeminiIntegrationInstaller;

// 如果直接运行此脚本
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}