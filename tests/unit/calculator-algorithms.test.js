/**
 * Unit tests for Calculator class algorithms including Fibonacci and circle circumference
 * These tests cover the more complex mathematical algorithms in the Calculator class
 */

const Calculator = require('../../src/calculator');

// Test suite for Calculator algorithms
describe('Calculator Algorithms', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('Fibonacci Functions', () => {
    test('should calculate the nth Fibonacci number correctly', () => {
      expect(calc.fibonacci(0)).toBe(0);
      expect(calc.fibonacci(1)).toBe(1);
      expect(calc.fibonacci(2)).toBe(1);
      expect(calc.fibonacci(3)).toBe(2);
      expect(calc.fibonacci(4)).toBe(3);
      expect(calc.fibonacci(5)).toBe(5);
      expect(calc.fibonacci(10)).toBe(55);
      expect(calc.fibonacci(15)).toBe(610);
    });

    test('should throw error when calculating Fibonacci of negative number', () => {
      expect(() => calc.fibonacci(-1)).toThrow('Cannot calculate Fibonacci of negative number');
      expect(() => calc.fibonacci(-10)).toThrow('Cannot calculate Fibonacci of negative number');
    });

    test('should throw error when calculating Fibonacci of non-integer', () => {
      expect(() => calc.fibonacci(3.14)).toThrow('Fibonacci input must be an integer');
      expect(() => calc.fibonacci(5.5)).toThrow('Fibonacci input must be an integer');
    });

    test('should generate Fibonacci sequence correctly', () => {
      expect(calc.fibonacciSequence(0)).toEqual([]);
      expect(calc.fibonacciSequence(1)).toEqual([0]);
      expect(calc.fibonacciSequence(2)).toEqual([0, 1]);
      expect(calc.fibonacciSequence(5)).toEqual([0, 1, 1, 2, 3]);
      expect(calc.fibonacciSequence(8)).toEqual([0, 1, 1, 2, 3, 5, 8, 13]);
    });

    test('should throw error when generating Fibonacci sequence with negative length', () => {
      expect(() => calc.fibonacciSequence(-1)).toThrow('Cannot generate Fibonacci sequence with negative length');
      expect(() => calc.fibonacciSequence(-5)).toThrow('Cannot generate Fibonacci sequence with negative length');
    });

    test('should throw error when generating Fibonacci sequence with non-integer length', () => {
      expect(() => calc.fibonacciSequence(3.14)).toThrow('Fibonacci sequence length must be an integer');
      expect(() => calc.fibonacciSequence(5.5)).toThrow('Fibonacci sequence length must be an integer');
    });
  });

  describe('Circle Circumference', () => {
    test('should calculate circle circumference correctly', () => {
      // Using toBeCloseTo for floating point comparisons
      expect(calc.circleCircumference(0)).toBeCloseTo(0);
      expect(calc.circleCircumference(1)).toBeCloseTo(2 * Math.PI);
      expect(calc.circleCircumference(5)).toBeCloseTo(10 * Math.PI);
      expect(calc.circleCircumference(10)).toBeCloseTo(20 * Math.PI);
    });

    test('should throw error when calculating circumference with negative radius', () => {
      expect(() => calc.circleCircumference(-1)).toThrow('Radius cannot be negative');
      expect(() => calc.circleCircumference(-10)).toThrow('Radius cannot be negative');
    });
  });

  describe('Advanced Algorithm Combinations', () => {
    test('should work with chained calculations involving algorithms', () => {
      // Calculate circumference of a circle with radius equal to 5th Fibonacci number, then take square root
      const result = calc.chain(calc.fibonacci(5)).power(2).sqrt().equals();
      // fib(5) = 5, 5^2 = 25, sqrt(25) = 5
      expect(result).toBe(5);
    });

    test('should handle complex chained operations with algorithms', () => {
      // Calculate circumference of circle with radius 3, add 10th Fibonacci number, divide by 2
      const fib10 = calc.fibonacci(10); // 55
      const circumference = calc.circleCircumference(3); // 6π ≈ 18.85
      const expected = (circumference + fib10) / 2;
      
      const result = calc.chain(circumference).add(fib10).divide(2).equals();
      expect(result).toBeCloseTo(expected);
    });
  });
});