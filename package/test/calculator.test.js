/**
 * Unit tests for Calculator class
 */

const Calculator = require('../src/calculator');

console.log("Testing Calculator class...");

// Test basic operations
console.log("\n1. Testing basic arithmetic operations:");

const calc = new Calculator();

// Test addition
console.log("\n1.1 Testing addition:");
try {
  const sum = calc.add(5, 3);
  console.log(`calc.add(5, 3) = ${sum}`);
  if (sum === 8) {
    console.log("‚ú?Addition test passed");
  } else {
    console.log("‚ù?Addition test failed");
  }
} catch (error) {
  console.log("‚ù?Addition test failed with error:", error.message);
}

// Test subtraction
console.log("\n1.2 Testing subtraction:");
try {
  const difference = calc.subtract(10, 4);
  console.log(`calc.subtract(10, 4) = ${difference}`);
  if (difference === 6) {
    console.log("‚ú?Subtraction test passed");
  } else {
    console.log("‚ù?Subtraction test failed");
  }
} catch (error) {
  console.log("‚ù?Subtraction test failed with error:", error.message);
}

// Test multiplication
console.log("\n1.3 Testing multiplication:");
try {
  const product = calc.multiply(6, 7);
  console.log(`calc.multiply(6, 7) = ${product}`);
  if (product === 42) {
    console.log("‚ú?Multiplication test passed");
  } else {
    console.log("‚ù?Multiplication test failed");
  }
} catch (error) {
  console.log("‚ù?Multiplication test failed with error:", error.message);
}

// Test division
console.log("\n1.4 Testing division:");
try {
  const quotient = calc.divide(15, 3);
  console.log(`calc.divide(15, 3) = ${quotient}`);
  if (quotient === 5) {
    console.log("‚ú?Division test passed");
  } else {
    console.log("‚ù?Division test failed");
  }
} catch (error) {
  console.log("‚ù?Division test failed with error:", error.message);
}

// Test division by zero
console.log("\n1.5 Testing division by zero:");
try {
  calc.divide(10, 0);
  console.log("‚ù?Division by zero test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Division by zero correctly threw error:", error.message);
}

// Test power function
console.log("\n1.6 Testing power function:");
try {
  const powerResult = calc.power(2, 3);
  console.log(`calc.power(2, 3) = ${powerResult}`);
  if (powerResult === 8) {
    console.log("‚ú?Power test passed");
  } else {
    console.log("‚ù?Power test failed");
  }
} catch (error) {
  console.log("‚ù?Power test failed with error:", error.message);
}

// Test square root
console.log("\n1.7 Testing square root:");
try {
  const sqrtResult = calc.sqrt(16);
  console.log(`calc.sqrt(16) = ${sqrtResult}`);
  if (sqrtResult === 4) {
    console.log("‚ú?Square root test passed");
  } else {
    console.log("‚ù?Square root test failed");
  }
} catch (error) {
  console.log("‚ù?Square root test failed with error:", error.message);
}

// Test square root of negative number
console.log("\n1.8 Testing square root of negative number:");
try {
  calc.sqrt(-4);
  console.log("‚ù?Square root of negative number test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Square root of negative number correctly threw error:", error.message);
}

// Test factorial
console.log("\n1.9 Testing factorial:");
try {
  const factorialResult = calc.factorial(5);
  console.log(`calc.factorial(5) = ${factorialResult}`);
  if (factorialResult === 120) {
    console.log("‚ú?Factorial test passed");
  } else {
    console.log("‚ù?Factorial test failed");
  }
} catch (error) {
  console.log("‚ù?Factorial test failed with error:", error.message);
}

// Test factorial of 0
console.log("\n1.10 Testing factorial of 0:");
try {
  const factorialZero = calc.factorial(0);
  console.log(`calc.factorial(0) = ${factorialZero}`);
  if (factorialZero === 1) {
    console.log("‚ú?Factorial of 0 test passed");
  } else {
    console.log("‚ù?Factorial of 0 test failed");
  }
} catch (error) {
  console.log("‚ù?Factorial of 0 test failed with error:", error.message);
}

// Test factorial of negative number
console.log("\n1.11 Testing factorial of negative number:");
try {
  calc.factorial(-5);
  console.log("‚ù?Factorial of negative number test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Factorial of negative number correctly threw error:", error.message);
}

// Test percentage
console.log("\n1.12 Testing percentage:");
try {
  const percentageResult = calc.percentage(25, 100);
  console.log(`calc.percentage(25, 100) = ${percentageResult}%`);
  if (percentageResult === 25) {
    console.log("‚ú?Percentage test passed");
  } else {
    console.log("‚ù?Percentage test failed");
  }
} catch (error) {
  console.log("‚ù?Percentage test failed with error:", error.message);
}

// Test percentage with zero as whole
console.log("\n1.13 Testing percentage with zero as whole:");
try {
  calc.percentage(50, 0);
  console.log("‚ù?Percentage with zero as whole test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Percentage with zero as whole correctly threw error:", error.message);
}

// Test calculation chain
console.log("\n2. Testing calculation chain:");

console.log("\n2.1 Testing chain operations:");
try {
  const chainResult = calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals();
  console.log(`calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals() = ${chainResult}`);
  // ((10 + 5) * 2 - 4) / 2 = (30 - 4) / 2 = 26 / 2 = 13
  if (chainResult === 13) {
    console.log("‚ú?Chain operations test passed");
  } else {
    console.log("‚ù?Chain operations test failed");
  }
} catch (error) {
  console.log("‚ù?Chain operations test failed with error:", error.message);
}

console.log("\n2.2 Testing chain division by zero:");
try {
  calc.chain(10).divide(0);
  console.log("‚ù?Chain division by zero test failed - should have thrown an error");
} catch (error) {
  console.log("‚ú?Chain division by zero correctly threw error:", error.message);
}

console.log("\n2.3 Testing chain value method:");
try {
  const chain = calc.chain(5).add(3);
  const currentValue = chain.value();
  console.log(`calc.chain(5).add(3).value() = ${currentValue}`);
  if (currentValue === 8) {
    console.log("‚ú?Chain value method test passed");
  } else {
    console.log("‚ù?Chain value method test failed");
  }
} catch (error) {
  console.log("‚ù?Chain value method test failed with error:", error.message);
}

console.log("\n‚ú?All Calculator tests completed!");
