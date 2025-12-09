#!/usr/bin/env node

// Test the cross-CLI detection functionality
const fs = require('fs');
const path = require('path');

// Load the generated hook
const hookPath = path.join(process.env.HOME || process.env.USERPROFILE, '.stigmergy', 'hooks', 'claude', 'claude_nodejs_hook.js');

if (fs.existsSync(hookPath)) {
  const ClaudeHook = require(hookPath);
  const hook = new ClaudeHook();
  
  console.log('Testing cross-CLI detection...');
  
  // Test cases
  const testCases = [
    'use gemini to generate a python function',
    'call qwencode to refactor this code',
    'ask codex for help with javascript',
    'please help me with this task', // Should not match
    'use copilot to write a test'    // Should match
  ];
  
  testCases.forEach(testCase => {
    const result = hook.detectCrossCLIRequest(testCase);
    console.log(`Input: "${testCase}"`);
    console.log(`Result:`, result ? JSON.stringify(result, null, 2) : 'No match');
    console.log('---');
  });
} else {
  console.log('Hook file not found at:', hookPath);
}