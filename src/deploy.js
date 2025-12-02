#!/usr/bin/env node

/**
 * Stigmergy CLI - 项目构建和发布部署脚本
 * =================================================================
 * 这是项目的主部署脚本，用于：
 * 1. 扫描系统中的CLI工具状态
 * 2. 询问用户是否安装未安装的CLI工具和集成
 * 3. 构建项目
 * 4. 发布到NPM
 * 5. 显示使用说明
 * 
 * 与 deployment/ 目录下的工具配置脚本不同：
 * - deployment/deploy.js: 用于配置用户系统中已安装的AI工具
 * - deployment/deploy-with-install.js: 增强版工具配置脚本，支持自动安装缺失的工具
 * 
 * 使用方法:
 *   npm run deploy
 * =================================================================
 */

import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { accessSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI工具配置
const CLI_TOOLS = [
    {
        name: 'claude',
        displayName: 'Claude CLI',
        description: 'Anthropic Claude CLI工具',
        required: true
    },
    {
        name: 'gemini',
        displayName: 'Gemini CLI',
        description: 'Google Gemini CLI工具',
        required: true
    },
    {
        name: 'qwen',
        displayName: 'QwenCode CLI',
        description: '阿里云QwenCode CLI工具',
        required: false
    },
    {
        name: 'iflow',
        displayName: 'iFlow CLI',
        description: 'iFlow工作流CLI工具',
        required: false
    },
    {
        name: 'qoder',
        displayName: 'Qoder CLI',
        description: 'Qoder代码生成CLI工具',
        required: false
    },
    {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI',
        description: 'CodeBuddy编程助手CLI工具',
        required: false
    },
    {
        name: 'copilot',
        displayName: 'GitHub Copilot CLI',
        description: 'GitHub Copilot CLI工具',
        required: false
    },
    {
        name: 'codex',
        displayName: 'Codex CLI',
        description: 'Codex代码分析CLI工具',
        required: false
    },
    {
        name: 'cline',
        displayName: 'Cline CLI',
        description: 'Cline自主编码代理CLI工具 (仅支持macOS/Linux)',
        required: false
    }
];

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 交互式询问
async function askQuestion(question, defaultValue = null) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        const questionText = defaultValue ?
            `${colors.cyan}${question} (${colors.yellow}${defaultValue}${colors.cyan}): ${colors.reset}` :
            `${colors.cyan}${question}: ${colors.reset}`;

        rl.question(questionText, (answer) => {
            rl.close();
            resolve(answer.trim() || defaultValue);
        });
    });
}

// 询问是否（Y/n）
async function askYesNo(question, defaultYes = true) {
    const suffix = defaultYes ? ' (Y/n): ' : ' (y/N): ';
    const answer = await askQuestion(question + suffix, defaultYes ? 'Y' : 'N');
    return answer.toLowerCase().startsWith('y') || answer.toLowerCase() === '';
}

// 执行命令
function executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            ...options
        });

        let stdout = '';
        let stderr = '';

        child.stdout?.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

