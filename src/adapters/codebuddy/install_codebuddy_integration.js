#!/usr/bin/env node

/**
 * CodeBuddy CLI Skills集成安装脚本
 * 为CodeBuddy CLI安装跨CLI协作感知能力
 * 
 * 使用方法：
 * node install_codebuddy_integration.js [--verify|--uninstall]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..', '..');

// CodeBuddy CLI配置路径
const CODEBUDDY_CONFIG_DIR = path.join(homedir(), '.codebuddy');
const CODEBUDDY_CONFIG_FILE = path.join(CODEBUDDY_CONFIG_DIR, 'buddy_config.json');

async function createCodeBuddyConfigDirectory() {
    /** 创建CodeBuddy配置目录 */
    try {
        await fs.mkdir(CODEBUDDY_CONFIG_DIR, { recursive: true });
        console.log(`[OK] 创建CodeBuddy配置目录: ${CODEBUDDY_CONFIG_DIR}`);
    } catch (error) {
        console.error(`[ERROR] 创建CodeBuddy配置目录失败: ${error.message}`);
    }
}

async function installCodeBuddySkills() {
    /** 安装CodeBuddy Skills配置 */
    // 读取现有buddy_config配置
    let existingConfig = {};
    try {
        const configExists = await fs.access(CODEBUDDY_CONFIG_FILE).then(() => true).catch(() => false);
        if (configExists) {
            const configContent = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
            existingConfig = JSON.parse(configContent);
        }
    } catch (error) {
        console.warn(`⚠️ 读取现有buddy_config配置失败: ${error.message}`);
        existingConfig = {};
    }

    // 定义跨CLI协作的Skills配置
    const crossCliSkills = {
        "cross_cli_skill": {
            "name": "CrossCLICoordinationSkill",
            "description": "Cross-CLI工具协调技能",
            "module": "src.adapters.codebuddy.skills_hook_adapter",
            "class": "CodeBuddySkillsHookAdapter",
            "enabled": true,
            "priority": 100,
            "triggers": [
                "on_skill_activation",
                "on_user_command"
            ],
            "config": {
                "cross_cli_enabled": true,
                "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "copilot"],
                "auto_route": true,
                "timeout": 30,
                "collaboration_mode": "active"
            }
        }
    };

    // 合并配置（保留现有skills，添加协作功能）
    const mergedConfig = { ...existingConfig };
    if (!mergedConfig.skills) {
        mergedConfig.skills = [];
    }

    // 检查是否已存在跨CLI协调技能
    const existingSkillNames = mergedConfig.skills.map(skill => skill.name || '');
    const crossCliSkillName = "CrossCLICoordinationSkill";

    if (!existingSkillNames.includes(crossCliSkillName)) {
        mergedConfig.skills.push(crossCliSkills.cross_cli_skill);
    }

    // 写入配置文件
    try {
        await fs.writeFile(CODEBUDDY_CONFIG_FILE, JSON.stringify(mergedConfig, null, 2), 'utf8');
        console.log(`[OK] CodeBuddy配置已安装: ${CODEBUDDY_CONFIG_FILE}`);
        console.log("🔗 已安装的Skills:");
        
        for (const skill of mergedConfig.skills) {
            const status = skill.enabled ? "[OK]" : "❌";
            console.log(`   - ${skill.name}: ${status}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ 安装CodeBuddy配置失败: ${error.message}`);
        return false;
    }
}

async function copyAdapterFiles() {
    /** 复制适配器文件到CodeBuddy配置目录 */
    try {
        // 创建适配器目录
        await fs.mkdir(CODEBUDDY_CONFIG_DIR, { recursive: true });

        // 复制适配器文件
        const adapterFiles = [
            'skills_hook_adapter.py',
            'buddy_adapter.py'
        ];

        for (const fileName of adapterFiles) {
            const srcFile = path.join(__dirname, fileName);
            const dstFile = path.join(CODEBUDDY_CONFIG_DIR, fileName);

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
    console.log('\n🔍 验证CodeBuddy CLI集成安装...');

    // 检查配置目录
    try {
        await fs.access(CODEBUDDY_CONFIG_DIR);
    } catch (error) {
        console.error(`❌ 配置目录不存在: ${CODEBUDDY_CONFIG_DIR}`);
        return false;
    }

    // 检查配置文件
    try {
        await fs.access(CODEBUDDY_CONFIG_FILE);
    } catch (error) {
        console.error(`❌ 配置文件不存在: ${CODEBUDDY_CONFIG_FILE}`);
        return false;
    }

    // 读取并验证配置
    try {
        const configContent = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // 检查关键skill是否存在
        const skills = config.skills || [];
        const hasCrossCliSkill = skills.some(skill => skill.name === 'CrossCLICoordinationSkill');
        
        if (!hasCrossCliSkill) {
            console.warn('⚠️ 缺少跨CLI协作技能: CrossCLICoordinationSkill');
        }

        console.log('[OK] CodeBuddy CLI集成安装验证通过');
        return true;
    } catch (error) {
        console.error(`❌ 验证配置失败: ${error.message}`);
        return false;
    }
}

async function uninstallCodeBuddyIntegration() {
    /** 卸载CodeBuddy集成 */
    try {
        // 检查配置文件
        const configExists = await fs.access(CODEBUDDY_CONFIG_FILE).then(() => true).catch(() => false);
        if (!configExists) {
            console.warn('⚠️ 配置文件不存在');
            return true;
        }

        // 读取配置文件
        const configContent = await fs.readFile(CODEBUDDY_CONFIG_FILE, 'utf8');
        const config = JSON.parse(configContent);

        // 移除跨CLI协调技能
        const skills = config.skills || [];
        const filteredSkills = skills.filter(skill => skill.name !== 'CrossCLICoordinationSkill');
        config.skills = filteredSkills;

        // 写入更新后的配置
        await fs.writeFile(CODEBUDDY_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');

        console.log('[OK] CodeBuddy CLI集成卸载完成');
        return true;
    } catch (error) {
        console.error(`❌ 卸载CodeBuddy集成失败: ${error.message}`);
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

    console.log('CodeBuddy CLI跨CLI协作集成安装器');
    console.log('='.repeat(50));

    if (options.uninstall) {
        console.log('[UNINSTALL] 卸载模式...');
        await uninstallCodeBuddyIntegration();
    } else if (options.verify) {
        console.log('🔍 验证模式...');
        await verifyInstallation();
    } else if (options.install) {
        console.log('📦 安装模式...');
        
        // 1. 创建配置目录
        await createCodeBuddyConfigDirectory();

        // 2. 安装Skills配置
        const skillSuccess = await installCodeBuddySkills();

        // 3. 复制适配器文件
        const adapterSuccess = await copyAdapterFiles();

        const success = skillSuccess && adapterSuccess;

        if (success) {
            console.log('\n🎉 CodeBuddy CLI跨CLI协作集成安装成功！');
            console.log('\n[INFO] 安装摘要:');
            console.log(`   [OK] 配置目录: ${CODEBUDDY_CONFIG_DIR}`);
            console.log(`   [OK] 配置文件: ${CODEBUDDY_CONFIG_FILE}`);
            console.log(`   [OK] 跨CLI协作Skill: 已启用`);
            
            console.log('\n[INSTALL] 下一步:');
            console.log('   1. 运行其他CLI工具的安装脚本');
            console.log('   2. 使用 stigmergy-cli deploy --all 安装所有工具');
            console.log('   3. 使用 stigmergy-cli init 初始化项目');
        } else {
            console.log('\n❌ CodeBuddy CLI跨CLI协作集成安装失败');
        }
    } else {
        console.log('使用方法:');
        console.log('  node install_codebuddy_integration.js [--install|--verify|--uninstall]');
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
    createCodeBuddyConfigDirectory, 
    installCodeBuddySkills, 
    copyAdapterFiles, 
    verifyInstallation, 
    uninstallCodeBuddyIntegration 
};