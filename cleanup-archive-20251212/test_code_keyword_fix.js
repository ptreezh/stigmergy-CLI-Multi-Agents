// Test to verify the 'code' keyword issue has been fixed
const SmartRouter = require('./src/core/smart_router');

async function testCodeKeywordFix() {
  console.log('Testing fix for "code" keyword issue...\n');
  
  try {
    const router = new SmartRouter();
    await router.initialize();
    
    // Test various commands that should NOT route to codex
    const testCases = [
      { input: 'stigmergy version', expectedNotCodex: true },
      { input: 'stigmergy status', expectedNotCodex: true },
      { input: 'stigmergy install', expectedNotCodex: true },
      { input: 'stigmergy deploy', expectedNotCodex: true },
      { input: 'stigmergy setup', expectedNotCodex: true },
      { input: 'use claude to write code', expectedTool: 'claude' },
      { input: 'use qodercli to help with code', expectedTool: 'qodercli' },
      { input: 'use codex to write code', expectedTool: 'codex' },
      { input: 'generate documentation', expectedNotCodex: true },
      { input: 'explain this code', expectedNotCodex: true },
    ];
    
    let allTestsPassed = true;
    
    for (const testCase of testCases) {
      const input = testCase.input.split(' ').slice(1).join(' '); // Remove 'stigmergy' part
      
      if (input.trim()) { // Only test non-empty inputs
        const route = await router.smartRoute(input);
        console.log(`Input: "${input}" -> Tool: ${route.tool}, Prompt: "${route.prompt}"`);
        
        if (testCase.expectedTool && route.tool !== testCase.expectedTool) {
          console.log(`  ‚ù?Expected ${testCase.expectedTool}, got ${route.tool}`);
          allTestsPassed = false;
        } else if (testCase.expectedNotCodex && route.tool === 'codex') {
          console.log(`  ‚ù?Expected NOT codex, but got codex`);
          allTestsPassed = false;
        } else {
          console.log(`  ‚ú?Correct routing`);
        }
      }
    }
    
    if (allTestsPassed) {
      console.log('\nüéâ All tests passed! The "code" keyword issue has been fixed.');
    } else {
      console.log('\n‚ù?Some tests failed. The issue may still exist.');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testCodeKeywordFix();
