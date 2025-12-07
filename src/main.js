#!/usr/bin/env node

/**
 * Stigmergy CLI - Enhanced Main Entry Point (CommonJS)
 * Multi-Agents Cross-AI CLI Tools Collaboration System
 * Includes auto-scanning and installation capabilities
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// CLI Tools Configuration
const CLI_TOOLS = {
    claude: { name: 'Claude CLI', version: 'claude --version', install: 'npm install -g @anthropic-ai/claude-3' },
    gemini: { name: 'Gemini CLI', version: 'gemini --version', install: 'npm install -g @google/generative-ai-cli' },
    qwen: { name: 'Qwen CLI', version: 'qwen --version', install: 'npm install -g @alibaba/qwen-cli' },
    iflow: { name: 'iFlow CLI', version: 'iflow --version', install: 'npm install -g iflow-cli' },
    qoder: { name: 'Qoder CLI', version: 'qodercli --version', install: 'npm install -g @qoder-ai/qodercli' },
    codebuddy: { name: 'CodeBuddy CLI', version: 'codebuddy --version', install: 'npm install -g codebuddy-cli' },
    copilot: { name: 'GitHub Copilot CLI', version: 'copilot --version', install: 'npm install -g @github/copilot-cli' },
    codex: { name: 'OpenAI Codex CLI', version: 'codex --version', install: 'npm install -g openai-codex-cli' }
};

class StigmergyInstaller {
    constructor() {
        this.homeDir = os.homedir();
        this.stigmergyDir = path.join(this.homeDir, '.stigmergy');
    }

    async ensureDirectory(dirPath) {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            return false;
        }
    }

    checkCLI(toolName) {
        try {
            const tool = CLI_TOOLS[toolName];
            const result = spawnSync(tool.version.split(' ')[0], tool.version.split(' ').slice(1), {
                stdio: 'ignore',
                timeout: 10000,
                env: { ...process.env }
            });
            return result.status === 0;
        } catch (error) {
            return false;
        }
    }

    async scanAvailableTools() {
        const results = {
            total: Object.keys(CLI_TOOLS).length,
            available: [],
            unavailable: [],
            details: []
        };

        console.log('🔍 Scanning for AI CLI tools...');
        console.log('='.repeat(50));

        for (const [key, tool] of Object.entries(CLI_TOOLS)) {
            const isAvailable = this.checkCLI(key);

            if (isAvailable) {
                results.available.push(key);
                console.log(`✅ ${tool.name}: Available`);
                results.details.push({ name: tool.name, status: 'Available', install: tool.install });
            } else {
                results.unavailable.push(key);
                console.log(`❌ ${tool.name}: Not Available`);
                results.details.push({ name: tool.name, status: 'Not Available', install: tool.install });
            }
        }

        console.log('='.repeat(50));
        console.log(`📊 Summary: ${results.available.length}/${results.total} tools available`);

        return results;
    }

    async promptForInstallation(scanResults) {
        if (scanResults.unavailable.length === 0) {
            console.log('🎉 All CLI tools are already installed!');
            return [];
        }

        console.log('\n🎯 The following AI CLI tools can be automatically installed:');
        scanResults.unavailable.forEach((toolKey, index) => {
            const tool = CLI_TOOLS[toolKey];
            console.log(`  ${index + 1}. ${tool.name} - ${tool.install}`);
        });

        console.log('\n💡 Installation Options:');
        console.log('  - Enter numbers separated by spaces (e.g: 1 3 5)');
        console.log('  - Enter "all" to install all missing tools');
        console.log('  - Press Enter to skip installation');

        return new Promise((resolve) => {
            process.stdout.write('\n🔧 Select tools to install: ');

            process.stdin.once('data', (data) => {
                const input = data.toString().trim();

                if (input === '' || input.toLowerCase() === 'skip') {
                    resolve([]);
                } else if (input.toLowerCase() === 'all') {
                    resolve(scanResults.unavailable);
                } else {
                    const numbers = input.split(/\s+/).map(n => parseInt(n) - 1);
                    const selected = numbers
                        .filter(n => n >= 0 && n < scanResults.unavailable.length)
                        .map(n => scanResults.unavailable[n]);
                    resolve(selected);
                }
            });
        });
    }

    async installTools(toolKeys) {
        if (toolKeys.length === 0) {
            console.log('⏭️  Skipping installation.');
            return;
        }

        console.log(`\n🚀 Installing ${toolKeys.length} AI CLI tools...`);
        console.log('='.repeat(50));

        for (const toolKey of toolKeys) {
            const tool = CLI_TOOLS[toolKey];
            console.log(`\n📦 Installing ${tool.name}...`);

            try {
                const installProcess = spawn('npm', ['install', '-g'].concat(tool.install.split(' ').slice(3)), {
                    stdio: 'inherit'
                });

                await new Promise((resolve, reject) => {
                    installProcess.on('close', (code) => {
                        if (code === 0) {
                            console.log(`✅ ${tool.name} installed successfully!`);
                            resolve();
                        } else {
                            console.log(`❌ Failed to install ${tool.name}`);
                            reject(new Error(`Installation failed with code ${code}`));
                        }
                    });
                });
            } catch (error) {
                console.log(`❌ Error installing ${tool.name}:`, error.message);
            }
        }

        console.log('\n🎯 Installation completed! Verifying...');
        await this.verifyInstallation(toolKeys);
    }

    async verifyInstallation(toolKeys) {
        console.log('='.repeat(50));
        let successCount = 0;

        for (const toolKey of toolKeys) {
            const tool = CLI_TOOLS[toolKey];
            if (this.checkCLI(toolKey)) {
                console.log(`✅ ${tool.name}: Successfully installed and functional!`);
                successCount++;
            } else {
                console.log(`❌ ${tool.name}: Installation verification failed`);
            }
        }

        console.log(`\n📊 Installation Result: ${successCount}/${toolKeys.length} tools successfully installed`);

        if (successCount === toolKeys.length) {
            console.log('🎉 All selected tools are now ready to use!');
        }
    }

    async setupConfiguration() {
        await this.ensureDirectory(this.stigmergyDir);

        const configPath = path.join(this.stigmergyDir, 'config.json');
        const defaultConfig = {
            version: '1.0.71',
            installed: new Date().toISOString(),
            tools: {},
            autoScan: true,
            plugins: {
                skills: false,
                hooks: false,
                collaboration: false
            }
        };

        try {
            await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
            console.log('⚙️  Configuration saved to:', configPath);
        } catch (error) {
            console.log('⚠️  Warning: Could not save configuration file');
        }
    }
}

// Main CLI functionality
async function main() {
    const args = process.argv.slice(2);
    const installer = new StigmergyInstaller();

    // Setup stdin for interactive prompts
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
        console.log('Version: 1.0.71');
        console.log('');
        console.log('Usage: stigmergy [command] [options]');
        console.log('');
        console.log('Commands:');
        console.log('  help, --help        Show this help message');
        console.log('  version, --version   Show version information');
        console.log('  status             Check CLI tools status');
        console.log('  scan               Scan for available AI CLI tools');
        console.log('  install            Interactive CLI tools installation');
        console.log('  setup              Initial setup and configuration');
        console.log('');
        console.log('Examples:');
        console.log('  stigmergy --help');
        console.log('  stigmergy scan');
        console.log('  stigmergy install');
        console.log('');
        console.log('Features:');
        console.log('  ✅ Auto-scan for AI CLI tools');
        console.log('  ✅ Interactive installation prompts');
        console.log('  ✅ Automatic npm package installation');
        console.log('  ✅ Configuration file management');
        console.log('  ✅ Cross-platform support');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        return;
    }

    if (args.includes('--version') || args.includes('version')) {
        console.log('1.0.71');
        return;
    }

    if (args.includes('status')) {
        console.log('🔍 Checking AI CLI tools status...');
        const scanResults = await installer.scanAvailableTools();

        if (scanResults.available.length > 0) {
            console.log('\n✅ Available tools:');
            scanResults.available.forEach(toolKey => {
                console.log(`   - ${CLI_TOOLS[toolKey].name}`);
            });
        }
        return;
    }

    if (args.includes('scan')) {
        const scanResults = await installer.scanAvailableTools();

        if (scanResults.unavailable.length > 0) {
            console.log('\n💡 Run "stigmergy install" to install missing tools');
        }
        return;
    }

    if (args.includes('install')) {
        console.log('🚀 Stigmergy CLI Tools Installer');
        console.log('This will help you install missing AI CLI tools.\n');

        const scanResults = await installer.scanAvailableTools();
        const selectedTools = await installer.promptForInstallation(scanResults);
        await installer.installTools(selectedTools);
        await installer.setupConfiguration();

        console.log('\n🎉 Installation and setup completed!');
        console.log('You can now use "stigmergy status" to verify all tools.');
        return;
    }

    if (args.includes('setup')) {
        console.log('⚙️  Setting up Stigmergy CLI configuration...');
        await installer.setupConfiguration();

        const scanResults = await installer.scanAvailableTools();
        console.log('\n📊 Current Status:');
        console.log(`   Available: ${scanResults.available.length} tools`);
        console.log(`   Missing: ${scanResults.unavailable.length} tools`);

        if (scanResults.unavailable.length > 0) {
            console.log('\n💡 Run "stigmergy install" to install missing tools');
        }

        return;
    }

    console.log('❓ Unknown command. Use --help for usage information.');
}

// Check if this file is being run directly
if (require.main === module) {
    // Enable stdin for interactive prompts
    if (process.stdin.isTTY) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
    }

    main().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = { main, StigmergyInstaller, CLI_TOOLS };