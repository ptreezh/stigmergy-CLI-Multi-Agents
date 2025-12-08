# Data Encryption Functions Documentation

## Overview

This document provides documentation for the data encryption functions available in the Stigmergy CLI system. These functions implement secure symmetric encryption using the Advanced Encryption Standard (AES) with Galois/Counter Mode (GCM) for authenticated encryption.

## Available Functions

### `encryptData(data, secretKey)`

Encrypts data using AES-256-GCM authenticated encryption.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | string \| Buffer | The plaintext data to be encrypted |
| `secretKey` | string \| Buffer | The secret key used for encryption (must be 32 bytes for AES-256) |

#### Returns

Object containing the encrypted data and associated metadata:

```javascript
{
  encryptedData: string,  // Hex encoded encrypted data
  iv: string,            // Base64 encoded initialization vector
  authTag: string        // Base64 encoded authentication tag
}
```

#### Example

```javascript
const { encryptData, generateKey } = require('./src/utils');

// Generate a secure key
const secretKey = generateKey();

// Data to encrypt
const plaintext = "Confidential information";

// Encrypt the data
const encryptedObj = encryptData(plaintext, secretKey);
console.log("Encrypted:", encryptedObj);
```

### `decryptData(encryptedObj, secretKey)`

Decrypts data using AES-256-GCM authenticated decryption.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `encryptedObj` | Object | Object containing encrypted data, IV, and auth tag |
| `secretKey` | string \| Buffer | The secret key used for encryption |

#### Returns

`string` - The decrypted plaintext data

#### Example

```javascript
const { decryptData } = require('./src/utils');

// Decrypt the data
const decrypted = decryptData(encryptedObj, secretKey);
console.log("Decrypted:", decrypted); // "Confidential information"
```

### `generateKey([length])`

Generates a cryptographically secure random key.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `length` | number | Length of the key in bytes (default: 32 for AES-256) |

#### Returns

`Buffer` - A cryptographically secure random key

#### Example

```javascript
const { generateKey } = require('./src/data_encryption');

// Generate a 256-bit (32-byte) key for AES-256
const key = generateKey();

// Generate a 128-bit (16-byte) key for AES-128
const shortKey = generateKey(16);
```

## Security Considerations

1. **Key Management**: Store secret keys securely, never hardcode them in source code
2. **Key Length**: Use 32-byte (256-bit) keys for AES-256 encryption
3. **IV Uniqueness**: Each encryption operation uses a randomly generated initialization vector
4. **Authentication**: AES-GCM provides authenticated encryption, ensuring data integrity
5. **Secure Storage**: Consider using environment variables or secure key management systems

## Usage Example

```javascript
const { encryptData, decryptData, generateKey } = require('./src/utils');

// Generate a secure key (in production, use a proper key management system)
const secretKey = generateKey();

// Data to encrypt
const plaintext = "Sensitive user data";

try {
  // Encrypt the data
  const encryptedObj = encryptData(plaintext, secretKey);
  console.log("Encrypted:", encryptedObj);

  // Decrypt the data
  const decrypted = decryptData(encryptedObj, secretKey);
  console.log("Decrypted:", decrypted);
} catch (error) {
  console.error('Encryption/decryption failed:', error.message);
}
```

## Error Handling

The functions may throw errors in the following cases:
- Invalid or missing input data
- Invalid or missing secret key
- Invalid encrypted object format
- Cryptographic operation failures
- Authentication failures (tampered data)

Always wrap encryption/decryption operations in try-catch blocks:

```javascript
const { encryptData } = require('./src/utils');

try {
  const encrypted = encryptData(data, key);
  // Process encrypted data
} catch (error) {
  console.error('Encryption failed:', error.message);
  // Handle error appropriately
}
```