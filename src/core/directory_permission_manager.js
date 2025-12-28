/**
 * Directory Permission Manager
 *
 * Handles automatic detection and resolution of directory permission issues
 * for Stigmergy CLI installations, particularly for macOS/Linux users
 * who start terminals in system directories without write permissions.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class DirectoryPermissionManager {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      fallbackDir: options.fallbackDir || null,
      createStigmergyDir: options.createStigmergyDir !== false,
      ...options
    };

    this.results = {
      originalDir: process.cwd(),
      workingDir: null,
      hasWritePermission: false,
      createdDirectories: [],
      npmConfigured: false
    };
  }

  /**
   * Log messages based on verbosity setting
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}`);
    } else if (this.options.verbose || level === 'info' || level === 'success') {
      console.log(`${prefix} ${message}`);
    }

    if (data && this.options.verbose) {
      console.log('  Data:', JSON.stringify(data, null, 2));
    }
  }

  /**
   * Check if current directory has write permission
   */
  async checkWritePermission(dir = process.cwd()) {
    try {
      const testFile = path.join(dir, '.stigmergy-permission-test');
      await fs.writeFile(testFile, 'test', { flag: 'w' });
      await fs.unlink(testFile);
      return true;
    } catch (error) {
      this.log('debug', `Write permission check failed for ${dir}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get home directory with fallback (Windows + Unix support)
   */
  getHomeDirectory() {
    const homeDir = os.homedir();

    // Windows-specific fallbacks
    if (process.platform === 'win32') {
      if (!homeDir) {
        // Try Windows-specific user directories
        const windowsFallbacks = [
          process.env.USERPROFILE,
          path.join('C:', 'Users', process.env.USERNAME || 'Default'),
          path.join('C:', 'Users', 'Public', 'Documents'),
          path.join(process.env.LOCALAPPDATA || 'C:\\temp'),
          process.env.TEMP || process.env.TMP || 'C:\\temp'
        ];

        for (const dir of windowsFallbacks) {
          try {
            if (dir && fs.existsSync(dir)) {
              this.log('debug', `Windows fallback found: ${dir}`);
              return dir;
            }
          } catch (error) {
            continue;
          }
        }
      }
      return homeDir;
    }

    // Unix/Linux/macOS fallbacks
    if (!homeDir || homeDir === '/') {
      const unixFallbacks = [
        path.join('/Users', process.env.USER || 'user'),
        path.join('/home', process.env.USER || 'user'),
        '/tmp',
        os.tmpdir()
      ];

      for (const dir of unixFallbacks) {
        try {
          if (fs.existsSync(dir)) {
            return dir;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return homeDir;
  }

  /**
   * Find the nearest directory with write permission (Windows + Unix)
   */
  async findWritableDirectory(startDir = process.cwd()) {
    this.log('info', `Checking write permissions starting from: ${startDir}`);

    // Check current directory first
    if (await this.checkWritePermission(startDir)) {
      this.log('success', `Current directory has write permission: ${startDir}`);
      return { dir: startDir, created: false, reason: 'current_directory' };
    }

    // Platform-specific directory search
    let userDirs = [];

    if (process.platform === 'win32') {
      // Windows-specific directories
      const homeDir = this.getHomeDirectory();
      userDirs = [
        homeDir,
        path.join(homeDir, 'Desktop'),
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Downloads'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Development'),
        path.join(process.env.LOCALAPPDATA || '', 'Temp'),
        process.env.TEMP || process.env.TMP,
        path.join('C:', 'temp'),
        path.join('C:', 'Users', process.env.USERNAME || 'Default', 'Documents'),
        path.join(homeDir, 'AppData', 'Local'),
        os.tmpdir()
      ];
    } else {
      // Unix/Linux/macOS directories
      const homeDir = this.getHomeDirectory();
      userDirs = [
        homeDir,
        path.join(homeDir, 'Desktop'),
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Downloads'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Development'),
        os.tmpdir(),
        '/tmp',
        '/var/tmp'
      ];
    }

    for (const dir of userDirs) {
      try {
        // Check if directory exists
        await fs.access(dir);

        if (await this.checkWritePermission(dir)) {
          this.log('success', `Found writable directory: ${dir}`);
          return { dir, created: false, reason: 'existing_directory' };
        }
      } catch (error) {
        this.log('debug', `Directory not accessible: ${dir} - ${error.message}`);
        continue;
      }
    }

    // Try to create a working directory in home
    const homeDir = this.getHomeDirectory();
    if (homeDir && homeDir !== '/') {
      const stigmergyDir = path.join(homeDir, 'stigmergy-workspace');

      try {
        await fs.mkdir(stigmergyDir, { recursive: true });

        if (await this.checkWritePermission(stigmergyDir)) {
          this.log('success', `Created working directory: ${stigmergyDir}`);
          this.results.createdDirectories.push(stigmergyDir);
          return { dir: stigmergyDir, created: true, reason: 'created_directory' };
        }
      } catch (error) {
        this.log('error', `Failed to create working directory: ${error.message}`);
      }
    }

    // Last resort: use system temp directory
    const tempDir = os.tmpdir();
    try {
      const randomDir = path.join(tempDir, `stigmergy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      await fs.mkdir(randomDir, { recursive: true });

      if (await this.checkWritePermission(randomDir)) {
        this.log('warn', `Using temporary directory: ${randomDir}`);
        this.results.createdDirectories.push(randomDir);
        return { dir: randomDir, created: true, reason: 'temporary_directory' };
      }
    } catch (error) {
      this.log('error', `Failed to create temporary directory: ${error.message}`);
    }

    throw new Error('Could not find or create any writable directory');
  }

  /**
   * Configure npm to use a directory with write permission
   */
  async configureNpmPrefix(writableDir) {
    this.log('info', 'Configuring npm global prefix...');

    try {
      // Create npm global directory in writable location
      const npmGlobalDir = path.join(writableDir, '.npm-global');

      try {
        await fs.mkdir(npmGlobalDir, { recursive: true });
        this.log('success', `Created npm global directory: ${npmGlobalDir}`);
        this.results.createdDirectories.push(npmGlobalDir);
      } catch (error) {
        this.log('debug', `npm global directory may already exist: ${error.message}`);
      }

      // Set npm prefix for current session
      process.env.npm_config_prefix = npmGlobalDir;

      // Add to PATH if not already present
      const npmBinDir = path.join(npmGlobalDir, 'bin');
      if (process.env.PATH && !process.env.PATH.includes(npmBinDir)) {
        process.env.PATH = `${npmBinDir}:${process.env.PATH}`;
      }

      this.results.npmConfigured = true;
      this.log('success', `npm configured to use: ${npmGlobalDir}`);

      return {
        npmGlobalDir,
        npmBinDir,
        exportCommand: `export npm_config_prefix="${npmGlobalDir}"`,
        pathCommand: `export PATH="${npmBinDir}:$PATH"`
      };
    } catch (error) {
      this.log('error', `Failed to configure npm: ${error.message}`);
      throw error;
    }
  }

  /**
   * Change to writable directory and configure environment
   */
  async setupWorkingDirectory() {
    this.log('info', 'Setting up working directory with proper permissions...');

    try {
      // Find writable directory
      const writableResult = await this.findWritableDirectory();
      const { dir: writableDir, created, reason } = writableResult;

      // Change working directory
      process.chdir(writableDir);
      this.results.workingDir = writableDir;
      this.results.hasWritePermission = true;

      this.log('info', `Changed working directory to: ${writableDir} (reason: ${reason})`);

      // Configure npm if needed
      const npmConfig = await this.configureNpmPrefix(writableDir);

      // Create shell setup instructions
      const setupInstructions = this.generateSetupInstructions(npmConfig);

      return {
        success: true,
        originalDir: this.results.originalDir,
        workingDir: writableDir,
        created,
        reason,
        npmConfig,
        setupInstructions
      };

    } catch (error) {
      this.log('error', `Failed to setup working directory: ${error.message}`);
      return {
        success: false,
        error: error.message,
        originalDir: this.results.originalDir
      };
    }
  }

  /**
   * Generate shell setup instructions (Windows + Unix)
   */
  generateSetupInstructions(npmConfig) {
    const { npmGlobalDir, npmBinDir } = npmConfig;

    const shellType = this.detectShell();
    const profileFile = this.getShellProfileFile(shellType);

    let instructions = [];

    instructions.push('# Stigmergy CLI Environment Setup');

    // Windows PowerShell instructions
    if (shellType === 'powershell') {
      instructions.push('# PowerShell commands:');
      instructions.push('');
      instructions.push('# Set npm global prefix');
      instructions.push(`$env:npm_config_prefix = "${npmGlobalDir.replace(/\\/g, '\\\\')}"`);
      instructions.push('');
      instructions.push('# Add npm global bin to PATH');
      instructions.push(`$env:PATH = "${npmBinDir.replace(/\\/g, '\\\\')};$env:PATH"`);
      instructions.push('');
      instructions.push('# Make persistent (add to PowerShell profile):');
      instructions.push('# Run these commands manually or copy to your PowerShell profile:');
      instructions.push('');
      instructions.push(`$env:npm_config_prefix = "${npmGlobalDir.replace(/\\/g, '\\\\')}"`);
      instructions.push(`$env:PATH = "${npmBinDir.replace(/\\/g, '\\\\')};$env:PATH"`);
      instructions.push('');
      instructions.push('# To make permanent, add to PowerShell profile:');
      instructions.push(`# Add-Content -Path $PROFILE -Value '$env:npm_config_prefix = "${npmGlobalDir.replace(/\\/g, '\\\\')}"'`);
      instructions.push(`# Add-Content -Path $PROFILE -Value '$env:PATH = "${npmBinDir.replace(/\\/g, '\\\\')};$env:PATH"'`);
      instructions.push('');
      instructions.push('# Reload PowerShell profile:');
      instructions.push('. $PROFILE');
      return instructions.join('\n');
    }

    // Windows Command Prompt instructions
    if (shellType === 'cmd') {
      instructions.push('# Command Prompt commands:');
      instructions.push('');
      instructions.push('# Set npm global prefix');
      instructions.push(`set npm_config_prefix=${npmGlobalDir}`);
      instructions.push('');
      instructions.push('# Add npm global bin to PATH');
      instructions.push(`set PATH=${npmBinDir};%PATH%`);
      instructions.push('');
      instructions.push('# Make persistent (add to system environment variables):');
      instructions.push('# 1. Open System Properties -> Environment Variables');
      instructions.push(`# 2. Add npm_config_prefix: ${npmGlobalDir}`);
      instructions.push(`# 3. Add to PATH: ${npmBinDir}`);
      instructions.push('');
      instructions.push('# Or run one-time commands:');
      instructions.push(`setx npm_config_prefix "${npmGlobalDir}"`);
      instructions.push(`setx PATH "%PATH%;${npmBinDir}"`);
      return instructions.join('\n');
    }

    // Unix/Linux/macOS instructions
    instructions.push('# Unix/Linux/macOS commands:');
    instructions.push('');
    instructions.push('# Set npm global prefix');
    instructions.push(`export npm_config_prefix="${npmGlobalDir}"`);
    instructions.push('');
    instructions.push('# Add npm global bin to PATH');
    instructions.push(`export PATH="${npmBinDir}:$PATH"`);
    instructions.push('');

    if (profileFile) {
      instructions.push(`# Add to ${profileFile}:`);
      instructions.push(`echo 'export npm_config_prefix="${npmGlobalDir}"' >> ${profileFile}`);
      instructions.push(`echo 'export PATH="${npmBinDir}:$PATH"' >> ${profileFile}`);
      instructions.push(`source ${profileFile}`);
      instructions.push('');
    }

    instructions.push('# Or run this one-time command:');
    if (profileFile) {
      instructions.push(`echo 'export npm_config_prefix="${npmGlobalDir}"\\nexport PATH="${npmBinDir}:$PATH"' >> ${profileFile} && source ${profileFile}`);
    } else {
      instructions.push(`export npm_config_prefix="${npmGlobalDir}"`);
      instructions.push(`export PATH="${npmBinDir}:$PATH"`);
    }

    return instructions.join('\n');
  }

  /**
   * Detect current shell (Windows + Unix)
   */
  detectShell() {
    // Windows-specific detection
    if (process.platform === 'win32') {
      // Check for PowerShell
      if (process.env.PSModulePath) return 'powershell';

      // Check for Command Prompt (cmd)
      if (process.env.COMSPEC && process.env.COMSPEC.includes('cmd.exe')) return 'cmd';

      // Check for Git Bash on Windows
      if (process.env.SHELL && process.env.SHELL.includes('bash')) return 'bash';

      // Check for WSL
      if (process.env.WSL_DISTRO_NAME) {
        const shell = process.env.SHELL;
        if (shell && shell.includes('zsh')) return 'zsh';
        if (shell && shell.includes('bash')) return 'bash';
        return 'wsl';
      }

      return 'powershell'; // Default to PowerShell on Windows
    }

    // Unix/Linux/macOS detection
    const shell = process.env.SHELL;
    if (!shell) return 'unknown';

    if (shell.includes('zsh')) return 'zsh';
    if (shell.includes('bash')) return 'bash';
    if (shell.includes('fish')) return 'fish';
    if (shell.includes('csh')) return 'csh';
    if (shell.includes('tcsh')) return 'tcsh';

    return 'unknown';
  }

  /**
   * Get shell profile file path (Windows + Unix)
   */
  getShellProfileFile(shellType) {
    const homeDir = this.getHomeDirectory();

    switch (shellType) {
      case 'powershell':
        // PowerShell profile locations
        return path.join(homeDir, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');

      case 'cmd':
        // Command Prompt doesn't really have profile files, but we can suggest registry or environment
        return null;

      case 'wsl':
        // WSL uses Linux-style shells
        const shell = process.env.SHELL;
        if (shell && shell.includes('zsh')) return path.join(os.homedir(), '.zshrc');
        if (shell && shell.includes('bash')) return path.join(os.homedir(), '.bashrc');
        return null;

      case 'zsh':
        return path.join(homeDir, '.zshrc');

      case 'bash':
        // Check for .bash_profile first, then .bashrc
        if (process.platform === 'win32') {
          // Git Bash on Windows
          return path.join(homeDir, '.bashrc');
        } else {
          // Unix/Linux/macOS
          const bashProfile = path.join(homeDir, '.bash_profile');
          if (fs.existsSync(bashProfile)) {
            return bashProfile;
          }
          return path.join(homeDir, '.bashrc');
        }

      case 'fish':
        return path.join(homeDir, '.config/fish/config.fish');

      case 'csh':
        return path.join(homeDir, '.cshrc');

      case 'tcsh':
        return path.join(homeDir, '.tcshrc');

      default:
        return null;
    }
  }

  /**
   * Get system information for debugging
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      originalDir: this.results.originalDir,
      workingDir: this.results.workingDir,
      hasWritePermission: this.results.hasWritePermission,
      shell: this.detectShell(),
      homeDir: this.getHomeDirectory(),
      env: {
        USER: process.env.USER,
        HOME: process.env.HOME,
        PWD: process.env.PWD,
        SHELL: process.env.SHELL
      }
    };
  }

  /**
   * Display results and next steps
   */
  displayResults(result) {
    if (!result.success) {
      console.log('\n❌ Setup failed');
      console.log(`Error: ${result.error}`);
      console.log('\n💡 Suggestions:');
      console.log('1. Run from your home directory: cd ~');
      console.log('2. Try creating a project directory: mkdir ~/stigmergy && cd ~/stigmergy');
      console.log('3. Use enhanced installer with explicit directory');
      return;
    }

    console.log('\n✅ Working directory setup completed successfully!');
    console.log(`📍 Original directory: ${result.originalDir}`);
    console.log(`📁 Working directory: ${result.workingDir}`);
    console.log(`📝 Reason: ${result.reason}`);

    if (result.created) {
      console.log('🆕 Created new directory for you');
    }

    console.log('\n📦 npm Configuration:');
    console.log(`📍 Global prefix: ${result.npmConfig.npmGlobalDir}`);
    console.log(`📍 Bin directory: ${result.npmConfig.npmBinDir}`);

    console.log('\n🔧 Setup Instructions:');
    console.log(result.setupInstructions);

    console.log('\n💡 Next Steps:');
    console.log('1. Apply the shell configuration above');
    console.log('2. Run: npm install -g stigmergy');
    console.log('3. Run: stigmergy install');

    const systemInfo = this.getSystemInfo();
    if (this.options.verbose) {
      console.log('\n🔍 System Information:');
      console.log(JSON.stringify(systemInfo, null, 2));
    }
  }

  /**
   * Clean up created directories
   */
  async cleanup() {
    this.log('info', 'Cleaning up created directories...');

    for (const dir of this.results.createdDirectories) {
      try {
        await fs.rmdir(dir, { recursive: true });
        this.log('debug', `Cleaned up: ${dir}`);
      } catch (error) {
        this.log('warn', `Failed to clean up ${dir}: ${error.message}`);
      }
    }
  }
}

module.exports = DirectoryPermissionManager;