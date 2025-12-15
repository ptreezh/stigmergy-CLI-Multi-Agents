/**
 * Unit tests for Calculator class following project patterns
 */

const Calculator = require('../../src/calculator');

// Test suite for Calculator
describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('Basic Operations', () => {
    test('should add two numbers correctly', () => {
      expect(calc.add(5, 3)).toBe(8);
      expect(calc.add(-2, 7)).toBe(5);
      expect(calc.add(0, 0)).toBe(0);
    });

    test('should subtract two numbers correctly', () => {
      expect(calc.subtract(10, 4)).toBe(6);
      expect(calc.subtract(5, 8)).toBe(-3);
      expect(calc.subtract(0, 0)).toBe(0);
    });

    test('should multiply two numbers correctly', () => {
      expect(calc.multiply(6, 7)).toBe(42);
      expect(calc.multiply(-3, 4)).toBe(-12);
      expect(calc.multiply(0, 100)).toBe(0);
    });

    test('should divide two numbers correctly', () => {
      expect(calc.divide(15, 3)).toBe(5);
      expect(calc.divide(7, 2)).toBe(3.5);
      expect(calc.divide(-10, 2)).toBe(-5);
    });

    test('should throw error when dividing by zero', () => {
      expect(() => calc.divide(10, 0)).toThrow('Cannot divide by zero');
    });

    test('should calculate power correctly', () => {
      expect(calc.power(2, 3)).toBe(8);
      expect(calc.power(5, 0)).toBe(1);
      expect(calc.power(10, 2)).toBe(100);
    });

    test('should calculate square root correctly', () => {
      expect(calc.sqrt(16)).toBe(4);
      expect(calc.sqrt(0)).toBe(0);
      expect(calc.sqrt(1)).toBe(1);
    });

    test('should throw error when calculating square root of negative number', () => {
      expect(() => calc.sqrt(-4)).toThrow('Cannot calculate square root of negative number');
    });

    test('should calculate factorial correctly', () => {
      expect(calc.factorial(5)).toBe(120);
      expect(calc.factorial(0)).toBe(1);
      expect(calc.factorial(1)).toBe(1);
    });

    test('should throw error when calculating factorial of negative number', () => {
      expect(() => calc.factorial(-5)).toThrow('Cannot calculate factorial of negative number');
    });

    test('should calculate percentage correctly', () => {
      expect(calc.percentage(25, 100)).toBe(25);
      expect(calc.percentage(10, 50)).toBe(20);
      expect(calc.percentage(0, 100)).toBe(0);
    });

    test('should throw error when calculating percentage with zero as whole', () => {
      expect(() => calc.percentage(50, 0)).toThrow('Cannot calculate percentage with zero as whole');
    });
  });

  describe('Calculation Chain', () => {
    test('should chain calculations correctly', () => {
      const result = calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals();
      // ((10 + 5) * 2 - 4) / 2 = (30 - 4) / 2 = 26 / 2 = 13
      expect(result).toBe(13);
    });

    test('should throw error when dividing by zero in chain', () => {
      expect(() => calc.chain(10).divide(0)).toThrow('Cannot divide by zero');
    });

    test('should return current value without ending chain', () => {
      const chain = calc.chain(5).add(3);
      expect(chain.value()).toBe(8);
    });
  });
});
