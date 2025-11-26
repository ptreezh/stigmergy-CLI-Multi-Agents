#!/usr/bin/env node

/**
 * Stigmergy-CLI 指定工具自动安装部署器
 * 自动检测、下载、安装指定的CLI工具并部署扩展
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class AutoCLIInstaller {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.projectRoot = path.resolve(__dirname, '..');
        this.adaptersDir = path.join(this.projectRoot, 'src', 'adapters');

        // 请在这里修改为你指定的四个CLI工具
        this.targetCLIs = [
            {
                key: 'claude',
                name: 'Claude Code',
                npmPackage: '@anthropic-ai/claude-code',
                testCmd: 'claude --version',
                website: 'https://claude.ai/code',
                description: 'Anthropic Claude CLI工具'
            },
            {
                key: 'gemini',
                name: 'Google Gemini CLI',
                npmPackage: '@google/gemini-cli',
                testCmd: 'gemini --version',
                website: 'https://ai.google.dev/',
                description: 'Google Gemini AI CLI工具'
            },
            {
                key: 'qwen',
                name: '通义千问 CLI',
                npmPackage: '@qwen-code/qwen-code',
                testCmd: 'qwen --version',
                website: 'https://qwen.ai/',
                description: '阿里通义千问CLI工具'
            },
            {
                key: 'iflow',
                name: 'iFlow CLI',
                npmPackage: '@iflow-ai/iflow-cli@latest',
                testCmd: 'iflow --version',
                website: 'https://iflow.ai/',
                description: 'iFlow智能流程CLI工具'
            }
        ];

        this.args = process.argv.slice(2);
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
        this.print('🚀 Stigmergy-CLI 指定工具自动安装器');
        this.print('==================================');
        this.print('');
        this.print('🎯 目标工具:');
        this.targetCLIs.forEach((cli, index) => {
            this.print(`   ${index + 1}. ${cli.name} (${cli.key})`);
            this.print(`      网址: ${cli.website}`);
            this.print(`      包名: ${cli.npmPackage}`);
        });
        this.print('');

        const command = this.args[0] || 'auto-install';

        switch (command) {
            case 'check':
                await this.check();
                break;
            case 'install':
                await this.install();
                break;
            case 'auto-install':
            default:
                await this.autoInstall();
                break;
        }
    }

    async checkCommand(cmd) {
        return new Promise((resolve) => {
            const whereCmd = process.platform === 'win32' ? 'where' : 'which';
            const child = spawn(whereCmd, [cmd], {
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

    async check() {
        this.print('🔍 检查指定CLI工具的安装状态...');
        this.print('');

        const results = {};
        let availableCount = 0;

        for (const cli of this.targetCLIs) {
            process.stdout.write(`检查 ${cli.name}... `);

            const isAvailable = await this.checkCommand(cli.key);

            if (isAvailable) {
                this.print('✅ 已安装');
                availableCount++;
                results[cli.key] = { installed: true, name: cli.name };
            } else {
                this.print('❌ 未安装');
                results[cli.key] = { installed: false, name: cli.name, needInstall: true };
            }
        }

        this.print('');
        this.print(`📊 检查结果: ${availableCount}/${this.targetCLIs.length} 个工具已安装`);

        const missing = Object.values(results).filter(r => !r.installed).length;
        if (missing > 0) {
            this.print(`💡 可以运行以下命令安装缺失的工具:`);
            this.print(`   node auto-install-cli.js auto-install`);
        }

        return results;
    }

    async install() {
        this.print('🔧 手动安装指定的CLI工具...');
        this.print('');

        // 先检查状态
        const checkResults = await this.check();
        const missingCLIs = this.targetCLIs.filter(cli => !checkResults[cli.key].installed);

        if (missingCLIs.length === 0) {
            this.print('✅ 所有指定工具都已安装！');
            return;
        }

        this.print('');
        this.print(`发现 ${missingCLIs.length} 个未安装的工具:`);
        missingCLIs.forEach((cli, index) => {
            this.print(`${index + 1}. ${cli.name}`);
            this.print(`   npm包: ${cli.npmPackage}`);
        });

        this.print('');
        this.print('🎯 选择安装选项:');
        this.print('1. 安装所有缺失工具');
        this.print('2. 选择性安装');
        this.print('');

        // 简单的交互
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const choice = await new Promise(resolve => {
            rl.question('请选择 (1-2, 默认1): ', (answer) => {
                resolve(answer || '1');
            });
        });

        switch (choice) {
            case '1':
                await this.installAll(missingCLIs);
                break;
            case '2':
                await this.installSelective(missingCLIs);
                break;
            default:
                this.print('❌ 无效选择');
                break;
        }

        rl.close();
    }

    async autoInstall() {
        this.print('🤖 自动安装并部署指定的CLI工具...');
        this.print('');

        // 检查当前状态
        const checkResults = await this.check();
        const missingCLIs = this.targetCLIs.filter(cli => !checkResults[cli.key].installed);

        if (missingCLIs.length === 0) {
            this.print('✅ 所有指定工具都已安装！');
            this.print('🚀 开始部署扩展...');
            await this.deployExtensions();
            return;
        }

        this.print('');
        this.print(`📦 开始自动安装 ${missingCLIs.length} 个工具...`);

        let successCount = 0;
        let failCount = 0;

        for (const [index, cli] of missingCLIs.entries()) {
            this.print(`${index + 1}/${missingCLIs.length}. 安装 ${cli.name}...`);

            try {
                this.print(`   执行: npm install -g ${cli.npmPackage}`);
                await this.runCommand(`npm install -g ${cli.npmPackage}`);

                // 验证安装
                const isInstalled = await this.checkCommand(cli.key);
                if (isInstalled) {
                    this.print(`   ✅ ${cli.name} 安装成功`);
                    successCount++;
                } else {
                    this.print(`   ⚠️ ${cli.name} 安装完成但检测失败`);
                    successCount++;
                }
            } catch (error) {
                this.print(`   ❌ ${cli.name} 安装失败: ${error.message}`);
                this.print(`   💡 请手动运行: npm install -g ${cli.npmPackage}`);
                failCount++;
            }
            this.print('');
        }

        this.print(`📊 安装结果: ${successCount} 成功, ${failCount} 失败`);

        if (successCount > 0) {
            this.print('🚀 开始部署扩展...');
            await this.deployExtensions();
        }
    }

    async installAll(clis) {
        this.print(`📦 开始安装 ${clis.length} 个工具...`);
        this.print('');

        let successCount = 0;

        for (const [index, cli] of clis.entries()) {
            this.print(`${index + 1}/${clis.length}. 安装 ${cli.name}...`);

            try {
                this.print(`   执行: npm install -g ${cli.npmPackage}`);
                await this.runCommand(`npm install -g ${cli.npmPackage}`);

                // 验证安装
                const isInstalled = await this.checkCommand(cli.key);
                if (isInstalled) {
                    this.print(`   ✅ ${cli.name} 安装成功`);
                    successCount++;
                } else {
                    this.print(`   ⚠️ ${cli.name} 安装完成但检测失败`);
                    successCount++;
                }
            } catch (error) {
                this.print(`   ❌ ${cli.name} 安装失败: ${error.message}`);
                this.print(`   💡 请手动运行: npm install -g ${cli.npmPackage}`);
            }
            this.print('');
        }

        this.print(`📊 安装结果: ${successCount}/${clis.length} 成功`);

        if (successCount > 0) {
            this.print('💡 安装完成后，可以运行部署:');
            this.print('   node auto-install-cli.js auto-install');
        }
    }

    async installSelective(clis) {
        this.print('📦 选择要安装的工具 (用空格分隔，例如: 1 3):');
        this.print('');

        clis.forEach((cli, index) => {
            this.print(`${index + 1}. ${cli.name} (${cli.npmPackage})`);
        });

        this.print('');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const selected = await new Promise(resolve => {
            rl.question('请选择要安装的工具编号: ', (answer) => {
                const indices = answer.split(' ').map(n => parseInt(n) - 1).filter(n => n >= 0 && n < clis.length);
                const selectedTools = indices.map(i => clis[i]);
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

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, {
                stdio: 'inherit',
                shell: true,
                timeout: 180000 // 3分钟超时
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

    async deployExtensions() {
        this.print('🚀 部署原生CLI扩展...');
        this.print('');

        // 使用真实部署工具
        const realDeployPath = path.join(__dirname, 'real-deploy.js');

        if (fs.existsSync(realDeployPath)) {
            try {
                const { spawn } = require('child_process');
                await new Promise((resolve, reject) => {
                    const child = spawn('node', [realDeployPath], {
                        stdio: 'inherit',
                        shell: true
                    });

                    child.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error(`部署失败，退出码: ${code}`));
                        }
                    });

                    child.on('error', reject);
                });

                this.print('✅ 扩展部署完成！');
            } catch (error) {
                this.print(`❌ 扩展部署失败: ${error.message}`);
                this.print('💡 请手动运行: node real-deploy.js');
            }
        } else {
            this.print('❌ 找不到部署脚本，请确保 real-deploy.js 存在');
        }

        this.print('');
        this.print('🎉 自动安装和部署完成！');
        this.print('========================');
        this.print('💡 现在可以使用跨CLI协作功能:');
        this.print('   claude "用gemini帮我分析代码"');
        this.print('   gemini "请claude设计架构"');
        this.print('   qwen "用iflow处理流程"');
    }
}

// 运行
if (require.main === module) {
    const installer = new AutoCLIInstaller();
    installer.run().catch(error => {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = AutoCLIInstaller;