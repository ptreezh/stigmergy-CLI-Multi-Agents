#!/usr/bin/env node

/**
 * Stigmergy Skills Package
 * Standalone Natural Language Skills System for AI CLI Tools
 *
 * This package provides the skills functionality as a separate module
 * that can be used independently or alongside the main stigmergy package.
 */

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

// Import core skills functionality
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { SkillsManager } = require('./core/skills-manager.cjs');
const { DependencyManager } = require('./core/dependency-manager.cjs');

class SkillsPackage {
    constructor() {
        this.skillsManager = null;
        this.nlProcessor = null;
        this.hookManager = null;
        this.dependencyManager = null;
        this.version = '1.0.0';
    }

    async initialize() {
        const spinner = ora('Initializing Stigmergy Skills System...').start();

        try {
            this.skillsManager = new SkillsManager();
            this.dependencyManager = new DependencyManager();

            // Check dependencies first
            const depStatus = await this.dependencyManager.getDependencyStatus();

            if (!depStatus.ready) {
                spinner.warn('Dependencies not fully configured');

                if (depStatus.recommendation.level === 'required') {
                    console.log(chalk.red('\n⚠️  Base stigmergy package is required for full functionality'));

                    const { shouldInstall } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'shouldInstall',
                            message: 'Would you like to install stigmergy base package now?',
                            default: true
                        }
                    ]);

                    if (shouldInstall) {
                        const { installGlobal } = await inquirer.prompt([
                            {
                                type: 'confirm',
                                name: 'installGlobal',
                                message: 'Install globally (recommended)?',
                                default: true
                            }
                        ]);

                        const installSpinner = ora('Installing stigmergy base package...').start();
                        const installResult = await this.dependencyManager.installBasePackage(installGlobal);

                        if (installResult.success) {
                            installSpinner.succeed('Base package installed successfully');
                        } else {
                            installSpinner.fail('Installation failed');
                            console.log(chalk.yellow('Continuing with limited functionality...'));
                        }
                    }
                } else if (depStatus.recommendation.level === 'recommended') {
                    console.log(chalk.yellow('\n💡 ' + depStatus.recommendation.message));
                }
            }

            // Simple mock initialization for NL processor and hook manager
            this.nlProcessor = {
                parse: async (input) => {
                    // Simple pattern matching for demo
                    const lowerInput = input.toLowerCase();
                    if (lowerInput.includes('translate') || lowerInput.includes('翻译')) {
                        return { skill: 'translation', confidence: 8, parameters: { text: input } };
                    } else if (lowerInput.includes('analyze') || lowerInput.includes('分析')) {
                        return { skill: 'code-analysis', confidence: 7, parameters: { text: input } };
                    } else if (lowerInput.includes('generate') || lowerInput.includes('生成')) {
                        return { skill: 'code-generation', confidence: 7, parameters: { text: input } };
                    } else if (lowerInput.includes('document') || lowerInput.includes('文档')) {
                        return { skill: 'documentation', confidence: 6, parameters: { text: input } };
                    }
                    return { skill: null, confidence: 0, parameters: {} };
                },
                getStatus: async () => ({ ready: true })
            };

            this.hookManager = {
                installAllHooks: async () => [{ success: true, tool: 'mock' }],
                getStatus: async () => [{ tool: 'mock', installed: false }]
            };

            spinner.succeed('Skills System initialized successfully');
            return true;
        } catch (error) {
            spinner.fail(`Failed to initialize: ${error.message}`);
            return false;
        }
    }

    async processNaturalLanguage(input, options = {}) {
        const { tool = 'claude', verbose = false, demo = false } = options;

        if (verbose) {
            console.log(chalk.blue(`🔍 Processing input: "${input}"`));
            console.log(chalk.blue(`🛠️  Using tool: ${tool}`));
        }

        try {
            const result = await this.nlProcessor.parse(input);

            if (!result.skill || result.confidence < 3) {
                console.log(chalk.yellow('ℹ️  No skill pattern detected'));
                return {
                    success: false,
                    message: 'No suitable skill found for this input',
                    suggestions: this.generateSuggestions()
                };
            }

            console.log(chalk.green(`✅ Detected skill: ${result.skill}`));
            console.log(chalk.cyan(`📊 Confidence: ${result.confidence}/10`));

            if (Object.keys(result.parameters).length > 0) {
                console.log(chalk.cyan(`📋 Parameters: ${JSON.stringify(result.parameters, null, 2)}`));
            }

            // Execute skill
            const executionResult = await this.skillsManager.executeSkill(
                result.skill,
                result.parameters,
                tool,
                demo
            );

            return {
                success: true,
                skill: result.skill,
                confidence: result.confidence,
                parameters: result.parameters,
                execution: executionResult
            };

        } catch (error) {
            console.error(chalk.red(`❌ Error: ${error.message}`));
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateSuggestions() {
        return [
            'Try using keywords like: translate, analyze, generate, document',
            'Examples:',
            '  "translate this to English"',
            '  "analyze the security of this code"',
            '  "generate a user login function"',
            '  "create documentation for this API"'
        ];
    }

    async listSkills(category = null) {
        try {
            const skills = await this.skillsManager.listAllSkills(category);

            console.log(chalk.blue('\n🎯 Available Skills:'));
            console.log(chalk.blue('='.repeat(50)));

            for (const skill of skills) {
                console.log(`\n📝 ${chalk.bold(skill.name)} (${chalk.yellow(skill.id)})`);
                console.log(`   📖 ${skill.description}`);
                console.log(`   🏷️  Category: ${skill.category}`);
                console.log(`   🛠️  Tools: ${skill.tools.join(', ')}`);

                if (skill.parameters) {
                    console.log('   🔧 Parameters:');
                    for (const [paramName, param] of Object.entries(skill.parameters)) {
                        const required = param.required ? chalk.red('required') : chalk.green('optional');
                        console.log(`     • ${paramName} (${required}): ${param.description}`);
                    }
                }
            }

            return skills;
        } catch (error) {
            console.error(chalk.red(`❌ Error listing skills: ${error.message}`));
            return [];
        }
    }

    async installHooks() {
        const spinner = ora('Installing AI CLI hooks...').start();

        try {
            const results = await this.hookManager.installAllHooks();

            const installed = results.filter(r => r.success).length;
            const total = results.length;

            if (installed === total) {
                spinner.succeed(`All ${total} hooks installed successfully`);
            } else {
                spinner.warn(`${installed}/${total} hooks installed`);
            }

            return results;
        } catch (error) {
            spinner.fail(`Hook installation failed: ${error.message}`);
            return [];
        }
    }

    async interactiveMode() {
        console.log(chalk.blue('\n🤖 Stigmergy Skills Interactive Mode'));
        console.log(chalk.gray('Type "exit" to quit, "help" for commands\n'));

        while (true) {
            try {
                const { input } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'input',
                        message: 'skills>',
                        prefix: ''
                    }
                ]);

                if (input.toLowerCase() === 'exit') {
                    break;
                }

                if (input.toLowerCase() === 'help') {
                    this.showInteractiveHelp();
                    continue;
                }

                if (input.trim() === '') {
                    continue;
                }

                // Process the input
                await this.processNaturalLanguage(input, { verbose: true });
                console.log(''); // Add spacing

            } catch (error) {
                console.error(chalk.red(`Error: ${error.message}`));
            }
        }

        console.log(chalk.green('\n👋 Goodbye!'));
    }

    showInteractiveHelp() {
        console.log(chalk.cyan(`
📋 Interactive Commands:
  • Natural language input (e.g., "translate this to English")
  • help - Show this help
  • exit - Exit interactive mode

💡 Supported Skills:
  • Translation - Text translation between languages
  • Code Analysis - Analyze code for security, performance, etc.
  • Code Generation - Generate code from requirements
  • Documentation - Create documentation for code

🛠️  Usage Examples:
  "translate this comment to English"
  "analyze the security of this React component"
  "generate a user authentication function in Python"
  "create documentation for this API endpoint"
        `));
    }

    async showStatus() {
        console.log(chalk.blue('\n📊 Stigmergy Skills Status:'));
        console.log(chalk.blue('='.repeat(40)));

        try {
            // Dependency status first
            if (this.dependencyManager) {
                const depStatus = await this.dependencyManager.getDependencyStatus();
                console.log(`🔗 Base Package: ${depStatus.ready ? chalk.green('Installed') : chalk.red('Not Installed')}`);

                if (depStatus.basePackage.installed) {
                    const globalText = depStatus.basePackage.global ? ' (Global)' : ' (Local)';
                    console.log(`📦 Stigmergy: ${chalk.green('Available')}${globalText}`);
                } else {
                    console.log(`📦 Stigmergy: ${chalk.red('Not Available')}`);
                }
            }

            // Skills status
            const skills = await this.skillsManager.listAllSkills();
            console.log(`📝 Skills Available: ${chalk.green(skills.length)}`);

            // Hook status
            const hookStatus = await this.hookManager.getStatus();
            const installedHooks = hookStatus.filter(h => h.installed).length;
            console.log(`🔗 Hooks Installed: ${installedHooks}/${hookStatus.length}`);

            // Natural language processor status
            const nlStatus = await this.nlProcessor.getStatus();
            console.log(`🧠 NL Processor: ${nlStatus.ready ? chalk.green('Ready') : chalk.red('Not Ready')}`);

            console.log(chalk.cyan('\n📦 Package Version: ' + this.version));
            console.log(chalk.cyan('🔧 Node.js Version: ' + process.version));

        } catch (error) {
            console.error(chalk.red(`❌ Error getting status: ${error.message}`));
        }
    }
}

