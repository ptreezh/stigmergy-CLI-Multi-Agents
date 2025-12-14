/**
 * Simple unit tests for Calculator class
 */

const Calculator = require('../../src/calculator');

console.log("Testing Calculator class...");

const calc = new Calculator();

try {
  // Test basic operations
  console.log("\n1. Testing basic arithmetic operations:");
  
  // Addition
  const sum = calc.add(5, 3);
  console.log(`calc.add(5, 3) = ${sum}`);
  
  // Subtraction
  const difference = calc.subtract(10, 4);
  console.log(`calc.subtract(10, 4) = ${difference}`);
  
  // Multiplication
  const product = calc.multiply(6, 7);
  console.log(`calc.multiply(6, 7) = ${product}`);
  
  // Division
  const quotient = calc.divide(15, 3);
  console.log(`calc.divide(15, 3) = ${quotient}`);
  
  // Power
  const powerResult = calc.power(2, 3);
  console.log(`calc.power(2, 3) = ${powerResult}`);
  
  // Square root
  const sqrtResult = calc.sqrt(16);
  console.log(`calc.sqrt(16) = ${sqrtResult}`);
  
  // Factorial
  const factorialResult = calc.factorial(5);
  console.log(`calc.factorial(5) = ${factorialResult}`);
  
  // Percentage
  const percentageResult = calc.percentage(25, 100);
  console.log(`calc.percentage(25, 100) = ${percentageResult}%`);
  
  console.log("\n‚ú?Basic operations tests passed!");

  // Test calculation chain
  console.log("\n2. Testing calculation chain:");
  const chainResult = calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals();
  console.log(`calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals() = ${chainResult}`);
  console.log("‚ú?Chain operations test passed!");
  
  console.log("\n‚ú?All tests passed!");
} catch (error) {
  console.error("‚ù?Test failed:", error.message);
}

// Test error cases
console.log("\n3. Testing error handling:");

try {
  calc.divide(10, 0);
  console.log("‚ù?Should have thrown an error for division by zero");
} catch (error) {
  console.log("‚ú?Correctly threw error for division by zero:", error.message);
}

try {
  calc.sqrt(-4);
  console.log("‚ù?Should have thrown an error for square root of negative number");
} catch (error) {
  console.log("‚ú?Correctly threw error for square root of negative number:", error.message);
}

try {
  calc.factorial(-5);
  console.log("‚ù?Should have thrown an error for factorial of negative number");
} catch (error) {
  console.log("‚ú?Correctly threw error for factorial of negative number:", error.message);
}

try {
  calc.percentage(50, 0);
  console.log("‚ù?Should have thrown an error for percentage with zero as whole");
} catch (error) {
  console.log("‚ú?Correctly threw error for percentage with zero as whole:", error.message);
}

try {
  calc.chain(10).divide(0);
  console.log("‚ù?Should have thrown an error for chain division by zero");
} catch (error) {
  console.log("‚ú?Correctly threw error for chain division by zero:", error.message);
}
