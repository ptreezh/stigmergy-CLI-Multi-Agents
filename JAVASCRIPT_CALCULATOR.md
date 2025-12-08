# JavaScript Calculator Implementation

This is a functional equivalent of the Calculator class implemented as a JavaScript object with the same API and functionality.

## Features

The calculator includes all the functionality of the original Calculator class:

1. **Basic Arithmetic Operations**:
   - Addition (`add`)
   - Subtraction (`subtract`)
   - Multiplication (`multiply`)
   - Division (`divide`) with zero-division error handling

2. **Advanced Mathematical Functions**:
   - Power/exponentiation (`power`)
   - Square root (`sqrt`) with negative number error handling
   - Factorial (`factorial`) with negative number error handling
   - Percentage calculation (`percentage`)

3. **Utility Functions**:
   - Maximum/minimum value finding (`max`, `min`)
   - Fibonacci number calculation (`fibonacci`) with error handling for negatives and non-integers
   - Fibonacci sequence generation (`fibonacciSequence`)
   - Circle circumference calculation (`circleCircumference`) with negative radius error handling

4. **Calculation Chaining**:
   - Chain multiple operations together with a fluent API
   - Supports all basic operations in chain format
   - Intermediate value inspection
   - Final result retrieval

## Usage

```javascript
// Import the calculator
const calculator = require('./javascript-calculator');

// Basic operations
console.log(calculator.add(2, 3)); // 5
console.log(calculator.subtract(10, 4)); // 6
console.log(calculator.multiply(3, 7)); // 21
console.log(calculator.divide(15, 3)); // 5

// Advanced operations
console.log(calculator.power(2, 3)); // 8
console.log(calculator.sqrt(16)); // 4
console.log(calculator.factorial(5)); // 120

// Chaining example
const result = calculator.chain(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(4)
  .equals();
console.log(result); // 5

// Fibonacci sequence
console.log(calculator.fibonacciSequence(10)); 
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## Compatibility

This implementation has been tested against the original Calculator class and produces identical results for all operations, including error handling.

## Files

- `javascript-calculator.js` - The main implementation
- `test-javascript-calculator.js` - Basic functionality test
- `compare-calculators.js` - Comparison test against the original Calculator class