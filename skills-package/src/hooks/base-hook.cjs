#!/usr/bin/env node

/**
 * Base Hook Class - TDD Implementation
 * Phase 2: Hook System - GREEN Phase (Minimal implementation to pass tests)
 */

class BaseHook {
    constructor(cliType, config = {}) {
        this.cliType = cliType;
        this.config = config;
        this.initialized = true;
        this.skillsDetector = this.loadSkillsDetector();
    }

    loadSkillsDetector() {
        try {
            const SkillsDetector = require('../skills-engine/skills-detector.cjs');
            return new SkillsDetector();
        } catch (error) {
            console.warn('SkillsDetector not available, using fallback');
            return null;
        }
    }

    parseCommand(input) {
        if (!input || typeof input !== 'string') {
            return {
                isSkillCommand: false,
                skillType: null,
                action: null,
                parameters: []
            };
        }

        const trimmedInput = input.trim();

        // Check if it's a skill command
        if (trimmedInput.startsWith('/skill ')) {
            const parts = trimmedInput.substring(7).split(' ').filter(part => part.length > 0);

            if (parts.length === 0) {
                return {
                    isSkillCommand: false,
                    skillType: null,
                    action: null,
                    parameters: []
                };
            }

            const action = parts[0];
            const parameters = parts.slice(1);

            return {
                isSkillCommand: true,
                skillType: 'skill',
                action: action,
                parameters: parameters
            };
        }

        return {
            isSkillCommand: false,
            skillType: null,
            action: null,
            parameters: []
        };
    }

    validateParameters(skillType, parameters) {
        if (!skillType || !Array.isArray(parameters)) {
            return false;
        }

        // Basic validation: at least one parameter for most skills
        if (parameters.length === 0) {
            return false;
        }

        // Additional validation based on skill type
        switch (skillType) {
            case 'skill':
                return parameters.length >= 1;
            default:
                return true;
        }
    }

    handleError(error) {
        return {
            success: false,
            error: {
                message: error.message || 'Unknown error occurred',
                stack: error.stack || null,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        };
    }

    processCommand(input, context = {}) {
        try {
            const parsed = this.parseCommand(input);

            if (!parsed.isSkillCommand) {
                return {
                    success: true,
                    cliType: this.cliType,
                    skillDetected: false,
                    message: 'Not a skill command'
                };
            }

            const isValid = this.validateParameters(parsed.skillType, parsed.parameters);

            if (!isValid) {
                return {
                    success: false,
                    cliType: this.cliType,
                    skillDetected: false,
                    error: 'Invalid parameters'
                };
            }

            // Use skills detector if available
            let skill = null;
            if (this.skillsDetector) {
                // Include both action and parameters for better skill detection
                const fullText = [parsed.action, ...parsed.parameters].join(' ');
                const detection = this.skillsDetector.detectSkill(fullText);
                skill = detection.skill;
            }

            return {
                success: true,
                cliType: this.cliType,
                skillDetected: true,
                skill: skill,
                action: parsed.action,
                parameters: parsed.parameters,
                context: context
            };

        } catch (error) {
            return this.handleError(error);
        }
    }

    isCLIAvailable() {
        // Default implementation - to be overridden by specific hooks
        return false;
    }
}

module.exports = BaseHook;