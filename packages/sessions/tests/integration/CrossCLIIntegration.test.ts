import { SessionScanner, SessionExporter } from '../../src/core';
import { ClaudeAdapter } from '../../src/adapters/ClaudeAdapter';

describe('Cross-CLI Integration Tests', () => {
  let scanner: SessionScanner;
  let exporter: SessionExporter;
  let adapter: ClaudeAdapter;

  beforeEach(() => {
    adapter = new ClaudeAdapter();
    scanner = new SessionScanner([adapter]);
    exporter = new SessionExporter();
  });

  describe('Full Workflow Integration', () => {
    it('should scan and export sessions end-to-end', async () => {
      // Mock Claude adapter availability
      jest.spyOn(adapter, 'isAvailable').mockResolvedValue(false);

      // Test that the system handles no available adapters gracefully
      const sessions = await scanner.scanAllSessions();
      expect(Array.isArray(sessions)).toBe(true);

      // Test statistics with no sessions
      const stats = await scanner.getSessionStatistics();
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMessages).toBe(0);
    });

    it('should export a mock session to different formats', async () => {
      const mockSession = {
        metadata: {
          cliType: 'claude' as const,
          sessionId: 'test-session',
          filePath: '/path/to/session.jsonl',
          projectPath: '/test/project',
          createdAt: new Date('2025-12-12T10:00:00Z'),
          updatedAt: new Date('2025-12-12T10:30:00Z'),
          messageCount: 2,
          totalTokens: 100
        },
        messages: [
          {
            role: 'user' as const,
            content: 'Hello, how are you?',
            timestamp: new Date('2025-12-12T10:00:00Z')
          },
          {
            role: 'assistant' as const,
            content: 'I am doing well, thank you!',
            timestamp: new Date('2025-12-12T10:00:05Z'),
            metadata: {
              model: 'claude-3-sonnet',
              tokens: 50
            }
          }
        ]
      };

      // Test markdown export
      const markdown = await exporter.exportSession(mockSession, 'markdown');
      expect(markdown).toContain('# Session: test-session');
      expect(markdown).toContain('**CLI:** claude');
      expect(markdown).toContain('👤 User');
      expect(markdown).toContain('🤖 Assistant');

      // Test JSON export
      const json = await exporter.exportSession(mockSession, 'json');
      const parsed = JSON.parse(json);
      expect(parsed.metadata.sessionId).toBe('test-session');
      expect(parsed.messages).toHaveLength(2);

      // Test context export
      const context = await exporter.exportSession(mockSession, 'context');
      expect(context).toContain('# Session Context: test-session');
      expect(context).toContain('Please continue the conversation based on this context');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid export formats gracefully', async () => {
      const mockSession = {
        metadata: {
          cliType: 'claude' as const,
          sessionId: 'test',
          filePath: '/test.jsonl',
          projectPath: '/test',
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0
        },
        messages: []
      };

      await expect(
        exporter.exportSession(mockSession, 'invalid' as any)
      ).rejects.toThrow('Unsupported export format: invalid');
    });
  });
});