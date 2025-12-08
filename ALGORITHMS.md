# Algorithms Documentation

This document provides comprehensive documentation for the key algorithms implemented in the Stigmergy CLI - Multi-Agents system.

## Table of Contents
1. [QuickSort Algorithm](#quicksort-algorithm)
2. [Calculator Algorithms](#calculator-algorithms)
3. [HashTable Data Structure](#hashtable-data-structure)

## QuickSort Algorithm

### Overview
QuickSort is a highly efficient divide-and-conquer sorting algorithm that works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.

### Implementation Details

#### Functions

##### `quicksort(arr, compareFn)`
Sorts an array using the quicksort algorithm without modifying the original array.

**Parameters:**
- `arr` (Array): The array to be sorted
- `compareFn` (Function, optional): A comparison function that defines the sort order. If omitted, elements are sorted in ascending order.

**Returns:**
- Array: A new sorted array

**Time Complexity:**
- Best/Average Case: O(n log n)
- Worst Case: O(n²)

**Space Complexity:**
- O(log n) due to recursion stack

##### `quicksortInPlace(arr, compareFn)`
Sorts an array in-place using the quicksort algorithm, modifying the original array.

**Parameters:**
- `arr` (Array): The array to be sorted (will be modified)
- `compareFn` (Function, optional): A comparison function that defines the sort order. If omitted, elements are sorted in ascending order.

**Returns:**
- Array: The same array reference, now sorted

**Time Complexity:**
- Best/Average Case: O(n log n)
- Worst Case: O(n²)

**Space Complexity:**
- O(log n) due to recursion stack

#### QuickSort Class
The `QuickSort` class provides a convenient interface for sorting with predefined methods for common sorting scenarios.

**Constructor:**
```javascript
new QuickSort(compareFn)
```
- `compareFn` (Function, optional): Default comparison function for all sorting operations

**Methods:**

- `sort(arr, compareFn)`: Sorts an array, returning a new sorted array
- `sortInPlace(arr, compareFn)`: Sorts an array in-place
- `sortNumbersAscending(numbers)`: Sorts numbers in ascending order
- `sortNumbersDescending(numbers)`: Sorts numbers in descending order
- `sortStrings(strings)`: Sorts strings alphabetically (case-sensitive)
- `sortStringsCaseInsensitive(strings)`: Sorts strings alphabetically (case-insensitive)

### Usage Examples

```javascript
// Basic usage
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = quicksort(numbers);
console.log(sorted); // [1, 1, 2, 3, 4, 5, 6, 9]

// Custom comparison function
const people = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];
const sortedByAge = quicksort(people, (a, b) => a.age - b.age);

// Using the QuickSort class
const sorter = new QuickSort();
const descNumbers = sorter.sortNumbersDescending([3, 1, 4, 1, 5]);
```

## Calculator Algorithms

### Overview
The Calculator class implements various mathematical algorithms for arithmetic operations, including basic operations, powers, roots, factorials, and sequences.

### Implemented Algorithms

#### Basic Arithmetic Operations
- `add(a, b)`: Addition of two numbers
- `subtract(a, b)`: Subtraction of two numbers
- `multiply(a, b)`: Multiplication of two numbers
- `divide(a, b)`: Division of two numbers with zero-division checking

#### Advanced Mathematical Operations
- `power(base, exponent)`: Calculates base raised to the power of exponent using `Math.pow()`
- `sqrt(a)`: Calculates the square root of a number with negative number checking
- `factorial(n)`: Calculates the factorial of n using iterative approach
- `percentage(part, whole)`: Calculates what percentage part is of whole

#### Sequence Generation
- `fibonacci(n)`: Calculates the nth Fibonacci number using iterative approach
- `fibonacciSequence(n)`: Generates the first n Fibonacci numbers

#### Chained Calculations
- `chain(initialValue)`: Creates a CalculationChain object for performing sequential operations

### Time Complexities
- Basic arithmetic: O(1)
- Power: O(log n) where n is the exponent
- Square root: O(1)
- Factorial: O(n)
- Fibonacci number: O(n)
- Fibonacci sequence: O(n)

### Usage Examples

```javascript
const calc = new Calculator();

// Basic operations
const sum = calc.add(5, 3); // 8
const difference = calc.subtract(10, 4); // 6
const product = calc.multiply(7, 6); // 42
const quotient = calc.divide(15, 3); // 5

// Advanced operations
const power = calc.power(2, 8); // 256
const root = calc.sqrt(16); // 4
const fact = calc.factorial(5); // 120
const percent = calc.percentage(25, 100); // 25

// Fibonacci
const fibNum = calc.fibonacci(10); // 55
const fibSeq = calc.fibonacciSequence(8); // [0, 1, 1, 2, 3, 5, 8, 13]

// Chained calculations
const result = calc.chain(10).add(5).multiply(2).subtract(3).equals(); // 27
```

## HashTable Data Structure

### Overview
The HashTable implementation provides an efficient key-value store with two collision resolution strategies: chaining and open addressing with double hashing.

### Implementation Details

#### Constructor
```javascript
new HashTable(size, collisionStrategy)
```
- `size` (number, optional): Initial size of the hash table (default: 53)
- `collisionStrategy` (string): Collision handling strategy ('chaining' or 'openAddressing')

#### Core Methods
- `set(key, value)`: Inserts or updates a key-value pair
- `get(key)`: Retrieves the value associated with a key
- `delete(key)`: Removes a key-value pair
- `has(key)`: Checks if a key exists in the table
- `clear()`: Removes all key-value pairs

#### Utility Methods
- `keys()`: Returns an array of all keys
- `values()`: Returns an array of all values
- `entries()`: Returns an array of all key-value pairs
- `getSize()`: Returns the number of stored elements
- `isEmpty()`: Checks if the table is empty
- `getLoadFactor()`: Returns the current load factor

### Collision Resolution Strategies

#### Chaining
In chaining, each bucket stores an array of key-value pairs that hash to the same index. When a collision occurs, the new pair is simply appended to the bucket's array.

**Advantages:**
- Simple implementation
- No limit on number of elements
- Good cache performance for small chains

**Disadvantages:**
- Extra memory for pointers
- Potential for long chains degrading performance

#### Open Addressing with Double Hashing
In open addressing, all elements are stored directly in the hash table array. When a collision occurs, alternative slots are probed using a secondary hash function until an empty slot is found.

**Advantages:**
- Better cache performance
- No extra memory for pointers
- Easy iteration through elements

**Disadvantages:**
- Clustering issues
- Deletion complexity (requires tombstones)
- Table can become full

### Hash Functions

#### Primary Hash Function
For string keys: Uses polynomial rolling hash with prime multiplier
For numeric keys: Simple modulo operation

#### Secondary Hash Function (for double hashing)
Provides the step size for probing in open addressing strategy.

### Dynamic Resizing
The hash table automatically resizes when the load factor exceeds 0.75, doubling its capacity to maintain performance.

### Time Complexities
- Average Case: O(1) for insert, lookup, and delete
- Worst Case: O(n) when all elements collide to the same bucket
- Space Complexity: O(n)

### Usage Examples

```javascript
// Chaining strategy (default)
const hashTable = new HashTable(53, 'chaining');

hashTable.set('name', 'John');
hashTable.set('age', 30);
hashTable.set('city', 'New York');

console.log(hashTable.get('name')); // 'John'
console.log(hashTable.has('age')); // true
console.log(hashTable.getSize()); // 3

hashTable.delete('city');
console.log(hashTable.getSize()); // 2

// Open addressing strategy
const openAddrTable = new HashTable(53, 'openAddressing');
openAddrTable.set('key1', 'value1');
openAddrTable.set('key2', 'value2');

console.log(openAddrTable.keys()); // ['key1', 'key2']
console.log(openAddrTable.values()); // ['value1', 'value2']
```