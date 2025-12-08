#!/usr/bin/env node

// Simple test to verify stigmergy command works
const path = require('path');
const { spawn } = require('child_process');

console.log('Testing stigmergy CLI command...');

// Test with a simple command
const child = spawn('node', [path.join(__dirname, 'src', 'main_english.js'), '--help'], {
  stdio: 'pipe',
  shell: true
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  console.log('=== STDOUT ===');
  console.log(output.substring(0, 1000)); // First 1000 chars
  if (errorOutput) {
    console.log('=== STDERR ===');
    console.log(errorOutput.substring(0, 1000)); // First 1000 chars
  }
  
  if (output.includes('Stigmergy CLI')) {
    console.log('✅ Successfully detected Stigmergy CLI help output');
  } else {
    console.log('⚠️  Could not detect Stigmergy CLI help output');
  }
});