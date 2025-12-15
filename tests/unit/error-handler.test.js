// tests/unit/error-handler.test.js

const { errorHandler } = require('../../src/core/error_handler');
const fs = require('fs');
const path = require('path');

describe('Error Handler', () => {
  const testLogFile = path.join(__dirname, '../temp/test-error.log');

  beforeEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  afterEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('logError', () => {
    test('should log error with default level', () => {
      const error = new Error('Test error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      errorHandler.logError(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('Test error')
      );

      consoleSpy.mockRestore();
    });

    test('should log error with custom level', () => {
      const error = new Error('Warning message');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      errorHandler.logError(error, 'WARN', 'TestModule');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.stringContaining('Warning message')
      );

      consoleSpy.mockRestore();
    });

    test('should log error with module context', () => {
      const error = new Error('Module error');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      errorHandler.logError(error, 'ERROR', 'TestModule');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('TestModule'),
        expect.stringContaining('Module error')
      );

      consoleSpy.mockRestore();
    });

    test('should handle string errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      errorHandler.logError('String error message', 'ERROR', 'TestModule');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('String error message')
      );

      consoleSpy.mockRestore();
    });

    test('should handle null/undefined errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => {
        errorHandler.logError(null);
        errorHandler.logError(undefined);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('formatError', () => {
    test('should format Error object correctly', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      const formatted = errorHandler.formatError(error);

      expect(formatted).toContain('Test error');
      expect(formatted).toContain('test.js:1:1');
    });

    test('should format string error correctly', () => {
      const formatted = errorHandler.formatError('Simple error message');

      expect(formatted).toBe('Simple error message');
    });

    test('should handle object errors', () => {
      const error = { message: 'Object error', code: 'TEST_ERROR' };
      const formatted = errorHandler.formatError(error);

      expect(formatted).toContain('Object error');
      expect(formatted).toContain('TEST_ERROR');
    });

    test('should handle null/undefined errors', () => {
      expect(errorHandler.formatError(null)).toBe('Unknown error');
      expect(errorHandler.formatError(undefined)).toBe('Unknown error');
    });
  });

  describe('getLogLevel', () => {
    test('should return correct log level colors', () => {
      expect(errorHandler.getLogLevel('ERROR')).toContain('ERROR');
      expect(errorHandler.getLogLevel('WARN')).toContain('WARN');
      expect(errorHandler.getLogLevel('INFO')).toContain('INFO');
      expect(errorHandler.getLogLevel('DEBUG')).toContain('DEBUG');
    });

    test('should handle unknown log levels', () => {
      const result = errorHandler.getLogLevel('UNKNOWN');
      expect(typeof result).toBe('string');
    });
  });

  describe('Error Types', () => {
    test('should handle different error types', () => {
      const errorTypes = [
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        new SyntaxError('Syntax error'),
        new RangeError('Range error')
      ];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      errorTypes.forEach(error => {
        expect(() => {
          errorHandler.logError(error);
        }).not.toThrow();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Stack Trace Handling', () => {
    test('should handle errors without stack traces', () => {
      const error = new Error('No stack error');
      error.stack = undefined;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => {
        errorHandler.logError(error);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('should handle malformed stack traces', () => {
      const error = new Error('Malformed stack');
      error.stack = 'This is not a valid stack trace';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => {
        errorHandler.logError(error);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    test('should handle large error messages efficiently', () => {
      const largeMessage = 'x'.repeat(10000);
      const error = new Error(largeMessage);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const startTime = Date.now();
      errorHandler.logError(error);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second

      consoleSpy.mockRestore();
    });
  });
});