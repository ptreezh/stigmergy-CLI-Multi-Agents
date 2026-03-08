/**
 * Smart Router - 智能路由器，根据用户输入选择最合适的 CLI 工具
 *
 * 📚 参考文档：
 * - CLI Help Analyzer 重构：REFACTORING_CLI_HELP_ANALYZER.md
 *
 * 🔗 依赖关系：
 * - 依赖 CLIHelpAnalyzer 的 getEnhancedCLIPattern() 方法
 * - 重构后调用方式保持不变，完全向后兼容
 *
 * @module SmartRouter
 */
const CLIHelpAnalyzer = require("./cli_help_analyzer");
const { CLI_TOOLS, validateCLITool, getPathDetector } = require("./cli_tools");
const { errorHandler } = require("./error_handler");

// Valid CLI tools whitelist - excludes helper functions attached to CLI_TOOLS
const VALID_CLI_TOOLS = [
  "claude",
  "gemini",
  "qwen",
  "iflow",
  "codebuddy",
  "codex",
  "qodercli",
  "copilot",
  "kode",
  "opencode",
  "kilocode",
];

// Pre-defined constants (avoid recreation on each call)
const ROUTE_PATTERNS = new Set([
  "use",
  "using",
  "with",
  "help",
  "please",
  "assist",
  "write",
  "generate",
  "explain",
  "analyze",
  "translate",
  "article",
  "create",
  "code",
]);

const COMMON_TOOLS = ["claude", "gemini", "qwen"];
const CLEANUP_PREFIXES_REGEX = /^(use|please|help|using|with)\s*/i;
const SHORT_INPUT_THRESHOLD = 20;
const FAILURE_CACHE_HOURS = 1;
const DEFAULT_CONFIDENCE = 0.3;
const FALLBACK_MIN_SCORE = 0.3;
const FALLBACK_CONFIDENCE_MULTIPLIER = 0.8;

// Tool-specific keywords (static, no need to recreate)
const TOOL_SPECIFIC_KEYWORDS = {
  claude: ["claude", "anthropic"],
  gemini: ["gemini", "google"],
  qwen: ["qwen", "alibaba", "tongyi"],
  iflow: ["iflow", "workflow", "intelligent"],
  qodercli: ["qoder", "code"],
  codebuddy: ["codebuddy", "buddy", "assistant"],
  copilot: ["copilot", "github", "gh"],
  codex: ["codex", "openai", "gpt"],
  kode: ["kode", "multi-model", "collaboration", "multi模型"],
};

// CLI-specific advantages (static)
const CLI_ADVANTAGES = {
  claude: ["高质量输出", "自然语言理解"],
  iflow: ["智能工作流", "中文优化"],
  qwen: ["优秀的中文语义理解", "位置参数支持"],
  codebuddy: ["明确的技能语法", "系统性强"],
  qodercli: ["基础分析能力"],
};

// Regex cache for dynamic patterns
const regexCache = new Map();

/**
 * Get or create cached regex pattern
 * @param {string} pattern - Pattern to match
 * @returns {RegExp} Cached regex
 */
function getCachedRegex(pattern) {
  if (!regexCache.has(pattern)) {
    regexCache.set(pattern, new RegExp(pattern, "gi"));
  }
  return regexCache.get(pattern);
}

/**
 * Extract clean parameters from input
 * @param {string} input - Original input
 * @param {string} matchPattern - Pattern to remove (e.g., tool name or keyword)
 * @returns {string} Cleaned input
 */
function extractCleanInput(input, matchPattern = null) {
  let cleanInput = input;
  if (matchPattern) {
    const regex = getCachedRegex(`.*${matchPattern}\\s*`);
    cleanInput = cleanInput.replace(regex, "");
  }
  return cleanInput.replace(CLEANUP_PREFIXES_REGEX, "").trim();
}

/**
 * Check if error is a "file not found" type
 * @param {Error} error - Error to check
 * @returns {boolean} True if file not found error
 */
function isFileNotFoundError(error) {
  return (
    error.message &&
    (error.message.includes("no such file or directory") ||
      error.message.includes("ENOENT"))
  );
}

