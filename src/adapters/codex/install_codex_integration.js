#!/usr/bin/env node

/**
 * Codex CLI Slash Command集成安装脚本
 * 为Codex CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_codex_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// Codex CLI配置路径
const CODEX_CONFIG_DIR = path.join(homedir(), '.config', 'codex');
const CODEX_SLASH_COMMANDS_FILE = path.join(CODEX_CONFIG_DIR, 'slash_commands.json');

async function createCodexConfigDirectory() {
    /** 创建Codex配置目录 */
    try {
        await fs.mkdir(CODEX_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建Codex配置目录: ${CODEX_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建Codex配置目录失败: ${error.message}`);
    }
}

async function installCodexSlashCommands() {
    /** 安装Codex Slash Command配置 */
    // 读取现有slash_commands配置
    let existingConfig = {};
    try {
        const configExists = await fs.access(CODEX_SLASH_COMMANDS_FILE).then(() => true).catch(() => false);
        if (configExists) {
            const configContent = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
            existingConfig = JSON.parse(configContent);
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有slash_commands配置失败: ${error.message}`);
        existingConfig = {};
    }

    // 定义跨CLI协作的Slash Command配置
    const crossCliSlashCommands = {
        "init": {
            "command": "init",
            "description": "初始化跨CLI协作项目",
            "module": "src.core.enhanced_init_processor",
            "enabled": true,
            "cross_cli_enabled": true,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "scan": {
            "command": "scan",
            "description": "扫描AI环境中的CLI工具",
            "module": "src.core.ai_environment_scanner",
            "enabled": true,
            "cross_cli_enabled": true,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "status": {
            "command": "status",
            "description": "查看所有CLI工具的状态",
            "module": "src.core.cli_hook_integration",
            "enabled": true,
            "cross_cli_enabled": true,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "deploy": {
            "command": "deploy",
            "description": "部署所有CLI工具的协作插件",
            "module": "src.core.cli_hook_integration",
            "enabled": true,
            "cross_cli_enabled": true,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "call": {
            "command": "call",
            "description": "调用其他CLI工具执行任务",
            "module": "src.core.cli_hook_integration",
            "enabled": true,
            "cross_cli_enabled": true,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        }
    };

    // 合并配置（保留现有slash_commands，添加协作功能）
    const mergedConfig = { ...existingConfig };
    if (!mergedConfig.slash_commands) {
        mergedConfig.slash_commands = {};
    }

    // 检查是否已存在跨CLI协作命令
    const existingCommandNames = Object.values(mergedConfig.slash_commands)
        .map(cmd => cmd.command || '')
        .filter(name => name);
    
    const crossCliCommands = ["init", "scan", "status", "deploy", "call"];

    // 添加跨CLI协作Slash Commands（如果不存在）
    for (const [cmdName, cmdConfig] of Object.entries(crossCliSlashCommands)) {
        if (!existingCommandNames.includes(cmdName)) {
            mergedConfig.slash_commands[cmdName] = cmdConfig;
        }
    }

    // 写入配置文件
    try {
        await fs.writeFile(CODEX_SLASH_COMMANDS_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');
        console.log(`[OK] Codex Slash Command配置已安装: ${CODEX_SLASH_COMMANDS_FILE}`);
        console.log("🔗 已安装的Slash Commands:");
        
        for (const [cmdName, cmdConfig] of Object.entries(mergedConfig.slash_commands)) {
            const status = cmdConfig.enabled ? "[OK]" : "❌";
            console.log(`   - /${cmdName}: ${status} ${cmdConfig.description}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ 安装Codex Slash Command配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到Codex配置目录 */
    try {
        // 创建适配器目录
        await fs.mkdir(CODEX_CONFIG_DIR, { recursive: true });

        // 复制适配器文件
        const adapterFiles = [
            'mcp_server.py'
        ];

        for (const fileName of adapterFiles) {
            const srcFile = path.join(__dirname, fileName);
            const dstFile = path.join(CODEX_CONFIG_DIR, fileName);

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
    console.log('\n🔍 验证Codex CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(CODEX_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${CODEX_CONFIG_DIR}`);
        return false;
    }

    // 检查slash_commands文件
    try {
        await fs.access(CODEX_SLASH_COMMANDS_FILE);
    } catch (error) {
        console.error(`❌ Slash Commands配置文件不存在: ${CODEX_SLASH_COMMANDS_FILE}`);
        return false;
    }

    // 读取并验证配置
    try {
        const configContent = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // 检查关键命令是否存在
        const slashCommands = config.slash_commands || {};
        const requiredCommands = ["init", "scan", "status", "deploy", "call"];
        const missingCommands = requiredCommands.filter(cmd => !slashCommands[cmd]);
        
        if (missingCommands.length > 0) {
            console.warn(`⚠️ 缺少必要命令: ${missingCommands.join(', ')}`);
        }

        console.log('[OK] Codex CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallCodexIntegration() {
    /** 卸载Codex集成 */
    try {
        // 检查slash_commands文件
        const configExists = await fs.access(CODEX_SLASH_COMMANDS_FILE).then(() => true).catch(() => false);
        if (!configExists) {
            console.warn('⚠️ Slash Commands配置文件不存在');
            return true;
        }

        // 读取配置文件
        const configContent = await fs.readFile(CODEX_SLASH_COMMANDS_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // 移除跨CLI协作命令
        const slashCommands = config.slash_commands || {};
        const crossCliCommands = ["init", "scan", "status", "deploy", "call"];
        
        for (const cmdName of crossCliCommands) {
            delete slashCommands[cmdName];
        }
        
        config.slash_commands = slashCommands;

        // 写入更新后的配置
        await fs.writeFile(CODEX_SLASH_COMMANDS_FILE, JSON.stringify(config, null, 2), 'utf8');

        console.log('[OK] Codex CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载Codex集成失败: ${error.message}`);
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

    console.log('Codex CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallCodexIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createCodexConfigDirectory();

        // 2. 安装Slash Command配置
        const commandSuccess = await installCodexSlashCommands();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = commandSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 Codex CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${CODEX_CONFIG_DIR}`);
            console.log(`   [OK] Slash Commands文件: ${CODEX_SLASH_COMMANDS_FILE}`);
            console.log(`   [OK] 跨CLI协作命令: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ Codex CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_codex_integration.js [--install|--verify|--uninstall]');
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
    createCodexConfigDirectory, 
    installCodexSlashCommands, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallCodexIntegration 
};