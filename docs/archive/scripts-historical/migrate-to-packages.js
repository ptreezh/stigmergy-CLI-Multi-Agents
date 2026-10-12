#!/usr/bin/env node
/**
 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };
/**
 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };

 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };

 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };
/**
 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  // Create directory structure
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  // Copy sources
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  // Copy skills
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  // Write package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  
  // Create index file
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  // Create directory structure
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  // Copy sources
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  // Write package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  
  // Create index file
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  // Create main directory structure
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  // Create domain packages
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    // Copy skills
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    // Write domain package.json
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  // Write main package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  // Create AgentBase
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  // Create SkillLoader
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  // Create index file
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  // Ensure packages array includes new packages
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };

 * Stigmergy Package Migration Script
 * Migrates components from src/ to packages/ following three-package decomposition
 */

const fs = require('fs-extra');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIGRATION_PLAN = {
  base: {
    name: '@stigmergy/base',
    target: 'packages/base',
    sources: [
      { from: 'src/core/smart_router.js', to: 'src/core/smart_router.js' },
      { from: 'src/core/memory_manager.js', to: 'src/core/memory_manager.js' },
      { from: 'src/core/cli_path_detector.js', to: 'src/core/cli_path_detector.js' },
      { from: 'src/adapters', to: 'src/adapters' },
      { from: 'src/core/coordination', to: 'src/coordination' },
      { from: 'src/core/plugins', to: 'src/plugins' },
    ],
    skills: [
      'packages/scenarios/base/skills/planning-with-files',
      'packages/scenarios/base/skills/resumesession',
      'packages/scenarios/base/skills/skill-from-masters',
    ]
  },
  ui: {
    name: '@stigmergy/ui',
    target: 'packages/ui',
    sources: [
      { from: 'src/gateway', to: 'src/gateway' },
      { from: 'src/interactive', to: 'src/interactive' },
      { from: 'src/orchestration', to: 'src/orchestration' },
    ]
  },
  professional: {
    name: '@stigmergy/professional',
    target: 'packages/professional',
    domains: {
      academic: {
        name: '@stigmergy/domain-academic',
        skills: [
          'skills/ant',
          'skills/field-expert',
          'skills/grounded-theory-expert',
          'skills/mathematical-statistics',
          'skills/network-computation',
          'skills/validity-reliability',
        ]
      },
      business: {
        name: '@stigmergy/domain-business',
        skills: [
          'packages/scenarios/business/skills/business-ecosystem-analysis',
          'packages/scenarios/business/skills/ecosystem-analysis',
          'packages/scenarios/business/skills/digital-transformation',
          'packages/scenarios/business/skills/conflict-resolution',
        ]
      },
      software: {
        name: '@stigmergy/domain-software',
        skills: [
          'packages/scenarios/using-superpowers/skills/test-driven-development',
          'packages/scenarios/using-superpowers/skills/systematic-debugging',
          'packages/scenarios/using-superpowers/skills/writing-plans',
          'packages/scenarios/using-superpowers/skills/executing-plans',
          'packages/scenarios/using-superpowers/skills/code-reviewer',
          'packages/scenarios/using-superpowers/skills/brainstorming',
        ]
      }
    }
  }
};

