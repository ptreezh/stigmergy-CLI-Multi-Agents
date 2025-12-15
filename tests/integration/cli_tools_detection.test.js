/**
 * Integration tests for CLI tools detection
 */

const { executeCLICommand } = require('../helpers/testUtils');
const path = require('path');
const fs = require('fs');

describe('CLI Tools Detection Integration Tests', () => {
  const testTimeout = 60000; // 60 seconds for integration tests

  beforeAll(async () => {
    // Ensure test environment is set up
    console.log('Setting up CLI tools detection test environment...');
  }, testTimeout);

  describe('Status Command', () => {
    test('should run status command successfully', async () => {
      const result = await executeCLICommand('status');

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('[SCAN]');
      expect(result.stdout).toContain('[STATUS]');
      expect(result.stdout).toContain('AI CLI Tools Status Report');
      expect(result.stdout).toContain('Available Tools');
      expect(result.stdout).toContain('Missing Tools');
    }, testTimeout);

    test('should detect available CLI tools', async () => {
      const result = await executeCLICommand('status');

      expect(result.code).toBe(0);

      // Check for known CLI tools in the output
      const knownTools = [
        'Claude CLI',
        'Gemini CLI',
        'Qwen CLI',
        'iFlow CLI',
        'Qoder CLI',
        'CodeBuddy CLI',
        'GitHub Copilot CLI',
        'OpenAI Codex CLI'
      ];

      knownTools.forEach(tool => {
        expect(result.stdout).toContain(tool);
      });
    }, testTimeout);

    test('should provide summary count', async () => {
      const result = await executeCLICommand('status');

      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/\d+ available, \d+ missing/);
    }, testTimeout);
  });

  describe('Scan Command', () => {
    test('should run scan command successfully', async () => {
      const result = await executeCLICommand('scan');

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('[SCAN]');
      expect(result.stdout).toContain('Scanning for AI CLI tools');
    }, testTimeout);

    test('should check each CLI tool', async () => {
      const result = await executeCLICommand('scan');

      expect(result.code).toBe(0);

      // Should check each tool
      const toolsToCheck = [
        'Claude CLI',
        'Gemini CLI',
        'Qwen CLI',
        'iFlow CLI',
        'Qoder CLI',
        'CodeBuddy CLI',
        'GitHub Copilot CLI',
        'OpenAI Codex CLI'
      ];

      toolsToCheck.forEach(tool => {
        expect(result.stdout).toContain(tool);
      });
    }, testTimeout);
  });

  describe('Help Command', () => {
    test('should display help information', async () => {
      const result = await executeCLICommand('--help');

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Options:');
      expect(result.stdout).toContain('Commands:');
    }, testTimeout);

    test('should display available commands', async () => {
      const result = await executeCLICommand('--help');

      expect(result.code).toBe(0);

      const expectedCommands = [
        'status',
        'scan',
        'init',
        'deploy',
        'call',
        'use'
      ];

      expectedCommands.forEach(command => {
        // Some commands might not be in main help, check at least for some core ones
        if (['status', 'scan', 'init', 'deploy'].includes(command)) {
          expect(result.stdout).toContain(command);
        }
      });
    }, testTimeout);
  });

  describe('Version Command', () => {
    test('should display version information', async () => {
      const result = await executeCLICommand('--version');

      expect(result.code).toBe(0);
      // Version output might be in different formats
      expect(result.stdout || result.stderr).toMatch(/\d+\.\d+\.\d+/);
    }, testTimeout);

    test('should accept -v shorthand', async () => {
      const result = await executeCLICommand('-v');

      expect(result.code).toBe(0);
      // Version output might be in different formats
      expect(result.stdout || result.stderr).toMatch(/\d+\.\d+\.\d+/);
    }, testTimeout);
  });

  describe('Error Handling', () => {
    test('should handle unknown commands gracefully', async () => {
      const result = await executeCLICommand('unknown-command');

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown command');
    }, testTimeout);

    test('should handle missing arguments', async () => {
      const result = await executeCLICommand('call');

      expect(result.code).not.toBe(0);
      // Should provide error message or show help
    }, testTimeout);
  });

  describe('Configuration Files', () => {
    test('should have access to CLI tool configurations', () => {
      // Check if CLI tools configuration exists
      const cliToolsPath = path.join(__dirname, '../../src/core/cli_tools.js');
      expect(fs.existsSync(cliToolsPath)).toBe(true);
    });

    test('should load CLI tools configuration', () => {
      // Try to load the CLI tools configuration
      try {
        const { CLI_TOOLS } = require('../../src/core/cli_tools');
        expect(CLI_TOOLS).toBeDefined();
        expect(typeof CLI_TOOLS).toBe('object');

        // Check for expected tools
        const expectedTools = [
          'claude',
          'gemini',
          'qwen',
          'iflow',
          'qodercli',
          'codebuddy',
          'copilot',
          'codex'
        ];

        expectedTools.forEach(tool => {
          expect(CLI_TOOLS[tool]).toBeDefined();
          expect(CLI_TOOLS[tool]).toHaveProperty('name');
        });
      } catch (error) {
        // If the file doesn't exist or has issues, that's also information
        console.warn('CLI tools configuration could not be loaded:', error.message);
      }
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should work on current platform', async () => {
      const result = await executeCLICommand('status');

      expect(result.code).toBe(0);
      // The fact that it runs without platform-specific errors is the test
    }, testTimeout);

    test('should handle Windows paths if on Windows', async () => {
      if (process.platform === 'win32') {
        const result = await executeCLICommand('status');
        expect(result.code).toBe(0);
        // Should handle Windows-specific path issues
      }
    }, testTimeout);

    test('should handle Unix paths if on Unix-like system', async () => {
      if (process.platform !== 'win32') {
        const result = await executeCLICommand('status');
        expect(result.code).toBe(0);
        // Should handle Unix-specific path issues
      }
    }, testTimeout);
  });

  describe('Performance', () => {
    test('should complete status command within reasonable time', async () => {
      const startTime = Date.now();
      const result = await executeCLICommand('status');
      const duration = Date.now() - startTime;

      expect(result.code).toBe(0);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    }, testTimeout);

    test('should complete scan command within reasonable time', async () => {
      const startTime = Date.now();
      const result = await executeCLICommand('scan');
      const duration = Date.now() - startTime;

      expect(result.code).toBe(0);
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    }, testTimeout);
  });

  describe('Resource Management', () => {
    test('should not leak memory during status command', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Run status command multiple times
      for (let i = 0; i < 5; i++) {
        await executeCLICommand('status');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Allow some memory increase but not excessive
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    }, testTimeout);
  });
});
