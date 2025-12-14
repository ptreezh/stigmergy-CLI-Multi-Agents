// Example usage of the RESTClient class

const { RESTClient } = require('../src/utils');

// Create a new REST client instance
const client = new RESTClient('https://jsonplaceholder.typicode.com');

// Example 1: GET request
async function getPost() {
  try {
    const response = await client.get('/posts/1');
    console.log('Post Title:', response.data.title);
  } catch (error) {
    console.error('Error fetching post:', error.message);
  }
}

// Example 2: POST request
async function createPost() {
  try {
    const newPost = {
      title: 'My New Post',
      body: 'This is the content of my new post',
      userId: 1
    };
    
    const response = await client.post('/posts', newPost);
    console.log('Created Post ID:', response.data.id);
  } catch (error) {
    console.error('Error creating post:', error.message);
  }
}

// Example 3: Using custom headers
async function getRequestWithHeaders() {
  try {
    const clientWithAuth = new RESTClient('https://jsonplaceholder.typicode.com', {
      'Authorization': 'Bearer your-token-here',
      'X-Custom-Header': 'custom-value'
    });
    
    const response = await clientWithAuth.get('/users/1');
    console.log('User Name:', response.data.name);
  } catch (error) {
    console.error('Error fetching user:', error.message);
  }
}

// Run the examples
getPost();
createPost();
getRequestWithHeaders();
