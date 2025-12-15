import { Session, SessionMessage, SessionMetadata, CLIType } from '../../../src/types/Session';

describe('Session Types', () => {
  describe('SessionMessage', () => {
    it('should create a valid user message', () => {
      const message: SessionMessage = {
        role: 'user',
        content: 'Hello, how are you?',
        timestamp: new Date('2025-12-12T10:00:00Z')
      };

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello, how are you?');
      expect(message.timestamp).toEqual(new Date('2025-12-12T10:00:00Z'));
    });

    it('should create a valid assistant message with metadata', () => {
      const message: SessionMessage = {
        role: 'assistant',
        content: 'I am doing well, thank you!',
        timestamp: new Date('2025-12-12T10:00:05Z'),
        metadata: {
          model: 'claude-3-sonnet',
          tokens: 50
        }
      };

      expect(message.role).toBe('assistant');
      expect(message.metadata?.model).toBe('claude-3-sonnet');
      expect(message.metadata?.tokens).toBe(50);
    });

    it('should validate required fields', () => {
      const createMessage = () => ({
        role: 'user' as const,
        content: 'Test message',
        timestamp: new Date()
      });

      expect(createMessage).not.toThrow();
    });
  });

  describe('SessionMetadata', () => {
    it('should create complete metadata', () => {
      const metadata: SessionMetadata = {
        cliType: 'claude',
        sessionId: 'session-123',
        filePath: '/path/to/session.jsonl',
        projectPath: '/project/root',
        createdAt: new Date('2025-12-12T10:00:00Z'),
        updatedAt: new Date('2025-12-12T10:30:00Z'),
        messageCount: 10,
        totalTokens: 1500
      };

      expect(metadata.cliType).toBe('claude');
      expect(metadata.sessionId).toBe('session-123');
      expect(metadata.messageCount).toBe(10);
      expect(metadata.totalTokens).toBe(1500);
    });

    it('should create minimal metadata', () => {
      const metadata: SessionMetadata = {
        cliType: 'gemini',
        sessionId: 'session-456',
        filePath: '/path/to/session.json',
        projectPath: '/project/root',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 1
      };

      expect(metadata.cliType).toBe('gemini');
      expect(metadata.totalTokens).toBeUndefined();
    });
  });

  describe('Session', () => {
    it('should create a complete session', () => {
      const messages: SessionMessage[] = [
        {
          role: 'user',
          content: 'What is TypeScript?',
          timestamp: new Date('2025-12-12T10:00:00Z')
        },
        {
          role: 'assistant',
          content: 'TypeScript is a typed superset of JavaScript...',
          timestamp: new Date('2025-12-12T10:00:05Z'),
          metadata: {
            model: 'claude-3-sonnet',
            tokens: 100
          }
        }
      ];

      const metadata: SessionMetadata = {
        cliType: 'claude',
        sessionId: 'session-complete',
        filePath: '/path/to/session.jsonl',
        projectPath: '/project/typescript-demo',
        createdAt: new Date('2025-12-12T10:00:00Z'),
        updatedAt: new Date('2025-12-12T10:00:05Z'),
        messageCount: 2,
        totalTokens: 100
      };

      const session: Session = {
        metadata,
        messages
      };

      expect(session.messages).toHaveLength(2);
      expect(session.metadata.cliType).toBe('claude');
      expect(session.messages[0].role).toBe('user');
      expect(session.messages[1].role).toBe('assistant');
    });

    it('should handle empty session', () => {
      const metadata: SessionMetadata = {
        cliType: 'qwen',
        sessionId: 'session-empty',
        filePath: '/path/to/empty.json',
        projectPath: '/project/empty',
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0
      };

      const session: Session = {
        metadata,
        messages: []
      };

      expect(session.messages).toHaveLength(0);
      expect(session.metadata.messageCount).toBe(0);
    });
  });

  describe('CLIType', () => {
    it('should support all required CLI types', () => {
      const supportedTypes: CLIType[] = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qoder', 'codex'];

      supportedTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qoder', 'codex']).toContain(type);
      });
    });
  });
});