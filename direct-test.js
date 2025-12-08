#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function directTest() {
  console.log('Direct test of node execution with path containing spaces...');
  
  // Create a temporary JS file
  const tempDir = os.tmpdir();
  const tempJSFile = path.join(tempDir, 'test-' + Date.now() + '.js');
  const testContent = 'console.log("Direct execution test passed");';
  
  await fs.writeFile(tempJSFile, testContent);
  
  try {
    // Test direct spawn
    console.log('Testing direct spawn with node path:', process.execPath);
    console.log('Testing JS file path:', tempJSFile);
    
    const child = spawn(process.execPath, [tempJSFile], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      console.log('Child process exited with code:', code);
      // Clean up and exit
      fs.unlink(tempJSFile).catch(() => {});
      process.exit(code === 0 ? 0 : 1);
    });
    
    child.on('error', (error) => {
      console.log('Child process error:', error.message);
      // Clean up and exit
      fs.unlink(tempJSFile).catch(() => {});
      process.exit(1);
    });
    
  } catch (error) {
    console.log('Direct test error:', error.message);
    // Clean up and exit
    fs.unlink(tempJSFile).catch(() => {});
    process.exit(1);
  }
}

directTest();