// CLI工具安装配置（真实的安装命令）
const CLI_INSTALL_CONFIGS = {
    'claude': {
        name: 'Claude CLI',
        displayName: 'Claude CLI',
        description: 'Anthropic Claude CLI工具',
        required: true,
        installCommand: 'npm install -g @anthropic-ai/claude-code',
        website: 'https://claude.ai/cli',
        docs: 'https://docs.anthropic.com/claude-cli'
    },
    'gemini': {
        name: 'Gemini CLI',
        displayName: 'Gemini CLI',
        description: 'Google Gemini CLI工具',
        required: true,
        installCommand: 'npm install -g @google/gemini-cli',
        website: 'https://ai.google.dev/cli',
        docs: 'https://ai.google.dev/cli/docs'
    },
    'qwen': {
        name: 'QwenCode CLI',
        displayName: 'QwenCode CLI',
        description: '阿里云QwenCode CLI工具',
        required: false,
        installCommand: 'npm install -g @qwen-code/qwen-code@latest',
        website: 'https://qwen.aliyun.com',
        docs: 'https://help.aliyun.com/zh/developer-tools/qwen'
    },
    'qoder': {
        name: 'Qoder CLI',
        displayName: 'Qoder CLI',
        description: 'Qoder代码生成CLI工具',
        required: false,
        installCommand: 'npm install -g @qoder-ai/qodercli',
        website: 'https://qoder.ai',
        docs: 'https://qoder.ai/docs/cli'
    },
    'iflow': {
        name: 'iFlow CLI',
        displayName: 'iFlow CLI',
        description: 'iFlow工作流CLI工具',
        required: false,
        installCommand: 'npm install -g @iflow-ai/iflow-cli@latest',
        website: 'https://iflow.ai',
        docs: 'https://iflow.ai/docs/cli'
    },
    'codebuddy': {
        name: 'CodeBuddy CLI',
        displayName: 'CodeBuddy CLI',
        description: 'CodeBuddy编程助手CLI工具',
        required: false,
        installCommand: 'npm install -g @tencent-ai/codebuddy-code',
        website: 'https://codebuddy.ai',
        docs: 'https://codebuddy.ai/docs/cli'
    },
    'copilot': {
        name: 'GitHub Copilot CLI',
        displayName: 'GitHub Copilot CLI',
        description: 'GitHub Copilot CLI工具',
        required: false,
        installCommand: 'npm install -g @github/copilot',
        website: 'https://github.com/features/copilot',
        docs: 'https://docs.github.com/en/copilot/cli-overview'
    },
    'codex': {
        name: 'OpenAI Codex CLI',
        displayName: 'Codex CLI',
        description: 'OpenAI Codex代码分析CLI工具',
        required: false,
        installCommand: 'npm i -g @openai/codex --registry=https://registry.npmmirror.com',
        website: 'https://platform.openai.com',
        docs: 'https://platform.openai.com/docs/cli'
    },
    'cline': {
        name: 'Cline CLI',
        displayName: 'Cline CLI',
        description: 'Cline自主编码代理CLI工具 (仅支持macOS/Linux)',
        required: false,
        installCommand: 'npm install -g cline',
        website: 'https://cline.bot',
        docs: 'https://docs.cline.bot'
    }
};

// 检查CLI工具是否可用
async function checkCLIAvailability(cliName) {
    try {
        const installConfig = CLI_INSTALL_CONFIGS[cliName];
        if (!installConfig) {
            return false;
        }

        // 平台检查 - Cline CLI仅支持macOS和Linux
        if (cliName === 'cline') {
            const os = process.platform;
            if (os === 'win32') {
                console.log('⚠️  Cline CLI不支持Windows平台');
                return false;
            }
        }

        // 尝试常见的CLI命令名称
        const possibleCommands = [cliName, `${cliName}.cmd`, `${cliName}.py`, `${cliName}.sh`];

        for (const cmd of possibleCommands) {
            try {
                // 在Unix-like系统上使用which命令
                const whichCmd = process.platform === 'win32' ? 'where' : 'which';
                const result = await executeCommand(whichCmd, [cmd]);
                if (result.code === 0) {
                    return true;
                }
            } catch (error) {
                // 继续尝试下一个命令
            }
        }

        // GitHub Copilot 检查集成状态（不再需要特殊处理，使用通用检查）
        if (cliName === 'copilot') {
            try {
                const result = await executeCommand('gh', ['extensions', 'list']);
                if (result.stdout.includes('gh-copilot')) {
                    return true;
                }
            } catch (error) {
                // 继续尝试通用检查
            }
        }

        // 通用检查：尝试执行CLI命令
        try {
            const result = await executeCommand(cliName, ['--version', '--help'], {
                shell: true,
                timeout: 5000
            });
            return result.code === 0;
        } catch (error) {
            return false;
        }
    } catch (error) {
        return false;
    }
}

// 提供CLI工具安装指导
function showCLInstallationGuide(cliName) {
    const cliInfo = CLI_TOOLS_INFO[cliName];
    if (!cliInfo) {
        return;
    }

    console.log('');
    colorLog('yellow', `📖 ${cliInfo.officialName} 安装指南:`);
    console.log('');
    console.log(colors.cyan + `📚 官方文档: ${cliInfo.installDocs}`);
    console.log(colors.cyan + `🌐 官方网站: ${cliInfo.website}`);
    console.log('');

    console.log(colors.yellow + '🔧 推荐安装方法:');
    cliInfo.installMethods.forEach((method, index) => {
        console.log(colors.white + `   ${index + 1}. ${method}`);
    });

    console.log('');
    console.log(colors.blue + '💡 提示:');
    console.log(colors.white + '   - 请按照官方文档进行安装');
    console.log(colors.white + '   - 安装完成后，重新运行部署脚本');
    console.log(colors.white + '   - 如果遇到问题，请查看官方文档获取帮助');
}

