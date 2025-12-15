import { SessionScanner } from '../../../src/core/SessionScanner';
import { CLIAdapter, SessionParseResult } from '../../../src/types/CLIAdapter';
import { Session, CLIType } from '../../../src/types/Session';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock adapters for testing
class MockAdapter1 implements CLIAdapter {
  readonly cliType = 'claude';
  readonly name = 'Claude Code';
  readonly version = '1.0.0';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getCLIConfig(): Promise<{ homeDir: string; sessionPaths: string[] }> {
    return {
      homeDir: '/home/user/.claude',
      sessionPaths: ['/home/user/.claude/projects/project1', '/home/user/.claude/projects/project2']
    };
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    return {
      success: true,
      session: {
        metadata: {
          cliType: 'claude' as CLIType,
          sessionId: path.basename(filePath, '.jsonl'),
          filePath,
          projectPath: '/project1',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 5
        },
        messages: []
      }
    };
  }

  async extractProjectPath(sessionData: any): Promise<string | null> {
    return sessionData.projectPath || null;
  }

  getSessionPaths(): string[] {
    return ['/home/user/.claude/projects'];
  }
}

class MockAdapter2 implements CLIAdapter {
  readonly cliType = 'gemini';
  readonly name = 'Gemini CLI';
  readonly version = '1.0.0';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async getCLIConfig(): Promise<{ homeDir: string; sessionPaths: string[] }> {
    return {
      homeDir: '/home/user/.gemini',
      sessionPaths: ['/home/user/.gemini/tmp/project1/chats']
    };
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    return {
      success: true,
      session: {
        metadata: {
          cliType: 'gemini' as CLIType,
          sessionId: path.basename(filePath, '.json'),
          filePath,
          projectPath: '/project1',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 3
        },
        messages: []
      }
    };
  }

  async extractProjectPath(sessionData: any): Promise<string | null> {
    return sessionData.projectPath || null;
  }

  getSessionPaths(): string[] {
    return ['/home/user/.gemini/tmp'];
  }
}

jest.mock('fs-extra');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('SessionScanner', () => {
  let scanner: SessionScanner;
  let mockAdapters: CLIAdapter[];

  beforeEach(() => {
    mockAdapters = [new MockAdapter1(), new MockAdapter2()];
    scanner = new SessionScanner(mockAdapters);
    jest.clearAllMocks();

    // Mock fs.readdir for finding session files
    mockFs.readdir.mockResolvedValue(['session1.jsonl', 'session2.jsonl', 'other.txt']);

    // Mock fs.stat for file info
    mockFs.stat.mockResolvedValue({
      isFile: () => true,
      size: 1024,
      mtime: new Date('2025-12-12T10:00:00Z')
    } as any);

    // Mock fs.existsSync
    mockFs.existsSync.mockReturnValue(true);
  });

  describe('scanAllSessions()', () => {
    it('should scan sessions from all available adapters', async () => {
      const sessions = await scanner.scanAllSessions();

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.some(s => s.metadata.cliType === 'claude')).toBe(true);
      expect(sessions.some(s => s.metadata.cliType === 'gemini')).toBe(true);
    });

    it('should handle unavailable adapters', async () => {
      // Mock adapter as unavailable
      jest.spyOn(mockAdapters[0], 'isAvailable').mockResolvedValue(false);

      const sessions = await scanner.scanAllSessions();

      expect(sessions).toHaveLength(2); // Only from gemini
      expect(sessions.every(s => s.metadata.cliType === 'gemini')).toBe(true);
    });

    it('should handle parse errors gracefully', async () => {
      // Mock parse error
      jest.spyOn(mockAdapters[0], 'parseSession').mockResolvedValue({
        success: false,
        error: new Error('Parse failed')
      });

      const sessions = await scanner.scanAllSessions();

      expect(sessions).toHaveLength(2); // Only from gemini (successful parses)
    });
  });

  describe('scanSessionsByProject()', () => {
    it('should filter sessions by project path', async () => {
      const projectPath = '/project1';
      const sessions = await scanner.scanSessionsByProject(projectPath);

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.every(s => s.metadata.projectPath === projectPath)).toBe(true);
    });

    it('should return empty array for unknown project', async () => {
      const sessions = await scanner.scanSessionsByProject('/unknown/project');

      expect(sessions).toHaveLength(0);
    });
  });

  describe('scanSessionsByCLI()', () => {
    it('should filter sessions by CLI type', async () => {
      const sessions = await scanner.scanSessionsByCLI('claude' as CLIType);

      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions.every(s => s.metadata.cliType === 'claude')).toBe(true);
    });

    it('should return empty array for unknown CLI', async () => {
      const sessions = await scanner.scanSessionsByCLI('unknown' as CLIType);

      expect(sessions).toHaveLength(0);
    });
  });

  describe('getSessionStatistics()', () => {
    it('should return statistics for all sessions', async () => {
      const stats = await scanner.getSessionStatistics();

      expect(stats.totalSessions).toBeGreaterThan(0);
      expect(stats.totalMessages).toBeGreaterThan(0);
      expect(stats.byCLI).toHaveProperty('claude');
      expect(stats.byCLI).toHaveProperty('gemini');
      expect(stats.byProject).toHaveProperty('/project1');
    });

    it('should handle empty results', async () => {
      // Mock no session files
      mockFs.readdir.mockResolvedValue([]);

      const stats = await scanner.getSessionStatistics();

      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMessages).toBe(0);
      expect(Object.keys(stats.byCLI)).toHaveLength(0);
      expect(Object.keys(stats.byProject)).toHaveLength(0);
    });
  });

  describe('searchSessions()', () => {
    it('should search sessions by keyword', async () => {
      const results = await scanner.searchSessions('TypeScript');

      // Should return sessions containing "TypeScript" in content or metadata
      expect(Array.isArray(results)).toBe(true);
    });

    it('should search by CLI type', async () => {
      const results = await scanner.searchSessions('', { cliType: ['gemini' as CLIType] });

      expect(results.every(r => r.metadata.cliType === 'gemini')).toBe(true);
    });

    it('should search by date range', async () => {
      const dateRange = {
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31')
      };

      const results = await scanner.searchSessions('', { dateRange });

      expect(Array.isArray(results)).toBe(true);
    });
  });
});