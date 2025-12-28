import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { PathConfigManager } from '../config/PathConfigManager';

export interface Session {
  cliType: string;
  sessionId: string;
  title: string;
  content: string;
  updatedAt: Date;
  messageCount: number;
  projectPath: string;
}

/**
 * Scans session files from different CLI tools
 */
export class SessionScanner {
  /**
   * Scans sessions for a specific CLI type
   */
  scanSessions(cliType: string, sessionsPath: string, projectPath: string): Session[] {
    const sessions: Session[] = [];

    if (!sessionsPath || !projectPath) {
      return sessions;
    }

    try {
      if (!require('fs').existsSync(sessionsPath)) {
        return sessions;
      }

      // For IFlow, Claude, QoderCLI: scan projects subdirectories (one level)
      if ((cliType === 'iflow' || cliType === 'claude' || cliType === 'qodercli') && sessionsPath.includes('projects')) {
        const subdirs = readdirSync(sessionsPath);
        for (const subdir of subdirs) {
          const subdirPath = join(sessionsPath, subdir);
          try {
            const stat = statSync(subdirPath);
            if (stat.isDirectory()) {
              sessions.push(...this.scanSessionFiles(cliType, subdirPath, projectPath));
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For Gemini: scan tmp/<hash>/chats subdirectories (multiple levels)
      if (cliType === 'gemini' && sessionsPath.includes('tmp')) {
        const hashDirs = readdirSync(sessionsPath);
        for (const hashDir of hashDirs) {
          const hashDirPath = join(sessionsPath, hashDir);
          try {
            const stat = statSync(hashDirPath);
            if (stat.isDirectory()) {
              const chatsPath = join(hashDirPath, 'chats');
              if (require('fs').existsSync(chatsPath)) {
                sessions.push(...this.scanSessionFiles(cliType, chatsPath, projectPath));
              }
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For Qwen: scan projects/<projectName>/chats subdirectories (two levels)
      if (cliType === 'qwen' && sessionsPath.includes('projects')) {
        const projectDirs = readdirSync(sessionsPath);
        for (const projectDir of projectDirs) {
          const projectDirPath = join(sessionsPath, projectDir);
          try {
            const stat = statSync(projectDirPath);
            if (stat.isDirectory()) {
              const chatsPath = join(projectDirPath, 'chats');
              if (require('fs').existsSync(chatsPath)) {
                sessions.push(...this.scanSessionFiles(cliType, chatsPath, projectPath));
              }
            }
          } catch (error) {
            continue;
          }
        }
        return sessions;
      }

      // For CodeBuddy: scan both projects subdirectories and root history.jsonl
      if (cliType === 'codebuddy') {
        // Scan projects subdirectories
        const projectsPath = join(sessionsPath, 'projects');
        if (require('fs').existsSync(projectsPath)) {
          const projectDirs = readdirSync(projectsPath);
          for (const projectDir of projectDirs) {
            const projectDirPath = join(projectsPath, projectDir);
            try {
              const stat = statSync(projectDirPath);
              if (stat.isDirectory()) {
                sessions.push(...this.scanSessionFiles(cliType, projectDirPath, projectPath));
              }
            } catch (error) {
              continue;
            }
          }
        }
        // Also scan root history.jsonl
        sessions.push(...this.scanSessionFiles(cliType, sessionsPath, projectPath));
        return sessions;
      }

      return this.scanSessionFiles(cliType, sessionsPath, projectPath);
    } catch (error) {
      console.warn(`Warning: Could not scan ${cliType} sessions at ${sessionsPath}:`, (error as Error).message);
    }

    return sessions;
  }

  private scanSessionFiles(cliType: string, sessionsPath: string, projectPath: string): Session[] {
    const sessions: Session[] = [];

    try {
      const files = readdirSync(sessionsPath);
      for (const file of files) {
        // Support both .json and .jsonl formats
        if (file.endsWith('.json') || file.endsWith('.session') || file.endsWith('.jsonl')) {
          try {
            const filePath = join(sessionsPath, file);
            let sessionData: any;

            // Parse JSONL format (IFlow, Qwen, CodeBuddy)
            if (file.endsWith('.jsonl')) {
              const content = readFileSync(filePath, 'utf8');
              const lines = content.trim().split('\n').filter(line => line.trim());
              const messages = lines.map(line => JSON.parse(line));
              
              if (messages.length === 0) continue;

              // Extract session info from JSONL messages
              sessionData = this.parseJSONLSession(messages, file);
            } else {
              // Parse regular JSON format
              const content = readFileSync(filePath, 'utf8');
              sessionData = JSON.parse(content);
            }

            // Check if session belongs to current project
            if (this.isProjectSession(sessionData, projectPath)) {
              sessions.push({
                cliType,
                sessionId: sessionData.id || sessionData.sessionId || file.replace(/\.(json|session|jsonl)$/, ''),
                title: sessionData.title || sessionData.topic || 'Untitled',
                content: this.extractContent(sessionData),
                updatedAt: new Date(sessionData.updatedAt || sessionData.timestamp || statSync(filePath).mtime),
                messageCount: sessionData.messageCount || this.countMessages(sessionData),
                projectPath
              });
            }
          } catch (error) {
            // Skip invalid files, continue with others
            console.warn(`Warning: Could not parse session file ${file}:`, (error as Error).message);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan files:`, (error as Error).message);
    }

    return sessions;
  }

  private parseJSONLSession(messages: any[], filename: string): any {
    const firstMsg = messages[0];
    const lastMsg = messages[messages.length - 1];
    const userMessages = messages.filter(m => m.type === 'user' || m.role === 'user');
    
    let title = 'Untitled Session';
    if (userMessages.length > 0) {
      const firstUserMsg = userMessages[0];
      // Handle nested message structure
      const content = firstUserMsg.message?.content || firstUserMsg.content || '';
      
      // Use extractTextFromContent to handle all formats (string, array, object)
      const extractedText = this.extractTextFromContent(content);
      
      if (extractedText && extractedText.trim()) {
        title = extractedText.substring(0, 100) || title;
      }
    }

    // Extract content from messages, handling nested structures
    const contentParts = messages
      .map(m => {
        if (m.message && typeof m.message === 'object') {
          return m.message.content || m.message.text || '';
        }
        return m.content || m.text || '';
      })
      .filter(text => text && typeof text === 'string' && text.trim());

    return {
      sessionId: firstMsg.sessionId || filename.replace('.jsonl', ''),
      title: title,
      content: contentParts.join(' '),
      timestamp: lastMsg.timestamp || new Date().toISOString(),
      projectPath: firstMsg.cwd || firstMsg.workingDirectory,
      messageCount: messages.filter(m => m.type === 'user' || m.type === 'assistant' || m.role === 'user' || m.role === 'assistant').length,
      messages: messages
    };
  }

  /**
   * Scans sessions from all supported CLI tools
   */
  scanAllCLISessions(projectPath: string): Session[] {
    const allSessions: Session[] = [];
    const pathManager = PathConfigManager.getInstance();
    const cliPathsMap = pathManager.getAllCLISessionPaths();

    for (const [cliType, sessionsPaths] of Object.entries(cliPathsMap)) {
      // Scan all possible paths for this CLI
      for (const sessionsPath of sessionsPaths) {
        const sessions = this.scanSessions(cliType, sessionsPath, projectPath);
        allSessions.push(...sessions);
      }
    }

    return allSessions;
  }

  /**
   * Checks if a session belongs to the current project
   */
  private isProjectSession(session: any, projectPath: string): boolean {
    const sessionProject = session.projectPath || session.workingDirectory;
    if (!sessionProject) return true; // If no project path specified, assume it belongs

    // Exact match
    if (sessionProject === projectPath) return true;

    // Prefix match
    if (sessionProject.startsWith(projectPath) || projectPath.startsWith(sessionProject)) {
      return true;
    }

    // Extract and compare project names (last part of path)
    const getProjectName = (p: string) => {
      const normalized = p.replace(/\\/g, '/').replace(/^-+/, '');
      const parts = normalized.split('/').filter(x => x);
      return parts[parts.length - 1]?.toLowerCase() || '';
    };

    const currentProjectName = getProjectName(projectPath);
    const sessionProjectName = getProjectName(sessionProject);

    // Match by project name
    if (currentProjectName && sessionProjectName && currentProjectName === sessionProjectName) {
      return true;
    }

    return false;
  }

  /**
   * Extracts content from session data
   */
  private extractContent(sessionData: any): string {
    if (sessionData.content && typeof sessionData.content === 'string') {
      return sessionData.content;
    }

    if (sessionData.messages && Array.isArray(sessionData.messages)) {
      return sessionData.messages
        .map((msg: any) => {
          // Handle nested message structure (IFlow format)
          if (msg.message && typeof msg.message === 'object') {
            const content = msg.message.content || msg.message.text || '';
            return this.extractTextFromContent(content);
          }
          // Handle direct content (Claude/Gemini format or CodeBuddy array format)
          const content = msg.content || msg.text || '';
          return this.extractTextFromContent(content);
        })
        .filter((text: string) => text && typeof text === 'string' && text.trim())
        .join(' ');
    }

    if (Array.isArray(sessionData)) {
      return sessionData
        .map((item: any) => {
          if (item.message && typeof item.message === 'object') {
            const content = item.message.content || item.message.text || '';
            return this.extractTextFromContent(content);
          }
          const content = item.content || item.text || '';
          return this.extractTextFromContent(content);
        })
        .filter((text: string) => text && typeof text === 'string' && text.trim())
        .join(' ');
    }

    return '';
  }

  /**
   * Extracts text from various content formats
   * Handles: string, array of objects with text field, nested structures
   */
  private extractTextFromContent(content: any): string {
    // Already a string
    if (typeof content === 'string') {
      return content;
    }

    // CodeBuddy format: array of {type, text} objects
    if (Array.isArray(content)) {
      return content
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.text || item.content || '';
          }
          return '';
        })
        .filter((text: string) => text && typeof text === 'string')
        .join(' ');
    }

    // Object with nested content
    if (content && typeof content === 'object') {
      return content.text || content.content || JSON.stringify(content);
    }

    return '';
  }

  /**
   * Counts messages in session data
   */
  private countMessages(sessionData: any): number {
    if (sessionData.messages) {
      return Array.isArray(sessionData.messages) ? sessionData.messages.length : 0;
    }

    if (Array.isArray(sessionData)) {
      return sessionData.length;
    }

    return 0;
  }
}