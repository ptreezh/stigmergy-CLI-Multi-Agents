import { SessionScanner } from '../src/core/SessionScanner';
import * as fs from 'fs';
import * as path from 'path';
import { os } from 'os';

describe('SessionScanner - Real Environment Tests', () => {
  let sessionScanner: SessionScanner;
  let testProjectDir: string;
  let testSessionsDir: string;

  beforeEach(() => {
    sessionScanner = new SessionScanner();
    testProjectDir = fs.mkdtempSync('resumesession-test-');
    testSessionsDir = path.join(testProjectDir, '.test-sessions');
    fs.mkdirSync(testSessionsDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('Real File System Operations', () => {
    test('should scan real session files from actual filesystem', () => {
      // Create real session files with realistic data
      const sessions = [
        {
          id: 'session-1',
          title: 'React Component Development',
          content: 'Working on React components with hooks and state management',
          messages: [
            { role: 'user', content: 'How do I implement a custom hook?' },
            { role: 'assistant', content: 'You can use the useState and useEffect hooks' }
          ],
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          messageCount: 2,
          projectPath: testProjectDir
        },
        {
          id: 'session-2',
          title: 'API Design Discussion',
          content: 'Designing REST API endpoints for the application',
          messages: [
            { role: 'user', content: 'What should the user endpoint look like?' },
            { role: 'assistant', content: 'It should follow RESTful principles' }
          ],
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          messageCount: 2,
          projectPath: testProjectDir
        }
      ];

      // Write real session files
      sessions.forEach((session, index) => {
        const sessionFile = path.join(testSessionsDir, `session-${index + 1}.json`);
        fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
      });

      // Scan the directory
      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);

      expect(scannedSessions).toHaveLength(2);
      expect(scannedSessions[0].sessionId).toBe('session-1');
      expect(scannedSessions[0].title).toBe('React Component Development');
      expect(scannedSessions[0].content).toContain('React components');
      expect(scannedSessions[0].messageCount).toBe(2);
    });

    test('should handle malformed JSON files gracefully', () => {
      // Create a malformed JSON file
      const malformedFile = path.join(testSessionsDir, 'malformed.json');
      fs.writeFileSync(malformedFile, '{ invalid json content');

      // Create a valid file
      const validFile = path.join(testSessionsDir, 'valid.json');
      const validSession = {
        id: 'valid-session',
        title: 'Valid Session',
        content: 'This is valid',
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        projectPath: testProjectDir
      };
      fs.writeFileSync(validFile, JSON.stringify(validSession, null, 2));

      // Scan should skip malformed file and process valid one
      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);

      expect(scannedSessions).toHaveLength(1);
      expect(scannedFailed[0].sessionId).toBe('valid-session');
    });

    test('should handle non-existent directory', () => {
      const nonExistentDir = path.join(testProjectDir, 'non-existent');
      const scannedSessions = sessionScanner.scanSessions('test-cli', nonExistentDir, testProjectDir);

      expect(scannedSessions).toHaveLength(0);
    });

    test('should handle files with missing required fields', () => {
      // Create session with missing fields
      const incompleteFile = path.join(testSessionsDir, 'incomplete.json');
      fs.writeFileSync(incompleteFile, JSON.stringify({
        title: 'Incomplete Session'
        // Missing id, content, updatedAt, messageCount, projectPath
      }));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);

      expect(scannedSessions).toHaveLength(1);
      expect(scannedSessions[0].sessionId).toBe('incomplete');
      expect(scannedSessions[0].title).toBe('Incomplete Session');
      expect(scannedSessions[0].content).toBe('');
      expect(scannedSessions[0].messageCount).toBe(0);
    });

    test('should handle nested message arrays', () => {
      const nestedFile = path.join(testSessionsDir, 'nested.json');
      const nestedSession = {
        id: 'nested-session',
        title: 'Nested Messages',
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'Second message' },
          { text: 'Third message with different field' }
        ],
        updatedAt: new Date().toISOString(),
        projectPath: testProjectDir
      };
      fs.writeFileSync(nestedFile, JSON.stringify(nestedSession, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);

      expect(scannedSessions).toHaveLength(1);
      expect(scannedSessions[0].content).toBe('First message Second message Third message with different field');
      expect(scannedSessions[0].messageCount).toBe(3);
    });
  });

  describe('Project Path Matching', () => {
    test('should match exact project paths', () => {
      const sessionFile = path.join(testSessionsDir, 'exact-match.json');
      const session = {
        id: 'exact-match',
        title: 'Exact Match Test',
        content: 'Test content',
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        projectPath: testProjectDir
      };
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(scannedSessions).toHaveLength(1);
    });

    test('should match subdirectory project paths', () => {
      const sessionFile = path.join(testSessionsDir, 'subdir-match.json');
      const session = {
        id: 'subdir-match',
        title: 'Subdir Match Test',
        content: 'Test content',
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        projectPath: path.join(testProjectDir, 'subdir')
      };
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(scannedSessions).toHaveLength(1);
      expect(scannedSessions[0].sessionId).toBe('subdir-match');
    });

    test('should match parent directory project paths', () => {
      const sessionFile = path.join(testSessionsDir, 'parent-match.json');
      const session = {
        id: 'parent-match',
        title: 'Parent Match Test',
        content: 'Test content',
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        projectPath: path.dirname(testProjectDir)
      };
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(scannedSessions).toHaveLength(1);
      expect(scannedSessions[0].sessionId).toBe('parent-match');
    });

    test('should exclude sessions from different projects', () => {
      const sessionFile = path.join(testSessionsDir, 'different-project.json');
      const session = {
        id: 'different-project',
        title: 'Different Project',
        content: 'Different content',
        updatedAt: new Date().toISOString(),
        messageCount: 1,
        projectPath: '/completely/different/project'
      };
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(scannedSessions).toHaveLength(0);
    });
  });

  describe('Real CLI Session Path Detection', () => {
    test('should scan all CLI session paths in real home directory', () => {
      const allSessions = sessionScanner.scanAllCLISessions(testProjectDir);
      
      // Should return empty array since no CLI tools are actually installed
      expect(Array.isArray(allSessions)).toBe(true);
    });

    test('should handle missing home directory gracefully', () => {
      // Test with non-existent home directory
      const mockOs = os as any;
      const originalHomedir = mockOs.homedir;
      mockOs.homedir = '/non/existent/path';

      const allSessions = sessionScanner.scanAllCLISessions(testProjectDir);
      
      expect(Array.isArray(allSessions)).toBe(true);
      expect(allSessions).toHaveLength(0);
      
      // Restore original homedir
      mockOs.homedir = originalHomedir;
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large session files efficiently', () => {
      // Create a large session file
      const largeSession = {
        id: 'large-session',
        title: 'Large Session Test',
        content: 'A'.repeat(10000), // 10KB of content
        messages: Array(100).fill(0).map((_, i) => ({
          role: 'user',
          content: `Message ${i + 1} content`
        })),
        updatedAt: new Date().toISOString(),
        messageCount: 100,
        projectPath: testProjectDir
      };

      const largeFile = path.join(testSessionsDir, 'large-session.json');
      fs.writeFileSync(largeFile, JSON.stringify(largeSession, null, 2));

      const startTime = Date.now();
      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      const endTime = Date.now();

      expect(scannedSessions).toHaveLength(1);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle Unicode and special characters', () => {
      const unicodeSession = {
        id: 'unicode-session',
        title: 'Unicode 测试 🚀',
        content: 'Content with emoji 🎉 and 中文 characters',
        messages: [
          { content: '消息1: 你好' },
          { content: 'Message 2: Hello World 🌍' }
        ],
        updatedAt: new Date().toISOString(),
        messageCount: 2,
        projectPath: testProjectDir
      };

      const unicodeFile = path.join(testSessionsDir, 'unicode.json');
      fs.writeFileSync(unicodeFile, JSON.stringify(unicodeSession, null, 2));

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testProjectDir);
      expect(scannedSessions).toHaveLength(1);
      expect(scannedSessions[0].title).toBe('Unicode 测试 🚀');
      expect(scannedSessions[0].content).toContain('emoji 🎉');
    });

    test('should handle files with various timestamp formats', () => {
      const timestampFormats = [
        new Date().toISOString(),
        new Date().getTime().toString(),
        '2025-01-15T10:30:00.000Z',
        '2025/01/15 10:30:00'
      ];

      timestampFormats.forEach((timestamp, index) => {
        const sessionFile = path.join(testSessionsDir, `timestamp-${index}.json`);
        const session = {
          id: `timestamp-${index}`,
          title: `Timestamp Test ${index}`,
          content: `Testing timestamp format: ${timestamp}`,
          updatedAt: timestamp,
          messageCount: 1,
          projectPath: testProjectDir
        };

        fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
      });

      const scannedSessions = sessionScanner.scanSessions('test-cli', testSessionsDir, testPathProject);
      expect(scannedSessions).toHaveLength(timestampFormats.length);
      
      // All timestamps should be parsed to Date objects
      scannedSessions.forEach(session => {
        expect(session.updatedAt).toBeInstanceOf(Date);
      });
    });
  });
});