/**
 * Authentication command handler for the Stigmergy CLI.
 * Provides CLI commands for user registration, login, and session management.
 */

const fs = require("fs");
const path = require("path");
const { UserAuthenticator, authenticateAndGetToken } = require("./auth");

/**
 * Get the path to the authentication data file.
 * @returns {string} Path to the auth data file
 */
function getAuthDataPath() {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const configDir = path.join(homeDir, ".stigmergy");

  // Create config directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return path.join(configDir, "auth.json");
}

/**
 * Load authentication data from file.
 * @param {UserAuthenticator} authenticator - The authenticator instance
 */
function loadAuthData(authenticator) {
  try {
    const authFile = getAuthDataPath();
    if (fs.existsSync(authFile)) {
      const data = JSON.parse(fs.readFileSync(authFile, "utf8"));

      // Load users
      if (data.users) {
        for (const [username, userData] of Object.entries(data.users)) {
          authenticator._users.set(username, userData);
        }
      }

      // Load sessions
      if (data.sessions) {
        for (const [token, sessionData] of Object.entries(data.sessions)) {
          authenticator._sessions.set(token, sessionData);
        }
      }
    }
  } catch (error) {
    console.warn("[WARN] Could not load authentication data:", error.message);
  }
}

/**
 * Save authentication data to file.
 * @param {UserAuthenticator} authenticator - The authenticator instance
 */
function saveAuthData(authenticator) {
  try {
    const authFile = getAuthDataPath();

    // Convert Maps to objects for JSON serialization
    const users = {};
    for (const [username, userData] of authenticator._users.entries()) {
      users[username] = userData;
    }

    const sessions = {};
    for (const [token, sessionData] of authenticator._sessions.entries()) {
      sessions[token] = sessionData;
    }

    const data = {
      users,
      sessions,
    };

    fs.writeFileSync(authFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn("[WARN] Could not save authentication data:", error.message);
  }
}

/**
 * Handle user registration.
 * @param {string} username - The username to register
 * @param {string} password - The password for the user
 */
function handleRegister(username, password) {
  const authenticator = new UserAuthenticator();
  loadAuthData(authenticator);

  try {
    const success = authenticator.registerUser(username, password);
    if (success) {
      saveAuthData(authenticator);
      console.log(`[SUCCESS] User '${username}' registered successfully`);
    } else {
      console.log(`[ERROR] Username '${username}' already exists`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`[ERROR] Registration failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle user login.
 * @param {string} username - The username to login
 * @param {string} password - The password for the user
 */
function handleLogin(username, password) {
  const authenticator = new UserAuthenticator();
  loadAuthData(authenticator);

  const [success, result] = authenticateAndGetToken(
    authenticator,
    username,
    password,
  );

  if (success) {
    const token = result;
    saveAuthData(authenticator);

    // Also save the token to a session file for easy access
    const sessionFile = path.join(
      path.dirname(getAuthDataPath()),
      "session.token",
    );
    fs.writeFileSync(sessionFile, token);

    console.log(`[SUCCESS] Login successful`);
    console.log(`Session token: ${token}`);
  } else {
    console.log(`[ERROR] Login failed: ${result}`);
    process.exit(1);
  }
}

/**
 * Handle user logout.
 */
function handleLogout() {
  const authenticator = new UserAuthenticator();
  loadAuthData(authenticator);

  // Read the current session token
  const sessionFile = path.join(
    path.dirname(getAuthDataPath()),
    "session.token",
  );

  if (!fs.existsSync(sessionFile)) {
    console.log(`[ERROR] No active session found`);
    process.exit(1);
  }

  const token = fs.readFileSync(sessionFile, "utf8").trim();

  const success = authenticator.logout(token);
  if (success) {
    saveAuthData(authenticator);
    fs.unlinkSync(sessionFile); // Remove the session file
    console.log(`[SUCCESS] Logged out successfully`);
  } else {
    console.log(`[ERROR] Logout failed: Invalid session`);
    process.exit(1);
  }
}

/**
 * Check if user is authenticated.
 */
function handleStatus() {
  const authenticator = new UserAuthenticator();
  loadAuthData(authenticator);

  // Read the current session token
  const sessionFile = path.join(
    path.dirname(getAuthDataPath()),
    "session.token",
  );

  if (!fs.existsSync(sessionFile)) {
    console.log(`[INFO] No active session`);
    return;
  }

  const token = fs.readFileSync(sessionFile, "utf8").trim();
  const username = authenticator.validateSession(token);

  if (username) {
    console.log(`[INFO] Authenticated as: ${username}`);
  } else {
    console.log(`[INFO] Session expired or invalid`);
    fs.unlinkSync(sessionFile); // Remove the invalid session file
  }
}

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  handleStatus,
};
