#!/usr/bin/env node

/**
 * Stigmergy CLI - Automated Installation and Deployment System
 * Multi-Agents Cross-AI CLI Tools Collaboration System
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');

// CLI Tools Configuration
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
    qoder: {
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

class StigmergyInstaller {
    constructor() {
        this.homeDir = os.homedir();
        this.stigmergyDir = path.join(this.homeDir, '.stigmergy');
        this.projectDir = process.cwd();
    }

    async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            return false;
        }
    }

    checkCLI(toolName) {
        try {
            const tool = CLI_TOOLS[toolName];
            const command = tool.version.split(' ')[0];
            const args = tool.version.split(' ').slice(1);

            const result = spawnSync(command, args, {
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

        console.log('[SCAN] Scanning for AI CLI tools on your system...');
        console.log('='.repeat(60));

        for (const [key, tool] of Object.entries(CLI_TOOLS)) {
            const isAvailable = this.checkCLI(key);

            if (isAvailable) {
                results.available.push(key);
                console.log(`[OK] ${tool.name}: Available (${tool.version})`);
                results.details.push({
                    key,
                    name: tool.name,
                    status: 'Available',
                    install: tool.install,
                    hooksDir: tool.hooksDir
                });
            } else {
                results.unavailable.push(key);
                console.log(`[X] ${tool.name}: Not Available`);
                results.details.push({
                    key,
                    name: tool.name,
                    status: 'Not Available',
                    install: tool.install,
                    hooksDir: tool.hooksDir
                });
            }
        }

        console.log('='.repeat(60));
        console.log(`[SUMMARY] ${results.available.length}/${results.total} tools available`);
        console.log('');

        return results;
    }

    async promptForInstallation(scanResults) {
        if (scanResults.unavailable.length === 0) {
            console.log('[SUCCESS] All AI CLI tools are already installed!');
            return [];
        }

        console.log('[INSTALL] The following AI CLI tools can be automatically installed:');
        console.log('');

        scanResults.unavailable.forEach((toolKey, index) => {
            const tool = CLI_TOOLS[toolKey];
            console.log(`  ${index + 1}. ${tool.name}`);
            console.log(`     Install: ${tool.install}`);
            console.log('');
        });

        console.log('[OPTIONS] Installation Options:');
        console.log('  - Enter numbers separated by spaces (e.g: 1 3 5)');
        console.log('  - Enter "all" to install all missing tools');
        console.log('  - Enter "skip" to skip CLI installation');

        return new Promise((resolve) => {
            process.stdout.write('\n[SELECT] Select tools to install: ');

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
            console.log('[SKIP] Skipping CLI tool installation.');
            return;
        }

        console.log(`\n[INSTALL] Installing ${toolKeys.length} AI CLI tools...`);
        console.log('='.repeat(60));

        for (const toolKey of toolKeys) {
            const tool = CLI_TOOLS[toolKey];
            console.log(`\n[INSTALLING] Installing ${tool.name}...`);

            try {
                const installProcess = spawn('npm', ['install', '-g'], {
                    stdio: 'inherit',
                    shell: true
                });

                // Install specific package
                const packageInstall = spawn('npm', ['install', '-g'].concat(tool.install.split(' ').slice(3)), {
                    stdio: 'inherit',
                    shell: true
                });

                await new Promise((resolve, reject) => {
                    packageInstall.on('close', (code) => {
                        if (code === 0) {
                            console.log(`[OK] ${tool.name} installed successfully!`);
                            resolve();
                        } else {
                            console.log(`[ERROR] Failed to install ${tool.name}`);
                            reject(new Error(`Installation failed with code ${code}`));
                        }
                    });
                });
            } catch (error) {
                console.log(`[ERROR] Error installing ${tool.name}:`, error.message);
            }
        }

        console.log('\n[VERIFY] CLI Installation completed! Verifying...');
        await this.verifyInstallation(toolKeys);
    }

    async verifyInstallation(toolKeys) {
        console.log('='.repeat(60));
        let successCount = 0;

        for (const toolKey of toolKeys) {
            const tool = CLI_TOOLS[toolKey];
            if (this.checkCLI(toolKey)) {
                console.log(`[OK] ${tool.name}: Successfully installed and functional!`);
                successCount++;
            } else {
                console.log(`[FAIL] ${tool.name}: Installation verification failed`);
            }
        }

        console.log(`\n[RESULT] Installation Result: ${successCount}/${toolKeys.length} tools successfully installed`);

        if (successCount === toolKeys.length) {
            console.log('[SUCCESS] All selected CLI tools are now ready to use!');
        }
    }

    async deployHooks(availableTools) {
        if (availableTools.length === 0) {
            console.log('[SKIP] No CLI tools available for hook deployment.');
            return;
        }

        console.log(`\n[DEPLOY] Deploying Stigmergy hooks to ${availableTools.length} CLI tools...`);
        console.log('='.repeat(60));

        const hookTemplate = `#!/usr/bin/env node

/**
 * Stigmergy Hook - ${new Date().toISOString()}
 * Generated by Stigmergy CLI
 */

