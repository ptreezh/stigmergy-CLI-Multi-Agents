/**
 * Natural Language Parser for Cross-CLI Collaboration
 * 
 * This parser handles natural language input from users and identifies:
 * - Cross-CLI call intents
 * - Target CLI tools
 * - Task content
 * - Language type (Chinese/English)
 * 
 * @module NaturalLanguageParser
 */

const COLLABORATION_PATTERNS = {
  // Chinese patterns
  CHINESE: {
    // Direct call patterns
    DIRECT_CALL: [
      /(?:调用|使用|让|请)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:来|帮)?(?:我)?(?:执行)?(.+?)(?:任务|指令)?$/i,
      /(?:请|麻烦)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:帮我)?(.+)$/i,
      /(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:，|,)(.+)$/i
    ],
    
    // Collaboration request patterns
    COLLABORATION: [
      /(?:需要|想要|希望)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:的)?(?:帮助|协助|支持)(?:来)?(.+)$/i,
      /(?:让|请)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:和|与)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:一起|协作)(?:来)?(.+)$/i,
      /(?:协作|协同)(?:使用)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:和)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:来)?(.+)$/i
    ],
    
    // Task delegation patterns
    DELEGATION: [
      /(?:把|将)(.+?)(?:任务|工作)(?:委托|分配|交给)(?:claude|qwen|iflow|codex|codebuddy|qodercli)$/i,
      /(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:帮我)?(?:处理|解决)(.+)$/i
    ],
    
    // Task continuation patterns
    CONTINUATION: [
      /(?:继续|接着)(?:由)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:来)?(.+)$/i,
      /(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:继续)?(?:完成)(.+)$/i
    ],
    
    // Task handoff patterns
    HANDOFF: [
      /(?:把|将)(.+?)(?:转交|移交)(?:给)(?:claude|qwen|iflow|codex|codebuddy|qodercli)$/i,
      /(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:接手)?(?:处理)(.+)$/i
    ],
    
    // Task review patterns
    REVIEW: [
      /(?:请|麻烦)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:帮我)?(?:审查|检查|审核)(.+)$/i,
      /(?:让)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:来)?(?:审查|检查)(.+)$/i
    ],
    
    // Task optimization patterns
    OPTIMIZATION: [
      /(?:请|麻烦)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:帮我)?(?:优化|改进)(.+)$/i,
      /(?:让)(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:来)?(?:优化)(.+)$/i
    ]
  },
  
  // English patterns
  ENGLISH: {
    // Direct call patterns
    DIRECT_CALL: [
      /(?:call|use|let|please|ask)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+to)?(?:execute)?\s+(.+?)(?:\s+(?:task|command))?$/i,
      /(?:please|can you)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+help me)?\s+(.+)$/i,
      /^(?:claude|qwen|iflow|codex|codebuddy|qodercli)[,，]\s*(.+)$/i
    ],
    
    // Collaboration request patterns
    COLLABORATION: [
      /(?:need|want|hope)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:'s)?(?:\s+help|assistance|support)(?:\s+to)?\s+(.+)$/i,
      /(?:let|please)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)\s+(?:and|with)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+work together|collaborate)(?:\s+to)?\s+(.+)$/i,
      /(?:collaborate|coordinate)\s+using\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)\s+and\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+to)?\s+(.+)$/i
    ],
    
    // Task delegation patterns
    DELEGATION: [
      /(?:delegate|assign|give)\s+(.+?)\s+(?:task|work)\s+to\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)$/i,
      /^(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+help me)?(?:\s+handle|solve)\s+(.+)$/i
    ],
    
    // Task continuation patterns
    CONTINUATION: [
      /(?:continue|proceed)\s+with\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+to)?\s+(.+)$/i,
      /^(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+continue)?(?:\s+complete)\s+(.+)$/i
    ],
    
    // Task handoff patterns
    HANDOFF: [
      /(?:handoff|transfer|pass)\s+(.+?)\s+to\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)$/i,
      /^(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+take over)?(?:\s+handle)\s+(.+)$/i
    ],
    
    // Task review patterns
    REVIEW: [
      /(?:please|can you)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+help me)?(?:\s+review|check|audit)\s+(.+)$/i,
      /(?:let)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+to)?(?:\s+review)\s+(.+)$/i
    ],
    
    // Task optimization patterns
    OPTIMIZATION: [
      /(?:please|can you)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+help me)?(?:\s+optimize|improve)\s+(.+)$/i,
      /(?:let)\s+(?:claude|qwen|iflow|codex|codebuddy|qodercli)(?:\s+to)?(?:\s+optimize)\s+(.+)$/i
    ]
  }
};

