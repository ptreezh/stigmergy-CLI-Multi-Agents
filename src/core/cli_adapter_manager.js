/**
 * CLI Command Line Tool - Smart Adapter Manager
 * Provides command line interface to manage Python/Node.js smart adapters
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
        console.log('✅ CLI Adapter Manager initialized');
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
        console.log('🚀 Initializing smart adapter system...');
        
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
            
            console.log('\n📊 Adapter status:');
            for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
                const adapterType = cliStatus.recommended?.type || 'none';
                const adapterIcon = adapterType === 'python' ? '[PYTHON]' : adapterType === 'nodejs' ? '[NODEJS]' : '[ERROR]';
                const fallbackIcon = cliStatus.fallback ? '[FALLBACK]' : '';
                
                console.log(`  ${adapterIcon} ${fallbackIcon} ${cliName}: ${adapterType}`);
                
                if (cliStatus.pythonAdapter && cliStatus.pythonAdapter.available) {
                    console.log(`    [PYTHON] Python adapter: Available`);
                }
                if (cliStatus.nodejsAdapter && cliStatus.nodejsAdapter.available) {
                    console.log(`    [NODEJS] Node.js adapter: Available`);
                }
            }
            
            console.log('\n✅ Smart adapter system initialized!');
            console.log(`   Integration mode: ${mode}`);
            console.log(`   Python available: ${status.pythonAvailable}`);
            console.log(`   Node.js available: ${status.nodeAvailable}`);
            console.log(`   Total adapters: ${status.totalCLIs}`);
            console.log(`   Available adapters: ${status.availableCLIs}`);
            
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
        console.log('📊 Checking smart adapter status...\n');
        
        const status = await this.integration.getSmartAdapterStatus();
        
        console.log('🔍 System environment:');
        console.log(`   Platform: ${status.nodeAvailable ? process.platform : 'N/A'}`);
        console.log(`   Python: ${status.pythonAvailable ? '✅ Available' : '❌ Unavailable'}`);
        console.log(`   Node.js: ${status.nodeAvailable ? '✅ Available' : '❌ Unavailable'}`);
        console.log(`   Fallback mode: ${status.fallbackMode ? '✅ Enabled' : '❌ Disabled'}`);
        
        console.log('\n📋 Adapter details:');
        for (const [cliName, cliStatus] of Object.entries(status.systemStatus)) {
            const available = cliStatus.pythonAdapter?.available || cliStatus.nodejsAdapter?.available;
            const icon = available ? '[OK]' : '[ERROR]';
            const adapterType = cliStatus.recommended?.type || 'none';
            const confidence = cliStatus.recommended?.confidence || 0;
            
            console.log(`  ${icon} ${cliName} - ${adapterType} (${confidence})`);
            
            if (cliStatus.pythonAdapter) {
                const pyStatus = cliStatus.pythonAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]';
                const pyReason = cliStatus.pythonAdapter.reason || '';
                console.log(`    [PYTHON] Python: ${pyReason}`);
            }
            
            if (cliStatus.nodejsAdapter) {
                const nodeStatus = cliStatus.nodejsAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]';
                const nodeReason = cliStatus.nodejsAdapter.reason || '';
                console.log(`    [NODEJS] Node.js: ${nodeReason}`);
            }
            
            if (cliStatus.fallback) {
                console.log(`    [FALLBACK] Fallback mode enabled`);
            }
        }
        
        console.log('\n[STATS] Statistics:');
        console.log(`   Total adapters: ${status.totalCLIs}`);
        console.log(`   Available adapters: ${status.availableCLIs}`);
        console.log(`   Python adapters: ${status.pythonAdapters}`);
        console.log(`   Node.js adapters: ${status.nodeAdapters}`);
        console.log(`   Fallback adapters: ${status.fallbackAdapters}`);
        
        return status;
    }

    /**
     * 处理适配器检查
     */
    async handleCheck(args) {
        const cliName = args[0];
        
        if (!cliName) {
            console.error('❌ Please specify the CLI name to check');
            console.log('Usage: stigmergy-cli check <cli-name>');
            return false;
        }
        
        console.log(`🔍 Checking ${cliName} adapter status...\n`);
        
        const status = await this.integration.getSmartAdapterStatus();
        const cliStatus = status.systemStatus[cliName];
        
        if (!cliStatus) {
            console.error(`❌ ${cliName} adapter not found`);
            return false;
        }
        
        console.log(`📋 ${cliName} detailed status:`);
        console.log(`   Recommended adapter: ${cliStatus.recommended?.type || 'none'}`);
        console.log(`   Confidence: ${cliStatus.recommended?.confidence || 0}`);
        console.log(`   Fallback mode: ${cliStatus.fallback ? 'Yes' : 'No'}`);
        
        if (cliStatus.pythonAdapter) {
            console.log(`\n🐍 Python adapter:`);
            console.log(`   Status: ${cliStatus.pythonAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]'}`);
            console.log(`   Reason: ${cliStatus.pythonAdapter.reason || 'N/A'}`);
            
            if (cliStatus.pythonAdapter.files) {
                console.log(`   Files: ${cliStatus.pythonAdapter.files.length}`);
                cliStatus.pythonAdapter.files.forEach(file => {
                    console.log(`     - ${file}`);
                });
            }
        }
        
        if (cliStatus.nodejsAdapter) {
            console.log(`\n🟢 Node.js adapter:`);
            console.log(`   Status: ${cliStatus.nodejsAdapter.available ? '[AVAILABLE]' : '[UNAVAILABLE]'}`);
            console.log(`   Reason: ${cliStatus.nodejsAdapter.reason || 'N/A'}`);
            console.log(`   Command: ${cliStatus.nodejsAdapter.command || 'N/A'}`);
        }
        
        return cliStatus;
    }

    /**
     * 处理CLI执行
     */
    async handleExecute(args) {
        if (args.length === 0) {
            console.error('[ERROR] Please specify the CLI and arguments to execute');
            console.log('Usage: stigmergy-cli execute <cli-name> [args...]');
            return false;
        }
        
        const cliName = args[0];
        const cliArgs = args.slice(1);
        
        console.log(`[EXECUTE] Running ${cliName} (smart adapter selection)...\n`);
        
        try {
            const result = await this.integration.smartExecuteCLI(cliName, cliArgs);
            
            if (result.success) {
                console.log(`[SUCCESS] ${cliName} executed successfully`);
                console.log(`   Adapter: ${result.adapter}`);
                console.log(`   Method: ${result.method}`);
                if (result.fallback) {
                    console.log(`   Fallback: Yes`);
                }
            } else {
                console.error(`[ERROR] ${cliName} execution failed: ${result.error}`);
                if (result.installCommand) {
                    console.log(`[HINT] Installation command: ${result.installCommand}`);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`[EXCEPTION] Execution exception: ${error.message}`);
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
            console.error('❌ Please specify the CLI to install');
            console.log('Usage: stigmergy-cli install <cli-name> [--force]');
            return false;
        }
        
        console.log(`[INSTALL] Installing ${cliName} (smart adapter selection)...\n`);
        
        try {
            const result = await this.integration.installCLI(cliName);
            
            if (result.success) {
                console.log(`[SUCCESS] ${cliName} installation/check completed`);
            } else {
                console.error(`[ERROR] ${cliName} installation failed: ${result.message}`);
                if (result.installCommand) {
                    console.log(`[HINT] Please run manually: ${result.installCommand}`);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`[EXCEPTION] Installation exception: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理配置
     */
    async handleConfig(args) {
        console.log('[CONFIG] Smart adapter system configuration\n');
        
        if (args.length === 0) {
            // 显示当前配置
            const config = this.integration.config;
            console.log('Current configuration:');
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
                console.error(`❌ Unknown config action: ${action}`);
                return false;
        }
    }

    /**
     * 处理模式切换
     */
    async handleSwitchMode(args) {
        const mode = args[0];
        
        if (!mode) {
            console.error('❌ Please specify the mode to switch to');
            console.log('Usage: stigmergy-cli switch-mode <mode>');
            console.log('Available modes: hybrid, python-only, nodejs-only');
            return false;
        }
        
        console.log(`🔄 Switching to ${mode} mode...`);
        
        const result = await this.integration.switchIntegrationMode(mode);
        
        if (result.success) {
            console.log(`✅ Switched to ${result.mode} mode`);
        } else {
            console.error(`❌ Mode switch failed: ${result.error}`);
        }
        
        return result;
    }

    /**
     * 处理统计信息
     */
    async handleStats(args) {
        console.log('📈 Smart adapter statistics\n');
        
        const stats = await this.integration.getExecutionStats();
        
        console.log('Execution statistics:');
        console.log(`   Total executions: ${stats.totalExecutions || 0}`);
        console.log(`   Python executions: ${stats.pythonExecutions || 0}`);
        console.log(`   Node.js executions: ${stats.nodeExecutions || 0}`);
        console.log(`   Success rate: ${stats.successRate || '0%'}`);
        
        if (stats.error) {
            console.log(`   Error: ${stats.error}`);
        }
        
        return stats;
    }

    /**
     * 设置配置
     */
    async setConfig(args) {
        if (args.length !== 2) {
            console.error('❌ Usage: config set <key> <value>');
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
        
        console.log(`✅ Configuration set: ${key} = ${parsedValue}`);
        return true;
    }

    /**
     * 获取配置
     */
    async getConfig(args) {
        if (args.length !== 1) {
            console.error('❌ Usage: config get <key>');
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
        
        console.log('✅ Configuration reset to default values');
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
  nodejs-only  - Use Node.js adapters only

[EXAMPLES] Examples:
  stigmergy-cli init --mode=hybrid
  stigmergy-cli status
  stigmergy-cli execute claude "generate code"
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