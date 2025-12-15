import { CLIAdapter, SessionParseResult } from '../../../src/types/CLIAdapter';
import { Session, SessionMetadata } from '../../../src/types/Session';

// Mock implementation for testing
class MockCLIAdapter implements CLIAdapter {
  readonly cliType: string = 'test-cli';
  readonly name: string = 'Test CLI';
  readonly version: string = '1.0.0';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getCLIConfig(): Promise<{ homeDir: string; sessionPaths: string[] }> {
    return {
      homeDir: '/tmp/test-cli',
      sessionPaths: ['/tmp/test-cli/sessions']
    };
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    return {
      success: true,
      session: {
        metadata: {
          cliType: this.cliType as any,
          sessionId: 'test-session',
          filePath,
          projectPath: '/test/project',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 1
        },
        messages: []
      }
    };
  }

  async extractProjectPath(sessionData: any): Promise<string | null> {
    return sessionData?.projectPath || null;
  }

  getSessionPaths(): string[] {
    return [];
  }
}

describe('CLIAdapter Interface', () => {
  let adapter: CLIAdapter;

  beforeEach(() => {
    adapter = new MockCLIAdapter();
  });

  describe('Basic Properties', () => {
    it('should have required properties', () => {
      expect(adapter.cliType).toBe('test-cli');
      expect(adapter.name).toBe('Test CLI');
      expect(adapter.version).toBe('1.0.0');
    });
  });

  describe('isAvailable()', () => {
    it('should return boolean availability status', async () => {
      const result = await adapter.isAvailable();
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('getCLIConfig()', () => {
    it('should return CLI configuration', async () => {
      const config = await adapter.getCLIConfig();

      expect(config).toHaveProperty('homeDir');
      expect(config).toHaveProperty('sessionPaths');
      expect(typeof config.homeDir).toBe('string');
      expect(Array.isArray(config.sessionPaths)).toBe(true);
    });
  });

  describe('parseSession()', () => {
    it('should parse session file and return result', async () => {
      const filePath = '/test/session.jsonl';
      const result = await adapter.parseSession(filePath);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('session');
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle parse errors gracefully', async () => {
      // Mock adapter that returns error
      class ErrorAdapter extends MockCLIAdapter {
        async parseSession(filePath: string): Promise<SessionParseResult> {
          return {
            success: false,
            error: new Error('Parse failed')
          };
        }
      }

      const errorAdapter = new ErrorAdapter();
      const result = await errorAdapter.parseSession('/invalid/path');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Parse failed');
    });
  });

  describe('extractProjectPath()', () => {
    it('should extract project path from session data', async () => {
      const sessionData = {
        projectPath: '/my/project',
        otherData: 'value'
      };

      const projectPath = await adapter.extractProjectPath(sessionData);
      expect(projectPath).toBe('/my/project');
    });

    it('should return null when no project path found', async () => {
      const sessionData = {
        otherData: 'value'
      };

      const projectPath = await adapter.extractProjectPath(sessionData);
      expect(projectPath).toBeNull();
    });
  });

  describe('getSessionPaths()', () => {
    it('should return array of session paths', () => {
      const paths = adapter.getSessionPaths();
      expect(Array.isArray(paths)).toBe(true);
    });
  });
});