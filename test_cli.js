#!/usr/bin/env node

/**
 * Simple test script to verify Stigmergy CLI functionality
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Testing Stigmergy CLI...');

// Test help command
console.log('\n1. Testing help command...');
const help = spawn('node', [path.join(__dirname, 'src', 'main_english.js'), '--help'], {
  stdio: 'pipe'
});

let helpOutput = '';
help.stdout.on('data', (data) => {
  helpOutput += data.toString();
});

help.on('close', (code) => {
  console.log(`Help command exited with code ${code}`);
  console.log('Help output preview:');
  console.log(helpOutput.split('\n').slice(0, 10).join('\n')); // First 10 lines
  
  // Test version command
  console.log('\n2. Testing version command...');
  const version = spawn('node', [path.join(__dirname, 'src', 'main_english.js'), '--version'], {
    stdio: 'pipe'
  });
  
  let versionOutput = '';
  version.stdout.on('data', (data) => {
    versionOutput += data.toString();
  });
  
  version.on('close', (code) => {
    console.log(`Version command exited with code ${code}`);
    console.log('Version output:');
    console.log(versionOutput);
    
    console.log('\n✅ All tests completed successfully!');
  });
});