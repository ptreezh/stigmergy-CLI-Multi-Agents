/**
 * Test for REST API Client
 */

const RestClient = require('../src/core/rest_client');

async function testRestClient() {
  console.log('Testing REST Client...\n');
  
  // Test 1: Basic GET request
  try {
    console.log('Test 1: Basic GET request to JSONPlaceholder');
    const client = new RestClient('https://jsonplaceholder.typicode.com');
    
    const response = await client.get('/posts/1');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('Success!\n');
  } catch (error) {
    console.error('Test 1 failed:', error.message, '\n');
  }
  
  // Test 2: POST request
  try {
    console.log('Test 2: POST request to JSONPlaceholder');
    const client = new RestClient('https://jsonplaceholder.typicode.com');
    
    const postData = {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    };
    
    const response = await client.post('/posts', postData);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('Success!\n');
  } catch (error) {
    console.error('Test 2 failed:', error.message, '\n');
  }
  
  // Test 3: With custom headers
  try {
    console.log('Test 3: GET request with custom headers');
    const client = new RestClient('https://jsonplaceholder.typicode.com');
    client.setDefaultHeaders({
      'Custom-Header': 'test-value',
      'X-Test-Header': 'another-test'
    });
    
    const response = await client.get('/posts/2');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Success!\n');
  } catch (error) {
    console.error('Test 3 failed:', error.message, '\n');
  }
  
  // Test 4: With query parameters
  try {
    console.log('Test 4: GET request with query parameters');
    const client = new RestClient('https://jsonplaceholder.typicode.com');
    
    const response = await client.get('/posts', {
      params: {
        userId: 1,
        _limit: 3
      }
    });
    console.log('Status:', response.status);
    console.log('Data count:', response.data.length);
    console.log('Success!\n');
  } catch (error) {
    console.error('Test 4 failed:', error.message, '\n');
  }
  
  console.log('REST Client tests completed.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRestClient();
}

module.exports = testRestClient;