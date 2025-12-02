/**
 * CLI命令行工具 - 智能适配器管理器
 * 提供命令行接口管理Python/Node.js智能适配器
 */

import fs from 'fs/promises';
import path from 'path';
import { SmartAdapterIntegration } from './smart_adapter_integration.js';

class CLIAdapterManager {
    constructor() {
        this.integration = new SmartAdapterIntegration();
        this.cliCommands = ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex'];
    }

    /**
     * 初始化管理器
     */
    async initialize() {
        await this.integration.initialize();
        console.log('✅ CLI适配器管理器初始化完成');
    }

    /**
     * 主命令处理
     */
    async handleCommand(command, args = []) {
        switch (command) {
            case 'init':
                return await this.handleInit(args);
            case 'status':
                return await this.handleStatus(args);
            case 'check':
                return await this.handleCheck(args);
            case 'execute':
                return await this.handleExecute(args);
            case 'install':
                return await this.handleInstall(args);
            case 'config':
                return await this.handleConfig(args);
            case 'switch-mode':
                return await this.handleSwitchMode(args);
            case 'stats':
                return await this.handleStats(args);
            case 'help':
                return this.showHelp();
            default:
                console.log(`❌ 未知命令: ${command}`);
                return this.showHelp();
        }
    }

    /**
     * 初始化适配器
     */
    async handleInit(args) {
        console.log('🚀 初始化智能适配器系统...');
        
        const force = args.includes('--force');
        const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'hybrid';
        
        try {
            // 初始化集成系统
            await this.integration.initialize();
            
            // 切换到指定模式
            if (mode !== 'hybrid') {
                const switchResult = await this.integration.switchIntegrationMode(mode);
                if (!switchResult.success) {
                    console.error(`❌ 模式切换失败: ${switchResult.error}`);
                    return false;
                }
            }
            
            // 检查所有适配器状态
            const status = await this.integration.getSmartAdapterStatus();
            
            console.log('\n📊 适配器状态:');
            for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
                const adapterType = cliStatus.recommended?.type || 'none';
                const adapterIcon = adapterType === 'python' ? '🐍' : adapterType === 'nodejs' ? '🟢' : '❌';
                const fallbackIcon = cliStatus.fallback ? '🔄' : '';
                
                console.log(`  ${adapterIcon} ${fallbackIcon} ${cliName}: ${adapterType}`);
                
                if (cliStatus.pythonAdapter && cliStatus.pythonAdapter.available) {
                    console.log(`    🐍 Python适配器: 可用`);
                }
                if (cliStatus.nodejsAdapter && cliStatus.nodejsAdapter.available) {
                    console.log(`    🟢 Node.js适配器: 可用`);
                }
            }
            
            console.log('\n✅ 智能适配器系统初始化完成！');
            console.log(`   集成模式: ${mode}`);
            console.log(`   Python可用: ${status.pythonAvailable}`);
            console.log(`   Node.js可用: ${status.nodeAvailable}`);
            console.log(`   总适配器: ${status.totalCLIs}`);
            console.log(`   可用适配器: ${status.availableCLIs}`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ 初始化失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理状态检查
     */
    async handleStatus(args) {
        console.log('📊 检查智能适配器状态...\n');
        
        const status = await this.integration.getSmartAdapterStatus();
        
        console.log('🔍 系统环境:');
        console.log(`   平台: ${status.nodeAvailable ? process.platform : 'N/A'}`);
        console.log(`   Python: ${status.pythonAvailable ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`   Node.js: ${status.nodeAvailable ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`   降级模式: ${status.fallbackMode ? '✅ 启用' : '❌ 未启用'}`);
        
        console.log('\n📋 适配器详情:');
        for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
            const available = cliStatus.pythonAdapter?.available || cliStatus.nodejsAdapter?.available;
            const icon = available ? '✅' : '❌';
            const adapterType = cliStatus.recommended?.type || 'none';
            const confidence = cliStatus.recommended?.confidence || 0;
            
            console.log(`  ${icon} ${cliName} - ${adapterType} (${confidence})`);
            
            if (cliStatus.pythonAdapter) {
                const pyStatus = cliStatus.pythonAdapter.available ? '✅ 可用' : '❌ 不可用';
                const pyReason = cliStatus.pythonAdapter.reason || '';
                console.log(`    🐍 Python: ${pyReason}`);
            }
            
            if (cliStatus.nodejsAdapter) {
                const nodeStatus = cliStatus.nodejsAdapter.available ? '✅ 可用' : '❌ 不可用';
                const nodeReason = cliStatus.nodejsAdapter.reason || '';
                console.log(`    🟢 Node.js: ${nodeReason}`);
            }
            
            if (cliStatus.fallback) {
                console.log(`    🔄 已启用降级模式`);
            }
        }
        
        console.log('\n📈 统计信息:');
        console.log(`   总适配器: ${status.totalCLIs}`);
        console.log(`   可用适配器: ${status.availableCLIs}`);
        console.log(`   Python适配器: ${status.pythonAdapters}`);
        console.log(`   Node.js适配器: ${status.nodeAdapters}`);
        console.log(`   降级适配器: ${status.fallbackAdapters}`);
        
        return status;
    }

    /**
     * 处理适配器检查
     */
    async handleCheck(args) {
        const cliName = args[0];
        
        if (!cliName) {
            console.error('❌ 请指定要检查的CLI名称');
            console.log('用法: stigmergy-cli check <cli-name>');
            return false;
        }
        
        console.log(`🔍 检查 ${cliName} 适配器状态...\n`);
        
        const status = await this.integration.getSmartAdapterStatus();
        const cliStatus = status.systemStatus[cliName];
        
        if (!cliStatus) {
            console.error(`❌ 未找到 ${cliName} 适配器`);
            return false;
        }
        
        console.log(`📋 ${cliName} 详细状态:`);
        console.log(`   推荐适配器: ${cliStatus.recommended?.type || 'none'}`);
        console.log(`   置信度: ${cliStatus.recommended?.confidence || 0}`);
        console.log(`   降级模式: ${cliStatus.fallback ? '是' : '否'}`);
        
        if (cliStatus.pythonAdapter) {
            console.log(`\n🐍 Python适配器:`);
            console.log(`   状态: ${cliStatus.pythonAdapter.available ? '✅ 可用' : '❌ 不可用'}`);
            console.log(`   原因: ${cliStatus.pythonAdapter.reason || 'N/A'}`);
            
            if (cliStatus.pythonAdapter.files) {
                console.log(`   文件: ${cliStatus.pythonAdapter.files.length} 个`);
                cliStatus.pythonAdapter.files.forEach(file => {
                    console.log(`     - ${file}`);
                });
            }
        }
        
        if (cliStatus.nodejsAdapter) {
            console.log(`\n🟢 Node.js适配器:`);
            console.log(`   状态: ${cliStatus.nodejsAdapter.available ? '✅ 可用' : '❌ 不可用'}`);
            console.log(`   原因: ${cliStatus.nodejsAdapter.reason || 'N/A'}`);
            console.log(`   命令: ${cliStatus.nodejsAdapter.command || 'N/A'}`);
        }
        
        return cliStatus;
    }

    /**
     * 处理CLI执行
     */
    async handleExecute(args) {
        if (args.length === 0) {
            console.error('❌ 请指定要执行的CLI和参数');
            console.log('用法: stigmergy-cli execute <cli-name> [args...]');
            return false;
        }
        
        const cliName = args[0];
        const cliArgs = args.slice(1);
        
        console.log(`🚀 执行 ${cliName} (智能选择适配器)...\n`);
        
        try {
            const result = await this.integration.smartExecuteCLI(cliName, cliArgs);
            
            if (result.success) {
                console.log(`✅ ${cliName} 执行成功`);
                console.log(`   适配器: ${result.adapter}`);
                console.log(`   方法: ${result.method}`);
                if (result.fallback) {
                    console.log(`   降级: 是`);
                }
            } else {
                console.error(`❌ ${cliName} 执行失败: ${result.error}`);
                if (result.installCommand) {
                    console.log(`💡 安装命令: ${result.installCommand}`);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ 执行异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理安装
     */
    async handleInstall(args) {
        const cliName = args[0];
        const force = args.includes('--force');
        
        if (!cliName) {
            console.error('❌ 请指定要安装的CLI');
            console.log('用法: stigmergy-cli install <cli-name> [--force]');
            return false;
        }
        
        console.log(`📦 安装 ${cliName} (智能选择适配器)...\n`);
        
        try {
            const result = await this.integration.installCLI(cliName);
            
            if (result.success) {
                console.log(`✅ ${cliName} 安装/检查完成`);
            } else {
                console.error(`❌ ${cliName} 安装失败: ${result.message}`);
                if (result.installCommand) {
                    console.log(`💡 请手动运行: ${result.installCommand}`);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ 安装异常: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理配置
     */
    async handleConfig(args) {
        console.log('⚙️ 配置智能适配器系统\n');
        
        if (args.length === 0) {
            // 显示当前配置
            const config = this.integration.config;
            console.log('当前配置:');
            console.log(JSON.stringify(config, null, 2));
            return config;
        }
        
        const [action, ...configArgs] = args;
        
        switch (action) {
            case 'set':
                return await this.setConfig(configArgs);
            case 'get':
                return await this.getConfig(configArgs);
            case 'reset':
                return await this.resetConfig();
            default:
                console.error(`❌ 未知配置操作: ${action}`);
                return false;
        }
    }

    /**
     * 处理模式切换
     */
    async handleSwitchMode(args) {
        const mode = args[0];
        
        if (!mode) {
            console.error('❌ 请指定要切换的模式');
            console.log('用法: stigmergy-cli switch-mode <mode>');
            console.log('可用模式: hybrid, python-only, nodejs-only');
            return false;
        }
        
        console.log(`🔄 切换到 ${mode} 模式...`);
        
        const result = await this.integration.switchIntegrationMode(mode);
        
        if (result.success) {
            console.log(`✅ 已切换到 ${result.mode} 模式`);
        } else {
            console.error(`❌ 模式切换失败: ${result.error}`);
        }
        
        return result;
    }

    /**
     * 处理统计信息
     */
    async handleStats(args) {
        console.log('📈 智能适配器统计信息\n');
        
        const stats = await this.integration.getExecutionStats();
        
        console.log('执行统计:');
        console.log(`   总执行次数: ${stats.totalExecutions || 0}`);
        console.log(`   Python执行: ${stats.pythonExecutions || 0}`);
        console.log(`   Node.js执行: ${stats.nodeExecutions || 0}`);
        console.log(`   成功率: ${stats.successRate || '0%'}`);
        
        if (stats.error) {
            console.log(`   错误: ${stats.error}`);
        }
        
        return stats;
    }

    /**
     * 设置配置
     */
    async setConfig(args) {
        if (args.length !== 2) {
            console.error('❌ 用法: config set <key> <value>');
            return false;
        }
        
        const [key, value] = args;
        
        // 处理特殊值
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        if (value === 'false') parsedValue = false;
        if (!isNaN(value)) parsedValue = parseFloat(value);
        
        this.integration.config[key] = parsedValue;
        await this.integration.saveConfig();
        
        console.log(`✅ 配置已设置: ${key} = ${parsedValue}`);
        return true;
    }

    /**
     * 获取配置
     */
    async getConfig(args) {
        if (args.length !== 1) {
            console.error('❌ 用法: config get <key>');
            return false;
        }
        
        const key = args[0];
        const value = this.integration.config[key];
        
        console.log(`${key}: ${JSON.stringify(value)}`);
        return value;
    }

    /**
     * 重置配置
     */
    async resetConfig() {
        // 重置为默认配置
        this.integration.config = {
            enablePython: true,
            enableNodeJS: true,
            autoFallback: true,
            cacheStatus: true,
            logLevel: 'info',
            integrationMode: 'hybrid'
        };
        
        await this.integration.saveConfig();
        
        console.log('✅ 配置已重置为默认值');
        return true;
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
🤖 智能适配器管理器 v1.0.0

📚 可用命令:
  init [options]              - 初始化适配器系统
    status                        - 显示系统状态
    check <cli-name>             - 检查指定CLI适配器
    execute <cli> [args...]       - 执行CLI (智能选择适配器)
    install <cli> [--force]      - 安装指定CLI适配器
    config <action> [args]       - 配置管理
    switch-mode <mode>            - 切换集成模式
    stats                         - 显示执行统计
    help                          - 显示此帮助信息

💡 模式选项:
  --mode=<mode>                - 初始化时指定模式 (hybrid/python-only/nodejs-only)
  --force                       - 强制重新安装

⚙️ 配置操作:
  set <key> <value>           - 设置配置项
  get <key>                    - 获取配置项
  reset                        - 重置为默认配置

🎯 集成模式:
  hybrid      - 智能选择 (Python > Node.js)
  python-only - 仅使用Python适配器
  nodejs-only  - 仅使用Node.js适配器

🔗 示例:
  stigmergy-cli init --mode=hybrid
  stigmergy-cli status
  stigmergy-cli execute claude "生成代码"
  stigmergy-cli check claude
  stigmergy-cli install gemini --force
  stigmergy-cli config set autoFallback true
  stigmergy-cli switch-mode python-only
  stigmergy-cli stats
        `);
    }
}

// 命令行入口
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        const manager = new CLIAdapterManager();
        manager.showHelp();
        return;
    }
    
    const manager = new CLIAdapterManager();
    await manager.initialize();
    await manager.handleCommand(command, args.slice(1));
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { CLIAdapterManager };