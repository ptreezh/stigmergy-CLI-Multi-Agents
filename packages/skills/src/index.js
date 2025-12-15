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

            // Initialize Claude skills (with reduced logging)
            await this.skillsManager.initializeClaudeSkills();

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

            // Initialize SkillsDetector for comprehensive skill detection
            const SkillsDetector = require('./core/skills-detector.cjs');
            const skillsDetector = new SkillsDetector();

            this.nlProcessor = {
                parse: async (input) => {
                    // Use SkillsDetector for comprehensive pattern matching
                    const detectionResult = skillsDetector.detectSkill(input);
                    if (detectionResult.skill) {
                        return {
                            skill: detectionResult.skill,
                            confidence: detectionResult.confidence,
                            parameters: detectionResult.parameters
                        };
                    }

                    // Fallback to original simple pattern matching
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
            console.log(chalk.blue(`🛠�? Using tool: ${tool}`));
        }

        // First, check for direct skill invocation in the form of "/skills -subskill"
        const directSkillMatch = input.match(/^\/skills\s+-([a-zA-Z0-9\-_]+)(?:\s+(.*))?$/);
        if (directSkillMatch) {
            const skillId = directSkillMatch[1];
            const skillArgs = directSkillMatch[2] || '';

            console.log(chalk.blue(`🔧 Direct skill invocation: ${skillId}`));

            // Get available skills
            const allSkills = await this.skillsManager.listAllSkills();

            // Check if this is a known skill
            const skillExists = allSkills.some(skill =>
                skill.id === skillId ||
                (skill.aliases && skill.aliases.includes(skillId))
            );

            if (skillExists) {
                // Extract parameters from the skill arguments
                const parameters = this.parseSkillArguments(skillArgs);

                console.log(chalk.green(`�?Executing skill: ${skillId} with parameters:`), parameters);

                const executionResult = await this.skillsManager.executeSkill(
                    skillId,
                    parameters,
                    tool,
                    demo
                );

                return {
                    success: true,
                    skill: skillId,
                    parameters: parameters,
                    execution: executionResult,
                    mode: 'direct-invocation'
                };
            } else {
                console.log(chalk.red(`�?Unknown skill: ${skillId}`));
                const availableSkills = allSkills.map(skill => skill.id).join(', ');
                console.log(chalk.yellow(`Available skills: ${availableSkills}`));
                return {
                    success: false,
                    message: `Unknown skill: ${skillId}`,
                    availableSkills: allSkills.map(skill => skill.id)
                };
            }
        }

        // Check for paper download command
        const paperDownloadMatch = input.match(/^\/paperDL\s+(.+)$|^\/paperdl\s+(.+)$/i);
        if (paperDownloadMatch) {
            const query = paperDownloadMatch[1] || paperDownloadMatch[2];

            console.log(chalk.blue('🔧 Paper download command detected'));

            // Convert to paper-download skill
            const parameters = { query: query, sources: 'all', maxResults: 5 };

            const executionResult = await this.skillsManager.executeSkill(
                'paper-download',
                parameters,
                tool,
                demo
            );

            return {
                success: true,
                skill: 'paper-download',
                parameters: parameters,
                execution: executionResult,
                mode: 'direct-command'
            };
        }

        // Check for paper DOI command
        const paperDoiMatch = input.match(/^\/paperDOI\s+(.+)$|^\/paperdoi\s+(.+)$/i);
        if (paperDoiMatch) {
            const query = paperDoiMatch[1] || paperDoiMatch[2];

            console.log(chalk.blue('🔧 Paper DOI command detected'));

            // Convert to paper-doi skill
            const parameters = { query: query, sources: 'all' };

            const executionResult = await this.skillsManager.executeSkill(
                'paper-doi',
                parameters,
                tool,
                demo
            );

            return {
                success: true,
                skill: 'paper-doi',
                parameters: parameters,
                execution: executionResult,
                mode: 'direct-command'
            };
        }

        // Check for CNKI search command
        const cnkiSearchMatch = input.match(/^\/cnki\s+(.+)$|^\/CNKI\s+(.+)$/);
        if (cnkiSearchMatch) {
            const query = cnkiSearchMatch[1] || cnkiSearchMatch[2];

            console.log(chalk.blue('🔧 CNKI Search command detected'));

            // Convert to cnki-search skill
            const parameters = {
                query: query,
                maxResults: 10,
                downloadPdfs: false
            };

            const executionResult = await this.skillsManager.executeSkill(
                'cnki-search',
                parameters,
                tool,
                demo
            );

            return {
                success: true,
                skill: 'cnki-search',
                parameters: parameters,
                execution: executionResult,
                mode: 'direct-command'
            };
        }

        const result = await this.nlProcessor.parse(input);

        if (!result.skill || result.confidence < 3) {
            console.log(chalk.yellow('ℹ️  No skill pattern detected'));
            return {
                success: false,
                message: 'No suitable skill found for this input',
                suggestions: this.generateSuggestions()
            };
        }

        console.log(chalk.green(`�?Detected skill: ${result.skill}`));
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
        console.error(chalk.red(`�?Error: ${error.message}`));
        return {
            success: false,
            error: error.message
        };
    }

    parseSkillArguments(argsString) {
        if (!argsString || argsString.trim() === '') {
            return {};
        }

        const parameters = {};
        // Simple parser for "key=value" format
        const pairs = argsString.match(/(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g);

        if (pairs) {
            pairs.forEach(pair => {
                const match = pair.match(/(\w+)=("(.*)"|'(.*)'|(\S+))/);
                if (match) {
                    const key = match[1];
                    const value = match[2].startsWith('"') || match[2].startsWith("'")
                        ? match[2].slice(1, -1)  // Remove quotes
                        : match[2] || match[5];
                    parameters[key] = value;
                }
            });
        } else {
            // If no key=value pairs found, treat the whole string as text input
            parameters.text = argsString;
        }

        return parameters;
    }

    // 添加直接技能调用方法，支持简化的命令格式
    async directInvokeSkill(skillName, argsString, options = {}) {
        const { tool = 'claude', verbose = false, demo = false } = options;

        if (verbose) {
            console.log(chalk.blue(`🔧 Direct skill invocation: ${skillName}`));
        }

        // Get available skills
        const allSkills = await this.skillsManager.listAllSkills();

        // Allow shortened skill name matching
        const skillMatch = allSkills.find(skill =>
            skill.id === skillName ||
            skill.id.endsWith(skillName) ||
            skill.name.toLowerCase().includes(skillName.toLowerCase())
        );

        if (!skillMatch) {
            console.log(chalk.red(`�?Unknown skill: ${skillName}`));
            const availableSkills = allSkills.map(skill => skill.id).join(', ');
            console.log(chalk.yellow(`Available skills: ${availableSkills}`));
            return {
                success: false,
                message: `Unknown skill: ${skillName}`,
                availableSkills: allSkills.map(skill => skill.id)
            };
        }

        const skillId = skillMatch.id;
        const parameters = this.parseSkillArguments(argsString);

        if (verbose) {
            console.log(chalk.green(`�?Executing skill: ${skillId} with parameters:`), parameters);
        }

        const executionResult = await this.skillsManager.executeSkill(
            skillId,
            parameters,
            tool,
            demo
        );

        return {
            success: true,
            skill: skillId,
            parameters: parameters,
            execution: executionResult,
            mode: 'direct-invocation'
        };
    }

    parseSkillArguments(argsString) {
        if (!argsString || argsString.trim() === '') {
            return {};
        }

        const parameters = {};
        // Simple parser for "key=value" format
        const pairs = argsString.match(/(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g);

        if (pairs) {
            pairs.forEach(pair => {
                const match = pair.match(/(\w+)=("(.*)"|'(.*)'|(\S+))/);
                if (match) {
                    const key = match[1];
                    const value = match[2].startsWith('"') || match[2].startsWith("'")
                        ? match[2].slice(1, -1)  // Remove quotes
                        : match[2] || match[5];
                    parameters[key] = value;
                }
            });
        } else {
            // If no key=value pairs found, treat the whole string as text input
            parameters.text = argsString;
        }

        return parameters;
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
                console.log(`   🏷�? Category: ${skill.category}`);
                console.log(`   🛠�? Tools: ${skill.tools.join(', ')}`);

                if (skill.parameters) {
                    console.log('   🔧 Parameters:');
                    for (const [paramName, param] of Object.entries(skill.parameters)) {
                        const required = param.required ? chalk.red('required') : chalk.green('optional');
                        console.log(`     �?${paramName} (${required}): ${param.description}`);
                    }
                }
            }

            return skills;
        } catch (error) {
            console.error(chalk.red(`�?Error listing skills: ${error.message}`));
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
  �?Natural language input (e.g., "translate this to English")
  �?help - Show this help
  �?exit - Exit interactive mode

💡 Supported Skills:
  �?Translation - Text translation between languages
  �?Code Analysis - Analyze code for security, performance, etc.
  �?Code Generation - Generate code from requirements
  �?Documentation - Create documentation for code

🛠�? Usage Examples:
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
            console.error(chalk.red(`�?Error getting status: ${error.message}`));
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

        // Direct skill invocation commands (manual trigger)
        const manualSkillMatch = input.match(/^(\w+)(?:\s+(.*))?$/);
        if (manualSkillMatch) {
            const skillName = manualSkillMatch[1];
            const skillArgs = manualSkillMatch[2] || '';

            // Check if this looks like a manual skill invocation
            const manualSkills = ['skill', 'persist', 'cite', 'code', 'analyze', 'translate', 'doc', 'memo', 'session'];
            if (manualSkills.includes(skillName)) {
                const skillMapping = {
                    'skill': 'processing-citations',
                    'persist': 'persistent-browser',
                    'cite': 'processing-citations',
                    'code': 'performing-open-coding',
                    'analyze': 'performing-axial-coding',
                    'translate': 'processing-citations',
                    'doc': 'paper-structure',
                    'memo': 'memo-writing',
                    'session': 'dissent-resolution'  // 或其�?session 相关技�?                };

                const actualSkillName = skillMapping[skillName] || skillName;

                console.log(chalk.blue(`🔧 Manual skill invocation: ${actualSkillName}`));

                const result = await skills.directInvokeSkill(actualSkillName, skillArgs, {
                    tool: options.tool,
                    verbose: options.verbose,
                    demo: options.demo
                });

                if (result.success) {
                    console.log(chalk.green('\n�?Skill executed successfully!'));
                } else {
                    console.log(chalk.red(`\n�?Skill execution failed: ${result.message}`));
                }
                return;
            }
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
                    console.log(`   �?${suggestion}`);
                });
            }
            process.exit(1);
        }

        console.log(chalk.green('\n�?Processing completed successfully!'));
    });

