#!/usr/bin/env node

/**
 * Enhanced Stigmergy Pre-installation Check
 * This script prevents installation conflicts and cleans historical caches
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('[PRE-INSTALL] Running enhanced installation preparation...');

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

// Check 5: Clean historical caches (NEW FUNCTION)
function cleanHistoricalCaches() {
    console.log('[CLEAN] Cleaning historical caches to prevent conflicts...');

    try {
        // Import and use our enhanced cache cleaner
        const CacheCleaner = require('../src/core/cache_cleaner');
        const cleaner = new CacheCleaner({
            dryRun: false,
            force: true,
            verbose: false,
            preserveRecent: 60 * 60 * 1000 // Preserve files from last hour
        });

        // Clean only safe items before installation
        cleaner.cleanAllCaches({
            cleanStigmergy: false,  // Don't clean main config during install
            cleanNPX: true,          // Clean NPX cache (safe)
            cleanNPM: false,         // Don't clean NPM cache during install
            cleanCLI: false,         // Don't clean CLI configs during install
            cleanTemp: true          // Clean temporary files (safe)
        }).then(results => {
            if (results.filesRemoved > 0) {
                console.log(`[CLEAN] Removed ${results.filesRemoved} cache files`);
                console.log(`[CLEAN] Freed ${formatBytes(results.bytesFreed)} space`);
            } else {
                console.log('[CLEAN] No cache files needed cleaning');
            }
        }).catch(error => {
            console.log(`[WARN] Cache cleaning failed: ${error.message}`);
            console.log('[INFO] Continuing with installation...');
        });

    } catch (error) {
        console.log(`[WARN] Could not initialize cache cleaner: ${error.message}`);
        console.log('[INFO] Continuing with installation...');
    }
}

// Helper function to format bytes
function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Run all checks and preparation
async function runInstallationPreparation() {
    try {
        // System requirements first
        checkSystemNode();
        checkNpm();
        checkConflictingNodePackage();
        checkExistingInstallation();

        // Clean caches (async, but don't wait for completion to avoid blocking npm install)
        cleanHistoricalCaches();

        console.log('[SUCCESS] Enhanced installation preparation completed.');
        console.log('[INFO] Proceeding with package installation...');

        // Give cache cleaning a moment to start
        setTimeout(() => {
            process.exit(0);
        }, 1000);

    } catch (error) {
        console.error('[FATAL] Installation preparation failed:', error.message);
        process.exit(1);
    }
}

// Run the enhanced preparation
runInstallationPreparation();
