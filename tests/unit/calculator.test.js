/**
 * Unit tests for Calculator class
 */
const assert = require('assert');
const Calculator = require('../../src/calculator');

describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('Basic Operations', () => {
    it('should add two numbers correctly', () => {
      assert.strictEqual(calc.add(2, 3), 5);
      assert.strictEqual(calc.add(-1, 1), 0);
      assert.strictEqual(calc.add(0, 0), 0);
      assert.strictEqual(calc.add(2.5, 3.7), 6.2);
    });

    it('should subtract two numbers correctly', () => {
      assert.strictEqual(calc.subtract(5, 3), 2);
      assert.strictEqual(calc.subtract(0, 5), -5);
      assert.strictEqual(calc.subtract(-2, -3), 1);
      assert.strictEqual(calc.subtract(5.5, 2.2), 3.3);
    });

    it('should multiply two numbers correctly', () => {
      assert.strictEqual(calc.multiply(3, 4), 12);
      assert.strictEqual(calc.multiply(-3, -4), 12);
      assert.strictEqual(calc.multiply(3, -4), -12);
      assert.strictEqual(calc.multiply(5, 0), 0);
      assert.strictEqual(calc.multiply(2.5, 4), 10);
    });

    it('should divide two numbers correctly', () => {
      assert.strictEqual(calc.divide(8, 2), 4);
      assert.strictEqual(calc.divide(7, 2), 3.5);
      assert.strictEqual(calc.divide(-8, 2), -4);
      assert.strictEqual(calc.divide(0, 5), 0);
      
      // Test division by zero throws error
      assert.throws(() => calc.divide(5, 0), Error);
    });

    it('should calculate power correctly', () => {
      assert.strictEqual(calc.power(2, 3), 8);
      assert.strictEqual(calc.power(5, 0), 1);
      assert.strictEqual(calc.power(10, 2), 100);
      assert.strictEqual(calc.power(4, 0.5), 2);
    });

    it('should calculate square root correctly', () => {
      assert.strictEqual(calc.sqrt(4), 2);
      assert.strictEqual(calc.sqrt(0), 0);
      assert.strictEqual(calc.sqrt(16), 4);
      assert.strictEqual(calc.sqrt(2), Math.sqrt(2));
      
      // Test square root of negative number throws error
      assert.throws(() => calc.sqrt(-1), Error);
    });

    it('should calculate factorial correctly', () => {
      assert.strictEqual(calc.factorial(0), 1);
      assert.strictEqual(calc.factorial(1), 1);
      assert.strictEqual(calc.factorial(5), 120);
      assert.strictEqual(calc.factorial(3), 6);
      
      // Test factorial of negative number throws error
      assert.throws(() => calc.factorial(-1), Error);
    });

    it('should calculate percentage correctly', () => {
      assert.strictEqual(calc.percentage(50, 100), 50);
      assert.strictEqual(calc.percentage(25, 200), 12.5);
      assert.strictEqual(calc.percentage(0, 100), 0);
      
      // Test percentage with zero as whole throws error
      assert.throws(() => calc.percentage(50, 0), Error);
    });

    it('should calculate Fibonacci numbers correctly', () => {
      assert.strictEqual(calc.fibonacci(0), 0);
      assert.strictEqual(calc.fibonacci(1), 1);
      assert.strictEqual(calc.fibonacci(2), 1);
      assert.strictEqual(calc.fibonacci(3), 2);
      assert.strictEqual(calc.fibonacci(4), 3);
      assert.strictEqual(calc.fibonacci(5), 5);
      assert.strictEqual(calc.fibonacci(10), 55);
      assert.strictEqual(calc.fibonacci(15), 610);
    });

    it('should throw error when calculating Fibonacci of negative number', () => {
      assert.throws(() => calc.fibonacci(-1), Error);
    });

    it('should throw error when calculating Fibonacci of non-integer', () => {
      assert.throws(() => calc.fibonacci(3.14), Error);
      assert.throws(() => calc.fibonacci('5'), Error);
    });

    it('should generate Fibonacci sequences correctly', () => {
      assert.deepStrictEqual(calc.fibonacciSequence(0), []);
      assert.deepStrictEqual(calc.fibonacciSequence(1), [0]);
      assert.deepStrictEqual(calc.fibonacciSequence(2), [0, 1]);
      assert.deepStrictEqual(calc.fibonacciSequence(5), [0, 1, 1, 2, 3]);
      assert.deepStrictEqual(calc.fibonacciSequence(8), [0, 1, 1, 2, 3, 5, 8, 13]);
    });

    it('should throw error when generating Fibonacci sequence with negative length', () => {
      assert.throws(() => calc.fibonacciSequence(-1), Error);
    });

    it('should throw error when generating Fibonacci sequence with non-integer length', () => {
      assert.throws(() => calc.fibonacciSequence(3.14), Error);
      assert.throws(() => calc.fibonacciSequence('5'), Error);
    });

    it('should calculate circle circumference correctly', () => {
      // Test with radius of 1 (circumference should be 2π)
      assert.strictEqual(calc.circleCircumference(1), 2 * Math.PI);
      
      // Test with radius of 5
      assert.strictEqual(calc.circleCircumference(5), 10 * Math.PI);
      
      // Test with radius of 0
      assert.strictEqual(calc.circleCircumference(0), 0);
      
      // Test with decimal radius
      assert.strictEqual(calc.circleCircumference(2.5), 5 * Math.PI);
    });

    it('should throw error when calculating circle circumference with negative radius', () => {
      assert.throws(() => calc.circleCircumference(-1), Error);
      assert.throws(() => calc.circleCircumference(-5.5), Error);
    });
  });

  describe('Calculation Chain', () => {
    it('should chain calculations correctly', () => {
      const result = calc.chain(10)
        .add(5)
        .subtract(3)
        .multiply(2)
        .divide(4)
        .equals();
      
      // ((10 + 5 - 3) * 2) / 4 = 6
      assert.strictEqual(result, 6);
    });

    it('should handle power in chain calculations', () => {
      const result = calc.chain(2)
        .power(3)
        .add(1)
        .equals();
      
      // (2^3) + 1 = 9
      assert.strictEqual(result, 9);
    });

    it('should handle square root in chain calculations', () => {
      const result = calc.chain(16)
        .sqrt()
        .add(1)
        .equals();
      
      // √16 + 1 = 5
      assert.strictEqual(result, 5);
    });

    it('should throw error when calculating square root of negative number in chain', () => {
      assert.throws(() => calc.chain(-1).sqrt(), Error);
    });

    it('should throw error when dividing by zero in chain', () => {
      assert.throws(() => calc.chain(10).divide(0), Error);
    });

    it('should allow getting intermediate values', () => {
      const chain = calc.chain(5)
        .add(3)  // 8
        .multiply(2); // 16
      
      assert.strictEqual(chain.value(), 16);
      
      const finalResult = chain.divide(4).equals(); // 4
      assert.strictEqual(finalResult, 4);
    });
  });
});