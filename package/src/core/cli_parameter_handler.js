// Unified CLI Parameter Handler
const { spawn } = require('child_process');

class CLIParameterHandler {
  /**
   * Generate appropriate arguments for CLI execution based on tool patterns
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @param {Object} cliPattern - CLI pattern information from analyzer
   * @returns {Array} Arguments array for spawn
   */
  static generateArguments(toolName, prompt, cliPattern) {
    // Default arguments
    let toolArgs = [];

    // Special handling for Codex CLI which always needs 'exec' subcommand
    if (toolName === 'codex') {
      return ['exec', '-p', `"${prompt}"`];
    }

    try {
      // Check if we have pattern information from CLI help analyzer
      if (cliPattern && cliPattern.commandStructure) {
        const commandStructure = cliPattern.commandStructure;

        // Handle based on command structure and patterns from help analyzer
        if (commandStructure.nonInteractiveSupport) {
          // Use flag-based approach if available
          if (commandStructure.promptFlag) {
            toolArgs = [commandStructure.promptFlag, `"${prompt}"`];
          } else if (commandStructure.nonInteractiveFlag) {
            toolArgs = [commandStructure.nonInteractiveFlag, `"${prompt}"`];
          } else {
            // Fallback to standard -p flag
            toolArgs = ['-p', `"${prompt}"`];
          }
        } else if (commandStructure.executionPattern === 'flag-based') {
          // Explicitly flag-based tools
          if (commandStructure.promptFlag) {
            toolArgs = [commandStructure.promptFlag, `"${prompt}"`];
          } else {
            toolArgs = ['-p', `"${prompt}"`];
          }
        } else if (commandStructure.executionPattern === 'argument-based') {
          // Argument-based tools
          toolArgs = [`"${prompt}"`];
        } else if (commandStructure.executionPattern === 'subcommand-based') {
          // Subcommand-based tools
          toolArgs = ['-p', `"${prompt}"`];
        } else {
          // Fallback to tool-specific handling
          toolArgs = this.getToolSpecificArguments(toolName, prompt);
        }
      } else {
        // Fallback to tool-specific handling if no pattern information
        toolArgs = this.getToolSpecificArguments(toolName, prompt);
      }
    } catch (error) {
      // Final fallback to tool-specific handling
      toolArgs = this.getToolSpecificArguments(toolName, prompt);
    }

    return toolArgs;
  }

  /**
   * Get tool-specific arguments based on known patterns
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @returns {Array} Arguments array for spawn
   */
  static getToolSpecificArguments(toolName, prompt) {
    // Tool-specific argument handling
    const toolSpecificArgs = {
      claude: ['-p', `"${prompt}"`],
      qodercli: ['-p', `"${prompt}"`],
      iflow: ['-p', `"${prompt}"`],
      codebuddy: ['-p', `"${prompt}"`],
      copilot: ['-p', `"${prompt}"`],
      codex: ['exec', '-p', `"${prompt}"`], // Codex needs 'exec' subcommand
    };

    // Return tool-specific arguments if available
    if (toolSpecificArgs[toolName]) {
      return toolSpecificArgs[toolName];
    }

    // Default handling for other tools
    // Check if the tool commonly uses -p flag
    const toolsWithPFlag = [
      'claude',
      'qodercli',
      'iflow',
      'codebuddy',
      'copilot',
    ];
    if (toolsWithPFlag.includes(toolName)) {
      return ['-p', `"${prompt}"`];
    }

    // Default to argument-based approach
    return [`"${prompt}"`];
  }

  /**
   * Execute CLI tool with appropriate arguments
   * @param {string} toolPath - Path to the CLI tool
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @param {Object} cliPattern - CLI pattern information from analyzer
   * @returns {Object} Child process object
   */
  static executeCLI(toolPath, toolName, prompt, cliPattern) {
    // Generate appropriate arguments
    const toolArgs = this.generateArguments(toolName, prompt, cliPattern);

    // Execute the tool
    const child = spawn(toolPath, toolArgs, {
      stdio: 'inherit',
      shell: true,
    });

    return child;
  }
}

module.exports = CLIParameterHandler;
