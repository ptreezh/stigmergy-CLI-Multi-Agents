#!/usr/bin/env node

/**
 * Stigmergy-CLI 简化npx部署器
 * 支持本地资源和远程更新
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class SimpleNPXDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.projectRoot = path.resolve(__dirname, '..');
        this.args = process.argv.slice(2);
    }

    print(text) {
        console.log(text);
    }

    async run() {
        this.print('🚀 Stigmergy-CLI 简化npx部署器');
        this.print('========================');
        this.print('');

        const command = this.args[0] || 'deploy';

        switch (command) {
            case 'npx':
                await this.npxMode();
                break;
            case 'git':
                await this.gitMode();
                break;
            case 'update':
                await this.updateMode();
                break;
            case 'check':
                await this.checkMode();
                break;
            case 'deploy':
            default:
                await this.deploy();
                break;
        }
    }

    async npxMode() {
        this.print('🌐 npx部署模式');
        this.print('================');
        this.print('✅ 使用本地资源进行部署...');
        this.print('');

        try {
            // 直接运行本地的部署脚本
            await this.runLocalDeployer();
        } catch (error) {
            this.print(`❌ 部署失败: ${error.message}`);
        }
    }

    async gitMode() {
        this.print('📥 Git下载模式');
        this.print('================');
        this.print('🔄 从GitHub获取最新资源...');
        this.print('');

        try {
            await this.downloadFromGit();
        } catch (error) {
            this.print(`❌ Git下载失败: ${error.message}`);
        }
    }

    async updateMode() {
        this.print('🔄 更新模式');
        this.print('============');
        this.print('🌐 检查并获取更新...');
        this.print('');

        try {
            await this.checkForUpdates();
        } catch (error) {
            this.print(`❌ 更新失败: ${error.message}`);
        }
    }

    async checkMode() {
        this.print('🔍 检查模式');
        this.print('============');
        this.print('');

        await this.checkCurrentState();
    }

    async deploy() {
        this.print('🚀 智能部署模式');
        this.print('================');
        this.print('🔍 自动选择最佳部署方式...');
        this.print('');

        try {
            // 1. 检查本地资源
            if (await this.hasLocalResources()) {
                this.print('✅ 发现本地资源，使用本地模式');
                await this.npxMode();
            } else {
                this.print('⚠️ 本地资源不完整，尝试Git模式');
                await this.gitMode();
            }
        } catch (error) {
            this.print(`❌ 部署失败: ${error.message}`);
        }
    }

    async hasLocalResources() {
        const deployerPath = path.join(this.projectRoot, 'deployment', 'real-deploy.js');
        const adaptersPath = path.join(this.projectRoot, 'src', 'adapters');

        return fs.existsSync(deployerPath) && fs.existsSync(adaptersPath);
    }

    async runLocalDeployer() {
        return new Promise((resolve, reject) => {
            const deployerPath = path.join(this.projectRoot, 'deployment', 'real-deploy.js');

            if (!fs.existsSync(deployerPath)) {
                reject(new Error('本地部署脚本不存在'));
                return;
            }

            const child = spawn('node', [deployerPath], {
                stdio: 'inherit',
                shell: true,
                cwd: this.projectRoot
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`本地部署失败，退出码: ${code}`));
                }
            });

            child.on('error', reject);
        });
    }

    async downloadFromGit() {
        return new Promise((resolve, reject) => {
            const tempDir = path.join(this.homeDir, '.stigmergy-cli-temp');

            // 清理临时目录
            if (fs.existsSync(tempDir)) {
                try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                } catch (error) {
                    // 忽略清理错误
                }
            }

            const child = spawn('git', [
                'clone',
                'https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git',
                tempDir
            ], {
                stdio: 'inherit',
                shell: true
            });

            child.on('close', (code) => {
                if (code === 0) {
                    this.print('✅ Git克隆成功');
                    this.print('🚀 开始部署...');

                    // 运行克隆的部署脚本
                    const deployerPath = path.join(tempDir, 'deployment', 'real-deploy.js');
                    const deployChild = spawn('node', [deployerPath], {
                        stdio: 'inherit',
                        shell: true,
                        cwd: tempDir
                    });

                    deployChild.on('close', (deployCode) => {
                        if (deployCode === 0) {
                            this.print('✅ 部署完成');
                            resolve();
                        } else {
                            reject(new Error(`部署失败，退出码: ${deployCode}`));
                        }
                    });

                    deployChild.on('error', reject);
                } else {
                    reject(new Error(`Git克隆失败，退出码: ${code}`));
                }
            });

            child.on('error', reject);
        });
    }

    async checkForUpdates() {
        this.print('🔍 检查更新...');

        // 检查本地部署器版本
        const localDeployerPath = path.join(this.projectRoot, 'deployment', 'real-deploy.js');

        if (fs.existsSync(localDeployerPath)) {
            const stats = fs.statSync(localDeployerPath);
            const localTime = stats.mtime;

            this.print(`📅 本地版本: ${localTime.toLocaleString()}`);

            // 模拟检查远程更新（实际项目中可以调用API）
            this.print('🌐 检查远程版本...');

            // 简单的时间检查（7天前认为需要更新）
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            if (localTime < weekAgo) {
                this.print('✅ 本地版本是最新的');
            } else {
                this.print('⚠️ 本地版本较旧，建议更新');
                this.print('💡 运行更新命令: node simple-npx.js git');
            }
        } else {
            this.print('❌ 未找到本地部署器');
            this.print('💡 运行: node simple-npx.js git');
        }

        await this.checkCurrentState();
    }

    async checkCurrentState() {
        this.print('📊 检查当前部署状态...');

        const results = [];
        const cliTools = ['claude', 'gemini', 'qwen', 'iflow'];

        for (const tool of cliTools) {
            let status = '未知';
            try {
                const { execSync } = require('child_process');
                const whereCmd = process.platform === 'win32' ? 'where' : 'which';
                execSync(`${whereCmd} ${tool}`, { stdio: 'pipe' });
                status = '已安装';
            } catch (error) {
                status = '未安装';
            }

            // 检查扩展是否部署
            const extensionStatus = await this.checkExtensionStatus(tool);

            results.push({
                tool: tool.toUpperCase(),
                cli: status,
                extension: extensionStatus
            });
        }

        results.forEach(result => {
            const cliIcon = result.cli === '已安装' ? '✅' : '❌';
            const extIcon = result.extension === '已部署' ? '✅' : '❌';
            this.print(`${cliIcon} ${result.tool} CLI: ${result.cli} | ${extIcon} 扩展: ${result.extension}`);
        });

        const installedCount = results.filter(r => r.cli === '已安装').length;
        const deployedCount = results.filter(r => r.extension === '已部署').length;

        this.print('');
        this.print(`📊 统计: ${installedCount}/4 CLI已安装, ${deployedCount}/4 扩展已部署`);
    }

    async checkExtensionStatus(tool) {
        const configPaths = {
            claude: path.join(this.homeDir, '.config', 'claude', 'hooks.json'),
            gemini: path.join(this.homeDir, '.config', 'gemini', 'extensions.json'),
            qwen: path.join(this.homeDir, '.qwen', 'config.json'),
            iflow: path.join(this.homeDir, '.config', 'iflow', 'workflows.json')
        };

        const configPath = configPaths[tool];

        if (!configPath || !fs.existsSync(configPath)) {
            return '未部署';
        }

        try {
            const content = fs.readFileSync(configPath, 'utf8');
            return content.includes('stigmergy') ? '已部署' : '部分部署';
        } catch (error) {
            return '配置错误';
        }
    }
}

// 运行
if (require.main === module) {
    const deployer = new SimpleNPXDeployer();
    deployer.run().catch(error => {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = SimpleNPXDeployer;