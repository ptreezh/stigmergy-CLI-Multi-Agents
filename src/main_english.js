#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
 * International Version - Pure English & ANSI Only
 * Version: 1.0.94
 */

console.log('[DEBUG] Stigmergy CLI script started...');

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const yaml = require('js-yaml');

// Import our custom modules
const SmartRouter = require('./core/smart_router');
const CLIHelpAnalyzer = require('./core/cli_help_analyzer');
const { CLI_TOOLS } = require('./core/cli_tools');

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
        ];

        for (const check of checks) {
            try {
                const result = spawnSync(toolName, check.args, {
                    encoding: 'utf8',
                    timeout: 5000,
                    shell: true
                });

                // Check if command executed successfully or at least didn't fail with "command not found"
                if (result.status === check.expected || 
                    (result.status !== 127 && result.status !== 9009)) { // 127 = command not found on Unix, 9009 = command not found on Windows
                    return true;
                }
            } catch (error) {
                // Continue to next check method
                continue;
            }
        }

        return false;
    }

    async scanCLI() {
        console.log('[SCAN] Scanning for AI CLI tools...');
        const available = {};
        const missing = {};

        for (const [toolName, toolInfo] of Object.entries(this.router.tools)) {
            try {
                console.log(`[SCAN] Checking ${toolInfo.name}...`);
                const isAvailable = await this.checkCLI(toolName);
                
                if (isAvailable) {
                    console.log(`[OK] ${toolInfo.name} is available`);
                    available[toolName] = toolInfo;
                } else {
                    console.log(`[MISSING] ${toolInfo.name} is not installed`);
                    missing[toolName] = toolInfo;
                }
            } catch (error) {
                console.log(`[ERROR] Failed to check ${toolInfo.name}: ${error.message}`);
                missing[toolName] = toolInfo;
            }
        }

        return { available, missing };
    }

    async installTools(selectedTools, missingTools) {
        console.log(`\n[INSTALL] Installing ${selectedTools.length} AI CLI tools...`);

        for (const toolName of selectedTools) {
            const toolInfo = missingTools[toolName];
            if (!toolInfo) {
                console.log(`[SKIP] Tool ${toolName} not found in missing tools list`);
                continue;
            }

            try {
                console.log(`\n[INSTALL] Installing ${toolInfo.name}...`);
                console.log(`[CMD] ${toolInfo.install}`);

                const result = spawnSync(toolInfo.install, {
                    shell: true,
                    stdio: 'inherit'
                });

                if (result.status === 0) {
                    console.log(`[OK] ${toolInfo.name} installed successfully`);
                } else {
                    console.log(`[ERROR] Failed to install ${toolInfo.name} (exit code: ${result.status})`);
                    if (result.error) {
                        console.log(`[ERROR] Installation error: ${result.error.message}`);
                    }
                    console.log(`[INFO] Please run manually: ${toolInfo.install}`);
                }
            } catch (error) {
                console.log(`[ERROR] Failed to install ${toolInfo.name}: ${error.message}`);
                console.log(`[INFO] Please run manually: ${toolInfo.install}`);
            }
        }

        return true;
    }

    async downloadRequiredAssets() {
        console.log('\n[DOWNLOAD] Downloading required assets and plugins...');
        
        // SAFETY CHECK: Verify no conflicting packages exist
        await this.safetyCheck();
        
        try {
            // Create local assets directory
            const assetsDir = path.join(os.homedir(), '.stigmergy', 'assets');
            await fs.mkdir(assetsDir, { recursive: true });
            
            // Copy template files from package
            const packageTemplatesDir = path.join(__dirname, '..', 'templates', 'project-docs');
            const localTemplatesDir = path.join(assetsDir, 'templates');
            
            if (await this.fileExists(packageTemplatesDir)) {
                await fs.mkdir(localTemplatesDir, { recursive: true });
                
                // Copy all template files
                const templateFiles = await fs.readdir(packageTemplatesDir);
                for (const file of templateFiles) {
                    const srcPath = path.join(packageTemplatesDir, file);
                    const dstPath = path.join(localTemplatesDir, file);
                    await fs.copyFile(srcPath, dstPath);
                    console.log(`[OK] Copied template: ${file}`);
                }
            }
            
            // Download/copy CLI adapters
            const adaptersDir = path.join(__dirname, '..', 'src', 'adapters');
            const localAdaptersDir = path.join(assetsDir, 'adapters');
            
            if (await this.fileExists(adaptersDir)) {
                await fs.mkdir(localAdaptersDir, { recursive: true });
                
                // Copy all adapter directories
                const adapterDirs = await fs.readdir(adaptersDir);
                for (const dir of adapterDirs) {
                    // Skip non-directory items
                    const dirPath = path.join(adaptersDir, dir);
                    const stat = await fs.stat(dirPath);
                    if (!stat.isDirectory()) continue;
                    
                    // Skip __pycache__ directories
                    if (dir === '__pycache__') continue;
                    
                    const dstPath = path.join(localAdaptersDir, dir);
                    await this.copyDirectory(dirPath, dstPath);
                    console.log(`[OK] Copied adapter: ${dir}`);
                }
            }
            
            console.log('[OK] All required assets downloaded successfully');
            return true;
            
        } catch (error) {
            console.log(`[ERROR] Failed to download required assets: ${error.message}`);
            return false;
        }
    }

    async safetyCheck() {
        console.log('\n[SAFETY] Performing safety check for conflicting packages...');
        
        // List of potentially conflicting packages
        const conflictingPackages = [
            '@aws-amplify/cli',
            'firebase-tools',
            'heroku',
            'netlify-cli',
            'vercel',
            'surge',
            'now'
        ];
        
        // Check for globally installed conflicting packages
        try {
            const result = spawnSync('npm', ['list', '-g', '--depth=0'], {
                encoding: 'utf8',
                timeout: 10000
            });
            
            if (result.status === 0) {
                const installedPackages = result.stdout;
                const conflicts = [];
                
                for (const pkg of conflictingPackages) {
                    if (installedPackages.includes(pkg)) {
                        conflicts.push(pkg);
                    }
                }
                
                if (conflicts.length > 0) {
                    console.log(`[WARN] Potential conflicting packages detected: ${conflicts.join(', ')}`);
                    console.log('[INFO] These packages may interfere with Stigmergy CLI functionality');
                } else {
                    console.log('[OK] No conflicting packages detected');
                }
            }
        } catch (error) {
            console.log(`[WARN] Unable to perform safety check: ${error.message}`);
        }
    }

    async copyDirectory(src, dest) {
        try {
            await fs.mkdir(dest, { recursive: true });
            const entries = await fs.readdir(src, { withFileTypes: true });

            for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);

                if (entry.isDirectory()) {
                    // Skip __pycache__ directories
                    if (entry.name === '__pycache__') continue;
                    await this.copyDirectory(srcPath, destPath);
                } else {
                    await fs.copyFile(srcPath, destPath);
                }
            }
        } catch (error) {
            console.log(`[WARN] Failed to copy directory ${src} to ${dest}: ${error.message}`);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async showInstallOptions(missingTools) {
        if (Object.keys(missingTools).length === 0) {
            console.log('[INFO] All required AI CLI tools are already installed!');
            return [];
        }

        console.log('\n[INSTALL] Missing AI CLI tools detected:');
        const choices = [];

        for (const [toolName, toolInfo] of Object.entries(missingTools)) {
            choices.push({
                name: `${toolInfo.name} (${toolName}) - ${toolInfo.install}`,
                value: toolName,
                checked: true
            });
        }

        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'tools',
                message: 'Select which tools to install (Space to select, Enter to confirm):',
                choices: choices,
                pageSize: 10
            }
        ]);

        return answers.tools;
    }

    async getUserSelection(options, missingTools) {
        if (options.length === 0) {
            return [];
        }

        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: `Install ${options.length} missing AI CLI tools?`,
                default: true
            }
        ]);

        if (answers.proceed) {
            return options;
        }

        // If user doesn't want to install all, let them choose individually
        const individualChoices = options.map(toolName => ({
            name: missingTools[toolName].name,
            value: toolName,
            checked: true
        }));

        const individualAnswers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'selectedTools',
                message: 'Select which tools to install:',
                choices: individualChoices,
                pageSize: 10
            }
        ]);

        return individualAnswers.selectedTools;
    }

    async deployHooks(available) {
        console.log('\n[DEPLOY] Deploying cross-CLI integration hooks...');

        // Import the post-deployment configurer for executing installation scripts
        const { PostDeploymentConfigurer } = require('./../scripts/post-deployment-config.js');
        const configurer = new PostDeploymentConfigurer();

        let successCount = 0;
        let totalCount = Object.keys(available).length;

        for (const [toolName, toolInfo] of Object.entries(available)) {
            console.log(`\n[DEPLOY] Deploying hooks for ${toolInfo.name}...`);

            try {
                await fs.mkdir(toolInfo.hooksDir, { recursive: true });

                // Create config directory (not the config file itself)
                const configDir = path.dirname(toolInfo.config);
                await fs.mkdir(configDir, { recursive: true });

                // Copy adapter files from local assets
                // Mapping for tool names that don't match their adapter directory names
                const toolNameToAdapterDir = {
                    'qodercli': 'qoder',
                    'qwencode': 'qwen'
                };
                const adapterDirName = toolNameToAdapterDir[toolName] || toolName;
                const assetsAdaptersDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters', adapterDirName);
                if (await this.fileExists(assetsAdaptersDir)) {
                    await this.copyDirectory(assetsAdaptersDir, toolInfo.hooksDir);
                    console.log(`[OK] Copied adapter files for ${toolInfo.name}`);
                }

                // Execute post-deployment configuration
                try {
                    await configurer.configure(toolName, toolInfo);
                    console.log(`[OK] Post-deployment configuration completed for ${toolInfo.name}`);
                    successCount++;
                } catch (configError) {
                    console.log(`[WARN] Post-deployment configuration failed for ${toolInfo.name}: ${configError.message}`);
                    // Continue with other tools even if one fails
                }

            } catch (error) {
                console.log(`[ERROR] Failed to deploy hooks for ${toolInfo.name}: ${error.message}`);
                console.log('[INFO] Continuing with other tools...');
            }
        }

        console.log(`\n[SUMMARY] Hook deployment completed: ${successCount}/${totalCount} tools successful`);
    }

    async deployProjectDocumentation() {
        console.log('\n[DEPLOY] Deploying project documentation...');

        try {
            // Create standard project documentation files
            const docs = {
                'STIGMERGY.md': this.generateProjectMemoryTemplate(),
                'README.md': this.generateProjectReadme()
            };

            for (const [filename, content] of Object.entries(docs)) {
                const filepath = path.join(process.cwd(), filename);
                if (!(await this.fileExists(filepath))) {
                    await fs.writeFile(filepath, content);
                    console.log(`[OK] Created ${filename}`);
                }
            }

            console.log('[OK] Project documentation deployed successfully');
        } catch (error) {
            console.log(`[ERROR] Failed to deploy project documentation: ${error.message}`);
        }
    }

    generateProjectMemoryTemplate() {
        return `# Stigmergy Project Memory

## Project Information
- **Project Name**: ${path.basename(process.cwd())}
- **Created**: ${new Date().toISOString()}
- **Stigmergy Version**: 1.0.94

## Usage Instructions
This file automatically tracks all interactions with AI CLI tools through the Stigmergy system.

## Recent Interactions
No interactions recorded yet.

## Collaboration History
No collaboration history yet.

---
*This file is automatically managed by Stigmergy CLI*
*Last updated: ${new Date().toISOString()}*
`;
    }

    generateProjectReadme() {
        return `# ${path.basename(process.cwd())}

This project uses Stigmergy CLI for AI-assisted development.

## Getting Started
1. Install Stigmergy CLI: \`npm install -g stigmergy\`
2. Run \`stigmergy setup\` to configure the environment
3. Use \`stigmergy call "<your prompt>"\` to interact with AI tools

## Available AI Tools
- Claude (Anthropic)
- Qwen (Alibaba)
- Gemini (Google)
- And others configured in your environment

## Project Memory
See [STIGMERGY.md](STIGMERGY.md) for interaction history and collaboration records.

---
*Generated by Stigmergy CLI*
`;
    }

    async initializeConfig() {
        console.log('\n[CONFIG] Initializing Stigmergy configuration...');

        try {
            // Create config directory
            const configDir = path.join(os.homedir(), '.stigmergy');
            await fs.mkdir(configDir, { recursive: true });

            // Create initial configuration
            const config = {
                version: '1.0.94',
                initialized: true,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                defaultCLI: 'claude',
                enableCrossCLI: true,
                enableMemory: true,
                tools: {}
            };

            // Save configuration
            const configPath = path.join(configDir, 'config.json');
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log('[OK] Configuration initialized successfully');
        } catch (error) {
            console.log(`[ERROR] Failed to initialize configuration: ${error.message}`);
        }
    }

    showUsageInstructions() {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Stigmergy CLI Setup Complete!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Next steps:');
        console.log('  1. Run "stigmergy install" to scan and install AI CLI tools');
        console.log('  2. Run "stigmergy deploy" to set up cross-CLI integration');
        console.log('  3. Use "stigmergy call \\"<your prompt>\\"" to start collaborating');
        console.log('');
        console.log('Example usage:');
        console.log('  stigmergy call "用claude分析项目架构"');
        console.log('  stigmergy call "用qwen写一个hello world程序"');
        console.log('  stigmergy call "用gemini设计数据库表结构"');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        console.log('[END] Happy collaborating with multiple AI CLI tools!');
    }
}

