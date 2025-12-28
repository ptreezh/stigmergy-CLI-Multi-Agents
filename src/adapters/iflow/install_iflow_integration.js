#!/usr/bin/env node

/**
 * iFlow CLI Hook Adapter Installation Script
 * Installs cross-CLI collaboration awareness capability for iFlow CLI
 * 
 * Usage:
 * node install_iflow_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

// iFlow CLI config path
const IFLOW_CONFIG_DIR = path.join(os.homedir(), '.config', 'iflow');
const IFLOW_HOOKS_FILE = path.join(IFLOW_CONFIG_DIR, 'hooks.yml');

class IFlowIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Create iFlow config directory
   */
  async createIFlowConfigDirectory() {
    try {
      await fs.mkdir(IFLOW_CONFIG_DIR, { recursive: true });
      console.log(`[OK] Created iFlow config directory: ${IFLOW_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to create iFlow config directory: ${error.message}`);
      return false;
    }
  }

  /**
   * Install iFlow Hook configuration
   */
  async installIFlowHooks() {
    try {
      // Read existing hooks config
      let existingHooks = {};
      try {
        const data = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        existingHooks = yaml.load(data) || {};
      } catch (error) {
        console.log(`[WARN] Failed to read existing hooks config: ${error.message}`);
        existingHooks = {};
      }

      // Define cross-CLI collaboration Hook configuration
      const crossCliHooks = {
        cross_cli_adapter: {
          module: 'src.adapters.iflow.hook_adapter',
          class: 'IFlowHookAdapter',
          enabled: true,
          priority: 100,
          events: ['workflow_start', 'task_execute', 'pipeline_complete', 'user_input']
        }
      };

      // Merge config (preserve existing config, add collaboration feature)
      const mergedHooks = { ...existingHooks, ...crossCliHooks };

      // Write hooks config file
      const yamlContent = yaml.dump(mergedHooks, { indent: 2, lineWidth: 120, noRefs: true });
      await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');

      console.log(`[OK] iFlow Hook configuration installed: ${IFLOW_HOOKS_FILE}`);
      console.log('Installed Hooks:');
      Object.keys(crossCliHooks).forEach(hookName => {
        console.log(`   - ${hookName}: [OK] Cross-CLI collaboration awareness`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to install iFlow Hook configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Copy adapter files to iFlow config directory
   */
  async copyAdapterFile() {
    try {
      // Create adapter directory
      const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
      await fs.mkdir(adapterDir, { recursive: true });

      // Get current script directory
      const currentDir = __dirname;
      const adapterSource = path.join(currentDir, 'hook_adapter.js');
      const adapterDest = path.join(adapterDir, 'hook_adapter.js');

      // Copy adapter file
      try {
        await fs.access(adapterSource);
        await fs.copyFile(adapterSource, adapterDest);
        console.log(`[OK] Copied adapter file: ${adapterDest}`);
      } catch (error) {
        console.log(`[ERROR] Adapter source file does not exist: ${adapterSource}`);
        return false;
      }

      // Create global Cross-CLI documentation
      await this.createGlobalCrossCliDocumentation(IFLOW_CONFIG_DIR);

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to copy adapter file: ${error.message}`);
      return false;
    }
  }

  /**
   * Create global Cross-CLI communication documentation
   */
  async createGlobalCrossCliDocumentation(configDir) {
    try {
      const docContent = `# iFlow CLI Cross-CLI Communication Guide

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

      const docPath = path.join(configDir, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent, 'utf8');
      console.log(`[OK] Created Cross-CLI communication guide: ${docPath}`);

      // If iflow.md exists, append Cross-CLI communication prompt at the end
      const iflowMdPath = path.join(os.homedir(), '.iflow', 'iflow.md');
      try {
        await fs.access(iflowMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(iflowMdPath, crossCliContent, 'utf8');
        console.log('[OK] Appended Cross-CLI communication prompt to IFLOW.md');
      } catch (error) {
        // File may not exist, ignore
      }

      return true;
    } catch (error) {
      console.log(`[WARN] Failed to create Cross-CLI communication guide: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  async verifyInstallation() {
    const checks = [
      { name: 'iFlow config directory', path: IFLOW_CONFIG_DIR },
      { name: 'iFlow Hooks file', path: IFLOW_HOOKS_FILE }
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
      // Remove cross-CLI adapter from hooks config
      try {
        const data = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        const hooksConfig = yaml.load(data) || {};

        // Remove cross-CLI adapter
        if ('cross_cli_adapter' in hooksConfig) {
          delete hooksConfig['cross_cli_adapter'];
          
          // Save updated config
          const yamlContent = yaml.dump(hooksConfig, { indent: 2, lineWidth: 120, noRefs: true });
          await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');
          
          console.log('[OK] Removed cross-CLI adapter from iFlow Hooks config');
        }
      } catch (error) {
        console.log(`[WARN] Failed to process hooks config: ${error.message}`);
      }

      // Delete adapter file
      try {
        const adapterFile = path.join(IFLOW_CONFIG_DIR, 'adapters', 'hook_adapter.js');
        await fs.unlink(adapterFile);
        console.log('[OK] Deleted iFlow adapter file');
      } catch (error) {
        // File may not exist, ignore error
      }

      console.log('[OK] iFlow CLI cross-CLI integration uninstalled');
      return true;
    } catch (error) {
      console.log(`[ERROR] Uninstall failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Main installation process
   */
  async install() {
    console.log('iFlow CLI Cross-CLI Integration Installer');
    console.log('='.repeat(50));

    // Step 1. Create config directory
    console.log('\nStep 1. Create config directory...');
    const configDirSuccess = await this.createIFlowConfigDirectory();

    // Step 2. Install Hook config
    console.log('\nStep 2. Install Hook config...');
    const hooksSuccess = await this.installIFlowHooks();

    // Step 3. Copy adapter files
    console.log('\nStep 3. Copy adapter files...');
    const adapterSuccess = await this.copyAdapterFile();

    // Step 4. Verify installation
    console.log('\nStep 4. Verify installation...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && hooksSuccess && adapterSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] Installation took: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] iFlow CLI cross-CLI integration installed successfully!');
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

  const installer = new IFlowIntegrationInstaller();

  if (uninstall) {
    return await installer.uninstallIntegration();
  } else if (verify) {
    return await installer.verifyInstallation();
  } else {
    return await installer.install();
  }
}

// 导出模块
module.exports = IFlowIntegrationInstaller;

// 如果直接运行此脚本
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}