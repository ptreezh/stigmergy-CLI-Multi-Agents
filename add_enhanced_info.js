const fs = require('fs');

const content = fs.readFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', 'utf8');

const oldStr = '  }\n\n  /**';

const newStr = '  }\n\n  /**\n   * 添加增强信息\n   * @param {Object} analysis - 基础分析结果\n   * @param {string} cliName - CLI工具名称\n   * @returns {Object} 增强分析结果\n   * @重要说明：必须返回新对象，不能修改原对象\n   */\n  addEnhancedInfo(analysis, cliName) {\n    const enhancedPatterns = this.enhancedPatterns[cliName] || {};\n    \n    // 使用展开运算符创建新对象，不修改原对象\n    return {\n      ...analysis,\n      agentSkillSupport: {\n        supportsAgents: enhancedPatterns.agentDetection || false,\n        supportsSkills: enhancedPatterns.skillDetection || false,\n        naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,\n        skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,\n        positionalArgs: enhancedPatterns.positionalArgs || false,\n        agentTypes: enhancedPatterns.agentTypes || [],\n        skillKeywords: enhancedPatterns.skillKeywords || [],\n        commandFormat: enhancedPatterns.commandFormat || "",\n        examples: enhancedPatterns.examples || []\n      }\n    };\n  }\n\n  /**';

const newContent = content.replace(oldStr, newStr);
fs.writeFileSync('D:\\stigmergy-CLI-Multi-Agents\\src\\core\\cli_help_analyzer.js', newContent, 'utf8');
console.log('Added addEnhancedInfo method');