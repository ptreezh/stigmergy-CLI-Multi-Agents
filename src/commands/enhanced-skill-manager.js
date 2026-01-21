/**
 * Enhanced Skill Manager - Simplified skill loading with predefined collections
 * 
 * This allows users to install popular skill sets without remembering GitHub URLs
 */

import { StigmergySkillManager } from '../core/skills/StigmergySkillManager.js';

import fs from 'fs/promises';
import path from 'path';

// Load predefined skill collections from configuration file
let PREDEFINED_SKILLS = {};

async function loadPredefinedSkills() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'predefined-skills.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Convert the collections format to the expected structure
    for (const [key, skill] of Object.entries(config.collections)) {
      PREDEFINED_SKILLS[key] = {
        name: skill.name,
        description: skill.description,
        source: skill.source,
        category: skill.category,
        subset: skill.subset,
        tags: skill.tags,
        recommended: skill.recommended
      };
    }
  } catch (error) {
    console.warn('[WARN] Could not load predefined skills config, using defaults:', error.message);
    
    // Fallback to default skills
    PREDEFINED_SKILLS = {
      // Popular skill collections from known repositories
      'anthropics': {
        name: 'Anthropic Official Skills',
        description: 'Official skills from Anthropic',
        source: 'anthropics/skills',
        category: 'official'
      },
      'vercel': {
        name: 'Vercel Agent Skills',
        description: 'Agent skills from Vercel Labs',
        source: 'vercel-labs/agent-skills',
        category: 'agent-tools'
      },
      'productivity': {
        name: 'Productivity Skills',
        description: 'Skills for productivity and workflow automation',
        source: 'anthropics/skills',
        category: 'productivity',
        subset: ['calendar', 'email', 'todo']
      },
      'coding': {
        name: 'Coding Skills',
        description: 'Skills for coding and development',
        source: 'anthropics/skills',
        category: 'development',
        subset: ['code-executor', 'search', 'terminal']
      },
      'research': {
        name: 'Research Skills',
        description: 'Skills for research and analysis',
        source: 'anthropics/skills',
        category: 'research',
        subset: ['search', 'pdf', 'web-scraping']
      }
    };
  }
}

/**
 * Check if a skill name is a predefined collection
 */
export async function isPredefinedSkill(skillName) {
  await loadPredefinedSkills();
  return skillName.toLowerCase() in PREDEFINED_SKILLS;
}

/**
 * Get predefined skill info
 */
export async function getPredefinedSkillInfo(skillName) {
  await loadPredefinedSkills();
  return PREDEFINED_SKILLS[skillName.toLowerCase()];
}

// Export functions to access the predefined skills
export { PREDEFINED_SKILLS, loadPredefinedSkills };

export class EnhancedSkillManager {
  constructor() {
    this.skillManager = new StigmergySkillManager();
    this.PREDEFINED_SKILLS = PREDEFINED_SKILLS; // Make it accessible
  }

  /**
   * Initialize the skill manager by loading predefined skills
   */
  async initialize() {
    await loadPredefinedSkills();
    this.PREDEFINED_SKILLS = PREDEFINED_SKILLS; // Update reference after loading
  }

  /**
   * List all predefined skill collections
   */
  listPredefinedSkills() {
    console.log('\n📚 Available Skill Collections:\n');
    console.log('='.repeat(80));
    
    const categories = {};
    
    // Group by category
    for (const [key, skill] of Object.entries(PREDEFINED_SKILLS)) {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push({ key, ...skill });
    }
    
    // Display by category
    for (const [category, skills] of Object.entries(categories)) {
      console.log(`\n📁 ${category.toUpperCase()}:`);
      console.log('-'.repeat(40));
      
      for (const skill of skills) {
        const recommended = skill.recommended ? '⭐' : '  ';
        console.log(`${recommended} ${skill.key.padEnd(20)} | ${skill.name}`);
        console.log(`     📝 ${skill.description}`);
        console.log(`     🔗 ${skill.source}`);
        if (skill.subset) {
          console.log(`     🧩 Subset: ${skill.subset.join(', ')}`);
        }
        if (skill.tags) {
          console.log(`     🏷️  Tags: ${skill.tags.join(', ')}`);
        }
        console.log('');
      }
    }
    
    console.log('='.repeat(80));
    console.log('\n💡 Usage examples:');
    console.log('   stigmergy skill install anthropics     # Install Anthropic official skills');
    console.log('   stigmergy skill install coding        # Install coding-focused skills');
    console.log('   stigmergy skill install productivity  # Install productivity skills');
    console.log('');
  }

