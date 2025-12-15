// Qoder CLI Integration Tests
const { executeCommand, recordTestResult } = require('./test-utils');

async function testQoderCLIIntegration() {
  console.log('Starting Qoder CLI integration testing...\n');
  
  // Test 1: Function implementation
  console.log('--- Test 1: Function implementation ---');
  try {
    const result = await executeCommand('node src/index.js call "qodercli write a simple function to find maximum of two numbers"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('function') || result.stdout.includes('max')) && 
                   (result.stdout.includes('return') || result.stdout.includes('=>')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Qoder CLI - Function Implementation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Qoder CLI - Function Implementation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 2: Code refactoring
  console.log('\n--- Test 2: Code refactoring ---');
  try {
    const result = await executeCommand('node src/index.js call "qodercli refactor this JavaScript function to be more readable: function calc(a,b,c){if(c==\"add\")return a+b;if(c==\"sub\")return a-b;if(c==\"mul\")return a*b;}', 60000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('function') || result.stdout.includes('calc')) &&
                   (result.stdout.includes('if') || result.stdout.includes('switch')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Qoder CLI - Code Refactoring', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Qoder CLI - Code Refactoring', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 3: Test generation
  console.log('\n--- Test 3: Test generation ---');
  try {
    const result = await executeCommand('node src/index.js call "qodercli generate unit tests for this function: function multiply(a, b) { return a * b; }"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('test') || result.stdout.includes('assert') || result.stdout.includes('expect')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Qoder CLI - Test Generation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Qoder CLI - Test Generation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 4: Project structure analysis
  console.log('\n--- Test 4: Project structure analysis ---');
  try {
    const result = await executeCommand('node src/index.js call "qodercli analyze the project structure in this directory and suggest improvements"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('structure') || result.stdout.includes('project') || result.stdout.includes('directory')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Qoder CLI - Project Structure Analysis', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Qoder CLI - Project Structure Analysis', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Qoder CLI integration testing completed ---\n');
}

module.exports = testQoderCLIIntegration;
