/**
 * Integration tests for Smart Router functionality
 */

const SmartRouter = require('../../src/core/smart_router');
const { executeCLICommand } = require('../helpers/testUtils');

describe('Smart Router Integration Tests', () => {
  let router;

  beforeAll(async () => {
    // Initialize router for integration tests
    router = new SmartRouter();
    try {
      await router.initialize();
    } catch (error) {
      console.warn('Could not initialize router completely:', error.message);
    }
  });

  describe('Basic Routing', () => {
    test('should handle simple routing commands', async () => {
      const testInputs = [
        'use claude to write code',
        'help me with gemini',
        'please explain with qwen',
        'generate documentation using claude'
      ];

      for (const input of testInputs) {
        const result = await router.smartRoute(input);
        expect(result).toHaveProperty('tool');
        expect(result).toHaveProperty('prompt');
        expect(typeof result.tool).toBe('string');
        expect(typeof result.prompt).toBe('string');
      }
    });

    test('should route to correct tool based on input', async () => {
      const testCases = [
        { input: 'use claude to help', expectedTool: 'claude' },
        { input: 'help with gemini', expectedTool: 'gemini' },
        { input: 'qwen please analyze', expectedTool: 'qwen' },
        { input: 'iflow workflow help', expectedTool: 'iflow' }
      ];

      for (const { input, expectedTool } of testCases) {
        const result = await router.smartRoute(input);
        expect(result.tool).toBe(expectedTool);
      }
    });

    test('should clean input prompts correctly', async () => {
      const testCases = [
        { input: 'use claude to write code', expectedPrompt: 'write code' },
        { input: 'please help with this task', expectedPrompt: 'help with this task' },
        { input: 'using gemini for analysis', expectedPrompt: 'gemini for analysis' }
      ];

      for (const { input, expectedPrompt } of testCases) {
        const result = await router.smartRoute(input);
        expect(result.prompt).toBe(expectedPrompt);
      }
    });
  });

  describe('Tool Detection', () => {
    test('should detect available tools', () => {
      expect(router.tools).toBeDefined();
      expect(typeof router.tools).toBe('object');
      expect(Object.keys(router.tools).length).toBeGreaterThan(0);
    });

    test('should have required tool configurations', () => {
      const requiredTools = ['claude', 'gemini', 'qwen', 'iflow'];

      requiredTools.forEach(toolName => {
        expect(router.tools[toolName]).toBeDefined();
        expect(router.tools[toolName]).toHaveProperty('name');
      });
    });

    test('should handle missing tools gracefully', async () => {
      // Test with a tool that might not exist
      const result = await router.smartRoute('use nonexistenttool to help');
      expect(result.tool).toBe(router.defaultTool); // Should default to claude
    });
  });

  describe('Keyword Matching', () => {
    test('should identify route keywords', () => {
      const routeKeywords = ['use', 'help', 'please', 'write', 'generate', 'explain', 'analyze'];

      routeKeywords.forEach(keyword => {
        expect(router.routeKeywords).toContain(keyword);
      });
    });

    test('should route based on keywords', async () => {
      const keywordTests = [
        { input: 'use some tool', shouldRoute: true },
        { input: 'help me please', shouldRoute: true },
        { input: 'write some code', shouldRoute: true },
        { input: 'generate documentation', shouldRoute: true },
        { input: 'explain this concept', shouldRoute: true },
        { input: 'analyze the data', shouldRoute: true },
        { input: 'random text', shouldRoute: false },
        { input: 'hello world', shouldRoute: false }
      ];

      for (const { input, shouldRoute } of keywordTests) {
        expect(router.shouldRoute(input)).toBe(shouldRoute);
      }
    });
  });

  describe('CLI Integration', () => {
    test('should integrate with CLI command execution', async () => {
      // Test that the router can be used through CLI commands
      const result = await executeCLICommand('call', ['claude', 'test message']);

      // The call command should be recognized (even if it fails due to missing tool)
      expect(result.code !== undefined).toBe(true);
    }, 30000);

    test('should handle cross-CLI communication', async () => {
      // Test various cross-CLI communication patterns
      const patterns = [
        'call claude help me',
        'use gemini to analyze',
        'ask qwen for assistance'
      ];

      for (const pattern of patterns) {
        const [command, ...args] = pattern.split(' ');
        const result = await executeCLICommand(command, args);

        // Should be handled (even if tool is missing)
        expect(result.code !== undefined).toBe(true);
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should handle invalid input gracefully', async () => {
      const invalidInputs = [
        '',
        null,
        undefined,
        123,
        {},
        []
      ];

      for (const input of invalidInputs) {
        try {
          const result = await router.smartRoute(input);
          // Should not throw and should return a valid result
          expect(result).toHaveProperty('tool');
          expect(result).toHaveProperty('prompt');
        } catch (error) {
          // If it throws, it should be a meaningful error
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    test('should handle analyzer errors gracefully', async () => {
      // Mock analyzer to throw error
      const originalAnalyzer = router.analyzer;
      router.analyzer = {
        loadPersistentConfig: jest.fn().mockRejectedValue(new Error('Analyzer error')),
        getCachedAnalysis: jest.fn().mockResolvedValue(null),
        isCacheExpired: jest.fn().mockReturnValue(true),
        analyzeCLI: jest.fn().mockRejectedValue(new Error('Analyzer error'))
      };

      const result = await router.smartRoute('use claude to help');
      expect(result.tool).toBe(router.defaultTool); // Should fallback to default

      // Restore original analyzer
      router.analyzer = originalAnalyzer;
    });
  });

  describe('Performance', () => {
    test('should complete routing quickly', async () => {
      const testInputs = [
        'use claude to help',
        'analyze with gemini',
        'generate with qwen',
        'explain concept using iflow'
      ];

      const startTime = Date.now();

      for (const input of testInputs) {
        await router.smartRoute(input);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should handle multiple concurrent requests', async () => {
      const promises = [];
      const testInputs = [
        'use claude for task 1',
        'use gemini for task 2',
        'use qwen for task 3',
        'use iflow for task 4'
      ];

      for (const input of testInputs) {
        promises.push(router.smartRoute(input));
      }

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toHaveProperty('tool');
        expect(result).toHaveProperty('prompt');
      });
    });
  });

  describe('Caching', () => {
    test('should cache analysis results', async () => {
      // Mock analyzer to track calls
      let analyzeCallCount = 0;
      router.analyzer.analyzeCLI = jest.fn().mockImplementation(async () => {
        analyzeCallCount++;
        return { patterns: { subcommands: [], commands: [] } };
      });

      // First call should trigger analysis
      await router.getOptimizedCLIPattern('claude');
      const firstCallCount = analyzeCallCount;

      // Second call should use cache
      await router.getOptimizedCLIPattern('claude');
      const secondCallCount = analyzeCallCount;

      expect(secondCallCount).toBe(firstCallCount); // Should not increase if cached
    });
  });

  describe('Tool Specific Features', () => {
    test('should handle codex special cases', async () => {
      // Test routing to codex tool
      const result = await router.smartRoute('use codex to write code');
      expect(['codex', router.defaultTool]).toContain(result.tool);
    });

    test('should handle qodercli specific keywords', async () => {
      const result = await router.smartRoute('help with code review');
      // Should recognize 'code' keyword and route to qodercli or default
      expect(['qodercli', router.defaultTool]).toContain(result.tool);
    });

    test('should handle copilot specific keywords', async () => {
      const result = await router.smartRoute('github assistance needed');
      expect(['copilot', router.defaultTool]).toContain(result.tool);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical user requests', async () => {
      const realWorldInputs = [
        'Use Claude to write a Python function for data analysis',
        'Please help me understand this error using Gemini',
        'Can you generate a React component with Qwen',
        'I need to analyze this workflow using iFlow',
        'Write documentation for my API using Claude',
        'Help me debug this code with any available tool'
      ];

      for (const input of realWorldInputs) {
        const result = await router.smartRoute(input);

        expect(result.tool).toBeDefined();
        expect(result.prompt).toBeDefined();
        expect(result.prompt.length).toBeGreaterThan(0);

        // The prompt should be cleaned of tool names and prefixes
        expect(result.prompt.toLowerCase()).not.toContain('use claude');
        expect(result.prompt.toLowerCase()).not.toContain('please');
      }
    });

    test('should maintain context in conversations', async () => {
      const conversationInputs = [
        'use claude to help',
        'now write some code',
        'explain what you did',
        'can you optimize it'
      ];

      const results = [];
      for (const input of conversationInputs) {
        const result = await router.smartRoute(input);
        results.push(result);
      }

      // All should have valid routing
      results.forEach(result => {
        expect(result.tool).toBeDefined();
        expect(result.prompt).toBeDefined();
      });
    });
  });
});
