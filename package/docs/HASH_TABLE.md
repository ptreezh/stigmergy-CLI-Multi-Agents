# Hash Table Data Structure

## Overview

This project includes a HashTable implementation with collision handling using chaining. The implementation is part of the utility functions in `src/utils.js`.

## Features

- **Hash Function**: Uses a prime-based hashing algorithm for better distribution
- **Collision Handling**: Implements chaining to handle hash collisions
- **Key Operations**: 
  - `set(key, value)`: Insert a key-value pair
  - `get(key)`: Retrieve a value by key
  - `keys()`: Get all keys in the hash table
  - `values()`: Get all values in the hash table

## Implementation Details

### Hash Function

The hash function uses a prime number (31) to reduce collisions:

```javascript
_hash(key) {
  let total = 0;
  const WEIRD_PRIME = 31;
  for (let i = 0; i < Math.min(key.length, 100); i++) {
    const char = key[i];
    const value = char.charCodeAt(0) - 96;
    total = (total * WEIRD_PRIME + value) % this.keyMap.length;
  }
  return total;
}
```

### Collision Handling

Collisions are handled using chaining - when two keys hash to the same index, they are stored in an array at that index:

```javascript
set(key, value) {
  const index = this._hash(key);
  if (!this.keyMap[index]) {
    this.keyMap[index] = [];
  }
  this.keyMap[index].push([key, value]);
  return this;
}
```

## Usage

```javascript
const { HashTable } = require('./src/utils');

// Create a new hash table
const ht = new HashTable(17);

// Set key-value pairs
ht.set("maroon", "#800000");
ht.set("yellow", "#FFFF00");

// Get values
console.log(ht.get("maroon")); // #800000

// Get all keys/values
console.log(ht.keys());
console.log(ht.values());
```

## Time Complexity

- **Insertion**: O(1) average case, O(n) worst case
- **Lookup**: O(1) average case, O(n) worst case
- **Deletion**: O(1) average case, O(n) worst case

The worst case occurs when all elements hash to the same index, creating a single long chain.

## Test Files

- `test/hash-table-test.js`: Basic functionality tests
- `test/collision-test.js`: Collision handling demonstration
- `test/hash-table-demo.js`: Comprehensive usage example