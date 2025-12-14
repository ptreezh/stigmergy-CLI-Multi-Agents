const { HashTable } = require('../src/utils');

// Test without linting issues
function runHashTableTests() {
  console.log('=== Hash Table Implementation Test ===');
  
  // Create a new hash table
  const ht = new HashTable(17);

  // Test setting values
  ht.set('maroon', '#800000');
  ht.set('yellow', '#FFFF00');
  ht.set('olive', '#808000');
  ht.set('salmon', '#FA8072');
  ht.set('lightcoral', '#F08080');
  ht.set('mediumvioletred', '#C71585');
  ht.set('plum', '#DDA0DD');

  // Test getting values
  console.log('Get maroon:', ht.get('maroon')); // #800000
  console.log('Get yellow:', ht.get('yellow')); // #FFFF00
  console.log('Get invalid:', ht.get('invalid')); // undefined

  // Test keys method
  console.log('Keys:', ht.keys()); 

  // Test values method
  console.log('Values:', ht.values());

  console.log('=== Hash Table tests completed successfully! ===');
}

runHashTableTests();
