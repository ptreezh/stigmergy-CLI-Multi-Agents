// Claude CLI Integration Tests
const { executeCommand, recordTestResult } = require('./test-utils');

async function testClaudeCLIIntegration() {
  console.log('Starting Claude CLI integration testing...\n');
  
  // Test 1: Simple code generation
  console.log('--- Test 1: Simple code generation ---');
  try {
    const result = await executeCommand('node src/main_english.js call "claude write a simple Python function to add two numbers"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   result.stdout.includes('def') && 
                   result.stdout.includes('return') &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Claude CLI - Simple Code Generation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Claude CLI - Simple Code Generation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 2: Complex algorithm implementation
  console.log('\n--- Test 2: Complex algorithm implementation ---');
  try {
    const result = await executeCommand('node src/main_english.js call "claude implement a binary search algorithm in Python with proper error handling"', 60000);
    
    const passed = result.success && 
                   result.stdout.length > 200 && 
                   (result.stdout.includes('def') || result.stdout.includes('class')) &&
                   result.stdout.includes('binary') &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Claude CLI - Complex Algorithm Implementation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Claude CLI - Complex Algorithm Implementation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 3: Code analysis and review
  console.log('\n--- Test 3: Code analysis and review ---');
  try {
    const result = await executeCommand('node src/main_english.js call "claude analyze this Python code for potential security vulnerabilities: def login(user, password): if user == \"admin\" and password == \"123456\": return True"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('security') || result.stdout.includes('vulnerab')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Claude CLI - Code Analysis and Review', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Claude CLI - Code Analysis and Review', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 4: Documentation generation
  console.log('\n--- Test 4: Documentation generation ---');
  try {
    const result = await executeCommand('node src/main_english.js call "claude generate documentation for a Python function that sorts arrays"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('def') || result.stdout.includes('function') || result.stdout.includes('doc')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Claude CLI - Documentation Generation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Claude CLI - Documentation Generation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Claude CLI integration testing completed ---\n');
}

module.exports = testClaudeCLIIntegration;