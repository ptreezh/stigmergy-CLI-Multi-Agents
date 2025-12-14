const { RESTClient } = require('../src/utils');

async function testRESTClient() {
  console.log('Testing REST API Client...\n');
  
  // Test with a public API
  const client = new RESTClient('https://jsonplaceholder.typicode.com');
  
  try {
    // Test GET request
    console.log('1. Testing GET request...');
    const getResponse = await client.get('/posts/1');
    console.log('GET Response Status:', getResponse.status);
    console.log('GET Response Data Title:', getResponse.data.title);
    console.log('-------------------\n');
    
    // Test POST request
    console.log('2. Testing POST request...');
    const postData = {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    };
    const postResponse = await client.post('/posts', postData);
    console.log('POST Response Status:', postResponse.status);
    console.log('POST Response Data ID:', postResponse.data.id);
    console.log('-------------------\n');
    
    // Test PUT request
    console.log('3. Testing PUT request...');
    const putData = {
      id: 1,
      title: 'Updated Post',
      body: 'This post has been updated',
      userId: 1
    };
    const putResponse = await client.put('/posts/1', putData);
    console.log('PUT Response Status:', putResponse.status);
    console.log('PUT Response Data Title:', putResponse.data.title);
    console.log('-------------------\n');
    
    // Test DELETE request
    console.log('4. Testing DELETE request...');
    const deleteResponse = await client.delete('/posts/1');
    console.log('DELETE Response Status:', deleteResponse.status);
    console.log('DELETE Request completed successfully');
    console.log('-------------------\n');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testRESTClient();
