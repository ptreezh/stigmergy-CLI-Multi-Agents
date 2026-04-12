#!/usr/bin/env node

/**
 * Test Qwen Extension Deployment
 * Validates the extension mechanism deployment
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const QWEN_CONFIG_DIR = path.join(os.homedir(), '.qwen');
const QWEN_EXTENSIONS_DIR = path.join(QWEN_CONFIG_DIR, 'extensions');
const SUPERPOWERS_EXT_DIR = path.join(QWEN_EXTENSIONS_DIR, 'superpowers-qwen');
const QWEN_QWEN_MD = path.join(QWEN_CONFIG_DIR, 'QWEN.md');

class QwenExtensionTester {
  constructor() {
    this.results = {
      extension_dir_exists: false,
      package_json_valid: false,
      index_js_exists: false,
      hooks_exist: false,
      skills_exist: false,
      context_injected: false,
      skills_count: 0,
      overall: false
    };
  }

  async runTests() {
    console.log('🧪 Testing Qwen Extension Deployment\n');

    try {
      // Test 1: Check if extension directory exists
      await this.testExtensionDirectoryExists();

      // Test 2: Validate package.json
      await this.testPackageJsonValid();

      // Test 3: Check if index.js exists
      await this.testIndexJsExists();

      // Test 4: Check if hooks exist
      await this.testHooksExist();

      // Test 5: Check if skills exist
      await this.testSkillsExist();

      // Test 6: Check if context is injected
      await this.testContextInjected();

      // Calculate overall result
      this.results.overall = Object.values(this.results)
        .slice(0, -2)
        .every(result => result === true) && this.results.skills_count === 5;

      // Print summary
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      throw error;
    }
  }

  async testExtensionDirectoryExists() {
    console.log('Test 1: Checking extension directory...');
    try {
      await fs.access(SUPERPOWERS_EXT_DIR);
      this.results.extension_dir_exists = true;
      console.log('  ✅ PASS: superpowers-qwen extension directory exists\n');
    } catch (error) {
      console.log('  ❌ FAIL: superpowers-qwen extension directory not found\n');
    }
  }

  async testPackageJsonValid() {
    console.log('Test 2: Validating package.json...');
    try {
      const packagePath = path.join(SUPERPOWERS_EXT_DIR, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(content);

      const hasName = pkg.name === 'superpowers-qwen';
      const hasVersion = pkg.version === '4.1.1';
      const hasQwenConfig = pkg.qwen && typeof pkg.qwen === 'object';
      const hasSuperpowers = pkg.superpowers && typeof pkg.superpowers === 'object';
      const hasSkills = Array.isArray(pkg.skills) && pkg.skills.length === 5;
      const hasHooks = pkg.hooks && pkg.hooks.sessionStart && pkg.hooks.prePrompt;

      if (hasName && hasVersion && hasQwenConfig && hasSuperpowers && hasSkills && hasHooks) {
        this.results.package_json_valid = true;
        console.log('  ✅ PASS: package.json is valid');
        console.log(`     - Extension name: ${pkg.name}`);
        console.log(`     - Version: ${pkg.version}`);
        console.log(`     - Qwen config: ${hasQwenConfig ? '✓' : '✗'}`);
        console.log(`     - Superpowers: ${hasSuperpowers ? '✓' : '✗'}`);
        console.log(`     - Skills: ${pkg.skills.length}`);
        console.log(`     - Hooks: ${Object.keys(pkg.hooks).length}\n`);
      } else {
        console.log('  ❌ FAIL: package.json structure invalid\n');
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testIndexJsExists() {
    console.log('Test 3: Checking index.js...');
    try {
      const indexPath = path.join(SUPERPOWERS_EXT_DIR, 'index.js');
      await fs.access(indexPath);
      const content = await fs.readFile(indexPath, 'utf8');

      const hasSuperpowersExtension = content.includes('SuperpowersExtension');
      const hasInitialize = content.includes('async initialize');
      const hasLoadSkills = content.includes('loadSkills');
      const hasModuleExports = content.includes('module.exports');

      if (hasSuperpowersExtension && hasInitialize && hasLoadSkills && hasModuleExports) {
        this.results.index_js_exists = true;
        console.log('  ✅ PASS: index.js exists and is valid');
        console.log(`     - SuperpowersExtension class: ✓`);
        console.log(`     - Initialize method: ✓`);
        console.log(`     - LoadSkills method: ✓`);
        console.log(`     - Module exports: ✓\n`);
      } else {
        console.log('  ❌ FAIL: index.js missing required components\n');
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testHooksExist() {
    console.log('Test 4: Checking hooks...');
    try {
      const sessionStartPath = path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'session-start.js');
      const prePromptPath = path.join(SUPERPOWERS_EXT_DIR, 'hooks', 'pre-prompt.js');

      await fs.access(sessionStartPath);
      await fs.access(prePromptPath);

      this.results.hooks_exist = true;
      console.log('  ✅ PASS: All hooks exist');
      console.log(`     - session-start.js: ✓`);
      console.log(`     - pre-prompt.js: ✓\n`);
    } catch (error) {
      console.log('  ❌ FAIL: Some hooks missing\n');
    }
  }

  async testSkillsExist() {
    console.log('Test 5: Checking skill files...');
    try {
      const skillsDir = path.join(SUPERPOWERS_EXT_DIR, 'skills');
      const files = await fs.readdir(skillsDir);
      const skillFiles = files.filter(f => f.endsWith('.md'));

      this.results.skills_count = skillFiles.length;

      const expectedSkills = [
        'brainstorming.md',
        'tdd.md',
        'debugging.md',
        'collaboration.md',
        'verification.md'
      ];

      const allPresent = expectedSkills.every(skill => skillFiles.includes(skill));

      if (skillFiles.length === 5 && allPresent) {
        this.results.skills_exist = true;
        console.log('  ✅ PASS: All skill files exist');
        console.log(`     - Total skills: ${skillFiles.length}`);
        console.log(`     - Expected skills: ${expectedSkills.join(', ')}`);

        // List each skill
        for (const skill of expectedSkills) {
          const skillPath = path.join(skillsDir, skill);
          const content = await fs.readFile(skillPath, 'utf8');
          const lines = content.split('\n').length;
          console.log(`       • ${skill}: ${lines} lines`);
        }
        console.log('');
      } else {
        console.log(`  ❌ FAIL: Expected 5 skills, found ${skillFiles.length}`);
        console.log(`     - Missing: ${expectedSkills.filter(s => !skillFiles.includes(s)).join(', ')}\n`);
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testContextInjected() {
    console.log('Test 6: Checking context injection...');
    try {
      const content = await fs.readFile(QWEN_QWEN_MD, 'utf8');

      const hasSkillsSection = content.includes('<!-- SKILLS_START -->');
      const hasSkillsSystem = content.includes('<skills_system');
      const hasAvailableSkills = content.includes('<available_skills');
      const hasSuperpowersQwen = content.includes('superpowers-qwen');
      const hasAllSkills = [
        'brainstorming',
        'test-driven-development',
        'debugging',
        'collaboration',
        'verification-before-completion'
      ].every(skill => content.includes(skill));

      if (hasSkillsSection && hasSkillsSystem && hasAvailableSkills && hasSuperpowersQwen && hasAllSkills) {
        this.results.context_injected = true;
        console.log('  ✅ PASS: Skills context injected into QWEN.md');
        console.log(`     - SKILLS_START tag: ✓`);
        console.log(`     - skills_system tag: ✓`);
        console.log(`     - available_skills tag: ✓`);
        console.log(`     - superpowers-qwen reference: ✓`);
        console.log(`     - All 5 skills listed: ✓\n`);
      } else {
        console.log('  ❌ FAIL: Skills context not properly injected');
        console.log(`     - SKILLS_START: ${hasSkillsSection ? '✓' : '✗'}`);
        console.log(`     - skills_system: ${hasSkillsSystem ? '✓' : '✗'}`);
        console.log(`     - available_skills: ${hasAvailableSkills ? '✓' : '✗'}`);
        console.log(`     - superpowers-qwen: ${hasSuperpowersQwen ? '✓' : '✗'}`);
        console.log(`     - All skills: ${hasAllSkills ? '✓' : '✗'}\n`);
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60) + '\n');

    const tests = [
      { name: 'Extension Directory', result: this.results.extension_dir_exists },
      { name: 'Package JSON Valid', result: this.results.package_json_valid },
      { name: 'Index JS Exists', result: this.results.index_js_exists },
      { name: 'Hooks Exist', result: this.results.hooks_exist },
      { name: 'Skills Exist', result: this.results.skills_exist },
      { name: 'Context Injected', result: this.results.context_injected },
      { name: 'Skills Count', result: this.results.skills_count === 5 }
    ];

    tests.forEach(test => {
      const icon = test.result ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.result ? 'PASS' : 'FAIL'}`);
    });

    console.log('\n' + '='.repeat(60));

    if (this.results.overall) {
      console.log('✅ ALL TESTS PASSED!\n');
      console.log('🎉 Qwen Extension deployment is successful!');
      console.log('\nYou can now use:');
      console.log('  qwen --extensions superpowers-qwen "your prompt"');
      console.log('  qwen --list-extensions');
      console.log('\nFeatures:');
      console.log('  - Automatic skill activation');
      console.log('  - 5 superpowers skills');
      console.log('  - Session start hooks');
      console.log('  - Pre-prompt analysis');
    } else {
      console.log('⚠️  SOME TESTS FAILED\n');
      console.log('Please check the failed tests above.');
      console.log('Run: node scripts/deploy-qwen-extension.js');
    }

    console.log('='.repeat(60) + '\n');
  }
}

// Run tests
async function main() {
  const tester = new QwenExtensionTester();

  try {
    const results = await tester.runTests();
    process.exit(results.overall ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = QwenExtensionTester;
