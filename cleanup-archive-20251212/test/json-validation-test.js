const { parseAndValidateJSON } = require('../src/utils');

// Test cases for parseAndValidateJSON function
console.log('Testing parseAndValidateJSON function...\n');

// Test 1: Valid JSON without schema
try {
  const jsonData = '{"name": "John", "age": 30}';
  const result = parseAndValidateJSON(jsonData);
  console.log('Test 1 passed: Valid JSON parsed successfully');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 1 failed:', error.message);
}

console.log();

// Test 2: Invalid JSON
try {
  const invalidJson = '{"name": "John", "age":}';
  const result = parseAndValidateJSON(invalidJson);
  console.log('Test 2 failed: Should have thrown an error');
} catch (error) {
  console.log('Test 2 passed: Correctly rejected invalid JSON');
  console.log('Error:', error.message);
}

console.log();

// Test 3: Valid JSON with schema validation
try {
  const jsonData = '{"name": "John", "age": 30, "active": true}';
  const schema = {
    required: ['name', 'age'],
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 3 passed: Valid JSON with schema validation');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 3 failed:', error.message);
}

console.log();

// Test 4: Missing required field
try {
  const jsonData = '{"name": "John"}';
  const schema = {
    required: ['name', 'age'],
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 4 failed: Should have thrown an error for missing required field');
} catch (error) {
  console.log('Test 4 passed: Correctly rejected missing required field');
  console.log('Error:', error.message);
}

console.log();

// Test 5: Wrong data type
try {
  const jsonData = '{"name": "John", "age": "thirty"}';
  const schema = {
    required: ['name', 'age'],
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 5 failed: Should have thrown an error for wrong data type');
} catch (error) {
  console.log('Test 5 passed: Correctly rejected wrong data type');
  console.log('Error:', error.message);
}

console.log();

// Test 6: Enum validation
try {
  const jsonData = '{"status": "active"}';
  const schema = {
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['active', 'inactive', 'pending'] }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 6 passed: Valid enum value accepted');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 6 failed:', error.message);
}

console.log();

// Test 7: Invalid enum value
try {
  const jsonData = '{"status": "deleted"}';
  const schema = {
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['active', 'inactive', 'pending'] }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 7 failed: Should have thrown an error for invalid enum value');
} catch (error) {
  console.log('Test 7 passed: Correctly rejected invalid enum value');
  console.log('Error:', error.message);
}

console.log();

// Test 8: Array validation
try {
  const jsonData = '{"tags": ["javascript", "nodejs"]}';
  const schema = {
    required: ['tags'],
    properties: {
      tags: { 
        type: 'array',
        items: { type: 'string' }
      }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 8 passed: Valid array accepted');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 8 failed:', error.message);
}

console.log();

// Test 9: Invalid array items
try {
  const jsonData = '{"tags": ["javascript", 123]}';
  const schema = {
    required: ['tags'],
    properties: {
      tags: { 
        type: 'array',
        items: { type: 'string' }
      }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 9 failed: Should have thrown an error for invalid array items');
} catch (error) {
  console.log('Test 9 passed: Correctly rejected invalid array items');
  console.log('Error:', error.message);
}

console.log('\nAll tests completed!');