/**
 * Check if failure timestamp is recent (less than specified hours)
 * @param {string} timestamp - ISO timestamp
 * @param {number} hours - Hours threshold
 * @returns {boolean} True if recent
 */
function isRecentFailure(timestamp, hours = FAILURE_CACHE_HOURS) {
  const failureTime = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now - failureTime) / (1000 * 60 * 60);
  return hoursDiff < hours;
}

class SmartRouter {
  constructor() {
    this.tools = CLI_TOOLS;
    this.validTools = VALID_CLI_TOOLS;
    try {
      this.analyzer = new CLIHelpAnalyzer();
      this.analyzer.setCLITools(this.tools);
    } catch (error) {
      errorHandler.logError(error, "ERROR", "SmartRouter.constructor");
      throw error;
    }
    this.defaultTool = "claude";
    // Cache for installed tools to avoid repeated detection
    this._installedToolsCache = null;
    this._installedToolsCacheTime = 0;
  }

  /**
   * Get list of installed CLI tools from cache (with TTL)
   * @param {number} ttlMs - Cache TTL in milliseconds (default: 5 minutes)
   */
  async getInstalledTools(ttlMs = 5 * 60 * 1000) {
    const now = Date.now();
    if (
      this._installedToolsCache &&
      now - this._installedToolsCacheTime < ttlMs
    ) {
      return this._installedToolsCache;
    }

    const detector = getPathDetector();
    await detector.loadDetectedPaths();
    this._installedToolsCache = detector.detectedPaths;
    this._installedToolsCacheTime = now;
    return this._installedToolsCache;
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
    if (!userInput || typeof userInput !== "string") {
      return false;
    }

    const input = userInput.toLowerCase().trim();

    // Use Set for O(1) lookup instead of Array.some()
    const words = input.split(/\s+/);
    return words.some((word) => ROUTE_PATTERNS.has(word));
  }

  /**
   * Perform smart routing based on user input and CLI patterns
   * Optimized to reduce unnecessary error messages and improve performance
   * Prioritizes exact tool name matches over keyword matches
   */
  async smartRoute(userInput) {
    const input = userInput.trim();
    const inputLower = input.toLowerCase();

    // Get installed tools to filter out unavailable ones
    const installedTools = await this.getInstalledTools();

    // Phase 1: Check for exact tool name matches (highest priority)
    const exactMatch = await this._findExactMatch(
      input,
      inputLower,
      installedTools,
    );
    if (exactMatch) return exactMatch;

    // Phase 2: Check for keyword matches (lower priority)
    const keywordMatch = await this._findKeywordMatch(
      input,
      inputLower,
      installedTools,
    );
    if (keywordMatch) return keywordMatch;

    // Default routing
    return {
      tool: this.defaultTool,
      prompt: extractCleanInput(input),
    };
  }

  /**
   * Find exact tool name match in input
   * @private
   */
  async _findExactMatch(input, inputLower, installedTools) {
    for (const toolName of this.validTools) {
      if (!installedTools[toolName]) continue;

      try {
        validateCLITool(toolName);

        if (inputLower.includes(toolName)) {
          return {
            tool: toolName,
            prompt: extractCleanInput(input, toolName),
          };
        }
      } catch (error) {
        await this._handleToolError(error, toolName, "exactMatch");
      }
    }
    return null;
  }

