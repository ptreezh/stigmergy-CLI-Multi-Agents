#!/usr/bin/env node

/**
 * Qoder CLI Meta-Skill Deployment Script (Version 2)
 * Deploys complete methodology (using-superpowers style) for Qoder skill system
 *
 * Usage:
 * node scripts/deploy-qodercli-skills-v2.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Qoder CLI config paths
const QODER_CONFIG_DIR = path.join(os.homedir(), '.qoder');
const QODER_SKILLS_DIR = path.join(QODER_CONFIG_DIR, 'skills');
const QODER_QODER_MD = path.join(QODER_CONFIG_DIR, 'QODER.md');
const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

class QoderMetaSkillDeployer {
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
    this.log('🚀 Starting Qoder Meta-Skill deployment...', 'INFO');

    try {
      // Step 1: Create skills directory
      await this.createSkillsDirectory();

      // Step 2: Inject META-SKILL into QODER.md
      await this.injectMetaSkill();

      // Step 3: Update using-superpowers skill
      await this.updateUsingSuperpowersSkill();

      // Step 4: Verify deployment
      const verification = await this.verifyDeployment();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.log(`✅ Deployment completed in ${duration}s`, 'INFO');

      return verification;
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createSkillsDirectory() {
    this.log('Creating Qoder skills directory...', 'INFO');

    if (!this.dryRun) {
      await fs.mkdir(QODER_SKILLS_DIR, { recursive: true });
    }

    this.log(`✅ Verified: ${QODER_SKILLS_DIR}`, 'OK');
  }

  async injectMetaSkill() {
    this.log('Injecting META-SKILL into QODER.md...', 'INFO');

    // Read the meta-skill template
    const metaSkillPath = path.join(TEMPLATE_DIR, 'using-qodercli-skills.md');

    let metaSkillContent = '';
    try {
      metaSkillContent = await fs.readFile(metaSkillPath, 'utf8');
    } catch (error) {
      this.log(`⚠️  Meta-skill template not found: ${metaSkillPath}`, 'WARN');
      this.log('   Using simplified meta-skill instead', 'INFO');
      // Fall back to simplified meta-skill
      metaSkillContent = `<!-- META_SKILL_START -->
<EXTREMELY_IMPORTANT>
You are using Qoder CLI with Stigmergy skill integration.

## Mandatory Protocol

Before ANY response, complete this checklist:
☐ 1. Identify task requirements and constraints
☐ 2. Check if a skill should be activated
☐ 3. Select appropriate skill (brainstorming, TDD, debugging)
☐ 4. Load and follow the skill's methodology
☐ 5. Verify completion before finishing

Available skills:
- **brainstorming**: For design, creativity, planning
- **test-driven-development**: For implementation with tests
- **systematic-debugging**: For troubleshooting issues
- **subagent-driven-development**: For multi-agent coordination
- **writing-plans**: For planning methodology

Remember: Structured skill execution prevents mistakes and ensures quality.
</EXTREMELY_IMPORTANT>
<!-- META_SKILL_END -->`;
    }

    // Read existing QODER.md
    let qoderMdContent = '';
    try {
      qoderMdContent = await fs.readFile(QODER_QODER_MD, 'utf8');
    } catch (error) {
      qoderMdContent = '# Qoder CLI Configuration\\n\\n';
    }

    // Remove any existing META_SKILL section to prevent duplicates
    qoderMdContent = qoderMdContent.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');

    // Inject meta-skill at the TOP (before any existing content)
    const injectedContent = metaSkillContent + '\\n\\n---\\n\\n' + qoderMdContent;

    if (!this.dryRun) {
      await fs.writeFile(QODER_QODER_MD, injectedContent, 'utf-8');
    }

    this.log(`✅ Injected meta-skill into: ${QODER_QODER_MD}`, 'OK');
    this.log(`   Meta-skill length: ${metaSkillContent.length} chars`, 'INFO');
  }

  async updateUsingSuperpowersSkill() {
    this.log('Updating using-superpowers skill...', 'INFO');

    const usingSuperpowersDir = path.join(QODER_SKILLS_DIR, 'superpowers', 'using-superpowers');

    // Check if using-superpowers skill exists
    try {
      await fs.access(usingSuperpowersDir);

      // Update existing SKILL.md with enhanced content
      const skillMdPath = path.join(usingSuperpowersDir, 'SKILL.md');

      // Read current skill
      let currentSkill = await fs.readFile(skillMdPath, 'utf8');

      // Check if it needs updating (if it doesn't have META_SKILL markers)
      if (!currentSkill.includes('META_SKILL_START')) {
        this.log('   Existing using-superpowers skill will be preserved (v1 format)', 'INFO');
        this.log('   New meta-skill is in QODER.md instead', 'INFO');
      } else {
        this.log('   using-superpowers skill already in v2 format', 'INFO');
      }
    } catch (e) {
      this.log('   using-superpowers skill not found, skipping update', 'INFO');
    }
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      skills_dir: false,
      qoder_md_exists: false,
      meta_skill_injected: false,
      overall: false
    };

    try {
      // Check skills directory
      try {
        await fs.access(QODER_SKILLS_DIR);
        results.skills_dir = true;
        this.log('✅ Skills directory: exists', 'OK');
      } catch (e) {
        this.log('⚠️  Skills directory not found', 'WARN');
      }

      // Check QODER.md exists
      try {
        await fs.access(QODER_QODER_MD);
        results.qoder_md_exists = true;
        this.log('✅ QODER.md: exists', 'OK');
      } catch (e) {
        this.log('⚠️  QODER.md not found', 'WARN');
      }

      // Check meta-skill injection
      try {
        const qoderMd = await fs.readFile(QODER_QODER_MD, 'utf8');
        results.meta_skill_injected = qoderMd.includes('<!-- META_SKILL_START -->') &&
                                    qoderMd.includes('using-qodercli-skills');
        this.log(`✅ Meta-skill injection: ${results.meta_skill_injected ? 'deployed' : 'not found'}`, 'OK');
      } catch (e) {
        this.log('⚠️  Could not verify meta-skill injection', 'WARN');
      }

      results.overall = results.skills_dir && results.qoder_md_exists && results.meta_skill_injected;

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
    this.log('🗑️  Uninstalling Qoder Meta-Skill integration...', 'INFO');

    try {
      // Remove meta-skill section from QODER.md
      try {
        let qoderMd = await fs.readFile(QODER_QODER_MD, 'utf8');
        qoderMd = qoderMd.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');
        await fs.writeFile(QODER_QODER_MD, qoderMd, 'utf8');
        this.log('✅ Removed: meta-skill from QODER.md', 'OK');
      } catch (e) {
        this.log('⚠️  Could not update QODER.md', 'WARN');
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

  const deployer = new QoderMetaSkillDeployer(options);

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

module.exports = QoderMetaSkillDeployer;
