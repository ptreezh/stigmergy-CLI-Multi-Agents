#!/usr/bin/env node

/**
 * Stigmergy CLI Entry Point
 * Stigmergy CLI 入口点
 */

const path = require('path');
const { spawn } = require('child_process');

class StigmergyCLI {
    constructor() {
        this.coreDir = path.join(__dirname, '..', 'src', 'core');
        this.deploymentScript = path.join(this.coreDir, 'integrated_cli_deployment.js');
        this.adapterScript = path.join(this.coreDir, 'smart_adapter_integration.js');
        this.envScript = path.join(this.coreDir, 'environment_stigmergy_system.js');
        this.managerScript = path.join(this.coreDir, 'cli_adapter_manager.js');
    }

    /**
     * 执行脚本
     */
    runScript(scriptPath, args = []) {
        const process = spawn('node', [scriptPath, ...args], {
            stdio: 'inherit',
            shell: true
        });
        
        process.on('close', (code) => {
            if (code && code !== 0) {
                throw new Error(`Process exited with code ${code}`);
            }
        });
        
        process.on('error', (error) => {
            console.error('执行错误:', error.message);
            process.exit(1);
        });
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log(`
🚀 Stigmergy CLI Multi-Agents - Cross-CLI Collaboration System

用法:
  stigmergy <命令> [选项]

主要命令:
  init, setup           初始化并部署系统
  deploy               部署CLI工具和插件
  scan                 扫描本地CLI工具
  install              安装缺失的CLI工具
  plugins              复制插件扩展
  start, demo          启动协作系统演示
  status               检查系统状态
  adapter, adapt       运行智能适配器
  env, environment     运行环境信号系统
  help, -h, --help     显示帮助信息

部署选项:
  --auto-install       自动安装所有缺失的CLI
  --force-reinstall    强制重新安装
  --skip-verification  跳过验证步骤

适配器选项:
  --mode <mode>        运行模式 (hybrid, python-only, nodejs-only)
  --demo               运行演示
  --check              检查状态
  --config <path>      指定配置文件

环境系统选项:
  --watch              监控模式
  --signals-only       仅处理信号
  --history-only       仅处理历史

示例:
  stigmergy init                      # 完整初始化
  stigmergy deploy --auto-install     # 自动安装部署
  stigmergy scan                      # 扫描CLI工具
  stigmergy start --demo              # 启动演示
  stigmergy adapter --mode hybrid     # 运行混合模式适配器
  stigmergy status                    # 检查状态

更多信息: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
        `);
    }

    /**
     * 解析命令行参数
     */
    parseCommand(args) {
        const command = args[0];
        const options = args.slice(1);
        
        switch (command) {
            case 'init':
            case 'setup':
                this.runScript(this.deploymentScript, ['full', ...options]);
                break;
                
            case 'deploy':
                this.runScript(this.deploymentScript, ['full', ...options]);
                break;
                
            case 'scan':
                this.runScript(this.deploymentScript, ['scan-only', ...options]);
                break;
                
            case 'install':
                this.runScript(this.deploymentScript, ['install-only', ...options]);
                break;
                
            case 'plugins':
                this.runScript(this.deploymentScript, ['plugin-only', ...options]);
                break;
                
            case 'start':
            case 'demo':
                this.runScript(this.adapterScript, ['--demo', ...options]);
                break;
                
            case 'status':
                this.runScript(this.managerScript, ['status', ...options]);
                break;
                
            case 'adapter':
            case 'adapt':
                this.runScript(this.adapterScript, options);
                break;
                
            case 'env':
            case 'environment':
                this.runScript(this.envScript, options);
                break;
                
            case 'help':
            case '-h':
            case '--help':
            case undefined:
                this.showHelp();
                break;
                
            default:
                console.error(`未知命令: ${command}`);
                console.error('使用 "stigmergy help" 查看帮助信息');
                process.exit(1);
        }
    }
}

// 主执行逻辑
if (require.main === module) {
    const cli = new StigmergyCLI();
    const args = process.argv.slice(2);
    cli.parseCommand(args);
}

module.exports = StigmergyCLI;