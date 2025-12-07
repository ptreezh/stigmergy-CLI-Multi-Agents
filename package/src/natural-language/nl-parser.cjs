#!/usr/bin/env node

/**
 * Natural Language Parser for Skills Calling
 * Parses natural language input and maps to skills with parameters
 */

class NaturalLanguageParser {
    constructor() {
        this.skillPatterns = this.initializeSkillPatterns();
        this.languageMap = this.initializeLanguageMap();
        this.frameworkMap = this.initializeFrameworkMap();
    }

    /**
     * Initialize skill detection patterns
     */
    initializeSkillPatterns() {
        return {
            translation: {
                keywords: {
                    // Chinese keywords
                    'translate': 10, 'translate': 10, '': 8, '': 9, '': 9,
                    // English keywords
                    'translate': 10, 'translation': 9, 'convert': 7, 'render': 6,
                    'change to': 6, 'switch to': 6, 'make it': 5
                },
                languagePatterns: {
                    // Language detection patterns
                    '|english|en': 'en',
                    '|chinese|zh': 'zh',
                    '|japanese|ja': 'ja',
                    '|korean|ko': 'ko',
                    '|french|fr': 'fr',
                    '|german|de': 'de',
                    '|spanish|es': 'es',
                    '|russian|ru': 'ru'
                },
                textPatterns: [
                    /(?:|||)(.+?)(?:translate|||translate)/,
                    /(?:translate|convert)(.+?)(?:to|into|as)\s*(.+?)(?:\.|$|\?)/,
                    /(.+?)(?:translate|translate)/,
                    /translate(.+?)(?:||)/,
                    /(?:translate)(.+?)(?:to|into|as)/i
                ]
            },

            'code-analysis': {
                keywords: {
                    // Chinese keywords
                    'analyze': 10, '': 9, '': 8, '': 7, '': 8,
                    'security': 9, 'performance': 9, 'bug': 10, 'error': 9, '': 10,
                    // English keywords
                    'analyze': 10, 'analysis': 9, 'check': 8, 'review': 9, 'audit': 8,
                    'security': 10, 'performance': 9, 'optimize': 8, 'debug': 9,
                    'bug': 10, 'issue': 8, 'problem': 7, 'vulnerability': 10
                },
                focusPatterns: {
                    'security|security|secure': 'security',
                    'performance|performance|optimize|optimization': 'performance',
                    'bug|error|error|issue|issue': 'bugs',
                    'code|code quality|quality': 'quality'
                },
                targetPatterns: [
                    /(?:this|this|the|)(.+?)(?:code|component|||api)/,
                    /(.+?)(?:)?(?:code|component|)/
                ]
            },

            'code-generation': {
                keywords: {
                    // Chinese keywords
                    'generate': 10, 'create': 9, '': 8, '': 9, '': 8,
                    '': 9, '': 8, '': 7,
                    // English keywords
                    'generate': 10, 'create': 9, 'write': 8, 'implement': 9,
                    'build': 8, 'make': 7, 'develop': 8, 'code': 8
                },
                languagePatterns: {
                    'python|py': 'python',
                    'javascript|js|node': 'javascript',
                    'java': 'java',
                    'react|jsx': 'react',
                    'vue': 'vue',
                    'angular|ng': 'angular',
                    'go|golang': 'go',
                    'rust|rs': 'rust',
                    'typescript|ts': 'typescript'
                },
                requirementPatterns: [
                    /(?:generate|create||)(.+?)(?:code|function|component|)/,
                    /(?:generate|create|write|implement)(.+?)(?:code|function|component|module)/
                ]
            },

            documentation: {
                keywords: {
                    // Chinese keywords
                    'documentation': 10, 'comments': 9, '': 8, '': 7, '': 7,
                    'documentation': 9,
                    // English keywords
                    'document': 10, 'documentation': 9, 'comment': 9, 'describe': 8,
                    'explain': 7, 'readme': 8, 'api doc': 9
                },
                formatPatterns: {
                    'markdown|md': 'markdown',
                    'html': 'html',
                    'comment|comments': 'comments',
                    'readme': 'readme'
                },
                targetPatterns: [
                    /(?:|)(.+?)(?:generate|)(?:documentation|comments)/,
                    /(?:generate|write|create)(.+?)(?:documentation|comments|docs)/
                ]
            }
        };
    }

