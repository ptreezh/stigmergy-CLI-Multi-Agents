#!/usr/bin/env node

/**
 * Test script to examine deployed hook files
 */

const fs = require('fs');
const path = require('path');

// Test reading the hook directory
const hookDir = 'C:/Users/WIN10/.stigmergy/hooks/claude';

console.log('Checking hook directory:', hookDir);

try {
  // List files in the directory
  const files = fs.readdirSync(hookDir);
  console.log('Files in directory:', files);
  
  // Read the hook script
  const hookScriptPath = path.join(hookDir, 'claude_nodejs_hook.js');
  if (fs.existsSync(hookScriptPath)) {
    console.log('\n--- Hook Script Content ---');
    const content = fs.readFileSync(hookScriptPath, 'utf8');
    console.log(content);
    console.log('--- End of Hook Script ---');
  } else {
    console.log('Hook script not found at:', hookScriptPath);
  }
  
  // Read the config file
  const configPath = path.join(hookDir, 'config.json');
  if (fs.existsSync(configPath)) {
    console.log('\n--- Config File Content ---');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log(JSON.stringify(config, null, 2));
    console.log('--- End of Config File ---');
  } else {
    console.log('Config file not found at:', configPath);
  }
} catch (error) {
  console.error('Error examining hook directory:', error.message);
}