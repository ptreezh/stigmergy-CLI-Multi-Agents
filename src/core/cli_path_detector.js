/**
 * CLI Path Detector and Auto-Configurator
 *
 * This module automatically detects CLI tool paths and configures them
 * to resolve common installation issues on different platforms.
 */

const { spawnSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

class CLIPathDetector {
  constructor() {
    this.configDir = path.join(os.homedir(), '.stigmergy', 'cli-paths');
    this.pathCacheFile = path.join(this.configDir, 'detected-paths.json');
    this.detectedPaths = {};
    this.platform = os.platform();

    // Common npm global directories by platform
    this.npmGlobalPaths = this.getNPMGlobalPaths();

    // CLI tool name mappings (actual command vs expected)
    this.cliNameMap = {
      'claude': ['claude'],
      'gemini': ['gemini'],
      'qwen': ['qwen'],
      'iflow': ['iflow'],
      'qodercli': ['qodercli'],
      'codebuddy': ['codebuddy'],
      'copilot': ['copilot'],
      'codex': ['codex']
    };
  }

  /**
   * Get all possible npm global directories for current platform
   */
  getNPMGlobalPaths() {
    const paths = [];

    if (this.platform === 'win32') {
      // Windows paths
      paths.push(
        path.join(os.homedir(), 'AppData', 'Roaming', 'npm'), // User npm
        'C:/npm_global', // Custom global
        'C:/Program Files/nodejs/npm', // System npm
        path.join(process.env.ProgramFiles || 'C:/Program Files', 'npm')
      );
    } else {
      // Unix-like paths
      paths.push(
        path.join(os.homedir(), '.npm-global', 'bin'), // User local
        '/usr/local/bin', // System
        '/usr/bin', // System
        path.join(os.homedir(), '.npm', 'bin') // User npm
      );
    }

    return paths.filter(p => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });
  }

  /**
   * Get current PATH environment variable
   */
  getCurrentPath() {
    return (process.env.PATH || process.env.Path || '').split(path.delimiter);
  }

  /**
   * Check if a command exists in a specific directory
   */
  checkCommandInDir(command, dir) {
    const fullPath = path.join(dir, command);

    // Windows: check .cmd, .ps1, .exe files
    if (this.platform === 'win32') {
      const extensions = ['.cmd', '.ps1', '.exe', ''];
      for (const ext of extensions) {
        const fileWithExt = fullPath + ext;
        try {
          if (fs.existsSync(fileWithExt)) {
            return fileWithExt;
          }
        } catch {}
      }
    } else {
      // Unix-like: check direct executable
      try {
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      } catch {}
    }

    return null;
  }

  /**
   * Find command in system PATH
   */
  findCommandInPath(command) {
    try {
      const result = spawnSync('where', [command], {
        encoding: 'utf8',
        shell: true
      });

      if (result.status === 0 && result.stdout.trim()) {
        return result.stdout.trim().split('\n')[0]; // Return first match
      }
    } catch {}

    // Fallback: manually search PATH
    for (const dir of this.getCurrentPath()) {
      const found = this.checkCommandInDir(command, dir);
      if (found) return found;
    }

    return null;
  }

  /**
   * Find command in npm global directories
   */
  findCommandInNPMGlobal(command) {
    for (const dir of this.npmGlobalPaths) {
      const found = this.checkCommandInDir(command, dir);
      if (found) return found;
    }
    return null;
  }

  /**
   * Detect CLI tool path using multiple methods
   */
  async detectCLIPath(toolName) {
    console.log(`[DETECTOR] Detecting path for ${toolName}...`);

    const commandNames = this.cliNameMap[toolName] || [toolName];

    for (const command of commandNames) {
      // Method 1: Check system PATH (most common)
      let pathFound = this.findCommandInPath(command);
      if (pathFound) {
        console.log(`[DETECTOR] Found ${toolName} in PATH: ${pathFound}`);
        return pathFound;
      }

      // Method 2: Check npm global directories
      pathFound = this.findCommandInNPMGlobal(command);
      if (pathFound) {
        console.log(`[DETECTOR] Found ${toolName} in npm global: ${pathFound}`);
        return pathFound;
      }

      // Method 3: Check common installation locations
      if (this.platform === 'win32') {
        const userNPMPath = path.join(os.homedir(), 'AppData', 'Roaming', 'npm');
        pathFound = this.checkCommandInDir(command, userNPMPath);
        if (pathFound) {
          console.log(`[DETECTOR] Found ${toolName} in user npm: ${pathFound}`);
          return pathFound;
        }
      } else {
        const userNPMPath = path.join(os.homedir(), '.npm-global', 'bin');
        pathFound = this.checkCommandInDir(command, userNPMPath);
        if (pathFound) {
          console.log(`[DETECTOR] Found ${toolName} in user npm-global: ${pathFound}`);
          return pathFound;
        }
      }
    }

    console.log(`[DETECTOR] ${toolName} not found`);
    return null;
  }

  /**
   * Detect all CLI tool paths
   */
  async detectAllCLIPaths() {
    console.log('[DETECTOR] Starting comprehensive CLI path detection...');

    const allPaths = {};

    for (const toolName of Object.keys(this.cliNameMap)) {
      allPaths[toolName] = await this.detectCLIPath(toolName);
    }

    this.detectedPaths = allPaths;
    await this.saveDetectedPaths();

    return allPaths;
  }

  /**
   * Save detected paths to cache
   */
  async saveDetectedPaths() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });

      const cacheData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        platform: this.platform,
        npmGlobalPaths: this.npmGlobalPaths,
        detectedPaths: this.detectedPaths
      };

      await fs.writeFile(
        this.pathCacheFile,
        JSON.stringify(cacheData, null, 2),
        'utf8'
      );

      console.log(`[DETECTOR] Saved path cache to: ${this.pathCacheFile}`);
    } catch (error) {
      console.log(`[DETECTOR] Warning: Could not save path cache: ${error.message}`);
    }
  }

  /**
   * Load detected paths from cache
   */
  async loadDetectedPaths() {
    try {
      if (await fs.access(this.pathCacheFile).then(() => true).catch(() => false)) {
        const data = await fs.readFile(this.pathCacheFile, 'utf8');
        const cacheData = JSON.parse(data);
        this.detectedPaths = cacheData.detectedPaths || {};

        console.log(`[DETECTOR] Loaded ${Object.keys(this.detectedPaths).length} paths from cache`);
        return this.detectedPaths;
      }
    } catch (error) {
      console.log(`[DETECTOR] Warning: Could not load path cache: ${error.message}`);
    }

    return {};
  }

  /**
   * Update PATH environment variable if needed
   */
  async updatePATHIfMissing() {
    console.log('[DETECTOR] Checking PATH configuration...');

    const currentPath = this.getCurrentPath();
    const missingPaths = [];

    for (const dir of this.npmGlobalPaths) {
      if (!currentPath.includes(dir)) {
        missingPaths.push(dir);
      }
    }

    if (missingPaths.length > 0) {
      console.log(`[DETECTOR] Found ${missingPaths.length} missing npm global directories in PATH`);
      console.log('[DETECTOR] Automatically updating PATH for persistent access...');

      // Create PATH update script first (as backup)
      await this.createPATHUpdateScript(missingPaths);

      // Perform automatic PATH update
      const updateResult = await this.performAutoPATHUpdate(missingPaths);

      return {
        updated: updateResult.success,
        missingPaths,
        message: updateResult.success ? 'PATH automatically updated' : `PATH update failed: ${updateResult.error}`,
        scriptCreated: true,
        autoUpdateAttempted: true,
        scriptPath: path.join(this.configDir, 'setup-scripts')
      };
    }

    return {
      updated: true,
      message: 'PATH already contains all npm global directories'
    };
  }

  /**
   * Create script to update PATH
   */
  async createPATHUpdateScript(missingPaths) {
    const scriptDir = path.join(this.configDir, 'setup-scripts');
    await fs.mkdir(scriptDir, { recursive: true });

    if (this.platform === 'win32') {
      // Windows PowerShell script
      const ps1Script = `
# Stigmergy CLI PATH Update Script
# Run this script in PowerShell as Administrator

Write-Host "Adding npm global directories to PATH..." -ForegroundColor Green

$missingPaths = @(
${missingPaths.map(p => `    "${p}"`).join(',\n')}
)

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = $currentPath + ";" + ($missingPaths -join ";")

[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
Write-Host "PATH updated successfully!" -ForegroundColor Green
Write-Host "Please restart your terminal or run 'refreshenv' to apply changes" -ForegroundColor Yellow
      `;

      await fs.writeFile(
        path.join(scriptDir, 'update-path.ps1'),
        ps1Script,
        'utf8'
      );

      // Windows CMD script
      const cmdScript = `
@echo off
REM Stigmergy CLI PATH Update Script
REM Run this as Administrator

echo Adding npm global directories to PATH...
setx PATH "%PATH%;${missingPaths.join(';')}"
echo PATH updated successfully!
echo Please restart your terminal to apply changes
pause
      `;

      await fs.writeFile(
        path.join(scriptDir, 'update-path.bat'),
        cmdScript,
        'utf8'
      );

    } else {
      // Unix/Linux/Mac script
      const missingPathsArray = missingPaths.map(p => `"${p}"`).join('\n');
      const shScript = `#!/bin/bash
# Stigmergy CLI PATH Update Script
# Run this script: source update-path.sh

echo "Adding npm global directories to PATH..."

missing_paths=(
${missingPathsArray}
)

# Add to shell profile
shell_rc="$HOME/.bashrc"
if [ -f "$HOME/.zshrc" ]; then
    shell_rc="$HOME/.zshrc"
elif [ -f "$HOME/.profile" ]; then
    shell_rc="$HOME/.profile"
fi

for path in "\${missing_paths[@]}"; do
    if ! echo "$PATH" | grep -q "$path"; then
        echo "Adding $path to PATH in $shell_rc"
        echo 'export PATH="$PATH:'"$path'"' >> "$shell_rc"
        export PATH="$PATH:$path"
    fi
done

echo "PATH updated successfully!"
echo "Please restart your terminal or run 'source $shell_rc' to apply changes"
      `;

      await fs.writeFile(
        path.join(scriptDir, 'update-path.sh'),
        shScript,
        'utf8'
      );

      // Make script executable
      await fs.chmod(path.join(scriptDir, 'update-path.sh'), '755');
    }

    console.log(`[DETECTOR] Created PATH update scripts in: ${scriptDir}`);
  }

  /**
   * Perform automatic PATH update
   */
  async performAutoPATHUpdate(missingPaths) {
    try {
      if (this.platform === 'win32') {
        return await this.performWindowsPATHUpdate(missingPaths);
      } else {
        return await this.performUnixPATHUpdate(missingPaths);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform Windows PATH update
   */
  async performWindowsPATHUpdate(missingPaths) {
    try {
      const { spawnSync } = require('child_process');

      console.log('[DETECTOR] Windows: Updating user PATH environment variable...');

      // Use PowerShell to update user PATH permanently
      const pathsToAdd = missingPaths.join(';');
      const psCommand = `
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        $newPaths = @(${missingPaths.map(p => `"${p}"`).join(',')})
        foreach ($path in $newPaths) {
          if ($currentPath -notlike "*$path*") {
            $currentPath = $currentPath + ";" + $path
          }
        }
        [Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
        Write-Output "PATH updated successfully"
      `;

      const result = spawnSync('powershell', ['-Command', psCommand], {
        stdio: 'pipe',
        shell: true,
        encoding: 'utf8',
        timeout: 30000
      });

      if (result.status === 0) {
        console.log('[DETECTOR] ✓ Windows PATH updated successfully');
        console.log('[DETECTOR] ℹ Note: Restart terminal or run refreshenv to apply changes');
        return { success: true };
      } else {
        console.log('[DETECTOR] ✗ Windows PATH update failed');
        console.log(`[DETECTOR] Error: ${result.stderr || result.stdout}`);
        return {
          success: false,
          error: result.stderr || result.stdout || 'Unknown PowerShell error'
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform Unix/Linux/macOS PATH update
   */
  async performUnixPATHUpdate(missingPaths) {
    try {
      const fs = require('fs').promises;
      const { spawnSync } = require('child_process');

      console.log('[DETECTOR] Unix: Updating shell profile...');

      // Determine which shell profile to update
      const shellProfile = await this.determineShellProfile();

      if (!shellProfile) {
        return {
          success: false,
          error: 'Could not determine shell profile to update'
        };
      }

      // Read existing profile
      let profileContent = '';
      try {
        profileContent = await fs.readFile(shellProfile, 'utf8');
      } catch (error) {
        // File doesn't exist, create it
        profileContent = '';
      }

      // Add missing paths to profile
      const pathExports = missingPaths.map(path => `export PATH="$PATH:${path}"`).join('\n');

      // Check if paths are already in the profile
      const pathsToAdd = missingPaths.filter(path => !profileContent.includes(path));

      if (pathsToAdd.length === 0) {
        console.log('[DETECTOR] ✓ All paths already present in shell profile');
        return { success: true };
      }

      const newPathExports = pathsToAdd.map(path => `export PATH="$PATH:${path}"`).join('\n');
      const contentToAdd = `\n# Added by Stigmergy CLI - ${new Date().toISOString()}\n${newPathExports}\n`;

      await fs.writeFile(shellProfile, profileContent + contentToAdd, 'utf8');

      console.log(`[DETECTOR] ✓ Updated ${shellProfile} with PATH additions`);
      console.log('[DETECTOR] ℹ Note: Restart terminal or run source ~/.bashrc to apply changes');

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Determine which shell profile to update
   */
  async determineShellProfile() {
    const fs = require('fs').promises;
    const os = require('os');

    const homeDir = os.homedir();
    const possibleProfiles = [
      path.join(homeDir, '.bashrc'),
      path.join(homeDir, '.zshrc'),
      path.join(homeDir, '.profile'),
      path.join(homeDir, '.bash_profile')
    ];

    // First check which shell is currently being used
    const shellEnv = process.env.SHELL;
    if (shellEnv) {
      if (shellEnv.includes('zsh')) {
        return path.join(homeDir, '.zshrc');
      } else if (shellEnv.includes('bash')) {
        return path.join(homeDir, '.bashrc');
      }
    }

    // Fall back to checking which profile exists
    for (const profile of possibleProfiles) {
      try {
        await fs.access(profile);
        return profile;
      } catch {
        // File doesn't exist, continue checking
      }
    }

    // Default to .bashrc for most systems
    return path.join(homeDir, '.bashrc');
  }

  /**
   * Get detected path for a specific tool
   */
  getDetectedPath(toolName) {
    return this.detectedPaths[toolName] || null;
  }

  /**
   * Get status report of detected paths
   */
  getPathStatusReport() {
    const report = {
      platform: this.platform,
      npmGlobalPaths: this.npmGlobalPaths,
      detectedPaths: this.detectedPaths,
      summary: {
        total: Object.keys(this.cliNameMap).length,
        found: Object.values(this.detectedPaths).filter(Boolean).length,
        missing: Object.values(this.detectedPaths).filter(v => !v).length
      }
    };

    return report;
  }
}

module.exports = CLIPathDetector;