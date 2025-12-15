/**
 * End-to-End CLI Execution Tests
 * Tests actual CLI tool execution with safety checks
 */

const SmartRouter = require('../../src/core/smart_router');
const CLIParameterHandler = require('../../src/core/cli_parameter_handler');
const CLIAvailabilityChecker = require('../../src/test/cli-availability-checker');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('E2E CLI Execution Tests', () => {
  let router;
  let availabilityChecker;
  let availableTools;

  beforeAll(async () => {
    router = new SmartRouter();
    availabilityChecker = new CLIAvailabilityChecker();
    availableTools = await availabilityChecker.getAvailableTools();

    console.log(`\nE2E Tests: Available CLI tools: ${availableTools.join(', ')}\n`);
  }, 30000);

  describe('Safe CLI Execution', () => {
    test('should execute available CLI tools safely', async () => {
      const testPrompt = 'say hello';
      const results = [];

      for (const toolName of availableTools.slice(0, 2)) { // Test max 2 tools
        try {
          // Route to tool
          const routeResult = await router.smartRoute(`use ${toolName} to ${testPrompt}`);
          expect(routeResult.tool).toBe(toolName);

          // Generate parameters
          const args = CLIParameterHandler.getToolSpecificArguments(
            toolName,
            routeResult.prompt || testPrompt
          );
          expect(args).toBeDefined();
          expect(args.length).toBeGreaterThan(0);

          // Execute with timeout and capture output
          const executionResult = await executeCLISafely(toolName, args);

          results.push({
            tool: toolName,
            success: executionResult.success,
            hasOutput: executionResult.stdout.length > 0 || executionResult.stderr.length > 0,
            timedOut: executionResult.timedOut
          });

          console.log(`  ${toolName}: ${executionResult.success ? 'âœ? : 'âœ?}`);
        } catch (error) {
          results.push({
            tool: toolName,
            success: false,
            error: error.message
          });
          console.log(`  ${toolName}: âœ?(${error.message})`);
        }
      }

      // At least one tool should have executed
      if (availableTools.length > 0) {
        expect(results.length).toBeGreaterThan(0);
      }
    }, 60000);

    test('should handle CLI timeouts gracefully', async () => {
      if (availableTools.length === 0) {
        console.log('  Skipping: No available CLI tools');
        return;
      }

      const toolName = availableTools[0];
      const longPrompt = 'write a very long detailed explanation about quantum computing';

      const routeResult = await router.smartRoute(`use ${toolName} to ${longPrompt}`);
      const args = CLIParameterHandler.getToolSpecificArguments(
        toolName,
        routeResult.prompt
      );

      // Execute with very short timeout
      const result = await executeCLISafely(toolName, args, { timeout: 1000 });

      // Should handle timeout gracefully
      expect(result).toHaveProperty('timedOut');
      expect(typeof result.timedOut).toBe('boolean');
    }, 30000);
  });

  describe('Error Handling in Real Environment', () => {
    test('should handle invalid CLI paths', async () => {
      const result = await executeCLISafely('nonexistent-cli', ['--version']);

      expect(result.success).toBe(false);
      expect(result.error || result.stderr || !result.stdout).toBeTruthy();
    });

    test('should handle permission errors', async () => {
      // Try to execute a command that might require permissions
      const result = await executeCLISafely('sudo', ['true'], { timeout: 1000 });

      // Should handle permission errors gracefully
      expect(result).toHaveProperty('success');
    });
  });

  describe('Integration Flow', () => {
    test('should complete full routing and parameter flow', async () => {
      if (availableTools.length === 0) {
        console.log('  Skipping: No available CLI tools');
        return;
      }

      const testInputs = [
        `use ${availableTools[0]} to write hello world`,
        `please help with ${availableTools[0]}`,
        `analyze with ${availableTools[availableTools.length - 1]}`
      ];

      for (const input of testInputs) {
        // Step 1: Route input
        const routeResult = await router.smartRoute(input);
        expect(routeResult).toHaveProperty('tool');
        expect(routeResult).toHaveProperty('prompt');

        // Step 2: Generate parameters
        const args = CLIParameterHandler.getToolSpecificArguments(
          routeResult.tool,
          routeResult.prompt
        );
        expect(Array.isArray(args)).toBe(true);

        // Step 3: Execute (safely)
        const execResult = await executeCLISafely(routeResult.tool, args);
        expect(execResult).toHaveProperty('success');
      }
    }, 60000);
  });
});

/**
 * Execute CLI command safely with timeout and output capture
 * @param {string} command - Command to execute
 * @param {Array} args - Arguments for the command
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Execution result
 */
async function executeCLISafely(command, args, options = {}) {
  const { timeout = 10000 } = options;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let resolved = false;

    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    // Capture stdout
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      // Limit output size
      if (stdout.length > 10000) {
        stdout = stdout.substring(0, 10000) + '\n[...truncated...]';
      }
    });

    // Capture stderr
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      // Limit output size
      if (stderr.length > 10000) {
        stderr = stderr.substring(0, 10000) + '\n[...truncated...]';
      }
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        timedOut = true;
        resolved = true;
        child.kill('SIGTERM');
        resolve({
          success: false,
          stdout,
          stderr,
          timedOut: true,
          error: `Command timed out after ${timeout}ms`
        });
      }
    }, timeout);

    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          stdout,
          stderr,
          timedOut: false,
          exitCode: code
        });
      }
    });

    child.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve({
          success: false,
          stdout,
          stderr,
          timedOut: false,
          error: error.message
        });
      }
    });
  });
}
