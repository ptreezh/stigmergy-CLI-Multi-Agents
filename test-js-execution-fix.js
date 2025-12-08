#!/usr/bin/env node

/**
 * Test script to verify JS file execution fixes
 * This test ensures that JS files are properly executed rather than opened for editing
 */

const { executeCommand, executeJSFile } = require('./src/utils.js');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function runTests() {
  console.log('Testing JS File Execution Fixes');
  console.log('==============================');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Basic executeCommand function
  totalTests++;
  try {
    console.log('\nTest 1: Basic executeCommand function');
    const result = await executeCommand('node', ['-e', 'console.log("Basic execution test passed")']);
    if (result.success) {
      console.log('✓ Basic executeCommand test passed');
      passedTests++;
    } else {
      console.log('✗ Basic executeCommand test failed');
    }
  } catch (error) {
    console.log('✗ Basic executeCommand test failed with error:', error.message);
  }
  
  // Test 2: JS file execution with executeJSFile
  totalTests++;
  try {
    console.log('\nTest 2: JS file execution with executeJSFile');
    
    // Create a temporary JS file
    const tempDir = os.tmpdir();
    const tempJSFile = path.join(tempDir, 'stigmergy-test-' + Date.now() + '.js');
    const testContent = 'console.log("JS file execution test passed"); process.exit(0);';
    
    await fs.writeFile(tempJSFile, testContent);
    
    try {
      const result = await executeJSFile(tempJSFile);
      if (result.success) {
        console.log('✓ JS file execution test passed');
        passedTests++;
      } else {
        console.log('✗ JS file execution test failed with exit code:', result.code);
      }
    } finally {
      // Clean up
      try {
        await fs.unlink(tempJSFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.log('✗ JS file execution test failed with error:', error.message);
  }
  
  // Test 3: Invalid JS file handling
  totalTests++;
  try {
    console.log('\nTest 3: Invalid JS file handling');
    try {
      await executeJSFile('/non/existent/file.js');
      console.log('✗ Invalid JS file handling test failed - should have thrown error');
    } catch (error) {
      console.log('✓ Invalid JS file handling test passed - correctly threw error:', error.message);
      passedTests++;
    }
  } catch (error) {
    console.log('✗ Invalid JS file handling test failed with unexpected error:', error.message);
  }
  
  // Test 4: Non-JS file rejection
  totalTests++;
  try {
    console.log('\nTest 4: Non-JS file rejection');
    try {
      // Create a temporary text file
      const tempDir = os.tmpdir();
      const tempTxtFile = path.join(tempDir, 'stigmergy-test-' + Date.now() + '.txt');
      await fs.writeFile(tempTxtFile, 'This is not a JS file');
      
      try {
        await executeJSFile(tempTxtFile);
        console.log('✗ Non-JS file rejection test failed - should have thrown error');
      } catch (error) {
        console.log('✓ Non-JS file rejection test passed - correctly rejected file:', error.message);
        passedTests++;
      }
      
      // Clean up
      try {
        await fs.unlink(tempTxtFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (error) {
      console.log('✗ Non-JS file rejection test setup failed:', error.message);
    }
  } catch (error) {
    console.log('✗ Non-JS file rejection test failed with unexpected error:', error.message);
  }
  
  // Test 5: Directory rejection
  totalTests++;
  try {
    console.log('\nTest 5: Directory rejection');
    try {
      await executeJSFile(os.tmpdir());
      console.log('✗ Directory rejection test failed - should have thrown error');
    } catch (error) {
      console.log('✓ Directory rejection test passed - correctly rejected directory:', error.message);
      passedTests++;
    }
  } catch (error) {
    console.log('✗ Directory rejection test failed with unexpected error:', error.message);
  }
  
  console.log('\n==============================');
  console.log(`Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! JS file execution fixes are working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. JS file execution fixes need attention.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed with error:', error);
  process.exit(1);
});