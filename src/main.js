#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents NPX Deployment Manager
 * Supports one-click deployment to various AI CLI tools, achieving true Stigmergy collaboration
 */
import { spawn, spawnSync } from 'child_process';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG = {
    repo: 'https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git',
    localConfig: join(homedir(), '.stigmergy'),
    templatesDir: join(__dirname, 'templates'),
    adaptersDir: join(__dirname, 'adapters')
};

class StigmergyCLIRouter {
    constructor() {
        this.config = CONFIG;
        this.adapters = new Map();
        this.isInstalling = false;
    }

    async loadAdapter(adapterName) {
        // Adapter name mapping - Maps user-visible names to actual directory names
        const adapterDirName = this.mapAdapterName(adapterName);

        // Try multiple possible paths
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // Search from current file directory
            join(dirname(__dirname), 'adapters'),  // Search from parent directory of current directory
        ];

        for (const basePath of possibleBasePaths) {
            try {
                const configPath = join(basePath, adapterDirName, 'config.json');
                const configData = await fs.readFile(configPath, 'utf8');
                const config = JSON.parse(configData);
                // Successfully found configuration, return
                return { ...config, loaded: true };
            } catch (error) {
                // Continue trying next path
                continue;
            }
        }

        // All paths have been tried but failed
        const lastPathAttempted = join(possibleBasePaths[possibleBasePaths.length - 1], adapterDirName, 'config.json');
        console.error(`❌ Failed to load ${adapterName} adapter configuration: Configuration file not found in any possible path, last attempt: ${lastPathAttempted}`);
        return { loaded: false, error: "Unable to find adapter configuration file" };
    }

    async checkAdapterExists(adapterName) {
        // Adapter name mapping - Maps user-visible names to actual directory names
        const adapterDirName = this.mapAdapterName(adapterName);

        // Use the same path detection logic as loadAdapter
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // Search from current file directory
            join(dirname(__dirname), 'adapters'),  // Search from parent directory of current directory
        ];

        for (const basePath of possibleBasePaths) {
            try {
                const configPath = join(basePath, adapterDirName, 'config.json');
                await fs.access(configPath);
                return true;
            } catch {
                // Continue trying next path
                continue;
            }
        }

        return false;
    }

    // Adapter name mapping method
    mapAdapterName(adapterName) {
        // Map user interface names to actual adapter directory names
        const nameMap = {
            'qwen': 'qwencode'  // qwen internally corresponds to qwencode directory
        };
        return nameMap[adapterName] || adapterName;
    }

    async installAdapter(adapterName, force = false) {
        if (this.isInstalling) {
            console.log('[WARN] Installation in progress, please wait...');
            return;
        }

        this.isInstalling = true;

        try {
            console.log(`🚀 Starting installation of ${adapterName} adapter...`);

            // Check if adapter already exists
            const exists = await this.checkAdapterExists(adapterName);
            if (exists && !force) {
                console.log(`✅ ${adapterName} adapter already exists`);
                this.isInstalling = false;
                return;
            }

            // Load adapter configuration
            const config = await this.loadAdapter(adapterName);
            if (!config.loaded) {
                console.error(`[ERROR] ${adapterName} adapter configuration load failed: ${config.error}`);
                this.isInstalling = false;
                return;
            }

            // Create configuration directory
            const adapterConfigDir = join(this.config.localConfig, adapterName);
            await fs.mkdir(adapterConfigDir, { recursive: true });

            // Use mapped directory name to find source configuration file
            const adapterDirName = this.mapAdapterName(adapterName);
            const adapterConfigFile = join(__dirname, 'src', 'adapters', adapterDirName, 'config.json');
            const targetConfigFile = join(adapterConfigDir, 'config.json');
            await fs.copyFile(adapterConfigFile, targetConfigFile);

            // Create hooks directory
            const hooksDir = join(adapterConfigDir, 'hooks');
            await fs.mkdir(hooksDir, { recursive: true });

            // Copy hooks files
            const adapterHooksDir = join(__dirname, 'src', 'adapters', adapterDirName);
            await this.copyDirectory(adapterHooksDir, hooksDir);

            // Create log directory
            const logsDir = join(adapterConfigDir, 'logs');
            await fs.mkdir(logsDir, { recursive: true });

            console.log(`✅ ${adapterName} adapter installation completed`);

            this.adapters.set(adapterName, config);
            this.isInstalling = false;

        } catch (error) {
            console.error(`[ERROR] ${adapterName} adapter installation failed: ${error.message}`);
        } finally {
            this.isInstalling = false;
        }
    }

    async copyDirectory(src, dest) {
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = join(src, entry);
            const destPath = join(dest, entry);

            const stat = await fs.stat(srcPath);
            if (stat.isDirectory()) {
                await fs.mkdir(destPath, { recursive: true });
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    async copyFile(src, dest) {
        const data = await fs.readFile(src);
        await fs.writeFile(dest, data);
    }

    async directoryExists(dirPath) {
        try {
            const stat = await fs.stat(dirPath);
            return stat.isDirectory();
        } catch (error) {
            return false;
        }
    }

    async deployAll(force = false) {
        console.log('[START] Starting deployment of all adapters...');

        const adapterNames = ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex'];

        for (const adapterName of adapterNames) {
            await this.installAdapter(adapterName, force);
        }

        console.log('[OK] All adapters deployed successfully!');

        // Update global configuration
        await this.updateGlobalConfig();
    }

    async updateGlobalConfig() {
        const globalConfigPath = join(this.config.localConfig, 'global-config.json');

        const adapters = {};
        for (const [name, adapter] of this.adapters) {
            adapters[name] = adapter;
        }

        const globalConfig = {
            adapters,
            lastUpdate: new Date().toISOString(),
            version: '1.0.0'
        };

        await fs.writeFile(globalConfigPath, JSON.stringify(globalConfig, null, 2));
        console.log('[OK] Global configuration updated');
    }

    async initProject(projectPath = process.cwd()) {
        console.log('[START] Initializing Stigmergy CLI project...');

        // Validate and fix path - Ensure not creating project files in system root directory
        let safeProjectPath = projectPath;
        if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
            safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\') || 
            (process.platform !== 'win32' && safeProjectPath === '/')) {
            // If user runs in disk root directory, create a dedicated project directory
            console.log('[WARN] Detected running in root directory, will automatically create project directory for initialization');

            // Create numbered project directory
            let projectDirName = 'ProjStig';
            let counter = 1;
            let targetDir = join(safeProjectPath, projectDirName);

            // Check if directory exists, add number if it does
            while (await directoryExists(targetDir)) {
                targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                counter++;
            }

            // Create project directory
            await fs.mkdir(targetDir, { recursive: true });
            safeProjectPath = targetDir;
            console.log(`[INFO] Project directory created successfully: ${safeProjectPath}`);
        }

        // Create project configuration directory
        const projectConfigDir = join(safeProjectPath, '.stigmergy-project');
        await fs.mkdir(projectConfigDir, { recursive: true });

        // Generate project configuration
        const projectConfig = {
            projectType: 'initialized',
            createdAt: new Date().toISOString(),
            adapters: {}
        };

        // Check available adapters
        const availableAdapters = [];
        for (const adapterName of ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex']) {
            const config = await this.loadAdapter(adapterName);
            if (config.loaded) {
                availableAdapters.push({
                    name: adapterName,
                    version: config.version,
                    integrationType: config.integration_type,
                    status: 'available'
                });
            }
        }

        projectConfig.adapters = availableAdapters;

        // Save project configuration
        const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
        await fs.writeFile(projectConfigPath, JSON.stringify(projectConfig, null, 2));

        console.log(`✅ Stigmergy project initialization completed!`);
        console.log(`📊 Found ${availableAdapters.length} available AI CLI tools:`, availableAdapters.map(a => a.name).join(', '));

        // Generate enhanced MD documentation
        for (const adapter of availableAdapters) {
            // Ensure md file is generated in project directory, not system root
            const mdPath = join(safeProjectPath, `${adapter.name}.md`);
            const config = await this.loadAdapter(adapter.name);

            if (config.loaded) {
                const mdContent = await this.generateEnhancedMarkdown(adapter, projectConfig);
                await fs.writeFile(mdPath, mdContent, 'utf8');
                console.log(`✅ Generated ${adapter.name}.md`);
            }
        }
    }

    async generateEnhancedMarkdown(adapter, projectConfig) {
        const templatePath = join(this.config.templatesDir, 'enhanced-cli-doc.md.j2');

        try {
            const template = await fs.readFile(templatePath, 'utf8');

            // Replace template variables
            let content = template
                .replace(/\{adapterName\}/g, adapter.name)
                .replace(/\{displayName\}/g, adapter.displayName || adapter.name)
                .replace(/\{version\}/g, adapter.version)
                .replace(/\{integrationType\}/g, adapter.integrationType || 'N/A')
                .replace(/\{configFile\}/g, adapter.config_file || 'N/A')
                .replace(/\{globalDoc\}/g, adapter.global_doc || 'N/A')
                .replace(/\{projectPath\}/g, process.cwd())
                .replace(/\{availableTools\}/g, projectConfig.adapters.map(a => a.name).join(', '))
                .replace(/\{currentTime\}/g, new Date().toLocaleString('zh-CN'))
                .replace(/\{currentTimeISO\}/g, new Date().toISOString())
                .replace(/\{repoUrl\}/g, this.config.repo);

            // Add collaboration guide
            const collaborationSection = this.generateCollaborationSection(adapter, projectConfig.adapters);
            content = content.replace(/\{collaborationSection\}/g, collaborationSection);

            return content; // Return content instead of writing directly to file
        } catch (error) {
            console.error(`[ERROR] Failed to generate ${adapter.name}.md: ${error.message}`);
            throw error;
        }
    }

    generateCollaborationSection(adapter, availableAdapters) {
        const currentAdapter = adapter.name;
        const otherAdapters = availableAdapters.filter(a => a.name !== currentAdapter);

        let section = '\n### [REFRESH] Cross-AI Tool Collaboration Guide\n\n';

        // Chinese collaboration examples
        section += '#### Chinese Collaboration Commands\n\n';
        for (const otherAdapter of otherAdapters.slice(0, 3)) {
            section += `- Please use ${otherAdapter.name} to help me {this.getRandomTask()}\n`;
        }

        // English collaboration examples
        section += '\n#### English Collaboration Commands\n\n';
        for (const otherAdapter of otherAdapters.slice(0, 3)) {
            section += `- use ${otherAdapter.name} to ${this.getRandomTask()}\n`;
        }

        return section;
    }

    getRandomTask() {
        const tasks = [
            'generate user authentication module',
            'analyze code performance issues',
            'create database migration scripts',
            'implement API endpoints',
            'optimize SQL queries',
            'generate test cases',
            'review code architecture',
            'refactor legacy code',
            'design system architecture documentation',
            'process CSV data and generate visualization charts',
            'analyze key business metrics',
            'implement caching strategy',
            'optimize application startup time'
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    async checkProject(projectPath = process.cwd()) {
        console.log('🔍 Checking project configuration...');

        try {
            // Check project configuration directory
            const projectConfigDir = join(projectPath, '.stigmergy-project');
            try {
                await fs.access(projectConfigDir);
                console.log('✅ Project configuration directory exists');
            } catch {
                console.log('⚠️  Project configuration directory does not exist, needs initialization');
                return;
            }

            // Check project configuration file
            const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('✅ Project configuration file exists');
                console.log(`📊 Project type: ${config.projectType}`);
                console.log(`📅 Creation time: ${config.createdAt}`);

                if (config.adapters) {
                    console.log(`🔧 Configured adapters: ${config.adapters.length}`);
                    for (const adapter of config.adapters) {
                        console.log(`   - ${adapter.name} (${adapter.status})`);
                    }
                }
            } catch (configErr) {
                console.log('⚠️  Project configuration file does not exist or format error');
            }

            // Check global configuration
            try {
                const globalConfigPath = join(this.config.localConfig, 'global-config.json');
                await fs.access(globalConfigPath);
                console.log('✅ Global configuration exists');
            } catch {
                console.log('⚠️  Global configuration does not exist, needs deployment');
            }

            console.log('✅ Project check completed');
        } catch (error) {
            console.error(`[ERROR] Error checking project: ${error.message}`);
        }
    }

    async scanSystem() {
        console.log('🔍 Scanning system environment...');

        // Scanning logic will be implemented here, similar to deploy.js
        const CLI_TOOLS = [
            { name: 'claude', displayName: 'Claude CLI', required: true },
            { name: 'gemini', displayName: 'Gemini CLI', required: true },
            { name: 'qwen', displayName: 'QwenCode CLI', required: false },
            { name: 'iflow', displayName: 'iFlow CLI', required: false },
            { name: 'qoder', displayName: 'Qoder CLI', required: false },
            { name: 'codebuddy', displayName: 'CodeBuddy CLI', required: false },
            { name: 'copilot', displayName: 'GitHub Copilot CLI', required: false },
            { name: 'ollama', displayName: 'Ollama CLI', required: false }
        ];

        console.log('');
        console.log('📋 Scan results:');

        for (const cliInfo of CLI_TOOLS) {
            const available = await this.checkToolAvailable(cliInfo.name);
            const status = available ? '[OK]' : '[ERROR]';
            const required = cliInfo.required ? '(Required)' : '(Optional)';
            console.log(`  ${status} ${cliInfo.displayName} ${required} - ${available ? 'available' : 'unavailable'}`);
        }

        console.log('');
        console.log('💡 Tip: Use "stigmergy deploy" to deploy uninstalled tools');
    }

    async checkToolAvailable(cliName) {
        // Map tool names to their actual command names
        const commandMap = {
            'qoder': 'qodercli',
            'qwen': 'qwen',
            'iflow': 'iflow',
            'codebuddy': 'codebuddy'
        };
        
        const actualCommand = commandMap[cliName] || cliName;
        
        try {
            // Check if command is available
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [actualCommand], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [actualCommand], { stdio: 'pipe' });
            }
            return result.status === 0;
        } catch (e) {
            // If system command fails, try npm check
            try {
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { 
                    encoding: 'utf-8',
                    stdio: 'pipe',
                    timeout: 10000
                });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(actualCommand);
                }
            } catch (e2) {
                // Ignore npm check errors
            }
            return false;
        }
    }

    async checkStatus() {
        console.log('🔍 Checking Stigmergy CLI status...');

        // Check global configuration
        const globalConfigPath = join(this.config.localConfig, 'global-config.json');
        let globalConfig;
        try {
            globalConfig = JSON.parse(await fs.readFile(globalConfigPath, 'utf8'));
        } catch {
            console.log('⚠️  Global configuration file does not exist');
            return;
        }

        // Check local configuration
        const localConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
        let localConfig;
        try {
            localConfig = JSON.parse(await fs.readFile(localConfigPath, 'utf8'));
        } catch {
            console.log('⚠️  Project configuration file does not exist');
        }

        // Check adapter status
        const adapterStatuses = [];
        for (const [adapterName, adapter] of this.adapters) {
            const exists = await this.checkAdapterExists(adapterName);
            adapterStatuses.push({
                name: adapterName,
                status: exists ? '[INSTALLED]' : '[NOT INSTALLED]',
                config: adapter.config_file
            });
        }

        console.log('\n📊 Global configuration:');
        console.log(`   Repository: ${globalConfig.repo}`);
        console.log(`   Version: ${globalConfig.version}`);
        console.log(`   Last update: ${globalConfig.lastUpdate}`);

        console.log('\n🤖 Available adapters:');
        for (const status of adapterStatuses) {
            console.log(`   ${status.name}: ${status.status} ${status.config ? `(${status.config})` : ''}`);
        }

        if (localConfig) {
            console.log('\n📁 Project configuration:');
            console.log(`   Type: ${localConfig.projectType}`);
            console.log(`   Creation time: ${localConfig.createdAt}`);
            console.log(`   Available tools: ${localConfig.adapters.map(a => a.name).join(', ')}`);
        }

        console.log('\n🔍 Adapter detailed status:');
        for (const status of adapterStatuses) {
            if (!status.status) {
                console.log(`   [MISSING] ${status.name}: Needs installation`);
            }
        }
    }

    async validate(scope = 'project') {
        console.log(`🔍 Verifying ${scope} configuration...`);

        if (scope === 'project') {
            const projectConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('✅ Project configuration verification passed');
                console.log(`📊 Project type: ${config.projectType}`);
                console.log(`📅 Creation time: ${config.createdAt}`);
                console.log(`🔧 Adapter count: ${config.adapters ? config.adapters.length : 0}`);

                return true;
            } catch (error) {
                console.log('⚠️  Project configuration verification failed or does not exist');
                console.log('💡 Tip: Use stigmergy init to initialize project configuration');
                return false;
            }
        } else if (scope === 'global') {
            const globalConfigPath = join(this.config.localConfig, 'global-config.json');
            try {
                const globalConfig = await fs.readFile(globalConfigPath, 'utf8');
                const config = JSON.parse(globalConfig);

                console.log('✅ Global configuration verification passed');
                console.log(`📊 Version: ${config.version}`);
                console.log(`[DATE] Last update: ${config.lastUpdate}`);

                return true;
            } catch (error) {
                console.log('⚠️  Global configuration verification failed or does not exist');
                console.log('💡 Tip: Use stigmergy deploy to deploy global configuration');
                return false;
            }
        } else {
            console.log('⚠️  Unknown verification scope, use "project" or "global"');
            return false;
        }
    }
}

