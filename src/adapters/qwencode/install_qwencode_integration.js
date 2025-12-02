#!/usr/bin/env node

/**
 * QwenCode CLI Inheritance集成安装脚本
 * 为QwenCode CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_qwencode_integration.js [--verify|--uninstall]
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

// QwenCode CLI配置路径
const QWENCODE_CONFIG_DIR = path.join(homedir(), '.config', 'qwencode');
const QWENCODE_CONFIG_FILE = path.join(QWENCODE_CONFIG_DIR, 'config.yml');

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

async function createQwenCodeConfigDirectory() {
    /** 创建QwenCode配置目录 */
    try {
        await fs.mkdir(QWENCODE_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建QwenCode配置目录: ${QWENCODE_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建QwenCode配置目录失败: ${error.message}`);
    }
}

async function installQwenCodePlugins() {
    /** 安装QwenCode Plugin配置 */
    // 读取现有config配置
    let existingConfig = {};
    try {
        const configExists = await fs.access(QWENCODE_CONFIG_FILE).then(() => true).catch(() => false);
        if (configExists) {
            const configContent = await fs.readFile(QWENCODE_CONFIG_FILE, 'utf8');
            existingConfig = yaml.load(configContent) || {};
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有config配置失败: ${error.message}`);
        existingConfig = {};
    }

    // 定义跨CLI协作的Plugin配置
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

    // 合并配置（保留现有配置，添加协作功能）
    const mergedConfig = { ...existingConfig };
    if (!mergedConfig.plugins) {
        mergedConfig.plugins = [];
    }

    // 检查是否已存在跨CLI插件
    const existingPlugins = mergedConfig.plugins || [];
    const crossCliPluginExists = existingPlugins.some(
        plugin => plugin.name === 'CrossCLIAdapterPlugin'
    );

    if (!crossCliPluginExists) {
        mergedConfig.plugins.push(crossCliPlugins.cross_cli_inheritance_adapter);
    }

    // 写入config配置文件
    try {
        const yamlContent = yaml.dump(mergedConfig, {
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
        });
        
        await fs.writeFile(QWENCODE_CONFIG_FILE, yamlContent, 'utf8');
        console.log(`[OK] QwenCode配置已安装: ${QWENCODE_CONFIG_FILE}`);
        console.log("🔗 已安装的Plugin:");
        
        for (const plugin of mergedConfig.plugins) {
            if (plugin.name === 'CrossCLIAdapterPlugin') {
                console.log(`   - ${plugin.name}: [OK] 跨CLI协作感知`);
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ 安装QwenCode配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到QwenCode配置目录 */
    try {
        // 创建适配器目录
        const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // 复制适配器文件
        const adapterFiles = [
            'inheritance_adapter.py'
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
    console.log('\n🔍 验证QwenCode CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(QWENCODE_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${QWENCODE_CONFIG_DIR}`);
        return false;
    }

    // 检查config文件
    try {
        await fs.access(QWENCODE_CONFIG_FILE);
    } catch (error) {
        console.error(`❌ Config配置文件不存在: ${QWENCODE_CONFIG_FILE}`);
        return false;
    }

    // 检查适配器目录
    const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ 适配器目录不存在: ${adapterDir}`);
        return false;
    }

    // 读取并验证config配置
    try {
        const configContent = await fs.readFile(QWENCODE_CONFIG_FILE, 'utf8');
        const config = yaml.load(configContent);

        // 检查关键plugin是否存在
        const plugins = config.plugins || [];
        const hasCrossCliPlugin = plugins.some(plugin => plugin.name === 'CrossCLIAdapterPlugin');
        
        if (!hasCrossCliPlugin) {
            console.warn('⚠️ 缺少跨CLI协作插件: CrossCLIAdapterPlugin');
        }

        console.log('[OK] QwenCode CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证config配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallQwenCodeIntegration() {
    /** 卸载QwenCode集成 */
    try {
        // 删除config配置
        try {
            await fs.unlink(QWENCODE_CONFIG_FILE);
            console.log(`[OK] 已删除QwenCode Config配置: ${QWENCODE_CONFIG_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除Config配置失败: ${error.message}`);
            }
        }

        // 删除适配器目录
        const adapterDir = path.join(QWENCODE_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] 已删除QwenCode适配器目录: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除适配器目录失败: ${error.message}`);
            }
        }

        console.log('[OK] QwenCode CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载QwenCode集成失败: ${error.message}`);
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

    console.log('QwenCode CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallQwenCodeIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createQwenCodeConfigDirectory();

        // 2. 安装Plugin配置
        const pluginSuccess = await installQwenCodePlugins();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = pluginSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 QwenCode CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${QWENCODE_CONFIG_DIR}`);
            console.log(`   [OK] Config文件: ${QWENCODE_CONFIG_FILE}`);
            console.log(`   [OK] 适配器目录: ${path.join(QWENCODE_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] 跨CLI协作Plugin: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ QwenCode CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_qwencode_integration.js [--install|--verify|--uninstall]');
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
    createQwenCodeConfigDirectory, 
    installQwenCodePlugins, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallQwenCodeIntegration 
};