const CLI_TOOLS = ['claude', 'qwen', 'iflow', 'codex', 'codebuddy', 'qodercli'];

class NaturalLanguageParser {
  constructor(options = {}) {
    this.options = {
      confidenceThreshold: options.confidenceThreshold || 0.7,
      enableCache: options.enableCache !== false,
      cacheTTL: options.cacheTTL || 60000, // 60 seconds
      ...options
    };
    
    this.cache = new Map();
    this.cacheTimestamps = new Map();
  }

  /**
   * Parse user input to identify cross-CLI collaboration intent
   * 
   * @param {string} user_input - User's natural language input
   * @param {string} language - Language type ('zh' or 'en')
   * @returns {Promise<Object>} Parse result with intent, target CLI, task, and confidence
   */
  async parseIntent(user_input, language = 'zh') {
    try {
      // Check cache first
      if (this.options.enableCache) {
        const cached = this._getFromCache(user_input, language);
        if (cached) {
          return cached;
        }
      }

      // Detect language if not provided
      const detectedLanguage = language || this._detectLanguage(user_input);
      
      // Map language code to pattern key
      const languageKey = detectedLanguage === 'en' ? 'ENGLISH' : 'CHINESE';
      const patterns = COLLABORATION_PATTERNS[languageKey] || COLLABORATION_PATTERNS.CHINESE;

      // Try each pattern type
      let bestMatch = null;
      let bestConfidence = 0;

      for (const [patternType, patternList] of Object.entries(patterns)) {
        for (const pattern of patternList) {
          const match = user_input.match(pattern);
          if (match) {
            const confidence = this._calculateConfidence(match, patternType, user_input);
            
            // Extract target CLI and task content
            const targetCLI = this._extractTargetCLI(match[0]);
            const taskContent = this._extractTaskContent(match[1] || match[0]);
            
            // Create match result
            const matchResult = {
              intent: patternType,
              targetCLI: targetCLI,
              task: taskContent,
              confidence: confidence,
              language: detectedLanguage,
              originalInput: user_input,
              matchedPattern: pattern.source
            };
            
            // Update best match if this one has higher confidence
            if (confidence > bestConfidence) {
              bestMatch = matchResult;
              bestConfidence = confidence;
            }
          }
        }
      }

      // If no match found, return default intent
      if (!bestMatch) {
        bestMatch = {
          intent: 'local',
          targetCLI: null,
          task: user_input,
          confidence: 0.5,
          language: detectedLanguage,
          originalInput: user_input,
          matchedPattern: null
        };
      }

      // Cache the result
      if (this.options.enableCache) {
        this._setToCache(user_input, language, bestMatch);
      }

      return bestMatch;
    } catch (error) {
      console.error('Error parsing intent:', error);
      return {
        intent: 'local',
        targetCLI: null,
        task: user_input,
        confidence: 0.0,
        language: language,
        originalInput: user_input,
        matchedPattern: null,
        error: error.message
      };
    }
  }

