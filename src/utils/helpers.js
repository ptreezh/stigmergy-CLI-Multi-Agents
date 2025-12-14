const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { UserAuthenticator } = require('../auth');

function maxOfTwo(a, b) {
  return a > b ? a : b;
}

function isAuthenticated() {
  try {
    const authenticator = new UserAuthenticator();
    // Load authentication data
    const authFile = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.stigmergy',
      'auth.json',
    );

    if (!fsSync.existsSync(authFile)) {
      return false;
    }

    const authData = JSON.parse(fsSync.readFileSync(authFile, 'utf8'));
    return authenticator.validateToken(authData.token);
  } catch (error) {
    console.log(`[AUTH] Authentication check failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  maxOfTwo,
  isAuthenticated,
};
