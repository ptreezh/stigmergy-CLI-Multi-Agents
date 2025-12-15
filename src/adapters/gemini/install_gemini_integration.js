#!/usr/bin/env node

/**
 * Gemini CLI Extension集成安装脚本
 * 为Gemini CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_gemini_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Gemini CLI配置路径
const GEMINI_CONFIG_DIR = path.join(os.homedir(), '.config', 'gemini');
const GEMINI_EXTENSIONS_FILE = path.join(GEMINI_CONFIG_DIR, 'extensions.json');

class GeminiIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 创建Gemini配置目录
   */
  async createGeminiConfigDirectory() {
    try {
      await fs.mkdir(GEMINI_CONFIG_DIR, { recursive: true });
      console.log(`[OK] 创建Gemini配置目录: ${GEMINI_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] 创建Gemini配置目录失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 安装Gemini Extension配置
   */
  async installGeminiExtensions() {
    try {
      // 读取现有extensions配置
      let existingExtensions = {};
      try {
        const data = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
        existingExtensions = JSON.parse(data);
      } catch (error) {
        console.log(`[WARN] 读取现有extensions配置失败: ${error.message}`);
        existingExtensions = {};
      }

      // 定义跨CLI协作的Extension配置
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

      // 合并配置（保留现有配置，添加协作功能）
      const mergedExtensions = { ...existingExtensions, ...crossCliExtensions };

      // 写入extensions配置文件
      await fs.writeFile(GEMINI_EXTENSIONS_FILE, JSON.stringify(mergedExtensions, null, 2), 'utf8');
      
      console.log(`[OK] Gemini Extension配置已安装: ${GEMINI_EXTENSIONS_FILE}`);
      console.log('已安装的Extension:');
      Object.keys(crossCliExtensions).forEach(extName => {
        console.log(`   - ${extName}: [OK] 跨CLI协作感知`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] 安装Gemini Extension配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 复制适配器文件到Gemini配置目录
   */
  async copyAdapterFile() {
    try {
      // 创建适配器目录
      const adapterDir = path.join(GEMINI_CONFIG_DIR, 'adapters');
      await fs.mkdir(adapterDir, { recursive: true });

      // 获取当前脚本目录
      const currentDir = __dirname;
      const adapterSource = path.join(currentDir, 'extension_adapter.js');
      const adapterDest = path.join(adapterDir, 'extension_adapter.js');

      // 复制适配器文件
      try {
        await fs.access(adapterSource);
        await fs.copyFile(adapterSource, adapterDest);
        console.log(`[OK] 复制适配器文件: ${adapterDest}`);
      } catch (error) {
        console.log(`[WARN] 适配器源文件不存在: ${adapterSource}`);
        // 不强制要求适配器文件
      }

      return true;
    } catch (error) {
      console.log(`[WARN] 复制适配器文件失败: ${error.message}`);
      return true; // 不强制要求适配器文件
    }
  }

  /**
   * 验证安装
   */
  async verifyInstallation() {
    const checks = [
      { name: 'Gemini配置目录', path: GEMINI_CONFIG_DIR },
      { name: 'Gemini Extensions文件', path: GEMINI_EXTENSIONS_FILE }
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
   * 卸载集成
   */
  async uninstallIntegration() {
    try {
      // 删除extensions配置中的跨CLI适配器
      try {
        const data = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
        const extensionsConfig = JSON.parse(data);

        // 移除跨CLI适配器
        const extensionsToRemove = ['cross_cli_preprocessor', 'cross_cli_response_processor'];
        let removedCount = 0;
        
        extensionsToRemove.forEach(extName => {
          if (extName in extensionsConfig) {
            delete extensionsConfig[extName];
            removedCount++;
          }
        });

        // 保存更新后的配置
        if (removedCount > 0) {
          await fs.writeFile(GEMINI_EXTENSIONS_FILE, JSON.stringify(extensionsConfig, null, 2), 'utf8');
          console.log(`[OK] 已从Gemini Extensions配置中移除${removedCount}个跨CLI适配器`);
        }
      } catch (error) {
        console.log(`[WARN] 处理extensions配置失败: ${error.message}`);
      }

      // 删除适配器文件
      try {
        const adapterFile = path.join(GEMINI_CONFIG_DIR, 'adapters', 'extension_adapter.js');
        await fs.unlink(adapterFile);
        console.log('[OK] 已删除Gemini适配器文件');
      } catch (error) {
        // 文件可能不存在，忽略错误
      }

      console.log('[OK] Gemini CLI跨CLI集成已卸载');
      return true;
    } catch (error) {
      console.log(`[ERROR] 卸载失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建Cross-CLI通信指南
   */
  async createCrossCliGuide() {
    try {
      const guideContent = `# Gemini CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy qwen "translate this text"
- Run in shell: stigmergy iflow "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;

      const guidePath = path.join(GEMINI_CONFIG_DIR, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(guidePath, guideContent, 'utf8');
      console.log(`[OK] 创建Cross-CLI通信指南: ${guidePath}`);
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
    console.log('Gemini CLI跨CLI集成安装程序');
    console.log('='.repeat(50));

    // 步骤1. 创建配置目录
    console.log('\n步骤1. 创建配置目录...');
    const configDirSuccess = await this.createGeminiConfigDirectory();

    // 步骤2. 安装Extension配置
    console.log('\n步骤2. 安装Extension配置...');
    const extensionsSuccess = await this.installGeminiExtensions();

    // 步骤3. 复制适配器文件
    console.log('\n步骤3. 复制适配器文件...');
    const adapterSuccess = await this.copyAdapterFile();

    // 步骤4. 创建Cross-CLI通信指南
    console.log('\n步骤4. 创建Cross-CLI通信指南...');
    const guideSuccess = await this.createCrossCliGuide();

    // 步骤5. 验证安装
    console.log('\n步骤5. 验证安装...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && extensionsSuccess && adapterSuccess && guideSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] 安装耗时: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] Gemini CLI跨CLI集成安装成功!');
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