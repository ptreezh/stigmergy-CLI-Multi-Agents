#!/usr/bin/env node

/**
 * Stigmergy Node.js Conflict Fixer and Preventer
 * This script fixes and prevents conflicts with other CLI tools
 */

const fs = require('fs').promises;
const path = require('path');

class ConflictPreventer {
    constructor() {
        this.npmDir = path.join(process.env.APPDATA || process.env.HOME, 'npm');
        this.conflictMarkers = [
            'node', 
            'node.exe', 
            'node.cmd',
            'npm',
            'npm.exe',
            'npm.cmd'
        ];
    }
    
    // Comprehensive conflict detection
    async detectConflicts() {
        console.log('[DETECT] Scanning for potential conflicts...');
        
        const conflicts = [];
        
        // Check for conflicting packages
        const nodeModulesDir = path.join(this.npmDir, 'node_modules');
        try {
            const packages = await fs.readdir(nodeModulesDir);
            for (const pkg of packages) {
                if (pkg.toLowerCase() === 'node' && pkg !== 'npm') {
                    conflicts.push({
                        type: 'package',
                        name: pkg,
                        path: path.join(nodeModulesDir, pkg),
                        risk: 'high'
                    });
                }
            }
        } catch (error) {
            // node_modules doesn't exist, that's fine
        }
        
        // Check for conflicting executables
        for (const marker of this.conflictMarkers) {
            const filePath = path.join(this.npmDir, marker);
            try {
                await fs.access(filePath);
                const content = await fs.readFile(filePath, 'utf8');
                
                // Check if it's a broken symlink or script
                if (content.includes('intentionally left blank') || 
                    content.includes('node_modules/node') ||
                    content.includes('This file')) {
                    conflicts.push({
                        type: 'executable',
                        name: marker,
                        path: filePath,
                        risk: 'high',
                        reason: 'Broken or malicious executable'
                    });
                }
            } catch (error) {
                // File doesn't exist, that's fine
            }
        }
        
        return conflicts;
    }
    
    // Fix detected conflicts
    async fixConflicts(conflicts) {
        console.log(`[FIX] Fixing ${conflicts.length} detected conflicts...`);
        
        let fixedCount = 0;
        
        for (const conflict of conflicts) {
            try {
                if (conflict.type === 'package') {
                    console.log(`[FIX] Removing conflicting package: ${conflict.name}`);
                    await fs.rm(conflict.path, { recursive: true, force: true });
                    fixedCount++;
                } else if (conflict.type === 'executable') {
                    console.log(`[FIX] Removing conflicting executable: ${conflict.name}`);
                    await fs.unlink(conflict.path);
                    fixedCount++;
                }
            } catch (error) {
                console.log(`[ERROR] Failed to fix ${conflict.name}: ${error.message}`);
            }
        }
        
        return fixedCount;
    }
    
    // Preventive measures
    async applyPreventiveMeasures() {
        console.log('[PREVENT] Applying preventive measures...');
        
        // Create a safety marker file
        const markerFile = path.join(this.npmDir, '.stigmergy-safety-marker');
        try {
            await fs.writeFile(markerFile, 'Stigmergy safety marker - do not remove', 'utf8');
            console.log('[OK] Safety marker created.');
        } catch (error) {
            console.log('[INFO] Could not create safety marker.');
        }
        
        // Check PATH for potential issues
        const pathVar = process.env.PATH || '';
        if (pathVar.includes('stigmergy') && !pathVar.includes('node_modules\\.bin')) {
            console.warn('[WARNING] Suspicious PATH entry detected. This may cause conflicts.');
        }
    }
    
    // Verify CLI tools are working
    async verifyCLITools() {
        console.log('[VERIFY] Verifying CLI tools...');
        
        const tools = ['node', 'npm'];
        const results = {};
        
        for (const tool of tools) {
            try {
                const { spawn } = require('child_process');
                const child = spawn(tool, ['--version'], { 
                    stdio: 'pipe',
                    timeout: 5000
                });
                
                let output = '';
                let error = '';
                
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    error += data.toString();
                });
                
                await new Promise((resolve) => {
                    child.on('close', (code) => {
                        if (code === 0) {
                            results[tool] = { 
                                success: true, 
                                version: output.trim(),
                                message: 'Working correctly'
                            };
                        } else {
                            results[tool] = { 
                                success: false, 
                                error: error.trim(),
                                message: 'Not working properly'
                            };
                        }
                        resolve();
                    });
                    
                    child.on('error', (err) => {
                        results[tool] = { 
                            success: false, 
                            error: err.message,
                            message: 'Failed to execute'
                        };
                        resolve();
                    });
                });
            } catch (error) {
                results[tool] = { 
                    success: false, 
                    error: error.message,
                    message: 'Exception occurred'
                };
            }
        }
        
        return results;
    }
    
    // Main conflict prevention process
    async preventConflicts() {
        console.log('Stigmergy Conflict Prevention System');
        console.log('='.repeat(40));
        
        try {
            // Step 1: Detect conflicts
            const conflicts = await this.detectConflicts();
            
            if (conflicts.length > 0) {
                console.log(`[ALERT] ${conflicts.length} potential conflicts detected!`);
                
                // Step 2: Fix conflicts
                const fixed = await this.fixConflicts(conflicts);
                console.log(`[RESULT] Fixed ${fixed} out of ${conflicts.length} conflicts.`);
            } else {
                console.log('[OK] No conflicts detected.');
            }
            
            // Step 3: Apply preventive measures
            await this.applyPreventiveMeasures();
            
            // Step 4: Verify CLI tools
            console.log('\n[VERIFICATION] Checking CLI tool status...');
            const verification = await this.verifyCLITools();
            
            let allGood = true;
            for (const [tool, result] of Object.entries(verification)) {
                if (result.success) {
                    console.log(`[OK] ${tool}: ${result.version}`);
                } else {
                    console.log(`[ISSUE] ${tool}: ${result.message}`);
                    allGood = false;
                }
            }
            
            console.log('\n' + '='.repeat(40));
            if (allGood) {
                console.log('[SUCCESS] All systems operational!');
                console.log('[INFO] Stigmergy should not interfere with other CLI tools.');
            } else {
                console.log('[WARNING] Some issues remain. Manual intervention may be required.');
            }
            
            console.log('\n[TIPS]');
            console.log('1. Run this script periodically to maintain system health');
            console.log('2. If CLI tools stop working, run: npm run fix-node-conflict');
            console.log('3. Report any recurring issues to the Stigmergy team');
            
        } catch (error) {
            console.error('[ERROR] Conflict prevention failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the conflict preventer
async function runConflictPrevention() {
    const preventer = new ConflictPreventer();
    await preventer.preventConflicts();
}

// Export for use in other modules
module.exports = { ConflictPreventer };

// Run if called directly
if (require.main === module) {
    runConflictPrevention().catch(error => {
        console.error('[FATAL]', error.message);
        process.exit(1);
    });
}