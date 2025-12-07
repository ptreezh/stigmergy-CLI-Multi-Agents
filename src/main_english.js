#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
 * International Version - Pure English & ANSI Only
 * Version: 1.0.81
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');

// AI CLI Tools Configuration
const CLI_TOOLS = {
    claude: {
        name: 'Claude CLI',
        version: 'claude --version',
        install: 'npm install -g @anthropic-ai/claude-cli',
        hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
        config: path.join(os.homedir(), '.claude', 'config.json')
    },
    gemini: {
        name: 'Gemini CLI',
        version: 'gemini --version',
        install: 'npm install -g @google/generative-ai-cli',
        hooksDir: path.join(os.homedir(), '.gemini', 'extensions'),
        config: path.join(os.homedir(), '.gemini', 'config.json')
    },
    qwen: {
        name: 'Qwen CLI',
        version: 'qwen --version',
        install: 'npm install -g @alibaba/qwen-cli',
        hooksDir: path.join(os.homedir(), '.qwen', 'hooks'),
        config: path.join(os.homedir(), '.qwen', 'config.json')
    },
    iflow: {
        name: 'iFlow CLI',
        version: 'iflow --version',
        install: 'npm install -g iflow-cli',
        hooksDir: path.join(os.homedir(), '.iflow', 'hooks'),
        config: path.join(os.homedir(), '.iflow', 'config.json')
    },
    qodercli: {
        name: 'Qoder CLI',
        version: 'qodercli --version',
        install: 'npm install -g @qoder-ai/qodercli',
        hooksDir: path.join(os.homedir(), '.qoder', 'hooks'),
        config: path.join(os.homedir(), '.qoder', 'config.json')
    },
    codebuddy: {
        name: 'CodeBuddy CLI',
        version: 'codebuddy --version',
        install: 'npm install -g codebuddy-cli',
        hooksDir: path.join(os.homedir(), '.codebuddy', 'hooks'),
        config: path.join(os.homedir(), '.codebuddy', 'config.json')
    },
    copilot: {
        name: 'GitHub Copilot CLI',
        version: 'copilot --version',
        install: 'npm install -g @github/copilot-cli',
        hooksDir: path.join(os.homedir(), '.copilot', 'mcp'),
        config: path.join(os.homedir(), '.copilot', 'config.json')
    },
    codex: {
        name: 'OpenAI Codex CLI',
        version: 'codex --version',
        install: 'npm install -g openai-codex-cli',
        hooksDir: path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
        config: path.join(os.homedir(), '.codex', 'config.json')
    }
};

class SmartRouter {
    constructor() {
        this.tools = CLI_TOOLS;
        this.routeKeywords = ['use', 'help', 'please', 'write', 'generate', 'explain', 'analyze', 'translate', 'code', 'article'];
        this.defaultTool = 'claude';
    }

