const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

// 简化 analyzeCLIEnhanced 方法
const oldMethod1 = `  /**
   * Enhanced analysis with agent and skill detection
   */
  async analyzeCLIEnhanced(cliName) {
    const basicAnalysis = await this.analyzeCLI(cliName);
    
    if (!basicAnalysis.success) {
      return basicAnalysis;
    }

    // Add enhanced agent and skill information
    const enhancedPatterns = this.enhancedPatterns[cliName] || {};
    
    basicAnalysis.agentSkillSupport = {
      supportsAgents: enhancedPatterns.agentDetection || false,
      supportsSkills: enhancedPatterns.skillDetection || false,
      naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,
      skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,
      positionalArgs: enhancedPatterns.positionalArgs || false,
      agentTypes: enhancedPatterns.agentTypes || [],
      skillKeywords: enhancedPatterns.skillKeywords || [],
      commandFormat: enhancedPatterns.commandFormat || "",
      examples: enhancedPatterns.examples || []
    };

    return basicAnalysis;
  }`;

const newMethod1 = `  /**
   * 增强分析（向后兼容）
   * @deprecated 建议使用 analyzeCLI(cliName, { enhanced: true })
   * @param {string} cliName - CLI工具名称
   * @returns {Promise<Object>} 增强分析结果
   */
  async analyzeCLIEnhanced(cliName) {
    return await this.analyzeCLI(cliName, { enhanced: true });
  }`;

let newContent = content.replace(oldMethod1, newMethod1);

// 简化 getEnhancedCLIPattern 方法
const oldMethod2 = `  async getEnhancedCLIPattern(cliName) {
    const cached = await this.getCachedAnalysis(cliName);
    
    // 优化：添加版本变化检测
    if (cached && cached.success && cached.timestamp && !this.isCacheExpired(cached.timestamp)) {
      // 检查版本是否变化
      const cliConfig = this.cliTools[cliName];
      if (cliConfig) {
        const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
        // 如果版本未变化，使用缓存
        if (currentVersion === cached.version) {
          // Enhance cached data with agent/skill information
          const enhancedPatterns = this.enhancedPatterns[cliName];
          if (enhancedPatterns) {
            cached.agentSkillSupport = {
              supportsAgents: enhancedPatterns.agentDetection || false,
              supportsSkills: enhancedPatterns.skillDetection || false,
              naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,
              skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,
              positionalArgs: enhancedPatterns.positionalArgs || false,
              agentTypes: enhancedPatterns.agentTypes || [],
              skillKeywords: enhancedPatterns.skillKeywords || [],
              commandFormat: enhancedPatterns.commandFormat || "",
              examples: enhancedPatterns.examples || []
            };
          }
          return cached;
        }
      }
    }

    // Perform enhanced analysis
    return await this.analyzeCLIEnhanced(cliName);
  }`;

const newMethod2 = `  /**
   * 获取增强CLI模式（向后兼容）
   * @deprecated 建议使用 analyzeCLI(cliName, { enhanced: true })
   * @param {string} cliName - CLI工具名称
   * @returns {Promise<Object>} 增强分析结果
   */
  async getEnhancedCLIPattern(cliName) {
    return await this.analyzeCLI(cliName, { enhanced: true });
  }`;

newContent = newContent.replace(oldMethod2, newMethod2);

fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Simplified wrapper methods');