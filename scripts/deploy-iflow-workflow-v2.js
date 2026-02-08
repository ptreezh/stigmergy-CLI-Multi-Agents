#!/usr/bin/env node

/**
 * iFlow CLI Meta-Skill Deployment Script (Version 2)
 * Deploys complete methodology (using-superpowers style) for iFlow workflows
 *
 * Usage:
 * node scripts/deploy-iflow-workflow-v2.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// iFlow CLI config paths
const IFLOW_CONFIG_DIR = path.join(os.homedir(), '.iflow');
const IFLOW_WORKFLOW_CONFIG = path.join(IFLOW_CONFIG_DIR, 'workflow_config.json');
const IFLOW_HOOKS_DIR = path.join(IFLOW_CONFIG_DIR, 'hooks');
const IFLOW_IFLOW_MD = path.join(IFLOW_CONFIG_DIR, 'IFLOW.md');
const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

class IFlowMetaSkillDeployer {
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
    this.log('🚀 Starting iFlow Meta-Skill deployment...', 'INFO');

    try {
      // Step 1: Create config directory
      await this.createConfigDirectory();

      // Step 2: Deploy workflow configuration
      await this.deployWorkflowConfig();

      // Step 3: Deploy workflow hooks
      await this.deployWorkflowHooks();

      // Step 4: Inject META-SKILL (not just skill list!)
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

  async createConfigDirectory() {
    this.log('Creating iFlow config directory...', 'INFO');

    if (!this.dryRun) {
      await fs.mkdir(IFLOW_CONFIG_DIR, { recursive: true });
      await fs.mkdir(IFLOW_HOOKS_DIR, { recursive: true });
    }

    this.log(`✅ Created: ${IFLOW_CONFIG_DIR}`, 'OK');
  }

  async deployWorkflowConfig() {
    this.log('Deploying workflow configuration...', 'INFO');

    const workflowConfig = {
      workflow: {
        enabled: true,
        cross_cli_integration: true,
        superpowers_integration: true,
        meta_skill_enabled: true,
        default_timeout: 30,
        parallel_execution: true,
        error_handling: "continue"
      },
      meta_skill: {
        enabled: true,
        name: "using-iflow-workflows",
        version: "1.0.0",
        type: "methodology-instruction",
        priority: 1,
        inject_at: "session_start"
      },
      superpowers: {
        enabled: true,
        version: "4.1.1",
        skills: [
          "brainstorming",
          "test-driven-development",
          "debugging",
          "collaboration",
          "verification-before-completion"
        ]
      },
      pipeline: {
        stages: [
          {
            name: "skill_activation",
            description: "Activate superpowers skills based on context",
            required: true,
            timeout: 5
          },
          {
            name: "task_planning",
            description: "Plan task execution using activated skills",
            required: true,
            timeout: 15
          },
          {
            name: "execution",
            description: "Execute the task with skill guidance",
            required: true,
            timeout: 30
          },
          {
            name: "verification",
            description: "Verify results before completion",
            required: false,
            timeout: 10
          }
        ]
      },
      hooks: {
        cross_cli: {
          enabled: true,
          auto_detect: true,
          supported_clis: [
            "claude",
            "gemini",
            "qwen",
            "codebuddy",
            "copilot",
            "codex"
          ]
        }
      },
      workflows: {
        brainstorming: {
          description: "Use brainstorming skill before creative work",
          trigger_keywords: ["design", "create", "brainstorm", "plan", "architecture"],
          stages: ["skill_activation", "task_planning", "execution"]
        },
        "test-driven-development": {
          description: "Use TDD workflow for code implementation",
          trigger_keywords: ["implement", "feature", "function", "code", "test"],
          stages: ["skill_activation", "task_planning", "execution", "verification"]
        },
        debugging: {
          description: "Use debugging workflow for troubleshooting",
          trigger_keywords: ["debug", "fix", "error", "issue", "problem", "broken"],
          stages: ["skill_activation", "execution", "verification"]
        }
      }
    };

    if (!this.dryRun) {
      await fs.writeFile(
        IFLOW_WORKFLOW_CONFIG,
        JSON.stringify(workflowConfig, null, 2),
        'utf8'
      );
    }

    this.log(`✅ Deployed: ${IFLOW_WORKFLOW_CONFIG}`, 'OK');
    this.log(`   Meta-skill enabled: ${workflowConfig.meta_skill.name}`, 'INFO');
  }

  async deployWorkflowHooks() {
    this.log('Deploying workflow hooks...', 'INFO');

    // Updated workflow hook that includes meta-skill injection
    const workflowHook = `#!/usr/bin/env python3
"""
iFlow CLI Meta-Skill Hook
Injects complete workflow methodology (not just skills) at session start
"""

import json
import sys
from pathlib import Path

def main():
    # Read meta-skill content
    meta_skill_path = Path.home() / '.iflow' / 'IFLOW.md'

    # Extract meta-skill section (between META_SKILL_START and META_SKILL_END)
    try:
        with open(meta_skill_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find meta-skill section
        start_marker = '<!-- META_SKILL_START -->'
        end_marker = '<!-- META_SKILL_END -->'

        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)

        if start_idx != -1 and end_idx != -1:
            # Extract meta-skill content
            meta_skill = content[start_idx:end_idx + len(end_marker)]

            # Inject to stdout (will be captured by iFlow)
            print(meta_skill)
            print("\\n**Remember: Follow the mandatory protocol before ANY response!**")
        else:
            print("[WARNING] Meta-skill not found in IFLOW.md")
            print("Please ensure meta-skill is properly injected.")

    except Exception as e:
        print(f"[ERROR] Failed to read meta-skill: {e}")

if __name__ == '__main__':
    main()
`;

    if (!this.dryRun) {
      const hookPath = path.join(IFLOW_HOOKS_DIR, 'meta_skill_hook.py');
      await fs.writeFile(hookPath, workflowHook, 'utf-8');

      // Also keep the original workflow hook
      const originalHookPath = path.join(IFLOW_HOOKS_DIR, 'superpowers_workflow.py');
      // This file already exists from previous deployment
    }

    this.log(`✅ Deployed: meta_skill_hook.py`, 'OK');
  }

  async injectMetaSkill() {
    this.log('Injecting META-SKILL into IFLOW.md...', 'INFO');

    // Read the meta-skill template
    const metaSkillPath = path.join(TEMPLATE_DIR, 'using-iflow-workflows.md');

    let metaSkillContent = '';
    try {
      metaSkillContent = await fs.readFile(metaSkillPath, 'utf8');
    } catch (error) {
      this.log(`⚠️  Meta-skill template not found: ${metaSkillPath}`, 'WARN');
      this.log('   Using simplified meta-skill instead', 'INFO');
      // Fall back to simplified meta-skill
      metaSkillContent = `<!-- META_SKILL_START -->
<EXTREMELY_IMPORTANT>
You are using iFlow CLI with Stigmergy workflow integration.

## Mandatory Protocol

Before ANY response, complete this checklist:
☐ 1. Identify task type and complexity
☐ 2. Check if a workflow should be activated
☐ 3. Select appropriate workflow (brainstorming, TDD, debugging)
☐ 4. Follow workflow stages in order
☐ 5. Verify completion before finishing

Available workflows:
- **Brainstorming**: For design, creativity, planning tasks
- **TDD**: For implementation with tests
- **Debugging**: For troubleshooting issues

Remember: Structured workflow execution prevents mistakes and ensures quality.
</EXTREMELY_IMPORTANT>
<!-- META_SKILL_END -->`;
    }

    // Read existing IFLOW.md
    let iflowMdContent = '';
    try {
      iflowMdContent = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
    } catch (error) {
      iflowMdContent = '# iFlow CLI Configuration\n\n';
    }

    // Remove any existing META_SKILL section to prevent duplicates
    iflowMdContent = iflowMdContent.replace(/<!-- META_SKILL_START -->[\s\S]*?<!-- META_SKILL_END -->\n?/g, '');

    // Inject meta-skill at the TOP (before any existing content)
    const injectedContent = metaSkillContent + '\n\n---\n\n' + iflowMdContent;

    if (!this.dryRun) {
      await fs.writeFile(IFLOW_IFLOW_MD, injectedContent, 'utf-8');
    }

    this.log(`✅ Injected meta-skill into: ${IFLOW_IFLOW_MD}`, 'OK');
    this.log(`   Meta-skill length: ${metaSkillContent.length} chars`, 'INFO');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      workflow_config: false,
      meta_skill_hook: false,
      meta_skill_injected: false,
      overall: false
    };

    try {
      // Check workflow config
      const config = JSON.parse(await fs.readFile(IFLOW_WORKFLOW_CONFIG, 'utf8'));
      results.workflow_config = config.workflow?.enabled === true &&
                               config.meta_skill?.enabled === true;
      this.log(`✅ Workflow config: ${results.workflow_config ? 'valid' : 'invalid'}`, 'OK');

      // Check meta-skill hook
      const hookPath = path.join(IFLOW_HOOKS_DIR, 'meta_skill_hook.py');
      try {
        await fs.access(hookPath);
        results.meta_skill_hook = true;
        this.log('✅ Meta-skill hook: deployed', 'OK');
      } catch (e) {
        this.log('⚠️  Meta-skill hook not found', 'WARN');
      }

      // Check meta-skill injection
      const iflowMd = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
      results.meta_skill_injected = iflowMd.includes('<!-- META_SKILL_START -->') &&
                                  iflowMd.includes('using-iflow-workflows');
      this.log(`✅ Meta-skill injection: ${results.meta_skill_injected ? 'deployed' : 'not found'}`, 'OK');

      results.overall = results.workflow_config && results.meta_skill_injected;

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
    this.log('🗑️  Uninstalling iFlow Meta-Skill integration...', 'INFO');

    try {
      // Remove meta-skill section from IFLOW.md
      try {
        let iflowMd = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
        iflowMd = iflowMd.replace(/<!-- META_SKILL_START -->[\s\S]*?<!-- META_SKILL_END -->\n?/, '');
        await fs.writeFile(IFLOW_IFLOW_MD, iflowMd, 'utf8');
        this.log('✅ Removed: meta-skill from IFLOW.md', 'OK');
      } catch (e) {
        this.log('⚠️  Could not update IFLOW.md', 'WARN');
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

  const deployer = new IFlowMetaSkillDeployer(options);

  if (args.includes('--uninstall')) {
    await deployer.uninstall();
  } else if (args.includes('--verify')) {
    const results = await deployer.verifyDeployment();
    console.log('\nVerification Results:', JSON.stringify(results, null, 2));
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

module.exports = IFlowMetaSkillDeployer;
