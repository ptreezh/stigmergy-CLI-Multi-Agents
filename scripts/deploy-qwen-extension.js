#!/usr/bin/env node

/**
 * Qwen CLI Extension Deployment Script
 * Deploys superpowers as a Qwen CLI extension
 *
 * Usage:
 * node scripts/deploy-qwen-extension.js [--verify|--uninstall]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Qwen CLI config paths
const QWEN_CONFIG_DIR = path.join(os.homedir(), '.qwen');
const QWEN_EXTENSIONS_DIR = path.join(QWEN_CONFIG_DIR, 'extensions');
const SUPERPOWERS_EXT_DIR = path.join(QWEN_EXTENSIONS_DIR, 'superpowers-qwen');
const QWEN_QWEN_MD = path.join(QWEN_CONFIG_DIR, 'QWEN.md');

class QwenExtensionDeployer {
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
    this.log('🚀 Starting Qwen Extension deployment...', 'INFO');

    try {
      // Step 1: Create extension directory structure
      await this.createExtensionDirectory();

      // Step 2: Create package.json
      await this.createPackageJson();

      // Step 3: Create main index.js
      await this.createMainIndex();

      // Step 4: Create hooks
      await this.createHooks();

      // Step 5: Copy skills
      await this.copySkills();

      // Step 6: Inject context into QWEN.md
      await this.injectContext();

      // Step 7: Verify deployment
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
    this.log('Creating extension directory structure...', 'INFO');

    if (!this.dryRun) {
      await fs.mkdir(QWEN_CONFIG_DIR, { recursive: true });
      await fs.mkdir(QWEN_EXTENSIONS_DIR, { recursive: true });
      await fs.mkdir(SUPERPOWERS_EXT_DIR, { recursive: true });
      await fs.mkdir(path.join(SUPERPOWERS_EXT_DIR, 'hooks'), { recursive: true });
      await fs.mkdir(path.join(SUPERPOWERS_EXT_DIR, 'skills'), { recursive: true });
    }

    this.log(`✅ Created: ${SUPERPOWERS_EXT_DIR}`, 'OK');
  }

  async createPackageJson() {
    this.log('Creating package.json...', 'INFO');

    const packageJson = {
      name: 'superpowers-qwen',
      version: '4.1.1',
      description: 'Core skills library for Qwen CLI - TDD, debugging, collaboration patterns',
      main: 'index.js',
      qwen: {
        extensionType: 'skills',
        version: '1.0.0',
        enabled: true,
        priority: 100
      },
      superpowers: {
        version: '4.1.1',
        skills: [
          'brainstorming',
          'test-driven-development',
          'debugging',
          'collaboration',
          'verification-before-completion'
        ]
      },
      hooks: {
        sessionStart: './hooks/session-start.js',
        prePrompt: './hooks/pre-prompt.js'
      },
      skills: [
        {
          name: 'brainstorming',
          file: './skills/brainstorming.md',
          trigger_keywords: ['design', 'create', 'brainstorm', 'plan', 'architecture'],
          description: 'Use before any creative work to explore ideas and approaches'
        },
        {
          name: 'test-driven-development',
          file: './skills/tdd.md',
          trigger_keywords: ['implement', 'feature', 'function', 'code', 'test'],
          description: 'Follow TDD workflow: write tests first, then implement'
        },
        {
          name: 'debugging',
          file: './skills/debugging.md',
          trigger_keywords: ['debug', 'fix', 'error', 'issue', 'problem', 'broken'],
          description: 'Systematic debugging: analyze, isolate, fix, verify'
        },
        {
          name: 'collaboration',
          file: './skills/collaboration.md',
          trigger_keywords: ['team', 'review', 'discuss', 'share', 'collaborate'],
          description: 'Effective collaboration patterns for team projects'
        },
        {
          name: 'verification-before-completion',
          file: './skills/verification.md',
          trigger_keywords: ['done', 'finish', 'complete', 'ready'],
          description: 'Verify work is complete and correct before finishing'
        }
      ],
      author: {
        name: 'Jesse Vincent',
        email: 'jesse@fsck.com'
      },
      repository: {
        type: 'git',
        url: 'https://github.com/obra/superpowers'
      },
      license: 'MIT',
      keywords: ['skills', 'tdd', 'debugging', 'collaboration', 'qwen-cli']
    };

    if (!this.dryRun) {
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'package.json'),
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
    }

    this.log(`✅ Created: package.json`, 'OK');
    this.log(`   Skills: ${packageJson.skills.length}`, 'INFO');
  }

  async createMainIndex() {
    this.log('Creating main index.js...', 'INFO');

    const indexJs = `/**
 * Superpowers Qwen Extension - Main Entry Point
 * Provides core skills for Qwen CLI
 */