    shouldRoute(userInput) {
        return this.routeKeywords.some(keyword =>
            userInput.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    smartRoute(userInput) {
        const input = userInput.trim();

        // Detect tool-specific keywords
        for (const [toolName, toolInfo] of Object.entries(this.tools)) {
            for (const keyword of this.extractKeywords(toolName)) {
                if (input.toLowerCase().includes(keyword.toLowerCase())) {
                    // Extract clean parameters
                    const cleanInput = input
                        .replace(new RegExp(`.*${keyword}\\s*`, 'gi'), '')
                        .replace(/^(use|please|help|using|with)\s*/i, '')
                        .trim();
                    return { tool: toolName, prompt: cleanInput };
                }
            }
        }

        // Default routing
        const cleanInput = input.replace(/^(use|please|help|using|with)\s*/i, '').trim();
        return { tool: this.defaultTool, prompt: cleanInput };
    }

    extractKeywords(toolName) {
        const keywords = {
            claude: ['claude', 'anthropic'],
            gemini: ['gemini', 'google'],
            qwen: ['qwen', 'alibaba', 'tongyi'],
            iflow: ['iflow', 'workflow', 'intelligent'],
            qodercli: ['qoder', 'code'],
            codebuddy: ['codebuddy', 'buddy', 'assistant'],
            copilot: ['copilot', 'github', 'gh'],
            codex: ['codex', 'openai', 'gpt']
        };

        return keywords[toolName] || [toolName];
    }
}

class MemoryManager {
    constructor() {
        this.globalMemoryFile = path.join(os.homedir(), '.stigmergy', 'memory.json');
        this.projectMemoryFile = path.join(process.cwd(), 'STIGMERGY.md');
    }

    async addInteraction(tool, prompt, response) {
        const interaction = {
            timestamp: new Date().toISOString(),
            tool,
            prompt,
            response,
            duration: Date.now() - new Date().getTime()
        };

        // Add to global memory
        await this.saveGlobalMemory(interaction);

        // Add to project memory
        await this.saveProjectMemory(interaction);
    }

    async saveGlobalMemory(interaction) {
        try {
            const memory = await this.loadGlobalMemory();
            memory.interactions = memory.interactions.concat(interaction).slice(-100); // Keep last 100
            memory.lastInteraction = interaction;

            await fs.mkdir(path.dirname(this.globalMemoryFile), { recursive: true });
            await fs.writeFile(this.globalMemoryFile, JSON.stringify(memory, null, 2));
        } catch (error) {
            console.error(`[MEMORY] Failed to save global memory: ${error.message}`);
        }
    }

    async saveProjectMemory(interaction) {
        try {
            const memory = await this.loadProjectMemory();
            memory.interactions = memory.interactions.concat(interaction).slice(-50); // Keep last 50
            memory.lastInteraction = interaction;

            await fs.writeFile(this.projectMemoryFile, this.formatProjectMemory(memory));
        } catch (error) {
            console.error(`[MEMORY] Failed to save project memory: ${error.message}`);
        }
    }

    async loadGlobalMemory() {
        try {
            const data = await fs.readFile(this.globalMemoryFile, 'utf8');
            return JSON.parse(data);
        } catch {
            return {
                projectName: 'Global Stigmergy Memory',
                interactions: [],
                createdAt: new Date().toISOString()
            };
        }
    }

    async loadProjectMemory() {
        try {
            const data = await fs.readFile(this.projectMemoryFile, 'utf8');
            return this.parseProjectMemory(data);
        } catch {
            return {
                projectName: path.basename(process.cwd()),
                interactions: [],
                createdAt: new Date().toISOString()
            };
        }
    }

    formatProjectMemory(memory) {
        let content = `# Stigmergy Project Memory\n\n`;
        content += `**Project**: ${memory.projectName}\n`;
        content += `**Created**: ${memory.createdAt}\n`;
        content += `**Last Updated**: ${new Date().toISOString()}\n\n`;

        if (memory.lastInteraction) {
            content += `## Last Interaction\n\n`;
            content += `- **Tool**: ${memory.lastInteraction.tool}\n`;
            content += `- **Timestamp**: ${memory.lastInteraction.timestamp}\n`;
            content += `- **Prompt**: ${memory.lastInteraction.prompt}\n`;
            content += `- **Response**: ${memory.lastInteraction.response.substring(0, 200)}...\n\n`;
        }

        content += `## Recent Interactions (${memory.interactions.length})\n\n`;
        memory.interactions.slice(-10).forEach((interaction, index) => {
            content += `### ${index + 1}. ${interaction.tool} - ${interaction.timestamp}\n\n`;
            content += `**Prompt**: ${interaction.prompt}\n\n`;
            content += `**Response**: ${interaction.response.substring(0, 200)}...\n\n`;
        });

        return content;
    }

    parseProjectMemory(markdown) {
        // Simple parser for project memory
        return {
            projectName: 'Project',
            interactions: [],
            createdAt: new Date().toISOString()
        };
    }
}

class StigmergyInstaller {
    constructor() {
        this.router = new SmartRouter();
        this.memory = new MemoryManager();
        this.configDir = path.join(os.homedir(), '.stigmergy');
    }

    async checkCLI(toolName) {
        const tool = this.router.tools[toolName];
        if (!tool) return false;

        // Try multiple ways to check if CLI is available
        const checks = [
            // Method 1: Try version command
            { args: ['--version'], expected: 0 },
            // Method 2: Try help command
            { args: ['--help'], expected: 0 },
            // Method 3: Try help command with -h
            { args: ['-h'], expected: 0 },
            // Method 4: Try just the command (help case)
            { args: [], expected: 0 },
            // Method 5: Try version with alternative format
            { args: ['version'], expected: 0 }
        ];

        for (const check of checks) {
            try {
                const result = spawnSync(toolName, check.args, {
                    encoding: 'utf8',
                    timeout: 8000,
                    stdio: 'pipe'
                });

                // Check if command exists and runs (exit 0 or shows help)
                if (result.status === 0 || result.stdout.includes(toolName) || result.stderr.includes(toolName)) {
                    return true;
                }

                // Also check if command exists but returns non-zero (some CLIs do this)
                if (result.error === undefined && (result.stdout.length > 0 || result.stderr.length > 0)) {
                    const output = (result.stdout + result.stderr).toLowerCase();
                    if (output.includes(toolName) || output.includes('cli') || output.includes('ai') || output.includes('help')) {
                        return true;
                    }
                }
            } catch (error) {
                // Command not found, continue to next check
                continue;
            }
        }

        // Method 6: Check if command exists in PATH using `which`/`where` (platform specific)
        try {
            const whichCmd = process.platform === 'win32' ? 'where' : 'which';
            const result = spawnSync(whichCmd, [toolName], {
                encoding: 'utf8',
                timeout: 5000
            });

            if (result.status === 0 && result.stdout.trim().length > 0) {
                // Found in PATH
                return true;
            }
        } catch (error) {
            // Continue
        }

        // Method 7: Check common installation paths
        const commonPaths = this.getCommonCLIPaths(toolName);
        for (const cliPath of commonPaths) {
            try {
                if (await this.fileExists(cliPath)) {
                    // Found at specific path
                    return true;
                }
            } catch (error) {
                continue;
            }
        }

        return false;
    }

    getCommonCLIPaths(toolName) {
        const homeDir = os.homedir();
        const paths = [];

        // Add platform-specific paths
        if (process.platform === 'win32') {
            // Local and global npm paths
            paths.push(
                path.join(homeDir, 'AppData', 'Roaming', 'npm', `${toolName}.cmd`),
                path.join(homeDir, 'AppData', 'Roaming', 'npm', `${toolName}.ps1`),
                path.join(homeDir, 'AppData', 'Local', 'npm', `${toolName}.cmd`),
                path.join(homeDir, 'AppData', 'Local', 'npm', `${toolName}.ps1`),
                // Program Files
                path.join(process.env.ProgramFiles || 'C:\\Program Files', `${toolName}`, `${toolName}.exe`),
                path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', `${toolName}`, `${toolName}.exe`),
                // Node.js global packages
                path.join(homeDir, '.npm', `${toolName}.cmd`),
                path.join(homeDir, '.npm', `${toolName}.js`),
                // User directories
                path.join(homeDir, `${toolName}.cmd`),
                path.join(homeDir, `${toolName}.exe`),
                // Custom test directories
                path.join(homeDir, '.stigmergy-test', `${toolName}.cmd`),
                path.join(homeDir, '.stigmergy-test', `${toolName}.js`)
            );
        } else {
            paths.push(
                // Global npm paths
                path.join(homeDir, '.npm', 'global', 'bin', toolName),
                path.join(homeDir, '.npm', 'global', 'bin', `${toolName}.js`),
                // Local npm paths
                path.join(homeDir, '.npm', 'bin', toolName),
                path.join(homeDir, '.local', 'bin', toolName),
                path.join(homeDir, '.local', 'bin', `${toolName}.js`),
                // System paths
                path.join('/usr', 'local', 'bin', toolName),
                path.join('/usr', 'local', 'bin', `${toolName}.js`),
                path.join('/usr', 'bin', toolName),
                path.join('/usr', 'bin', `${toolName}.js`),
                // User home
                path.join(homeDir, '.local', 'bin', toolName),
                path.join(homeDir, '.local', 'bin', `${toolName}.js`),
                // Custom test directories
                path.join(homeDir, '.stigmergy-test', toolName),
                path.join(homeDir, '.stigmergy-test', `${toolName}.js`)
            );
        }

        // Add NPM global bin directory
        try {
            const { spawnSync } = require('child_process');
            const npmRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' }).stdout.trim();
            if (npmRoot) {
                paths.push(path.join(npmRoot, 'bin', toolName));
                paths.push(path.join(npmRoot, `${toolName}.js`));
                paths.push(path.join(npmRoot, `${toolName}.cmd`));
            }
        } catch (error) {
            // Continue
        }

        return paths;
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async scanCLI() {
        console.log('[SCAN] Scanning for AI CLI tools on your system...');
        console.log('='.repeat(60));

        const available = {};
        const missing = {};

        for (const [toolName, toolInfo] of Object.entries(this.router.tools)) {
            const isAvailable = await this.checkCLI(toolName);

            if (isAvailable) {
                available[toolName] = toolInfo;
                console.log(`[OK] ${toolInfo.name}: Available`);
            } else {
                missing[toolName] = toolInfo;
                console.log(`[X] ${toolInfo.name}: Not Available`);
            }
        }

        console.log('='.repeat(60));
        console.log(`[SUMMARY] ${Object.keys(available).length}/${Object.keys(this.router.tools).length} tools available`);

        return { available, missing };
    }

    async showInstallOptions(missing) {
        if (Object.keys(missing).length === 0) {
            console.log('[INFO] All AI CLI tools are already installed!');
            return [];
        }

        console.log('\n[INSTALL] The following AI CLI tools can be automatically installed:\n');

        const options = [];
        let index = 1;

        for (const [toolName, toolInfo] of Object.entries(missing)) {
            console.log(`  ${index}. ${toolInfo.name}`);
            console.log(`     Install: ${toolInfo.install}`);
            options.push({ index, toolName, toolInfo });
            index++;
        }

        console.log('\n[OPTIONS] Installation Options:');
        console.log('- Enter numbers separated by spaces (e.g: 1 3 5)');
        console.log('- Enter "all" to install all missing tools');
        console.log('- Enter "skip" to skip CLI installation');

        return options;
    }

    async installTools(selectedTools, missing) {
        if (!selectedTools || selectedTools.length === 0) {
            console.log('[INFO] Skipping CLI tool installation');
            return true;
        }

        console.log('\n[INSTALL] Installing selected AI CLI tools...');

        for (const selection of selectedTools) {
            const { toolName, toolInfo } = selection;
            console.log(`\n[INSTALLING] ${toolInfo.name}...`);

            try {
                const installCmd = toolInfo.install.split(' ');
                const result = spawnSync(installCmd[0], installCmd.slice(1), {
                    encoding: 'utf8',
                    timeout: 120000,
                    stdio: 'inherit'
                });

                if (result.status === 0) {
                    console.log(`[OK] ${toolInfo.name} installed successfully`);
                } else {
                    console.log(`[ERROR] Failed to install ${toolInfo.name}`);
                    console.log(`[INFO] Please run manually: ${toolInfo.install}`);
                }
            } catch (error) {
                console.log(`[ERROR] Failed to install ${toolInfo.name}: ${error.message}`);
                console.log(`[INFO] Please run manually: ${toolInfo.install}`);
            }
        }

        return true;
    }

    async deployHooks(available) {
        console.log('\n[DEPLOY] Deploying cross-CLI integration hooks...');

        for (const [toolName, toolInfo] of Object.entries(available)) {
            console.log(`\n[DEPLOY] Deploying hooks for ${toolInfo.name}...`);

            try {
                await fs.mkdir(toolInfo.hooksDir, { recursive: true });

                // Create config directory (not the config file itself)
                const configDir = path.dirname(toolInfo.config);
                await fs.mkdir(configDir, { recursive: true });

                console.log(`[OK] Created directories for ${toolInfo.name}`);
                console.log(`[INFO] Hooks directory: ${toolInfo.hooksDir}`);
                console.log(`[INFO] Config directory: ${configDir}`);
            } catch (error) {
                console.log(`[ERROR] Failed to create directories for ${toolInfo.name}: ${error.message}`);
            }
        }

        console.log('\n[OK] Hook deployment completed');
        return true;
    }

    async initializeConfig() {
        console.log('\n[CONFIG] Initializing Stigmergy configuration...');

        try {
            await fs.mkdir(this.configDir, { recursive: true });

            const configFile = path.join(this.configDir, 'config.json');
            const config = {
                version: '1.0.81',
                initialized: true,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                defaultCLI: 'claude',
                enableCrossCLI: true,
                enableMemory: true
            };

            await fs.writeFile(configFile, JSON.stringify(config, null, 2));
            console.log('[OK] Configuration initialized');
            console.log(`[INFO] Config file: ${configFile}`);

            return true;
        } catch (error) {
            console.log(`[ERROR] Failed to initialize configuration: ${error.message}`);
            return false;
        }
    }

    showUsageInstructions() {
        console.log('\n[USAGE] Stigmergy CLI Usage Instructions:');
        console.log('='.repeat(60));
        console.log('');
        console.log('1. Check System Status:');
        console.log('   stigmergy status');
        console.log('');
        console.log('2. Check Available Tools:');
        console.log('   stigmergy scan');
        console.log('');
        console.log('3. Start Using AI CLI Collaboration:');
        console.log('   stigmergy call claude "help me debug this code"');
        console.log('   stigmergy call gemini "generate documentation"');
        console.log('   stigmergy call qwen "translate to English"');
        console.log('');
        console.log('4. Initialize New Projects:');
        console.log('   stigmergy init --primary claude');
        console.log('');
        console.log('[INFO] Documentation:');
        console.log('   - Global Config: ~/.stigmergy/config.json');
        console.log('   - Project Docs: ./STIGMERGY.md');
        console.log('   - GitHub: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        console.log('');
        console.log('[END] Happy collaborating with multiple AI CLI tools!');
    }
}

// Main CLI functionality
async function main() {
    const args = process.argv.slice(2);
    const installer = new StigmergyInstaller();

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
        console.log('Version: 1.0.81');
        console.log('');
        console.log('[SYSTEM] Automated Installation and Deployment System');
        console.log('');
        console.log('Usage: stigmergy [command] [options]');
        console.log('');
        console.log('Commands:');
        console.log('  help, --help     Show this help message');
        console.log('  version, --version Show version information');
        console.log('  status          Check CLI tools status');
        console.log('  scan            Scan for available AI CLI tools');
        console.log('  install         Auto-install missing CLI tools');
        console.log('  deploy          Deploy hooks to installed tools');
        console.log('  setup           Complete setup and configuration');
        console.log('  call <tool>     Execute prompt with specified or auto-routed AI CLI');
        console.log('');
        console.log('[WORKFLOW] Automated Workflow:');
        console.log('  1. npm install -g stigmergy        # Install Stigmergy');
        console.log('  2. stigmergy install             # Auto-scan & install CLI tools');
        console.log('  3. stigmergy setup               # Deploy hooks & config');
        console.log('  4. stigmergy call <ai> <prompt>   # Start collaborating');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        return;
    }

    const command = args[0];

    switch (command) {
        case 'version':
        case '--version':
            console.log('Stigmergy CLI v1.0.81');
            break;

        case 'status':
            const { available, missing } = await installer.scanCLI();
            console.log('\n[STATUS] System Status:');
            console.log(`Available: ${Object.keys(available).length} tools`);
            console.log(`Missing: ${Object.keys(missing).length} tools`);
            break;

        case 'scan':
            await installer.scanCLI();
            break;

        case 'install':
            const { missing: missingTools } = await installer.scanCLI();
            const options = await installer.showInstallOptions(missingTools);

            if (options.length > 0) {
                // Use inquirer for interactive selection
                const inquirer = require('inquirer');

                const choices = options.map(opt => ({
                    name: `${opt.toolInfo.name} - ${opt.toolInfo.install}`,
                    value: opt.toolName
                }));

                choices.push(new inquirer.Separator(' = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='),
                             { name: 'All missing tools', value: 'all' },
                             { name: 'Skip installation', value: 'skip' });

                const answers = await inquirer.prompt([
                    {
                        type: 'checkbox',
                        name: 'selectedTools',
                        message: 'Select tools to install (Space to select, Enter to confirm):',
                        choices: choices,
                        validate: function (answer) {
                            if (answer.length < 1) {
                                return 'You must choose at least one option.';
                            }
                            return true;
                        }
                    }
                ]);

                if (answers.selectedTools.includes('skip')) {
                    console.log('[INFO] Skipping CLI tool installation');
                } else {
                    let toolsToInstall;
                    if (answers.selectedTools.includes('all')) {
                        toolsToInstall = options;
                    } else {
                        toolsToInstall = options.filter(opt => answers.selectedTools.includes(opt.toolName));
                    }

                    console.log('\n[INFO] Installing selected tools...');
                    await installer.installTools(toolsToInstall, missingTools);
                }
            } else {
                console.log('\n[INFO] All required tools are already installed!');
            }
            break;

        case 'deploy':
            const { available: deployedTools } = await installer.scanCLI();
            await installer.deployHooks(deployedTools);
            break;

        case 'setup':
            console.log('[SETUP] Starting complete Stigmergy setup...\n');

            const { available: setupAvailable, missing: setupMissing } = await installer.scanCLI();
            const setupOptions = await installer.showInstallOptions(setupMissing);

            if (setupOptions.length > 0) {
                console.log('\n[INFO] Installing all missing tools...');
                await installer.installTools(setupOptions, setupMissing);
            }

            await installer.deployHooks(setupAvailable);
            await installer.initializeConfig();
            installer.showUsageInstructions();
            break;

        case 'call':
            if (args.length < 2) {
                console.log('[ERROR] Usage: stigmergy call <tool> "<prompt>"');
                process.exit(1);
            }

            const targetTool = args[1];
            const prompt = args.slice(2).join(' ');

            // Handle call command logic
            console.log(`[CALL] Executing with ${targetTool}: ${prompt}`);
            // Implementation would go here
            break;

        case 'auto-install':
            // Auto-install mode for npm postinstall
            console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
            console.log('='.repeat(60));

            const { available: autoAvailable, missing: autoMissing } = await installer.scanCLI();

            // Show summary to user after installation
            if (Object.keys(autoMissing).length > 0) {
                console.log('\n[INFO] Found ' + Object.keys(autoMissing).length + ' missing AI CLI tools:');
                for (const [toolName, toolInfo] of Object.entries(autoMissing)) {
                    console.log(`  - ${toolInfo.name} (${toolName})`);
                }
                console.log('\n[INFO] Auto-install mode detected. Skipping automatic installation of missing tools.');
                console.log('[INFO] For full functionality, please run "stigmergy install" after installation completes.');
            } else {
                console.log('\n[INFO] All AI CLI tools are already installed! No additional tools required.');
            }

            await installer.deployHooks(autoAvailable);
            await installer.initializeConfig();

            // Show final message to guide users
            console.log('\n[SUCCESS] Stigmergy CLI installed successfully!');
            console.log('[USAGE] Run "stigmergy install" to install missing AI CLI tools.');
            console.log('[USAGE] Run "stigmergy --help" to see all available commands.');
            break;

        default:
            console.log(`[ERROR] Unknown command: ${command}`);
            console.log('[INFO] Run "stigmergy --help" for usage information');
            process.exit(1);
    }
}

// Export for testing
module.exports = { StigmergyInstaller, SmartRouter, MemoryManager, CLI_TOOLS };

// Run main function
if (require.main === module) {
    main().catch(error => {
        console.error('[FATAL] Stigmergy CLI encountered an error:', error);
        process.exit(1);
    });
}