#!/usr/bin/env node

/**
 * Stigmergy PATH Fixer
 * This script helps fix PATH environment variable issues caused by Stigmergy
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Function to get current PATH
function getCurrentPath() {
    return process.env.PATH || '';
}

// Function to detect problematic PATH entries
function detectProblematicPaths(currentPath) {
    const paths = currentPath.split(path.delimiter);
    const problematicEntries = [];
    
    for (const pathEntry of paths) {
        if (pathEntry.toLowerCase().includes('stigmergy')) {
            problematicEntries.push(pathEntry);
        }
    }
    
    return problematicEntries;
}

// Function to provide instructions for fixing PATH on Windows
function provideWindowsPathFixInstructions(problematicEntries) {
    console.log('\n[WINDOWS PATH FIX INSTRUCTIONS]');
    console.log('=' .repeat(40));
    
    console.log('\nTo fix PATH issues on Windows:');
    console.log('1. Press Win + R, type "sysdm.cpl", and press Enter');
    console.log('2. Click on the "Advanced" tab');
    console.log('3. Click on "Environment Variables"');
    console.log('4. In the "System variables" section, find and select "Path"');
    console.log('5. Click "Edit"');
    console.log('6. Remove the following entries:');
    
    for (const entry of problematicEntries) {
        console.log(`   - ${entry}`);
    }
    
    console.log('7. Click "OK" to save changes');
    console.log('8. Restart your command prompt/terminal');
    console.log('9. Restart your computer to ensure all processes pick up the changes');
}

// Function to provide instructions for fixing PATH on Unix-like systems
function provideUnixPathFixInstructions(problematicEntries) {
    console.log('\n[UNIX/LINUX/MAC PATH FIX INSTRUCTIONS]');
    console.log('=' .repeat(40));
    
    console.log('\nTo fix PATH issues on Unix-like systems:');
    console.log('1. Check your shell configuration files:');
    console.log('   - ~/.bashrc');
    console.log('   - ~/.bash_profile');
    console.log('   - ~/.zshrc');
    console.log('   - ~/.profile');
    console.log('');
    console.log('2. Look for lines similar to:');
    
    for (const entry of problematicEntries) {
        console.log(`   export PATH="${entry}:$PATH"`);
        console.log(`   export PATH="$PATH:${entry}"`);
    }
    
    console.log('');
    console.log('3. Remove or comment out these lines');
    console.log('4. Reload your shell configuration:');
    console.log('   source ~/.bashrc  # or the appropriate file');
    console.log('5. Restart your terminal');
}

// Function to check for stigmergy-related directories
async function checkStigmergyDirectories() {
    console.log('\n[CHECKING STIGMERGY DIRECTORIES]');
    console.log('=' .repeat(30));
    
    const stigmergyPaths = [
        path.join(os.homedir(), '.stigmergy'),
        path.join(os.homedir(), '.stigmergy-test'),
        path.join(os.homedir(), '.claude', 'hooks'),
        path.join(os.homedir(), '.gemini', 'extensions'),
        path.join(os.homedir(), '.qwen', 'hooks'),
        path.join(os.homedir(), '.iflow', 'hooks'),
        path.join(os.homedir(), '.qoder', 'hooks'),
        path.join(os.homedir(), '.codebuddy', 'hooks'),
        path.join(os.homedir(), '.copilot', 'mcp'),
        path.join(os.homedir(), '.config', 'codex', 'slash_commands')
    ];
    
    const foundPaths = [];
    
    for (const stigPath of stigmergyPaths) {
        try {
            await fs.access(stigPath);
            foundPaths.push(stigPath);
            console.log(`[FOUND] ${stigPath}`);
        } catch (error) {
            // Path doesn't exist, that's fine
        }
    }
    
    if (foundPaths.length > 0) {
        console.log(`\n[RECOMMENDATION] Consider removing these ${foundPaths.length} directories manually.`);
    } else {
        console.log('\n[OK] No Stigmergy directories found in standard locations.');
    }
    
    return foundPaths;
}

// Main function
async function fixPathIssues() {
    console.log('Stigmergy PATH Issue Detector and Fixer');
    console.log('=' .repeat(40));
    
    // Get current PATH
    const currentPath = getCurrentPath();
    console.log('[CURRENT PATH]');
    console.log(currentPath);
    
    // Detect problematic entries
    const problematicEntries = detectProblematicPaths(currentPath);
    
    if (problematicEntries.length > 0) {
        console.log('\n[PROBLEMATIC PATH ENTRIES FOUND]');
        console.log('=' .repeat(35));
        
        for (const entry of problematicEntries) {
            console.log(`[ISSUE] ${entry}`);
        }
        
        // Provide platform-specific instructions
        if (process.platform === 'win32') {
            provideWindowsPathFixInstructions(problematicEntries);
        } else {
            provideUnixPathFixInstructions(problematicEntries);
        }
    } else {
        console.log('\n[OK] No Stigmergy-related entries found in PATH.');
    }
    
    // Check for Stigmergy directories
    await checkStigmergyDirectories();
    
    console.log('\n' + '=' .repeat(40));
    console.log('PATH diagnosis complete.');
    if (problematicEntries.length > 0) {
        console.log('Please follow the instructions above to fix PATH issues.');
    }
}

// Run the fixer
fixPathIssues().catch(error => {
    console.error('[ERROR] PATH fixer failed:', error.message);
    process.exit(1);
});