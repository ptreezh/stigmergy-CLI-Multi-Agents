/**
 * Persistent Shell Configurator
 *
 * This module handles writing shell configuration that persists
 * across terminal sessions, ensuring CLI tools work from any directory.
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class PersistentShellConfigurator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      force: options.force || false,
      ...options
    };

    this.results = {
      shellType: null,
      profileFile: null,
      configured: false,
      createdFiles: [],
      modifiedFiles: []
    };
  }

  /**
   * Log messages with formatting
   */
  log(level, message) {
    const timestamp = new Date().toLocaleTimeString();
    const prefixes = {
      info: `[INFO] ${timestamp}`,
      success: `[SUCCESS] ${timestamp}`,
      warn: `[WARN] ${timestamp}`,
      error: `[ERROR] ${timestamp}`,
      debug: `[DEBUG] ${timestamp}`
    };

    const prefix = prefixes[level] || `[LOG] ${timestamp}`;
    const shouldLog = level === 'debug' ? this.options.verbose : true;

    if (shouldLog) {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Detect current shell type
   */
  detectShell() {
    // Windows-specific detection
    if (process.platform === 'win32') {
      if (process.env.PSModulePath) return 'powershell';
      if (process.env.COMSPEC && process.env.COMSPEC.includes('cmd.exe')) return 'cmd';
      if (process.env.SHELL && process.env.SHELL.includes('bash')) return 'bash';
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
   * Get shell profile file path
   */
  getShellProfileFile(shellType) {
    const homeDir = os.homedir();

    switch (shellType) {
      case 'powershell':
        // PowerShell profile locations (try multiple)
        const psProfiles = [
          path.join(homeDir, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1'),
          path.join(homeDir, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1'),
          path.join(homeDir, '.config', 'powershell', 'Microsoft.PowerShell_profile.ps1')
        ];

        // Return the first existing or most likely location
        return psProfiles[0]; // We'll try to create this if it doesn't exist

      case 'cmd':
        // Command Prompt doesn't have profile files, but we can suggest registry methods
        return null;

      case 'wsl':
        // WSL uses Linux-style shells
        const wslHome = process.env.HOME || path.join('/mnt', 'c', 'Users', process.env.USER || 'user');
        const wslShell = process.env.SHELL;
        if (wslShell && wslShell.includes('zsh')) return path.join(wslHome, '.zshrc');
        if (wslShell && wslShell.includes('bash')) return path.join(wslHome, '.bashrc');
        return path.join(wslHome, '.bashrc');

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
          return bashProfile; // We'll check existence and fallback to .bashrc
        }

      case 'fish':
        return path.join(homeDir, '.config', 'fish', 'config.fish');

      case 'csh':
        return path.join(homeDir, '.cshrc');

      case 'tcsh':
        return path.join(homeDir, '.tcshrc');

      default:
        return null;
    }
  }

  /**
   * Generate persistent configuration for different shell types
   */
  generatePersistentConfig(npmConfig) {
    const { npmGlobalDir, npmBinDir } = npmConfig;
    const shellType = this.detectShell();

    let config = '';

    // Add header comment
    config += '\n# Stigmergy CLI Environment Configuration\n';
    config += `# Generated on ${new Date().toISOString()}\n`;
    config += '# This configuration enables CLI tools to work from any directory\n\n';

    switch (shellType) {
      case 'powershell':
        config += '# PowerShell Environment Configuration\n';
        config += `$env:npm_config_prefix = "${npmGlobalDir}"\n`;
        config += `$env:PATH = "${npmBinDir};$env:PATH"\n`;
        break;

      case 'cmd':
        config += '# Command Prompt Environment Configuration\n';
        config += `@echo off\n`;
        config += `set npm_config_prefix=${npmGlobalDir}\n`;
        config += `set PATH=${npmBinDir};%PATH%\n`;
        break;

      case 'zsh':
      case 'bash':
        config += '# Shell Environment Configuration\n';
        config += `export npm_config_prefix="${npmGlobalDir}"\n`;
        config += `export PATH="${npmBinDir}:$PATH"\n`;
        break;

      case 'fish':
        config += '# Fish Shell Environment Configuration\n';
        config += `set -gx npm_config_prefix "${npmGlobalDir}"\n`;
        config += `set -gx PATH "${npmBinDir}" $PATH\n`;
        break;

      case 'csh':
      case 'tcsh':
        config += '# C Shell Environment Configuration\n';
        config += `setenv npm_config_prefix "${npmGlobalDir}"\n`;
        config += `setenv PATH "${npmBinDir}:$PATH"\n`;
        break;

      default:
        config += '# Generic Shell Configuration\n';
        config += `npm_config_prefix="${npmGlobalDir}"\n`;
        config += `PATH="${npmBinDir}:$PATH"\n`;
        break;
    }

    return { shellType, config };
  }

  /**
   * Ensure profile file exists
   */
  async ensureProfileFile(profilePath) {
    try {
      // Check if file exists
      await fs.access(profilePath);
      this.log('debug', `Profile file exists: ${profilePath}`);
      return true;
    } catch (error) {
      // File doesn't exist, create it
      this.log('info', `Creating profile file: ${profilePath}`);

      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(profilePath);
        await fs.mkdir(dir, { recursive: true });

        // Create empty file
        await fs.writeFile(profilePath, '');
        this.results.createdFiles.push(profilePath);
        this.log('success', `Created profile file: ${profilePath}`);
        return true;
      } catch (createError) {
        this.log('error', `Failed to create profile file: ${createError.message}`);
        return false;
      }
    }
  }

  /**
   * Check if configuration already exists
   */
  async hasExistingConfiguration(profilePath) {
    try {
      const content = await fs.readFile(profilePath, 'utf8');
      const marker = '# Stigmergy CLI Environment Configuration';
      return content.includes(marker);
    } catch (error) {
      return false;
    }
  }

  /**
   * Write persistent configuration to shell profile
   */
  async writePersistentConfiguration(npmConfig) {
    this.log('info', 'Writing persistent shell configuration...');

    // Detect shell and get profile file
    this.results.shellType = this.detectShell();
    this.results.profileFile = this.getShellProfileFile(this.results.shellType);

    this.log('debug', `Detected shell: ${this.results.shellType}`);
    if (this.results.profileFile) {
      this.log('debug', `Profile file: ${this.results.profileFile}`);
    }

    if (!this.results.profileFile) {
      if (this.results.shellType === 'cmd') {
        this.log('warn', 'Command Prompt detected, providing manual instructions');
        return await this.handleCmdPrompt(npmConfig);
      } else {
        this.log('error', 'Could not determine shell profile file');
        return false;
      }
    }

    // Generate configuration
    const { config } = this.generatePersistentConfig(npmConfig);

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN - Would write configuration:');
      console.log(config);
      return true;
    }

    try {
      // Ensure profile file exists
      if (!await this.ensureProfileFile(this.results.profileFile)) {
        return false;
      }

      // Check for existing configuration
      const hasExisting = await this.hasExistingConfiguration(this.results.profileFile);

      if (hasExisting && !this.options.force) {
        this.log('info', 'Configuration already exists in profile file');
        this.results.configured = true;
        return true;
      }

      if (hasExisting && this.options.force) {
        this.log('warn', 'Overwriting existing configuration due to --force flag');
        // Remove existing configuration
        await this.removeExistingConfiguration(this.results.profileFile);
      }

      // Append configuration to profile
      await fs.appendFile(this.results.profileFile, config);
      this.results.modifiedFiles.push(this.results.profileFile);
      this.results.configured = true;

      this.log('success', `Configuration written to: ${this.results.profileFile}`);

      return true;

    } catch (error) {
      this.log('error', `Failed to write configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle Command Prompt case (no profile files)
   */
  async handleCmdPrompt(npmConfig) {
    const { npmGlobalDir, npmBinDir } = npmConfig;

    this.log('info', 'Command Prompt detected - providing multiple setup options:');

    console.log('\n🔧 Command Prompt Setup Options:');
    console.log('=====================================');

    console.log('\nOption 1: Temporary setup (current session only)');
    console.log(`set npm_config_prefix=${npmGlobalDir}`);
    console.log(`set PATH=${npmBinDir};%PATH%`);

    console.log('\nOption 2: Permanent setup (via registry)');
    console.log('Run these commands as Administrator:');
    console.log(`setx npm_config_prefix "${npmGlobalDir}"`);
    console.log(`setx PATH "%PATH%;${npmBinDir}"`);

    console.log('\nOption 3: Use PowerShell instead');
    console.log('PowerShell supports profile files for permanent configuration');

    console.log('\n💡 Recommendation: Use PowerShell for better configuration management');

    // Write configuration to a batch file for easy execution
    const batchFile = path.join(process.env.TEMP || '/tmp', 'stigmergy-setup.bat');
    const batchContent = `@echo off
echo Setting up Stigmergy CLI environment...
set npm_config_prefix=${npmGlobalDir}
set PATH=${npmBinDir};%PATH%
echo Environment configured for this session.
echo.
echo To make permanent, run:
echo   setx npm_config_prefix "${npmGlobalDir}"
echo   setx PATH "%PATH%;${npmBinDir}"
`;

    try {
      await fs.writeFile(batchFile, batchContent);
      console.log(`\n📝 Created setup script: ${batchFile}`);
      console.log('You can run this script to set up the environment.');
    } catch (error) {
      this.log('warn', `Could not create setup script: ${error.message}`);
    }

    return true; // We've provided instructions, so consider it handled
  }

  /**
   * Remove existing configuration from profile
   */
  async removeExistingConfiguration(profilePath) {
    try {
      const content = await fs.readFile(profilePath, 'utf8');
      const lines = content.split('\n');
      const startMarker = '# Stigmergy CLI Environment Configuration';
      const endMarker = '# End Stigmergy CLI Configuration';

      let inStigmergyConfig = false;
      const filteredLines = lines.filter(line => {
        if (line.includes(startMarker)) {
          inStigmergyConfig = true;
          return false;
        }
        if (line.includes(endMarker) || inStigmergyConfig && line.trim() === '') {
          inStigmergyConfig = false;
          return false;
        }
        return !inStigmergyConfig;
      });

      await fs.writeFile(profilePath, filteredLines.join('\n'));
      this.log('debug', 'Removed existing Stigmergy configuration');
    } catch (error) {
      this.log('warn', `Could not remove existing configuration: ${error.message}`);
    }
  }

  /**
   * Verify configuration was written correctly
   */
  async verifyConfiguration() {
    if (!this.results.profileFile) {
      return false;
    }

    try {
      const content = await fs.readFile(this.results.profileFile, 'utf8');
      const hasConfig = content.includes('Stigmergy CLI Environment Configuration');

      if (hasConfig) {
        this.log('success', 'Configuration verified in profile file');
        return true;
      } else {
        this.log('error', 'Configuration not found in profile file');
        return false;
      }
    } catch (error) {
      this.log('error', `Failed to verify configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Display setup instructions
   */
  displaySetupInstructions() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 Shell Configuration Setup Instructions');
    console.log('='.repeat(60));

    if (this.results.configured) {
      console.log('\n✅ Configuration successfully written!');
      console.log(`📄 Shell Profile: ${this.results.profileFile}`);
      console.log(`🔧 Shell Type: ${this.results.shellType}`);

      console.log('\n💡 Next Steps:');
      console.log('1. Restart your terminal to load the new configuration');
      console.log('2. Or manually source the profile file:');

      switch (this.results.shellType) {
        case 'powershell':
          console.log('   . $PROFILE');
          break;
        case 'zsh':
          console.log('   source ~/.zshrc');
          break;
        case 'bash':
          console.log('   source ~/.bashrc');
          break;
        case 'fish':
          console.log('   source ~/.config/fish/config.fish');
          break;
      }

      console.log('3. Verify: stigmergy --version');

    } else {
      console.log('\n❌ Configuration could not be written automatically');
      console.log('\n💡 Manual setup required:');
    }
  }

  /**
   * Get results
   */
  getResults() {
    return {
      ...this.results,
      timestamp: new Date().toISOString(),
      platform: process.platform,
      homeDirectory: os.homedir()
    };
  }
}

module.exports = PersistentShellConfigurator;