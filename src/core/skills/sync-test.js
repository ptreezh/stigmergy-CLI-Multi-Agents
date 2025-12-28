/**
 * Sync Functionality Test - Verify multi-CLI file sync
 * 
 * Test Objectives:
 * 1. Verify sync() updates all 8 CLI config files
 * 2. Verify creation of non-existent files
 * 3. Verify skill content is correctly inserted
 */

import { StigmergySkillManager } from './StigmergySkillManager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class SyncTestRunner {
    constructor() {
        this.testDir = path.join(os.tmpdir(), `stigmergy-sync-test-${Date.now()}`);
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
        
        // Create test directory
        await fs.mkdir(this.testDir, { recursive: true });
        
        // Create test skill
        const skillDir = path.join(this.testDir, 'skills', 'test-skill');
        await fs.mkdir(skillDir, { recursive: true });
        await fs.writeFile(
            path.join(skillDir, 'SKILL.md'),
            `---
name: test-skill
description: Test skill for sync testing
version: 1.0.0
---

# Test Skill

This is a test skill.
`
        );
        
        // Create some CLI config files (simulate real scenario)
        const existingFiles = ['AGENTS.md', 'claude.md', 'qwen.md'];
        for (const file of existingFiles) {
            await fs.writeFile(
                path.join(this.testDir, file),
                `# ${file}\n\nExisting content\n`
            );
        }
        
        console.log(`[OK] Test environment created at ${this.testDir}\n`);
    }

    async cleanup() {
        console.log('\n[INFO] Cleaning up...');
        await fs.rm(this.testDir, { recursive: true, force: true });
        console.log('[OK] Cleanup complete');
    }

        summary() {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Sync Test Total: ${this.passed + this.failed} tests`);
            console.log(`[OK] Passed: ${this.passed}`);
            console.log(`[X] Failed: ${this.failed}`);
            console.log('='.repeat(60));
            return this.failed === 0;
        }
    }
    
    async function runSyncTests() {
    const runner = new SyncTestRunner();
    
        try {
            await runner.setup();
    
            console.log('[LIST] Running sync tests...\n');        
        // Change working directory to test directory
        const originalCwd = process.cwd();
        process.chdir(runner.testDir);
        
        try {
            // Test 1: Verify sync() handles all CLI files
            await runner.test('Sync to all CLI config files', async () => {
                await runner.manager.sync();
                
                // Verify all files are created or updated
                const cliFiles = [
                    'AGENTS.md', 'claude.md', 'qwen.md', 'gemini.md',
                    'iflow.md', 'qodercli.md', 'codebuddy.md', 'copilot.md', 'codex.md'
                ];
                
                for (const file of cliFiles) {
                    const exists = await fs.access(path.join(runner.testDir, file))
                        .then(() => true)
                        .catch(() => false);
                    assert(exists, `${file} not found`);
                }
            });
            
            // Test 2: Verify skill content correctly inserted into each file
            await runner.test('Verify skill content correctly inserted', async () => {
                const cliFiles = [
                    'AGENTS.md', 'claude.md', 'qwen.md', 'gemini.md',
                    'iflow.md', 'qodercli.md', 'codebuddy.md', 'copilot.md', 'codex.md'
                ];
                
                for (const file of cliFiles) {
                    const content = await fs.readFile(path.join(runner.testDir, file), 'utf-8');
                    assert(content.includes('<!-- SKILLS_START -->'), `${file} missing skills start marker`);
                    assert(content.includes('<!-- SKILLS_END -->'), `${file} missing skills end marker`);
                    assert(content.includes('<available_skills>'), `${file} missing skills section`);
                    assert(content.includes('test-skill'), `${file} missing test-skill`);
                }
            });
            
            // Test 3: Verify existing file content preserved
            await runner.test('Verify existing file content preserved', async () => {
                const existingFiles = ['AGENTS.md', 'claude.md', 'qwen.md'];
                
                for (const file of existingFiles) {
                    const content = await fs.readFile(path.join(runner.testDir, file), 'utf-8');
                    assert(content.includes('Existing content'), `${file} lost existing content`);
                }
            });
            
            // Test 4: Verify sync operation idempotency
            await runner.test('Verify sync operation idempotency', async () => {
                // Content after first sync
                const firstSync = await fs.readFile(
                    path.join(runner.testDir, 'AGENTS.md'),
                    'utf-8'
                );
                
                // Sync again
                await runner.manager.sync();
                
                // Content after second sync
                const secondSync = await fs.readFile(
                    path.join(runner.testDir, 'AGENTS.md'),
                    'utf-8'
                );
                
                // Should be identical
                assert(firstSync === secondSync, 'Multiple syncs produced different results');
            });
            
            // Test 5: Verify newly created file format
            await runner.test('Verify newly created file format is correct', async () => {
                const newFiles = ['gemini.md', 'iflow.md', 'qodercli.md', 'codebuddy.md', 'copilot.md', 'codex.md'];
                
                for (const file of newFiles) {
                    const content = await fs.readFile(path.join(runner.testDir, file), 'utf-8');
                    const cliName = file.replace('.md', '').toUpperCase();
                    assert(content.includes(`# ${cliName} Configuration`), `${file} missing header`);
                }
            });
            
        } finally {
            process.chdir(originalCwd);
        }
        
        return runner.summary();
    } catch (err) {
        console.error(`\n[X] Sync test failed: ${err.message}`);
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

// Run sync tests
console.log('[SUCCESS] Stigmergy Skills Sync Functionality Test\n');
console.log('Verify multi-CLI config file sync\n');

runSyncTests()
    .then(success => {
        if (success) {
            console.log('\n[SUCCESS] All sync tests passed!');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('[X] Test execution failed:', err);
        process.exit(1);
    });
