import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * Qoder CLI adapter for parsing Qoder CLI session files
 * Production-ready implementation with proper error handling and validation
 */
export class QoderCLIAdapter implements CLIAdapter {
  readonly cliType: CLIType = 'qodercli';
  readonly name: string = 'Qoder CLI';
  readonly version: string;

  constructor() {
    this.version = this.detectQoderVersion();
  }

  /**
   * Detect actual Qoder CLI version by checking the installation
   */
  private detectQoderVersion(): string {
    Logger.adapterDebug('Detecting Qoder CLI version');
    try {
      const commands = ['qodercli --version', 'qoder --version', 'qoder-cli --version'];

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
            Logger.adapterInfo(`Qoder CLI version detected: ${version} using command: ${cmd}`);
            return version;
          }
        } catch (err) {
          // Try next command
        }
      }

      Logger.adapterWarn('Qoder CLI version detection failed - using unknown');
      return 'unknown';
    } catch (error) {
      Logger.adapterWarn('Qoder CLI version detection failed', { error: (error as Error).message });
      return 'unknown';
    }
  }

  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking Qoder CLI availability');
    try {
      const commands = ['qodercli --version', 'qoder --version', 'qoder-cli --version'];
      let cliAvailable = false;

      for (const cmd of commands) {
        try {
          execSync(cmd, {
            encoding: 'utf-8',
            timeout: 3000,
            stdio: 'pipe'
          });
          Logger.adapterDebug(`Qoder CLI command execution successful: ${cmd}`);
          cliAvailable = true;
          break;
        } catch (err) {
          // Try next command
        }
      }

      return cliAvailable;
    } catch (error) {
      Logger.adapterError('Qoder CLI availability check failed', error as Error);
      return false;
    }
  }

  async getCLIConfig(): Promise<CLIConfig> {
    Logger.adapterDebug('Getting Qoder CLI configuration');
    const homeDir = os.homedir();
    const sessionPaths: string[] = [];

    try {
      const possibleDirs = [
        path.join(homeDir, '.qodercli'),
        path.join(homeDir, '.qoder'),
        path.join(homeDir, '.config', 'qodercli'),
        path.join(homeDir, '.config', 'qoder')
      ];

      for (const baseDir of possibleDirs) {
        if (fs.existsSync(baseDir)) {
          const subDirs = ['sessions', 'chats', 'conversations', 'history', 'logs', 'cache'];
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
          path.join(homeDir, '.qodercli', 'sessions'),
          path.join(homeDir, '.config', 'qodercli', 'conversations')
        );
      }

      return {
        homeDir: possibleDirs.find(dir => fs.existsSync(dir)) || path.join(homeDir, '.qodercli'),
        sessionPaths,
        version: this.version
      };

    } catch (error) {
      Logger.adapterError('Error getting Qoder CLI config:', error as Error);
      return {
        homeDir: path.join(homeDir, '.qodercli'),
        sessionPaths: [path.join(homeDir, '.qodercli', 'sessions')],
        version: this.version
      };
    }
  }

  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    return [
      path.join(homeDir, '.qodercli', 'sessions'),
      path.join(homeDir, '.qodercli', 'chats'),
      path.join(homeDir, '.qoder', 'conversations'),
      path.join(homeDir, '.config', 'qodercli', 'sessions'),
      path.join(homeDir, '.config', 'qoder', 'history')
    ].filter(p => !p.includes('undefined'));
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    Logger.adapterDebug(`Parsing Qoder CLI session file: ${filePath}`);

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
      Logger.adapterError(`Failed to parse Qoder CLI session file: ${filePath}`, error as Error);
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
      } else if (trimmedLine.toLowerCase().startsWith('assistant:') || trimmedLine.toLowerCase().startsWith('qoder:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date(),
            metadata: {}
          });
        }
        currentRole = 'assistant';
        currentContent = trimmedLine.replace(/^(assistant|qoder):/i, '').trim();
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
          model: data.model || 'qoder-default',
          tokens: data.tokens,
          temperature: data.temperature,
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
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'Qoder CLI Session'
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
      if (sessionData.filePath) {
        return path.dirname(sessionData.filePath);
      }
      return null;
    } catch {
      return null;
    }
  }
}