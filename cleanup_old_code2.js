const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

// 删除旧的 getEnhancedCLIPattern 代码
const oldCode = `  }
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

const newCode = `  }

  /**`;

const newContent = content.replace(oldCode, newCode);
fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Removed old getEnhancedCLIPattern code');