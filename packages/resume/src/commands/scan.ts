import chalk from 'chalk';
import { CLIScanner } from '../utils/CLIScanner';
import { ScanOptions, CLIInfo } from '../types';

export async function scanCommand(options: ScanOptions): Promise<void> {
  console.log(chalk.blue.bold('🔍 Scanning for CLI Tools\n'));

  const scanner = CLIScanner.getInstance();
  const allCLIs = await scanner.scanAllCLIs();  // 需要实现扫描所有CLI（包括不可用的）

  if (allCLIs.length === 0) {
    console.log(chalk.red('❌ No CLI tools found on this system.'));
    return;
  }

  console.log(chalk.blue(`📋 Found ${allCLIs.length} CLI tools:\n`));

  const availableCount = allCLIs.filter(cli => cli.available).length;

  allCLIs.forEach((cli: CLIInfo, index: number) => {
    const status = cli.available ? chalk.green('✅ Available') : chalk.red('❌ Not Found');
    const integration = getIntegrationLevelText(cli.integrationLevel);

    console.log(`${chalk.bold(`${index + 1}. ${cli.displayName}`)} ${status}`);

    if (options.verbose) {
      console.log(`   Name: ${cli.name}`);
      if (cli.version) console.log(`   Version: ${cli.version}`);
      if (cli.installedPath) console.log(`   Path: ${cli.installedPath}`);
      if (cli.configPath) console.log(`   Config: ${cli.configPath}`);
      if (cli.sessionsPath) console.log(`   Sessions: ${cli.sessionsPath}`);
    }

    console.log(`   Integration: ${integration}`);
    console.log('');
  });

  // 显示摘要
  console.log(chalk.blue('📊 Summary:'));
  console.log(`   Total CLI tools: ${allCLIs.length}`);
  console.log(`   Available: ${chalk.green(availableCount)}`);
  console.log(`   Not installed: ${chalk.red(allCLIs.length - availableCount)}`);

  // Show recommendations
  if (availableCount > 0) {
    console.log('\n' + chalk.green('✅ Ready to initialize ResumeSession!'));
    console.log(chalk.gray('   Run') + chalk.cyan(' resumesession init') + chalk.gray(' to set up cross-CLI session recovery.'));
  } else {
    console.log('\n' + chalk.yellow('⚠️  Install at least one supported CLI tool to use ResumeSession:'));
    console.log(chalk.gray('   Claude CLI: npm install -g @anthropic-ai/claude-code'));
    console.log(chalk.gray('   Gemini CLI: npm install -g @google/gemini-cli'));
    console.log(chalk.gray('   And more...'));
  }
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