"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = initCommand;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = require("fs");
const path_1 = require("path");
// 修改：使用修复版的CLIScanner
const CLIScanner_1 = require("./CLIScanner-fix");
const CodeGenerator_1 = require("../utils/CodeGenerator");
async function initCommand(options) {
    console.log(chalk_1.default.blue.bold('🚀 Initializing ResumeSession for cross-CLI session recovery\n'));
    // Check current directory
    const currentDir = process.cwd();
    const configPath = (0, path_1.join)(currentDir, '.resumesession');
    if ((0, fs_1.existsSync)(configPath) && !options.force) {
        console.log(chalk_1.default.yellow('⚠️  ResumeSession already initialized in this project.'));
        console.log(chalk_1.default.gray(`   Config file: ${configPath}`));
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'Do you want to reinitialize?',
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk_1.default.gray('�?Initialization cancelled.'));
            return;
        }
    }
    // Scan all CLI tools (包括不可用的)
    console.log(chalk_1.default.blue('🔍 Scanning for CLI tools...'));
    const scanner = CLIScanner_1.CLIScanner.getInstance();
    const allCLIs = await scanner.scanAllCLIs();

    if (allCLIs.length === 0) {
        console.log(chalk_1.default.red('�?No supported CLI tools found on this system.'));
        return;
    }

    // 分类显示
    const availableCLIs = allCLIs.filter(cli => cli.available);
    const unavailableCLIs = allCLIs.filter(cli => !cli.available);

    console.log(chalk_1.default.blue(`\n📋 Found ${allCLIs.length} CLI tools:\n`));

    // 显示可用的CLI
    if (availableCLIs.length > 0) {
        console.log(chalk_1.default.green.bold(`�?Available (${availableCLIs.length}):`));
        availableCLIs.forEach((cli, index) => {
            const integration = getIntegrationLevelText(cli.integrationLevel);
            console.log(`   ${index + 1}. ${chalk_1.default.bold(cli.displayName)} ${chalk_1.default.green('�?)}`);
            console.log(`      Version: ${cli.version || 'unknown'}`);
            console.log(`      Integration: ${integration}`);
            if (cli.sessionsPath) {
                console.log(`      Sessions: ${cli.sessionsPath}`);
            }
            if (cli.installedPath) {
                console.log(`      Path: ${cli.installedPath}`);
            }
            console.log('');
        });
    }

    // 显示不可用的CLI
    if (unavailableCLIs.length > 0) {
        console.log(chalk_1.default.yellow.bold(`�?Not Available (${unavailableCLIs.length}):`));
        unavailableCLIs.forEach((cli, index) => {
            const integration = getIntegrationLevelText(cli.integrationLevel);
            console.log(`   ${index + 1}. ${chalk_1.default.bold(cli.displayName)} ${chalk_1.default.red('�?)}`);
            console.log(`      Integration: ${integration}`);
            console.log(`      Tip: Install with npm or check PATH`);
            console.log('');
        });
    }

    if (availableCLIs.length === 0) {
        console.log(chalk_1.default.red('\n�?No available CLI tools found.'));
        console.log(chalk_1.default.gray('   Please install at least one supported CLI tool:'));
        console.log(chalk_1.default.gray('   - Claude CLI: npm install -g @anthropic-ai/claude-code'));
        console.log(chalk_1.default.gray('   - Gemini CLI: npm install -g @google/gemini-cli'));
        console.log(chalk_1.default.gray('   - And more...'));
        return;
    }

    // Select CLI tools to integrate
    const { selectedCLIs } = await inquirer_1.default.prompt([
        {
            type: 'checkbox',
            name: 'selectedCLIs',
            message: 'Select CLI tools to integrate with ResumeSession:',
            choices: availableCLIs.map(cli => ({
                name: `${cli.displayName} (${cli.version})`,
                value: cli.name,
                checked: true
            })),
            validate: (input) => {
                if (input.length === 0) {
                    return 'Please select at least one CLI tool';
                }
                return true;
            }
        }
    ]);

    if (selectedCLIs.length === 0) {
        console.log(chalk_1.default.gray('�?No CLI tools selected. Initialization cancelled.'));
        return;
    }

    // Validate selected CLI tools
    console.log(chalk_1.default.blue('\n🔧 Validating selected CLI tools...'));
    const validCLIs = [];
    for (const cliName of selectedCLIs) {
        const isValid = await scanner.validateCLIForCrossCLI(cliName);
        if (isValid) {
            validCLIs.push(cliName);
            console.log(chalk_1.default.green(`   �?${cliName} is ready for cross-CLI integration`));
        } else {
            console.log(chalk_1.default.yellow(`   ⚠️  ${cliName} may have limited functionality`));
            // Still add to list but with possible limited functionality
            validCLIs.push(cliName);
        }
    }

    // Create configuration
    const config = {
        projectPath: currentDir,
        selectedCLIs: validCLIs,
        allDetectedCLIs: allCLIs.map(cli => ({
            name: cli.name,
            available: cli.available,
            version: cli.version
        })),
        initializedAt: new Date(),
        version: require('../../package.json').version
    };

    // Save configuration
    console.log(chalk_1.default.blue('\n💾 Saving configuration...'));
    (0, fs_1.mkdirSync)(currentDir, { recursive: true });
    (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2));

    // Generate integration code
    console.log(chalk_1.default.blue('🔨 Generating integration code...'));
    const codeGenerator = new CodeGenerator_1.CodeGenerator();
    for (const cliName of validCLIs) {
        try {
            await codeGenerator.generateIntegration(cliName, currentDir, config);
            console.log(chalk_1.default.green(`   �?Generated integration for ${cliName}`));
        } catch (error) {
            console.log(chalk_1.default.red(`   �?Failed to generate integration for ${cliName}: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    // Create usage instructions
    await generateUsageInstructions(currentDir, validCLIs);

    // Completion
    console.log(chalk_1.default.green.bold('\n🎉 ResumeSession initialization completed successfully!\n'));
    console.log(chalk_1.default.bold('📋 Next steps:'));
    console.log('1. Open your preferred CLI tool in this project directory');
    console.log('2. Try the /history command to see cross-CLI sessions');
    console.log(`3. Configuration saved to: ${chalk_1.default.gray(configPath)}`);
    console.log(`4. Run ${chalk_1.default.cyan('resumesession status')} to check integration status\n`);
    console.log(chalk_1.default.bold('💡 Example commands:'));
    console.log(`   ${chalk_1.default.cyan('/history')} - Show all project sessions`);
    console.log(`   ${chalk_1.default.cyan('/history --cli <tool>')} - Show sessions from specific CLI`);
    console.log(`   ${chalk_1.default.cyan('/history --search <keyword>')} - Search for content`);
    console.log(`   ${chalk_1.default.cyan('/history --format timeline')} - Timeline view`);
    console.log(`   ${chalk_1.default.cyan('/history --context')} - Get context for continuation\n`);
    console.log(chalk_1.default.gray('📚 For more information, run: resumesession --help'));
}

function getIntegrationLevelText(level) {
    switch (level) {
        case 'native':
            return chalk_1.default.green('Native support');
        case 'hook':
            return chalk_1.default.yellow('Hook-based');
        case 'external':
            return chalk_1.default.blue('External integration');
        default:
            return chalk_1.default.gray('Unknown');
    }
}

async function generateUsageInstructions(projectPath, selectedCLIs) {
    const instructions = `# ResumeSession Integration

This project is configured for cross-CLI session recovery with ResumeSession.

## Supported CLI Tools
${selectedCLIs.map(cli => `- ${cli}`).join('\n')}

## Usage

In any of the supported CLI tools, use the following commands:

### Basic Commands
- \`/history\` - Show all project sessions (most recent first)
- \`/history --cli <tool>\` - Show sessions from specific CLI
- \`/history --search <keyword>\` - Search sessions by content
- \`/history --limit <number>\` - Limit number of sessions shown

### Time-based Filtering
- \`/history --today\` - Show today's sessions only
- \`/history --week\` - Show sessions from last 7 days
- \`/history --month\` - Show sessions from last 30 days

### View Formats
- \`/history --format summary\` - Summary view (default)
- \`/history --format timeline\` - Chronological timeline
- \`/history --format detailed\` - Detailed session information
- \`/history --format context\` - Get context to continue conversation

### Examples
\`\`\`bash
# Show all React-related sessions
/history --search "react"

# Show recent Claude sessions
/history --cli claude --today

# Get context from most recent session
/history --format context

# Show timeline of all sessions
/history --format timeline
\`\`\`

## Features
- �?Cross-CLI session discovery
- �?Project-aware filtering
- �?Time-based sorting (most recent first)
- �?Content search
- �?Context recovery
- �?Multiple view formats

## Configuration
Configuration is saved in \`.resumesession\` file in project root.

## Need Help?
Run \`resumesession --help\` for more commands.
`;
    const readmePath = (0, path_1.join)(projectPath, 'RESUMESESSION.md');
    (0, fs_1.writeFileSync)(readmePath, instructions);
}

//# sourceMappingURL=init.js.map
