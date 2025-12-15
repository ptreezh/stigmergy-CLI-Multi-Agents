/**
 * Shell Integration Tests - 真实环境测试
 * 注意：这些测试需要在有真实AI CLI工具的环境中运行
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Shell Integration Tests', () => {
  const testTimeout = 120000; // 2分钟超时

  // 检查是否在CI环境�?  const isCI = process.env.CI || process.env.GITHUB_ACTIONS;

  // 检查是否有必要的CLI工具
  const hasClaude = process.env.HAS_CLAUDE_CLI === 'true';
  const hasGemini = process.env.HAS_GEMINI_CLI === 'true';

  describe('Real CLI Tool Integration', () => {
    test('should test stigmergy basic functionality in real shell', async () => {
      // 这个测试只需要stigmergy本身，不需要外部AI工具
      const result = await executeCommand('node', ['src/index.js', '--version'], {
        cwd: process.cwd(),
        timeout: 10000
      });

      expect(result.code).toBe(0);
      expect(result.stdout || result.stderr).toMatch(/\d+\.\d+\.\d+/);
    }, testTimeout);

    test('should test CLI detection without external dependencies', async () => {
      // 测试CLI工具检测功能，不依赖于实际的AI工具安装
      const result = await executeCommand('node', ['src/index.js', 'status'], {
        cwd: process.cwd(),
        timeout: 30000
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('AI CLI Tools Status Report');
    }, testTimeout);

    // 只有在有相应工具时才运行这些测试
    (hasClaude ? test : test.skip)('should test Claude CLI integration if available', async () => {
      const result = await executeCommand('claude', ['--version'], {
        timeout: 15000
      });

      expect([0, 1]).toContain(result.code); // Claude可能返回1如果未认�?    }, testTimeout);

    (hasGemini ? test : test.skip)('should test Gemini CLI integration if available', async () => {
      const result = await executeCommand('gemini', ['--version'], {
        timeout: 15000
      });

      expect([0, 1]).toContain(result.code); // Gemini可能返回1如果未认�?    }, testTimeout);
  });

  describe('Cross-Platform Shell Tests', () => {
    test('should work on Windows', async () => {
      if (process.platform !== 'win32') {
        console.log('Skipping Windows-specific test on non-Windows platform');
        return;
      }

      const result = await executeCommand('cmd', ['/c', 'node src/index.js --version'], {
        cwd: process.cwd(),
        timeout: 10000
      });

      expect(result.code).toBe(0);
    }, testTimeout);

    test('should work on Unix-like systems', async () => {
      if (process.platform === 'win32') {
        console.log('Skipping Unix-specific test on Windows');
        return;
      }

      const result = await executeCommand('node', ['src/index.js', '--version'], {
        cwd: process.cwd(),
        timeout: 10000
      });

      expect(result.code).toBe(0);
    }, testTimeout);
  });

  describe('Error Handling in Real Environment', () => {
    test('should handle missing CLI tools gracefully', async () => {
      // 测试一个肯定不存在的CLI工具
      const result = await executeCommand('node', ['src/index.js', 'call', 'nonexistent-cli', 'test'], {
        cwd: process.cwd(),
        timeout: 15000
      });

      expect(result.code).not.toBe(0);
      expect(result.stdout || result.stderr).toBeDefined();
    }, testTimeout);

    test('should handle invalid parameters gracefully', async () => {
      const result = await executeCommand('node', ['src/index.js', 'invalid-command'], {
        cwd: process.cwd(),
        timeout: 10000
      });

      expect(result.code).not.toBe(0);
    }, testTimeout);
  });

  describe('Performance Tests in Real Environment', () => {
    test('should complete status check within reasonable time', async () => {
      const startTime = Date.now();

      const result = await executeCommand('node', ['src/index.js', 'status'], {
        cwd: process.cwd(),
        timeout: 45000 // 45秒超�?      });

      const duration = Date.now() - startTime;

      expect(result.code).toBe(0);
      expect(duration).toBeLessThan(40000); // 应该�?0秒内完成
    }, testTimeout);
  });
});

/**
 * 执行shell命令的辅助函�? */
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'pipe',
      encoding: 'utf8',
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data;
    });

    child.stderr?.on('data', (data) => {
      stderr += data;
    });

    const timeout = options.timeout ? setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timeout after ${options.timeout}ms`));
    }, options.timeout) : null;

    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      resolve({ code, stdout, stderr });
    });

    child.on('error', (error) => {
      if (timeout) clearTimeout(timeout);
      reject(error);
    });
  });
}
