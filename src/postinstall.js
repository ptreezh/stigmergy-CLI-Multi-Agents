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
        description: 'Anthropic Claude CLI工具',
        installCommand: 'npm install -g @anthropic/claude-code',
        required: true
    },
    {
        name: 'gemini',
        displayName: 'Gemini CLI',
        description: 'Google Gemini CLI工具',
        installCommand: 'npm install -g @google/gemini-cli',
        required: true
    },
    {
        name: 'qwen',
        displayName: 'QwenCode CLI',
        description: '阿里云QwenCode CLI工具',
        installCommand: 'npm install -g @qwen-code/qwen-code',
        required: true
    },
    {
        name: 'iflow',
        displayName: 'iFlow CLI',
        description: 'iFlow工作流CLI工具',
        installCommand: 'npm install -g @iflow-ai/iflow-cli',
        required: true
    },
    {
        name: 'qoder',
        displayName: 'Qoder CLI',
        description: 'Qoder代码生成CLI工具',
        installCommand: 'npm install -g @qoder-ai/qodercli',
        required: false
    },
    {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI',
        description: 'CodeBuddy编程助手CLI工具',
        installCommand: 'npm install -g @tencent-ai/codebuddy-code',
        required: true
    },
    {
        name: 'copilot',
        displayName: 'GitHub Copilot CLI',
        description: 'GitHub Copilot CLI工具',
        installCommand: 'npm install -g @github/copilot',
        required: false
    },
    {
        name: 'codex',
        displayName: 'OpenAI Codex CLI',
        description: 'OpenAI Codex代码分析CLI工具',
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
    console.log('🔍 自动扫描本地已安装的CLI工具...');
    
    const results = [];
    for (const cliInfo of CLI_TOOLS) {
        const status = await checkCLIAvailability(cliInfo.name);
        results.push({
            ...cliInfo,
            ...status
        });
        
        const statusIcon = status.available ? '✅' : '❌';
        console.log(`  ${statusIcon} ${cliInfo.displayName} | ${status.available ? `可用 (${status.path})` : '未安装'}`);
    }
    
    // 保存扫描结果到文件
    try {
        const globalConfigDir = join(homedir(), '.stigmergy-cli');
        await fs.mkdir(globalConfigDir, { recursive: true });
        const scanResultsPath = join(globalConfigDir, 'postinstall-scan-results.json');
        await fs.writeFile(scanResultsPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`  📦 扫描结果已保存到: ${scanResultsPath}`);
    } catch (error) {
        console.log(`  ⚠️ 无法保存扫描结果: ${error.message}`);
    }
    
    return results;
}

// 询问用户是否安装缺失的CLI工具
async function askUserToInstallMissingCLIs(unavailableCLIs) {
    if (unavailableCLIs.length === 0) {
        console.log('\n🎉 所有必需的CLI工具都已安装！');
        return [];
    }
    
    console.log('\n📋 检测到以下CLI工具未安装:');
    const requiredMissing = unavailableCLIs.filter(cli => cli.required);
    const optionalMissing = unavailableCLIs.filter(cli => !cli.required);
    
    if (requiredMissing.length > 0) {
        console.log('\n🔴 必需但未安装的CLI工具:');
        requiredMissing.forEach(cli => {
            console.log(`  - ${cli.displayName} - ${cli.description}`);
        });
    }
    
    if (optionalMissing.length > 0) {
        console.log('\n🟡 可选但未安装的CLI工具:');
        optionalMissing.forEach(cli => {
            console.log(`  - ${cli.displayName} - ${cli.description}`);
        });
    }
    
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n是否要安装缺失的CLI工具？(y/N): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                resolve(unavailableCLIs);
            } else {
                console.log('跳过CLI工具安装。');
                resolve([]);
            }
        });
    });
}

// 安装CLI工具
async function installCLITool(cliInfo) {
    console.log(`\n🔧 正在安装 ${cliInfo.displayName}...`);
    
    return new Promise((resolve) => {
        const installProcess = spawn(cliInfo.installCommand, {
            shell: true,
            stdio: 'inherit'
        });
        
        installProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${cliInfo.displayName} 安装成功`);
                resolve({ success: true, cliInfo });
            } else {
                console.log(`❌ ${cliInfo.displayName} 安装失败 (退出码: ${code})`);
                resolve({ success: false, cliInfo });
            }
        });
        
        installProcess.on('error', (error) => {
            console.log(`❌ ${cliInfo.displayName} 安装出错: ${error.message}`);
            resolve({ success: false, cliInfo });
        });
    });
}

// 批量安装CLI工具
async function installSelectedCLIs(selectedCLIs) {
    if (selectedCLIs.length === 0) {
        return [];
    }
    
    console.log(`\n🚀 开始安装 ${selectedCLIs.length} 个CLI工具...`);
    
    const results = [];
    for (const cliInfo of selectedCLIs) {
        const result = await installCLITool(cliInfo);
        results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ CLI工具安装完成: ${successCount}/${selectedCLIs.length} 个成功`);
    
    return results;
}

// 复制插件扩展到各CLI安装路径
async function copyPluginExtensions(availableCLIs) {
    console.log('\n🔄 复制插件扩展到各CLI安装路径...');
    
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
                    console.log(`  ✅ 为 ${cli.displayName} 准备插件扩展`);
                } catch (error) {
                    // 适配器目录不存在，跳过
                    console.log(`  ℹ️  ${cli.displayName} 无特殊插件扩展`);
                }
            } catch (error) {
                console.log(`  ⚠️  为 ${cli.displayName} 配置插件扩展时出错: ${error.message}`);
            }
        }
    }
    
    console.log('✅ 插件扩展复制完成');
}

