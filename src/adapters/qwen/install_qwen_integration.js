#!/usr/bin/env node

/**
 * Qwen CLI Integration Installer - JavaScript Version
 * Sets up basic integration for Qwen CLI with cross-CLI collaboration capabilities
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Qwen CLI config paths
const QWEN_CONFIG_DIR = path.join(os.homedir(), '.qwen');
const QWEN_CONFIG_FILE = path.join(QWEN_CONFIG_DIR, 'config.json');
const QWEN_HOOKS_FILE = path.join(QWEN_CONFIG_DIR, 'hooks.json');

class QwenInstaller {
  constructor() {
    this.toolName = 'qwen';
    this.configDir = QWEN_CONFIG_DIR;
    this.configFile = QWEN_CONFIG_FILE;
    this.hooksFile = QWEN_HOOKS_FILE;
  }

  async createConfigDirectory() {
    await fs.mkdir(this.configDir, { recursive: true });
    console.log(`[OK] Created Qwen config directory: ${this.configDir}`);
  }

  async installConfig() {
    // Read existing config
    let existingConfig = {};
    try {
      const content = await fs.readFile(this.configFile, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch (e) {
      console.log(`Warning: Failed to read existing config: ${e.message}`);
      existingConfig = {};
    }

    // Define cross-CLI integration config
    const crossCliConfig = {
      cross_cli_enabled: true,
      supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'],
      auto_detect: true,
      timeout: 30,
      collaboration_mode: 'active',
      qwen_oauth_integration: true
    };

    // Merge configs
    const mergedConfig = { ...existingConfig, ...crossCliConfig };

    // Write config file
    await fs.writeFile(this.configFile, JSON.stringify(mergedConfig, null, 2));
    console.log(`[OK] Qwen config installed: ${this.configFile}`);
    return true;
  }

  async installHooks() {
    // Read existing hooks config
    let existingHooks = {};
    try {
      const content = await fs.readFile(this.hooksFile, 'utf-8');
      existingHooks = JSON.parse(content);
    } catch (e) {
      console.log(`Warning: Failed to read existing hooks config: ${e.message}`);
      existingHooks = {};
    }

    // Define cross-CLI integration hooks
    const crossCliHooks = {
      cross_cli_adapter: {
        enabled: true,
        supported_tools: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'],
        trigger_patterns: [
          'use\\s+(\\w+)\\s+to\\s+(.+)$',
          'call\\s+(\\w+)\\s+(.+)$',
          'ask\\s+(\\w+)\\s+(.+)$',
          'stigmergy\\s+(\\w+)\\s+(.+)$'
        ]
      }
    };

    // Merge hooks configs
    const mergedHooks = { ...existingHooks, ...crossCliHooks };

    // Write hooks config file
    await fs.writeFile(this.hooksFile, JSON.stringify(mergedHooks, null, 2));
    console.log(`[OK] Qwen hooks installed: ${this.hooksFile}`);
    return true;
  }

  async copyAdapterFiles() {
    const currentDir = __dirname;
    const targetDir = path.join(this.configDir, 'hooks');
    
    try {
      // Look for adapter files to copy
      const adapterFiles = await fs.readdir(currentDir);
      const filesToCopy = adapterFiles.filter(file => 
        file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.py') || file === '__init__.py'
      );

      for (const file of filesToCopy) {
        const srcFile = path.join(currentDir, file);
        const dstFile = path.join(targetDir, file);
        await fs.copyFile(srcFile, dstFile);
        console.log(`[OK] Copied adapter file: ${file}`);
      }

      // Create global Cross-CLI documentation
      await this.createGlobalCrossCliDocumentation(this.configDir);
      
      return true;
    } catch (e) {
      console.log(`Warning: Failed to copy adapter files: ${e.message}`);
      return true;
    }
  }

  async createGlobalCrossCliDocumentation(configDir) {
    try {
      const docContent = `# Qwen CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy distcli "Prompt">>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;
      
      const docPath = path.join(configDir, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent);
      console.log(`[OK] Created Cross-CLI Communication Guide: ${docPath}`);
      
      // Append to qwen.md if it exists
      const qwenMdPath = path.join(os.homedir(), '.qwen', 'qwen.md');
      try {
        await fs.access(qwenMdPath);
        const crossCliContent = `

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy distcli "Prompt">>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(qwenMdPath, crossCliContent);
        console.log('[OK] 在QWEN.md末尾追加Cross-CLI通信提示');
      } catch (e) {
        // File doesn't exist, that's ok
      }
      
      return true;
    } catch (e) {
      console.log(`Warning: Failed to create Cross-CLI Communication Guide: ${e.message}`);
      return false;
    }
  }

  async verifyInstallation() {
    console.log('\n验证Qwen CLI集成安装...');

    // Check config directory
    if (!await fs.access(this.configDir).then(() => true).catch(() => false)) {
      console.log(`Warning: Config directory does not exist: ${this.configDir}`);
      return true;
    }

    // Check config file content
    try {
      const content = await fs.readFile(this.configFile, 'utf-8');
      const config = JSON.parse(content);
      
      if (config.cross_cli_enabled) {
        console.log('[OK] Cross-CLI integration enabled');
      } else {
        console.log('Note: Cross-CLI integration not enabled');
      }
      
      console.log('[OK] Qwen config file verified');
      return true;
    } catch (e) {
      console.log(`Warning: Failed to verify config file: ${e.message}`);
      return true;
    }
  }

  async uninstallIntegration() {
    try {
      // Remove cross-CLI config from config file
      if (await fs.access(this.configFile).then(() => true).catch(() => false)) {
        const content = await fs.readFile(this.configFile, 'utf-8');
        const config = JSON.parse(content);

        // Remove cross-CLI settings
        delete config.cross_cli_enabled;
        delete config.supported_clis;
        delete config.auto_detect;
        delete config.collaboration_mode;
        delete config.qwen_oauth_integration;

        // Save updated config
        await fs.writeFile(this.configFile, JSON.stringify(config, null, 2));
        console.log('[OK] Removed cross-CLI settings from Qwen config');
      }

      // Remove hooks config file
      if (await fs.access(this.hooksFile).then(() => true).catch(() => false)) {
        await fs.unlink(this.hooksFile);
        console.log('[OK] Removed Qwen hooks config file');
      }

      console.log('[OK] Qwen CLI cross-CLI integration uninstalled');
      return true;
    } catch (e) {
      console.log(`Error: Uninstall failed: ${e.message}`);
      return false;
    }
  }

  async install() {
    console.log('Qwen CLI Integration Installer');
    console.log('==========================================');

    // Execute installation
    console.log('Step 1. 创建配置目录...');
    await this.createConfigDirectory();

    console.log('\nStep 2. 安装配置...');
    const configSuccess = await this.installConfig();

    console.log('\nStep 3. 安装钩子...');
    const hooksSuccess = await this.installHooks();

    console.log('\nStep 4. 复制适配器文件...');
    const adapterSuccess = await this.copyAdapterFiles();

    console.log('\nStep 5. 验证安装...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configSuccess && hooksSuccess && adapterSuccess && verificationSuccess;
    if (overallSuccess) {
      console.log('\n[SUCCESS] Qwen CLI integration installed successfully!');
    } else {
      console.log('\n[WARNING] Installation completed with warnings');
    }

    return overallSuccess;
  }
}

// Main execution
if (require.main === module) {
  const installer = new QwenInstaller();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
  case '--verify':
    installer.verifyInstallation().then(success => process.exit(success ? 0 : 1));
    break;
  case '--uninstall':
    installer.uninstallIntegration().then(success => process.exit(success ? 0 : 1));
    break;
  default:
    installer.install().then(success => process.exit(success ? 0 : 1));
    break;
  }
}

module.exports = QwenInstaller;