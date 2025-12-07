#!/usr/bin/env node

/**
 * Claude CLI Hook Integration
 * 在Claude CLI内部提供技能功能
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ClaudeHookIntegration {
    constructor() {
        this.skillsMap = {
            'analyze': 'code-analysis',
            'security': 'code-analysis',
            'performance': 'code-analysis',
            'generate': 'code-generation',
            'create': 'code-generation',
            'build': 'code-generation',
            'translate': 'translation',
            'document': 'documentation',
            'docs': 'documentation'
        };
    }

    async processSkillCommand(command, context = {}) {
        // 解析技能命令: /skill analyze this code
        const match = command.match(/^\/skill\s+(.+)$/i);
        if (!match) {
            return null;
        }

        const userInput = match[1].trim();
        const detectedSkill = this.detectSkill(userInput);

        if (!detectedSkill) {
            return {
                success: false,
                message: 'Could not detect skill type. Try: analyze, generate, translate, or document'
            };
        }

        // 在Claude CLI内部执行技能
        return this.executeSkillInClaude(detectedSkill, userInput, context);
    }

    detectSkill(input) {
        const lowerInput = input.toLowerCase();

        for (const [keyword, skill] of Object.entries(this.skillsMap)) {
            if (lowerInput.includes(keyword)) {
                return skill;
            }
        }

        return null;
    }

    async executeSkillInClaude(skillId, userInput, context) {
        // 构建增强的prompt，包含技能上下文
        const enhancedPrompt = this.buildEnhancedPrompt(skillId, userInput, context);

        try {
            // 调用Claude CLI处理增强的prompt
            const result = execSync(`claude -p "${enhancedPrompt}"`, {
                encoding: 'utf8',
                timeout: 60000,
                cwd: context.cwd || process.cwd()
            });

            return {
                success: true,
                skillId,
                result: result.trim(),
                mode: 'claude-integrated'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackResponse(skillId, userInput)
            };
        }
    }

    buildEnhancedPrompt(skillId, userInput, context) {
        const skillPrompts = {
            'code-analysis': `
As an expert code analyst, please ${userInput}.

Provide detailed analysis covering:
1. Security vulnerabilities and potential issues
2. Performance bottlenecks and optimization opportunities
3. Code quality and best practices
4. Specific recommendations for improvement

Context: ${context.cwd || 'Current directory'}
`,

            'code-generation': `
As an expert software engineer, please ${userInput}.

Requirements:
- Write clean, maintainable, and well-documented code
- Follow industry best practices and security guidelines
- Include error handling where appropriate
- Add comments explaining key logic

Context: ${context.cwd || 'Current directory'}
`,

            'translation': `
As an expert translator, please ${userInput}.

Requirements:
- Maintain technical accuracy
- Use appropriate terminology for the target domain
- Preserve the original meaning and tone
- Consider cultural context where relevant

Context: ${context.cwd || 'Current directory'}
`,

            'documentation': `
As a technical writer, please ${userInput}.

Requirements:
- Create clear and comprehensive documentation
- Include usage examples and code snippets
- Follow standard documentation formats
- Make it accessible to the target audience

Context: ${context.cwd || 'Current directory'}
`
        };

        return skillPrompts[skillId] || userInput;
    }

    getFallbackResponse(skillId, userInput) {
        const fallbacks = {
            'code-analysis': `Unable to perform code analysis. Please ensure Claude CLI is properly configured and try again.`,
            'code-generation': `Unable to generate code. Please check your Claude CLI installation and network connectivity.`,
            'translation': `Unable to perform translation. Please verify Claude CLI is working and try again.`,
            'documentation': `Unable to generate documentation. Please check Claude CLI configuration.`
        };

        return fallbacks[skillId] || 'Skill execution failed. Please try again.';
    }

    // 安装Claude hook的方法
    async installClaudeHook() {
        const claudeConfigDir = path.join(process.env.HOME || process.env.USERPROFILE, '.claude');
        const hooksDir = path.join(claudeConfigDir, 'hooks');

        if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
        }

        const hookContent = `#!/usr/bin/env node
const ClaudeHookIntegration = require('${__filename}');
const hook = new ClaudeHookIntegration();

// 处理输入
hook.processSkillCommand(process.argv.slice(2).join(' '))
    .then(result => {
        if (result.success) {
            console.log(result.result);
        } else {
            console.error('Skill Error:', result.message || result.error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Hook Error:', error.message);
        process.exit(1);
    });
`;

        const hookPath = path.join(hooksDir, 'skill.js');
        fs.writeFileSync(hookPath, hookContent);

        // 设置执行权限
        try {
            execSync(`chmod +x "${hookPath}"`);
        } catch (error) {
            // Windows可能不需要chmod
        }

        return hookPath;
    }
}

module.exports = ClaudeHookIntegration;

// 如果直接运行此文件，安装hook
if (require.main === module) {
    const hook = new ClaudeHookIntegration();
    hook.installClaudeHook()
        .then(hookPath => {
            console.log('✅ Claude skill hook installed at:', hookPath);
            console.log('💡 Usage: In Claude CLI, type: /skill <your request>');
        })
        .catch(error => {
            console.error('❌ Failed to install hook:', error.message);
            process.exit(1);
        });
}