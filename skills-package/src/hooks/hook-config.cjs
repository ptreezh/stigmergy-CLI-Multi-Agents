#!/usr/bin/env node

/**
 * Hook Configuration - TDD Implementation
 * Phase 2: Hook System - GREEN Phase (Minimal implementation to pass tests)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class HookConfig {
    constructor() {
        this.configDir = path.join(os.homedir(), '.stigmergy', 'skills');
        this.configFile = path.join(this.configDir, 'hook-config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const content = fs.readFileSync(this.configFile, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.warn('Failed to load config, using defaults:', error.message);
        }

        // Default configuration
        return this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            claude: {
                enabled: true,
                skills: ['translation', 'code-analysis', 'code-generation', 'documentation'],
                priority: 'high',
                autoInstall: true
            },
            gemini: {
                enabled: true,
                skills: ['translation', 'code-analysis', 'code-generation', 'documentation'],
                priority: 'medium',
                autoInstall: true
            },
            qwen: {
                enabled: true,
                skills: ['translation', 'code-analysis', 'code-generation'],
                priority: 'medium',
                autoInstall: false
            }
        };
    }

    saveConfig() {
        try {
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }

            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('Failed to save config:', error.message);
            return false;
        }
    }

    getConfig(cliType) {
        return this.config[cliType] || null;
    }

    setConfig(cliType, configData) {
        this.config[cliType] = { ...configData };
        return this.saveConfig();
    }

    getAllConfigs() {
        return { ...this.config };
    }

    isEnabled(cliType) {
        const config = this.getConfig(cliType);
        return config ? config.enabled : false;
    }

    setEnabled(cliType, enabled) {
        const config = this.getConfig(cliType) || {};
        config.enabled = enabled;
        return this.setConfig(cliType, config);
    }

    getSkills(cliType) {
        const config = this.getConfig(cliType);
        return config ? config.skills : [];
    }

    setSkills(cliType, skills) {
        const config = this.getConfig(cliType) || {};
        config.skills = skills;
        return this.setConfig(cliType, config);
    }

    getPriority(cliType) {
        const config = this.getConfig(cliType);
        return config ? config.priority : 'medium';
    }

    setPriority(cliType, priority) {
        const config = this.getConfig(cliType) || {};
        config.priority = priority;
        return this.setConfig(cliType, config);
    }
}

module.exports = HookConfig;