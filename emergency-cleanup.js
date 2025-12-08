#!/usr/bin/env node

/**
 * Emergency Stigmergy Cleanup Script
 * This script manually removes all Stigmergy hooks and configurations
 * that may interfere with other CLI tools
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function emergencyCleanup() {
    console.log('[EMERGENCY CLEANUP] Removing all Stigmergy traces that may interfere with other CLI tools...');
    console.log('='.repeat(80));
    
    // List of all possible hook directories that Stigmergy might have created
    const hookDirectories = [
        // Claude
        path.join(os.homedir(), '.claude', 'hooks'),
        
        // Gemini
        path.join(os.homedir(), '.gemini', 'extensions'),
        
        // Qwen
        path.join(os.homedir(), '.qwen', 'hooks'),
        
        // iFlow
        path.join(os.homedir(), '.iflow', 'hooks'),
        
        // Qoder
        path.join(os.homedir(), '.qoder', 'hooks'),
        
        // CodeBuddy
        path.join(os.homedir(), '.codebuddy', 'hooks'),
        
        // Copilot
        path.join(os.homedir(), '.copilot', 'mcp'),
        
        // Codex
        path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
        
        // Stigmergy global directory
        path.join(os.homedir(), '.stigmergy')
    ];
    
    // List of specific files that might have been created
    const specificFiles = [
        // Config files that might reference Stigmergy
        path.join(os.homedir(), '.claude', 'config.json'),
        path.join(os.homedir(), '.gemini', 'config.json'),
        path.join(os.homedir(), '.qwen', 'config.json'),
        path.join(os.homedir(), '.iflow', 'config.json'),
        path.join(os.homedir(), '.qoder', 'config.json'),
        path.join(os.homedir(), '.codebuddy', 'config.json'),
        path.join(os.homedir(), '.copilot', 'config.json'),
        path.join(os.homedir(), '.codex', 'config.json')
    ];
    
    let removedItems = 0;
    let errors = 0;
    
    // Remove hook directories
    console.log('[STEP 1] Removing hook directories...');
    for (const dir of hookDirectories) {
        try {
            await fs.access(dir);
            const stats = await fs.stat(dir);
            if (stats.isDirectory()) {
                await fs.rm(dir, { recursive: true, force: true });
                console.log(`[REMOVED] Directory: ${dir}`);
                removedItems++;
            }
        } catch (error) {
            console.log(`[SKIPPED] Directory not found: ${dir}`);
        }
    }
    
    // Remove specific files that might contain Stigmergy references
    console.log('\n[STEP 2] Cleaning config files...');
    for (const file of specificFiles) {
        try {
            await fs.access(file);
            const stats = await fs.stat(file);
            if (stats.isFile()) {
                // Instead of deleting config files, we'll try to remove Stigmergy references
                try {
                    const content = await fs.readFile(file, 'utf8');
                    if (content.includes('stigmergy') || content.includes('Stigmergy')) {
                        // Create backup
                        await fs.writeFile(file + '.backup', content, 'utf8');
                        // Remove Stigmergy references
                        const cleanedContent = content
                            .split('\n')
                            .filter(line => !line.includes('stigmergy') && !line.includes('Stigmergy'))
                            .join('\n');
                        await fs.writeFile(file, cleanedContent, 'utf8');
                        console.log(`[CLEANED] File: ${file} (backup saved as ${file}.backup)`);
                        removedItems++;
                    } else {
                        console.log(`[NO CHANGE] File: ${file} (no Stigmergy references)`);
                    }
                } catch (readError) {
                    console.log(`[ERROR] Could not process file ${file}: ${readError.message}`);
                    errors++;
                }
            }
        } catch (error) {
            console.log(`[SKIPPED] File not found: ${file}`);
        }
    }
    
    // Search for any remaining Stigmergy files in common locations
    console.log('\n[STEP 3] Searching for remaining Stigmergy files...');
    const searchLocations = [
        path.join(os.homedir(), '.config'),
        path.join(os.homedir(), '.local'),
        path.join(os.homedir(), 'Documents'),
        path.join(os.homedir(), 'AppData', 'Roaming')
    ];
    
    for (const location of searchLocations) {
        try {
            const items = await fs.readdir(location, { withFileTypes: true });
            for (const item of items) {
                if (item.name.toLowerCase().includes('stigmergy')) {
                    const fullPath = path.join(location, item.name);
                    if (item.isDirectory()) {
                        await fs.rm(fullPath, { recursive: true, force: true });
                        console.log(`[REMOVED] Directory: ${fullPath}`);
                        removedItems++;
                    } else if (item.isFile()) {
                        await fs.unlink(fullPath);
                        console.log(`[REMOVED] File: ${fullPath}`);
                        removedItems++;
                    }
                }
            }
        } catch (error) {
            // Ignore errors in search locations
        }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`[COMPLETE] Emergency cleanup finished:`);
    console.log(`  - Items removed/cleaned: ${removedItems}`);
    console.log(`  - Errors encountered: ${errors}`);
    console.log('\n[VERIFICATION] Please test your other CLI tools now.');
    console.log('If they still do not work, you may need to reinstall them.');
    
    // Additional instructions
    console.log('\n[TROUBLESHOOTING] If CLI tools still do not work:');
    console.log('1. Check your PATH environment variable');
    console.log('2. Reinstall the affected CLI tools');
    console.log('3. Restart your terminal/command prompt');
    console.log('4. Restart your computer if necessary');
}

// Run the emergency cleanup
emergencyCleanup().catch(error => {
    console.error('[FATAL ERROR] Emergency cleanup failed:', error.message);
    process.exit(1);
});