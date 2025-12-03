#!/usr/bin/env node

/**
 * CLI Installation Manager with User Interaction
 * 带有用户交互的CLI安装管理器
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// 简单的颜色输出替代chalk
const colors = {
    cyan: (text) => `\x1b[36m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    magenta: (text) => `\x1b[35m${text}\x1b[0m`
};

class CLIInstallManager {
    constructor() {
        this.platform = process.platform;
        this.packageManagers = {
            npm: { check: 'npm --version', install: 'npm install -g' },
            yarn: { check: 'yarn --version', install: 'yarn global add' },
            pnpm: { check: 'pnpm --version', install: 'pnpm add -g' },
            pip: { check: 'pip --version', install: 'pip install' },
            pip3: { check: 'pip3 --version', install: 'pip3 install' }
        };
        
        // 增强的CLI规格配置 - 基于实际安装的包名
        this.cliSpecs = new Map([
            ['qwen', {
                name: 'qwen',
                displayName: 'Qwen AI CLI',
                description: 'Qwen通义千问AI命令行工具',
                type: 'npm',
                packageName: '@qwen-code/qwen-code',
                installCommands: {
                    npm: 'npm install -g @qwen-code/qwen-code',
                    yarn: 'yarn global add @qwen-code/qwen-code',
                    pnpm: 'pnpm add -g @qwen-code/qwen-code'
                },
                verificationCommands: ['qwen --version'],
                requiredPermissions: ['network', 'file-system'],
                estimatedSize: '~45MB',
                dependencies: ['node >= 14.0.0'],
                website: 'https://qwen.ai/'
            }],
            ['iflow', {
                name: 'iflow',
                displayName: 'iFlow CLI',
                description: 'iFlow智能工作流自动化命令行工具',
                type: 'npm',
                packageName: '@iflow-ai/iflow-cli',
                installCommands: {
                    npm: 'npm install -g @iflow-ai/iflow-cli',
                    yarn: 'yarn global add @iflow-ai/iflow-cli',
                    pnpm: 'pnpm add -g @iflow-ai/iflow-cli'
                },
                verificationCommands: ['iflow --version'],
                requiredPermissions: ['network', 'process-execution'],
                estimatedSize: '~38MB',
                dependencies: ['node >= 14.0.0'],
                website: 'https://iflow.ai/'
            }],
            ['gemini', {
                name: 'gemini',
                displayName: 'Google Gemini CLI',
                description: 'Google Gemini AI命令行工具',
                type: 'npm',
                packageName: '@google/gemini-cli',
                installCommands: {
                    npm: 'npm install -g @google/gemini-cli',
                    yarn: 'yarn global add @google/gemini-cli',
                    pnpm: 'pnpm add -g @google/gemini-cli'
                },
                verificationCommands: ['gemini --version'],
                requiredPermissions: ['network', 'api-access'],
                estimatedSize: '~52MB',
                dependencies: ['node >= 16.0.0', 'google-api-key'],
                website: 'https://ai.google.dev/',
                setupRequired: true,
                setupInstructions: '需要Google API密钥'
            }],
            ['copilot', {
                name: 'copilot',
                displayName: 'GitHub Copilot CLI',
                description: 'GitHub Copilot AI编程助手命令行工具',
                type: 'npm',
                packageName: '@github/copilot',
                installCommands: {
                    npm: 'npm install -g @github/copilot',
                    yarn: 'yarn global add @github/copilot',
                    pnpm: 'pnpm add -g @github/copilot'
                },
                verificationCommands: ['copilot --version'],
                requiredPermissions: ['network', 'github-auth'],
                estimatedSize: '~48MB',
                dependencies: ['node >= 16.0.0', 'github-account'],
                website: 'https://github.com/features/copilot',
                setupRequired: true,
                setupInstructions: '需要GitHub账户和Copilot订阅'
            }],
            ['claude', {
                name: 'claude',
                displayName: 'Anthropic Claude CLI',
                description: 'Anthropic Claude AI命令行工具',
                type: 'npm',
                packageName: '@anthropic-ai/claude-code',
                installCommands: {
                    npm: 'npm install -g @anthropic-ai/claude-code',
                    yarn: 'yarn global add @anthropic-ai/claude-code',
                    pnpm: 'pnpm add -g @anthropic-ai/claude-code'
                },
                verificationCommands: ['claude --version'],
                requiredPermissions: ['network', 'api-access'],
                estimatedSize: '~28MB',
                dependencies: ['node >= 14.0.0', 'anthropic-api-key'],
                website: 'https://anthropic.com/',
                setupRequired: true,
                setupInstructions: '需要Anthropic API密钥'
            }],
            ['codex', {
                name: 'codex',
                displayName: 'OpenAI Codex CLI',
                description: 'OpenAI Codex代码生成命令行工具',
                type: 'npm',
                packageName: '@openai/codex',
                installCommands: {
                    npm: 'npm install -g @openai/codex',
                    yarn: 'yarn global add @openai/codex',
                    pnpm: 'pnpm add -g @openai/codex'
                },
                verificationCommands: ['codex --version'],
                requiredPermissions: ['network', 'api-access'],
                estimatedSize: '~42MB',
                dependencies: ['node >= 14.0.0', 'openai-api-key'],
                website: 'https://openai.com/',
                setupRequired: true,
                setupInstructions: '需要OpenAI API密钥'
            }]
        ]);
    }

    /**
     * 检查可用的包管理器
     */
    async checkAvailablePackageManagers() {
        const available = new Map();
        
        for (const [name, manager] of Object.entries(this.packageManagers)) {
            try {
                execSync(manager.check, { encoding: 'utf8', timeout: 5000 });
                available.set(name, manager);
                console.log(`✅ ${name} 可用`);
            } catch {
                console.log(`❌ ${name} 不可用`);
            }
        }
        
        return available;
    }

    /**
     * 创建交互式命令行界面
     */
    createReadlineInterface() {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * 显示CLI工具详情
     */
    displayCLIDetails(cliInfo) {
            console.log(colors.cyan(`\n📋 ${cliInfo.displayName}`));
            console.log(colors.gray('─'.repeat(50)));
            console.log(`📝 描述: ${cliInfo.description}`);
            console.log(`🌐 网站: ${cliInfo.website}`);
            console.log(`📦 包名: ${cliInfo.packageName}`);
            console.log(`🏗️  类型: ${cliInfo.type}`);
            console.log(`📊 大小: ${cliInfo.estimatedSize}`);
            console.log(`🔧 依赖: ${cliInfo.dependencies.join(', ')}`);
            console.log(`👥 权限: ${cliInfo.requiredPermissions.join(', ')}`);
            
            if (cliInfo.setupRequired) {
                console.log(`⚠️  设置要求: ${cliInfo.setupInstructions}`);
            }
            
            console.log(colors.gray('─'.repeat(50)));
    }

    /**
     * 询问是否安装CLI工具
     */
    async askForCLIInstallation(missingCLIs, availableManagers, autoInstall = false) {
        if (missingCLIs.length === 0) {
            return [];
        }

        const rl = this.createReadlineInterface();
        const toInstall = [];

        console.log(colors.yellow(`\n🔍 发现 ${missingCLIs.length} 个未安装的CLI工具:`));

        for (let i = 0; i < missingCLIs.length; i++) {
            const cli = missingCLIs[i];
            console.log(colors.blue(`\n${i + 1}. ${cli.displayName || cli.name}`));
            console.log(`   ${cli.description}`);
        }

        if (autoInstall) {
            console.log(colors.green('\n🚀 自动安装模式：安装所有CLI工具'));
            for (const cli of missingCLIs) {
                const packageManager = this.selectPackageManagerAuto(cli, availableManagers);
                if (packageManager) {
                    toInstall.push({
                        ...cli,
                        selectedManager: packageManager,
                        installCommand: cli.installCommands[packageManager]
                    });
                }
            }
            rl.close();
            return toInstall;
        }

        console.log(colors.yellow('\n请选择要安装的CLI工具 (输入数字，多个用空格分隔):'));
        
        const answer = await new Promise((resolve) => {
            rl.question('选择: ', (answer) => resolve(answer.trim()));
        });

        const selectedIndices = answer.split(/\s+/).map(n => parseInt(n) - 1).filter(n => n >= 0 && n < missingCLIs.length);
        
        for (const index of selectedIndices) {
            const cli = missingCLIs[index];
            
            // 显示详细信息
            this.displayCLIDetails(cli);
            
            // 选择包管理器
            const packageManager = await this.selectPackageManager(cli, availableManagers, rl);
            
            if (packageManager) {
                toInstall.push({
                    ...cli,
                    selectedManager: packageManager,
                    installCommand: cli.installCommands[packageManager]
                });
            }
        }

        rl.close();
        return toInstall;
    }

    /**
     * 自动选择包管理器
     */
    selectPackageManagerAuto(cliInfo, availableManagers) {
        const cliManagers = Object.keys(cliInfo.installCommands).filter(mgr => availableManagers.has(mgr));
        
        if (cliManagers.length === 0) {
            return null;
        }
        
        // 优先级: npm > pnpm > pip > pip3
        const priority = ['npm', 'pnpm', 'pip', 'pip3'];
        for (const mgr of priority) {
            if (cliManagers.includes(mgr)) {
                console.log(colors.green(`✅ 将使用 ${mgr} 自动安装 ${cliInfo.displayName || cliInfo.name}`));
                return mgr;
            }
        }
        
        return cliManagers[0];
    }

    /**
     * 选择包管理器
     */
    async selectPackageManager(cliInfo, availableManagers, rl) {
        const cliManagers = Object.keys(cliInfo.installCommands).filter(mgr => availableManagers.has(mgr));
        
        if (cliManagers.length === 0) {
            console.log(colors.red(`❌ ${cliInfo.displayName} 没有可用的包管理器`));
            return null;
        }
        
        if (cliManagers.length === 1) {
            console.log(colors.green(`✅ 将使用 ${cliManagers[0]} 安装 ${cliInfo.displayName}`));
            return cliManagers[0];
        }
        
        console.log(colors.yellow(`\n🔧 为 ${cliInfo.displayName} 选择包管理器:`));
        for (let i = 0; i < cliManagers.length; i++) {
            console.log(`   ${i + 1}. ${cliManagers[i]}`);
        }
        
        const answer = await new Promise((resolve) => {
            rl.question('选择: ', (answer) => resolve(answer.trim()));
        });
        
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < cliManagers.length) {
            return cliManagers[index];
        }
        
        return cliManagers[0]; // 默认选择第一个
    }

    /**
     * 安装CLI工具（带进度显示）
     */
    async installCLI(installItem) {
        const { name, displayName, installCommand, verificationCommands } = installItem;
        
        console.log(colors.blue(`\n🚀 开始安装 ${displayName}...`));
        console.log(colors.gray(`执行: ${installCommand}`));
        
        try {
            await new Promise((resolve, reject) => {
                const process = spawn(installCommand, [], {
                    shell: true,
                    stdio: 'pipe'
                });
                
                let output = '';
                
                process.stdout.on('data', (data) => {
                    const text = data.toString();
                    output += text;
                    // 显示进度点
                    process.stdout.write('.');
                });
                
                process.stderr.on('data', (data) => {
                    const text = data.toString();
                    output += text;
                });
                
                process.on('close', (code) => {
                    console.log(); // 换行
                    if (code === 0) {
                        console.log(colors.green(`✅ ${displayName} 安装成功`));
                        resolve();
                    } else {
                        console.log(colors.red(`❌ ${displayName} 安装失败 (退出码: ${code})`));
                        if (output) {
                            console.log(colors.gray('输出:', output));
                        }
                        reject(new Error(`Installation failed with code ${code}`));
                    }
                });
                
                process.on('error', (error) => {
                    console.log(colors.red(`❌ ${displayName} 安装错误:`), error.message);
                    reject(error);
                });
            });
            
            // 验证安装
            await this.verifyInstallation(name, verificationCommands);
            
            return true;
        } catch (error) {
            console.log(chalk.red(`❌ ${displayName} 安装失败:`), error.message);
            return false;
        }
    }

    /**
     * 验证安装
     */
    async verifyInstallation(name, verificationCommands) {
        console.log(colors.blue(`🔍 验证 ${name} 安装...`));
        
        for (const cmd of verificationCommands) {
            try {
                const result = execSync(cmd, { 
                    encoding: 'utf8', 
                    timeout: 10000,
                    shell: true
                }).toString().trim();
                
                console.log(colors.green(`✅ 验证成功: ${cmd}`));
                if (result) {
                    console.log(colors.gray(`   版本: ${result}`));
                }
                return true;
            } catch (error) {
                console.log(colors.yellow(`⚠️  验证失败: ${cmd} - ${error.message}`));
            }
        }
        
        return false;
    }

    /**
     * 安装后设置
     */
    async postInstallationSetup(installedItems) {
        if (installedItems.length === 0) {
            return;
        }
        
        console.log(colors.yellow('\n🔧 安装后设置...'));
        
        const rl = this.createReadlineInterface();
        
        for (const item of installedItems) {
            if (item.setupRequired) {
                console.log(colors.cyan(`\n📋 ${item.displayName} 需要额外设置:`));
                console.log(item.setupInstructions);
                
                const answer = await new Promise((resolve) => {
                    rl.question('现在进行设置吗? [y/n]: ', (answer) => resolve(answer.toLowerCase().trim()));
                });
                
                if (answer === 'y' || answer === 'yes') {
                    await this.runSetupProcedure(item);
                }
            }
        }
        
        rl.close();
    }

    /**
     * 运行设置程序
     */
    async runSetupProcedure(cliItem) {
        console.log(colors.blue(`\n🔧 Configuring ${cliItem.displayName}...`));
        
        switch (cliItem.name) {
            case 'gemini':
                console.log('请设置您的Google API密钥:');
                console.log('1. 访问 https://ai.google.dev/');
                console.log('2. 创建API密钥');
                console.log('3. 运行: gemini config set api-key YOUR_API_KEY');
                break;
                
            case 'copilot':
                console.log('请登录您的GitHub账户:');
                console.log('运行: copilot auth login');
                break;
                
            case 'claude':
                console.log('请设置您的Anthropic API密钥:');
                console.log('1. 访问 https://anthropic.com/');
                console.log('2. 创建API密钥');
                console.log('3. 运行: claude config set api-key YOUR_API_KEY');
                break;
                
            case 'codex':
                console.log('请设置您的OpenAI API密钥:');
                console.log('1. 访问 https://openai.com/');
                console.log('2. 创建API密钥');
                console.log('3. 运行: codex config set api-key YOUR_API_KEY');
                break;
        }
    }

    /**
     * 批量安装CLI工具
     */
    async batchInstall(toInstall) {
        if (toInstall.length === 0) {
            return { success: [], failed: [] };
        }
        
        console.log(colors.blue(`\n🚀 批量安装 ${toInstall.length} 个CLI工具...`));
        
        const results = { success: [], failed: [] };
        
        for (const item of toInstall) {
            const success = await this.installCLI(item);
            if (success) {
                results.success.push(item);
            } else {
                results.failed.push(item);
            }
        }
        
        // 显示安装结果摘要
        console.log(colors.cyan('\n📊 安装结果摘要:'));
        console.log(colors.green(`✅ 成功: ${results.success.length} 个`));
        for (const item of results.success) {
            console.log(`   - ${item.displayName}`);
        }
        
        if (results.failed.length > 0) {
            console.log(colors.red(`❌ 失败: ${results.failed.length} 个`));
            for (const item of results.failed) {
                console.log(`   - ${item.displayName}`);
            }
        }
        
        // 安装后设置
        await this.postInstallationSetup(results.success);
        
        return results;
    }

    /**
     * 运行安装流程
     */
    async runInstallationFlow(missingCLIs, autoInstall = false) {
        if (missingCLIs.length === 0) {
            return { success: [], failed: [] };
        }
        
        console.log(colors.blue('\n🔧 开始CLI安装流程...'));
        
        // 检查可用包管理器
        const availableManagers = await this.checkAvailablePackageManagers();
        if (availableManagers.size === 0) {
            console.log(colors.red('❌ 没有可用的包管理器'));
            return { success: [], failed: missingCLIs };
        }
        
        // 用户选择要安装的CLI
        const toInstall = await this.askForCLIInstallation(missingCLIs, availableManagers, autoInstall);
        
        if (toInstall.length === 0) {
            console.log(colors.yellow('⚠️  没有选择安装任何CLI工具'));
            return { success: [], failed: [] };
        }
        
        if (!autoInstall) {
            // 确认安装
            const rl = this.createReadlineInterface();
            console.log(colors.cyan(`\n📋 准备安装 ${toInstall.length} 个CLI工具:`));
            for (const item of toInstall) {
                console.log(`   - ${item.displayName} (${item.selectedManager})`);
            }
            
            const confirm = await new Promise((resolve) => {
                rl.question('\n确认安装? [y/n]: ', (answer) => resolve(answer.toLowerCase().trim()));
            });
            
            rl.close();
            
            if (confirm !== 'y' && confirm !== 'yes') {
                console.log(colors.yellow('⚠️  用户取消安装'));
                return { success: [], failed: [] };
            }
        }
        
        // 批量安装
        return await this.batchInstall(toInstall);
    }
}

// 主执行函数
async function main() {
    const manager = new CLIInstallManager();
    
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
CLI Installation Manager
CLI installation manager with user interaction

Usage:
  node cli-install-manager.js [options]

Options:
  --help, -h     Show help information
  --check-only    Check package manager availability only
        `);
        return;
    }
    
    if (process.argv.includes('--check-only')) {
        await manager.checkAvailablePackageManagers();
        return;
    }
    
    console.log(colors.cyan('🔧 CLI installation manager ready'));
    console.log(colors.gray('This tool needs to be used with CLI auto scanner'));
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = CLIInstallManager;