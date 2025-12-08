/**
 * JavaScript Calculator Implementation
 * A functional equivalent of the Calculator class
 */

// Main calculator object with all operations
const calculator = {
  /**
   * Add two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Sum of a and b
   */
  add: function(a, b) {
    return a + b;
  },

  /**
   * Subtract two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Difference of a and b
   */
  subtract: function(a, b) {
    return a - b;
  },

  /**
   * Multiply two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} Product of a and b
   */
  multiply: function(a, b) {
    return a * b;
  },

  /**
   * Divide two numbers
   * @param {number} a - Dividend
   * @param {number} b - Divisor
   * @returns {number} Quotient of a and b
   * @throws {Error} If dividing by zero
   */
  divide: function(a, b) {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  },

  /**
   * Calculate the power of a number
   * @param {number} base - Base number
   * @param {number} exponent - Exponent
   * @returns {number} Base raised to the power of exponent
   */
  power: function(base, exponent) {
    return Math.pow(base, exponent);
  },

  /**
   * Calculate the square root of a number
   * @param {number} a - Number to calculate square root for
   * @returns {number} Square root of a
   * @throws {Error} If calculating square root of negative number
   */
  sqrt: function(a) {
    if (a < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    return Math.sqrt(a);
  },

  /**
   * Calculate the factorial of a number
   * @param {number} n - Number to calculate factorial for
   * @returns {number} Factorial of n
   * @throws {Error} If calculating factorial of negative number
   */
  factorial: function(n) {
    if (n < 0) {
      throw new Error('Cannot calculate factorial of negative number');
    }

    if (n === 0 || n === 1) {
      return 1;
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  /**
   * Calculate percentage
   * @param {number} part - Part value
   * @param {number} whole - Whole value
   * @returns {number} Percentage of part in relation to whole
   */
  percentage: function(part, whole) {
    if (whole === 0) {
      throw new Error('Cannot calculate percentage with zero as whole');
    }
    return (part / whole) * 100;
  },

  /**
   * Find the maximum of two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} The larger of the two numbers
   */
  max: function(a, b) {
    return Math.max(a, b);
  },

  /**
   * Find the minimum of two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} The smaller of the two numbers
   */
  min: function(a, b) {
    return Math.min(a, b);
  },

  /**
   * Calculate the nth Fibonacci number
   * @param {number} n - Position in the Fibonacci sequence (0-indexed)
   * @returns {number} The nth Fibonacci number
   * @throws {Error} If n is negative or not an integer
   */
  fibonacci: function(n) {
    if (n < 0) {
      throw new Error('Cannot calculate Fibonacci of negative number');
    }

    if (!Number.isInteger(n)) {
      throw new Error('Fibonacci input must be an integer');
    }

    if (n === 0) return 0;
    if (n === 1) return 1;

    let prev = 0;
    let curr = 1;

    for (let i = 2; i <= n; i++) {
      const next = prev + curr;
      prev = curr;
      curr = next;
    }

    return curr;
  },

  /**
   * Generate a Fibonacci sequence up to n terms
   * @param {number} n - Number of terms to generate
   * @returns {Array<number>} Array containing the first n Fibonacci numbers
   * @throws {Error} If n is negative or not an integer
   */
  fibonacciSequence: function(n) {
    if (n < 0) {
      throw new Error('Cannot generate Fibonacci sequence with negative length');
    }

    if (!Number.isInteger(n)) {
      throw new Error('Fibonacci sequence length must be an integer');
    }

    if (n === 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const sequence = [0, 1];

    for (let i = 2; i < n; i++) {
      sequence[i] = sequence[i - 1] + sequence[i - 2];
    }

    return sequence;
  },

  /**
   * Calculate the circumference of a circle
   * @param {number} radius - The radius of the circle
   * @returns {number} The circumference of the circle
   * @throws {Error} If radius is negative
   */
  circleCircumference: function(radius) {
    if (radius < 0) {
      throw new Error('Radius cannot be negative');
    }
    return 2 * Math.PI * radius;
  },

  /**
   * Chain calculations with a running result
   * @param {number} initialValue - Starting value for calculations
   * @returns {CalculationChain} Object for chaining calculations
   */
  chain: function(initialValue = 0) {
    return new CalculationChain(initialValue);
  }
};

/**
 * Helper class for chaining calculations
 */
class CalculationChain {
  /**
   * Create a new calculation chain
   * @param {number} initialValue - Starting value
   */
  constructor(initialValue) {
    this.result = initialValue;
  }

  /**
   * Add a number to the current result
   * @param {number} value - Number to add
   * @returns {CalculationChain} This chain instance
   */
  add(value) {
    this.result += value;
    return this;
  }

  /**
   * Subtract a number from the current result
   * @param {number} value - Number to subtract
   * @returns {CalculationChain} This chain instance
   */
  subtract(value) {
    this.result -= value;
    return this;
  }

  /**
   * Multiply the current result by a number
   * @param {number} value - Number to multiply by
   * @returns {CalculationChain} This chain instance
   */
  multiply(value) {
    this.result *= value;
    return this;
  }

  /**
   * Divide the current result by a number
   * @param {number} value - Number to divide by
   * @returns {CalculationChain} This chain instance
   * @throws {Error} If dividing by zero
   */
  divide(value) {
    if (value === 0) {
      throw new Error('Cannot divide by zero');
    }
    this.result /= value;
    return this;
  }

  /**
   * Raise the current result to a power
   * @param {number} exponent - Exponent
   * @returns {CalculationChain} This chain instance
   */
  power(exponent) {
    this.result = Math.pow(this.result, exponent);
    return this;
  }

  /**
   * Calculate the square root of the current result
   * @returns {CalculationChain} This chain instance
   * @throws {Error} If calculating square root of negative number
   */
  sqrt() {
    if (this.result < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }
    this.result = Math.sqrt(this.result);
    return this;
  }

  /**
   * Get the final result of the chained calculations
   * @returns {number} Final result
   */
  equals() {
    return this.result;
  }

  /**
   * Get the current result without ending the chain
   * @returns {number} Current result
   */
  value() {
    return this.result;
  }
}

// Export the calculator object for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = calculator;
}

// Example usage:
/*
console.log(calculator.add(2, 3)); // 5
console.log(calculator.subtract(10, 4)); // 6
console.log(calculator.multiply(3, 7)); // 21
console.log(calculator.divide(15, 3)); // 5

// Chaining example
const result = calculator.chain(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(4)
  .equals();
console.log(result); // 5

// Fibonacci sequence
console.log(calculator.fibonacciSequence(10)); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
*/