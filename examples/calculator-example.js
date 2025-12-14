/**
 * Example usage of the Calculator class
 */

const Calculator = require('../src/calculator');

// Create a new calculator instance
const calc = new Calculator();

// Basic operations
console.log('=== Basic Operations ===');
console.log(`Addition: 5 + 3 = ${calc.add(5, 3)}`);
console.log(`Subtraction: 10 - 4 = ${calc.subtract(10, 4)}`);
console.log(`Multiplication: 6 * 7 = ${calc.multiply(6, 7)}`);
console.log(`Division: 15 / 3 = ${calc.divide(15, 3)}`);
console.log(`Power: 2^8 = ${calc.power(2, 8)}`);
console.log(`Square Root: âˆ?4 = ${calc.sqrt(64)}`);
console.log(`Factorial: 5! = ${calc.factorial(5)}`);
console.log(`Percentage: 25 is what percent of 200 = ${calc.percentage(25, 200)}%`);

// Chained calculations
console.log('\n=== Chained Calculations ===');
const result1 = calc.chain(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(4)
  .equals();

console.log(`((10 + 5) * 2 - 10) / 4 = ${result1}`);

// More complex chained calculation
const result2 = calc.chain(2)
  .power(3)
  .add(1)
  .multiply(2)
  .sqrt()
  .equals();

console.log(`âˆ?((2^3) + 1) * 2) = ${result2}`);

// Getting intermediate values
console.log('\n=== Intermediate Values ===');
const chain = calc.chain(100)
  .subtract(20)  // 80
  .divide(4)     // 20
  .add(5);       // 25

console.log(`Intermediate result: ${chain.value()}`);

const finalResult = chain.multiply(2).equals(); // 50
console.log(`Final result: ${finalResult}`);

// Error handling examples
console.log('\n=== Error Handling ===');
try {
  calc.divide(10, 0);
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}

try {
  calc.sqrt(-1);
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}

try {
  calc.chain(10).divide(0);
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}
