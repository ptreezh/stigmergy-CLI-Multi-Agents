import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * Gemini CLI adapter for parsing Google Gemini CLI session files
 * Production-ready implementation with proper error handling and validation
 */
export class GeminiAdapter implements CLIAdapter {
  readonly cliType: CLIType = 'gemini';
  readonly name: string = 'Google Gemini CLI';
  readonly version: string;

  constructor() {
    this.version = this.detectGeminiVersion();
  }

  /**
   * Detect actual Gemini CLI version by checking the installation
   */
  private detectGeminiVersion(): string {
    Logger.adapterDebug('Detecting Gemini CLI version');
    try {
      // Try different possible commands for Gemini CLI
      const commands = ['gemini --version', 'gemini-cli --version', 'google-ai --version'];

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
            Logger.adapterInfo(`Gemini CLI version detected: ${version} using command: ${cmd}`);
            return version;
          }
        } catch (err) {
          // Try next command
        }
      }

      Logger.adapterWarn('Gemini CLI version detection failed - using unknown');
      return 'unknown';
    } catch (error) {
      Logger.adapterWarn('Gemini CLI version detection failed', { error: (error as Error).message });
      return 'unknown';
    }
  }

  /**
   * Get actual Gemini CLI executable path from system
   */
  async getCLIPath(): Promise<string | null> {
    const { spawn } = require('child_process');

    return new Promise((resolve) => {
      // Try different methods to find gemini executable
      const commands = [
        'where gemini', // Windows
        'where gemini-cli', // Windows alternate
        'which gemini', // Unix/Mac
        'which gemini-cli', // Unix/Mac alternate
        'command -v gemini', // Unix/Mac fallback
        'command -v gemini-cli' // Unix/Mac alternate fallback
      ];

      let commandIndex = 0;
      const tryNextCommand = () => {
        if (commandIndex >= commands.length) {
          resolve(null);
          return;
        }

        const command = commands[commandIndex];
        const [cmd, ...args] = command.split(' ');

        const child = spawn(cmd, args, {
          stdio: 'pipe',
          timeout: 3000
        });

        let output = '';
        child.stdout?.on('data', (data: Buffer) => {
          output += data.toString();
        });

        child.on('close', (code: number) => {
          if (code === 0 && output.trim()) {
            resolve(output.trim().split('\n')[0]); // Return first match
          } else {
            commandIndex++;
            tryNextCommand();
          }
        });

        child.on('error', () => {
          commandIndex++;
          tryNextCommand();
        });
      };

      tryNextCommand();
    });
  }

  /**
   * Check if Gemini CLI is properly installed and available
   */
  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking Gemini CLI availability');
    try {
      // Check 1: Try to run gemini --version (try different commands)
      let cliAvailable = false;
      const commands = ['gemini --version', 'gemini-cli --version', 'google-ai --version'];

      for (const cmd of commands) {
        try {
          execSync(cmd, {
            encoding: 'utf-8',
            timeout: 3000,
            stdio: 'pipe'
          });
          Logger.adapterDebug(`Gemini CLI command execution successful: ${cmd}`);
          cliAvailable = true;
          break;
        } catch (err) {
          // Try next command
        }
      }

      if (!cliAvailable) {
        Logger.adapterWarn('No Gemini CLI command found');
        return false;
      }

      // Check 2: Verify Gemini directory exists and is accessible
      const possibleDirs = [
        path.join(os.homedir(), '.gemini'),
        path.join(os.homedir(), '.google-ai'),
        path.join(os.homedir(), '.gemini-cli'),
        path.join(os.homedir(), '.config', 'gemini'),
        path.join(os.homedir(), '.config', 'google-ai')
      ];

      let validDirFound = false;
      for (const geminiDir of possibleDirs) {
        if (fs.existsSync(geminiDir)) {
          const stats = await fs.stat(geminiDir);
          if (stats.isDirectory()) {
            try {
              await fs.readdir(geminiDir);
              Logger.adapterDebug(`Valid Gemini directory found: ${geminiDir}`);
              validDirFound = true;
              break;
            } catch (err) {
              // Try next directory
            }
          }
        }
      }

      if (!validDirFound) {
        Logger.adapterWarn('No valid Gemini directory found');
      }

      Logger.adapterInfo('Gemini CLI availability confirmed');
      return true;
    } catch (error) {
      Logger.adapterError('Gemini CLI availability check failed', error as Error);
      return false;
    }
  }

  /**
   * Get Gemini CLI configuration with proper validation
   */
  async getCLIConfig(): Promise<CLIConfig> {
    Logger.adapterDebug('Getting Gemini CLI configuration');
    const homeDir = os.homedir();
    const sessionPaths: string[] = [];

    try {
      // Check possible session directories
      const possibleDirs = [
        path.join(homeDir, '.gemini'),
        path.join(homeDir, '.google-ai'),
        path.join(homeDir, '.gemini-cli'),
        path.join(homeDir, '.config', 'gemini'),
        path.join(homeDir, '.config', 'google-ai')
      ];

      for (const baseDir of possibleDirs) {
        if (fs.existsSync(baseDir)) {
          // Check for sessions subdirectory
          const sessionDir = path.join(baseDir, 'sessions');
          if (fs.existsSync(sessionDir)) {
            const stats = await fs.stat(sessionDir);
            if (stats.isDirectory()) {
              sessionPaths.push(sessionDir);
            }
          }

          // Check for projects directory (similar to Claude)
          const projectsDir = path.join(baseDir, 'projects');
          if (fs.existsSync(projectsDir)) {
            try {
              const projectDirs = await fs.readdir(projectsDir);
              for (const projectDir of projectDirs) {
                const projectPath = path.join(projectsDir, projectDir);
                const projectStats = await fs.stat(projectPath);
                if (projectStats.isDirectory()) {
                  sessionPaths.push(projectPath);
                }
              }
            } catch (readdirError) {
              Logger.adapterWarn(`Cannot read projects directory ${projectsDir}:`, { error: (readdirError as Error).message });
            }
          }

          // Check for history directory
          const historyDir = path.join(baseDir, 'history');
          if (fs.existsSync(historyDir)) {
            const stats = await fs.stat(historyDir);
            if (stats.isDirectory()) {
              sessionPaths.push(historyDir);
            }
          }

          // Check for logs directory (sometimes sessions are stored here)
          const logsDir = path.join(baseDir, 'logs');
          if (fs.existsSync(logsDir)) {
            const stats = await fs.stat(logsDir);
            if (stats.isDirectory()) {
              sessionPaths.push(logsDir);
            }
          }
        }
      }

      // If no session paths found, still return basic config
      if (sessionPaths.length === 0) {
        Logger.adapterWarn('No Gemini session paths found, using defaults');
        // Add default paths anyway - they might be created later
        sessionPaths.push(
          path.join(homeDir, '.gemini', 'sessions'),
          path.join(homeDir, '.google-ai', 'sessions')
        );
      }

      Logger.adapterInfo(`Gemini configuration loaded with ${sessionPaths.length} session paths`);

      return {
        homeDir: possibleDirs.find(dir => fs.existsSync(dir)) || path.join(homeDir, '.gemini'),
        sessionPaths,
        version: this.version
      };

    } catch (error) {
      Logger.adapterError('Error getting Gemini CLI config:', error as Error);
      // Return minimal config even if scanning fails
      return {
        homeDir: path.join(homeDir, '.gemini'),
        sessionPaths: [
          path.join(homeDir, '.gemini', 'sessions'),
          path.join(homeDir, '.google-ai', 'sessions')
        ],
        version: this.version
      };
    }
  }

  /**
   * Get all possible session paths for Gemini CLI
   */
  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    return [
      // Standard Gemini locations
      path.join(homeDir, '.gemini', 'sessions'),
      path.join(homeDir, '.google-ai', 'sessions'),
      path.join(homeDir, '.gemini-cli', 'sessions'),

      // Project-based locations
      path.join(homeDir, '.gemini', 'projects'),
      path.join(homeDir, '.google-ai', 'projects'),

      // Config directories
      path.join(homeDir, '.config', 'gemini', 'sessions'),
      path.join(homeDir, '.config', 'google-ai', 'sessions'),

      // Alternative locations
      path.join(homeDir, '.gemini', 'history'),
      path.join(homeDir, '.google-ai', 'history'),
      path.join(homeDir, '.gemini', 'logs'),
      path.join(homeDir, '.google-ai', 'logs'),

      // Windows-specific locations
      path.join(homeDir, 'AppData', 'Local', 'Google', 'Gemini', 'sessions'),
      path.join(homeDir, 'AppData', 'Roaming', 'Google', 'Gemini', 'sessions')
    ].filter(p => !p.includes('undefined'));
  }

  /**
   * Parse a Gemini session file and extract session information
   */
  async parseSession(filePath: string): Promise<SessionParseResult> {
    Logger.adapterDebug(`Parsing Gemini session file: ${filePath}`);

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return {
          success: false,
          error: 'Path is not a file',
          filePath
        };
      }

      // Gemini CLI might use different file formats
      if (filePath.endsWith('.json') || filePath.endsWith('.jsonl')) {
        return await this.parseJsonSession(filePath, stats);
      } else if (filePath.endsWith('.txt') || filePath.endsWith('.log')) {
        return await this.parseTextSession(filePath, stats);
      } else {
        return await this.parseGenericSession(filePath, stats);
      }

    } catch (error) {
      Logger.adapterError(`Failed to parse Gemini session file: ${filePath}`, error as Error);
      return {
        success: false,
        error: (error as Error).message,
        filePath
      };
    }
  }

  /**
   * Parse JSON format session files
   */
  private async parseJsonSession(filePath: string, stats: fs.Stats): Promise<SessionParseResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Handle JSONL (line by line JSON)
      if (filePath.endsWith('.jsonl')) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        const messages: SessionMessage[] = [];

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            const message = this.parseGeminiMessage(data);
            if (message) {
              messages.push(message);
            }
          } catch (parseError) {
            // Skip invalid lines
          }
        }

        if (messages.length > 0) {
          return this.createSessionResult(filePath, stats, messages);
        }
      } else {
        // Handle regular JSON
        const data = JSON.parse(content);
        const messages = this.extractMessagesFromGeminiJson(data);

        if (messages.length > 0) {
          return this.createSessionResult(filePath, stats, messages);
        }
      }

      return {
        success: false,
        error: 'No valid messages found in JSON session',
        filePath
      };

    } catch (error) {
      return {
        success: false,
        error: `JSON parsing failed: ${(error as Error).message}`,
        filePath
      };
    }
  }

  /**
   * Parse text format session files
   */
  private async parseTextSession(filePath: string, stats: fs.Stats): Promise<SessionParseResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const messages = this.parseTextContent(content);

      if (messages.length > 0) {
        return this.createSessionResult(filePath, stats, messages);
      }

      return {
        success: false,
        error: 'No valid messages found in text session',
        filePath
      };

    } catch (error) {
      return {
        success: false,
        error: `Text parsing failed: ${(error as Error).message}`,
        filePath
      };
    }
  }

  /**
   * Parse generic session files (unknown format)
   */
  private async parseGenericSession(filePath: string, stats: fs.Stats): Promise<SessionParseResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Try to extract any meaningful content
      const messages: SessionMessage[] = [
        {
          role: 'user',
          content: `Session file: ${path.basename(filePath)}`,
          timestamp: stats.mtime,
          metadata: {
            fileType: 'generic',
            filePath,
            fileSize: stats.size
          }
        }
      ];

      return this.createSessionResult(filePath, stats, messages);

    } catch (error) {
      return {
        success: false,
        error: `Generic parsing failed: ${(error as Error).message}`,
        filePath
      };
    }
  }

  /**
   * Parse a single Gemini message from JSON data
   */
  private parseGeminiMessage(data: any): SessionMessage | null {
    try {
      // Gemini might use different field names
      const role = data.role || data.sender || data.type || 'unknown';
      const content = data.content || data.message || data.text || data.body || '';
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

      if (!content && typeof content !== 'string') {
        return null;
      }

      return {
        role: role.toLowerCase().includes('user') ? 'user' :
              role.toLowerCase().includes('assistant') || role.toLowerCase().includes('model') ? 'assistant' :
              role.toLowerCase().includes('system') ? 'system' : 'user',
        content: String(content),
        timestamp,
        metadata: {
          model: data.model || data.geminiModel || 'gemini-pro',
          tokens: data.tokens || data.tokenCount,
          temperature: data.temperature,
          ...data.metadata
        }
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Extract messages from Gemini JSON structure
   */
  private extractMessagesFromGeminiJson(data: any): SessionMessage[] {
    const messages: SessionMessage[] = [];

    try {
      // Gemini might store conversations in different structures
      if (Array.isArray(data)) {
        // Array of messages
        for (const item of data) {
          const message = this.parseGeminiMessage(item);
          if (message) {
            messages.push(message);
          }
        }
      } else if (data.conversation || data.messages || data.history) {
        // Object with conversation/messages property
        const conversation = data.conversation || data.messages || data.history;
        if (Array.isArray(conversation)) {
          for (const item of conversation) {
            const message = this.parseGeminiMessage(item);
            if (message) {
              messages.push(message);
            }
          }
        }
      } else if (data.turns || data.interactions) {
        // Object with turns/interactions property
        const turns = data.turns || data.interactions;
        if (Array.isArray(turns)) {
          for (const turn of turns) {
            if (turn.user || turn.input) {
              const userMessage = this.parseGeminiMessage(turn.user || turn.input);
              if (userMessage) {
                messages.push(userMessage);
              }
            }
            if (turn.assistant || turn.response || turn.model) {
              const assistantMessage = this.parseGeminiMessage(turn.assistant || turn.response || turn.model);
              if (assistantMessage) {
                messages.push(assistantMessage);
              }
            }
          }
        }
      }

    } catch (error) {
      Logger.adapterWarn('Failed to extract messages from Gemini JSON', { error: (error as Error).message });
    }

    return messages;
  }

  /**
   * Parse content from text files
   */
  private parseTextContent(content: string): SessionMessage[] {
    const messages: SessionMessage[] = [];
    const lines = content.split('\n');

    let currentRole: 'user' | 'assistant' | 'system' = 'user';
    let currentContent = '';
    let currentTimestamp = new Date();

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Detect role changes
      if (trimmedLine.toLowerCase().startsWith('user:') ||
          trimmedLine.toLowerCase().startsWith('human:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: currentTimestamp,
            metadata: {}
          });
        }
        currentRole = 'user';
        currentContent = trimmedLine.replace(/^(user|human):/i, '').trim();
        currentTimestamp = new Date();
      } else if (trimmedLine.toLowerCase().startsWith('assistant:') ||
                 trimmedLine.toLowerCase().startsWith('gemini:') ||
                 trimmedLine.toLowerCase().startsWith('ai:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: currentTimestamp,
            metadata: {}
          });
        }
        currentRole = 'assistant';
        currentContent = trimmedLine.replace(/^(assistant|gemini|ai):/i, '').trim();
        currentTimestamp = new Date();
      } else if (trimmedLine) {
        currentContent += (currentContent ? '\n' : '') + line;
      }
    }

    // Add the last message
    if (currentContent) {
      messages.push({
        role: currentRole,
        content: currentContent.trim(),
        timestamp: currentTimestamp,
        metadata: {}
      });
    }

    return messages;
  }

  /**
   * Create a successful session parse result
   */
  private createSessionResult(filePath: string, stats: fs.Stats, messages: SessionMessage[]): SessionParseResult {
    const sessionId = path.basename(filePath, path.extname(filePath));

    const metadata: SessionMetadata = {
      cliType: this.cliType,
      sessionId,
      filePath,
      projectPath: this.detectProjectPath(filePath),
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      messageCount: messages.length,
      totalTokens: messages.reduce((sum, msg) => sum + (msg.metadata?.tokens || 0), 0),
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'Gemini Session'
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

  /**
   * Detect project path from session file path
   */
  private detectProjectPath(sessionFilePath: string): string {
    try {
      // Try to extract project path from the file path
      const pathParts = sessionFilePath.split(path.sep);

      // Look for common project directory patterns
      const projectDirIndex = pathParts.findIndex(part =>
        part === 'projects' || part === 'workspaces' || part === 'repos'
      );

      if (projectDirIndex !== -1 && projectDirIndex < pathParts.length - 1) {
        return pathParts.slice(0, projectDirIndex + 2).join(path.sep);
      }

      // Default to parent directory
      return path.dirname(sessionFilePath);
    } catch {
      return path.dirname(sessionFilePath);
    }
  }

  /**
   * Extract project path from session data
   */
  async extractProjectPath(sessionData: any): Promise<string | null> {
    try {
      if (sessionData.metadata?.projectPath) {
        return sessionData.metadata.projectPath;
      }
      if (sessionData.filePath) {
        return this.detectProjectPath(sessionData.filePath);
      }
      return null;
    } catch {
      return null;
    }
  }
}