/**
 * Tests for utility functions
 */

const {
  factorial,
  fibonacci,
  fibonacciRecursive,
  max,
  isPrime,
  HashTable,
  parseAndValidateJSON,
  processCSV,
  RESTClient,
  executeCommand,
  executeJSFile,
  encryptData,
  decryptData,
  generateKey
} = require('../../src/utils');

// Mock dependencies
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Utility Functions', () => {
  describe('factorial', () => {
    test('should calculate factorial correctly', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
      expect(factorial(10)).toBe(3628800);
    });

    test('should throw error for negative numbers', () => {
      expect(() => factorial(-1)).toThrow('Factorial is not defined for negative numbers');
      expect(() => factorial(-10)).toThrow('Factorial is not defined for negative numbers');
    });
  });

  describe('fibonacci', () => {
    test('should calculate fibonacci numbers correctly', () => {
      expect(fibonacci(0)).toBe(0);
      expect(fibonacci(1)).toBe(1);
      expect(fibonacci(2)).toBe(1);
      expect(fibonacci(5)).toBe(5);
      expect(fibonacci(10)).toBe(55);
    });

    test('should throw error for negative numbers', () => {
      expect(() => fibonacci(-1)).toThrow('Fibonacci is not defined for negative numbers');
    });
  });

  describe('fibonacciRecursive', () => {
    test('should calculate fibonacci numbers recursively', () => {
      expect(fibonacciRecursive(0)).toBe(0);
      expect(fibonacciRecursive(1)).toBe(1);
      expect(fibonacciRecursive(2)).toBe(1);
      expect(fibonacciRecursive(5)).toBe(5);
    });

    test('should throw error for negative numbers', () => {
      expect(() => fibonacciRecursive(-1)).toThrow('Fibonacci is not defined for negative numbers');
    });
  });

  describe('max', () => {
    test('should return the maximum of two numbers', () => {
      expect(max(5, 3)).toBe(5);
      expect(max(3, 5)).toBe(5);
      expect(max(10, 10)).toBe(10);
      expect(max(-5, -3)).toBe(-3);
    });
  });

  describe('isPrime', () => {
    test('should correctly identify prime numbers', () => {
      expect(isPrime(2)).toBe(true);
      expect(isPrime(3)).toBe(true);
      expect(isPrime(5)).toBe(true);
      expect(isPrime(7)).toBe(true);
      expect(isPrime(11)).toBe(true);
      expect(isPrime(13)).toBe(true);
    });

    test('should correctly identify non-prime numbers', () => {
      expect(isPrime(0)).toBe(false);
      expect(isPrime(1)).toBe(false);
      expect(isPrime(4)).toBe(false);
      expect(isPrime(6)).toBe(false);
      expect(isPrime(8)).toBe(false);
      expect(isPrime(9)).toBe(false);
      expect(isPrime(10)).toBe(false);
    });

    test('should handle large numbers efficiently', () => {
      expect(isPrime(97)).toBe(true); // prime
      expect(isPrime(100)).toBe(false); // not prime
    });
  });

  describe('HashTable', () => {
    let hashTable;

    beforeEach(() => {
      hashTable = new HashTable();
    });

    test('should set and get values', () => {
      hashTable.set('key1', 'value1');
      hashTable.set('key2', 'value2');

      expect(hashTable.get('key1')).toBe('value1');
      expect(hashTable.get('key2')).toBe('value2');
    });

    test('should return undefined for non-existent keys', () => {
      expect(hashTable.get('nonexistent')).toBeUndefined();
    });

    test('should handle collisions', () => {
      // Force collision by using keys that hash to same index
      const smallTable = new HashTable(3);
      smallTable.set('key1', 'value1');
      smallTable.set('key2', 'value2');
      smallTable.set('key3', 'value3');

      expect(smallTable.get('key1')).toBe('value1');
      expect(smallTable.get('key2')).toBe('value2');
      expect(smallTable.get('key3')).toBe('value3');
    });

    test('should return all keys', () => {
      hashTable.set('key1', 'value1');
      hashTable.set('key2', 'value2');
      hashTable.set('key3', 'value3');

      const keys = hashTable.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    test('should return all values', () => {
      hashTable.set('key1', 'value1');
      hashTable.set('key2', 'value2');
      hashTable.set('key3', 'value3');

      const values = hashTable.values();
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toContain('value3');
    });

    test('should return unique keys and values', () => {
      hashTable.set('key1', 'value1');
      hashTable.set('key1', 'value2'); // overwrite
      hashTable.set('key2', 'value1'); // duplicate value

      expect(hashTable.keys()).toEqual(['key1', 'key2']);
      expect(hashTable.values()).toEqual(['value2', 'value1']);
    });
  });

  describe('parseAndValidateJSON', () => {
    test('should parse valid JSON', () => {
      const jsonString = '{"name": "test", "age": 25}';
      const result = parseAndValidateJSON(jsonString);

      expect(result).toEqual({ name: 'test', age: 25 });
    });

    test('should throw error for invalid JSON', () => {
      const invalidJson = '{"name": "test", age: 25}';

      expect(() => parseAndValidateJSON(invalidJson))
        .toThrow('Invalid JSON format');
    });

    test('should validate against schema', () => {
      const jsonString = '{"name": "test", "age": 25}';
      const schema = {
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const result = parseAndValidateJSON(jsonString, schema);
      expect(result).toEqual({ name: 'test', age: 25 });
    });

    test('should throw error for missing required fields', () => {
      const jsonString = '{"name": "test"}';
      const schema = {
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      expect(() => parseAndValidateJSON(jsonString, schema))
        .toThrow("Required field 'age' is missing");
    });

    test('should throw error for wrong type', () => {
      const jsonString = '{"name": "test", "age": "25"}';
      const schema = {
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      expect(() => parseAndValidateJSON(jsonString, schema))
        .toThrow("Field 'age' should be of type number, got string");
    });
  });

  describe('processCSV', () => {
    test('should process CSV with headers', () => {
      const csvData = 'Name,Age,City\nJohn,25,NYC\nJane,30,LA';
      const result = processCSV(csvData);

      expect(result.rowCount).toBe(2);
      expect(result.columnCount).toBe(3);
      expect(result.headers).toEqual(['Name', 'Age', 'City']);
      expect(result.columns.Name.count).toBe(2);
    });

    test('should process CSV without headers', () => {
      const csvData = 'John,25,NYC\nJane,30,LA';
      const result = processCSV(csvData, { hasHeader: false });

      expect(result.rowCount).toBe(2);
      expect(result.columnCount).toBe(3);
      expect(result.headers).toEqual([]);
    });

    test('should handle empty CSV', () => {
      const result = processCSV('');
      expect(result.error).toBe('Empty CSV data');
    });

    test('should calculate numeric statistics', () => {
      const csvData = 'Name,Age\nJohn,25\nJane,30\nBob,35';
      const result = processCSV(csvData);

      expect(result.columns.Age.numericStats).toEqual({
        min: 25,
        max: 35,
        sum: 90,
        average: 30
      });
    });

    test('should handle custom delimiter', () => {
      const csvData = 'Name;Age;City\nJohn;25;NYC';
      const result = processCSV(csvData, { delimiter: ';' });

      expect(result.headers).toEqual(['Name', 'Age', 'City']);
    });
  });

  describe('RESTClient', () => {
    let client;

    beforeEach(() => {
      client = new RESTClient('https://api.example.com');
      mockFetch.mockClear();
    });

    test('should create client with base URL', () => {
      expect(client.baseURL).toBe('https://api.example.com');
      expect(client.defaultHeaders['Content-Type']).toBe('application/json');
    });

    test('should make GET request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ data: 'test' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await client.get('/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.data).toEqual({ data: 'test' });
    });

    test('should make POST request', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ id: 1 })
      };
      mockFetch.mockResolvedValue(mockResponse);

      const data = { name: 'test' };
      const result = await client.post('/endpoint', data);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
      expect(result.data).toEqual({ id: 1 });
    });

    test('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ error: 'Not found' })
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(client.get('/notfound')).rejects.toThrow('HTTP 404: Not Found');
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/endpoint')).rejects.toThrow('Request failed: Network error');
    });
  });

  describe('Encryption functions', () => {
    const secretKey = Buffer.from('a'.repeat(32)); // 32 bytes key

    describe('encryptData', () => {
      test('should encrypt string data', () => {
        const data = 'Hello, World!';
        const encrypted = encryptData(data, secretKey);

        expect(encrypted).toHaveProperty('encryptedData');
        expect(encrypted).toHaveProperty('iv');
        expect(encrypted).toHaveProperty('authTag');
        expect(typeof encrypted.encryptedData).toBe('string');
        expect(typeof encrypted.iv).toBe('string');
        expect(typeof encrypted.authTag).toBe('string');
      });

      test('should encrypt buffer data', () => {
        const data = Buffer.from('Hello, World!');
        const encrypted = encryptData(data, secretKey);

        expect(encrypted).toHaveProperty('encryptedData');
        expect(encrypted).toHaveProperty('iv');
        expect(encrypted).toHaveProperty('authTag');
      });

      test('should throw error for empty data', () => {
        expect(() => encryptData('', secretKey)).toThrow('Data to encrypt cannot be empty');
        expect(() => encryptData(null, secretKey)).toThrow('Data to encrypt cannot be empty');
      });

      test('should throw error for missing secret key', () => {
        expect(() => encryptData('test', null)).toThrow('Secret key is required');
        expect(() => encryptData('test', undefined)).toThrow('Secret key is required');
      });
    });

    describe('decryptData', () => {
      test('should decrypt data correctly', () => {
        const originalData = 'Hello, World!';
        const encrypted = encryptData(originalData, secretKey);
        const decrypted = decryptData(encrypted, secretKey);

        expect(decrypted).toBe(originalData);
      });

      test('should throw error for invalid encrypted object', () => {
        expect(() => decryptData(null, secretKey)).toThrow('Invalid encrypted object');
        expect(() => decryptData({}, secretKey)).toThrow('Invalid encrypted object');
        expect(() => decryptData({ encryptedData: 'test' }, secretKey)).toThrow('Invalid encrypted object');
      });

      test('should throw error for missing secret key', () => {
        const encrypted = encryptData('test', secretKey);
        expect(() => decryptData(encrypted, null)).toThrow('Secret key is required');
      });
    });

    describe('generateKey', () => {
      test('should generate key with default length', () => {
        const key = generateKey();
        expect(key).toBeInstanceOf(Buffer);
        expect(key.length).toBe(32);
      });

      test('should generate key with custom length', () => {
        const key = generateKey(16);
        expect(key).toBeInstanceOf(Buffer);
        expect(key.length).toBe(16);
      });
    });

    describe('Encryption round trip', () => {
      test('should maintain data integrity through encrypt/decrypt cycle', () => {
        const testCases = [
          'Simple string',
          'String with special characters: !@#$%^&*()',
          'Unicode characters: 你好世界 🌍',
          'Very long string: '.repeat(1000)
        ];

        testCases.forEach(testData => {
          const encrypted = encryptData(testData, secretKey);
          const decrypted = decryptData(encrypted, secretKey);
          expect(decrypted).toBe(testData);
        });
      });
    });
  });
});
