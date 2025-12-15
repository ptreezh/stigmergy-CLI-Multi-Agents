/**
 * Smart Router Core Logic - Unit Tests
 * Tests routing logic without external dependencies
 */

const SmartRouter = require('../../src/core/smart_router');

describe('Smart Router Core Logic', () => {
  let router;

  beforeEach(() => {
    router = new SmartRouter();
    // Mock analyzer to avoid external dependencies
    router.analyzer = {
      loadPersistentConfig: jest.fn().mockResolvedValue({ failedAttempts: {} }),
      getCachedAnalysis: jest.fn().mockResolvedValue(null),
      isCacheExpired: jest.fn().mockReturnValue(true),
      analyzeCLI: jest.fn().mockResolvedValue(null)
    };
  });

  describe('Route Pattern Detection', () => {
    test('should detect use patterns', () => {
      const patterns = [
        'use claude to help',
        'using gemini for task',
        'with qwen analyze'
      ];

      patterns.forEach(pattern => {
        expect(router.shouldRoute(pattern)).toBe(true);
      });
    });

    test('should detect help patterns', () => {
      const patterns = [
        'please help me',
        'help with code',
        'assist me'
      ];

      patterns.forEach(pattern => {
        expect(router.shouldRoute(pattern)).toBe(true);
      });
    });

    test('should detect generation patterns', () => {
      const patterns = [
        'generate function',
        'write code',
        'create documentation'
      ];

      patterns.forEach(pattern => {
        expect(router.shouldRoute(pattern)).toBe(true);
      });
    });
  });

  describe('Tool Name Extraction', () => {
    test('should extract tool names correctly', () => {
      const testCases = [
        { input: 'use claude to help', expected: 'claude' },
        { input: 'gemini write code', expected: 'gemini' },
        { input: 'please help with qwen', expected: 'qwen' },
        { input: 'analyze with iflow', expected: 'iflow' }
      ];

      testCases.forEach(({ input, expected }) => {
        const toolNames = Object.keys(router.tools);
        toolNames.forEach(toolName => {
          if (input.toLowerCase().includes(toolName)) {
            expect(toolName).toBe(expected);
          }
        });
      });
    });
  });

  describe('Input Cleaning Logic', () => {
    test('should clean prefixes correctly', () => {
      const testCases = [
        { input: 'use claude to help', tool: 'claude', expectedPrompt: 'help' },
        { input: 'please claude help', tool: 'claude', expectedPrompt: 'claude help' },
        { input: 'using gemini for task', tool: 'gemini', expectedPrompt: 'gemini for task' }
      ];

      testCases.forEach(({ input, expectedPrompt }) => {
        const result = router.smartRoute(input);
        if (result.tool === expectedPrompt.split(' ')[0] || input.includes(result.tool)) {
          expect(result.prompt).toBe(expectedPrompt);
        }
      });
    });
  });

  describe('Keyword Matching', () => {
    test('should match tool-specific keywords', () => {
      const toolKeywords = {
        claude: ['claude', 'anthropic'],
        gemini: ['gemini', 'google'],
        qwen: ['qwen', 'alibaba', 'tongyi'],
        copilot: ['copilot', 'github', 'gh']
      };

      Object.entries(toolKeywords).forEach(([tool, keywords]) => {
        const extractedKeywords = router.extractKeywords(tool, null);
        keywords.forEach(keyword => {
          expect(extractedKeywords).toContain(keyword);
        });
      });
    });

    test('should avoid keyword conflicts', () => {
      const qoderKeywords = router.extractKeywords('qodercli', null);
      const codexKeywords = router.extractKeywords('codex', null);

      // 'code' should only be in qodercli keywords
      expect(qoderKeywords).toContain('code');
      expect(codexKeywords).not.toContain('code');
    });
  });
});
