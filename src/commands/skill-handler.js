/**
 * Stigmergy Skill Command Handler (CommonJS版本)
 * 
 * 桥接CommonJS主程序和ES模块技能系统
 * 使用dynamic import在CommonJS中加载ES模块
 */

const path = require('path');

/**
 * 处理skill命令 - 使用dynamic import调用ES模块
 * @param {string} action - skill子命令 (install/read/list/sync/remove/validate)
 * @param {Array} args - 命令参数
 * @param {Object} options - 选项
 * @returns {Promise<number>} 退出码
 */
async function handleSkillCommand(action, args = [], options = {}) {
    try {
        // Use dynamic import to load ES module (Windows requires file:// protocol)
        const { pathToFileURL } = require('url');
        
        // Try to load the enhanced skill manager first, fall back to regular one
        let modulePath, moduleUrl;
        
        try {
            modulePath = path.join(__dirname, './enhanced-skill-manager.js');
            moduleUrl = pathToFileURL(modulePath).href;
            const { handleEnhancedSkillCommand } = await import(moduleUrl);
            
            // Check if it's a predefined skill collection
            const predefinedSkills = {
                'anthropics': true,
                'vercel': true,
                'productivity': true,
                'coding': true,
                'research': true,
                'list-collections': true,
                'collections': true,
                'presets': true,
                'search': true,
                'info': true,
                'describe': true
            };
            
            if (predefinedSkills[action.toLowerCase()] || 
                action.toLowerCase().includes('collection') || 
                action.toLowerCase().includes('search') ||
                action.toLowerCase().includes('info') ||
                action.toLowerCase().includes('describe')) {
                // Use enhanced skill manager for these commands
                await handleEnhancedSkillCommand(action, args, options);
                return 0;
            } else {
                // Fall back to regular skill manager for other commands
                modulePath = path.join(__dirname, '../core/skills/StigmergySkillManager.js');
                moduleUrl = pathToFileURL(modulePath).href;
                const { StigmergySkillManager } = await import(moduleUrl);
                
                const manager = new StigmergySkillManager();
                
                // Execute corresponding command
                switch (action) {
                    case 'install':
                        if (!args[0]) {
                            console.error('❌ Error: source or skill collection name required');
                            console.log('\nUsage: stigmergy skill install <skill-collection|github-source>');
                            console.log('Example: stigmergy skill install anthropics');
                            console.log('Example: stigmergy skill install anthropics/skills');
                            console.log('\nUse "stigmergy skill list-collections" to see available collections.');
                            return 1;
                        }
                        
                        // Check if it's a predefined skill collection
                        const predefinedCollections = {
                            'anthropics': { source: 'anthropics/skills' },
                            'vercel': { source: 'vercel-labs/agent-skills' },
                            'productivity': { source: 'anthropics/skills' },
                            'coding': { source: 'anthropics/skills' },
                            'research': { source: 'anthropics/skills' }
                        };

                        if (predefinedCollections[args[0].toLowerCase()]) {
                            console.log(`\n🚀 Installing predefined skill collection: ${args[0]}`);
                            console.log(`🔗 Source: ${predefinedCollections[args[0].toLowerCase()].source}`);
                            
                            await manager.install(predefinedCollections[args[0].toLowerCase()].source, options);
                        } else {
                            // Regular GitHub source
                            await manager.install(args[0], options);
                        }
                        break;

                    case 'read':
                        if (!args[0]) {
                            console.error('❌ Error: skill name required');
                            console.log('\nUsage: stigmergy skill read <skill-name>');
                            return 1;
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
                            console.error('❌ Error: skill name required');
                            console.log('\nUsage: stigmergy skill remove <skill-name>');
                            return 1;
                        }
                        await manager.remove(args[0]);
                        break;

                    case 'validate':
                        if (!args[0]) {
                            console.error('❌ Error: skill path or name required');
                            console.log('\nUsage: stigmergy skill validate <path-or-name>');
                            return 1;
                        }
                        await manager.validate(args[0]);
                        break;

                    case 'help':
                        printSkillHelp();
                        break;

                    default:
                        console.error(`❌ Unknown skill action: ${action}`);
                        console.log('\nRun: stigmergy skill help');
                        return 1;
                }
            }
        } catch (enhancedErr) {
            // Fall back to regular skill manager if enhanced one fails
            modulePath = path.join(__dirname, '../core/skills/StigmergySkillManager.js');
            moduleUrl = pathToFileURL(modulePath).href;
            const { StigmergySkillManager } = await import(moduleUrl);
            
            const manager = new StigmergySkillManager();

            // Execute corresponding command
            switch (action) {
                case 'install':
                    if (!args[0]) {
                        console.error('❌ Error: source required');
                        console.log('\nUsage: stigmergy skill install <source>');
                        console.log('Example: stigmergy skill install anthropics/skills');
                        return 1;
                    }
                    await manager.install(args[0], options);
                    break;

                case 'read':
                    if (!args[0]) {
                        console.error('❌ Error: skill name required');
                        console.log('\nUsage: stigmergy skill read <skill-name>');
                        return 1;
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
                        console.error('❌ Error: skill name required');
                        console.log('\nUsage: stigmergy skill remove <skill-name>');
                        return 1;
                    }
                    await manager.remove(args[0]);
                    break;

                case 'validate':
                    if (!args[0]) {
                        console.error('❌ Error: skill path or name required');
                        console.log('\nUsage: stigmergy skill validate <path-or-name>');
                        return 1;
                    }
                    await manager.validate(args[0]);
                    break;

                case 'help':
                    printSkillHelp();
                    break;

                default:
                    console.error(`❌ Unknown skill action: ${action}`);
                    console.log('\nRun: stigmergy skill help');
                    return 1;
            }
        }

        return 0;
    } catch (err) {
        console.error(`\n❌ Command failed: ${err.message}`);
        if (options.verbose) {
            console.error(err.stack);
        }
        return 1;
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

module.exports = { handleSkillCommand };
