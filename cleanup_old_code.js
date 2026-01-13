const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

// 删除旧的 analyzeCLIEnhanced 代码
const oldCode = `  }
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

const newCode = `  }

  /**`;

const newContent = content.replace(oldCode, newCode);
fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Removed old analyzeCLIEnhanced code');