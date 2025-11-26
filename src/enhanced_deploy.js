#!/usr/bin/env node

/**
 * Smart CLI Router - Node.js版本部署脚本
 * 支持NPM发布和一键部署所有CLI工具集成
 */

import { spawn } from 'child_process';
import { readFile, writeFile, existsSync } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI工具列表
const CLI_TOOLS = [
    'claude',
    'gemini',
    'qwencode',
    'iflow',
    'qoder',
    'codebuddy',
    'copilot',
    'codex'
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

// 执行命令
function executeCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
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

// 检查CLI工具是否可用
async function checkCLIAvailability(cliName) {
    try {
        const result = await executeCommand(cliName, ['--version']);
        return result.code === 0;
    } catch (error) {
        return false;
    }
}

// 安装单个CLI工具集成
async function installCLIIntegration(cliName) {
    colorLog('cyan', `\n🔧 安装 ${cliName} CLI 集成...`);

    const installScript = join(__dirname, 'adapters', cliName, `install_${cliName}_integration.py`);

    try {
        // 检查安装脚本是否存在
        const stats = await readFile(installScript).catch(() => null);
        if (!stats) {
            colorLog('yellow', `⚠️  ${cliName} 安装脚本不存在，跳过`);
            return { success: false, reason: 'Install script not found' };
        }

        // 执行安装
        colorLog('blue', `📦 执行 ${cliName} 安装脚本...`);
        const result = await executeCommand('python', [installScript, '--install'], {
            cwd: __dirname
        });

        if (result.code === 0) {
            colorLog('green', `✅ ${cliName} CLI 集成安装成功`);
            return { success: true };
        } else {
            colorLog('red', `❌ ${cliName} CLI 集成安装失败`);
            if (result.stderr) {
                console.log(result.stderr);
            }
            return { success: false, reason: result.stderr };
        }

    } catch (error) {
        colorLog('red', `❌ ${cliName} 安装过程出错: ${error.message}`);
        return { success: false, reason: error.message };
    }
}

// 验证CLI集成
async function verifyCLIIntegration(cliName) {
    colorLog('cyan', `🔍 验证 ${cliName} CLI 集成...`);

    const installScript = join(__dirname, 'adapters', cliName, `install_${cliName}_integration.py`);

    try {
        const result = await executeCommand('python', [installScript, '--verify'], {
            cwd: __dirname
        });

        return result.code === 0;
    } catch (error) {
        return false;
    }
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

// 显示系统状态
async function showSystemStatus() {
    colorLog('cyan', '\n📊 系统状态:');

    const results = [];
    for (const cliName of CLI_TOOLS) {
        const isInstalled = await verifyCLIIntegration(cliName);
        const isAvailable = await checkCLIAvailability(cliName);

        results.push({
            name: cliName,
            installed: isInstalled,
            available: isAvailable
        });

        const statusIcon = isInstalled ? '✅' : '❌';
        const availableIcon = isAvailable ? '🟢' : '🔴';
        console.log(`   ${statusIcon} ${cliName} 集成 | ${availableIcon} CLI可用`);
    }

    return results;
}

// 主部署函数
async function deploy(options = {}) {
    const { all = false, build = false, publish = false, status = false } = options;

    colorLog('magenta', '🚀 Smart CLI Router - Node.js部署');
    colorLog('cyan', '=====================================');

    try {
        // 显示状态
        if (status || all) {
            await showSystemStatus();
        }

        // 构建项目
        if (build || all) {
            const buildSuccess = await buildProject();
            if (!buildSuccess && publish) {
                throw new Error('构建失败，无法发布');
            }
        }

        // 安装所有CLI集成
        if (all) {
            colorLog('cyan', '\n🔧 安装所有CLI工具集成...');

            let successCount = 0;
            let totalCount = 0;

            for (const cliName of CLI_TOOLS) {
                totalCount++;
                const result = await installCLIIntegration(cliName);
                if (result.success) {
                    successCount++;
                }
            }

            colorLog('green', `\n✅ 安装完成: ${successCount}/${totalCount} 个CLI工具集成成功`);
        }

        // 发布到NPM
        if (publish || all) {
            const publishSuccess = await publishToNPM();
            if (publishSuccess) {
                colorLog('green', '\n🎉 Smart CLI Router 部署成功！');
                colorLog('cyan', '\n📦 现在任何人都可以使用:');
                colorLog('yellow', '   npx smart-cli-router init');
                colorLog('yellow', '   npx smart-cli-router status');
                colorLog('yellow', '   npx smart-cli-router deploy --all');
                colorLog('cyan', '\n🎯 真正的跨CLI协作，让每个AI工具都能发挥最大价值！');
            }
        }

    } catch (error) {
        colorLog('red', `❌ 部署失败: ${error.message}`);
        process.exit(1);
    }
}

// 命令行参数处理
const args = process.argv.slice(2);
const options = {};

if (args.includes('--all')) {
    options.all = true;
}
if (args.includes('--build')) {
    options.build = true;
}
if (args.includes('--publish')) {
    options.publish = true;
}
if (args.includes('--status')) {
    options.status = true;
}

// 如果没有参数，显示帮助
if (args.length === 0) {
    colorLog('cyan', 'Smart CLI Router - Node.js部署工具');
    colorLog('yellow', '\n用法:');
    colorLog('white', '  node deploy.js <选项>');
    colorLog('yellow', '\n选项:');
    colorLog('white', '  --status     显示系统状态');
    colorLog('white', '  --build      构建项目');
    colorLog('white', '  --publish    发布到NPM');
    colorLog('white', '  --all        执行完整部署（构建+安装所有CLI+发布）');
    colorLog('yellow', '\n示例:');
    colorLog('white', '  node deploy.js --status      # 查看系统状态');
    colorLog('white', '  node deploy.js --build       # 仅构建项目');
    colorLog('white', '  node deploy.js --all         # 完整部署');
    process.exit(0);
}

// 运行部署
if (import.meta.url === `file://${process.argv[1]}`) {
    deploy(options).catch(error => {
        colorLog('red', `部署失败: ${error.message}`);
        process.exit(1);
    });
}

export { deploy, showSystemStatus, installCLIIntegration };