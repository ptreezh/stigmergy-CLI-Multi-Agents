/**
 * Tests for SmartRouter class
 */

const SmartRouter = require('../../src/core/smart_router');
const { CLI_TOOLS } = require('../../src/core/cli_tools');

// Mock dependencies
jest.mock('../../src/core/cli_help_analyzer');
jest.mock('../../src/core/error_handler');

describe('SmartRouter', () => {
  let router;

  beforeEach(() => {
    router = new SmartRouter();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(router.tools).toBe(CLI_TOOLS);
      expect(router.defaultTool).toBe('claude');
      expect(router.routeKeywords).toContain('use');
      expect(router.routeKeywords).toContain('help');
      expect(router.routeKeywords).toContain('write');
    });

    test('should initialize recentFailures map', () => {
      expect(router.recentFailures).toBeInstanceOf(Map);
      expect(router.recentFailures.size).toBe(0);
    });
  });

  describe('shouldRoute', () => {
    test('should return true for route keywords', () => {
      expect(router.shouldRoute('use claude to help me')).toBe(true);
      expect(router.shouldRoute('please write some code')).toBe(true);
      expect(router.shouldRoute('explain this concept')).toBe(true);
      expect(router.shouldRoute('generate documentation')).toBe(true);
    });

    test('should return false for non-route keywords', () => {
      expect(router.shouldRoute('hello world')).toBe(false);
      expect(router.shouldRoute('simple question')).toBe(false);
      expect(router.shouldRoute('random text')).toBe(false);
    });

    test('should be case insensitive', () => {
      expect(router.shouldRoute('USE claude')).toBe(true);
      expect(router.shouldRoute('Please HELP')).toBe(true);
      expect(router.shouldRoute('Write CODE')).toBe(true);
    });
  });

  describe('extractKeywords', () => {
    test('should return tool name and tool-specific keywords', () => {
      const keywords = router.extractKeywords('claude', null);
      expect(keywords).toContain('claude');
      expect(keywords).toContain('anthropic');
    });

    test('should return unique keywords only', () => {
      const cliPattern = {
        patterns: {
          subcommands: [
            { name: 'help' },
            { name: 'version' },
            { name: 'help' } // duplicate
          ],
          commands: [
            { name: 'generate' },
            { name: 'analyze' }
          ]
        }
      };

      const keywords = router.extractKeywords('claude', cliPattern);
      expect(keywords).toContain('claude');
      expect(keywords).toContain('anthropic');
      expect(keywords).toContain('help');
      expect(keywords).toContain('version');
      expect(keywords).toContain('generate');
      expect(keywords).toContain('analyze');

      // Check no duplicates
      const uniqueKeywords = [...new Set(keywords)];
      expect(keywords).toEqual(uniqueKeywords);
    });

    test('should handle null cliPattern', () => {
      const keywords = router.extractKeywords('gemini', null);
      expect(keywords).toContain('gemini');
      expect(keywords).toContain('google');
    });
  });

  describe('isRecentFailure', () => {
    test('should return true for failures less than 1 hour ago', () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      expect(router.isRecentFailure(thirtyMinutesAgo)).toBe(true);
    });

    test('should return false for failures more than 1 hour ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      expect(router.isRecentFailure(twoHoursAgo)).toBe(false);
    });

    test('should return false for exactly 1 hour ago', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

      expect(router.isRecentFailure(oneHourAgo)).toBe(false);
    });
  });

  describe('smartRoute', () => {
    beforeEach(() => {
      // Mock analyzer methods
      router.analyzer = {
        loadPersistentConfig: jest.fn().mockResolvedValue({ failedAttempts: {} }),
        getCachedAnalysis: jest.fn().mockResolvedValue(null),
        isCacheExpired: jest.fn().mockReturnValue(true),
        analyzeCLI: jest.fn().mockResolvedValue(null)
      };
    });

    test('should route to exact tool name match', async () => {
      const result = await router.smartRoute('use claude to write code');
      expect(result.tool).toBe('claude');
      // The input cleaning should remove "claude" and prefixes
      expect(result.prompt).toBe('to write code');
    });

    test('should route to tool mentioned in input', async () => {
      const result = await router.smartRoute('help me with gemini');
      expect(result.tool).toBe('gemini');
      // Should clean the tool name and extract remaining text
      expect(result.prompt).toBe('help me with');
    });

    test('should clean input by removing route prefixes', async () => {
      const result = await router.smartRoute('please use claude to help');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('to help');
    });

    test('should default to claude when no tool match found', async () => {
      const result = await router.smartRoute('random text without tools');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('random text without tools');
    });

    test('should handle empty input', async () => {
      const result = await router.smartRoute('');
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('');
    });

    test('should handle null/undefined input', async () => {
      const result1 = await router.smartRoute(null);
      const result2 = await router.smartRoute(undefined);

      expect(result1.tool).toBe('claude');
      expect(result2.tool).toBe('claude');
    });

    test('should prioritize exact tool matches over keyword matches', async () => {
      const result = await router.smartRoute('use qodercli for code review');
      expect(result.tool).toBe('qodercli');
    });

    test('should skip analysis for short inputs unless tool is commonly used', async () => {
      const shortInput = 'help';

      const result = await router.smartRoute(shortInput);
      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe(shortInput);
    });
  });

  describe('getOptimizedCLIPattern', () => {
    beforeEach(() => {
      router.analyzer = {
        loadPersistentConfig: jest.fn(),
        getCachedAnalysis: jest.fn(),
        isCacheExpired: jest.fn(),
        analyzeCLI: jest.fn()
      };
    });

    test('should return cached analysis if available and not expired', async () => {
      const cachedData = { timestamp: Date.now(), patterns: {} };
      router.analyzer.getCachedAnalysis.mockResolvedValue(cachedData);
      router.analyzer.isCacheExpired.mockReturnValue(false);
      router.analyzer.loadPersistentConfig.mockResolvedValue({ failedAttempts: {} });

      const result = await router.getOptimizedCLIPattern('claude');
      expect(result).toBe(cachedData);
    });

    test('should skip analysis if recent failure occurred', async () => {
      const recentFailure = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const cachedData = { timestamp: Date.now(), patterns: {} };

      router.analyzer.loadPersistentConfig.mockResolvedValue({
        failedAttempts: { claude: { timestamp: recentFailure } }
      });
      router.analyzer.getCachedAnalysis.mockResolvedValue(cachedData);

      const result = await router.getOptimizedCLIPattern('claude');
      expect(result).toBe(cachedData);
    });

    test('should analyze CLI if no cache and no recent failure', async () => {
      const analysisResult = { patterns: {} };

      router.analyzer.loadPersistentConfig.mockResolvedValue({ failedAttempts: {} });
      router.analyzer.getCachedAnalysis.mockResolvedValue(null);
      router.analyzer.analyzeCLI.mockResolvedValue(analysisResult);

      const result = await router.getOptimizedCLIPattern('claude');
      expect(result).toBe(analysisResult);
      expect(router.analyzer.analyzeCLI).toHaveBeenCalledWith('claude');
    });

    test('should handle errors gracefully', async () => {
      router.analyzer.loadPersistentConfig.mockResolvedValue({ failedAttempts: {} });
      router.analyzer.getCachedAnalysis.mockRejectedValue(new Error('Test error'));

      const result = await router.getOptimizedCLIPattern('claude');
      expect(result).toBeNull();
    });
  });

  describe('Tool-specific keywords', () => {
    test('should include correct keywords for each tool', () => {
      const toolTests = [
        { tool: 'claude', expected: ['claude', 'anthropic'] },
        { tool: 'gemini', expected: ['gemini', 'google'] },
        { tool: 'qwen', expected: ['qwen', 'alibaba', 'tongyi'] },
        { tool: 'iflow', expected: ['iflow', 'workflow', 'intelligent'] },
        { tool: 'qodercli', expected: ['qodercli', 'code'] },
        { tool: 'codebuddy', expected: ['codebuddy', 'buddy', 'assistant'] },
        { tool: 'copilot', expected: ['copilot', 'github', 'gh'] },
        { tool: 'codex', expected: ['codex', 'openai', 'gpt'] }
      ];

      toolTests.forEach(({ tool, expected }) => {
        const keywords = router.extractKeywords(tool, null);
        expected.forEach(keyword => {
          expect(keywords).toContain(keyword);
        });
      });
    });
  });

  describe('Input cleaning', () => {
    test('should remove various prefixes correctly', async () => {
      const testCases = [
        { input: 'use claude to help', expected: 'help' },
        { input: 'please claude help me', expected: 'claude help me' },
        { input: 'help with claude', expected: 'with' },
        { input: 'using claude for task', expected: 'claude for task' },
        { input: 'with claude', expected: 'claude' }
      ];

      for (const testCase of testCases) {
        const result = await router.smartRoute(testCase.input);
        if (result.tool === 'claude') {
          expect(result.prompt).toBe(testCase.expected);
        }
      }
    });
  });
});
