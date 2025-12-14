/**
 * Example usage of the encryption functions
 */

const { encryptData, decryptData, generateKey } = require('../src/utils');

// Generate a secure key (in production, use a proper key management system)
const secretKey = generateKey();

console.log('Data Encryption Example');
console.log('=====================');

// Data to encrypt
const plaintext = "This is confidential information that needs to be protected.";

console.log('Original data:', plaintext);

try {
  // Encrypt the data
  const encryptedObj = encryptData(plaintext, secretKey);
  console.log('\nEncrypted data:');
  console.log('Encrypted:', encryptedObj.encryptedData);
  console.log('IV:', encryptedObj.iv);
  console.log('Auth Tag:', encryptedObj.authTag);

  // Decrypt the data
  const decrypted = decryptData(encryptedObj, secretKey);
  console.log('\nDecrypted data:', decrypted);
  
  // Verify data integrity
  console.log('\nData integrity check:', plaintext === decrypted ? 'PASS' : 'FAIL');
  
} catch (error) {
  console.error('Encryption/decryption failed:', error.message);
}

// Example with different data types
console.log('\n\nExample with different data types:');
console.log('---------------------------------');

// Working with buffers
const bufferData = Buffer.from('Binary data to encrypt', 'utf8');
console.log('Buffer data to encrypt:', bufferData.toString('utf8'));

try {
  const encryptedBuffer = encryptData(bufferData, secretKey);
  const decryptedBuffer = decryptData(encryptedBuffer, secretKey);
  console.log('Decrypted buffer data:', decryptedBuffer);
} catch (error) {
  console.error('Buffer encryption failed:', error.message);
}

// Working with Unicode characters
console.log('\nUnicode example:');
const unicodeData = "Hello, 世界! 🌍 Welcome to 数据加密!";
console.log('Unicode data to encrypt:', unicodeData);

try {
  const encryptedUnicode = encryptData(unicodeData, secretKey);
  const decryptedUnicode = decryptData(encryptedUnicode, secretKey);
  console.log('Decrypted unicode data:', decryptedUnicode);
  console.log('Unicode integrity check:', unicodeData === decryptedUnicode ? 'PASS' : 'FAIL');
} catch (error) {
  console.error('Unicode encryption failed:', error.message);
}

console.log('\nExample completed.');
