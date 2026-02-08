#!/usr/bin/env node

/**
 * CodeBuddy CLI Meta-Skill Deployment Script (Version 2)
 * Deploys complete methodology (using-superpowers style) for CodeBuddy buddy system
 *
 * Usage:
 * node scripts/deploy-codebuddy-buddies-v2.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// CodeBuddy CLI config paths
const CODEBUDDY_CONFIG_DIR = path.join(os.homedir(), '.codebuddy');
const CODEBUDDY_BUDDIES_DIR = path.join(CODEBUDDY_CONFIG_DIR, 'buddies');
const CODEBUDDY_CONFIG = path.join(CODEBUDDY_CONFIG_DIR, 'buddy_config.json');
const CODEBUDDY_MD = path.join(CODEBUDDY_CONFIG_DIR, 'CODEBUDDY.md');
const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

class CodeBuddyMetaSkillDeployer {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.dryRun = options.dryRun || false;
    this.startTime = Date.now();
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  async deploy() {
    this.log('🚀 Starting CodeBuddy Meta-Skill deployment...', 'INFO');

    try {
      // Step 1: Create buddies directory
      await this.createBuddiesDirectory();

      // Step 2: Create buddy configuration
      await this.createBuddyConfig();

      // Step 3: Create superpowers buddies
      await this.createSuperpowersBuddies();

      // Step 4: Inject META-SKILL
      await this.injectMetaSkill();

      // Step 5: Verify deployment
      const verification = await this.verifyDeployment();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.log(`✅ Deployment completed in ${duration}s`, 'INFO');

      return verification;
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createBuddiesDirectory() {
    this.log('Creating CodeBuddy buddies directory...', 'INFO');

    if (!this.dryRun) {
      await fs.mkdir(CODEBUDDY_BUDDIES_DIR, { recursive: true });
      await fs.mkdir(path.join(CODEBUDDY_BUDDIES_DIR, 'superpowers-buddies'), { recursive: true });
    }

    this.log(`✅ Created: ${CODEBUDDY_BUDDIES_DIR}`, 'OK');
  }

  async createBuddyConfig() {
    this.log('Creating buddy configuration...', 'INFO');

    const buddyConfig = {
      version: '2.0.0',
      meta_skill_enabled: true,
      meta_skill: {
        name: 'using-codebuddy-buddies',
        type: 'methodology-instruction',
        priority: 1,
        inject_at: 'session_start'
      },
      buddies: [
        {
          name: 'brainstorming-buddy',
          description: 'Design and ideation expert',
          module: './buddies/superpowers-buddies/brainstorming-buddy',
          enabled: true,
          priority: 100,
          triggers: ['design', 'create', 'brainstorm', 'plan', 'architecture'],
          type: 'skill'
        },
        {
          name: 'tdd-buddy',
          description: 'Test-driven development expert',
          module: './buddies/superpowers-buddies/tdd-buddy',
          enabled: true,
          priority: 100,
          triggers: ['implement', 'feature', 'function', 'code', 'test'],
          type: 'skill'
        },
        {
          name: 'debugging-buddy',
          description: 'Systematic troubleshooting expert',
          module: './buddies/superpowers-buddies/debugging-buddy',
          enabled: true,
          priority: 100,
          triggers: ['debug', 'fix', 'error', 'issue', 'problem', 'broken'],
          type: 'skill'
        },
        {
          name: 'collaboration-buddy',
          description: 'Team communication and coordination expert',
          module: './buddies/superpowers-buddies/collaboration-buddy',
          enabled: true,
          priority: 90,
          triggers: ['team', 'review', 'discuss', 'share', 'collaborate'],
          type: 'collaboration'
        },
        {
          name: 'verification-buddy',
          description: 'Quality and completeness verification expert',
          module: './buddies/superpowers-buddies/verification-buddy',
          enabled: true,
          priority: 95,
          triggers: ['done', 'finish', 'complete', 'ready'],
          type: 'verification'
        }
      ],
      settings: {
        auto_activate: true,
        allow_multiple_buddies: true,
        handoff_enabled: true,
        cross_cli_integration: true
      }
    };

    if (!this.dryRun) {
      await fs.writeFile(
        CODEBUDDY_CONFIG,
        JSON.stringify(buddyConfig, null, 2),
        'utf8'
      );
    }

    this.log('✅ Created: buddy_config.json', 'OK');
  }

  async createSuperpowersBuddies() {
    this.log('Creating superpowers buddies...', 'INFO');

    const buddiesDir = path.join(CODEBUDDY_BUDDIES_DIR, 'superpowers-buddies');

    // Brainstorming Buddy
    const brainstormingBuddy = `/**
 * Brainstorming Buddy
 * Facilitates creative exploration and ideation
 */

