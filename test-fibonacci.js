const fibonacci = require('./fibonacci');

// Test cases
console.log('Fibonacci sequence:');
for (let i = 0; i <= 10; i++) {
  console.log(`F(${i}) = ${fibonacci(i)}`);
}

// Additional test cases
console.log('\nAdditional test cases:');
console.log(`F(15) = ${fibonacci(15)}`);
console.log(`F(20) = ${fibonacci(20)}`);