    /**
     * Initialize language mapping
     */
    initializeLanguageMap() {
        return {
            '': 'en', 'english': 'en', 'en': 'en',
            '': 'zh', 'chinese': 'zh', 'zh': 'zh',
            '': 'ja', 'japanese': 'ja', 'ja': 'ja',
            '': 'ko', 'korean': 'ko', 'ko': 'ko',
            '': 'fr', 'french': 'fr', 'fr': 'fr',
            '': 'de', 'german': 'de', 'de': 'de',
            '': 'es', 'spanish': 'es', 'es': 'es',
            '': 'ru', 'russian': 'ru', 'ru': 'ru'
        };
    }

    /**
     * Initialize framework mapping
     */
    initializeFrameworkMap() {
        return {
            'react': 'react', 'jsx': 'react', 'reactjs': 'react',
            'vue': 'vue', 'vuejs': 'vue',
            'angular': 'angular', 'ng': 'angular',
            'python': 'python', 'django': 'python', 'flask': 'python',
            'javascript': 'javascript', 'js': 'javascript', 'node': 'javascript',
            'typescript': 'typescript', 'ts': 'typescript'
        };
    }

    /**
     * Parse natural language input to skill and parameters
     * @param {string} input - Natural language input
     * @returns {Object} - { skill: string, parameters: Object, confidence: number }
     */
    parse(input) {
        const normalizedInput = input.toLowerCase().trim();

        // Calculate skill scores
        const skillScores = this.calculateSkillScores(normalizedInput);

        // Get best matching skill
        const bestSkill = this.getBestSkill(skillScores);

        if (!bestSkill || bestSkill.score < 3) {
            return {
                skill: null,
                parameters: {},
                confidence: 0,
                message: 'No suitable skill detected'
            };
        }

        // Extract parameters based on detected skill
        const parameters = this.extractParameters(input, bestSkill.name);

        return {
            skill: bestSkill.name,
            parameters,
            confidence: bestSkill.score,
            detectedKeywords: bestSkill.keywords
        };
    }

    /**
     * Calculate scores for each skill based on input
     */
    calculateSkillScores(input) {
        const scores = {};

        for (const [skillName, skillConfig] of Object.entries(this.skillPatterns)) {
            let score = 0;
            const matchedKeywords = [];

            // Score based on keyword matches
            for (const [keyword, weight] of Object.entries(skillConfig.keywords)) {
                if (input.includes(keyword.toLowerCase())) {
                    score += weight;
                    matchedKeywords.push(keyword);
                }
            }

            if (score > 0) {
                scores[skillName] = {
                    score,
                    keywords: matchedKeywords
                };
            }
        }

        return scores;
    }

    /**
     * Get the best scoring skill
     */
    getBestSkill(skillScores) {
        let bestSkill = null;
        let maxScore = 0;

        for (const [skillName, skillData] of Object.entries(skillScores)) {
            if (skillData.score > maxScore) {
                maxScore = skillData.score;
                bestSkill = {
                    name: skillName,
                    score: skillData.score,
                    keywords: skillData.keywords
                };
            }
        }

        return bestSkill;
    }

    /**
     * Extract parameters based on skill type
     */
    extractParameters(input, skillType) {
        const skillConfig = this.skillPatterns[skillType];
        const parameters = {};

        switch (skillType) {
            case 'translation':
                return this.extractTranslationParameters(input, skillConfig);

            case 'code-analysis':
                return this.extractCodeAnalysisParameters(input, skillConfig);

            case 'code-generation':
                return this.extractCodeGenerationParameters(input, skillConfig);

            case 'documentation':
                return this.extractDocumentationParameters(input, skillConfig);

            default:
                return parameters;
        }
    }

