const { HashTable } = require('../src/utils');

// Create a new hash table
const ht = new HashTable(17);

// Test setting values
ht.set("maroon", "#800000");
ht.set("yellow", "#FFFF00");
ht.set("olive", "#808000");
ht.set("salmon", "#FA8072");
ht.set("lightcoral", "#F08080");
ht.set("mediumvioletred", "#C71585");
ht.set("plum", "#DDA0DD");

// Test getting values
console.log(ht.get("maroon")); // #800000
console.log(ht.get("yellow")); // #FFFF00
console.log(ht.get("invalid")); // undefined

// Test keys method
console.log(ht.keys()); 

// Test values method
console.log(ht.values());

console.log("Hash table tests completed successfully!");