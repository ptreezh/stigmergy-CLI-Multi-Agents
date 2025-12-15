/**
 * Test file for Fibonacci functionality in Calculator class
 */

const Calculator = require('../src/calculator');

console.log("Testing Fibonacci functionality...");

const calc = new Calculator();

// Test Fibonacci function
console.log("\n1. Testing Fibonacci function:");

// Test F(0) = 0
console.log("\n1.1 Testing F(0):");
try {
  const result = calc.fibonacci(0);
  console.log(`calc.fibonacci(0) = ${result}`);
  if (result === 0) {
    console.log("‚ú?F(0) test passed");
  } else {
    console.log("‚ù?F(0) test failed");
  }
} catch (error) {
  console.log("‚ù?F(0) test failed with error:", error.message);
}

// Test F(1) = 1
console.log("\n1.2 Testing F(1):");
try {
  const result = calc.fibonacci(1);
  console.log(`calc.fibonacci(1) = ${result}`);
  if (result === 1) {
    console.log("‚ú?F(1) test passed");
  } else {
    console.log("‚ù?F(1) test failed");
  }
} catch (error) {
  console.log("‚ù?F(1) test failed with error:", error.message);
}

// Test F(2) = 1
console.log("\n1.3 Testing F(2):");
try {
  const result = calc.fibonacci(2);
  console.log(`calc.fibonacci(2) = ${result}`);
  if (result === 1) {
    console.log("‚ú?F(2) test passed");
  } else {
    console.log("‚ù?F(2) test failed");
  }
} catch (error) {
  console.log("‚ù?F(2) test failed with error:", error.message);
}

// Test F(10) = 55
console.log("\n1.4 Testing F(10):");
try {
  const result = calc.fibonacci(10);
  console.log(`calc.fibonacci(10) = ${result}`);
  if (result === 55) {
    console.log("‚ú?F(10) test passed");
  } else {
    console.log("‚ù?F(10) test failed");
  }
} catch (error) {
  console.log("‚ù?F(10) test failed with error:", error.message);
}

// Test Fibonacci with negative number
console.log("\n1.5 Testing Fibonacci with negative number:");
try {
  calc.fibonacci(-5);
  console.log("‚ù?Fibonacci with negative number test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Fibonacci with negative number correctly threw error:", error.message);
}

// Test Fibonacci with non-integer
console.log("\n1.6 Testing Fibonacci with non-integer:");
try {
  calc.fibonacci(5.5);
  console.log("‚ù?Fibonacci with non-integer test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Fibonacci with non-integer correctly threw error:", error.message);
}

// Test Fibonacci sequence function
console.log("\n2. Testing Fibonacci sequence function:");

// Test sequence of 0 elements
console.log("\n2.1 Testing sequence of 0 elements:");
try {
  const sequence = calc.fibonacciSequence(0);
  console.log(`calc.fibonacciSequence(0) = [${sequence.join(', ')}]`);
  if (sequence.length === 0) {
    console.log("‚ú?Sequence of 0 elements test passed");
  } else {
    console.log("‚ù?Sequence of 0 elements test failed");
  }
} catch (error) {
  console.log("‚ù?Sequence of 0 elements test failed with error:", error.message);
}

// Test sequence of 1 element
console.log("\n2.2 Testing sequence of 1 element:");
try {
  const sequence = calc.fibonacciSequence(1);
  console.log(`calc.fibonacciSequence(1) = [${sequence.join(', ')}]`);
  if (sequence.length === 1 && sequence[0] === 0) {
    console.log("‚ú?Sequence of 1 element test passed");
  } else {
    console.log("‚ù?Sequence of 1 element test failed");
  }
} catch (error) {
  console.log("‚ù?Sequence of 1 element test failed with error:", error.message);
}

// Test sequence of 2 elements
console.log("\n2.3 Testing sequence of 2 elements:");
try {
  const sequence = calc.fibonacciSequence(2);
  console.log(`calc.fibonacciSequence(2) = [${sequence.join(', ')}]`);
  if (sequence.length === 2 && sequence[0] === 0 && sequence[1] === 1) {
    console.log("‚ú?Sequence of 2 elements test passed");
  } else {
    console.log("‚ù?Sequence of 2 elements test failed");
  }
} catch (error) {
  console.log("‚ù?Sequence of 2 elements test failed with error:", error.message);
}

// Test sequence of 10 elements
console.log("\n2.4 Testing sequence of 10 elements:");
try {
  const sequence = calc.fibonacciSequence(10);
  console.log(`calc.fibonacciSequence(10) = [${sequence.join(', ')}]`);
  const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
  let passed = true;
  if (sequence.length !== expected.length) {
    passed = false;
  } else {
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] !== expected[i]) {
        passed = false;
        break;
      }
    }
  }
  
  if (passed) {
    console.log("‚ú?Sequence of 10 elements test passed");
  } else {
    console.log("‚ù?Sequence of 10 elements test failed");
  }
} catch (error) {
  console.log("‚ù?Sequence of 10 elements test failed with error:", error.message);
}

// Test Fibonacci sequence with negative number
console.log("\n2.5 Testing Fibonacci sequence with negative number:");
try {
  calc.fibonacciSequence(-5);
  console.log("‚ù?Fibonacci sequence with negative number test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Fibonacci sequence with negative number correctly threw error:", error.message);
}

// Test Fibonacci sequence with non-integer
console.log("\n2.6 Testing Fibonacci sequence with non-integer:");
try {
  calc.fibonacciSequence(5.5);
  console.log("‚ù?Fibonacci sequence with non-integer test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Fibonacci sequence with non-integer correctly threw error:", error.message);
}

console.log("\n‚ú?All Fibonacci tests completed!");
