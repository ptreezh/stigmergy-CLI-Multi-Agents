const chalk = require('chalk');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { spawn, spawnSync } = require('child_process');
const inquirer = require('inquirer');
const SmartRouter = require('./smart_router');
const { errorHandler } = require('./error_handler');
const MemoryManager = require('./memory_manager');
const EnhancedCLIInstaller = require('./enhanced_cli_installer');

class StigmergyInstaller extends EnhancedCLIInstaller {
  constructor(options = {}) {
    super(options);
    this.concurrency = options.concurrency || 6;
    this.router = new SmartRouter();
    this.memory = new MemoryManager();
    this.configDir = path.join(os.homedir(), '.stigmergy');
    this.scanCache = new Map(); // 缓存扫描结果
  }

  async checkCLI(toolName) {
    const tool = this.router.tools[toolName];
    if (!tool) return false;

    // First, check if tool is properly configured
    if (!tool.version && !tool.install) {
      console.log(
        `[DEBUG] Tool ${toolName} has no version/install info, skipping check`,
      );
      return false;
    }

    // Special handling for codex - check if the JS file is valid
    if (toolName === 'codex') {
      try {
        // First check if codex command exists
        const whichCmd = process.platform === 'win32' ? 'where' : 'which';
        const whichResult = spawnSync(whichCmd, [toolName], {
          encoding: 'utf8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
        });

        if (whichResult.status === 0 && whichResult.stdout.trim()) {
          const codexPath = whichResult.stdout.trim().split('\n')[0]; // Get first match

          // If it's a shell script, check the target JS file
          if (
            codexPath.endsWith('.sh') ||
            codexPath.endsWith('.cmd') ||
            codexPath.endsWith('/codex') ||
            codexPath.endsWith('\\codex')
          ) {
            // Try to verify JS file, but don't fail if we can't
            // The actual --version test below is more reliable
            try {
              const fsSync = require('fs');
              const scriptContent = fsSync.readFileSync(codexPath, 'utf8');

              // Look for JS file reference in the script
              // Match node_modules/@openai/codex/bin/codex.js pattern
              const jsFileMatch = scriptContent.match(/node_modules\/@openai\/codex\/bin\/codex\.js/);
              if (jsFileMatch) {
                // Construct actual path based on npm global directory
                const npmGlobalDir = require('path').dirname(codexPath);
                const jsFilePath = require('path').join(npmGlobalDir, jsFileMatch[0]);

                if (fsSync.existsSync(jsFilePath)) {
                  const stats = fsSync.statSync(jsFilePath);
                  if (stats.size === 0) {
                    console.log('[DEBUG] Codex JS file is empty, marking as unavailable');
                    return false;
                  }
                  // File exists and has content - continue to version check
                } else {
                  console.log('[DEBUG] Codex JS file not found at expected path, will try version check');
                }
              }
            } catch (scriptError) {
              console.log(`[DEBUG] Could not verify codex script: ${scriptError.message}`);
              // Continue anyway - the version check below is more reliable
            }
          }

          // If we got here, the codex command exists - continue with normal checks below
        } else {
          // Codex command doesn't exist
          return false;
        }
      } catch (error) {
        console.log(`[DEBUG] Error checking codex: ${error.message}`);
        return false;
      }
    }

    // First try to find the executable using which/where command (more reliable)
    try {
      const whichCmd = process.platform === 'win32' ? 'where' : 'which';
      const whichResult = spawnSync(whichCmd, [toolName], {
        encoding: 'utf8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'], // Use pipes to avoid file opening
        shell: true,
      });

      if (whichResult.status === 0 && whichResult.stdout.trim()) {
        // Found executable, now test it safely
        const testArgs = ['--help'];
        const testOptions = {
          encoding: 'utf8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe'], // Don't inherit from parent to avoid opening UI
          shell: true,
        };

        // Additional protection for codex
        // Note: codex requires shell=true on Windows to work properly
        if (toolName === 'codex') {
          // Keep shell=true for codex (don't override)
          testOptions.windowsHide = true;
          testOptions.detached = false;
        }

        const testResult = spawnSync(toolName, testArgs, testOptions);

        // If command runs successfully or at least returns something (not command not found)
        if (testResult.status === 0 || testResult.status === 1) {
          return true;
        }
      }
    } catch (error) {
      // which/where command probably failed, continue with other checks
      console.log(
        `[DEBUG] which/where check failed for ${toolName}: ${error.message}`,
      );
    }

    // Special handling for codex to avoid opening files
    if (toolName === 'codex') {
      // For codex, only try --help and --version with extra precautions
      // Note: codex requires shell=true on Windows
      const codexChecks = [
        { args: ['--help'], expected: 0 },
        { args: ['--version'], expected: 0 },
      ];

      for (const check of codexChecks) {
        try {
          const result = spawnSync(toolName, check.args, {
            encoding: 'utf8',
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe'], // Ensure all IO is piped
            shell: true, // Use shell for codex compatibility
            windowsHide: true, // Hide console window on Windows
            detached: false, // Don't detach process
          });

          if (result.status === 0 || result.status === 1) {
            return true;
          }
        } catch (error) {
          // Continue to next check
        }
      }
      return false; // If all codex checks fail
    }

    // Fallback: Try multiple ways to check if CLI is available but more safely
    const checks = [
      // Method 1: Try help command (most common and safe)
      { args: ['--help'], expected: 0 },
      // Method 2: Try help command with -h
      { args: ['-h'], expected: 0 },
      // Method 3: Try version command
      { args: ['--version'], expected: 0 },
      // Method 4: Try just the command (help case)
      { args: [], expected: 0 },
    ];

    for (const check of checks) {
      try {
        const result = spawnSync(toolName, check.args, {
          encoding: 'utf8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe'], // Use pipe instead of inherit to avoid opening files
          shell: true,
        });

        // Check if command executed successfully or at least didn't fail with "command not found"
        if (
          result.status === check.expected ||
          (result.status !== 127 &&
            result.status !== 9009 &&
            result.status !== 1) // Also avoid status 1 (general error)
        ) {
          // 127 = command not found on Unix, 9009 = command not found on Windows
          return true;
        }
      } catch (error) {
        // Continue to next check method
        console.log(`[DEBUG] checkCLI error for ${toolName}: ${error.message}`);
        continue;
      }
    }

    return false;
  }

  async scanCLI() {
    console.log('[SCAN] Scanning for AI CLI tools...');
    
    // 检查缓存
    const cacheKey = 'scan_results';
    if (this.scanCache.has(cacheKey)) {
      console.log('[SCAN] Using cached scan results');
      return this.scanCache.get(cacheKey);
    }

    const available = {};
    const missing = {};
    const tools = Object.entries(this.router.tools);

    // 并行扫描所有工具
    const scanPromises = tools.map(async ([toolName, toolInfo]) => {
      // Skip internal functions without install command
      if (!toolInfo.install) {
        return { toolName, status: 'skip' };
      }

      try {
        const isAvailable = await this.checkCLI(toolName);
        return { toolName, status: isAvailable ? 'available' : 'missing', toolInfo };
      } catch (error) {
        await errorHandler.logError(
          error,
          'WARN',
          `StigmergyInstaller.scanCLI.${toolName}`,
        );
        return { toolName, status: 'missing', toolInfo };
      }
    });

    const results = await Promise.all(scanPromises);

    // 处理结果
    for (const result of results) {
      if (result.status === 'skip') {
        continue;
      }

      if (result.status === 'available') {
        console.log(`[OK] ${result.toolInfo.name} is available`);
        available[result.toolName] = result.toolInfo;
      } else {
        console.log(`[MISSING] ${result.toolInfo.name} is not installed`);
        missing[result.toolName] = result.toolInfo;
      }
    }

    // 缓存结果
    const scanResults = { available, missing };
    this.scanCache.set(cacheKey, scanResults);

    return scanResults;
  }

  /**
   * Download required assets for Stigmergy CLI
   */
  async downloadRequiredAssets() {
    // This is a placeholder implementation
    // In a real implementation, this would download required assets
    console.log('[ASSETS] No required assets to download');
    return true;
  }

  /**
   * Show install options for missing CLI tools
   */
  async showInstallOptions(missingTools) {
    if (Object.keys(missingTools).length === 0) {
      console.log('[INSTALL] All tools are already installed!');
      return [];
    }

    console.log('\n[INSTALL] Missing AI CLI Tools:');
    const options = [];
    let index = 1;

    for (const [toolName, toolInfo] of Object.entries(missingTools)) {
      const option = {
        name: `${index++}. ${toolInfo.name} - ${toolInfo.install}`,
        value: toolName,
      };
      options.push(option);
      console.log(`  ${option.name}`);
    }

    return options;
  }

  /**
   * Get user selection for CLI tools to install
   */
  async getUserSelection(options, missingTools) {
    if (options.length === 0) {
      return [];
    }

    // For non-interactive mode, install all missing tools
    if (process.env.CI || process.argv.includes('--auto-install') || process.argv.includes('--force')) {
      console.log('[INSTALL] Auto-installing all missing tools...');
      return options.map(option => option.value);
    }

    // Interactive mode
    try {
      const { selectedTools } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedTools',
          message: 'Select tools to install (Press Space to select, Enter to confirm):',
          choices: options,
          validate: (input) => {
            if (input && input.length > 0) return true;
            return 'Please select at least one tool to install';
          },
        },
      ]);
      return selectedTools || [];
    } catch (error) {
      console.log('[INSTALL] Interactive mode failed, installing all missing tools...');
      return options.map(option => option.value);
    }
  }

  /**
   * Install selected CLI tools
   * 统一调用父类EnhancedCLIInstaller的实现
   */
  async installTools(selectedTools, missingTools) {
    // 调用父类的增强安装功能
    const result = await super.installTools(selectedTools, missingTools);

    // 保留StigmergyInstaller的特有功能：生成cross-CLI hooks
    if (result && result.successful > 0) {
      console.log('\n[HOOKS] Generating cross-CLI integration hooks...');
      for (const toolName of selectedTools) {
        const toolInfo = missingTools[toolName];
        if (toolInfo && this.results.installations[toolName]?.success) {
          try {
            await this.generateToolHook(toolName, toolInfo);
          } catch (error) {
            console.log(`[WARN] Failed to generate hook for ${toolName}: ${error.message}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Generate hook for a specific CLI tool
   * @param {string} toolName - Name of the CLI tool
   * @param {Object} toolInfo - Tool information object
   */
  async generateToolHook(toolName, toolInfo) {
    console.log(`[HOOK] Generating hook for ${toolName}...`);

    const HookDeploymentManager = require('./coordination/nodejs/HookDeploymentManager');
    const hookManager = new HookDeploymentManager();

    await hookManager.initialize();

    try {
      const deploySuccess = await hookManager.deployHooksForCLI(toolName);

      if (deploySuccess) {
        console.log(`[OK] Hook generated successfully for ${toolName}`);
        return true;
      } else {
        console.log(`[WARN] Hook generation failed for ${toolName}`);
        return false;
      }
    } catch (error) {
      console.error(`[ERROR] Hook generation error for ${toolName}:`, error.message);
      throw error;
    }
  }

  /**
   * Deploy hooks for available CLI tools
   */
  async deployHooks(available) {
    console.log('\n[DEPLOY] Deploying cross-CLI integration hooks...');
    console.log(chalk.blue(`[INFO] Using parallel deployment with concurrency: ${this.concurrency || 6}`));

    const HookDeploymentManager = require('./coordination/nodejs/HookDeploymentManager');
    const hookManager = new HookDeploymentManager();
    
    await hookManager.initialize();

    const toolEntries = Object.entries(available);
    let successCount = 0;
    let totalCount = toolEntries.length;
    const concurrency = this.concurrency || 6;

    const deployForTool = async ([toolName, toolInfo]) => {
      const startTime = Date.now();
      
      try {
        const fs = require('fs/promises');
        const path = require('path');
        
        await fs.mkdir(toolInfo.hooksDir, { recursive: true });
        const configDir = path.dirname(toolInfo.config);
        await fs.mkdir(configDir, { recursive: true });

        const deploySuccess = await hookManager.deployHooksForCLI(toolName);
        
        if (deploySuccess) {
          await this.installToolIntegration(toolName, toolInfo);
          const duration = Date.now() - startTime;
          console.log(`[OK] ${toolInfo.name} deployed successfully (${duration}ms)`);
          return { success: true, toolName, duration };
        }

        return { success: false, toolName, duration: Date.now() - startTime };

      } catch (error) {
        const { errorHandler } = require('./error_handler');
        await errorHandler.logError(
          error,
          'ERROR',
          `StigmergyInstaller.deployHooks.${toolName}`,
        );
        
        const duration = Date.now() - startTime;
        console.log(`[ERROR] Failed to deploy hooks for ${toolInfo.name}: ${error.message} (${duration}ms)`);
        
        return { success: false, toolName, duration, error: error.message };
      }
    };

    const results = [];
    for (let i = 0; i < toolEntries.length; i += concurrency) {
      const batch = toolEntries.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(deployForTool));
      results.push(...batchResults);
    }

    successCount = results.filter(r => r.success).length;
    const totalDuration = Math.max(...results.map(r => r.duration));

    console.log(`\n[SUMMARY] Hook deployment completed: ${successCount}/${totalCount} tools successful`);
    console.log(chalk.blue(`[PERFORMANCE] Total deployment time: ${totalDuration}ms`));
    console.log(chalk.blue(`[PERFORMANCE] Average per tool: ${Math.round(totalDuration / totalCount)}ms`));
    
    return successCount > 0;
  }

  /**
   * Check if a file or directory exists
   */
  async fileExists(path) {
    const fs = require('fs/promises');
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Copy a directory recursively
   */
  async copyDirectory(src, dest) {
    const fs = require('fs/promises');
    const path = require('path');
    
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Deploy project documentation
   */
  async deployProjectDocumentation() {
    // This is a placeholder implementation
    console.log('[DOCS] No documentation to deploy');
    return true;
  }

  /**
   * Initialize configuration
   */
  async initializeConfig() {
    // This is a placeholder implementation
    console.log('[CONFIG] Configuration initialized');
    return true;
  }

  /**
   * Show usage instructions
   */
  showUsageInstructions() {
    // This is a placeholder implementation
    console.log('[USAGE] No usage instructions to show');
    return true;
  }

  /**
   * Create project files (PROJECT_SPEC.json and PROJECT_CONSTITUTION.md) in current directory
   */
  async createProjectFiles() {
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const currentDir = process.cwd();
      
      // Create PROJECT_SPEC.json if it doesn't exist
      const projectSpecPath = path.join(currentDir, 'PROJECT_SPEC.json');
      if (!(await fs.access(projectSpecPath).then(() => true).catch(() => false))) {
        await fs.writeFile(projectSpecPath, '{}', 'utf8');
        console.log('[PROJECT] Created PROJECT_SPEC.json');
      }
      
      // Create PROJECT_CONSTITUTION.md if it doesn't exist
      const projectConstitutionPath = path.join(currentDir, 'PROJECT_CONSTITUTION.md');
      if (!(await fs.access(projectConstitutionPath).then(() => true).catch(() => false))) {
        const constitutionContent = `# Project Collaboration Constitution

## Basic Collaboration Principles
- All collaboration is coordinated through PROJECT_SPEC.json
- Agents make autonomous decisions based on background state
- No central scheduler, achieving decentralized collaboration

## PROJECT_SPEC.json Usage
The PROJECT_SPEC.json file serves as the central coordination point for all project activities.

### Basic Structure:
\`\`
{
  "projectName": "your-project-name",
  "version": "1.0.0",
  "description": "Project description",
  "collaboration": {
    "activeTasks": [],
    "completedTasks": [],
    "sharedContext": {}
  }
}
\`\`

### Common Usage Examples:
1. Define project tasks:
   \`\`
   {
     "collaboration": {
       "activeTasks": [
         {
           "id": "task-001",
           "name": "Implement feature X",
           "status": "in-progress",
           "assignedTo": "any",
           "priority": "high",
           "description": "Task details..."
         }
       ]
     }
   }
   \`\`

2. Track shared context:
   \`\`
   {
     "collaboration": {
       "sharedContext": {
         "lastCompletion": "2025-02-22T10:00:00Z",
         "activeDevelopers": ["developer1", "developer2"],
         "currentSprint": "sprint-2"
       }
     }
   }
   \`\`

## Task Management Principles
- Agents can claim tasks assigned to themselves
- Agents can claim unassigned tasks that match their capabilities
- Task status is updated in real-time to the shared context
`;
        await fs.writeFile(projectConstitutionPath, constitutionContent, 'utf8');
        console.log('[PROJECT] Created PROJECT_CONSTITUTION.md');
      }
      
      return true;
    } catch (error) {
      console.error('[PROJECT] Failed to create project files:', error.message);
      return false;
    }
  }

  /**
   * Install integration for a specific CLI tool using JavaScript
   */
  async installToolIntegration(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');
    const { spawn } = require('child_process');

    console.log(`[CONFIG] Configuring ${toolInfo.name}...`);

    try {
      // Map tool names to their adapter directory names
      const toolToAdapterDir = {
        'qodercli': 'qoder',
        'qwencode': 'qwen'
      };

      const adapterDirName = toolToAdapterDir[toolName] || toolName;

      // Try to find the installation script using multiple approaches to handle different installation scenarios
      let installScriptPath;
      const possiblePaths = [
        // Standard path: src/core/../adapters => src/adapters
        path.join(__dirname, '..', 'adapters', adapterDirName, `install_${adapterDirName}_integration.js`),
        // Path when running from global installation in a different context
        path.join(process.cwd(), 'src', 'adapters', adapterDirName, `install_${adapterDirName}_integration.js`),
        // Path when we might be in a different location due to module resolution
        path.resolve(__dirname, '..', 'adapters', adapterDirName, `install_${adapterDirName}_integration.js`)
      ];

      // Check if we're in the global npm installation by looking for the install script
      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(possiblePath);
          installScriptPath = possiblePath;
          console.log(`[DEBUG] Found installation script at: ${possiblePath}`);
          break;
        } catch (error) {
          // Continue to next possible path
          continue;
        }
      }

      // If we still haven't found the installation script
      if (!installScriptPath) {
        console.log(`[WARN] JavaScript installation script not found for ${toolInfo.name} at possible paths:`, possiblePaths);
        console.log(`[FALLBACK] Using inline configuration for ${toolInfo.name}...`);
        await this.inlineToolConfiguration(toolName, toolInfo);
        return;
      }

      // Installation script found, execute it
      console.log(`[RUN] Running JavaScript installation script for ${toolInfo.name}...`);

      // Run the JavaScript installation script
      const result = await this.runInstallScript(installScriptPath);

      if (result.success) {
        console.log(`[OK] ${toolInfo.name} installation script completed successfully`);
      } else {
        console.log(`[WARN] ${toolInfo.name} installation script failed: ${result.error}`);
        // If the installation script fails but was found, still try to use inline configuration as fallback
        console.log(`[FALLBACK] Using inline configuration for ${toolInfo.name} after script failure...`);
        await this.inlineToolConfiguration(toolName, toolInfo);
      }

    } catch (error) {
      console.log(`[WARN] Configuration failed for ${toolInfo.name}: ${error.message}`);
    }
  }

  /**
   * Run a JavaScript installation script
   */
  async runInstallScript(scriptPath) {
    return new Promise((resolve) => {
      const child = spawn('node', [scriptPath], {
        cwd: path.dirname(scriptPath),
        stdio: 'pipe',
        timeout: 100000 // 30 second timeout
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Print output in real-time
        process.stdout.write(data.toString());
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        // Print errors in real-time
        process.stderr.write(data.toString());
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code: code, stdout: stdout, stderr: stderr });
        } else {
          resolve({ success: false, code: code, stdout: stdout, stderr: stderr, error: `Script exited with code ${code}` });
        }
      });
      
      child.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    });
  }

  /**
   * Fallback inline configuration for tools without dedicated scripts
   */
  async inlineToolConfiguration(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');
    const os = require('os');
    
    // Step 1: Create tool-specific configuration
    const config = {
      cross_cli_enabled: true,
      supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'],
      auto_detect: true,
      timeout: 30,
      collaboration_mode: 'active',
      stigmergy_version: '1.2.1',
      deployment_time: new Date().toISOString()
    };

    // Write configuration file
    await fs.writeFile(toolInfo.config, JSON.stringify(config, null, 2));
    console.log(`[OK] Configuration file created: ${toolInfo.config}`);

    // Step 2: Copy adapter files if they exist
    // Try to find the adapter directory using multiple approaches to handle different installation scenarios
    let adapterDir;
    const possibleAdapterPaths = [
      // Standard path: src/core/../adapters => src/adapters
      path.join(__dirname, '..', 'adapters', toolName === 'qodercli' ? 'qoder' : toolName),
      // Path when running from global installation
      path.resolve(__dirname, '..', 'adapters', toolName === 'qodercli' ? 'qoder' : toolName)
    ];

    for (const possiblePath of possibleAdapterPaths) {
      if (await this.fileExists(possiblePath)) {
        adapterDir = possiblePath;
        console.log(`[DEBUG] Found adapter directory at: ${possiblePath}`);
        break;
      }
    }

    // If we found the adapter directory, copy the files
    if (adapterDir) {
      await this.copyAdapterFiles(adapterDir, toolInfo.hooksDir);
      console.log(`[OK] Adapter files copied for ${toolInfo.name}`);
    } else {
      console.log(`[WARN] Adapter directory not found for ${toolInfo.name} at possible paths:`, possibleAdapterPaths);
    }

    // Step 3: Create tool-specific hook files
    await this.createToolHooks(toolName, toolInfo);

    // Step 4: Create hooks configuration file
    await this.createHooksConfig(toolName, toolInfo);

    // Step 5: Create Cross-CLI documentation
    await this.createCrossCliDocumentation(toolName, toolInfo);

    // Step 6: Append to existing .md file if it exists
    await this.appendToToolMdFile(toolName);

    // Step 7: Create additional tool-specific configurations
    await this.createToolSpecificConfigs(toolName, toolInfo);
  }

  /**
   * Create hooks configuration file
   */
  async createHooksConfig(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const hooksConfig = {
        cross_cli_adapter: {
          enabled: true,
          supported_tools: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'],
          trigger_patterns: [
            'use\\s+(\\w+)\\s+to\\s+(.+)$',
            'call\\s+(\\w+)\\s+(.+)$',
            'ask\\s+(\\w+)\\s+(.+)$',
            'stigmergy\\s+(\\w+)\\s+(.+)$'
          ]
        }
      };

      const hooksConfigPath = path.join(path.dirname(toolInfo.config), 'hooks.json');
      await fs.writeFile(hooksConfigPath, JSON.stringify(hooksConfig, null, 2));
      console.log(`[OK] Created hooks configuration: ${hooksConfigPath}`);
    } catch (error) {
      console.log(`[WARN] Failed to create hooks config: ${error.message}`);
    }
  }

  /**
   * Create tool-specific configurations
   */
  async createToolSpecificConfigs(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');

    try {
      // Create installation_id file
      const installationId = Date.now().toString();
      const installationIdPath = path.join(path.dirname(toolInfo.config), 'installation_id');
      await fs.writeFile(installationIdPath, installationId);
      console.log(`[OK] Created installation ID: ${installationIdPath}`);

      // Create settings.json if it doesn't exist
      const settingsPath = path.join(path.dirname(toolInfo.config), 'settings.json');
      try {
        await fs.access(settingsPath);
      } catch {
        // Only create settings.json for CLIs that support this format
        // Qwen, IFlow, etc. have their own config formats and don't use these settings
        const supportedCLIs = ['claude', 'gemini', 'codex', 'codebuddy', 'qodercli'];
        
        if (supportedCLIs.includes(toolName)) {
          const settings = {
            version: '1.0.0',
            theme: 'default',
            auto_save: true,
            cross_cli_enabled: true
          };
          await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
          console.log(`[OK] Created settings file: ${settingsPath}`);
        }
      }

      // Tool-specific configurations
      switch (toolName) {
      case 'copilot':
        await this.createCopilotConfig(toolInfo);
        break;
      case 'iflow':
        await this.createIflowConfig(toolInfo);
        break;
      case 'qodercli':
        await this.createQoderConfig(toolInfo);
        break;
      case 'codebuddy':
        await this.createCodeBuddyConfig(toolInfo);
        break;
      }
    } catch (error) {
      console.log(`[WARN] Failed to create tool-specific configs: ${error.message}`);
    }
  }

  /**
   * Create Copilot-specific configuration
   */
  async createCopilotConfig(toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');

    try {
      const copilotConfig = {
        mcp: {
          enabled: true,
          servers: {
            'cross-cli-caller': {
              name: 'CrossCLICaller',
              description: 'Cross-CLI Tool Calling Agent',
              command: 'node',
              args: [path.join(toolInfo.hooksDir, 'cross_cli_caller.js')]
            }
          }
        },
        cross_cli_caller: {
          name: 'CrossCLICaller',
          description: 'Cross-CLI Tool Calling Agent'
        }
      };

      const configPath = path.join(path.dirname(toolInfo.config), 'mcp_config.json');
      await fs.writeFile(configPath, JSON.stringify(copilotConfig, null, 2));
      console.log(`[OK] Created Copilot MCP config: ${configPath}`);
    } catch (error) {
      console.log(`[WARN] Failed to create Copilot config: ${error.message}`);
    }
  }

  /**
   * Create iFlow-specific configuration
   */
  async createIflowConfig(toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');

    try {
      const iflowConfig = {
        workflow: {
          enabled: true,
          cross_cli_integration: true,
          default_timeout: 30
        },
        hooks: {
          cross_cli: {
            enabled: true,
            auto_detect: true
          }
        }
      };

      const configPath = path.join(path.dirname(toolInfo.config), 'workflow_config.json');
      await fs.writeFile(configPath, JSON.stringify(iflowConfig, null, 2));
      console.log(`[OK] Created iFlow workflow config: ${configPath}`);
    } catch (error) {
      console.log(`[WARN] Failed to create iFlow config: ${error.message}`);
    }
  }

  /**
   * Create Qoder-specific configuration
   */
  async createQoderConfig(toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');

    try {
      const qoderConfig = {
        notifications: {
          enabled: true,
          cross_cli: true
        },
        keywords: {
          cross_cli: ['请用', '调用', '用', '让', 'use', 'call', 'ask']
        }
      };

      const configPath = path.join(path.dirname(toolInfo.config), 'qoder_config.json');
      await fs.writeFile(configPath, JSON.stringify(qoderConfig, null, 2));
      console.log(`[OK] Created Qoder config: ${configPath}`);
    } catch (error) {
      console.log(`[WARN] Failed to create Qoder config: ${error.message}`);
    }
  }

  /**
   * Create CodeBuddy-specific configuration
   */
  async createCodeBuddyConfig(toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');

    try {
      const buddyConfig = {
        skills: {
          cross_cli: {
            enabled: true,
            auto_register: true
          }
        },
        buddy: {
          cross_cli_calls_count: 0
        }
      };

      const configPath = path.join(path.dirname(toolInfo.config), 'buddy_config.json');
      await fs.writeFile(configPath, JSON.stringify(buddyConfig, null, 2));
      console.log(`[OK] Created CodeBuddy buddy config: ${configPath}`);
    } catch (error) {
      console.log(`[WARN] Failed to create CodeBuddy config: ${error.message}`);
    }
  }

  /**
   * Create Cross-CLI documentation for the tool
   */
  async createCrossCliDocumentation(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      // Create CROSS_CLI_GUIDE.md in the tool's config directory
      const docContent = this.generateCrossCliGuide(toolName);
      const docPath = path.join(path.dirname(toolInfo.config), 'CROSS_CLI_GUIDE.md');
      await fs.writeFile(docPath, docContent);
      console.log(`[OK] Created Cross-CLI Communication Guide: ${docPath}`);

      // Append to existing .md file if it exists
      await this.appendToToolMdFile(toolName);
      
    } catch (error) {
      console.log(`[WARN] Failed to create Cross-CLI documentation: ${error.message}`);
    }
  }

  /**
   * Generate Cross-CLI guide content
   */
  generateCrossCliGuide(toolName) {
    const toolNames = {
      'claude': 'Claude CLI',
      'gemini': 'Gemini CLI',
      'qwen': 'Qwen CLI',
      'iflow': 'iFlow CLI',
      'qodercli': 'Qoder CLI',
      'codebuddy': 'CodeBuddy CLI',
      'copilot': 'GitHub Copilot CLI',
      'codex': 'OpenAI Codex CLI'
    };

    // All documentation generated in English for consistency
    return `# ${toolNames[toolName]} Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
`;
  }

  /**
   * Append Cross-CLI communication guide to existing .md file
   */
  async appendToToolMdFile(toolName) {
    const fs = require('fs/promises');
    const path = require('path');
    const os = require('os');
    
    const toolMdFiles = {
      'claude': path.join(os.homedir(), '.claude', 'claude.md'),
      'gemini': path.join(os.homedir(), '.gemini', 'gemini.md'),
      'qwen': path.join(os.homedir(), '.qwen', 'qwen.md'),
      'iflow': path.join(os.homedir(), '.iflow', 'iflow.md'),
      'qodercli': path.join(os.homedir(), '.qoder', 'qoder.md'),
      'codebuddy': path.join(os.homedir(), '.codebuddy', 'codebuddy.md'),
      'copilot': path.join(os.homedir(), '.copilot', 'copilot.md'),
      'codex': path.join(os.homedir(), '.codex', 'codex.md')
    };

    const mdFilePath = toolMdFiles[toolName];
    if (!mdFilePath) return;

    try {
      const exists = await fs.access(mdFilePath).then(() => true).catch(() => false);
      if (exists) {
        const crossCliContent = this.generateCrossCliAppendContent(toolName);
        await fs.appendFile(mdFilePath, crossCliContent);
        console.log(`[OK] Appended Cross-CLI communication guide to ${path.basename(mdFilePath)}`);
      }
    } catch (error) {
      console.log(`[WARN] Failed to append to ${mdFilePath}: ${error.message}`);
    }
  }

  /**
   * Generate content to append to .md files
   */
  generateCrossCliAppendContent(toolName) {
    // All documentation generated in English for consistency
    return `

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
`;
  }

  /**
   * Copy adapter files from the adapters directory
   */
  async copyAdapterFiles(adapterDir, hooksDir) {
    const fs = require('fs/promises');
    const path = require('path');
    
    try {
      const files = await fs.readdir(adapterDir);
      for (const file of files) {
        // Skip __pycache__ directory
        if (file === '__pycache__') continue;
        
        const srcPath = path.join(adapterDir, file);
        const dstPath = path.join(hooksDir, file);
        
        // Check if it's a directory
        const stats = await fs.stat(srcPath);
        if (stats.isDirectory()) {
          // Recursively copy subdirectories
          await this.copyDirectory(srcPath, dstPath);
        } else {
          // Copy all relevant files (including .py files)
          if (file.endsWith('.py') || file.endsWith('.js') || file.endsWith('.json') || 
              file.endsWith('.md') || file.endsWith('.yml') || file.endsWith('.yaml')) {
            await fs.copyFile(srcPath, dstPath);
            console.log(`[OK] Copied adapter file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.log(`[WARN] Failed to copy adapter files: ${error.message}`);
    }
  }

  /**
   * Create tool-specific hook files
   */
  async createToolHooks(toolName, toolInfo) {
    const fs = require('fs/promises');
    const path = require('path');
    
    // Create a simple integration hook
    const hookContent = `#!/usr/bin/env node
/**
 * ${toolInfo.name} Integration Hook
 * Generated by Stigmergy CLI v1.2.1
 */

const fs = require('fs');
const path = require('path');

class ${toolName.charAt(0).toUpperCase() + toolName.slice(1)}Hook {
  constructor() {
    this.toolName = '${toolName}';
    this.configPath = '${toolInfo.config}';
    this.hooksDir = '${toolInfo.hooksDir}';
  }

  async onPrompt(prompt) {
    // Handle incoming prompts from other CLI tools
    console.log(\`[\${this.toolName.toUpperCase()}] Received cross-CLI prompt: \${prompt}\`);
    return { handled: true, response: 'Prompt processed by ' + this.toolName };
  }

  async onResponse(response) {
    // Handle responses to be sent to other CLI tools
    console.log(\`[\${this.toolName.toUpperCase()}] Sending cross-CLI response\`);
    return response;
  }
}

module.exports = ${toolName.charAt(0).toUpperCase() + toolName.slice(1)}Hook;
`;

    const hookFilePath = path.join(toolInfo.hooksDir, `${toolName}_hook.js`);
    await fs.writeFile(hookFilePath, hookContent);
    console.log(`[OK] Created hook file: ${hookFilePath}`);
  }

  // ... rest of the file remains unchanged
}

module.exports = StigmergyInstaller;