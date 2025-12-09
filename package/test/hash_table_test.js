/**
 * Test file for the HashTable implementation
 */

const { HashTable } = require('../src/data_structures');

// Test chaining implementation
console.log('=== Testing HashTable with Chaining ===');
const htChaining = new HashTable(10, 'chaining');

// Test setting values
htChaining.set('name', 'John');
htChaining.set('age', 30);
htChaining.set('city', 'New York');
htChaining.set('occupation', 'Engineer');

console.log('Set values: name=John, age=30, city=New York, occupation=Engineer');

// Test getting values
console.log('Get name:', htChaining.get('name'));
console.log('Get age:', htChaining.get('age'));
console.log('Get city:', htChaining.get('city'));
console.log('Get occupation:', htChaining.get('occupation'));

// Test updating a value
htChaining.set('age', 31);
console.log('Updated age:', htChaining.get('age'));

// Test keys, values, and entries
console.log('Keys:', htChaining.keys());
console.log('Values:', htChaining.values());
console.log('Entries:', htChaining.entries());

// Test deletion
console.log('Delete city:', htChaining.delete('city'));
console.log('Get city after deletion:', htChaining.get('city'));
console.log('Keys after deletion:', htChaining.keys());

// Test size and load factor
console.log('Size:', htChaining.getSize());
console.log('Load factor:', htChaining.getLoadFactor());

// Test open addressing implementation
console.log('\n=== Testing HashTable with Open Addressing ===');
const htOpenAddr = new HashTable(20, 'openAddressing'); // Larger size to prevent resizing during initial insertions

// Test setting values
htOpenAddr.set('language', 'JavaScript');
htOpenAddr.set('framework', 'Node.js');
htOpenAddr.set('database', 'MongoDB');
htOpenAddr.set('tool', 'Git');

console.log('Set values: language=JavaScript, framework=Node.js, database=MongoDB, tool=Git');

// Test getting values
console.log('Get language:', htOpenAddr.get('language'));
console.log('Get framework:', htOpenAddr.get('framework'));
console.log('Get database:', htOpenAddr.get('database'));
console.log('Get tool:', htOpenAddr.get('tool'));

// Test updating a value
htOpenAddr.set('language', 'TypeScript');
console.log('Updated language:', htOpenAddr.get('language'));

// Test keys, values, and entries
console.log('Keys:', htOpenAddr.keys());
console.log('Values:', htOpenAddr.values());
console.log('Entries:', htOpenAddr.entries());

// Test deletion
console.log('Delete database:', htOpenAddr.delete('database'));
console.log('Get database after deletion:', htOpenAddr.get('database'));
console.log('Keys after deletion:', htOpenAddr.keys());

// Test size and load factor
console.log('Size:', htOpenAddr.getSize());
console.log('Load factor:', htOpenAddr.getLoadFactor());

// Test collision handling
console.log('\n=== Testing Collision Handling ===');
const htCollision = new HashTable(5, 'chaining'); // Small size to force collisions

// These keys should cause collisions with a small table
htCollision.set('key1', 'value1');
htCollision.set('key2', 'value2');
htCollision.set('key3', 'value3');
htCollision.set('key4', 'value4');
htCollision.set('key5', 'value5');
htCollision.set('key6', 'value6');

console.log('Added 6 values to a table of size 5');
console.log('All values:', htCollision.entries());
console.log('Size:', htCollision.getSize());

// Test has method
console.log('Has key1:', htCollision.has('key1'));
console.log('Has nonexistent_key:', htCollision.has('nonexistent_key'));

// Test clear method
console.log('Clearing hash table...');
htCollision.clear();
console.log('Size after clear:', htCollision.getSize());
console.log('Is empty:', htCollision.isEmpty());

// Test automatic resizing
console.log('\n=== Testing Automatic Resizing ===');
const htResize = new HashTable(4, 'chaining'); // Very small initial size
for (let i = 0; i < 10; i++) {
  htResize.set(`key${i}`, `value${i}`);
}
console.log('Added 10 values to a table with initial size 4');
console.log('Final size:', htResize.getSize());
console.log('Load factor:', htResize.getLoadFactor());
console.log('Table size:', htResize.size);