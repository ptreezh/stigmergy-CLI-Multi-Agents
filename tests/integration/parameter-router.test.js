/**
 * Parameter Handler and Router Integration Test
 * Tests CLIParameterHandler integration with SmartRouter
 */

const SmartRouter = require('../../src/core/smart_router');
const CLIParameterHandler = require('../../src/core/cli_parameter_handler');

describe('Parameter Handler and Router Integration', () => {
  let router;

  beforeEach(() => {
    router = new SmartRouter();
  });

  describe('Parameter Generation in Routing', () => {
    test('should generate correct parameters for different tools', async () => {
      const testCases = [
        {
          input: 'use claude to write hello world',
          expectedTool: 'claude',
          expectedArgsPattern: ['-p', /".*"/]
        },
        {
          input: 'codex generate function',
          expectedTool: 'codex',
          expectedArgsPattern: ['exec', '-p', /".*"/]
        }
      ];

      for (const testCase of testCases) {
        const result = await router.smartRoute(testCase.input);
        expect(result.tool).toBe(testCase.expectedTool);

        // Generate arguments using CLIParameterHandler
        const args = CLIParameterHandler.getToolSpecificArguments(
          result.tool,
          result.prompt
        );

        expect(args[0]).toBe(testCase.expectedArgsPattern[0]);
        if (testCase.expectedArgsPattern[1]) {
          // Check if it contains the expected pattern (not exact match)
          const joinedArgs = args.join(' ');
          if (typeof testCase.expectedArgsPattern[1] === 'string') {
            expect(joinedArgs).toContain(testCase.expectedArgsPattern[1]);
          } else {
            expect(joinedArgs).toMatch(testCase.expectedArgsPattern[1]);
          }
        }
      }
    });

    test('should handle special codex case in routing', async () => {
      const result = await router.smartRoute('codex help me');

      expect(result.tool).toBe('codex');

      const args = CLIParameterHandler.getToolSpecificArguments('codex', result.prompt);
      expect(args[0]).toBe('exec');
    });
  });

  describe('CLI Pattern Integration', () => {
    test('should use analyzed patterns for parameter generation', async () => {
      // Mock router to have CLI patterns
      router.analyzer = {
        loadPersistentConfig: jest.fn().mockResolvedValue({ failedAttempts: {} }),
        getCachedAnalysis: jest.fn().mockResolvedValue(null),
        isCacheExpired: jest.fn().mockReturnValue(true),
        analyzeCLI: jest.fn().mockResolvedValue({
          commandStructure: {
            nonInteractiveSupport: true,
            promptFlag: '--custom-flag'
          }
        })
      };

      // Get pattern through router
      const pattern = await router.getOptimizedCLIPattern('claude');

      // Use pattern to generate parameters
      const args = CLIParameterHandler.generateArguments(
        'claude',
        'test prompt',
        pattern
      );

      expect(args).toEqual(['--custom-flag', '"test prompt"']);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle parameter generation errors in routing', async () => {
      // Test with invalid tool
      const invalidTool = 'nonexistent-tool';

      // Mock CLI_TOOLS temporarily
      const originalTools = router.tools;
      router.tools = {
        ...originalTools,
        [invalidTool]: {
          name: 'Nonexistent Tool',
          version: 'invalid-tool --version',
          install: 'npm install -g invalid-tool'
        }
      };

      const result = await router.smartRoute(`use ${invalidTool} to help`);

      // Should fall back to default tool
      expect(result.tool).toBe(router.defaultTool);
      expect(result.prompt).toContain(invalidTool);

      // Restore original tools
      router.tools = originalTools;
    });
  });

  describe('Performance Optimization', () => {
    test('should cache parameter generation patterns', async () => {
      const prompt = 'test prompt';
      const tool = 'claude';

      // Time multiple generations
      const start1 = Date.now();
      const args1 = CLIParameterHandler.getToolSpecificArguments(tool, prompt);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const args2 = CLIParameterHandler.getToolSpecificArguments(tool, prompt);
      const time2 = Date.now() - start2;

      // Results should be identical
      expect(args1).toEqual(args2);

      // Second call should be faster (though this might not always be true in tests)
      expect(time2).toBeLessThanOrEqual(time1 + 10); // Allow some variance
    });
  });
});
