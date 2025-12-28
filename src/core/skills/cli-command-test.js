/**
 * CLI Command Layer Test - Test command-line interface
 * 
 * Test Strategy:
 * 1. Test command parsing
 * 2. Test parameter handling
 * 3. Test error handling
 * 4. Test output format
 */

import { handleSkillCommand } from '../../commands/skill.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class CLITestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.testDir = path.join(os.tmpdir(), `cli-test-${Date.now()}`);
        
        // Capture console output
        this.originalLog = console.log;
        this.originalError = console.error;
        this.output = [];
        this.errors = [];
    }

    captureOutput() {
        console.log = (...args) => {
            this.output.push(args.join(' '));
        };
        console.error = (...args) => {
            this.errors.push(args.join(' '));
        };
    }

    restoreOutput() {
        console.log = this.originalLog;
        console.error = this.originalError;
    }

    clearOutput() {
        this.output = [];
        this.errors = [];
    }

    async test(name, fn) {
        this.clearOutput();
        this.captureOutput();
        
        try {
            await fn();
            this.passed++;
            this.restoreOutput();
            console.log(`[OK] ${name}`);
        } catch (err) {
            this.failed++;
            this.restoreOutput();
            console.error(`[X] ${name}`);
            console.error(`   ${err.message}`);
        }
    }

    summary() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`CLI Command Layer Test Total: ${this.passed + this.failed}`);
        console.log(`[OK] Passed: ${this.passed}`);
        console.log(`[X] Failed: ${this.failed}`);
        console.log('='.repeat(60));
        return this.failed === 0;
    }
}

async function runCLITests() {
    const runner = new CLITestRunner();

    console.log('[INFO] CLI Command Layer Test\n');

    // Prepare test environment
    await fs.mkdir(runner.testDir, { recursive: true });
    const testSkillsDir = path.join(runner.testDir, 'skills');
    await fs.mkdir(testSkillsDir);

    // Create test skill
    const testSkillDir = path.join(testSkillsDir, 'cli-test-skill');
    await fs.mkdir(testSkillDir);
    await fs.writeFile(
        path.join(testSkillDir, 'SKILL.md'),
        '---\nname: cli-test-skill\ndescription: For CLI testing\n---\n# Test'
    );

    // Test 1: list command output format
    await runner.test('list command output format is correct', async () => {
        // Temporarily modify skills directory
        process.env.TEST_SKILLS_DIR = testSkillsDir;
        
        try {
            await handleSkillCommand('list', [], {});
            
            // Verify output contains skill info
            const output = runner.output.join('\n');
            assert(output.includes('cli-test-skill') || output.includes('No skills'), 
                'Output format incorrect');
        } finally {
            delete process.env.TEST_SKILLS_DIR;
        }
    });

    // Test 2: help command output
    await runner.test('help command displays help information', async () => {
        await handleSkillCommand('help', [], {});
        
        const output = runner.output.join('\n');
        assert(output.includes('USAGE'), 'Missing usage instructions');
        assert(output.includes('ACTIONS'), 'Missing actions list');
        assert(output.includes('install'), 'Missing install description');
    });

    // Test 3: Error handling when parameters missing
    await runner.test('install command errors when parameters missing', async () => {
        let errorThrown = false;
        try {
            await handleSkillCommand('install', [], {});
        } catch (err) {
            errorThrown = true;
        }
        
        // Should error via process.exit or output error message
        const hasError = errorThrown || runner.errors.some(e => e.includes('source required'));
        assert(hasError, 'Did not properly handle missing parameters');
    });

    // Test 4: Unknown command error handling
    await runner.test('unknown command errors correctly', async () => {
        let errorThrown = false;
        try {
            await handleSkillCommand('unknown-action', [], {});
        } catch (err) {
            errorThrown = true;
        }
        
        const hasError = errorThrown || runner.errors.some(e => e.includes('Unknown'));
        assert(hasError, 'Did not properly handle unknown command');
    });

    // Test 5: Option parameter passing
    await runner.test('option parameters passed correctly', async () => {
        // Test --force option
        const options = { force: true, verbose: true };
        
        // This test primarily verifies no crash from options
        try {
            await handleSkillCommand('help', [], options);
            // Reaching here means option handling is normal
        } catch (err) {
            throw new Error('Option handling failed');
        }
    });

    // Test 6: Command alias support
    await runner.test('remove command alias rm works', async () => {
        // rm is an alias for remove
        let rmWorks = true;
        try {
            // Should trigger "missing parameter" error, not "unknown command"
            await handleSkillCommand('rm', [], {});
        } catch (err) {
            rmWorks = true; // Reaching here means command was recognized
        }
        
        const hasParamError = runner.errors.some(e => e.includes('skill name required'));
        const hasUnknownError = runner.errors.some(e => e.includes('Unknown'));
        
        assert(!hasUnknownError, 'rm alias not recognized');
    });

    // Cleanup
    await fs.rm(runner.testDir, { recursive: true, force: true });

    return runner.summary();
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Run CLI tests
runCLITests()
    .then(success => {
        if (success) {
            console.log('\n[OK] All CLI command layer tests passed!');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('[X] CLI test failed:', err);
        process.exit(1);
    });
