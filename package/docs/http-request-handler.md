# HTTP Request Handler Documentation

This document provides comprehensive documentation for the HTTP request handling functionality implemented in the Stigmergy CLI system.

## Overview

The HTTP request handler is implemented as a `RestClient` class that provides a simple interface for making HTTP requests to REST APIs. It supports common HTTP methods (GET, POST, PUT, PATCH, DELETE) and includes features for handling headers, query parameters, and request bodies.

## Class: RestClient

### Constructor

```javascript
new RestClient(baseURL, defaultHeaders)
```

Creates a new REST client instance.

**Parameters:**
- `baseURL` (string): The base URL for all API requests. Defaults to an empty string.
- `defaultHeaders` (Object): Default headers to include in all requests. Defaults to `{ 'Content-Type': 'application/json' }`.

**Example:**
```javascript
const client = new RestClient('https://api.example.com');
const clientWithHeaders = new RestClient('https://api.example.com', {
  'Authorization': 'Bearer token',
  'User-Agent': 'MyApp/1.0'
});
```

### Methods

#### request()

```javascript
async request(method, url, options)
```

Makes an HTTP request with the specified method and options.

**Parameters:**
- `method` (string): HTTP method (GET, POST, PUT, PATCH, DELETE, etc.)
- `url` (string): Request URL (will be appended to baseURL)
- `options` (Object): Request options
  - `headers` (Object): Additional headers for this request
  - `body` (Object|string): Request body data
  - `params` (Object): Query parameters to append to the URL
  - `timeout` (number): Request timeout in milliseconds (default: 10000)

**Returns:**
Promise that resolves to an object with the following properties:
- `status` (number): HTTP status code
- `statusText` (string): HTTP status text
- `headers` (Object): Response headers
- `data` (Object|string): Response data (parsed as JSON if possible, otherwise as text)

**Throws:**
Error if the request fails or receives a non-2xx response.

**Example:**
```javascript
const response = await client.request('GET', '/users', {
  params: { page: 1, limit: 10 },
  headers: { 'X-Custom-Header': 'value' }
});
console.log(response.data);
```

#### get()

```javascript
async get(url, options)
```

Makes a GET request.

**Parameters:**
- `url` (string): Request URL
- `options` (Object): Request options (same as in `request()`)

**Returns:**
Promise that resolves to the response object.

**Example:**
```javascript
const users = await client.get('/users', { params: { active: true } });
```

#### post()

```javascript
async post(url, data, options)
```

Makes a POST request.

**Parameters:**
- `url` (string): Request URL
- `data` (Object): Data to send in request body
- `options` (Object): Request options (same as in `request()`)

**Returns:**
Promise that resolves to the response object.

**Example:**
```javascript
const newUser = await client.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

#### put()

```javascript
async put(url, data, options)
```

Makes a PUT request.

**Parameters:**
- `url` (string): Request URL
- `data` (Object): Data to send in request body
- `options` (Object): Request options (same as in `request()`)

**Returns:**
Promise that resolves to the response object.

**Example:**
```javascript
const updatedUser = await client.put('/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

#### patch()

```javascript
async patch(url, data, options)
```

Makes a PATCH request.

**Parameters:**
- `url` (string): Request URL
- `data` (Object): Data to send in request body
- `options` (Object): Request options (same as in `request()`)

**Returns:**
Promise that resolves to the response object.

**Example:**
```javascript
const partialUpdate = await client.patch('/users/123', {
  lastLogin: new Date().toISOString()
});
```

#### delete()

```javascript
async delete(url, options)
```

Makes a DELETE request.

**Parameters:**
- `url` (string): Request URL
- `options` (Object): Request options (same as in `request()`)

**Returns:**
Promise that resolves to the response object.

**Example:**
```javascript
await client.delete('/users/123');
```

#### setDefaultHeaders()

```javascript
setDefaultHeaders(headers)
```

Sets default headers to be included in all requests.

**Parameters:**
- `headers` (Object): Headers to set as default

**Example:**
```javascript
client.setDefaultHeaders({
  'Authorization': 'Bearer token',
  'X-API-Key': 'secret-key'
});
```

#### setAuthorization()

```javascript
setAuthorization(token, type)
```

Sets the Authorization header for all requests.

**Parameters:**
- `token` (string): Authorization token
- `type` (string): Authorization type (default: 'Bearer')

**Example:**
```javascript
client.setAuthorization('my-secret-token');
client.setAuthorization('username:password', 'Basic');
```

## Usage Examples

### Basic GET Request

```javascript
const RestClient = require('./src/core/rest_client');

const client = new RestClient('https://jsonplaceholder.typicode.com');

// Get a list of posts
const posts = await client.get('/posts', { params: { _limit: 5 } });
console.log(posts.data);
```

### Creating a Resource

```javascript
const newPost = {
  title: 'My New Post',
  body: 'This is the content',
  userId: 1
};

const createdPost = await client.post('/posts', newPost);
console.log('Created post with ID:', createdPost.data.id);
```

### Using Authentication

```javascript
// Set authorization header
client.setAuthorization('your-api-token-here');

// All subsequent requests will include the authorization header
const protectedData = await client.get('/protected-resource');
```

### Custom Headers

```javascript
const client = new RestClient('https://api.example.com', {
  'X-Custom-Header': 'custom-value',
  'User-Agent': 'MyApp/1.0'
});

const response = await client.get('/data');
```

## Error Handling

All methods will throw an Error if:
1. The HTTP request fails (network error, timeout, etc.)
2. The server responds with a non-2xx status code

Errors can be caught using try/catch blocks:

```javascript
try {
  const response = await client.get('/users');
  console.log(response.data);
} catch (error) {
  console.error('Request failed:', error.message);
  // Handle error appropriately
}
```

## Notes

1. The client automatically serializes JavaScript objects to JSON for request bodies when using POST, PUT, PATCH, or DELETE methods.
2. Response data is automatically parsed as JSON if the response has a `Content-Type` of `application/json`; otherwise, it's returned as text.
3. Query parameters are properly encoded using `URLSearchParams`.
4. Default timeout is 10 seconds but can be customized per request.