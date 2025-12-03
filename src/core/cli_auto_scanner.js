#!/usr/bin/env node

/**
 * Stigmergy CLI Auto-Scanner and Installer
 * 自动扫描本地CLI工具并处理插件安装
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

class CLIAutoScanner {
    constructor() {
        this.platform = os.platform();
        this.arch = os.arch();
        this.shell = process.env.SHELL || (this.platform === 'win32' ? 'cmd.exe' : 'bash');
        this.scanResults = new Map();
        this.globalMemoryDir = path.join(os.homedir(), '.stigmergy');
        this.pluginsDir = path.join(__dirname, '..', 'plugins');
        this.configDir = path.join(__dirname, '..', 'config');
        
        // CLI工具规格配置 - 基于实际安装的包名
        this.cliSpecs = new Map([
            ['qwen', {
                name: 'qwen',
                type: 'npm',
                globalCheck: 'npm list -g @qwen-code/qwen-code',
                installCmd: 'npm install -g @qwen-code/qwen-code',
                binaryNames: ['qwen'],
                description: 'Qwen AI CLI tool',
                actualPackage: '@qwen-code/qwen-code'
            }],
            ['iflow', {
                name: 'iflow',
                type: 'npm', 
                globalCheck: 'npm list -g @iflow-ai/iflow-cli',
                installCmd: 'npm install -g @iflow-ai/iflow-cli',
                binaryNames: ['iflow'],
                description: 'iFlow workflow CLI tool',
                actualPackage: '@iflow-ai/iflow-cli'
            }],
            ['gemini', {
                name: 'gemini',
                type: 'npm',
                globalCheck: 'npm list -g @google/gemini-cli',
                installCmd: 'npm install -g @google/gemini-cli', 
                binaryNames: ['gemini'],
                description: 'Google Gemini AI CLI tool',
                actualPackage: '@google/gemini-cli'
            }],
            ['copilot', {
                name: 'copilot',
                type: 'npm',
                globalCheck: 'npm list -g @github/copilot',
                installCmd: 'npm install -g @github/copilot',
                binaryNames: ['copilot'],
                description: 'GitHub Copilot CLI tool',
                actualPackage: '@github/copilot'
            }],
            ['claude', {
                name: 'claude',
                type: 'npm',
                globalCheck: 'npm list -g @anthropic-ai/claude-code',
                installCmd: 'npm install -g @anthropic-ai/claude-code',
                binaryNames: ['claude'],
                description: 'Anthropic Claude CLI tool',
                actualPackage: '@anthropic-ai/claude-code'
            }],
            ['codex', {
                name: 'codex',
                type: 'npm',
                globalCheck: 'npm list -g @openai/codex',
                installCmd: 'npm install -g @openai/codex',
                binaryNames: ['codex'],
                description: 'OpenAI Codex CLI tool',
                actualPackage: '@openai/codex'
            }]
        ]);
    }

    /**
     * 创建安全的文件写入（解决GBK编码问题）
     */
    async safeWriteFile(filePath, content, encoding = 'utf-8') {
        try {
            // 确保目录存在
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            
            // Windows系统下特殊处理GBK编码
            if (this.platform === 'win32') {
                // 先尝试UTF-8
                try {
                    await fs.writeFile(filePath, content, 'utf8');
                } catch (error) {
                    console.log(`⚠️  UTF-8写入失败，尝试GBK编码: ${filePath}`);
                    // 如果UTF-8失败，尝试GBK（Windows中文系统）
                    const iconv = require('iconv-lite');
                    const gbkContent = iconv.encode(content, 'gbk');
                    await fs.writeFile(filePath, gbkContent);
                }
            } else {
                // 非Windows系统直接使用UTF-8
                await fs.writeFile(filePath, content, encoding);
            }
            
            console.log(`✅ 安全写入文件: ${filePath}`);
            return true;
        } catch (error) {
            console.error(`❌ 写入文件失败: ${filePath}`, error.message);
            return false;
        }
    }

    /**
     * 安全的文件读取（解决GBK编码问题）
     */
    async safeReadFile(filePath, encoding = 'utf-8') {
        try {
            if (!await this.fileExists(filePath)) {
                return null;
            }

            if (this.platform === 'win32') {
                // Windows系统下先尝试UTF-8，失败后尝试GBK
                try {
                    return await fs.readFile(filePath, 'utf8');
                } catch (error) {
                    console.log(`⚠️  UTF-8读取失败，尝试GBK编码: ${filePath}`);
                    const iconv = require('iconv-lite');
                    const buffer = await fs.readFile(filePath);
                    return iconv.decode(buffer, 'gbk');
                }
            } else {
                return await fs.readFile(filePath, encoding);
            }
        } catch (error) {
            console.error(`❌ 读取文件失败: ${filePath}`, error.message);
            return null;
        }
    }

    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 扫描本地已安装的CLI工具
     */
    async scanLocalCLI() {
        console.log('🔍 开始扫描本地CLI工具...');
        
        const results = new Map();
        
        for (const [cliName, spec] of this.cliSpecs) {
            console.log(`\n📋 检查 ${cliName} (${spec.description})...`);
            
            const cliInfo = {
                name: cliName,
                spec: spec,
                installed: false,
                version: null,
                path: null,
                type: spec.type,
                installCommand: spec.installCmd
            };
            
            // 检查全局安装状态
            try {
                if (spec.type === 'npm') {
                    // NPM包检查
                    const checkResult = execSync(spec.globalCheck, { 
                        encoding: 'utf8',
                        shell: true,
                        timeout: 10000
                    }).toString();
                    
                    cliInfo.installed = true;
                    console.log(`✅ ${cliName} 已通过NPM全局安装`);
                    
                    // 获取版本信息
                    try {
                        const versionCmd = `${spec.binaryNames[0]} --version`;
                        const version = execSync(versionCmd, { 
                            encoding: 'utf8',
                            shell: true,
                            timeout: 5000
                        }).toString().trim();
                        cliInfo.version = version;
                    } catch (e) {
                        console.log(`⚠️  无法获取 ${cliName} 版本信息`);
                    }
                    
                } else if (spec.type === 'python') {
                    // Python包检查
                    const checkResult = execSync(spec.globalCheck, { 
                        encoding: 'utf8',
                        shell: true,
                        timeout: 10000
                    }).toString();
                    
                    cliInfo.installed = true;
                    console.log(`✅ ${cliName} 已通过pip全局安装`);
                    
                    // 获取版本信息
                    try {
                        const versionCmd = `${spec.binaryNames[0]} --version`;
                        const version = execSync(versionCmd, { 
                            encoding: 'utf8',
                            shell: true,
                            timeout: 5000
                        }).toString().trim();
                        cliInfo.version = version;
                    } catch (e) {
                        console.log(`⚠️  无法获取 ${cliName} 版本信息`);
                    }
                }
                
                // 获取二进制文件路径
                if (cliInfo.installed) {
                    try {
                        const whichCmd = this.platform === 'win32' ? 'where' : 'which';
                        const binaryPath = execSync(`${whichCmd} ${spec.binaryNames[0]}`, { 
                            encoding: 'utf8',
                            shell: true,
                            timeout: 5000
                        }).toString().trim();
                        cliInfo.path = binaryPath;
                        console.log(`📍 ${cliName} 路径: ${binaryPath}`);
                    } catch (e) {
                        console.log(`⚠️  无法获取 ${cliName} 二进制路径`);
                    }
                }
                
            } catch (error) {
                console.log(`❌ ${cliName} 未安装`);
            }
            
            results.set(cliName, cliInfo);
        }
        
        this.scanResults = results;
        
        // 显示扫描结果
        this.displayScanResults();
        
        return results;
    }

    /**
     * 显示扫描结果
     */
    displayScanResults() {
        console.log('\n📊 CLI工具扫描结果:');
        console.log('─'.repeat(60));
        
        let installedCount = 0;
        for (const [name, info] of this.scanResults) {
            const status = info.installed ? '✅ 已安装' : '❌ 未安装';
            const version = info.version ? ` (v${info.version})` : '';
            const path = info.path ? `\n   路径: ${info.path}` : '';
            
            console.log(`${name.padEnd(10)} ${status}${version}${path}`);
            
            if (info.installed) installedCount++;
        }
        
        console.log('─'.repeat(60));
        console.log(`总计: ${installedCount}/${this.cliSpecs.size} 个CLI工具已安装\n`);
    }

    /**
     * 询问用户是否安装缺失的CLI
     */
    async askUserForInstallation() {
        const missingCLIs = [];
        
        for (const [name, info] of this.scanResults) {
            if (!info.installed) {
                missingCLIs.push(info);
            }
        }
        
        if (missingCLIs.length === 0) {
            console.log('🎉 所有CLI工具都已安装！');
            return [];
        }
        
        console.log(`\n❓ 发现 ${missingCLIs.length} 个未安装的CLI工具:`);
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const toInstall = [];
        
        for (const cli of missingCLIs) {
            const question = `是否安装 ${cli.name} (${cli.description})? [y/n]`;
            
            const answer = await new Promise((resolve) => {
                rl.question(question, (answer) => {
                    resolve(answer.toLowerCase().trim());
                });
            });
            
            if (answer === 'y' || answer === 'yes') {
                toInstall.push(cli);
            }
        }
        
        rl.close();
        
        return toInstall;
    }

    /**
     * 安装CLI工具
     */
    async installCLI(toInstall) {
        if (toInstall.length === 0) {
            return;
        }
        
        console.log(`\n🚀 开始安装 ${toInstall.length} 个CLI工具...`);
        
        for (const cli of toInstall) {
            console.log(`\n📦 安装 ${cli.name}...`);
            
            try {
                console.log(`执行: ${cli.installCommand}`);
                
                const installProcess = spawn(cli.installCommand, [], {
                    shell: true,
                    stdio: 'inherit',
                    timeout: 120000 // 2分钟超时
                });
                
                await new Promise((resolve, reject) => {
                    installProcess.on('close', (code) => {
                        if (code === 0) {
                            console.log(`✅ ${cli.name} 安装成功`);
                            resolve();
                        } else {
                            console.error(`❌ ${cli.name} 安装失败，退出码: ${code}`);
                            reject(new Error(`Installation failed with code ${code}`));
                        }
                    });
                    
                    installProcess.on('error', (error) => {
                        console.error(`❌ ${cli.name} 安装错误:`, error.message);
                        reject(error);
                    });
                });
                
            } catch (error) {
                console.error(`❌ ${cli.name} 安装失败:`, error.message);
            }
        }
    }

    /**
     * 复制插件扩展到CLI安装路径
     */
    async copyPluginExtensions() {
        console.log('\n🔧 复制插件扩展到CLI安装路径...');
        
        const pluginDir = path.join(__dirname, '..', 'plugins');
        
        // 确保插件目录存在
        if (!await this.fileExists(pluginDir)) {
            console.log('⚠️  插件目录不存在，跳过插件复制');
            return;
        }
        
        for (const [cliName, cliInfo] of this.scanResults) {
            if (!cliInfo.installed || !cliInfo.path) {
                continue;
            }
            
            console.log(`\n📋 为 ${cliName} 复制插件扩展...`);
            
            // 获取CLI的安装目录
            const cliDir = path.dirname(cliInfo.path);
            const cliPluginDir = path.join(cliDir, 'stigmergy-plugins');
            
            // 创建插件目录
            await fs.mkdir(cliPluginDir, { recursive: true });
            
            // 复制通用插件文件
            const commonPlugins = ['cli-base-plugin.js', 'encoding-handler.js', 'memory-manager.js'];
            
            for (const plugin of commonPlugins) {
                const sourcePath = path.join(pluginDir, plugin);
                const targetPath = path.join(cliPluginDir, plugin);
                
                if (await this.fileExists(sourcePath)) {
                    try {
                        const content = await fs.readFile(sourcePath, 'utf8');
                        await this.safeWriteFile(targetPath, content);
                        console.log(`✅ 复制插件: ${plugin} -> ${targetPath}`);
                    } catch (error) {
                        console.error(`❌ 复制插件失败: ${plugin}`, error.message);
                    }
                }
            }
            
            // 复制CLI特定插件
            const specificPlugin = `${cliName}-adapter.js`;
            const specificSourcePath = path.join(pluginDir, specificPlugin);
            const specificTargetPath = path.join(cliPluginDir, specificPlugin);
            
            if (await this.fileExists(specificSourcePath)) {
                try {
                    const content = await fs.readFile(specificSourcePath, 'utf8');
                    await this.safeWriteFile(specificTargetPath, content);
                    console.log(`✅ 复制特定插件: ${specificPlugin} -> ${specificTargetPath}`);
                } catch (error) {
                    console.error(`❌ 复制特定插件失败: ${specificPlugin}`, error.message);
                }
            }
        }
    }

    /**
     * 生成全局记忆配置MD文件
     */
    async generateGlobalMemoryFiles() {
        console.log('\n📝 生成全局记忆配置文件...');
        
        // 确保全局配置目录存在
        await fs.mkdir(this.globalMemoryDir, { recursive: true });
        
        // 生成CLI工具调用模式文档
        const callPatternsPath = path.join(this.globalMemoryDir, 'cli-call-patterns.md');
        const callPatternsContent = this.generateCallPatternsDoc();
        await this.safeWriteFile(callPatternsPath, callPatternsContent);
        
        // 生成安装路径文档
        const installPathsPath = path.join(this.globalMemoryDir, 'cli-installation-paths.md');
        const installPathsContent = this.generateInstallPathsDoc();
        await this.safeWriteFile(installPathsPath, installPathsContent);
        
        // 生成协作配置文档
        const collaborationConfigPath = path.join(this.globalMemoryDir, 'collaboration-config.md');
        const collaborationContent = this.generateCollaborationConfig();
        await this.safeWriteFile(collaborationConfigPath, collaborationContent);
        
        console.log(`✅ 全局配置文件已生成到: ${this.globalMemoryDir}`);
    }

    /**
     * 生成CLI调用模式文档
     */
    generateCallPatternsDoc() {
        let content = `# CLI工具调用模式文档\n\n`;
        content += `> 自动生成于: ${new Date().toISOString()}\n\n`;
        content += `## 已安装CLI工具调用规范\n\n`;
        
        for (const [name, info] of this.scanResults) {
            if (info.installed) {
                content += `### ${name}\n\n`;
                content += `- **类型**: ${info.type}\n`;
                content += `- **版本**: ${info.version || '未知'}\n`;
                content += `- **安装命令**: \`${info.installCommand}\`\n`;
                
                // 添加调用模式
                switch (name) {
                    case 'qwen':
                        content += `- **调用模式**:\n`;
                        content += `  - \`qwen [prompt]\`\n`;
                        content += `  - \`qwen --prompt "your prompt" --approval-mode yolo\`\n`;
                        break;
                    case 'iflow':
                        content += `- **调用模式**:\n`;
                        content += `  - \`iflow [prompt]\`\n`;
                        content += `  - \`iflow --prompt "your prompt" --yolo --approval-mode auto\`\n`;
                        break;
                    case 'gemini':
                        content += `- **调用模式**:\n`;
                        content += `  - \`gemini [prompt]\`\n`;
                        content += `  - \`gemini --prompt "your prompt" --api-key YOUR_KEY\`\n`;
                        break;
                    case 'copilot':
                        content += `- **调用模式**:\n`;
                        content += `  - \`copilot -p "your prompt"\`\n`;
                        content += `  - \`copilot --prompt "your prompt" --allow-all-tools --auto-approve\`\n`;
                        break;
                    case 'claude':
                        content += `- **调用模式**:\n`;
                        content += `  - \`claude [prompt]\`\n`;
                        content += `  - \`claude --prompt "your prompt" --model claude-3\`\n`;
                        break;
                    case 'codex':
                        content += `- **调用模式**:\n`;
                        content += `  - \`codex "your prompt"\`\n`;
                        content += `  - \`codex exec "your prompt" --auto-approve\`\n`;
                        break;
                }
                
                content += `\n`;
            }
        }
        
        return content;
    }

    /**
     * 生成安装路径文档
     */
    generateInstallPathsDoc() {
        let content = `# CLI工具安装路径文档\n\n`;
        content += `> 自动生成于: ${new Date().toISOString()}\n\n`;
        content += `## 已安装CLI工具路径信息\n\n`;
        
        for (const [name, info] of this.scanResults) {
            if (info.installed && info.path) {
                content += `### ${name}\n\n`;
                content += `- **二进制路径**: \`${info.path}\`\n`;
                content += `- **安装目录**: \`${path.dirname(info.path)}\`\n`;
                content += `- **插件目录**: \`${path.join(path.dirname(info.path), 'stigmergy-plugins')}\`\n`;
                content += `\n`;
            }
        }
        
        return content;
    }

    /**
     * 生成协作配置文档
     */
    generateCollaborationConfig() {
        let content = `# Stigmergy CLI协作配置\n\n`;
        content += `> 自动生成于: ${new Date().toISOString()}\n\n`;
        content += `## 环境信号配置\n\n`;
        content += `每个CLI工具都可以通过以下方式进行协作:\n\n`;
        
        for (const [name, info] of this.scanResults) {
            if (info.installed) {
                content += `### ${name} 环境信号\n\n`;
                content += `- **信号目录**: \`${this.globalMemoryDir}/signals/${name}\`\n`;
                content += `- **历史文件**: \`${this.globalMemoryDir}/history/${name}.json\`\n`;
                content += `- **上下文目录**: \`${this.globalMemoryDir}/context/\`\n`;
                content += `- **协作状态**: \`${this.globalMemoryDir}/collaboration-status.json\`\n`;
                content += `\n`;
            }
        }
        
        content += `## 协作规则\n\n`;
        content += `1. 每个CLI在执行前检查环境信号\n`;
        content += `2. 发现其他CLI的请求时自动协作\n`;
        content += `3. 协作结果写入共享上下文\n`;
        content += `4. 更新协作状态和历史记录\n`;
        
        return content;
    }

    /**
     * 重新扫描本地CLI
     */
    async rescanLocalCLI() {
        console.log('\n🔄 重新扫描本地CLI工具...');
        return await this.scanLocalCLI();
    }

    /**
     * 运行完整的自动扫描和安装流程
     */
    async runFullProcess() {
        console.log('🚀 启动Stigmergy CLI自动扫描和安装流程\n');
        
        try {
            // 步骤1: 扫描本地CLI
            await this.scanLocalCLI();
            
            // 步骤2: 询问用户是否安装缺失的CLI
            const toInstall = await this.askUserForInstallation();
            
            // 步骤3: 安装CLI工具
            await this.installCLI(toInstall);
            
            // 步骤4: 重新扫描本地CLI
            await this.rescanLocalCLI();
            
            // 步骤5: 复制插件扩展
            await this.copyPluginExtensions();
            
            // 步骤6: 生成全局记忆配置文件
            await this.generateGlobalMemoryFiles();
            
            console.log('\n🎉 Stigmergy CLI自动扫描和安装流程完成！');
            console.log('\n📋 总结:');
            console.log('✅ CLI工具扫描完成');
            console.log('✅ 缺失工具安装完成');
            console.log('✅ 插件扩展复制完成');
            console.log('✅ 全局配置生成完成');
            
        } catch (error) {
            console.error('\n❌ 自动扫描和安装流程失败:', error.message);
            process.exit(1);
        }
    }
}

// 主执行函数
async function main() {
    const scanner = new CLIAutoScanner();
    
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
Stigmergy CLI Auto-Scanner
自动扫描本地CLI工具并处理插件安装

用法:
  node cli-auto-scanner.js [选项]

选项:
  --help, -h     显示帮助信息
  --scan-only    仅扫描，不安装
  --install-only 仅安装，不扫描
  --rescan       重新扫描
        `);
        return;
    }
    
    if (process.argv.includes('--scan-only')) {
        await scanner.scanLocalCLI();
        return;
    }
    
    if (process.argv.includes('--rescan')) {
        await scanner.rescanLocalCLI();
        await scanner.copyPluginExtensions();
        await scanner.generateGlobalMemoryFiles();
        return;
    }
    
    // 运行完整流程
    await scanner.runFullProcess();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = CLIAutoScanner;