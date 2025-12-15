import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { CLIScanner } from '../utils/CLIScanner';
import { CodeGenerator } from '../utils/CodeGenerator';
import { ShareMemConfig, InitOptions } from '../types';

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.blue.bold('🚀 Initializing ResumeSession for cross-CLI session recovery\n'));

  // Check current directory
  const currentDir = process.cwd();
  const configPath = join(currentDir, '.resumesession');

  if (existsSync(configPath) && !options.force) {
    console.log(chalk.yellow('⚠️  ResumeSession already initialized in this project.'));
    console.log(chalk.gray(`   Config file: ${configPath}`));

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to reinitialize?',
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.gray('❌ Initialization cancelled.'));
      return;
    }
  }

  // Scan all CLI tools (including unavailable)
  console.log(chalk.blue('🔍 Scanning for CLI tools...'));
  const scanner = CLIScanner.getInstance();
  const allCLIs = await scanner.scanAvailableCLIs();

  if (allCLIs.length === 0) {
    console.log(chalk.red('❌ No supported CLI tools found on this system.'));
    return;
  }

  // Categorize display
  const availableCLIs = allCLIs.filter(cli => cli.available);
  const unavailableCLIs = allCLIs.filter(cli => !cli.available);

  console.log(chalk.blue(`\n📋 Found ${allCLIs.length} CLI tools:\n`));

  // Display available CLIs
  if (availableCLIs.length > 0) {
    console.log(chalk.green.bold(`✅ Available (${availableCLIs.length}):`));
    availableCLIs.forEach((cli, index) => {
      const integration = getIntegrationLevelText(cli.integrationLevel);
      console.log(`   ${index + 1}. ${chalk.bold(cli.displayName)} ${chalk.green('✅')}`);
      console.log(`      Version: ${cli.version || 'unknown'}`);
      console.log(`      Integration: ${integration}`);
      if (cli.sessionsPath) {
        console.log(`      Sessions: ${cli.sessionsPath}`);
      }
      console.log('');
    });
  }

  // Display unavailable CLIs
  if (unavailableCLIs.length > 0) {
    console.log(chalk.yellow.bold(`❌ Not Available (${unavailableCLIs.length}):`));
    unavailableCLIs.forEach((cli, index) => {
      const integration = getIntegrationLevelText(cli.integrationLevel);
      console.log(`   ${index + 1}. ${chalk.bold(cli.displayName)} ${chalk.red('❌')}`);
      console.log(`      Integration: ${integration}`);
      console.log(`      Tip: Install with npm or check PATH`);
      console.log('');
    });
  }

  if (availableCLIs.length === 0) {
    console.log(chalk.red('\n❌ No available CLI tools found.'));
    console.log(chalk.gray('   Please install at least one supported CLI tool:'));
    console.log(chalk.gray('   - Claude CLI: npm install -g @anthropic-ai/claude-code'));
    console.log(chalk.gray('   - Gemini CLI: npm install -g @google/gemini-cli'));
    console.log(chalk.gray('   - And more...'));
    return;
  }

  
  // Select CLI tools to integrate
  const { selectedCLIs } = await inquirer.prompt([
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
    console.log(chalk.gray('❌ No CLI tools selected. Initialization cancelled.'));
    return;
  }

  // Validate selected CLI tools
  console.log(chalk.blue('\n🔧 Validating selected CLI tools...'));
  const validCLIs: string[] = [];

  for (const cliName of selectedCLIs) {
    const isValid = await scanner.validateCLIForCrossCLI(cliName);
    if (isValid) {
      validCLIs.push(cliName);
      console.log(chalk.green(`   ✅ ${cliName} is ready for cross-CLI integration`));
    } else {
      console.log(chalk.yellow(`   ⚠️  ${cliName} may have limited functionality`));
      // Still add to list but with possible limited functionality
      validCLIs.push(cliName);
    }
  }

  // Create configuration
  const config: ShareMemConfig = {
    projectPath: currentDir,
    selectedCLIs: validCLIs,
    initializedAt: new Date(),
    version: require('../../package.json').version
  };

  // Save configuration
  console.log(chalk.blue('\n💾 Saving configuration...'));
  mkdirSync(currentDir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Generate integration code
  console.log(chalk.blue('🔨 Generating integration code...'));
  const codeGenerator = new CodeGenerator();

  for (const cliName of validCLIs) {
    try {
      await codeGenerator.generateIntegration(cliName, currentDir, config);
      console.log(chalk.green(`   ✅ Generated integration for ${cliName}`));
    } catch (error) {
      console.log(chalk.red(`   ❌ Failed to generate integration for ${cliName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  // Create usage instructions
  await generateUsageInstructions(currentDir, validCLIs);

  // Completion
  console.log(chalk.green.bold('\n🎉 ResumeSession initialization completed successfully!\n'));

  console.log(chalk.bold('📋 Next steps:'));
  console.log('1. Open your preferred CLI tool in this project directory');
  console.log('2. Try the /history command to see cross-CLI sessions');
  console.log(`3. Configuration saved to: ${chalk.gray(configPath)}`);
  console.log(`4. Run ${chalk.cyan('resumesession status')} to check integration status\n`);

  console.log(chalk.bold('💡 Example commands:'));
  console.log(`   ${chalk.cyan('/history')} - Show all project sessions`);
  console.log(`   ${chalk.cyan('/history --cli <tool>')} - Show sessions from specific CLI`);
  console.log(`   ${chalk.cyan('/history --search <keyword>')} - Search for content`);
  console.log(`   ${chalk.cyan('/history --format timeline')} - Timeline view`);
  console.log(`   ${chalk.cyan('/history --context')} - Get context for continuation\n`);

  console.log(chalk.gray('📚 For more information, run: resumesession --help'));
}

function getIntegrationLevelText(level: string): string {
  switch (level) {
    case 'native':
      return chalk.green('Native support');
    case 'hook':
      return chalk.yellow('Hook-based');
    case 'external':
      return chalk.blue('External integration');
    default:
      return chalk.gray('Unknown');
  }
}

async function generateUsageInstructions(projectPath: string, selectedCLIs: string[]): Promise<void> {
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
- ✅ Cross-CLI session discovery
- ✅ Project-aware filtering
- ✅ Time-based sorting (most recent first)
- ✅ Content search
- ✅ Context recovery
- ✅ Multiple view formats

## Configuration
Configuration is saved in \`.resumesession\` file in project root.

## Need Help?
Run \`resumesession --help\` for more commands.
`;

  const readmePath = join(projectPath, 'RESUMESESSION.md');
  writeFileSync(readmePath, instructions);
}