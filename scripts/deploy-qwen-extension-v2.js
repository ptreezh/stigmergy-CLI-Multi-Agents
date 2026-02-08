#!/usr/bin/env node

/**
 * Qwen CLI Meta-Skill Deployment Script (Version 2)
 * Deploys complete methodology (using-superpowers style) for Qwen extensions
 *
 * Usage:
 * node scripts/deploy-qwen-extension-v2.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Qwen CLI config paths
const QWEN_CONFIG_DIR = path.join(os.homedir(), '.qwen');
const QWEN_EXTENSIONS_DIR = path.join(QWEN_CONFIG_DIR, 'extensions');
const SUPERPOWERS_EXT_DIR = path.join(QWEN_EXTENSIONS_DIR, 'superpowers-qwen');
const QWEN_QWEN_MD = path.join(QWEN_CONFIG_DIR, 'QWEN.md');
const TEMPLATE_DIR = path.join(process.cwd(), 'templates');

class QwenMetaSkillDeployer {
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
    this.log('🚀 Starting Qwen Meta-Skill deployment...', 'INFO');

    try {
      // Step 1: Create extension directory
      await this.createExtensionDirectory();

      // Step 2: Create package.json
      await this.createPackageJson();

      // Step 3: Create main index.js
      await this.createMainIndex();

      // Step 4: Create hooks
      await this.createHooks();

      // Step 5: Inject META-SKILL (not just skill list!)
      await this.injectMetaSkill();

      // Step 6: Verify deployment
      const verification = await this.verifyDeployment();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      this.log(`✅ Deployment completed in ${duration}s`, 'INFO');

      return verification;
    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createExtensionDirectory() {
    this.log('Creating Qwen extension directory...', 'INFO');

    if (!this.dryRun) {
      await fs.mkdir(SUPERPOWERS_EXT_DIR, { recursive: true });
      await fs.mkdir(path.join(SUPERPOWERS_EXT_DIR, 'hooks'), { recursive: true });
    }

    this.log(`✅ Created: ${SUPERPOWERS_EXT_DIR}`, 'OK');
  }

  async createPackageJson() {
    this.log('Creating package.json...', 'INFO');

    const packageJson = {
      name: 'superpowers-qwen',
      version: '2.0.0',
      description: 'Complete workflow methodology for Qwen CLI',
      main: 'index.js',
      keywords: ['qwen', 'extension', 'workflow', 'meta-skill'],
      author: 'Stigmergy Project',
      license: 'MIT',
      qwen: {
        type: 'extension',
        version: '1.0.0',
        hooks: ['sessionStart', 'prePrompt']
      }
    };

    if (!this.dryRun) {
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
    }

    this.log('✅ Created: package.json', 'OK');
  }

  async createMainIndex() {
    this.log('Creating main index.js...', 'INFO');

    const indexJs = `/**
 * Qwen Superpowers Extension - Main Entry Point
 * Provides complete workflow methodology for Qwen CLI
 */

