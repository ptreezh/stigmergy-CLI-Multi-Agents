/**
 * Claude Skills Mapper
 * Maps Claude skills to Stigmergy skills with full compatibility
 */

const fs = require('fs');
const path = require('path');

class ClaudeSkillsMapper {
    constructor() {
        this.skillMappings = new Map();
        this.compatibilityMap = {};
    }

    /**
     * Create Stigmergy-compatible skill from Claude skill manifest
     */
    createStigmergySkill(claudeSkill) {
        // Determine the corresponding Stigmergy skill category
        const stigmergyCategory = this.mapClaudeToStigmergyCategory(claudeSkill);
        
        // Extract common functionality patterns
        const functionalityKeywords = this.extractFunctionalityKeywords(claudeSkill);
        
        return {
            id: claudeSkill.id,
            name: claudeSkill.name,
            category: stigmergyCategory,
            description: claudeSkill.description,
            tools: this.mapCompatibleTools(claudeSkill),
            parameters: claudeSkill.parameters,
            examples: claudeSkill.examples,
            claudeSkill: true,  // Mark as Claude skill for special handling
            claudeOriginal: claudeSkill.claudeManifest,
            executionStrategy: 'claude-native'  // Native Claude execution
        };
    }

    mapClaudeToStigmergyCategory(claudeSkill) {
        const nameLower = claudeSkill.name.toLowerCase();
        const descLower = claudeSkill.description.toLowerCase();
        
        // Map Claude skill to appropriate Stigmergy category
        if (['pdf', 'document', 'file', 'upload', 'download'].some(term => 
            nameLower.includes(term) || descLower.includes(term))) {
            return 'document-processing';
        } else if (['web', 'browse', 'search', 'internet', 'url'].some(term =>
            nameLower.includes(term) || descLower.includes(term))) {
            return 'web-automation';
        } else if (['analysis', 'analyze', 'security', 'review', 'check'].some(term =>
            nameLower.includes(term) || descLower.includes(term))) {
            return 'analysis';
        } else if (['generate', 'create', 'write', 'make', 'produce'].some(term =>
            nameLower.includes(term) || descLower.includes(term))) {
            return 'generation';
        } else if (['translate', 'language', 'text', 'converter'].some(term =>
            nameLower.includes(term) || descLower.includes(term))) {
            return 'language';
        } else {
            return 'extension'; // Default category for Claude-specific skills
        }
    }

    mapCompatibleTools(claudeSkill) {
        // Map Claude-specific capabilities to compatible Stigmergy tools
        const tools = ['claude']; // Claude is always supported
        
        // Add other tools that may provide similar functionality
        const descLower = claudeSkill.description.toLowerCase();
        
        if (descLower.includes('pdf') || descLower.includes('document')) {
            tools.push('qwen', 'gemini');  // Many AI tools can handle documents
        } else if (descLower.includes('web') || descLower.includes('browse')) {
            tools.push('qwen', 'iflow');  // Web browsing capabilities
        } else if (descLower.includes('code') || descLower.includes('analyze')) {
            tools.push('gemini', 'qwen', 'codebuddy');  // Code analysis tools
        } else {
            // Add general-purpose tools as appropriate
            tools.push('gemini', 'qwen');
        }
        
        return tools;
    }

    extractFunctionalityKeywords(claudeSkill) {
        const keywords = [];
        const nameLower = claudeSkill.name.toLowerCase();
        const descLower = claudeSkill.description.toLowerCase();
        
        // Extract common functionality terms
        if (nameLower.includes('pdf') || descLower.includes('pdf')) keywords.push('pdf');
        if (nameLower.includes('search') || descLower.includes('search')) keywords.push('search');
        if (nameLower.includes('analyze') || descLower.includes('analysis')) keywords.push('analysis');
        if (nameLower.includes('translate') || descLower.includes('translate')) keywords.push('translate');
        if (nameLower.includes('browse') || descLower.includes('browse')) keywords.push('browse');
        
        return keywords;
    }

    /**
     * Detect if a query matches a Claude skill
     */
    detectClaudeSkillIntent(query, availableClaudeSkills) {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);
        
        for (const skill of availableClaudeSkills) {
            const skillName = skill.name.toLowerCase();
            const skillDesc = skill.description.toLowerCase();
            
            // Calculate match score based on various factors
            let score = 0;
            
            // Name match gives high score
            if (queryLower.includes(skillName)) {
                score += 10;
            } else if (queryWords.some(word => skillName.includes(word) || word.includes(skillName))) {
                score += 7;
            }
            
            // Description match gives medium score
            if (queryLower.includes(skillDesc.substring(0, 20).toLowerCase())) {
                score += 8;
            } else if (queryWords.some(qWord => 
                skillDesc.toLowerCase().split(/\s+/).some(sWord => 
                    qWord.includes(sWord) || sWord.includes(qWord)))) {
                score += 5;
            }
            
            // Parameter matching
            if (skill.parameters) {
                for (const paramName of Object.keys(skill.parameters)) {
                    if (queryLower.includes(paramName.toLowerCase())) {
                        score += 3;
                    }
                }
            }
            
            // Keyword matching
            const functionalityKeywords = this.extractFunctionalityKeywords(skill);
            for (const keyword of functionalityKeywords) {
                if (queryLower.includes(keyword)) {
                    score += 4;
                }
            }
            
            if (score > 6) { // Threshold for matching
                // Extract parameters from query
                const extractedParams = this.extractParametersFromQuery(query, skill.parameters);
                
                return {
                    skill: skill,
                    confidence: Math.min(score, 10),
                    parameters: extractedParams
                };
            }
        }
        
        return null;
    }

    /**
     * Extract parameters from natural language query
     */
    extractParametersFromQuery(query, skillParameters) {
        const params = {};
        const queryLower = query.toLowerCase();
        
        for (const [paramName, paramDef] of Object.entries(skillParameters || {})) {
            const paramLower = paramName.toLowerCase();
            
            // Look for parameter patterns in the query
            const paramRegex = new RegExp(`${paramLower}\\s*(?:=|is|to|with)\\s*["']?([^"']+)["']?`, 'i');
            const match = queryLower.match(paramRegex);
            
            if (match) {
                params[paramName] = match[1];
            } else if (paramDef.required && paramDef.default !== undefined) {
                params[paramName] = paramDef.default;
            }
        }
        
        return params;
    }

    /**
     * Convert Claude skill command to Stigmergy command
     */
    convertClaudeCommand(claudeSkill, parameters) {
        return {
            command: 'execute-skill',
            skillId: claudeSkill.id,
            parameters: parameters,
            tool: 'claude',
            executionPath: claudeSkill.skillPath,
            originalClaudeSkill: claudeSkill.claudeManifest
        };
    }
}

module.exports = { ClaudeSkillsMapper };