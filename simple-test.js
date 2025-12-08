#!/usr/bin/env node

const { executeCommand, executeJSFile } = require('./src/utils.js');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testBasicExecution() {
  console.log('Testing basic command execution...');
  try {
    const result = await executeCommand('echo', ['"Hello World"']);
    console.log('Basic execution result:', result.success ? 'PASS' : 'FAIL');
    return result.success;
  } catch (error) {
    console.log('Basic execution failed:', error.message);
    return false;
  }
}

async function testJSFileExecution() {
  console.log('Testing JS file execution...');
  try {
    // Create a temporary JS file
    const tempDir = os.tmpdir();
    const tempJSFile = path.join(tempDir, 'test-' + Date.now() + '.js');
    const testContent = 'console.log("JS execution test");';
    
    await fs.writeFile(tempJSFile, testContent);
    
    try {
      const result = await executeJSFile(tempJSFile);
      console.log('JS file execution result:', result.success ? 'PASS' : 'FAIL');
      return result.success;
    } finally {
      // Clean up
      try {
        await fs.unlink(tempJSFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.log('JS file execution failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('Running JS Execution Fix Tests');
  console.log('============================');
  
  let passed = 0;
  let total = 2;
  
  if (await testBasicExecution()) passed++;
  if (await testJSFileExecution()) passed++;
  
  console.log('\n============================');
  console.log(`Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed.');
    process.exit(1);
  }
}

runAllTests();