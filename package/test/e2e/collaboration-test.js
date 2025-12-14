// Collaboration functionality testing
const { executeCommand, recordTestResult, wait } = require('./test-utils');
const testData = require('./test-data');

async function testCollaboration() {
  console.log('Starting collaboration functionality testing...\n');
  
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
  
  console.log('\n--- Collaboration testing completed ---\n');
}

module.exports = testCollaboration;
