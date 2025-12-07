#!/usr/bin/env node

/**
 * Stigmergy CLI - Skills Manager (CommonJS Version)
 * AI CLI Tool Skills Management and Execution System
 */

const fs = require('fs').promises;
const path = require('path');
const { homedir } = require('os');

class SkillsManager {
    constructor() {
        this.skillsDir = path.join(__dirname, 'skills');
        this.skillsConfig = path.join(this.skillsDir, 'skills-registry.json');
        this.userSkillsDir = path.join(homedir(), '.stigmergy', 'skills');
        this.skills = null;
    }

    /**
     * Initialize Skills system
     */
    async init() {
        await this.ensureDirectories();
        await this.loadBuiltinSkills();
        console.log('✅ Skills system initialized');
    }

    /**
     * Ensure directories exist
     */
    async ensureDirectories() {
        const dirs = [this.skillsDir, this.userSkillsDir];
        for (const dir of dirs) {
            try {
                await fs.access(dir);
            } catch {
                await fs.mkdir(dir, { recursive: true });
            }
        }
    }

    /**
     * Load built-in skills from registry
     */
    async loadBuiltinSkills() {
        try {
            const data = await fs.readFile(this.skillsConfig, 'utf8');
            this.skills = JSON.parse(data);
        } catch (error) {
            console.error('Failed to load skills registry:', error.message);
            this.skills = {};
        }
    }

    /**
     * List all available skills
     */
    async listSkills() {
        if (!this.skills) {
            await this.loadBuiltinSkills();
        }

        const skillList = Object.entries(this.skills).map(([id, skill]) => ({
            id,
            name: skill.name,
            description: skill.description,
            category: skill.category,
            tools: skill.tools
        }));

        return skillList;
    }

    /**
     * Execute a skill
     */
    async executeSkill(skillId, params = {}, selectedTool = null) {
        if (!this.skills) {
            await this.loadBuiltinSkills();
        }

        const skill = this.skills[skillId];
        if (!skill) {
            throw new Error(`Skill not found: ${skillId}`);
        }

        // Validate required parameters
        const missingParams = [];
        for (const [paramName, paramConfig] of Object.entries(skill.parameters || {})) {
            if (paramConfig.required && !params[paramName]) {
                missingParams.push(paramName);
            }
        }

        if (missingParams.length > 0) {
            throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
        }

        // Use specified tool or first available tool
        const tool = selectedTool || skill.tools[0];
        if (!skill.tools.includes(tool)) {
            throw new Error(`Tool ${tool} not supported for skill ${skillId}`);
        }

        // Build command
        const command = this.buildCommand(skill, params, tool);

        // Execute command (mock mode for now)
        const result = await this.executeCommand(command, tool);

        return {
            skillId,
            skillName: skill.name,
            tool,
            command,
            result
        };
    }

    /**
     * Build command from template and parameters
     */
    buildCommand(skill, params, tool) {
        let command = skill.template;

        // Replace parameters in template
        for (const [key, value] of Object.entries(params)) {
            const placeholder = `{${key}}`;
            command = command.replace(new RegExp(placeholder, 'g'), value);
        }

        // Add tool-specific prefix
        const toolPrefixes = {
            'claude': 'claude',
            'gemini': 'gemini',
            'qwen': 'qwen',
            'iflow': 'iflow',
            'codebuddy': 'codebuddy',
            'copilot': 'gh copilot'
        };

        const prefix = toolPrefixes[tool] || tool;
        return `${prefix} "${command}"`;
    }

    /**
     * Execute command (mock mode)
     */
    async executeCommand(command, tool) {
        console.log(`🔧 [${tool.toUpperCase()}] Executing: ${command}`);

        // Mock execution result
        return {
            success: true,
            output: `[Mock output from ${tool}] Command executed successfully`,
            tool,
            command
        };
    }

    /**
     * Get skill by ID
     */
    async getSkill(skillId) {
        if (!this.skills) {
            await this.loadBuiltinSkills();
        }
        return this.skills[skillId];
    }

    /**
     * Search skills by keyword
     */
    async searchSkills(keyword) {
        if (!this.skills) {
            await this.loadBuiltinSkills();
        }

        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        for (const [id, skill] of Object.entries(this.skills)) {
            if (id.includes(lowerKeyword) ||
                skill.name.toLowerCase().includes(lowerKeyword) ||
                skill.description.toLowerCase().includes(lowerKeyword) ||
                skill.category.toLowerCase().includes(lowerKeyword)) {
                results.push({ id, ...skill });
            }
        }

        return results;
    }
}

module.exports = SkillsManager;