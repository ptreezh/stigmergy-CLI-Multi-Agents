const CLIHelpAnalyzer = require('./cli_help_analyzer');
const { CLI_TOOLS, validateCLITool } = require('./cli_tools');
const { errorHandler } = require('./error_handler');

// Valid CLI tools whitelist - excludes helper functions attached to CLI_TOOLS
const VALID_CLI_TOOLS = [
  'claude',
  'gemini',
  'qwen',
  'iflow',
  'codebuddy',
  'codex',
  'qodercli',
  'copilot',
  'kode'
];

class SmartRouter {
  constructor() {
    this.tools = CLI_TOOLS;
    this.validTools = VALID_CLI_TOOLS;
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
    if (!userInput || typeof userInput !== 'string') {
      return false;
    }

    const input = userInput.toLowerCase().trim();

    // Check for route keywords
    const routePatterns = [
      'use', 'using', 'with',
      'help', 'please', 'assist',
      'write', 'generate', 'explain', 'analyze',
      'translate', 'article', 'create', 'code'
    ];

    return routePatterns.some(pattern => input.includes(pattern));
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
    // Only iterate through valid CLI tools (exclude helper functions)
    for (const toolName of this.validTools) {
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
    for (const toolName of this.validTools) {
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
      kode: ['kode', 'multi-model', 'collaboration', 'multi模型']
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

  /**
   * Enhanced smart routing with agent and skill support
   */
  async smartRouteEnhanced(userInput, options = {}) {
    const input = userInput.trim();
    const inputLower = input.toLowerCase();
    
    // Enhanced routing priorities based on agent/skill detection
    const routingResults = [];

    // Analyze all valid CLI tools for agent/skill compatibility
    for (const toolName of this.validTools) {
      try {
        validateCLITool(toolName);

        // Get compatibility score for this tool
        const compatibility = await this.getAgentSkillCompatibilityScore(toolName, input);

        // Check for exact tool name matches (highest priority)
        let matchScore = 0;
        if (inputLower.includes(toolName)) {
          matchScore = 1.0;
        } else if (compatibility.score > 0) {
          matchScore = compatibility.score;
        }

        if (matchScore > 0) {
          // Get enhanced CLI pattern
          const enhancedPattern = await this.getEnhancedCLIPattern(toolName);

          // Generate optimized command
          const optimizedCall = this.analyzer.generateOptimizedCall(toolName, input);

          routingResults.push({
            tool: toolName,
            score: matchScore,
            compatibility,
            pattern: enhancedPattern,
            optimizedCall,
            reasons: this.getRoutingReasons(toolName, input, compatibility)
          });
        }
      } catch (error) {
        // Skip tools with configuration errors
        continue;
      }
    }

    // Sort by score (descending)
    routingResults.sort((a, b) => b.score - a.score);

    // Return best match or default
    if (routingResults.length > 0) {
      const bestMatch = routingResults[0];
      return {
        tool: bestMatch.tool,
        prompt: bestMatch.optimizedCall?.optimizedPrompt || input,
        confidence: bestMatch.score,
        compatibility: bestMatch.compatibility,
        optimizedCall: bestMatch.optimizedCall,
        routingReasons: bestMatch.reasons,
        alternativeOptions: routingResults.slice(1, 3) // Top 2 alternatives
      };
    }

    // Default routing with enhanced pattern
    const cleanInput = input
      .replace(/^(use|please|help|using|with)\s*/i, '')
      .trim();
    
    return {
      tool: this.defaultTool,
      prompt: cleanInput,
      confidence: 0.3,
      compatibility: await this.getAgentSkillCompatibilityScore(this.defaultTool, input),
      routingReasons: ['默认路由'],
      alternativeOptions: []
    };
  }

  /**
   * Get agent/skill compatibility score for CLI tool
   */
  async getAgentSkillCompatibilityScore(toolName, prompt) {
    try {
      if (this.analyzer && this.analyzer.getAgentSkillCompatibilityScore) {
        return this.analyzer.getAgentSkillCompatibilityScore(toolName, prompt);
      }
    } catch (error) {
      if (process.env.DEBUG === 'true') {
        console.log(`Error getting compatibility score for ${toolName}:`, error.message);
      }
    }
    
    // Fallback scoring
    return { score: 0.5, reasons: ['基础兼容性'] };
  }

  /**
   * Get enhanced CLI pattern with agent/skill support
   */
  async getEnhancedCLIPattern(toolName) {
    try {
      if (this.analyzer && this.analyzer.getEnhancedCLIPattern) {
        return await this.analyzer.getEnhancedCLIPattern(toolName);
      }
    } catch (error) {
      if (process.env.DEBUG === 'true') {
        console.log(`Error getting enhanced pattern for ${toolName}:`, error.message);
      }
    }
    
    // Fallback to regular pattern
    return await this.getOptimizedCLIPattern(toolName);
  }

  /**
   * Get routing reasons for debugging
   */
  getRoutingReasons(toolName, input, compatibility) {
    const reasons = [];

    // Input-based reasons
    const inputLower = input.toLowerCase();
    if (inputLower.includes(toolName)) {
      reasons.push(`输入包含工具名称: ${toolName}`);
    }

    // Compatibility-based reasons
    if (compatibility.reasons) {
      reasons.push(...compatibility.reasons);
    }

    // CLI-specific advantages
    const cliAdvantages = {
      'claude': ['高质量输出', '自然语言理解'],
      'iflow': ['智能工作流', '中文优化'],
      'qwen': ['优秀的中文语义理解', '位置参数支持'],
      'codebuddy': ['明确的技能语法', '系统性强'],
      'qodercli': ['基础分析能力']
    };

    if (cliAdvantages[toolName]) {
      reasons.push(...cliAdvantages[toolName]);
    }

    return reasons;
  }

  /**
   * Generate fallback routing options when primary fails
   */
  async generateFallbackRoutes(primaryRoute, error) {
    const fallbackRoutes = [];

    // Get compatibility scores for all valid CLI tools
    for (const toolName of this.validTools) {
      if (toolName === primaryRoute.tool) {
        continue; // Skip the failed tool
      }

      try {
        const compatibility = await this.getAgentSkillCompatibilityScore(toolName, primaryRoute.prompt);
        const enhancedPattern = await this.getEnhancedCLIPattern(toolName);

        if (compatibility.score > 0.3) { // Only consider reasonably compatible tools
          fallbackRoutes.push({
            tool: toolName,
            prompt: primaryRoute.prompt,
            confidence: compatibility.score * 0.8, // Reduce confidence for fallbacks
            compatibility,
            pattern: enhancedPattern,
            reason: `备用选项 (原工具失败: ${error.message.substring(0, 50)}...)`
          });
        }
      } catch (routeError) {
        continue; // Skip tools that can't be routed
      }
    }

    // Sort by compatibility score
    fallbackRoutes.sort((a, b) => b.confidence - a.confidence);
    
    return fallbackRoutes.slice(0, 3); // Return top 3 fallbacks
  }

  /**
   * Enhanced route execution with agent/skill support and fallback
   */
  async executeEnhancedRoute(userInput, maxRetries = 2) {
    let currentRoute = await this.smartRouteEnhanced(userInput);
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        if (process.env.DEBUG === 'true') {
          console.log(`[DEBUG] Executing route: ${currentRoute.tool} with confidence ${currentRoute.confidence}`);
        }

        // Return the successful route
        return currentRoute;

      } catch (error) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          // All retries failed, throw the error
          throw new Error(`Route execution failed after ${maxRetries} retries: ${error.message}`);
        }

        if (process.env.DEBUG === 'true') {
          console.log(`[DEBUG] Route failed, generating fallback (attempt ${retryCount}):`, error.message);
        }

        // Generate fallback routes
        const fallbackRoutes = await this.generateFallbackRoutes(currentRoute, error);
        
        if (fallbackRoutes.length === 0) {
          throw new Error('No fallback routes available');
        }

        // Use the best fallback route
        currentRoute = fallbackRoutes[0];
        
        if (process.env.DEBUG === 'true') {
          console.log(`[DEBUG] Using fallback route: ${currentRoute.tool}`);
        }
      }
    }
  }

  /**
   * Batch route multiple inputs efficiently
   */
  async batchRouteEnhanced(inputs, options = {}) {
    const results = [];
    const { parallel = true, maxConcurrent = 3 } = options;

    if (parallel && inputs.length > 1) {
      // Process in batches to avoid overwhelming the system
      const batches = [];
      for (let i = 0; i < inputs.length; i += maxConcurrent) {
        batches.push(inputs.slice(i, i + maxConcurrent));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(input => this.smartRouteEnhanced(input));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
    } else {
      // Process sequentially
      for (const input of inputs) {
        const result = await this.smartRouteEnhanced(input);
        results.push(result);
      }
    }

    return results;
  }
}

module.exports = SmartRouter;
