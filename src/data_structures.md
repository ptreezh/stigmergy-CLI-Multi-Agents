# HashTable Data Structure

This implementation provides a flexible HashTable data structure with two collision handling strategies:

1. **Chaining** - Stores colliding elements in linked lists (arrays in this implementation)
2. **Open Addressing** - Finds alternative slots within the table using double hashing

## Features

- Two collision handling strategies
- Automatic resizing when load factor exceeds threshold
- Support for both string and numeric keys
- Standard dictionary operations (set, get, delete, has)
- Utility methods (keys, values, entries, clear, size, isEmpty, loadFactor)
- Duplicate key handling (updates existing values)

## Usage

```javascript
const { HashTable } = require("./src/data_structures");

// Create a hash table with chaining (default)
const ht = new HashTable(53, "chaining");

// Create a hash table with open addressing
const ht2 = new HashTable(53, "openAddressing");

// Set key-value pairs
ht.set("name", "John");
ht.set("age", 30);

// Get values
console.log(ht.get("name")); // 'John'

// Check if key exists
console.log(ht.has("age")); // true

// Delete a key-value pair
ht.delete("name");

// Get all keys/values/entries
console.log(ht.keys());
console.log(ht.values());
console.log(ht.entries());

// Utility methods
console.log(ht.getSize());
console.log(ht.isEmpty());
console.log(ht.getLoadFactor());
```

## API

### Constructor

```javascript
new HashTable((size = 53), (collisionStrategy = "chaining"));
```

- `size`: Initial size of the hash table
- `collisionStrategy`: Either 'chaining' or 'openAddressing'

### Methods

- `set(key, value)` - Insert or update a key-value pair
- `get(key)` - Retrieve the value associated with a key
- `delete(key)` - Remove a key-value pair
- `has(key)` - Check if a key exists in the hash table
- `keys()` - Get all keys as an array
- `values()` - Get all values as an array
- `entries()` - Get all key-value pairs as an array of arrays
- `clear()` - Remove all key-value pairs
- `getSize()` - Get the number of key-value pairs
- `isEmpty()` - Check if the hash table is empty
- `getLoadFactor()` - Get the load factor (number of elements / table size)

## Collision Handling Strategies

### Chaining

When collisions occur, elements are stored in arrays (buckets) at the collision index. This is the default strategy as it's simpler and generally performs well.

### Open Addressing

When collisions occur, the algorithm probes for the next available slot using double hashing. This strategy stores all elements directly in the table array.

## Performance

- Average case: O(1) for set, get, delete operations
- Worst case: O(n) for set, get, delete operations (when many collisions occur)
- Space complexity: O(n)

The hash table automatically resizes when the load factor exceeds 0.75 to maintain performance.
