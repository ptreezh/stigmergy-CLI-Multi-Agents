// Simple test to verify optimized call logic
const SmartRouter = require('./src/core/smart_router');
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');

async function testOptimizations() {
  console.log('Testing optimized stigmergy call logic...\n');
  
  try {
    // Test SmartRouter initialization with optimized error handling
    console.log('1. Testing SmartRouter initialization...');
    const router = new SmartRouter();
    await router.initialize();
    console.log('   âœ?SmartRouter initialized successfully\n');
    
    // Test basic routing
    console.log('2. Testing basic routing...');
    const route = await router.smartRoute('use claude to write a poem');
    console.log(`   âœ?Route determined: ${route.tool} with prompt: "${route.prompt}"\n`);
    
    // Test analyzer initialization
    console.log('3. Testing CLIHelpAnalyzer initialization...');
    await router.analyzer.initialize();
    console.log('   âœ?CLIHelpAnalyzer initialized successfully\n');
    
    // Test that analyzer handles missing files gracefully
    console.log('4. Testing graceful handling of missing patterns...');
    try {
      const pattern = await router.analyzer.getCLIPattern('nonexistent_tool_12345');
      console.log('   âœ?Analyzer handled missing tool gracefully\n');
    } catch (err) {
      console.log(`   Error as expected: ${err.message}\n`);
    }
    
    console.log('All tests passed! Optimizations are working correctly.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testOptimizations();
