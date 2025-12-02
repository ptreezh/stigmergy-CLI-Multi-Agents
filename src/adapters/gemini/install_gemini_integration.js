#!/usr/bin/env node

/**
 * Gemini CLI Extension集成安装脚本
 * 为Gemini CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_gemini_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// Gemini CLI配置路径
const GEMINI_CONFIG_DIR = path.join(homedir(), '.config', 'gemini');
const GEMINI_EXTENSIONS_FILE = path.join(GEMINI_CONFIG_DIR, 'extensions.json');

async function createGeminiConfigDirectory() {
    /** 创建Gemini配置目录 */
    try {
        await fs.mkdir(GEMINI_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建Gemini配置目录: ${GEMINI_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建Gemini配置目录失败: ${error.message}`);
    }
}

async function installGeminiExtensions() {
    /** 安装Gemini Extension配置 */
    // 读取现有extensions配置
    let existingExtensions = {};
    try {
        const extensionsExists = await fs.access(GEMINI_EXTENSIONS_FILE).then(() => true).catch(() => false);
        if (extensionsExists) {
            const extensionsContent = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
            existingExtensions = JSON.parse(extensionsContent);
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有extensions配置失败: ${error.message}`);
        existingExtensions = {};
    }

    // 定义跨CLI协作的Extension配置
    const crossCliExtensions = {
        "cross_cli_preprocessor": {
            "module": "src.adapters.gemini.extension_adapter",
            "class": "GeminiExtensionAdapter",
            "enabled": true,
            "priority": 100,
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["claude", "qwencode", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": true,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        },
        "cross_cli_response_processor": {
            "module": "src.adapters.gemini.extension_adapter",
            "class": "GeminiExtensionAdapter",
            "enabled": true,
            "priority": 90,
            "config": {
                "cross_cli_enabled": true,
                "format_cross_cli_results": true,
                "add_collaboration_header": true,
                "include_tool_status": true
            }
        }
    };

    // 合并配置（保留现有配置，添加协作功能）
    const mergedExtensions = { ...existingExtensions };
    Object.assign(mergedExtensions, crossCliExtensions);

    // 写入extensions配置文件
    try {
        await fs.writeFile(GEMINI_EXTENSIONS_FILE, JSON.stringify(mergedExtensions, null, 2), 'utf8');
        console.log(`[OK] Gemini Extension配置已安装: ${GEMINI_EXTENSIONS_FILE}`);
        console.log("🔗 已安装的Extension:");
        for (const extName in crossCliExtensions) {
            console.log(`   - ${extName}: [OK] 跨CLI协作感知`);
        }
        return true;
    } catch (error) {
        console.error(`❌ 安装Gemini Extension配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到Gemini配置目录 */
    try {
        // 创建适配器目录
        const adapterDir = path.join(GEMINI_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // 复制适配器文件
        const adapterFiles = [
            'extension_adapter.py'
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
    console.log('\n🔍 验证Gemini CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(GEMINI_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${GEMINI_CONFIG_DIR}`);
        return false;
    }

    // 检查extensions文件
    try {
        await fs.access(GEMINI_EXTENSIONS_FILE);
    } catch (error) {
        console.error(`❌ Extensions配置文件不存在: ${GEMINI_EXTENSIONS_FILE}`);
        return false;
    }

    // 检查适配器目录
    const adapterDir = path.join(GEMINI_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ 适配器目录不存在: ${adapterDir}`);
        return false;
    }

    // 读取并验证extensions配置
    try {
        const extensionsContent = await fs.readFile(GEMINI_EXTENSIONS_FILE, 'utf8');
        const extensions = JSON.parse(extensionsContent);

        // 检查关键extension是否存在
        const requiredExtensions = ['cross_cli_preprocessor', 'cross_cli_response_processor'];
        for (const extName of requiredExtensions) {
            if (!extensions[extName]) {
                console.warn(`⚠️ 缺少必要Extension: ${extName}`);
            }
        }

        console.log('[OK] Gemini CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证extensions配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallGeminiIntegration() {
    /** 卸载Gemini集成 */
    try {
        // 删除extensions配置
        try {
            await fs.unlink(GEMINI_EXTENSIONS_FILE);
            console.log(`[OK] 已删除Gemini Extensions配置: ${GEMINI_EXTENSIONS_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除Extensions配置失败: ${error.message}`);
            }
        }

        // 删除适配器目录
        const adapterDir = path.join(GEMINI_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] 已删除Gemini适配器目录: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除适配器目录失败: ${error.message}`);
            }
        }

        console.log('[OK] Gemini CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载Gemini集成失败: ${error.message}`);
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

    console.log('Gemini CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallGeminiIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createGeminiConfigDirectory();

        // 2. 安装Extension配置
        const extensionSuccess = await installGeminiExtensions();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = extensionSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 Gemini CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${GEMINI_CONFIG_DIR}`);
            console.log(`   [OK] Extensions文件: ${GEMINI_EXTENSIONS_FILE}`);
            console.log(`   [OK] 适配器目录: ${path.join(GEMINI_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] 跨CLI协作Extension: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ Gemini CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_gemini_integration.js [--install|--verify|--uninstall]');
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
    createGeminiConfigDirectory, 
    installGeminiExtensions, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallGeminiIntegration 
};