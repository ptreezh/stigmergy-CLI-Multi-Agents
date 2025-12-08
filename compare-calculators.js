/**
 * Comparison test between the original Calculator class and our JavaScript calculator implementation
 */

const Calculator = require('./src/calculator');
const jsCalculator = require('./javascript-calculator');

// Create instances
const classCalculator = new Calculator();

// Test cases for all operations
const testCases = [
  // Basic operations
  { op: 'add', args: [2, 3] },
  { op: 'subtract', args: [10, 4] },
  { op: 'multiply', args: [3, 7] },
  { op: 'divide', args: [15, 3] },
  { op: 'power', args: [2, 3] },
  { op: 'sqrt', args: [16] },
  { op: 'factorial', args: [5] },
  { op: 'percentage', args: [25, 100] },
  { op: 'max', args: [10, 20] },
  { op: 'min', args: [10, 20] },
  
  // Fibonacci
  { op: 'fibonacci', args: [10] },
  
  // Circle circumference
  { op: 'circleCircumference', args: [5] },
];

console.log('Comparing Calculator class vs JavaScript calculator implementation:\n');

let allTestsPassed = true;

testCases.forEach(test => {
  try {
    const classResult = classCalculator[test.op](...test.args);
    const jsResult = jsCalculator[test.op](...test.args);
    
    const passed = classResult === jsResult || 
                  (isNaN(classResult) && isNaN(jsResult)) ||
                  (Math.abs(classResult - jsResult) < 1e-10); // For floating point comparisons
    
    console.log(`${test.op}(${test.args.join(', ')})`);
    console.log(`  Class result: ${classResult}`);
    console.log(`  JS result:    ${jsResult}`);
    console.log(`  Status:       ${passed ? 'PASS' : 'FAIL'}\n`);
    
    if (!passed) {
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`${test.op}(${test.args.join(', ')}) threw error: ${error.message}\n`);
  }
});

// Test Fibonacci sequence
try {
  const classSeq = classCalculator.fibonacciSequence(10);
  const jsSeq = jsCalculator.fibonacciSequence(10);
  
  const sequencesMatch = JSON.stringify(classSeq) === JSON.stringify(jsSeq);
  
  console.log('fibonacciSequence(10)');
  console.log(`  Class result: [${classSeq.join(', ')}]`);
  console.log(`  JS result:    [${jsSeq.join(', ')}]`);
  console.log(`  Status:       ${sequencesMatch ? 'PASS' : 'FAIL'}\n`);
  
  if (!sequencesMatch) {
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`fibonacciSequence(10) threw error: ${error.message}\n`);
}

// Test chaining
try {
  const classChainResult = classCalculator.chain(10)
    .add(5)
    .multiply(2)
    .subtract(10)
    .divide(4)
    .equals();
    
  const jsChainResult = jsCalculator.chain(10)
    .add(5)
    .multiply(2)
    .subtract(10)
    .divide(4)
    .equals();
    
  const chainPassed = classChainResult === jsChainResult;
  
  console.log('Chaining: ((10 + 5) * 2 - 10) / 4');
  console.log(`  Class result: ${classChainResult}`);
  console.log(`  JS result:    ${jsChainResult}`);
  console.log(`  Status:       ${chainPassed ? 'PASS' : 'FAIL'}\n`);
  
  if (!chainPassed) {
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`Chaining test threw error: ${error.message}\n`);
}

console.log(`Overall result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);