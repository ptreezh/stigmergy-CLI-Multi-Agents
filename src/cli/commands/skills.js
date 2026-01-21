/**
 * Skills Management Commands
 * Modular implementation for all skill-related commands
 */

const chalk = require('chalk');
const { handleSkillCommand } = require('../../commands/skill-handler');

/**
 * Handle main skill command with all subcommands
 * @param {string} subcommand - Skill subcommand (install/list/read/remove/validate/sync)
 * @param {Array} args - Additional arguments
 * @param {Object} options - Command options
 */
async function handleSkillMainCommand(subcommand, args = [], options = {}) {
  try {
    // Handle skill command aliases from router-beta.js
    let action;
    let skillArgs;

    switch (subcommand) {
      case 'skill-i':
        action = 'install';
        skillArgs = args;
        break;
      case 'skill-l':
        action = 'list';
        skillArgs = args;
        break;
      case 'skill-v':
        // skill-v can be validate or read, based on parameters
        action = args[0] && (args[0].endsWith('.md') || args[0].includes('/') || args[0].includes('\\'))
          ? 'validate'
          : 'read';
        skillArgs = args;
        break;
      case 'skill-r':
        action = 'read';
        skillArgs = args;
        break;
      case 'skill-d':
      case 'skill-m':
        action = 'remove';
        skillArgs = args;
        break;
      default:
        action = subcommand || 'help';
        skillArgs = args;
        break;
    }

    const exitCode = await handleSkillCommand(action, skillArgs, {
      verbose: options.verbose || false,
      force: options.force || false,
      autoSync: !options.noAutoSync
    });

    return { success: exitCode === 0, exitCode };
  } catch (error) {
    console.error(chalk.red(`[ERROR] Skill command failed: ${error.message}`));
    return { success: false, error: error.message };
  }
}

/**
 * Handle skill install command (skill-i alias)
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSkillInstallCommand(args = [], options = {}) {
  return await handleSkillMainCommand('install', args, options);
}

/**
 * Handle skill list command (skill-l alias)
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSkillListCommand(args = [], options = {}) {
  return await handleSkillMainCommand('list', args, options);
}

/**
 * Handle skill read command (skill-r alias)
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSkillReadCommand(args = [], options = {}) {
  return await handleSkillMainCommand('read', args, options);
}

/**
 * Handle skill validate/read command (skill-v alias)
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSkillValidateCommand(args = [], options = {}) {
  return await handleSkillMainCommand('validate', args, options);
}

/**
 * Handle skill remove command (skill-d, skill-m aliases)
 * @param {Array} args - Arguments
 * @param {Object} options - Options
 */
async function handleSkillRemoveCommand(args = [], options = {}) {
  return await handleSkillMainCommand('remove', args, options);
}

/**
 * Print skills help information
 */
function printSkillsHelp() {
  console.log(chalk.cyan(`
🎯 Stigmergy Skills Management System

📋 Available Commands:
  stigmergy skill install <source>     Install a skill from source
  stigmergy skill list                 List all installed skills
  stigmergy skill read <skill-name>    Read skill content and description
  stigmergy skill validate <path>      Validate skill file or directory
  stigmergy skill remove <skill-name>  Remove installed skill
  stigmergy skill sync                 Sync skills with remote repositories

🔗 Aliases (Shortcuts):
  skill-i       → skill install
  skill-l       → skill list
  skill-r       → skill read
  skill-v       → skill validate/read (auto-detect)
  skill-d       → skill remove
  skill-m       → skill remove (移除)

💡 Examples:
  stigmergy skill install anthropics/skills
  stigmergy skill-i anthropics/skills          # Using alias
  stigmergy skill list
  stigmergy skill-l                           # Using alias
  stigmergy skill read canvas-design
  stigmergy skill-v ./my-skill.md             # Validate file
  stigmergy skill-r docx                      # Using alias
  stigmergy skill remove old-skill
  stigmergy skill-d old-skill                 # Using alias

📚 More Information:
  Skills extend CLI tool capabilities with specialized workflows and tools.
  Each skill contains instructions for specific tasks and integrations.
  `));
}

module.exports = {
  handleSkillMainCommand,
  handleSkillInstallCommand,
  handleSkillListCommand,
  handleSkillReadCommand,
  handleSkillValidateCommand,
  handleSkillRemoveCommand,
  printSkillsHelp
};