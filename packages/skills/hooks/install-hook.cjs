#!/usr/bin/env node

/**
 * Hook Installation Script
 * 安装技能Hook到各个AI CLI工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class HookInstaller {
    constructor() {
        this.homeDir = os.homedir();
        this.cliConfigs = {
            'claude': {
                configDir: '.claude',
                hooksDir: 'hooks',
                configFile: 'config.json'
            },
            'gemini': {
                configDir: '.gemini',
                hooksDir: 'hooks',
                configFile: 'settings.json'
            },
            'qwen': {
                configDir: '.qwen',
                hooksDir: 'extensions',
                configFile: 'config.json'
            }
        };
    }

    async installSkillHooks() {
        console.log('🔧 Installing skill hooks for AI CLI tools...\n');

        for (const [cliName, config] of Object.entries(this.cliConfigs)) {
            try {
                await this.installHookForCLI(cliName, config);
            } catch (error) {
                console.warn(`⚠️  Failed to install hook for ${cliName}: ${error.message}`);
            }
        }

        console.log('\n✅ Hook installation completed!');
        console.log('\n💡 Usage Examples:');
        console.log('  claude> /skill analyze this code');
        console.log('  gemini> /skill generate user authentication');
        console.log('  qwen> /skill translate this to English');
    }

    async installHookForCLI(cliName, config) {
        const configPath = path.join(this.homeDir, config.configDir);
        const hooksDir = path.join(configPath, config.hooksDir);

        // 创建配置目录
        if (!fs.existsSync(configPath)) {
            fs.mkdirSync(configPath, { recursive: true });
        }

        if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
        }

        // 安装技能Hook
        const skillHookPath = path.join(hooksDir, 'skill.js');
        await this.createSkillHook(skillHookPath, cliName);

        // 更新配置文件以启用Hook
        await this.updateCLIConfig(configPath, config.configFile, cliName);

        console.log(`✅ ${cliName} hook installed: ${skillHookPath}`);
    }

    async createSkillHook(hookPath, cliName) {
        const hookContent = this.generateHookContent(cliName);
        fs.writeFileSync(hookPath, hookContent);

        // 设置执行权限（Unix系统）
        if (process.platform !== 'win32') {
            fs.chmodSync(hookPath, '755');
        }
    }

    generateHookContent(cliName) {
        return `#!/usr/bin/env node

/**
 * ${cliName.toUpperCase()} CLI Skill Hook
 * 在${cliName} CLI内部提供技能功能
 */

const { spawn } = require('child_process');
const path = require('path');

class ${this.capitalizeFirst(cliName)}SkillHook {
    constructor() {
        this.skillPatterns = {
            'analyze': ['security', 'performance', 'quality', 'review'],
            'generate': ['create', 'build', 'write', 'implement'],
            'translate': ['translate', 'convert', 'localize'],
            'document': ['document', 'docs', 'readme', 'comment']
        };
    }

    async processSkillCommand(input, context = {}) {
        // 解析 /skill 命令
        if (!input.startsWith('/skill ')) {
            return null;
        }

        const userInput = input.slice(7).trim(); // 移除 '/skill '
        const skillType = this.detectSkillType(userInput);

        if (!skillType) {
            return {
                success: false,
                message: 'Could not detect skill type. Try: analyze, generate, translate, or document'
            };
        }

        return this.executeSkill(skillType, userInput, context);
    }

    detectSkillType(input) {
        const lowerInput = input.toLowerCase();

        for (const [skill, keywords] of Object.entries(this.skillPatterns)) {
            if (keywords.some(keyword => lowerInput.includes(keyword))) {
                return skill;
            }
        }

        // 直接关键词匹配
        if (lowerInput.includes('analyze') || lowerInput.includes('分析')) return 'analyze';
        if (lowerInput.includes('generate') || lowerInput.includes('生成')) return 'generate';
        if (lowerInput.includes('translate') || lowerInput.includes('翻译')) return 'translate';
        if (lowerInput.includes('document') || lowerInput.includes('文档')) return 'document';

        return null;
    }

    async executeSkill(skillType, userInput, context) {
        // 构建增强的prompt
        const enhancedPrompt = this.buildEnhancedPrompt(skillType, userInput, context);

        // 使用CLI工具本身处理增强的prompt
        try {
            const result = await this.executeCLI(enhancedPrompt);

            return {
                success: true,
                skillType,
                result: result.trim(),
                mode: 'hook-integrated'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                suggestion: 'Please check your CLI tool configuration'
            };
        }
    }

    buildEnhancedPrompt(skillType, userInput, context) {
        const prompts = {
            analyze: \`As an expert code analyst, please \${userInput}.

Provide detailed analysis covering:
1. Security vulnerabilities and potential issues
2. Performance bottlenecks and optimization opportunities
3. Code quality and best practices
4. Specific recommendations for improvement

Current directory: \${context.cwd || process.cwd()}\`,

            generate: \`As an expert software engineer, please \${userInput}.

Requirements:
- Write clean, maintainable, and well-documented code
- Follow industry best practices and security guidelines
- Include error handling where appropriate
- Add comments explaining key logic

Current directory: \${context.cwd || process.cwd()}\`,

            translate: \`As an expert translator, please \${userInput}.

Requirements:
- Maintain technical accuracy
- Use appropriate terminology for the target domain
- Preserve the original meaning and tone
- Consider cultural context where relevant\`,

            document: \`As a technical writer, please \${userInput}.

Requirements:
- Create clear and comprehensive documentation
- Include usage examples and code snippets
- Follow standard documentation formats
- Make it accessible to the target audience\`
        };

        return prompts[skillType] || userInput;
    }

    async executeCLI(prompt) {
        return new Promise((resolve, reject) => {
            const child = spawn('${cliName}', ['-p', prompt], {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(error || 'CLI execution failed'));
                }
            });

            child.on('error', reject);
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Hook入口点
const hook = new ${this.capitalizeFirst(cliName)}SkillHook();

// 处理命令行参数
const command = process.argv.slice(2).join(' ');
const context = {
    cwd: process.cwd(),
    env: process.env
};

hook.processSkillCommand(command, context)
    .then(result => {
        if (result && result.success) {
            console.log(result.result);
        } else if (result) {
            console.error('Skill Error:', result.message || result.error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Hook Error:', error.message);
        process.exit(1);
    });
`;
    }

    async updateCLIConfig(configPath, configFile, cliName) {
        const configFilePath = path.join(configPath, configFile);

        let config = {};
        if (fs.existsSync(configFilePath)) {
            try {
                config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
            } catch (error) {
                // 如果配置文件损坏，使用默认配置
            }
        }

        // 启用Hook功能
        config.hooks = config.hooks || {};
        config.hooks.enabled = true;
        config.hooks.skill = {
            enabled: true,
            command: '/skill',
            description: 'Execute AI skills using natural language'
        };

        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// 如果直接运行此脚本，安装所有Hook
if (require.main === module) {
    const installer = new HookInstaller();
    installer.installSkillHooks()
        .then(() => {
            console.log('\n🎉 Skill hooks installation completed successfully!');
        })
        .catch(error => {
            console.error('\n❌ Hook installation failed:', error.message);
            process.exit(1);
        });
}

module.exports = HookInstaller;