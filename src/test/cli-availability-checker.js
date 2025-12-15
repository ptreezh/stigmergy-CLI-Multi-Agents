/**
 * CLI Availability Checker
 * Detects which CLI tools are installed and available for testing
 */

const { spawn } = require('child_process');
const { CLI_TOOLS } = require('../../src/core/cli_tools');

class CLIAvailabilityChecker {
  constructor() {
    this.checkedTools = new Map();
    this.timeout = 5000; // 5 seconds timeout for each check
  }

  /**
   * Check if a CLI tool is installed and available
   * @param {string} toolName - Name of the CLI tool
   * @returns {Promise<boolean>} True if tool is available
   */
  async isToolAvailable(toolName) {
    if (this.checkedTools.has(toolName)) {
      return this.checkedTools.get(toolName);
    }

    const tool = CLI_TOOLS[toolName];
    if (!tool) {
      this.checkedTools.set(toolName, false);
      return false;
    }

    try {
      const isAvailable = await this.checkToolExists(toolName, tool.version);
      this.checkedTools.set(toolName, isAvailable);
      return isAvailable;
    } catch (error) {
      this.checkedTools.set(toolName, false);
      return false;
    }
  }

  /**
   * Check if a specific command exists
   * @param {string} toolName - Tool name
   * @param {string} versionCommand - Command to check version
   * @returns {Promise<boolean>} True if command exists
   */
  async checkToolExists(toolName, versionCommand) {
    return new Promise((resolve) => {
      const parts = versionCommand.split(' ');
      const command = parts[0];
      const args = parts.slice(1);

      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        windowsHide: true
      });

      let resolved = false;
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill('SIGTERM');
          resolve(false);
        }
      }, this.timeout);

      child.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);

          // Check for serious errors
          if (stderr.includes('ERR_MODULE_NOT_FOUND') ||
              stderr.includes('Cannot find module') ||
              stderr.includes('command not found') ||
              stderr.includes('is not recognized')) {
            resolve(false);
            return;
          }

          // Consider exit code 0, 1, or 255 as success
          // Some CLIs return 255 for version commands
          // But also check that we got some output (not just empty error)
          const hasOutput = stdout.length > 0 || (stderr.length > 0 && !stderr.includes('Error'));
          resolve((code === 0 || code === 1 || code === 255) && hasOutput);
        }
      });

      child.on('error', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(false);
        }
      });
    });
  }

  /**
   * Get availability of all CLI tools
   * @returns {Promise<Object>} Map of tool availability
   */
  async checkAllTools() {
    const results = {};
    const toolNames = Object.keys(CLI_TOOLS);

    // Check tools sequentially to avoid conflicts
    for (const toolName of toolNames) {
      results[toolName] = await this.isToolAvailable(toolName);
    }

    return results;
  }

  /**
   * Get only available tools
   * @returns {Promise<Array>} List of available tool names
   */
  async getAvailableTools() {
    const allTools = await this.checkAllTools();
    return Object.entries(allTools)
      .filter(([_, available]) => available)
      .map(([name, _]) => name);
  }

  /**
   * Get installation commands for unavailable tools
   * @returns {Promise<Object>} Map of tool to installation command
   */
  async getInstallationCommands() {
    const allTools = await this.checkAllTools();
    const commands = {};

    Object.entries(allTools).forEach(([toolName, available]) => {
      if (!available && CLI_TOOLS[toolName]) {
        commands[toolName] = CLI_TOOLS[toolName].install;
      }
    });

    return commands;
  }

  /**
   * Print availability report
   */
  async printAvailabilityReport() {
    const allTools = await this.checkAllTools();
    const available = Object.entries(allTools).filter(([_, a]) => a).length;
    const total = Object.keys(allTools).length;

    console.log('\n=== CLI Tool Availability Report ===');
    console.log(`Available: ${available}/${total}\n`);

    console.log('�?Available Tools:');
    Object.entries(allTools)
      .filter(([_, available]) => available)
      .forEach(([toolName, _]) => {
        console.log(`  - ${toolName}`);
      });

    const unavailable = Object.entries(allTools).filter(([_, a]) => !a);
    if (unavailable.length > 0) {
      console.log('\n�?Unavailable Tools:');
      unavailable.forEach(([toolName, _]) => {
        console.log(`  - ${toolName}`);
        console.log(`    Install: ${CLI_TOOLS[toolName].install}`);
      });
    }

    console.log('=====================================\n');
  }

  /**
   * Clear cache of checked tools
   */
  clearCache() {
    this.checkedTools.clear();
  }
}

module.exports = CLIAvailabilityChecker;
