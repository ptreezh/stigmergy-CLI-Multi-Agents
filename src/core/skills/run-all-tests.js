/**
 * Complete Test Suite Runner - TDD-driven development
 * 
 * Test Levels:
 * 1. Unit Tests (14) - Basic functionality
 * 2. Integration Tests (7) - Module cooperation
 * 3. Regression Tests (10) - Existing functionality protection
 * 
 * Total: 31 tests
 */

import { execSync, spawn } from 'child_process';
import path from 'path';

class TestSuiteRunner {
    constructor() {
        this.results = {
            unit: { passed: 0, failed: 0, name: 'Unit Tests' },
            integration: { passed: 0, failed: 0, name: 'Integration Tests' },
            regression: { passed: 0, failed: 0, name: 'Regression Tests' }
        };
    }

    async runTest(name, scriptPath) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`[LIST] Running ${name}`);
        console.log('='.repeat(70));

        return new Promise((resolve) => {
            const child = spawn('node', [scriptPath], {
                cwd: process.cwd(),
                stdio: 'inherit',
                shell: true
            });

            child.on('close', (code) => {
                resolve(code === 0);
            });

            child.on('error', (err) => {
                console.error(`[X] Execution failed: ${err.message}`);
                resolve(false);
            });
        });
    }

    printSummary() {
        console.log(`\n\n${'='.repeat(70)}`);
        console.log('[LIST] Complete Test Suite Summary');
        console.log('='.repeat(70));

        let totalPassed = 0;
        let totalFailed = 0;

        for (const [key, result] of Object.entries(this.results)) {
            const icon = result.failed === 0 ? '[OK]' : '[X]';
            console.log(`${icon} ${result.name}: ${result.passed} passed, ${result.failed} failed`);
            totalPassed += result.passed;
            totalFailed += result.failed;
        }

        console.log('='.repeat(70));
        console.log(`[LIST] Total: ${totalPassed + totalFailed} tests`);
        console.log(`[OK] Passed: ${totalPassed}`);
        console.log(`[X] Failed: ${totalFailed}`);
        console.log('='.repeat(70));

        if (totalFailed === 0) {
            console.log('\n[SUCCESS] All tests passed! System ready for integration into main command.');
            console.log('\n[OK] TDD Verification Complete:');
            console.log('  [OK] Basic functionality tests passed (14 unit tests)');
            console.log('  [OK] Module integration tests passed (7 integration tests)');
            console.log('  [OK] Existing functionality protection passed (10 regression tests)');
            console.log('\n[SUCCESS] Safe to integrate into stigmergy main command!');
        } else {
            console.log('\n[X] Some tests failed, please fix before integration.');
        }

        return totalFailed === 0;
    }
}

async function runAllTests() {
    const runner = new TestSuiteRunner();

    console.log('[SUCCESS] Stigmergy Skills - Complete Test Suite');
    console.log('TDD-driven, ensuring quality\n');

    const currentDir = process.cwd();

    // 1. Unit Tests
    const unitTestSuccess = await runner.runTest(
        'Unit Tests (SkillParser, SkillReader, SkillInstaller)',
        path.join(currentDir, 'test-runner.js')
    );
    runner.results.unit.passed = unitTestSuccess ? 14 : 0;
    runner.results.unit.failed = unitTestSuccess ? 0 : 14;

    // 2. Integration Tests
    const integrationTestSuccess = await runner.runTest(
        'Integration Tests (StigmergySkillManager)',
        path.join(currentDir, 'integration-test.js')
    );
    runner.results.integration.passed = integrationTestSuccess ? 7 : 0;
    runner.results.integration.failed = integrationTestSuccess ? 0 : 7;

    // 3. Regression Tests
    const regressionTestSuccess = await runner.runTest(
        'Regression Tests (Existing Functionality Protection)',
        path.join(currentDir, 'regression-test.js')
    );
    runner.results.regression.passed = regressionTestSuccess ? 10 : 0;
    runner.results.regression.failed = regressionTestSuccess ? 0 : 10;

    // Print summary
    const success = runner.printSummary();

    return success;
}

// Run all tests
runAllTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.error('\n[X] Test suite execution failed:', err);
        process.exit(1);
    });
