#!/usr/bin/env node

/**
 * Stigmergy Diagnostic and Cleanup Tool
 * This tool helps diagnose and fix issues caused by Stigmergy CLI
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');

// Function to check if a command exists
function checkCommand(command) {
    return new Promise((resolve) => {
        const process = spawn(command, ['--version'], { stdio: 'ignore' });
        process.on('close', (code) => {
            resolve(code === 0);
        });
        process.on('error', () => {
            resolve(false);
        });
    });
}

// Function to get PATH environment variable
function getPath() {
    return process.env.PATH || '';
}

// Function to check for Stigmergy references in shell config files
async function checkShellConfigs() {
    const shellConfigs = [
        path.join(os.homedir(), '.bashrc'),
        path.join(os.homedir(), '.bash_profile'),
        path.join(os.homedir(), '.zshrc'),
        path.join(os.homedir(), '.profile'),
        path.join(os.homedir(), '.fish/config.fish')
    ];
    
    console.log('[DIAGNOSTIC] Checking shell configuration files for Stigmergy references...');
    
    for (const configFile of shellConfigs) {
        try {
            await fs.access(configFile);
            const content = await fs.readFile(configFile, 'utf8');
            if (content.includes('stigmergy') || content.includes('Stigmergy')) {
                console.log(`[WARNING] Found Stigmergy references in: ${configFile}`);
                console.log('Please manually review and remove these lines if they cause issues.');
            } else {
                console.log(`[OK] No Stigmergy references in: ${configFile}`);
            }
        } catch (error) {
            console.log(`[INFO] Shell config not found: ${configFile}`);
        }
    }
}

// Function to check PATH for potential issues
function checkPath() {
    const pathVar = getPath();
    console.log('[DIAGNOSTIC] Current PATH environment variable:');
    console.log(pathVar);
    
    // Check for common problematic paths
    const problematicPaths = [
        'stigmergy',
        'Stigmergy',
        '.stigmergy'
    ];
    
    for (const problemPath of problematicPaths) {
        if (pathVar.includes(problemPath)) {
            console.log(`[WARNING] Potential problematic path found: ${problemPath}`);
        }
    }
}

// Function to test common CLI tools
async function testCLITools() {
    console.log('[DIAGNOSTIC] Testing common CLI tools...');
    
    const commonTools = [
        'node', 'npm', 'git', 'python', 'python3',
        'claude', 'gemini', 'qwen', 'iflow', 'qodercli',
        'codebuddy', 'copilot', 'codex'
    ];
    
    for (const tool of commonTools) {
        const isAvailable = await checkCommand(tool);
        if (isAvailable) {
            console.log(`[OK] ${tool} is available`);
        } else {
            console.log(`[ISSUE] ${tool} is not available or not in PATH`);
        }
    }
}

// Function to search for Stigmergy files in common locations
async function searchForStigmergyFiles() {
    console.log('[DIAGNOSTIC] Searching for Stigmergy files in common locations...');
    
    const searchLocations = [
        os.homedir(),
        path.join(os.homedir(), '.config'),
        path.join(os.homedir(), '.local'),
        path.join(os.homedir(), 'Documents'),
        path.join(os.homedir(), 'AppData'),
        '/usr/local/bin',
        '/usr/bin',
        '/bin'
    ];
    
    for (const location of searchLocations) {
        try {
            const items = await fs.readdir(location, { withFileTypes: true });
            for (const item of items) {
                if (item.name.toLowerCase().includes('stigmergy')) {
                    const fullPath = path.join(location, item.name);
                    console.log(`[FOUND] Stigmergy-related item: ${fullPath}`);
                }
            }
        } catch (error) {
            // Ignore errors for inaccessible locations
        }
    }
}

// Function to provide manual cleanup instructions
function provideManualCleanupInstructions() {
    console.log('\n' + '='.repeat(80));
    console.log('[MANUAL CLEANUP INSTRUCTIONS]');
    console.log('='.repeat(80));
    
    console.log(`
1. Check and clean shell configuration files:
   - ~/.bashrc
   - ~/.bash_profile
   - ~/.zshrc
   - ~/.profile
   Look for and remove any lines that reference Stigmergy

2. Check your PATH environment variable:
   - Make sure it doesn't contain Stigmergy-related paths
   - Remove any problematic entries

3. Manually delete Stigmergy directories:
   - ~/.stigmergy/
   - ~/.claude/hooks/
   - ~/.gemini/extensions/
   - ~/.qwen/hooks/
   - ~/.iflow/hooks/
   - ~/.qoder/hooks/
   - ~/.codebuddy/hooks/
   - ~/.copilot/mcp/
   - ~/.config/codex/slash_commands/

4. Reinstall affected CLI tools:
   If other CLI tools are still not working, try reinstalling them:
   - npm uninstall -g <tool-name>
   - npm install -g <tool-name>

5. Restart your terminal/command prompt:
   Close and reopen your terminal to refresh environment variables

6. Restart your computer:
   If issues persist, a system restart may help clear any cached references
    `);
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('Stigmergy Diagnostic and Cleanup Tool');
    console.log('='.repeat(50));
    console.log('This tool helps diagnose and fix issues caused by Stigmergy CLI\n');
    
    try {
        await checkShellConfigs();
        console.log('');
        
        checkPath();
        console.log('');
        
        await testCLITools();
        console.log('');
        
        await searchForStigmergyFiles();
        console.log('');
        
        provideManualCleanupInstructions();
        
        console.log('\n' + '='.repeat(50));
        console.log('Diagnostic complete. Please review the output above.');
        console.log('If you continue to have issues, follow the manual cleanup instructions.');
    } catch (error) {
        console.error('[ERROR] Diagnostic failed:', error.message);
        process.exit(1);
    }
}

// Run diagnostics
runDiagnostics();