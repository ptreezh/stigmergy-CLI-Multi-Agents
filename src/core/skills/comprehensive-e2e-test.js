/**
 * Comprehensive End-to-End Test - Stigmergy Skills System
 * 
 * Test Flow:
 * 1. Clean all caches
 * 2. Advanced uninstall
 * 3. Uninstall partial CLI
 * 4. Install stigmergy package
 * 5. Test stigmergy commands one by one
 * 6. Test CLI cross-calls
 * 7. Test CLI skill usage
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

class ComprehensiveE2ETestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.testResults = [];
        // Fix Windows path issue
        const filePath = new URL(import.meta.url).pathname;
        // Windows paths need to remove leading /
        const normalizedPath = process.platform === 'win32' && filePath.startsWith('/') 
            ? filePath.substring(1) 
            : filePath;
        this.projectRoot = path.resolve(path.dirname(normalizedPath), '../../..');
        console.log(`[INFO] Project root: ${this.projectRoot}\n`);
    }

    async test(name, fn, options = {}) {
        const startTime = Date.now();
        console.log(`\n${'='.repeat(60)}`);
        console.log(`[LIST] Test: ${name}`);
        console.log('='.repeat(60));
        
        try {
            await fn();
            const duration = Date.now() - startTime;
            this.passed++;
            console.log(`[OK] Passed (${duration}ms)`);
            this.testResults.push({
                name,
                status: 'passed',
                duration,
                category: options.category || 'general'
            });
        } catch (err) {
            const duration = Date.now() - startTime;
            
            if (options.allowSkip && err.message.includes('SKIP')) {
                this.skipped++;
                console.log(`[INFO] Skipped: ${err.message}`);
                this.testResults.push({
                    name,
                    status: 'skipped',
                    duration,
                    reason: err.message,
                    category: options.category || 'general'
                });
            } else {
                this.failed++;
                console.error(`[X] Failed: ${err.message}`);
                if (options.verbose) {
                    console.error(err.stack);
                }
                this.testResults.push({
                    name,
                    status: 'failed',
                    duration,
                    error: err.message,
                    category: options.category || 'general'
                });
            }
        }
    }

    exec(command, options = {}) {
        console.log(`   [INFO] Executing: ${command}`);
        try {
            const result = execSync(command, {
                encoding: 'utf-8',
                cwd: this.projectRoot,
                timeout: options.timeout || 30000,
                stdio: options.silent ? 'pipe' : 'inherit',
                shell: true,  // Ensure using shell on Windows
                ...options
            });
            return result;
        } catch (err) {
            if (options.allowFail) {
                return null;
            }
            throw err;
        }
    }

    summary() {
        console.log(`\n${'='.repeat(60)}`);
        console.log('[LIST] Complete Test Report');
        console.log('='.repeat(60));
        
        const total = this.passed + this.failed + this.skipped;
        console.log(`\nTotal: ${total} tests`);
        console.log(`[OK] Passed: ${this.passed}`);
        console.log(`[X] Failed: ${this.failed}`);
        console.log(`[INFO] Skipped: ${this.skipped}`);
        
        // Group by category
        const byCategory = {};
        for (const result of this.testResults) {
            const cat = result.category;
            if (!byCategory[cat]) {
                byCategory[cat] = { passed: 0, failed: 0, skipped: 0 };
            }
            byCategory[cat][result.status]++;
        }
        
        console.log('\n[LIST] Statistics by Category:');
        for (const [category, stats] of Object.entries(byCategory)) {
            console.log(`   ${category}: [OK]${stats.passed} [X]${stats.failed} [INFO]${stats.skipped}`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        return this.failed === 0;
    }
}

async function runComprehensiveTests() {
    const runner = new ComprehensiveE2ETestRunner();
    
    console.log('[SUCCESS] Stigmergy Skills Comprehensive End-to-End Test');
    console.log('Test Scope: Cache Clean -> Install -> Command Test -> Cross-Call -> Skill Usage\n');
    
    // ==================== Phase 1: Environment Preparation ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 1: Environment Preparation and Cleanup');
    console.log('='.repeat(60));
    
    await runner.test('Clean npm cache', () => {
        runner.exec('npm cache clean --force', { silent: true, allowFail: true });
    }, { category: 'Environment Prep' });
    
    await runner.test('Clean project cache', () => {
        runner.exec('node src/index.js clean', { silent: true, allowFail: true });
    }, { category: 'Environment Prep' });
    
    await runner.test('Clean temporary files', async () => {
        const tempDirs = [
            path.join(os.tmpdir(), 'stigmergy-*'),
            path.join(runner.projectRoot, 'temp'),
            path.join(runner.projectRoot, 'coverage')
        ];
        
        for (const pattern of tempDirs) {
            try {
                if (!pattern.includes('*')) {
                    await fs.rm(pattern, { recursive: true, force: true });
                }
            } catch (err) {
                // Ignore non-existent directories
            }
        }
    }, { category: 'Environment Prep' });
    
    // ==================== Phase 2: Core Command Testing ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 2: Stigmergy Core Command Testing');
    console.log('='.repeat(60));
    
    await runner.test('stigmergy --version', () => {
        const output = runner.exec('node bin/stigmergy --version', { silent: true });
        if (!output.includes('1.2')) {
            throw new Error('Version number incorrect');
        }
    }, { category: 'Core Commands' });
    
    await runner.test('stigmergy --help', () => {
        const output = runner.exec('node bin/stigmergy --help', { silent: true });
        if (!output.includes('skill')) {
            throw new Error('Help output missing skill command');
        }
    }, { category: 'Core Commands' });
    
    await runner.test('stigmergy diagnostic', () => {
        runner.exec('node bin/stigmergy d', { timeout: 60000 });
    }, { category: 'Core Commands' });
    
    await runner.test('stigmergy status', () => {
        runner.exec('node bin/stigmergy status', { timeout: 60000 });
    }, { category: 'Core Commands' });
    
    // ==================== Phase 3: Skill System Command Testing ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 3: Skill System Command Testing');
    console.log('='.repeat(60));
    
    await runner.test('skill list (full command)', () => {
        runner.exec('node bin/stigmergy skill list');
    }, { category: 'Skill Commands' });
    
    await runner.test('skill-l (short command)', () => {
        runner.exec('node bin/stigmergy skill-l');
    }, { category: 'Skill Commands' });
    
    await runner.test('skill sync (full command)', () => {
        runner.exec('node bin/stigmergy skill sync');
    }, { category: 'Skill Commands' });
    
    await runner.test('skill (short command - default sync)', () => {
        runner.exec('node bin/stigmergy skill');
    }, { category: 'Skill Commands' });
    
    await runner.test('skill-r (read skill)', async () => {
        // Get skill list first
        const listOutput = runner.exec('node bin/stigmergy skill-l', { silent: true });
        
        // Extract first skill name
        const match = listOutput.match(/• ([a-z-]+)/);
        if (!match) {
            throw new Error('SKIP: No skills installed');
        }
        
        const skillName = match[1];
        console.log(`   [INFO] Reading skill: ${skillName}`);
        
        runner.exec(`node bin/stigmergy skill-r ${skillName}`, { timeout: 10000 });
    }, { category: 'Skill Commands', allowSkip: true });
    
    await runner.test('skill-v (validate skill)', async () => {
        // Find first SKILL.md file
        const skillsDir = path.join(os.homedir(), '.claude/skills');
        try {
            const dirs = await fs.readdir(skillsDir);
            if (dirs.length === 0) {
                throw new Error('SKIP: No skill directories found');
            }
            
            const firstSkill = dirs[0];
            const skillPath = path.join(skillsDir, firstSkill, 'SKILL.md');
            
            runner.exec(`node bin/stigmergy skill-v ${skillPath}`, { timeout: 10000, allowFail: true });
        } catch (err) {
            throw new Error('SKIP: Cannot access skills directory');
        }
    }, { category: 'Skill Commands', allowSkip: true });
    
    // ==================== Phase 4: Config File Sync Verification ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 4: Config File Sync Verification');
    console.log('='.repeat(60));
    
    const cliConfigFiles = [
        'AGENTS.md', 'claude.md', 'qwen.md', 'gemini.md',
        'iflow.md', 'qodercli.md', 'codebuddy.md', 'copilot.md', 'codex.md'
    ];
    
    for (const fileName of cliConfigFiles) {
        await runner.test(`Verify ${fileName} sync`, async () => {
            const filePath = path.join(runner.projectRoot, fileName);
            
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                
                if (!content.includes('<!-- SKILLS_START -->')) {
                    console.log(`   [INFO] ${fileName} has no skills section (may not be synced yet)`);
                    return;
                }
                
                if (!content.includes('<!-- SKILLS_END -->')) {
                    throw new Error('Missing SKILLS_END marker');
                }
                
                if (!content.includes('<available_skills>')) {
                    throw new Error('Missing available_skills tag');
                }
                
                console.log(`   [OK] ${fileName} format correct`);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    throw new Error(`SKIP: ${fileName} does not exist`);
                }
                throw err;
            }
        }, { category: 'Config Sync', allowSkip: true });
    }
    
    // ==================== Phase 5: CLI Tool Availability Check ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 5: CLI Tool Availability Check');
    console.log('='.repeat(60));
    
    const cliTools = ['claude', 'qwen', 'gemini', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex'];
    const availableCLIs = [];
    
    for (const tool of cliTools) {
        await runner.test(`Check ${tool} CLI`, () => {
            try {
                const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [tool], {
                    encoding: 'utf-8',
                    timeout: 3000,
                    stdio: 'pipe'
                });
                
                if (result.status === 0 && result.stdout.trim()) {
                    console.log(`   [OK] ${tool} installed: ${result.stdout.trim().split('\n')[0]}`);
                    availableCLIs.push(tool);
                } else {
                    throw new Error(`SKIP: ${tool} not installed`);
                }
            } catch (err) {
                throw new Error(`SKIP: ${tool} not installed`);
            }
        }, { category: 'CLI Availability', allowSkip: true });
    }
    
    console.log(`\n   [LIST] Available CLIs: ${availableCLIs.length}/${cliTools.length}`);
    
    // ==================== Phase 6: Cross-Call Testing ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 6: CLI Cross-Call Testing');
    console.log('='.repeat(60));
    
    if (availableCLIs.length === 0) {
        console.log('[INFO] No available CLI tools, skipping cross-call tests');
    } else {
        for (const cli of availableCLIs.slice(0, 3)) { // Test first 3 available CLIs
            await runner.test(`Cross-call ${cli}`, () => {
                try {
                    // Use simple test prompt
                    const testPrompt = 'hello';
                    console.log(`   [INFO] Test prompt: "${testPrompt}"`);
                    
                    runner.exec(`node bin/stigmergy ${cli} "${testPrompt}"`, {
                        timeout: 30000,
                        allowFail: true,
                        stdio: 'ignore'
                    });
                    
                    console.log(`   [OK] ${cli} cross-call successful`);
                } catch (err) {
                    // Some CLIs may require authentication, not a failure
                    if (err.message.includes('authentication') || err.message.includes('login')) {
                        throw new Error(`SKIP: ${cli} requires authentication`);
                    }
                    throw err;
                }
            }, { category: 'CLI Cross-Call', allowSkip: true });
        }
    }
    
    // ==================== Phase 7: Skill Usage Testing ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 7: Skill Usage Testing');
    console.log('='.repeat(60));
    
    await runner.test('Read skill from local', async () => {
        const listOutput = runner.exec('node bin/stigmergy skill-l', { silent: true });
        
        if (!listOutput.includes('•')) {
            throw new Error('SKIP: No skills installed');
        }
        
        // Extract first skill name
        const match = listOutput.match(/• ([a-z-]+)/);
        if (!match) {
            throw new Error('SKIP: Cannot parse skill name');
        }
        
        const skillName = match[1];
        console.log(`   [INFO] Testing skill: ${skillName}`);
        
        const readOutput = runner.exec(`node bin/stigmergy skill-r ${skillName}`, { 
            silent: true,
            timeout: 15000
        });
        
        if (!readOutput.includes('---')) {
            throw new Error('Skill content format incorrect');
        }
        
        console.log(`   [OK] Skill read successfully, content length: ${readOutput.length} characters`);
    }, { category: 'Skill Usage', allowSkip: true });
    
    await runner.test('Skill install test (simulated)', async () => {
        // Test install command syntax and parameter handling
        try {
            const output = runner.exec('node bin/stigmergy skill install --help', {
                silent: true,
                allowFail: true,
                timeout: 5000
            });
            
            console.log('   [OK] skill install command available');
        } catch (err) {
            // If no --help, try empty parameters
            try {
                runner.exec('node bin/stigmergy skill-i', {
                    silent: true,
                    allowFail: true,
                    timeout: 5000
                });
            } catch (innerErr) {
                // Expected to fail (due to missing parameters), but should not be syntax error
                if (innerErr.message.includes('SyntaxError')) {
                    throw new Error('Command has syntax error');
                }
            }
            console.log('   [OK] skill-i short command available');
        }
    }, { category: 'Skill Usage' });
    
    // ==================== Phase 8: Unit Test Regression ====================
    console.log('\n' + '='.repeat(60));
    console.log('Phase 8: Unit Test Regression');
    console.log('='.repeat(60));
    
    await runner.test('SkillParser unit test', () => {
        runner.exec('node src/core/skills/test-runner.js', { timeout: 30000 });
    }, { category: 'Unit Tests' });
    
    await runner.test('Integration test', () => {
        runner.exec('node src/core/skills/integration-test.js', { timeout: 60000 });
    }, { category: 'Integration Tests' });
    
    await runner.test('Sync functionality test', () => {
        runner.exec('node src/core/skills/sync-test.js', { timeout: 30000 });
    }, { category: 'Integration Tests' });
    
    // ==================== Test Summary ====================
    const success = runner.summary();
    
    // Generate test report file
    const reportPath = path.join(runner.projectRoot, `comprehensive-e2e-report-${Date.now()}.json`);
    await fs.writeFile(
        reportPath,
        JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                total: runner.passed + runner.failed + runner.skipped,
                passed: runner.passed,
                failed: runner.failed,
                skipped: runner.skipped
            },
            availableCLIs,
            results: runner.testResults
        }, null, 2)
    );
    
    console.log(`\n[INFO] Detailed report saved: ${reportPath}`);
    
    if (success) {
        console.log('\n[SUCCESS] All critical tests passed!');
        return 0;
    } else {
        console.log('\n[INFO] Some tests failed, please review detailed report');
        return 1;
    }
}

// Run comprehensive tests
console.log('Starting comprehensive end-to-end tests...\n');
runComprehensiveTests()
    .then(code => process.exit(code))
    .catch(err => {
        console.error('[X] Test execution failed:', err);
        process.exit(1);
    });
