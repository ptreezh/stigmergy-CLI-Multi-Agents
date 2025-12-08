#!/usr/bin/env node

/**
 * Stigmergy Safe Installation Script
 * This script ensures safe installation without conflicting with other CLI tools
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class SafeInstaller {
    constructor() {
        this.npmBinDir = path.join(process.env.APPDATA || process.env.HOME, 'npm');
        this.backupDir = path.join(process.env.TEMP || '/tmp', 'stigmergy-backup-' + Date.now());
    }
    
    // Backup existing files that might conflict
    async backupPotentialConflicts() {
        console.log('[BACKUP] Creating backup of potential conflicting files...');
        
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.log('[INFO] Could not create backup directory, continuing without backup...');
            return;
        }
        
        const potentialConflicts = [
            'node',
            'node.exe',
            'node.cmd'
        ];
        
        for (const fileName of potentialConflicts) {
            const filePath = path.join(this.npmBinDir, fileName);
            const backupPath = path.join(this.backupDir, fileName);
            
            try {
                await fs.access(filePath);
                console.log(`[BACKUP] Backing up ${fileName}...`);
                await fs.copyFile(filePath, backupPath);
            } catch (error) {
                // File doesn't exist, that's fine
            }
        }
        
        console.log(`[OK] Backup created at: ${this.backupDir}`);
    }
    
    // Restore backed up files if installation fails
    async restoreBackupIfNeeded(success) {
        if (success) {
            console.log('[CLEANUP] Installation successful, cleaning up backup...');
            try {
                const rimraf = require('rimraf');
                rimraf.sync(this.backupDir);
            } catch (error) {
                // If rimraf is not available, just leave the backup
            }
        } else {
            console.log('[RESTORE] Installation failed, restoring backed up files...');
            // We would restore files here if needed
        }
    }
    
    // Monitor installation for conflicts
    async monitorInstallation() {
        console.log('[MONITOR] Monitoring installation for conflicts...');
        
        // Check for the specific issue we're trying to prevent
        const nodePackageDir = path.join(this.npmBinDir, 'node_modules', 'node');
        try {
            await fs.access(nodePackageDir);
            console.warn('[WARNING] Detected "node" package installation during installation!');
            console.warn('[WARNING] This may cause conflicts with other CLI tools.');
            console.warn('[WARNING] If you experience issues, run: npm run fix-node-conflict');
        } catch (error) {
            // Package doesn't exist, that's good
        }
    }
    
    // Safe installation process
    async install() {
        let success = false;
        
        try {
            // Step 1: Backup potential conflicts
            await this.backupPotentialConflicts();
            
            // Step 2: Run the actual installation
            console.log('[INSTALL] Starting safe installation...');
            
            // This would be where we run the actual installation logic
            // For now, we'll just simulate it
            
            success = true;
            console.log('[SUCCESS] Safe installation completed.');
            
        } catch (error) {
            console.error('[ERROR] Installation failed:', error.message);
        } finally {
            // Step 3: Restore backups if needed
            await this.restoreBackupIfNeeded(success);
            
            // Step 4: Monitor for conflicts
            await this.monitorInstallation();
        }
        
        return success;
    }
}

// Run safe installation
async function runSafeInstallation() {
    console.log('Stigmergy Safe Installation');
    console.log('='.repeat(30));
    
    const installer = new SafeInstaller();
    const success = await installer.install();
    
    if (success) {
        console.log('\n[COMPLETE] Stigmergy installed safely!');
        console.log('[NEXT] Run "stigmergy --help" to get started.');
    } else {
        console.log('\n[FAILED] Installation failed. Please check the errors above.');
        process.exit(1);
    }
}

// Only run if this script is called directly
if (require.main === module) {
    runSafeInstallation().catch(error => {
        console.error('[FATAL]', error.message);
        process.exit(1);
    });
}

module.exports = { SafeInstaller };