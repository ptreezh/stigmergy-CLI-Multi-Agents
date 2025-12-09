/**
 * Utility functions for the Stigmergy CLI
 */

const { processWeatherData } = require('./weatherProcessor');

/**
 * Simple REST API client
 */
class RESTClient {
  /**
   * Create a new REST client
   * @param {string} baseURL - The base URL for the API
   * @param {Object} defaultHeaders - Default headers to include in all requests
   */
  constructor(baseURL = '', defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Make an HTTP request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async request(method, url, options = {}) {
    const fullURL = this.baseURL + url;

    const config = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Handle JSON body
    if (
      options.body &&
      typeof options.body === 'object' &&
      !(options.body instanceof String)
    ) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(fullURL, config);

      // Try to parse JSON response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Throw error for non-success status codes
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${JSON.stringify(data)}`,
        );
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data,
      };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Make a GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async get(url, options = {}) {
    return this.request('GET', url, options);
  }

  /**
   * Make a POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async post(url, data, options = {}) {
    return this.request('POST', url, { ...options, body: data });
  }

  /**
   * Make a PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, body: data });
  }

  /**
   * Make a DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }
}

/**
 * HashTable implementation with collision handling using chaining
 */
class HashTable {
  /**
   * Create a new HashTable
   * @param {number} size - Initial size of the hash table
   */
  constructor(size = 53) {
    this.keyMap = new Array(size);
  }

  /**
   * Hash function to convert a key to an index
   * @param {string} key - Key to hash
   * @returns {number} Index in the hash table
   */
  _hash(key) {
    let total = 0;
    const WEIRD_PRIME = 31;
    for (let i = 0; i < Math.min(key.length, 100); i++) {
      const char = key[i];
      const value = char.charCodeAt(0) - 96;
      total = (total * WEIRD_PRIME + value) % this.keyMap.length;
    }
    return total;
  }

  /**
   * Set a key-value pair in the hash table
   * @param {string} key - Key to store
   * @param {*} value - Value to store
   * @returns {HashTable} The hash table instance
   */
  set(key, value) {
    const index = this._hash(key);
    if (!this.keyMap[index]) {
      this.keyMap[index] = [];
    }
    this.keyMap[index].push([key, value]);
    return this;
  }

  /**
   * Get a value by its key
   * @param {string} key - Key to look up
   * @returns {*} The value associated with the key, or undefined if not found
   */
  get(key) {
    const index = this._hash(key);
    if (this.keyMap[index]) {
      for (let i = 0; i < this.keyMap[index].length; i++) {
        if (this.keyMap[index][i][0] === key) {
          return this.keyMap[index][i][1];
        }
      }
    }
    return undefined;
  }

  /**
   * Get all keys in the hash table
   * @returns {Array} Array of all keys
   */
  keys() {
    const keysArr = [];
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        for (let j = 0; j < this.keyMap[i].length; j++) {
          if (!keysArr.includes(this.keyMap[i][j][0])) {
            keysArr.push(this.keyMap[i][j][0]);
          }
        }
      }
    }
    return keysArr;
  }

  /**
   * Get all values in the hash table
   * @returns {Array} Array of all values
   */
  values() {
    const valuesArr = [];
    for (let i = 0; i < this.keyMap.length; i++) {
      if (this.keyMap[i]) {
        for (let j = 0; j < this.keyMap[i].length; j++) {
          if (!valuesArr.includes(this.keyMap[i][j][1])) {
            valuesArr.push(this.keyMap[i][j][1]);
          }
        }
      }
    }
    return valuesArr;
  }
}

/**
 * Calculate the factorial of a number
 * @param {number} n - The number to calculate factorial for
 * @returns {number} The factorial of n
 */
function factorial(n) {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }

  if (n === 0 || n === 1) {
    return 1;
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

/**
 * Calculate the nth Fibonacci number using iteration (efficient)
 * @param {number} n - The position in the Fibonacci sequence
 * @returns {number} The nth Fibonacci number
 */
function fibonacci(n) {
  if (n < 0) {
    throw new Error('Fibonacci is not defined for negative numbers');
  }

  if (n === 0) return 0;
  if (n === 1) return 1;

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
}

/**
 * Calculate the nth Fibonacci number using recursion (less efficient)
 * @param {number} n - The position in the Fibonacci sequence
 * @returns {number} The nth Fibonacci number
 */
function fibonacciRecursive(n) {
  if (n < 0) {
    throw new Error('Fibonacci is not defined for negative numbers');
  }

  if (n === 0) return 0;
  if (n === 1) return 1;

  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

/**
 * Check if a number is prime
 * @param {number} n - The number to check for primality
 * @returns {boolean} True if the number is prime, false otherwise
 */
function isPrime(n) {
  // Handle edge cases
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  // Check for divisors from 5 up to sqrt(n)
  // Using the fact that all primes > 3 are of the form 6k ± 1
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Find the maximum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The maximum of a and b
 */
function max(a, b) {
  return a > b ? a : b;
}

/**
 * Parse JSON data and validate its structure
 * @param {string} jsonString - The JSON string to parse
 * @param {Object} schema - Optional schema to validate against
 * @returns {Object} Parsed and validated JSON data
 * @throws {Error} If JSON is invalid or doesn't match schema
 */
function parseAndValidateJSON(jsonString, schema = null) {
  // Parse the JSON string
  let parsedData;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON format: ${error.message}`);
  }

