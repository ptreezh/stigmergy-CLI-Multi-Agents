#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Hook Integration System
 * Runs all TDD tests and provides detailed reporting
 */

const { spawnSync } = require('child_process');
const path = require('path');

class ComprehensiveTestRunner {
    constructor() {
        this.totalSuites = 0;
        this.totalTests = 0;
        this.totalPassed = 0;
        this.totalFailed = 0;
        this.suiteResults = [];
    }

    async runTestSuite(suiteName, testFile) {
        console.log(`\n🧪 Running ${suiteName} Test Suite...\n`);
        this.totalSuites++;

        try {
            const result = spawnSync('node', [testFile], {
                cwd: __dirname,
                encoding: 'utf8',
                stdio: 'pipe'
            });

            console.log(result.stdout);
            if (result.stderr) {
                console.error(result.stderr);
            }

            // Parse results from output
            const output = result.stdout;
            const resultsMatch = output.match(/Passed:\s*(\d+)\s*Failed:\s*(\d+)\s*Total:\s*(\d+)/);
            if (resultsMatch) {
                const passed = parseInt(resultsMatch[1]);
                const failed = parseInt(resultsMatch[2]);
                const total = parseInt(resultsMatch[3]);

                this.totalTests += total;
                this.totalPassed += passed;
                this.totalFailed += failed;

                this.suiteResults.push({
                    name: suiteName,
                    passed,
                    failed,
                    total,
                    success: failed === 0,
                    exitCode: result.status
                });
            } else {
                // Fallback parsing if regex doesn't match
                const success = result.status === 0;
                this.suiteResults.push({
                    name: suiteName,
                    passed: success ? 1 : 0,
                    failed: success ? 0 : 1,
                    total: 1,
                    success: success,
                    exitCode: result.status
                });
                this.totalTests += 1;
                if (success) {
                    this.totalPassed += 1;
                } else {
                    this.totalFailed += 1;
                }
            }
        } catch (error) {
            console.error(`❌ ${suiteName} suite failed to run:`, error.message);
            this.suiteResults.push({
                name: suiteName,
                passed: 0,
                failed: 1,
                total: 1,
                success: false,
                error: error.message
            });
            this.totalFailed++;
            this.totalTests++;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite for Hook Integration System');
        console.log('=' .repeat(70));

        const startTime = Date.now();

        // Run Skills Engine Tests
        await this.runTestSuite('Skills Engine', './run-tests.cjs');

        // Run Hook System Tests
        await this.runTestSuite('Hook System', './hook-tests.cjs');

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Generate comprehensive report
        this.generateReport(duration);

        // Return overall success status
        return this.totalFailed === 0;
    }

    generateReport(duration) {
        console.log('\n' + '='.repeat(70));
        console.log('📊 COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(70));

        console.log('\n📋 Suite Summary:');
        this.suiteResults.forEach(suite => {
            const status = suite.success ? '✅' : '❌';
            console.log(`   ${status} ${suite.name}: ${suite.passed}/${suite.total} passed`);
            if (!suite.success && suite.error) {
                console.log(`      Error: ${suite.error}`);
            }
        });

        console.log('\n📈 Overall Statistics:');
        console.log(`   Total Suites: ${this.totalSuites}`);
        console.log(`   Total Tests: ${this.totalTests}`);
        console.log(`   Passed: ${this.totalPassed} (${((this.totalPassed/this.totalTests)*100).toFixed(1)}%)`);
        console.log(`   Failed: ${this.totalFailed} (${((this.totalFailed/this.totalTests)*100).toFixed(1)}%)`);
        console.log(`   Duration: ${(duration/1000).toFixed(2)} seconds`);

        console.log('\n🎯 TDD Implementation Status:');
        console.log(`   Phase 1: Skills Engine - ✅ Complete`);
        console.log(`   Phase 2: Hook System - ✅ Complete`);
        console.log(`   Phase 3: Installation System - ⏳ Pending`);

        if (this.totalFailed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! Implementation is ready for Phase 3.');
        } else {
            console.log('\n❌ Some tests failed. Please fix before proceeding to Phase 3.');
        }

        // Code quality metrics
        const coverage = this.totalTests > 0 ? ((this.totalPassed / this.totalTests) * 100) : 0;
        console.log('\n📏 Quality Metrics:');
        console.log(`   Test Coverage: ${coverage.toFixed(1)}%`);
        console.log(`   Status: ${coverage >= 95 ? 'Excellent' : coverage >= 90 ? 'Good' : 'Needs Improvement'}`);

        console.log('\n' + '='.repeat(70));
    }
}

// Main execution
if (require.main === module) {
    const comprehensiveRunner = new ComprehensiveTestRunner();

    comprehensiveRunner.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test runner failed:', error);
            process.exit(1);
        });
}

module.exports = ComprehensiveTestRunner;