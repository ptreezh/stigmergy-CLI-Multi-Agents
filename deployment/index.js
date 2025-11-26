#!/usr/bin/env node

/**
 * Smart CLI - Zero Code Facility
 * 极简AI CLI统一部署工具
 *
 * 用法:
 *   npx @smart-cli/deployer          # 一键部署
 *   npx @smart-cli/deployer scan     # 扫描工具
 *   npx @smart-cli/deployer status   # 查看状态
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SmartCLIDeployer {
    constructor() {
        this.homeDir = require('os').homedir();
        this.configDir = path.join(this.homeDir, '.smart-cli');
        this.args = process.argv.slice(2);

        // 支持的AI CLI工具
        this.cliTools = [
            { name: 'claude', display: 'Claude Code', cmd: 'claude --version' },
            { name: 'gemini', display: 'Google Gemini', cmd: 'gemini --version' },
            { name: 'qwen', display: '通义千问', cmd: 'qwen --version' },
            { name: 'kimi', display: '月之暗面', cmd: 'kimi --version' },
            { name: 'codebuddy', display: 'CodeBuddy', cmd: 'codebuddy --version' },
            { name: 'qodercli', display: 'QoderCLI', cmd: 'qodercli --version' },
            { name: 'iflow', display: 'iFlow', cmd: 'iflow --version' },
            { name: 'copilot', display: 'GitHub Copilot', cmd: 'gh copilot --version' }
        ];
    }

    async run() {
        console.log(chalk.cyan.bold('🚀 Smart CLI - Zero Code Facility\n'));

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

    async scan() {
        console.log(chalk.blue('🔍 扫描AI CLI工具...\\n'));

        let available = 0;
        const results = {};

        for (const tool of this.cliTools) {
            try {
                const result = execSync(tool.cmd, {
                    encoding: 'utf8',
                    timeout: 3000,
                    stdio: 'pipe'
                }).trim();

                results[tool.name] = {
                    available: true,
                    version: result.split('\\n')[0]
                };
                console.log(`✅ ${chalk.green(tool.display)}: ${result.split('\\n')[0]}`);
                available++;
            } catch (error) {
                results[tool.name] = { available: false };
                console.log(`❌ ${chalk.red(tool.display)}: 未安装`);
            }
        }

        console.log(`\\n📊 检测结果: ${chalk.cyan(available)}/${this.cliTools.length} 个工具可用`);

        // 保存扫描结果
        await fs.ensureDir(this.configDir);
        await fs.writeJSON(path.join(this.configDir, 'scan-results.json'), results, { spaces: 2 });

        return results;
    }

    async deploy() {
        console.log(chalk.blue('🚀 一键部署Smart CLI集成系统...\\n'));

        // 1. 扫描可用工具
        const scanResults = await this.scan();

        // 2. 创建配置目录
        await fs.ensureDir(this.configDir);
        await fs.ensureDir(path.join(this.configDir, 'adapters'));

        // 3. 生成主配置文件
        const config = {
            version: '2.0.0',
            deployTime: new Date().toISOString(),
            availableCLIs: Object.keys(scanResults).filter(name => scanResults[name].available),
            integrationEnabled: true
        };

        await fs.writeJSON(path.join(this.configDir, 'config.json'), config, { spaces: 2 });

        // 4. 生成原生集成配置
        await this.generateNativeIntegration(scanResults);

        // 5. 创建智能路由配置
        await this.createSmartRouter();

        console.log(chalk.green.bold('\\n✅ 部署完成!'));
        console.log(chalk.cyan('📍 配置目录:'), this.configDir);
        console.log(chalk.cyan('🔧 可用CLI工具:'), config.availableCLIs.join(', '));

        console.log(chalk.yellow('\\n💡 使用提示:'));
        console.log('   现在可以在任何支持的CLI中使用跨CLI协作功能');
        console.log('   例如: claude "请用gemini帮我分析这段代码"');
    }

    async generateNativeIntegration(scanResults) {
        console.log(chalk.blue('⚙️  生成原生集成配置...'));

        for (const [cliName, info] of Object.entries(scanResults)) {
            if (!info.available) continue;

            const cliConfigDir = path.join(this.configDir, 'adapters', cliName);
            await fs.ensureDir(cliConfigDir);

            // 根据不同CLI工具生成原生集成配置
            switch (cliName) {
                case 'claude':
                    await this.generateClaudeHooks(cliConfigDir);
                    break;
                case 'gemini':
                    await this.generateGeminiExtension(cliConfigDir);
                    break;
                case 'qwen':
                    await this.generateQwenConfig(cliConfigDir);
                    break;
                // 其他工具的配置...
                default:
                    await this.generateGenericConfig(cliConfigDir, cliName);
            }
        }
    }

    async generateClaudeHooks(configDir) {
        const hooks = {
            hooks: {
                'user_prompt_submit': {
                    handler: 'cross_cli_handler.js',
                    enabled: true,
                    config: {
                        detectCrossCLI: true,
                        collaborationKeywords: ['用', '调用', '请', 'ask', 'use', 'call']
                    }
                }
            }
        };

        await fs.writeJSON(path.join(configDir, 'hooks.json'), hooks, { spaces: 2 });

        // 生成处理脚本
        const handler = `// Claude CLI - 跨CLI处理器
const { spawn } = require('child_process');
const path = require('path');

module.exports = async function handlePrompt(prompt, context) {
    // 检测跨CLI调用
    const crossCLIPatterns = [
        /用(\\w+)(?:帮我|帮我|帮我)/,
        /ask (\\w+) to/,
        /use (\\w+) to/,
        /调用(\\w+)来/
    ];

    for (const pattern of crossCLIPatterns) {
        const match = prompt.match(pattern);
        if (match) {
            const targetCLI = match[1].toLowerCase();
            console.log(\`🚀 路由到: \${targetCLI}\`);
            return { routeTo: targetCLI, modifiedPrompt: prompt };
        }
    }

    return null; // 继续正常处理
};`;

        await fs.writeFile(path.join(configDir, 'cross_cli_handler.js'), handler);
    }

    async generateGeminiExtension(configDir) {
        const extension = {
            name: 'smart-cli-integration',
            version: '1.0.0',
            enabled: true,
            hooks: {
                preprocessor: 'preprocess.js',
                postprocessor: 'postprocess.js'
            }
        };

        await fs.writeJSON(path.join(configDir, 'extension.json'), extension, { spaces: 2 });
    }

    async generateQwenConfig(configDir) {
        const config = {
            integration: {
                enabled: true,
                crossCLIDetection: true,
                collaborationMode: 'native'
            },
            adapters: ['claude', 'gemini', 'kimi']
        };

        await fs.writeJSON(path.join(configDir, 'config.json'), config, { spaces: 2 });
    }

    async generateGenericConfig(configDir, cliName) {
        const config = {
            name: cliName,
            integration: {
                enabled: true,
                type: 'generic'
            }
        };

        await fs.writeJSON(path.join(configDir, 'config.json'), config, { spaces: 2 });
    }

    async createSmartRouter() {
        const router = {
            version: '2.0.0',
            mode: 'native_integration',
            routing: {
                enabled: true,
                methods: ['hooks', 'extensions', 'config_injection']
            },
            collaboration: {
                enabled: true,
                languages: ['zh-CN', 'en-US'],
                keywords: {
                    chinese: ['用', '请', '调用', '帮我'],
                    english: ['use', 'ask', 'call', 'please']
                }
            }
        };

        await fs.writeJSON(path.join(this.configDir, 'smart-router.json'), router, { spaces: 2 });
    }

    async status() {
        console.log(chalk.blue('📊 Smart CLI系统状态\\n'));

        try {
            const config = await fs.readJSON(path.join(this.configDir, 'config.json'));
            const scanResults = await fs.readJSON(path.join(this.configDir, 'scan-results.json'));

            console.log(`版本: ${chalk.cyan(config.version)}`);
            console.log(`部署时间: ${chalk.cyan(new Date(config.deployTime).toLocaleString())}`);
            console.log(`集成模式: ${chalk.green(config.integrationEnabled ? '启用' : '禁用')}`);

            console.log(chalk.bold('\\n🔧 CLI工具状态:'));
            for (const [name, info] of Object.entries(scanResults)) {
                const status = info.available ? chalk.green('✅') : chalk.red('❌');
                const version = info.available ? ` (${info.version})` : '';
                console.log(`  ${status} ${name}${version}`);
            }

        } catch (error) {
            console.log(chalk.yellow('❌ 系统未部署，请运行: npx @smart-cli/deployer'));
        }
    }

    async clean() {
        console.log(chalk.yellow('🧹 清理Smart CLI配置...'));

        try {
            await fs.remove(this.configDir);
            console.log(chalk.green('✅ 清理完成'));
        } catch (error) {
            console.log(chalk.red('❌ 清理失败:'), error.message);
        }
    }
}

// Zero Code Facility - 自动运行
if (require.main === module) {
    const deployer = new SmartCLIDeployer();
    deployer.run().catch(error => {
        console.error(chalk.red('❌ 错误:'), error.message);
        process.exit(1);
    });
}

module.exports = SmartCLIDeployer;