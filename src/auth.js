/**
 * Authentication module for the Stigmergy CLI system.
 * Provides user authentication functionality including password hashing and token management.
 */

const crypto = require("crypto");

/**
 * Custom exception for authentication failures.
 */
class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Handles user authentication operations including registration, login, and session management.
 */
class UserAuthenticator {
  /**
   * Create a new UserAuthenticator instance.
   */
  constructor() {
    // In production, this would be stored in a secure database
    this._users = new Map();
    this._sessions = new Map();
  }

  /**
   * Register a new user with the provided username and password.
   *
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {boolean} True if registration successful, false if username already exists
   * @throws {Error} If username or password is invalid
   */
  registerUser(username, password) {
    if (!username || !password) {
      throw new Error("Username and password cannot be empty");
    }

    if (username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (this._users.has(username)) {
      return false;
    }

    // Hash the password with a salt
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = this._hashPassword(password, salt);

    this._users.set(username, {
      passwordHash: passwordHash,
      salt: salt,
    });

    return true;
  }

  /**
   * Authenticate a user with the provided credentials.
   *
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {string} Session token if authentication is successful
   * @throws {AuthenticationError} If authentication fails
   */
  authenticateUser(username, password) {
    if (!this._users.has(username)) {
      throw new AuthenticationError("Invalid username or password");
    }

    const userData = this._users.get(username);
    const passwordHash = this._hashPassword(password, userData.salt);

    if (passwordHash !== userData.passwordHash) {
      throw new AuthenticationError("Invalid username or password");
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("base64url");
    this._sessions.set(sessionToken, {
      username: username,
      createdAt: Date.now(),
    });

    return sessionToken;
  }

  /**
   * Validate a session token and return the associated username.
   *
   * @param {string} sessionToken - The session token to validate
   * @returns {string|null} Username if session is valid, null otherwise
   */
  validateSession(sessionToken) {
    if (!this._sessions.has(sessionToken)) {
      return null;
    }

    // In production, you would check session expiration here
    return this._sessions.get(sessionToken).username;
  }

  /**
   * Invalidate a session token.
   *
   * @param {string} sessionToken - The session token to invalidate
   * @returns {boolean} True if session was invalidated, false if token was not found
   */
  logout(sessionToken) {
    if (this._sessions.has(sessionToken)) {
      this._sessions.delete(sessionToken);
      return true;
    }
    return false;
  }

  /**
   * Hash a password with the provided salt using PBKDF2.
   *
   * @param {string} password - The password to hash
   * @param {string} salt - The salt to use for hashing
   * @returns {string} The hashed password
   * @private
   */
  _hashPassword(password, salt) {
    return crypto
      .pbkdf2Sync(
        password,
        salt,
        100000, // iterations
        32, // key length
        "sha256", // digest
      )
      .toString("hex");
  }
}

/**
 * Helper function to authenticate a user and return a session token.
 *
 * @param {UserAuthenticator} authenticator - The authenticator instance
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * @returns {[boolean, string]} A tuple containing success status and message/token
 */
function authenticateAndGetToken(authenticator, username, password) {
  try {
    const token = authenticator.authenticateUser(username, password);
    return [true, token];
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return [false, error.message];
    } else {
      return [false, `Authentication error: ${error.message}`];
    }
  }
}

module.exports = {
  UserAuthenticator,
  AuthenticationError,
  authenticateAndGetToken,
};
