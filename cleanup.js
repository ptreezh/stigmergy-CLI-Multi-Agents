#!/usr/bin/env node

/**
 * Stigmergy Cleanup Script
 * This script completely removes all Stigmergy traces from the system
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function cleanupStigmergy() {
    console.log('[CLEANUP] Starting complete Stigmergy cleanup...');
    console.log('='.repeat(60));
    
    // Directories to clean
    const cleanupPaths = [
        // Global Stigmergy directory
        path.join(os.homedir(), '.stigmergy'),
        
        // Individual CLI tool hook directories
        path.join(os.homedir(), '.claude', 'hooks'),
        path.join(os.homedir(), '.gemini', 'extensions'),
        path.join(os.homedir(), '.qwen', 'hooks'),
        path.join(os.homedir(), '.iflow', 'hooks'),
        path.join(os.homedir(), '.qoder', 'hooks'),
        path.join(os.homedir(), '.codebuddy', 'hooks'),
        path.join(os.homedir(), '.copilot', 'mcp'),
        path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
        
        // Config files
        path.join(os.homedir(), '.claude', 'config.json'),
        path.join(os.homedir(), '.gemini', 'config.json'),
        path.join(os.homedir(), '.qwen', 'config.json'),
        path.join(os.homedir(), '.iflow', 'config.json'),
        path.join(os.homedir(), '.qoder', 'config.json'),
        path.join(os.homedir(), '.codebuddy', 'config.json'),
        path.join(os.homedir(), '.copilot', 'config.json'),
        path.join(os.homedir(), '.codex', 'config.json')
    ];
    
    let cleanedCount = 0;
    let errorCount = 0;
    
    // Clean each path
    for (const cleanupPath of cleanupPaths) {
        try {
            // Check if path exists
            await fs.access(cleanupPath);
            
            // If it's a file, remove the file
            const stats = await fs.stat(cleanupPath);
            if (stats.isFile()) {
                await fs.unlink(cleanupPath);
                console.log(`[OK] Removed file: ${cleanupPath}`);
                cleanedCount++;
            } 
            // If it's a directory, remove recursively
            else if (stats.isDirectory()) {
                await fs.rm(cleanupPath, { recursive: true, force: true });
                console.log(`[OK] Removed directory: ${cleanupPath}`);
                cleanedCount++;
            }
        } catch (error) {
            // Path doesn't exist or other error, that's fine
            console.log(`[INFO] Path not found or already cleaned: ${cleanupPath}`);
        }
    }
    
    // Also look for any stigmergy-hook files in common locations
    const commonLocations = [
        path.join(os.homedir(), '.config'),
        path.join(os.homedir(), '.local'),
        path.join(os.homedir(), 'Documents'),
        path.join(os.homedir(), 'AppData', 'Roaming')
    ];
    
    console.log('\n[SEARCH] Looking for additional Stigmergy files...');
    
    for (const location of commonLocations) {
        try {
            const files = await fs.readdir(location, { withFileTypes: true });
            for (const file of files) {
                if (file.name.includes('stigmergy') || file.name.includes('Stigmergy')) {
                    const fullPath = path.join(location, file.name);
                    if (file.isDirectory()) {
                        await fs.rm(fullPath, { recursive: true, force: true });
                        console.log(`[OK] Removed Stigmergy directory: ${fullPath}`);
                        cleanedCount++;
                    } else if (file.isFile()) {
                        await fs.unlink(fullPath);
                        console.log(`[OK] Removed Stigmergy file: ${fullPath}`);
                        cleanedCount++;
                    }
                }
            }
        } catch (error) {
            // Ignore errors for common locations
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`[RESULT] Cleanup completed: ${cleanedCount} items removed, ${errorCount} errors`);
    console.log('[SUCCESS] Stigmergy completely removed from system!');
    console.log('\n[NEXT] To reinstall Stigmergy:');
    console.log('  1. Run: npm install -g stigmergy');
    console.log('  2. Run: stigmergy setup');
}

// Run the cleanup
cleanupStigmergy().catch(error => {
    console.error('[ERROR] Cleanup failed:', error.message);
    process.exit(1);
});