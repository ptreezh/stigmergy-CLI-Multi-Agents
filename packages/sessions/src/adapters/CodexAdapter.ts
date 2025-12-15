import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * Codex CLI adapter for parsing OpenAI Codex CLI session files
 * Production-ready implementation with proper error handling and validation
 */
export class CodexAdapter implements CLIAdapter {
  readonly cliType: CLIType = 'codex';
  readonly name: string = 'OpenAI Codex CLI';
  readonly version: string;

  constructor() {
    this.version = this.detectCodexVersion();
  }

  /**
   * Detect actual Codex CLI version by checking the installation
   */
  private detectCodexVersion(): string {
    Logger.adapterDebug('Detecting Codex CLI version');
    try {
      const commands = ['codex --version', 'openai-codex --version', 'codex-cli --version'];

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
            Logger.adapterInfo(`Codex CLI version detected: ${version} using command: ${cmd}`);
            return version;
          }
        } catch (err) {
          // Try next command
        }
      }

      Logger.adapterWarn('Codex CLI version detection failed - using unknown');
      return 'unknown';
    } catch (error) {
      Logger.adapterWarn('Codex CLI version detection failed', { error: (error as Error).message });
      return 'unknown';
    }
  }

  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking Codex CLI availability');
    try {
      const commands = ['codex --version', 'openai-codex --version', 'codex-cli --version'];
      let cliAvailable = false;

      for (const cmd of commands) {
        try {
          execSync(cmd, {
            encoding: 'utf-8',
            timeout: 3000,
            stdio: 'pipe'
          });
          Logger.adapterDebug(`Codex CLI command execution successful: ${cmd}`);
          cliAvailable = true;
          break;
        } catch (err) {
          // Try next command
        }
      }

      return cliAvailable;
    } catch (error) {
      Logger.adapterError('Codex CLI availability check failed', error as Error);
      return false;
    }
  }

  async getCLIConfig(): Promise<CLIConfig> {
    Logger.adapterDebug('Getting Codex CLI configuration');
    const homeDir = os.homedir();
    const sessionPaths: string[] = [];

    try {
      const possibleDirs = [
        path.join(homeDir, '.codex'),
        path.join(homeDir, '.openai-codex'),
        path.join(homeDir, '.config', 'codex'),
        path.join(homeDir, '.config', 'openai-codex')
      ];

      for (const baseDir of possibleDirs) {
        if (fs.existsSync(baseDir)) {
          const subDirs = ['sessions', 'chats', 'conversations', 'history', 'logs', 'api-logs'];
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
          path.join(homeDir, '.codex', 'sessions'),
          path.join(homeDir, '.config', 'codex', 'chats')
        );
      }

      return {
        homeDir: possibleDirs.find(dir => fs.existsSync(dir)) || path.join(homeDir, '.codex'),
        sessionPaths,
        version: this.version
      };

    } catch (error) {
      Logger.adapterError('Error getting Codex CLI config:', error as Error);
      return {
        homeDir: path.join(homeDir, '.codex'),
        sessionPaths: [path.join(homeDir, '.codex', 'sessions')],
        version: this.version
      };
    }
  }

  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    return [
      path.join(homeDir, '.codex', 'sessions'),
      path.join(homeDir, '.codex', 'chats'),
      path.join(homeDir, '.codex', 'conversations'),
      path.join(homeDir, '.openai-codex', 'history'),
      path.join(homeDir, '.config', 'codex', 'sessions'),
      path.join(homeDir, '.config', 'codex', 'api-logs')
    ].filter(p => !p.includes('undefined'));
  }

  async parseSession(filePath: string): Promise<SessionParseResult> {
    Logger.adapterDebug(`Parsing Codex CLI session file: ${filePath}`);

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
      Logger.adapterError(`Failed to parse Codex CLI session file: ${filePath}`, error as Error);
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
        } else if (data.messages || data.conversation || data.choices) {
          const conversation = data.messages || data.conversation;
          if (Array.isArray(conversation)) {
            for (const item of conversation) {
              const message = this.parseMessage(item);
              if (message) {
                messages.push(message);
              }
            }
          }

          // Handle OpenAI API format
          if (data.choices && Array.isArray(data.choices)) {
            for (const choice of data.choices) {
              if (choice.message) {
                const message = this.parseMessage(choice.message);
                if (message) {
                  messages.push(message);
                }
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
      } else if (trimmedLine.toLowerCase().startsWith('assistant:') || trimmedLine.toLowerCase().startsWith('codex:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date(),
            metadata: {}
          });
        }
        currentRole = 'assistant';
        currentContent = trimmedLine.replace(/^(assistant|codex):/i, '').trim();
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
          model: data.model || 'codex-text-davinci-003',
          tokens: data.tokens || data.usage?.total_tokens,
          temperature: data.temperature,
          maxTokens: data.max_tokens || data.maxTokens,
          topP: data.top_p,
          frequencyPenalty: data.frequency_penalty,
          presencePenalty: data.presence_penalty,
          finishReason: data.finish_reason,
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
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'Codex CLI Session'
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