  // If no schema provided, return parsed data
  if (!schema) {
    return parsedData;
  }

  // Validate against schema
  validateSchema(parsedData, schema);

  return parsedData;
}

/**
 * Validate data against a schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Schema to validate against
 * @throws {Error} If data doesn't match schema
 */
function validateSchema(data, schema) {
  // Check if schema is an object
  if (typeof schema !== 'object' || schema === null) {
    throw new Error('Schema must be a valid object');
  }

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (!(field in data)) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }
  }

  // Validate each field
  for (const key in schema.properties) {
    if (!(key in data) && schema.required && schema.required.includes(key)) {
      throw new Error(`Required field '${key}' is missing`);
    }

    if (key in data) {
      const propertySchema = schema.properties[key];
      const value = data[key];

      // Check type
      if (propertySchema.type) {
        // Special handling for null values
        if (value === null && propertySchema.nullable) {
          continue; // Accept null values for nullable fields
        }

        if (propertySchema.type === 'array' && !Array.isArray(value)) {
          throw new Error(`Field '${key}' should be an array`);
        } else if (
          propertySchema.type === 'object' &&
          (typeof value !== 'object' || value === null || Array.isArray(value))
        ) {
          throw new Error(`Field '${key}' should be an object`);
        } else if (
          propertySchema.type !== 'array' &&
          propertySchema.type !== 'object' &&
          typeof value !== propertySchema.type
        ) {
          throw new Error(
            `Field '${key}' should be of type ${propertySchema.type}, got ${typeof value}`,
          );
        }
      }

      // Check enum values
      if (propertySchema.enum && !propertySchema.enum.includes(value)) {
        throw new Error(
          `Field '${key}' should be one of: ${propertySchema.enum.join(', ')}`,
        );
      }

      // Check minimum and maximum for numbers
      if (typeof value === 'number') {
        if (
          propertySchema.minimum !== undefined &&
          value < propertySchema.minimum
        ) {
          throw new Error(
            `Field '${key}' should be greater than or equal to ${propertySchema.minimum}`,
          );
        }
        if (
          propertySchema.maximum !== undefined &&
          value > propertySchema.maximum
        ) {
          throw new Error(
            `Field '${key}' should be less than or equal to ${propertySchema.maximum}`,
          );
        }
      }

      // Check minLength and maxLength for strings
      if (typeof value === 'string') {
        if (
          propertySchema.minLength !== undefined &&
          value.length < propertySchema.minLength
        ) {
          throw new Error(
            `Field '${key}' should have a minimum length of ${propertySchema.minLength}`,
          );
        }
        if (
          propertySchema.maxLength !== undefined &&
          value.length > propertySchema.maxLength
        ) {
          throw new Error(
            `Field '${key}' should have a maximum length of ${propertySchema.maxLength}`,
          );
        }
      }

      // Check nested objects recursively
      if (propertySchema.type === 'object' && propertySchema.properties) {
        validateSchema(value, propertySchema);
      }

      // Check array items
      if (
        propertySchema.type === 'array' &&
        propertySchema.items &&
        Array.isArray(value)
      ) {
        // Check minItems and maxItems for arrays
        if (
          propertySchema.minItems !== undefined &&
          value.length < propertySchema.minItems
        ) {
          throw new Error(
            `Array '${key}' should have at least ${propertySchema.minItems} items`,
          );
        }
        if (
          propertySchema.maxItems !== undefined &&
          value.length > propertySchema.maxItems
        ) {
          throw new Error(
            `Array '${key}' should have at most ${propertySchema.maxItems} items`,
          );
        }

        for (const [index, item] of value.entries()) {
          if (
            propertySchema.items.type &&
            typeof item !== propertySchema.items.type
          ) {
            throw new Error(
              `Item at index ${index} in array '${key}' should be of type ${propertySchema.items.type}, got ${typeof item}`,
            );
          }

          // Recursively validate object items
          if (
            propertySchema.items.type === 'object' &&
            propertySchema.items.properties
          ) {
            validateSchema(item, propertySchema.items);
          }
        }
      }
    }
  }
}

