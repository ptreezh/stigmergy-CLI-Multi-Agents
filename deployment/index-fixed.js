#!/usr/bin/env node

/**
 * Stigmergy-CLI - Zero Code Facility (修复版)
 * 修复了CLI检测和显示问题
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class StigmergyCLIDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.args = process.argv.slice(2);

        // 支持的AI CLI工具
        this.cliTools = [
            { name: 'claude', display: 'Claude Code', cmd: 'claude', args: ['--version'] },
            { name: 'gemini', display: 'Google Gemini', cmd: 'gemini', args: ['--version'] },
            { name: 'qwen', display: '通义千问', cmd: 'qwen', args: ['--version'] },
            { name: 'kimi', display: '月之暗面', cmd: 'kimi', args: ['--version'] },
            { name: 'codebuddy', display: 'CodeBuddy', cmd: 'codebuddy', args: ['--version'] },
            { name: 'qodercli', display: 'QoderCLI', cmd: 'qodercli', args: ['--version'] },
            { name: 'iflow', display: 'iFlow', cmd: 'iflow', args: ['--version'] },
            { name: 'copilot', display: 'GitHub Copilot', cmd: 'gh', args: ['copilot', '--version'] }
        ];
    }

    log(text, type = 'info') {
        const colors = {
            reset: '\\x1b[0m',
            bright: '\\x1b[1m',
            red: '\\x1b[31m',
            green: '\\x1b[32m',
            yellow: '\\x1b[33m',
            blue: '\\x1b[34m',
            magenta: '\\x1b[35m',
            cyan: '\\x1b[36m',
            white: '\\x1b[37m'
        };

        let prefix = '';
        switch (type) {
            case 'success': prefix = '✅ '; break;
            case 'error': prefix = '❌ '; break;
            case 'warning': prefix = '⚠️ '; break;
            case 'info': prefix = 'ℹ️ '; break;
            default: prefix = '';
        }

        console.log(`${prefix}${text}${colors.reset}`);
    }

    async ensureDir(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            if (error.code !== 'EEXIST') {
                this.log(`创建目录失败: ${error.message}`, 'error');
                return false;
            }
            return true;
        }
    }

    async run() {
        console.log('\\x1b[36m\\x1b[1m🚀 Stigmergy-CLI - Zero Code Facility\\x1b[0m');
        console.log('');

        const command = this.args[0] || 'deploy';

        switch (command) {
            case 'scan':
                await this.scan();
                break;
            case 'status':
                await this.status();
                break;
            case 'clean':
                await this.clean();
                break;
            case 'deploy':
            default:
                await this.deploy();
                break;
        }
    }

    async checkCommand(command, args = []) {
        return new Promise((resolve) => {
            const child = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
                timeout: 5000
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        available: true,
                        version: stdout.trim().split('\\n')[0] || 'Unknown version'
                    });
                } else {
                    resolve({ available: false, error: stderr.trim() });
                }
            });

            child.on('error', (error) => {
                resolve({ available: false, error: error.message });
            });
        });
    }

    async scan() {
        this.log('🔍 扫描AI CLI工具...', 'info');
        console.log('');

        let available = 0;
        const results = {};

        for (const tool of this.cliTools) {
            process.stdout.write(`检测 ${tool.display}... `);

            const result = await this.checkCommand(tool.cmd, tool.args);
            results[tool.name] = result;

            if (result.available) {
                console.log(`\\x1b[32m✅ 可用\\x1b[0m - ${result.version}`);
                available++;
            } else {
                console.log(`\\x1b[31m❌ 未安装\\x1b[0m`);
                if (result.error && !result.error.includes('not found')) {
                    console.log(`   错误: ${result.error.substring(0, 50)}...`);
                }
            }
        }

        console.log('');
        this.log(`📊 检测结果: ${available}/${this.cliTools.length} 个工具可用`, 'info');

        // 保存扫描结果
        const dirOk = await this.ensureDir(this.configDir);
        if (dirOk) {
            try {
                await fs.promises.writeFile(
                    path.join(this.configDir, 'scan-results.json'),
                    JSON.stringify(results, null, 2)
                );
                this.log(`扫描结果已保存到: ${path.join(this.configDir, 'scan-results.json')}`, 'success');
            } catch (error) {
                this.log(`保存扫描结果失败: ${error.message}`, 'error');
            }
        }

        return results;
    }

    async deploy() {
        this.log('🚀 一键部署Stigmergy-CLI集成系统...', 'info');
        console.log('');

        // 1. 扫描可用工具
        const scanResults = await this.scan();

        // 2. 创建配置目录
        this.log('创建配置目录...', 'info');
        const configDirOk = await this.ensureDir(this.configDir);
        const adaptersDirOk = await this.ensureDir(path.join(this.configDir, 'adapters'));

        if (!configDirOk || !adaptersDirOk) {
            this.log('配置目录创建失败，部署终止', 'error');
            return;
        }

        // 3. 生成主配置文件
        const availableCLIs = Object.keys(scanResults).filter(name => scanResults[name].available);
        const config = {
            version: '2.0.0',
            deployTime: new Date().toISOString(),
            platform: process.platform,
            nodeVersion: process.version,
            availableCLIs: availableCLIs,
            totalCLIs: this.cliTools.length,
            integrationEnabled: true,
            mode: 'native_integration',
            features: {
                crossCLIRouting: true,
                multilingualSupport: true,
                zeroConfig: true,
                nativeIntegration: true
            }
        };

        try {
            await fs.promises.writeFile(
                path.join(this.configDir, 'config.json'),
                JSON.stringify(config, null, 2)
            );
            this.log('主配置文件已生成', 'success');
        } catch (error) {
            this.log(`配置文件生成失败: ${error.message}`, 'error');
            return;
        }

        // 4. 生成智能路由配置
        this.log('生成智能路由配置...', 'info');
        await this.createSmartRouter(scanResults);

        // 5. 生成集成配置
        if (availableCLIs.length > 0) {
            this.log('生成CLI集成配置...', 'info');
            await this.generateIntegrations(availableCLIs, scanResults);
        }

        // 6. 完成部署
        console.log('');
        this.log('🎉 部署完成!', 'success');
        console.log('');
        console.log(`📍 配置目录: \\x1b[36m${this.configDir}\\x1b[0m`);
        console.log(`🔧 可用CLI工具: \\x1b[32m${availableCLIs.join(', ') || '无'}\\x1b[0m`);
        console.log(`📊 检测成功率: \\x1b[33m${availableCLIs.length}/${this.cliTools.length}\\x1b[0m`);

        if (availableCLIs.length > 0) {
            console.log('');
            this.log('💡 使用提示:', 'info');
            console.log('   现在可以在支持的CLI中使用跨CLI协作功能');
            console.log('   例如: claude "用gemini帮我分析这段代码"');
        } else {
            console.log('');
            this.log('⚠️ 未检测到可用的CLI工具', 'warning');
            console.log('   请先安装一些AI CLI工具，然后重新运行部署');
        }
    }

    async createSmartRouter(scanResults) {
        const availableCLIs = Object.keys(scanResults).filter(name => scanResults[name].available);

        const router = {
            version: '2.0.0',
            mode: 'native_integration',
            availableCLIs: availableCLIs,
            routing: {
                enabled: true,
                confidence: 0.8,
                patterns: {
                    chinese: {
                        direct: ['用(\\w+)', '请(\\w+)', '调用(\\w+)'],
                        collaborative: ['用(\\w+)(?:帮我|协助)', '请(\\w+)(?:帮我|协助)', '让(\\w+)(?:帮我|协助)'],
                        casual: ['(\\w+)帮我', '(\\w+)协助', '(\\w+)来']
                    },
                    english: {
                        direct: ['use (\\w+)', 'ask (\\w+)', 'call (\\w+)'],
                        collaborative: ['use (\\w+) to', 'ask (\\w+) to', 'call (\\w+) to'],
                        casual: ['(\\w+) help', '(\\w+) assist', '(\\w+) please']
                    }
                }
            },
            collaboration: {
                enabled: true,
                languages: ['zh-CN', 'en-US'],
                autoRoute: true,
                fallbackToOriginal: true
            }
        };

        try {
            await fs.promises.writeFile(
                path.join(this.configDir, 'smart-router.json'),
                JSON.stringify(router, null, 2)
            );
            this.log('智能路由配置已生成', 'success');
        } catch (error) {
            this.log(`路由配置生成失败: ${error.message}`, 'error');
        }
    }

    async generateIntegrations(availableCLIs, scanResults) {
        const integrations = {};

        for (const cli of availableCLIs) {
            integrations[cli] = {
                enabled: true,
                version: scanResults[cli].version,
                integrationType: this.getIntegrationType(cli),
                features: this.getCLIFeatures(cli)
            };
        }

        try {
            await fs.promises.writeFile(
                path.join(this.configDir, 'integrations.json'),
                JSON.stringify(integrations, null, 2)
            );
            this.log(`为 ${availableCLIs.length} 个CLI生成集成配置`, 'success');
        } catch (error) {
            this.log(`集成配置生成失败: ${error.message}`, 'error');
        }
    }

    getIntegrationType(cli) {
        const types = {
            claude: 'hooks',
            gemini: 'extensions',
            qwen: 'class_inheritance',
            kimi: 'config_injection',
            codebuddy: 'plugins',
            qodercli: 'plugins',
            iflow: 'workflows',
            copilot: 'extensions'
        };
        return types[cli] || 'generic';
    }

    getCLIFeatures(cli) {
        const features = {
            claude: ['code_analysis', 'documentation', 'architecture', 'debugging'],
            gemini: ['code_generation', 'optimization', 'testing', 'refactoring'],
            qwen: ['chinese_processing', 'translation', 'localization', 'cultural_context'],
            kimi: ['file_processing', 'document_analysis', 'translation', 'content_generation'],
            codebuddy: ['code_completion', 'snippet_management', 'project_templates'],
            qodercli: ['code_generation', 'pattern_recognition', 'best_practices'],
            iflow: ['workflow_automation', 'task_management', 'process_optimization'],
            copilot: ['pair_programming', 'code_suggestions', 'inline_assistance']
        };
        return features[cli] || ['general_assistance'];
    }

    async status() {
        console.log('\\x1b[34m📊 Stigmergy-CLI系统状态\\x1b[0m');
        console.log('');

        try {
            const configPath = path.join(this.configDir, 'config.json');
            const scanResultsPath = path.join(this.configDir, 'scan-results.json');

            if (!fs.existsSync(configPath)) {
                this.log('❌ 系统未部署，请运行: node index-fixed.js', 'error');
                return;
            }

            const config = JSON.parse(await fs.promises.readFile(configPath));

            console.log(`版本: \\x1b[36m${config.version}\\x1b[0m`);
            console.log(`平台: \\x1b[36m${config.platform}\\x1b[0m`);
            console.log(`Node.js: \\x1b[36m${config.nodeVersion}\\x1b[0m`);
            console.log(`部署时间: \\x1b[33m${new Date(config.deployTime).toLocaleString()}\\x1b[0m`);
            console.log(`集成模式: \\x1b[32m${config.integrationEnabled ? '启用' : '禁用'}\\x1b[0m`);
            console.log(`可用工具: \\x1b[33m${config.availableCLIs.length}/${config.totalCLIs}\\x1b[0m`);

            if (fs.existsSync(scanResultsPath)) {
                const scanResults = JSON.parse(await fs.promises.readFile(scanResultsPath));
                console.log('');
                console.log('\\x1b[1m🔧 CLI工具状态:\\x1b[0m');

                for (const [name, info] of Object.entries(scanResults)) {
                    const status = info.available ? '\\x1b[32m✅\\x1b[0m' : '\\x1b[31m❌\\x1b[0m';
                    const version = info.available && info.version ? ` (${info.version})` : '';
                    console.log(`  ${status} ${name}${version}`);
                }
            }

        } catch (error) {
            this.log(`❌ 读取状态失败: ${error.message}`, 'error');
        }
    }

    async clean() {
        this.log('🧹 清理Stigmergy-CLI配置...', 'warning');

        try {
            await fs.promises.rm(this.configDir, { recursive: true, force: true });
            this.log('✅ 清理完成', 'success');
        } catch (error) {
            this.log(`❌ 清理失败: ${error.message}`, 'error');
        }
    }
}

// 运行部署工具
if (require.main === module) {
    const deployer = new StigmergyCLIDeployer();
    deployer.run().catch(error => {
        console.error(`\\x1b[31m❌ 程序错误: ${error.message}\\x1b[0m`);
        process.exit(1);
    });
}

module.exports = StigmergyCLIDeployer;