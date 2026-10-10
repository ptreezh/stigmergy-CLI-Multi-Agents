# REST Client Documentation

The REST Client is a simple, promise-based HTTP client for making requests to REST APIs. It provides methods for all common HTTP verbs and handles JSON serialization/deserialization automatically.

## Installation

The REST Client is part of the Stigmergy CLI project and is available at `src/core/rest_client.js`.

## Usage

### Importing the Client

```javascript
const RestClient = require('./src/core/rest_client');
```

### Creating an Instance

```javascript
// Create a client with a base URL
const client = new RestClient('https://api.example.com');

// Create a client with default headers
const client = new RestClient('https://api.example.com', {
  'Authorization': 'Bearer your-token',
  'Content-Type': 'application/json'
});
```

### Making Requests

#### GET Requests

```javascript
// Simple GET request
const response = await client.get('/users');

// GET request with query parameters
const response = await client.get('/users', {
  params: {
    page: 1,
    limit: 10
  }
});

// GET request with custom headers
const response = await client.get('/users', {
  headers: {
    'X-API-Key': 'your-key'
  }
});
```

#### POST Requests

```javascript
// POST request with JSON data
const userData = {
  name: 'John Doe',
  email: 'john@example.com'
};

const response = await client.post('/users', userData);

// POST request with custom headers
const response = await client.post('/users', userData, {
  headers: {
    'X-API-Key': 'your-key'
  }
});
```

#### PUT and PATCH Requests

```javascript
// PUT request
const response = await client.put('/users/123', updatedUserData);

// PATCH request
const response = await client.patch('/users/123', partialUpdateData);
```

#### DELETE Requests

```javascript
// DELETE request
const response = await client.delete('/users/123');
```

### Setting Default Headers

```javascript
// Set default headers for all requests
client.setDefaultHeaders({
  'Authorization': 'Bearer your-token',
  'X-API-Key': 'your-key'
});

// Set authorization header specifically
client.setAuthorization('your-token'); // Defaults to Bearer
client.setAuthorization('your-token', 'Basic'); // Specify token type
```

### Response Format

All methods return a Promise that resolves to a response object with the following structure:

```javascript
{
  status: 200,           // HTTP status code
  statusText: 'OK',      // HTTP status text
  headers: {},           // Response headers
  data: {}               // Response data (parsed JSON or text)
}
```

### Error Handling

Errors are thrown as JavaScript Error objects with descriptive messages:

```javascript
try {
  const response = await client.get('/users');
  console.log(response.data);
} catch (error) {
  console.error('Request failed:', error.message);
}
```

## Examples

See `examples/rest_client_example.js` for complete usage examples.

## Running Tests

```bash
npm run test:rest-client
```

## Running Examples

```bash
npm run example:rest-client
```