module.exports = {
  name: 'brainstorming-buddy',
  description: 'Design and ideation expert',

  async activate(context) {
    return {
      activated: true,
      methodology: 'Diverge → Explore → Converge → Document',
      stages: ['diverge', 'explore', 'converge', 'document']
    };
  },

  async guide(stage, input) {
    const guidance = {
      diverge: 'Generate 3-5 alternative approaches. Think broadly and creatively.',
      explore: 'Analyze pros and cons of each option. Consider trade-offs.',
      converge: 'Select the best option based on criteria. Justify your decision.',
      document: 'Record decision rationale and considerations for future reference.'
    };
    return guidance[stage] || '';
  }
};
`;

    // TDD Buddy
    const tddBuddy = `/**
 * Test-Driven Development Buddy
 * Enforces TDD discipline and practices
 */

module.exports = {
  name: 'tdd-buddy',
  description: 'Test-driven development expert',

  async activate(context) {
    return {
      activated: true,
      methodology: 'Red → Green → Refactor',
      stages: ['red', 'green', 'refactor']
    };
  },

  async guide(stage, input) {
    const guidance = {
      red: 'Write a failing test first. What should the code do?',
      green: 'Write minimal code to pass the test. No more, no less.',
      refactor: 'Improve code structure while keeping tests green. Clean and clarify.'
    };
    return guidance[stage] || '';
  }
};
`;

    // Debugging Buddy
    const debuggingBuddy = `/**
 * Debugging Buddy
 * Systematic problem diagnosis and resolution
 */

module.exports = {
  name: 'debugging-buddy',
  description: 'Systematic troubleshooting expert',

  async activate(context) {
    return {
      activated: true,
      methodology: 'Understand → Isolate → Fix → Verify',
      stages: ['understand', 'isolate', 'fix', 'verify']
    };
  },

  async guide(stage, input) {
    const guidance = {
      understand: 'Gather symptoms and context. What exactly is happening?',
      isolate: 'Find the root cause. Hypothesis testing and investigation.',
      fix: 'Apply targeted fix. Address the cause, not just the symptom.',
      verify: 'Confirm fix works and check for regressions.'
    };
    return guidance[stage] || '';
  }
};
`;

    if (!this.dryRun) {
      await fs.writeFile(path.join(buddiesDir, 'brainstorming-buddy.js'), brainstormingBuddy, 'utf8');
      await fs.writeFile(path.join(buddiesDir, 'tdd-buddy.js'), tddBuddy, 'utf8');
      await fs.writeFile(path.join(buddiesDir, 'debugging-buddy.js'), debuggingBuddy, 'utf8');
    }

    this.log('✅ Created: brainstorming-buddy.js', 'OK');
    this.log('✅ Created: tdd-buddy.js', 'OK');
    this.log('✅ Created: debugging-buddy.js', 'OK');
  }

  async injectMetaSkill() {
    this.log('Injecting META-SKILL into CODEBUDDY.md...', 'INFO');

    // Read the meta-skill template
    const metaSkillPath = path.join(TEMPLATE_DIR, 'using-codebuddy-buddies.md');

    let metaSkillContent = '';
    try {
      metaSkillContent = await fs.readFile(metaSkillPath, 'utf8');
    } catch (error) {
      this.log(`⚠️  Meta-skill template not found: ${metaSkillPath}`, 'WARN');
      this.log('   Using simplified meta-skill instead', 'INFO');
      // Fall back to simplified meta-skill
      metaSkillContent = `<!-- META_SKILL_START -->
<EXTREMELY_IMPORTANT>
You are using CodeBuddy CLI with Stigmergy buddy integration.

## Mandatory Protocol

Before ANY response, complete this checklist:
☐ 1. Check if task requires team collaboration
☐ 2. Identify relevant buddies (skills/agents)
☐ 3. Load and configure buddy for the task
☐ 4. Follow buddy's methodology and protocols
☐ 5. Coordinate with team members as needed

