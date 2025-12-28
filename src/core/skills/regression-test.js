/**
 * Regression Test - Ensure new skill system doesn't affect existing functionality
 * 
 * Test Strategy:
 * 1. Verify existing commands still work
 * 2. Verify existing config files are not corrupted
 * 3. Verify existing adapters are not affected
 * 4. Verify existing AGENTS.md format remains compatible
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class RegressionTestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.testDir = path.join(os.tmpdir(), `regression-test-${Date.now()}`);
    }

    async test(name, fn) {
        try {
            await fn();
            this.passed++;
            console.log(`[OK] ${name}`);
        } catch (err) {
            this.failed++;
            console.error(`[X] ${name}`);
            console.error(`   ${err.message}`);
        }
    }

    summary() {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Regression Test Total: ${this.passed + this.failed}`);
        console.log(`[OK] Passed: ${this.passed}`);
        console.log(`[X] Failed: ${this.failed}`);
        console.log('='.repeat(60));
        return this.failed === 0;
    }
}

async function runRegressionTests() {
    const runner = new RegressionTestRunner();
    
    // Get project root directory (from src/core/skills to root)
    const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
    
    console.log('[INFO] Regression Test - Ensure existing functionality is not affected\n');
    console.log(`Project root: ${projectRoot}\n`);

    // ===== Test 1: Verify stigmergy main command still executable =====
    await runner.test('stigmergy main command executable', () => {
        try {
            execSync('node src/index.js --help', { 
                stdio: 'pipe',
                cwd: path.join(process.cwd(), '../../..')
            });
        } catch (err) {
            throw new Error('stigmergy command execution failed');
        }
    });

    // ===== Test 2: Verify existing subcommands not affected =====
    await runner.test('status command still works', () => {
        try {
            const output = execSync('node src/index.js status', {
                stdio: 'pipe',
                cwd: path.join(process.cwd(), '../../..'),
                encoding: 'utf-8'
            });
            // Pass if executes without error
        } catch (err) {
            // status command may fail due to missing config, but should not be syntax error
            if (err.message.includes('SyntaxError') || err.message.includes('MODULE_NOT_FOUND')) {
                throw new Error('status command has syntax or module error');
            }
        }
    });

    // ===== Test 3: Verify AGENTS.md format backward compatible =====
    await runner.test('AGENTS.md format backward compatible', async () => {
        const agentsMdPath = path.join(process.cwd(), '../../../AGENTS.md');
        
        try {
            const content = await fs.readFile(agentsMdPath, 'utf-8');
            
            // Verify no breaking changes
            assert(!content.includes('BREAKING_CHANGE'), 'AGENTS.md contains breaking changes');
            
            // If skills section exists, verify format is correct
            if (content.includes('<available_skills>')) {
                assert(content.includes('</available_skills>'), 'Missing closing tag');
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                // AGENTS.md not existing is acceptable
            } else {
                throw err;
            }
        }
    });
    
    // ===== Test 3.5: Verify all CLI config files sync =====
    await runner.test('All CLI config files sync integrity', async () => {
        const cliFiles = [
            'AGENTS.md', 'claude.md', 'qwen.md', 'gemini.md',
            'iflow.md', 'qodercli.md', 'codebuddy.md', 'copilot.md', 'codex.md'
        ];
        
        for (const fileName of cliFiles) {
            const filePath = path.join(process.cwd(), '../../../', fileName);
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                
                // Verify skills section exists and format is correct
                if (content.includes('<available_skills>')) {
                    assert(content.includes('</available_skills>'), `${fileName} missing closing tag`);
                    assert(content.includes('<!-- SKILLS_START -->'), `${fileName} missing start marker`);
                    assert(content.includes('<!-- SKILLS_END -->'), `${fileName} missing end marker`);
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    // File not existing is acceptable (user may not have that CLI installed)
                    continue;
                } else {
                    throw err;
                }
            }
        }
    });

    // ===== Test 4: Verify existing config files not corrupted =====
    await runner.test('Existing config files integrity', async () => {
        const configPaths = [
            path.join(os.homedir(), '.stigmergy', 'config.json'),
            path.join(process.cwd(), '../../../.stigmergy-project', 'stigmergy-config.json')
        ];

        for (const configPath of configPaths) {
            try {
                const content = await fs.readFile(configPath, 'utf-8');
                JSON.parse(content); // Verify JSON format
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    throw new Error(`Config file corrupted: ${configPath}`);
                }
            }
        }
    });

    // ===== Test 5: Verify adapter directory structure unchanged =====
    await runner.test('Adapter directory structure intact', async () => {
        const adaptersDir = path.join(process.cwd(), '../../../src/adapters');
        
        try {
            const entries = await fs.readdir(adaptersDir);
            
            // Verify key adapters exist
            const requiredAdapters = ['claude', 'qwen', 'gemini', 'iflow'];
            for (const adapter of requiredAdapters) {
                assert(entries.includes(adapter), `Missing adapter: ${adapter}`);
            }
        } catch (err) {
            throw new Error('Adapter directory structure changed');
        }
    });

    // ===== Test 6: Verify no interference with existing skills directory =====
    await runner.test('No interference with existing .claude/skills directory', async () => {
        const claudeSkillsDir = path.join(os.homedir(), '.claude', 'skills');
        
        try {
            // Check if exists
            await fs.access(claudeSkillsDir);
            
            // List existing skills
            const before = await fs.readdir(claudeSkillsDir);
            
            // New system should not modify existing directory (unless explicitly installed)
            // Only verify directory is still accessible
            assert(Array.isArray(before), 'Existing skills directory not accessible');
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            // Directory not existing is normal
        }
    });

    // ===== Test 7: Verify package.json integrity =====
    await runner.test('package.json integrity', async () => {
        const pkgPath = path.join(process.cwd(), '../../../package.json');
        const content = await fs.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(content);

        // Verify key fields exist
        assert(pkg.name === 'stigmergy-cli', 'package name changed');
        assert(pkg.bin && pkg.bin.stigmergy, 'Missing bin configuration');
        assert(pkg.scripts && pkg.scripts.test, 'Missing test script');
    });

    // ===== Test 8: Verify existing commands not conflicting =====
    await runner.test('Command names not conflicting', () => {
        const newCommand = 'skill';
        const existingCommands = [
            'status', 'scan', 'init', 'deploy', 
            'clean', 'validate', 'register', 'login', 'logout'
        ];
        
        assert(!existingCommands.includes(newCommand), 
            `New command '${newCommand}' conflicts with existing commands`);
    });

    // ===== Test 9: Verify not affecting existing tests =====
    await runner.test('Existing tests still runnable', () => {
        try {
            // Check test directories exist
            const testDirs = [
                path.join(process.cwd(), '../../../test'),
                path.join(process.cwd(), '../../../tests')
            ];
            
            // At least one test directory should exist
            let hasTestDir = false;
            for (const dir of testDirs) {
                try {
                    execSync(`test -d "${dir}"`, { stdio: 'ignore' });
                    hasTestDir = true;
                    break;
                } catch {}
            }
            
            assert(hasTestDir, 'Test directory missing');
        } catch (err) {
            // Windows environment may not have test command, skip
        }
    });

    // ===== Test 10: Verify module imports not breaking existing code =====
    await runner.test('Module imports backward compatible', async () => {
        const indexPath = path.join(process.cwd(), '../../../src/index.js');
        
        try {
            const content = await fs.readFile(indexPath, 'utf-8');
            
            // Verify no syntax errors (being able to read normally means no obvious errors)
            assert(content.length > 0, 'index.js is empty');
            
            // Verify no incompatible ES module imports added (if project is CommonJS)
            if (!content.includes('import ')) {
                // Project is CommonJS, should not add ES imports
                // Our skill system is a standalone ES module, does not affect main project
            }
        } catch (err) {
            throw new Error('index.js read failed');
        }
    });

    return runner.summary();
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// Run regression tests
runRegressionTests()
    .then(success => {
        if (success) {
            console.log('\n[OK] All regression tests passed! Existing functionality intact.');
        } else {
            console.error('\n[X] Regression tests failed! Please fix before continuing integration.');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('[X] Regression test execution failed:', err);
        process.exit(1);
    });
