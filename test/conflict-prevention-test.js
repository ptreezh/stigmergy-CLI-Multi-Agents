#!/usr/bin/env node

/**
 * Stigmergy Conflict Prevention System Test
 * This script verifies that the conflict prevention system works correctly
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

async function runTests() {
    console.log('Stigmergy Conflict Prevention System Test');
    console.log('='.repeat(50));
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Test 1: Pre-installation check exists
    totalTests++;
    try {
        await fs.access(path.join(__dirname, '..', 'scripts', 'preinstall-check.js'));
        console.log('[PASS] Test 1: Pre-installation check script exists');
        passedTests++;
    } catch (error) {
        console.log('[FAIL] Test 1: Pre-installation check script missing');
    }
    
    // Test 2: Conflict fixer exists
    totalTests++;
    try {
        await fs.access(path.join(__dirname, '..', 'fix-node-conflict.js'));
        console.log('[PASS] Test 2: Conflict fixer script exists');
        passedTests++;
    } catch (error) {
        console.log('[FAIL] Test 2: Conflict fixer script missing');
    }
    
    // Test 3: Safety check in main script
    totalTests++;
    try {
        const mainScript = await fs.readFile(path.join(__dirname, '..', 'src', 'main_english.js'), 'utf8');
        if (mainScript.includes('safetyCheck')) {
            console.log('[PASS] Test 3: Safety check implemented in main script');
            passedTests++;
        } else {
            console.log('[FAIL] Test 3: Safety check not found in main script');
        }
    } catch (error) {
        console.log('[FAIL] Test 3: Could not read main script');
    }
    
    // Test 4: Package.json includes safety scripts
    totalTests++;
    try {
        const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
        if (packageJson.scripts && packageJson.scripts['fix-node-conflict']) {
            console.log('[PASS] Test 4: Safety scripts registered in package.json');
            passedTests++;
        } else {
            console.log('[FAIL] Test 4: Safety scripts missing from package.json');
        }
    } catch (error) {
        console.log('[FAIL] Test 4: Could not read package.json');
    }
    
    // Test 5: Documentation exists
    totalTests++;
    try {
        await fs.access(path.join(__dirname, '..', 'docs', 'CONFLICT_PREVENTION.md'));
        console.log('[PASS] Test 5: Conflict prevention documentation exists');
        passedTests++;
    } catch (error) {
        console.log('[FAIL] Test 5: Conflict prevention documentation missing');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('[SUCCESS] All conflict prevention mechanisms are in place!');
        return true;
    } else {
        console.log('[WARNING] Some conflict prevention mechanisms are missing.');
        return false;
    }
}

// Run tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('[ERROR] Test suite failed:', error.message);
    process.exit(1);
});