// Subcommands for direct skill invocation (manual triggers)
program
    .command('skill <skill-name> [args...]')
    .description('Directly invoke a specific skill by name')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (skillName, args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill(skillName, argsString, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('persist [args...]')
    .description('Persistent browser automation (direct invocation)')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill('persistent-browser', argsString, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('cite [args...]')
    .description('Citation processing (direct invocation)')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill('processing-citations', argsString, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('code [args...]')
    .description('Coding skills (direct invocation)')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill('performing-open-coding', argsString, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('paperDL [args...]')
    .description('Download academic papers using Playwright persistent browser')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill('paper-download', `query="${argsString}" sources=all maxResults=5`, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('paperDOI [args...]')
    .description('Get DOI, URL and citation info for academic papers')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const result = await skills.directInvokeSkill('paper-doi', `query="${argsString}" sources=all`, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

program
    .command('cnki [args...]')
    .description('Search academic papers on China National Knowledge Infrastructure (CNKI)')
    .option('-t, --tool <tool>', 'Specify AI tool (claude, gemini, qwen, etc.)', 'claude')
    .option('-v, --verbose', 'Verbose output')
    .option('-n, --max-results <number>', 'Maximum number of results', '10')
    .option('--download-pdfs', 'Attempt to download PDFs (requires proper access)')
    .option('--demo', 'Demo mode with simulation output')
    .action(async (args, options) => {
        const skills = new SkillsPackage();

        // Initialize the system
        const initialized = await skills.initialize();
        if (!initialized) {
            process.exit(1);
        }

        const argsString = args.join(' ');

        const params = [
            `query="${argsString}"`,
            `maxResults=${options.maxResults}`,
            `downloadPdfs=${!!options.downloadPdfs}`
        ].join(' ');

        const result = await skills.directInvokeSkill('cnki-search', params, {
            tool: options.tool,
            verbose: options.verbose,
            demo: options.demo
        });

        if (!result.success) {
            process.exit(1);
        }
    });

// Parse command line arguments
program.parse();

// Export for module usage
export default SkillsPackage;
