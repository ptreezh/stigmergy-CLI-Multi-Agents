/**
 * Test file for the JavaScript authentication module.
 */

const { UserAuthenticator, AuthenticationError, authenticateAndGetToken } = require('./src/auth');

/**
 * Test the authentication functionality.
 * @returns {boolean} True if all tests pass, false otherwise
 */
function testAuthentication() {
  console.log('Testing authentication module...');
  
  // Create an authenticator instance
  const auth = new UserAuthenticator();
  
  // Test user registration
  console.log('1. Testing user registration...');
  try {
    const success = auth.registerUser('testuser', 'securepassword123');
    if (!success) {
      console.log('   FAIL: User registration should succeed');
      return false;
    }
    console.log('   PASS: User registered successfully');
  } catch (error) {
    console.log(`   FAIL: Registration failed: ${error.message}`);
    return false;
  }
  
  // Test duplicate user registration
  console.log('2. Testing duplicate user registration...');
  try {
    const success = auth.registerUser('testuser', 'anotherpassword');
    if (success) {
      console.log('   FAIL: Duplicate registration should fail');
      return false;
    }
    console.log('   PASS: Duplicate registration correctly rejected');
  } catch (error) {
    console.log(`   FAIL: Unexpected error in duplicate registration: ${error.message}`);
    return false;
  }
  
  // Test user authentication
  console.log('3. Testing user authentication...');
  try {
    const token = auth.authenticateUser('testuser', 'securepassword123');
    if (typeof token !== 'string' || token.length === 0) {
      console.log('   FAIL: Should return a valid token');
      return false;
    }
    console.log('   PASS: Authentication successful');
  } catch (error) {
    console.log(`   FAIL: Authentication failed: ${error.message}`);
    return false;
  }
  
  // Test invalid credentials
  console.log('4. Testing invalid credentials...');
  try {
    auth.authenticateUser('testuser', 'wrongpassword');
    console.log('   FAIL: Should have failed with wrong password');
    return false;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('   PASS: Correctly rejected wrong password');
    } else {
      console.log(`   FAIL: Unexpected error: ${error.message}`);
      return false;
    }
  }
  
  // Test session validation
  console.log('5. Testing session validation...');
  try {
    const token = auth.authenticateUser('testuser', 'securepassword123');
    const username = auth.validateSession(token);
    if (username !== 'testuser') {
      console.log('   FAIL: Session should be valid for the user');
      return false;
    }
    console.log('   PASS: Session validation successful');
  } catch (error) {
    console.log(`   FAIL: Session validation failed: ${error.message}`);
    return false;
  }
  
  // Test logout
  console.log('6. Testing logout...');
  try {
    const token = auth.authenticateUser('testuser', 'securepassword123');
    const success = auth.logout(token);
    if (!success) {
      console.log('   FAIL: Logout should succeed');
      return false;
    }
    // Verify session is no longer valid
    const username = auth.validateSession(token);
    if (username !== null) {
      console.log('   FAIL: Session should be invalid after logout');
      return false;
    }
    console.log('   PASS: Logout successful');
  } catch (error) {
    console.log(`   FAIL: Logout failed: ${error.message}`);
    return false;
  }
  
  console.log('\nAll tests passed!');
  return true;
}

/**
 * Demonstrate the authentication module usage.
 */
function exampleUsage() {
  console.log('Authentication Module Usage Example');
  console.log('===================================');
  
  // Create an authenticator instance
  const auth = new UserAuthenticator();
  
  // Register a new user
  console.log('\n1. Registering a new user...');
  try {
    const success = auth.registerUser('alice', 'mypassword123');
    if (success) {
      console.log('   User \'alice\' registered successfully');
    } else {
      console.log('   Failed to register user \'alice\' (may already exist)');
    }
  } catch (error) {
    console.log(`   Registration error: ${error.message}`);
    return;
  }
  
  // Authenticate the user
  console.log('\n2. Authenticating the user...');
  const [success, result] = authenticateAndGetToken(auth, 'alice', 'mypassword123');
  
  let sessionToken;
  if (success) {
    sessionToken = result;
    console.log('   Authentication successful!');
    console.log(`   Session token: ${sessionToken}`);
  } else {
    console.log(`   Authentication failed: ${result}`);
    return;
  }
  
  // Validate the session
  console.log('\n3. Validating the session...');
  const username = auth.validateSession(sessionToken);
  if (username) {
    console.log(`   Session is valid for user: ${username}`);
  } else {
    console.log('   Invalid session');
  }
  
  // Attempt to authenticate with wrong password
  console.log('\n4. Attempting authentication with wrong password...');
  try {
    auth.authenticateUser('alice', 'wrongpassword');
    console.log('   ERROR: Should not have succeeded!');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('   Correctly rejected wrong password');
    }
  }
  
  // Logout
  console.log('\n5. Logging out...');
  const logoutSuccess = auth.logout(sessionToken);
  if (logoutSuccess) {
    console.log('   Logout successful');
  } else {
    console.log('   Logout failed');
  }
  
  // Try to validate session after logout
  console.log('\n6. Checking session after logout...');
  const usernameAfterLogout = auth.validateSession(sessionToken);
  if (usernameAfterLogout === null) {
    console.log('   Session correctly invalidated after logout');
  } else {
    console.log('   ERROR: Session still valid after logout');
  }
  
  console.log('\nExample completed successfully!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  // First run the tests
  const testsPassed = testAuthentication();
  
  if (testsPassed) {
    console.log('\n' + '='.repeat(50));
    // Then show example usage
    exampleUsage();
  } else {
    process.exit(1);
  }
}

module.exports = { testAuthentication, exampleUsage };