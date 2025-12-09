// Individual CLI tool testing
const { executeCommand, recordTestResult } = require('./test-utils');
const testData = require('./test-data');

async function testIndividualTools() {
  console.log('Starting individual CLI tool testing...\n');
  
  // Test each tool with simple code generation
  for (const [tool, prompt] of Object.entries(testData.simpleCodeGeneration)) {
    console.log(`\n--- Testing ${tool} with simple code generation ---`);
    
    try {
      const result = await executeCommand(`stigmergy call "${prompt}"`, 45000);
      
      // Check if the command executed successfully
      const passed = result.success && 
                     result.stdout.length > 50 && // At least some content
                     !result.stdout.includes('Error') &&
                     !result.stdout.includes('error');
                     
      recordTestResult(`${tool} - Simple Code Generation`, passed, {
        command: result.command,
        executionTime: result.executionTime,
        outputLength: result.stdout.length,
        hasError: !result.success || result.stderr.length > 0
      });
      
      // Log result summary
      console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`  Execution time: ${result.executionTime}ms`);
      console.log(`  Output length: ${result.stdout.length} characters`);
      
    } catch (error) {
      recordTestResult(`${tool} - Simple Code Generation`, false, {
        error: error.message
      });
      console.log(`  Result: FAIL - ${error.message}`);
    }
  }
  
  // Test each tool with complex code generation
  for (const [tool, prompt] of Object.entries(testData.complexCodeGeneration)) {
    console.log(`\n--- Testing ${tool} with complex code generation ---`);
    
    try {
      const result = await executeCommand(`stigmergy call "${prompt}"`, 60000);
      
      // Check if the command executed successfully
      const passed = result.success && 
                     result.stdout.length > 100 && // More content for complex tasks
                     !result.stdout.includes('Error') &&
                     !result.stdout.includes('error');
                     
      recordTestResult(`${tool} - Complex Code Generation`, passed, {
        command: result.command,
        executionTime: result.executionTime,
        outputLength: result.stdout.length,
        hasError: !result.success || result.stderr.length > 0
      });
      
      // Log result summary
      console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`  Execution time: ${result.executionTime}ms`);
      console.log(`  Output length: ${result.stdout.length} characters`);
      
    } catch (error) {
      recordTestResult(`${tool} - Complex Code Generation`, false, {
        error: error.message
      });
      console.log(`  Result: FAIL - ${error.message}`);
    }
  }
  
  // Test each tool with analysis task
  for (const [tool, prompt] of Object.entries(testData.analysis)) {
    console.log(`\n--- Testing ${tool} with analysis task ---`);
    
    try {
      const result = await executeCommand(`stigmergy call "${prompt}"`, 45000);
      
      // Check if the command executed successfully
      const passed = result.success && 
                     result.stdout.length > 50 &&
                     !result.stdout.includes('Error') &&
                     !result.stdout.includes('error');
                     
      recordTestResult(`${tool} - Analysis Task`, passed, {
        command: result.command,
        executionTime: result.executionTime,
        outputLength: result.stdout.length,
        hasError: !result.success || result.stderr.length > 0
      });
      
      // Log result summary
      console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`  Execution time: ${result.executionTime}ms`);
      console.log(`  Output length: ${result.stdout.length} characters`);
      
    } catch (error) {
      recordTestResult(`${tool} - Analysis Task`, false, {
        error: error.message
      });
      console.log(`  Result: FAIL - ${error.message}`);
    }
  }
  
  // Test each tool with documentation task
  for (const [tool, prompt] of Object.entries(testData.documentation)) {
    console.log(`\n--- Testing ${tool} with documentation task ---`);
    
    try {
      const result = await executeCommand(`stigmergy call "${prompt}"`, 45000);
      
      // Check if the command executed successfully
      const passed = result.success && 
                     result.stdout.length > 50 &&
                     !result.stdout.includes('Error') &&
                     !result.stdout.includes('error');
                     
      recordTestResult(`${tool} - Documentation Task`, passed, {
        command: result.command,
        executionTime: result.executionTime,
        outputLength: result.stdout.length,
        hasError: !result.success || result.stderr.length > 0
      });
      
      // Log result summary
      console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
      console.log(`  Execution time: ${result.executionTime}ms`);
      console.log(`  Output length: ${result.stdout.length} characters`);
      
    } catch (error) {
      recordTestResult(`${tool} - Documentation Task`, false, {
        error: error.message
      });
      console.log(`  Result: FAIL - ${error.message}`);
    }
  }
  
  console.log('\n--- Individual tool testing completed ---\n');
}

module.exports = testIndividualTools;