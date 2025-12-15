/**
 * Real Claude Skills Loader
 * Loads and maps Claude-specific skills to Stigmergy skill system
 */

const fs = require('fs');
const path = require('path');

class ClaudeSkillsLoader {
    constructor() {
        this.claudeSkillsDir = this.getDefaultClaudeSkillsPath();
        this.loadedSkills = new Map();
    }

    getDefaultClaudeSkillsPath() {
        if (process.platform === 'win32') {
            return path.join(process.env.USERPROFILE, '.claude', 'skills');
        } else {
            return path.join(process.env.HOME, '.claude', 'skills');
        }
    }

    async detectAndLoadClaudeSkills() {
        const availableSkills = [];
        
        if (!fs.existsSync(this.claudeSkillsDir)) {
            return availableSkills;
        }

        const skillEntries = fs.readdirSync(this.claudeSkillsDir, { withFileTypes: true });

        for (const entry of skillEntries) {
            if (entry.isDirectory()) {
                const skillPath = path.join(this.claudeSkillsDir, entry.name);
                
                // Look for Claude skill manifest file
                const manifestPath = path.join(skillPath, 'skill.json');
                if (fs.existsSync(manifestPath)) {
                    const skillManifest = this.parseClaudeSkill(manifestPath, skillPath);
                    if (skillManifest) {
                        availableSkills.push(skillManifest);
                        this.loadedSkills.set(skillManifest.name, skillManifest);
                    }
                }
            }
        }

        return availableSkills;
    }

    parseClaudeSkill(manifestPath, skillDir) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Validate Claude skill manifest structure
            if (!manifest.name || !manifest.description) {
                console.warn(`Invalid Claude skill manifest: ${manifestPath}`);
                return null;
            }

            // Map Claude skill to Stigmergy skill format
            return {
                id: `claude-${manifest.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: manifest.name,
                description: manifest.description,
                category: manifest.category || 'claude-extension',
                tools: ['claude'], // Only available for Claude
                parameters: this.mapClaudeParameters(manifest),
                examples: manifest.examples || [],
                claudeManifest: manifest,
                skillPath: skillDir,
                executable: true
            };
        } catch (error) {
            console.warn(`Error parsing Claude skill manifest ${manifestPath}:`, error.message);
            return null;
        }
    }

    mapClaudeParameters(claudeManifest) {
        const parameters = {};
        
        if (claudeManifest.input_schema && claudeManifest.input_schema.properties) {
            for (const [paramName, paramDef] of Object.entries(claudeManifest.input_schema.properties)) {
                parameters[paramName] = {
                    required: (claudeManifest.input_schema.required || []).includes(paramName),
                    description: paramDef.description || paramName,
                    type: paramDef.type || 'string',
                    default: paramDef.default
                };
            }
        }
        
        return parameters;
    }

    async executeClaudeSkill(skillName, parameters, tool) {
        // This will generate actual execution code for Claude skill
        const skill = this.loadedSkills.get(skillName);
        if (!skill) {
            throw new Error(`Claude skill '${skillName}' not found`);
        }

        // Generate specific Claude command to execute the skill
        const executionCode = `
// Executing Claude-specific skill: ${skill.name}
// Skill path: ${skill.skillPath}

// This would typically be executed as:
// claude --skill ${skill.name} ${this.buildClaudeParameters(parameters)}

console.log('Executing Claude skill: ${skill.name}');
console.log('Description: ${skill.description}');
console.log('Parameters: ', ${JSON.stringify(parameters, null, 2)});

// In a real implementation, this would call the Claude CLI directly
// with the specific skill manifest and parameters
        `;

        return {
            success: true,
            skillId: skill.id,
            executionCode: executionCode,
            message: `Claude skill execution code prepared for: ${skill.name}`
        };
    }

    buildClaudeParameters(parameters) {
        return Object.entries(parameters)
            .map(([key, value]) => `--${key} "${value}"`)
            .join(' ');
    }
}

module.exports = { ClaudeSkillsLoader };