/**
 * Process CSV data and generate statistics
 * @param {string} csvData - The CSV data as a string
 * @param {Object} options - Options for processing
 * @returns {Object} Statistics about the CSV data
 */
function processCSV(csvData, options = {}) {
  // Default options
  const opts = {
    delimiter: ',',
    hasHeader: true,
    ...options,
  };

  // Split CSV data into lines
  const lines = csvData.trim().split('\n');

  if (lines.length === 0) {
    return { error: 'Empty CSV data' };
  }

  // Parse header
  let headers = [];
  let startIndex = 0;

  if (opts.hasHeader) {
    headers = lines[0].split(opts.delimiter).map((h) => h.trim());
    startIndex = 1;
  }

  // Parse rows
  const rows = [];
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim()) {
      // Skip empty lines
      const values = lines[i].split(opts.delimiter).map((v) => v.trim());
      const row = {};

      if (opts.hasHeader) {
        // Map values to headers
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
      } else {
        // Use indices as keys
        values.forEach((value, index) => {
          row[index] = value;
        });
      }

      rows.push(row);
    }
  }

  // Generate statistics
  const stats = {
    rowCount: rows.length,
    columnCount: opts.hasHeader
      ? headers.length
      : rows[0]
        ? Object.keys(rows[0]).length
        : 0,
    headers: opts.hasHeader ? headers : [],
    columns: {},
  };

  // Initialize column statistics
  const columnNames = opts.hasHeader ? headers : Object.keys(rows[0] || {});
  columnNames.forEach((column) => {
    stats.columns[column] = {
      count: 0,
      uniqueValues: new Set(),
      numericValues: [],
      emptyCount: 0,
    };
  });

  // Process each row
  rows.forEach((row) => {
    columnNames.forEach((column) => {
      const value = row[column];
      const columnStats = stats.columns[column];

      columnStats.count++;

      if (value === '' || value === null || value === undefined) {
        columnStats.emptyCount++;
      } else {
        columnStats.uniqueValues.add(value);

        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          columnStats.numericValues.push(numValue);
        }
      }
    });
  });

  // Calculate additional statistics
  Object.keys(stats.columns).forEach((column) => {
    const columnStats = stats.columns[column];
    columnStats.uniqueCount = columnStats.uniqueValues.size;
    delete columnStats.uniqueValues; // Remove Set object for cleaner output

    // Calculate numeric statistics if applicable
    if (columnStats.numericValues.length > 0) {
      const nums = columnStats.numericValues;
      columnStats.numericStats = {
        min: Math.min(...nums),
        max: Math.max(...nums),
        sum: nums.reduce((a, b) => a + b, 0),
        average: nums.reduce((a, b) => a + b, 0) / nums.length,
      };
    }
    delete columnStats.numericValues; // Remove array for cleaner output
  });

  return stats;
}

