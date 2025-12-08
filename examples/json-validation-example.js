// Example usage of parseAndValidateJSON function

const { parseAndValidateJSON } = require('../src/utils');

// Example 1: Basic JSON parsing
console.log('=== Example 1: Basic JSON Parsing ===');
try {
  const jsonData = '{"name": "Alice", "age": 25, "city": "New York"}';
  const parsed = parseAndValidateJSON(jsonData);
  console.log('Parsed data:', parsed);
} catch (error) {
  console.error('Error:', error.message);
}

// Example 2: JSON parsing with schema validation
console.log('\n=== Example 2: JSON Parsing with Schema Validation ===');
try {
  const jsonData = '{"id": 123, "name": "Bob", "email": "bob@example.com", "active": true}';
  
  // Define a schema for validation
  const userSchema = {
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string' },
      active: { type: 'boolean' }
    }
  };
  
  const validatedData = parseAndValidateJSON(jsonData, userSchema);
  console.log('Validated data:', validatedData);
} catch (error) {
  console.error('Error:', error.message);
}

// Example 3: Handling invalid JSON
console.log('\n=== Example 3: Handling Invalid JSON ===');
try {
  const invalidJson = '{"name": "Charlie", "age":}';
  const result = parseAndValidateJSON(invalidJson);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
}

// Example 4: Handling schema validation errors
console.log('\n=== Example 4: Handling Schema Validation Errors ===');
try {
  const jsonData = '{"name": "David", "age": "thirty"}'; // age should be a number
  
  const schema = {
    required: ['name', 'age'],
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
  };
  
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
}