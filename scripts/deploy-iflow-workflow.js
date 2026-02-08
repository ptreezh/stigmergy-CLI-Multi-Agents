#!/usr/bin/env node

/**
 * iFlow CLI Workflow Deployment Script
 * Deploys superpowers integration using iFlow's Workflow Pipeline system
 *
 * Usage:
 * node scripts/deploy-iflow-workflow.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// iFlow CLI config paths
const IFLOW_CONFIG_DIR = path.join(os.homedir(), '.iflow');
const IFLOW_WORKFLOW_CONFIG = path.join(IFLOW_CONFIG_DIR, 'workflow_config.json');
const IFLOW_HOOKS_DIR = path.join(IFLOW_CONFIG_DIR, 'hooks');
const IFLOW_IFLOW_MD = path.join(IFLOW_CONFIG_DIR, 'IFLOW.md');

class IFlowWorkflowDeployer {
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
    this.log('🚀 Starting iFlow Workflow deployment...', 'INFO');

    try {
      // Step 1: Create config directory
      await this.createConfigDirectory();

      // Step 2: Deploy workflow configuration
      await this.deployWorkflowConfig();

      // Step 3: Deploy workflow hooks
      await this.deployWorkflowHooks();

      // Step 4: Inject context into IFLOW.md
      await this.injectContext();

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
        default_timeout: 30,
        parallel_execution: true,
        error_handling: "continue"
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
        ],
        hooks: {
          on_workflow_start: "hooks/superpowers_workflow.py",
          on_stage_complete: "hooks/superpowers_stage.py"
        }
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
    this.log(`   Workflows: ${Object.keys(workflowConfig.workflows).join(', ')}`, 'INFO');
  }

  async deployWorkflowHooks() {
    this.log('Deploying workflow hooks...', 'INFO');

    // Superpowers workflow hook (Python)
    const workflowHook = `#!/usr/bin/env python3
"""
iFlow CLI Superpowers Workflow Hook
Triggered on workflow start to activate appropriate skills
"""

import json
import sys
from pathlib import Path

def main():
    # Read workflow config
    config_path = Path.home() / '.iflow' / 'workflow_config.json'

    if not config_path.exists():
        print("[INFO] No workflow config found")
        return

    with open(config_path, 'r') as f:
        config = json.load(f)

    superpowers = config.get('superpowers', {})

    if not superpowers.get('enabled', False):
        print("[INFO] Superpowers not enabled")
        return

    skills = superpowers.get('skills', [])
    print(f"[INFO] Superpowers enabled with {len(skills)} skills")
    print(f"[INFO] Available skills: {', '.join(skills)}")

    # Output skill activation context
    print("\\n<!-- SUPERPOWERS_START -->")
    print(f"## Superpowers Skills Available\\n")
    print(f"You have access to {len(skills)} superpowers skills:")
    print(f"- {', '.join(skills)}")
    print("\\nUse these skills to enhance your workflow!")
    print("<!-- SUPERPOWERS_END -->\\n")

if __name__ == '__main__':
    main()
`;

    if (!this.dryRun) {
      const hookPath = path.join(IFLOW_HOOKS_DIR, 'superpowers_workflow.py');
      await fs.writeFile(hookPath, workflowHook, 'utf8');

      // Make executable on Unix
      try {
        const { execSync } = require('child_process');
        execSync(`chmod +x "${hookPath}"`);
      } catch (e) {
        // Ignore on Windows
      }
    }

    this.log(`✅ Deployed: ${IFLOW_HOOKS_DIR}/superpowers_workflow.py`, 'OK');
  }

  async injectContext() {
    this.log('Injecting context into IFLOW.md...', 'INFO');

    // Read existing IFLOW.md or create new
    let iflowMdContent = '';
    try {
      iflowMdContent = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
    } catch (error) {
      iflowMdContent = '# iFlow CLI Configuration\n\n';
    }

    // Prepare skills section
    const skillsSection = `<!-- SKILLS_START -->
<skills_system priority="1">

## Superpowers Skills for iFlow

Superpowers provides core skills for enhanced productivity:

<usage>
When a task requires specific expertise, activate these skills:

**Brainstorming**: Use before creative work (design, architecture, planning)
**Test-Driven Development**: Use when implementing features
**Debugging**: Use when troubleshooting issues
**Collaboration**: Use when working with teams
**Verification**: Use before completing work

Activation: Workflow system automatically detects context and activates appropriate skills.
</usage>

<available_skills>

<skill>
<name>brainstorming</name>
<description>Use before any creative work to explore ideas and approaches</description>
<location>superpowers</location>
<trigger_keywords>design, create, brainstorm, plan, architecture</trigger_keywords>
</skill>

<skill>
<name>test-driven-development</name>
<description>Follow TDD workflow: write tests first, then implement</description>
<location>superpowers</location>
<trigger_keywords>implement, feature, function, code, test</trigger_keywords>
</skill>

<skill>
<name>debugging</name>
<description>Systematic debugging: analyze, isolate, fix, verify</description>
<location>superpowers</location>
<trigger_keywords>debug, fix, error, issue, problem, broken</trigger_keywords>
</skill>

<skill>
<name>collaboration</name>
<description>Effective collaboration patterns for team projects</description>
<location>superpowers</location>
<trigger_keywords>team, review, discuss, share, collaborate</trigger_keywords>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Verify work is complete and correct before finishing</description>
<location>superpowers</location>
<trigger_keywords>done, finish, complete, ready</trigger_keywords>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->`;

    // Check if skills section already exists
    if (iflowMdContent.includes('<!-- SKILLS_START -->')) {
      // Replace existing section
      iflowMdContent = iflowMdContent.replace(
        /<!-- SKILLS_START -->[\s\S]*?<!-- SKILLS_END -->/,
        skillsSection
      );
    } else {
      // Append to end
      iflowMdContent += '\n\n' + skillsSection + '\n';
    }

    if (!this.dryRun) {
      await fs.writeFile(IFLOW_IFLOW_MD, iflowMdContent, 'utf8');
    }

    this.log(`✅ Injected context into: ${IFLOW_IFLOW_MD}`, 'OK');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      workflow_config: false,
      workflow_hooks: false,
      context_injection: false,
      overall: false
    };

    try {
      // Check workflow config
      await fs.access(IFLOW_WORKFLOW_CONFIG);
      const config = JSON.parse(await fs.readFile(IFLOW_WORKFLOW_CONFIG, 'utf8'));
      results.workflow_config = config.superpowers?.enabled === true;
      this.log(`✅ Workflow config: ${results.workflow_config ? 'valid' : 'invalid'}`, 'OK');

      // Check workflow hooks
      const hookPath = path.join(IFLOW_HOOKS_DIR, 'superpowers_workflow.py');
      await fs.access(hookPath);
      results.workflow_hooks = true;
      this.log('✅ Workflow hooks: deployed', 'OK');

      // Check context injection
      const iflowMd = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
      results.context_injection = iflowMd.includes('<!-- SKILLS_START -->');
      this.log(`✅ Context injection: ${results.context_injection ? 'deployed' : 'not found'}`, 'OK');

      results.overall = results.workflow_config && results.workflow_hooks && results.context_injection;

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
    this.log('🗑️  Uninstalling iFlow Workflow integration...', 'INFO');

    try {
      // Remove workflow config
      try {
        await fs.unlink(IFLOW_WORKFLOW_CONFIG);
        this.log(`✅ Removed: ${IFLOW_WORKFLOW_CONFIG}`, 'OK');
      } catch (e) {
        this.log(`⚠️  Workflow config not found: ${IFLOW_WORKFLOW_CONFIG}`, 'WARN');
      }

      // Remove workflow hooks
      try {
        const hookPath = path.join(IFLOW_HOOKS_DIR, 'superpowers_workflow.py');
        await fs.unlink(hookPath);
        this.log('✅ Removed: workflow hooks', 'OK');
      } catch (e) {
        this.log('⚠️  Workflow hooks not found', 'WARN');
      }

      // Remove skills section from IFLOW.md
      try {
        let iflowMd = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
        iflowMd = iflowMd.replace(/<!-- SKILLS_START -->[\s\S]*?<!-- SKILLS_END -->\n?/, '');
        await fs.writeFile(IFLOW_IFLOW_MD, iflowMd, 'utf8');
        this.log('✅ Removed: skills section from IFLOW.md', 'OK');
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

  const deployer = new IFlowWorkflowDeployer(options);

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

module.exports = IFlowWorkflowDeployer;
