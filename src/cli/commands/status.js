/**
 * Status Command Module
 * Handles CLI tool status checking commands
 */

const { CLI_TOOLS } = require('../../core/cli_tools');
const chalk = require('chalk');
const { formatToolStatus } = require('../utils/formatters');

/**
 * Handle status command
 * @param {Object} options - Command options
 * @param {string} options.cli - Specific CLI to check
 * @param {boolean} options.json - Output in JSON format
 * @param {boolean} options.verbose - Verbose output
 */
async function handleStatusCommand(options = {}) {
  try {
    const supportedTools = ['claude', 'gemini', 'qwen', 'codebuddy', 'codex', 'iflow', 'qodercli', 'copilot'];

    if (options.cli) {
      // Check specific CLI
      if (!supportedTools.includes(options.cli)) {
        console.log(chalk.red(`❌ Unknown CLI tool: ${options.cli}`));
        console.log(chalk.yellow(`Supported tools: ${supportedTools.join(', ')}`));
        process.exit(1);
      }

      try {
        const status = await CLI_TOOLS.checkInstallation(options.cli);

        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
        } else {
          console.log(chalk.cyan(`📊 ${options.cli} Status:`));
          console.log(formatToolStatus({ ...status, tool: options.cli }));

          if (options.verbose && status.installed) {
            if (status.version) {
              console.log(chalk.gray(`   📦 Version: ${status.version}`));
            }
            if (status.path) {
              console.log(chalk.gray(`   📍 Path: ${status.path}`));
            }
            if (status.lastChecked) {
              console.log(chalk.gray(`   🕐 Last checked: ${status.lastChecked}`));
            }
          }
        }
      } catch (error) {
        console.log(chalk.red(`❌ Error checking ${options.cli}: ${error.message}`));
        process.exit(1);
      }
    } else {
      // Check all CLIs
      console.log(chalk.cyan('📊 CLI Tools Status:'));

      let installedCount = 0;
      const results = [];

      for (const tool of supportedTools) {
        try {
          const status = await CLI_TOOLS.checkInstallation(tool);
          results.push({ tool, ...status });

          if (status.installed) {
            installedCount++;
            console.log(chalk.green(`  ✅ ${tool}`));
          } else {
            console.log(chalk.red(`  ❌ ${tool}`));
          }
        } catch (error) {
          results.push({ tool, installed: false, error: error.message });
          console.log(chalk.yellow(`  ⚠️  ${tool}: Error checking status`));
        }
      }

      // Summary
      console.log('');
      console.log(chalk.blue(`📈 Summary: ${installedCount}/${supportedTools.length} tools installed`));

      if (installedCount < supportedTools.length) {
        console.log(chalk.yellow('\n💡 To install missing tools, run:'));
        console.log(chalk.cyan('   stigmergy install'));

        const missing = results.filter(r => !r.installed);
        if (missing.length > 0 && missing.length < supportedTools.length) {
          console.log(chalk.cyan(`   stigmergy install --cli ${missing.map(r => r.tool).join(',')}`));
        }
      }

      if (options.json) {
        console.log('');
        console.log(chalk.blue('📄 Detailed JSON output:'));
        console.log(JSON.stringify(results, null, 2));
      }
    }
  } catch (error) {
    console.log(chalk.red(`❌ Status check failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  handleStatusCommand
};