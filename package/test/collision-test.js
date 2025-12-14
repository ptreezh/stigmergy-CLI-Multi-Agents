const { HashTable } = require('../src/utils');

console.log("=== Hash Table Collision Handling Demo ===");

// Create a hash table with a small size to force collisions
const ht = new HashTable(4); // Small size to demonstrate collisions

// Add several key-value pairs that will cause collisions
ht.set("key1", "value1");
ht.set("key2", "value2");
ht.set("key3", "value3");
ht.set("key4", "value4");
ht.set("key5", "value5"); // This will collide with one of the above

console.log("Values retrieved:");
console.log("key1:", ht.get("key1"));
console.log("key2:", ht.get("key2"));
console.log("key3:", ht.get("key3"));
console.log("key4:", ht.get("key4"));
console.log("key5:", ht.get("key5"));
console.log("nonexistent_key:", ht.get("nonexistent_key"));

console.log("\nAll keys:", ht.keys());
console.log("All values:", ht.values());

console.log("\n=== Test completed successfully! ===");
