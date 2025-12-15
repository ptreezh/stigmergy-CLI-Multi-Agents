/**
 * Unit tests for multiply function
 */

const assert = require('assert');

// The multiply function to test
function multiply(a, b) {
  return a * b;
}

describe('multiply function', () => {
  it('should multiply two positive numbers correctly', () => {
    const result = multiply(3, 4);
    assert.strictEqual(result, 12);
  });

  it('should multiply two negative numbers correctly', () => {
    const result = multiply(-3, -4);
    assert.strictEqual(result, 12);
  });

  it('should multiply a positive and negative number correctly', () => {
    const result = multiply(3, -4);
    assert.strictEqual(result, -12);
  });

  it('should multiply by zero correctly', () => {
    const result = multiply(5, 0);
    assert.strictEqual(result, 0);
  });

  it('should multiply by one correctly', () => {
    const result = multiply(7, 1);
    assert.strictEqual(result, 7);
  });

  it('should multiply decimal numbers correctly', () => {
    const result = multiply(2.5, 4);
    assert.strictEqual(result, 10);
  });

  it('should handle multiplication with zero correctly', () => {
    const result = multiply(0, 100);
    assert.strictEqual(result, 0);
  });

  it('should handle large numbers correctly', () => {
    const result = multiply(1000000, 1000000);
    assert.strictEqual(result, 1000000000000);
  });
});
