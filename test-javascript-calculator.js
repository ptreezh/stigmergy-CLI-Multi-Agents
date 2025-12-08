/**
 * Test file for javascript-calculator.js
 */

const calculator = require('./javascript-calculator');

console.log('Testing basic operations:');

// Test addition
console.log('Addition: 2 + 3 =', calculator.add(2, 3)); // Should be 5

// Test subtraction
console.log('Subtraction: 10 - 4 =', calculator.subtract(10, 4)); // Should be 6

// Test multiplication
console.log('Multiplication: 3 * 7 =', calculator.multiply(3, 7)); // Should be 21

// Test division
console.log('Division: 15 / 3 =', calculator.divide(15, 3)); // Should be 5

// Test power
console.log('Power: 2^3 =', calculator.power(2, 3)); // Should be 8

// Test square root
console.log('Square root: √16 =', calculator.sqrt(16)); // Should be 4

// Test factorial
console.log('Factorial: 5! =', calculator.factorial(5)); // Should be 120

// Test percentage
console.log('Percentage: 25 is what percent of 100 =', calculator.percentage(25, 100)); // Should be 25

// Test Fibonacci
console.log('Fibonacci 10th number:', calculator.fibonacci(10)); // Should be 55

// Test Fibonacci sequence
console.log('First 10 Fibonacci numbers:', calculator.fibonacciSequence(10)); 
// Should be [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Test circle circumference
console.log('Circle circumference with radius 5:', calculator.circleCircumference(5)); 
// Should be 10π ≈ 31.4159

// Test chaining
console.log('Chaining example:');
const chainResult = calculator.chain(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(4)
  .equals();
console.log('(10 + 5) * 2 - 10) / 4 =', chainResult); // Should be 5

console.log('\nAll tests completed!');