#!/usr/bin/env node

/**
 * CodeBuddy CLI Skills集成安装脚本
 * 为CodeBuddy CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_codebuddy_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// CodeBuddy CLI配置路径
const CODEBUDDY_CONFIG_DIR = path.join(os.homedir(), '.codebuddy');
const CODEBUDDY_CONFIG_FILE = path.join(CODEBUDDY_CONFIG_DIR, 'buddy_config.json');

class CodeBuddyIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 创建CodeBuddy配置目录
   */
  async createCodeBuddyConfigDirectory() {
    try {
      await fs.mkdir(CODEBUDDY_CONFIG_DIR, { recursive: true });
      console.log(`[OK] 创建CodeBuddy配置目录: ${CODEBUDDY_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] 创建CodeBuddy配置目录失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 安装CodeBuddy Skills配置
   */
  async installCodeBuddySkills() {
    try {
      // 读取现有buddy_config配置
      let existingConfig = {};
      try {
        const data = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
        existingConfig = JSON.parse(data);
      } catch (error) {
        console.log(`[WARN] 读取现有buddy_config配置失败: ${error.message}`);
        existingConfig = {};
      }

      // 定义跨CLI协作的Skills配置
      const crossCliSkills = {
        cross_cli_skill: {
          name: 'CrossCLICoordinationSkill',
          description: 'Cross-CLI工具协调技能',
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
            collaboration_mode: 'active'
          }
        }
      };

      // 合并配置（保留现有skills，添加协作功能）
      const mergedConfig = { ...existingConfig };
      if (!mergedConfig.skills) {
        mergedConfig.skills = [];
      }

      // 检查是否已存在跨CLI协调技能
      const existingSkillNames = mergedConfig.skills.map(skill => skill.name);
      const crossCliSkillName = 'CrossCLICoordinationSkill';

      if (!existingSkillNames.includes(crossCliSkillName)) {
        mergedConfig.skills.push(crossCliSkills.cross_cli_skill);
      }

      // 写入配置文件
      await fs.writeFile(CODEBUDDY_CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');

      console.log(`[OK] CodeBuddy配置已安装: ${CODEBUDDY_CONFIG_FILE}`);
      console.log('已安装的Skills:');
      mergedConfig.skills.forEach(skill => {
        const status = skill.enabled ? '[OK]' : '[DISABLED]';
        console.log(`   - ${skill.name}: ${status}`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] 安装CodeBuddy配置失败: ${error.message}`);
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
    console.log('\n验证CodeBuddy CLI集成安装...');

    try {
      // 检查配置文件
      await fs.access(CODEBUDDY_CONFIG_FILE);
      
      // 检查配置文件内容
      const data = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
      const config = JSON.parse(data);
      
      // 检查是否存在跨CLI技能
      const skills = config.skills || [];
      const crossCliSkillFound = skills.some(skill => skill.name === 'CrossCLICoordinationSkill');
      
      if (crossCliSkillFound) {
        console.log('[OK] 跨CLI协调技能已安装');
      } else {
        console.log('[WARN] 未找到跨CLI协调技能');
      }
        
      console.log('[OK] CodeBuddy配置文件验证通过');
      return true;
    } catch (error) {
      console.log(`[ERROR] 配置文件验证失败: ${error.message}`);
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
      const docContent = `# CodeBuddy CLI 跨CLI通信指南

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*本文档由Stigmergy CLI自动生成和维护*
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
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(codebuddyMdPath, crossCliContent, 'utf8');
        console.log('[OK] 在CODEBUDDY.md末尾追加Cross-CLI通信提示');
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

    // 步骤5. 验证安装
    console.log('\n步骤5. 验证安装...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && skillsSuccess && adapterSuccess && guideSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] 安装耗时: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] CodeBuddy CLI跨CLI集成安装成功!');
    } else {
      console.log('\n[WARNING] 安装过程中出现警告，请检查上述输出');
    }

    return overallSuccess;
  }
}

// 主函数
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

// 导出模块
module.exports = CodeBuddyIntegrationInstaller;

// 如果直接运行此脚本
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}