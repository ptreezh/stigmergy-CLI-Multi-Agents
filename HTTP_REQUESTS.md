# HTTP Request Handling Documentation

## Overview

The Stigmergy CLI includes a `RESTClient` class in `src/utils.js` for handling HTTP requests. This class provides a simple interface for making REST API calls with support for various HTTP methods, automatic JSON parsing, and error handling.

## RESTClient Class

### Constructor

```javascript
new RESTClient(baseURL, defaultHeaders)
```

**Parameters:**
- `baseURL` (string): The base URL for the API (optional, defaults to empty string)
- `defaultHeaders` (Object): Default headers to include in all requests (optional)

**Example:**
```javascript
const client = new RESTClient('https://api.example.com', {
  'Authorization': 'Bearer token123'
});
```

### Methods

#### request()

Makes an HTTP request with the specified method.

```javascript
async request(method, url, options)
```

**Parameters:**
- `method` (string): HTTP method (GET, POST, PUT, DELETE, etc.)
- `url` (string): Request URL (will be appended to baseURL)
- `options` (Object): Request options including headers, body, etc.

**Returns:**
Promise that resolves to an object with:
- `status` (number): HTTP status code
- `statusText` (string): HTTP status text
- `headers` (Object): Response headers
- `data` (any): Parsed response data

**Throws:**
Error if the request fails or returns a non-success status code.

#### get()

Makes a GET request.

```javascript
async get(url, options)
```

**Parameters:**
- `url` (string): Request URL
- `options` (Object): Request options

**Returns:**
Promise that resolves to the response object.

#### post()

Makes a POST request.

```javascript
async post(url, data, options)
```

**Parameters:**
- `url` (string): Request URL
- `data` (Object): Request body data
- `options` (Object): Request options

**Returns:**
Promise that resolves to the response object.

#### put()

Makes a PUT request.

```javascript
async put(url, data, options)
```

**Parameters:**
- `url` (string): Request URL
- `data` (Object): Request body data
- `options` (Object): Request options

**Returns:**
Promise that resolves to the response object.

#### delete()

Makes a DELETE request.

```javascript
async delete(url, options)
```

**Parameters:**
- `url` (string): Request URL
- `options` (Object): Request options

**Returns:**
Promise that resolves to the response object.

## Usage Examples

### Basic GET Request

```javascript
const client = new RESTClient('https://jsonplaceholder.typicode.com');

try {
  const response = await client.get('/posts/1');
  console.log(response.data);
} catch (error) {
  console.error('Request failed:', error.message);
}
```

### POST Request with JSON Data

```javascript
const client = new RESTClient('https://jsonplaceholder.typicode.com');

try {
  const postData = {
    title: 'New Post',
    body: 'This is the post content',
    userId: 1
  };
  
  const response = await client.post('/posts', postData);
  console.log('Created post:', response.data);
} catch (error) {
  console.error('Failed to create post:', error.message);
}
```

### Request with Custom Headers

```javascript
const client = new RESTClient('https://api.example.com', {
  'Authorization': 'Bearer your-token-here'
});

// Headers can also be overridden per request
const response = await client.get('/protected-resource', {
  headers: {
    'X-Custom-Header': 'custom-value'
  }
});
```

## Features

1. **Automatic JSON Parsing**: Automatically parses JSON responses when the content-type is `application/json`
2. **Error Handling**: Throws errors for non-success status codes (4xx, 5xx)
3. **Flexible Configuration**: Supports default headers and base URLs
4. **Multiple HTTP Methods**: Supports GET, POST, PUT, DELETE, and custom HTTP methods
5. **Body Serialization**: Automatically serializes JSON request bodies

## Error Handling

All methods will throw an error if:
1. The HTTP request fails (network error, timeout, etc.)
2. The response has a non-success status code (4xx or 5xx)

Error messages include the HTTP status code and status text when available.