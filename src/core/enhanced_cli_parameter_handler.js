/**
 * Enhanced CLI Parameter Handler with Agent/Skill Support and Multi-Mode Retry
 *
 * This module extends the basic CLI parameter handling with:
 * 1. TWO-STAGE agent and skill detection (fast pre-check + detailed matching)
 * 2. Multiple parameter format support with retry mechanism
 * 3. Fallback strategies for different CLI tools
 *
 * OPTIMIZATION: Stage 1 (quickDetectMention) avoids cache I/O if no keywords found
 * 
 * 📚 参考文档：
 * - CLI Help Analyzer 重构：REFACTORING_CLI_HELP_ANALYZER.md
 * 
 * 🔗 依赖关系：
 * - 依赖 CLIHelpAnalyzer 的 getCLIPattern() 方法
 * - 重构后调用方式保持不变，完全向后兼容
 */

const CLIHelpAnalyzer = require('./cli_help_analyzer');
const { CLI_TOOLS } = require('./cli_tools');
const LocalSkillScanner = require('./local_skill_scanner');

class EnhancedCLIParameterHandler {
  constructor() {
    this.analyzer = new CLIHelpAnalyzer();
    this.skillScanner = new LocalSkillScanner();
    this.retryHistory = new Map(); // Track failed parameter formats
  }

  /**
   * Initialize the analyzer
   */
  async initialize() {
    await this.analyzer.initialize();
    // Note: skillScanner is initialized lazily (only when needed)
  }

  /**
   * Generate optimized arguments with agent/skill support and retry capability
   *
   * OPTIMIZED FLOW:
   * 1. Stage 1: Quick keyword detection (<1ms, no I/O)
   *    - No keywords? Skip all skill/agent processing
   *    - Has keywords? Proceed to Stage 2
   * 2. Stage 2: Load cache and detailed matching
   *    - Load skills/agents from cache
   *    - Perform precise matching
   * 3. Generate parameters based on CLI type
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @param {Object} options - Options
   * @param {number} options.maxRetries - Maximum number of format retries (default: 3)
   * @param {boolean} options.enableAgentSkillOptimization - Enable agent/skill optimization (default: true)
   * @param {Array} options.preferredFormats - Preferred parameter formats to try first
   * @returns {Promise<Object>} Result with arguments, format used, and optimization info
   */
  async generateArgumentsWithRetry(toolName, prompt, options = {}) {
    const {
      maxRetries = 3,
      enableAgentSkillOptimization = true,
      preferredFormats = null
    } = options;

    await this.initialize();

    // === STAGE 1: Quick Pre-Check (Fast, No I/O) ===
    let detectedMentions = { hasAgent: false, hasSkill: false, confidence: 0 };
    let optimizationApplied = false;
    let optimizedPrompt = prompt;
    let skillMatches = [];
    let agentMatches = [];

    if (enableAgentSkillOptimization) {
      // Fast keyword detection (<1ms)
      const quickDetection = this.skillScanner.quickDetectMention(prompt);

      if (!quickDetection.shouldLoadCache) {
        // No agent/skill keywords detected - skip all skill/agent processing
        if (process.env.DEBUG === 'true') {
          console.log(`[AGENT/SKILL] No keywords detected, skipping skill/agent processing`);
        }
      } else {
        // Keywords detected - proceed to Stage 2
        if (process.env.DEBUG === 'true') {
          console.log(`[AGENT/SKILL] Stage 1: Keywords detected (agent=${quickDetection.hasAgentKeyword}, skill=${quickDetection.hasSkillKeyword})`);
        }

        // === STAGE 2: Load Cache and Detailed Matching ===
        await this.skillScanner.initialize(); // Load cache

        // Get detailed matches using CLIHelpAnalyzer
        detectedMentions = this.analyzer.detectAgentSkillMentions(prompt, toolName);

        // Get local skill/agent matches
        skillMatches = this.skillScanner.matchSkills(prompt, toolName);
        agentMatches = this.skillScanner.matchAgents(prompt, toolName);

        // Combine detection results
        if (skillMatches.length > 0 || agentMatches.length > 0) {
          detectedMentions.hasSkill = detectedMentions.hasSkill || skillMatches.length > 0;
          detectedMentions.hasAgent = detectedMentions.hasAgent || agentMatches.length > 0;
          detectedMentions.confidence = Math.min(1.0, detectedMentions.confidence + 0.2);
        }

        // Optimize prompt if matches found
        if (detectedMentions.hasAgent || detectedMentions.hasSkill) {
          optimizedPrompt = this.analyzer.optimizePromptForCLI(prompt, toolName, detectedMentions);
          optimizationApplied = (optimizedPrompt !== prompt);

          if (process.env.DEBUG === 'true') {
            console.log(`[AGENT/SKILL] Stage 2: Detailed matching complete`);
            console.log(`[AGENT/SKILL] Skill matches: ${skillMatches.length}, Agent matches: ${agentMatches.length}`);
            if (optimizationApplied) {
              console.log(`[AGENT/SKILL] Original: ${prompt}`);
              console.log(`[AGENT/SKILL] Optimized: ${optimizedPrompt}`);
            }
          }
        }
      }
    }

    // Step 3: Get parameter formats to try (in priority order)
    const formatsToTry = await this.getParameterFormats(toolName, preferredFormats, detectedMentions);

    // Step 4: Try each format until one succeeds (or return first for non-execution context)
    const results = {
      toolName,
      originalPrompt: prompt,
      optimizedPrompt,
      optimizationApplied,
      detectedMentions,
      formats: []
    };

    for (let i = 0; i < Math.min(formatsToTry.length, maxRetries); i++) {
      const format = formatsToTry[i];
      const args = this.generateArgumentsForFormat(toolName, optimizedPrompt, format);

      results.formats.push({
        format: format.name,
        args,
        priority: format.priority,
        attempted: true
      });

      // For non-execution context, return all formats
      // For execution, the caller should handle retry
    }

    // Select the best format based on priority and detection
    const selectedFormat = this.selectBestFormat(results.formats, detectedMentions);
    results.selectedFormat = selectedFormat;
    results.arguments = selectedFormat.args;

    return results;
  }