// 询问用户是否已安装CLI工具
async function askUserToInstallCLIMannualy(unavailableCLIs) {
    if (unavailableCLIs.length === 0) {
        return;
    }

    console.log('');
    colorLog('yellow', '🔴 检测到以下CLI工具未安装:');

    for (const cliInfo of unavailableCLIs) {
        const required = cliInfo.required ? '(必需)' : '(可选)';
        console.log(colors.red + `   ❌ ${cliInfo.displayName} ${required}`);
    }

    console.log('');
    const shouldContinue = await askYesNo(
        '是否要查看这些CLI工具的安装指南？',
        true
    );

    if (shouldContinue) {
        for (const cliInfo of unavailableCLIs) {
            showCLInstallationGuide(cliInfo.name);
            console.log('');

            const pauseForUser = await askYesNo(
                `已查看 ${cliInfo.displayName} 安装指南，是否继续下一个？`,
                true
            );
        }
    }
}

// 检查CLI集成是否已安装
async function checkCLIIntegration(cliName) {
    try {
        const installScript = join(__dirname, 'adapters', cliName, `install_${cliName}_integration.py`);

        // 检查安装脚本是否存在
        try {
            await accessSync(installScript);
        } catch (error) {
            return { installed: false, reason: 'Install script not found' };
        }

        // 执行验证
        const result = await executeCommand('python', [installScript, '--verify'], {
            cwd: __dirname
        });

        return {
            installed: result.code === 0,
            reason: result.code === 0 ? 'Verified' : result.stderr
        };
    } catch (error) {
        return { installed: false, reason: error.message };
    }
}

// 安装单个CLI工具集成
async function installCLIIntegration(cliName, cliInfo) {
    colorLog('cyan', `🔧 正在安装 ${cliInfo.displayName} 集成...`);

    try {
        const installScript = join(__dirname, 'adapters', cliName, `install_${cliName}_integration.py`);

        // 检查安装脚本是否存在
        try {
            await accessSync(installScript);
        } catch (error) {
            colorLog('yellow', `⚠️  ${cliInfo.displayName} 安装脚本不存在，跳过`);
            return { success: false, reason: 'Install script not found' };
        }

        // 执行安装
        const installScriptJs = join(__dirname, 'adapters', cliInfo.name, `install_${cliInfo.name}_integration.js`);
        let installCommand = 'python';
        let installArgs = [installScript, '--install'];
        
        // 检查Node.js版本的安装脚本是否存在
        try {
            await accessSync(installScriptJs);
            installCommand = 'node';
            installArgs = [installScriptJs, '--install'];
        } catch (error) {
            // 如果Node.js版本不存在，使用Python版本
            try {
                await accessSync(installScript);
            } catch (error) {
                colorLog('yellow', `⚠️  ${cliInfo.displayName} 安装脚本不存在，跳过`);
                return { success: false, reason: 'Install script not found' };
            }
        }

        // 执行安装
        const result = await executeCommand(installCommand, installArgs, {
            cwd: __dirname
        });

        if (result.code === 0) {
            colorLog('green', `✅ ${cliInfo.displayName} 集成安装成功`);
            return { success: true };
        } else {
            colorLog('red', `❌ ${cliInfo.displayName} 集成安装失败`);
            if (result.stderr) {
                console.log(colors.red + result.stderr + colors.reset);
            }
            return { success: false, reason: result.stderr };
        }

    } catch (error) {
        colorLog('red', `❌ ${cliInfo.displayName} 安装过程出错: ${error.message}`);
        return { success: false, reason: error.message };
    }
}

// 扫描系统状态
async function scanSystemStatus() {
    colorLog('magenta', '🔍 扫描系统CLI工具状态...');
    console.log('');

    const results = [];

    for (const cliInfo of CLI_TOOLS) {
        const isAvailable = await checkCLIAvailability(cliInfo.name);
        const integrationStatus = await checkCLIIntegration(cliInfo.name);

        results.push({
            ...cliInfo,
            available: isAvailable,
            integration: integrationStatus
        });

        const statusIcon = isAvailable ? '🟢' : '🔴';
        const integrationIcon = integrationStatus.installed ? '✅' : '❌';

        console.log(`  ${statusIcon} ${integrationIcon} ${cliInfo.displayName.padEnd(20)} | CLI: ${isAvailable ? '可用' : '未安装'} | 集成: ${integrationStatus.installed ? '已安装' : '未安装'}`);
    }

    return results;
}

