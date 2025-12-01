#!/usr/bin/env node

/**
 * Stigmergy-CLI - 工具配置部署脚本 (基础版)
 * =================================================================
 * 这是一个简单的工具扫描和配置脚本，用于：
 * 1. 扫描用户系统中已安装的AI CLI工具
 * 2. 创建配置文件和目录结构
 * 3. 生成使用说明文档
 * 
 * 与 src/deploy.js 不同：
 * - src/deploy.js: 项目的主部署脚本，用于构建和发布整个项目
 * - deployment/deploy-with-install.js: 增强版工具配置脚本，支持自动安装缺失的工具
 * 
 * 使用方法:
 *   npm run deploy-tools
 *   node deployment/deploy.js
 * =================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class StigmergyDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
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
        this.print('🚀 Stigmergy-CLI - Zero Code Facility');
        this.print('=====================================');
        this.print('');

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
        this.print('🔍 检测AI CLI工具...');
        this.print('');

        // 简单检测：通过which/where命令检查
        const tools = [
            'claude', 'gemini', 'qwen', 'kimi',
            'codebuddy', 'qodercli', 'iflow'
        ];

        const results = {};
        let available = 0;

        for (const tool of tools) {
            try {
                const whereCmd = process.platform === 'win32' ? 'where' : 'which';
                const { execSync } = require('child_process');

                const result = execSync(`${whereCmd} ${tool}`, {
                    encoding: 'utf8',
                    stdio: 'pipe'
                }).trim();

                if (result) {
                    results[tool] = {
                        available: true,
                        path: result.split('\\n')[0]
                    };
                    this.print(`✅ ${tool}: 可用`);
                    available++;
                }
            } catch (error) {
                results[tool] = { available: false };
                this.print(`❌ ${tool}: 未安装`);
            }
        }

        // 特殊检测GitHub Copilot
        try {
            const { execSync } = require('child_process');
            execSync('gh --help', { stdio: 'pipe' });
            results['copilot'] = { available: true };
            this.print('✅ GitHub Copilot: 可用');
            available++;
        } catch (error) {
            results['copilot'] = { available: false };
            this.print('❌ GitHub Copilot: 未安装');
        }

        this.print('');
        this.print(`📊 检测结果: ${available}/${tools.length + 1} 个工具可用`);

        // 保存结果
        await this.ensureDir(this.configDir);
        await fs.promises.writeFile(
            path.join(this.configDir, 'scan-results.json'),
            JSON.stringify(results, null, 2)
        );

        this.print(`✅ 配置已保存到: ${this.configDir}`);

        return results;
    }

    async deploy() {
        this.print('🚀 开始部署Stigmergy-CLI集成系统...');
        this.print('');

        // 1. 扫描工具
        const scanResults = await this.scan();

        // 2. 创建配置
        const availableCLIs = Object.keys(scanResults).filter(name => scanResults[name].available);

        const config = {
            version: '2.0.0',
            deployTime: new Date().toISOString(),
            platform: process.platform,
            availableCLIs: availableCLIs,
            totalDetected: Object.keys(scanResults).length,
            integrationEnabled: true,
            features: {
                crossCLIRouting: true,
                multilingualSupport: true,
                zeroConfig: true
            }
        };

        // 3. 创建配置目录
        await this.ensureDir(this.configDir);
        await this.ensureDir(path.join(this.configDir, 'adapters'));

        // 4. 保存配置
        await fs.promises.writeFile(
            path.join(this.configDir, 'config.json'),
            JSON.stringify(config, null, 2)
        );

        // 5. 创建路由配置
        const routerConfig = {
            version: '2.0.0',
            availableCLIs: availableCLIs,
            patterns: {
                chinese: ['用', '请', '调用', '帮我'],
                english: ['use', 'ask', 'call', 'please']
            },
            routing: {
                enabled: true,
                autoDetect: true
            }
        };

        await fs.promises.writeFile(
            path.join(this.configDir, 'router.json'),
            JSON.stringify(routerConfig, null, 2)
        );

        // 6. 创建使用说明
        const readme = `# Stigmergy-CLI 集成系统

## 检测到的工具
${availableCLIs.map(cli => `- ${cli}`).join('\\n') || '无检测到的工具'}

## 使用方法

### 中文协作模式
- "用claude帮我分析代码"
- "请gemini解释这个函数"
- "调用kimi来翻译"

### 英文协作模式
- "use claude to analyze code"
- "ask gemini to explain this function"
- "call kimi to translate"

## 部署信息
- 部署时间: ${new Date().toLocaleString()}
- 检测到: ${availableCLIs.length} 个工具
- 平台: ${process.platform}

## 配置文件位置
${this.configDir}
`;

        await fs.promises.writeFile(path.join(this.configDir, 'README.md'), readme);

        // 7. 显示结果
        this.print('');
        this.print('🎉 部署完成！');
        this.print('');
        this.print(`📍 配置目录: ${this.configDir}`);
        this.print(`🔧 可用工具: ${availableCLIs.join(', ') || '无'}`);
        this.print(`📊 成功率: ${availableCLIs.length}/${Object.keys(scanResults).length}`);

        if (availableCLIs.length > 0) {
            this.print('');
            this.print('💡 现在可以开始使用跨CLI协作功能了！');
            this.print('   例如: claude "用gemini帮我分析这段代码"');
        } else {
            this.print('');
            this.print('⚠️ 未检测到可用的AI CLI工具');
            this.print('   请先安装一些AI CLI工具，然后重新运行部署');
        }
    }

    async status() {
        this.print('📊 Stigmergy-CLI系统状态');
        this.print('============================');

        try {
            const configPath = path.join(this.configDir, 'config.json');

            if (!fs.existsSync(configPath)) {
                this.print('❌ 系统未部署');
                this.print('💡 请运行: node deploy.js');
                return;
            }

            const config = JSON.parse(await fs.promises.readFile(configPath));

            this.print(`版本: ${config.version}`);
            this.print(`平台: ${config.platform}`);
            this.print(`部署时间: ${new Date(config.deployTime).toLocaleString()}`);
            this.print(`集成状态: ${config.integrationEnabled ? '✅ 启用' : '❌ 禁用'}`);
            this.print(`可用工具: ${config.availableCLIs.length}/${config.totalDetected}`);
            this.print(`工具列表: ${config.availableCLIs.join(', ') || '无'}`);

        } catch (error) {
            this.print(`❌ 读取状态失败: ${error.message}`);
        }
    }

    async clean() {
        this.print('🧹 清理Stigmergy-CLI配置...');

        try {
            await fs.promises.rm(this.configDir, { recursive: true, force: true });
            this.print('✅ 清理完成');
        } catch (error) {
            this.print(`❌ 清理失败: ${error.message}`);
        }
    }
}

// 运行
if (require.main === module) {
    const deployer = new StigmergyDeployer();
    deployer.run().catch(error => {
        console.error(`❌ 错误: ${error.message}`);
        process.exit(1);
    });
}

module.exports = StigmergyDeployer;