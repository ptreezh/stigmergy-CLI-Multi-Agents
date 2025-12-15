import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

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

      const files = readdirSync(sessionsPath);
      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.session')) {
          try {
            const filePath = join(sessionsPath, file);
            const content = readFileSync(filePath, 'utf8');
            const sessionData = JSON.parse(content);

            // Check if session belongs to current project
            if (this.isProjectSession(sessionData, projectPath)) {
              sessions.push({
                cliType,
                sessionId: sessionData.id || sessionData.sessionId || file.replace(/\.(json|session)$/, ''),
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
      console.warn(`Warning: Could not scan ${cliType} sessions at ${sessionsPath}:`, (error as Error).message);
    }

    return sessions;
  }

  /**
   * Scans sessions from all supported CLI tools
   */
  scanAllCLISessions(projectPath: string): Session[] {
    const allSessions: Session[] = [];
    const cliPaths = this.getCLISessionPaths();

    for (const [cliType, sessionsPath] of Object.entries(cliPaths)) {
      const sessions = this.scanSessions(cliType, sessionsPath, projectPath);
      allSessions.push(...sessions);
    }

    return allSessions;
  }

  /**
   * Gets the session paths for all supported CLI tools
   */
  private getCLISessionPaths(): Record<string, string> {
    const os = require('os');
    const homeDir = os.homedir();

    return {
      claude: join(homeDir, '.claude', 'sessions'),
      gemini: join(homeDir, '.gemini', 'sessions'),
      qwen: join(homeDir, '.qwen', 'sessions'),
      iflow: join(homeDir, '.iflow', 'stigmergy', 'sessions'),
      codebuddy: join(homeDir, '.codebuddy', 'sessions'),
      qodercli: join(homeDir, '.qodercli', 'sessions'),
      codex: join(homeDir, '.codex', 'sessions')
    };
  }

  /**
   * Checks if a session belongs to the current project
   */
  private isProjectSession(session: any, projectPath: string): boolean {
    const sessionProject = session.projectPath || session.workingDirectory;
    if (!sessionProject) return true; // If no project path specified, assume it belongs

    return sessionProject === projectPath ||
           sessionProject.startsWith(projectPath) ||
           projectPath.startsWith(sessionProject);
  }

  /**
   * Extracts content from session data
   */
  private extractContent(sessionData: any): string {
    if (sessionData.content) {
      return sessionData.content;
    }

    if (sessionData.messages) {
      return sessionData.messages
        .map((msg: any) => msg.content || msg.text || '')
        .join(' ');
    }

    if (Array.isArray(sessionData)) {
      return sessionData
        .map((item: any) => item.content || item.text || '')
        .join(' ');
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