class SuperpowersExtension {
  constructor(qwen) {
    this.qwen = qwen;
    this.name = 'superpowers-qwen';
    this.version = '2.0.0';
  }

  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: 'Complete workflow methodology for Qwen CLI',
      capabilities: [
        'sessionStart: Inject meta-skill methodology',
        'prePrompt: Auto-activate workflows based on context'
      ]
    };
  }

  async onSessionStart() {
    // Called when Qwen session starts
    // Meta-skill is injected via session-start.js hook
    return {
      activated: true,
      metaSkill: 'using-qwen-extensions'
    };
  }

  async onPrePrompt(prompt) {
    // Analyze prompt and suggest workflow activation
    const workflows = {
      brainstorming: ['design', 'create', 'brainstorm', 'plan', 'architecture'],
      tdd: ['implement', 'feature', 'function', 'code', 'test'],
      debugging: ['debug', 'fix', 'error', 'issue', 'problem', 'broken']
    };

    for (const [workflow, keywords] of Object.entries(workflows)) {
      if (keywords.some(kw => prompt.toLowerCase().includes(kw))) {
        return {
          suggestedWorkflow: workflow,
          reason: \`Detected trigger keywords: \${keywords.filter(kw => prompt.toLowerCase().includes(kw)).join(', ')}\`
        };
      }
    }

    return { suggestedWorkflow: null };
  }
}

module.exports = SuperpowersExtension;
`;

    if (!this.dryRun) {
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'index.js'),
        indexJs,
        'utf8'
      );
    }

    this.log('✅ Created: index.js', 'OK');
  }

  async createHooks() {
    this.log('Creating extension hooks...', 'INFO');

    // Session start hook - outputs meta-skill location
    const sessionStartHook = `#!/usr/bin/env node
/**
 * Session Start Hook
 * Injects meta-skill at Qwen session start
 */

const path = require('path');
const os = require('os');

function main() {
  const qwenMd = path.join(os.homedir(), '.qwen', 'QWEN.md');

  console.log('Meta-skill location:', qwenMd);
  console.log('Please ensure using-qwen-extensions meta-skill is loaded.');
}

if (require.main === module) {
  main();
}

module.exports = main;
`;

    // Pre-prompt hook - analyzes input for workflow activation
    const prePromptHook = `#!/usr/bin/env node
/**
 * Pre-Prompt Hook
 * Analyzes user input and suggests workflow activation
 */

function analyzePrompt(prompt) {
  const workflows = {
    brainstorming: ['design', 'create', 'brainstorm', 'plan', 'architecture'],
    tdd: ['implement', 'feature', 'function', 'code', 'test'],
    debugging: ['debug', 'fix', 'error', 'issue', 'problem', 'broken']
  };

  for (const [workflow, keywords] of Object.entries(workflows)) {
    if (keywords.some(kw => prompt.toLowerCase().includes(kw))) {
      return {
        workflow: workflow,
        activate: true,
        reason: \`Trigger keywords detected: \${keywords.filter(kw => prompt.toLowerCase().includes(kw)).join(', ')}\`
      };
    }
  }

  return { workflow: null, activate: false };
}

function main() {
  const prompt = process.argv[2] || '';
  const analysis = analyzePrompt(prompt);

  if (analysis.activate) {
    console.log(\`[Workflow] Suggest activating: \${analysis.workflow}\`);
    console.log(\`[Reason] \${analysis.reason}\`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzePrompt };
`;

    if (!this.dryRun) {
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'session-start.js'),
        sessionStartHook,
        'utf8'
      );
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'pre-prompt.js'),
        prePromptHook,
        'utf8'
      );
    }

    this.log('✅ Created: hooks/session-start.js', 'OK');
    this.log('✅ Created: hooks/pre-prompt.js', 'OK');
  }

  async injectMetaSkill() {
    this.log('Injecting META-SKILL into QWEN.md...', 'INFO');

    // Read the meta-skill template
    const metaSkillPath = path.join(TEMPLATE_DIR, 'using-qwen-extensions.md');

    let metaSkillContent = '';
    try {
      metaSkillContent = await fs.readFile(metaSkillPath, 'utf8');
    } catch (error) {
      this.log(`⚠️  Meta-skill template not found: ${metaSkillPath}`, 'WARN');
      this.log('   Using simplified meta-skill instead', 'INFO');
      // Fall back to simplified meta-skill
      metaSkillContent = `<!-- META_SKILL_START -->
<EXTREMELY_IMPORTANT>
You are using Qwen CLI with Stigmergy extension integration.

## Mandatory Protocol

Before ANY response, complete this checklist:
☐ 1. Identify task type and complexity
☐ 2. Check if an extension should be activated
☐ 3. Select appropriate extension/workflow
☐ 4. Follow the methodology in order
☐ 5. Verify completion before finishing

Available extensions:
- **Brainstorming**: For design, creativity, planning
- **TDD**: For implementation with tests
- **Debugging**: For troubleshooting issues

Remember: Structured workflow execution prevents mistakes and ensures quality.
</EXTREMELY_IMPORTANT>
<!-- META_SKILL_END -->`;
    }

    // Read existing QWEN.md
    let qwenMdContent = '';
    try {
      qwenMdContent = await fs.readFile(QWEN_QWEN_MD, 'utf8');
    } catch (error) {
      qwenMdContent = '# Qwen CLI Configuration\n\n';
    }

    // Remove any existing META_SKILL section to prevent duplicates
    qwenMdContent = qwenMdContent.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');

    // Inject meta-skill at the TOP (before any existing content)
    const injectedContent = metaSkillContent + '\\n\\n---\\n\\n' + qwenMdContent;

    if (!this.dryRun) {
      await fs.writeFile(QWEN_QWEN_MD, injectedContent, 'utf-8');
    }

    this.log(`✅ Injected meta-skill into: ${QWEN_QWEN_MD}`, 'OK');
    this.log(`   Meta-skill length: ${metaSkillContent.length} chars`, 'INFO');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      extension_dir: false,
      package_json: false,
      main_index: false,
      meta_skill_injected: false,
      overall: false
    };

    try {
      // Check extension directory
      try {
        await fs.access(SUPERPOWERS_EXT_DIR);
        results.extension_dir = true;
        this.log('✅ Extension directory: deployed', 'OK');
      } catch (e) {
        this.log('⚠️  Extension directory not found', 'WARN');
      }

      // Check package.json
      try {
        const pkg = JSON.parse(await fs.readFile(path.join(SUPERPOWERS_EXT_DIR, 'package.json'), 'utf8'));
        results.package_json = pkg.name === 'superpowers-qwen';
        this.log(`✅ package.json: ${results.package_json ? 'valid' : 'invalid'}`, 'OK');
      } catch (e) {
        this.log('⚠️  package.json not found', 'WARN');
      }

      // Check main index.js
      try {
        await fs.access(path.join(SUPERPOWERS_EXT_DIR, 'index.js'));
        results.main_index = true;
        this.log('✅ Main index.js: deployed', 'OK');
      } catch (e) {
        this.log('⚠️  Main index.js not found', 'WARN');
      }

      // Check meta-skill injection
      const qwenMd = await fs.readFile(QWEN_QWEN_MD, 'utf8');
      results.meta_skill_injected = qwenMd.includes('<!-- META_SKILL_START -->') &&
                                  qwenMd.includes('using-qwen-extensions');
      this.log(`✅ Meta-skill injection: ${results.meta_skill_injected ? 'deployed' : 'not found'}`, 'OK');

      results.overall = results.extension_dir && results.package_json && results.meta_skill_injected;

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
    this.log('🗑️  Uninstalling Qwen Meta-Skill integration...', 'INFO');

    try {
      // Remove meta-skill section from QWEN.md
      try {
        let qwenMd = await fs.readFile(QWEN_QWEN_MD, 'utf8');
        qwenMd = qwenMd.replace(/<!-- META_SKILL_START -->[\\s\\S]*?<!-- META_SKILL_END -->\\n?/g, '');
        await fs.writeFile(QWEN_QWEN_MD, qwenMd, 'utf8');
        this.log('✅ Removed: meta-skill from QWEN.md', 'OK');
      } catch (e) {
        this.log('⚠️  Could not update QWEN.md', 'WARN');
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

  const deployer = new QwenMetaSkillDeployer(options);

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

module.exports = QwenMetaSkillDeployer;
