const { processCSV } = require('../src/utils');

// Test basic CSV processing
console.log('Testing basic CSV processing...');

const csvData = `name,age,city
John,25,New York
Jane,30,Boston
Bob,35,Chicago
Alice,28,Los Angeles`;

const stats = processCSV(csvData);
console.log('Basic CSV Stats:', JSON.stringify(stats, null, 2));

// Test CSV without headers
console.log('\nTesting CSV without headers...');

const csvWithoutHeaders = `John,25,New York
Jane,30,Boston
Bob,35,Chicago`;

const statsNoHeaders = processCSV(csvWithoutHeaders, { hasHeader: false });
console.log('CSV without headers Stats:', JSON.stringify(statsNoHeaders, null, 2));

// Test CSV with numeric data
console.log('\nTesting CSV with numeric data...');

const csvNumeric = `product,price,quantity
Apple,1.20,100
Banana,0.50,200
Orange,0.80,150`;

const statsNumeric = processCSV(csvNumeric);
console.log('Numeric CSV Stats:', JSON.stringify(statsNumeric, null, 2));

console.log('\nCSV processing tests completed successfully!');
