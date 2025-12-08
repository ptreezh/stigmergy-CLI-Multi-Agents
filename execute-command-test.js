#!/usr/bin/env node

const { executeCommand } = require('./src/utils.js');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function testExecuteCommandWithJS() {
  console.log('Testing executeCommand with JS file...');
  
  // Create a temporary JS file
  const tempDir = os.tmpdir();
  const tempJSFile = path.join(tempDir, 'test-' + Date.now() + '.js');
  const testContent = 'console.log("executeCommand JS test passed");';
  
  await fs.writeFile(tempJSFile, testContent);
  
  try {
    console.log('Node executable path:', process.execPath);
    console.log('JS file path:', tempJSFile);
    
    // Test executeCommand directly with node and JS file
    const result = await executeCommand(process.execPath, [tempJSFile]);
    console.log('executeCommand result:', result);
    
    // Clean up
    await fs.unlink(tempJSFile);
    return result.success;
    
  } catch (error) {
    console.log('executeCommand test error:', error.message);
    // Clean up
    try {
      await fs.unlink(tempJSFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function testJSFileDetection() {
  console.log('Testing JS file detection in executeCommand...');
  
  // Create a temporary JS file
  const tempDir = os.tmpdir();
  const tempJSFile = path.join(tempDir, 'test-' + Date.now() + '.js');
  const testContent = 'console.log("JS file detection test passed");';
  
  await fs.writeFile(tempJSFile, testContent);
  
  try {
    console.log('Testing with JS file path:', tempJSFile);
    
    // Test executeCommand with JS file path (should trigger JS handling)
    const result = await executeCommand(tempJSFile);
    console.log('JS file detection result:', result);
    
    // Clean up
    await fs.unlink(tempJSFile);
    return result.success;
    
  } catch (error) {
    console.log('JS file detection test error:', error.message);
    // Clean up
    try {
      await fs.unlink(tempJSFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    return false;
  }
}

async function runTests() {
  console.log('Running executeCommand JS Tests');
  console.log('============================');
  
  let passed = 0;
  let total = 2;
  
  if (await testExecuteCommandWithJS()) passed++;
  if (await testJSFileDetection()) passed++;
  
  console.log('\n============================');
  console.log(`Results: ${passed}/${total} tests passed`);
  
  process.exit(passed === total ? 0 : 1);
}

runTests();