/**
 * Utility functions for the Stigmergy CLI
 */

const { parseAndValidateJSON, validateSchema } = require("./utils/json_validator");

/**
 * Simple REST API client
 */
class RESTClient {
  /**
   * Create a new REST client
   * @param {string} baseURL - The base URL for the API
   * @param {Object} defaultHeaders - Default headers to include in all requests
   */
  constructor(baseURL = "", defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
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

    if (
      options.body &&
      typeof options.body === "object" &&
      !(options.body instanceof String)
    ) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(fullURL, config);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

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
    return this.request("GET", url, options);
  }

  /**
   * Make a POST request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async post(url, data, options = {}) {
    return this.request("POST", url, { ...options, body: data });
  }

  /**
   * Make a PUT request
   * @param {string} url - Request URL
   * @param {Object} data - Request body data
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async put(url, data, options = {}) {
    return this.request("PUT", url, { ...options, body: data });
  }

  /**
   * Make a DELETE request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Promise} Response promise
   */
  async delete(url, options = {}) {
    return this.request("DELETE", url, options);
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
    throw new Error("Factorial is not defined for negative numbers");
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
    throw new Error("Fibonacci is not defined for negative numbers");
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
    throw new Error("Fibonacci is not defined for negative numbers");
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
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

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
 * Process CSV data and generate statistics
 * @param {string} csvData - The CSV data as a string
 * @param {Object} options - Options for processing
 * @returns {Object} Statistics about the CSV data
 */
function processCSV(csvData, options = {}) {
  const opts = {
    delimiter: ",",
    hasHeader: true,
    ...options,
  };

  const lines = csvData.trim().split("\n");

  if (lines.length === 0) {
    return { error: "Empty CSV data" };
  }

  let headers = [];
  let startIndex = 0;

  if (opts.hasHeader) {
    headers = lines[0].split(opts.delimiter).map((h) => h.trim());
    startIndex = 1;
  }

  const rows = [];
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(opts.delimiter).map((v) => v.trim());
      const row = {};

      if (opts.hasHeader) {
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
      } else {
        values.forEach((value, index) => {
          row[index] = value;
        });
      }

      rows.push(row);
    }
  }

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

  const columnNames = opts.hasHeader ? headers : Object.keys(rows[0] || {});
  columnNames.forEach((column) => {
    stats.columns[column] = {
      count: 0,
      uniqueValues: new Set(),
      numericValues: [],
      emptyCount: 0,
    };
  });

  rows.forEach((row) => {
    columnNames.forEach((column) => {
      const value = row[column];
      const columnStats = stats.columns[column];

      columnStats.count++;

      if (value === "" || value === null || value === undefined) {
        columnStats.emptyCount++;
      } else {
        columnStats.uniqueValues.add(value);

        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          columnStats.numericValues.push(numValue);
        }
      }
    });
  });

  Object.keys(stats.columns).forEach((column) => {
    const columnStats = stats.columns[column];
    columnStats.uniqueCount = columnStats.uniqueValues.size;
    delete columnStats.uniqueValues;

    if (columnStats.numericValues.length > 0) {
      const nums = columnStats.numericValues;
      columnStats.numericStats = {
        min: Math.min(...nums),
        max: Math.max(...nums),
        sum: nums.reduce((a, b) => a + b, 0),
        average: nums.reduce((a, b) => a + b, 0) / nums.length,
      };
    }
    delete columnStats.numericValues;
  });

  return stats;
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
  const crypto = require("crypto");

  if (!data) {
    throw new Error("Data to encrypt cannot be empty");
  }

  if (!secretKey) {
    throw new Error("Secret key is required");
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);

  let encrypted;
  if (typeof data === "string") {
    encrypted = cipher.update(data, "utf8", "hex");
  } else {
    encrypted = cipher.update(data);
    encrypted = encrypted.toString("hex");
  }
  cipher.final();

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
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
  const crypto = require("crypto");

  if (
    !encryptedObj ||
    !encryptedObj.encryptedData ||
    !encryptedObj.iv ||
    !encryptedObj.authTag
  ) {
    throw new Error("Invalid encrypted object");
  }

  if (!secretKey) {
    throw new Error("Secret key is required");
  }

  const iv = Buffer.from(encryptedObj.iv, "base64");
  const authTag = Buffer.from(encryptedObj.authTag, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted;
  if (typeof encryptedObj.encryptedData === "string") {
    decrypted = decipher.update(encryptedObj.encryptedData, "hex", "utf8");
  } else {
    decrypted = decipher.update(encryptedObj.encryptedData);
    decrypted = decrypted.toString("utf8");
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
  const crypto = require("crypto");
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
  RESTClient,
  encryptData,
  decryptData,
  generateKey,
};