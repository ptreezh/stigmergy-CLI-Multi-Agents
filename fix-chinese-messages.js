#!/usr/bin/env node

/**
 * Batch replacement of Chinese messages to English in main.js
 */

import fs from 'fs/promises';
import path from 'path';

const chineseToEnglishMap = {
    // System messages
    '[DEPLOY] Stigmergy CLI - 远程快速部署系统': '[DEPLOY] Stigmergy CLI - Remote Rapid Deployment System',
    '此脚本将自动检测、安装和配置跨AI CLI工具协作系统': 'This script will automatically detect, install and configure cross-AI CLI tool collaboration system',

    // Status messages
    '正在检测您系统中已安装的AI工具': 'Detecting AI tools installed in your system...',
    '无需安装额外工具，继续配置系统': 'No additional tools needed, continuing system configuration',
    '检测到您还可以安装以下AI工具': 'The following additional AI tools are available for installation:',
    'npm包:': 'npm package:',
    '您可以稍后通过 "npm install -g <package>" 手动安装这些工具': 'You can manually install these tools later with "npm install -g <package>"',
    '或者现在选择要安装的工具编号，用空格分隔 (如: 1 3 4), 0表示不安装任何工具:': 'Or select tool numbers to install now, separated by spaces (e.g. 1 3 4), 0 to skip all',
    '请选择要安装的工具编号:': 'Please select tool numbers to install:',

    // Installation messages
    '正在安装中，请稍候': 'Installing, please wait...',
    '开始安装': 'Starting installation',
    '适配器已存在': 'Adapter already exists',
    '适配器安装完成': 'Adapter installation completed',
    '所有适配器部署完成': 'All adapters deployed successfully',
    '开始部署所有适配器': 'Starting deployment of all adapters',
    '全局配置已更新': 'Global configuration updated',

    // Project initialization
    '初始化Stigmergy CLI项目': 'Initializing Stigmergy CLI project',
    '检测到在磁盘根目录运行，将自动创建项目目录进行初始化': 'Detected running in disk root directory, will automatically create project directory for initialization',
    '项目目录创建成功': 'Project directory created successfully',
    'Stigmergy项目初始化完成': 'Stigmergy project initialization completed',
    '发现': 'Discovered',
    '个可用的AI CLI工具': 'available AI CLI tools',

    // Configuration messages
    '检查项目配置': 'Checking project configuration',
    '项目配置目录存在': 'Project configuration directory exists',
    '项目配置目录不存在，需要初始化': 'Project configuration directory does not exist, needs initialization',
    '项目配置文件存在': 'Project configuration file exists',
    '项目类型:': 'Project type:',
    '创建时间:': 'Created at:',
    '已配置适配器': 'Configured adapters',
    '个': '',
    '项目配置文件不存在或格式错误': 'Project configuration file does not exist or has incorrect format',
    '全局配置存在': 'Global configuration exists',
    '全局配置不存在，需要部署': 'Global configuration does not exist, needs deployment',
    '项目检查完成': 'Project check completed',
    '扫描系统环境': 'Scanning system environment',
    '扫描结果:': 'Scan results:',
    '可用': 'Available',
    '不可用': 'Unavailable',
    '提示: 使用 "stigmergy deploy" 部署未安装的工具': 'Tip: Use "stigmergy deploy" to deploy uninstalled tools',

    // Status check
    '检查Stigmergy CLI状态': 'Checking Stigmergy CLI status',
    '全局配置文件不存在': 'Global configuration file does not exist',
    '项目配置文件不存在': 'Project configuration file does not exist',
    '全局配置:': 'Global configuration:',
    '仓库:': 'Repository:',
    '版本:': 'Version:',
    '最后更新:': 'Last updated:',
    '可用适配器:': 'Available adapters:',
    '项目配置:': 'Project configuration:',
    '类型:': 'Type:',
    '可用工具:': 'Available tools:',
    '适配器详细状态:': 'Adapter detailed status:',
    '需要安装': 'needs installation',

    // Validation
    '验证': 'Validate',
    '配置': 'configuration',
    '项目配置验证通过': 'Project configuration validation passed',
    '适配器数量:': 'Number of adapters:',
    '项目配置验证失败或不存在': 'Project configuration validation failed or does not exist',
    '使用 stigmergy init 初始化项目配置': 'Use stigmergy init to initialize project configuration',
    '全局配置验证通过': 'Global configuration validation passed',
    '全局配置验证失败或不存在': 'Global configuration validation failed or does not exist',
    '使用 stigmergy deploy 部署全局配置': 'Use stigmergy deploy to deploy global configuration',
    '未知的验证范围，使用 "project" 或 "global"': 'Unknown validation scope, use "project" or "global"',

    // Complex deployment
    '正在安装': 'Installing',
    '个AI工具': 'AI tools',
    '安装': 'Installing',
    '安装成功': 'Installation successful',
    '安装出错:': 'Installation error:',
    '安装完成': 'Installation completed',
    '安装可能未完成': 'Installation may not be complete',
    '退出码:': 'Exit code:',
    '配置Stigmergy CLI协作系统': 'Configuring Stigmergy CLI collaboration system',
    '检测结果:': 'Detection result:',
    '个可用': 'available',
    '个不可用': 'unavailable',
    '为': 'for',
    '个已安装的AI CLI工具配置协作:': 'installed AI CLI tools configured for collaboration:',
    '没有检测到已安装的AI CLI工具': 'No installed AI CLI tools detected',
    '生成': 'Generated',
    '生成失败:': 'Generation failed:',
    '项目配置完成': 'Project configuration completed',
    '为已安装的CLI配置协作插件': 'Configuring collaboration plugins for installed CLIs',
    '配置': 'Configuring',
    '集成插件': 'integration plugin',
    '集成插件配置成功': 'Integration plugin configuration successful',
    '集成插件配置可能未完成': 'Integration plugin configuration may not be complete',
    '集成配置过程中出错:': 'Integration configuration error:',
    '暂无特殊集成插件配置': 'No special integration plugin configuration available',
    '系统配置成功': 'System configuration successful',
    '系统配置失败:': 'System configuration failed:',
    '您已经安装了所有支持的AI工具': 'You have already installed all supported AI tools',
    '正在全局安装 stigmergy-cli': 'Installing stigmergy-cli globally',
    '已成功全局安装': 'successfully installed globally',
    '现在可以在任何目录运行: stigmergy-cli <command>': 'You can now run from any directory: stigmergy-cli <command>',
    '全局安装可能未成功，但您可以手动安装:': 'Global installation may not have succeeded, but you can install manually:',
    '全局安装失败，您可以手动安装:': 'Global installation failed, you can install manually:',
    '错误:': 'Error:',
    '全局安装失败，您可以手动安装:': 'Global installation failed, you can install manually:'
};

