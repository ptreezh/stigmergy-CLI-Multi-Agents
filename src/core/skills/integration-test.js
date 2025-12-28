/**
 * Integration Test - End-to-end verification of Stigmergy Skills System
 * 
 * TDD Verification:
 * 1. Create test skills
 * 2. Install skills
 * 3. Read skills
 * 4. List skills
 * 5. Sync to AGENTS.md
 * 6. Validate skills
 * 7. Remove skills
 */

import { StigmergySkillManager } from './StigmergySkillManager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class IntegrationTestRunner {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `stigmergy-integration-test-${Date.now()}`);
        this.manager = new StigmergySkillManager({
            skillsDir: path.join(this.testDir, 'skills')
        });
        this.passed = 0;
        this.failed = 0;
    }

    async test(name, fn) {
        try {
            await fn();
            this.passed++;
            console.log(`[OK] ${name}`);
        } catch (err) {
            this.failed++;
            console.error(`[X] ${name}`);
            console.error(`   Error: ${err.message}`);
        }
    }

    async setup() {
        console.log('[INFO] Setting up test environment...\n');
        
        // Create test skill repository structure
        const repoDir = path.join(this.testDir, 'test-repo');
        await fs.mkdir(repoDir, { recursive: true });

        // Create test skill #1
        const skill1Dir = path.join(repoDir, 'test-analyzer');
        await fs.mkdir(skill1Dir, { recursive: true });
        await fs.writeFile(
            path.join(skill1Dir, 'SKILL.md'),
            `---
name: test-analyzer
description: Test data analysis skill for integration testing
version: 1.0.0
---

# Test Analyzer

## Trigger Conditions
When user asks to analyze test data.

## Core Workflow

### Step 1: Data Loading
1. Read input file
2. Validate format

### Step 2: Execute Analysis
Run analysis script:
\`\`\`bash
python scripts/analyze.py --input data.json
\`\`\`

### Step 3: Generate Report
Output results to report.json
`
        );

        // Add scripts directory
        await fs.mkdir(path.join(skill1Dir, 'scripts'));
        await fs.writeFile(
            path.join(skill1Dir, 'scripts', 'analyze.py'),
            `#!/usr/bin/env python3
import json
import sys

data = json.load(sys.stdin)
print(json.dumps({"status": "analyzed", "count": len(data)}, indent=2))
`
        );

        // Create test skill #2
        const skill2Dir = path.join(repoDir, 'test-formatter');
        await fs.mkdir(skill2Dir);
        await fs.writeFile(
            path.join(skill2Dir, 'SKILL.md'),
            `---
name: test-formatter
description: Test code formatting skill
---

# Test Formatter

Format code according to standards.
`
        );

        console.log(`[OK] Test repository created at ${repoDir}\n`);
        return repoDir;
    }

    async cleanup() {
        console.log('\n[INFO] Cleaning up...');
        await fs.rm(this.testDir, { recursive: true, force: true });
        console.log('[OK] Cleanup complete');
    }

    summary() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Integration Test Total: ${this.passed + this.failed} tests`);
        console.log(`[OK] Passed: ${this.passed}`);
        console.log(`[X] Failed: ${this.failed}`);
        console.log('='.repeat(60));
        return this.failed === 0;
    }
}

async function runIntegrationTests() {
    const runner = new IntegrationTestRunner();

    try {
        // Setup
        const repoDir = await runner.setup();

        console.log('[LIST] Running integration tests...\n');

        // Test 1: Scan skills
        await runner.test('Scan local skill repository', async () => {
            const skills = await runner.manager.installer.scanSkills(repoDir);
            assert(skills.length === 2, `Expected 2 skills, got ${skills.length}`);
            assert(skills.some(s => s.name === 'test-analyzer'), 'Missing test-analyzer');
            assert(skills.some(s => s.name === 'test-formatter'), 'Missing test-formatter');
        });

        // Test 2: Install skill manually
        await runner.test('Install single skill', async () => {
            const skills = await runner.manager.installer.scanSkills(repoDir);
            const skill = skills.find(s => s.name === 'test-analyzer');
            await runner.manager.installer.installSkill(skill);
            
            // Verify installation
            const installed = await fs.access(
                path.join(runner.testDir, 'skills', 'test-analyzer', 'SKILL.md')
            ).then(() => true).catch(() => false);
            assert(installed, 'Skill not installed');
        });

        // Test 3: Read installed skill
        await runner.test('Read installed skill', async () => {
            const skill = await runner.manager.reader.readSkill('test-analyzer');
            assert(skill.name === 'test-analyzer', `Expected name 'test-analyzer', got '${skill.name}'`);
            assert(skill.content.includes('Test Analyzer'), 'Missing expected content');
            assert(skill.baseDir.includes('test-analyzer'), 'Invalid base directory');
        });

        // Test 4: List all skills
        await runner.test('List all installed skills', async () => {
            const skills = await runner.manager.reader.listSkills();
            assert(skills.length >= 1, 'No skills found');
            assert(skills.some(s => s.name === 'test-analyzer'));
        });

        // Test 5: Validate skill format
        await runner.test('Validate skill format', async () => {
            const validation = await runner.manager.validate('test-analyzer');
            assert(validation.valid === true, `Skill validation failed: ${validation.errors.join(', ')}`);
        });

        // Test 6: Sync to AGENTS.md
        await runner.test('Sync skills to AGENTS.md', async () => {
            // Create temporary AGENTS.md
            const agentsMdPath = path.join(runner.testDir, 'AGENTS.md');
            await fs.writeFile(agentsMdPath, '# Test AGENTS.md\n\n');
            
            // Change working directory
            const originalCwd = process.cwd();
            process.chdir(runner.testDir);
            
            try {
                await runner.manager.sync();
                
                // Verify AGENTS.md updated
                const content = await fs.readFile(agentsMdPath, 'utf-8');
                assert(content.includes('<available_skills>'), 'Missing skills section');
                assert(content.includes('test-analyzer'), 'Missing test-analyzer in AGENTS.md');
            } finally {
                process.chdir(originalCwd);
            }
        });

        // Test 7: Remove skill
        await runner.test('Remove skill', async () => {
            await runner.manager.installer.uninstallSkill('test-analyzer');
            
            // Verify removal
            const exists = await fs.access(
                path.join(runner.testDir, 'skills', 'test-analyzer')
            ).then(() => true).catch(() => false);
            assert(!exists, 'Skill still exists after removal');
        });

        return runner.summary();
    } catch (err) {
        console.error(`\n[X] Integration test failed: ${err.message}`);
        console.error(err.stack);
        return false;
    } finally {
        await runner.cleanup();
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Run integration tests
console.log('[SUCCESS] Stigmergy Skills Integration Test\n');
console.log('TDD-driven, embedded OpenSkills core\n');

runIntegrationTests()
    .then(success => {
        if (success) {
            console.log('\n[SUCCESS] All integration tests passed!');
            console.log('\nNext steps:');
            console.log('  1. Integrate into stigmergy CLI main command');
            console.log('  2. Test real GitHub repository installation');
            console.log('  3. Verify integration with all CLI tools');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('[X] Test execution failed:', err);
        process.exit(1);
    });
