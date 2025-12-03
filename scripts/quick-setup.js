#!/usr/bin/env node

/**
 * Quick Setup Script for Global Installation
 * 全局安装快速设置脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, description) {
    try {
        console.log(`🔧 ${description}...`);
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${description} complete`);
        return result;
    } catch (error) {
        console.log(`⚠️  ${description} failed:`, error.message);
        return null;
    }
}

function quickSetup() {
    console.log('\n🚀 Stigmergy CLI Quick Setup');
    console.log('================================\n');
    
    // 检查是否全局安装
    const globalCheck = runCommand('npm list -g stigmergy-cli-multi-agents', 'Checking global installation');
    
    if (globalCheck) {
        console.log('📦 Global installation detected\n');
        
        // 运行自动部署
        console.log('🔄 Running automatic deployment...\n');
        runCommand('node src/core/integrated_cli_deployment.js full --auto-install', 'Deploying Stigmergy CLI system');
        
        console.log('\n🎉 Setup complete!');
        console.log('\n📋 Next steps:');
        console.log('   stigmergy status    # Check system status');
        console.log('   stigmergy start      # Start collaboration system');
        console.log('   stigmergy help       # Show all commands');
        
    } else {
        console.log('❌ Global installation not found');
        console.log('\n💡 To install globally:');
        console.log('   npm install -g stigmergy-cli-multi-agents');
        console.log('\nOr setup manually:');
        console.log('   npm install');
        console.log('   npm run setup');
    }
}

// 如果直接运行
if (require.main === module) {
    quickSetup();
}

module.exports = { quickSetup };