Available buddies:
- **brainstorming-buddy**: Design and ideation expert
- **tdd-buddy**: Test-driven development expert
- **debugging-buddy**: Systematic troubleshooting expert
- **collaboration-buddy**: Team communication expert
- **verification-buddy**: Quality and completeness expert

Remember: Buddies provide structured expertise. Trust the process.
</EXTREMELY_IMPORTANT>
<!-- META_SKILL_END -->`;
    }

    // Read existing CODEBUDDY.md
    let codebuddyMdContent = '';
    try {
      codebuddyMdContent = await fs.readFile(CODEBUDDY_MD, 'utf8');
    } catch (error) {
      codebuddyMdContent = '# CodeBuddy CLI Configuration\\n\\n';
    }

    // Remove any existing META_SKILL section to prevent duplicates
    codebuddyMdContent = codebuddyMdContent.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');

    // Inject meta-skill at the TOP (before any existing content)
    const injectedContent = metaSkillContent + '\\n\\n---\\n\\n' + codebuddyMdContent;

    if (!this.dryRun) {
      await fs.writeFile(CODEBUDDY_MD, injectedContent, 'utf-8');
    }

    this.log(`✅ Injected meta-skill into: ${CODEBUDDY_MD}`, 'OK');
    this.log(`   Meta-skill length: ${metaSkillContent.length} chars`, 'INFO');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      buddies_dir: false,
      buddy_config: false,
      meta_skill_injected: false,
      overall: false
    };

    try {
      // Check buddies directory
      try {
        await fs.access(CODEBUDDY_BUDDIES_DIR);
        results.buddies_dir = true;
        this.log('✅ Buddies directory: deployed', 'OK');
      } catch (e) {
        this.log('⚠️  Buddies directory not found', 'WARN');
      }

      // Check buddy config
      try {
        const config = JSON.parse(await fs.readFile(CODEBUDDY_CONFIG, 'utf8'));
        results.buddy_config = config.version === '2.0.0' && config.meta_skill_enabled === true;
        this.log(`✅ Buddy config: ${results.buddy_config ? 'valid' : 'invalid'}`, 'OK');
      } catch (e) {
        this.log('⚠️  Buddy config not found', 'WARN');
      }

      // Check meta-skill injection
      try {
        const codebuddyMd = await fs.readFile(CODEBUDDY_MD, 'utf8');
        results.meta_skill_injected = codebuddyMd.includes('<!-- META_SKILL_START -->') &&
                                    codebuddyMd.includes('using-codebuddy-buddies');
        this.log(`✅ Meta-skill injection: ${results.meta_skill_injected ? 'deployed' : 'not found'}`, 'OK');
      } catch (e) {
        this.log('⚠️  Could not verify meta-skill injection', 'WARN');
      }

      results.overall = results.buddies_dir && results.buddy_config && results.meta_skill_injected;

      if (results.overall) {
        this.log('✅ All components deployed successfully!', 'OK');
      } else {
        this.log('⚠️  Some components not deployed correctly', 'WARN');
      }

      return results;
    } catch (error) {
      this.log(`❌ Verification failed: ${error.message}`, 'ERROR');
      return results;
    }
  }

  async uninstall() {
    this.log('🗑️  Uninstalling CodeBuddy Meta-Skill integration...', 'INFO');

    try {
      // Remove meta-skill section from CODEBUDDY.md
      try {
        let codebuddyMd = await fs.readFile(CODEBUDDY_MD, 'utf8');
        codebuddyMd = codebuddyMd.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');
        await fs.writeFile(CODEBUDDY_MD, codebuddyMd, 'utf8');
        this.log('✅ Removed: meta-skill from CODEBUDDY.md', 'OK');
      } catch (e) {
        this.log('⚠️  Could not update CODEBUDDY.md', 'WARN');
      }

      this.log('✅ Uninstall completed', 'OK');
    } catch (error) {
      this.log(`❌ Uninstall failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    verbose: !args.includes('--quiet'),
    dryRun: args.includes('--dry-run')
  };

  const deployer = new CodeBuddyMetaSkillDeployer(options);

  if (args.includes('--uninstall')) {
    await deployer.uninstall();
  } else if (args.includes('--verify')) {
    const results = await deployer.verifyDeployment();
    console.log('\\nVerification Results:', JSON.stringify(results, null, 2));
    process.exit(results.overall ? 0 : 1);
  } else {
    await deployer.deploy();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = CodeBuddyMetaSkillDeployer;
