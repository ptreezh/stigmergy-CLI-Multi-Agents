/**
 * Simple Test Runner - TDD Verification
 * No dependency on Jest, runs tests directly
 */

import { SkillParser } from './embedded-openskills/SkillParser.js';
import { SkillReader } from './embedded-openskills/SkillReader.js';
import { SkillInstaller } from './embedded-openskills/SkillInstaller.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import assert from 'assert';

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
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
            if (err.stack) {
                console.error(`   ${err.stack.split('\n')[1]}`);
            }
        }
    }

    summary() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Total: ${this.passed + this.failed} tests`);
        console.log(`[OK] Passed: ${this.passed}`);
        console.log(`[X] Failed: ${this.failed}`);
        console.log('='.repeat(60));
        return this.failed === 0;
    }
}

async function runTests() {
    const runner = new TestRunner();
    let tempDir;

    console.log('[LIST] Running TDD tests...\n');

    // ===== SkillParser Tests =====
    console.log('[LIST] SkillParser Tests\n');

    await runner.test('parseMetadata - Parse valid YAML', () => {
        const parser = new SkillParser();
        const content = `---
name: test-skill
description: A test skill
version: 1.0.0
---

# Content`;
        const result = parser.parseMetadata(content);
        assert.strictEqual(result.name, 'test-skill');
        assert.strictEqual(result.description, 'A test skill');
    });

    await runner.test('parseMetadata - Handle arrays', () => {
        const parser = new SkillParser();
        const content = `---
name: skill
allowed-tools:
  - bash
  - text_editor
---`;
        const result = parser.parseMetadata(content);
        assert.deepStrictEqual(result['allowed-tools'], ['bash', 'text_editor']);
    });

    await runner.test('extractContent - Extract body content', () => {
        const parser = new SkillParser();
        const content = `---
name: test
---

# Instructions`;
        const result = parser.extractContent(content);
        assert(result.includes('# Instructions'));
        assert(!result.includes('---'));
    });

    await runner.test('validateSkill - Detect missing name', () => {
        const parser = new SkillParser();
        const content = `---
description: No name
---`;
        const result = parser.validateSkill(content);
        assert.strictEqual(result.valid, false);
        assert(result.errors.some(e => e.includes('name')));
    });

    await runner.test('validateSkill - Detect invalid name format', () => {
        const parser = new SkillParser();
        const content = `---
name: Invalid_Name
description: Test
---`;
        const result = parser.validateSkill(content);
        assert.strictEqual(result.valid, false);
        assert(result.errors.some(e => e.includes('lowercase and hyphens')));
    });

    // ===== SkillReader Tests =====
    console.log('\n[LIST] SkillReader Tests\n');

    // Setup test environment
    tempDir = path.join(os.tmpdir(), `test-skills-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    await runner.test('findSkill - Find existing skill', async () => {
        const skillName = 'test-skill';
        const skillDir = path.join(tempDir, skillName);
        await fs.mkdir(skillDir, { recursive: true });
        await fs.writeFile(
            path.join(skillDir, 'SKILL.md'),
            '---\nname: test-skill\n---\n# Test'
        );

        const reader = new SkillReader([tempDir]);
        const result = await reader.findSkill(skillName);
        
        assert.notStrictEqual(result, null);
        assert.strictEqual(result.name, skillName);
    });

    await runner.test('findSkill - Non-existent skill returns null', async () => {
        const reader = new SkillReader([tempDir]);
        const result = await reader.findSkill('non-existent');
        assert.strictEqual(result, null);
    });

    await runner.test('readSkill - Read skill content', async () => {
        const skillName = 'readable-skill';
        const skillDir = path.join(tempDir, skillName);
        await fs.mkdir(skillDir);
        const content = '---\nname: readable-skill\n---\n# Content';
        await fs.writeFile(path.join(skillDir, 'SKILL.md'), content);

        const reader = new SkillReader([tempDir]);
        const result = await reader.readSkill(skillName);
        
        assert.strictEqual(result.name, skillName);
        assert.strictEqual(result.content, content);
    });

    await runner.test('listSkills - List all skills', async () => {
        const skills = ['skill-1', 'skill-2'];
        for (const name of skills) {
            const dir = path.join(tempDir, name);
            await fs.mkdir(dir);
            await fs.writeFile(
                path.join(dir, 'SKILL.md'),
                `---\nname: ${name}\ndescription: ${name}\n---\n`
            );
        }

        const reader = new SkillReader([tempDir]);
        const result = await reader.listSkills();
        
        assert(result.length >= skills.length);
        const names = result.map(s => s.name);
        skills.forEach(name => assert(names.includes(name)));
    });

    // ===== SkillInstaller Tests =====
    console.log('\n[LIST] SkillInstaller Tests\n');

    await runner.test('parseGitHubUrl - Parse standard URL', () => {
        const installer = new SkillInstaller();
        const result = installer.parseGitHubUrl('https://github.com/owner/repo');
        assert.strictEqual(result.owner, 'owner');
        assert.strictEqual(result.repo, 'repo');
    });

    await runner.test('parseGitHubUrl - Parse shorthand format', () => {
        const installer = new SkillInstaller();
        const result = installer.parseGitHubUrl('owner/repo');
        assert.strictEqual(result.owner, 'owner');
        assert.strictEqual(result.repo, 'repo');
    });

    await runner.test('parseGitHubUrl - Remove .git suffix', () => {
        const installer = new SkillInstaller();
        const result = installer.parseGitHubUrl('owner/repo.git');
        assert.strictEqual(result.repo, 'repo');
    });

    await runner.test('scanSkills - Scan skill directory', async () => {
        const scanDir = path.join(tempDir, 'scan-test');
        await fs.mkdir(scanDir);
        
        const skill1 = path.join(scanDir, 'skill-a');
        await fs.mkdir(skill1);
        await fs.writeFile(
            path.join(skill1, 'SKILL.md'),
            '---\nname: skill-a\n---\n'
        );

        const installer = new SkillInstaller();
        const skills = await installer.scanSkills(scanDir);
        
        assert(skills.length >= 1);
        assert(skills.some(s => s.name === 'skill-a'));
    });

    await runner.test('calculateSize - Calculate directory size', async () => {
        const sizeDir = path.join(tempDir, 'size-test');
        await fs.mkdir(sizeDir);
        await fs.writeFile(path.join(sizeDir, 'file.txt'), 'x'.repeat(100));

        const installer = new SkillInstaller();
        const size = await installer.calculateSize(sizeDir);
        
        assert.strictEqual(size, 100);
    });

    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });

    return runner.summary();
}

// Run tests
runTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('[X] Test execution failed:', err);
        process.exit(1);
    });
