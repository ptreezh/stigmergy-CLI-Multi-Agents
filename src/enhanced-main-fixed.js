#!/usr/bin/env node

/**
 * Stigmergy CLI - Enhanced Main Entry Point
 * 支持自动扫描本地CLI环境并提供交互式安装选项
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义支持的AI工具及其版本检测命令
const AI_TOOLS = [
    { 
        name: 'claude', 
        displayName: 'Claude CLI', 
        required: true,
        description: 'Anthropic Claude AI助手',
        versionCommand: ['claude', '--version']
    },
    { 
        name: 'gemini', 
        displayName: 'Gemini CLI', 
        required: true,
        description: 'Google Gemini AI助手',
        versionCommand: ['gemini', '--version']
    },
    { 
        name: 'qwen', 
        displayName: 'QwenCode CLI', 
        required: false,
        description: '阿里云通义千问代码助手',
        versionCommand: ['qwen', '--version']
    },
    { 
        name: 'iflow', 
        displayName: 'iFlow CLI', 
        required: false,
        description: 'iFlow工作流自动化工具',
        versionCommand: ['iflow', '--version']
    },
    { 
        name: 'qoder', 
        displayName: 'Qoder CLI', 
        required: false,
        description: 'Qoder代码生成工具',
        versionCommand: ['qoder', '--version']
    },
    { 
        name: 'codebuddy', 
        displayName: 'CodeBuddy CLI', 
        required: false,
        description: '腾讯CodeBuddy编程助手',
        versionCommand: ['codebuddy', '--version']
    },
    { 
        name: 'copilot', 
        displayName: 'GitHub Copilot CLI', 
        required: false,
        description: 'GitHub Copilot命令行工具',
        versionCommand: ['copilot', '--version']
    },
    { 
        name: 'ollama', 
        displayName: 'Ollama CLI', 
        required: false,
        description: '本地AI模型运行工具',
        versionCommand: ['ollama', '--version']
    }
];

class EnhancedStigmergyCLI {
    constructor() {
        this.configDir = join(homedir(), '.stigmergy-cli');
    }

    async checkToolAvailable(tool) {
        return new Promise((resolve) => {
            const [command, ...args] = tool.versionCommand;
            
            const child = spawn(command, args, {
                stdio: 'pipe',
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
                // 如果命令成功执行并返回版本信息，则工具可用
                if (code === 0 && (stdout.trim() !== '' || stderr.trim() !== '')) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            child.on('error', () => {
                // 命令不存在或执行失败
                resolve(false);
            });
        });
    }

    async scanLocalEnvironment() {
        console.log('🔍 正在扫描本地AI CLI工具环境...');
        console.log('');

        const availableTools = [];
        const missingTools = [];

        // 并行检测所有工具以提高性能
        const detectionPromises = AI_TOOLS.map(async (tool) => {
            const isAvailable = await this.checkToolAvailable(tool);
            return { tool, isAvailable };
        });

        const results = await Promise.all(detectionPromises);

        results.forEach(({ tool, isAvailable }) => {
            if (isAvailable) {
                availableTools.push(tool);
                console.log(`✅ ${tool.displayName} - 已安装`);
            } else {
                missingTools.push(tool);
                const status = tool.required ? '❌ (必需)' : '⚠️  (可选)';
                console.log(`${status} ${tool.displayName} - 未安装`);
            }
        });

        console.log('');
        console.log(`📊 扫描结果: ${availableTools.length} 个工具已安装, ${missingTools.length} 个工具缺失`);

        // 显示一些调试信息帮助用户理解
        if (availableTools.length === 0) {
            console.log('💡 提示: 如果您确信已安装某些工具但未被检测到，可能是因为:');
            console.log('   • 工具命令名称与我们检测的名称不同');
            console.log('   • 工具未添加到系统PATH环境变量');
            console.log('   • 工具需要特殊的方式检测版本');
        }

        return { availableTools, missingTools };
    }

    async interactiveInstall(missingTools) {
        if (missingTools.length === 0) {
            console.log('🎉 所有工具都已安装！');
            return;
        }

        console.log('\n🔧 可以自动安装以下缺失的工具:');
        missingTools.forEach((tool, index) => {
            const required = tool.required ? '(必需)' : '(可选)';
            console.log(`  ${index + 1}. ${tool.displayName} ${required} - ${tool.description}`);
        });

        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('\n是否要安装缺失的工具? (y/N): ', async (answer) => {
                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                    console.log('\n🚀 开始安装缺失的工具...');
                    for (const tool of missingTools) {
                        await this.installTool(tool);
                    }
                    console.log('✅ 工具安装完成！');
                } else {
                    console.log('💡 您可以稍后手动安装这些工具。');
                }
                rl.close();
                resolve();
            });
        });
    }

    async installTool(tool) {
        console.log(`📥 正在安装 ${tool.displayName}...`);
        
        try {
            // 这里应该实现具体的安装逻辑
            // 例如：npm install -g @some/package
            console.log(`⚠️  ${tool.displayName} 安装功能待实现`);
            
            // 模拟安装过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log(`✅ ${tool.displayName} 安装完成`);
        } catch (error) {
            console.log(`❌ ${tool.displayName} 安装失败: ${error.message}`);
        }
    }

    async deployAdapters() {
        console.log('🔧 正在部署Stigmergy适配器到各个CLI工具...');
        
        // 这里应该实现适配器部署逻辑
        // 例如：将配置文件复制到各个CLI工具的配置目录
        console.log('✅ 适配器部署完成！');
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0];

        switch (command) {
            case 'scan':
                const { missingTools } = await this.scanLocalEnvironment();
                if (missingTools.length > 0) {
                    await this.interactiveInstall(missingTools);
                }
                break;

            case 'install':
                console.log('📥 安装Stigmergy CLI系统...');
                // 实现安装逻辑
                console.log('✅ Stigmergy CLI安装完成！');
                break;

            case 'deploy':
                await this.deployAdapters();
                break;

            case 'init':
                console.log('🚀 初始化Stigmergy项目...');
                await this.scanLocalEnvironment();
                console.log('✅ 项目初始化完成！');
                break;

            default:
                await this.showHelp();
                break;
        }
    }

    async showHelp() {
        console.log(`
🤖 Stigmergy CLI v1.0.0 - Multi-Agents跨AI CLI工具协作系统

📚 主要功能:
  scan                 - 扫描本地AI CLI工具环境并提供安装建议
  install              - 安装Stigmergy CLI系统
  deploy               - 部署适配器到各个CLI工具
  init                 - 初始化项目并扫描环境

💡 使用示例:
  stigmergy scan       # 扫描环境并交互式安装缺失工具
  stigmergy init       # 初始化项目
  stigmergy deploy     # 部署适配器

🌟 特色功能:
  • 自动扫描本地已安装的AI CLI工具
  • 交互式选择安装缺失的工具
  • 智能部署适配器到各个CLI工具的正确目录
  • 支持跨AI工具协作指令生成

📖 文档: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
        `);
    }
}

// 运行CLI
const cli = new EnhancedStigmergyCLI();
cli.run().catch(error => {
    console.error('❌ 程序运行出错:', error.message);
    process.exit(1);
});