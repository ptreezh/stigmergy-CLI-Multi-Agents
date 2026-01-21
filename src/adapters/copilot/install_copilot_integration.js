#!/usr/bin/env node

/**
 * Copilot CLI Cross-CLI Integration Installer
 * 
 * Automatically installs and configures Copilot CLI cross-CLI integration features
 * including MCP server registration, custom agent creation, and permission configuration
 * 
 * 使用方法：
 * node install_copilot_integration.js [--config=path] [--force] [--uninstall] [--verbose]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class CopilotIntegrationInstaller {
  constructor(configPath = null, force = false) {
    this.scriptDir = __dirname;
    // Use script directory as project root for standalone installation
    this.projectRoot = path.join(this.scriptDir, '..', '..', '..');
    this.force = force;
    this.startTime = Date.now();

    if (configPath) {
      this.configPath = path.resolve(configPath);
    } else {
      // In npx environment, may need to search for config file in multiple locations
      const possiblePaths = [
        path.join(this.scriptDir, 'config.json'),  // Standard location - should be the most likely path
        path.join(this.scriptDir, '..', 'copilot', 'config.json'),  // In adapters/copilot/
        path.join(__dirname, 'config.json'),  // Using script directory - also standard location
      ];

      // Check environment variables to get project root directory
      const projectRootEnv = process.env.STIGMERGY_PROJECT_ROOT || '';
      if (projectRootEnv) {
        // Add environment variable specified path to search list
        const envConfigPath = path.join(projectRootEnv, 'src', 'adapters', 'copilot', 'config.json');
        possiblePaths.push(envConfigPath);
      }

      let configFound = false;
      for (const configPathOption of possiblePaths) {
        try {
          require('fs').accessSync(configPathOption);
          this.configPath = configPathOption;
          console.log(`Using config file: ${configPathOption}`);
          configFound = true;
          break;
        } catch (error) {
          // File doesn't exist, continue searching
        }
      }

      if (!configFound) {
        // If all options fail, use default location and dynamically create config
        this.configPath = path.join(this.scriptDir, 'config.json');

        // Create default config content
        const defaultConfig = {
          name: 'copilot',
          displayName: 'GitHub Copilot CLI',
          version: '1.0.0',
          integration_type: 'mcp_server',
          config_file: '~/.config/copilot/config.json',
          global_doc: 'copilot.md',
          description: 'GitHub Copilot CLI MCP Server Integration Adapter',
          mcp_config: {
            server_name: 'stigmergy-copilot-integration',
            command: 'node',
            args: [
              'src/adapters/copilot/mcp_server.js'
            ],
            environment: {
              NODE_PATH: '.',
              STIGMERGY_CONFIG_PATH: '~/.stigmergy',
              COPILOT_ADAPTER_MODE: 'cross_cli'
            },
            health_check_interval: 30,
            timeout: 60
          },
          custom_agents: {
            cross_cli_caller: {
              name: 'CrossCLICaller',
              description: 'Cross-CLI Tool Calling Agent',
              version: '1.0.0',
              tools: [
                'cross_cli_execute',
                'get_available_clis',
                'check_cli_status'
              ],
              permissions: [
                'execute_external_cli',
                'read_config',
                'write_logs'
              ]
            }
          },
          supported_cli_tools: [
            'claude',
            'gemini',
            'qwen',
            'iflow',
            'qoder',
            'codebuddy',
            'codex'
          ],
          permissions: {
            execute_external_cli: {
              description: 'Execute external CLI tools',
              level: 'high',
              requires_approval: false
            },
            read_config: {
              description: 'Read CLI config files',
              level: 'medium',
              requires_approval: false
            },
            write_logs: {
              description: 'Write to log files',
              level: 'low',
              requires_approval: false
            }
          },
          adapter: {
            name: 'Copilot MCP Integration Adapter',
            version: '1.0.0',
            type: 'mcp_server',
            module_path: 'src.adapters.copilot.mcp_adapter',
            class_name: 'CopilotMCPIntegrationAdapter',
            features: [
              'cross_cli_detection',
              'command_routing',
              'result_formatting',
              'collaboration_tracking'
            ]
          }
        };

        // Create config file
        try {
          require('fs').mkdirSync(path.dirname(this.configPath), { recursive: true });
          require('fs').writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2));
          console.log(`[OK] Created default config file: ${this.configPath}`);
        } catch (error) {
          console.error(`Failed to create default config file: ${error.message}`);
          throw error;
        }

        console.log(`Using dynamically created config file: ${this.configPath}`);
      }
    }

    this.config = this._loadConfig();

    // Copilot related paths
    this.homeDir = os.homedir();
    this.copilotDir = path.join(this.homeDir, '.copilot');
    this.mcpConfigFile = path.join(this.copilotDir, 'mcp-config.json');
    this.customAgentsDir = path.join(this.copilotDir, 'agents');

    // Project paths - fallback to script directory if src doesn't exist
    this.srcDir = path.join(this.projectRoot, 'src');
    try {
      require('fs').accessSync(this.srcDir);
    } catch (error) {
      this.srcDir = this.scriptDir;
    }
  }

  /**
   * Load config file
   */
  _loadConfig() {
    try {
      const data = require('fs').readFileSync(this.configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load config file: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Execute full installation process
   */
  async install() {
    try {
      console.log('Starting Copilot CLI cross-CLI integration installation...');

      // 1. Check environment
      if (!await this._checkEnvironment()) {
        return false;
      }

      // 2. Create config directories
      if (!await this._createDirectories()) {
        return false;
      }

      // 3. Install MCP server config
      if (!await this._installMcpServer()) {
        return false;
      }

      // 4. Create custom agents
      if (!await this._createCustomAgents()) {
        return false;
      }

      // 5. Setup permissions config
      if (!await this._setupPermissions()) {
        return false;
      }

      // 6. Create global Cross-CLI documentation
      await this._createGlobalCrossCliDocumentation();

      // 7. Verify installation
      if (!await this._verifyInstallation()) {
        return false;
      }

      console.log('[OK] Copilot CLI cross-CLI integration installed successfully!');
      this._printUsageInstructions();
      return true;

    } catch (error) {
      console.error(`Installation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check installation environment
   */
  async _checkEnvironment() {
    console.log('Checking installation environment...');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 14) {
      console.error('Node.js 14 or higher required');
      return false;
    }

    // Check if Copilot CLI is installed
    try {
      await this._runCommand('copilot', ['--version'], { timeout: 5000 });
    } catch (error) {
      console.warn('Copilot command not found, please ensure GitHub Copilot CLI is installed');
      console.info('Installation method: npm install -g @github/copilot');
    }

    // Check adapter file
    const adapterFile = path.join(this.scriptDir, 'mcp_adapter.js');
    try {
      await fs.access(adapterFile);
    } catch (error) {
      console.warn(`Adapter file does not exist: ${adapterFile}`);
      console.info('Continuing without adapter file...');
    }

    console.log('[OK] Environment check passed');
    return true;
  }

  /**
   * Create necessary directories
   */
  async _createDirectories() {
    console.log('Creating config directories...');

    const directories = [
      this.copilotDir,
      this.customAgentsDir,
      path.join(this.copilotDir, 'logs'),
      path.join(this.copilotDir, 'sessions')
    ];

    for (const directory of directories) {
      try {
        await fs.mkdir(directory, { recursive: true });
        console.log(`Created directory: ${directory}`);
      } catch (error) {
        console.error(`Failed to create directory ${directory}: ${error.message}`);
        return false;
      }
    }

    console.log('[OK] Directories created successfully');
    return true;
  }

  /**
   * Install MCP server config
   */
  async _installMcpServer() {
    console.log('Installing MCP server config...');

    try {
      // Read existing MCP config
      const mcpConfig = await this._loadExistingMcpConfig();

      // Add our MCP server
      const mcpServers = mcpConfig.mcpServers || {};
      const serverName = this.config.mcp_config.server_name;

      if (serverName in mcpServers && !this.force) {
        console.log(`MCP server '${serverName}' already exists, skipping...`);
        return true;
      }

      // Build MCP server config
      // Use script directory as base path
      const mcpServerConfig = {
        command: this.config.mcp_config.command,
        args: this.config.mcp_config.args,
        env: this.config.mcp_config.environment
      };

      // Add Node.js path to environment variables
      const nodePath = this.scriptDir;
      if ('NODE_PATH' in mcpServerConfig.env) {
        mcpServerConfig.env.NODE_PATH = `${nodePath}:${mcpServerConfig.env.NODE_PATH}`;
      } else {
        mcpServerConfig.env.NODE_PATH = nodePath;
      }

      mcpServers[serverName] = mcpServerConfig;
      mcpConfig.mcpServers = mcpServers;

      // Save config
      await fs.writeFile(this.mcpConfigFile, JSON.stringify(mcpConfig, null, 2));

      console.log(`[OK] MCP server config saved to: ${this.mcpConfigFile}`);
      return true;

    } catch (error) {
      console.error(`Failed to install MCP server: ${error.message}`);
      return false;
    }
  }

  /**
   * Load existing MCP config
   */
  async _loadExistingMcpConfig() {
    try {
      await fs.access(this.mcpConfigFile);
      const data = await fs.readFile(this.mcpConfigFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or can't be read, return default config
      return {
        mcpServers: {}
      };
    }
  }

  /**
   * Create custom agents
   */
  async _createCustomAgents() {
    console.log('Creating custom agents...');

    try {
      for (const [agentName, agentConfig] of Object.entries(this.config.custom_agents)) {
        const agentFile = path.join(this.customAgentsDir, `${agentName}.json`);

        try {
          await fs.access(agentFile);
          if (!this.force) {
            console.log(`Agent '${agentName}' already exists, skipping...`);
            continue;
          }
        } catch (error) {
          // File doesn't exist, continue
        }

        // Create agent config
        const agentData = {
          name: agentConfig.name,
          description: agentConfig.description,
          version: agentConfig.version,
          instructions: this._getAgentInstructions(agentName),
          tools: agentConfig.tools,
          permissions: agentConfig.permissions
        };

        await fs.writeFile(agentFile, JSON.stringify(agentData, null, 2));
        console.log(`Created agent: ${agentName}`);
      }

      console.log('[OK] Custom agents created successfully');
      return true;

    } catch (error) {
      console.error(`Failed to create custom agents: ${error.message}`);
      return false;
    }
  }

  /**
   * Get agent instructions
   */
  _getAgentInstructions(agentName) {
    const instructions = {
      cross_cli_caller: `You are a cross-CLI integration agent that helps users collaborate between different AI CLI tools.

When you detect a request to use another CLI tool (like Claude, Gemini, Qwen, iFlow, etc.):
1. Parse the target CLI and task from the user's request
2. Execute the task using the appropriate CLI tool
3. Return the results in a clear, structured format

Support both Chinese and English collaboration patterns:
- "请用{CLI}帮我{task}" -> Use {CLI} to help with {task}
- "调用{CLI}来{task}" -> Call {CLI} to {task}
- "use {CLI} to {task}" -> Execute {task} with {CLI}
- "call {CLI} to {task}" -> Call {CLI} to execute {task}

Available tools:
- cross_cli_execute: Execute tasks on other CLI tools
- get_available_clis: Get list of available CLI tools
- check_cli_status: Check status of a specific CLI tool

Always maintain the original intent and context of the user's request.
Provide clear, structured results with execution details.`
    };

    return instructions[agentName] || 'Cross-CLI integration agent';
  }

  /**
   * Setup permissions config
   */
  async _setupPermissions() {
    console.log('Setting up permissions config...');

    try {
      const permissionsConfigFile = path.join(this.copilotDir, 'permissions.json');

      const permissionsConfig = {
        version: '1.0',
        permissions: this.config.permissions,
        created_at: new Date().toISOString(),
        adapter_version: this.config.adapter.version
      };

      await fs.writeFile(permissionsConfigFile, JSON.stringify(permissionsConfig, null, 2));

      console.log('[OK] Permissions config setup completed');
      return true;

    } catch (error) {
      console.error(`Failed to setup permissions config: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify installation
   */
  async _verifyInstallation() {
    console.log('Verifying installation...');

    // Check MCP config file
    try {
      await fs.access(this.mcpConfigFile);
    } catch (error) {
      console.error('MCP config file does not exist');
      return false;
    }

    // Check custom agents
    for (const agentName of Object.keys(this.config.custom_agents)) {
      const agentFile = path.join(this.customAgentsDir, `${agentName}.json`);
      try {
        await fs.access(agentFile);
      } catch (error) {
        console.error(`Agent file does not exist: ${agentFile}`);
        return false;
      }
    }

    // Verify MCP config format
    try {
      const data = await fs.readFile(this.mcpConfigFile, 'utf8');
      const mcpConfig = JSON.parse(data);

      const serverName = this.config.mcp_config.server_name;
      if (!(serverName in (mcpConfig.mcpServers || {}))) {
        console.error(`MCP server config not found: ${serverName}`);
        return false;
      }

    } catch (error) {
      console.error(`Failed to verify MCP config: ${error.message}`);
      return false;
    }

    console.log('[OK] Installation verified successfully');
    return true;
  }

  /**
   * Print usage instructions
   */
  _printUsageInstructions() {
    console.log('\n' + '='.repeat(60));
    console.log('Copilot CLI Cross-CLI Integration Installation Complete!');
    console.log('='.repeat(60));
    console.log('\n[INFO] Usage Instructions:');
    console.log('1. Start Copilot CLI:');
    console.log('   copilot');
    console.log('\n2. Cross-CLI calling examples:');
    console.log('   Chinese: "请用claude帮我写一个Python脚本"');
    console.log('   English: "use gemini to analyze this code"');
    console.log('\n3. Available agents:');
    for (const agentName of Object.keys(this.config.custom_agents)) {
      console.log(`   - ${agentName}`);
    }
    console.log('\n4. Supported CLI tools:');
    for (const cliTool of this.config.supported_cli_tools) {
      console.log(`   - ${cliTool}`);
    }
    console.log('\nConfig file locations:');
    console.log(`   MCP config: ${this.mcpConfigFile}`);
    console.log(`   Custom agents: ${this.customAgentsDir}`);
    console.log('\nSee project documentation for more information');
  }

  /**
   * Create global Cross-CLI communication documentation
   */
  async _createGlobalCrossCliDocumentation() {
    try {
      const docContent = `# Copilot CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;

      const docPath = path.join(this.copilotDir, 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent);

      console.log(`[OK] Created Cross-CLI Communication Guide: ${docPath}`);

      // If copilot.md file exists, append Cross-CLI communication hint to the end
      const copilotMdPath = path.join(this.copilotDir, 'copilot.md');
      try {
        await fs.access(copilotMdPath);
        
        const crossCliContent = `

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
        await fs.appendFile(copilotMdPath, crossCliContent);
        console.log('[OK] Appended Cross-CLI communication hint to COPILOT.MD');
      } catch (error) {
        // File may not exist, ignore
      }

    } catch (error) {
      console.warn(`Failed to create Cross-CLI Communication Guide: ${error.message}`);
    }
    console.log('='.repeat(60));
  }

  /**
   * Uninstall integration
   */
  async uninstall() {
    console.log('Uninstalling Copilot CLI cross-CLI integration...');

    try {
      // 1. Remove MCP server config
      try {
        const mcpConfig = await this._loadExistingMcpConfig();
        const serverName = this.config.mcp_config.server_name;

        if (serverName in (mcpConfig.mcpServers || {})) {
          delete mcpConfig.mcpServers[serverName];

          await fs.writeFile(this.mcpConfigFile, JSON.stringify(mcpConfig, null, 2));
          console.log(`Removed MCP server config: ${serverName}`);
        }
      } catch (error) {
        console.warn(`Failed to remove MCP server config: ${error.message}`);
      }

      // 2. Remove custom agents
      for (const agentName of Object.keys(this.config.custom_agents)) {
        const agentFile = path.join(this.customAgentsDir, `${agentName}.json`);
        try {
          await fs.unlink(agentFile);
          console.log(`Removed agent: ${agentName}`);
        } catch (error) {
          // File may not exist, ignore
        }
      }

      console.log('[OK] Uninstallation completed');
      return true;

    } catch (error) {
      console.error(`Uninstallation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper method: Run command
   */
  async _runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        stdio: 'pipe',
        ...options 
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  let configPath = null;
  let force = false;
  let uninstall = false;
  let verbose = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--config=')) {
      configPath = arg.substring(9);
    } else if (arg === '--config' && i + 1 < args.length) {
      configPath = args[++i];
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--uninstall') {
      uninstall = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    }
  }

  if (verbose) {
    process.env.DEBUG = 'true';
  }

  const installer = new CopilotIntegrationInstaller(configPath, force);

  let success;
  if (uninstall) {
    success = await installer.uninstall();
  } else {
    success = await installer.install();
  }

  process.exit(success ? 0 : 1);
}

// Export module
module.exports = CopilotIntegrationInstaller;

// If run directly
if (require.main === module) {
  main().catch(error => {
    console.error('[FATAL]', error.message);
    process.exit(1);
  });
}