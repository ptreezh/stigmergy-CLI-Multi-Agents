#!/usr/bin/env node

/**
 * Stigmergy-CLI - Zero Code Facility (带自动安装功能)
 * 增强版部署工具，支持自动安装缺失的CLI工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class StigmergyDeployerWithInstall {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.args = process.argv.slice(2);

        // CLI工具的安装信息
        this.cliTools = {
            claude: {
                name: 'Claude Code',
                installCmd: 'npm install -g @anthropic-ai/claude-code',
                testCmd: 'claude --version',
                website: 'https://claude.ai/code'
            },
            gemini: {
                name: 'Google Gemini CLI',
                installCmd: 'npm install -g @google/generative-ai-cli',
                testCmd: 'gemini --version',
                website: 'https://ai.google.dev/'
            },
            qwen: {
                name: '通义千问 CLI',
                installCmd: 'npm install -g @qwen-code/qwen-code',
                testCmd: 'qwen --version',
                website: 'https://qwen.ai/'
            },
            kimi: {
                name: '月之暗面 CLI',
                installCmd: 'npm install -g @moonshot/kimi-cli',
                testCmd: 'kimi --version',
                website: 'https://kimi.moonshot.cn/'
            },
            codebuddy: {
                name: 'CodeBuddy CLI',
                installCmd: 'npm install -g @codebuddy/cli',
                testCmd: 'codebuddy --version',
                website: 'https://codebuddy.ai/'
            },
            qodercli: {
                name: 'QoderCLI',
                installCmd: 'npm install -g qodercli',
                testCmd: 'qodercli --version',
                website: 'https://qoder.ai/'
            },
            iflow: {
                name: 'iFlow CLI',
                installCmd: 'npm install -g iflow-cli',
                testCmd: 'iflow --version',
                website: 'https://iflow.ai/'
            },
            copilot: {
                name: 'GitHub Copilot CLI',
                installCmd: 'npm install -g @github/gh-copilot',
                testCmd: 'gh copilot --help',
                website: 'https://github.com/features/copilot'
            }
        };
    }

    print(text) {
        console.log(text);
    }

    async ensureDir(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            return false;
        }
    }

    async run() {
        this.print('🚀 Stigmergy-CLI - Zero Code Facility (增强版)');
        this.print('====================================================');
        this.print('');

        const command = this.args[0] || 'deploy';

        switch (command) {
            case 'scan':
                await this.scan();
                break;
            case 'install':
                await this.installCLI();
                break;
            case 'deploy':
            default:
                await this.deploy();
                break;
        }
    }

    async checkCommand(tool, testCmd) {
        return new Promise((resolve) => {
            const [cmd, ...args] = testCmd.split(' ');

            const child = spawn(cmd, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                timeout: 5000
            });

            child.on('close', (code) => {
                resolve(code === 0);
            });

            child.on('error', () => {
                resolve(false);
            });
        });
    }

    async scan() {
        this.print('🔍 扫描AI CLI工具...');
        this.print('');

        const results = {};
        const missingTools = [];

        for (const [key, tool] of Object.entries(this.cliTools)) {
            process.stdout.write(`检测 ${tool.name}... `);

            const isAvailable = await this.checkCommand(key, tool.testCmd);

            if (isAvailable) {
                results[key] = { available: true, name: tool.name };
                this.print('✅ 可用');
            } else {
                results[key] = { available: false, name: tool.name, installCmd: tool.installCmd };
                missingTools.push(key);
                this.print('❌ 未安装');
            }
        }

        this.print('');
        this.print(`📊 检测完成`);

        const available = Object.keys(results).filter(key => results[key].available).length;
        this.print(`✅ 可用工具: ${available}/${Object.keys(results).length}`);
        this.print(`❌ 缺失工具: ${missingTools.length}`);

        if (missingTools.length > 0) {
            this.print('');
            this.print('💡 可以运行以下命令安装缺失的工具:');
            this.print(`   node deploy-with-install.js install`);
            this.print('   或者选择性地安装:');
            for (const tool of missingTools) {
                this.print(`   - ${this.cliTools[tool].name}: ${this.cliTools[tool].installCmd}`);
            }
        }

        // 保存结果
        await this.ensureDir(this.configDir);
        await fs.promises.writeFile(
            path.join(this.configDir, 'scan-results.json'),
            JSON.stringify(results, null, 2)
        );

        return results;
    }

    async installCLI() {
        this.print('🔧 AI CLI工具安装程序');
        this.print('========================');
        this.print('');

        // 先扫描找出缺失的工具
        const scanResults = await this.scan();
        const missingTools = Object.keys(scanResults).filter(key => !scanResults[key].available);

        if (missingTools.length === 0) {
            this.print('✅ 所有工具都已安装！');
            return;
        }

        this.print('');
        this.print(`发现 ${missingTools.length} 个缺失的工具:`);
        missingTools.forEach((tool, index) => {
            const info = this.cliTools[tool];
            this.print(`${index + 1}. ${info.name} (${tool})`);
            this.print(`   网站: ${info.website}`);
        });

        this.print('');
        this.print('🎯 选择安装选项:');
        this.print('1. 安装所有缺失工具');
        this.print('2. 选择性安装');
        this.print('3. 显示安装命令（手动安装）');
        this.print('');

        // 简单的命令行交互
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const choice = await new Promise(resolve => {
            rl.question('请选择 (1-3, 默认1): ', (answer) => {
                resolve(answer || '1');
            });
        });

        switch (choice) {
            case '1':
                await this.installAll(missingTools);
                break;
            case '2':
                await this.installSelective(missingTools);
                break;
            case '3':
                this.showInstallCommands(missingTools);
                break;
            default:
                this.print('❌ 无效选择');
                break;
        }

        rl.close();
    }

    async installAll(missingTools) {
        this.print(`📦 开始安装 ${missingTools.length} 个工具...`);
        this.print('');

        let successCount = 0;
        let failCount = 0;

        for (const [index, tool] of missingTools.entries()) {
            const info = this.cliTools[tool];
            this.print(`${index + 1}/${missingTools.length}. 安装 ${info.name}...`);

            try {
                await this.runCommand(info.installCmd);
                this.print(`✅ ${info.name} 安装成功`);
                successCount++;
            } catch (error) {
                this.print(`❌ ${info.name} 安装失败: ${error.message}`);
                this.print(`💡 请手动运行: ${info.installCmd}`);
                failCount++;
            }
            this.print('');
        }

        this.print(`📊 安装结果: ${successCount} 成功, ${failCount} 失败`);

        if (successCount > 0) {
            this.print('💡 建议重新扫描以确认安装结果:');
            this.print('   node deploy-with-install.js scan');
        }
    }

    async installSelective(missingTools) {
        this.print('📦 选择要安装的工具 (用空格分隔，例如: 1 3 5):');
        this.print('');

        missingTools.forEach((tool, index) => {
            const info = this.cliTools[tool];
            this.print(`${index + 1}. ${info.name} (${tool})`);
        });

        this.print('');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const selected = await new Promise(resolve => {
            rl.question('请选择要安装的工具编号: ', (answer) => {
                const indices = answer.split(' ').map(n => parseInt(n) - 1).filter(n => n >= 0 && n < missingTools.length);
                const selectedTools = indices.map(i => missingTools[i]);
                resolve(selectedTools);
            });
        });

        rl.close();

        if (selected.length > 0) {
            await this.installAll(selected);
        } else {
            this.print('❌ 没有选择任何工具');
        }
    }

    showInstallCommands(missingTools) {
        this.print('📋 手动安装命令:');
        this.print('==================');
        this.print('');

        for (const tool of missingTools) {
            const info = this.cliTools[tool];
            this.print(`${info.name} (${tool}):`);
            this.print(`  ${info.installCmd}`);
            this.print(`  网站: ${info.website}`);
            this.print('');
        }
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, {
                stdio: 'inherit',
                shell: true,
                timeout: 120000 // 2分钟超时
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`命令执行失败，退出码: ${code}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async deploy() {
        this.print('🚀 开始部署Stigmergy-CLI集成系统...');
        this.print('');

        // 1. 扫描工具
        const scanResults = await this.scan();

        // 2. 检查是否需要安装缺失工具
        const missingTools = Object.keys(scanResults).filter(name => !scanResults[name].available);

        if (missingTools.length > 0) {
            this.print('');
            this.print('⚠️ 检测到缺失的AI CLI工具');
            this.print('🤖 您现在可以:');
            this.print('   a. 继续部署（仅使用已安装的工具）');
            this.print('   b. 先安装缺失工具');
            this.print('   c. 跳过安装');
            this.print('');

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const choice = await new Promise(resolve => {
                rl.question('请选择 (a/b/c, 默认a): ', (answer) => {
                    resolve((answer || 'a').toLowerCase());
                });
            });

            rl.close();

            switch (choice) {
                case 'b':
                    await this.installCLI();
                    // 重新扫描
                    const newScanResults = await this.scan();
                    Object.assign(scanResults, newScanResults);
                    break;
                case 'c':
                    this.print('跳过安装，使用现有工具继续部署...');
                    break;
                case 'a':
                default:
                    this.print('继续使用已安装的工具进行部署...');
                    break;
            }
        }

        // 3. 继续正常部署流程
        const availableCLIs = Object.keys(scanResults).filter(name => scanResults[name].available);

        const config = {
            version: '2.0.0',
            deployTime: new Date().toISOString(),
            platform: process.platform,
            availableCLIs: availableCLIs,
            totalDetected: Object.keys(scanResults).length,
            missingTools: missingTools,
            integrationEnabled: true,
            features: {
                crossCLIRouting: true,
                multilingualSupport: true,
                zeroConfig: true,
                autoInstall: true
            }
        };

        // 创建配置目录和文件
        await this.ensureDir(this.configDir);
        await this.ensureDir(path.join(this.configDir, 'adapters'));

        await fs.promises.writeFile(
            path.join(this.configDir, 'config.json'),
            JSON.stringify(config, null, 2)
        );

        // 创建安装配置文件，方便后续使用
        const installConfig = {
            tools: this.cliTools,
            lastScan: scanResults
        };

        await fs.promises.writeFile(
            path.join(this.configDir, 'install-config.json'),
            JSON.stringify(installConfig, null, 2)
        );

        this.print('');
        this.print('🎉 部署完成！');
        this.print('');
        this.print(`📍 配置目录: ${this.configDir}`);
        this.print(`🔧 可用工具: ${availableCLIs.join(', ') || '无'}`);
        this.print(`📊 成功率: ${availableCLIs.length}/${Object.keys(scanResults).length}`);

        if (missingTools.length > 0) {
            this.print(`⚠️ 缺失工具: ${missingTools.join(', ')}`);
            this.print('');
            this.print('💡 安装缺失工具:');
            this.print(`   node deploy-with-install.js install`);
        }

        if (availableCLIs.length > 0) {
            this.print('');
            this.print('💡 现在可以开始使用跨CLI协作功能了！');
            this.print('   例如: claude "用gemini帮我分析这段代码"');
        } else {
            this.print('');
            this.print('⚠️ 没有检测到可用的AI CLI工具');
            this.print('💡 请先安装一些AI CLI工具，然后重新运行部署');
        }
    }
}

// 运行
if (require.main === module) {
    const deployer = new StigmergyDeployerWithInstall();
    deployer.run().catch(error => {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = StigmergyDeployerWithInstall;