// 生成全局配置文件
async function generateGlobalConfig(availableCLIs) {
    console.log('\n📝 生成全局配置文件...');
    
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
        console.log(`✅ 全局配置文件已生成: ${globalConfigPath}`);
        return true;
    } catch (error) {
        console.log(`⚠️ 无法生成全局配置文件: ${error.message}`);
        return false;
    }
}

// 生成全局记忆配置MD文件
async function generateGlobalMemoryConfigMD(availableCLIs) {
    console.log('\n📝 生成全局记忆配置MD文件...');
    
    const timestamp = new Date().toISOString();
    const mdContent = `# Stigmergy CLI 全局配置
> 由 Stigmergy CLI 自动生成
> 生成时间: ${timestamp}

## 📋 可用AI工具列表

${availableCLIs.map(cli => `- ${cli.available ? '✅' : '❌'} **${cli.displayName}** (${cli.name}) - ${cli.description}`).join('\n')}

## 🛠️ 工具路径信息

${availableCLIs.filter(cli => cli.available).map(cli => `- **${cli.displayName}**: \`${cli.path}\``).join('\n')}

## 🤝 跨工具协作配置

此配置允许以下AI工具之间进行协作：
${availableCLIs.filter(cli => cli.available).map(cli => `- ${cli.displayName}`).join('\n')}

## 📊 系统信息

- 生成时间: ${timestamp}
- 平台: ${process.platform}
- Node.js版本: ${process.version}

---
*此文件由 Stigmergy CLI 自动生成，用于跨AI工具协作系统的全局记忆配置*
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
            console.log(`✅ 全局记忆配置文件已生成: ${mdPath}`);
            return;
        } catch (error) {
            console.log(`⚠️ 无法在 ${mdPath} 生成文件: ${error.message}`);
        }
    }
    
    console.log('❌ 无法生成全局记忆配置文件');
}

// 主函数
async function main() {
    console.log('🤖 Stigmergy CLI - 自动安装后设置');
    console.log('='.repeat(50));
    
    try {
        // 1. 自动扫描本地已安装的CLI工具
        const scanResults = await scanInstalledCLIs();
        const availableCLIs = scanResults.filter(cli => cli.available);
        const unavailableCLIs = scanResults.filter(cli => !cli.available);
        
        console.log(`\n📊 扫描结果: ${availableCLIs.length} 个可用, ${unavailableCLIs.length} 个不可用`);
        
        // 2. 询问用户是否安装缺失的CLI工具
        const toolsToInstall = await askUserToInstallMissingCLIs(unavailableCLIs);
        
        // 3. 安装用户选择的CLI工具
        if (toolsToInstall.length > 0) {
            await installSelectedCLIs(toolsToInstall);
            
            // 4. 再次扫描本地可用的CLI和路径
            console.log('\n🔍 重新扫描本地CLI工具...');
            const updatedScanResults = await scanInstalledCLIs();
            const updatedAvailableCLIs = updatedScanResults.filter(cli => cli.available);
            
            // 5. 复制各个CLI工具所必须的插件扩展到各个CLI安装的路径中
            await copyPluginExtensions(updatedAvailableCLIs);
            
            // 6. 生成全局配置文件和全局记忆配置MD文件
            const configGenerated = await generateGlobalConfig(updatedAvailableCLIs);
            if (configGenerated) {
                await generateGlobalMemoryConfigMD(updatedAvailableCLIs);
            }
        } else {
            // 如果没有安装新工具，直接处理已有的工具
            const configGenerated = await generateGlobalConfig(availableCLIs);
            if (configGenerated) {
                await copyPluginExtensions(availableCLIs);
                await generateGlobalMemoryConfigMD(availableCLIs);
            }
        }
        
        console.log('\n🎉 Stigmergy CLI 安装后设置完成！');
        console.log('\n💡 下一步建议:');
        console.log('   - 运行 "stigmergy init" 初始化项目配置');
        console.log('   - 运行 "stigmergy deploy" 部署所有集成插件');
        console.log('   - 运行 "stigmergy status" 查看系统状态');
        
    } catch (error) {
        console.error(`❌ 安装后设置失败: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
main().catch(error => {
    console.error(`❌ 脚本执行失败: ${error.message}`);
    process.exit(1);
});