  /**
   * Find keyword match in input
   * @private
   */
  async _findKeywordMatch(input, inputLower, installedTools) {
    // For short inputs, only analyze commonly used tools
    const toolsToAnalyze =
      input.length < SHORT_INPUT_THRESHOLD ? COMMON_TOOLS : this.validTools;

    for (const toolName of toolsToAnalyze) {
      if (!installedTools[toolName]) continue;

      try {
        validateCLITool(toolName);

        const cliPattern = await this.getOptimizedCLIPattern(toolName);
        const keywords = this.extractKeywords(toolName, cliPattern);

        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase();
          // Skip the tool name itself since we already checked for exact matches
          if (
            keywordLower !== toolName.toLowerCase() &&
            inputLower.includes(keywordLower)
          ) {
            return {
              tool: toolName,
              prompt: extractCleanInput(input, keyword),
            };
          }
        }
      } catch (error) {
        await this._handleToolError(error, toolName, "keywordMatch");
      }
    }
    return null;
  }

  /**
   * Handle tool-related errors consistently
   * @private
   */
  async _handleToolError(error, toolName, context) {
    if (!isFileNotFoundError(error)) {
      await errorHandler.logError(
        error,
        "WARN",
        `SmartRouter.${context}.${toolName}`,
      );
    }
  }

  /**
   * Get CLI pattern with optimized error handling to reduce noise
   */
  async getOptimizedCLIPattern(toolName) {
    try {
      // Quick check for missing tools to avoid unnecessary analysis
      const config = await this.analyzer.loadPersistentConfig();
      const failedAttempt = config.failedAttempts?.[toolName];

      // If there was a recent failure, skip analysis
      if (failedAttempt && isRecentFailure(failedAttempt.timestamp)) {
        if (process.env.DEBUG === "true") {
          console.log(
            `[INFO] Skipping analysis for ${toolName} due to recent failure`,
          );
        }
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
      if (!isFileNotFoundError(error)) {
        console.warn(`[WARN] Unable to get help information for ${toolName}`);
      }
      return null;
    }
  }

  /**
   * Extract keywords for a tool from its CLI patterns
   */
  extractKeywords(toolName, cliPattern) {
    const keywords = new Set([toolName]);

    // Add tool-specific keywords
    if (TOOL_SPECIFIC_KEYWORDS[toolName]) {
      TOOL_SPECIFIC_KEYWORDS[toolName].forEach((k) => keywords.add(k));
    }

    // Add subcommands from CLI pattern if available
    if (cliPattern?.patterns?.subcommands) {
      cliPattern.patterns.subcommands.forEach((subcommand) => {
        if (subcommand.name) keywords.add(subcommand.name);
      });
    }

    // Add commands from CLI pattern if available
    if (cliPattern?.patterns?.commands) {
      cliPattern.patterns.commands.forEach((command) => {
        if (command.name && command.name !== toolName) {
          keywords.add(command.name);
        }
      });
    }

    return [...keywords];
  }

  /**
   * Enhanced smart routing with agent and skill support
   */
  async smartRouteEnhanced(userInput, options = {}) {
    const input = userInput.trim();
    const inputLower = input.toLowerCase();

    // Get installed tools once
    const installedTools = await this.getInstalledTools();
    const routingResults = [];

    // Analyze all valid CLI tools for agent/skill compatibility
    for (const toolName of this.validTools) {
      if (!installedTools[toolName]) continue;

      try {
        validateCLITool(toolName);

        const compatibility = await this.getAgentSkillCompatibilityScore(
          toolName,
          input,
        );

        // Check for exact tool name matches (highest priority)
        let matchScore = 0;
        if (inputLower.includes(toolName)) {
          matchScore = 1.0;
        } else if (compatibility.score > 0) {
          matchScore = compatibility.score;
        }

        if (matchScore > 0) {
          const enhancedPattern = await this.getEnhancedCLIPattern(toolName);
          const optimizedCall = this.analyzer.generateOptimizedCall(
            toolName,
            input,
          );

          routingResults.push({
            tool: toolName,
            score: matchScore,
            compatibility,
            pattern: enhancedPattern,
            optimizedCall,
            reasons: this.getRoutingReasons(toolName, input, compatibility),
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
        alternativeOptions: routingResults.slice(1, 3),
      };
    }

    // Default routing with enhanced pattern
    return {
      tool: this.defaultTool,
      prompt: extractCleanInput(input),
      confidence: DEFAULT_CONFIDENCE,
      compatibility: await this.getAgentSkillCompatibilityScore(
        this.defaultTool,
        input,
      ),
      routingReasons: ["默认路由"],
      alternativeOptions: [],
    };
  }

  /**
   * Get agent/skill compatibility score for CLI tool
   */
  async getAgentSkillCompatibilityScore(toolName, prompt) {
    try {
      if (this.analyzer?.getAgentSkillCompatibilityScore) {
        return this.analyzer.getAgentSkillCompatibilityScore(toolName, prompt);
      }
    } catch (error) {
      if (process.env.DEBUG === "true") {
        console.log(
          `Error getting compatibility score for ${toolName}:`,
          error.message,
        );
      }
    }

    // Fallback scoring
    return { score: 0.5, reasons: ["基础兼容性"] };
  }

  /**
   * Get enhanced CLI pattern with agent/skill support
   */
  async getEnhancedCLIPattern(toolName) {
    try {
      if (this.analyzer?.getEnhancedCLIPattern) {
        return await this.analyzer.getEnhancedCLIPattern(toolName);
      }
    } catch (error) {
      if (process.env.DEBUG === "true") {
        console.log(
          `Error getting enhanced pattern for ${toolName}:`,
          error.message,
        );
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
    const inputLower = input.toLowerCase();

    if (inputLower.includes(toolName)) {
      reasons.push(`输入包含工具名称: ${toolName}`);
    }

    if (compatibility.reasons) {
      reasons.push(...compatibility.reasons);
    }

    if (CLI_ADVANTAGES[toolName]) {
      reasons.push(...CLI_ADVANTAGES[toolName]);
    }

    return reasons;
  }

  /**
   * Generate fallback routing options when primary fails
   */
  async generateFallbackRoutes(primaryRoute, error) {
    const fallbackRoutes = [];
    const installedTools = await this.getInstalledTools();

    for (const toolName of this.validTools) {
      if (toolName === primaryRoute.tool || !installedTools[toolName]) {
        continue;
      }

      try {
        const compatibility = await this.getAgentSkillCompatibilityScore(
          toolName,
          primaryRoute.prompt,
        );
        const enhancedPattern = await this.getEnhancedCLIPattern(toolName);

        if (compatibility.score > FALLBACK_MIN_SCORE) {
          fallbackRoutes.push({
            tool: toolName,
            prompt: primaryRoute.prompt,
            confidence: compatibility.score * FALLBACK_CONFIDENCE_MULTIPLIER,
            compatibility,
            pattern: enhancedPattern,
            reason: `备用选项 (原工具失败: ${error.message.substring(0, 50)}...)`,
          });
        }
      } catch {
        continue;
      }
    }

    return fallbackRoutes
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Enhanced route execution with agent/skill support and fallback
   */
  async executeEnhancedRoute(userInput, maxRetries = 2) {
    let currentRoute = await this.smartRouteEnhanced(userInput);
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        if (process.env.DEBUG === "true") {
          console.log(
            `[DEBUG] Executing route: ${currentRoute.tool} with confidence ${currentRoute.confidence}`,
          );
        }
        return currentRoute;
      } catch (error) {
        retryCount++;

        if (retryCount > maxRetries) {
          throw new Error(
            `Route execution failed after ${maxRetries} retries: ${error.message}`,
          );
        }

        if (process.env.DEBUG === "true") {
          console.log(
            `[DEBUG] Route failed, generating fallback (attempt ${retryCount}):`,
            error.message,
          );
        }

        const fallbackRoutes = await this.generateFallbackRoutes(
          currentRoute,
          error,
        );

        if (fallbackRoutes.length === 0) {
          throw new Error("No fallback routes available");
        }

        currentRoute = fallbackRoutes[0];

        if (process.env.DEBUG === "true") {
          console.log(`[DEBUG] Using fallback route: ${currentRoute.tool}`);
        }
      }
    }
  }

  /**
   * Batch route multiple inputs efficiently
   */
  async batchRouteEnhanced(inputs, options = {}) {
    const { parallel = true, maxConcurrent = 3 } = options;

    if (!parallel || inputs.length <= 1) {
      // Process sequentially
      return Promise.all(inputs.map((input) => this.smartRouteEnhanced(input)));
    }

    // Process in batches
    const results = [];
    for (let i = 0; i < inputs.length; i += maxConcurrent) {
      const batch = inputs.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((input) => this.smartRouteEnhanced(input)),
      );
      results.push(...batchResults);
    }
    return results;
  }
}

module.exports = SmartRouter;
