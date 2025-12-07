#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents NPX Deployment Manager
 * Support one-click deployment to AI CLI tools, enabling true Stigmergy collaboration
 */
import { spawn } from 'child_process';
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
        // Adapter name mapping - map user-visible names to actual directory names
        const adapterDirName = this.mapAdapterName(adapterName);

        // Try multiple possible paths
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // Look from current file directory
            join(dirname(__dirname), 'adapters'),  // Look from parent directory of current directory
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
        console.error(`[ERROR] Failed to load ${adapterName} adapter configuration: Config file not found in any possible paths, last attempt: ${lastPathAttempted}`);
        return { loaded: false, error: "Unable to find adapter configuration file" };
    }

    async checkAdapterExists(adapterName) {
        // Adapter name mapping - map user-visible names to actual directory names
        const adapterDirName = this.mapAdapterName(adapterName);

        // Use the same path detection logic as loadAdapter
        const possibleBasePaths = [
            join(__dirname, 'adapters'),           // Look from current file directory
            join(dirname(__dirname), 'adapters'),  // Look from parent directory of current directory
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
            'qwen': 'qwencode'  // qwen corresponds to qwencode directory internally
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
            console.log(`[INSTALL] Starting installation of ${adapterName} adapter...`);

            // Check if adapter already exists
            const exists = await this.checkAdapterExists(adapterName);
            if (exists && !force) {
                console.log(`[OK] ${adapterName} adapter already exists`);
                this.isInstalling = false;
                return;
            }

            // Load adapter configuration
            const config = await this.loadAdapter(adapterName);
            if (!config.loaded) {
                console.error(`[ERROR] ${adapterName} adapter configuration loading failed: ${config.error}`);
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

            // Create logs directory
            const logsDir = join(adapterConfigDir, 'logs');
            await fs.mkdir(logsDir, { recursive: true });

            console.log(`[OK] ${adapterName} adapter installation completed`);

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
        console.log('[DEPLOY] Starting deployment of all adapters...');

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
        console.log('[INIT] Initializing Stigmergy CLI project...');

        // Validate and fix path - ensure not creating project files in system root directory
        let safeProjectPath = projectPath;
        if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
            safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\')) {
            // If user is running in disk root directory, create a dedicated project directory
            console.log('[WARN] Detected running in disk root directory, will automatically create project directory for initialization');

            // Create numbered project directory
            let projectDirName = 'ProjStig';
            let counter = 1;
            let targetDir = join(safeProjectPath, projectDirName);

            // Check if directory exists, add number if exists
            while (await this.directoryExists(targetDir)) {
                targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                counter++;
            }

            // Create project directory
            await fs.mkdir(targetDir, { recursive: true });
            safeProjectPath = targetDir;
            console.log(`[DIR] Project directory created successfully: ${safeProjectPath}`);
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

        console.log(`[OK] Stigmergy project initialization completed!`);
        console.log(`[INFO] Discovered ${availableAdapters.length} available AI CLI tools:`, availableAdapters.map(a => a.name).join(', '));

        // Generate enhanced MD documents
        for (const adapter of availableAdapters) {
            // Ensure md file is generated in project directory not system root
            const mdPath = join(safeProjectPath, `${adapter.name}.md`);
            const config = await this.loadAdapter(adapter.name);

            if (config.loaded) {
                const mdContent = await this.generateEnhancedMarkdown(adapter, projectConfig);
                await fs.writeFile(mdPath, mdContent, 'utf8');
                console.log(`[OK] Generated ${adapter.name}.md`);
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
                .replace(/\{currentTime\}/g, new Date().toLocaleString('en-US'))
                .replace(/\{currentTimeISO\}/g, new Date().toISOString())
                .replace(/\{repoUrl\}/g, this.config.repo);

            // Add collaboration guide
            const collaborationSection = this.generateCollaborationSection(adapter, projectConfig.adapters);
            content = content.replace(/\{collaborationSection\}/g, collaborationSection);

            return content; // Return content instead of writing file directly
        } catch (error) {
            console.error(`[ERROR] Failed to generate ${adapter.name}.md: ${error.message}`);
            throw error;
        }
    }

    generateCollaborationSection(adapter, availableAdapters) {
        const currentAdapter = adapter.name;
        const otherAdapters = availableAdapters.filter(a => a.name !== currentAdapter);

        let section = '\n### [SYNC] Cross-AI Tool Collaboration Guide\n\n';

        // Chinese collaboration examples (for documentation)
        section += '#### Chinese Collaboration Commands\n\n';
        for (const otherAdapter of otherAdapters.slice(0, 3)) {
            section += `- 请用${otherAdapter.name}帮我{this.getRandomTask()}\n`;
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
            'create database migration script',
            'implement API endpoint',
            'optimize SQL query',
            'generate test cases',
            'review code architecture',
            'refactor legacy code',
            'design system architecture document',
            'process CSV data and generate visualizations',
            'analyze key business metrics',
            'implement caching strategy',
            'optimize application startup time'
        ];
        return tasks[Math.floor(Math.random() * tasks.length)];
    }

    async checkProject(projectPath = process.cwd()) {
        console.log('[CHECK] Checking project configuration...');

        try {
            // Check project configuration directory
            const projectConfigDir = join(projectPath, '.stigmergy-project');
            try {
                await fs.access(projectConfigDir);
                console.log('[OK] Project configuration directory exists');
            } catch {
                console.log('[WARN] Project configuration directory does not exist, needs initialization');
                return;
            }

            // Check project configuration file
            const projectConfigPath = join(projectConfigDir, 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('[OK] Project configuration file exists');
                console.log(`[INFO] Project type: ${config.projectType}`);
                console.log(`[DATE] Created at: ${config.createdAt}`);

                if (config.adapters) {
                    console.log(`[CONFIG] Configured adapters: ${config.adapters.length}`);
                    for (const adapter of config.adapters) {
                        console.log(`   - ${adapter.name} (${adapter.status})`);
                    }
                }
            } catch (configErr) {
                console.log('[WARN] Project configuration file does not exist or has incorrect format');
            }

            // Check global configuration
            try {
                const globalConfigPath = join(this.config.localConfig, 'global-config.json');
                await fs.access(globalConfigPath);
                console.log('[OK] Global configuration exists');
            } catch {
                console.log('[WARN] Global configuration does not exist, needs deployment');
            }

            console.log('[OK] Project check completed');
        } catch (error) {
            console.error(`[ERROR] Error checking project: ${error.message}`);
        }
    }

    async scanSystem() {
        console.log('[SCAN] Scanning system environment...');

        // Use the same detection logic as quick-deploy for consistency
        // Define supported AI tools and their details
        const AI_TOOLS = [
            {
                name: 'claude',
                displayName: 'Claude CLI',
                required: true
            },
            {
                name: 'gemini',
                displayName: 'Gemini CLI',
                required: true
            },
            {
                name: 'qwen',
                displayName: 'QwenCode CLI',
                required: false
            },
            {
                name: 'iflow',
                displayName: 'iFlow CLI',
                required: false
            },
            {
                name: 'qoder',
                displayName: 'Qoder CLI',
                required: false
            },
            {
                name: 'codebuddy',
                displayName: 'CodeBuddy CLI',
                required: false
            },
            {
                name: 'copilot',
                displayName: 'GitHub Copilot CLI',
                required: false
            },
            {
                name: 'ollama',
                displayName: 'Ollama CLI',
                required: false
            },
            {
                name: 'codex',
                displayName: 'OpenAI Codex CLI',
                required: false
            }
        ];

        console.log('');
        console.log('[RESULTS] Scan results:');

        // Detect installed AI tools using the same logic as quick-deploy
        for (const tool of AI_TOOLS) {
            const isInstalled = await this.checkToolInstalled(tool.name);
            const status = isInstalled ? '[OK]' : '[X]';
            const required = tool.required ? '(Required)' : '(Optional)';
            console.log(`  ${status} ${tool.displayName} ${required} - ${isInstalled ? 'Available' : 'Unavailable'}`);
        }

        console.log('');
        console.log('[TIP] Use "stigmergy deploy" to deploy uninstalled tools');
    }

    // Use smart detection function that intelligently tries multiple command name variations
    async checkToolInstalled(toolName) {
        // Generate possible command name variations
        const possibleNames = [
            toolName,                                     // Original name (e.g., qoder)
            `${toolName}cli`,                             // Add 'cli' suffix (e.g., qodercli)
            `${toolName}-cli`,                            // Add '-cli' suffix (e.g., qoder-cli)
            `${toolName}cmd`,                             // Add 'cmd' suffix (e.g., qodercmd)
            `${toolName}-cmd`,                            // Add '-cmd' suffix (e.g., qoder-cmd)
            `${toolName}tool`,                            // Add 'tool' suffix (e.g., qodertool)
            `${toolName}-tool`,                           // Add '-tool' suffix (e.g., qoder-tool)
            toolName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()  // Convert camelCase to kebab-case
        ];

        // Remove duplicates while preserving order
        const uniqueNames = [...new Set(possibleNames)];

        // Try each possible name variation
        for (const commandName of uniqueNames) {
            // 1. First, try the standard where/which command check
            try {
                const { spawnSync } = await import('child_process');
                let result;
                if (process.platform === 'win32') {
                    result = spawnSync('where', [commandName], { stdio: 'pipe' });
                } else {
                    result = spawnSync('which', [commandName], { stdio: 'pipe' });
                }

                if (result.status === 0 && result.stdout.toString().trim() !== '') {
                    return true;
                }
            } catch (e) {
                // If where/which fails, continue to try next possible name
            }

            // 2. Try version command check (more reliable than just existence)
            try {
                const { spawnSync } = await import('child_process');
                const versionCommands = [
                    `${commandName} --version`,
                    `${commandName} -v`,
                    `${commandName} version`
                ];

                for (const cmd of versionCommands) {
                    try {
                        const result = spawnSync(cmd, { shell: true, stdio: 'pipe', timeout: 3000 });
                        if (result.status === 0 && (result.stdout.toString().trim() !== '' || result.stderr.toString().trim() !== '')) {
                            return true;
                        }
                    } catch (cmdError) {
                        // Try next version command
                        continue;
                    }
                }
            } catch (e) {
                // If version command fails, continue to try next possible name
            }
        }

        // 3. Finally, try npm list check as fallback
        try {
            const { spawnSync } = require('child_process');
            const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
            if (npmResult.status === 0 && npmResult.stdout) {
                // Check if the tool name appears in npm output (for any variant)
                return npmResult.stdout.includes(toolName);
            }
        } catch (e2) {
            // Ignore npm check errors
        }

        return false;
    }

    async checkStatus() {
        console.log('[STATUS] Checking Stigmergy CLI status...');

        // Check global configuration
        const globalConfigPath = join(this.config.localConfig, 'global-config.json');
        let globalConfig;
        try {
            globalConfig = JSON.parse(await fs.readFile(globalConfigPath, 'utf8'));
        } catch {
            console.log('[WARN] Global configuration file does not exist');
            return;
        }

        // Check local configuration
        const localConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
        let localConfig;
        try {
            localConfig = JSON.parse(await fs.readFile(localConfigPath, 'utf8'));
        } catch {
            console.log('[WARN] Project configuration file does not exist');
        }

        // Check adapter status
        const adapterStatuses = [];
        for (const [adapterName, adapter] of this.adapters) {
            const exists = await this.checkAdapterExists(adapterName);
            adapterStatuses.push({
                name: adapterName,
                status: exists ? '[OK] Installed' : '[X] Not installed',
                config: adapter.config_file
            });
        }

        console.log('\n[INFO] Global configuration:');
        console.log(`   Repository: ${globalConfig.repo}`);
        console.log(`   Version: ${globalConfig.version}`);
        console.log(`   Last updated: ${globalConfig.lastUpdate}`);

        console.log('\n[ADAPTERS] Available adapters:');
        for (const status of adapterStatuses) {
            console.log(`   ${status.name}: ${status.status} ${status.config ? `(${status.config})` : ''}`);
        }

        if (localConfig) {
            console.log('\n[PROJECT] Project configuration:');
            console.log(`   Type: ${localConfig.projectType}`);
            console.log(`   Created at: ${localConfig.createdAt}`);
            console.log(`   Available tools: ${localConfig.adapters.map(a => a.name).join(', ')}`);
        }

        console.log('\n[STATUS] Adapter detailed status:');
        for (const status of adapterStatuses) {
            if (!status.status) {
                console.log(`   [X] ${status.name}: needs installation`);
            }
        }
    }

    async validate(scope = 'project') {
        console.log(`[VALIDATE] Validating ${scope} configuration...`);

        if (scope === 'project') {
            const projectConfigPath = join(process.cwd(), '.stigmergy-project', 'stigmergy-config.json');
            try {
                const projectConfig = await fs.readFile(projectConfigPath, 'utf8');
                const config = JSON.parse(projectConfig);

                console.log('[OK] Project configuration validation passed');
                console.log(`[INFO] Project type: ${config.projectType}`);
                console.log(`[DATE] Created at: ${config.createdAt}`);
                console.log(`[CONFIG] Number of adapters: ${config.adapters ? config.adapters.length : 0}`);

                return true;
            } catch (error) {
                console.log('[WARN] Project configuration validation failed or does not exist');
                console.log('[TIP] Tip: Use stigmergy init to initialize project configuration');
                return false;
            }
        } else if (scope === 'global') {
            const globalConfigPath = join(this.config.localConfig, 'global-config.json');
            try {
                const globalConfig = await fs.readFile(globalConfigPath, 'utf8');
                const config = JSON.parse(globalConfig);

                console.log('[OK] Global configuration validation passed');
                console.log(`[INFO] Version: ${config.version}`);
                console.log(`[DATE] Last updated: ${config.lastUpdate}`);

                return true;
            } catch (error) {
                console.log('[WARN] Global configuration validation failed or does not exist');
                console.log('[TIP] Tip: Use stigmergy deploy to deploy global configuration');
                return false;
            }
        } else {
            console.log('[WARN] Unknown validation scope, use "project" or "global"');
            return false;
        }
    }
}

// Command handling
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    // Check if it's a quick deploy command
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
            // Clean functionality implementation
            break;
        default:
            console.log(`
[AI] Stigmergy CLI v1.0.0 - Multi-Agents Cross-AI CLI Tool Collaboration System

[INFO] Available Commands:
  install              - Install all AI CLI tool adapters
  deploy [options]    - Deploy adapters to local configuration
  init [path]         - Initialize project (default: current directory)
  status              - Check system and adapter status
  check-project [path]  - Check project configuration
  validate [scope]    - Validate configuration
  clean [options]     - Clean cache and temporary files

[TIP] Quick Start:
  stigmergy init          # Initialize current project
  stigmergy deploy        # One-click deployment
  stigmergy status          # Check status

[DEPLOY] Quick Deploy:
  npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy

[DOC] Documentation: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
[CONFIG] Global Config: ~/.stigmergy/global-config.json
[CONFIG] Project Config: .stigmergy-project/project-config.json

[GLOBAL] Global Access:
  npm install -g stigmergy && stigmergy install --global
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
    console.log('[DEPLOY] Stigmergy CLI - Remote Rapid Deployment System');
    console.log('==================================');
    console.log('This script will automatically detect, install and configure cross-AI CLI tool collaboration system');
    console.log('');

    // Define supported AI tools and their npm package names
    const AI_TOOLS = [
        {
            name: 'claude',
            displayName: 'Claude CLI',
            npmPackage: '@anthropic-ai/claude-code',
            description: 'Anthropic Claude CLI tool',
            website: 'https://claude.ai/cli'
        },
        {
            name: 'gemini',
            displayName: 'Gemini CLI',
            npmPackage: '@google/gemini-cli',
            description: 'Google Gemini CLI tool',
            website: 'https://ai.google.dev/cli'
        },
        {
            name: 'qwen',
            displayName: 'QwenCode CLI',
            npmPackage: '@qwen-code/qwen-code@latest',
            description: 'Alibaba QwenCode CLI tool',
            website: 'https://qwen.aliyun.com'
        },
        {
            name: 'iflow',
            displayName: 'iFlow CLI',
            npmPackage: '@iflow-ai/iflow-cli@latest',
            description: 'iFlow CLI tool',
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
            description: 'GitHub Copilot CLI tool',
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

    // Detect AI tool installation function with smart command name variants
    async function checkToolInstallation(toolName) {
        // Generate possible command name variations
        const possibleNames = [
            toolName,                                     // Original name (e.g., qoder)
            `${toolName}cli`,                             // Add 'cli' suffix (e.g., qodercli)
            `${toolName}-cli`,                            // Add '-cli' suffix (e.g., qoder-cli)
            `${toolName}cmd`,                             // Add 'cmd' suffix (e.g., qodercmd)
            `${toolName}-cmd`,                            // Add '-cmd' suffix (e.g., qoder-cmd)
            `${toolName}tool`,                            // Add 'tool' suffix (e.g., qodertool)
            `${toolName}-tool`,                           // Add '-tool' suffix (e.g., qoder-tool)
            toolName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()  // Convert camelCase to kebab-case
        ];

        // Remove duplicates while preserving order
        const uniqueNames = [...new Set(possibleNames)];

        // Try each possible name variation
        for (const commandName of uniqueNames) {
            // 1. First, try the standard where/which command check
            try {
                const { spawnSync } = await import('child_process');
                let result;
                if (process.platform === 'win32') {
                    result = spawnSync('where', [commandName], { stdio: 'pipe' });
                } else {
                    result = spawnSync('which', [commandName], { stdio: 'pipe' });
                }

                if (result.status === 0 && result.stdout.toString().trim() !== '') {
                    return true;
                }
            } catch (e) {
                // If where/which fails, continue to try next possible name
            }

            // 2. Try version command check (more reliable than just existence)
            try {
                const { spawnSync } = await import('child_process');
                const versionCommands = [
                    `${commandName} --version`,
                    `${commandName} -v`,
                    `${commandName} version`
                ];

                for (const cmd of versionCommands) {
                    try {
                        const result = spawnSync(cmd, { shell: true, stdio: 'pipe', timeout: 3000 });
                        if (result.status === 0 && (result.stdout.toString().trim() !== '' || result.stderr.toString().trim() !== '')) {
                            return true;
                        }
                    } catch (cmdError) {
                        // Try next version command
                        continue;
                    }
                }
            } catch (e) {
                // If version command fails, continue to try next possible name
            }
        }

        // 3. Finally, try npm list check as fallback
        try {
            const { spawnSync } = require('child_process');
            const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
            if (npmResult.status === 0 && npmResult.stdout) {
                // Check if the tool name appears in npm output (for any variant)
                return npmResult.stdout.includes(toolName);
            }
        } catch (e2) {
            // Ignore npm check errors
        }

        return false;
    }

    // Detect installed AI tools
    async function detectInstalledTools() {
        console.log('[DETECT] Detecting AI tools installed in your system...');

        const installedTools = [];
        const notInstalledTools = [];

        for (const tool of AI_TOOLS) {
            const isInstalled = await checkToolInstallation(tool.name);
            if (isInstalled) {
                installedTools.push(tool);
                console.log(`[OK] ${tool.displayName} - Installed`);
            } else {
                notInstalledTools.push(tool);
                console.log(`[X] ${tool.displayName} - Not installed`);
            }
        }

        return { installedTools, notInstalledTools };
    }

    // Install specified tools
    async function installTools(toolsToInstall) {
        if (toolsToInstall.length === 0) {
            console.log('\n[OK] No additional tools needed, continuing system configuration...');
            return;
        }

        console.log(`\n[INSTALL] Installing ${toolsToInstall.length} AI tools...`);

        for (const toolName of toolsToInstall) {
            // Find tool info
            const tool = AI_TOOLS.find(t => t.name === toolName);
            if (!tool) continue;

            console.log(`\n[INSTALL] Installing ${tool.displayName}...`);

            const { spawn } = await import('child_process');
            await new Promise((resolve) => {
                // Handle npm package names with extra arguments (like codex)
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
                        console.log(`[OK] ${tool.displayName} installation successful`);
                    }
                });

                installProcess.stderr.on('data', (data) => {
                    // Ignore most npm warnings, only show critical errors
                    const errOutput = data.toString();
                    if (errOutput.includes('WARN') || errOutput.includes('deprecated')) {
                        return; // Ignore warnings
                    }
                    if (errOutput.includes('ERR') || errOutput.includes('error')) {
                        console.log(`[ERROR] ${tool.displayName} installation error: ${errOutput.trim()}`);
                    }
                });

                installProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log(`[OK] ${tool.displayName} installation completed`);
                    } else {
                        console.log(`[WARN] ${tool.displayName} installation may not be complete (exit code: ${code})`);
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

    // Determine specific CLI tool installation arguments
    function determineInstallArgs(cliName) {
        // Different CLI tools have different parameter formats to trigger installation
        const installArgMap = {
            'claude': ['--install'], // Claude script supports --install
            'gemini': ['--install'], // Gemini script supports --install
            'qwen': ['--install'],   // QwenCode script supports --install
            'iflow': ['--install'],  // iFlow script supports --install
            'qoder': ['--install'],  // Qoder script supports --install
            'codebuddy': ['--install'], // CodeBuddy script supports --install
            'codex': ['--install'],  // Codex script supports --install
            'copilot': ['--force'],  // Copilot script uses --force for installation
            'ollama': []             // Ollama has no integrated script
        };

        // Return corresponding installation arguments array
        return installArgMap[cliName] || ['--install'];
    }

    // Detect CLI tool availability function (consistent with checkToolInstallation)
    async function checkToolAvailable(cliName) {
        try {
            // Check if command is available
            const { spawnSync } = await import('child_process');
            let result;
            if (process.platform === 'win32') {
                result = spawnSync('where', [cliName], { stdio: 'pipe' });
            } else {
                result = spawnSync('which', [cliName], { stdio: 'pipe' });
            }

            return result.status === 0;
        } catch (e) {
            // If system command fails, try npm check
            try {
                const { spawnSync } = require('child_process');
                const npmResult = spawnSync('npm', ['list', '-g', '--depth=0'], { encoding: 'utf-8' });
                if (npmResult.status === 0 && npmResult.stdout) {
                    return npmResult.stdout.includes(cliName);
                }
            } catch (e2) {
                // Ignore npm check errors
            }
            return false;
        }
    }

    // Configure system - run local init command, configure plugins for all installed CLIs
    async function configureSystem() {
        console.log('\n[CONFIG] Configuring Stigmergy CLI collaboration system...');

        // Detect if all supported CLI tools are installed
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

        // Detect if each CLI tool is available
        const availableCLIs = [];
        const unavailableCLIs = [];

        for (const cliInfo of allCLITools) {
            const available = await checkToolAvailable(cliInfo.name);
            if (available) {
                availableCLIs.push(cliInfo);
                console.log(`[OK] ${cliInfo.displayName} - Available`);
            } else {
                unavailableCLIs.push(cliInfo);
                console.log(`[X] ${cliInfo.displayName} - Unavailable`);
            }
        }

        console.log(`\n[INFO] Detection results: ${availableCLIs.length} available, ${unavailableCLIs.length} unavailable`);

        // Initialize project configuration
        try {
            const projectPath = process.cwd();
            console.log('\n[INIT] Initializing Stigmergy CLI project...');

            // Validate and fix path - ensure not creating project files in system root directory
            let safeProjectPath = projectPath;
            if (safeProjectPath === '/' || safeProjectPath === 'C:\\' || safeProjectPath === 'D:\\' ||
                safeProjectPath === 'E:\\' || safeProjectPath.endsWith(':\\')) {
                // If user is running in disk root directory, create a dedicated project directory
                console.log('[WARN] Detected running in disk root directory, will automatically create project directory for initialization');

                // Create numbered project directory
                let projectDirName = 'ProjStig';
                let counter = 1;
                let targetDir = join(safeProjectPath, projectDirName);

                // Check if directory exists, add number if exists
                while (await directoryExists(targetDir)) {
                    targetDir = join(safeProjectPath, `${projectDirName}${counter}`);
                    counter++;
                }

                // Create project directory
                await fs.mkdir(targetDir, { recursive: true });
                safeProjectPath = targetDir;
                console.log(`[DIR] Project directory created successfully: ${safeProjectPath}`);
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

            console.log(`[OK] Stigmergy project initialization completed!`);
            if (availableCLIs.length > 0) {
                console.log(`[INFO] Configuring collaboration for ${availableCLIs.length} installed AI CLI tools:`, availableCLIs.map(a => a.name).join(', '));
            } else {
                console.log(`[INFO] No installed AI CLI tools detected`);
            }

            // Generate configuration documents for all installed CLIs
            for (const cliInfo of availableCLIs) {
                // Ensure md file is generated in project directory not system root
                const mdPath = join(safeProjectPath, `${cliInfo.name}.md`);

                try {
                    // Generate basic configuration document for CLI
                    const mdContent = `# ${cliInfo.displayName} Configuration

## Basic Information
- **Name**: ${cliInfo.name}
- **Display Name**: ${cliInfo.displayName}
- **Status**: Installed
- **Required**: ${cliInfo.required ? 'Yes' : 'No'}

## Stigmergy Collaboration Configuration
This tool has been configured to participate in the cross-AI tool collaboration system.

## Collaboration Command Examples
- Chinese: "请用${cliInfo.name}帮我{任务}"
- English: "use ${cliInfo.name} to {task}"

---
Generated at: ${new Date().toISOString()}
`;
                    await fs.writeFile(mdPath, mdContent);
                    console.log(`[OK] Generated ${cliInfo.name}.md`);
                } catch (error) {
                    console.log(`[WARN] Failed to generate ${cliInfo.name}.md: ${error.message}`);
                }
            }

            console.log('[OK] Project configuration completed');

            // Configure integration plugins for installed CLIs (if supported)
            console.log('\n[SYNC] Configuring collaboration plugins for installed CLIs...');
            for (const cliInfo of availableCLIs) {
                try {
                    // Check if corresponding integration installation script exists
                    const adapterDirName = mapAdapterName(cliInfo.name); // Use mapping function to handle qwen->qwencode
                    const installScriptPath = join(__dirname, 'adapters', adapterDirName, `install_${adapterDirName}_integration.py`);

                    // Check if file exists using fs
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
                        console.log(`\n[SYNC] Configuring ${cliInfo.displayName} integration plugin...`);

                        // Different CLIs may use different installation parameters
                        const installArgs = determineInstallArgs(cliInfo.name);

                        const childProcess = await import('child_process');
                        const { spawn } = childProcess;

                        // For Copilot, need to handle path issues in npx environment
                        let additionalEnv = {};
                        if (cliInfo.name === 'copilot') {
                            // Set project root directory environment variable to help Python script find configuration file
                            // __dirname is src directory, so need to get parent directory as project root
                            const projectRoot = join(__dirname, '..');  // From src directory back to project root
                            additionalEnv = {
                                ...process.env,
                                PROJECT_ROOT: projectRoot,
                                STIGMERGY_PROJECT_ROOT: projectRoot
                            };
                        } else {
                            additionalEnv = process.env;
                        }

                        // Run integration installation script with CLI-specific installation parameters
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
                            // Filter verbose output
                            if (!line.includes('CLI Cross-CLI Collaboration Integration Installer') &&
                                !line.includes('QwenCode CLI Cross-CLI Collaboration Integration Installer') &&
                                !line.includes('Copilot CLI Cross-CLI Integration Installation Script')) {
                                console.log(line.trim());
                            }
                        });

                        integrationProcess.stderr.on('data', (data) => {
                            const errorLine = data.toString().trim();
                            // Filter specific Python errors
                            if (!errorLine.includes('CLADE_CONFIG_DIR') && // Claude script error
                                !errorLine.includes('argument --install: ignored explicit argument') && // Copilot parameter error
                                !errorLine.includes('No such file or directory') && // Copilot path error
                                !errorLine.includes('loading config file failed') && // Copilot config file error
                                errorLine.length > 0) {
                                console.error(errorLine);
                            }
                        });

                        await new Promise((resolve) => {
                            integrationProcess.on('close', (integrationCode) => {
                                if (integrationCode === 0) {
                                    console.log(`[OK] ${cliInfo.displayName} integration plugin configuration successful`);
                                } else {
                                    console.log(`[WARN] ${cliInfo.displayName} integration plugin configuration may not be complete (exit code: ${integrationCode})`);
                                }
                                resolve();
                            });
                        });
                    } else {
                        console.log(`[INFO] ${cliInfo.displayName} - No special integration plugin configuration available`);
                    }
                } catch (error) {
                    console.log(`[WARN] ${cliInfo.displayName} integration plugin configuration error: ${error.message}`);
                }
            }

            console.log('\n[OK] System configuration successful');
        } catch (error) {
            console.log(`[ERROR] System configuration failed: ${error.message}`);
        }
    }


    // Prompt for user input (use command line arguments instead of inquirer)
    async function promptForTools(notInstalledTools) {
        if (notInstalledTools.length === 0) {
            console.log('\n[SUCCESS] You have already installed all supported AI tools!');
            return [];
        }

        console.log('\n[TARGET] The following additional AI tools are available for installation:');
        for (let i = 0; i < notInstalledTools.length; i++) {
            const tool = notInstalledTools[i];
            console.log(`${i + 1}. ${tool.displayName} - ${tool.description}`);
            console.log(`   npm package: ${tool.npmPackage}`);
        }

        console.log('\n[TIP] Tip: You can manually install these tools later with "npm install -g <package>"');
        console.log('   Or select tool numbers to install now, separated by spaces (e.g. 1 3 4), 0 to skip all:');

        return new Promise(async (resolve) => {
            const readline = await import('readline');
            const { createInterface } = readline;
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Please select tool numbers to install: ', (answer) => {
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

    // Install stigmergy globally automatically
    async function installStigmergyGlobally() {
        console.log('\n[GLOBAL] Installing stigmergy globally...');

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
                        console.log('[OK] stigmergy successfully installed globally!');
                        console.log('      You can now run from any directory: stigmergy <command>');
                        resolve();
                    } else {
                        console.log('[WARN] Global installation may not have succeeded, but you can install manually:');
                        console.log('      npm install -g stigmergy');
                        resolve(); // Don't block process
                    }
                });

                installProcess.on('error', (error) => {
                    console.log('[WARN] Global installation failed, you can install manually:');
                    console.log('      npm install -g stigmergy');
                    console.log(`      Error: ${error.message}`);
                    resolve(); // Don't block process
                });
            });
        } catch (error) {
            console.log('[WARN] Global installation failed, you can install manually:');
            console.log('      npm install -g stigmergy');
            console.log(`      Error: ${error.message}`);
        }
    }

    // Show initialization guide
    function showInitializationGuide() {
        console.log('\n[SUCCESS] Deployment completed! Here is the usage guide:');
        console.log('\n[QUICK] Quick Start:');
        console.log('  Now globally installed! Can run from any directory:');
        console.log('  • Initialize project: stigmergy init');
        console.log('  • Check status: stigmergy status');
        console.log('  • Scan environment: stigmergy scan');
        console.log('');
        console.log('  Or use NPX (no installation required):');
        console.log('  • Initialize project: npx stigmergy@latest init');
        console.log('  • Check status: npx stigmergy@latest status');
        console.log('  • Scan environment: npx stigmergy@latest scan');

        console.log('\n[WARN] Important Notice:');
        console.log('  Newly installed CLI tools require registration or configuration of third-party API tokens:');
        console.log('');

        console.log('\n[CONFIG] CLI Tool Startup Commands:');
        console.log('  • Claude CLI:     claude');
        console.log('  • Gemini CLI:     gemini');
        console.log('  • QwenCode CLI:   qwen');
        console.log('  • iFlow CLI:       iflow');
        console.log('  • Qoder CLI:       qodercli');
        console.log('  • CodeBuddy CLI:   codebuddy');
        console.log('  • GitHub Copilot:  gh copilot');
        console.log('  • OpenAI Codex:    codex');

        console.log('\n[WORKFLOW] Recommended Workflow:');
        console.log('  1. Create project directory:');
        console.log('     mkdir my-ai-project');
        console.log('     cd my-ai-project');
        console.log('');
        console.log('  2. Initialize project:');
        console.log('     stigmergy init');
        console.log('     Or: npx stigmergy@latest init');
        console.log('');
        console.log('  3. Use CLI tools from any directory:');
        console.log('     claude "Design a user authentication system"');
        console.log('     gemini "Implement this design using qwen"');
        console.log('     qwen "Create development workflow using iflow"');

        console.log('\n[KEY] API Configuration Guide:');
        console.log('  • Claude: Requires ANTHROPIC_API_KEY');
        console.log('  • Gemini: Requires GOOGLE_API_KEY');
        console.log('  • QwenCode: Requires DASHSCOPE_API_KEY');
        console.log('  • iFlow: Requires registration to get API key');
        console.log('  • Qoder: Requires registration to get API key');
        console.log('  • CodeBuddy: Requires WeChat QR authentication or TENCENT_SECRET_ID/KEY');
        console.log('  • Copilot: Requires GitHub account login');
        console.log('  • Codex: Requires OPENAI_API_KEY');

        console.log('\n[DEPLOY] Cross-AI Tool Collaboration Examples:');
        console.log('  - Use collaboration commands directly in CLI tools:');
        console.log('    Example: qwen "Help me translate this code using gemini"');
        console.log('    Example: gemini "Analyze this requirement using qwen"');
        console.log('    Example: claude "Create workflow using iflow"');

        console.log('\n[ADVANCED] Advanced Features:');
        console.log('  - Project background sharing: All AI tools share PROJECT_SPEC.json');
        console.log('  - Task assignment: Automatic allocation and tracking of collaboration tasks');
        console.log('  - Stigmergy collaboration: Indirect collaboration through environmental cues');

        console.log('\n[LINK] Want to learn more? Visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        console.log('\n[SUCCESS] Success in your multi-AI tool collaboration!');
    }

    try {
        // Detect installed AI tools
        const { installedTools, notInstalledTools } = await detectInstalledTools();

        // Ask user if to install more tools
        const toolsToInstall = await promptForTools(notInstalledTools);

        // Install selected tools
        await installTools(toolsToInstall);

        // Configure system
        await configureSystem();

        // Install stigmergy globally automatically
        await installStigmergyGlobally();

        // Show usage guide
        showInitializationGuide();
    } catch (error) {
        console.error(`\n[ERROR] Error occurred during deployment: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();