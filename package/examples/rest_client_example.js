/**
 * Example usage of the REST Client
 */

const RestClient = require('../src/core/rest_client');

async function example() {
  // Create a new REST client instance
  const client = new RestClient('https://jsonplaceholder.typicode.com');
  
  try {
    // Example 1: Simple GET request
    console.log('=== Example 1: GET Request ===');
    const posts = await client.get('/posts', { params: { _limit: 5 } });
    console.log(`Retrieved ${posts.data.length} posts`);
    console.log('First post title:', posts.data[0].title);
    
    // Example 2: POST request
    console.log('\n=== Example 2: POST Request ===');
    const newPost = {
      title: 'My New Post',
      body: 'This is the content of my new post',
      userId: 1
    };
    
    const createdPost = await client.post('/posts', newPost);
    console.log('Created post with ID:', createdPost.data.id);
    
    // Example 3: Setting authorization header
    console.log('\n=== Example 3: Using Authorization ===');
    client.setAuthorization('your-api-token-here');
    console.log('Authorization header set');
    
    // Example 4: Custom headers
    console.log('\n=== Example 4: Custom Headers ===');
    const clientWithHeaders = new RestClient('https://httpbin.org', {
      'X-Custom-Header': 'custom-value',
      'User-Agent': 'RestClient/1.0'
    });
    
    const headersResponse = await clientWithHeaders.get('/headers');
    console.log('Custom headers sent:', headersResponse.data.headers['X-Custom-Header']);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  example();
}

module.exports = example;
