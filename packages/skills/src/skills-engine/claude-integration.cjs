const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ClaudeSkillsLoader {
    constructor(skillsDirectory = null) {
        this.skillsDirectory = skillsDirectory || this.getDefaultClaudeSkillsPath();
        this.loadedSkills = {};
    }

    getDefaultClaudeSkillsPath() {
        // 不同操作系统的 Claude 技能路径
        if (process.platform === 'win32') {
            return path.join(process.env.USERPROFILE, '.claude', 'skills');
        } else {
            return path.join(process.env.HOME, '.claude', 'skills');
        }
    }

    async loadAllSkills() {
        const skills = [];
        
        if (!fs.existsSync(this.skillsDirectory)) {
            console.log(`Claude skills directory does not exist: ${this.skillsDirectory}`);
            return skills;
        }
        
        const skillEntries = fs.readdirSync(this.skillsDirectory);

        for (const entry of skillEntries) {
            const skillPath = path.join(this.skillsDirectory, entry);
            if (fs.statSync(skillPath).isDirectory()) {
                const skill = await this.loadSkillFromDirectory(skillPath);
                if (skill) {
                    skills.push(skill);
                    this.loadedSkills[skill.id] = skill;
                } else {
                    // 在生产模式下静默跳过无效项目
                    // 仅在调试模式下显示无效清单消息
                    if (process.env.DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development') {
                        console.log(`No valid manifest found in ${skillPath}`);
                    }
                }
            }
        }
        
        return skills;
    }

    async loadSkillFromDirectory(skillDir) {
        // 尝试多种 Claude 技能定义文件格式
        const manifestFiles = ['skill.json', 'manifest.json', 'config.json'];
        
        for (const manifestFile of manifestFiles) {
            const manifestPath = path.join(skillDir, manifestFile);
            if (fs.existsSync(manifestPath)) {
                return this.loadSkillFromManifest(manifestPath);
            }
        }
        
        console.warn(`No valid manifest found in ${skillDir}`);
        return null;
    }

    async loadSkillFromManifest(manifestPath) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // 转换 Claude 技能为 Stigmergy 格式
            return this.convertClaudeSkillToStigmergy(manifest, path.dirname(manifestPath));
        } catch (error) {
            console.warn(`Failed to load Claude skill from ${manifestPath}:`, error.message);
            return null;
        }
    }

    convertClaudeSkillToStigmergy(claudeSkill, skillDir) {
        return {
            id: `${claudeSkill.name || claudeSkill.id || 'unknown'}-claude`,
            name: claudeSkill.name || claudeSkill.id || 'Unknown Claude Skill',
            category: claudeSkill.category || 'claude-external',
            description: claudeSkill.description || 'Imported from Claude Skills',
            tools: ['claude'],  // 仅在 Claude 中直接执行
            parameters: this.convertClaudeParameters(claudeSkill),
            examples: claudeSkill.examples || [],
            claudeSkill: true,
            claudeManifest: claudeSkill,
            skillDirectory: skillDir
        };
    }

    convertClaudeParameters(claudeSkill) {
        if (!claudeSkill.input_schema || !claudeSkill.input_schema.properties) {
            return {};
        }

        const parameters = {};
        const properties = claudeSkill.input_schema.properties;

        for (const [paramName, paramDef] of Object.entries(properties)) {
            parameters[paramName] = {
                required: (claudeSkill.input_schema.required || []).includes(paramName),
                description: paramDef.description || paramName,
                type: paramDef.type || 'string',
                default: paramDef.default
            };
        }

        return parameters;
    }
}

class ClaudeSkillsExecutor {
    constructor() {
        this.claudeSkillsLoader = new ClaudeSkillsLoader();
    }

    async executeClaudeSkill(skillId, parameters, tool) {
        // 如果在 Claude 环境中执行 Claude 技能，则直接执行
        if (tool === 'claude') {
            return await this.executeDirectlyInClaude(skillId, parameters);
        } 
        // 如果在其他环境执行 Claude 技能，则使用 stigmergy call 代理
        else {
            console.log(`🔄 Proxying Claude skill "${skillId}" via stigmergy call...`);
            return await this.executeViaStigmergyCall(skillId, parameters, tool);
        }
    }

    async executeDirectlyInClaude(skillId, parameters) {
        // 验证 Claude CLI 是否可用
        try {
            execSync('claude --version', { stdio: 'pipe', timeout: 5000 });
        } catch (error) {
            throw new Error('Claude CLI is not available. Please install Claude CLI first.');
        }

        // 构建 Claude 技能调用命令
        const command = this.buildClaudeSkillCommand(skillId, parameters);

        try {
            const result = execSync(command, {
                timeout: 30000,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });

            return {
                success: true,
                output: result.trim(),
                executedAs: 'claude-skill',
                skillId: skillId,
                command: command
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                executedAs: 'claude-skill',
                skillId: skillId,
                command: command
            };
        }
    }

    // 使用 stigmergy call 代理执行
    async executeViaStigmergyCall(skillId, parameters, originatingTool) {
        try {
            // 构建自然语言命令来调用 Claude
            const paramText = this.formatParametersAsNaturalLanguage(parameters);
            const skillName = skillId.replace(/-claude$/, '');
            const command = `stigmergy call claude "execute skill ${skillName} with ${paramText}"`;
            
            const result = execSync(command, {
                timeout: 45000,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });

            return {
                success: true,
                output: result.trim(),
                executedAs: 'claude-skill-via-stigmergy-call',
                skillId: skillId,
                originalTool: originatingTool,
                command: command
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                executedAs: 'claude-skill-via-stigmergy-call',
                skillId: skillId,
                originalTool: originatingTool
            };
        }
    }

    formatParametersAsNaturalLanguage(parameters) {
        if (!parameters || typeof parameters !== 'object') {
            return '';
        }

        const paramStrings = Object.entries(parameters)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
            
        return paramStrings || 'default parameters';
    }

    buildClaudeSkillCommand(skillId, parameters) {
        // 提取原始技能名（去掉 -claude 后缀）
        const originalSkillName = skillId.replace(/-claude$/, '');
        
        const paramStrings = Object.entries(parameters)
            .filter(([key, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `--${key} "${value}"`)
            .join(' ');
        
        return `claude --skill "${originalSkillName}" ${paramStrings}`;
    }
}

module.exports = { ClaudeSkillsLoader, ClaudeSkillsExecutor };