  /**
   * Get parameter formats to try for a specific tool
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {Array} preferredFormats - User-preferred formats
   * @param {Object} detectedMentions - Detected agent/skill mentions
   * @returns {Promise<Array>} Array of format objects to try
   */
  async getParameterFormats(toolName, preferredFormats, detectedMentions) {
    const formats = [];

    // Get CLI pattern from analyzer
    const cliPattern = await this.analyzer.getCLIPattern(toolName);
    const enhancedPattern = this.analyzer.enhancedPatterns[toolName];

    if (process.env.DEBUG === 'true') {
      console.log(`[PARAM_FORMAT] Getting formats for ${toolName}`);
      console.log(`[PARAM_FORMAT] cliPattern exists: ${!!cliPattern}`);
      if (cliPattern && cliPattern.commandStructure) {
        console.log(`[PARAM_FORMAT] executionPattern: ${cliPattern.commandStructure.executionPattern}`);
        console.log(`[PARAM_FORMAT] nonInteractiveFlag: ${cliPattern.commandStructure.nonInteractiveFlag}`);
      }
    }

    // Define format priority based on tool characteristics
    if (enhancedPattern) {
      // Use enhanced pattern information
      if (enhancedPattern.positionalArgs) {
        // Check if CLI has flag-based non-interactive execution
        // For tools like Kode that have flag-based execution, don't use positional args
        const hasFlagBasedExecution = cliPattern?.commandStructure?.executionPattern === 'flag-based' &&
                                      cliPattern?.commandStructure?.nonInteractiveFlag;

        if (!hasFlagBasedExecution) {
          // Qwen, Copilot, etc. support positional arguments
          formats.push({
            name: 'positional',
            priority: enhancedPattern.positionalArgs ? 10 : 5,
            description: 'Positional arguments (natural language)',
            template: (prompt) => [prompt]
          });
        }
      }

      if (enhancedPattern.naturalLanguageSupport) {
        // CLIs with good natural language support
        formats.push({
          name: 'prompt-flag',
          priority: 8,
          description: 'Standard -p flag',
          template: (prompt) => ['-p', `"${prompt}"`]
        });
      }

      if (enhancedPattern.skillPrefixRequired) {
        // CodeBuddy requires skill: prefix
        formats.push({
          name: 'skill-prefix',
          priority: 9,
          description: 'Skill prefix with -y flag',
          template: (prompt) => ['-y', '-p', `"${prompt}"`]
        });
      }
    }

    // Add standard formats based on CLI pattern analysis
    if (cliPattern && cliPattern.commandStructure) {
      const structure = cliPattern.commandStructure;

      if (structure.promptFlag) {
        formats.push({
          name: 'detected-prompt-flag',
          priority: 7,
          description: `Detected prompt flag: ${structure.promptFlag}`,
          template: (prompt) => [structure.promptFlag, `"${prompt}"`]
        });
      }

      if (structure.executionPattern === 'argument-based') {
        formats.push({
          name: 'argument-based',
          priority: 6,
          description: 'Argument-based execution',
          template: (prompt) => [`"${prompt}"`]
        });
      }

      if (structure.executionPattern === 'subcommand-based') {
        // For tools like Codex that need subcommand
        formats.push({
          name: 'subcommand-exec',
          priority: 7,
          description: 'Subcommand-based with exec',
          template: (prompt) => ['exec', '-p', `"${prompt}"`]
        });
      }

      if (structure.executionPattern === 'flag-based') {
        // For tools like Kode that use flag-based execution (e.g., --print)
        if (structure.nonInteractiveFlag) {
          formats.push({
            name: 'flag-based-non-interactive',
            priority: 9,
            description: `Flag-based non-interactive: ${structure.nonInteractiveFlag}`,
            template: (prompt) => [structure.nonInteractiveFlag, `"${prompt}"`]
          });
        }
      }
    }

    // Add fallback formats
    formats.push({
      name: 'standard-p-flag',
      priority: 4,
      description: 'Standard -p flag (fallback)',
      template: (prompt) => ['-p', `"${prompt}"`]
    });

    // Filter out failed formats from retry history
    const failedFormats = this.retryHistory.get(toolName) || new Set();
    const validFormats = formats.filter(f => !failedFormats.has(f.name));

    if (process.env.DEBUG === 'true') {
      console.log(`[PARAM_FORMAT] Total formats: ${formats.length}`);
      formats.forEach(f => {
        console.log(`[PARAM_FORMAT]   - ${f.name} (priority: ${f.priority}): ${f.description}`);
      });
      console.log(`[PARAM_FORMAT] Valid formats: ${validFormats.length}`);
    }

    // If all formats failed, clear history and try again
    if (validFormats.length === 0) {
      if (process.env.DEBUG === 'true') {
        console.log(`[RETRY] All formats failed for ${toolName}, clearing retry history`);
      }
      this.retryHistory.delete(toolName);
      return formats;
    }

    // Sort by priority (descending)
    return validFormats.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate arguments for a specific format
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - Optimized prompt
   * @param {Object} format - Format object
   * @returns {Array} Arguments array
   */
  generateArgumentsForFormat(toolName, prompt, format) {
    try {
      return format.template(prompt);
    } catch (error) {
      if (process.env.DEBUG === 'true') {
        console.log(`[ERROR] Failed to generate args for format ${format.name}:`, error.message);
      }
      // Fallback to standard format
      return ['-p', `"${prompt}"`];
    }
  }

  /**
   * Select the best format from available options
   *
   * @param {Array} formats - Available formats
   * @param {Object} detectedMentions - Detected agent/skill mentions
   * @returns {Object} Selected format
   */
  selectBestFormat(formats, detectedMentions) {
    // Prioritize formats based on detection
    if (detectedMentions.hasSkill || detectedMentions.hasAgent) {
      // For agent/skill requests, prefer formats with higher priority
      const skillOptimizedFormats = formats.filter(f => f.priority >= 8);
      if (skillOptimizedFormats.length > 0) {
        return skillOptimizedFormats[0];
      }
    }

    // Return highest priority format
    return formats[0] || {
      name: 'fallback',
      priority: 1,
      args: ['-p', '"{prompt}"'],
      description: 'Fallback format'
    };
  }

  /**
   * Record a failed format for a tool
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {string} formatName - Name of the failed format
   */
  recordFailedFormat(toolName, formatName) {
    if (!this.retryHistory.has(toolName)) {
      this.retryHistory.set(toolName, new Set());
    }
    this.retryHistory.get(toolName).add(formatName);

    if (process.env.DEBUG === 'true') {
      console.log(`[RETRY] Recorded failed format ${formatName} for ${toolName}`);
      console.log(`[RETRY] Failed formats:`, Array.from(this.retryHistory.get(toolName)));
    }
  }

  /**
   * Clear retry history for a tool
   *
   * @param {string} toolName - Name of the CLI tool
   */
  clearRetryHistory(toolName) {
    this.retryHistory.delete(toolName);

    if (process.env.DEBUG === 'true') {
      console.log(`[RETRY] Cleared retry history for ${toolName}`);
    }
  }

  /**
   * Get compatibility score for a tool with the given prompt
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @returns {Object} Compatibility score and reasons
   */
  getCompatibilityScore(toolName, prompt) {
    return this.analyzer.getAgentSkillCompatibilityScore(toolName, prompt);
  }

  /**
   * Generate optimized call command for a tool
   *
   * @param {string} toolName - Name of the CLI tool
   * @param {string} prompt - User prompt
   * @returns {Object|null} Optimized call command
   */
  generateOptimizedCall(toolName, prompt) {
    return this.analyzer.generateOptimizedCall(toolName, prompt);
  }
}

module.exports = EnhancedCLIParameterHandler;
