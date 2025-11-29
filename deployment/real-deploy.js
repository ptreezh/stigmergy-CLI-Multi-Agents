#!/usr/bin/env node

/**
 * Stigmergy-CLI 真实的自动化部署工具
 * 部署项目中已有的原生CLI扩展功能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class RealStigmergyDeployer {
    constructor() {
        this.homeDir = os.homedir();
        this.configDir = path.join(this.homeDir, '.stigmergy-cli');
        this.projectRoot = path.resolve(__dirname, '..');
        this.adaptersDir = path.join(this.projectRoot, 'src', 'adapters');
        this.args = process.argv.slice(2);

        // CLI工具的配置目录和文件
        this.cliConfigs = {
            claude: {
                configDir: path.join(this.homeDir, '.config', 'claude'),
                configFile: 'hooks.json',
                adapterDir: path.join(this.adaptersDir, 'claude'),
                status: 'not_installed'
            },
            gemini: {
                configDir: path.join(this.homeDir, '.config', 'gemini'),
                configFile: 'extensions.json',
                adapterDir: path.join(this.adaptersDir, 'gemini'),
                status: 'not_installed'
            },
            qwen: {
                configDir: path.join(this.homeDir, '.qwen'),
                configFile: 'config.json',
                adapterDir: path.join(this.adaptersDir, 'qwencode'),
                status: 'not_installed'
            },
            kimi: {
                configDir: path.join(this.homeDir, '.config', 'kimi'),
                configFile: 'integration.json',
                adapterDir: path.join(this.adaptersDir, 'kimi'),
                status: 'not_installed'
            },
            codebuddy: {
                configDir: path.join(this.homeDir, '.codebuddy'),
                configFile: 'plugins.json',
                adapterDir: path.join(this.adaptersDir, 'codebuddy'),
                status: 'not_installed'
            },
            qodercli: {
                configDir: path.join(this.homeDir, '.qoder'),
                configFile: 'extensions.json',
                adapterDir: path.join(this.adaptersDir, 'qoder'),
                status: 'not_installed'
            },
            iflow: {
                configDir: path.join(this.homeDir, '.iflow'),
                configFile: 'workflows.json',
                adapterDir: path.join(this.adaptersDir, 'iflow'),
                status: 'not_installed'
            },
            copilot: {
                configDir: path.join(this.homeDir, '.config', 'github-copilot'),
                configFile: 'hooks.json',
                adapterDir: path.join(this.adaptersDir, 'copilot'),
                status: 'not_installed'
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
        this.print('🚀 Stigmergy-CLI 真实扩展部署工具');
        this.print('==================================');
        this.print('');

        const command = this.args[0] || 'deploy';

        switch (command) {
            case 'scan':
                await this.scan();
                break;
            case 'deploy':
            default:
                await this.deploy();
                break;
        }
    }

    async checkCommand(command) {
        return new Promise((resolve) => {
            const whereCmd = process.platform === 'win32' ? 'where' : 'which';
            const child = spawn(whereCmd, [command], {
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

    async scan(forceRescan = false) {
        this.print('🔍 扫描已安装的AI CLI工具和扩展...');
        this.print('');

        const results = {};
        let availableTools = 0;

        // 清除缓存
        if (forceRescan) {
            const cacheFile = path.join(this.configDir, 'scan-cache.json');
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
                this.print('🔄 已清除扫描缓存');
            }
        }

        for (const [tool, config] of Object.entries(this.cliConfigs)) {
            process.stdout.write(`检测 ${tool.toUpperCase()}... `);

            // 检查CLI工具是否安装
            const isCLIInstalled = await this.checkCommand(tool);

            // 检查扩展是否已部署
            const isExtensionDeployed = await this.checkExtensionDeployed(tool);

            if (isCLIInstalled) {
                availableTools++;
                if (isExtensionDeployed) {
                    this.print('✅ 工具已安装，扩展已部署');
                    config.status = 'fully_installed';
                } else {
                    this.print('🟡 工具已安装，扩展未部署');
                    config.status = 'cli_only';
                }
            } else {
                this.print('❌ 工具未安装');
                config.status = 'not_installed';
            }

            results[tool] = {
                cliInstalled: isCLIInstalled,
                extensionDeployed: isExtensionDeployed,
                status: config.status
            };
        }

        this.print('');
        this.print(`📊 扫描结果:`);
        this.print(`   - 可用CLI工具: ${availableTools}/${Object.keys(this.cliConfigs).length}`);

        const fullyInstalled = Object.values(results).filter(r => r.status === 'fully_installed').length;
        this.print(`   - 完整安装: ${fullyInstalled}/${Object.keys(this.cliConfigs).length}`);

        return results;
    }

    async checkExtensionDeployed(tool) {
        const config = this.cliConfigs[tool];

        // 检查配置目录是否存在
        if (!fs.existsSync(config.configDir)) {
            return false;
        }

        // 检查配置文件是否存在
        const configFile = path.join(config.configDir, config.configFile);
        if (!fs.existsSync(configFile)) {
            return false;
        }

        // 检查是否包含stigmergy配置
        try {
            const configContent = await fs.promises.readFile(configFile, 'utf8');
            return configContent.includes('stigmergy') ||
                   configContent.includes('cross-cli') ||
                   configContent.includes('integration');
        } catch (error) {
            return false;
        }
    }

    async deploy() {
        this.print('🚀 开始部署Stigmergy-CLI原生扩展...');
        this.print('');

        // 1. 扫描当前状态
        const scanResults = await this.scan();

        // 2. 为已安装的CLI工具部署扩展
        let deployCount = 0;
        let successCount = 0;

        for (const [tool, config] of Object.entries(this.cliConfigs)) {
            if (scanResults[tool].cliInstalled && !scanResults[tool].extensionDeployed) {
                deployCount++;
                this.print(`\\n📦 部署 ${tool.toUpperCase()} 扩展...`);

                try {
                    const success = await this.deploySingleExtension(tool, config);
                    if (success) {
                        successCount++;
                        this.print(`✅ ${tool.toUpperCase()} 扩展部署成功`);
                    } else {
                        this.print(`❌ ${tool.toUpperCase()} 扩展部署失败`);
                    }
                } catch (error) {
                    this.print(`❌ ${tool.toUpperCase()} 扩展部署错误: ${error.message}`);
                }
            }
        }

        // 3. 重新扫描以获取最新状态
        this.print('\\n🔄 重新扫描以验证部署结果...');
        const updatedResults = await this.scan(true); // 强制重新扫描

        // 4. 创建全局配置
        await this.createGlobalConfig(updatedResults);

        // 5. 显示结果
        this.print('\\n🎉 部署完成！');
        this.print('=============');
        this.print(`📊 部署统计: ${successCount}/${deployCount} 成功`);
        this.print(`📍 配置目录: ${this.configDir}`);

        if (successCount > 0) {
            this.print('\\n💡 现在可以开始使用跨CLI协作功能:');
            this.print('   claude "用gemini帮我分析这段代码"');
            this.print('   gemini "请claude帮我设计架构"');
        }
    }

    async deploySingleExtension(tool, config) {
        try {
            // 确保目标配置目录存在
            await this.ensureDir(config.configDir);

            // 根据不同工具部署不同的扩展
            switch (tool) {
                case 'claude':
                    return await this.deployClaudeHooks(config);
                case 'gemini':
                    return await this.deployGeminiExtension(config);
                case 'qwen':
                    return await this.deployQwenIntegration(config);
                case 'codebuddy':
                    return await this.deployCodebuddyPlugin(config);
                default:
                    return await this.deployGenericExtension(tool, config);
            }
        } catch (error) {
            console.error(`部署 ${tool} 扩展失败:`, error);
            return false;
        }
    }

    async deployClaudeHooks(config) {
        // Claude CLI的hooks配置
        const hooksConfig = {
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
                },
                "tool_use_pre": {
                    enabled: true,
                    handler: "python",
                    script_path: path.join(this.configDir, 'adapters', 'claude', 'tool_use_handler.py'),
                    config: {
                        cross_tool_analysis: true
                    }
                }
            }
        };

        // 保存hooks配置
        const hooksFile = path.join(config.configDir, config.configFile);
        await fs.promises.writeFile(hooksFile, JSON.stringify(hooksConfig, null, 2));

        // 复制Python适配器文件
        await this.copyAdapterFiles('claude');

        return true;
    }

    async deployGeminiExtension(config) {
        // Gemini CLI的extensions配置
        const extensionsConfig = {
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
        };

        const extensionsFile = path.join(config.configDir, config.configFile);
        await fs.promises.writeFile(extensionsFile, JSON.stringify(extensionsConfig, null, 2));

        // 复制适配器文件
        await this.copyAdapterFiles('gemini');

        return true;
    }

    async deployQwenIntegration(config) {
        // Qwen CLI的集成配置
        const integrationConfig = {
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
        };

        const configFile = path.join(config.configDir, config.configFile);
        await fs.promises.writeFile(configFile, JSON.stringify(integrationConfig, null, 2));

        // 复制适配器文件
        await this.copyAdapterFiles('qwen', 'qwencode'); // 源目录名qwencode -> 目标目录名qwen

        return true;
    }

    async deployCodebuddyPlugin(config) {
        // CodeBuddy CLI的插件配置
        const pluginsConfig = {
            version: "1.0.0",
            plugins: [
                {
                    name: "stigmergy-integration",
                    enabled: true,
                    entry_point: path.join(this.configDir, 'adapters', 'codebuddy', 'plugin.py'),
                    config: {
                        cross_cli_enabled: true,
                        collaboration_keywords: ["用", "请", "调用", "帮我"]
                    }
                }
            ]
        };

        const pluginsFile = path.join(config.configDir, config.configFile);
        await fs.promises.writeFile(pluginsFile, JSON.stringify(pluginsConfig, null, 2));

        // 复制适配器文件
        await this.copyAdapterFiles('codebuddy');

        return true;
    }

    async deployGenericExtension(tool, config) {
        // 通用扩展部署
        const genericConfig = {
            version: "1.0.0",
            stigmergy_integration: {
                enabled: true,
                cli_name: tool,
                adapter_path: path.join(this.configDir, 'adapters', tool),
                cross_cli_enabled: true,
                collaboration_keywords: ["用", "请", "调用", "帮我"]
            }
        };

        const configFile = path.join(config.configDir, config.configFile);
        await fs.promises.writeFile(configFile, JSON.stringify(genericConfig, null, 2));

        // 复制适配器文件（如果存在）
        await this.copyAdapterFiles(tool);

        return true;
    }

    async copyAdapterFiles(tool, sourceName = null) {
        const sourceDirName = sourceName || tool;
        const sourceDir = path.join(this.adaptersDir, sourceDirName);
        const targetDir = path.join(this.configDir, 'adapters', tool);

        if (!fs.existsSync(sourceDir)) {
            this.print(`   ⚠️ ${tool} 适配器文件不存在: ${sourceDir}`);
            return false;
        }

        // 创建目标目录
        await this.ensureDir(targetDir);

        // 复制所有Python文件
        try {
            const files = await fs.promises.readdir(sourceDir);
            for (const file of files) {
                if (file.endsWith('.py') || file.endsWith('.json')) {
                    const sourceFile = path.join(sourceDir, file);
                    const targetFile = path.join(targetDir, file);
                    await fs.promises.copyFile(sourceFile, targetFile);
                }
            }
            return true;
        } catch (error) {
            this.print(`   ⚠️ 复制 ${tool} 适配器文件失败: ${error.message}`);
            return false;
        }
    }

    async createGlobalConfig(scanResults) {
        const globalConfig = {
            version: "2.0.0",
            deploy_time: new Date().toISOString(),
            platform: process.platform,
            project_root: this.projectRoot,
            adapters_root: this.adaptersDir,
            config_root: this.configDir,
            cli_status: scanResults,
            routing: {
                enabled: true,
                confidence_threshold: 0.8,
                collaboration_keywords: {
                    chinese: ["用", "请", "调用", "帮我", "让"],
                    english: ["use", "ask", "call", "please", "get"]
                }
            }
        };

        await this.ensureDir(this.configDir);
        await fs.promises.writeFile(
            path.join(this.configDir, 'global-config.json'),
            JSON.stringify(globalConfig, null, 2)
        );

        // 创建使用说明
        const usage = `# Stigmergy-CLI 使用说明

## 部署状态
部署时间: ${new Date().toLocaleString()}
项目根目录: ${this.projectRoot}

## 已部署的扩展
${Object.entries(scanResults)
    .filter(([_, result]) => result.extensionDeployed)
    .map(([tool, _]) => `- ${tool.toUpperCase()}`)
    .join('\\n') || '无'}

## 使用方法

### 跨CLI协作
在任何一个已部署的CLI中，都可以调用其他CLI：

#### 中文模式
- "用gemini帮我分析这段代码"
- "请claude设计这个架构"
- "调用kimi翻译文档"

#### 英文模式
- "use gemini to analyze this code"
- "ask claude to design this architecture"
- "call kimi to translate this document"

## 配置文件位置
- 全局配置: ${this.configDir}/global-config.json
- CLI配置: ${this.configDir}/adapters/
`;

        await fs.promises.writeFile(path.join(this.configDir, 'USAGE.md'), usage);
    }
}

// 运行
if (require.main === module) {
    const deployer = new RealStigmergyDeployer();
    deployer.run().catch(error => {
        console.error(`❌ 部署失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = RealStigmergyDeployer;