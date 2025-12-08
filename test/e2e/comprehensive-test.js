// Comprehensive End-to-End Test Suite
const { executeCommand, recordTestResult, getTestSummary, saveTestReport, logFilePath, wait } = require('./test-utils');
const testData = require('./test-data');

async function runComprehensiveTest() {
  console.log('Stigmergy CLI Comprehensive End-to-End Testing');
  console.log('=============================================\n');
  
  try {
    // Test 1: Individual tool functionality
    await testIndividualToolFunctionality();
    
    // Test 2: Collaboration scenarios
    await testCollaborationScenarios();
    
    // Test 3: Error handling
    await testErrorHandling();
    
    // Test 4: Advanced features
    await testAdvancedFeatures();
    
    // Generate final report
    const summary = getTestSummary();
    const { reportPath, summaryPath } = saveTestReport();
    
    console.log('\n' + '='.repeat(50));
    console.log('COMPREHENSIVE TEST RESULTS');
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

async function testIndividualToolFunctionality() {
  console.log('Starting individual tool functionality testing...\n');
  
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
  
  console.log('\n--- Individual tool functionality testing completed ---\n');
}

async function testCollaborationScenarios() {
  console.log('Starting collaboration scenarios testing...\n');
  
  // Test each collaboration scenario
  for (const scenario of testData.collaborationScenarios) {
    console.log(`\n--- Testing ${scenario.name} ---`);
    
    let allStepsPassed = true;
    const stepResults = [];
    
    // Execute each step in the scenario
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      console.log(`  Step ${i + 1}: ${step}`);
      
      try {
        const result = await executeCommand(`stigmergy call "${step}"`, 60000);
        
        // Check if the command executed successfully
        const stepPassed = result.success && 
                           result.stdout.length > 30 &&
                           !result.stdout.includes('Error') &&
                           !result.stdout.includes('error');
                           
        stepResults.push({
          step: i + 1,
          command: step,
          passed: stepPassed,
          executionTime: result.executionTime,
          outputLength: result.stdout.length
        });
        
        if (!stepPassed) {
          allStepsPassed = false;
        }
        
        // Log result summary
        console.log(`    Result: ${stepPassed ? 'PASS' : 'FAIL'}`);
        console.log(`    Execution time: ${result.executionTime}ms`);
        console.log(`    Output length: ${result.stdout.length} characters`);
        
        // Wait a bit between steps to avoid overwhelming the system
        await wait(2000);
        
      } catch (error) {
        stepResults.push({
          step: i + 1,
          command: step,
          passed: false,
          error: error.message
        });
        
        allStepsPassed = false;
        console.log(`    Result: FAIL - ${error.message}`);
      }
    }
    
    // Record overall scenario result
    recordTestResult(`Collaboration - ${scenario.name}`, allStepsPassed, {
      steps: stepResults,
      totalSteps: scenario.steps.length,
      passedSteps: stepResults.filter(s => s.passed).length
    });
    
    console.log(`  Overall: ${allStepsPassed ? 'PASS' : 'FAIL'}`);
  }
  
  console.log('\n--- Collaboration scenarios testing completed ---\n');
}

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
  
  // Test extremely long input
  console.log('\n--- Testing extremely long input handling ---');
  try {
    const result = await executeCommand(`stigmergy call "${testData.errorHandling.extremelyLongInput}"`, 30000);
    
    // Should handle without crashing
    const passed = result.code !== -1;
                    
    recordTestResult('Error Handling - Extremely Long Input', passed, {
      command: result.command,
      executionTime: result.executionTime,
      stdoutLength: result.stdout.length,
      stderrLength: result.stderr.length
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    
  } catch (error) {
    recordTestResult('Error Handling - Extremely Long Input', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Error handling testing completed ---\n');
}

async function testAdvancedFeatures() {
  console.log('Starting advanced features testing...\n');
  
  // Test memory management
  console.log('\n--- Testing memory management ---');
  try {
    // First call to generate some memory
    await executeCommand(`stigmergy call "claude write a simple function to add two numbers"`, 30000);
    
    // Check if memory files were created
    const result = await executeCommand('node -e "const fs = require(\'fs\'); const path = require(\'path\'); const memPath = path.join(process.cwd(), \'STIGMERGY.md\'); console.log(fs.existsSync(memPath) ? \'Memory file exists\' : \'Memory file missing\')"', 10000);
    
    const passed = result.success && result.stdout.includes('Memory file exists');
    
    recordTestResult('Advanced Features - Memory Management', passed, {
      command: result.command,
      executionTime: result.executionTime,
      hasMemoryFile: result.stdout.includes('Memory file exists')
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    
  } catch (error) {
    recordTestResult('Advanced Features - Memory Management', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  // Test smart routing
  console.log('\n--- Testing smart routing ---');
  try {
    const result = await executeCommand(`stigmergy call "write a Python function to authenticate users"`, 30000);
    
    // Should successfully route to an appropriate tool
    const passed = result.success && 
                   result.stdout.length > 50 &&
                   !result.stdout.includes('Error') &&
                   !result.stdout.includes('error');
                   
    recordTestResult('Advanced Features - Smart Routing', passed, {
      command: result.command,
      executionTime: result.executionTime,
      outputLength: result.stdout.length
    });
    
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution time: ${result.executionTime}ms`);
    console.log(`  Output length: ${result.stdout.length} characters`);
    
  } catch (error) {
    recordTestResult('Advanced Features - Smart Routing', false, {
      error: error.message
    });
    console.log(`  Result: FAIL - ${error.message}`);
  }
  
  console.log('\n--- Advanced features testing completed ---\n');
}

// Run the tests
if (require.main === module) {
  runComprehensiveTest();
}

module.exports = runComprehensiveTest;