// 智能询问用户是否安装未安装的CLI工具和集成
async function askUserToInstall(results) {
    const unavailableCLIs = results.filter(cli => !cli.available);
    const uninstalledIntegrations = results.filter(cli => !cli.integration.installed);

    if (unavailableCLIs.length === 0 && uninstalledIntegrations.length === 0) {
        colorLog('green', '\n🎉 所有CLI工具和集成都已安装！');
        return { installCLIs: [], installIntegrations: [] };
    }

    console.log('');
    colorLog('yellow', '📋 检测到以下未安装的工具:');

    let needInstallCLIs = [];
    let needInstallIntegrations = [];

    // 显示未安装的CLI工具
    if (unavailableCLIs.length > 0) {
        console.log('\n🔴 未安装的CLI工具:');
        unavailableCLIs.forEach(cli => {
            const required = cli.required ? '(必需)' : '(可选)';
            console.log(`  - ${cli.displayName} ${required} - ${cli.description}`);
        });

        console.log('');
        const shouldInstallCLIs = await askYesNo(
            `是否要尝试自动安装 ${unavailableCLIs.length} 个CLI工具？`,
            true
        );

        if (shouldInstallCLIs) {
            needInstallCLIs = unavailableCLIs;
        }
    }

    // 显示未安装的集成
    if (uninstalledIntegrations.length > 0) {
        console.log('\n❌ 未安装的CLI集成:');
        uninstalledIntegrations.forEach(cli => {
            const required = cli.required ? '(必需)' : '(可选)';
            console.log(`  - ${cli.displayName} 集成 ${required}`);
        });

        console.log('');
        const shouldInstallIntegrations = await askYesNo(
            `是否要自动安装 ${uninstalledIntegrations.length} 个CLI集成？`,
            true
        );

        if (shouldInstallIntegrations) {
            needInstallIntegrations = uninstalledIntegrations;
        }
    }

    return {
        installCLIs: needInstallCLIs,
        installIntegrations: needInstallIntegrations
    };
}

// 安装单个CLI工具
async function installCLITool(cliName, cliInfo) {
    colorLog('cyan', `🔧 正在安装 ${cliInfo.displayName}...`);

    try {
        const installConfig = CLI_INSTALL_CONFIGS[cliName];
        if (!installConfig) {
            colorLog('yellow', `⚠️  ${cliInfo.displayName} 安装配置不存在，跳过`);
            return { success: false, reason: 'Install config not found' };
        }

        // 执行安装命令
        const result = await executeCommand(installConfig.installCommand, [], {
            shell: true
        });

        if (result.code === 0) {
            colorLog('green', `✅ ${cliInfo.displayName} 安装成功`);
            return { success: true };
        } else {
            colorLog('red', `❌ ${cliInfo.displayName} 安装失败`);
            if (result.stderr) {
                console.log(colors.red + result.stderr + colors.reset);
            }
            return { success: false, reason: result.stderr };
        }

    } catch (error) {
        colorLog('red', `❌ ${cliInfo.displayName} 安装过程出错: ${error.message}`);
        return { success: false, reason: error.message };
    }
}

// 批量安装CLI工具
async function installSelectedCLIs(selectedCLIs) {
    if (selectedCLIs.length === 0) {
        return { successCount: 0, totalCount: 0 };
    }

    colorLog('blue', `🚀 开始自动安装 ${selectedCLIs.length} 个CLI工具...`);
    console.log('');

    let successCount = 0;
    let totalCount = selectedCLIs.length;

    for (const cliInfo of selectedCLIs) {
        const result = await installCLITool(cliInfo.name, cliInfo);

        if (result.success) {
            successCount++;
        }
    }

    console.log('');
    colorLog('green', `✅ CLI工具安装完成: ${successCount}/${totalCount} 个成功`);

    return { successCount, totalCount };
}

// 批量安装CLI集成
async function installSelectedIntegrations(selectedIntegrations) {
    if (selectedIntegrations.length === 0) {
        return { successCount: 0, totalCount: 0 };
    }

    colorLog('blue', `🚀 开始自动安装 ${selectedIntegrations.length} 个CLI集成...`);
    console.log('');

    let successCount = 0;
    let totalCount = selectedIntegrations.length;

    for (const cliInfo of selectedIntegrations) {
        const result = await installCLIIntegration(cliInfo.name, cliInfo);

        if (result.success) {
            successCount++;
        }
    }

    console.log('');
    colorLog('green', `✅ 集成安装完成: ${successCount}/${totalCount} 个成功`);

    return { successCount, totalCount };
}

