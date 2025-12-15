#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { statusCommand } from './commands/status';
import { scanCommand } from './commands/scan';
import { version } from '../package.json';

const program = new Command();

program
  .name('resumesession')
  .description('Cross-CLI memory sharing and session recovery')
  .version(version);

program
  .command('init')
  .description('Initialize ResumeSession in current project')
  .option('-f, --force', 'Force reinitialization')
  .action(async (options) => {
    try {
      await initCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show ResumeSession status in current project')
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('Scan available CLI tools on this system')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      await scanCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Scan failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.yellow('Available commands: init, status, scan'));
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}