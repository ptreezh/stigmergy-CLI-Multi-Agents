// Error handling testing
const { executeCommand, recordTestResult } = require('./test-utils');
const testData = require('./test-data');

async function testErrorHandling() {
  console.log('Starting error handling testing...\n');
  
  // Test invalid tool
  console.log('\n--- Testing invalid tool handling ---');
  try {
    const result = await executeCommand(`stigmergy call "${testData.errorHandling.invalidTool}"`, 30000);
    
    // Should fail gracefully
    const passed = !result.success && 
                   (result.stderr.includes('not found') || 
                    result.stderr.includes('Error') ||
                    result.stdout.includes('Error'));
                   
    recordTestResult('Error Handling - Invalid Tool', passed, {
      command: result.command,
      executionTime: result.executionTime,
      stdoutLength: result.stdout.length,
      stderrLength: result.stderr.length,
      hasErrorOutput: result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    
  } catch (error) {
    recordTestResult('Error Handling - Invalid Tool', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test malformed input
  console.log('\n--- Testing malformed input handling ---');
  try {
    const result = await executeCommand(`stigmergy call "${testData.errorHandling.malformedInput}"`, 30000);
    
    // Should handle gracefully
    const passed = result.code !== -1; // Not a crash
                    
    recordTestResult('Error Handling - Malformed Input', passed, {
      command: result.command,
      executionTime: result.executionTime,
      stdoutLength: result.stdout.length,
      stderrLength: result.stderr.length
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    
  } catch (error) {
    recordTestResult('Error Handling - Malformed Input', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test special characters
  console.log('\n--- Testing special characters handling ---');
  try {
    const result = await executeCommand(`stigmergy call "${testData.errorHandling.specialCharacters}"`, 30000);
    
    // Should handle without crashing
    const passed = result.code !== -1;
                    
    recordTestResult('Error Handling - Special Characters', passed, {
      command: result.command,
      executionTime: result.executionTime,
      stdoutLength: result.stdout.length,
      stderrLength: result.stderr.length
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    
  } catch (error) {
    recordTestResult('Error Handling - Special Characters', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Error handling testing completed ---\n');
}

module.exports = testErrorHandling;