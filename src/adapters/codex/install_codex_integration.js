#!/usr/bin/env node

/**
 * Codex CLI Cross-CLI Integration Installer
 * 
 * Automatically installs and configures Codex CLI cross-CLI integration features
 * including Slash Command registration and adapter setup
 * 
 * 使用方法：
 * node install_codex_integration.js [--verify|--uninstall|--force]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Codex CLI config paths
const CODEX_CONFIG_DIR = path.join(os.homedir(), '.config', 'codex');
const CODEX_SLASH_COMMANDS_FILE = path.join(CODEX_CONFIG_DIR, 'slash_commands.json');

class CodexIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Create Codex config directory
   */
  async createCodexConfigDirectory() {
    try {
      await fs.mkdir(CODEX_CONFIG_DIR, { recursive: true });
      console.log(`[OK] Created Codex config directory: ${CODEX_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to create Codex config directory: ${error.message}`);
      return false;
    }
  }

  /**
   * Install Codex Slash Command config
   */
  async installCodexSlashCommands(forceUpdate = true) {
    try {
      // Read existing slash_commands config
      let existingConfig = {};
      try {
        const data = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
        existingConfig = JSON.parse(data);
      } catch (error) {
        console.log(`[WARN] Failed to read existing slash_commands config: ${error.message}`);
        existingConfig = {};
      }

      // Define cross-CLI collaboration Slash Command config (always use English descriptions)
      const crossCliSlashCommands = {
        init: {
          command: 'init',
          description: 'Initialize cross-CLI collaboration project',
          module: 'src.core.enhanced_init_processor',
          enabled: true,
          cross_cli_enabled: true,
          supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
          resumesession_enabled: true,
          resumesession_integration: true
        },
        scan: {
          command: 'scan',
          description: 'Scan AI environment for CLI tools',
          module: 'src.core.ai_environment_scanner',
          enabled: true,
          cross_cli_enabled: true,
          supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
          resumesession_enabled: true,
          resumesession_integration: true
        },
        status: {
          command: 'status',
          description: 'View status of all CLI tools',
          module: 'src.core.cli_hook_integration',
          enabled: true,
          cross_cli_enabled: true,
          supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
          resumesession_enabled: true,
          resumesession_integration: true
        },
        deploy: {
          command: 'deploy',
          description: 'Deploy collaboration plugins for all CLI tools',
          module: 'src.core.cli_hook_integration',
          enabled: true,
          cross_cli_enabled: true,
          supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
          resumesession_enabled: true,
          resumesession_integration: true
        },
        call: {
          command: 'call',
          description: 'Call other CLI tools to execute tasks',
          module: 'src.core.cli_hook_integration',
          enabled: true,
          cross_cli_enabled: true,
          supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot'],
          resumesession_enabled: true,
          resumesession_integration: true
        }
      };

      // Merge config (preserve existing slash_commands, but always update descriptions to English)
      const mergedConfig = { ...existingConfig };
      if (!mergedConfig.slash_commands) {
        mergedConfig.slash_commands = {};
      }

      // Always update or add cross-CLI collaboration Slash Commands with English descriptions
      for (const [cmdName, cmdConfig] of Object.entries(crossCliSlashCommands)) {
        mergedConfig.slash_commands[cmdName] = cmdConfig;
      }

      // Write config file
      await fs.writeFile(CODEX_SLASH_COMMANDS_FILE, JSON.stringify(mergedConfig, null, 2));

      console.log(`[OK] Codex config installed: ${CODEX_SLASH_COMMANDS_FILE}`);
      console.log('Installed cross-CLI collaboration commands:');
      for (const cmdName of ['init', 'scan', 'status', 'deploy', 'call']) {
        const cmdConfig = mergedConfig.slash_commands[cmdName] || {};
        const status = cmdConfig.enabled ? '[OK]' : '[DISABLED]';
        console.log(`   - /${cmdName}: ${status} - ${cmdConfig.description}`);
      }

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to install Codex config: ${error.message}`);
      return false;
    }
  }

  /**
   * Copy adapter files to Codex config directory
   */
  async copyAdapterFile() {
    try {
      // Create adapter directory
      await fs.mkdir(CODEX_CONFIG_DIR, { recursive: true });

      // Get current script directory
      const currentDir = __dirname;

      // Copy adapter files
      const adapterFiles = [
        'mcp_server.js',
        'standalone_codex_adapter.js'
      ];

      for (const fileName of adapterFiles) {
        const srcFile = path.join(currentDir, fileName);
        const dstFile = path.join(CODEX_CONFIG_DIR, fileName);

        try {
          await fs.access(srcFile);
          await fs.copyFile(srcFile, dstFile);
          console.log(`[OK] Copied adapter file: ${fileName}`);
        } catch (error) {
          console.log(`[WARN] Adapter file does not exist: ${fileName}`);
          // 不强制要求适配器文件
        }
      }

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to copy adapter files: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation success
   */
  async verifyInstallation() {
    console.log('\nVerifying Codex CLI integration installation...');

    try {
      // Check config file
      await fs.access(CODEX_SLASH_COMMANDS_FILE);

      // Check config file content
      const data = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
      const config = JSON.parse(data);

      // Check if cross-CLI commands exist with English descriptions
      const slashCommands = config.slash_commands || {};
      const crossCliCommands = ['init', 'scan', 'status', 'deploy', 'call'];
      const missingCommands = [];
      const nonEnglishCommands = [];

      for (const cmdName of crossCliCommands) {
        if (!(cmdName in slashCommands)) {
          missingCommands.push(cmdName);
        } else {
          // Check if description is in English
          const description = (slashCommands[cmdName].description || '').toLowerCase();
          const chineseChars = ['初始化', '扫描', '查看', '部署', '调用'];
          if (chineseChars.some(char => description.includes(char))) {
            nonEnglishCommands.push(cmdName);
          }
        }
      }

      if (missingCommands.length > 0) {
        console.log(`[WARN] Missing cross-CLI commands: ${missingCommands.join(', ')}`);
      } else if (nonEnglishCommands.length > 0) {
        console.log(`[WARN] Commands with non-English descriptions: ${nonEnglishCommands.join(', ')}`);
      } else {
        console.log('[OK] All cross-CLI commands installed with English descriptions');
      }

      console.log('[OK] Codex config file verified');
      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to verify config file: ${error.message}`);
      return false;
    }
  }

  /**
   * Uninstall Codex integration
   */
  async uninstallIntegration() {
    try {
      // Remove cross-CLI commands from config file
      try {
        const data = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
        const config = JSON.parse(data);

        // Remove cross-CLI commands
        const slashCommands = config.slash_commands || {};
        const crossCliCommands = ['init', 'scan', 'status', 'deploy', 'call'];

        for (const cmd of crossCliCommands) {
          if (cmd in slashCommands) {
            delete slashCommands[cmd];
          }
        }

        config.slash_commands = slashCommands;

        // Save updated config
        await fs.writeFile(CODEX_SLASH_COMMANDS_FILE, JSON.stringify(config, null, 2));
        console.log('[OK] Removed cross-CLI commands from Codex config');
      } catch (error) {
        console.log(`[WARN] Failed to process config file: ${error.message}`);
      }

      // Delete adapter files
      const adapterFiles = [
        'mcp_server.js',
        'standalone_codex_adapter.js'
      ];

      for (const fileName of adapterFiles) {
        const adapterFile = path.join(CODEX_CONFIG_DIR, fileName);
        try {
          await fs.unlink(adapterFile);
          console.log(`[OK] Deleted adapter file: ${fileName}`);
        } catch (error) {
          // 文件可能不存在，忽略错误
        }
      }

      console.log('[OK] Codex CLI cross-CLI integration uninstalled');
      return true;
    } catch (error) {
      console.log(`[ERROR] Uninstall failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Create global Cross-CLI communication documentation
   */
  async createGlobalCrossCliDocumentation() {
    try {
      const docContent = `# Codex CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt<<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "Write a Python function"
- Run in shell: stigmergy gemini "Translate this text"
- Run in shell: stigmergy qwen "Analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;

      const docPath = path.join(CODEX_CONFIG_DIR, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent);

      console.log(`[OK] Created Cross-CLI Communication Guide: ${docPath}`);

      // If codex.md file exists, append Cross-CLI communication hint to the end
      const codexMdPath = path.join(os.homedir(), '.config', 'codex', 'codex.md');
      try {
        await fs.access(codexMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(codexMdPath, crossCliContent);
        console.log('[OK] Append Cross-CLI communication prompt to CODEX.md');
      } catch (error) {
        // 文件可能不存在，忽略
      }

      return true;
    } catch (error) {
      console.log(`[WARN] Failed to create Cross-CLI Communication Guide: ${error.message}`);
      return false;
    }
  }

  /**
   * Main installation flow
   */
  async install() {
    console.log('Codex CLI Cross-CLI Integration Installer');
    console.log('='.repeat(50));

          // Step 1. Create config directory
          console.log('\nStep 1. Creating config directory...');
          const configDirSuccess = await this.createCodexConfigDirectory();
    
          // Step 2. Install Slash Commands config
          console.log('\nStep 2. Installing Slash Commands config...');
          const slashCommandsSuccess = await this.installCodexSlashCommands(true);
    
          // Step 3. Copy adapter files
          console.log('\nStep 3. Copying adapter files...');
          const adapterSuccess = await this.copyAdapterFile();
    
          // Step 4. Create Cross-CLI communication guide
          console.log('\nStep 4. Creating Cross-CLI communication guide...');
          const guideSuccess = await this.createGlobalCrossCliDocumentation();
    
          // Step 5. Verify installation
          console.log('\nStep 5. Verifying installation...');
          const verificationSuccess = await this.verifyInstallation();
    
          const overallSuccess = configDirSuccess && slashCommandsSuccess && adapterSuccess && guideSuccess && verificationSuccess;
          
          const duration = Date.now() - this.startTime;
          console.log(`\n[INFO] Installation took: ${duration}ms`);    
    if (overallSuccess) {
      console.log('\n[SUCCESS] Codex CLI cross-CLI integration installed successfully!');
    } else {
      console.log('\n[WARNING] Warnings occurred during installation, please check the output above');
    }

    return overallSuccess;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const uninstall = args.includes('--uninstall');
  const force = args.includes('--force');

  const installer = new CodexIntegrationInstaller();

  if (uninstall) {
    return await installer.uninstallIntegration();
  } else if (verify) {
    return await installer.verifyInstallation();
  } else {
    return await installer.install();
  }
}

// 导出模块
module.exports = CodexIntegrationInstaller;

// 如果直接运行此脚本
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}