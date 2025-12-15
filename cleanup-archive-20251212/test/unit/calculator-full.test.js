/**
 * Unit tests for Calculator class following project patterns
 */

const assert = require('assert');
const Calculator = require('../../src/calculator');

describe('Calculator Unit Tests', () => {
    let calc;

    beforeEach(() => {
        calc = new Calculator();
    });

    describe('Basic Arithmetic Operations', () => {
        it('should add two numbers correctly', () => {
            assert.strictEqual(calc.add(5, 3), 8);
            assert.strictEqual(calc.add(-2, 7), 5);
            assert.strictEqual(calc.add(0, 0), 0);
            assert.strictEqual(calc.add(1.5, 2.5), 4);
        });

        it('should subtract two numbers correctly', () => {
            assert.strictEqual(calc.subtract(10, 4), 6);
            assert.strictEqual(calc.subtract(5, 8), -3);
            assert.strictEqual(calc.subtract(0, 0), 0);
            assert.strictEqual(calc.subtract(3.5, 1.5), 2);
        });

        it('should multiply two numbers correctly', () => {
            assert.strictEqual(calc.multiply(6, 7), 42);
            assert.strictEqual(calc.multiply(-3, 4), -12);
            assert.strictEqual(calc.multiply(0, 100), 0);
            assert.strictEqual(calc.multiply(2.5, 4), 10);
        });

        it('should divide two numbers correctly', () => {
            assert.strictEqual(calc.divide(15, 3), 5);
            assert.strictEqual(calc.divide(7, 2), 3.5);
            assert.strictEqual(calc.divide(-10, 2), -5);
            assert.strictEqual(calc.divide(1, 3), 1/3);
        });

        it('should throw error when dividing by zero', () => {
            assert.throws(() => calc.divide(10, 0), {
                name: 'Error',
                message: 'Cannot divide by zero'
            });
        });
    });

    describe('Advanced Mathematical Operations', () => {
        it('should calculate power correctly', () => {
            assert.strictEqual(calc.power(2, 3), 8);
            assert.strictEqual(calc.power(5, 0), 1);
            assert.strictEqual(calc.power(10, 2), 100);
            assert.strictEqual(calc.power(4, 0.5), 2);
        });

        it('should calculate square root correctly', () => {
            assert.strictEqual(calc.sqrt(16), 4);
            assert.strictEqual(calc.sqrt(0), 0);
            assert.strictEqual(calc.sqrt(1), 1);
            assert.strictEqual(calc.sqrt(2), Math.sqrt(2));
        });

        it('should throw error when calculating square root of negative number', () => {
            assert.throws(() => calc.sqrt(-4), {
                name: 'Error',
                message: 'Cannot calculate square root of negative number'
            });
        });

        it('should calculate factorial correctly', () => {
            assert.strictEqual(calc.factorial(5), 120);
            assert.strictEqual(calc.factorial(0), 1);
            assert.strictEqual(calc.factorial(1), 1);
            assert.strictEqual(calc.factorial(3), 6);
        });

        it('should throw error when calculating factorial of negative number', () => {
            assert.throws(() => calc.factorial(-5), {
                name: 'Error',
                message: 'Cannot calculate factorial of negative number'
            });
        });

        it('should calculate percentage correctly', () => {
            assert.strictEqual(calc.percentage(25, 100), 25);
            assert.strictEqual(calc.percentage(10, 50), 20);
            assert.strictEqual(calc.percentage(0, 100), 0);
            assert.strictEqual(calc.percentage(75, 150), 50);
        });

        it('should throw error when calculating percentage with zero as whole', () => {
            assert.throws(() => calc.percentage(50, 0), {
                name: 'Error',
                message: 'Cannot calculate percentage with zero as whole'
            });
        });
    });

    describe('Calculation Chain', () => {
        it('should chain calculations correctly', () => {
            const result = calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals();
            // ((10 + 5) * 2 - 4) / 2 = (30 - 4) / 2 = 26 / 2 = 13
            assert.strictEqual(result, 13);
        });

        it('should throw error when dividing by zero in chain', () => {
            assert.throws(() => calc.chain(10).divide(0), {
                name: 'Error',
                message: 'Cannot divide by zero'
            });
        });

        it('should return current value without ending chain', () => {
            const chain = calc.chain(5).add(3);
            assert.strictEqual(chain.value(), 8);
        });

        it('should support method chaining', () => {
            const chain = calc.chain(2);
            assert.strictEqual(chain.add(3), chain); // Should return itself for chaining
            assert.strictEqual(chain.subtract(1), chain);
            assert.strictEqual(chain.multiply(2), chain);
            assert.strictEqual(chain.divide(2), chain);
            assert.strictEqual(chain.power(2), chain);
        });
    });
});

// Run tests directly if this file is executed
if (require.main === module) {
    console.log('Running Calculator Unit Tests...');
    
    const calc = new Calculator();
    
    // Test basic operations
    console.log('\n1. Testing basic arithmetic operations:');
    console.log('calc.add(5, 3) =', calc.add(5, 3));
    console.log('calc.subtract(10, 4) =', calc.subtract(10, 4));
    console.log('calc.multiply(6, 7) =', calc.multiply(6, 7));
    console.log('calc.divide(15, 3) =', calc.divide(15, 3));
    
    // Test advanced operations
    console.log('\n2. Testing advanced mathematical operations:');
    console.log('calc.power(2, 3) =', calc.power(2, 3));
    console.log('calc.sqrt(16) =', calc.sqrt(16));
    console.log('calc.factorial(5) =', calc.factorial(5));
    console.log('calc.percentage(25, 100) =', calc.percentage(25, 100) + '%');
    
    // Test calculation chain
    console.log('\n3. Testing calculation chain:');
    const chainResult = calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals();
    console.log('calc.chain(10).add(5).multiply(2).subtract(4).divide(2).equals() =', chainResult);
    
    // Test error cases
    console.log('\n4. Testing error handling:');
    try {
        calc.divide(10, 0);
    } catch (error) {
        console.log('Division by zero error:', error.message);
    }
    
    try {
        calc.sqrt(-4);
    } catch (error) {
        console.log('Square root of negative number error:', error.message);
    }
    
    try {
        calc.factorial(-5);
    } catch (error) {
        console.log('Factorial of negative number error:', error.message);
    }
    
    try {
        calc.percentage(50, 0);
    } catch (error) {
        console.log('Percentage with zero as whole error:', error.message);
    }
    
    try {
        calc.chain(10).divide(0);
    } catch (error) {
        console.log('Chain division by zero error:', error.message);
    }
    
    console.log('\nâœ?All Calculator tests completed!');
}
