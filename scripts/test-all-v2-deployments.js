#!/usr/bin/env node

/**
 * Comprehensive Test Script for v2 Meta-Skill Deployments
 * Tests iFlow, Qwen, and CodeBuddy v2 deployments
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class MetaSkillTester {
  constructor() {
    this.results = {
      iflow: { name: 'iFlow', tests: [] },
      qwen: { name: 'Qwen', tests: [] },
      codebuddy: { name: 'CodeBuddy', tests: [] },
      qodercli: { name: 'QoderCLI', tests: [] }
    };
  }

  async test(name, condition, details = '') {
    const result = {
      name,
      passed: condition,
      details
    };

    console.log(`${condition ? '✅' : '❌'} ${name}${details ? `: ${details}` : ''}`);
    return result;
  }

  async testIFlow() {
    console.log('\n🔍 Testing iFlow v2 Deployment...');
    console.log('='.repeat(60));

    const iflowDir = path.join(os.homedir(), '.iflow');
    const iflowMd = path.join(iflowDir, 'IFLOW.md');
    const workflowConfig = path.join(iflowDir, 'workflow_config.json');

    try {
      // Test 1: IFLOW.md exists
      try {
        await fs.access(iflowMd);
        this.results.iflow.tests.push(await this.test('IFLOW.md exists', true));
      } catch (e) {
        this.results.iflow.tests.push(await this.test('IFLOW.md exists', false, 'File not found'));
        return;
      }

      // Test 2: META_SKILL_START marker present
      const iflowContent = await fs.readFile(iflowMd, 'utf8');
      const hasStartMarker = iflowContent.includes('<!-- META_SKILL_START -->');
      this.results.iflow.tests.push(await this.test(
        'META_SKILL_START marker present',
        hasStartMarker
      ));

      // Test 3: META_SKILL_END marker present
      const hasEndMarker = iflowContent.includes('<!-- META_SKILL_END -->');
      this.results.iflow.tests.push(await this.test(
        'META_SKILL_END marker present',
        hasEndMarker
      ));

      // Test 4: Meta-skill name present
      const hasName = iflowContent.includes('using-iflow-workflows');
      this.results.iflow.tests.push(await this.test(
        'Meta-skill name (using-iflow-workflows) present',
        hasName
      ));

      // Test 5: Mandatory protocol present
      const hasProtocol = iflowContent.includes('Mandatory First Response Protocol');
      this.results.iflow.tests.push(await this.test(
        'Mandatory Protocol section present',
        hasProtocol
      ));

      // Test 6: Common rationalizations present
      const hasRationalizations = iflowContent.includes('Common Rationalizations');
      this.results.iflow.tests.push(await this.test(
        'Common Rationalizations section present',
        hasRationalizations
      ));

      // Test 7: Workflow configuration exists
      try {
        const config = JSON.parse(await fs.readFile(workflowConfig, 'utf8'));
        const configValid = config.workflow?.enabled === true &&
                          config.meta_skill?.enabled === true;
        this.results.iflow.tests.push(await this.test(
          'workflow_config.json valid',
          configValid
        ));
      } catch (e) {
        this.results.iflow.tests.push(await this.test(
          'workflow_config.json valid',
          false,
          e.message
        ));
      }

      // Test 8: Meta-skill size (should be > 10KB)
      const metaSkillMatch = iflowContent.match(/<!-- META_SKILL_START -->([\s\S]*?)<!-- META_SKILL_END -->/);
      const metaSkillSize = metaSkillMatch ? metaSkillMatch[1].length : 0;
      const sizeValid = metaSkillSize > 10000;
      this.results.iflow.tests.push(await this.test(
        'Meta-skill size > 10KB',
        sizeValid,
        `${(metaSkillSize / 1024).toFixed(2)} KB`
      ));

      // Test 9: No duplicate META_SKILL markers
      const startMatches = (iflowContent.match(/<!-- META_SKILL_START -->/g) || []).length;
      const noDuplicates = startMatches === 1;
      this.results.iflow.tests.push(await this.test(
        'No duplicate META_SKILL markers',
        noDuplicates,
        startMatches > 1 ? `${startMatches} occurrences found` : 'Single occurrence'
      ));

      // Test 10: Hook file exists
      const hookPath = path.join(iflowDir, 'hooks', 'meta_skill_hook.py');
      try {
        await fs.access(hookPath);
        this.results.iflow.tests.push(await this.test(
          'meta_skill_hook.py exists',
          true
        ));
      } catch (e) {
        this.results.iflow.tests.push(await this.test(
          'meta_skill_hook.py exists',
          false
        ));
      }

    } catch (error) {
      this.results.iflow.tests.push(await this.test(
        'iFlow deployment test',
        false,
        error.message
      ));
    }
  }

  async testQwen() {
    console.log('\n🔍 Testing Qwen v2 Deployment...');
    console.log('='.repeat(60));

    const qwenDir = path.join(os.homedir(), '.qwen');
    const qwenMd = path.join(qwenDir, 'QWEN.md');
    const extDir = path.join(qwenDir, 'extensions', 'superpowers-qwen');

    try {
      // Test 1: QWEN.md exists
      try {
        await fs.access(qwenMd);
        this.results.qwen.tests.push(await this.test('QWEN.md exists', true));
      } catch (e) {
        this.results.qwen.tests.push(await this.test('QWEN.md exists', false, 'File not found'));
        return;
      }

      // Test 2: META_SKILL_START marker present
      const qwenContent = await fs.readFile(qwenMd, 'utf8');
      const hasStartMarker = qwenContent.includes('<!-- META_SKILL_START -->');
      this.results.qwen.tests.push(await this.test(
        'META_SKILL_START marker present',
        hasStartMarker
      ));

      // Test 3: META_SKILL_END marker present
      const hasEndMarker = qwenContent.includes('<!-- META_SKILL_END -->');
      this.results.qwen.tests.push(await this.test(
        'META_SKILL_END marker present',
        hasEndMarker
      ));

      // Test 4: Meta-skill name present
      const hasName = qwenContent.includes('using-qwen-extensions');
      this.results.qwen.tests.push(await this.test(
        'Meta-skill name (using-qwen-extensions) present',
        hasName
      ));

      // Test 5: Mandatory protocol present
      const hasProtocol = qwenContent.includes('Mandatory First Response Protocol');
      this.results.qwen.tests.push(await this.test(
        'Mandatory Protocol section present',
        hasProtocol
      ));

      // Test 6: Extension directory exists
      try {
        await fs.access(extDir);
        this.results.qwen.tests.push(await this.test(
          'Extension directory exists',
          true
        ));
      } catch (e) {
        this.results.qwen.tests.push(await this.test(
          'Extension directory exists',
          false
        ));
      }

      // Test 7: package.json exists and valid
      try {
        const pkg = JSON.parse(await fs.readFile(path.join(extDir, 'package.json'), 'utf8'));
        const pkgValid = pkg.name === 'superpowers-qwen' && pkg.version === '2.0.0';
        this.results.qwen.tests.push(await this.test(
          'package.json valid',
          pkgValid
        ));
      } catch (e) {
        this.results.qwen.tests.push(await this.test(
          'package.json valid',
          false,
          e.message
        ));
      }

      // Test 8: Main index.js exists
      try {
        await fs.access(path.join(extDir, 'index.js'));
        this.results.qwen.tests.push(await this.test(
          'Main index.js exists',
          true
        ));
      } catch (e) {
        this.results.qwen.tests.push(await this.test(
          'Main index.js exists',
          false
        ));
      }

      // Test 9: Meta-skill size
      const metaSkillMatch = qwenContent.match(/<!-- META_SKILL_START -->([\s\S]*?)<!-- META_SKILL_END -->/);
      const metaSkillSize = metaSkillMatch ? metaSkillMatch[1].length : 0;
      const sizeValid = metaSkillSize > 10000;
      this.results.qwen.tests.push(await this.test(
        'Meta-skill size > 10KB',
        sizeValid,
        `${(metaSkillSize / 1024).toFixed(2)} KB`
      ));

      // Test 10: No duplicates
      const startMatches = (qwenContent.match(/<!-- META_SKILL_START -->/g) || []).length;
      const noDuplicates = startMatches === 1;
      this.results.qwen.tests.push(await this.test(
        'No duplicate META_SKILL markers',
        noDuplicates,
        startMatches > 1 ? `${startMatches} occurrences found` : 'Single occurrence'
      ));

    } catch (error) {
      this.results.qwen.tests.push(await this.test(
        'Qwen deployment test',
        false,
        error.message
      ));
    }
  }

  async testCodeBuddy() {
    console.log('\n🔍 Testing CodeBuddy v2 Deployment...');
    console.log('='.repeat(60));

    const codebuddyDir = path.join(os.homedir(), '.codebuddy');
    const codebuddyMd = path.join(codebuddyDir, 'CODEBUDDY.md');
    const buddyConfig = path.join(codebuddyDir, 'buddy_config.json');
    const buddiesDir = path.join(codebuddyDir, 'buddies', 'superpowers-buddies');

    try {
      // Test 1: CODEBUDDY.md exists
      try {
        await fs.access(codebuddyMd);
        this.results.codebuddy.tests.push(await this.test('CODEBUDDY.md exists', true));
      } catch (e) {
        this.results.codebuddy.tests.push(await this.test('CODEBUDDY.md exists', false, 'File not found'));
        return;
      }

      // Test 2: META_SKILL_START marker present
      const codebuddyContent = await fs.readFile(codebuddyMd, 'utf8');
      const hasStartMarker = codebuddyContent.includes('<!-- META_SKILL_START -->');
      this.results.codebuddy.tests.push(await this.test(
        'META_SKILL_START marker present',
        hasStartMarker
      ));

      // Test 3: META_SKILL_END marker present
      const hasEndMarker = codebuddyContent.includes('<!-- META_SKILL_END -->');
      this.results.codebuddy.tests.push(await this.test(
        'META_SKILL_END marker present',
        hasEndMarker
      ));

      // Test 4: Meta-skill name present
      const hasName = codebuddyContent.includes('using-codebuddy-buddies');
      this.results.codebuddy.tests.push(await this.test(
        'Meta-skill name (using-codebuddy-buddies) present',
        hasName
      ));

      // Test 5: Mandatory protocol present
      const hasProtocol = codebuddyContent.includes('Mandatory First Response Protocol');
      this.results.codebuddy.tests.push(await this.test(
        'Mandatory Protocol section present',
        hasProtocol
      ));

      // Test 6: Buddy config exists and valid
      try {
        const config = JSON.parse(await fs.readFile(buddyConfig, 'utf8'));
        const configValid = config.version === '2.0.0' && config.meta_skill_enabled === true;
        this.results.codebuddy.tests.push(await this.test(
          'buddy_config.json valid',
          configValid
        ));
      } catch (e) {
        this.results.codebuddy.tests.push(await this.test(
          'buddy_config.json valid',
          false,
          e.message
        ));
      }

      // Test 7: Buddies directory exists
      try {
        await fs.access(buddiesDir);
        this.results.codebuddy.tests.push(await this.test(
          'Superpowers buddies directory exists',
          true
        ));
      } catch (e) {
        this.results.codebuddy.tests.push(await this.test(
          'Superpowers buddies directory exists',
          false
        ));
      }

      // Test 8: Buddy files exist
      const buddyFiles = ['brainstorming-buddy.js', 'tdd-buddy.js', 'debugging-buddy.js'];
      let allBuddiesExist = true;
      for (const file of buddyFiles) {
        try {
          await fs.access(path.join(buddiesDir, file));
        } catch (e) {
          allBuddiesExist = false;
        }
      }
      this.results.codebuddy.tests.push(await this.test(
        'All buddy files exist',
        allBuddiesExist
      ));

      // Test 9: Meta-skill size
      const metaSkillMatch = codebuddyContent.match(/<!-- META_SKILL_START -->([\s\S]*?)<!-- META_SKILL_END -->/);
      const metaSkillSize = metaSkillMatch ? metaSkillMatch[1].length : 0;
      const sizeValid = metaSkillSize > 10000;
      this.results.codebuddy.tests.push(await this.test(
        'Meta-skill size > 10KB',
        sizeValid,
        `${(metaSkillSize / 1024).toFixed(2)} KB`
      ));

      // Test 10: No duplicates
      const startMatches = (codebuddyContent.match(/<!-- META_SKILL_START -->/g) || []).length;
      const noDuplicates = startMatches === 1;
      this.results.codebuddy.tests.push(await this.test(
        'No duplicate META_SKILL markers',
        noDuplicates,
        startMatches > 1 ? `${startMatches} occurrences found` : 'Single occurrence'
      ));

    } catch (error) {
      this.results.codebuddy.tests.push(await this.test(
        'CodeBuddy deployment test',
        false,
        error.message
      ));
    }
  }

  async testQoderCLI() {
    console.log('\n🔍 Testing QoderCLI v2 Deployment...');
    console.log('='.repeat(60));

    const qoderDir = path.join(os.homedir(), '.qoder');
    const qoderMd = path.join(qoderDir, 'QODER.md');
    const skillsDir = path.join(qoderDir, 'skills');

    try {
      // Test 1: QODER.md exists
      try {
        await fs.access(qoderMd);
        this.results.qodercli.tests.push(await this.test('QODER.md exists', true));
      } catch (e) {
        this.results.qodercli.tests.push(await this.test('QODER.md exists', false, 'File not found'));
        return;
      }

      // Test 2: META_SKILL_START marker present
      const qoderContent = await fs.readFile(qoderMd, 'utf8');
      const hasStartMarker = qoderContent.includes('<!-- META_SKILL_START -->');
      this.results.qodercli.tests.push(await this.test(
        'META_SKILL_START marker present',
        hasStartMarker
      ));

      // Test 3: META_SKILL_END marker present
      const hasEndMarker = qoderContent.includes('<!-- META_SKILL_END -->');
      this.results.qodercli.tests.push(await this.test(
        'META_SKILL_END marker present',
        hasEndMarker
      ));

      // Test 4: Meta-skill name present
      const hasName = qoderContent.includes('using-qodercli-skills');
      this.results.qodercli.tests.push(await this.test(
        'Meta-skill name (using-qodercli-skills) present',
        hasName
      ));

      // Test 5: Mandatory protocol present
      const hasProtocol = qoderContent.includes('Mandatory First Response Protocol');
      this.results.qodercli.tests.push(await this.test(
        'Mandatory Protocol section present',
        hasProtocol
      ));

      // Test 6: Skills directory exists
      try {
        await fs.access(skillsDir);
        this.results.qodercli.tests.push(await this.test(
          'Skills directory exists',
          true
        ));
      } catch (e) {
        this.results.qodercli.tests.push(await this.test(
          'Skills directory exists',
          false
        ));
      }

      // Test 7: Superpowers skills directory exists
      const superpowersDir = path.join(skillsDir, 'superpowers');
      try {
        await fs.access(superpowersDir);
        this.results.qodercli.tests.push(await this.test(
          'Superpowers skills directory exists',
          true
        ));
      } catch (e) {
        this.results.qodercli.tests.push(await this.test(
          'Superpowers skills directory exists',
          false
        ));
      }

      // Test 8: using-superpowers skill exists
      const usingSuperpowersDir = path.join(superpowersDir, 'using-superpowers');
      try {
        await fs.access(usingSuperpowersDir);
        this.results.qodercli.tests.push(await this.test(
          'using-superpowers skill exists',
          true
        ));
      } catch (e) {
        this.results.qodercli.tests.push(await this.test(
          'using-superpowers skill exists',
          false
        ));
      }

      // Test 9: Meta-skill size
      const metaSkillMatch = qoderContent.match(/<!-- META_SKILL_START -->([\s\S]*?)<!-- META_SKILL_END -->/);
      const metaSkillSize = metaSkillMatch ? metaSkillMatch[1].length : 0;
      const sizeValid = metaSkillSize > 10000;
      this.results.qodercli.tests.push(await this.test(
        'Meta-skill size > 10KB',
        sizeValid,
        `${(metaSkillSize / 1024).toFixed(2)} KB`
      ));

      // Test 10: No duplicates
      const startMatches = (qoderContent.match(/<!-- META_SKILL_START -->/g) || []).length;
      const noDuplicates = startMatches === 1;
      this.results.qodercli.tests.push(await this.test(
        'No duplicate META_SKILL markers',
        noDuplicates,
        startMatches > 1 ? `${startMatches} occurrences found` : 'Single occurrence'
      ));

    } catch (error) {
      this.results.qodercli.tests.push(await this.test(
        'QoderCLI deployment test',
        false,
        error.message
      ));
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    let totalPassed = 0;
    let totalTests = 0;

    for (const [key, cli] of Object.entries(this.results)) {
      const passed = cli.tests.filter(t => t.passed).length;
      const total = cli.tests.length;
      totalPassed += passed;
      totalTests += total;

      console.log(`\n${cli.name}:`);
      console.log(`  Passed: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`);

      if (passed === total) {
        console.log(`  Status: ✅ ALL TESTS PASSED`);
      } else {
        console.log(`  Status: ⚠️  SOME TESTS FAILED`);
        cli.tests.filter(t => !t.passed).forEach(t => {
          console.log(`    ❌ ${t.name}${t.details ? `: ${t.details}` : ''}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log('='.repeat(60));

    if (totalPassed === totalTests) {
      console.log('\n🎉 SUCCESS! All v2 meta-skill deployments verified!\n');
      return 0;
    } else {
      console.log('\n⚠️  WARNING: Some tests failed. Please review the output above.\n');
      return 1;
    }
  }

  async run() {
    console.log('🧪 Meta-Skill v2 Deployment Test Suite');
    console.log('Testing iFlow, Qwen, CodeBuddy, and QoderCLI deployments\n');

    await this.testIFlow();
    await this.testQwen();
    await this.testCodeBuddy();
    await this.testQoderCLI();

    return this.printSummary();
  }
}

// Run tests
if (require.main === module) {
  const tester = new MetaSkillTester();
  tester.run().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = MetaSkillTester;
