# Stigmergy CLI Authentication Module

This module provides user authentication functionality for the Stigmergy CLI system, including secure password hashing, session management, and token-based authentication.

## Features

- Secure user registration with password validation
- Password hashing using PBKDF2 with SHA-256
- Session token generation and validation
- Persistent storage of user data and sessions
- CLI commands for authentication management

## Components

### `auth.js`

The core authentication module containing:

- `UserAuthenticator` class for managing users and sessions
- `AuthenticationError` custom exception class
- `authenticateAndGetToken` helper function

### `auth_command.js`

CLI command handlers for:

- User registration (`auth register`)
- User login (`auth login`)
- User logout (`auth logout`)
- Authentication status checking (`auth status`)

## Security Features

- Passwords are never stored in plain text
- PBKDF2 with 100,000 iterations for strong password hashing
- Random salt generation for each user
- Cryptographically secure session token generation
- Data persistence with file-based storage

## Usage

### Programmatic Usage

```javascript
const { UserAuthenticator } = require("./src/auth");

// Create authenticator instance
const auth = new UserAuthenticator();

// Register a new user
try {
  const success = auth.registerUser("alice", "securepassword123");
  if (success) {
    console.log("User registered successfully");
  }
} catch (error) {
  console.error("Registration failed:", error.message);
}

// Authenticate a user
try {
  const token = auth.authenticateUser("alice", "securepassword123");
  console.log("Authentication successful, token:", token);
} catch (error) {
  console.error("Authentication failed:", error.message);
}
```

### CLI Usage

After integration with the main CLI:

```bash
# Register a new user
stigmergy auth register alice securepassword123

# Login as a user
stigmergy auth login alice securepassword123

# Check authentication status
stigmergy auth status

# Logout
stigmergy auth logout
```

## API Reference

### UserAuthenticator

#### `new UserAuthenticator()`

Create a new authenticator instance.

#### `registerUser(username, password)`

Register a new user.

**Parameters:**

- `username` (string): The user's username (min. 3 characters)
- `password` (string): The user's password (min. 8 characters)

**Returns:** `boolean` - True if registration successful, false if username already exists

**Throws:** `Error` - If username or password is invalid

#### `authenticateUser(username, password)`

Authenticate a user with the provided credentials.

**Parameters:**

- `username` (string): The user's username
- `password` (string): The user's password

**Returns:** `string` - Session token if authentication is successful

**Throws:** `AuthenticationError` - If authentication fails

#### `validateSession(sessionToken)`

Validate a session token and return the associated username.

**Parameters:**

- `sessionToken` (string): The session token to validate

**Returns:** `string|null` - Username if session is valid, null otherwise

#### `logout(sessionToken)`

Invalidate a session token.

**Parameters:**

- `sessionToken` (string): The session token to invalidate

**Returns:** `boolean` - True if session was invalidated, false if token was not found

## Testing

Run the authentication tests:

```bash
node test_auth_js.js
```

## Integration

See `INTEGRATION_INSTRUCTIONS.md` for details on integrating the authentication commands into the main Stigmergy CLI.
