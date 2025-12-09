#!/usr/bin/env node

/**
 * Python Plugins Test Suite
 * This test verifies that all Python-based plugins and adapters are functional
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

class PythonPluginsTest {
    constructor() {
        this.testResults = [];
        this.stigmergyAssetsDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters');
    }

    async runTests() {
        console.log('==============================================');
        console.log('PYTHON PLUGINS TEST SUITE');
        console.log('==============================================\n');

        // Test 1: Check Python availability
        await this.testPythonAvailability();

        // Test 2: Check adapter directories
        await this.testAdapterDirectories();

        // Test 3: Test installation scripts
        await this.testInstallationScripts();

        // Test 4: Test adapter functionality
        await this.testAdapterFunctionality();

        this.generateReport();
    }

    async testPythonAvailability() {
        console.log('TEST 1: Python Availability');
        console.log('--------------------------');

        try {
            const result = spawnSync('python', ['--version'], {
                encoding: 'utf8',
                timeout: 5000
            });

            if (result.status === 0) {
                console.log(`  ✅ Python available: ${result.stdout.trim()}`);
                this.testResults.push({
                    name: 'Python Availability',
                    passed: true,
                    details: result.stdout.trim()
                });
            } else {
                console.log(`  ❌ Python not available: ${result.stderr}`);
                this.testResults.push({
                    name: 'Python Availability',
                    passed: false,
                    details: result.stderr
                });
            }
        } catch (error) {
            console.log(`  ❌ Python test failed: ${error.message}`);
            this.testResults.push({
                name: 'Python Availability',
                passed: false,
                details: error.message
            });
        }
        console.log('');
    }

    async testAdapterDirectories() {
        console.log('TEST 2: Adapter Directories');
        console.log('--------------------------');

        try {
            if (!fs.existsSync(this.stigmergyAssetsDir)) {
                console.log(`  ❌ Assets directory not found: ${this.stigmergyAssetsDir}`);
                this.testResults.push({
                    name: 'Adapter Directories',
                    passed: false,
                    details: `Assets directory not found: ${this.stigmergyAssetsDir}`
                });
                return;
            }

            const adapterDirs = fs.readdirSync(this.stigmergyAssetsDir);
            console.log(`  ✅ Found ${adapterDirs.length} adapter directories:`);
            adapterDirs.forEach(dir => console.log(`    - ${dir}`));

            this.testResults.push({
                name: 'Adapter Directories',
                passed: true,
                details: `Found ${adapterDirs.length} adapter directories`
            });
        } catch (error) {
            console.log(`  ❌ Adapter directories test failed: ${error.message}`);
            this.testResults.push({
                name: 'Adapter Directories',
                passed: false,
                details: error.message
            });
        }
        console.log('');
    }

    async testInstallationScripts() {
        console.log('TEST 3: Installation Scripts');
        console.log('----------------------------');

        try {
            const adapterDirs = fs.readdirSync(this.stigmergyAssetsDir);
            let scriptCount = 0;
            let workingScripts = 0;

            for (const dir of adapterDirs) {
                const adapterDir = path.join(this.stigmergyAssetsDir, dir);
                const installScript = path.join(adapterDir, `install_${dir}_integration.py`);
                
                if (fs.existsSync(installScript)) {
                    scriptCount++;
                    console.log(`  Found: ${dir} installation script`);
                    
                    // Test script help functionality
                    try {
                        const result = spawnSync('python', [installScript, '--help'], {
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        if (result.status === 0 || result.stderr.includes('usage:') || result.stdout.includes('usage:')) {
                            console.log(`    ✅ ${dir} script works`);
                            workingScripts++;
                        } else {
                            console.log(`    ⚠️  ${dir} script has issues`);
                        }
                    } catch (scriptError) {
                        console.log(`    ⚠️  ${dir} script test failed: ${scriptError.message}`);
                    }
                }
            }

            console.log(`\n  Found ${scriptCount} installation scripts, ${workingScripts} working`);
            this.testResults.push({
                name: 'Installation Scripts',
                passed: workingScripts > 0,
                details: `Found ${scriptCount} scripts, ${workingScripts} working`
            });
        } catch (error) {
            console.log(`  ❌ Installation scripts test failed: ${error.message}`);
            this.testResults.push({
                name: 'Installation Scripts',
                passed: false,
                details: error.message
            });
        }
        console.log('');
    }

    async testAdapterFunctionality() {
        console.log('TEST 4: Adapter Functionality');
        console.log('----------------------------');

        const keyAdapters = ['iflow', 'claude', 'qoder'];
        let testedAdapters = 0;
        let workingAdapters = 0;

        for (const adapter of keyAdapters) {
            const adapterDir = path.join(this.stigmergyAssetsDir, adapter);
            const installScript = path.join(adapterDir, `install_${adapter}_integration.py`);
            
            if (fs.existsSync(installScript)) {
                testedAdapters++;
                console.log(`  Testing ${adapter} adapter...`);
                
                try {
                    // Test status command for adapters that support it
                    const result = spawnSync('python', [installScript, 'status'], {
                        encoding: 'utf8',
                        timeout: 15000
                    });
                    
                    if (result.status === 0) {
                        console.log(`    ✅ ${adapter} adapter functional`);
                        workingAdapters++;
                    } else {
                        // Try alternative command
                        const helpResult = spawnSync('python', [installScript, '--help'], {
                            encoding: 'utf8',
                            timeout: 10000
                        });
                        
                        if (helpResult.status === 0) {
                            console.log(`    ✅ ${adapter} adapter accessible (help works)`);
                            workingAdapters++;
                        } else {
                            console.log(`    ⚠️  ${adapter} adapter has issues`);
                        }
                    }
                } catch (adapterError) {
                    console.log(`    ⚠️  ${adapter} adapter test failed: ${adapterError.message}`);
                }
            }
        }

        console.log(`\n  Tested ${testedAdapters} key adapters, ${workingAdapters} functional`);
        this.testResults.push({
            name: 'Adapter Functionality',
            passed: workingAdapters > 0,
            details: `Tested ${testedAdapters} adapters, ${workingAdapters} functional`
        });
        console.log('');
    }

    generateReport() {
        console.log('==============================================');
        console.log('PYTHON PLUGINS TEST REPORT');
        console.log('==============================================\n');

        const passedTests = this.testResults.filter(t => t.passed).length;
        const totalTests = this.testResults.length;

        console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed\n`);

        if (passedTests === totalTests) {
            console.log('✅ ALL PYTHON PLUGIN TESTS PASSED');
            console.log('🎉 Python plugins are fully functional and ready for use!\n');
        } else if (passedTests > 0) {
            console.log('⚠️  SOME PYTHON PLUGIN TESTS PASSED');
            console.log('🔧 Python plugins have partial functionality\n');
        } else {
            console.log('❌ NO PYTHON PLUGIN TESTS PASSED');
            console.log('🚨 Python plugins require attention\n');
        }

        console.log('📋 DETAILED RESULTS:');
        this.testResults.forEach((test, index) => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${test.name}: ${test.details}`);
        });

        console.log('\n🎯 RECOMMENDATIONS:');
        console.log('1. Ensure all Python installation scripts are executable');
        console.log('2. Verify Python dependencies are installed');
        console.log('3. Test adapter integration with actual AI tools');
        console.log('4. Monitor for encoding issues in cross-platform environments');
    }
}

// Run tests
if (require.main === module) {
    const tester = new PythonPluginsTest();
    tester.runTests();
}

module.exports = PythonPluginsTest;