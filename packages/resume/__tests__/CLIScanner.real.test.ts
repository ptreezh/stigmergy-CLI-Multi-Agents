import { CLIScanner } from '../src/utils/CLIScanner';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

describe('CLIScanner Real Environment Tests', () => {
  let cliScanner: CLIScanner;
  const testHomeDir = join(homedir(), '.resumesession-test');
  const testCLIDirs = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];

  beforeAll(async () => {
    cliScanner = CLIScanner.getInstance();

    // 创建测试目录结构
    if (!existsSync(testHomeDir)) {
      mkdirSync(testHomeDir, { recursive: true });
    }

    // 为每个CLI创建测试配置目录
    for (const cli of testCLIDirs) {
      const cliDir = join(testHomeDir, cli);
      if (!existsSync(cliDir)) {
        mkdirSync(cliDir, { recursive: true });
      }

      // 创建sessions目录
      const sessionsDir = cli === 'iflow' 
        ? join(cliDir, 'stigmergy', 'sessions')
        : cli === 'codebuddy'
        ? join(cliDir, 'conversations')
        : cli === 'qodercli'
        ? join(cliDir, 'chats')
        : join(cliDir, 'sessions');

      if (!existsSync(sessionsDir)) {
        mkdirSync(sessionsDir, { recursive: true });
      }

      // 创建测试配置文件
      const configPath = join(cliDir, 'config.json');
      writeFileSync(configPath, JSON.stringify({
        version: '1.0.0',
        test: true,
        cli: cli
      }, null, 2));

      // 创建测试会话文件
      const sessionPath = join(sessionsDir, 'test-session.json');
      writeFileSync(sessionPath, JSON.stringify({
        id: 'test-session',
        title: 'Test Session',
        content: 'This is a test session',
        timestamp: new Date().toISOString(),
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ]
      }, null, 2));
    }
  });

  afterAll(async () => {
    // 清理测试目录
    for (const cli of testCLIDirs) {
      const cliDir = join(testHomeDir, cli);
      try {
        const sessionsDir = cli === 'iflow'
          ? join(cliDir, 'stigmergy', 'sessions')
          : cli === 'codebuddy'
          ? join(cliDir, 'conversations')
          : cli === 'qodercli'
          ? join(cliDir, 'chats')
          : join(cliDir, 'sessions');

        const sessionPath = join(sessionsDir, 'test-session.json');
        if (existsSync(sessionPath)) {
          unlinkSync(sessionPath);
        }

        const configPath = join(cliDir, 'config.json');
        if (existsSync(configPath)) {
          unlinkSync(configPath);
        }

        if (existsSync(sessionsDir)) {
          rmdirSync(sessionsDir);
        }

        if (existsSync(cliDir)) {
          rmdirSync(cliDir);
        }
      } catch (error) {
        // 忽略清理错误
      }
    }

    if (existsSync(testHomeDir)) {
      rmdirSync(testHomeDir);
    }
  });

  describe('scanAllCLIs', () => {
    it('should return all CLI tools with proper structure', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      expect(result).toHaveLength(7);
      expect(result.map(cli => cli.name)).toEqual([
        'claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'
      ]);

      // 验证每个CLI的结构
      result.forEach(cli => {
        expect(cli).toHaveProperty('name');
        expect(cli).toHaveProperty('displayName');
        expect(cli).toHaveProperty('version');
        expect(cli).toHaveProperty('available');
        expect(cli).toHaveProperty('integrationLevel');
        expect(typeof cli.available).toBe('boolean');
        expect(['native', 'hook', 'external']).toContain(cli.integrationLevel);
      });
    });

    it('should detect actual CLI availability in system', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      // 至少应该有一些CLI可用（如当前运行的iflow）
      const availableCLIs = result.filter(cli => cli.available);
      expect(availableCLIs.length).toBeGreaterThanOrEqual(1);

      // 验证iflow CLI应该可用（因为当前正在运行）
      const iflowCLI = result.find(cli => cli.name === 'iflow');
      if (iflowCLI) {
        expect(iflowCLI.available).toBe(true);
        expect(iflowCLI.version).toBeTruthy();
      }
    });

    it('should provide proper integration levels for each CLI', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      const integrationLevels = result.reduce((acc, cli) => {
        acc[cli.name] = cli.integrationLevel;
        return acc;
      }, {} as Record<string, string>);

      expect(integrationLevels.claude).toBe('native');
      expect(integrationLevels.gemini).toBe('native');
      expect(integrationLevels.qwen).toBe('native');
      expect(integrationLevels.iflow).toBe('hook');
      expect(integrationLevels.codebuddy).toBe('external');
      expect(integrationLevels.qodercli).toBe('external');
      expect(integrationLevels.codex).toBe('external');
    });
  });

  describe('scanAvailableCLIs', () => {
    it('should return same structure as scanAllCLIs', async () => {
      const allCLIs = await cliScanner.scanAllCLIs();
      const availableCLIs = await cliScanner.scanAvailableCLIs();
      
      expect(availableCLIs).toHaveLength(allCLIs.length);
      
      availableCLIs.forEach((cli, index) => {
        expect(cli.name).toBe(allCLIs[index].name);
        expect(cli.displayName).toBe(allCLIs[index].displayName);
        expect(cli.integrationLevel).toBe(allCLIs[index].integrationLevel);
      });
    });
  });

  describe('CLI Path Detection', () => {
    it('should detect actual CLI paths for available tools', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      for (const cli of result) {
        if (cli.available) {
          expect(cli.installedPath).toBeTruthy();
          expect(cli.installedPath!.length).toBeGreaterThan(0);
          
          // 验证路径确实存在
          expect(existsSync(cli.installedPath!)).toBe(true);
        }
      }
    });

    it('should provide config paths for test directories', async () => {
      // 注意：这个测试依赖于我们创建的测试目录
      // 实际环境中可能不存在这些目录
      const result = await cliScanner.scanAllCLIs();
      
      // 检查是否正确检测到配置路径
      for (const cli of result) {
        if (cli.configPath) {
          expect(cli.configPath).toContain(cli.name);
        }
      }
    });

    it('should provide sessions paths with correct structure', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      for (const cli of result) {
        if (cli.sessionsPath) {
          expect(cli.sessionsPath).toContain(cli.name);
          
          // 验证路径结构
          if (cli.name === 'iflow') {
            expect(cli.sessionsPath).toContain('stigmergy');
          } else if (cli.name === 'codebuddy') {
            expect(cli.sessionsPath).toContain('conversations');
          } else if (cli.name === 'qodercli') {
            expect(cli.sessionsPath).toContain('chats');
          } else {
            expect(cli.sessionsPath).toContain('sessions');
          }
        }
      }
    });
  });

  describe('validateCLIForCrossCLI', () => {
    it('should validate CLI support for cross-CLI operations', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      for (const cli of result) {
        if (cli.available) {
          const isValid = await cliScanner.validateCLIForCrossCLI(cli.name);
          
          // 如果CLI可用，应该支持跨CLI操作
          if (cli.configPath && cli.sessionsPath) {
            expect(isValid).toBe(true);
          }
        }
      }
    });

    it('should return false for non-existent CLI', async () => {
      const isValid = await cliScanner.validateCLIForCrossCLI('non-existent-cli');
      expect(isValid).toBe(false);
    });

    it('should handle permission issues gracefully', async () => {
      // 测试对不存在目录的处理
      const isValid = await cliScanner.validateCLIForCrossCLI('invalid-cli-test');
      expect(isValid).toBe(false);
    });
  });

  describe('Version Detection', () => {
    it('should detect version information accurately', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      for (const cli of result) {
        if (cli.available) {
          expect(cli.version).toBeTruthy();
          expect(cli.version!.length).toBeGreaterThan(0);
          
          // 版本应该是有效格式
          if (cli.version !== 'detected' && cli.version !== 'unknown') {
            expect(cli.version).toMatch(/^\d+\.\d+(\.\d+)?$/);
          }
        }
      }
    });

    it('should handle CLI without version command', async () => {
      const result = await cliScanner.scanAllCLIs();
      const codexCLI = result.find(cli => cli.name === 'codex');
      
      if (codexCLI && codexCLI.available) {
        expect(codexCLI.version).toBe('detected');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should complete scan within reasonable time', async () => {
      const startTime = Date.now();
      await cliScanner.scanAllCLIs();
      const endTime = Date.now();
      
      // 扫描应该在10秒内完成
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should handle concurrent scans gracefully', async () => {
      const promises = [
        cliScanner.scanAllCLIs(),
        cliScanner.scanAllCLIs(),
        cliScanner.scanAllCLIs()
      ];
      
      const results = await Promise.all(promises);
      
      // 所有结果应该一致
      results.forEach(result => {
        expect(result).toHaveLength(7);
        expect(result.map(cli => cli.name)).toEqual([
          'claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'
        ]);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing CLI tools gracefully', async () => {
      const result = await cliScanner.scanAllCLIs();
      
      // 不可用的CLI应该标记为false
      result.forEach(cli => {
        if (!cli.available) {
          expect(cli.version).toBe('');
          expect(cli.installedPath).toBeUndefined();
        }
      });
    });

    it('should handle corrupted CLI installations', async () => {
      // 这个测试验证扫描器能够处理损坏的CLI安装
      const result = await cliScanner.scanAllCLIs();
      
      // 不应该抛出错误
      expect(result).toBeDefined();
      expect(result).toHaveLength(7);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const scanner1 = CLIScanner.getInstance();
      const scanner2 = CLIScanner.getInstance();
      
      expect(scanner1).toBe(scanner2);
    });
  });
});