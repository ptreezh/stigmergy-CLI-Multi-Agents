const { parseAndValidateJSON } = require('../src/utils');

// Test cases for the JSON parser and validator

console.log('Testing JSON Parser and Validator...\n');

// Test 1: Valid JSON without schema
try {
  const jsonData = '{"name": "John", "age": 30, "city": "New York"}';
  const result = parseAndValidateJSON(jsonData);
  console.log('Test 1 - Parse valid JSON without schema: PASSED');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 1 - Parse valid JSON without schema: FAILED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 2: Invalid JSON
try {
  const invalidJson = '{"name": "John", "age": 30, "city": "New York"'; // Missing closing brace
  const result = parseAndValidateJSON(invalidJson);
  console.log('Test 2 - Parse invalid JSON: FAILED (should have thrown error)');
} catch (error) {
  console.log('Test 2 - Parse invalid JSON: PASSED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 3: Valid JSON with schema validation
try {
  const jsonData = '{"name": "John", "age": 30, "email": "john@example.com"}';
  const schema = {
    required: ["name", "age"],
    properties: {
      name: { type: "string" },
      age: { type: "number", minimum: 0, maximum: 120 },
      email: { type: "string" }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 3 - Valid JSON with schema: PASSED');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 3 - Valid JSON with schema: FAILED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 4: Valid JSON with schema validation - missing required field
try {
  const jsonData = '{"name": "John", "email": "john@example.com"}'; // Missing age
  const schema = {
    required: ["name", "age"],
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      email: { type: "string" }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 4 - Missing required field: FAILED (should have thrown error)');
} catch (error) {
  console.log('Test 4 - Missing required field: PASSED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 5: Valid JSON with schema validation - wrong data type
try {
  const jsonData = '{"name": "John", "age": "thirty", "email": "john@example.com"}'; // Age is string instead of number
  const schema = {
    required: ["name", "age"],
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      email: { type: "string" }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 5 - Wrong data type: FAILED (should have thrown error)');
} catch (error) {
  console.log('Test 5 - Wrong data type: PASSED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 6: Valid JSON with schema validation - number out of range
try {
  const jsonData = '{"name": "John", "age": 150, "email": "john@example.com"}'; // Age > 120
  const schema = {
    required: ["name", "age"],
    properties: {
      name: { type: "string" },
      age: { type: "number", minimum: 0, maximum: 120 },
      email: { type: "string" }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 6 - Number out of range: FAILED (should have thrown error)');
} catch (error) {
  console.log('Test 6 - Number out of range: PASSED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 7: Valid JSON with array validation
try {
  const jsonData = '{"name": "John", "hobbies": ["reading", "swimming", "coding"]}';
  const schema = {
    required: ["name"],
    properties: {
      name: { type: "string" },
      hobbies: { 
        type: "array", 
        items: { type: "string" },
        minItems: 1,
        maxItems: 5
      }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 7 - Array validation: PASSED');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 7 - Array validation: FAILED');
  console.log('Error:', error.message);
}

console.log('\n---\n');

// Test 8: Nested object validation
try {
  const jsonData = '{"name": "John", "address": {"street": "123 Main St", "city": "New York"}}';
  const schema = {
    required: ["name"],
    properties: {
      name: { type: "string" },
      address: { 
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" }
        },
        required: ["street", "city"]
      }
    }
  };
  const result = parseAndValidateJSON(jsonData, schema);
  console.log('Test 8 - Nested object validation: PASSED');
  console.log('Result:', result);
} catch (error) {
  console.log('Test 8 - Nested object validation: FAILED');
  console.log('Error:', error.message);
}
