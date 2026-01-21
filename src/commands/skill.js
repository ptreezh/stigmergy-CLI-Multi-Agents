/**
 * Stigmergy Skill Commands
 *
 * 技能管理命令（集成OpenSkills核心）
 */

import { StigmergySkillManager } from '../core/skills/StigmergySkillManager.js';
import { EnhancedSkillManager, handleEnhancedSkillCommand } from './enhanced-skill-manager.js';
const SkillSyncManager = require('../core/skills/SkillSyncManager.js');

export async function handleSkillCommand(action, args, options = {}) {
    const manager = new StigmergySkillManager();
    const syncManager = new SkillSyncManager();

    try {
        switch (action) {
            // Enhanced skill management commands
            case 'list-collections':
            case 'collections':
            case 'presets':
            case 'search':
            case 'info':
            case 'describe':
                await handleEnhancedSkillCommand(action, args, options);
                break;

            // Standard skill management commands
            case 'install':
                if (!args[0]) {
                    console.error('❌ Error: source or skill collection name required');
                    console.log('\nUsage: stigmergy skill install <skill-collection|github-source>');
                    console.log('Example: stigmergy skill install anthropics');
                    console.log('Example: stigmergy skill install anthropics/skills');
                    console.log('\nUse "stigmergy skill list-collections" to see available collections.');
                    process.exit(1);
                }
                
                // Check if it's a predefined skill collection
                const { isPredefinedSkill, getPredefinedSkillInfo } = await import('./enhanced-skill-manager.js');
                
                if (await isPredefinedSkill(args[0])) {
                    console.log(`\n🚀 Installing predefined skill collection: ${args[0]}`);
                    const skillInfo = await getPredefinedSkillInfo(args[0]);
                    console.log(`🔗 Source: ${skillInfo.source}`);
                    if (skillInfo.tags) {
                        console.log(`🏷️  Tags: ${skillInfo.tags.join(', ')}`);
                    }
                    
                    await manager.install(skillInfo.source, options);
                } else {
                    // Regular GitHub source
                    await manager.install(args[0], options);
                }

                // Auto-sync to all CLI tools after installation
                if (options.sync !== false) {
                    console.log('\n🔄 Syncing skills to all CLI tools...');
                    await syncManager.syncAll({ force: options.force || false });
                }
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

            case 'sync-all':
                await syncManager.syncAll(options);
                break;

            case 'sync-to-cli':
                if (!args[0]) {
                    console.error('❌ Error: skill name required');
                    console.log('\nUsage: stigmergy skill sync-to-cli <skill-name>');
                    console.log('Example: stigmergy skill sync-to-cli pdf');
                    process.exit(1);
                }
                await syncManager.syncSkill(args[0], options);
                break;

            case 'sync-status':
                const report = await syncManager.getFullStatusReport();

                console.log('\n📊 Skill Deployment Status\n');
                console.log('='.repeat(60));

                if (report.totalSkills === 0) {
                    console.log('No skills installed.');
                    console.log('\nInstall skills first:');
                    console.log('  stigmergy skill install <collection-name>');
                    console.log('  stigmergy skill install <github-source>');
                    console.log('\nUse "stigmergy skill list-collections" to see available collections.');
                    break;
                }

                for (const [skillName, status] of Object.entries(report.skills)) {
                    console.log(`\n📦 ${skillName}:`);

                    for (const [cliName, cliStatus] of Object.entries(status)) {
                        if (!cliStatus.cliInstalled) {
                            console.log(`  ⊘ ${cliName}: CLI not installed`);
                        } else if (cliStatus.deployed) {
                            console.log(`  ✓ ${cliName}: deployed`);
                        } else {
                            console.log(`  ✗ ${cliName}: not deployed`);
                        }
                    }
                }

                console.log('\n' + '='.repeat(60));
                console.log(`\nTotal Skills: ${report.totalSkills}`);
                console.log(`Total CLIs: ${report.totalCLIs}\n`);
                break;

            case 'remove':
            case 'rm':
                if (!args[0]) {
                    console.error('[X] Error: skill name required');
                    console.log('\nUsage: stigmergy skill remove <skill-name>');
                    process.exit(1);
                }
                await manager.remove(args[0]);

                // Also remove from all CLI tools
                if (options.removeEverywhere || options.all) {
                    syncManager.removeAll(args[0]);
                }
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
                // Check if it's a predefined skill collection shortcut using the enhanced manager
                const { isPredefinedSkill, getPredefinedSkillInfo } = await import('./enhanced-skill-manager.js');
                
                if (await isPredefinedSkill(action)) {
                    // Treat as install command with the predefined collection
                    console.log(`\n🚀 Installing predefined skill collection: ${action}`);
                    const skillInfo = await getPredefinedSkillInfo(action);
                    console.log(`🔗 Source: ${skillInfo.source}`);
                    if (skillInfo.tags) {
                        console.log(`🏷️  Tags: ${skillInfo.tags.join(', ')}`);
                    }
                    
                    await manager.install(skillInfo.source, args[0] ? { source: args[0] } : options);
                    
                    // Auto-sync to all CLI tools after installation
                    if (options.sync !== false) {
                        console.log('\n🔄 Syncing skills to all CLI tools...');
                        await syncManager.syncAll({ force: options.force || false });
                    }
                } else {
                    console.error(`[X] Unknown skill action: ${action}`);
                    console.log('\nRun: stigmergy skill help');
                    console.log('Or see available collections: stigmergy skill list-collections');
                    process.exit(1);
                }
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
  install <collection|source>  Install skills from predefined collection or GitHub
                              Example: stigmergy skill install anthropics
                              Example: stigmergy skill install anthropics/skills

  list-collections            List all available skill collections
                              Example: stigmergy skill list-collections

  search <keyword>            Search for skill collections by keyword
                              Example: stigmergy skill search coding

  info <name>                 Get detailed info about a skill collection
                              Example: stigmergy skill info anthropics

  read <name>                 Read skill content (for AI agents)
                              Example: stigmergy skill read pdf

  list                        List all installed skills

  sync                        Sync skills to AGENTS.md

  sync-all                    Sync all skills to all CLI tools
                              Example: stigmergy skill sync-all

  sync-to-cli <name>          Sync specific skill to all CLI tools
                              Example: stigmergy skill sync-to-cli pdf

  sync-status                 Check deployment status across all CLI tools
                              Example: stigmergy skill sync-status

  remove <name>               Remove installed skill
                              Example: stigmergy skill remove pdf

  validate <path>             Validate skill format
                              Example: stigmergy skill validate ./my-skill/SKILL.md

OPTIONS:
  --force                     Force overwrite existing skills
  --sync                      Auto-sync to CLI tools after install
  --no-sync                   Skip auto-sync
  --clis <list>               Only sync to specific CLIs (comma-separated)
                              Example: --clis claude,qwen
  --exclude <list>            Exclude CLIs from sync
                              Example: --exclude codex
  --dry-run                   Preview sync operations without executing
  --verbose                   Show detailed output

SIMPLIFIED INSTALLATION EXAMPLES:
  # Install Anthropic official skills (no need to remember URL!)
  stigmergy skill install anthropics

  # Install productivity-focused skills
  stigmergy skill install productivity

  # Install coding-focused skills
  stigmergy skill install coding

  # Install research-focused skills
  stigmergy skill install research

FULL EXAMPLES:
  # Install and auto-sync skills
  stigmergy skill install vercel-labs/agent-skills --sync

  # Install specific skill
  stigmergy skill install anthropics/skills

  # List available collections
  stigmergy skill list-collections

  # Search for specific types of skills
  stigmergy skill search coding

  # List installed skills
  stigmergy skill list

  # Sync all skills to all CLI tools
  stigmergy skill sync-all

  # Sync specific skill
  stigmergy skill sync-to-cli pdf

  # Check sync status
  stigmergy skill sync-status

  # Use a skill in Claude CLI
  claude> Bash("stigmergy skill read pdf")

  # Cross-CLI skill usage (requires stigmergy routing)
  qwen> "use claude's pdf skill to process doc.pdf"

SKILL LOCATIONS:
  ~/.stigmergy/skills/     Stigmergy unified storage (primary)
  ./.claude/skills/        Project Claude skills
  ~/.claude/skills/        Global Claude skills
  ./.agent/skills/         Universal project skills
  ~/.agent/skills/         Universal global skills

SUPPORTED CLI TOOLS:
  claude, codex, iflow, qwen, qodercli, codebuddy, opencode

MORE INFO:
  https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
`);
}