const path = require('path');
const fs = require('fs');

class SuperpowersExtension {
  constructor(qwenAPI) {
    this.qwen = qwenAPI;
    this.version = '4.1.1';
    this.name = 'superpowers-qwen';
    this.skills = [];
    this.hooks = [];
  }

  /**
   * Initialize the extension
   */
  async initialize() {
    // Load skills
    await this.loadSkills();

    // Register hooks
    await this.registerHooks();

    console.log(\`[Superpowers] v\${this.version} loaded with \${this.skills.length} skills\`);

    return {
      name: this.name,
      version: this.version,
      skills: this.skills.map(s => s.name),
      hooks: this.hooks.length
    };
  }

  /**
   * Load all skills from skills directory
   */
  async loadSkills() {
    const skillsDir = path.join(__dirname, 'skills');

    try {
      const files = await fs.readdir(skillsDir);
      const skillFiles = files.filter(f => f.endsWith('.md'));

      for (const file of skillFiles) {
        const skillPath = path.join(skillsDir, file);
        const content = await fs.readFile(skillPath, 'utf8');

        const skillName = path.basename(file, '.md');
        this.skills.push({
          name: skillName,
          content: content,
          path: skillPath
        });
      }

      console.log(\`[Superpowers] Loaded \${this.skills.length} skills\`);
    } catch (error) {
      console.error(\`[Superpowers] Failed to load skills: \${error.message}\`);
    }
  }

  /**
   * Register extension hooks
   */
  async registerHooks() {
    // Session start hook
    const sessionStartHook = {
      event: 'sessionStart',
      handler: async (context) => {
        return this.onSessionStart(context);
      }
    };

    this.hooks.push(sessionStartHook);
  }

  /**
   * Session start hook handler
   */
  async onSessionStart(context) {
    const skillsList = this.skills.map(s => \`- \${s.name}\`).join('\\n');

    return \`
<!-- SUPERPOWERS_START -->
## Superpowers Skills Available

You have access to \${this.skills.length} superpowers skills:

\${skillsList}

These skills will be automatically activated based on your task context.
<!-- SUPERPOWERS_END -->
\`;
  }

  /**
   * Get skill by name
   */
  getSkill(name) {
    return this.skills.find(s => s.name === name);
  }

  /**
   * Get all skills
   */
  getAllSkills() {
    return this.skills;
  }
}

/**
 * Extension entry point - called by Qwen CLI
 */
module.exports = async function(qwenAPI) {
  const extension = new SuperpowersExtension(qwenAPI);
  return await extension.initialize();
};

/**
 * Export for direct usage
 */
module.exports.SuperpowersExtension = SuperpowersExtension;
`;

    if (!this.dryRun) {
      await fs.writeFile(
        path.join(SUPERPOWERS_EXT_DIR, 'index.js'),
        indexJs,
        'utf8'
      );
    }

    this.log(`✅ Created: index.js`, 'OK');
  }

  async createHooks() {
    this.log('Creating hooks...', 'INFO');

    // Session start hook
    const sessionStartHook = `/**
 * Session Start Hook
 * Injects superpowers context when Qwen CLI starts
 */

module.exports = async function(context) {
  const { version, skills } = require('../package.json').superpowers;

  const skillsList = skills.map(s => \`- **\${s}**\`).join('\\n');

  return \`
<EXTREMELY_IMPORTANT>
You have superpowers.

**Superpowers v\${version} is enabled for Qwen CLI.**

Available skills:
\${skillsList}

When a task requires specific expertise, the appropriate skill will be automatically activated.
</EXTREMELY_IMPORTANT>
\`;
};
`;

    // Pre-prompt hook
    const prePromptHook = `/**
 * Pre-Prompt Hook
 * Analyzes user input and activates appropriate skills
 */

const SKILL_PATTERNS = {
  brainstorming: ['design', 'create', 'brainstorm', 'plan', 'architecture'],
  'test-driven-development': ['implement', 'feature', 'function', 'code', 'test'],
  debugging: ['debug', 'fix', 'error', 'issue', 'problem', 'broken'],
  collaboration: ['team', 'review', 'discuss', 'share', 'collaborate'],
  'verification-before-completion': ['done', 'finish', 'complete', 'ready']
};

module.exports = async function(userInput, context) {
  const input = userInput.toLowerCase();

  // Find matching skills
  const matchedSkills = [];
  for (const [skill, keywords] of Object.entries(SKILL_PATTERNS)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      matchedSkills.push(skill);
    }
  }

  if (matchedSkills.length > 0) {
    return \`
<!-- SKILL_ACTIVATION -->
Detected task context requires: \${matchedSkills.join(', ')}
Activating appropriate superpowers skills...
<!-- SKILL_ACTIVATION_END -->
\`;
  }

  return null;
};
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

    this.log(`✅ Created: hooks/session-start.js`, 'OK');
    this.log(`✅ Created: hooks/pre-prompt.js`, 'OK');
  }

  async copySkills() {
    this.log('Copying skill files...', 'INFO');

    // Skill definitions (simplified versions)
    const skills = {
      'brainstorming.md': `# Brainstorming

You MUST use this skill before any creative work.

## Purpose
Explore ideas and approaches before committing to implementation.

## Process
1. **Diverge**: Generate multiple options (3-5 alternatives)
2. **Explore**: Analyze pros/cons of each approach
3. **Converge**: Select best approach with reasoning
4. **Document**: Record decision rationale

## Triggers
- design, create, brainstorm, plan, architecture`,

      'tdd.md': `# Test-Driven Development

You MUST use this skill when implementing features.

## Process
1. **Write Test First**: Before any implementation
2. **Run Test**: Verify it fails (red)
3. **Implement**: Write minimal code to pass
4. **Run Test**: Verify it passes (green)
5. **Refactor**: Clean up while tests pass

## Triggers
- implement, feature, function, code, test`,

      'debugging.md': `# Debugging

You MUST use this skill when troubleshooting.

## Process
1. **Understand**: Reproduce and understand the problem
2. **Isolate**: Find the root cause
3. **Fix**: Apply minimal fix
4. **Verify**: Confirm fix works

## Triggers
- debug, fix, error, issue, problem, broken`,

      'collaboration.md': `# Collaboration

You MUST use this skill when working with teams.

## Process
1. **Communicate**: Share context and progress
2. **Review**: Request and provide feedback
3. **Document**: Keep clear records
4. **Coordinate**: Align with team goals

## Triggers
- team, review, discuss, share, collaborate`,

      'verification.md': `# Verification Before Completion

You MUST use this skill before finishing work.

## Checklist
- [ ] Code/tests pass
- [ ] No obvious bugs/issues
- [ ] Meets requirements
- [ ] Documentation updated
- [ ] Ready for review/deployment

## Triggers
- done, finish, complete, ready`
    };

    if (!this.dryRun) {
      for (const [filename, content] of Object.entries(skills)) {
        await fs.writeFile(
          path.join(SUPERPOWERS_EXT_DIR, 'skills', filename),
          content,
          'utf8'
        );
      }
    }

    this.log(`✅ Copied: ${Object.keys(skills).length} skill files`, 'OK');
  }

  async injectContext() {
    this.log('Injecting context into QWEN.md...', 'INFO');

    // Read existing QWEN.md or create new
    let qwenMdContent = '';
    try {
      qwenMdContent = await fs.readFile(QWEN_QWEN_MD, 'utf8');
    } catch (error) {
      qwenMdContent = '# Qwen CLI Configuration\n\n';
    }

    // Prepare skills section
    const skillsSection = `<!-- SKILLS_START -->
<skills_system priority="1">

## Superpowers Extension for Qwen CLI

Superpowers v4.1.1 provides core skills for enhanced productivity.

<usage>
The extension will automatically activate appropriate skills based on your task context.

**Available Skills**:
- **brainstorming**: Use before creative work
- **test-driven-development**: Use when implementing features
- **debugging**: Use when troubleshooting issues
- **collaboration**: Use when working with teams
- **verification**: Use before completing work
</usage>

<available_skills>

<skill>
<name>brainstorming</name>
<description>Use before any creative work to explore ideas and approaches</description>
<location>superpowers-qwen</location>
<trigger_keywords>design, create, brainstorm, plan, architecture</trigger_keywords>
<file>./skills/brainstorming.md</file>
</skill>

<skill>
<name>test-driven-development</name>
<description>Follow TDD workflow: write tests first, then implement</description>
<location>superpowers-qwen</location>
<trigger_keywords>implement, feature, function, code, test</trigger_keywords>
<file>./skills/tdd.md</file>
</skill>

<skill>
<name>debugging</name>
<description>Systematic debugging: analyze, isolate, fix, verify</description>
<location>superpowers-qwen</location>
<trigger_keywords>debug, fix, error, issue, problem, broken</trigger_keywords>
<file>./skills/debugging.md</file>
</skill>

<skill>
<name>collaboration</name>
<description>Effective collaboration patterns for team projects</description>
<location>superpowers-qwen</location>
<trigger_keywords>team, review, discuss, share, collaborate</trigger_keywords>
<file>./skills/collaboration.md</file>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Verify work is complete and correct before finishing</description>
<location>superpowers-qwen</location>
<trigger_keywords>done, finish, complete, ready</trigger_keywords>
<file>./skills/verification.md</file>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->`;

    // Check if skills section already exists
    if (qwenMdContent.includes('<!-- SKILLS_START -->')) {
      // Append superpowers skills to existing available_skills section
      const availableSkillsEnd = '</available_skills>';
      const insertIndex = qwenMdContent.indexOf(availableSkillsEnd);

      if (insertIndex !== -1) {
        // Prepare superpowers skills to insert
        const superpowersSkills = `
<skill>
<name>brainstorming</name>
<description>Use before any creative work to explore ideas and approaches</description>
<location>superpowers-qwen</location>
<trigger_keywords>design, create, brainstorm, plan, architecture</trigger_keywords>
</skill>

<skill>
<name>test-driven-development</name>
<description>Follow TDD workflow: write tests first, then implement</description>
<location>superpowers-qwen</location>
<trigger_keywords>implement, feature, function, code, test</trigger_keywords>
</skill>

<skill>
<name>debugging</name>
<description>Systematic debugging: analyze, isolate, fix, verify</description>
<location>superpowers-qwen</location>
<trigger_keywords>debug, fix, error, issue, problem, broken</trigger_keywords>
</skill>

<skill>
<name>collaboration</name>
<description>Effective collaboration patterns for team projects</description>
<location>superpowers-qwen</location>
<trigger_keywords>team, review, discuss, share, collaborate</trigger_keywords>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Verify work is complete and correct before finishing</description>
<location>superpowers-qwen</location>
<trigger_keywords>done, finish, complete, ready</trigger_keywords>
</skill>
`;
        qwenMdContent = qwenMdContent.slice(0, insertIndex) + superpowersSkills + qwenMdContent.slice(insertIndex);
      } else {
        // Fallback: replace entire section
        qwenMdContent = qwenMdContent.replace(
          /<!-- SKILLS_START -->[\\s\\S]*?<!-- SKILLS_END -->/,
          skillsSection
        );
      }
    } else {
      // Append to end
      qwenMdContent += '\\n\\n' + skillsSection + '\\n';
    }

    if (!this.dryRun) {
      await fs.writeFile(QWEN_QWEN_MD, qwenMdContent, 'utf8');
    }

    this.log(`✅ Injected context into: ${QWEN_QWEN_MD}`, 'OK');
  }

  async verifyDeployment() {
    this.log('Verifying deployment...', 'INFO');

    const results = {
      extension_dir: false,
      package_json: false,
      index_js: false,
      hooks: false,
      skills: false,
      context_injection: false,
      overall: false
    };

    try {
      // Check extension directory
      await fs.access(SUPERPOWERS_EXT_DIR);
      results.extension_dir = true;
      this.log('✅ Extension directory exists', 'OK');

      // Check package.json
      const packagePath = path.join(SUPERPOWERS_EXT_DIR, 'package.json');
      await fs.access(packagePath);
      const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
      results.package_json = pkg.name === 'superpowers-qwen';
      this.log(`✅ package.json: ${results.package_json ? 'valid' : 'invalid'}`, 'OK');

      // Check index.js
      const indexPath = path.join(SUPERPOWERS_EXT_DIR, 'index.js');
      await fs.access(indexPath);
      results.index_js = true;
      this.log('✅ index.js exists', 'OK');

      // Check hooks
      await fs.access(path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'session-start.js'));
      await fs.access(path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'pre-prompt.js'));
      results.hooks = true;
      this.log('✅ Hooks deployed', 'OK');

      // Check skills
      const skillsDir = path.join(SUPERPOWERS_EXT_DIR, 'skills');
      const files = await fs.readdir(skillsDir);
      results.skills = files.filter(f => f.endsWith('.md')).length === 5;
      this.log(`✅ Skills: ${results.skills ? '5/5' : 'missing'}`, 'OK');

      // Check context injection
      const qwenMd = await fs.readFile(QWEN_QWEN_MD, 'utf8');
      results.context_injection = qwenMd.includes('<!-- SKILLS_START -->') &&
                                  qwenMd.includes('superpowers-qwen');
      this.log(`✅ Context injection: ${results.context_injection ? 'deployed' : 'not found'}`, 'OK');

      results.overall = Object.values(results).slice(0, -1).every(r => r === true);

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
    this.log('🗑️  Uninstalling Qwen extension...', 'INFO');

    try {
      // Remove extension directory
      try {
        await fs.rm(SUPERPOWERS_EXT_DIR, { recursive: true, force: true });
        this.log(`✅ Removed: ${SUPERPOWERS_EXT_DIR}`, 'OK');
      } catch (e) {
        this.log(`⚠️  Extension directory not found: ${SUPERPOWERS_EXT_DIR}`, 'WARN');
      }

      // Remove skills section from QWEN.md
      try {
        let qwenMd = await fs.readFile(QWEN_QWEN_MD, 'utf8');
        qwenMd = qwenMd.replace(/<!-- SKILLS_START -->[\\s\\S]*?<!-- SKILLS_END -->\\n?/, '');
        await fs.writeFile(QWEN_QWEN_MD, qwenMd, 'utf8');
        this.log('✅ Removed: skills section from QWEN.md', 'OK');
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

  const deployer = new QwenExtensionDeployer(options);

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

module.exports = QwenExtensionDeployer;
