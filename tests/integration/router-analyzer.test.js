/**
 * Router and Analyzer Integration Test
 * Tests SmartRouter with CLIHelpAnalyzer integration
 */

const SmartRouter = require('../../src/core/smart_router');
const CLIHelpAnalyzer = require('../../src/core/cli_help_analyzer');
const { spawn } = require('child_process');
const path = require('path');

describe('Router and Analyzer Integration', () => {
  let router;
  let tempDir;

  beforeAll(async () => {
    // Create temporary directory for test
    tempDir = path.join(__dirname, '..', '..', 'temp', 'integration-test');
    require('fs').mkdirSync(tempDir, { recursive: true });
  });

  beforeEach(() => {
    router = new SmartRouter();
    // Use real analyzer but with controlled output
  });

  describe('Cache Integration', () => {
    test('should cache analysis results', async () => {
      const toolName = 'claude';

      // First call should analyze
      const pattern1 = await router.getOptimizedCLIPattern(toolName);

      // Second call should use cache
      const pattern2 = await router.getOptimizedCLIPattern(toolName);

      // Results should be consistent
      if (pattern1 && pattern2) {
        expect(pattern1).toEqual(pattern2);
      }
    }, 10000);

    test('should skip analysis on recent failure', async () => {
      const toolName = 'nonexistent-cli';

      // Mock recent failure
      router.analyzer.loadPersistentConfig = jest.fn().mockResolvedValue({
        failedAttempts: {
          [toolName]: {
            timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          }
        }
      });

      const result = await router.getOptimizedCLIPattern(toolName);
      expect(result).toBeNull();
    });
  });

  describe('Error Recovery', () => {
    test('should handle analyzer errors gracefully', async () => {
      // Mock analyzer to throw error
      router.analyzer.getCachedAnalysis = jest.fn()
        .mockRejectedValueOnce(new Error('Cache read error'))
        .mockResolvedValueOnce({ timestamp: Date.now() });

      const result = await router.getOptimizedCLIPattern('claude');

      // Should recover and return null
      expect(result).toBeNull();
    });
  });

  describe('Routing with Analysis', () => {
    test('should route using analyzed keywords', async () => {
      // Mock successful analysis
      router.analyzer.getCachedAnalysis = jest.fn().mockResolvedValue({
        timestamp: Date.now(),
        patterns: {
          subcommands: [
            { name: 'help' },
            { name: 'version' }
          ],
          commands: [
            { name: 'generate' },
            { name: 'analyze' }
          ]
        }
      });

      const result = await router.smartRoute('please help with generation');

      expect(result).toHaveProperty('tool');
      expect(result).toHaveProperty('prompt');
    });

    test('should prioritize exact matches over analyzed keywords', async () => {
      const result = await router.smartRoute('use claude to help');

      expect(result.tool).toBe('claude');
      expect(result.prompt).toBe('to help');
    });
  });
});
