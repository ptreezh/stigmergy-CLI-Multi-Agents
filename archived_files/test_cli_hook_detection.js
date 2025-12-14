#!/usr/bin/env node

/**
 * Test script to validate CLI hook cross-CLI detection functionality
 * This tests if the deployed hooks can correctly detect cross-CLI calls
 */

const fs = require('fs');
const path = require('path');

// Import all deployed hooks
const claudeHook = require('C:/Users/WIN10/.stigmergy/hooks/claude/claude_nodejs_hook.js');
const geminiHook = require('C:/Users/WIN10/.stigmergy/hooks/gemini/gemini_nodejs_hook.js');
const qwencodeHook = require('C:/Users/WIN10/.stigmergy/hooks/qwencode/qwencode_nodejs_hook.js');
const iflowHook = require('C:/Users/WIN10/.stigmergy/hooks/iflow/iflow_nodejs_hook.js');
const qoderHook = require('C:/Users/WIN10/.stigmergy/hooks/qoder/qoder_nodejs_hook.js');
const codebuddyHook = require('C:/Users/WIN10/.stigmergy/hooks/codebuddy/codebuddy_nodejs_hook.js');
const codexHook = require('C:/Users/WIN10/.stigmergy/hooks/codex/codex_nodejs_hook.js');
const copilotHook = require('C:/Users/WIN10/.stigmergy/hooks/copilot/copilot_nodejs_hook.js');

async function testCLICrossCLIDetection() {
  console.log('=== Testing CLI Hook Cross-CLI Detection Functionality ===\n');
  
  // Create instances of all hooks
  const hooks = {
    'claude': new claudeHook(),
    'gemini': new geminiHook(),
    'qwencode': new qwencodeHook(),
    'iflow': new iflowHook(),
    'qoder': new qoderHook(),
    'codebuddy': new codebuddyHook(),
    'codex': new codexHook(),
    'copilot': new copilotHook()
  };
  
  // Test cases for cross-CLI detection
  const testCases = [
    { cli: 'claude', prompt: 'Use Gemini to generate a Python function', expectedTarget: 'gemini' },
    { cli: 'gemini', prompt: 'Ask QwenCode to refactor this JavaScript code', expectedTarget: 'qwencode' },
    { cli: 'qwencode', prompt: 'Call iFlow to create a deployment workflow', expectedTarget: 'iflow' },
    { cli: 'iflow', prompt: 'Use Qoder to analyze this project structure', expectedTarget: 'qoder' },
    { cli: 'qoder', prompt: 'Ask CodeBuddy to explain this algorithm', expectedTarget: 'codebuddy' },
    { cli: 'codebuddy', prompt: 'Use Codex to translate this comment to Spanish', expectedTarget: 'codex' },
    { cli: 'codex', prompt: 'Call Copilot to generate unit tests', expectedTarget: 'copilot' },
    { cli: 'copilot', prompt: 'Use Claude to summarize this document', expectedTarget: 'claude' }
  ];
  
  try {
    // Test each CLI hook with various prompts
    for (const testCase of testCases) {
      console.log(`--- Testing ${testCase.cli} hook cross-CLI detection ---`);
      
      const hook = hooks[testCase.cli];
      if (!hook) {
        console.log(`âœ?Hook for ${testCase.cli} not found`);
        continue;
      }
      
      // Test cross-CLI request detection
      const result = await hook.onUserPrompt(testCase.prompt, {});
      
      if (result && result.includes('Simulated cross-CLI call')) {
        console.log(`âœ?${testCase.cli} hook correctly detected cross-CLI request`);
        console.log(`  Prompt: "${testCase.prompt}"`);
        console.log(`  Result: "${result}"`);
        
        // Check if the correct target CLI was detected
        if (result.includes(testCase.expectedTarget)) {
          console.log(`âœ?${testCase.cli} hook correctly identified target CLI: ${testCase.expectedTarget}`);
        } else {
          console.log(`âœ?${testCase.cli} hook identified wrong target CLI`);
        }
      } else {
        console.log(`âœ?${testCase.cli} hook failed to detect cross-CLI request`);
        console.log(`  Prompt: "${testCase.prompt}"`);
        console.log(`  Result: "${result}"`);
      }
      
      console.log(); // Empty line for readability
    }
    
    // Test non-cross-CLI prompts
    console.log('--- Testing non-cross-CLI prompt detection ---');
    const nonCrossCLIPrompts = [
      { cli: 'claude', prompt: 'Explain quantum computing' },
      { cli: 'gemini', prompt: 'Generate a shopping list' },
      { cli: 'qwencode', prompt: 'Refactor this code' }
    ];
    
    for (const testCase of nonCrossCLIPrompts) {
      const hook = hooks[testCase.cli];
      const result = await hook.onUserPrompt(testCase.prompt, {});
      
      if (result === null) {
        console.log(`âœ?${testCase.cli} hook correctly ignored non-cross-CLI prompt: "${testCase.prompt}"`);
      } else {
        console.log(`âœ?${testCase.cli} hook incorrectly processed non-cross-CLI prompt: "${testCase.prompt}"`);
      }
    }
    
    console.log('\n=== CLI hook cross-CLI detection test completed ===');
    
  } catch (error) {
    console.error('CLI hook cross-CLI detection test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testCLICrossCLIDetection();
}