  /**
   * Install a predefined skill collection by name
   */
  async installPredefinedSkill(skillName, options = {}) {
    const skill = PREDEFINED_SKILLS[skillName.toLowerCase()];
    
    if (!skill) {
      throw new Error(`Unknown skill collection: ${skillName}. Use 'stigmergy skill list-collections' to see available options.`);
    }
    
    console.log(`\n🚀 Installing: ${skill.name}`);
    console.log(`📝 Description: ${skill.description}`);
    console.log(`🔗 Source: ${skill.source}`);
    if (skill.tags) {
      console.log(`🏷️  Tags: ${skill.tags.join(', ')}`);
    }
    console.log('');
    
    try {
      // If this is a subset, we might need special handling
      if (skill.subset) {
        console.log(`🧩 Installing skills from subset: ${skill.subset.join(', ')}`);
        // For now, we'll install the full repository and the skill manager can handle subsets
      }
      
      // Delegate to the standard skill manager
      const result = await this.skillManager.install(skill.source, options);
      
      console.log(`\n✅ Successfully installed: ${skill.name}`);
      console.log(`📍 From: ${skill.source}`);
      if (skill.tags) {
        console.log(`🏷️  Tags: ${skill.tags.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      console.error(`\n❌ Failed to install ${skill.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Search for skills by keyword
   */
  searchSkills(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const matches = [];
    
    for (const [key, skill] of Object.entries(PREDEFINED_SKILLS)) {
      if (key.includes(lowerKeyword) || 
          skill.name.toLowerCase().includes(lowerKeyword) || 
          skill.description.toLowerCase().includes(lowerKeyword) ||
          skill.category.toLowerCase().includes(lowerKeyword) ||
          (skill.tags && skill.tags.some(tag => tag.includes(lowerKeyword)))) {
        matches.push({ key, ...skill });
      }
    }
    
    if (matches.length === 0) {
      console.log(`\n🔍 No skill collections found matching: ${keyword}`);
      console.log('Use "stigmergy skill list-collections" to see all available skills.');
      return;
    }
    
    console.log(`\n🔍 Found ${matches.length} skill collection(s) matching "${keyword}":\n`);
    
    for (const skill of matches) {
      const recommended = skill.recommended ? '⭐' : '  ';
      console.log(`${recommended} ${skill.key} - ${skill.name}`);
      console.log(`   📝 ${skill.description}`);
      console.log(`   🏷️  Category: ${skill.category}`);
      if (skill.tags) {
        console.log(`   🏷️  Tags: ${skill.tags.join(', ')}`);
      }
      console.log(`   🔗 ${skill.source}`);
      console.log('');
    }
  }

  /**
   * Get detailed info about a specific skill
   */
  getSkillInfo(skillName) {
    const skill = PREDEFINED_SKILLS[skillName.toLowerCase()];
    
    if (!skill) {
      console.log(`\n❌ Skill collection not found: ${skillName}`);
      console.log('Use "stigmergy skill list-collections" to see available options.');
      return null;
    }
    
    console.log(`\n📋 Skill Collection Details: ${skill.name}\n`);
    console.log(`🏷️  Name: ${skill.name}`);
    console.log(`🔑 Key: ${skillName}`);
    console.log(`📝 Description: ${skill.description}`);
    console.log(`🏷️  Category: ${skill.category}`);
    if (skill.tags) {
      console.log(`🏷️  Tags: ${skill.tags.join(', ')}`);
    }
    console.log(`🔗 Source: ${skill.source}`);
    if (skill.recommended) {
      console.log(`⭐ Recommended: Yes`);
    }
    
    if (skill.subset) {
      console.log(`🧩 Specific skills: ${skill.subset.join(', ')}`);
    }
    
    console.log(`\n💡 Install with: stigmergy skill install ${skillName}`);
    console.log('');
    
    return skill;
  }
}

/**
 * Handle enhanced skill commands
 */
export async function handleEnhancedSkillCommand(action, args, options = {}) {
  const manager = new EnhancedSkillManager();
  
  // Initialize the manager to load predefined skills
  await manager.initialize();
  
  try {
    switch (action) {
      case 'list-collections':
      case 'collections':
      case 'presets':
        manager.listPredefinedSkills();
        break;
        
      case 'search':
        if (!args[0]) {
          console.error('❌ Error: search term required');
          console.log('\nUsage: stigmergy skill search <keyword>');
          process.exit(1);
        }
        manager.searchSkills(args[0]);
        break;
        
      case 'info':
      case 'describe':
        if (!args[0]) {
          console.error('❌ Error: skill name required');
          console.log('\nUsage: stigmergy skill info <skill-name>');
          process.exit(1);
        }
        manager.getSkillInfo(args[0]);
        break;
        
      case 'install': // This will handle both predefined and regular installs
        if (!args[0]) {
          console.error('❌ Error: skill name or GitHub source required');
          console.log('\nUsage: stigmergy skill install <skill-name|github-source>');
          console.log('Example: stigmergy skill install anthropics');
          console.log('Example: stigmergy skill install anthropics/skills');
          process.exit(1);
        }
        
        // Check if it's a predefined skill
        if (PREDEFINED_SKILLS[args[0].toLowerCase()]) {
          await manager.installPredefinedSkill(args[0], options);
        } else {
          // It's a regular GitHub source, delegate to standard manager
          await manager.skillManager.install(args[0], options);
        }
        break;
        
      default:
        // If it's a predefined skill name, try to install it
        if (PREDEFINED_SKILLS[action.toLowerCase()]) {
          await manager.installPredefinedSkill(action, args[0] ? { source: args[0] } : options);
        } else {
          console.error(`❌ Unknown skill command: ${action}`);
          console.log('\nAvailable commands:');
          console.log('  stigmergy skill list-collections  # List all skill collections');
          console.log('  stigmergy skill search <term>     # Search for skills');
          console.log('  stigmergy skill info <name>       # Get skill info');
          console.log('  stigmergy skill install <name>    # Install by name');
          console.log('');
          process.exit(1);
        }
    }
  } catch (error) {
    console.error(`\n❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}