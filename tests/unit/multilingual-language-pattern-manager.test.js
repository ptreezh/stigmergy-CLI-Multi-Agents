// tests/unit/multilingual-language-pattern-manager.test.js

const LanguagePatternManager = require('../../src/core/multilingual/language-pattern-manager');
const path = require('path');

describe('Language Pattern Manager', () => {
  let manager;

  beforeEach(() => {
    manager = new LanguagePatternManager();
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with supported languages', () => {
      expect(manager.supportedLanguages).toBeDefined();
      expect(manager.supportedLanguages.en).toEqual({ name: 'English', direction: 'ltr' });
      expect(manager.supportedLanguages.zh).toEqual({ name: 'Chinese', direction: 'ltr' });
      expect(manager.supportedLanguages.ja).toEqual({ name: 'Japanese', direction: 'ltr' });
      expect(manager.supportedLanguages.ar).toEqual({ name: 'Arabic', direction: 'rtl' });
    });

    test('should load language patterns during initialization', () => {
      expect(manager.languagePatterns).toBeDefined();
      expect(typeof manager.languagePatterns).toBe('object');
    });
  });

  describe('Language Detection', () => {
    test('should detect English as default language', () => {
      const result = manager.detectLanguage();
      expect(result).toBe('en');
    });

    test('should get patterns for supported languages', () => {
      const englishPatterns = manager.getPatterns('en');
      const chinesePatterns = manager.getPatterns('zh');

      expect(Array.isArray(englishPatterns)).toBe(true);
      expect(Array.isArray(chinesePatterns)).toBe(true);
    });

    test('should return empty array for unsupported language', () => {
      const patterns = manager.getPatterns('unsupported');
      expect(patterns).toEqual([]);
    });

    test('should get all patterns', () => {
      const allPatterns = manager.getAllPatterns();
      expect(typeof allPatterns).toBe('object');
    });
  });

  describe('Cross-CLI Request Detection', () => {
    test('should detect Chinese cross-CLI requests', () => {
      const testCases = [
        {
          input: '请用claude帮我写代码',
          expected: { targetCLI: 'claude', task: '写代码', language: 'zh' }
        },
        {
          input: '让qwen生成报告',
          expected: { targetCLI: 'qwen', task: '生成报告', language: 'zh' }
        },
        {
          input: 'claude，帮我分析问题',
          expected: { targetCLI: 'claude', task: '帮我分析问题', language: 'zh' }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = manager.detectCrossCLIRequest(input, 'zh');
        expect(result).toBeTruthy();
        expect(result.targetCLI).toBe(expected.targetCLI);
        expect(result.language).toBe(expected.language);
      });
    });

    test('should detect Japanese cross-CLI requests', () => {
      const testCases = [
        {
          input: 'claudeを使ってコードを書いて',
          expected: { targetCLI: 'claude', language: 'ja' }
        },
        {
          input: 'geminiで翻訳お願いします',
          expected: { targetCLI: 'gemini', language: 'ja' }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = manager.detectCrossCLIRequest(input, 'ja');
        expect(result).toBeTruthy();
        expect(result.targetCLI).toBe(expected.targetCLI);
        expect(result.language).toBe(expected.language);
      });
    });

    test('should detect English cross-CLI requests', () => {
      const testCases = [
        {
          input: 'use claude to write code',
          expected: { targetCLI: 'claude', language: 'en' }
        },
        {
          input: 'please help me with gemini',
          expected: { targetCLI: 'gemini', language: 'en' }
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = manager.detectCrossCLIRequest(input, 'en');
        expect(result).toBeTruthy();
        expect(result.targetCLI).toBe(expected.targetCLI);
        expect(result.language).toBe(expected.language);
      });
    });

    test('should return null for invalid CLI names', () => {
      const result = manager.detectCrossCLIRequest('请用invalidcli帮我写代码', 'zh');
      expect(result).toBeNull();
    });

    test('should return null for non-matching patterns', () => {
      const result = manager.detectCrossCLIRequest('这是一个普通的句子', 'zh');
      expect(result).toBeNull();
    });

    test('should fall back to English when preferred language fails', () => {
      const result = manager.detectCrossCLIRequest('use claude to write code', 'unsupported');
      expect(result).toBeTruthy();
      expect(result.targetCLI).toBe('claude');
      expect(result.language).toBe('en');
    });
  });

  describe('Pattern Matching', () => {
    test('should match patterns correctly', () => {
      // Test with actual Chinese patterns
      const result = manager.matchPatterns('请用claude帮我写代码', 'zh');
      expect(result).toBeTruthy();
      expect(result.targetCLI).toBe('claude');
      expect(result.task).toBe('写代码');
      expect(result.language).toBe('zh');
      expect(result.patternName).toBeDefined();
    });

    test('should return null for unmatched input', () => {
      const result = manager.matchPatterns('this does not match', 'en');
      expect(result).toBeNull();
    });

    test('should return null for unsupported language', () => {
      const result = manager.matchPatterns('some input', 'unsupported');
      expect(result).toBeNull();
    });
  });
});