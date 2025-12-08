/**
 * Data encryption utilities for the Stigmergy CLI
 * Provides secure data encryption and decryption functions using AES-256-GCM
 */

const crypto = require("crypto");

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
 *
 * @example
 * const crypto = require('crypto');
 * const secretKey = crypto.randomBytes(32); // 256-bit key
 * const plaintext = "Secret message";
 * const encryptedObj = encryptData(plaintext, secretKey);
 * console.log(encryptedObj);
 * // Output: {
 * //   encryptedData: 'a3f5b7c8...',
 * //   iv: 'MjRkOGZj...',
 * //   authTag: 'YzQyNTgx...'
 * // }
 */
function encryptData(data, secretKey) {
  // Validate inputs
  if (!data) {
    throw new Error("Data to encrypt cannot be empty");
  }

  if (!secretKey) {
    throw new Error("Secret key is required");
  }

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher using AES-256-GCM
  const cipher = crypto.createCipherGCM("aes-256-gcm", secretKey, iv);

  // Encrypt the data
  let encrypted;
  if (typeof data === "string") {
    encrypted = cipher.update(data, "utf8", "hex");
  } else {
    encrypted = cipher.update(data);
    encrypted = encrypted.toString("hex");
  }
  cipher.final();

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  // Return encrypted data with IV and auth tag
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
 *
 * @example
 * const decrypted = decryptData(encryptedObj, secretKey);
 * console.log(decrypted); // "Secret message"
 */
function decryptData(encryptedObj, secretKey) {
  // Validate inputs
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

  // Decode base64 encoded values
  const iv = Buffer.from(encryptedObj.iv, "base64");
  const authTag = Buffer.from(encryptedObj.authTag, "base64");

  // Create decipher using AES-256-GCM
  const decipher = crypto.createDecipherGCM("aes-256-gcm", secretKey, iv);

  // Set the authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt the data
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
 *
 * @example
 * const key = generateKey(); // 32-byte key for AES-256
 * const shortKey = generateKey(16); // 16-byte key for AES-128
 */
function generateKey(length = 32) {
  return crypto.randomBytes(length);
}

module.exports = {
  encryptData,
  decryptData,
  generateKey,
};
