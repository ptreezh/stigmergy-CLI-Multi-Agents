#!/usr/bin/env node

/**
 * Natural Language Skills Integration
 * Integrates natural language parsing with CLI tools for seamless skill calling
 */

const NaturalLanguageParser = require('./nl-parser.cjs');
const fs = require('fs');
const path = require('path');

class NaturalLanguageIntegration {
    constructor() {
        this.parser = new NaturalLanguageParser();
        this.skillsManagerPath = path.join(__dirname, '..', 'skills', 'skills-manager.cjs');
    }

    /**
     * Process natural language input and execute corresponding skill
     * @param {string} input - Natural language input
     * @param {string} aiTool - AI tool being used (claude, gemini, etc.)
     * @returns {Object} - Execution result
     */
    async processNaturalLanguageInput(input, aiTool = null) {
        try {
            console.log(`🔍 Analyzing input: "${input}"`);

            // Parse natural language input
            const parseResult = this.parser.parse(input);

            if (!parseResult.skill) {
                return {
                    success: false,
                    message: 'No suitable skill detected for this input',
                    suggestion: 'Try using more specific keywords like "translate", "analyze", "generate", or "document"',
                    originalInput: input
                };
            }

            console.log(`✅ Detected skill: ${parseResult.skill} (confidence: ${parseResult.confidence})`);
            console.log(`📋 Extracted parameters:`, parseResult.parameters);

            // Load skills manager
            const SkillsManager = require(this.skillsManagerPath);
            const skillsManager = new SkillsManager();

            // Initialize skills manager if needed
            await skillsManager.init();

            // Execute the detected skill
            const result = await skillsManager.executeSkill(
                parseResult.skill,
                parseResult.parameters,
                aiTool
            );

            return {
                success: true,
                skill: parseResult.skill,
                parameters: parseResult.parameters,
                confidence: parseResult.confidence,
                detectedKeywords: parseResult.detectedKeywords,
                execution: result,
                originalInput: input
            };

        } catch (error) {
            console.error('❌ Natural language processing failed:', error.message);
            return {
                success: false,
                error: error.message,
                originalInput: input
            };
        }
    }

    /**
     * Check if input should be processed as a skill call
     * @param {string} input - User input
     * @returns {boolean} - True if should process as skill
     */
    shouldProcessAsSkill(input) {
        // Quick check for skill keywords
        const skillIndicators = [
            '翻译', 'translate', '分析', 'analyze', '生成', 'generate',
            '创建', 'create', '写', 'write', '检查', 'check',
            '文档', 'document', '注释', 'comment'
        ];

        const lowerInput = input.toLowerCase();
        return skillIndicators.some(indicator => lowerInput.includes(indicator));
    }

    /**
     * Get skill suggestions for input
     * @param {string} input - User input
     * @returns {Array} - Array of skill suggestions
     */
    getSkillSuggestions(input) {
        const suggestions = [];

        if (this.shouldProcessAsSkill(input)) {
            suggestions.push({
                type: 'skill_call',
                message: 'This input looks like a skill request. Would you like to use the Stigmergy Skills system?',
                confidence: this.parser.parse(input).confidence
            });
        }

        return suggestions;
    }

    /**
     * Create CLI hook response for skill detection
     * @param {string} input - User input
     * @param {string} aiTool - Current AI tool
     * @returns {Object} - Hook response
     */
    createHookResponse(input, aiTool) {
        const parseResult = this.parser.parse(input);

        if (!parseResult.skill) {
            return {
                shouldIntercept: false,
                message: null
            };
        }

        return {
            shouldIntercept: true,
            skill: parseResult.skill,
            parameters: parseResult.parameters,
            confidence: parseResult.confidence,
            message: `🎯 Detected ${parseResult.skill} skill with confidence ${parseResult.confidence}/10.\n` +
                     `📋 Parameters: ${JSON.stringify(parseResult.parameters, null, 2)}\n\n` +
                     `Would you like to:\n` +
                     `1. Execute this skill with Stigmergy\n` +
                     `2. Continue with ${aiTool} normally`,
            options: ['execute_skill', 'continue_normal']
        };
    }

    /**
     * Process CLI command with natural language support
     * @param {Array} args - Command line arguments
     * @param {string} aiTool - AI tool name
     * @returns {Object} - Processing result
     */
    async processCliCommand(args, aiTool) {
        // Check if this is a natural language request
        const input = args.join(' ');

        if (this.shouldProcessAsSkill(input)) {
            return await this.processNaturalLanguageInput(input, aiTool);
        }

        return {
            success: false,
            message: 'No skill pattern detected in command',
            suggestion: 'Try commands like: "translate this to english" or "analyze this code"',
            originalInput: input
        };
    }

    /**
     * Generate skill usage examples
     * @param {string} aiTool - AI tool name
     * @returns {Array} - Array of usage examples
     */
    generateUsageExamples(aiTool) {
        return [
            `${aiTool} "请帮我把这段代码翻译成英文"`,
            `${aiTool} "分析这个React组件的安全性"`,
            `${aiTool} "生成一个用户登录的Python代码"`,
            `${aiTool} "为这个API生成文档"`,
            `${aiTool} "检查这段代码的性能"`
        ];
    }

    /**
     * Validate skill parameters
     * @param {string} skill - Skill name
     * @param {Object} parameters - Parameters object
     * @returns {Object} - Validation result
     */
    validateSkillParameters(skill, parameters) {
        // Load skill registry for validation
        try {
            const SkillsManager = require(this.skillsManagerPath);
            const skillsManager = new SkillsManager();

            // This would need to be implemented in SkillsManager
            // For now, do basic validation
            const requiredParams = this.getRequiredParameters(skill);
            const missingParams = requiredParams.filter(param => !parameters[param]);

            return {
                valid: missingParams.length === 0,
                missing: missingParams,
                message: missingParams.length > 0
                    ? `Missing required parameters: ${missingParams.join(', ')}`
                    : 'Parameters are valid'
            };
        } catch (error) {
            return {
                valid: true,
                message: 'Validation skipped - SkillsManager not available'
            };
        }
    }

    /**
     * Get required parameters for a skill
     * @param {string} skill - Skill name
     * @returns {Array} - Array of required parameter names
     */
    getRequiredParameters(skill) {
        const requirements = {
            'translation': ['text'],
            'code-analysis': ['file'],
            'code-generation': ['requirement'],
            'documentation': ['target']
        };

        return requirements[skill] || [];
    }

    /**
     * Create enhanced help message with natural language examples
     * @param {string} aiTool - AI tool name
     * @returns {string} - Help message
     */
    createEnhancedHelp(aiTool) {
        const examples = this.generateUsageExamples(aiTool);

        return `
🎯 Natural Language Skills Integration for ${aiTool}

You can now use natural language to call skills directly with ${aiTool}:

📝 Examples:
${examples.map(ex => `   ${ex}`).join('\n')}

🔧 How it works:
1. Speak naturally in Chinese or English
2. The system automatically detects the skill type
3. Extracts relevant parameters
4. Executes the skill with optimal tool selection

💡 Tips:
- Be specific about what you want (e.g., "analyze security", "generate Python code")
- Mention target languages for translation
- Specify frameworks or programming languages when relevant

🚀 Start using natural language commands with ${aiTool} today!
        `;
    }
}

module.exports = NaturalLanguageIntegration;