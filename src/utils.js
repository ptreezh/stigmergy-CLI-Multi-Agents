/**
 * Utility functions for the Stigmergy CLI
 */

const { parseAndValidateJSON, validateSchema } = require("./utils/json_validator");

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  parseAndValidateJSON,
  validateSchema,
  sleep,
};