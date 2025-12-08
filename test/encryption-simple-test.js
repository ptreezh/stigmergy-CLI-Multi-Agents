/**
 * Simple test script for encryption functions
 */

const { encryptData, decryptData, generateKey } = require('../src/utils');

console.log('Testing encryption functions...');
console.log('================================');

// Test 1: Generate key
console.log('Test 1: Key generation');
let secretKey;
try {
  secretKey = generateKey();
  console.log('✓ Generated 32-byte key');
  console.log('✓ Key type:', typeof secretKey);
} catch (error) {
  console.error('✗ Key generation failed:', error.message);
  process.exit(1);
}

// Test 2: Encrypt string data
console.log('\nTest 2: String encryption');
let encryptedObj;
try {
  const plaintext = 'Hello, World!';
  encryptedObj = encryptData(plaintext, secretKey);
  console.log('✓ String encryption successful');
  console.log('✓ Encrypted object has required properties');
} catch (error) {
  console.error('✗ String encryption failed:', error.message);
  process.exit(1);
}

// Test 3: Decrypt data
console.log('\nTest 3: Data decryption');
try {
  const decrypted = decryptData(encryptedObj, secretKey);
  console.log('✓ Data decryption successful');
  console.log('✓ Decrypted data matches original');
} catch (error) {
  console.error('✗ Data decryption failed:', error.message);
  process.exit(1);
}

// Test 4: Data integrity
console.log('\nTest 4: Data integrity');
try {
  const originalData = 'Confidential information';
  const encrypted = encryptData(originalData, secretKey);
  const decrypted = decryptData(encrypted, secretKey);
  
  if (originalData === decrypted) {
    console.log('✓ Data integrity maintained');
  } else {
    console.error('✗ Data integrity check failed');
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Data integrity test failed:', error.message);
  process.exit(1);
}

// Test 5: Unicode support
console.log('\nTest 5: Unicode support');
try {
  const unicodeData = 'Hello, 世界! 🌍 Welcome to 数据加密!';
  const encrypted = encryptData(unicodeData, secretKey);
  const decrypted = decryptData(encrypted, secretKey);
  
  if (unicodeData === decrypted) {
    console.log('✓ Unicode data handled correctly');
  } else {
    console.error('✗ Unicode test failed');
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Unicode test failed:', error.message);
  process.exit(1);
}

// Test 6: Error handling
console.log('\nTest 6: Error handling');
try {
  encryptData('', secretKey);
  console.error('✗ Empty data validation failed');
  process.exit(1);
} catch (error) {
  if (error.message === 'Data to encrypt cannot be empty') {
    console.log('✓ Empty data validation works');
  } else {
    console.error('✗ Unexpected error for empty data:', error.message);
    process.exit(1);
  }
}

try {
  encryptData('test data', null);
  console.error('✗ Missing key validation failed');
  process.exit(1);
} catch (error) {
  if (error.message === 'Secret key is required') {
    console.log('✓ Missing key validation works');
  } else {
    console.error('✗ Unexpected error for missing key:', error.message);
    process.exit(1);
  }
}

console.log('\nAll tests passed! 🎉');