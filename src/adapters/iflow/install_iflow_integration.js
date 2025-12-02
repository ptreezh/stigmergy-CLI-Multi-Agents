#!/usr/bin/env node

/**
 * iFlow CLI Hook集成安装脚本
 * 为iFlow CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_iflow_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { execSync } from 'child_process';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// iFlow CLI配置路径
const IFLOW_CONFIG_DIR = path.join(homedir(), '.config', 'iflow');
const IFLOW_HOOKS_FILE = path.join(IFLOW_CONFIG_DIR, 'hooks.yml');

// 检查是否安装了yaml库
let yaml;
try {
    yaml = await import('js-yaml');
} catch (error) {
    console.warn('⚠️ 未找到js-yaml库，将尝试安装...');
    try {
        execSync('npm install js-yaml', { stdio: 'inherit' });
        yaml = await import('js-yaml');
        console.log('[OK] js-yaml库安装成功');
    } catch (installError) {
        console.error('❌ 无法安装js-yaml库，请手动安装: npm install js-yaml');
        process.exit(1);
    }
}

async function createIFlowConfigDirectory() {
    /** 创建iFlow配置目录 */
    try {
        await fs.mkdir(IFLOW_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建iFlow配置目录: ${IFLOW_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建iFlow配置目录失败: ${error.message}`);
    }
}

async function installIFlowHooks() {
    /** 安装iFlow Hook配置 */
    // 读取现有hooks配置
    let existingHooks = {};
    try {
        const hooksExists = await fs.access(IFLOW_HOOKS_FILE).then(() => true).catch(() => false);
        if (hooksExists) {
            const hooksContent = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
            existingHooks = yaml.load(hooksContent) || {};
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有hooks配置失败: ${error.message}`);
        existingHooks = {};
    }

    // 定义跨CLI协作的Hook配置
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

    // 合并配置（保留现有hooks，添加协作功能）
    const mergedHooks = { ...existingHooks };
    if (!mergedHooks.plugins) {
        mergedHooks.plugins = [];
    }

    // 检查是否已存在跨CLI Hook
    const existingPluginNames = mergedHooks.plugins.map(plugin => plugin.name || '');
    const crossCliHookExists = existingPluginNames.includes('CrossCLIHookAdapter');

    if (!crossCliHookExists) {
        mergedHooks.plugins.push(crossCliHooks.cross_cli_hook_adapter);
    }

    // 写入hooks配置文件
    try {
        const yamlContent = yaml.dump(mergedHooks, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
        });
        
        await fs.writeFile(IFLOW_HOOKS_FILE, yamlContent, 'utf8');
        console.log(`[OK] iFlow Hook配置已安装: ${IFLOW_HOOKS_FILE}`);
        console.log("🔗 已安装的Hook:");
        
        for (const plugin of mergedHooks.plugins) {
            if (plugin.name === 'CrossCLIHookAdapter') {
                console.log(`   - ${plugin.name}: [OK] 跨CLI协作感知`);
                console.log(`     支持的CLI: ${plugin.config.supported_clis.join(', ')}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ 安装iFlow Hook配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到iFlow配置目录 */
    try {
        // 创建适配器目录
        const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // 复制适配器文件
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
                console.log(`[OK] 复制适配器文件: ${fileName}`);
            } catch (error) {
                console.warn(`⚠️ 适配器文件不存在: ${fileName}`);
            }
        }

        return true;
    } catch (error) {
        console.error(`❌ 复制适配器文件失败: ${error.message}`);
        return false;
    }
}

async function verifyInstallation() {
    /** 验证安装是否成功 */
    console.log('\n🔍 验证iFlow CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(IFLOW_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${IFLOW_CONFIG_DIR}`);
        return false;
    }

    // 检查hooks文件
    try {
        await fs.access(IFLOW_HOOKS_FILE);
    } catch (error) {
        console.error(`❌ Hooks配置文件不存在: ${IFLOW_HOOKS_FILE}`);
        return false;
    }

    // 检查适配器目录
    const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ 适配器目录不存在: ${adapterDir}`);
        return false;
    }

    // 读取并验证hooks配置
    try {
        const hooksContent = await fs.readFile(IFLOW_HOOKS_FILE, 'utf8');
        const hooks = yaml.load(hooksContent);

        // 检查关键plugin是否存在
        const plugins = hooks.plugins || [];
        const hasCrossCliPlugin = plugins.some(plugin => plugin.name === 'CrossCLIHookAdapter');
        
        if (!hasCrossCliPlugin) {
            console.warn('⚠️ 缺少跨CLI协作插件: CrossCLIHookAdapter');
        }

        console.log('[OK] iFlow CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证hooks配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallIFlowIntegration() {
    /** 卸载iFlow集成 */
    try {
        // 删除hooks配置
        try {
            await fs.unlink(IFLOW_HOOKS_FILE);
            console.log(`[OK] 已删除iFlow Hooks配置: ${IFLOW_HOOKS_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除Hooks配置失败: ${error.message}`);
            }
        }

        // 删除适配器目录
        const adapterDir = path.join(IFLOW_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] 已删除iFlow适配器目录: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除适配器目录失败: ${error.message}`);
            }
        }

        console.log('[OK] iFlow CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载iFlow集成失败: ${error.message}`);
        return false;
    }
}

async function main() {
    /** 主函数 */
    const args = process.argv.slice(2);
    const options = {
        verify: args.includes('--verify'),
        uninstall: args.includes('--uninstall'),
        install: args.includes('--install') || args.length === 0
    };

    console.log('iFlow CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallIFlowIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createIFlowConfigDirectory();

        // 2. 安装Hook配置
        const hookSuccess = await installIFlowHooks();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = hookSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 iFlow CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${IFLOW_CONFIG_DIR}`);
            console.log(`   [OK] Hooks文件: ${IFLOW_HOOKS_FILE}`);
            console.log(`   [OK] 适配器目录: ${path.join(IFLOW_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] 跨CLI协作Hook: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ iFlow CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_iflow_integration.js [--install|--verify|--uninstall]');
        console.log('  默认为安装模式');
    }
}

// 运行主函数
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