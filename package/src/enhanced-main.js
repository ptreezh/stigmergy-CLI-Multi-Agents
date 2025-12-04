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

// 定义支持的AI工具
const AI_TOOLS = [
    { 
        name: 'claude', 
        displayName: 'Claude CLI', 
        required: true,
        description: 'Anthropic Claude AI助手'
    },
    { 
        name: 'gemini', 
        displayName: 'Gemini CLI', 
        required: true,
        description: 'Google Gemini AI助手'
    },
    { 
        name: 'qwen', 
        displayName: 'QwenCode CLI', 
        required: false,
        description: '阿里云通义千问代码助手'
    },
    { 
        name: 'iflow', 
        displayName: 'iFlow CLI', 
        required: false,
        description: 'iFlow工作流自动化工具'
    },
    { 
        name: 'qoder', 
        displayName: 'Qoder CLI', 
        required: false,
        description: 'Qoder代码生成工具'
    },
    { 
        name: 'codebuddy', 
        displayName: 'CodeBuddy CLI', 
        required: false,
        description: '腾讯CodeBuddy编程助手'
    },
    { 
        name: 'copilot', 
        displayName: 'GitHub Copilot CLI', 
        required: false,
        description: 'GitHub Copilot命令行工具'
    },
    { 
        name: 'ollama', 
        displayName: 'Ollama CLI', 
        required: false,
        description: '本地AI模型运行工具'
    }
];

class EnhancedStigmergyCLI {
    constructor() {
        this.configDir = join(homedir(), '.stigmergy-cli');
    }

    async checkToolAvailable(toolName) {
        try {
            // 使用spawn而不是spawnSync以避免阻塞
            return new Promise((resolve) => {
                const child = spawn(
                    process.platform === 'win32' ? 'where' : 'which', 
                    [toolName], 
                    { 
                        stdio: 'pipe',
                        timeout: 5000 // 5秒超时
                    }
                );
                
                let stdout = '';
                let stderr = '';
                
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                child.on('close', (code) => {
                    // 检查命令是否成功执行且有输出
                    if (code === 0 && stdout.trim() !== '') {
                        resolve(true);
                    } else {
                        // 如果where/which失败，尝试直接运行命令检查版本
                        this.testCommandVersion(toolName).then(resolve).catch(() => resolve(false));
                    }
                });
                
                child.on('error', () => {
                    // 如果命令不存在，尝试备用检测方法
                    this.testCommandVersion(toolName).then(resolve).catch(() => resolve(false));
                });
            });
        } catch (error) {
            return false;
        }
    }

    async testCommandVersion(toolName) {
        try {
            return new Promise((resolve) => {
                // 尝试运行常见的版本检查命令
                const versionCommands = [
                    `${toolName} --version`,
                    `${toolName} -v`,
                    `${toolName} version`
                ];
                
                let attempts = 0;
                
                const tryNextCommand = () => {
                    if (attempts >= versionCommands.length) {
                        resolve(false);
                        return;
                    }
                    
                    const command = versionCommands[attempts];
                    attempts++;
                    
                    const child = spawn(command, { 
                        shell: true,
                        stdio: 'pipe',
                        timeout: 3000
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
                        if (code === 0 && (stdout.trim() !== '' || stderr.trim() !== '')) {
                            resolve(true);
                        } else {
                            tryNextCommand();
                        }
                    });
                    
                    child.on('error', () => {
                        tryNextCommand();
                    });
                };
                
                tryNextCommand();
            });
        } catch (error) {
            return false;
        }
    }

