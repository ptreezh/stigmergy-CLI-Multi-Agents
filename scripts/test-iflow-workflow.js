#!/usr/bin/env node

/**
 * Test iFlow Workflow Deployment
 * Validates the workflow mechanism deployment
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const IFLOW_CONFIG_DIR = path.join(os.homedir(), '.iflow');
const IFLOW_WORKFLOW_CONFIG = path.join(IFLOW_CONFIG_DIR, 'workflow_config.json');
const IFLOW_HOOKS_DIR = path.join(IFLOW_CONFIG_DIR, 'hooks');
const IFLOW_IFLOW_MD = path.join(IFLOW_CONFIG_DIR, 'IFLOW.md');

class IFlowWorkflowTester {
  constructor() {
    this.results = {
      config_exists: false,
      config_valid: false,
      hooks_exist: false,
      context_injected: false,
      workflows_defined: false,
      skills_configured: false,
      overall: false
    };
  }

  async runTests() {
    console.log('🧪 Testing iFlow Workflow Deployment\n');

    try {
      // Test 1: Check if workflow config exists
      await this.testWorkflowConfigExists();

      // Test 2: Validate workflow config structure
      await this.testWorkflowConfigValid();

      // Test 3: Check if workflow hooks exist
      await this.testWorkflowHooksExist();

      // Test 4: Check if context is injected
      await this.testContextInjected();

      // Test 5: Check if workflows are defined
      await this.testWorkflowsDefined();

      // Test 6: Check if skills are configured
      await this.testSkillsConfigured();

      // Calculate overall result
      this.results.overall = Object.values(this.results)
        .slice(0, -1)
        .every(result => result === true);

      // Print summary
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
      throw error;
    }
  }

  async testWorkflowConfigExists() {
    console.log('Test 1: Checking workflow config...');
    try {
      await fs.access(IFLOW_WORKFLOW_CONFIG);
      this.results.config_exists = true;
      console.log('  ✅ PASS: workflow_config.json exists\n');
    } catch (error) {
      console.log('  ❌ FAIL: workflow_config.json not found\n');
    }
  }

  async testWorkflowConfigValid() {
    console.log('Test 2: Validating workflow config structure...');
    try {
      const content = await fs.readFile(IFLOW_WORKFLOW_CONFIG, 'utf8');
      const config = JSON.parse(content);

      const hasWorkflow = config.workflow && typeof config.workflow === 'object';
      const hasSuperpowers = config.superpowers && typeof config.superpowers === 'object';
      const hasPipeline = config.pipeline && Array.isArray(config.pipeline.stages);
      const hasHooks = config.hooks && typeof config.hooks === 'object';

      if (hasWorkflow && hasSuperpowers && hasPipeline && hasHooks) {
        this.results.config_valid = true;
        console.log('  ✅ PASS: workflow config is valid');
        console.log(`     - Workflow enabled: ${config.workflow.enabled}`);
        console.log(`     - Superpowers enabled: ${config.superpowers.enabled}`);
        console.log(`     - Pipeline stages: ${config.pipeline.stages.length}`);
        console.log(`     - Hooks configured: ${Object.keys(config.hooks).length}\n`);
      } else {
        console.log('  ❌ FAIL: workflow config structure invalid\n');
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testWorkflowHooksExist() {
    console.log('Test 3: Checking workflow hooks...');
    try {
      const hookPath = path.join(IFLOW_HOOKS_DIR, 'superpowers_workflow.py');
      await fs.access(hookPath);
      this.results.hooks_exist = true;
      console.log('  ✅ PASS: superpowers_workflow.py exists\n');
    } catch (error) {
      console.log('  ❌ FAIL: superpowers_workflow.py not found\n');
    }
  }

  async testContextInjected() {
    console.log('Test 4: Checking context injection...');
    try {
      const content = await fs.readFile(IFLOW_IFLOW_MD, 'utf8');
      const hasSkillsSection = content.includes('<!-- SKILLS_START -->');
      const hasSkillsSystem = content.includes('<skills_system');
      const hasAvailableSkills = content.includes('<available_skills>');

      if (hasSkillsSection && hasSkillsSystem && hasAvailableSkills) {
        this.results.context_injected = true;
        console.log('  ✅ PASS: Skills context injected into IFLOW.md\n');
      } else {
        console.log('  ❌ FAIL: Skills context not properly injected\n');
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testWorkflowsDefined() {
    console.log('Test 5: Checking if workflows are defined...');
    try {
      const content = await fs.readFile(IFLOW_WORKFLOW_CONFIG, 'utf8');
      const config = JSON.parse(content);

      const workflows = config.workflows || {};
      const workflowNames = Object.keys(workflows);

      if (workflowNames.length > 0) {
        this.results.workflows_defined = true;
        console.log('  ✅ PASS: Workflows defined');
        console.log(`     - Available workflows: ${workflowNames.join(', ')}`);

        // Print workflow details
        workflowNames.forEach(name => {
          const workflow = workflows[name];
          console.log(`       • ${name}:`);
          console.log(`         - Triggers: ${workflow.trigger_keywords.join(', ')}`);
          console.log(`         - Stages: ${workflow.stages.join(', ')}`);
        });
        console.log('');
      } else {
        console.log('  ❌ FAIL: No workflows defined\n');
      }
    } catch (error) {
      console.log(`  ❌ FAIL: ${error.message}\n`);
    }
  }

  async testSkillsConfigured() {
    console.log('Test 6: Checking if skills are configured...');
    try {
      const content = await fs.readFile(IFLOW_WORKFLOW_CONFIG, 'utf8');
      const config = JSON.parse(content);

      const skills = config.superpowers?.skills || [];

      if (skills.length > 0) {
        this.results.skills_configured = true;
        console.log('  ✅ PASS: Skills configured');
        console.log(`     - Available skills: ${skills.join(', ')}`);
        console.log(`     - Total skills: ${skills.length}\n`);
      } else {
        console.log('  ❌ FAIL: No skills configured\n');
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
      { name: 'Config Exists', result: this.results.config_exists },
      { name: 'Config Valid', result: this.results.config_valid },
      { name: 'Hooks Exist', result: this.results.hooks_exist },
      { name: 'Context Injected', result: this.results.context_injected },
      { name: 'Workflows Defined', result: this.results.workflows_defined },
      { name: 'Skills Configured', result: this.results.skills_configured }
    ];

    tests.forEach(test => {
      const icon = test.result ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.result ? 'PASS' : 'FAIL'}`);
    });

    console.log('\n' + '='.repeat(60));

    if (this.results.overall) {
      console.log('✅ ALL TESTS PASSED!\n');
      console.log('🎉 iFlow Workflow deployment is successful!');
      console.log('\nYou can now use:');
      console.log('  - Workflow-based task execution');
      console.log('  - Automatic skill activation');
      console.log('  - Superpowers integration');
    } else {
      console.log('⚠️  SOME TESTS FAILED\n');
      console.log('Please check the failed tests above.');
      console.log('Run: node scripts/deploy-iflow-workflow.js');
    }

    console.log('='.repeat(60) + '\n');
  }
}

// Run tests
async function main() {
  const tester = new IFlowWorkflowTester();

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

module.exports = IFlowWorkflowTester;
