/**
 * Example usage of the parseAndValidateJSON function
 */

const { parseAndValidateJSON } = require('../src/utils');

// Example 1: Simple JSON parsing without validation
console.log('=== Example 1: Simple JSON parsing ===');
try {
  const jsonString = '{"name": "Alice", "age": 25, "city": "Boston"}';
  const data = parseAndValidateJSON(jsonString);
  console.log('Parsed data:', data);
} catch (error) {
  console.error('Error:', error.message);
}

// Example 2: JSON parsing with schema validation
console.log('\n=== Example 2: JSON parsing with schema validation ===');
try {
  const jsonString = '{"username": "bob", "email": "bob@example.com", "age": 30}';
  
  // Define a schema for validation
  const userSchema = {
    required: ["username", "email"],
    properties: {
      username: { 
        type: "string",
        minLength: 3,
        maxLength: 20
      },
      email: { 
        type: "string" 
      },
      age: { 
        type: "number", 
        minimum: 0, 
        maximum: 120 
      }
    }
  };
  
  const data = parseAndValidateJSON(jsonString, userSchema);
  console.log('Validated data:', data);
} catch (error) {
  console.error('Error:', error.message);
}

// Example 3: Handling validation errors
console.log('\n=== Example 3: Handling validation errors ===');
try {
  const invalidJsonString = '{"username": "c", "email": "charlie@", "age": -5}';
  
  const userSchema = {
    required: ["username", "email", "age"],
    properties: {
      username: { 
        type: "string",
        minLength: 3,  // This will fail since "c" has length 1
        maxLength: 20
      },
      email: { 
        type: "string" 
      },
      age: { 
        type: "number", 
        minimum: 0,  // This will fail since -5 < 0
        maximum: 120 
      }
    }
  };
  
  const data = parseAndValidateJSON(invalidJsonString, userSchema);
  console.log('Validated data:', data);
} catch (error) {
  console.error('Validation Error:', error.message);
}

// Example 4: Working with arrays and nested objects
console.log('\n=== Example 4: Arrays and nested objects ===');
try {
  const jsonString = `{
    "id": 1,
    "name": "Product A",
    "tags": ["electronics", "gadgets"],
    "metadata": {
      "createdBy": "admin",
      "createdAt": "2023-01-01"
    }
  }`;
  
  const productSchema = {
    required: ["id", "name"],
    properties: {
      id: { 
        type: "number" 
      },
      name: { 
        type: "string" 
      },
      tags: { 
        type: "array", 
        items: { type: "string" },
        minItems: 1
      },
      metadata: {
        type: "object",
        properties: {
          createdBy: { type: "string" },
          createdAt: { type: "string" }
        },
        required: ["createdBy", "createdAt"]
      }
    }
  };
  
  const data = parseAndValidateJSON(jsonString, productSchema);
  console.log('Complex validated data:', data);
} catch (error) {
  console.error('Error:', error.message);
}