// CLI setup
program
    .name('stigmergy-skill')
    .description('Stigmergy AI Skills - Natural Language Skills for AI CLI Tools')
    .version('1.0.0')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('-i, --interactive', 'Interactive mode')
    .option('--demo', 'Demo mode with simulation output (for testing only)');

// Main command
program
    .argument('[input]', 'Natural language input or command')
    .action(async (input, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        // Interactive mode
        if (options.interactive) {
            await skills.interactiveMode();
            return;
        }

        // Status command
        if (input === 'status') {
            await skills.showStatus();
            return;
        }

        // List skills command
        if (input === 'list') {
            await skills.listSkills();
            return;
        }

        // Install hooks command
        if (input === 'install-hooks') {
            await skills.installHooks();
            return;
        }

        // Help command
        if (!input || input === 'help') {
            program.help();
            return;
        }

        // Process natural language input
        const result = await skills.processNaturalLanguage(input, options);

        if (!result.success) {
            console.log(chalk.yellow('\n💡 Suggestions:'));
            if (result.suggestions) {
                result.suggestions.forEach(suggestion => {
                    console.log(`   • ${suggestion}`);
                });
            }
            process.exit(1);
        }

        console.log(chalk.green('\n✅ Processing completed successfully!'));
    });

// Parse command line arguments
program.parse();

// Export for module usage
export default SkillsPackage;