// 命令处理
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    // Check if it's a quick deployment command
    if (args.includes('quick-deploy') || args.includes('deploy')) {
        await runQuickDeploy();
        return;
    }

    const router = new StigmergyCLIRouter();

    switch (command) {
        case 'install':
            await router.installAll();
            break;
        case 'deploy':
            await router.deployAll(args.includes('--force'));
            break;
        case 'init':
            await router.initProject();
            break;
        case 'status':
            await router.checkStatus();
            break;
        case 'check-project':
            await router.checkProject();
            break;
        case 'scan':
            await router.scanSystem();
            break;
        case 'validate':
            await router.validate(args[1] || 'project');
            break;
        case 'clean':
            // Cleanup functionality implementation
            break;
        default:
            console.log(`
🤖 Stigmergy CLI v1.0.0 - Multi-Agents Cross-AI CLI Tool Collaboration System

📚 Available commands:
  install              - Install all AI CLI tool adapters
  deploy [options]    - Deploy adapters to local configuration
  init [path]         - Initialize project (default current directory)
  status              - Check system and adapter status
  check-project [path]  - Check project configuration
  validate [scope]    - Validate configuration
  clean [options]     - Clean cache and temporary files

💡 Quick start:
  npx stigmergy init          # Initialize current project
  npx stigmergy deploy        # One-click deployment
  npx stigmergy status          # Check status

🚀 Quick deployment:
  npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy

📖 Documentation: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
🔧 Configuration: ~/.stigmergy/global-config.json
🔧 Project: .stigmergy-project/project-config.json

🌟 Global access:
  npx stigmergy install --global
            `);
            break;
    }
}

