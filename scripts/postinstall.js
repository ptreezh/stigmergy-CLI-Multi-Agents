#!/usr/bin/env node

/**
 * Global Installation Auto-Deployment Script
 * 全局安装自动部署脚本
 */

const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class GlobalInstallDeployer {
    constructor() {
        this.isGlobalInstall = this.detectGlobalInstall();
        this.deploymentScript = path.join(__dirname, '..', 'src', 'core', 'integrated_cli_deployment.js');
    }

    /**
     * 检测是否为全局安装
     */
    detectGlobalInstall() {
        // 检查多种方式确定是否为全局安装
        const npmConfigGlobal = process.env.npm_config_global;
        const npmGlobal = process.env.NPM_CONFIG_GLOBAL;
        const hasGlobalArg = process.argv.includes('-g') || process.argv.includes('--global');
        const inGlobalNodeModules = __dirname.includes(path.join('node_modules'));
        
        return npmConfigGlobal === 'true' || 
               npmGlobal === 'true' || 
               hasGlobalArg || 
               inGlobalNodeModules;
    }

    /**
     * 检测平台和包管理器
     */
    getInstallInfo() {
        return {
            platform: os.platform(),
            nodeVersion: process.version,
            installType: this.isGlobalInstall ? 'global' : 'local',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 显示安装信息
     */
    showInstallInfo() {
        const info = this.getInstallInfo();
        console.log(`\n🚀 Stigmergy CLI Multi-Agents Installation`);
        console.log(`=====================================`);
        console.log(`📦 Type: ${info.installType} installation`);
        console.log(`🖥️  Platform: ${info.platform}`);
        console.log(`⚡ Node.js: ${info.nodeVersion}`);
        console.log(`🕐 Time: ${info.timestamp}`);
        console.log(`=====================================\n`);
    }

    /**
     * 运行自动部署
     */
    async runAutoDeployment() {
        try {
            // 显示安装信息
            this.showInstallInfo();

            if (this.isGlobalInstall) {
                console.log('🌍 Detected global installation, starting auto-deployment...\n');
                
                // 运行完整部署流程，跳过用户交互
                await this.runDeployment(['full', '--auto-install', '--skip-verification']);
                
            } else {
                console.log('📁 Local installation detected. Use "npm install -g" for full auto-deployment.\n');
                console.log('💡 To start deployment manually:');
                console.log('   npm run deploy -- --auto-install');
                console.log('   or');
                console.log('   node src/core/integrated_cli_deployment.js full --auto-install\n');
            }
            
        } catch (error) {
            console.error('❌ Auto-deployment failed:', error.message);
            console.log('\n💡 To complete setup manually:');
            console.log('   stigmergy deploy --auto-install');
            console.log('   or');
            console.log('   npm run deploy -- --auto-install\n');
            
            // 不退出进程，允许npm安装继续完成
        }
    }

    /**
     * 执行部署脚本
     */
    runDeployment(args = []) {
        return new Promise((resolve, reject) => {
            const process = spawn('node', [this.deploymentScript, ...args], {
                stdio: 'inherit',
                shell: true
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Deployment script exited with code ${code}`));
                }
            });
            
            process.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * 静默模式部署（仅用于全局安装）
     */
    async runSilentDeployment() {
        try {
            // 静默运行，只输出关键信息
            console.log('🔧 Setting up Stigmergy CLI system...');
            
            await this.runDeployment(['full', '--auto-install', '--skip-verification']);
            
            console.log('\n✅ Stigmergy CLI Multi-Agents setup complete!');
            console.log('\n🎯 Quick start:');
            console.log('   stigmergy status');
            console.log('   stigmergy start --demo');
            console.log('\n📚 For help: stigmergy help');
            
        } catch (error) {
            console.error('⚠️  Setup completed with warnings');
            console.log('💡 Run "stigmergy deploy" to complete setup');
        }
    }
}

// 主执行逻辑
async function main() {
    const deployer = new GlobalInstallDeployer();
    
    try {
        // 根据环境变量决定是否静默运行
        const silentMode = process.env.NPM_CONFIG_SILENT === 'true' || process.argv.includes('--silent');
        
        if (silentMode) {
            await deployer.runSilentDeployment();
        } else {
            await deployer.runAutoDeployment();
        }
        
    } catch (error) {
        // 确保不中断npm安装过程
        console.error(`Setup warning: ${error.message}`);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = GlobalInstallDeployer;