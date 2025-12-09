# JSON Parser and Validator

This module provides a robust JSON parsing and validation utility function that can validate JSON data against a schema.

## Features

- Parses JSON strings with detailed error reporting
- Validates JSON data against a schema with comprehensive validation rules
- Supports nested objects and arrays
- Provides detailed error messages for validation failures

## Installation

The function is part of the utils module in this project:

```javascript
const { parseAndValidateJSON } = require('./src/utils');
```

## Usage

### Basic Parsing

```javascript
const { parseAndValidateJSON } = require('./src/utils');

// Parse JSON without validation
const jsonString = '{"name": "John", "age": 30}';
const data = parseAndValidateJSON(jsonString);
console.log(data); // { name: 'John', age: 30 }
```

### Parsing with Schema Validation

```javascript
const jsonString = '{"username": "john_doe", "email": "john@example.com", "age": 25}';

const schema = {
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

try {
  const data = parseAndValidateJSON(jsonString, schema);
  console.log('Valid data:', data);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Schema Validation Rules

The schema validation supports the following rules:

- `required`: Array of required field names
- `properties`: Object defining property validation rules
- `type`: Data type (string, number, boolean, object, array)
- `enum`: Array of allowed values
- `minimum`/`maximum`: Numeric range limits
- `minLength`/`maxLength`: String length limits
- `minItems`/`maxItems`: Array size limits
- `nullable`: Allow null values when set to true
- `items`: Schema for array items
- Nested object validation through recursive schema definitions

## Examples

See `examples/json-parser-example.js` for comprehensive usage examples.

## Testing

Run the tests with:

```bash
node test/json-parser-test.js
```

## Error Handling

The function throws descriptive errors for:

- Invalid JSON syntax
- Missing required fields
- Type mismatches
- Value out of range
- String length violations
- Array size violations
- Enum value violations