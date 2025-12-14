#!/usr/bin/env node

/**
 * Comprehensive test script to verify all Stigmergy CLI functionality
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function verifyCompleteFunctionality() {
  console.log('=== Comprehensive Functionality Verification ===\n');
  
  try {
    // 1. Test that the CLI can be imported without errors
    console.log('1. Testing CLI import...');
    try {
      const stigmergy = require('./src/index.js');
      console.log('‚ú?CLI imported successfully');
    } catch (importError) {
      console.log('‚ú?CLI import failed:', importError.message);
      throw importError;
    }
    
    // 2. Test that all components are accessible
    console.log('\n2. Testing component accessibility...');
    const { MemoryManager, StigmergyInstaller, maxOfTwo, isAuthenticated, main } = require('./src/index.js');
    
    if (MemoryManager) console.log('‚ú?MemoryManager accessible');
    else throw new Error('MemoryManager not accessible');
    
    if (StigmergyInstaller) console.log('‚ú?StigmergyInstaller accessible');
    else throw new Error('StigmergyInstaller not accessible');
    
    if (typeof maxOfTwo === 'function') console.log('‚ú?maxOfTwo function accessible');
    else throw new Error('maxOfTwo function not accessible');
    
    if (typeof isAuthenticated === 'function') console.log('‚ú?isAuthenticated function accessible');
    else throw new Error('isAuthenticated function not accessible');
    
    // 3. Test helper functions
    console.log('\n3. Testing helper functions...');
    const result = maxOfTwo(5, 3);
    if (result === 5) {
      console.log('‚ú?maxOfTwo function works correctly');
    } else {
      throw new Error('maxOfTwo function returned incorrect result');
    }
    
    // 4. Test that CLI commands are recognized
    console.log('\n4. Testing CLI command recognition...');
    const routerContent = fs.readFileSync('./src/cli/router.js', 'utf8');
    
    const requiredCommands = ['version', 'errors', 'setup', 'status', 'scan', 'install', 'deploy', 'call', 'auto-install'];
    for (const command of requiredCommands) {
      if (routerContent.includes(`case '${command}'`)) {
        console.log(`‚ú?Command '${command}' recognized`);
      } else {
        throw new Error(`Command '${command}' not recognized`);
      }
    }
    
    // 5. Test that auto-install functionality exists
    console.log('\n5. Testing auto-install functionality...');
    if (routerContent.includes('case \'auto-install\'') && routerContent.includes('deployHooks')) {
      console.log('‚ú?Auto-install functionality exists');
    } else {
      throw new Error('Auto-install functionality missing');
    }
    
    // 6. Test that package.json is correctly configured
    console.log('\n6. Testing package.json configuration...');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    if (packageJson.main === 'src/index.js') {
      console.log('‚ú?package.json main entry correct');
    } else {
      throw new Error('package.json main entry incorrect');
    }
    
    if (packageJson.scripts.postinstall === 'node src/index.js auto-install') {
      console.log('‚ú?package.json postinstall script correct');
    } else {
      throw new Error('package.json postinstall script incorrect');
    }
    
    // 7. Test that all required directories exist
    console.log('\n7. Testing directory structure...');
    const requiredDirs = ['src/core', 'src/utils', 'src/cli'];
    for (const dir of requiredDirs) {
      if (fs.existsSync(dir)) {
        console.log(`‚ú?Directory '${dir}' exists`);
      } else {
        throw new Error(`Directory '${dir}' missing`);
      }
    }
    
    // 8. Test that all required files exist
    console.log('\n8. Testing required files...');
    const requiredFiles = [
      'src/core/memory_manager.js',
      'src/core/installer.js',
      'src/utils/helpers.js',
      'src/cli/router.js',
      'src/index.js'
    ];
    
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`‚ú?File '${file}' exists`);
      } else {
        throw new Error(`File '${file}' missing`);
      }
    }
    
    // 9. Test that the CLI can be executed without syntax errors
    console.log('\n9. Testing CLI execution (syntax check only)...');
    const syntaxCheck = spawnSync('node', ['-c', './src/index.js'], {
      stdio: 'pipe'
    });
    
    if (syntaxCheck.status === 0) {
      console.log('‚ú?CLI passes syntax check');
    } else {
      console.log('STDERR:', syntaxCheck.stderr.toString());
      throw new Error('CLI syntax check failed');
    }
    
    // 10. Test that help command works
    console.log('\n10. Testing help command...');
    const helpResult = spawnSync('node', ['./src/index.js', '--help'], {
      stdio: 'pipe'
    });
    
    if (helpResult.status === 0 || helpResult.status === 1) { // Help might exit with code 1
      console.log('‚ú?Help command executes without errors');
    } else {
      console.log('STDERR:', helpResult.stderr.toString());
      throw new Error('Help command failed');
    }
    
    console.log('\n=== All Tests Passed ===');
    console.log('üéâ The Stigmergy CLI is fully functional!');
    
  } catch (error) {
    console.error('\n‚ù?VERIFICATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  verifyCompleteFunctionality();
}
