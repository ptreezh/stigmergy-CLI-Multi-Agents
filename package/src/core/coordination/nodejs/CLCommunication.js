// src/core/coordination/nodejs/CLCommunication.js
const { spawn } = require('child_process');
const path = require('path');

class CLCommunication {
  constructor() {
    this.executionTimeout = 30000; // 30 seconds
  }

  async initialize() {
    console.log('[CL_COMMUNICATION] Initializing cross-CLI communication...');
  }

  async executeTask(sourceCLI, targetCLI, task, context) {
    console.log(`[CL_COMMUNICATION] Executing task from ${sourceCLI} to ${targetCLI}: ${task}`);
    
    try {
      // Execute the target CLI with the task
      const result = await this.executeCLICommand(targetCLI, task);
      return result;
    } catch (error) {
      console.error(`[CL_COMMUNICATION] Failed to execute task for ${targetCLI}:`, error);
      throw error;
    }
  }

  async executeCLICommand(cliName, task) {
    return new Promise((resolve, reject) => {
      // Prepare arguments based on the CLI type for non-interactive execution
      const args = this.prepareCLIArguments(cliName, task);
      
      // Spawn the CLI command
      const child = spawn(cliName, args, {
        encoding: 'utf8',
        timeout: this.executionTimeout,
        shell: true
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
          resolve({
            success: true,
            output: stdout.trim(),
            code: code
          });
        } else {
          reject({
            success: false,
            error: stderr.trim() || stdout.trim() || `Process exited with code ${code}`,
            code: code
          });
        }
      });

      child.on('error', (error) => {
        reject({
          success: false,
          error: `Failed to spawn process: ${error.message}`,
          code: null
        });
      });

      child.on('timeout', () => {
        child.kill();
        reject({
          success: false,
          error: `Command timed out after ${this.executionTimeout}ms`,
          code: null
        });
      });
    });
  }

  prepareCLIArguments(cliName, task) {
    // Prepare arguments based on the CLI type for non-interactive execution
    const cliTypes = {
      // CLIs that support -p flag for prompt
      'claude': ['-p', task],
      'qwen': ['-p', task],
      'gemini': ['-p', task],
      'iflow': ['-p', task],
      // CLIs that support direct prompt as argument
      'qodercli': [task],
      'codebuddy': [task],
      'copilot': [task],
      'codex': [task]
    };

    const args = cliTypes[cliName];
    return args || ['-p', task]; // Default to -p flag if not specified
  }

  getAdapter(cliName) {
    // Return a real adapter that can execute CLI commands
    return {
      name: cliName,
      executeTask: async (task, context) => {
        try {
          const result = await this.executeCLICommand(cliName, task);
          return result.output;
        } catch (error) {
          return `[${cliName.toUpperCase()} ERROR] ${error.error || error.message}`;
        }
      }
    };
  }

  generateTaskId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = CLCommunication;