    /**
     * Extract translation-specific parameters
     */
    extractTranslationParameters(input, skillConfig) {
        const parameters = {};

        // Extract target language
        for (const [pattern, language] of Object.entries(skillConfig.languagePatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(input)) {
                parameters.to = language;
                break;
            }
        }

        // Extract source language (optional)
        if (input.includes('') || input.includes('from')) {
            for (const [lang, code] of Object.entries(this.languageMap)) {
                if (input.toLowerCase().includes(lang.toLowerCase())) {
                    parameters.from = code;
                    break;
                }
            }
        }

        // Extract text to translate
        for (const pattern of skillConfig.textPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                parameters.text = match[1].trim();
                break;
            }
        }

        // Fallback: extract content between key phrases
        if (!parameters.text) {
            const textMatch = input.match(/(?:||translate)(.+?)(?:translate|||translate)/);
            if (textMatch) {
                parameters.text = textMatch[1].trim();
            }
        }

        return parameters;
    }

    /**
     * Extract code analysis parameters
     */
    extractCodeAnalysisParameters(input, skillConfig) {
        const parameters = {};

        // Extract focus area
        for (const [pattern, focus] of Object.entries(skillConfig.focusPatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(input)) {
                parameters.focus = focus;
                break;
            }
        }

        // Extract target file/component - improved patterns
        const targetPatterns = [
            /(?:this|this|the|)(.+?)(?:code|component|||api)/,
            /(.+?)(?:)?(?:code|component|)/,
            /(?:analyze|analyze|)(.+?)(?:)?(?:security|performance|bug)/i
        ];

        for (const pattern of targetPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                parameters.file = match[1].trim();
                break;
            }
        }

        // Fallback: extract content between analysis keywords and focus keywords
        if (!parameters.file) {
            const analysisMatch = input.match(/(?:analyze|analyze||check|review)(.+?)(?:security|security|performance|performance|bug|error)/i);
            if (analysisMatch && analysisMatch[1]) {
                parameters.file = analysisMatch[1].trim();
            }
        }

        // If still no file found, use generic target
        if (!parameters.file) {
            parameters.file = 'this code';
        }

        return parameters;
    }

    /**
     * Extract code generation parameters
     */
    extractCodeGenerationParameters(input, skillConfig) {
        const parameters = {};

        // Extract programming language
        for (const [pattern, language] of Object.entries(skillConfig.languagePatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(input)) {
                parameters.language = language;
                break;
            }
        }

        // Extract framework
        for (const [name, framework] of Object.entries(this.frameworkMap)) {
            if (input.toLowerCase().includes(name.toLowerCase()) && name !== parameters.language) {
                parameters.framework = framework;
                break;
            }
        }

        // Extract requirement - improved patterns
        const requirementPatterns = [
            /(?:generate|create||)(.+?)(?:)?(?:code|function|component||)/,
            /(?:generate|create|write|implement)(.+?)(?:code|function|component|module)/,
            /(?:)(.+?)(?:)?(?:function|component|code)/
        ];

        for (const pattern of requirementPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                parameters.requirement = match[1].trim();
                break;
            }
        }

        // Fallback: extract everything between action keyword and language/framework
        if (!parameters.requirement) {
            const actionMatch = input.match(/(?:generate|create|||generate|create|write|implement)(.+?)(?:python|react|javascript|java|code|code)/i);
            if (actionMatch && actionMatch[1]) {
                parameters.requirement = actionMatch[1].trim().replace(/$/, '');
            }
        }

        return parameters;
    }

    /**
     * Extract documentation parameters
     */
    extractDocumentationParameters(input, skillConfig) {
        const parameters = {};

        // Extract format
        for (const [pattern, format] of Object.entries(skillConfig.formatPatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(input)) {
                parameters.format = format;
                break;
            }
        }

        // Default format
        if (!parameters.format) {
            parameters.format = 'markdown';
        }

        // Extract target
        for (const pattern of skillConfig.targetPatterns) {
            const match = input.match(pattern);
            if (match && match[1]) {
                parameters.target = match[1].trim();
                break;
            }
        }

        return parameters;
    }

    /**
     * Get all supported skills
     */
    getSupportedSkills() {
        return Object.keys(this.skillPatterns);
    }

    /**
     * Check if input matches any skill
     */
    hasSkillMatch(input) {
        const result = this.parse(input);
        return result.confidence > 0;
    }
}

module.exports = NaturalLanguageParser;