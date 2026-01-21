/**
 * Scan Command Module
 * Handles CLI tool scanning and discovery commands
 */

const { CLI_TOOLS } = require('../../core/cli_tools');
const chalk = require('chalk');
const { ensureSkillsCache } = require('../utils/skills_cache');

/**
 * Handle scan command
 * @param {Object} options - Command options
 * @param {boolean} options.deep - Deep scan for CLI tools
 * @param {boolean} options.json - Output in JSON format
 * @param {boolean} options.verbose - Verbose output
 */
async function handleScanCommand(options = {}) {
  try {
    // Initialize or update skills/agents cache
    await ensureSkillsCache({ verbose: options.verbose });

    console.log(chalk.blue('🔍 Scanning for CLI tools...'));

    const scanOptions = {
      deep: options.deep || false,
      verbose: options.verbose || false
    };

    // Scan for available CLI tools
    const results = await CLI_TOOLS.scanForTools(scanOptions);

    if (results.found && results.found.length > 0) {
      console.log(chalk.green(`\n✅ Found ${results.found.length} CLI tools:`));

      for (const tool of results.found) {
        console.log(chalk.cyan(`  📦 ${tool.name}`));
        console.log(chalk.gray(`     Version: ${tool.version || 'unknown'}`));
        console.log(chalk.gray(`     Path: ${tool.path}`));

        if (options.verbose) {
          console.log(chalk.gray(`     Type: ${tool.type}`));
          console.log(chalk.gray(`     Status: ${tool.status}`));
          if (tool.description) {
            console.log(chalk.gray(`     Description: ${tool.description}`));
          }
        }
      }
    } else {
      console.log(chalk.yellow('\n⚠️  No CLI tools found'));
    }

    // Show missing tools
    if (results.missing && results.missing.length > 0) {
      console.log(chalk.yellow(`\n❌ Missing ${results.missing.length} tools:`));
      results.missing.forEach(tool => {
        console.log(chalk.red(`  ❌ ${tool}`));
      });

      console.log(chalk.cyan('\n💡 To install missing tools:'));
      console.log(chalk.cyan('   stigmergy install'));
    }

    // Summary
    console.log('');
    console.log(chalk.blue('📊 Scan Summary:'));
    console.log(`  Total tools checked: ${results.total || 0}`);
    console.log(`  Found: ${results.found?.length || 0}`);
    console.log(`  Missing: ${results.missing?.length || 0}`);

    if (options.json) {
      console.log('');
      console.log(chalk.blue('📄 JSON Output:'));
      console.log(JSON.stringify(results, null, 2));
    }

    // Recommendations
    if (results.found && results.found.length > 0) {
      console.log(chalk.cyan('\n💡 You can now use these tools:'));
      const toolExamples = results.found.slice(0, 3);
      toolExamples.forEach(tool => {
        console.log(chalk.cyan(`   stigmergy ${tool.name} "your prompt here"`));
      });

      if (results.found.length > 3) {
        console.log(chalk.cyan(`   ... and ${results.found.length - 3} more tools`));
      }
    }

  } catch (error) {
    console.log(chalk.red(`❌ Scan failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  handleScanCommand
};