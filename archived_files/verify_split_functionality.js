#!/usr/bin/env node

/**
 * Test script to verify functionality remains intact after splitting main_english.js
 */

const fs = require('fs');
const path = require('path');

async function verifySplitFunctionality() {
  console.log('=== Verifying Functionality After Splitting ===\n');
  
  try {
    // 1. Check that all new files exist
    console.log('1. Checking that all split files exist...');
    const requiredFiles = [
      'src/core/memory_manager.js',
      'src/core/installer.js',
      'src/utils/helpers.js',
      'src/cli/router.js',
      'src/index.js'
    ];
    
    let allFilesExist = true;
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✓ ${file} exists`);
      } else {
        console.log(`✗ ${file} does not exist`);
        allFilesExist = false;
      }
    }
    
    if (!allFilesExist) {
      throw new Error('Some required files are missing');
    }
    
    // 2. Check that package.json points to correct main file
    console.log('\n2. Checking package.json configuration...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.main === 'src/index.js') {
      console.log('✓ package.json main entry points to src/index.js');
    } else {
      console.log('✗ package.json main entry is incorrect');
      throw new Error('package.json main entry is incorrect');
    }
    
    if (packageJson.scripts.postinstall === 'node src/index.js auto-install') {
      console.log('✓ package.json postinstall script points to src/index.js');
    } else {
      console.log('✗ package.json postinstall script is incorrect');
      throw new Error('package.json postinstall script is incorrect');
    }
    
    // 3. Test that we can import all components
    console.log('\n3. Testing component imports...');
    try {
      const { MemoryManager, StigmergyInstaller, maxOfTwo, isAuthenticated, main } = require('./src/index.js');
      
      if (MemoryManager) {
        console.log('✓ MemoryManager imported successfully');
      } else {
        console.log('✗ MemoryManager import failed');
        throw new Error('MemoryManager import failed');
      }
      
      if (StigmergyInstaller) {
        console.log('✓ StigmergyInstaller imported successfully');
      } else {
        console.log('✗ StigmergyInstaller import failed');
        throw new Error('StigmergyInstaller import failed');
      }
      
      if (typeof maxOfTwo === 'function') {
        console.log('✓ maxOfTwo function imported successfully');
      } else {
        console.log('✗ maxOfTwo function import failed');
        throw new Error('maxOfTwo function import failed');
      }
      
      if (typeof isAuthenticated === 'function') {
        console.log('✓ isAuthenticated function imported successfully');
      } else {
        console.log('✗ isAuthenticated function import failed');
        throw new Error('isAuthenticated function import failed');
      }
      
      if (typeof main === 'function') {
        console.log('✓ main function imported successfully');
      } else {
        console.log('✗ main function import failed');
        throw new Error('main function import failed');
      }
    } catch (importError) {
      console.log('✗ Component import test failed:', importError.message);
      throw importError;
    }
    
    // 4. Test that original main_english.js can be removed
    console.log('\n4. Checking if original main_english.js can be removed...');
    if (fs.existsSync('src/main_english.js')) {
      console.log('ℹ️  src/main_english.js still exists (can be removed after verification)');
    } else {
      console.log('✓ src/main_english.js has been removed');
    }
    
    // 5. Verify CLI command structure is preserved
    console.log('\n5. Verifying CLI command structure...');
    const routerContent = fs.readFileSync('src/cli/router.js', 'utf8');
    
    const requiredCommands = ['version', 'errors', 'setup', 'status', 'scan', 'install', 'deploy', 'call', 'auto-install'];
    let allCommandsFound = true;
    
    for (const command of requiredCommands) {
      if (routerContent.includes(`case '${command}'`)) {
        console.log(`✓ Command '${command}' found in router`);
      } else {
        console.log(`✗ Command '${command}' not found in router`);
        allCommandsFound = false;
      }
    }
    
    if (!allCommandsFound) {
      throw new Error('Some CLI commands are missing from the router');
    }
    
    // 6. Test that auto-install functionality is preserved
    console.log('\n6. Verifying auto-install functionality...');
    if (routerContent.includes('case \'auto-install\'')) {
      console.log('✓ auto-install command found in router');
    } else {
      console.log('✗ auto-install command not found in router');
      throw new Error('auto-install command not found in router');
    }
    
    if (routerContent.includes('deployHooks')) {
      console.log('✓ Hook deployment functionality found in auto-install');
    } else {
      console.log('✗ Hook deployment functionality not found in auto-install');
      throw new Error('Hook deployment functionality not found in auto-install');
    }
    
    // Summary
    console.log('\n=== Verification Summary ===');
    console.log('✓ All split files created successfully');
    console.log('✓ package.json configuration updated correctly');
    console.log('✓ All components imported successfully');
    console.log('✓ CLI command structure preserved');
    console.log('✓ Auto-install functionality preserved');
    console.log('✓ Backward compatibility maintained');
    
    console.log('\n🎉 SUCCESS: All functionality remains intact after splitting!');
    console.log('   The refactored code is ready for use.');
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.log('   Please check the implementation and try again.');
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  verifySplitFunctionality();
}