// 构建项目
async function buildProject() {
    colorLog('blue', '\n📦 构建项目...');

    try {
        const result = await executeCommand('npm', ['run', 'build'], {
            cwd: __dirname
        });

        if (result.code === 0) {
            colorLog('green', '✅ 项目构建成功');
            return true;
        } else {
            colorLog('red', `❌ 项目构建失败: ${result.stderr}`);
            return false;
        }
    } catch (error) {
        colorLog('red', `❌ 构建过程出错: ${error.message}`);
        return false;
    }
}

// 发布到NPM
async function publishToNPM() {
    colorLog('blue', '\n🚀 发布到 NPM...');

    try {
        const result = await executeCommand('npm', ['publish', '--access', 'public'], {
            cwd: __dirname
        });

        if (result.code === 0) {
            colorLog('green', '✅ NPM 发布成功');
            return true;
        } else {
            colorLog('red', `❌ NPM 发布失败: ${result.stderr}`);
            return false;
        }
    } catch (error) {
        colorLog('red', `❌ 发布过程出错: ${error.message}`);
        return false;
    }
}

// 显示部署后使用说明
function showUsageInstructions() {
    console.log('');
    colorLog('magenta', '🎉 Stigmergy CLI 部署成功！');
    console.log('');
    colorLog('cyan', '📦 现在任何人都可以使用以下命令:');
    console.log('');
    console.log(colors.yellow + '  # 基本命令');
    console.log(colors.cyan + '  npx stigmergy-cli init      # 初始化项目');
    console.log(colors.cyan + '  npx stigmergy-cli status     # 查看状态');
    console.log(colors.cyan + '  npx stigmergy-cli scan      # 扫描环境');
    console.log('');
    console.log(colors.yellow + '  # 部署命令');
    console.log(colors.cyan + '  npx stigmergy-cli deploy    # 智能部署');
    console.log(colors.cyan + '  npm run deploy-all           # 全量部署');
    console.log('');
    console.log(colors.yellow + '  # 协作示例');
    console.log(colors.cyan + '  # 在任何支持的CLI中直接调用其他工具');
    console.log(colors.cyan + '  "请用gemini帮我翻译这段代码"');
    console.log(colors.cyan + '  "调用qwen分析这个需求"');
    console.log(colors.cyan + '  "用iflow创建工作流"');
    console.log('');
    colorLog('cyan', '🎯 真正的跨CLI协作，让每个AI工具都能发挥最大价值！');
    console.log('');
    colorLog('cyan', '📚 更多信息: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
}

// 主部署函数
async function deploy(options = {}) {
    const {
        buildOnly = false,
        publishOnly = false,
        scanOnly = false
    } = options;

    colorLog('magenta', '🚀 Stigmergy CLI - 智能部署系统');
    colorLog('cyan', '=====================================');
    console.log('');

    try {
        // 1. 扫描系统状态
        const results = await scanSystemStatus();

        if (scanOnly) {
            return;
        }

        // 2. 询问用户是否要安装未安装的CLI工具和集成
        const { installCLIs, installIntegrations } = await askUserToInstall(results);

        // 3. 先安装CLI工具
        if (installCLIs.length > 0) {
            await installSelectedCLIs(installCLIs);
        }

        // 4. 再安装CLI集成
        if (installIntegrations.length > 0) {
            await installSelectedIntegrations(installIntegrations);
        }

        // 5. 构建项目
        if (buildOnly || publishOnly || !buildOnly && !publishOnly) {
            const buildSuccess = await buildProject();
            if (!buildSuccess && publishOnly) {
                throw new Error('构建失败，无法发布');
            }
        }

        // 6. 发布到NPM
        if (publishOnly || !buildOnly && !publishOnly) {
            const publishSuccess = await publishToNPM();
            if (publishSuccess) {
                showUsageInstructions();
            }
        } else {
            console.log('');
            colorLog('green', '✅ 部署完成！');
            colorLog('cyan', '使用以下命令测试:');
            console.log(colors.cyan + '  node src/main.js status');
            console.log(colors.cyan + '  npx stigmergy-cli status (发布后)');
        }

    } catch (error) {
        colorLog('red', `❌ 部署失败: ${error.message}`);
        process.exit(1);
    }
}

// 运行部署
if (import.meta.url === `file://${process.argv[1]}`) {
    deploy().catch(error => {
        console.error('部署失败:', error.message);
        process.exit(1);
    });
}