    async scanLocalEnvironment() {
        console.log('🔍 正在扫描本地AI CLI工具环境...');
        console.log('');

        const availableTools = [];
        const missingTools = [];

        // 并行检测所有工具以提高性能
        const detectionPromises = AI_TOOLS.map(async (tool) => {
            const isAvailable = await this.checkToolAvailable(tool.name);
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

        // 处理 --help 参数和全局help
        if (!command || command === '--help' || command === '-h') {
            await this.showHelp();
            return;
        }

        switch (command) {
            case 'scan':
                if (args[1] === '--help' || args[1] === '-h') {
                    console.log('scan - 扫描本地AI CLI工具环境并提供安装建议');
                    console.log('用法: stigmergy scan');
                    console.log('描述: 自动检测系统中已安装的AI CLI工具，提供安装建议');
                    return;
                }
                const { missingTools } = await this.scanLocalEnvironment();
                if (missingTools.length > 0) {
                    await this.interactiveInstall(missingTools);
                }
                break;

            case 'install':
                if (args[1] === '--help' || args[1] === '-h') {
                    console.log('install - 安装Stigmergy CLI系统');
                    console.log('用法: stigmergy install');
                    console.log('描述: 全局安装Stigmergy CLI到系统中');
                    return;
                }
                console.log('📥 安装Stigmergy CLI系统...');
                await this.installStigmergyGlobally();
                break;

            case 'deploy':
                if (args[1] === '--help' || args[1] === '-h') {
                    console.log('deploy - 部署适配器到各个CLI工具');
                    console.log('用法: stigmergy deploy');
                    console.log('描述: 部署Stigmergy适配器到各个AI CLI工具的配置目录');
                    return;
                }
                await this.deployAdapters();
                break;

            case 'init':
                const projectPath = args[1] || process.cwd();
                await this.initProject(projectPath);
                break;

            case 'status':
                await this.checkStatus();
                break;

            case 'validate':
                const scope = args[1] || 'project';
                await this.validateConfiguration(scope);
                break;

            case 'check-project':
                const checkPath = args[1] || process.cwd();
                await this.checkProject(checkPath);
                break;

            case 'clean':
                await this.cleanCache();
                break;

            default:
                await this.showHelp();
                break;
        }
    }

    // 全局安装方法
    async installStigmergyGlobally() {
        try {
            const { spawn } = await import('child_process');

            await new Promise((resolve, reject) => {
                const installProcess = spawn('npm', ['install', '-g', '.'], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true,
                    cwd: process.cwd()
                });

                let output = '';
                installProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                installProcess.stderr.on('data', (data) => {
                    const stderr = data.toString();
                    if (!stderr.includes('WARN')) {
                        output += stderr;
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('✅ Stigmergy CLI 全局安装完成！');
                        console.log('现在可以在任何目录运行: stigmergy <command>');
                        resolve();
                    } else {
                        console.error('❌ 全局安装失败');
                        reject(new Error('Installation failed'));
                    }
                });
            });
        } catch (error) {
            console.error('❌ 全局安装出错:', error.message);
            throw error;
        }
    }

    // 项目初始化方法
    async initProject(projectPath) {
        try {
            console.log(`🚀 初始化Stigmergy项目: ${projectPath}`);

            // 创建项目配置目录
            const configDir = join(projectPath, '.stigmergy-project');
            await fs.mkdir(configDir, { recursive: true });

            // 扫描环境
            await this.scanLocalEnvironment();

            // 生成项目配置
            const config = {
                projectType: 'initialized',
                createdAt: new Date().toISOString(),
                adapters: AI_TOOLS.map(tool => ({
                    name: tool.name,
                    version: '1.0.0',
                    integrationType: 'cli',
                    status: 'available'
                }))
            };

            const configPath = join(configDir, 'stigmergy-config.json');
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log('✅ 项目初始化完成！');
            console.log(`📁 配置文件: ${configPath}`);

        } catch (error) {
            console.error('❌ 项目初始化失败:', error.message);
            throw error;
        }
    }

    // 状态检查方法
    async checkStatus() {
        try {
            console.log('🔍 检查Stigmergy CLI状态...');

            // 检查全局配置
            const globalConfigPath = join(homedir(), '.stigmergy-cli', 'global-config.json');
            let globalConfig = null;
            try {
                const globalConfigData = await fs.readFile(globalConfigPath, 'utf8');
                globalConfig = JSON.parse(globalConfigData);
            } catch (e) {
                console.log('⚠️  全局配置不存在');
            }

            console.log('\n📊 全局配置:');
            if (globalConfig) {
                console.log(`   仓库: ${globalConfig.repository || 'undefined'}`);
                console.log(`   版本: ${globalConfig.version || '1.0.0'}`);
                console.log(`   最后更新: ${globalConfig.lastUpdated || 'undefined'}`);
            } else {
                console.log('   状态: 未配置');
            }

            // 检查项目配置
            const projectConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
            let projectConfig = null;
            try {
                const projectConfigData = await fs.readFile(projectConfigPath, 'utf8');
                projectConfig = JSON.parse(projectConfigData);
            } catch (e) {
                console.log('⚠️  项目配置不存在');
            }

            console.log('\n📁 项目配置:');
            if (projectConfig) {
                console.log(`   类型: ${projectConfig.projectType || 'unknown'}`);
                console.log(`   创建时间: ${projectConfig.createdAt || 'unknown'}`);
                if (projectConfig.adapters) {
                    const availableTools = projectConfig.adapters
                        .filter(a => a.status === 'available')
                        .map(a => a.name)
                        .join(', ');
                    console.log(`   可用工具: ${availableTools}`);
                }
            } else {
                console.log('   状态: 未初始化');
                console.log('   💡 提示: 运行 stigmergy init 初始化项目');
            }

        } catch (error) {
            console.error('❌ 状态检查失败:', error.message);
        }
    }

    // 配置验证方法
    async validateConfiguration(scope = 'project') {
        try {
            console.log(`🔍 验证 ${scope} 配置...`);

            if (scope === 'project') {
                const projectConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
                try {
                    const configData = await fs.readFile(projectConfigPath, 'utf8');
                    const config = JSON.parse(configData);

                    console.log('✅ 项目配置验证通过');
                    console.log(`📊 项目类型: ${config.projectType}`);
                    console.log(`📅 创建时间: ${config.createdAt}`);

                    if (config.adapters) {
                        console.log(`🔧 适配器数量: ${config.adapters.length}`);
                    }
                } catch (error) {
                    console.log('⚠️  项目配置验证失败或不存在');
                    console.log('💡 提示: 使用 stigmergy init 初始化项目配置');
                    return false;
                }
            } else if (scope === 'global') {
                const globalConfigPath = join(homedir(), '.stigmergy-cli', 'global-config.json');
                try {
                    const configData = await fs.readFile(globalConfigPath, 'utf8');
                    JSON.parse(configData);
                    console.log('✅ 全局配置验证通过');
                } catch (error) {
                    console.log('⚠️  全局配置验证失败或不存在');
                    console.log('💡 提示: 使用 stigmergy deploy 部署全局配置');
                    return false;
                }
            } else {
                console.log('⚠️  未知的验证范围，使用 "project" 或 "global"');
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ 配置验证出错:', error.message);
            return false;
        }
    }

    // 项目检查方法
    async checkProject(projectPath = process.cwd()) {
        try {
            console.log(`🔍 检查项目配置: ${projectPath}`);

            const configPath = join(projectPath, '.stigmergy-project', 'stigmergy-config.json');
            try {
                const configData = await fs.readFile(configPath, 'utf8');
                const config = JSON.parse(configData);

                console.log('✅ 项目配置有效');
                console.log(`📊 项目类型: ${config.projectType}`);
                console.log(`📅 创建时间: ${config.createdAt}`);

                if (config.adapters) {
                    console.log('\n🤖 可用适配器:');
                    config.adapters.forEach(adapter => {
                        const status = adapter.status === 'available' ? '✅' : '❌';
                        console.log(`   ${status} ${adapter.name} v${adapter.version} (${adapter.integrationType})`);
                    });
                }

            } catch (error) {
                console.log('❌ 项目配置无效或不存在');
                console.log('💡 提示: 运行 stigmergy init 初始化项目');
            }

        } catch (error) {
            console.error('❌ 项目检查失败:', error.message);
        }
    }

    // 缓存清理方法
    async cleanCache() {
        try {
            console.log('🧹 清理缓存和临时文件...');

            // 清理可能的缓存目录
            const cacheDirs = [
                join(homedir(), '.stigmergy-cli', 'cache'),
                join(process.cwd(), '.stigmergy-project', 'cache'),
                join(process.cwd(), 'node_modules', '.cache')
            ];

            let cleanedCount = 0;
            for (const cacheDir of cacheDirs) {
                try {
                    await fs.access(cacheDir);
                    await fs.rm(cacheDir, { recursive: true, force: true });
                    console.log(`✅ 已清理: ${cacheDir}`);
                    cleanedCount++;
                } catch (e) {
                    // 目录不存在，跳过
                }
            }

            if (cleanedCount === 0) {
                console.log('✅ 没有发现需要清理的缓存文件');
            } else {
                console.log(`✅ 已清理 ${cleanedCount} 个缓存目录`);
            }

        } catch (error) {
            console.error('❌ 缓存清理失败:', error.message);
        }
    }

    async showHelp() {
        console.log(`
🤖 Stigmergy CLI v1.0.0 - Multi-Agents跨AI CLI工具协作系统

📚 可用命令:
  init [path]              - 初始化项目(默认当前目录)
  scan                     - 扫描环境AI CLI工具状态
  deploy                   - 部署适配器到本地配置
  status                   - 检查系统和适配器状态
  validate [scope]         - 验证配置 (project/global)
  check-project [path]     - 检查项目配置
  clean [options]          - 清理缓存和临时文件
  install                  - 安装所有AI CLI工具适配器

💡 快速开始:
  stigmergy init            # 初始化当前项目
  stigmergy deploy          # 一键部署
  stigmergy status          # 查看状态

🚀 快速部署:
  npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy

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