#!/usr/bin/env node

import { Command } from 'commander';
import { SessionScanner } from './core/SessionScanner';
import { CLIDiscovery } from './core/CLIDiscovery';
import { SessionExporter } from './core/SessionExporter';
import { SlashCommandInstaller } from './integrations/SlashCommandInstaller';
import { DirectCLIExtensions } from './integrations/DirectCLIExtensions';
import { Logger, LogLevel } from './utils/Logger';
import chalk from 'chalk';

const program = new Command();

program
  .name('cross-cli-session-recovery')
  .description('Cross-CLI Session History Management and Recovery')
  .version('1.0.0');

// Initialize CLI discovery
const cliDiscovery = CLIDiscovery.getInstance();
const availableAdapters = cliDiscovery.getAvailableAdapters();
const scanner = new SessionScanner(availableAdapters);
const exporter = new SessionExporter();

program
  .command('list')
  .description('List all sessions from available CLI tools')
  .option('--cli <type>', 'Filter by CLI type')
  .option('--project <path>', 'Filter by project path')
  .option('--search <keyword>', 'Search sessions by keyword')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Scanning for CLI sessions...\n'));

      let sessions;
      if (options.search) {
        sessions = await scanner.searchSessions(options.search, {
          cliType: options.cli ? [options.cli] : undefined,
          projectPath: options.project
        });
      } else if (options.cli) {
        sessions = await scanner.scanSessionsByCLI(options.cli);
      } else if (options.project) {
        sessions = await scanner.scanSessionsByProject(options.project);
      } else {
        sessions = await scanner.scanAllSessions();
      }

      if (sessions.length === 0) {
        console.log(chalk.yellow('No sessions found.'));
        return;
      }

      console.log(chalk.green(`Found ${sessions.length} sessions:\n`));

      sessions.forEach((session, index) => {
        console.log(`${chalk.cyan(index + 1)}. ${chalk.bold(session.metadata.sessionId)}`);
        console.log(`   CLI: ${chalk.yellow(session.metadata.cliType)}`);
        console.log(`   Project: ${session.metadata.projectPath}`);
        console.log(`   Messages: ${session.metadata.messageCount}`);
        console.log(`   Updated: ${session.metadata.updatedAt.toLocaleString()}`);
        console.log('');
      });

      // Show statistics
      const stats = await scanner.getSessionStatistics();
      console.log(chalk.blue('📊 Statistics:'));
      console.log(`   Total Sessions: ${stats.totalSessions}`);
      console.log(`   Total Messages: ${stats.totalMessages}`);
      console.log(`   Average Messages/Session: ${stats.averageMessagesPerSession.toFixed(1)}`);

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('export <sessionId>')
  .description('Export a session to various formats')
  .option('--format <format>', 'Export format (markdown, json, context)', 'markdown')
  .option('--output <file>', 'Output file path')
  .action(async (sessionId, options) => {
    try {
      console.log(chalk.blue(`📤 Exporting session ${sessionId}...\n`));

      const sessions = await scanner.scanAllSessions();
      const session = sessions.find(s => s.metadata.sessionId === sessionId);

      if (!session) {
        console.error(chalk.red(`Session "${sessionId}" not found.`));
        return;
      }

      const exported = await exporter.exportSession(session, options.format);

      if (options.output) {
        await require('fs-extra').writeFile(options.output, exported);
        console.log(chalk.green(`✅ Session exported to ${options.output}`));
      } else {
        console.log(exported);
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show session statistics')
  .action(async () => {
    try {
      const stats = await scanner.getSessionStatistics();

      console.log(chalk.blue('📊 Session Statistics\n'));
      console.log(chalk.cyan(`Total Sessions: ${stats.totalSessions}`));
      console.log(chalk.cyan(`Total Messages: ${stats.totalMessages}`));
      console.log(chalk.cyan(`Average Messages/Session: ${stats.averageMessagesPerSession.toFixed(1)}`));

      console.log(chalk.blue('\n🔧 By CLI Type:'));
      Object.entries(stats.byCLI).forEach(([cli, count]) => {
        console.log(`   ${cli}: ${count} sessions`);
      });

      console.log(chalk.blue('\n📁 By Project:'));
      Object.entries(stats.byProject).forEach(([project, count]) => {
        console.log(`   ${project}: ${count} sessions`);
      });

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('discover')
  .description('Discover and list all available CLI tools')
  .option('--refresh', 'Force refresh of CLI discovery')
  .option('--all', 'Include unavailable CLI tools')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Discovering CLI Tools...\n'));

      if (options.refresh) {
        await cliDiscovery.discoverAllCLIs();
      }

      const discoveredCLIs = options.all
        ? cliDiscovery.getAllDiscoveredCLIs()
        : cliDiscovery.getAvailableCLIs();

      if (discoveredCLIs.length === 0) {
        console.log(chalk.yellow('No CLI tools discovered.'));
        return;
      }

      console.log(chalk.green(`Found ${discoveredCLIs.length} CLI tools:\n`));

      discoveredCLIs.forEach((cli, index) => {
        const status = cli.available
          ? chalk.green('✅ Available')
          : chalk.red('❌ Unavailable');

        console.log(`${chalk.cyan(index + 1)}. ${chalk.bold(cli.name)} (${cli.cliType})`);
        console.log(`   Status: ${status}`);
        console.log(`   Version: ${cli.version}`);
        console.log(`   Session paths: ${cli.sessionPaths.length}`);
        console.log(`   Last checked: ${cli.lastChecked.toLocaleString()}`);
        console.log('');
      });

      // Show discovery statistics
      const stats = cliDiscovery.getDiscoveryStats();
      console.log(chalk.blue('📊 Discovery Statistics:'));
      console.log(`   Total CLI tools: ${stats.total}`);
      console.log(`   Available: ${stats.available}`);
      console.log(`   Unavailable: ${stats.unavailable}`);

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate detailed discovery report')
  .action(async () => {
    try {
      const report = cliDiscovery.generateDiscoveryReport();
      console.log(report);

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('install-slash')
  .description('Install /history slash commands for CLI tools')
  .option('--cli <type>', 'Install for specific CLI tool (claude, gemini, qwen, iflow, etc.)')
  .option('--all', 'Install for all available CLI tools')
  .option('--status', 'Check installation status')
  .option('--uninstall', 'Uninstall slash commands')
  .option('--report', 'Generate installation report')
  .action(async (options) => {
    try {
      const installer = SlashCommandInstaller.getInstance();

      if (options.status) {
        console.log(chalk.blue('🔍 Checking slash command installation status...\n'));

        const status = await installer.checkAllStatus();
        console.log(chalk.blue('Slash Commands Status:'));

        for (const [cliType, info] of status) {
          const icon = info.installed ? chalk.green('✅') : chalk.red('❌');
          console.log(`   ${icon} ${cliType.toUpperCase()}: ${info.status}`);
        }
        return;
      }

      if (options.report) {
        console.log(chalk.blue('📋 Generating installation report...\n'));
        const report = await installer.generateReport();
        console.log(report);
        return;
      }

      if (options.uninstall) {
        console.log(chalk.blue('🗑️  Uninstalling slash commands...\n'));

        if (options.cli) {
          const success = await installer.uninstallForCLI(options.cli);
          if (success) {
            console.log(chalk.green(`✅ Uninstalled slash commands for ${options.cli}`));
          } else {
            console.log(chalk.red(`❌ Failed to uninstall slash commands for ${options.cli}`));
            process.exit(1);
          }
        } else {
          const results = await installer.uninstallForAll();
          console.log(chalk.blue('Uninstallation Results:'));
          console.log(`   ${chalk.green('✅ Success:')} ${results.success.join(', ')}`);
          if (results.failed.length > 0) {
            console.log(`   ${chalk.red('❌ Failed:')} ${results.failed.join(', ')}`);
          }
        }
        return;
      }

      if (options.all) {
        console.log(chalk.blue('🚀 Installing slash commands for all CLI tools...\n'));
        const results = await installer.installForAll();

        console.log(chalk.blue('Installation Results:'));
        console.log(`   ${chalk.green('✅ Successfully installed:')} ${results.success.join(', ')}`);
        if (results.failed.length > 0) {
          console.log(`   ${chalk.red('❌ Failed to install:')} ${results.failed.join(', ')}`);
        }

        if (results.success.length > 0) {
          console.log(chalk.green('\n🎉 You can now use /history commands in your CLI tools!'));
          console.log(chalk.blue('💡 Try: /history --help'));
        }
        return;
      }

      if (options.cli) {
        console.log(chalk.blue(`🚀 Installing slash commands for ${options.cli}...\n`));
        const success = await installer.installForCLI(options.cli);

        if (success) {
          console.log(chalk.green(`✅ Slash commands installed for ${options.cli}`));
          console.log(chalk.blue(`💡 You can now use: /history --help`));
        } else {
          console.log(chalk.red(`❌ Failed to install slash commands for ${options.cli}`));
          process.exit(1);
        }
        return;
      }

      // Show available options
      console.log(chalk.blue('📝 Slash Command Installation Options:\n'));
      console.log('   Install for all CLI tools:');
      console.log(`     ${chalk.cyan('ccsr install-slash --all')}\n`);

      console.log('   Install for specific CLI:');
      console.log(`     ${chalk.cyan('ccsr install-slash --cli claude')}`);
      console.log(`     ${chalk.cyan('ccsr install-slash --cli gemini')}\n`);

      console.log('   Check installation status:');
      console.log(`     ${chalk.cyan('ccsr install-slash --status')}\n`);

      console.log('   Generate installation report:');
      console.log(`     ${chalk.cyan('ccsr install-slash --report')}\n`);

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('generate-extensions')
  .description('Generate /history slash command extensions for CLI tools')
  .option('--cli <type>', 'Generate extension for specific CLI (claude, gemini, qwen, iflow)')
  .option('--all', 'Generate extensions for all CLI tools')
  .option('--output <dir>', 'Output directory for generated files', './cli-extensions')
  .option('--print', 'Print extension code to console')
  .option('--save', 'Save extensions to files')
  .action(async (options) => {
    try {
      const extensions = DirectCLIExtensions.getInstance();

      if (options.cli) {
        console.log(chalk.blue(`🔧 Generating extension for ${options.cli}...\n`));

        const extensionCode = extensions.generateGenericExtension(options.cli);

        if (options.print) {
          console.log(chalk.blue(`${options.cli.toUpperCase()} Extension Code:`));
          console.log('─'.repeat(50));
          console.log(extensionCode);
          console.log('─'.repeat(50));
        }

        if (options.save) {
          const fs = require('fs-extra');
          await fs.ensureDir(options.output);
          const filename = `${options.cli}-extension.js`;
          await fs.writeFile(`${options.output}/${filename}`, extensionCode);
          console.log(chalk.green(`✅ Extension saved to: ${options.output}/${filename}`));
        }

      } else if (options.all) {
        console.log(chalk.blue('🚀 Generating extensions for all CLI tools...\n'));

        const allExtensions = extensions.generateAllExtensions();

        for (const [cliType, code] of Object.entries(allExtensions)) {
          if (options.print) {
            console.log(chalk.blue(`${cliType.toUpperCase()} Extension:`));
            console.log('─'.repeat(50));
            console.log(code.substring(0, 500) + (code.length > 500 ? '...' : ''));
            console.log('─'.repeat(50));
            console.log('');
          }

          if (options.save) {
            const fs = require('fs-extra');
            await extensions.saveExtensions(options.output);
          }
        }

        if (options.save) {
          console.log(chalk.green(`✅ All extensions saved to: ${options.output}`));
        }

      } else {
        console.log(chalk.blue('📝 Available CLI Extensions:\n'));
        console.log('   • claude - Claude Code CLI');
        console.log('   • gemini - Google Gemini CLI');
        console.log('   • qwen - Alibaba Qwen CLI');
        console.log('   • iflow - IFlow/Stigmergy CLI');
        console.log('\n💡 Usage Examples:');
        console.log(`   ${chalk.cyan('ccsr generate-extensions --cli claude --print')}`);
        console.log(`   ${chalk.cyan('ccsr generate-extensions --all --save --output ./extensions')}`);
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('test-history')
  .description('Test /history slash command functionality')
  .option('--cli <type>', 'Test as specific CLI (claude, gemini, qwen, iflow)')
  .option('--input <command>', 'Test specific command', '/history')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧪 Testing /history slash command functionality...\n'));

      const { CrossCLISlashCommands } = require('./dist/lib');
      const slashCommands = CrossCLISlashCommands.getInstance();

      const testCommands = [
        '/history',
        '/history --limit 5',
        '/history --search "test"',
        '/history --format context',
        '/history --cli claude',
        '/history-help'
      ];

      const testInput = options.input || '/history';
      const cliType = options.cli || 'claude';

      console.log(chalk.blue(`Testing as ${cliType}: ${testInput}`));
      console.log('─'.repeat(60));

      const result = await slashCommands.handleHistoryCommand(testInput, cliType);

      console.log(chalk.green('✅ Result:'));
      console.log(result.content);

      if (result.suggestions && result.suggestions.length > 0) {
        console.log(chalk.blue('\n💡 Suggestions:'));
        result.suggestions.forEach((suggestion: string, index: number) => {
          console.log(`   ${index + 1}. ${suggestion}`);
        });
      }

      if (result.context) {
        console.log(chalk.blue('\n📊 Context:'));
        console.log(`   Command: ${result.context.command}`);
        console.log(`   CLI: ${result.context.cli}`);
        console.log(`   Sessions found: ${result.context.sessionCount || 'N/A'}`);
      }

      console.log('\n' + chalk.green('🎉 Test completed successfully!'));

    } catch (error) {
      console.error(chalk.red('❌ Test failed:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();