const PACKAGE_TEMPLATES = {
  base: (version) => ({
    name: '@stigmergy/base',
    version: version || '2.0.0-alpha.1',
    description: 'Stigmergy Base Package - Core engine, adapters, and coordination layer',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './smart_router': './src/core/smart_router.js',
      './memory_manager': './src/core/memory_manager.js',
      './adapters': './src/adapters/index.js',
      './coordination': './src/coordination/index.js',
      './plugins': './src/plugins/index.js'
    },
    keywords: ['stigmergy', 'base', 'core', 'adapters', 'multi-agents'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      'chalk': '^4.1.2',
      'commander': '^14.0.2',
      'js-yaml': '^4.1.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/',
      'test:unit': 'jest tests/unit/',
      'test:integration': 'jest tests/integration/'
    }
  }),
  
  ui: (version) => ({
    name: '@stigmergy/ui',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy UI Package - Desktop visualization and IM gateway integration',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './gateway': './src/gateway/index.js',
      './interactive': './src/interactive/index.js',
      './desktop': './src/desktop/index.js'
    },
    keywords: ['stigmergy', 'ui', 'desktop', 'gateway', 'feishu', 'slack'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {
      'electron': '>=20.0.0'
    },
    optionalDependencies: {},
    scripts: {
      start: 'electron src/desktop/main.js',
      'start:web': 'node src/web/server.js',
      'start:gateway': 'node src/gateway/server.js',
      test: 'jest tests/'
    }
  }),
  
  professional: (version) => ({
    name: '@stigmergy/professional',
    version: version || '1.0.0-alpha.1',
    description: 'Stigmergy Professional Package - Domain-specific agents and skills',
    main: 'src/index.js',
    exports: {
      '.': './src/index.js',
      './AgentBase': './src/AgentBase.js',
      './SkillLoader': './src/SkillLoader.js'
    },
    keywords: ['stigmergy', 'professional', 'agents', 'skills', 'domains'],
    engines: { node: '>=16.0.0' },
    dependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1'
    },
    peerDependencies: {},
    scripts: {
      test: 'jest tests/'
    }
  }),
  
  domain: (domainName, version) => ({
    name: `@stigmergy/domain-${domainName}`,
    version: version || '1.0.0-alpha.1',
    description: `Stigmergy ${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain - Professional agents and skills`,
    main: 'index.js',
    keywords: ['stigmergy', 'domain', domainName, 'agents', 'skills'],
    engines: { node: '>=16.0.0' },
    peerDependencies: {
      '@stigmergy/base': '^2.0.0-alpha.1',
      '@stigmergy/professional': '^1.0.0-alpha.1'
    },
    scripts: {
      test: 'jest tests/'
    }
  })
};

async function ensureDir(dir) {
  await fs.ensureDir(dir);
  console.log(`[CREATE] Directory: ${dir}`);
}

async function copySource(from, to) {
  const sourcePath = path.join(ROOT_DIR, from);
  const targetPath = path.join(ROOT_DIR, to);
  
  if (await fs.pathExists(sourcePath)) {
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(`[COPY] ${from} -> ${to}`);
    return true;
  } else {
    console.log(`[SKIP] Source not found: ${from}`);
    return false;
  }
}

async function writePackageJson(target, content) {
  const filePath = path.join(ROOT_DIR, target, 'package.json');
  await fs.writeJson(filePath, content, { spaces: 2 });
  console.log(`[WRITE] ${target}/package.json`);
}

async function createIndexFile(target, exports) {
  const indexPath = path.join(ROOT_DIR, target, 'src', 'index.js');
  const content = `/**
 * ${path.basename(target)} - Auto-generated index
 */

module.exports = {
${exports.map(e => `  ${e}: require('./${e}')`).join(',\n')}
};
`;
  await fs.writeFile(indexPath, content);
  console.log(`[WRITE] ${target}/src/index.js`);
}

async function migrateBasePackage() {
  console.log('\n=== Migrating Base Package ===\n');
  
  const config = MIGRATION_PLAN.base;
  const targetDir = config.target;
  
  // Create directory structure
  await ensureDir(path.join(targetDir, 'src/core'));
  await ensureDir(path.join(targetDir, 'src/adapters'));
  await ensureDir(path.join(targetDir, 'src/coordination'));
  await ensureDir(path.join(targetDir, 'src/plugins'));
  await ensureDir(path.join(targetDir, 'skills'));
  
  // Copy sources
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  // Copy skills
  for (const skill of config.skills) {
    const skillName = path.basename(skill);
    await copySource(skill, path.join(targetDir, 'skills', skillName));
  }
  
  // Write package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.base());
  
  // Create index file
  await createIndexFile(targetDir, ['core', 'adapters', 'coordination', 'plugins']);
}

async function migrateUIPackage() {
  console.log('\n=== Migrating UI Package ===\n');
  
  const config = MIGRATION_PLAN.ui;
  const targetDir = config.target;
  
  // Create directory structure
  await ensureDir(path.join(targetDir, 'src/gateway'));
  await ensureDir(path.join(targetDir, 'src/interactive'));
  await ensureDir(path.join(targetDir, 'src/orchestration'));
  await ensureDir(path.join(targetDir, 'src/desktop'));
  await ensureDir(path.join(targetDir, 'src/web'));
  await ensureDir(path.join(targetDir, 'third-party'));
  
  // Copy sources
  for (const source of config.sources) {
    await copySource(
      source.from,
      path.join(targetDir, source.to)
    );
  }
  
  // Write package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.ui());
  
  // Create index file
  await createIndexFile(targetDir, ['gateway', 'interactive', 'orchestration']);
}

