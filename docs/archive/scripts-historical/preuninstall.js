#!/usr/bin/env node

/**
 * Pre-uninstall script for Stigmergy CLI
 * Runs the enhanced uninstaller before npm removes the package
 */

const path = require('path');
const { spawnSync } = require('child_process');

// Detect npm environment for better output visibility
const isNpmUninstall = process.env.npm_lifecycle_event === 'preuninstall' || 
                      process.env.npm_lifecycle_event === 'uninstall';
const criticalLog = isNpmUninstall ? console.error : console.log;

criticalLog('🔄 STIGMERGY CLI PRE-UNINSTALL CLEANUP');
criticalLog('='.repeat(50));
criticalLog('Cleaning up configuration files and hooks...');
criticalLog('='.repeat(50));
console.log('🔄 Running pre-uninstall cleanup for Stigmergy CLI...');

try {
  // Import and run the enhanced uninstaller
  const EnhancedUninstaller = require('../src/core/enhanced_uninstaller');
  const uninstaller = new EnhancedUninstaller({ 
    dryRun: false,  // Actually perform the uninstallation
    verbose: true   // Show detailed output
  });

  criticalLog('🗑️ Starting enhanced uninstallation process...\n');
  console.log('🗑️ Starting enhanced uninstallation process...\n');

  // Execute the uninstallation asynchronously 
  (async () => {
    try {
      const results = await uninstaller.completeUninstall();
      
      console.log('\n✅ Enhanced uninstallation completed successfully!');
      console.log(`📁 Directories removed: ${results.directoriesRemoved}`);
      console.log(`📄 Files removed: ${results.filesRemoved}`);
      
      if (results.errors.length > 0) {
        console.log(`⚠️ Errors occurred during uninstallation: ${results.errors.length}`);
        results.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
      
      process.exit(0);
    } catch (error) {
      console.error(`❌ Error during enhanced uninstallation: ${error.message}`);
      process.exit(1);
    }
  })();

} catch (error) {
  console.error(`❌ Error importing EnhancedUninstaller: ${error.message}`);
  console.error('Attempting manual cleanup...');
  
  // Fallback manual cleanup
  try {
    const fs = require('fs');
    const os = require('os');
    const homeDir = os.homedir();
    
    // Remove main stigmergy directories
    const dirsToRemove = [
      path.join(homeDir, '.stigmergy'),
      path.join(homeDir, '.stigmergy-test')
    ];
    
    dirsToRemove.forEach(dirPath => {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`🗑️ Removed directory: ${dirPath}`);
      }
    });
    
    console.log('✅ Fallback manual cleanup completed.');
  } catch (fallbackError) {
    console.error(`❌ Fallback cleanup also failed: ${fallbackError.message}`);
  }
  
  process.exit(1);
}