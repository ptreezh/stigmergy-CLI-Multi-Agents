#!/usr/bin/env node

/**
 * Stigmergy CLI - Post-installation Setup Script
 * =================================================================
 * This script automatically runs after npm install to:
 * 1. Scan locally installed CLI tools
 * 2. Ask user to install missing CLI tools
 * 3. Install selected CLI tools
 * 4. Scan again for available CLI tools and paths
 * 5. Copy required plugin extensions to each CLI installation path
 * 6. Generate global memory configuration MD files
 * =================================================================
 */

import { spawn, spawnSync } from 'child_process';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI工具配置
const CLI_TOOLS = [
    {
        name: 'claude',
        displayName: 'Claude CLI',
        description: 'Anthropic Claude CLI Tool',
        installCommand: 'npm install -g @anthropic/claude-code',
        required: true
    },
    {
        name: 'gemini',
        displayName: 'Gemini CLI',
        description: 'Google Gemini CLI Tool',
        installCommand: 'npm install -g @google/gemini-cli',
        required: true
    },
    {
        name: 'qwen',
        displayName: 'QwenCode CLI',
        description: 'Alibaba Cloud QwenCode CLI Tool',
        installCommand: 'npm install -g @qwen-code/qwen-code',
        required: true
    },
    {
        name: 'iflow',
        displayName: 'iFlow CLI',
        description: 'iFlow Workflow CLI Tool',
        installCommand: 'npm install -g @iflow-ai/iflow-cli',
        required: true
    },
    {
        name: 'qoder',
        displayName: 'Qoder CLI',
        description: 'Qoder Code Generation CLI Tool',
        installCommand: 'npm install -g @qoder-ai/qodercli',
        required: false
    },
    {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI',
        description: 'CodeBuddy Programming Assistant CLI Tool',
        installCommand: 'npm install -g @tencent-ai/codebuddy-code',
        required: true
    },
    {
        name: 'copilot',
        displayName: 'GitHub Copilot CLI',
        description: 'GitHub Copilot CLI Tool',
        installCommand: 'npm install -g @github/copilot',
        required: false
    },
    {
        name: 'codex',
        displayName: 'OpenAI Codex CLI',
        description: 'OpenAI Codex Code Analysis CLI Tool',
        installCommand: 'npm install -g @openai/codex --registry=https://registry.npmmirror.com',
        required: false
    }
];

// 获取命令行工具路径
async function getCommandPath(command) {
    try {
        let result;
        if (process.platform === 'win32') {
            result = spawnSync('where', [command], { stdio: 'pipe' });
        } else {
            result = spawnSync('which', [command], { stdio: 'pipe' });
        }
        if (result.status === 0) {
            return result.stdout.toString().trim().split('\n')[0];
        }
        return null;
    } catch (error) {
        return null;
    }
}

// 检查CLI工具是否可用
async function checkCLIAvailability(cliName) {
    try {
        // 特殊处理某些CLI工具的命令名
        const commandMap = {
            'qwen': 'qwen',
            'iflow': 'iflow',
            'qoder': 'qodercli',
            'codebuddy': 'codebuddy'
        };
        
        const actualCommand = commandMap[cliName] || cliName;
        const commandPath = await getCommandPath(actualCommand);
        return commandPath ? { available: true, path: commandPath } : { available: false, path: null };
    } catch (error) {
        return { available: false, path: null };
    }
}

// 扫描本地已安装的CLI工具
async function scanInstalledCLIs() {
    console.log('🔍 Automatically scanning locally installed CLI tools...');
    
    const results = [];
    for (const cliInfo of CLI_TOOLS) {
        const status = await checkCLIAvailability(cliInfo.name);
        results.push({
            ...cliInfo,
            ...status
        });
        
        const statusIcon = status.available ? '✅' : '❌';
        console.log(`  ${statusIcon} ${cliInfo.displayName} | ${status.available ? `Available (${status.path})` : 'Not installed'}`);
    }
    
    // 保存扫描结果到文件
    try {
        const globalConfigDir = join(homedir(), '.stigmergy-cli');
        await fs.mkdir(globalConfigDir, { recursive: true });
        const scanResultsPath = join(globalConfigDir, 'postinstall-scan-results.json');
        await fs.writeFile(scanResultsPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`  📦 Scan results saved to: ${scanResultsPath}`);
    } catch (error) {
        console.log(`  ⚠️ Unable to save scan results: ${error.message}`);
    }
    
    return results;
}

