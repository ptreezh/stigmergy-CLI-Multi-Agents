/**
 * CLI Tool Detector - Unit Tests
 * Tests for CLI availability detection without actual execution
 */

const { CLI_TOOLS } = require('../../src/core/cli_tools');

describe('CLI Tool Detector', () => {
  describe('CLI_TOOLS Configuration', () => {
    test('should have all required CLI tools configured', () => {
      const expectedTools = [
        'claude', 'gemini', 'qwen', 'iflow',
        'qodercli', 'codebuddy', 'copilot', 'codex'
      ];

      expectedTools.forEach(tool => {
        expect(CLI_TOOLS[tool]).toBeDefined();
        expect(CLI_TOOLS[tool]).toHaveProperty('name');
        expect(CLI_TOOLS[tool]).toHaveProperty('version');
        expect(CLI_TOOLS[tool]).toHaveProperty('install');
      });
    });

    test('should have valid installation commands', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.install).toMatch(/npm install/);
      });
    });

    test('should have proper configuration paths', () => {
      Object.values(CLI_TOOLS).forEach(tool => {
        expect(tool.hooksDir).toContain('.'); // Should start with .
        expect(tool.config).toContain('.'); // Should start with .
      });
    });
  });

  describe('CLI Parameter Validation', () => {
    test('should validate tool names correctly', () => {
      const validNames = Object.keys(CLI_TOOLS);
      validNames.forEach(name => {
        expect(name).toMatch(/^[a-z]+$/); // Only lowercase letters
      });
    });
  });
});
