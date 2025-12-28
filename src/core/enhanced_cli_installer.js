/**
 * Optimized Enhanced CLI Installer with Batch Permission Handling
 *
 * This version optimizes permission handling by:
 * 1. Initial permission setup once at the beginning of the process
 * 2. Streamlined tool installation without per-tool permission checks
 * 3. Automatic permission escalation only when needed
 */

const path = require('path');
const fs = require('fs').promises;
const { spawn, spawnSync } = require('child_process');
const os = require('os');
const chalk = require('chalk');

class EnhancedCLIInstaller {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      skipPermissionCheck: options.skipPermissionCheck || false,
      autoRetry: options.autoRetry !== false,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 300000, // 5 minutes
      ...options
    };

    // Expose commonly used options as properties for easier access
    this.verbose = this.options.verbose;
    this.force = options.force || false;
    this.homeDir = options.homeDir || require('os').homedir();
    this.results = {
      permissionSetup: null,
      installations: {},
      failedInstallations: [],
      npmConfigured: false,
      workingDirectory: null,
      permissionMode: 'standard', // 'standard', 'elevated', 'failed'
      errors: []
    };

    this.cliTools = require('./cli_tools').CLI_TOOLS;
    this.permissionConfigured = false;
  }

  /**
   * Log messages with color and formatting
   */
  log(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    let prefix = '';
    let color = chalk.white;

    switch (level) {
      case 'info':
        prefix = `[INFO] ${timestamp}`;
        color = chalk.blue;
        break;
      case 'success':
        prefix = `[SUCCESS] ${timestamp}`;
        color = chalk.green;
        break;
      case 'warn':
        prefix = `[WARN] ${timestamp}`;
        color = chalk.yellow;
        break;
      case 'error':
        prefix = `[ERROR] ${timestamp}`;
        color = chalk.red;
        break;
      case 'debug':
        prefix = `[DEBUG] ${timestamp}`;
        color = chalk.gray;
        break;
    }

    const logMessage = color(`${prefix} ${message}`);
    if (level === 'error') {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    if (data && this.options.verbose) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * One-time permission setup at the beginning of the process
   */
  async setupPermissions() {
    if (this.permissionConfigured) {
      return { success: true, mode: this.permissionMode };
    }

    this.log('info', 'Setting up permissions for CLI tool installation...');

    try {
      // Check if we're already in an elevated context
      const isElevated = await this.checkElevatedContext();

      if (isElevated) {
        this.log('info', 'Already running with elevated permissions');
        this.permissionMode = 'elevated';
        this.permissionConfigured = true;
        return { success: true, mode: 'elevated' };
      }

      // Check if we're in a container environment (common indicators)
      const inContainer = await this.checkContainerEnvironment();
      if (inContainer) {
        this.log('info', 'Detected container environment, using user-space installation');
        this.permissionMode = 'user-space';
        this.permissionConfigured = true;
        return { success: true, mode: 'user-space' };
      }

      // Attempt standard installation first
      const testResult = await this.attemptTestInstallation();

      if (testResult.success) {
        this.log('success', 'Standard permissions are sufficient');
        this.permissionMode = 'standard';
        this.permissionConfigured = true;
        return { success: true, mode: 'standard' };
      }

      // If standard installation fails, check if it's a permission issue
      if (this.isPermissionError(testResult.error)) {
        this.log('warn', 'Permission issue detected, setting up elevated context...');

        const elevatedSetup = await this.setupElevatedContext();
        if (elevatedSetup.success) {
          this.log('success', 'Elevated permissions configured');
          this.permissionMode = 'elevated';
          this.permissionConfigured = true;
          return { success: true, mode: 'elevated' };
        } else {
          this.log('error', 'Failed to set up elevated permissions');
          this.log('info', 'Falling back to user-space installation');
          this.permissionMode = 'user-space';
          this.permissionConfigured = true;
          return { success: true, mode: 'user-space' };
        }
      }

      // Other types of errors
      this.log('error', `Non-permission error during setup: ${testResult.error}`);
      this.permissionMode = 'failed';
      this.permissionConfigured = true;
      return { success: false, mode: 'failed', error: testResult.error };

    } catch (error) {
      this.log('error', `Permission setup failed: ${error.message}`);
      this.log('info', 'Falling back to user-space installation');
      this.permissionMode = 'user-space';
      this.permissionConfigured = true;
      return { success: true, mode: 'user-space', error: error.message };
    }
  }

  /**
   * Check if we're already running in an elevated context
   */
  async checkElevatedContext() {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows: Check if running as administrator
      try {
        const { execSync } = require('child_process');
        const result = execSync('net session', { encoding: 'utf8' });
        return result.includes('Administrator');
      } catch {
        return false;
      }
    } else {
      // Unix-like systems: Check if we have root privileges
      return process.getuid && process.getuid() === 0;
    }
  }

  /**
   * Check if we're running in a container environment
   */
  async checkContainerEnvironment() {
    try {
      // Check for container indicators
      const fs = require('fs');

      // Check for .dockerenv file
      if (fs.existsSync('/.dockerenv')) {
        return true;
      }

      // Check for container environment variables
      if (process.env.container || process.env.DOCKER_CONTAINER) {
        return true;
      }

      // Check cgroup for container indicators
      try {
        if (fs.existsSync('/proc/1/cgroup')) {
          const cgroupContent = fs.readFileSync('/proc/1/cgroup', 'utf8');
          if (cgroupContent.includes('docker') || cgroupContent.includes('containerd')) {
            return true;
          }
        }
      } catch (e) {
        // Ignore errors reading cgroup
      }

      // Check for container-specific files
      const containerIndicators = [
        '/run/.containerenv', // Podman/Docker
        '/sys/fs/cgroup/cpu/cpu.cfs_quota_us', // Common in containers
      ];

      for (const indicator of containerIndicators) {
        try {
          if (fs.existsSync(indicator)) {
            return true;
          }
        } catch (e) {
          // Ignore errors
        }
      }

      return false;
    } catch (error) {
      // If we can't determine, assume not in container
      return false;
    }
  }

  /**
   * Attempt a test installation to check permissions
   */
  async attemptTestInstallation() {
    try {
      // Try a simple npm command to test permissions
      const result = spawnSync('npm', ['config', 'get', 'prefix'], {
        stdio: 'pipe',
        shell: true,
        encoding: 'utf8',
        timeout: 10000
      });

      if (result.status === 0) {
        return { success: true, error: null };
      } else {
        return { success: false, error: result.stderr || result.stdout };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup elevated context based on platform
   */
  async setupElevatedContext() {
    const platform = process.platform;

    if (platform === 'win32') {
      return this.setupWindowsElevatedContext();
    } else {
      return this.setupUnixElevatedContext();
    }
  }

  /**
   * Setup Windows elevated context
   */
  async setupWindowsElevatedContext() {
    this.log('info', 'Windows: Preparing for elevated installation...');

    // On Windows, we'll handle elevation per-installation
    // since we can't maintain elevated state across commands
    return {
      success: true,
      platform: 'windows',
      note: 'Will elevate per installation as needed'
    };
  }

  /**
   * Setup Unix elevated context
   */
  async setupUnixElevatedContext() {
    this.log('info', 'Unix: Checking privilege escalation methods...');

    // List of privilege escalation tools to check (in order of preference)
    const privilegeEscalationTools = [
      { name: 'sudo', testCmd: 'sudo', testArgs: ['-n', 'true'] },
      { name: 'doas', testCmd: 'doas', testArgs: ['-n', 'true'] },
      { name: 'run0', testCmd: 'run0', testArgs: ['-n', 'true'] },
      { name: 'pkexec', testCmd: 'pkexec', testArgs: ['--help'] },
    ];

    let availableTool = null;
    let requiresPassword = false;

    for (const tool of privilegeEscalationTools) {
      try {
        const result = spawnSync(tool.testCmd, tool.testArgs, {
          stdio: 'pipe',
          timeout: 5000
        });

        // Tool exists
        if (result.status === 0 || (result.status !== null && result.error?.code !== 'ENOENT')) {
          // Check if it's passwordless
          if (result.status === 0) {
            availableTool = tool.name;
            requiresPassword = false;
            this.log('success', `Found ${tool.name} (passwordless)`);
            break;
          } else if (result.error?.code !== 'ENOENT') {
            // Tool exists but requires password
            availableTool = tool.name;
            requiresPassword = true;
            this.log('info', `Found ${tool.name} (requires password)`);
            break;
          }
        }
      } catch (error) {
        // Tool doesn't exist, continue to next
        continue;
      }
    }

    if (availableTool) {
      return {
        success: true,
        platform: 'unix',
        privilegeTool: availableTool,
        requiresPassword: requiresPassword,
        note: requiresPassword ? 'Will prompt for password per installation' : 'Passwordless access available'
      };
    } else {
      // No privilege escalation tool found
      this.log('warn', 'No privilege escalation tool found (sudo, doas, run0, pkexec)');
      this.log('info', 'Will attempt user-space installation without privileges');
      return {
        success: true,
        platform: 'unix',
        privilegeTool: null,
        requiresPassword: false,
        userSpaceOnly: true,
        note: 'Installation will be performed in user directory without privileges'
      };
    }
  }

  /**
   * Install a tool using the pre-configured permission mode
   */
  async installTool(toolName, toolInfo, retryCount = 0) {
    // Check if install command exists
    if (!toolInfo.install) {
      this.log('warn', `Tool ${toolName} has no install command, skipping...`);
      return false;
    }

    // Ensure permissions are configured first
    if (!this.permissionConfigured) {
      await this.setupPermissions();
    }

    // Check if we're in a container environment and force user-space mode if needed
    if (this.permissionMode !== 'user-space') {
      const inContainer = await this.checkContainerEnvironment();
      if (inContainer) {
        this.log('info', 'Detected container environment, switching to user-space installation');
        this.permissionMode = 'user-space';
      }
    }

    this.log('info', `Installing ${toolInfo.name} (${toolName})...`);

    try {
      const installResult = await this.executeInstallation(toolInfo);

      if (installResult.success) {
        this.log('success', `Successfully installed ${toolInfo.name}`);
        this.results.installations[toolName] = {
          success: true,
          tool: toolInfo.name,
          command: toolInfo.install,
          duration: Date.now() - (this.results.installations[toolName]?.startTime || Date.now()),
          permissionMode: this.permissionMode,
          permissionHandled: this.permissionMode === 'elevated'
        };
        return true;
      } else {
        throw new Error(installResult.error);
      }

    } catch (error) {
      this.log('error', `Failed to install ${toolInfo.name}: ${error.message}`);

      this.results.installations[toolName] = {
        success: false,
        tool: toolInfo.name,
        command: toolInfo.install,
        error: error.message,
        retryCount: retryCount,
        permissionMode: this.permissionMode
      };

      this.results.failedInstallations.push(toolName);

      // Retry logic for non-permission errors
      if (this.options.autoRetry && retryCount < this.options.maxRetries) {
        this.log('warn', `Retrying installation of ${toolInfo.name} (${retryCount + 1}/${this.options.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await this.installTool(toolName, toolInfo, retryCount + 1);
      }

      return false;
    }
  }

  /**
   * Execute installation based on pre-configured permission mode
   */
  async executeInstallation(toolInfo) {
    switch (this.permissionMode) {
      case 'standard':
        return await this.executeStandardInstallation(toolInfo);
      case 'elevated':
        return await this.executeElevatedInstallation(toolInfo);
      case 'user-space':
        return await this.executeUserSpaceInstallation(toolInfo);
      case 'failed':
        return await this.executeFallbackInstallation(toolInfo);
      default:
        // Try standard first, then escalate if needed
        const standardResult = await this.executeStandardInstallation(toolInfo);
        if (standardResult.success) {
          return standardResult;
        }

        if (this.isPermissionError(standardResult.error)) {
          this.log('warn', `Permission error, escalating to elevated installation...`);
          this.permissionMode = 'elevated';
          return await this.executeElevatedInstallation(toolInfo);
        }

        return standardResult;
    }
  }

  /**
   * Execute standard installation without permission elevation
   */
  async executeStandardInstallation(toolInfo) {
    try {
      // Check if install command exists
      if (!toolInfo.install) {
        return {
          success: false,
          error: `No install command specified for ${toolInfo.name || 'unknown tool'}`
        };
      }

      const [command, ...args] = toolInfo.install.split(' ');

      this.log('debug', `Executing: ${toolInfo.install}`);

      const result = spawnSync(command, args, {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        shell: true,
        encoding: 'utf8',
        timeout: this.options.timeout,
        env: {
          ...process.env,
          npm_config_prefix: process.env.npm_config_prefix,
          npm_config_global: 'true',
          npm_config_update: 'false',
          npm_config_progress: 'false'
        }
      });

      if (result.status === 0) {
        return { success: true, error: null };
      } else {
        const errorMessage = result.stderr || result.stdout || `Exit code ${result.status}`;

        // Check if this is a permission error and switch to user-space if needed
        if (this.isPermissionError(errorMessage)) {
          this.log('warn', `Standard installation failed due to permission error, switching to user-space installation...`);
          this.permissionMode = 'user-space';
          return await this.executeUserSpaceInstallation(toolInfo);
        }

        return { success: false, error: errorMessage };
      }

    } catch (error) {
      // Check if this is a permission error and switch to user-space if needed
      if (this.isPermissionError(error.message)) {
        this.log('warn', `Standard installation failed due to permission error, switching to user-space installation...`);
        this.permissionMode = 'user-space';
        return await this.executeUserSpaceInstallation(toolInfo);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Execute installation with permission elevation
   */
  async executeElevatedInstallation(toolInfo) {
    const platform = process.platform;

    if (platform === 'win32') {
      return await this.executeWindowsElevatedInstallation(toolInfo);
    } else {
      return await this.executeUnixElevatedInstallation(toolInfo);
    }
  }

  /**
   * Execute Windows elevated installation
   */
  async executeWindowsElevatedInstallation(toolInfo) {
    const command = toolInfo.install;

    try {
      this.log('info', `Creating Windows elevated installation for: ${toolInfo.name}`);

      const scriptPath = path.join(os.tmpdir(), `stigmergy-install-${Date.now()}.ps1`);
      const scriptContent = `
        Write-Host "以管理员权限安装: ${toolInfo.name}" -ForegroundColor Yellow
        try {
          ${command}
          if ($LASTEXITCODE -eq 0) {
            Write-Host "安装成功: ${toolInfo.name}" -ForegroundColor Green
            exit 0
          } else {
            Write-Host "安装失败: ${toolInfo.name}" -ForegroundColor Red
            exit $LASTEXITCODE
          }
        } catch {
          Write-Host "安装异常: ${toolInfo.name}" -ForegroundColor Red
          Write-Host $\_.Exception.Message -ForegroundColor Red
          exit 1
        }
      `;

      require('fs').writeFileSync(scriptPath, scriptContent, 'utf8');

      const result = spawnSync('powershell', [
        '-Command', `Start-Process PowerShell -Verb RunAs -ArgumentList "-File '${scriptPath}'" -Wait`
      ], {
        stdio: 'pipe',
        timeout: this.options.timeout * 2,
        encoding: 'utf8'
      });

      try {
        require('fs').unlinkSync(scriptPath);
      } catch (cleanupError) {
        this.log('warn', `Could not clean up temp script: ${cleanupError.message}`);
      }

      if (result.status === 0) {
        return {
          success: true,
          error: null
        };
      } else {
        // If elevated installation failed, try user-space installation
        this.log('warn', `Elevated installation failed, trying user-space installation...`);
        this.permissionMode = 'user-space';
        return await this.executeUserSpaceInstallation(toolInfo);
      }
    } catch (error) {
      // If elevated installation failed, try user-space installation
      this.log('warn', `Elevated installation failed (${error.message}), trying user-space installation...`);
      this.permissionMode = 'user-space';
      return await this.executeUserSpaceInstallation(toolInfo);
    }
  }

  /**
   * Execute Unix elevated installation
   */
  async executeUnixElevatedInstallation(toolInfo) {
    // Use the detected privilege escalation tool
    const privilegeSetup = await this.setupUnixElevatedContext();

    if (!privilegeSetup.success) {
      this.log('warn', 'No privilege escalation tool available, using user-space installation...');
      return await this.executeUserSpaceInstallation(toolInfo);
    }

    // If no privilege escalation tool is available, use user-space installation
    if (privilegeSetup.userSpaceOnly) {
      return await this.executeUserSpaceInstallation(toolInfo);
    }

    // Use the detected privilege escalation tool
    const privilegeTool = privilegeSetup.privilegeTool || 'sudo';
    const command = `${privilegeTool} ${toolInfo.install}`;

    try {
      this.log('info', `Using ${privilegeTool} for elevated installation of: ${toolInfo.name}`);

      const result = spawnSync('bash', ['-c', command], {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        timeout: this.options.timeout * 2,
        encoding: 'utf8'
      });

      if (result.status === 0) {
        return { success: true, error: null };
      } else {
        const errorMessage = result.stderr || result.stdout || `Exit code ${result.status}`;
        // If privilege escalation failed, try user-space installation as fallback
        this.log('warn', `Privilege escalation failed, trying user-space installation...`);
        return await this.executeUserSpaceInstallation(toolInfo);
      }
    } catch (error) {
      this.log('warn', `Privilege escalation error: ${error.message}, trying user-space installation...`);
      return await this.executeUserSpaceInstallation(toolInfo);
    }
  }

  /**
   * Execute user-space installation (no privileges required)
   */
  async executeUserSpaceInstallation(toolInfo) {
    try {
      // Install to user directory using --prefix flag
      const os = require('os');
      const path = require('path');

      // Get user's npm global directory
      let userNpmDir = process.env.NPM_CONFIG_PREFIX ||
                        path.join(os.homedir(), '.npm-global');

      // Ensure directory exists
      const fs = require('fs');
      if (!fs.existsSync(userNpmDir)) {
        fs.mkdirSync(userNpmDir, { recursive: true, mode: 0o755 });
      }

      // Extract package name from install command
      // Format: "npm install -g @package/tool" or "npm install -g tool"
      const installMatch = toolInfo.install.match(/npm\s+(?:install|upgrade)\s+(?:-g\s+)?(.+)/);
      if (!installMatch) {
        throw new Error('Cannot parse install command');
      }

      const packageName = installMatch[1].trim();

      // Create user-space install command
      const userCommand = `npm install -g --prefix "${userNpmDir}" ${packageName}`;

      this.log('info', `Installing ${toolInfo.name} to user directory: ${userNpmDir}`);
      this.log('info', `Command: ${userCommand}`);

      // Set PATH to include user npm directory
      const env = {
        ...process.env,
        PATH: `${path.join(userNpmDir, 'bin')}:${process.env.PATH}`
      };

      const result = spawnSync('bash', ['-c', userCommand], {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        timeout: this.options.timeout * 3, // Longer timeout for user-space install
        encoding: 'utf8',
        env: env
      });

      if (result.status === 0) {
        this.log('success', `Successfully installed ${toolInfo.name} to user directory`);

        // Provide PATH setup instructions
        const binDir = path.join(userNpmDir, 'bin');
        this.log('info', '⚠️  Make sure to add the bin directory to your PATH:');
        this.log('info', `   export PATH="${binDir}:$PATH"`);

        // Add to shell config files automatically
        await this.addPathToShellConfig(binDir);

        return { success: true, error: null, userSpace: true, binDir };
      } else {
        const errorMessage = result.stderr || result.stdout || `Exit code ${result.status}`;
        return { success: false, error: `User-space installation failed: ${errorMessage}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add PATH to shell configuration files
   */
  async addPathToShellConfig(binDir) {
    const os = require('os');
    const path = require('path');
    const fs = require('fs/promises');

    const shellConfigs = [
      { file: path.join(os.homedir(), '.bashrc'), marker: '# Stigmergy CLI PATH' },
      { file: path.join(os.homedir(), '.zshrc'), marker: '# Stigmergy CLI PATH' },
      { file: path.join(os.homedir(), '.profile'), marker: '# Stigmergy CLI PATH' },
    ];

    const pathLine = `export PATH="${binDir}:$PATH"\n`;

    for (const config of shellConfigs) {
      try {
        let content = '';
        try {
          content = await fs.readFile(config.file, 'utf8');
        } catch (err) {
          // File doesn't exist, will create it
        }

        // Check if PATH is already configured
        if (content.includes(config.marker)) {
          continue; // Already configured
        }

        // Append PATH configuration
        await fs.appendFile(config.file, `\n${config.marker}\n${pathLine}`);
        this.log('info', `Added PATH to ${path.basename(config.file)}`);
      } catch (error) {
        // Ignore errors for config files
      }
    }
  }

  /**
   * Fallback installation method
   */
  async executeFallbackInstallation(toolInfo) {
    this.log('warn', 'Attempting fallback installation method...');

    // Check if install command exists
    if (!toolInfo.install) {
      return {
        success: false,
        error: `No install command specified for ${toolInfo.name || 'unknown tool'}`
      };
    }

    // Try without some npm flags that might cause permission issues
    const [command, ...args] = toolInfo.install.split(' ');
    const fallbackArgs = args.filter(arg => !arg.startsWith('--'));

    try {
      const result = spawnSync(command, fallbackArgs, {
        stdio: 'inherit',
        shell: true,
        encoding: 'utf8',
        timeout: this.options.timeout
      });

      if (result.status === 0) {
        return { success: true, error: null };
      } else {
        const errorMessage = result.stderr || `Fallback failed with exit code ${result.status}`;
        // If fallback failed due to permissions, try user-space installation
        if (this.isPermissionError(errorMessage)) {
          this.log('warn', `Fallback installation failed due to permission error, switching to user-space installation...`);
          this.permissionMode = 'user-space';
          return await this.executeUserSpaceInstallation(toolInfo);
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      // If fallback failed due to permissions, try user-space installation
      if (this.isPermissionError(error.message)) {
        this.log('warn', `Fallback installation failed due to permission error, switching to user-space installation...`);
        this.permissionMode = 'user-space';
        return await this.executeUserSpaceInstallation(toolInfo);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if an error is related to permissions
   */
  isPermissionError(errorMessage) {
    if (!errorMessage || typeof errorMessage !== 'string') {
      return false;
    }

    const permissionIndicators = [
      'EACCES', 'EPERM', 'permission denied',
      'access denied', 'unauthorized', 'EISDIR',
      'operation not permitted', 'code EACCES',
      'code EPERM', 'permission error', 'cannot create directory',
      'write EACCES', 'mkdir', 'denied'
    ];

    const lowerError = errorMessage.toLowerCase();
    return permissionIndicators.some(indicator =>
      lowerError.includes(indicator.toLowerCase())
    );
  }

  /**
   * Install multiple CLI tools
   */
  async installTools(toolNames, toolInfos) {
    this.log('info', 'Starting batch installation of CLI tools...');

    // One-time permission setup for the entire batch
    const permissionSetup = await this.setupPermissions();
    if (!permissionSetup.success && permissionSetup.mode !== 'elevated') {
      this.log('warn', 'Permission setup failed, but proceeding with individual installations...');
    }

    let successCount = 0;
    const totalCount = toolNames.length;

    this.log('info', `Installing ${totalCount} CLI tools in ${this.permissionMode} mode...`);

    for (const toolName of toolNames) {
      const toolInfo = toolInfos[toolName];
      if (!toolInfo) continue;

      // Skip tools without install command (internal functions)
      if (!toolInfo.install) {
        this.log('debug', `Tool ${toolName} has no install command, skipping...`);
        continue;
      }

      this.results.installations[toolName] = {
        startTime: Date.now(),
        ...this.results.installations[toolName]
      };

      const success = await this.installTool(toolName, toolInfo);
      if (success) {
        successCount++;
      }
    }

    this.log('info', `Batch installation completed: ${successCount}/${totalCount} successful`);

    return {
      success: successCount === totalCount,
      total: totalCount,
      successful: successCount,
      failed: totalCount - successCount,
      permissionMode: this.permissionMode,
      results: this.results
    };
  }

  /**
   * Upgrade CLI tools
   */
  async upgradeTools(toolNames, toolInfos) {
    this.log('info', 'Starting batch upgrade of CLI tools...');

    // One-time permission setup for the entire batch
    const permissionSetup = await this.setupPermissions();
    if (!permissionSetup.success && permissionSetup.mode !== 'elevated') {
      this.log('warn', 'Permission setup failed, but proceeding with individual upgrades...');
    }

    let successCount = 0;
    const totalCount = toolNames.length;

    this.log('info', `Upgrading ${totalCount} CLI tools in ${this.permissionMode} mode...`);

    for (const toolName of toolNames) {
      const originalInfo = toolInfos[toolName];
      if (!originalInfo) {
        this.log('warn', `Tool ${toolName} not found in toolInfos, skipping...`);
        continue;
      }

      // Skip tools without install command (internal functions)
      if (!originalInfo.install) {
        this.log('debug', `Tool ${toolName} has no install command, skipping upgrade...`);
        continue;
      }

      // Determine the appropriate upgrade command based on permission mode
      let upgradeCommand;
      if (this.permissionMode === 'user-space') {
        // For user-space installations, upgrade to user directory
        const os = require('os');
        const path = require('path');
        let userNpmDir = process.env.NPM_CONFIG_PREFIX || path.join(os.homedir(), '.npm-global');
        upgradeCommand = `npm install -g --prefix "${userNpmDir}" ${toolName}`;
      } else {
        upgradeCommand = `npm upgrade -g ${toolName}`;
      }

      const toolInfo = {
        ...originalInfo,
        install: upgradeCommand,
        name: `${originalInfo.name} (Upgrade)`
      };

      const success = await this.installTool(toolName, toolInfo);
      if (success) {
        successCount++;
      }
    }

    this.log('info', `Batch upgrade completed: ${successCount}/${totalCount} successful`);

    return {
      success: successCount === totalCount,
      total: totalCount,
      successful: successCount,
      failed: totalCount - successCount,
      permissionMode: this.permissionMode,
      results: this.results
    };
  }

  /**
   * Get installation results
   */
  getResults() {
    return this.results;
  }

  /**
   * Detect permission availability for the current platform
   */
  detectPermissionAvailability() {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows: Check if running as administrator
      try {
        const { execSync } = require('child_process');
        const result = execSync('net session', { encoding: 'utf8' });
        return result.includes('Administrator');
      } catch {
        return false;
      }
    } else {
      // Unix-like systems: Check available privilege escalation tools
      const privilegeEscalationTools = ['sudo', 'doas', 'run0', 'pkexec'];
      for (const tool of privilegeEscalationTools) {
        try {
          const result = spawnSync(tool, ['--version'], {
            stdio: 'pipe',
            timeout: 5000
          });
          if (result.status !== null || result.error?.code !== 'ENOENT') {
            return true;
          }
        } catch {
          continue;
        }
      }
      return false;
    }
  }

  /**
   * Detect available privilege escalation tools
   */
  detectPrivilegeTools() {
    const platform = process.platform;
    const availableTools = [];

    if (platform === 'win32') {
      // Windows: Check for admin privileges
      try {
        const { execSync } = require('child_process');
        const result = execSync('net session', { encoding: 'utf8' });
        if (result.includes('Administrator')) {
          availableTools.push('admin');
        }
      } catch {
        // Not running as admin
      }
    } else {
      // Unix-like systems: Check privilege escalation tools
      const tools = [
        { name: 'sudo', checkCmd: ['-n', 'true'] },
        { name: 'doas', checkCmd: ['-n', 'true'] },
        { name: 'run0', checkCmd: ['-n', 'true'] },
        { name: 'pkexec', checkCmd: ['--help'] }
      ];

      for (const tool of tools) {
        try {
          const result = spawnSync(tool.name, tool.checkCmd, {
            stdio: 'pipe',
            timeout: 5000
          });
          if (result.status !== null || result.error?.code !== 'ENOENT') {
            availableTools.push(tool.name);
          }
        } catch {
          continue;
        }
      }
    }

    return availableTools;
  }

  /**
   * Upgrade a single tool
   */
  async upgradeTool(toolName, toolInfo) {
    this.log('info', `Upgrading ${toolName}...`);

    if (!toolInfo || !toolInfo.install) {
      this.log('warn', `Tool ${toolName} has no install command, skipping upgrade...`);
      this.results.errors.push({
        tool: toolName,
        error: 'No install command specified',
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Determine the appropriate upgrade command based on permission mode
    let upgradeCommand;
    if (this.permissionMode === 'user-space') {
      // For user-space installations, upgrade to user directory
      const os = require('os');
      const path = require('path');
      let userNpmDir = process.env.NPM_CONFIG_PREFIX || path.join(os.homedir(), '.npm-global');
      upgradeCommand = `npm install -g --prefix "${userNpmDir}" ${toolName}`;
    } else {
      upgradeCommand = `npm upgrade -g ${toolName}`;
    }

    this.results.installations[toolName] = {
      startTime: Date.now(),
      ...this.results.installations[toolName]
    };

    try {
      const success = await this.installTool(toolName, {
        ...toolInfo,
        install: upgradeCommand,
        name: `${toolInfo.name} (Upgrade)`
      });

      return success;
    } catch (error) {
      this.log('error', `Failed to upgrade ${toolName}: ${error.message}`);
      this.results.errors.push({
        tool: toolName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Get installation summary
   */
  getInstallationSummary() {
    const installations = this.results.installations || {};
    const errors = this.results.errors || [];

    const total = Object.keys(installations).length;
    const successful = Object.values(installations).filter(i => i.success !== false).length;
    const failed = total - successful;

    return {
      total,
      successful,
      failed,
      permissionMode: this.permissionMode,
      npmConfigured: this.results.npmConfigured,
      workingDirectory: this.results.workingDirectory,
      errors: errors.map(e => ({
        tool: e.tool,
        error: e.error,
        timestamp: e.timestamp
      })),
      details: installations
    };
  }
}

module.exports = EnhancedCLIInstaller;