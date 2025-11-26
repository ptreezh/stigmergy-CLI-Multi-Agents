#!/usr/bin/env node

/**
 * Stigmergy-CLI npx远程部署器
 * 支持npx远程获取、Git下载、自动更新CLI扩展
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const https = require('https');
const { execSync } = require('child_process');

class NPXStigmergyDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.tempDir = path.join(this.homeDir, '.stigmergy-cli-temp');
        this.repoUrl = 'https://github.com/ptreezh/stigmergy-CLI-Multi-Agents';
        this.rawUrl = 'https://raw.githubusercontent.com/ptreezh/stigmergy-CLI-Multi-Agents/main';

        // GitHub上的远程配置文件
        this.remoteFiles = {
            realDeploy: 'deployment/real-deploy.js',
            autoInstall: 'deployment/auto-install-cli.js',
            adapters: {
                claude: 'src/adapters/claude',
                gemini: 'src/adapters/gemini',
                qwen: 'src/adapters/qwen',
                iflow: 'src/adapters/iflow'
            },
            configs: {
                claude: '.config/claude/hooks.json',
                gemini: '.config/gemini/extensions.json',
                qwen: '.qwen/config.json',
                iflow: '.config/iflow/workflows.json'
            }
        };

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
        this.print('🚀 Stigmergy-CLI npx远程部署器');
        this.print('==============================');
        this.print('');

        const command = this.args[0] || 'deploy';

        switch (command) {
            case 'npx':
                await this.npxDeploy();
                break;
            case 'git':
                await this.gitDeploy();
                break;
            case 'update':
                await this.updateExtensions();
                break;
            case 'deploy':
            default:
                await this.deploy();
                break;
        }
    }

    async npxDeploy() {
        this.print('🌐 npx远程部署模式');
        this.print('==================');
        this.print('📦 通过npx获取并部署扩展...');
        this.print('');

        try {
            // 1. 下载远程部署脚本
            await this.downloadRemoteDeployer();

            // 2. 运行部署
            await this.runLocalDeployer();

        } catch (error) {
            this.print(`❌ npx部署失败: ${error.message}`);
            this.print('💡 尝试Git下载模式: node npx-deployer.js git');
        }
    }

    async gitDeploy() {
        this.print('📥 Git下载部署模式');
        this.print('==================');
        this.print('🔄 从GitHub下载最新代码...');
        this.print('');

        try {
            // 1. 清理临时目录
            if (fs.existsSync(this.tempDir)) {
                await fs.promises.rm(this.tempDir, { recursive: true, force: true });
            }

            // 2. 克隆仓库
            await this.cloneRepo();

            // 3. 运行本地部署
            await this.runLocalDeployerFromTemp();

        } catch (error) {
            this.print(`❌ Git部署失败: ${error.message}`);
        }
    }

    async updateExtensions() {
        this.print('🔄 更新CLI扩展');
        this.print('================');
        this.print('🌐 从GitHub获取最新扩展文件...');
        this.print('');

        try {
            // 1. 下载适配器文件
            await this.downloadAdapters();

            // 2. 更新配置文件
            await this.updateConfigs();

            // 3. 清理临时文件
            await this.cleanupTemp();

            this.print('✅ 扩展更新完成！');

        } catch (error) {
            this.print(`❌ 更新失败: ${error.message}`);
        }
    }

    async deploy() {
        this.print('🚀 智能部署模式');
        this.print('================');
        this.print('🔍 检测最佳部署方式...');
        this.print('');

        // 尝试不同部署方式
        try {
            this.print('1️⃣ 尝试npx远程部署...');
            await this.npxDeploy();
        } catch (npxError) {
            this.print(`⚠️ npx部署失败，尝试Git下载...`);
            try {
                this.print('2️⃣ 尝试Git下载部署...');
                await this.gitDeploy();
            } catch (gitError) {
                this.print(`⚠️ Git部署失败，使用本地部署...`);
                try {
                    this.print('3️⃣ 使用本地部署...');
                    await this.runLocalDeployer();
                } catch (localError) {
                    this.print(`❌ 所有部署方式都失败`);
                    this.print(`   npx错误: ${npxError.message}`);
                    this.print(`   Git错误: ${gitError.message}`);
                    this.print(`   本地错误: ${localError.message}`);
                }
            }
        }
    }

    async downloadRemoteDeployer() {
        this.print('📥 下载远程部署脚本...');

        await this.ensureDir(this.tempDir);

        const deployerUrl = `${this.rawUrl}/${this.remoteFiles.realDeploy}`;
        const deployerPath = path.join(this.tempDir, 'real-deploy.js');

        await this.downloadFile(deployerUrl, deployerPath);
        this.print('✅ 部署脚本下载完成');
    }

    async downloadFile(url, filePath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filePath);

            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`下载失败: ${response.statusCode}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve();
                });

                file.on('error', (error) => {
                    fs.unlink(filePath, () => {}); // 删除部分下载的文件
                    reject(error);
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    async cloneRepo() {
        return new Promise((resolve, reject) => {
            const child = spawn('git', ['clone', this.repoUrl, this.tempDir], {
                stdio: 'inherit',
                shell: true
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Git克隆失败，退出码: ${code}`));
                }
            });

            child.on('error', reject);
        });
    }

    async runLocalDeployer() {
        return new Promise((resolve, reject) => {
            const deployerPath = path.join(this.tempDir, 'real-deploy.js');

            const child = spawn('node', [deployerPath], {
                stdio: 'inherit',
                shell: true,
                cwd: this.tempDir
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

    async runLocalDeployerFromTemp() {
        return new Promise((resolve, reject) => {
            const deployerPath = path.join(this.tempDir, 'deployment', 'real-deploy.js');

            const child = spawn('node', [deployerPath], {
                stdio: 'inherit',
                shell: true
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

    async downloadAdapters() {
        this.print('📦 下载适配器文件...');

        for (const [cli, adapterPath] of Object.entries(this.remoteFiles.adapters)) {
            try {
                const localAdapterDir = path.join(this.configDir, 'adapters', cli);
                await this.ensureDir(localAdapterDir);

                // 列出远程目录中的文件
                const files = await this.listRemoteFiles(adapterPath);

                for (const file of files) {
                    if (file.endsWith('.py') || file.endsWith('.json')) {
                        const remoteUrl = `${this.rawUrl}/${adapterPath}/${file}`;
                        const localPath = path.join(localAdapterDir, file);

                        await this.downloadFile(remoteUrl, localPath);
                    }
                }

                this.print(`   ✅ ${cli.toUpperCase()} 适配器已下载`);
            } catch (error) {
                this.print(`   ⚠️ ${cli.toUpperCase()} 适配器下载失败: ${error.message}`);
            }
        }
    }

    async listRemoteFiles(dirPath) {
        // 这是一个简化的实现，实际中可能需要GitHub API
        // 这里我们假设一些常见的文件名
        const commonFiles = [
            'hook_adapter.py',
            'standalone_claude_adapter.py',
            'skills_hook_adapter.py',
            'claude_skills_integration.py',
            'config.json',
            '__init__.py'
        ];

        // 根据CLI类型返回不同的文件列表
        const cliFiles = {
            claude: commonFiles,
            gemini: ['extension_adapter.py', 'config.json', '__init__.py'],
            qwen: ['standalone_qwencode_adapter.py', 'config.json', '__init__.py'],
            iflow: ['workflow_adapter.py', 'config.json', '__init__.py']
        };

        return cliFiles[dirPath.split('/').pop()] || commonFiles;
    }

    async updateConfigs() {
        this.print('⚙️ 更新配置文件...');

        for (const [cli, configPath] of Object.entries(this.remoteFiles.configs)) {
            try {
                const fullConfigPath = path.join(this.homeDir, configPath);
                const configDir = path.dirname(fullConfigPath);

                await this.ensureDir(configDir);

                // 检查远程配置文件是否存在
                const remoteUrl = `${this.rawUrl}/deployment/configs/${cli}.json`;

                try {
                    const localConfigPath = path.join(configDir, path.basename(configPath));
                    await this.downloadFile(remoteUrl, localConfigPath);
                    this.print(`   ✅ ${cli.toUpperCase()} 配置已更新`);
                } catch (error) {
                    // 如果远程配置不存在，生成默认配置
                    await this.generateDefaultConfig(cli, fullConfigPath);
                    this.print(`   ✅ ${cli.toUpperCase()} 默认配置已生成`);
                }
            } catch (error) {
                this.print(`   ⚠️ ${cli.toUpperCase()} 配置更新失败: ${error.message}`);
            }
        }
    }

    async generateDefaultConfig(cli, configPath) {
        const defaultConfigs = {
            claude: {
                version: "1.0.0",
                hooks: {
                    "user_prompt_submit": {
                        enabled: true,
                        handler: "python",
                        script_path: path.join(this.configDir, 'adapters', 'claude', 'hook_handler.py'),
                        config: {
                            detect_cross_cli: true,
                            collaboration_keywords: ["用", "请", "调用", "帮我", "ask", "use", "call"],
                            routing_enabled: true
                        }
                    }
                }
            },
            gemini: {
                version: "1.0.0",
                extensions: [
                    {
                        name: "stigmergy-cross-cli",
                        enabled: true,
                        type: "preprocessor",
                        entry_point: path.join(this.configDir, 'adapters', 'gemini', 'extension.py'),
                        config: {
                            cross_cli_detection: true,
                            collaboration_keywords: ["用", "请", "调用", "帮我"],
                            auto_routing: true
                        }
                    }
                ]
            },
            qwen: {
                version: "1.0.0",
                integration: {
                    enabled: true,
                    type: "class_extension",
                    adapter_class: "StigmergyQwenAdapter",
                    cross_cli_enabled: true,
                    collaboration_config: {
                        keywords: ["用", "请", "调用", "帮我"],
                        auto_route: true
                    }
                }
            },
            iflow: {
                version: "1.0.0",
                workflows: [
                    {
                        name: "stigmergy-cross-cli",
                        enabled: true,
                        trigger_type: "natural_language",
                        entry_point: path.join(this.configDir, 'adapters', 'iflow', 'workflow_handler.py'),
                        config: {
                            cross_cli_enabled: true,
                            collaboration_keywords: ["用", "请", "调用", "帮我"],
                            auto_route: true
                        }
                    }
                ]
            }
        };

        const config = defaultConfigs[cli];
        if (config) {
            await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
        }
    }

    async cleanupTemp() {
        try {
            if (fs.existsSync(this.tempDir)) {
                await fs.promises.rm(this.tempDir, { recursive: true, force: true });
                this.print('🧹 临时文件已清理');
            }
        } catch (error) {
            this.print(`⚠️ 清理临时文件失败: ${error.message}`);
        }
    }
}

// 运行
if (require.main === module) {
    const deployer = new NPXStigmergyDeployer();
    deployer.run().catch(error => {
        console.error(`❌ 部署失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = NPXStigmergyDeployer;