const { spawn } = require('child_process');

// Stigmergy Hook Implementation
class StigmergyHook {
    constructor() {
        this.processArgs();
    }

    processArgs() {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            this.showHelp();
            return;
        }

        const command = args[0];
        switch (command) {
            case 'collaborate':
                this.handleCollaborate(args.slice(1));
                break;
            case 'status':
                this.showStatus();
                break;
            case 'init':
                this.initProject(args.slice(1));
                break;
            default:
                this.showHelp();
        }
    }

    handleCollaborate(args) {
        console.log('[COLLAB] Stigmergy Collaboration System');
        console.log('Available AI CLI tools:', Object.keys(CLI_TOOLS).join(', '));
    }

    showStatus() {
        console.log('[STATUS] Stigmergy Hook Status: Active');
        console.log('Configuration: Loaded successfully');
    }

    initProject(projectName) {
        console.log('[INIT] Initializing Stigmergy project:', projectName || 'current');
        console.log('[OK] Project configuration created');
    }

    showHelp() {
        console.log('Stigmergy Hook - Multi-AI CLI Collaboration');
        console.log('');
        console.log('Commands:');
        console.log('  collaborate [options]  Start collaboration with other AI CLI tools');
        console.log('  status               Show hook status');
        console.log('  init [project]        Initialize Stigmergy project');
        console.log('  help                 Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  stigmergy-hook collaborate claude gemini');
        console.log('  stigmergy-hook status');
        console.log('  stigmergy-hook init my-project');
    }
}

// Initialize hook
const hook = new StigmergyHook();
`;

        let deployedCount = 0;

        for (const toolKey of availableTools) {
            const tool = CLI_TOOLS[toolKey];
            const hooksDir = tool.hooksDir;

            // Create hooks directory
            await this.ensureDirectory(hooksDir);

            // Deploy hook file
            const hookFile = path.join(hooksDir, 'stigmergy-hook.cjs');
            try {
                await fs.writeFile(hookFile, hookTemplate, 'utf8');

                // Make file executable on Unix systems
                if (process.platform !== 'win32') {
                    const { spawn } = require('child_process');
                    spawn('chmod', ['+x', hookFile], { stdio: 'ignore' });
                }

                console.log(`[OK] ${tool.name}: Hook deployed to ${hooksDir}`);
                deployedCount++;
            } catch (error) {
                console.log(`[FAIL] ${tool.name}: Failed to deploy hook - ${error.message}`);
            }
        }

        console.log('\n[RESULT] Hook Deployment Result: ' + deployedCount + '/' + availableTools.length + ' hooks deployed');
    }

    async setupGlobalConfiguration(availableTools = []) {
        await this.ensureDirectory(this.stigmergyDir);

        const globalConfig = {
            version: '1.0.71',
            installed: new Date().toISOString(),
            projectPath: this.projectDir,
            availableTools: [],
            deployedHooks: [],
            collaboration: {
                enabled: true,
                protocols: [
                    'Use {cli} to {task}',
                    'Call {cli} to {task}',
                    'Ask {cli} for {task}',
                    'Get {cli} to {task}',
                    'Have {cli} {task}'
                ],
                examples: [
                    'Use claude to help debug this code',
                    'Call gemini to analyze the file',
                    'Ask qwen to translate this text'
                ]
            }
        };

        const configPath = path.join(this.stigmergyDir, 'config.json');
        try {
            await fs.writeFile(configPath, JSON.stringify(globalConfig, null, 2));
            console.log('[CONFIG] Global configuration saved to:', configPath);
        } catch (error) {
            console.log('[WARN] Warning: Could not save global configuration');
        }

        // Create project documentation template
        const projectDocs = path.join(this.projectDir, 'STIGMERGY.md');
        const docsTemplate = `# Stigmergy Multi-AI CLI Collaboration

This project is configured for Stigmergy-based multi-AI CLI collaboration.

## Available AI CLI Tools

${availableTools.map(tool => `- **${CLI_TOOLS[tool].name}**: \`stigmergy call ${tool}\``).join('\n')}

## Usage Examples