/**
 * Execute a command with reliable cross-platform support
 * @param {string} command - The command to execute
 * @param {Array} args - Arguments for the command
 * @param {Object} options - Options for execution
 * @returns {Promise<Object>} Result of the execution
 */
async function executeCommand(command, args = [], options = {}) {
  const { spawn } = require('child_process');

  // Default options
  const opts = {
    stdio: 'inherit',
    shell: true,
    timeout: 300000, // 5 minute timeout
    ...options,
  };

  return new Promise((resolve, reject) => {
    // Don't log the command if it contains sensitive information
    if (process.env.DEBUG === 'true') {
      console.log(`[EXEC] Running: ${command} ${args.join(' ')}`);
    }

    try {
      // Validate that command is a string and not empty
      if (!command || typeof command !== 'string') {
        reject({
          error: new Error(
            'Invalid command: command must be a non-empty string',
          ),
          message: 'Invalid command: command must be a non-empty string',
          stdout: '',
          stderr: '',
        });
        return;
      }

      // Validate that args is an array
      if (!Array.isArray(args)) {
        reject({
          error: new Error('Invalid arguments: args must be an array'),
          message: 'Invalid arguments: args must be an array',
          stdout: '',
          stderr: '',
        });
        return;
      }

      // Special handling for JS files - ensure they are executed with node
      if (command.endsWith('.js') || command.endsWith('.cjs')) {
        // Prepend 'node' to the command if it's a JS file
        const nodeArgs = [command, ...args];
        command = process.execPath; // Use the same node executable
        args = nodeArgs;
        // Disable shell mode for direct process execution to avoid quoting issues
        opts.shell = false;
      }

      const child = spawn(command, args, opts);

      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0,
        });
      });

      child.on('error', (error) => {
        // Provide more detailed error information
        let errorMessage = error.message;
        if (error.code === 'ENOENT') {
          errorMessage = `Command not found: ${command}. Please check if the command is installed and in your PATH.`;
        } else if (error.code === 'EACCES') {
          errorMessage = `Permission denied: Cannot execute ${command}. Please check file permissions.`;
        } else if (error.code === 'EISDIR') {
          errorMessage = `Cannot execute directory: ${command}. This might be a file path issue.`;
        }

        reject({
          error,
          message: `Failed to execute command: ${errorMessage}`,
          stdout,
          stderr,
        });
      });

      // Handle timeout
      if (opts.timeout) {
        setTimeout(() => {
          child.kill();
          reject({
            error: new Error('Command timeout'),
            message: `Command timed out after ${opts.timeout}ms`,
            stdout,
            stderr,
          });
        }, opts.timeout);
      }
    } catch (error) {
      reject({
        error,
        message: `Failed to spawn command: ${error.message}`,
      });
    }
  });
}

/**
 * Safely execute a JavaScript file
 * @param {string} jsFilePath - Path to the JS file to execute
 * @param {Array} args - Arguments to pass to the JS file
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Result of the execution
 */
