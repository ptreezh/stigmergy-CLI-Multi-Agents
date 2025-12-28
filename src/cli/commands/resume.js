/**
 * Resume Session Commands
 * Modular implementation for resume command
 */

const chalk = require('chalk');
const { spawnSync } = require('child_process');
const { getCLIPath } = require('../../core/cli_tools');

/**
 * Handle resume session command - Forward to @stigmergy/resume CLI tool
 * @param {Array} args - Arguments to pass to resumesession
 * @param {Object} options - Command options
 */
async function handleResumeCommand(args = [], options = {}) {
  try {
    console.log(chalk.blue('[RESUME] Checking for ResumeSession CLI tool...'));

    // Check if resumesession command is available
    const resumesessionPath = await getCLIPath('resumesession');

    if (resumesessionPath) {
      console.log(chalk.green(`[RESUME] Found ResumeSession at: ${resumesessionPath}`));

      // Forward all arguments to the resumesession CLI tool
      const resumeArgs = args; // Pass all arguments through
      console.log(chalk.blue(`[RESUME] Forwarding to resumesession: ${resumeArgs.join(' ') || '(no args)'}`));

      // Execute resumesession with the provided arguments
      const result = spawnSync(resumesessionPath, resumeArgs, {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '1' } // Ensure colors are preserved
      });

      if (result.status !== 0) {
        console.log(chalk.yellow(`[WARN] ResumeSession exited with code ${result.status}`));
        return { success: false, exitCode: result.status, forwarded: true };
      }

      return { success: true, exitCode: result.status, forwarded: true };

    } else {
      // ResumeSession CLI tool not found
      console.log(chalk.red('[ERROR] ResumeSession CLI tool not found'));
      console.log(chalk.yellow('[INFO] ResumeSession is an optional component for session recovery'));

      console.log(chalk.blue('\n📦 To install ResumeSession:'));
      console.log('  npm install -g resumesession');
      console.log('');
      console.log(chalk.blue('🔧 ResumeSession provides:'));
      console.log('  • Cross-CLI session history');
      console.log('  • Memory sharing between CLI tools');
      console.log('  • Session recovery and continuation');
      console.log('  • Centralized configuration management');
      console.log('');
      console.log(chalk.blue('📋 Usage examples:'));
      console.log('  stigmergy resume list                    # Show session history');
      console.log('  stigmergy resume continue <session-id>    # Continue a session');
      console.log('  stigmergy resume export                   # Export session data');
      console.log('  stigmergy resume --help                   # Show all options');

      return { success: false, error: 'ResumeSession CLI tool not found', forwarded: false };
    }

  } catch (error) {
    console.error(chalk.red('[ERROR] Resume command failed:'), error.message);

    if (options.verbose) {
      console.error(chalk.red('Stack trace:'), error.stack);
    }

    return { success: false, error: error.message, forwarded: false };
  }
}

/**
 * Handle resumesession command alias
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleResumeSessionCommand(args = [], options = {}) {
  return await handleResumeCommand(args, options);
}

/**
 * Handle sg-resume command alias
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSgResumeCommand(args = [], options = {}) {
  return await handleResumeCommand(args, options);
}

/**
 * Print resume help information
 */
function printResumeHelp() {
  console.log(chalk.cyan(`
🔄 Stigmergy Resume Session System

📋 ResumeSession forwards to the resumesession CLI tool for session management.

🛠️  Available Commands:
  stigmergy resume [args]              Forward to resumesession CLI

📦 Requirements:
  resumesession CLI tool must be installed separately.

💾 Installation:
  npm install -g resumesession

🔍 Common Usage:
  stigmergy resume list                # Show available sessions
  stigmergy resume continue <id>       # Continue a specific session
  stigmergy resume export              # Export session data
  stigmergy resume clean               # Clean old sessions

📚 More Information:
  ResumeSession provides cross-CLI memory sharing and session recovery
  capabilities, allowing you to maintain context across different AI CLI tools.

  If ResumeSession is not installed, you can still use all other Stigmergy
  CLI features normally.
  `));
}

module.exports = {
  handleResumeCommand,
  handleResumeSessionCommand,
  handleSgResumeCommand,
  printResumeHelp
};