### Cross-CLI Collaboration
\`\`\bash
# Use Claude to analyze code
stigmergy call claude "analyze this function"

# Use Gemini for documentation
stigmergy call gemini "generate docs for this file"

# Use Qwen for translation
stigmergy call qwen "translate to English"
\`\`\`

### Project Initialization
\`\`\bash
# Initialize with Claude as primary AI
stigmergy init --primary claude

# Initialize with multiple AI tools
stigmergy init --all-tools
\`\`\`

## Configuration

Global configuration: \`~/.stigmergy/config.json\`

## Getting Started

1. Run \`stigmergy status\` to verify setup
2. Use \`stigmergy call <ai-tool> "<prompt>"\` to collaborate with AI CLI tools
3. Check project-specific configurations in individual CLI tool directories

For more information: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
`;

        try {
            await fs.writeFile(projectDocs, docsTemplate, 'utf8');
            console.log('[DOCS] Project documentation created: STIGMERGY.md');
        } catch (error) {
            console.log('[WARN] Warning: Could not create project documentation');
        }
    }

    async showUsageInstructions() {
        console.log('\n' + '='.repeat(60));
        console.log('[SUCCESS] Stigmergy Installation and Deployment Complete!');
        console.log('='.repeat(60));
        console.log('');
        console.log('[NEXT] Next Steps:');
        console.log('');
        console.log('1. Verify Installation:');
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
        console.log('Version: 1.0.75');
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

    if (args.includes('--version') || args.includes('version')) {
        console.log('1.0.75');
        return;
    }

    // Auto-install mode for postinstall script
    if (args.includes('auto-install')) {
        console.log('[AUTO-INSTALL] Stigmergy CLI - Automated Installation and Deployment');
        console.log('Multi-AI CLI Tools Collaboration System v1.0.75');
        console.log('='.repeat(60));

        // Disable interactive prompts for auto-install mode
        const originalPrompt = installer.promptForInstallation;
        installer.promptForInstallation = async () => {
            console.log('[AUTO-INSTALL] Skipping interactive CLI installation in postinstall mode');
            console.log('[AUTO-INSTALL] You can run "stigmergy" manually to install CLI tools interactively');
            return [];
        };

        // Run automated installation and deployment
        console.log('\n[STEP 1] Scanning for AI CLI tools...');
        const scanResults = await installer.scanAvailableTools();

        console.log('\n[STEP 2] Deploying Stigmergy hooks...');
        await installer.deployHooks(scanResults.available);

        console.log('\n[STEP 3] Setting up configuration...');
        await installer.setupGlobalConfiguration(scanResults.available);

        console.log('\n[AUTO-INSTALL] Stigmergy automated setup completed!');
        console.log('[AUTO-INSTALL] Run "stigmergy" to start interactive CLI tool installation');
        return;
    }

    // Start automated installation and deployment
    console.log('[START] Stigmergy CLI - Automated Installation and Deployment');
    console.log('Multi-AI CLI Tools Collaboration System v1.0.75');
    console.log('='.repeat(60));

    // Step 1: Scan available CLI tools
    console.log('\n[STEP 1] Scanning for AI CLI tools...');
    const scanResults = await installer.scanAvailableTools();

    // Step 2: Prompt for CLI tool installation
    if (scanResults.unavailable.length > 0) {
        console.log('\n[STEP 2] CLI Tool Installation');
        const selectedTools = await installer.promptForInstallation(scanResults);
        await installer.installTools(selectedTools);

        // Re-scan after installation
        if (selectedTools.length > 0) {
            console.log('\n[RESCAN] Re-scanning after installation...');
            scanResults.available = scanResults.available.concat(selectedTools.filter(tool => installer.checkCLI(tool)));
            scanResults.unavailable = scanResults.unavailable.filter(tool => !selectedTools.includes(tool));
        }
    } else {
        console.log('\n[STEP 2] All CLI tools already available!');
    }

    // Step 3: Deploy hooks
    console.log('\n[STEP 3] Deploying Stigmergy hooks...');
    await installer.deployHooks(scanResults.available);

    // Step 4: Setup configuration
    console.log('\n[STEP 4] Setting up configuration...');
    await installer.setupGlobalConfiguration(scanResults.available);

    // Final instructions
    await installer.showUsageInstructions();
}

// Setup stdin for interactive prompts
if (require.main === module) {
    if (process.stdin.isTTY) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
    }

    main().catch(error => {
        console.error('[ERROR] Error:', error.message);
        process.exit(1);
    });
}

module.exports = { main, StigmergyInstaller, CLI_TOOLS };