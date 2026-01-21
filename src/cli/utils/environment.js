/**
 * CLI Environment Module
 * Contains environment and working directory management
 */

const path = require('path');
const os = require('os');

/**
 * Get appropriate working directory for CLI tools
 * @param {string} toolName - Name of the CLI tool
 * @returns {string} Working directory path
 */
function getWorkingDirectoryForTool(toolName) {
  switch (toolName) {
    case 'claude':
      return process.cwd(); // Current working directory for Claude
    case 'gemini':
      return process.cwd(); // Current working directory for Gemini
    case 'qwen':
      return path.join(os.homedir(), '.qwen'); // Qwen's home directory
    case 'codebuddy':
      return process.cwd(); // Current working directory for CodeBuddy
    case 'copilot':
      return process.cwd(); // Current working directory for Copilot
    default:
      return process.cwd(); // Default to current working directory
  }
}

/**
 * Get environment variables for specific CLI tool
 * @param {string} toolName - Name of the CLI tool
 * @returns {Object} Environment variables object
 */
function getEnvironmentForTool(toolName) {
  const env = { ...process.env };

  // Tool-specific environment setup
  switch (toolName) {
    case 'qwen':
      // For Qwen CLI, clear Node.js environment variables to avoid import conflicts
      delete env.NODE_PATH;
      delete env.NODE_OPTIONS;
      // Ensure clean environment
      env.PWD = getWorkingDirectoryForTool(toolName);
      break;
    case 'claude':
      // Claude-specific environment setup if needed
      break;
    case 'gemini':
      // Gemini-specific environment setup if needed
      break;
    default:
      // Use default environment
      break;
  }

  return env;
}

/**
 * Check if CLI tool needs special working directory
 * @param {string} toolName - Name of the CLI tool
 * @returns {boolean} True if special directory needed
 */
function needsSpecialDirectory(toolName) {
  return ['qwen'].includes(toolName);
}

module.exports = {
  getWorkingDirectoryForTool,
  getEnvironmentForTool,
  needsSpecialDirectory
};