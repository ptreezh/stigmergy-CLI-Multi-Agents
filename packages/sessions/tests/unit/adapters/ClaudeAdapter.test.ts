import { ClaudeAdapter } from '../../../src/adapters/ClaudeAdapter';
import { CLIType } from '../../../src/types/Session';
import * as fs from 'fs-extra';
import * as os from 'os';

jest.mock('fs-extra');
jest.mock('os');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockOs = os as jest.Mocked<typeof os>;

describe('ClaudeAdapter', () => {
  let adapter: ClaudeAdapter;
  const mockHomeDir = '/home/user';

  beforeEach(() => {
    adapter = new ClaudeAdapter();
    jest.clearAllMocks();

    // Mock os.homedir
    mockOs.homedir.mockReturnValue(mockHomeDir);

    // Mock fs.existsSync
    mockFs.existsSync.mockReturnValue(true);

    // Mock fs.readdir
    mockFs.readdir.mockResolvedValue(['project1', 'project2']);

    // Mock fs.stat
    mockFs.stat.mockResolvedValue({
      isDirectory: () => true
    } as any);
  });

  describe('Properties', () => {
    it('should have correct CLI properties', () => {
      expect(adapter.cliType).toBe('claude');
      expect(adapter.name).toBe('Claude Code');
      expect(adapter.version).toBeDefined();
    });
  });

  describe('isAvailable()', () => {
    it('should return true when Claude CLI is available', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return path.includes('.claude');
      });

      const result = await adapter.isAvailable();
      expect(result).toBe(true);
    });

    it('should return false when Claude CLI directory does not exist', async () => {
      mockFs.existsSync.mockImplementation((path: string) => {
        return !path.includes('.claude');
      });

      const result = await adapter.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('getCLIConfig()', () => {

    it('should return Claude CLI configuration', async () => {
      mockFs.readdir.mockResolvedValue(['projects1', 'projects2']);

      const config = await adapter.getCLIConfig();

      expect(config.homeDir).toContain('.claude');
      expect(config.sessionPaths).toHaveLength(2);
      expect(config.sessionPaths[0]).toContain('projects');
    });

    it('should handle missing projects directory', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      const config = await adapter.getCLIConfig();

      expect(config.homeDir).toContain('.claude');
      expect(config.sessionPaths).toHaveLength(0);
    });
  });

  describe('parseSession()', () => {
    const mockSessionContent = [
      {
        "type": "user_message",
        "message": {
          "content": "Hello, Claude!",
          "timestamp": "2025-12-12T10:00:00Z"
        }
      },
      {
        "type": "assistant_message",
        "message": {
          "content": "Hello! How can I help you today?",
          "timestamp": "2025-12-12T10:00:05Z",
          "model": "claude-3-sonnet"
        }
      }
    ];

    it('should parse valid Claude session file', async () => {
      mockFs.readFile.mockResolvedValue(mockSessionContent.map(item => JSON.stringify(item)).join('\n'));

      const result = await adapter.parseSession('/test/session.jsonl');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.metadata.cliType).toBe('claude');
      expect(result.session?.messages).toHaveLength(2);
    });

    it('should handle malformed JSON', async () => {
      mockFs.readFile.mockResolvedValue('{ invalid json content }');

      const result = await adapter.parseSession('/test/invalid.jsonl');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to parse');
    });

    it('should handle file read error', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await adapter.parseSession('/test/nonexistent.jsonl');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should extract project path from session', async () => {
      const sessionWithProject = [
        {
          "type": "session_metadata",
          "project_path": "/my/test/project"
        },
        ...mockSessionContent
      ];

      mockFs.readFile.mockResolvedValue(sessionWithProject.map(item => JSON.stringify(item)).join('\n'));

      const result = await adapter.parseSession('/test/session.jsonl');

      expect(result.success).toBe(true);
      expect(result.session?.metadata.projectPath).toBe('/my/test/project');
    });
  });

  describe('extractProjectPath()', () => {
    it('should extract project path from Claude session data', async () => {
      const sessionData = {
        "project_path": "/my/project",
        "messages": []
      };

      const projectPath = await adapter.extractProjectPath(sessionData);
      expect(projectPath).toBe('/my/project');
    });

    it('should return null when no project path found', async () => {
      const sessionData = {
        "messages": []
      };

      const projectPath = await adapter.extractProjectPath(sessionData);
      expect(projectPath).toBeNull();
    });

    it('should extract project path from messages if available', async () => {
      const sessionData = {
        "messages": [
          {
            "type": "user_message",
            "message": {
              "project_path": "/project/from/message"
            }
          }
        ]
      };

      const projectPath = await adapter.extractProjectPath(sessionData);
      expect(projectPath).toBe('/project/from/message');
    });
  });

  describe('getSessionPaths()', () => {
    it('should return all possible Claude session paths', () => {
      const paths = adapter.getSessionPaths();

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);

      // Should include common Claude CLI paths
      const pathString = paths.join(' ');
      expect(pathString).toContain('.claude');
      expect(pathString).toContain('projects');
    });
  });
});