async function fixChineseMessages() {
    const mainJsPath = path.join(process.cwd(), 'package', 'src', 'main.js');

    try {
        console.log('📝 Reading main.js file...');
        let content = await fs.readFile(mainJsPath, 'utf8');

        console.log('🔄 Replacing Chinese messages with English...');
        let replacementsCount = 0;

        for (const [chinese, english] of Object.entries(chineseToEnglishMap)) {
            const regex = new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const beforeCount = (content.match(regex) || []).length;
            content = content.replace(regex, english);
            replacementsCount += beforeCount;
        }

        // Additional patterns that need special handling
        content = content.replace(/正在安装 \$\{tool\.displayName\}/g, 'Installing ${tool.displayName}');
        content = content.replace(/\[OK\] \$\{tool\.displayName\} - 已安装/g, '[OK] ${tool.displayName} - Installed');
        content = content.replace(/\[X\] \$\{tool\.displayName\} - 未安装/g, '[X] ${tool.displayName} - Not installed');
        content = content.replace(/\[INSTALL\] 安装 \$\{tool\.displayName\}\.\.\./g, '[INSTALL] Installing ${tool.displayName}...');
        content = content.replace(/\[OK\] \$\{tool\.displayName\} 安装成功/g, '[OK] ${tool.displayName} installation successful');
        content = content.replace(/\[ERROR\] \$\{tool\.displayName\} 安装出错: \$\{errOutput\.trim\(\)\}/g, '[ERROR] ${tool.displayName} installation error: ${errOutput.trim()}');
        content = content.replace(/\[OK\] \$\{tool\.displayName\} 安装完成/g, '[OK] ${tool.displayName} installation completed');
        content = content.replace(/\[WARN\] \$\{tool\.displayName\} 安装可能未完成 \(退出码: \$\{code\}\)/g, '[WARN] ${tool.displayName} installation may not be complete (exit code: ${code})');
        content = content.replace(/\[OK\] \$\{cliInfo\.displayName\} - 可用/g, '[OK] ${cliInfo.displayName} - Available');
        content = content.replace(/\[X\] \$\{cliInfo\.displayName\} - 不可用/g, '[X] ${cliInfo.displayName} - Unavailable');
        content = content.replace(/\[INFO\] \$\{availableAdapters\.length\} 个可用的AI CLI工具: /g, '[INFO] ${availableAdapters.length} available AI CLI tools: ');
        content = content.replace(/\[INFO\] 项目类型: \$\{config\.projectType\}/g, '[INFO] Project type: ${config.projectType}');
        content = content.replace(/\[DATE\] 创建时间: \$\{config\.createdAt\}/g, '[DATE] Created at: ${config.createdAt}');
        content = content.replace(/\[CONFIG\] 已配置适配器: \$\{config\.adapters\.length\} 个/g, '[CONFIG] Configured adapters: ${config.adapters.length}');
        content = content.replace(/\[OK\] 生成 \$\{adapter\.name\}\.md/g, '[OK] Generated ${adapter.name}.md');

        console.log('💾 Writing fixed content back to file...');
        await fs.writeFile(mainJsPath, content, 'utf8');

        console.log(`✅ Completed! Replaced ${replacementsCount} Chinese messages with English`);
        console.log('📝 File updated: package/src/main.js');

    } catch (error) {
        console.error('❌ Error fixing Chinese messages:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    fixChineseMessages();
}