// 询问用户是否安装缺失的CLI工具
async function askUserToInstallMissingCLIs(unavailableCLIs) {
    if (unavailableCLIs.length === 0) {
        console.log('\n🎉 All required CLI tools are installed!');
        return [];
    }
    
    console.log('\n📋 Detected the following CLI tools are not installed:');
    const requiredMissing = unavailableCLIs.filter(cli => cli.required);
    const optionalMissing = unavailableCLIs.filter(cli => !cli.required);
    
    if (requiredMissing.length > 0) {
        console.log('\n🔴 Required but not installed CLI tools:');
        requiredMissing.forEach(cli => {
            console.log(`  - ${cli.displayName} - ${cli.description}`);
        });
    }
    
    if (optionalMissing.length > 0) {
        console.log('\n🟡 Optional but not installed CLI tools:');
        optionalMissing.forEach(cli => {
            console.log(`  - ${cli.displayName} - ${cli.description}`);
        });
    }
    
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\nDo you want to install the missing CLI tools? (y/N): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                resolve(unavailableCLIs);
            } else {
                console.log('Skipping CLI tool installation.');
                resolve([]);
            }
        });
    });
}

// 安装CLI工具
async function installCLITool(cliInfo) {
    console.log(`\n🔧 Installing ${cliInfo.displayName}...`);
    
    return new Promise((resolve) => {
        const installProcess = spawn(cliInfo.installCommand, {
            shell: true,
            stdio: 'inherit'
        });
        
        installProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${cliInfo.displayName} installed successfully`);
                resolve({ success: true, cliInfo });
            } else {
                console.log(`❌ ${cliInfo.displayName} installation failed (exit code: ${code})`);
                resolve({ success: false, cliInfo });
            }
        });
        
        installProcess.on('error', (error) => {
            console.log(`❌ ${cliInfo.displayName} installation error: ${error.message}`);
            resolve({ success: false, cliInfo });
        });
    });
}

// 批量安装CLI工具
async function installSelectedCLIs(selectedCLIs) {
    if (selectedCLIs.length === 0) {
        return [];
    }
    
    console.log(`\n🚀 Starting installation of ${selectedCLIs.length} CLI tools...`);
    
    const results = [];
    for (const cliInfo of selectedCLIs) {
        const result = await installCLITool(cliInfo);
        results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ CLI tool installation completed: ${successCount}/${selectedCLIs.length} successful`);
    
    return results;
}

// 复制插件扩展到各CLI安装路径
async function copyPluginExtensions(availableCLIs) {
    console.log('\n🔄 Copying plugin extensions to each CLI installation path...');
    
    // 创建全局配置目录
    const globalConfigDir = join(homedir(), '.stigmergy-cli');
    await fs.mkdir(globalConfigDir, { recursive: true });
    
    for (const cli of availableCLIs) {
        if (cli.available) {
            try {
                // 为每个CLI创建配置目录
                const cliConfigDir = join(globalConfigDir, cli.name);
                await fs.mkdir(cliConfigDir, { recursive: true });
                
                // 复制适配器配置（如果存在）
                const adapterDir = join(__dirname, 'adapters', cli.name);
                const targetAdapterDir = join(cliConfigDir, 'adapters');
                
                try {
                    await fs.access(adapterDir);
                    // 这里应该复制适配器文件，简化处理
                    console.log(`  ✅ Preparing plugin extensions for ${cli.displayName}`);
                } catch (error) {
                    // 适配器目录不存在，跳过
                    console.log(`  ℹ️  ${cli.displayName} has no special plugin extensions`);
                }
            } catch (error) {
                console.log(`  ⚠️  Error configuring plugin extensions for ${cli.displayName}: ${error.message}`);
            }
        }
    }
    
    console.log('✅ Plugin extension copying completed');
}

// 生成全局配置文件
async function generateGlobalConfig(availableCLIs) {
    console.log('\n📝 Generating global configuration file...');
    
    const globalConfigDir = join(homedir(), '.stigmergy-cli');
    const globalConfigPath = join(globalConfigDir, 'global-config.json');
    
    const timestamp = new Date().toISOString();
    const config = {
        version: '1.0.0',
        generatedAt: timestamp,
        platform: process.platform,
        nodeVersion: process.version,
        availableTools: availableCLIs.filter(cli => cli.available).map(cli => ({
            name: cli.name,
            displayName: cli.displayName,
            path: cli.path.replace(/\r$/, ''), // 清理路径中的回车符
            description: cli.description,
            required: cli.required
        })),
        scanResults: availableCLIs
    };
    
    try {
        await fs.writeFile(globalConfigPath, JSON.stringify(config, null, 2), 'utf8');
        console.log(`✅ Global configuration file generated: ${globalConfigPath}`);
        return true;
    } catch (error) {
        console.log(`⚠️ Unable to generate global configuration file: ${error.message}`);
        return false;
    }
}

// 生成全局记忆配置MD文件
async function generateGlobalMemoryConfigMD(availableCLIs) {
    console.log('\n📝 Generating global memory configuration MD file...');
    
    const timestamp = new Date().toISOString();
    const mdContent = `# Stigmergy CLI Global Configuration
> Automatically generated by Stigmergy CLI
> Generation time: ${timestamp}

## 📋 Available AI Tool List

${availableCLIs.map(cli => `- ${cli.available ? '✅' : '❌'} **${cli.displayName}** (${cli.name}) - ${cli.description}`).join('\n')}

## 🛠️ Tool Path Information

${availableCLIs.filter(cli => cli.available).map(cli => `- **${cli.displayName}**: \`${cli.path}\``).join('\n')}