async function executeJSFile(jsFilePath, args = [], options = {}) {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    // Validate that the file exists
    await fs.access(jsFilePath);

    // Validate that it's actually a file (not a directory)
    const stats = await fs.stat(jsFilePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${jsFilePath}`);
    }

    // Validate file extension
    const ext = path.extname(jsFilePath).toLowerCase();
    if (ext !== '.js' && ext !== '.cjs') {
      throw new Error(`File is not a JavaScript file: ${jsFilePath}`);
    }

    // Execute the JS file with node
    // On Windows, paths with spaces need to be quoted when using shell: true
    const nodePath = process.execPath;
    return await executeCommand(nodePath, [jsFilePath, ...args], options);
  } catch (error) {
    throw new Error(
      `Failed to execute JS file '${jsFilePath}': ${error.message}`,
    );
  }
}

/**
 * Encrypts data using AES-256-GCM authenticated encryption
 *
 * This function provides secure symmetric encryption with authentication.
 * It generates a random initialization vector for each encryption operation
 * and returns the encrypted data along with the IV and authentication tag.
 *
 * @param {string|Buffer} data - The plaintext data to encrypt
 * @param {string|Buffer} secretKey - The secret key for encryption (must be 32 bytes for AES-256)
 * @returns {Object} Object containing encrypted data, IV, and authentication tag
 * @throws {Error} If encryption fails due to invalid inputs or cryptographic errors
 */
function encryptData(data, secretKey) {
  const crypto = require('crypto');

  // Validate inputs
  if (!data) {
    throw new Error('Data to encrypt cannot be empty');
  }

  if (!secretKey) {
    throw new Error('Secret key is required');
  }

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher using AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);

  // Encrypt the data
  let encrypted;
  if (typeof data === 'string') {
    encrypted = cipher.update(data, 'utf8', 'hex');
  } else {
    encrypted = cipher.update(data);
    encrypted = encrypted.toString('hex');
  }
  cipher.final();

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Return encrypted data with IV and auth tag
  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts data using AES-256-GCM authenticated decryption
 *
 * This function decrypts data that was encrypted with encryptData().
 * It requires the encrypted data object containing the encrypted data,
 * initialization vector, and authentication tag.
 *
 * @param {Object} encryptedObj - Object containing encrypted data, IV, and auth tag
 * @param {string|Buffer} secretKey - The secret key used for encryption
 * @returns {string} The decrypted plaintext data
 * @throws {Error} If decryption fails due to invalid inputs, tampered data, or cryptographic errors
 */
function decryptData(encryptedObj, secretKey) {
  const crypto = require('crypto');

  // Validate inputs
  if (
    !encryptedObj ||
    !encryptedObj.encryptedData ||
    !encryptedObj.iv ||
    !encryptedObj.authTag
  ) {
    throw new Error('Invalid encrypted object');
  }

  if (!secretKey) {
    throw new Error('Secret key is required');
  }

  // Decode base64 encoded values
  const iv = Buffer.from(encryptedObj.iv, 'base64');
  const authTag = Buffer.from(encryptedObj.authTag, 'base64');

  // Create decipher using AES-256-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, iv);

  // Set the authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt the data
  let decrypted;
  if (typeof encryptedObj.encryptedData === 'string') {
    decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  } else {
    decrypted = decipher.update(encryptedObj.encryptedData);
    decrypted = decrypted.toString('utf8');
  }
  decipher.final();

  return decrypted;
}

/**
 * Generates a cryptographically secure random key
 *
 * This function generates a random key suitable for AES-256 encryption.
 *
 * @param {number} [length=32] - Length of the key in bytes (32 bytes = 256 bits)
 * @returns {Buffer} A cryptographically secure random key
 */
function generateKey(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length);
}

module.exports = {
  factorial,
  fibonacci,
  fibonacciRecursive,
  max,
  isPrime,
  HashTable,
  parseAndValidateJSON,
  processCSV,
  processWeatherData,
  RESTClient,
  executeCommand,
  executeJSFile,
  encryptData,
  decryptData,
  generateKey,
};