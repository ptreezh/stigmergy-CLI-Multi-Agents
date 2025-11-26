#!/usr/bin/env node

/**
 * Smart CLI - Zero Code Facility (简化版)
 * 极简AI CLI统一部署工具 - 无外部依赖
 *
 * 用法:
 *   node index-simple.js            # 一键部署
 *   node index-simple.js scan       # 扫描工具
 *   node index-simple.js status     # 查看状态
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class SmartCLIDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
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

    log(text, color = 'white') {
        const colors = {
            red: '\\x1b[31m',
            green: '\\x1b[32m',
            yellow: '\\x1b[33m',
            blue: '\\x1b[34m',
            cyan: '\\x1b[36m',
            white: '\\x1b[37m',
            bold: '\\x1b[1m',
            reset: '\\x1b[0m'
        };

        console.log(`${colors[color]}${text}${colors.reset}`);
    }

    async ensureDir(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }

    async run() {
        this.log('🚀 Stigmergy-CLI - Zero Code Facility\\n', 'cyan+bold');

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
        this.log('🔍 扫描AI CLI工具...\\n', 'blue');

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
                console.log(`✅ ${tool.display}: ${result.split('\\n')[0]}`);
                available++;
            } catch (error) {
                results[tool.name] = { available: false };
                console.log(`❌ ${tool.display}: 未安装`);
            }
        }

        console.log(`\\n📊 检测结果: ${available}/${this.cliTools.length} 个工具可用`);

        // 保存扫描结果
        await this.ensureDir(this.configDir);
        await fs.promises.writeFile(
            path.join(this.configDir, 'scan-results.json'),
            JSON.stringify(results, null, 2)
        );

        return results;
    }

    async deploy() {
        this.log('🚀 一键部署Stigmergy-CLI集成系统...\\n', 'blue');

        // 1. 扫描可用工具
        const scanResults = await this.scan();

        // 2. 创建配置目录
        await this.ensureDir(this.configDir);
        await this.ensureDir(path.join(this.configDir, 'adapters'));

        // 3. 生成主配置文件
        const config = {
            version: '2.0.0',
            deployTime: new Date().toISOString(),
            availableCLIs: Object.keys(scanResults).filter(name => scanResults[name].available),
            integrationEnabled: true,
            mode: 'native_integration'
        };

        await fs.promises.writeFile(
            path.join(this.configDir, 'config.json'),
            JSON.stringify(config, null, 2)
        );

        // 4. 生成智能路由配置
        await this.createSmartRouter(scanResults);

        this.log('\\n✅ 部署完成!', 'green+bold');
        this.log(`📍 配置目录: ${this.configDir}`, 'cyan');
        this.log(`🔧 可用CLI工具: ${config.availableCLIs.join(', ')}`, 'cyan');

        this.log('\\n💡 使用提示:', 'yellow');
        this.log('   现在可以在任何支持的CLI中使用跨CLI协作功能', 'white');
        this.log('   例如: claude "请用gemini帮我分析这段代码"', 'white');
    }

    async createSmartRouter(scanResults) {
        this.log('⚙️  生成智能路由配置...', 'blue');

        const router = {
            version: '2.0.0',
            mode: 'native_integration',
            availableCLIs: Object.keys(scanResults).filter(name => scanResults[name].available),
            routing: {
                enabled: true,
                patterns: {
                    chinese: ['用(\\w+)(?:帮我|帮我)', '调用(\\w+)来', '请(\\w+)帮我'],
                    english: ['use (\\w+) to', 'ask (\\w+) to', 'call (\\w+) to']
                }
            },
            collaboration: {
                enabled: true,
                languages: ['zh-CN', 'en-US']
            }
        };

        await fs.promises.writeFile(
            path.join(this.configDir, 'smart-router.json'),
            JSON.stringify(router, null, 2)
        );

        // 生成使用说明
        const readme = `# Smart CLI 集成系统

## 📋 可用工具
${router.availableCLIs.map(cli => `- ${cli}`).join('\\n')}

## 🚀 使用方法

### 中文协作模式
- "用claude帮我分析这段代码"
- "请gemini解释这个函数"
- "调用kimi来翻译"

### 英文协作模式
- "use claude to analyze this code"
- "ask gemini to explain this function"
- "call kimi to translate"

## ⚙️ 配置文件位置
${this.configDir}

部署时间: ${new Date().toLocaleString()}
`;

        await fs.promises.writeFile(path.join(this.configDir, 'README.md'), readme);
    }

    async status() {
        this.log('📊 Stigmergy-CLI系统状态\\n', 'blue');

        try {
            const config = JSON.parse(
                await fs.promises.readFile(path.join(this.configDir, 'config.json'))
            );
            const scanResults = JSON.parse(
                await fs.promises.readFile(path.join(this.configDir, 'scan-results.json'))
            );

            this.log(`版本: ${config.version}`, 'cyan');
            this.log(`部署时间: ${new Date(config.deployTime).toLocaleString()}`, 'cyan');
            this.log(`集成模式: ${config.integrationEnabled ? '启用' : '禁用'}`,
                     config.integrationEnabled ? 'green' : 'red');

            this.log('\\n🔧 CLI工具状态:', 'white+bold');
            for (const [name, info] of Object.entries(scanResults)) {
                const status = info.available ? '✅' : '❌';
                const version = info.available ? ` (${info.version})` : '';
                console.log(`  ${status} ${name}${version}`);
            }

        } catch (error) {
            this.log('❌ 系统未部署，请运行: node index-simple.js', 'yellow');
        }
    }

    async clean() {
        this.log('🧹 清理Stigmergy-CLI配置...', 'yellow');

        try {
            await fs.promises.rm(this.configDir, { recursive: true, force: true });
            this.log('✅ 清理完成', 'green');
        } catch (error) {
            this.log(`❌ 清理失败: ${error.message}`, 'red');
        }
    }
}

// Zero Code Facility - 自动运行
if (require.main === module) {
    const deployer = new SmartCLIDeployer();
    deployer.run().catch(error => {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = SmartCLIDeployer;