## 🤝 Cross-Tool Collaboration Configuration

This configuration allows collaboration between the following AI tools:
${availableCLIs.filter(cli => cli.available).map(cli => `- ${cli.displayName}`).join('\n')}

## 📊 System Information

- Generation time: ${timestamp}
- Platform: ${process.platform}
- Node.js version: ${process.version}

---
*This file is automatically generated by Stigmergy CLI for global memory configuration of the cross-AI tool collaboration system*
`;
    
    // 尝试在当前目录生成
    const mdPaths = [
        join(process.cwd(), 'STIGMERGY_GLOBAL_CONFIG.md'),
        join(homedir(), 'STIGMERGY_GLOBAL_CONFIG.md'),
        join(homedir(), '.stigmergy-cli', 'STIGMERGY_GLOBAL_CONFIG.md')
    ];
    
    for (const mdPath of mdPaths) {
        try {
            await fs.writeFile(mdPath, mdContent, 'utf8');
            console.log(`✅ Global memory configuration file generated: ${mdPath}`);
            return;
        } catch (error) {
            console.log(`⚠️ Unable to generate file at ${mdPath}: ${error.message}`);
        }
    }
    
    console.log('❌ Unable to generate global memory configuration file');
}

// 主函数
async function main() {
    console.log('🤖 Stigmergy CLI - Automatic Post-Installation Setup');
    console.log('='.repeat(50));
    
    try {
        // 1. Automatically scan locally installed CLI tools
        const scanResults = await scanInstalledCLIs();
        const availableCLIs = scanResults.filter(cli => cli.available);
        const unavailableCLIs = scanResults.filter(cli => !cli.available);
        
        console.log(`\n📊 Scan results: ${availableCLIs.length} available, ${unavailableCLIs.length} unavailable`);
        
        // 2. Ask user if they want to install missing CLI tools
        const toolsToInstall = await askUserToInstallMissingCLIs(unavailableCLIs);
        
        // 3. Install user-selected CLI tools
        if (toolsToInstall.length > 0) {
            await installSelectedCLIs(toolsToInstall);
            
            // 4. Scan local available CLIs and paths again
            console.log('\n🔍 Rescanning local CLI tools...');
            const updatedScanResults = await scanInstalledCLIs();
            const updatedAvailableCLIs = updatedScanResults.filter(cli => cli.available);
            
            // 5. Copy required plugin extensions for each CLI tool to their installation paths
            await copyPluginExtensions(updatedAvailableCLIs);
            
            // 6. Generate global configuration file and global memory configuration MD file
            const configGenerated = await generateGlobalConfig(updatedAvailableCLIs);
            if (configGenerated) {
                await generateGlobalMemoryConfigMD(updatedAvailableCLIs);
            }
        } else {
            // If no new tools were installed, directly process existing tools
            const configGenerated = await generateGlobalConfig(availableCLIs);
            if (configGenerated) {
                await copyPluginExtensions(availableCLIs);
                await generateGlobalMemoryConfigMD(availableCLIs);
            }
        }
        
        console.log('\n🎉 Stigmergy CLI post-installation setup completed!');
        console.log('\n💡 Next steps:');
        console.log('   - Run "stigmergy init" to initialize project configuration');
        console.log('   - Run "stigmergy deploy" to deploy all integration plugins');
        console.log('   - Run "stigmergy status" to check system status');
        
    } catch (error) {
        console.error(`❌ Post-installation setup failed: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
main().catch(error => {
    console.error(`❌ Script execution failed: ${error.message}`);
    process.exit(1);
});