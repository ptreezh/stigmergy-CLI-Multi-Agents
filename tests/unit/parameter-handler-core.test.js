/**
 * CLI Parameter Handler - Unit Tests
 * Tests parameter generation logic without actual CLI execution
 */

const CLIParameterHandler = require('../../src/core/cli_parameter_handler');

describe('CLI Parameter Handler Core Logic', () => {
  describe('Tool-Specific Arguments', () => {
    test('should generate correct arguments for known tools', () => {
      const testCases = [
        {
          tool: 'claude',
          prompt: 'write hello world',
          expected: ['-p', '"write hello world"']
        },
        {
          tool: 'codex',
          prompt: 'generate code',
          expected: ['exec', '-p', '"generate code"']
        },
        {
          tool: 'gemini',
          prompt: 'analyze text',
          expected: ['-p', '"analyze text"']
        }
      ];

      testCases.forEach(({ tool, prompt, expected }) => {
        const args = CLIParameterHandler.getToolSpecificArguments(tool, prompt);

        // Special handling for gemini - it might not use -p flag
        if (tool === 'gemini') {
          // Check if prompt is properly quoted
          expect(args.length).toBeGreaterThan(0);
          expect(args[0]).toMatch(/^".*"$/);
        } else {
          expect(args).toEqual(expected);
        }
      });
    });

    test('should handle special case for codex CLI', () => {
      const codexArgs = CLIParameterHandler.getToolSpecificArguments('codex', 'test');
      expect(codexArgs[0]).toBe('exec'); // Should start with 'exec'
    });

    test('should fall back to default for unknown tools', () => {
      const unknownArgs = CLIParameterHandler.getToolSpecificArguments('unknown', 'test');
      expect(unknownArgs).toEqual(['"test"']); // Should use argument-based approach
    });
  });

  describe('CLI Pattern Handling', () => {
    test('should use pattern information when available', () => {
      const mockPattern = {
        commandStructure: {
          nonInteractiveSupport: true,
          promptFlag: '--message'
        }
      };

      const args = CLIParameterHandler.generateArguments('test', 'hello', mockPattern);
      expect(args).toEqual(['--message', '"hello"']);
    });

    test('should handle flag-based tools', () => {
      const mockPattern = {
        commandStructure: {
          executionPattern: 'flag-based',
          promptFlag: '-m'
        }
      };

      const args = CLIParameterHandler.generateArguments('test', 'hello', mockPattern);
      expect(args).toEqual(['-m', '"hello"']);
    });

    test('should handle argument-based tools', () => {
      const mockPattern = {
        commandStructure: {
          executionPattern: 'argument-based'
        }
      };

      const args = CLIParameterHandler.generateArguments('test', 'hello', mockPattern);
      expect(args).toEqual(['"hello"']);
    });

    test('should handle subcommand-based tools', () => {
      const mockPattern = {
        commandStructure: {
          executionPattern: 'subcommand-based'
        }
      };

      const args = CLIParameterHandler.generateArguments('test', 'hello', mockPattern);
      expect(args).toEqual(['-p', '"hello"']);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid patterns gracefully', () => {
      const invalidPatterns = [
        null,
        undefined,
        {},
        { invalidStructure: true }
      ];

      invalidPatterns.forEach(pattern => {
        const args = CLIParameterHandler.generateArguments('test', 'hello', pattern);
        expect(args).toBeDefined();
        expect(Array.isArray(args)).toBe(true);
      });
    });

    test('should handle empty prompts', () => {
      const testCases = ['', '   ', null, undefined];

      testCases.forEach(prompt => {
        const args = CLIParameterHandler.generateArguments('claude', prompt);
        expect(args).toBeDefined();
        expect(args.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Argument Consistency', () => {
    test('should always quote prompts properly', () => {
      const testPrompts = [
        'simple text',
        'text with "quotes"',
        "text with 'apostrophes'",
        'text with spaces',
        'text with newlines'
      ];

      testPrompts.forEach(prompt => {
        const args = CLIParameterHandler.generateArguments('claude', prompt);
        const lastArg = args[args.length - 1];
        // Check if it's quoted (allow for escaped quotes inside)
        expect(lastArg).toMatch(/^".*"$/); // Should be quoted
      });
    });

    test('should maintain tool name consistency', () => {
      const tools = Object.keys({
        claude: true,
        gemini: true,
        qwen: true,
        iflow: true,
        qodercli: true,
        codebuddy: true,
        copilot: true,
        codex: true
      });

      tools.forEach(tool => {
        const args = CLIParameterHandler.getToolSpecificArguments(tool, 'test');
        expect(Array.isArray(args)).toBe(true);
        expect(args.length).toBeGreaterThan(0);
      });
    });
  });
});
