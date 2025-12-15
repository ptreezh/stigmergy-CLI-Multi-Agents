/**
 * Tests for CLI Parameter Handler functionality
 */

const CLIParameterHandler = require('../../src/core/cli_parameter_handler');

describe('CLI Parameter Handler', () => {
  let handler;

  beforeEach(() => {
    handler = new CLIParameterHandler();
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      expect(handler.options).toBeDefined();
      expect(handler.commands).toBeDefined();
    });
  });

  describe('parseArguments', () => {
    test('should parse simple arguments correctly', () => {
      const args = ['status', '--verbose'];
      const result = handler.parseArguments(args);

      expect(result.command).toBe('status');
      expect(result.options.verbose).toBe(true);
    });

    test('should parse arguments with values', () => {
      const args = ['call', 'claude', '--timeout', '5000'];
      const result = handler.parseArguments(args);

      expect(result.command).toBe('call');
      expect(result.args).toEqual(['claude']);
      expect(result.options.timeout).toBe('5000');
    });

    test('should handle shorthand options', () => {
      const args = ['-v', '-h'];
      const result = handler.parseArguments(args);

      expect(result.options.version).toBe(true);
      expect(result.options.help).toBe(true);
    });

    test('should handle empty arguments', () => {
      const result = handler.parseArguments([]);

      expect(result.command).toBeNull();
      expect(result.args).toEqual([]);
      expect(result.options).toEqual({});
    });

    test('should parse complex argument combinations', () => {
      const args = ['call', 'claude', 'write code', '--timeout', '10000', '--verbose'];
      const result = handler.parseArguments(args);

      expect(result.command).toBe('call');
      expect(result.args).toEqual(['claude', 'write code']);
      expect(result.options.timeout).toBe('10000');
      expect(result.options.verbose).toBe(true);
    });
  });

  describe('validateCommand', () => {
    test('should validate known commands', () => {
      expect(handler.validateCommand('status')).toBe(true);
      expect(handler.validateCommand('scan')).toBe(true);
      expect(handler.validateCommand('call')).toBe(true);
    });

    test('should reject unknown commands', () => {
      expect(handler.validateCommand('unknown')).toBe(false);
      expect(handler.validateCommand('invalid')).toBe(false);
    });
  });

  describe('validateOptions', () => {
    test('should validate valid options', () => {
      const options = { timeout: '5000', verbose: true };
      const result = handler.validateOptions(options);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect invalid option values', () => {
      const options = { timeout: 'invalid' };
      const result = handler.validateOptions(options);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing required options', () => {
      const options = {};
      const result = handler.validateOptions(options, { required: ['timeout'] });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required option: timeout');
    });
  });

  describe('formatHelp', () => {
    test('should format help text correctly', () => {
      const help = handler.formatHelp();

      expect(help).toContain('Usage:');
      expect(help).toContain('Options:');
      expect(help).toContain('Commands:');
    });

    test('should include command descriptions', () => {
      const help = handler.formatHelp();

      expect(help).toContain('status');
      expect(help).toContain('scan');
      expect(help).toContain('call');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed arguments gracefully', () => {
      const malformedArgs = ['--', 'command', '--invalid-option'];

      expect(() => {
        const result = handler.parseArguments(malformedArgs);
        expect(result.command).toBeDefined();
      }).not.toThrow();
    });

    test('should handle null arguments', () => {
      expect(() => {
        const result = handler.parseArguments(null);
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    test('should handle undefined arguments', () => {
      expect(() => {
        const result = handler.parseArguments(undefined);
        expect(result).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Advanced Features', () => {
    test('should handle nested subcommands', () => {
      const args = ['config', 'set', 'key', 'value'];
      const result = handler.parseArguments(args);

      expect(result.command).toBe('config');
      expect(result.args).toEqual(['set', 'key', 'value']);
    });

    test('should handle argument parsing with quotes', () => {
      const args = ['call', 'claude', 'write "hello world"'];
      const result = handler.parseArguments(args);

      expect(result.command).toBe('call');
      expect(result.args).toEqual(['claude', 'write "hello world"']);
    });

    test('should handle option negation', () => {
      const args = ['--no-verbose', '--no-color'];
      const result = handler.parseArguments(args);

      expect(result.options.verbose).toBe(false);
      expect(result.options.color).toBe(false);
    });
  });
});
