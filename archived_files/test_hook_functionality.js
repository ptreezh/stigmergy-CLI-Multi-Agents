#!/usr/bin/env node

/**
 * Test script to validate hook functionality
 */

const fs = require('fs');
const path = require('path');

// Import the deployed hook
const ClaudeNodeJsHook = require('C:/Users/WIN10/.stigmergy/hooks/claude/claude_nodejs_hook.js');

async function testHookFunctionality() {
  console.log('=== Testing Hook Functionality ===\n');
  
  try {
    // Create an instance of the hook
    const hook = new ClaudeNodeJsHook();
    
    console.log('✓ Hook instantiated successfully\n');
    
    // Test onUserPrompt with regular prompt
    console.log('Testing regular prompt...');
    const regularResult = await hook.onUserPrompt('Hello, Claude!', {});
    console.log('Regular prompt result:', regularResult);
    
    // Test onUserPrompt with cross-CLI request
    console.log('\nTesting cross-CLI request...');
    const crossCLIResult = await hook.onUserPrompt('Use Gemini to generate a Python function', {});
    console.log('Cross-CLI request result:', crossCLIResult);
    
    // Test onToolUse
    console.log('\nTesting tool use...');
    const toolResult = await hook.onToolUse('code_editor', { file: 'test.js', content: 'console.log("test");' }, {});
    console.log('Tool use result:', toolResult);
    
    // Test onResponseGenerated
    console.log('\nTesting response generation...');
    const responseResult = await hook.onResponseGenerated('Here is your answer', {});
    console.log('Response generation result:', responseResult);
    
    console.log('\n=== Hook functionality test completed ===');
    
  } catch (error) {
    console.error('Hook functionality test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testHookFunctionality();
}