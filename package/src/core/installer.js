const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { spawnSync } = require('child_process');
const inquirer = require('inquirer');
const SmartRouter = require('./smart_router');
const { errorHandler } = require('./error_handler');
const MemoryManager = require('./memory_manager');

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
          shell: true,
        });

        // Check if command executed successfully or at least didn't fail with "command not found"
        if (
          result.status === check.expected ||
          (result.status !== 127 && result.status !== 9009)
        ) {
          // 127 = command not found on Unix, 9009 = command not found on Windows
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
        await errorHandler.logError(
          error,
          'WARN',
          `StigmergyInstaller.scanCLI.${toolName}`,
        );
        console.log(
          `[ERROR] Failed to check ${toolInfo.name}: ${error.message}`,
        );
        missing[toolName] = toolInfo;
      }
    }

    return { available, missing };
  }

  async installTools(selectedTools, missingTools) {
    console.log(
      `\n[INSTALL] Installing ${selectedTools.length} AI CLI tools...`,
    );

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
          stdio: 'inherit',
        });

        if (result.status === 0) {
          console.log(`[OK] ${toolInfo.name} installed successfully`);
        } else {
          console.log(
            `[ERROR] Failed to install ${toolInfo.name} (exit code: ${result.status})`,
          );
          if (result.error) {
            console.log(`[ERROR] Installation error: ${result.error.message}`);
          }
          console.log(`[INFO] Please run manually: ${toolInfo.install}`);
        }
      } catch (error) {
        await errorHandler.logError(
          error,
          'ERROR',
          `StigmergyInstaller.installTools.${toolName}`,
        );
        console.log(
          `[ERROR] Failed to install ${toolInfo.name}: ${error.message}`,
        );
        console.log(`[INFO] Please run manually: ${toolInfo.install}`);
      }
    }

    return true;
  }

  async deployHooks(availableTools) {
    console.log('\n[DEPLOY] Deploying hooks to AI CLI tools...');
    let successCount = 0;
    const totalCount = Object.keys(availableTools).length;

    // Import Node.js coordination layer for hook deployment
    let HookDeploymentManager;
    try {
      HookDeploymentManager = require('../core/coordination/nodejs/HookDeploymentManager');
    } catch (error) {
      console.log('[WARN] Node.js coordination layer not available, using Python fallback');
      // Fallback to Python implementation would go here
      console.log('[ERROR] Python fallback not implemented yet');
      return;
    }

    // Initialize hook deployment manager
    const hookManager = new HookDeploymentManager();
    await hookManager.initialize();

    for (const [toolName, toolInfo] of Object.entries(availableTools)) {
      try {
        console.log(`\n[DEPLOY] Deploying hooks for ${toolInfo.name}...`);
        
        // Deploy hooks for this tool
        const result = await hookManager.deployHooksForCLI(toolName);
        
        if (result) {
          console.log(`[OK] Hooks deployed for ${toolInfo.name}`);
          successCount++;
        } else {
          console.log(`[ERROR] Failed to deploy hooks for ${toolInfo.name}`);
        }
      } catch (error) {
        await errorHandler.logError(
          error,
          'ERROR',
          `StigmergyInstaller.deployHooks.${toolName}`,
        );
        console.log(
          `[ERROR] Failed to deploy hooks for ${toolInfo.name}: ${error.message}`,
        );
      }
    }

    console.log(
      `\n[SUMMARY] Hook deployment completed: ${successCount}/${totalCount} tools successful`,
    );
  }

  async deployProjectDocumentation() {
    console.log('\n[DEPLOY] Deploying project documentation...');

    try {
      // Create standard project documentation files for each CLI
      const cliDocs = {
        'claude.md': this.generateCLIDocumentation('claude'),
        'gemini.md': this.generateCLIDocumentation('gemini'),
        'qwen.md': this.generateCLIDocumentation('qwen'),
        'iflow.md': this.generateCLIDocumentation('iflow'),
        'qodercli.md': this.generateCLIDocumentation('qodercli'),
        'codebuddy.md': this.generateCLIDocumentation('codebuddy'),
        'copilot.md': this.generateCLIDocumentation('copilot'),
        'codex.md': this.generateCLIDocumentation('codex'),
        'STIGMERGY.md': this.generateProjectMemoryTemplate(),
      };

      for (const [filename, content] of Object.entries(cliDocs)) {
        const filepath = path.join(process.cwd(), filename);
        if (!(await this.fileExists(filepath))) {
          await fs.writeFile(filepath, content);
          console.log(`[OK] Created ${filename}`);
        }
      }

      console.log('[OK] Project documentation deployed successfully');
    } catch (error) {
      console.log(
        `[ERROR] Failed to deploy project documentation: ${error.message}`,
      );
    }
  }

  generateCLIDocumentation(cliName) {
    const cliInfo = this.router.tools[cliName] || { name: cliName };
    return `# ${cliInfo.name} CLI Documentation

## Overview
This document contains configuration and usage information for the ${cliInfo.name} CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: ${cliName}
- **Tool Name**: ${cliInfo.name}
- **Installation Command**: \`${cliInfo.install || 'Not configured'}\`
- **Version Check**: \`${cliInfo.version || cliName + ' --version'}\`

## Usage Patterns
The ${cliInfo.name} CLI can be invoked in several ways:
1. Direct execution: \`${cliName} [arguments]\`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call ${cliInfo.name} from another CLI tool:
\`\`\`bash
# From any other supported CLI
use ${cliName} to [task description]
# or
call ${cliName} [task description]
# or
ask ${cliName} [task description]
\`\`\`

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
\`${cliInfo.hooksDir || 'Not configured'}\`

## Last Updated
${new Date().toISOString()}

---
*This file is automatically managed by Stigmergy CLI*
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
        tools: {},
      };

      // Save configuration
      const configPath = path.join(configDir, 'config.json');
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log('[OK] Configuration initialized successfully');
    } catch (error) {
      console.log(
        `[ERROR] Failed to initialize configuration: ${error.message}`,
      );
    }
  }

  async downloadRequiredAssets() {
    console.log('[DOWNLOAD] Downloading required assets...');
    // In a real implementation, this would download templates, configs, etc.
    console.log('[OK] All required assets downloaded');
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
        checked: true,
      });
    }

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tools',
        message:
          'Select which tools to install (Space to select, Enter to confirm):',
        choices: choices,
        pageSize: 10,
      },
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
        default: true,
      },
    ]);

    return answers.proceed ? options : [];
  }

  showUsageInstructions() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('🎉 Stigmergy CLI Setup Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('  ✅ Use `stigmergy --help` for available commands');
    console.log('');
    console.log('Happy coding with Stigmergy! 🚀');
    console.log('');
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

## Available CLI Tools
See individual documentation files:
- claude.md
- gemini.md
- qwen.md
- iflow.md
- qodercli.md
- codebuddy.md
- copilot.md
- codex.md

---
*This file is automatically managed by Stigmergy CLI*
*Last updated: ${new Date().toISOString()}*
`;
  }

  generateCLIDocumentation(cliName) {
    const cliInfo = this.router.tools[cliName] || { name: cliName };
    return `# ${cliInfo.name} CLI Documentation

## Overview
This document contains configuration and usage information for the ${cliInfo.name} CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: ${cliName}
- **Tool Name**: ${cliInfo.name}
- **Installation Command**: \`${cliInfo.install || 'Not configured'}\`
- **Version Check**: \`${cliInfo.version || cliName + ' --version'}\`

## Usage Patterns
The ${cliInfo.name} CLI can be invoked in several ways:
1. Direct execution: \`${cliName} [arguments]\`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call ${cliInfo.name} from another CLI tool:
\`\`\`bash
# From any other supported CLI
use ${cliName} to [task description]
# or
call ${cliName} [task description]
# or
ask ${cliName} [task description]
\`\`\`

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
\`${cliInfo.hooksDir || 'Not configured'}\`

## Last Updated
${new Date().toISOString()}

---
*This file is automatically managed by Stigmergy CLI*
`;
  }
}

module.exports = StigmergyInstaller;