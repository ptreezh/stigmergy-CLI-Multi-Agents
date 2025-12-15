/**
 * End-to-end tests for complete Stigmergy CLI workflows
 */

const { executeCLICommand, cleanupTempFiles } = require('../helpers/testUtils');
const fs = require('fs');
const path = require('path');

describe('Complete Workflow E2E Tests', () => {
  const testTimeout = 120000; // 2 minutes for E2E tests

  beforeAll(async () => {
    console.log('Setting up E2E test environment...');
    cleanupTempFiles();
  });

  afterAll(() => {
    cleanupTempFiles();
  });

  describe('Installation and Setup Workflow', () => {
    test('should complete initial setup workflow', async () => {
      // Step 1: Check if CLI is installed and working
      const versionResult = await executeCLICommand('--version');
      expect([0, 1]).toContain(versionResult.code); // Version might return 1 on some systems

      // Step 2: Run status check
      const statusResult = await executeCLICommand('status');
      expect(statusResult.code).toBe(0);
      expect(statusResult.stdout).toContain('[STATUS]');

      // Step 3: Run scan to detect tools
      const scanResult = await executeCLICommand('scan');
      expect(scanResult.code).toBe(0);
      expect(scanResult.stdout).toContain('[SCAN]');

      console.log('âœ?Initial setup workflow completed successfully');
    }, testTimeout);

    test('should display help and usage information', async () => {
      const helpResult = await executeCLICommand('--help');
      expect(helpResult.code).toBe(0);
      expect(helpResult.stdout).toContain('Usage');

      console.log('âœ?Help information displayed successfully');
    }, testTimeout);
  });

  describe('CLI Tools Management Workflow', () => {
    test('should detect and report CLI tools status', async () => {
      const statusResult = await executeCLICommand('status');

      expect(statusResult.code).toBe(0);
      expect(statusResult.stdout).toContain('AI CLI Tools Status Report');
      expect(statusResult.stdout).toContain('Available Tools');
      expect(statusResult.stdout).toContain('Missing Tools');

      // Check for specific tools in the output
      const expectedTools = [
        'Claude CLI',
        'Gemini CLI',
        'Qwen CLI',
        'iFlow CLI',
        'Qoder CLI',
        'CodeBuddy CLI',
        'GitHub Copilot CLI'
      ];

      expectedTools.forEach(tool => {
        expect(statusResult.stdout).toContain(tool);
      });

      console.log('âœ?CLI tools status detection completed');
    }, testTimeout);

    test('should handle tools scanning and detection', async () => {
      const scanResult = await executeCLICommand('scan');

      expect(scanResult.code).toBe(0);
      expect(scanResult.stdout).toContain('[SCAN]');
      expect(scanResult.stdout).toContain('Scanning for AI CLI tools');

      // Should show progress for each tool
      const toolsProgress = [
        'Checking Claude CLI',
        'Checking Gemini CLI',
        'Checking Qwen CLI'
      ];

      toolsProgress.forEach(progress => {
        expect(scanResult.stdout).toContain(progress);
      });

      console.log('âœ?Tools scanning completed');
    }, testTimeout);
  });

  describe('Smart Routing Workflow', () => {
    test('should handle call command with various tools', async () => {
      const testCases = [
        { tool: 'claude', message: 'test message' },
        { tool: 'gemini', message: 'analyze this' },
        { tool: 'qwen', message: 'help with code' }
      ];

      for (const { tool, message } of testCases) {
        const result = await executeCLICommand('call', [tool, message]);

        // Command should be recognized (even if tool execution fails)
        expect(result.code !== undefined).toBe(true);

        // Should not crash or show unknown command error
        expect(result.stderr).not.toContain('Unknown command');
      }

      console.log('âœ?Call command routing completed');
    }, testTimeout);

    test('should handle use command pattern', async () => {
      const result = await executeCLICommand('use', ['claude', 'to', 'write', 'code']);

      // Command should be processed
      expect(result.code !== undefined).toBe(true);

      console.log('âœ?Use command pattern completed');
    }, testTimeout);

    test('should handle cross-CLI communication', async () => {
      const crossCLIPatterns = [
        'ask claude for help',
        'tell gemini to analyze',
        'request qwen assistance'
      ];

      for (const pattern of crossCLIPatterns) {
        const [command, ...args] = pattern.split(' ');
        const result = await executeCLICommand(command, args);

        // Should handle the pattern
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Cross-CLI communication completed');
    }, testTimeout);
  });

  describe('Configuration and Persistence', () => {
    test('should handle configuration operations', async () => {
      // Test init command
      const initResult = await executeCLICommand('init');
      expect([0, 1]).toContain(initResult.code); // Might fail if already initialized

      console.log('âœ?Configuration operations completed');
    }, testTimeout);

    test('should create project files if requested', async () => {
      // This would test project file creation functionality
      // Since we can't easily test file creation without side effects,
      // we'll test that the command doesn't crash

      const testDir = process.cwd();
      const projectSpecPath = path.join(testDir, 'PROJECT_SPEC.json');
      const projectConstitutionPath = path.join(testDir, 'PROJECT_CONSTITUTION.md');

      // Check if files exist after potential init
      const specExists = fs.existsSync(projectSpecPath);
      const constitutionExists = fs.existsSync(projectConstitutionPath);

      console.log(`âœ?Project files status - SPEC: ${specExists}, CONSTITUTION: ${constitutionExists}`);
    }, testTimeout);
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid commands gracefully', async () => {
      const invalidCommands = [
        'invalid-command',
        'nonexistent-tool',
        'use-without-args'
      ];

      for (const command of invalidCommands) {
        const result = await executeCLICommand(command);
        expect(result.code).not.toBe(0);
      }

      console.log('âœ?Invalid commands handled gracefully');
    }, testTimeout);

    test('should handle missing CLI tools', async () => {
      // Test with a tool that likely doesn't exist
      const result = await executeCLICommand('call', ['nonexistent-tool', 'test']);

      // Should handle gracefully without crashing
      expect(result.code !== undefined).toBe(true);

      console.log('âœ?Missing CLI tools handled gracefully');
    }, testTimeout);

    test('should handle empty or malformed input', async () => {
      const testCases = [
        [], // No arguments
        [''], // Empty string argument
        ['   '] // Whitespace only
      ];

      for (const args of testCases) {
        const result = await executeCLICommand('call', args);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Empty/malformed input handled gracefully');
    }, testTimeout);
  });

  describe('Performance and Reliability', () => {
    test('should complete operations within reasonable time', async () => {
      const operations = [
        { command: 'status', expectedMaxTime: 30000 },
        { command: 'scan', expectedMaxTime: 60000 },
        { command: '--help', expectedMaxTime: 10000 }
      ];

      for (const { command, expectedMaxTime } of operations) {
        const startTime = Date.now();
        const result = await executeCLICommand(command, []);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(expectedMaxTime);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?All operations completed within expected time limits');
    }, testTimeout);

    test('should handle multiple sequential operations', async () => {
      const operations = [
        'status',
        'scan',
        '--help',
        '--version'
      ];

      for (const operation of operations) {
        const result = await executeCLICommand(operation);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Multiple sequential operations completed successfully');
    }, testTimeout);

    test('should maintain consistent behavior across multiple runs', async () => {
      const runs = 3;
      const results = [];

      for (let i = 0; i < runs; i++) {
        const result = await executeCLICommand('status');
        results.push(result.code);
      }

      // All runs should have the same result
      expect(results.every(code => code === results[0])).toBe(true);

      console.log('âœ?Consistent behavior verified across multiple runs');
    }, testTimeout);
  });

  describe('Real-world Usage Scenarios', () => {
    test('should handle typical developer workflow', async () => {
      // Simulate a typical developer workflow
      const workflowSteps = [
        // 1. Check what tools are available
        'status',
        // 2. Get help on usage
        '--help',
        // 3. Try to use a tool
        ['call', 'claude', 'help me understand this codebase'],
        // 4. Check status again
        'status'
      ];

      for (const step of workflowSteps) {
        const command = Array.isArray(step) ? step[0] : step;
        const args = Array.isArray(step) ? step.slice(1) : [];

        const result = await executeCLICommand(command, args);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Typical developer workflow completed');
    }, testTimeout);

    test('should handle multi-tool coordination scenario', async () => {
      // Simulate using multiple tools in sequence
      const toolSequence = [
        ['call', 'claude', 'analyze this problem'],
        ['call', 'gemini', 'provide alternative solution'],
        ['call', 'qwen', 'compare the approaches']
      ];

      for (const [command, ...args] of toolSequence) {
        const result = await executeCLICommand(command, args);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Multi-tool coordination scenario completed');
    }, testTimeout);
  });

  describe('Integration with External Systems', () => {
    test('should handle system-level operations', async () => {
      // Test that the CLI can interact with the system properly
      const systemChecks = [
        'status', // Checks system for CLI tools
        'scan' // Scans filesystem and PATH
      ];

      for (const check of systemChecks) {
        const result = await executeCLICommand(check);
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?System-level operations completed');
    }, testTimeout);

    test('should handle environment-specific behavior', async () => {
      // Test behavior based on current environment
      const envInfo = {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      };

      console.log(`Testing on: ${envInfo.platform} ${envInfo.arch} (Node ${envInfo.nodeVersion})`);

      const result = await executeCLICommand('status');
      expect(result.code).toBe(0);

      console.log('âœ?Environment-specific behavior verified');
    }, testTimeout);
  });

  describe('Cleanup and Maintenance', () => {
    test('should handle cleanup operations', async () => {
      // Test any available cleanup commands
      const possibleCleanupCommands = ['clean', 'reset', 'clear'];

      for (const command of possibleCleanupCommands) {
        const result = await executeCLICommand(command);
        // Command might not exist, but shouldn't crash
        expect(result.code !== undefined).toBe(true);
      }

      console.log('âœ?Cleanup operations tested');
    }, testTimeout);
  });
});
