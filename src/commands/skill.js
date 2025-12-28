/**
 * Stigmergy Skill Commands
 * 
 * 技能管理命令（集成OpenSkills核心）
 */

import { StigmergySkillManager } from '../core/skills/StigmergySkillManager.js';

export async function handleSkillCommand(action, args, options = {}) {
    const manager = new StigmergySkillManager();

    try {
        switch (action) {
            case 'install':
                if (!args[0]) {
                    console.error('❌ Error: source required');
                    console.log('\nUsage: stigmergy skill install <source>');
                    console.log('Example: stigmergy skill install anthropics/skills');
                    process.exit(1);
                }
                await manager.install(args[0], options);
                break;

            case 'read':
                if (!args[0]) {
                    console.error('❌ Error: skill name required');
                    console.log('\nUsage: stigmergy skill read <skill-name>');
                    process.exit(1);
                }
                await manager.read(args[0]);
                break;

            case 'list':
                await manager.list();
                break;

            case 'sync':
                await manager.sync();
                break;

            case 'remove':
            case 'rm':
                if (!args[0]) {
                    console.error('[X] Error: skill name required');
                    console.log('\nUsage: stigmergy skill remove <skill-name>');
                    process.exit(1);
                }
                await manager.remove(args[0]);
                break;

            case 'validate':
                if (!args[0]) {
                    console.error('[X] Error: skill path or name required');
                    console.log('\nUsage: stigmergy skill validate <path-or-name>');
                    process.exit(1);
                }
                await manager.validate(args[0]);
                break;

            case 'help':
                printSkillHelp();
                break;

            default:
                console.error(`[X] Unknown skill action: ${action}`);
                console.log('\nRun: stigmergy skill help');
                process.exit(1);
        }
    } catch (err) {
        console.error(`\n[X] Command failed: ${err.message}`);
        process.exit(1);
    }
}

function printSkillHelp() {
    console.log(`
Stigmergy Skill Manager (Based on OpenSkills)

USAGE:
  stigmergy skill <action> [args] [options]

ACTIONS:
  install <source>     Install skills from GitHub
                       Example: stigmergy skill install anthropics/skills
                       
  read <name>          Read skill content (for AI agents)
                       Example: stigmergy skill read pdf
                       
  list                 List all installed skills
  
  sync                 Sync skills to AGENTS.md
  
  remove <name>        Remove installed skill
                       Example: stigmergy skill remove pdf
                       
  validate <path>      Validate skill format
                       Example: stigmergy skill validate ./my-skill/SKILL.md

OPTIONS:
  --force              Force overwrite existing skills
  --no-auto-sync       Don't auto-sync after install
  --verbose            Show detailed output

EXAMPLES:
  # Install skills from Anthropic
  stigmergy skill install anthropics/skills
  
  # List installed skills
  stigmergy skill list
  
  # Use a skill in Claude CLI
  claude> Bash("stigmergy skill read pdf")
  
  # Cross-CLI skill usage (requires stigmergy routing)
  qwen> "use claude's pdf skill to process doc.pdf"

SKILL LOCATIONS:
  ~/.stigmergy/skills/     Stigmergy unified storage
  ./.claude/skills/        Project Claude skills
  ~/.claude/skills/        Global Claude skills
  ./.agent/skills/         Universal project skills
  ~/.agent/skills/         Universal global skills

MORE INFO:
  https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
`);
}
