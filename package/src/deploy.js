#!/usr/bin/env node

/**
 * Stigmergy CLI - Project Build and Publish Deployment Script
 * =================================================================
 * This is the main deployment script for the project, used for:
 * 1. Scanning CLI tools status in the system
 * 2. Asking user if to install uninstalled CLI tools and integrations
 * 3. Building the project
 * 4. Publishing to NPM
 * 5. Displaying usage instructions
 *
 * Different from deployment/ directory configuration scripts:
 * - deployment/deploy.js: Used to configure AI tools already installed in user system
 * - deployment/deploy-with-install.js: Enhanced tool configuration script, supports auto-installation of missing tools
 *
 * Usage:
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

// CLI tools configuration
const CLI_TOOLS = [
    {
        name: 'claude',
        displayName: 'Claude CLI',
        description: 'Anthropic Claude CLI tool',
        required: true
    },
    {
        name: 'gemini',
        displayName: 'Gemini CLI',
        description: 'Google Gemini CLI tool',
        required: true
    },
    {
        name: 'qwen',
        displayName: 'QwenCode CLI',
        description: 'Alibaba Cloud QwenCode CLI tool',
        required: false
    },
    {
        name: 'iflow',
        displayName: 'iFlow CLI',
        description: 'iFlow CLI tool',
        required: false
    },
    {
        name: 'qodercli',
        displayName: 'Qoder CLI',
        description: 'Qoder CLI tool',
        required: false
    },
    {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI',
        description: 'CodeBuddy CLI tool',
        required: false
    },
    {
        name: 'copilot',
        displayName: 'GitHub Copilot CLI',
        description: 'GitHub Copilot CLI tool',
        required: false
    },
    {
        name: 'ollama',
        displayName: 'Ollama CLI',
        description: 'Ollama Local Model CLI tool',
        required: false
    }
];

// CLI integrations configuration
const CLI_INTEGRATIONS = [
    {
        name: 'claude',
        displayName: 'Claude CLI Integration',
        description: 'Claude CLI cross-CLI collaboration integration',
        installScript: 'install_claude_integration.py'
    },
    {
        name: 'gemini',
        displayName: 'Gemini CLI Integration',
        description: 'Gemini CLI cross-CLI collaboration integration',
        installScript: 'install_gemini_integration.py'
    },
    {
        name: 'qwen',
        displayName: 'QwenCode CLI Integration',
        description: 'QwenCode CLI cross-CLI collaboration integration',
        installScript: 'install_qwencode_integration.py'
    },
    {
        name: 'iflow',
        displayName: 'iFlow CLI Integration',
        description: 'iFlow CLI cross-CLI collaboration integration',
        installScript: 'install_iflow_integration.py'
    },
    {
        name: 'codebuddy',
        displayName: 'CodeBuddy CLI Integration',
        description: 'CodeBuddy CLI cross-CLI collaboration integration',
        installScript: 'install_codebuddy_integration.py'
    },
    {
        name: 'codex',
        displayName: 'Codex CLI Integration',
        description: 'Codex CLI cross-CLI collaboration integration',
        installScript: 'install_codex_integration.py'
    }
];

// Console colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    },
    
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m'
    }
};

// Colorized logging function
function colorLog(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

// Check if a CLI tool is available
async function isCliAvailable(cliName) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32' ? 'where' : 'which';
        const child = spawn(command, [cliName], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        child.on('close', (code) => {
            resolve(code === 0);
        });

        child.on('error', () => {
            resolve(false);
        });
    });
}

// Check if npm package is installed
async function isNpmPackageInstalled(pkgName) {
    try {
        const { spawnSync } = require('child_process');
        const result = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
        return result.stdout && result.stdout.includes(pkgName);
    } catch (error) {
        return false;
    }
}

// Get CLI tool installation status
async function getCliStatus() {
    const status = {};
    for (const cli of CLI_TOOLS) {
        const isAvailable = await isCliAvailable(cli.name) || await isNpmPackageInstalled(cli.name);
        status[cli.name] = {
            available: isAvailable,
            required: cli.required,
            description: cli.description
        };
    }
    return status;
}

// Get CLI integration installation status
function getIntegrationStatus() {
    const path = require('path');
    const fs = require('fs');
    const status = {};
    
    for (const integration of CLI_INTEGRATIONS) {
        const installScriptPath = path.join(__dirname, 'adapters', integration.name, integration.installScript);
        const installed = fs.existsSync(installScriptPath);
        status[integration.name] = {
            installed: installed,
            description: integration.description
        };
    }
    
    return status;
}

// Install a CLI tool
async function installCli(cliInfo) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
        // Different tools may have different installation methods
        const npmPackage = getNpmPackageName(cliInfo.name);
        
        colorLog(colors.cyan, `[INSTALL] Installing ${cliInfo.displayName}...`);
        
        const installProcess = spawn('npm', ['install', '-g', npmPackage], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';
        installProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        installProcess.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            if (errorOutput.includes('WARN')) return; // Filter warnings
            output += errorOutput;
        });

        installProcess.on('close', (code) => {
            if (code === 0) {
                colorLog(colors.green, `[OK] ${cliInfo.displayName} installation successful`);
                resolve(true);
            } else {
                colorLog(colors.red, `[ERROR] ${cliInfo.displayName} installation failed`);
                resolve(false);
            }
        });
    });
}

// Get npm package name for CLI tool
function getNpmPackageName(cliName) {
    const packages = {
        'claude': '@anthropic-ai/claude-code',
        'gemini': '@google/gemini-cli',
        'qwen': '@qwen-code/qwen-code',
        'iflow': '@iflow-ai/iflow-cli',
        'qodercli': 'qodercli',
        'codebuddy': '@tencent-ai/codebuddy-code',
        'copilot': '@github/copilot',
        'ollama': 'ollama'
    };
    return packages[cliName] || cliName;
}

// Install CLI integration
async function installIntegration(integrationInfo) {
    const path = require('path');
    const fs = require('fs');
    
    const installScriptPath = path.join(__dirname, 'adapters', integrationInfo.name, integration.installScript);
    
    if (!fs.existsSync(installScriptPath)) {
        colorLog(colors.yellow, `[WARN] ${integrationInfo.displayName} installation script does not exist, skipping`);
        return false;
    }

    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
        colorLog(colors.cyan, `[INSTALL] Installing ${integrationInfo.displayName}...`);
        
        const installProcess = spawn('python', [installScriptPath, '--install'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        installProcess.stdout.on('data', (data) => {
            console.log(data.toString().trim());
        });

        installProcess.stderr.on('data', (data) => {
            const errorOutput = data.toString().trim();
            if (errorOutput.includes('WARN')) return; // Filter warnings
            console.error(errorOutput);
        });

        installProcess.on('close', (code) => {
            if (code === 0) {
                colorLog(colors.green, `[OK] ${integrationInfo.displayName} integration installation successful`);
                resolve(true);
            } else {
                colorLog(colors.red, `[ERROR] ${integrationInfo.displayName} integration installation failed`);
                resolve(false);
            }
        });
    });
}

// Prompt user for CLI tools to install
async function promptForTools(cliStatus) {
    const uninstalledRequired = [];
    const uninstalledOptional = [];
    
    for (const [name, status] of Object.entries(cliStatus)) {
        if (!status.available) {
            if (status.required) {
                uninstalledRequired.push({ name, ...status });
            } else {
                uninstalledOptional.push({ name, ...status });
            }
        }
    }
    
    if (uninstalledRequired.length === 0 && uninstalledOptional.length === 0) {
        colorLog(colors.green, '[OK] All CLI tools are already installed!');
        return [];
    }
    
    console.log('');
    if (uninstalledRequired.length > 0) {
        colorLog(colors.red, '[ERROR] The following required CLI tools are not installed:');
        for (const cli of uninstalledRequired) {
            console.log(`   ${cli.description} (${cli.name})`);
        }
    }
    
    if (uninstalledOptional.length > 0) {
        colorLog(colors.yellow, '[WARN] The following optional CLI tools are not installed:');
        for (const cli of uninstalledOptional) {
            console.log(`   ${cli.description} (${cli.name})`);
        }
    }
    
    console.log('');
    colorLog(colors.cyan, '[INFO] Installation guide for each CLI:');
    
    for (const cli of CLI_TOOLS) {
        const status = cliStatus[cli.name];
        if (!status.available) {
            colorLog(colors.yellow, `📖 ${cli.displayName} Installation Guide:`);
            colorLog(colors.cyan, `📚 Official Documentation: ${getInstallDocs(cli.name)}`);
            colorLog(colors.yellow, '🔧 Recommended Installation Method:');
            console.log(`   npm install -g ${getNpmPackageName(cli.name)}`);
            console.log('');
        }
    }
    
    return new Promise((resolve) => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('Install missing tools? (y/N): ', (answer) => {
            rl.close();
            if (answer.toLowerCase().startsWith('y')) {
                resolve([...uninstalledRequired, ...uninstalledOptional]);
            } else {
                resolve([]);
            }
        });
    });
}

// Get installation documentation URL
function getInstallDocs(cliName) {
    const docs = {
        'claude': 'https://docs.anthropic.com/claude/docs/install',
        'gemini': 'https://ai.google.dev/gemini-api/docs/install',
        'qwen': 'https://www.alibabacloud.com/help/en/qwen/install',
        'iflow': 'https://iflow.ai/docs/install',
        'qodercli': 'https://qoder.ai/docs/install',
        'codebuddy': 'https://codebuddy.qq.com/docs/install',
        'copilot': 'https://github.com/features/copilot/setup',
        'ollama': 'https://ollama.ai/docs/install'
    };
    return docs[cliName] || 'https://npmjs.org/package/' + cliName;
}

// Install selected CLI tools
async function installSelectedCLIs(selectedCLIs) {
    let successCount = 0;
    
    for (const cli of selectedCLIs) {
        const installed = await installCli(cli);
        if (installed) successCount++;
    }
    
    colorLog(colors.green, `[OK] CLI tools installation complete: ${successCount}/${selectedCLIs.length} tools installed successfully`);
    return successCount;
}

// Install selected CLI integrations
async function installSelectedIntegrations(selectedIntegrations) {
    let successCount = 0;
    
    for (const integration of selectedIntegrations) {
        const installed = await installIntegration(integration);
        if (installed) successCount++;
    }
    
    colorLog(colors.green, `[OK] Integration installation complete: ${successCount}/${selectedIntegrations.length} integrations installed successfully`);
    return successCount;
}

// Prompt user for integrations to install
async function promptForIntegrations(integrationStatus) {
    const uninstalledIntegrations = [];
    
    for (const [name, status] of Object.entries(integrationStatus)) {
        if (!status.installed) {
            uninstalledIntegrations.push({ name, ...status });
        }
    }
    
    if (uninstalledIntegrations.length === 0) {
        colorLog(colors.green, '[OK] All CLI integrations are already installed!');
        return [];
    }
    
    colorLog(colors.yellow, '[INFO] The following CLI integrations are not installed:');
    for (const integration of uninstalledIntegrations) {
        console.log(`   ${integration.description} (${integration.name})`);
    }
    
    return new Promise((resolve) => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('Install missing integrations? (y/N): ', (answer) => {
            rl.close();
            if (answer.toLowerCase().startsWith('y')) {
                resolve(uninstalledIntegrations);
            } else {
                resolve([]);
            }
        });
    });
}

// Build project
async function buildProject() {
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
        colorLog(colors.blue, '[DEPLOY] Building project...');
        
        const buildProcess = spawn('npm', ['run', 'build'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            cwd: __dirname
        });

        let output = '';
        buildProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        buildProcess.stderr.on('data', (data) => {
            output += data.toString();
        });

        buildProcess.on('close', (code) => {
            if (code === 0) {
                colorLog(colors.green, '[OK] Project build successful');
                resolve(true);
            } else {
                colorLog(colors.red, `[ERROR] Project build failed: ${output}`);
                resolve(false);
            }
        });
    });
}

// Publish to NPM
async function publishToNPM() {
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
        colorLog(colors.blue, '[DEPLOY] Publishing to NPM...');
        
        const publishProcess = spawn('npm', ['publish'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            cwd: __dirname
        });

        let output = '';
        publishProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        publishProcess.stderr.on('data', (data) => {
            output += data.toString();
        });

        publishProcess.on('close', (code) => {
            if (code === 0) {
                colorLog(colors.green, '[OK] NPM publish successful');
                resolve(true);
            } else {
                colorLog(colors.red, `[ERROR] NPM publish failed: ${output}`);
                resolve(false);
            }
        });
    });
}

// Main deployment function
async function main() {
    colorLog(colors.magenta, '[DEPLOY] Stigmergy CLI - Smart Deployment System');
    
    // 1. Scan system CLI tools status
    colorLog(colors.cyan, '[SCAN] Scanning system CLI tools status...');
    const cliStatus = await getCliStatus();
    
    // 2. Show current status
    console.log('');
    for (const [name, status] of Object.entries(cliStatus)) {
        const icon = status.available ? '[OK]' : '[X]';
        const required = status.required ? '[REQUIRED]' : '[OPTIONAL]';
        console.log(`   ${icon} ${name} ${required} - ${status.available ? 'Available' : 'Not Available'}`);
    }
    
    // 3. Ask user to install missing tools
    const toolsToInstall = await promptForTools(cliStatus);
    
    if (toolsToInstall.length > 0) {
        // Install missing CLI tools
        colorLog(colors.blue, `[DEPLOY] Starting auto-installation of ${toolsToInstall.length} CLI tools...`);
        const installCount = await installSelectedCLIs(toolsToInstall);
        
        if (installCount > 0) {
            colorLog(colors.green, `[OK] Installation complete: ${installCount}/${toolsToInstall.length} CLI tools installed successfully`);
        }
    }
    
    // 4. Check and install integrations
    const integrationStatus = getIntegrationStatus();
    const integrationsToInstall = await promptForIntegrations(integrationStatus);
    
    if (integrationsToInstall.length > 0) {
        // Install missing CLI integrations
        colorLog(colors.blue, `[DEPLOY] Starting auto-installation of ${integrationsToInstall.length} CLI integrations...`);
        const installCount = await installSelectedIntegrations(integrationsToInstall);
        
        if (installCount > 0) {
            colorLog(colors.green, `[OK] Integration installation complete: ${installCount}/${integrationsToInstall.length} integrations installed successfully`);
        }
    }
    
    // 5. Build project
    const buildSuccess = await buildProject();
    
    if (buildSuccess) {
        // 6. Check if should publish to NPM
        const shouldPublish = await new Promise((resolve) => {
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('Build successful! Publish to NPM? (y/N): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase().startsWith('y'));
            });
        });
        
        if (shouldPublish) {
            await publishToNPM();
        }
    }
    
    colorLog(colors.magenta, '[SUCCESS] Stigmergy CLI deployment successful!');
    colorLog(colors.cyan, '[INFO] Now anyone can use:');
    console.log('   npx stigmergy@latest');
    console.log('   npm install -g stigmergy');
    console.log('');
    colorLog(colors.cyan, '[TARGET] True cross-CLI collaboration, maximizing the value of each AI tool!');
    colorLog(colors.cyan, '[INFO] More info: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
}

// Error handling
process.on('unhandledRejection', (error) => {
    colorLog(colors.red, `[ERROR] Unhandled promise rejection: ${error.message}`);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    colorLog(colors.red, `[ERROR] Uncaught exception: ${error.message}`);
    process.exit(1);
});

// Run main function
if (require.main === module) {
    main().catch(error => {
        colorLog(colors.red, `[ERROR] Deployment failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    });
}

export { CLI_TOOLS, CLI_INTEGRATIONS, isCliAvailable, getCliStatus, getIntegrationStatus };