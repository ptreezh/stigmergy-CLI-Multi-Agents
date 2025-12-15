#!/usr/bin/env node

/**
 * iFlow CLI Hook适配器安装脚本
 * 为iFlow CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_iflow_integration.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

// iFlow CLI配置路径
const IFLOW_CONFIG_DIR = path.join(os.homedir(), '.config', 'iflow');
const IFLOW_HOOKS_FILE = path.join(IFLOW_CONFIG_DIR, 'hooks.yml');

class IFlowIntegrationInstaller {
  constructor() {
    this.startTime = Date.now();
  }

  /**
   * 创建iFlow配置目录
   */
  async createIFlowConfigDirectory() {
    try {
      await fs.mkdir(IFLOW_CONFIG_DIR, { recursive: true });
      console.log(`[OK] 创建iFlow配置目录: ${IFLOW_CONFIG_DIR}`);
      return true;
    } catch (error) {
      console.log(`[ERROR] 创建iFlow配置目录失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 安装iFlow Hook配置
   */
  async installIFlowHooks() {
    try {
      // 读取现有hooks配置
      let existingHooks = {};
      try {
        const data = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        existingHooks = yaml.load(data) || {};
      } catch (error) {
        console.log(`[WARN] 读取现有hooks配置失败: ${error.message}`);
        existingHooks = {};
      }

      // 定义跨CLI协作的Hook配置
      const crossCliHooks = {
        cross_cli_adapter: {
          module: 'src.adapters.iflow.hook_adapter',
          class: 'IFlowHookAdapter',
          enabled: true,
          priority: 100,
          events: ['workflow_start', 'task_execute', 'pipeline_complete', 'user_input']
        }
      };

      // 合并配置（保留现有配置，添加协作功能）
      const mergedHooks = { ...existingHooks, ...crossCliHooks };

      // 写入hooks配置文件
      const yamlContent = yaml.dump(mergedHooks, { indent: 2, lineWidth: 120, noRefs: true });
      await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');

      console.log(`[OK] iFlow Hook配置已安装: ${IFLOW_HOOKS_FILE}`);
      console.log('已安装的Hook:');
      Object.keys(crossCliHooks).forEach(hookName => {
        console.log(`   - ${hookName}: [OK] 跨CLI协作感知`);
      });

      return true;
    } catch (error) {
      console.log(`[ERROR] 安装iFlow Hook配置失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 复制适配器文件到iFlow配置目录
   */
  async copyAdapterFile() {
    try {
      // 创建适配器目录
      const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
      await fs.mkdir(adapterDir, { recursive: true });

      // 获取当前脚本目录
      const currentDir = __dirname;
      const adapterSource = path.join(currentDir, 'hook_adapter.js');
      const adapterDest = path.join(adapterDir, 'hook_adapter.js');

      // 复制适配器文件
      try {
        await fs.access(adapterSource);
        await fs.copyFile(adapterSource, adapterDest);
        console.log(`[OK] 复制适配器文件: ${adapterDest}`);
      } catch (error) {
        console.log(`[ERROR] 适配器源文件不存在: ${adapterSource}`);
        return false;
      }

      // 创建全局Cross-CLI文档
      await this.createGlobalCrossCliDocumentation(IFLOW_CONFIG_DIR);

      return true;
    } catch (error) {
      console.log(`[ERROR] 复制适配器文件失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建全局Cross-CLI通信文档
   */
  async createGlobalCrossCliDocumentation(configDir) {
    try {
      const docContent = `# iFlow CLI 跨CLI通信指南

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

      const docPath = path.join(configDir, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent, 'utf8');
      console.log(`[OK] 创建Cross-CLI通信指南: ${docPath}`);

      // 如果存在iflow.md文件，则在末尾追加Cross-CLI通信提示
      const iflowMdPath = path.join(os.homedir(), '.iflow', 'iflow.md');
      try {
        await fs.access(iflowMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(iflowMdPath, crossCliContent, 'utf8');
        console.log('[OK] 在IFLOW.md末尾追加Cross-CLI通信提示');
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
   * 验证安装
   */
  async verifyInstallation() {
    const checks = [
      { name: 'iFlow配置目录', path: IFLOW_CONFIG_DIR },
      { name: 'iFlow Hooks文件', path: IFLOW_HOOKS_FILE }
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
      // 删除hooks配置中的跨CLI适配器
      try {
        const data = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        const hooksConfig = yaml.load(data) || {};

        // 移除跨CLI适配器
        if ('cross_cli_adapter' in hooksConfig) {
          delete hooksConfig['cross_cli_adapter'];
          
          // 保存更新后的配置
          const yamlContent = yaml.dump(hooksConfig, { indent: 2, lineWidth: 120, noRefs: true });
          await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');
          
          console.log('[OK] 已从iFlow Hooks配置中移除跨CLI适配器');
        }
      } catch (error) {
        console.log(`[WARN] 处理hooks配置失败: ${error.message}`);
      }

      // 删除适配器文件
      try {
        const adapterFile = path.join(IFLOW_CONFIG_DIR, 'adapters', 'hook_adapter.js');
        await fs.unlink(adapterFile);
        console.log('[OK] 已删除iFlow适配器文件');
      } catch (error) {
        // 文件可能不存在，忽略错误
      }

      console.log('[OK] iFlow CLI跨CLI集成已卸载');
      return true;
    } catch (error) {
      console.log(`[ERROR] 卸载失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 主安装流程
   */
  async install() {
    console.log('iFlow CLI跨CLI集成安装程序');
    console.log('='.repeat(50));

    // 步骤1. 创建配置目录
    console.log('\n步骤1. 创建配置目录...');
    const configDirSuccess = await this.createIFlowConfigDirectory();

    // 步骤2. 安装Hook配置
    console.log('\n步骤2. 安装Hook配置...');
    const hooksSuccess = await this.installIFlowHooks();

    // 步骤3. 复制适配器文件
    console.log('\n步骤3. 复制适配器文件...');
    const adapterSuccess = await this.copyAdapterFile();

    // 步骤4. 验证安装
    console.log('\n步骤4. 验证安装...');
    const verificationSuccess = await this.verifyInstallation();

    const overallSuccess = configDirSuccess && hooksSuccess && adapterSuccess && verificationSuccess;
    
    const duration = Date.now() - this.startTime;
    console.log(`\n[INFO] 安装耗时: ${duration}ms`);
    
    if (overallSuccess) {
      console.log('\n[SUCCESS] iFlow CLI跨CLI集成安装成功!');
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