  /**
   * Detect language from input text
   * 
   * @param {string} text - Input text
   * @returns {string} Detected language ('zh' or 'en')
   * @private
   */
  _detectLanguage(text) {
    // Simple heuristic: check for Chinese characters
    const chineseCharRegex = /[\u4e00-\u9fa5]/;
    const hasChinese = chineseCharRegex.test(text);
    
    return hasChinese ? 'zh' : 'en';
  }

  /**
   * Calculate confidence score for a match
   * 
   * @param {Array} match - Regex match result
   * @param {string} patternType - Type of pattern matched
   * @param {string} originalInput - Original user input
   * @returns {number} Confidence score (0-1)
   * @private
   */
  _calculateConfidence(match, patternType, originalInput) {
    let confidence = 0.5; // Base confidence

    // Boost confidence based on pattern type
    const patternWeights = {
      DIRECT_CALL: 0.3,
      COLLABORATION: 0.35, // Higher weight for collaboration
      DELEGATION: 0.25,
      CONTINUATION: 0.2,
      HANDOFF: 0.25,
      REVIEW: 0.2,
      OPTIMIZATION: 0.2
    };

    confidence += patternWeights[patternType] || 0.1;

    // Boost confidence if target CLI is explicitly mentioned
    const hasTargetCLI = CLI_TOOLS.some(cli => 
      match[0].toLowerCase().includes(cli.toLowerCase())
    );
    if (hasTargetCLI) {
      confidence += 0.15;
    }

    // Extra boost for collaboration pattern if multiple CLI tools are mentioned
    if (patternType === 'COLLABORATION') {
      const cliCount = CLI_TOOLS.filter(cli => 
        originalInput.toLowerCase().includes(cli.toLowerCase())
      ).length;
      if (cliCount >= 2) {
        confidence += 0.1; // Extra boost for multi-CLI collaboration
      }
    }

    // Boost confidence if task content is clear
    if (match[1] && match[1].trim().length > 0) {
      confidence += 0.1;
    }

    // Normalize confidence to 0-1 range
    return Math.min(confidence, 1.0);
  }

  /**
   * Extract target CLI from matched text
   * 
   * @param {string} text - Matched text
   * @returns {string|null} Target CLI name or null
   * @private
   */
  _extractTargetCLI(text) {
    for (const cli of CLI_TOOLS) {
      if (text.toLowerCase().includes(cli.toLowerCase())) {
        return cli;
      }
    }
    return null;
  }

  /**
   * Extract task content from matched text
   * 
   * @param {string} text - Matched task text
   * @returns {string} Cleaned task content
   * @private
   */
  _extractTaskContent(text) {
    if (!text) return '';
    
    // Remove common particles and connectors (word boundary matching)
    let cleaned = text
      .replace(/^(?:来|去|帮我|帮我|请|麻烦)\s*/i, '')
      .replace(/^(?:to|for|with|and|the)\s+/i, '')
      .replace(/(?:任务|指令|task|command|work|job)\s*$/i, '')
      .trim();
    
    // Only capitalize first letter if it's lowercase
    if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  }

  /**
   * Get result from cache
   * 
   * @param {string} input - Input text
   * @param {string} language - Language type
   * @returns {Object|null} Cached result or null
   * @private
   */
  _getFromCache(input, language) {
    const cacheKey = `${language}:${input}`;
    const cached = this.cache.get(cacheKey);
    const timestamp = this.cacheTimestamps.get(cacheKey);
    
    if (cached && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.options.cacheTTL) {
        return cached;
      } else {
        // Cache expired
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
      }
    }
    
    return null;
  }

  /**
   * Set result to cache
   * 
   * @param {string} input - Input text
   * @param {string} language - Language type
   * @param {Object} result - Parse result
   * @private
   */
  _setToCache(input, language, result) {
    const cacheKey = `${language}:${input}`;
    this.cache.set(cacheKey, result);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      ttl: this.options.cacheTTL,
      enabled: this.options.enableCache
    };
  }
}

module.exports = {
  NaturalLanguageParser,
  COLLABORATION_PATTERNS,
  CLI_TOOLS
};