async function migrateProfessionalPackage() {
  console.log('\n=== Migrating Professional Package ===\n');
  
  const config = MIGRATION_PLAN.professional;
  const targetDir = config.target;
  
  // Create main directory structure
  await ensureDir(path.join(targetDir, 'src'));
  await ensureDir(path.join(targetDir, 'domains'));
  
  // Create domain packages
  for (const [domainName, domainConfig] of Object.entries(config.domains)) {
    const domainDir = path.join(targetDir, 'domains', domainName);
    
    await ensureDir(domainDir);
    await ensureDir(path.join(domainDir, 'agents'));
    await ensureDir(path.join(domainDir, 'skills'));
    
    // Copy skills
    for (const skill of domainConfig.skills) {
      const skillName = path.basename(skill);
      await copySource(skill, path.join(domainDir, 'skills', skillName));
    }
    
    // Write domain package.json
    await writePackageJson(domainDir, PACKAGE_TEMPLATES.domain(domainName));
  }
  
  // Write main package.json
  await writePackageJson(targetDir, PACKAGE_TEMPLATES.professional());
  
  // Create AgentBase
  const agentBaseContent = `/**
 * AgentBase - Base class for all professional agents
 */

class AgentBase {
  constructor(config = {}) {
    this.domain = config.domain || 'general';
    this.skills = new Map();
    this.memory = config.memory || null;
    this.name = config.name || this.constructor.name;
  }

  async loadSkill(skillName) {
    const skillPath = require('path').join(__dirname, '..', 'domains', this.domain, 'skills', skillName);
    try {
      const skill = require(skillPath);
      this.skills.set(skillName, skill);
      return skill;
    } catch (error) {
      throw new Error(\`Failed to load skill '\${skillName}': \${error.message}\`);
    }
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  async collaborate(otherAgent, task) {
    const results = await Promise.all([
      this.execute(task),
      otherAgent.execute(task)
    ]);
    return {
      collaboration: true,
      agents: [this.name, otherAgent.name],
      results
    };
  }

  getLoadedSkills() {
    return Array.from(this.skills.keys());
  }
}

module.exports = { AgentBase };
`;
  await fs.writeFile(path.join(targetDir, 'src/AgentBase.js'), agentBaseContent);
  console.log(`[WRITE] ${targetDir}/src/AgentBase.js`);
  
  // Create SkillLoader
  const skillLoaderContent = `/**
 * SkillLoader - Dynamic skill loading for professional domains
 */

const fs = require('fs').promises;
const path = require('path');

class SkillLoader {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, '..', 'domains');
    this.cache = new Map();
  }

  async listDomains() {
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory())
      .map(e => e.name);
  }

  async listSkills(domain) {
    const domainPath = path.join(this.basePath, domain, 'skills');
    try {
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => e.name);
    } catch {
      return [];
    }
  }

  async load(domain, skillName) {
    const cacheKey = \`\${domain}/\${skillName}\`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const skillPath = path.join(this.basePath, domain, 'skills', skillName, 'SKILL.md');
    const content = await fs.readFile(skillPath, 'utf-8');
    
    this.cache.set(cacheKey, content);
    return content;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { SkillLoader };
`;
  await fs.writeFile(path.join(targetDir, 'src/SkillLoader.js'), skillLoaderContent);
  console.log(`[WRITE] ${targetDir}/src/SkillLoader.js`);
  
  // Create index file
  await createIndexFile(targetDir, ['AgentBase', 'SkillLoader']);
}

async function updateLernaConfig() {
  console.log('\n=== Updating Lerna Config ===\n');
  
  const lernaPath = path.join(ROOT_DIR, 'lerna.json');
  const lernaConfig = await fs.readJson(lernaPath);
  
  // Ensure packages array includes new packages
  const newPackages = ['packages/base', 'packages/ui', 'packages/professional'];
  for (const pkg of newPackages) {
    if (!lernaConfig.packages.includes(pkg)) {
      lernaConfig.packages.push(pkg);
      console.log(`[ADD] ${pkg} to lerna.json`);
    }
  }
  
  await fs.writeJson(lernaPath, lernaConfig, { spaces: 2 });
  console.log('[UPDATE] lerna.json');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Stigmergy Package Migration Script                      ║');
  console.log('║  Three-Package Decomposition: Base / UI / Professional   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  try {
    await migrateBasePackage();
    await migrateUIPackage();
    await migrateProfessionalPackage();
    await updateLernaConfig();
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete!                                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install dependencies');
    console.log('2. Run "npx lerna bootstrap" to link packages');
    console.log('3. Run "npm test" to verify migration');
    
  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MIGRATION_PLAN, PACKAGE_TEMPLATES };

