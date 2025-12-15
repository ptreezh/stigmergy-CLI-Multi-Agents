// Final comprehensive test to verify all fixes
const SmartRouter = require('./src/core/smart_router');

async function comprehensiveTest() {
  console.log('Running comprehensive test for SmartRouter fixes...\n');
  
  try {
    const router = new SmartRouter();
    await router.initialize();
    
    // Test cases to verify the fix - commands that should NOT route to codex
    const testCases = [
      { 
        input: 'version', 
        shouldNotBeCodex: true, 
        description: 'Basic stigmergy command should not trigger codex' 
      },
      { 
        input: 'status', 
        shouldNotBeCodex: true, 
        description: 'Status command should not trigger codex' 
      },
      { 
        input: 'install', 
        shouldNotBeCodex: true, 
        description: 'Install command should not trigger codex' 
      },
      { 
        input: 'deploy', 
        shouldNotBeCodex: true, 
        description: 'Deploy command should not trigger codex' 
      },
      { 
        input: 'setup', 
        shouldNotBeCodex: true, 
        description: 'Setup command should not trigger codex' 
      },
      { 
        input: 'clean', 
        shouldNotBeCodex: true, 
        description: 'Clean command should not trigger codex' 
      },
      { 
        input: 'diagnostic', 
        shouldNotBeCodex: true, 
        description: 'Diagnostic command should not trigger codex' 
      },
      // Test proper tool routing
      { 
        input: 'use claude to explain this code', 
        expectedTool: 'claude',
        description: 'Should route to claude when specified' 
      },
      { 
        input: 'use qodercli to help with code', 
        expectedTool: 'qodercli',
        description: 'Should route to qodercli for code-related tasks' 
      },
      { 
        input: 'use codex to write code', 
        expectedTool: 'codex',
        description: 'Should route to codex when explicitly requested' 
      },
      { 
        input: 'codex to write code', 
        expectedTool: 'codex',
        description: 'Direct codex reference should route to codex' 
      },
      { 
        input: 'explain this code', 
        shouldNotBeCodex: true,
        description: 'Generic code explanation should not default to codex' 
      },
      { 
        input: 'generate documentation for this code', 
        shouldNotBeCodex: true,
        description: 'Documentation generation should not route to codex' 
      },
    ];
    
    let passedTests = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
      const route = await router.smartRoute(testCase.input);
      let testPassed = false;
      let resultMsg = '';
      
      if (testCase.expectedTool) {
        if (route.tool === testCase.expectedTool) {
          testPassed = true;
          resultMsg = `‚ú?PASS - Expected ${testCase.expectedTool}, got ${route.tool}`;
        } else {
          resultMsg = `‚ù?FAIL - Expected ${testCase.expectedTool}, got ${route.tool}`;
        }
      } else if (testCase.shouldNotBeCodex) {
        if (route.tool !== 'codex') {
          testPassed = true;
          resultMsg = `‚ú?PASS - Correctly avoided codex, got ${route.tool}`;
        } else {
          resultMsg = `‚ù?FAIL - Incorrectly routed to codex`;
        }
      }
      
      console.log(`${testCase.description}:`);
      console.log(`  Input: "${testCase.input}"`);
      console.log(`  Result: ${route.tool} with prompt "${route.prompt}"`);
      console.log(`  ${resultMsg}`);
      
      if (testPassed) {
        passedTests++;
      }
      
      console.log('');
    }
    
    console.log(`\nüìä Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('üéâ All tests passed! The SmartRouter fixes are working correctly.');
      console.log('\nSummary of fixes:');
      console.log('‚Ä?Removed "code" from general routeKeywords to prevent false matches');
      console.log('‚Ä?Prioritized exact tool name matches over keyword matches');
      console.log('‚Ä?Fixed the issue where "code" in any command would trigger codex');
      console.log('‚Ä?Maintained proper routing for actual tool requests');
    } else {
      console.log('‚ù?Some tests failed. There may be remaining issues.');
    }
    
  } catch (error) {
    console.error('Comprehensive test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the comprehensive test
comprehensiveTest();
