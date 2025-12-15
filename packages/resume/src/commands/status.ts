import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { CLIScanner } from '../utils/CLIScanner';

export async function statusCommand(): Promise<void> {
  console.log(chalk.blue.bold('📊 ResumeSession Status\n'));

  // Check configuration file
  const currentDir = process.cwd();
  const configPath = join(currentDir, '.resumesession');

  if (!existsSync(configPath)) {
    console.log(chalk.red('❌ ResumeSession not initialized in this project.'));
    console.log(chalk.gray('   Run') + chalk.cyan(' resumesession init') + chalk.gray(' to initialize.'));
    return;
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    console.log(chalk.green('✅ ResumeSession initialized'));
    console.log(chalk.gray(`   Project: ${currentDir}`));
    console.log(chalk.gray(`   Version: ${config.version}`));
    console.log(chalk.gray(`   Initialized: ${new Date(config.initializedAt).toLocaleString()}\n`));

    // Show integrated CLI tools
    console.log(chalk.blue('🔧 Integrated CLI Tools:'));

    if (config.selectedCLIs.length === 0) {
      console.log(chalk.yellow('   No CLI tools selected'));
    } else {
      const scanner = CLIScanner.getInstance();
      const availableCLIs = await scanner.scanAvailableCLIs();

      config.selectedCLIs.forEach((cliName: string) => {
        const cliInfo = availableCLIs.find(cli => cli.name === cliName);
        if (cliInfo && cliInfo.available) {
          console.log(chalk.green(`   ✅ ${cliInfo.displayName} (${cliInfo.version})`));
        } else {
          console.log(chalk.red(`   ❌ ${cliName} (not available)`));
        }
      });
    }

    console.log('\n' + chalk.blue('📁 Integration Files:'));

    // Check integration files
    const integrationPaths = {
      claude: join(currentDir, '.claude', 'hooks', 'resumesession-history.js'),
      gemini: join(currentDir, '.gemini', 'extensions', 'resumesession-history.js'),
      qwen: join(currentDir, '.qwen', 'plugins', 'resumesession-history.js'),
      iflow: join(currentDir, 'stigmergy', 'commands', 'history.js')
    };

    let foundFiles = 0;
    Object.entries(integrationPaths).forEach(([cli, path]) => {
      if (existsSync(path)) {
        console.log(chalk.green(`   ✅ ${cli.toUpperCase()}: ${path}`));
        foundFiles++;
      } else if (config.selectedCLIs.includes(cli)) {
        console.log(chalk.yellow(`   ⚠️  ${cli.toUpperCase()}: Missing integration file`));
      }
    });

    if (foundFiles === 0) {
      console.log(chalk.gray('   No integration files found'));
    }

    // Show usage hints
    console.log('\n' + chalk.blue('💡 Usage:'));
    console.log('   In any integrated CLI tool, run:');
    console.log(chalk.cyan('     /history') + chalk.gray(' - Show project history'));
    console.log(chalk.cyan('     /history --help') + chalk.gray(' - Show command help'));

    // Show status statistics
    console.log('\n' + chalk.blue('📈 Statistics:'));
    console.log(`   Integrated CLIs: ${config.selectedCLIs.length}`);
    console.log(`   Integration files: ${foundFiles}`);

  } catch (error) {
    console.log(chalk.red('❌ Failed to read configuration:'), error instanceof Error ? error.message : String(error));
  }
}