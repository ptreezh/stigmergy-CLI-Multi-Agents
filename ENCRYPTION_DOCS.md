# Data Encryption Function Documentation

## Overview

This document describes a secure data encryption function that can be implemented using Node.js built-in `crypto` module. The function provides symmetric encryption using the Advanced Encryption Standard (AES) algorithm with Galois/Counter Mode (GCM) for authenticated encryption.

## Function Signature

```javascript
function encryptData(data, secretKey)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | string \| Buffer | The plaintext data to be encrypted |
| `secretKey` | string \| Buffer | The secret key used for encryption (must be 32 bytes for AES-256) |

## Returns

Object containing the encrypted data and associated metadata:

```javascript
{
  encryptedData: string,  // Base64 encoded encrypted data
  iv: string,            // Base64 encoded initialization vector
  authTag: string        // Base64 encoded authentication tag
}
```

## Implementation Example

```javascript
const crypto = require('crypto');

/**
 * Encrypts data using AES-256-GCM
 * @param {string|Buffer} data - The plaintext data to encrypt
 * @param {string|Buffer} secretKey - The secret key for encryption (32 bytes for AES-256)
 * @returns {Object} Object containing encrypted data, IV, and auth tag
 */
function encryptData(data, secretKey) {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-GCM
  const cipher = crypto.createCipherGCM('aes-256-gcm', secretKey, iv);
  
  // Encrypt the data
  const encrypted = cipher.update(data, 'utf8', 'hex');
  cipher.final();
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Return encrypted data with IV and auth tag
  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}
```

## Decryption Function

For completeness, here's the corresponding decryption function:

```javascript
/**
 * Decrypts data using AES-256-GCM
 * @param {Object} encryptedObj - Object containing encrypted data, IV, and auth tag
 * @param {string|Buffer} secretKey - The secret key used for encryption
 * @returns {string} The decrypted plaintext data
 */
function decryptData(encryptedObj, secretKey) {
  // Decode base64 encoded values
  const iv = Buffer.from(encryptedObj.iv, 'base64');
  const authTag = Buffer.from(encryptedObj.authTag, 'base64');
  
  // Create decipher using AES-256-GCM
  const decipher = crypto.createDecipherGCM('aes-256-gcm', secretKey, iv);
  
  // Set the authentication tag
  decipher.setAuthTag(authTag);
  
  // Decrypt the data
  const decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decipher.final();
  
  return decrypted;
}
```

## Security Considerations

1. **Key Management**: Store secret keys securely, never hardcode them in source code
2. **Key Length**: Use 32-byte (256-bit) keys for AES-256 encryption
3. **IV Uniqueness**: Always use a unique initialization vector for each encryption operation
4. **Authentication**: AES-GCM provides authenticated encryption, ensuring data integrity
5. **Secure Storage**: Consider using environment variables or secure key management systems

## Usage Example

```javascript
// Generate a secure key (in production, use a proper key derivation function)
const secretKey = crypto.randomBytes(32);

// Data to encrypt
const plaintext = "Sensitive user data";

// Encrypt the data
const encryptedObj = encryptData(plaintext, secretKey);
console.log("Encrypted:", encryptedObj);

// Decrypt the data
const decrypted = decryptData(encryptedObj, secretKey);
console.log("Decrypted:", decrypted);
```

## Error Handling

The function may throw errors in the following cases:
- Invalid key length
- Invalid input data
- Cryptographic operation failures

Always wrap encryption/decryption operations in try-catch blocks:

```javascript
try {
  const encrypted = encryptData(data, key);
  // Process encrypted data
} catch (error) {
  console.error('Encryption failed:', error.message);
  // Handle error appropriately
}
```