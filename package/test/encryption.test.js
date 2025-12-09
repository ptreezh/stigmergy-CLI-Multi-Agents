/**
 * Test suite for encryption functions
 */

const { encryptData, decryptData, generateKey } = require('../src/utils');

describe('Encryption Functions', () => {
  let secretKey;
  
  beforeEach(() => {
    // Generate a new key for each test
    secretKey = generateKey();
  });
  
  describe('generateKey()', () => {
    test('should generate a 32-byte key by default', () => {
      const key = generateKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });
    
    test('should generate a key of specified length', () => {
      const key = generateKey(16);
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(16);
    });
  });
  
  describe('encryptData()', () => {
    test('should encrypt string data', () => {
      const plaintext = 'Hello, World!';
      const encryptedObj = encryptData(plaintext, secretKey);
      
      expect(encryptedObj).toHaveProperty('encryptedData');
      expect(encryptedObj).toHaveProperty('iv');
      expect(encryptedObj).toHaveProperty('authTag');
      expect(typeof encryptedObj.encryptedData).toBe('string');
      expect(typeof encryptedObj.iv).toBe('string');
      expect(typeof encryptedObj.authTag).toBe('string');
    });
    
    test('should encrypt buffer data', () => {
      const plaintext = Buffer.from('Hello, World!', 'utf8');
      const encryptedObj = encryptData(plaintext, secretKey);
      
      expect(encryptedObj).toHaveProperty('encryptedData');
      expect(encryptedObj).toHaveProperty('iv');
      expect(encryptedObj).toHaveProperty('authTag');
    });
    
    test('should throw error for empty data', () => {
      expect(() => encryptData('', secretKey)).toThrow('Data to encrypt cannot be empty');
      expect(() => encryptData(null, secretKey)).toThrow('Data to encrypt cannot be empty');
      expect(() => encryptData(undefined, secretKey)).toThrow('Data to encrypt cannot be empty');
    });
    
    test('should throw error for missing secret key', () => {
      expect(() => encryptData('test data', null)).toThrow('Secret key is required');
      expect(() => encryptData('test data', undefined)).toThrow('Secret key is required');
    });
  });
  
  describe('decryptData()', () => {
    test('should decrypt encrypted data correctly', () => {
      const plaintext = 'Secret message for testing';
      const encryptedObj = encryptData(plaintext, secretKey);
      const decrypted = decryptData(encryptedObj, secretKey);
      
      expect(decrypted).toBe(plaintext);
    });
    
    test('should decrypt buffer data correctly', () => {
      const plaintext = Buffer.from('Secret message for testing', 'utf8');
      const encryptedObj = encryptData(plaintext, secretKey);
      const decrypted = decryptData(encryptedObj, secretKey);
      
      expect(decrypted).toBe('Secret message for testing');
    });
    
    test('should throw error for invalid encrypted object', () => {
      expect(() => decryptData({}, secretKey)).toThrow('Invalid encrypted object');
      expect(() => decryptData({ encryptedData: 'test' }, secretKey)).toThrow('Invalid encrypted object');
      expect(() => decryptData(null, secretKey)).toThrow('Invalid encrypted object');
      expect(() => decryptData(undefined, secretKey)).toThrow('Invalid encrypted object');
    });
    
    test('should throw error for missing secret key', () => {
      const encryptedObj = encryptData('test data', secretKey);
      expect(() => decryptData(encryptedObj, null)).toThrow('Secret key is required');
      expect(() => decryptData(encryptedObj, undefined)).toThrow('Secret key is required');
    });
    
    test('should throw error for tampered data', () => {
      const plaintext = 'Original message';
      const encryptedObj = encryptData(plaintext, secretKey);
      
      // Tamper with the encrypted data
      encryptedObj.encryptedData = 'tampered' + encryptedObj.encryptedData;
      
      expect(() => decryptData(encryptedObj, secretKey)).toThrow();
    });
  });
  
  describe('encrypt/decrypt integration', () => {
    test('should maintain data integrity through encrypt/decrypt cycle', () => {
      const originalData = 'This is a test of the encryption system.';
      const encryptedObj = encryptData(originalData, secretKey);
      const decryptedData = decryptData(encryptedObj, secretKey);
      
      expect(decryptedData).toBe(originalData);
    });
    
    test('should work with unicode characters', () => {
      const originalData = 'Hello, 世界! 🌍 💻';
      const encryptedObj = encryptData(originalData, secretKey);
      const decryptedData = decryptData(encryptedObj, secretKey);
      
      expect(decryptedData).toBe(originalData);
    });
    
    test('should work with empty strings', () => {
      const originalData = '';
      const encryptedObj = encryptData(originalData, secretKey);
      const decryptedData = decryptData(encryptedObj, secretKey);
      
      expect(decryptedData).toBe(originalData);
    });
  });
});