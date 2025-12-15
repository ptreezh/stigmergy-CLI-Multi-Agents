// Main end-to-end test runner
const { getTestSummary, saveTestReport, logFilePath } = require('./test-utils');
const testIndividualTools = require('./individual-tool-test');
const testCollaboration = require('./collaboration-test');
const testErrorHandling = require('./error-handling-test');
const runComprehensiveTest = require('./comprehensive-test');
const testClaudeCLIIntegration = require('./claude-cli-test');
const testQoderCLIIntegration = require('./qoder-cli-test');
const testOtherCLIIntegration = require('./other-cli-test');

async function runEndToEndTests() {
  console.log('Stigmergy CLI End-to-End Testing');
  console.log('================================\n');
  
  // Check if we should run comprehensive tests
  const runComprehensive = process.argv.includes('--comprehensive');
  const runClaudeTests = process.argv.includes('--claude');
  const runQoderTests = process.argv.includes('--qoder');
  const runOtherCLITests = process.argv.includes('--other');
  
  try {
    if (runComprehensive) {
      // Run comprehensive test suite
      await runComprehensiveTest();
    } else if (runClaudeTests) {
      // Run Claude CLI integration tests
      await testClaudeCLIIntegration();
    } else if (runQoderTests) {
      // Run Qoder CLI integration tests
      await testQoderCLIIntegration();
    } else if (runOtherCLITests) {
      // Run other CLI tools integration tests
      await testOtherCLIIntegration();
    } else {
      // Run individual tool tests
      await testIndividualTools();
      
      // Run collaboration tests
      await testCollaboration();
      
      // Run error handling tests
      await testErrorHandling();
    }
    
    // Generate final report
    const summary = getTestSummary();
    const { reportPath, summaryPath } = saveTestReport();
    
    console.log('\n' + '='.repeat(50));
    console.log('FINAL TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}%`);
    console.log(`Detailed Report: ${reportPath}`);
    console.log(`Summary Report: ${summaryPath}`);
    console.log(`Full Log: ${logFilePath}`);
    console.log('='.repeat(50));
    
    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runEndToEndTests();
}
