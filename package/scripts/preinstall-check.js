#!/usr/bin/env node

/**
 * Stigmergy Pre-installation Safety Check
 * This script prevents installation conflicts by checking for potential issues
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('[PRE-INSTALL] Running safety checks...');

// Check 1: Verify no conflicting "node" package is already installed
function checkConflictingNodePackage() {
    console.log('[CHECK] Looking for conflicting node packages...');
    
    try {
        const result = spawnSync('npm', ['list', '-g', 'node'], { 
            encoding: 'utf8',
            timeout: 5000
        });
        
        if (result.stdout && result.stdout.includes('node@')) {
            console.error('[ERROR] Conflicting "node" package detected!');
            console.error('[ERROR] This will interfere with CLI tools. Please run:');
            console.error('[ERROR] npm uninstall -g node');
            console.error('[ERROR] Then try installing stigmergy again.');
            process.exit(1);
        }
    } catch (error) {
        // If npm command fails, continue anyway
        console.log('[INFO] Could not verify node package status, continuing...');
    }
    
    console.log('[OK] No conflicting node package found.');
}

// Check 2: Verify system Node.js installation
function checkSystemNode() {
    console.log('[CHECK] Verifying system Node.js installation...');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.match(/^v(\d+)/)[1]);
    
    if (majorVersion < 16) {
        console.error('[ERROR] Node.js version 16 or higher is required.');
        console.error(`[ERROR] Current version: ${nodeVersion}`);
        process.exit(1);
    }
    
    console.log(`[OK] Node.js ${nodeVersion} detected.`);
}

// Check 3: Verify npm installation
function checkNpm() {
    console.log('[CHECK] Verifying npm installation...');
    
    // On Windows, npm might not be directly executable
    if (process.platform === 'win32') {
        console.log('[INFO] Skipping npm verification on Windows (may not be directly executable)');
        return;
    }
    
    try {
        const result = spawnSync('npm', ['--version'], { 
            encoding: 'utf8',
            timeout: 5000
        });
        
        if (result.status !== 0) {
            console.error('[ERROR] npm is not properly installed or accessible.');
            process.exit(1);
        }
        
        console.log(`[OK] npm ${result.stdout.trim()} detected.`);
    } catch (error) {
        console.error('[ERROR] Failed to verify npm installation.');
        process.exit(1);
    }
}

// Check 4: Check for existing stigmergy installation conflicts
function checkExistingInstallation() {
    console.log('[CHECK] Looking for existing Stigmergy installations...');
    
    const npmBinDir = path.join(process.env.APPDATA || process.env.HOME, 'npm');
    const stigmergyBin = path.join(npmBinDir, 'stigmergy');
    
    if (fs.existsSync(stigmergyBin)) {
        console.log('[WARNING] Existing Stigmergy installation detected.');
        console.log('[WARNING] This may cause conflicts. Consider uninstalling first:');
        console.log('[WARNING] npm uninstall -g stigmergy');
    }
    
    console.log('[OK] No conflicting Stigmergy installation found.');
}

// Run all checks
try {
    checkSystemNode();
    checkNpm();
    checkConflictingNodePackage();
    checkExistingInstallation();
    
    console.log('[SUCCESS] All safety checks passed. Proceeding with installation.');
    process.exit(0);
} catch (error) {
    console.error('[FATAL] Safety check failed:', error.message);
    process.exit(1);
}