// Main CLI functionality
async function main() {
    console.log('[DEBUG] Main function called with args:', process.argv);
    const args = process.argv.slice(2);
    const installer = new StigmergyInstaller();
    
    // Handle case when no arguments are provided
    if (args.length === 0) {
        console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
        console.log('Version: 1.0.94');
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
        console.log('  deploy          Deploy hooks and integration to installed tools');
        console.log('  setup           Complete setup and configuration');
        console.log('  call "<prompt>" Execute prompt with auto-routed AI CLI');
        console.log('');
        console.log('[WORKFLOW] Automated Workflow:');
        console.log('  1. npm install -g stigmergy        # Install Stigmergy');
        console.log('  2. stigmergy install             # Auto-scan & install CLI tools');
        console.log('  3. stigmergy setup               # Deploy hooks & config');
        console.log('  4. stigmergy call "<prompt>"   # Start collaborating');
        console.log('');
        console.log('[INFO] For first-time setup, run: stigmergy setup');
        console.log('[INFO] To scan and install AI tools, run: stigmergy install');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        return;
    }
    
    // Handle help commands
    if (args.includes('--help') || args.includes('-h')) {
        console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
        console.log('Version: 1.0.94');
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
        console.log('  deploy          Deploy hooks and integration to installed tools');
        console.log('  setup           Complete setup and configuration');
        console.log('  call "<prompt>" Execute prompt with auto-routed AI CLI');
        console.log('');
        console.log('[WORKFLOW] Automated Workflow:');
        console.log('  1. npm install -g stigmergy        # Install Stigmergy');
        console.log('  2. stigmergy install             # Auto-scan & install CLI tools');
        console.log('  3. stigmergy setup               # Deploy hooks & config');
        console.log('  4. stigmergy call "<prompt>"   # Start collaborating');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        return;
    }
    
    const command = args[0];
    switch (command) {
        case 'version':
        case '--version':
            // Use the version from configuration instead of hardcoding
            const config = {
                version: '1.0.94',
                initialized: true,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                defaultCLI: 'claude',
                enableCrossCLI: true,
                enableMemory: true
            };
            console.log(`Stigmergy CLI v${config.version}`);
            break;

        case 'status':
            const { available, missing } = await installer.scanCLI();
            console.log('\n[STATUS] AI CLI Tools Status Report');
            console.log('=====================================');
            
            if (Object.keys(available).length > 0) {
                console.log('\n✅ Available Tools:');
                for (const [toolName, toolInfo] of Object.entries(available)) {
                    console.log(`  - ${toolInfo.name} (${toolName})`);
                }
            }
            
            if (Object.keys(missing).length > 0) {
                console.log('\n❌ Missing Tools:');
                for (const [toolName, toolInfo] of Object.entries(missing)) {
                    console.log(`  - ${toolInfo.name} (${toolName})`);
                    console.log(`    Install command: ${toolInfo.install}`);
                }
            }
            
            console.log(`\n[SUMMARY] ${Object.keys(available).length} available, ${Object.keys(missing).length} missing`);
            break;

        case 'scan':
            await installer.scanCLI();
            break;

        case 'install':
            console.log('[INSTALL] Starting AI CLI tools installation...');
            const { missing: missingTools } = await installer.scanCLI();
            const options = await installer.showInstallOptions(missingTools);
            
            if (options.length > 0) {
                const selectedTools = await installer.getUserSelection(options, missingTools);
                if (selectedTools.length > 0) {
                    console.log('\n[INFO] Installing selected tools (this may take several minutes for tools that download binaries)...');
                    await installer.installTools(selectedTools, missingTools);
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

            // Step 1: Download required assets
            await installer.downloadRequiredAssets();

            // Step 2: Scan for CLI tools
            const { available: setupAvailable, missing: setupMissing } = await installer.scanCLI();
            const setupOptions = await installer.showInstallOptions(setupMissing);

            // Step 3: Install missing CLI tools if user chooses
            if (setupOptions.length > 0) {
                const selectedTools = await installer.getUserSelection(setupOptions, setupMissing);
                if (selectedTools.length > 0) {
                    console.log('\n[INFO] Installing selected tools (this may take several minutes for tools that download binaries)...');
                    await installer.installTools(selectedTools, setupMissing);
                }
            } else {
                console.log('\n[INFO] All required tools are already installed!');
            }

            // Step 4: Deploy hooks to available CLI tools
            await installer.deployHooks(setupAvailable);

            // Step 5: Deploy project documentation
            await installer.deployProjectDocumentation();

            // Step 6: Initialize configuration
            await installer.initializeConfig();

            // Step 7: Show usage instructions
            installer.showUsageInstructions();
            break;

        case 'call':
            if (args.length < 2) {
                console.log('[ERROR] Usage: stigmergy call "<prompt>"');
                process.exit(1);
            }
            
            // Get the prompt (everything after the command)
            const prompt = args.slice(1).join(' ');
            
            // Use smart router to determine which tool to use
            const router = new SmartRouter();
            const route = router.smartRoute(prompt);
            
            console.log(`[CALL] Routing to ${route.tool}: ${route.prompt}`);
            
            // Execute the routed command
            try {
                const toolPath = route.tool;
                const child = spawn(toolPath, [route.prompt], { stdio: 'inherit', shell: true });
                
                child.on('close', (code) => {
                    if (code !== 0) {
                        console.log(`[WARN] ${route.tool} exited with code ${code}`);
                    }
                    process.exit(code);
                });
                
                child.on('error', (error) => {
                    console.log(`[ERROR] Failed to execute ${route.tool}:`, error.message);
                    process.exit(1);
                });
            } catch (error) {
                console.log(`[ERROR] Failed to execute ${route.tool}:`, error.message);
                process.exit(1);
            }
            break;

        case 'auto-install':
            // Auto-install mode for npm postinstall - NON-INTERACTIVE
            console.log('[AUTO-INSTALL] Stigmergy CLI automated setup');
            console.log('='.repeat(60));

            try {
                // Step 1: Download required assets
                try {
                    console.log('[STEP] Downloading required assets...');
                    await installer.downloadRequiredAssets();
                    console.log('[OK] Assets downloaded successfully');
                } catch (error) {
                    console.log(`[WARN] Failed to download assets: ${error.message}`);
                    console.log('[INFO] Continuing with installation...');
                }

                // Step 2: Scan for CLI tools
                let autoAvailable = {}, autoMissing = {};
                try {
                    console.log('[STEP] Scanning for CLI tools...');
                    const scanResult = await installer.scanCLI();
                    autoAvailable = scanResult.available;
                    autoMissing = scanResult.missing;
                    console.log('[OK] CLI tools scanned successfully');
                } catch (error) {
                    console.log(`[WARN] Failed to scan CLI tools: ${error.message}`);
                    console.log('[INFO] Continuing with installation...');
                }

                // Step 3: Show summary to user after installation
                try {
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
                } catch (error) {
                    console.log(`[WARN] Failed to show tool summary: ${error.message}`);
                }

                // Step 4: Deploy hooks to available CLI tools
                try {
                    console.log('[STEP] Deploying hooks to available CLI tools...');
                    await installer.deployHooks(autoAvailable);
                    console.log('[OK] Hooks deployed successfully');
                } catch (error) {
                    console.log(`[ERROR] Failed to deploy hooks: ${error.message}`);
                    console.log('[INFO] You can manually deploy hooks later by running: stigmergy deploy');
                }

                // Step 5: Deploy project documentation
                try {
                    console.log('[STEP] Deploying project documentation...');
                    await installer.deployProjectDocumentation();
                    console.log('[OK] Documentation deployed successfully');
                } catch (error) {
                    console.log(`[WARN] Failed to deploy documentation: ${error.message}`);
                    console.log('[INFO] Continuing with installation...');
                }

                // Step 6: Initialize configuration
                try {
                    console.log('[STEP] Initializing configuration...');
                    await installer.initializeConfig();
                    console.log('[OK] Configuration initialized successfully');
                } catch (error) {
                    console.log(`[ERROR] Failed to initialize configuration: ${error.message}`);
                    console.log('[INFO] You can manually initialize configuration later by running: stigmergy setup');
                }

                // Step 7: Show final message to guide users
                console.log('\n[SUCCESS] Stigmergy CLI installed successfully!');
                console.log('[USAGE] Run "stigmergy setup" to complete full configuration and install missing AI CLI tools.');
                console.log('[USAGE] Run "stigmergy install" to install only missing AI CLI tools.');
                console.log('[USAGE] Run "stigmergy --help" to see all available commands.');
            } catch (fatalError) {
                console.error('[FATAL] Auto-install process failed:', fatalError.message);
                console.log('\n[TROUBLESHOOTING] To manually complete installation:');
                console.log('1. Run: stigmergy setup    # Complete setup');
                console.log('2. Run: stigmergy install  # Install missing tools');
                console.log('3. Run: stigmergy deploy   # Deploy hooks manually');
                process.exit(1);
            }
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