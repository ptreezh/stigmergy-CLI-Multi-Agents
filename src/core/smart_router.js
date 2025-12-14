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
    // Track recently failed tools to avoid repeated analysis attempts
    this.recentFailures = new Map();
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
   * Optimized to reduce unnecessary error messages and improve performance
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
        // Only log error if it's a real issue, not just a missing pattern
        if (
          error.message &&
          !error.message.includes('no such file or directory')
        ) {
          await errorHandler.logError(
            error,
            'WARN',
            `SmartRouter.smartRoute.${toolName}`,
          );
        }
        // Continue with next tool
        continue;
      }
    }

    // Then check for keyword matches (lower priority)
    // Only analyze tools that are likely to match to reduce overhead
    const potentialMatches = [];
    for (const [toolName, _] of Object.entries(this.tools)) {
      // Quick check: if the input is very short, only analyze a few key tools
      if (input.length < 20) {
        // For short inputs, only analyze commonly used tools
        const commonTools = ['claude', 'gemini', 'qwen'];
        if (!commonTools.includes(toolName)) {
          continue;
        }
      }

      // Add tool to potential matches for detailed analysis
      potentialMatches.push(toolName);
    }

    // Analyze potential matches
    for (const toolName of potentialMatches) {
      try {
        // Validate tool configuration
        validateCLITool(toolName);

        // Get CLI pattern for this tool - with optimized caching
        let cliPattern = await this.getOptimizedCLIPattern(toolName);

        // Check if input contains any of the tool's keywords or subcommands
        const keywords = this.extractKeywords(toolName, cliPattern);
        for (const keyword of keywords) {
          // Skip the tool name itself since we already checked for exact matches
          if (
            keyword.toLowerCase() !== toolName.toLowerCase() &&
            inputLower.includes(keyword.toLowerCase())
          ) {
            // Extract clean parameters
            const cleanInput = input
              .replace(new RegExp(`.*${keyword}\\s*`, 'gi'), '')
              .replace(/^(use|please|help|using|with)\s*/i, '')
              .trim();
            return { tool: toolName, prompt: cleanInput };
          }
        }
      } catch (error) {
        // Only log error if it's a real issue, not just a missing pattern
        if (
          error.message &&
          !error.message.includes('no such file or directory')
        ) {
          await errorHandler.logError(
            error,
            'WARN',
            `SmartRouter.smartRoute.${toolName}`,
          );
        }
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
   * Get CLI pattern with optimized error handling to reduce noise
   */
  async getOptimizedCLIPattern(toolName) {
    try {
      // Quick check for missing tools to avoid unnecessary analysis
      const config = await this.analyzer.loadPersistentConfig();
      const failedAttempt = config.failedAttempts[toolName];

      // If there was a recent failure (less than 1 hour ago), skip analysis entirely
      if (failedAttempt && this.isRecentFailure(failedAttempt.timestamp)) {
        if (process.env.DEBUG === 'true') {
          console.log(
            `[INFO] Skipping analysis for ${toolName} due to recent failure`,
          );
        }
        // Return cached analysis if available, otherwise null
        const cached = await this.analyzer.getCachedAnalysis(toolName);
        return cached || null;
      }

      const cached = await this.analyzer.getCachedAnalysis(toolName);

      if (cached && !this.analyzer.isCacheExpired(cached.timestamp)) {
        return cached;
      }

      // Analyze CLI if no cache or failure is old
      return await this.analyzer.analyzeCLI(toolName);
    } catch (error) {
      // Only log serious errors, suppress file not found errors
      if (
        error.message &&
        !error.message.includes('ENOENT') &&
        !error.message.includes('no such file or directory')
      ) {
        console.warn(`[WARN] Unable to get help information for ${toolName}`);
      }
      return null;
    }
  }

  /**
   * Check if failure timestamp is recent (less than 1 hour)
   */
  isRecentFailure(timestamp) {
    const failureTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - failureTime) / (1000 * 60 * 60);
    return hoursDiff < 1; // Recent if less than 1 hour
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
      qodercli: ['qoder', 'code'], // 'code' is specifically for qodercli only
      codebuddy: ['codebuddy', 'buddy', 'assistant'],
      copilot: ['copilot', 'github', 'gh'],
      codex: ['codex', 'openai', 'gpt'], // Remove 'code' from here to avoid conflicts
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
