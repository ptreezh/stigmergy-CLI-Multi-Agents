// tests/test_setup.js

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.STIGMERGY_TEST_MODE = 'true';

// Set up global test variables
global.testTimeout = 10000; // 10 seconds

// Test utilities
const path = require('path');
const os = require('os');
const fs = require('fs/promises');

/**
 * Create a temporary test directory
 * @returns {Promise<string>} Path to temporary directory
 */
async function createTestDir() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stigmergy-test-'));
  return tempDir;
}

/**
 * Clean up temporary test directory
 * @param {string} dirPath - Path to directory to clean up
 * @returns {Promise<void>}
 */
async function cleanupTestDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

// Export utilities
module.exports = {
  createTestDir,
  cleanupTestDir
};
