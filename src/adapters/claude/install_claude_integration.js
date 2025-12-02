#!/usr/bin/env node

/**
 * Claude CLI Hook集成安装脚本
 * 为Claude CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_claude_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// Claude CLI配置路径
const CLAUDE_CONFIG_DIR = path.join(homedir(), '.config', 'claude');
const CLAUDE_HOOKS_FILE = path.join(CLAUDE_CONFIG_DIR, 'hooks.json');

async function createClaudeConfigDirectory() {
    /** 创建Claude配置目录 */
    try {
        await fs.mkdir(CLAUDE_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建Claude配置目录: ${CLAUDE_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建Claude配置目录失败: ${error.message}`);
    }
}

async function installClaudeHooks() {
    /** 安装Claude Hook配置 */
    // 读取现有hooks配置
    let existingHooks = {};
    try {
        const hooksExists = await fs.access(CLAUDE_HOOKS_FILE).then(() => true).catch(() => false);
        if (hooksExists) {
            const hooksContent = await fs.readFile(CLAUDE_HOOKS_FILE, 'utf8');
            existingHooks = JSON.parse(hooksContent);
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有hooks配置失败: ${error.message}`);
        existingHooks = {};
    }

    // 定义跨CLI协作的Hook配置
    const crossCliHooks = {
        "user_prompt_submit": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": true,
            "priority": 100,
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": true,
                "timeout": 30
            }
        },
        "tool_use_pre": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": true,
            "priority": 90,
            "config": {
                "cross_cli_enabled": true,
                "log_requests": true
            }
        },
        "response_generated": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": true,
            "priority": 85,
            "config": {
                "add_collaboration_header": true,
                "format_cross_cli_results": true
            }
        }
    };

    // 合并配置（保留现有配置，添加协作功能）
    const mergedHooks = { ...existingHooks };
    Object.assign(mergedHooks, crossCliHooks);

    // 写入hooks配置文件
    try {
        await fs.writeFile(CLAUDE_HOOKS_FILE, JSON.stringify(mergedHooks, null, 2), 'utf8');
        console.log(`[OK] Claude Hook配置已安装: ${CLAUDE_HOOKS_FILE}`);
        console.log("🔗 已安装的Hook:");
        for (const hookName in crossCliHooks) {
            console.log(`   - ${hookName}: [OK] 跨CLI协作感知`);
        }
        return true;
    } catch (error) {
        console.error(`❌ 安装Claude Hook配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到Claude配置目录 */
    try {
        // 创建适配器目录
        const adapterDir = path.join(CLAUDE_CONFIG_DIR, 'adapters');
        await fs.mkdir(adapterDir, { recursive: true });

        // 复制适配器文件
        const adapterFiles = [
            'hook_adapter.py',
            'claude_skills_integration.py',
            'skills_hook_adapter.py'
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
    console.log('\n🔍 验证Claude CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(CLAUDE_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${CLAUDE_CONFIG_DIR}`);
        return false;
    }

    // 检查hooks文件
    try {
        await fs.access(CLAUDE_HOOKS_FILE);
    } catch (error) {
        console.error(`❌ Hooks配置文件不存在: ${CLAUDE_HOOKS_FILE}`);
        return false;
    }

    // 检查适配器目录
    const adapterDir = path.join(CLAUDE_CONFIG_DIR, 'adapters');
    try {
        await fs.access(adapterDir);
    } catch (error) {
        console.error(`❌ 适配器目录不存在: ${adapterDir}`);
        return false;
    }

    // 读取并验证hooks配置
    try {
        const hooksContent = await fs.readFile(CLAUDE_HOOKS_FILE, 'utf8');
        const hooks = JSON.parse(hooksContent);

        // 检查关键hook是否存在
        const requiredHooks = ['user_prompt_submit', 'tool_use_pre', 'response_generated'];
        for (const hookName of requiredHooks) {
            if (!hooks[hookName]) {
                console.warn(`⚠️ 缺少必要Hook: ${hookName}`);
            }
        }

        console.log('[OK] Claude CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证hooks配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallClaudeIntegration() {
    /** 卸载Claude集成 */
    try {
        // 删除hooks配置
        try {
            await fs.unlink(CLAUDE_HOOKS_FILE);
            console.log(`[OK] 已删除Claude Hooks配置: ${CLAUDE_HOOKS_FILE}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除Hooks配置失败: ${error.message}`);
            }
        }

        // 删除适配器目录
        const adapterDir = path.join(CLAUDE_CONFIG_DIR, 'adapters');
        try {
            await fs.rm(adapterDir, { recursive: true, force: true });
            console.log(`[OK] 已删除Claude适配器目录: ${adapterDir}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`⚠️ 删除适配器目录失败: ${error.message}`);
            }
        }

        console.log('[OK] Claude CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载Claude集成失败: ${error.message}`);
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

    console.log('Claude CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallClaudeIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createClaudeConfigDirectory();

        // 2. 安装Hook配置
        const hookSuccess = await installClaudeHooks();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = hookSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 Claude CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${CLAUDE_CONFIG_DIR}`);
            console.log(`   [OK] Hooks文件: ${CLAUDE_HOOKS_FILE}`);
            console.log(`   [OK] 适配器目录: ${path.join(CLAUDE_CONFIG_DIR, 'adapters')}`);
            console.log(`   [OK] 跨CLI协作Hook: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ Claude CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_claude_integration.js [--install|--verify|--uninstall]');
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
    createClaudeConfigDirectory, 
    installClaudeHooks, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallClaudeIntegration 
};