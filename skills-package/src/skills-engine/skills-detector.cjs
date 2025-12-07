#!/usr/bin/env node

/**
 * Skills Detector - TDD Implementation
 * Phase 1: Green - Minimal implementation to pass tests
 */

class SkillsDetector {
    constructor() {
        this.skillPatterns = {
            translation: {
                keywords: {
                    english: ['translate', 'convert', 'localization'],
                    chinese: ['翻译', '转换', '本地化']
                },
                confidence: 8
            },
            'code-analysis': {
                keywords: {
                    english: ['analyze', 'analysis', 'review', 'audit', 'security', 'performance', 'quality'],
                    chinese: ['分析', '审查', '审计', '安全', '性能', '质量']
                },
                confidence: 7
            },
            'code-generation': {
                keywords: {
                    english: ['generate', 'create', 'build', 'write', 'implement', 'develop'],
                    chinese: ['生成', '创建', '构建', '编写', '实现', '开发']
                },
                confidence: 7
            },
            documentation: {
                keywords: {
                    english: ['document', 'docs', 'documentation', 'readme', 'manual', 'guide'],
                    chinese: ['文档', '说明', '手册', '指南']
                },
                confidence: 6
            }
        };
    }

    detectSkill(input) {
        if (!input || typeof input !== 'string' || input.trim() === '') {
            return { skill: null, confidence: 0, parameters: {} };
        }

        const normalizedInput = input.toLowerCase().trim();
        let bestMatch = null;
        let maxConfidence = 0;

        for (const [skillType, skillData] of Object.entries(this.skillPatterns)) {
            const matchResult = this.checkKeywords(normalizedInput, skillData.keywords);

            if (matchResult.found && matchResult.confidence > maxConfidence) {
                bestMatch = {
                    skill: skillType,
                    confidence: matchResult.confidence,
                    parameters: this.extractParameters(normalizedInput, skillType)
                };
                maxConfidence = matchResult.confidence;
            }
        }

        return bestMatch || { skill: null, confidence: 0, parameters: {} };
    }

    checkKeywords(input, keywords) {
        let maxConfidence = 0;
        let found = false;

        const allKeywords = [
            ...keywords.english,
            ...keywords.chinese
        ];

        for (const keyword of allKeywords) {
            if (input.includes(keyword)) {
                found = true;
                // Exact keyword match gets higher confidence
                if (input === keyword) {
                    maxConfidence = Math.max(maxConfidence, 9.5);
                } else if (input.startsWith(keyword) || input.endsWith(keyword)) {
                    maxConfidence = Math.max(maxConfidence, 8);
                } else {
                    // For overlapping keywords, apply context-based scoring
                    const contextualScore = this.getContextualScore(input, keyword, keywords);
                    maxConfidence = Math.max(maxConfidence, contextualScore);
                }
            }
        }

        if (found && maxConfidence === 0) {
            maxConfidence = this.skillPatterns[Object.keys(this.skillPatterns).find(skill =>
                this.skillPatterns[skill].keywords === keywords
            )].confidence;
        }

        return { found, confidence: maxConfidence };
    }

    getContextualScore(input, keyword, keywords) {
        // Boost confidence for specific skill combinations
        const combinations = {
            // Documentation patterns
            'documentation': {
                'create': 8,
                'generate': 6,
                'write': 8,
                'build': 7
            },
            // Code generation patterns
            'generate': {
                'function': 8,
                'class': 8,
                'component': 8,
                'api': 7
            }
        };

        const skillType = this.getSkillTypeForKeywords(keywords);
        if (combinations[skillType]) {
            for (const [contextKeyword, score] of Object.entries(combinations[skillType])) {
                if (input.includes(contextKeyword)) {
                    return score;
                }
            }
        }

        return 6; // Default score
    }

    getSkillTypeForKeywords(keywords) {
        for (const [skillType, skillData] of Object.entries(this.skillPatterns)) {
            if (skillData.keywords === keywords) {
                return skillType;
            }
        }
        return null;
    }

    extractParameters(input, skillType) {
        const parameters = {
            text: input
        };

        switch (skillType) {
            case 'translation':
                parameters.targetLanguage = this.extractTargetLanguage(input);
                break;

            case 'code-generation':
                parameters.language = this.extractLanguage(input);
                parameters.type = this.extractCodeType(input);
                parameters.features = this.extractFeatures(input);
                break;

            case 'code-analysis':
                parameters.analysisType = this.extractAnalysisType(input);
                break;
        }

        return parameters;
    }

    extractTargetLanguage(input) {
        const languages = ['english', 'spanish', 'french', 'german', 'japanese', 'chinese', 'korean'];

        for (const lang of languages) {
            if (input.includes('to ' + lang) || input.includes(lang)) {
                return lang;
            }
        }
        return null;
    }

    extractLanguage(input) {
        const languages = {
            'node.js': ['node', 'node.js'],
            'javascript': ['javascript', 'js'],
            'python': ['python', 'py'],
            'java': ['java'],
            'c#': ['c#', 'csharp', '.net'],
            'go': ['go'],
            'rust': ['rust'],
            'typescript': ['typescript', 'ts'],
            'php': ['php'],
            'ruby': ['ruby'],
            'swift': ['swift']
        };

        // Prioritize more specific matches
        if (input.includes('node.js')) return 'node.js';
        if (input.includes('javascript')) return 'javascript';

        for (const [lang, keywords] of Object.entries(languages)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return lang;
            }
        }
        return null;
    }

    extractCodeType(input) {
        const types = {
            'rest api': ['api', 'rest', 'endpoint'],
            'function': ['function', 'method'],
            'class': ['class'],
            'component': ['component', 'widget'],
            'module': ['module']
        };

        for (const [type, keywords] of Object.entries(types)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return type;
            }
        }
        return null;
    }

    extractFeatures(input) {
        const features = [];
        const featureKeywords = {
            'authentication': ['auth', 'authentication', 'login', 'signin'],
            'security': ['security', 'secure'],
            'validation': ['validation', 'validate'],
            'error handling': ['error', 'exception', 'try', 'catch']
        };

        for (const [feature, keywords] of Object.entries(featureKeywords)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                features.push(feature);
            }
        }

        return features;
    }

    extractAnalysisType(input) {
        const types = {
            'security': ['security', 'vulnerability', 'attack', 'threat'],
            'performance': ['performance', 'optimization', 'bottleneck', 'speed'],
            'quality': ['quality', 'clean', 'refactor', 'maintainable'],
            'architecture': ['architecture', 'design', 'structure']
        };

        for (const [type, keywords] of Object.entries(types)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                return type;
            }
        }
        return null;
    }
}

module.exports = SkillsDetector;