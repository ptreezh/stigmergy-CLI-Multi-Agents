// Other CLI Tools Integration Tests
const { executeCommand, recordTestResult } = require('./test-utils');

async function testOtherCLIIntegration() {
  console.log('Starting other CLI tools integration testing...\n');
  
  // Test 1: Qwen CLI - Java code generation
  console.log('--- Test 1: Qwen CLI - Java code generation ---');
  try {
    const result = await executeCommand('node src/index.js call "qwen generate a simple Java method to calculate area of rectangle"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 100 && 
                   (result.stdout.includes('public') || result.stdout.includes('private')) && 
                   (result.stdout.includes('double') || result.stdout.includes('int') || result.stdout.includes('float')) &&
                   result.stdout.includes('area') &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Qwen CLI - Java Code Generation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Qwen CLI - Java Code Generation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 2: Gemini CLI - JavaScript function
  console.log('\n--- Test 2: Gemini CLI - JavaScript function ---');
  try {
    const result = await executeCommand('node src/index.js call "gemini create a basic JavaScript function for string reversal"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 50 && 
                   (result.stdout.includes('function') || result.stdout.includes('=>')) && 
                   result.stdout.includes('reverse') &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Gemini CLI - JavaScript Function', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Gemini CLI - JavaScript Function', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 3: iFlow CLI - Algorithm implementation
  console.log('\n--- Test 3: iFlow CLI - Algorithm implementation ---');
  try {
    const result = await executeCommand('node src/index.js call "iflow write a basic function to check if a number is even"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 50 && 
                   (result.stdout.includes('function') || result.stdout.includes('=>')) && 
                   (result.stdout.includes('%') || result.stdout.includes('mod')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('iFlow CLI - Algorithm Implementation', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('iFlow CLI - Algorithm Implementation', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test 4: CodeBuddy CLI - Code analysis
  console.log('\n--- Test 4: CodeBuddy CLI - Code analysis ---');
  try {
    const result = await executeCommand('node src/index.js call "codebuddy analyze this code for potential memory leaks: let arr = []; for(let i=0; i<1000000; i++) { arr.push(new Object()); }"', 45000);
    
    const passed = result.success && 
                   result.stdout.length > 50 && 
                   (result.stdout.includes('memory') || result.stdout.includes('leak')) &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('CodeBuddy CLI - Code Analysis', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length,
      hasError: !result.success || result.stderr.length > 0
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('CodeBuddy CLI - Code Analysis', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Other CLI tools integration testing completed ---\n');
}

module.exports = testOtherCLIIntegration;
