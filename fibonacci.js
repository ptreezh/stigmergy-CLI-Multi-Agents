/**
 * Calculates the nth number in the Fibonacci sequence
 * @param {number} n - The position in the sequence (0-indexed)
 * @returns {number} - The nth Fibonacci number
 */
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  
  let a = 0;
  let b = 1;
  
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

module.exports = fibonacci;