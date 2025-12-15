import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * CodeBuddy CLI adapter for parsing CodeBuddy CLI session files
 * Production-ready implementation with proper error handling and validation
 */
export class CodeBuddyAdapter implements CLIAdapter {
  readonly cliType: CLIType = 'codebuddy';
  readonly name: string = 'CodeBuddy CLI';
  readonly version: string;

  constructor() {
    this.version = this.detectCodeBuddyVersion();
  }

  /**
   * Detect actual CodeBuddy CLI version by checking the installation
   */
  private detectCodeBuddyVersion(): string {
    Logger.adapterDebug('Detecting CodeBuddy CLI version');
    try {
      const commands = ['codebuddy --version', 'cb --version', 'buddy --version'];

      for (const cmd of commands) {
        try {
          const versionOutput = execSync(cmd, {
            encoding: 'utf-8',
            timeout: 5000,
            stdio: 'pipe'
          });
          const match = versionOutput.match(/(\d+\.\d+\.\d+)/);
          if (match) {
            const version = match[1];
            Logger.adapterInfo(`CodeBuddy CLI version detected: ${version} using command: ${cmd}`);
            return version;
          }
        } catch (err) {
          // Try next command
        }
      }

      Logger.adapterWarn('CodeBuddy CLI version detection failed - using unknown');
      return 'unknown';
    } catch (error) {
      Logger.adapterWarn('CodeBuddy CLI version detection failed', { error: (error as Error).message });
      return 'unknown';
    }
  }

  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking CodeBuddy CLI availability');
    try {
      const commands = ['codebuddy --version', 'cb --version', 'buddy --version'];
      let cliAvailable = false;

      for (const cmd of commands) {
        try {
          execSync(cmd, {
            encoding: 'utf-8',
            timeout: 3000,
            stdio: 'pipe'
          });
          Logger.adapterDebug(`CodeBuddy CLI command execution successful: ${cmd}`);
          cliAvailable = true;
          break;
        } catch (err) {
          // Try next command
        }
      }

      return cliAvailable;
    } catch (error) {
      Logger.adapterError('CodeBuddy CLI availability check failed', error as Error);
      return false;
    }
  }

  async getCLIConfig(): Promise<CLIConfig> {
    Logger.adapterDebug('Getting CodeBuddy CLI configuration');
    const homeDir = os.homedir();
    const sessionPaths: string[] = [];

    try {
      const possibleDirs = [
        path.join(homeDir, '.codebuddy'),
        path.join(homeDir, '.config', 'codebuddy')
      ];

      for (const baseDir of possibleDirs) {
        if (fs.existsSync(baseDir)) {
          const subDirs = ['sessions', 'chats', 'conversations', 'history', 'logs'];
          for (const subDir of subDirs) {
            const fullPath = path.join(baseDir, subDir);
            if (fs.existsSync(fullPath)) {
              const stats = await fs.stat(fullPath);
              if (stats.isDirectory()) {
                sessionPaths.push(fullPath);
              }
            }
          }
        }
      }

      if (sessionPaths.length === 0) {
        sessionPaths.push(
          path.join(homeDir, '.codebuddy', 'sessions'),
          path.join(homeDir, '.config', 'codebuddy', 'chats')
        );
      }

      return {
        homeDir: possibleDirs.find(dir => fs.existsSync(dir)) || path.join(homeDir, '.codebuddy'),
        sessionPaths,
        version: this.version
      };

    } catch (error) {
      Logger.adapterError('Error getting CodeBuddy CLI config:', error as Error);
      return {
        homeDir: path.join(homeDir, '.codebuddy'),
        sessionPaths: [path.join(homeDir, '.codebuddy', 'sessions')],
        version: this.version
      };
    }
  }

  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    return [
      path.join(homeDir, '.codebuddy', 'sessions'),
      path.join(homeDir, '.codebuddy', 'chats'),
      path.join(homeDir, '.codebuddy', 'conversations'),
      path.join(homeDir, '.config', 'codebuddy', 'sessions')
    ].filter(p => !p.includes('undefined'));
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    Logger.adapterDebug(`Parsing CodeBuddy session file: ${filePath}`);

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return {
          success: false,
          error: 'Path is not a file',
          filePath
        };
      }

      const content = await fs.readFile(filePath, 'utf-8');
      let messages: SessionMessage[] = [];

      if (filePath.endsWith('.json') || filePath.endsWith('.jsonl')) {
        messages = this.parseJsonContent(content);
      } else {
        messages = this.parseTextContent(content);
      }

      if (messages.length > 0) {
        return this.createSessionResult(filePath, stats, messages);
      }

      return {
        success: false,
        error: 'No valid messages found',
        filePath
      };

    } catch (error) {
      Logger.adapterError(`Failed to parse CodeBuddy session file: ${filePath}`, error as Error);
      return {
        success: false,
        error: (error as Error).message,
        filePath
      };
    }
  }

  private parseJsonContent(content: string): SessionMessage[] {
    const messages: SessionMessage[] = [];

    try {
      const lines = content.trim().split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const message = this.parseMessage(data);
          if (message) {
            messages.push(message);
          }
        } catch (parseError) {
          // Skip invalid lines
        }
      }
    } catch (error) {
      // Handle as single JSON object
      try {
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          for (const item of data) {
            const message = this.parseMessage(item);
            if (message) {
              messages.push(message);
            }
          }
        } else if (data.messages || data.conversation) {
          const conversation = data.messages || data.conversation;
          if (Array.isArray(conversation)) {
            for (const item of conversation) {
              const message = this.parseMessage(item);
              if (message) {
                messages.push(message);
              }
            }
          }
        }
      } catch (err) {
        // JSON parsing failed
      }
    }

    return messages;
  }

  private parseTextContent(content: string): SessionMessage[] {
    const messages: SessionMessage[] = [];
    const lines = content.split('\n');

    let currentRole: 'user' | 'assistant' | 'system' = 'user';
    let currentContent = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.toLowerCase().startsWith('user:') || trimmedLine.toLowerCase().startsWith('human:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date(),
            metadata: {}
          });
        }
        currentRole = 'user';
        currentContent = trimmedLine.replace(/^(user|human):/i, '').trim();
      } else if (trimmedLine.toLowerCase().startsWith('assistant:') || trimmedLine.toLowerCase().startsWith('buddy:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date(),
            metadata: {}
          });
        }
        currentRole = 'assistant';
        currentContent = trimmedLine.replace(/^(assistant|buddy):/i, '').trim();
      } else if (trimmedLine) {
        currentContent += (currentContent ? '\n' : '') + line;
      }
    }

    if (currentContent) {
      messages.push({
        role: currentRole,
        content: currentContent.trim(),
        timestamp: new Date(),
        metadata: {}
      });
    }

    return messages;
  }

  private parseMessage(data: any): SessionMessage | null {
    try {
      const role = data.role || data.sender || 'user';
      const content = data.content || data.message || data.text || '';

      if (!content) return null;

      return {
        role: role.toLowerCase().includes('user') ? 'user' : 'assistant',
        content: String(content),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        metadata: {
          model: data.model || 'codebuddy-default',
          tokens: data.tokens,
          ...data.metadata
        }
      };
    } catch (error) {
      return null;
    }
  }

  private createSessionResult(filePath: string, stats: fs.Stats, messages: SessionMessage[]): SessionParseResult {
    const sessionId = path.basename(filePath, path.extname(filePath));

    const metadata: SessionMetadata = {
      cliType: this.cliType,
      sessionId,
      filePath,
      projectPath: path.dirname(filePath),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      messageCount: messages.length,
      totalTokens: messages.reduce((sum, msg) => sum + (msg.metadata?.tokens || 0), 0),
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'CodeBuddy Session'
    };

    return {
      success: true,
      session: {
        metadata,
        messages
      },
      filePath
    };
  }

  async getCLIPath(): Promise<string | null> {
    // Similar implementation to other adapters
    return null;
  }

  async extractProjectPath(sessionData: any): Promise<string | null> {
    try {
      if (sessionData.metadata?.projectPath) {
        return sessionData.metadata.projectPath;
      }
      return null;
    } catch {
      return null;
    }
  }
}