// Add a global directoryExists function
async function directoryExists(dirPath) {
    try {
        const { stat } = await fs;
        const statResult = await stat(dirPath);
        return statResult.isDirectory();
    } catch (error) {
        return false;
    }
}

// Remote quick deployment function
async function runQuickDeploy() {
    console.log('🤖 Stigmergy CLI - Remote Quick Deployment System');
    console.log('==================================');
    console.log('This script will automatically detect, install, and configure the cross-AI CLI tool collaboration system');
    console.log('');

    // Define supported AI tools and their npm package names
    const AI_TOOLS = [
        {
            name: 'claude',
            displayName: 'Claude CLI',
            npmPackage: '@anthropic-ai/claude-code',
            description: 'Anthropic Claude CLI Tool',
            website: 'https://claude.ai/cli'
        },
        {
            name: 'gemini',
            displayName: 'Gemini CLI',
            npmPackage: '@google/gemini-cli',
            description: 'Google Gemini CLI Tool',
            website: 'https://ai.google.dev/cli'
        },
        {
            name: 'qwen',
            displayName: 'QwenCode CLI',
            npmPackage: '@qwen-code/qwen-code@latest',
            description: 'Alibaba Cloud QwenCode CLI Tool',
            website: 'https://qwen.aliyun.com'
        },
        {
            name: 'iflow',
            displayName: 'iFlow CLI',
            npmPackage: '@iflow-ai/iflow-cli@latest',
            description: 'iFlow Workflow CLI Tool',
            website: 'https://iflow.ai'
        },
        {
            name: 'qoder',
            displayName: 'Qoder CLI',
            npmPackage: '@qoder-ai/qodercli',
            description: 'Qoder Code Generation CLI Tool',
            website: 'https://qoder.ai'
        },
        {
            name: 'codebuddy',
            displayName: 'CodeBuddy CLI',
            npmPackage: '@tencent-ai/codebuddy-code',
            description: 'Tencent CodeBuddy Programming Assistant',
            website: 'https://codebuddy.qq.com'
        },
        {
            name: 'copilot',
            displayName: 'GitHub Copilot CLI',
            npmPackage: '@github/copilot',
            description: 'GitHub Copilot CLI Tool',
            website: 'https://github.com/features/copilot'
        },
        {
            name: 'ollama',
            displayName: 'Ollama CLI',
            npmPackage: 'ollama',
            description: 'Ollama Local Model CLI Tool',
            website: 'https://ollama.ai'
        },
        {
            name: 'codex',
            displayName: 'OpenAI Codex CLI',
            npmPackage: '@openai/codex --registry=https://registry.npmmirror.com',
            description: 'OpenAI Codex code analysis CLI tool',
            website: 'https://platform.openai.com'
        }
    ];

    // Function to detect AI tools
    async function checkToolInstallation(toolName) {
        try {
            // Check if command is available
            const { spawnSync } = await import('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [toolName], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [toolName], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // If system command fails, try npm check
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(toolName);
                }
            } catch (e2) {
                // Ignore npm check errors
            }
            return false;
        }
    }

    // Detect installed AI tools
    async function detectInstalledTools() {
        console.log('🔍 Detecting installed AI tools in your system...');

        const installedTools = [];
        const notInstalledTools = [];

        for (const tool of AI_TOOLS) {
            const isInstalled = await checkToolInstallation(tool.name);
            if (isInstalled) {
                installedTools.push(tool);
                console.log(`✅ ${tool.displayName} - Installed`);
            } else {
                notInstalledTools.push(tool);
                console.log(`❌ ${tool.displayName} - Not installed`);
            }
        }

        return { installedTools, notInstalledTools };
    }

    // Install specified tools
    async function installTools(toolsToInstall) {
        if (toolsToInstall.length === 0) {
            console.log('\n✅ No additional tools need to be installed, continuing system configuration...');
            return;
        }

        console.log(`\n📦 Installing ${toolsToInstall.length} AI tools...`);

        for (const toolName of toolsToInstall) {
            // Find tool information
            const tool = AI_TOOLS.find(t => t.name === toolName);
            if (!tool) continue;

            console.log(`\n🔄 Installing ${tool.displayName}...`);

            const { spawn } = await import('child_process');
            await new Promise((resolve) => {
                // Handle npm package names with extra arguments (e.g., codex)
                let npmArgs = ['install', '-g'];
                const packageWithArgs = tool.npmPackage;

                // Split package name and arguments
                const parts = packageWithArgs.split(' ');
                npmArgs.push(parts[0]); // Add package name
                if (parts.length > 1) {
                    npmArgs = npmArgs.concat(parts.slice(1)); // Add extra arguments
                }

                const installProcess = spawn('npm', npmArgs, {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true
                });

                installProcess.stdout.on('data', (data) => {
                    const output = data.toString();
                    if (output.includes('added') || output.includes('updated')) {
                        console.log(`✅ ${tool.displayName} installed successfully`);
                    }
                });

                installProcess.stderr.on('data', (data) => {
                    // Ignore most npm warnings, only show critical errors
                    const errOutput = data.toString();
                    if (errOutput.includes('WARN') || errOutput.includes('deprecated')) {
                        return; // Ignore warning
                    }
                    if (errOutput.includes('ERR') || errOutput.includes('error')) {
                        console.log(`❌ ${tool.displayName} installation error: ${errOutput.trim()}`);
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ ${tool.displayName} installation completed`);
                    } else {
                        console.log(`⚠️ ${tool.displayName} installation may not be completed (exit code: ${code})`);
                    }
                    resolve(); // Continue to next tool installation
                });
            });
        }
    }

    // Adapter name mapping function
    function mapAdapterName(adapterName) {
        // Map user interface names to actual adapter directory names
        const nameMap = {
            'qwen': 'qwencode'  // qwen corresponds to qwencode directory internally
        };
        return nameMap[adapterName] || adapterName;
    }

    // Determine installation parameters for specific CLI tools
    function determineInstallArgs(cliName) {
        // Different CLI tools have different parameter formats to trigger installation
        const installArgMap = {
            'claude': ['--install'], // Claude脚本支持--install
            'gemini': ['--install'], // Gemini脚本支持--install
            'qwen': ['--install'],   // QwenCode脚本支持--install
            'iflow': ['--install'],  // iFlow脚本支持--install
            'qoder': ['--install'],  // Qoder脚本支持--install
            'codebuddy': ['--install'], // CodeBuddy脚本支持--install
            'codex': ['--install'],  // Codex脚本支持--install
            'copilot': ['--force'],  // Copilot脚本使用--force进行安装
            'ollama': []             // Ollama没有集成脚本
        };

        // Return the corresponding installation parameter array
        return installArgMap[cliName] || ['--install'];
    }

    // Function to detect if CLI tools are available (consistent with checkToolInstallation)
    async function checkToolAvailable(cliName) {
        // Map tool names to their actual command names
        const commandMap = {
            'qoder': 'qodercli',
            'qwen': 'qwen',
            'iflow': 'iflow',
            'codebuddy': 'codebuddy'
        };
        
        const actualCommand = commandMap[cliName] || cliName;
        
        try {
            // Check if command is available
            const { spawnSync } = await import('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [actualCommand], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [actualCommand], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // If system command fails, try npm check
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { 
                    encoding: 'utf-8',
                    stdio: 'pipe',
                    timeout: 10000
                });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(actualCommand);
                }
            } catch (e2) {
                // Ignore npm check errors
            }
            return false;
        }
    }

    // Configure system - run local init command to configure plugins for all installed CLIs
    async function configureSystem() {
        console.log('\n⚙️  Configuring Stigmergy CLI collaboration system...');

        // 检测所有支持的CLI工具是否已安装
        const allCLITools = [
            { name: 'claude', displayName: 'Claude CLI', required: true },
            { name: 'gemini', displayName: 'Gemini CLI', required: true },
            { name: 'qwen', displayName: 'QwenCode CLI', required: false },
            { name: 'iflow', displayName: 'iFlow CLI', required: false },
            { name: 'qoder', displayName: 'Qoder CLI', required: false },
            { name: 'codebuddy', displayName: 'CodeBuddy CLI', required: false },
            { name: 'copilot', displayName: 'GitHub Copilot CLI', required: false },
            { name: 'codex', displayName: 'OpenAI Codex CLI', required: false },
            { name: 'ollama', displayName: 'Ollama CLI', required: false }
        ];

        // 检测每个CLI工具是否可用
        const availableCLIs = [];
        const unavailableCLIs = [];

        for (const cliInfo of allCLITools) {
            const available = await checkToolAvailable(cliInfo.name);
            if (available) {
                availableCLIs.push(cliInfo);
                console.log(`✅ ${cliInfo.displayName} - Available`);
            } else {
                unavailableCLIs.push(cliInfo);
                console.log(`❌ ${cliInfo.displayName} - Unavailable`);
            }
        }

        console.log(`\n📊 Detection results: ${availableCLIs.length} available, ${unavailableCLIs.length} unavailable`);

        // Initialize project configuration
        try {
            const projectPath = process.cwd();
            console.log('\n🚀 Initializing Stigmergy CLI project...');

            // Validate and fix path - Ensure not creating project files in system root directory
            let safeProjectPath = projectPath;
            if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
                safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\')) {
                // If user runs in disk root directory, create a dedicated project directory
                console.log('[WARN] Detected running in disk root directory, will automatically create project directory for initialization');

                // Create numbered project directory
                let projectDirName = 'ProjStig';
                let counter = 1;
                let targetDir = join(safeProjectPath, projectDirName);

                // Check if directory exists, add number if it does
                while (await directoryExists(targetDir)) {
                    targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                    counter++;
                }

                // Create project directory
                await fs.mkdir(targetDir, { recursive: true });
                safeProjectPath = targetDir;
                console.log(`[INFO] Project directory created successfully: ${safeProjectPath}`);
            }

            // Create project configuration directory
            const projectConfigDir = join(safeProjectPath, '.stigmergy-project');
            await fs.mkdir(projectConfigDir, { recursive: true });

            // Generate project configuration - only include installed tools
            const projectConfig = {
                projectType: 'initialized',
                createdAt: new Date().toISOString(),
                adapters: availableCLIs.map(cli => ({
                    name: cli.name,
                    displayName: cli.displayName,
                    required: cli.required,
                    status: 'available'
                }))
            };

            // Save project configuration
            const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
            await fs.writeFile(projectConfigPath, JSON.stringify(projectConfig, null, 2));

            console.log(`✅ Stigmergy project initialization completed!`);
            if (availableCLIs.length > 0) {
                console.log(`📊 Configured collaboration for ${availableCLIs.length} installed AI CLI tools:`, availableCLIs.map(a => a.name).join(', '));
            } else {
                console.log(`📊 No installed AI CLI tools detected`);
            }

            // Generate configuration documentation for all installed CLIs
            for (const cliInfo of availableCLIs) {
                // Ensure md file is generated in project directory, not system root
                const mdPath = join(safeProjectPath, `${cliInfo.name}.md`);

                try {
                    // Generate basic configuration documentation for CLI
                    const mdContent = `# ${cliInfo.displayName} 配置

## Basic Information
- **名称**: ${cliInfo.name}
- **Display Name**: ${cliInfo.displayName}
- **状态**: 已安装
- **Required**: ${cliInfo.required ? 'Yes' : 'No'}

## Stigmergy Collaboration Configuration
此工具已配置为参与跨AI工具协作系统。

## Collaboration Command Examples
- Chinese: "Please use ${cliInfo.name} to help me with {task}"
- English: "use ${cliInfo.name} to {task}"

---
Generation time: ${new Date().toISOString()}
`;
                    await fs.writeFile(mdPath, mdContent);
                    console.log(`✅ Generated ${cliInfo.name}.md`);
                } catch (error) {
                    console.log(`⚠️ Failed to generate ${cliInfo.name}.md: ${error.message}`);
                }
            }

            console.log('✅ Project configuration completed');

            // Configure integration plugins for installed CLIs (if supported)
            console.log('\n🔄 Configuring collaboration plugins for installed CLIs...');
            for (const cliInfo of availableCLIs) {
                try {
                    // 检查是否存在对应的集成安装脚本
                    const adapterDirName = mapAdapterName(cliInfo.name); // Use mapping function to handle qwen->qwencode
                    const installScriptPath = join(__dirname, 'adapters', adapterDirName, `install_${adapterDirName}_integration.py`);

                    // Try to check if file exists
                    const { access } = await import('fs/promises');
                    let fileExists = false;
                    try {
                        await access(installScriptPath);
                        fileExists = true;
                    } catch {
                        // File does not exist
                        fileExists = false;
                    }

                    if (fileExists) {
                        console.log(`\n🔄 Configuring ${cliInfo.displayName} integration plugin...`);

                        // Different CLI tools may use different installation parameters
                        const installArgs = determineInstallArgs(cliInfo.name);

                        const childProcess = await import('child_process');
                        const { spawn } = childProcess;

                        // For Copilot, need to handle path issues in npx environment
                        let additionalEnv = {};
                        if (cliInfo.name === 'copilot') {
                            // Set project root directory environment variable to help Python scripts find config file
                            // __dirname is src directory, so need to get parent directory as project root
                            const projectRoot = join(__dirname, '..');  // Go back to project root from src directory
                            additionalEnv = {
                                ...process.env,
                                PROJECT_ROOT: projectRoot,
                                STIGMERGY_PROJECT_ROOT: projectRoot
                            };
                        } else {
                            additionalEnv = process.env;
                        }

                        // Run integration installation script with tool-specific installation parameters
                        const integrationProcess = spawn('python', [
                            installScriptPath,
                            ...installArgs
                        ], {
                            stdio: ['pipe', 'pipe', 'pipe'],
                            shell: true,
                            env: additionalEnv
                        });

                        integrationProcess.stdout.on('data', (data) => {
                            const line = data.toString();
                            // Filter some verbose output
                            if (!line.includes('CLI跨CLI协作集成安装器') &&
                                !line.includes('QwenCode CLI跨CLI协作集成安装器') &&
                                !line.includes('Copilot CLI跨CLI集成安装脚本')) {
                                console.log(line.trim());
                            }
                        });

                        integrationProcess.stderr.on('data', (data) => {
                            const errorLine = data.toString().trim();
                            // Filter specific Python error messages
                            if (!errorLine.includes('CLADE_CONFIG_DIR') && // Claude脚本错误
                                !errorLine.includes('argument --install: ignored explicit argument') && // Copilot参数错误
                                !errorLine.includes('No such file or directory') && // Copilot路径错误
                                !errorLine.includes('loading config file failed') && // Copilot配置文件错误
                                errorLine.length > 0) {
                                console.error(errorLine);
                            }
                        });

                        await new Promise((resolve) => {
                            integrationProcess.on('close', (integrationCode) => {
                                if (integrationCode === 0) {
                                    console.log(`✅ ${cliInfo.displayName} integration plugin configured successfully`);
                                } else {
                                    console.log(`⚠️ ${cliInfo.displayName} integration plugin configuration may not be completed (exit code: ${integrationCode})`);
                                }
                                resolve();
                            });
                        });
                    } else {
                        console.log(`ℹ️ ${cliInfo.displayName} - No special integration plugin configuration available`);
                    }
                } catch (error) {
                    console.log(`⚠️ Error during ${cliInfo.displayName} integration plugin configuration: ${error.message}`);
                }
            }

            console.log('\n✅ System configuration successful');
        } catch (error) {
            console.log(`❌ System configuration failed: ${error.message}`);
        }
    }


    // Ask for user input (using command line arguments instead of inquirer)
    async function promptForTools(notInstalledTools) {
        if (notInstalledTools.length === 0) {
            console.log('\n🎉 You have installed all supported AI tools!');
            return [];
        }

        console.log('\n🎯 Detected that you can also install the following AI tools:');
        for (let i = 0; i < notInstalledTools.length; i++) {
            const tool = notInstalledTools[i];
            console.log(`${i + 1}. ${tool.displayName} - ${tool.description}`);
            console.log(`   npm package: ${tool.npmPackage}`);
        }

        console.log('\n💡 Tip: You can manually install these tools later via "npm install -g <package>"');
        console.log('   Or select tool numbers to install now, separated by spaces (e.g.: 1 3 4), 0 means install no tools:');

        return new Promise(async (resolve) => {
            const readline = await import('readline');
            const { createInterface } = readline;
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Please select the tool number to install: ', (answer) => {
                rl.close();

                const selections = answer.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
                if (selections.includes(0)) {
                    resolve([]);
                    return;
                }

                const selectedTools = [];
                for (const selection of selections) {
                    const index = selection - 1; // Convert to 0-based index
                    if (index >= 0 && index < notInstalledTools.length) {
                        selectedTools.push(notInstalledTools[index].name);
                    }
                }

                resolve(selectedTools);
            });
        });
    }

    // Automatically install stigmergy globally
    async function installStigmergyGlobally() {
        console.log('\n🌍 Installing stigmergy globally...');
        
        try {
            const { spawn } = await import('child_process');
            
            await new Promise((resolve, reject) => {
                const installProcess = spawn('npm', ['install', '-g', '.'], {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: true,
                    cwd: process.cwd()
                });

                let output = '';
                installProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                installProcess.stderr.on('data', (data) => {
                    // Filter npm warning messages
                    const stderr = data.toString();
                    if (!stderr.includes('WARN')) {
                        output += stderr;
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('[OK] stigmergy has been successfully installed globally!');
                        console.log('      You can now run in any directory: stigmergy <command>');
                        resolve();
                    } else {
                        console.log('[WARN] Global installation may not have succeeded, but you can install manually:');
                        console.log('      npm install -g stigmergy');
                        resolve(); // Don't block the process
                    }
                });

                installProcess.on('error', (error) => {
                    console.log('[WARN] Global installation failed, you can install manually:');
                    console.log('      npm install -g stigmergy');
                    console.log(`      Error: ${error.message}`);
                    resolve(); // Don't block the process
                });
            });
        } catch (error) {
            console.log('[WARN] Global installation failed, you can install manually:');
            console.log('      npm install -g stigmergy');
            console.log(`      Error: ${error.message}`);
        }
    }

    // Display initialization guide
    function showInitializationGuide() {
        console.log('\n🎉 Deployment completed! Here is the usage guide:');
        console.log('\n📋 Quick start:');
        console.log('  Now globally installed! You can run in any directory:');
        console.log('  • Initialize project: stigmergy init');
        console.log('  • Check status: stigmergy status');
        console.log('  • Scan environment: stigmergy scan');
        console.log('');
        console.log('  Or use NPX (no installation required):');
        console.log('  • Initialize project: npx stigmergy@latest init');
        console.log('  • Check status: npx stigmergy@latest status');
        console.log('  • Scan environment: npx stigmergy@latest scan');

        console.log('\n⚠️ Important notice:');
        console.log('  Newly installed CLI tools need to be registered or configured with third-party API tokens:');
        console.log('');
        
        console.log('\n🔧 Startup commands for each CLI tool:');
        console.log('  • Claude CLI:     claude');
        console.log('  • Gemini CLI:     gemini');
        console.log('  • QwenCode CLI:   qwen');
        console.log('  • iFlow CLI:       iflow');
        console.log('  • Qoder CLI:       qodercli');
        console.log('  • CodeBuddy CLI:   codebuddy');
        console.log('  • GitHub Copilot:  gh copilot');
        console.log('  • OpenAI Codex:    codex');
        
        console.log('\n📁 Recommended workflow:');
        console.log('  1. Create new project directory:');
        console.log('     mkdir my-ai-project');
        console.log('     cd my-ai-project');
        console.log('');
        console.log('  2. Initialize project:');
        console.log('     stigmergy init');
        console.log('     Or: npx stigmergy@latest init');
        console.log('');
        console.log('  3. Use CLI tools in any directory:');
        console.log('     claude "design a user authentication system"');
        console.log('     gemini "please implement this design with qwen"');
        console.log('     qwen "create development workflow with iflow"');

        console.log('\n🔑 API configuration guide:');
        console.log('  • Claude: Need to set ANTHROPIC_API_KEY');
        console.log('  • Gemini: Need to set GOOGLE_API_KEY');
        console.log('  • QwenCode: Need to set DASHSCOPE_API_KEY');
        console.log('  • iFlow: Need to register account to get API key');
        console.log('  • Qoder: Need to register account to get API key');
        console.log('  • CodeBuddy: Need WeChat QR code authentication or set TENCENT_SECRET_ID/KEY');
        console.log('  • Copilot: Need to log in to GitHub account');
        console.log('  • Codex: Need to set OPENAI_API_KEY');

        console.log('\n🚀 Cross-AI tool collaboration examples:');
        console.log('  - Directly use collaboration commands in each CLI tool:');
        console.log('    Example: qwen "please help me translate this code with gemini"');
        console.log('    Example: gemini "call qwen to analyze this requirement"');
        console.log('    Example: claude "use iflow to create workflow"');

        console.log('\n💡 Advanced features:');
        console.log('  - Project context sharing: All AI tools share PROJECT_SPEC.json');
        console.log('  - Task assignment: Automatically assign and track collaborative tasks');
        console.log('  - Stigmergy collaboration: Achieve indirect collaboration through environmental cues');

        console.log('\n🔗 Want to learn more? Visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        console.log('\n🎊 Good luck with your multi-AI tool collaboration!');
    }

    try {
        // Detect installed AI tools
        const { installedTools, notInstalledTools } = await detectInstalledTools();

        // Ask user if they want to install more tools
        const toolsToInstall = await promptForTools(notInstalledTools);

        // Install selected tools
        await installTools(toolsToInstall);

        // Configure system
        await configureSystem();

        // Automatically install stigmergy globally
        await installStigmergyGlobally();

        // Display usage guide
        showInitializationGuide();
    } catch (error) {
        console.error(`\n[ERROR] Error occurred during deployment: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();