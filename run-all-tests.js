/**
 * Test Suite Runner for Coordination Layer
 * Runs all unit and integration tests
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('=== Coordination Layer Test Suite ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Test configuration
const testConfig = {
  unitTests: [
    'natural_language_parser.test.js',
    'intent_router.test.js',
    'collaboration_coordinator.test.js',
    'cross_cli_executor.test.js',
    'cli_adapter_registry.test.js',
    'error_handler.test.js',
    'logger.test.js',
    'python_detector.test.js',
    'graceful_degradation.test.js',
    'python_coordination_wrapper.test.js'
  ],
  integrationTests: [
    'coordination_integration.test.js'
  ],
  performanceTests: [
    'coordination_performance.test.js'
  ]
};

// Run unit tests
console.log('Running Unit Tests...\n');
for (const testFile of testConfig.unitTests) {
  const testPath = path.join(__dirname, 'tests', 'unit', testFile);
  
  try {
    console.log(`Testing: ${testFile}`);
    execSync(`npx jest ${testPath} --verbose --no-coverage`, {
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✓ PASSED\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAILED\n');
    failedTests++;
  }
  
  totalTests++;
}

// Run integration tests
console.log('\nRunning Integration Tests...\n');
for (const testFile of testConfig.integrationTests) {
  const testPath = path.join(__dirname, 'tests', 'integration', testFile);
  
  try {
    console.log(`Testing: ${testFile}`);
    execSync(`npx jest ${testPath} --verbose --no-coverage`, {
      stdio: 'inherit',
      timeout: 60000
    });
    console.log('✓ PASSED\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAILED\n');
    failedTests++;
  }
  
  totalTests++;
}

// Run performance tests
console.log('\nRunning Performance Tests...\n');
for (const testFile of testConfig.performanceTests) {
  const testPath = path.join(__dirname, 'tests', 'performance', testFile);
  
  try {
    console.log(`Testing: ${testFile}`);
    execSync(`npx jest ${testPath} --verbose --no-coverage`, {
      stdio: 'inherit',
      timeout: 60000
    });
    console.log('✓ PASSED\n');
    passedTests++;
  } catch (error) {
    console.log('✗ FAILED\n');
    failedTests++;
  }
  
  totalTests++;
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);

if (failedTests === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${failedTests} test(s) failed`);
  process.exit(1);
}