const CLIHelpAnalyzer = require('./cli_help_analyzer');
const { CLI_TOOLS, validateCLITool } = require('./cli_tools');
const { errorHandler } = require('./error_handler');

class SmartRouter {
  constructor() {
    this.tools = CLI_TOOLS;
    try {
      this.analyzer = new CLIHelpAnalyzer();
      this.analyzer.setCLITools(this.tools);
    } catch (error) {
      errorHandler.logError(error, 'ERROR', 'SmartRouter.constructor');
      throw error;
    }
    this.routeKeywords = [
      'use',
      'help',
      'please',
      'write',
      'generate',
      'explain',
      'analyze',
      'translate',
      'article',
    ];
    this.defaultTool = 'claude';
  }

  /**
   * Initialize the smart router
   */
  async initialize() {
    await this.analyzer.initialize();
  }

  /**
   * Check if input should be routed to a specific CLI tool
   */
  shouldRoute(userInput) {
    return this.routeKeywords.some((keyword) =>
      userInput.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  /**
   * Perform smart routing based on user input and CLI patterns
   * Prioritizes exact tool name matches over keyword matches
   */
  async smartRoute(userInput) {
    const input = userInput.trim();
    const inputLower = input.toLowerCase();

    // First, check for exact tool name matches (higher priority)
    for (const [toolName, _] of Object.entries(this.tools)) {
      try {
        // Validate tool configuration
        validateCLITool(toolName);

        if (inputLower.includes(toolName)) {
          // Extract clean parameters when the tool name itself is mentioned
          const cleanInput = input
            .replace(new RegExp(`.*${toolName}\\s*`, 'gi'), '')
            .replace(/^(use|please|help|using|with)\s*/i, '')
            .trim();
          return { tool: toolName, prompt: cleanInput };
        }
      } catch (error) {
        await errorHandler.logError(
          error,
          'WARN',
          `SmartRouter.smartRoute.${toolName}`,
        );
        // Continue with next tool
        continue;
      }
    }

    // Then check for keyword matches (lower priority)
    for (const [toolName, _] of Object.entries(this.tools)) {
      try {
        // Validate tool configuration
        validateCLITool(toolName);

        // Get CLI pattern for this tool
        let cliPattern = await this.analyzer.getCLIPattern(toolName);

        // If we don't have a pattern, try to analyze the CLI
        if (!cliPattern) {
          try {
            cliPattern = await this.analyzer.analyzeCLI(toolName);
          } catch (error) {
            console.warn(`Failed to analyze ${toolName}:`, error.message);
            // Continue with next tool
            continue;
          }
        }

        // Check if input contains any of the tool's keywords or subcommands
        const keywords = this.extractKeywords(toolName, cliPattern);
        for (const keyword of keywords) {
          // Skip the tool name itself since we already checked for exact matches
          if (keyword.toLowerCase() !== toolName.toLowerCase() &&
              inputLower.includes(keyword.toLowerCase())) {
            // Extract clean parameters
            const cleanInput = input
              .replace(new RegExp(`.*${keyword}\\s*`, 'gi'), '')
              .replace(/^(use|please|help|using|with)\s*/i, '')
              .trim();
            return { tool: toolName, prompt: cleanInput };
          }
        }
      } catch (error) {
        await errorHandler.logError(
          error,
          'WARN',
          `SmartRouter.smartRoute.${toolName}`,
        );
        // Continue with next tool
        continue;
      }
    }

    // Default routing
    const cleanInput = input
      .replace(/^(use|please|help|using|with)\s*/i, '')
      .trim();
    return { tool: this.defaultTool, prompt: cleanInput };
  }

  /**
   * Extract keywords for a tool from its CLI patterns
   */
  extractKeywords(toolName, cliPattern) {
    const keywords = [toolName];

    // Add tool-specific keywords
    const toolSpecificKeywords = {
      claude: ['claude', 'anthropic'],
      gemini: ['gemini', 'google'],
      qwen: ['qwen', 'alibaba', 'tongyi'],
      iflow: ['iflow', 'workflow', 'intelligent'],
      qodercli: ['qoder', 'code'],  // 'code' is specifically for qodercli only
      codebuddy: ['codebuddy', 'buddy', 'assistant'],
      copilot: ['copilot', 'github', 'gh'],
      codex: ['codex', 'openai', 'gpt'],  // Remove 'code' from here to avoid conflicts
    };

    if (toolSpecificKeywords[toolName]) {
      keywords.push(...toolSpecificKeywords[toolName]);
    }

    // Add subcommands from CLI pattern if available
    if (cliPattern && cliPattern.patterns && cliPattern.patterns.subcommands) {
      cliPattern.patterns.subcommands.forEach((subcommand) => {
        if (subcommand.name) {
          keywords.push(subcommand.name);
        }
      });
    }

    // Add commands from CLI pattern if available
    if (cliPattern && cliPattern.patterns && cliPattern.patterns.commands) {
      cliPattern.patterns.commands.forEach((command) => {
        if (command.name && command.name !== toolName) {
          keywords.push(command.name);
        }
      });
    }

    return [...new Set(keywords)]; // Remove duplicates
  }
}

module.exports = SmartRouter;
