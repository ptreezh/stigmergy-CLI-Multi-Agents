#!/usr/bin/env node

/**
 * CodeBuddy CLI Skills Integration Installation Script
 * Install cross-CLI collaboration awareness capability for CodeBuddy CLI
 * 
 * Usage:
 * node install_codebuddy_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// CodeBuddy CLI configuration paths
const CODEBUDDY_CONFIG_DIR = path.join(os.homedir(), '.codebuddy');
const CODEBUDDY_CONFIG_FILE = path.join(CODEBUDDY_CONFIG_DIR, 'buddy_config.json');

class CodeBuddyIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Create CodeBuddy configuration directory
   */
  async createCodeBuddyConfigDirectory() {
    try {
      await fs.mkdir(CODEBUDDY_CONFIG_DIR, { recursive: true });
      console.log(`[OK] Created CodeBuddy config directory: ${CODEBUDDY_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to create CodeBuddy config directory: ${error.message}`);
      return false;
    }
  }

  /**
   * Install CodeBuddy Skills configuration
   */
  async installCodeBuddySkills() {
    try {
      // Read existing buddy_config configuration
      let existingConfig = {};
      try {
        const data = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
        existingConfig = JSON.parse(data);
      } catch (error) {
        console.log(`[WARN] Failed to read existing buddy_config: ${error.message}`);
        existingConfig = {};
      }

      // Define cross-CLI collaboration Skills configuration
      const crossCliSkills = {
        cross_cli_skill: {
          name: 'CrossCLICoordinationSkill',
          description: 'Cross-CLI tool coordination skill',
          module: 'src.adapters.codebuddy.skills_hook_adapter',
          class: 'CodeBuddySkillsHookAdapter',
          enabled: true,
          priority: 100,
          triggers: [
            'on_skill_activation',
            'on_user_command'
          ],
          config: {
            cross_cli_enabled: true,
            supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'copilot'],
            auto_route: true,
            timeout: 30,
            collaboration_mode: 'active',
            resumesession_enabled: true,
            resumesession_integration: true
          }
        }
      };

      // Merge configurations (keep existing skills, add collaboration functionality)
      const mergedConfig = { ...existingConfig };
      if (!mergedConfig.skills || !Array.isArray(mergedConfig.skills)) {
        mergedConfig.skills = [];
      }

      // Check if cross-CLI coordination skill already exists
      const existingSkillNames = mergedConfig.skills.map(skill => skill.name);
      const crossCliSkillName = 'CrossCLICoordinationSkill';

      if (!existingSkillNames.includes(crossCliSkillName)) {
        mergedConfig.skills.push(crossCliSkills.cross_cli_skill);
      }

      // Write configuration file
      await fs.writeFile(CODEBUDDY_CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');

      console.log(`[OK] CodeBuddy configuration installed: ${CODEBUDDY_CONFIG_FILE}`);
      console.log('Installed Skills:');
      mergedConfig.skills.forEach(skill => {
        const status = skill.enabled ? '[OK]' : '[DISABLED]';
        console.log(`   - ${skill.name}: ${status}`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] Failed to install CodeBuddy configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * 复制适配器文件到CodeBuddy配置目录
   */
  async copyAdapterFile() {
    try {
      // 创建适配器目录
      await fs.mkdir(CODEBUDDY_CONFIG_DIR, { recursive: true });

      // 获取当前脚本目录
      const currentDir = __dirname;
      
      // 复制适配器文件
      const adapterFiles = [
        'skills_hook_adapter.js',
        'standalone_codebuddy_adapter.js'
      ];
      
      for (const fileName of adapterFiles) {
        const srcFile = path.join(currentDir, fileName);
        const dstFile = path.join(CODEBUDDY_CONFIG_DIR, fileName);

        try {
          await fs.access(srcFile);
          await fs.copyFile(srcFile, dstFile);
          console.log(`[OK] 复制适配器文件: ${fileName}`);
        } catch (error) {
          console.log(`[WARN] 适配器文件不存在: ${fileName}`);
          // 不强制要求适配器文件
        }
      }

      return true;
    } catch (error) {
      console.log(`[ERROR] 复制适配器文件失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 验证安装是否成功
   */
  async verifyInstallation() {
    console.log('\nVerifying CodeBuddy CLI integration installation...');

    try {
      // Check configuration file
      await fs.access(CODEBUDDY_CONFIG_FILE);
      
      // Check configuration file content
      const data = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);
      
      // Check if cross-CLI skill exists
      let skills = config.skills;
      if (!Array.isArray(skills)) {
        skills = [];
      }
      const crossCliSkillFound = skills.some(skill => skill.name === 'CrossCLICoordinationSkill');
      
      if (crossCliSkillFound) {
        console.log('[OK] Cross-CLI coordination skill installed');
      } else {
        console.log('[WARN] Cross-CLI coordination skill not found');
      }
        
      console.log('[OK] CodeBuddy configuration file verification passed');
      return true;
    } catch (error) {
      console.log(`[ERROR] Configuration file verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 卸载CodeBuddy集成
   */
  async uninstallIntegration() {
    try {
      // 从配置文件中移除跨CLI技能
      try {
        const data = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
        const config = JSON.parse(data);

        // 移除跨CLI技能
        let skills = config.skills || [];
        skills = skills.filter(skill => skill.name !== 'CrossCLICoordinationSkill');
        config.skills = skills;

        // 保存更新后的配置
        await fs.writeFile(CODEBUDDY_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

        console.log('[OK] 已从CodeBuddy配置中移除跨CLI协调技能');
      } catch (error) {
        console.log(`[WARN] 处理配置文件失败: ${error.message}`);
      }

      // 删除适配器文件
      const adapterFiles = [
        'skills_hook_adapter.js',
        'standalone_codebuddy_adapter.js'
      ];
      
      for (const fileName of adapterFiles) {
        const adapterFile = path.join(CODEBUDDY_CONFIG_DIR, fileName);
        try {
          await fs.unlink(adapterFile);
          console.log(`[OK] 已删除适配器文件: ${fileName}`);
        } catch (error) {
          // 文件可能不存在，忽略错误
        }
      }

      console.log('[OK] CodeBuddy CLI跨CLI集成已卸载');
      return true;
    } catch (error) {
      console.log(`[ERROR] 卸载失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建全局Cross-CLI通信文档
   */
  async createGlobalCrossCliDocumentation() {
    try {
      const docContent = `# CodeBuddy CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, use the following prompt<<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>>

Examples:
- Run in shell: stigmergy claude "Write a Python function"
- Run in shell: stigmergy gemini "Translate this text"
- Run in shell: stigmergy qwen "Analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;
      
      const docPath = path.join(CODEBUDDY_CONFIG_DIR, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent, 'utf8');
      console.log(`[OK] 创建Cross-CLI通信指南: ${docPath}`);
      
      // 如果存在codebuddy.md文件，则在末尾追加Cross-CLI通信提示
      const codebuddyMdPath = path.join(os.homedir(), '.codebuddy', 'codebuddy.md');
      try {
        await fs.access(codebuddyMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
When you need to call other AI tools, use the following prompt<<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>>

Examples:
- Run in shell: stigmergy claude "Write a Python function"
- Run in shell: stigmergy gemini "Translate this text"
- Run in shell: stigmergy qwen "Analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(codebuddyMdPath, crossCliContent, 'utf8');
        console.log('[OK] Append Cross-CLI communication prompt to CODEBUDDY.md');
      } catch (error) {
        // 文件可能不存在，忽略
      }

      return true;
    } catch (error) {
      console.log(`[WARN] 创建Cross-CLI通信指南失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 主安装流程
   */
  async install() {
    console.log('CodeBuddy CLI跨CLI集成安装程序');
    console.log('='.repeat(50));

    // 步骤1. 创建配置目录
    console.log('\n步骤1. 创建配置目录...');
    const configDirSuccess = await this.createCodeBuddyConfigDirectory();

    // 步骤2. 安装Skills配置
    console.log('\n步骤2. 安装Skills配置...');
    const skillsSuccess = await this.installCodeBuddySkills();

    // 步骤3. 复制适配器文件
    console.log('\n步骤3. 复制适配器文件...');
    const adapterSuccess = await this.copyAdapterFile();

    // 步骤4. 创建Cross-CLI通信指南
    console.log('\n步骤4. 创建Cross-CLI通信指南...');
    const guideSuccess = await this.createGlobalCrossCliDocumentation();

    // Step 5. Verify installation
    console.log('\nStep 5. Verifying installation...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && skillsSuccess && adapterSuccess && guideSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] Installation took: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] CodeBuddy CLI cross-CLI integration installed successfully!');
    } else {
      console.log('\n[WARNING] Warnings occurred during installation, please check above output');
    }

    return overallSuccess;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const verify = args.includes('--verify');
  const uninstall = args.includes('--uninstall');

  const installer = new CodeBuddyIntegrationInstaller();

  if (uninstall) {
    return await installer.uninstallIntegration();
  } else if (verify) {
    return await installer.verifyInstallation();
  } else {
    return await installer.install();
  }
}

// Export module
module.exports = CodeBuddyIntegrationInstaller;

// If running this script directly
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}