import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * Claude CLI adapter for parsing Claude Code session files
 * Production-ready implementation with proper error handling and validation
 */
export class ClaudeAdapter implements CLIAdapter {
  readonly cliType: string = 'claude';
  readonly name: string = 'Claude Code';
  readonly version: string;

  constructor() {
    this.version = this.detectClaudeVersion();
  }

  /**
   * Detect actual Claude CLI version by checking the installation
   */
  private detectClaudeVersion(): string {
    Logger.adapterDebug('Detecting Claude CLI version');
    try {
      const versionOutput = execSync('claude --version', {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: 'pipe'
      });
      const match = versionOutput.match(/(\d+\.\d+\.\d+)/);
      const version = match ? match[1] : 'unknown';
      Logger.adapterInfo(`Claude CLI version detected: ${version}`);
      return version;
    } catch (error) {
      Logger.adapterWarn('Claude CLI version detection failed', { error: (error as Error).message });
      // Fallback if claude command not available
      return 'unknown';
    }
  }

  /**
   * Get actual Claude CLI executable path from system
   */
  async getCLIPath(): Promise<string | null> {
    const { spawn } = require('child_process');

    return new Promise((resolve) => {
      // Try different methods to find claude executable
      const commands = [
        'where claude', // Windows
        'which claude', // Unix/Mac
        'command -v claude' // Unix/Mac fallback
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
   * Check if Claude CLI is properly installed and available
   */
  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking Claude CLI availability');
    try {
      // Check 1: Verify claude command exists
      execSync('claude --version', {
        encoding: 'utf-8',
        timeout: 3000,
        stdio: 'pipe'
      });
      Logger.adapterDebug('Claude CLI command execution successful');

      // Check 2: Verify .claude directory exists and is accessible
      const claudeDir = path.join(os.homedir(), '.claude');
      if (!fs.existsSync(claudeDir)) {
        Logger.adapterWarn('Claude directory not found', { path: claudeDir });
        return false;
      }

      // Check 3: Verify directory structure
      const stats = await fs.stat(claudeDir);
      if (!stats.isDirectory()) {
        Logger.adapterError('Claude path is not a directory', undefined, { path: claudeDir });
        return false;
      }

      // Check 4: Verify we can read the directory
      await fs.readdir(claudeDir);
      Logger.adapterInfo('Claude CLI availability confirmed');
      return true;
    } catch (error) {
      Logger.adapterError('Claude CLI availability check failed', error as Error);
      return false;
    }
  }

  /**
   * Get Claude CLI configuration with proper validation
   */
  async getCLIConfig(): Promise<CLIConfig> {
    const homeDir = path.join(os.homedir(), '.claude');
    const sessionPaths: string[] = [];

    try {
      // Verify home directory exists and is accessible
      if (!fs.existsSync(homeDir)) {
        throw new Error(`Claude home directory does not exist: ${homeDir}`);
      }

      const homeStats = await fs.stat(homeDir);
      if (!homeStats.isDirectory()) {
        throw new Error(`Claude home path is not a directory: ${homeDir}`);
      }

      // Scan for session directories with validation
      const projectsDir = path.join(homeDir, 'projects');
      if (fs.existsSync(projectsDir)) {
        const projectStats = await fs.stat(projectsDir);
        if (projectStats.isDirectory()) {
          try {
            const projects = await fs.readdir(projectsDir);

            for (const project of projects) {
              if (project.startsWith('.')) continue; // Skip hidden files

              const projectDir = path.join(projectsDir, project);
              try {
                const projectStats = await fs.stat(projectDir);
                if (projectStats.isDirectory()) {
                  // Check if this directory contains session files
                  const hasSessionFiles = await this.hasSessionFiles(projectDir);
                  if (hasSessionFiles) {
                    sessionPaths.push(projectDir);
                  }
                }
              } catch (statError) {
                // Log warning but continue with other directories
                console.warn(`Warning: Cannot access project directory ${projectDir}:`, statError);
                continue;
              }
            }
          } catch (readdirError) {
            console.warn(`Warning: Cannot read projects directory ${projectsDir}:`, readdirError);
          }
        }
      }

      // Also check for legacy session locations
      const legacySessionDir = path.join(homeDir, 'sessions');
      if (fs.existsSync(legacySessionDir)) {
        const legacyStats = await fs.stat(legacySessionDir);
        if (legacyStats.isDirectory()) {
          sessionPaths.push(legacySessionDir);
        }
      }

    } catch (error) {
      console.error(`Error getting Claude CLI config:`, error);
      // Return minimal config even if scanning fails
    }

    return {
      homeDir,
      sessionPaths,
      version: this.version
    };
  }

  /**
   * Check if directory contains session files
   */
  private async hasSessionFiles(directory: string): Promise<boolean> {
    try {
      const files = await fs.readdir(directory);
      return files.some(file =>
        file.endsWith('.jsonl') ||
        file.endsWith('.json') ||
        file.startsWith('session-') ||
        file.includes('-session')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse Claude session file with robust error handling
   */
  async parseSession(filePath: string): Promise<SessionParseResult> {
    try {
      // Validate file path and existence
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: new Error(`Session file does not exist: ${filePath}`)
        };
      }

      const fileStats = await fs.stat(filePath);
      if (!fileStats.isFile()) {
        return {
          success: false,
          error: new Error(`Path is not a file: ${filePath}`)
        };
      }

      // Check file size to prevent memory issues
      if (fileStats.size > 50 * 1024 * 1024) { // 50MB limit
        return {
          success: false,
          error: new Error(`Session file too large: ${fileStats.size} bytes`)
        };
      }

      const content = await fs.readFile(filePath, 'utf-8');

      // Validate content is not empty
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: new Error(`Session file is empty: ${filePath}`)
        };
      }

      const trimmedContent = content.trim();
      const lines = trimmedContent.split('\n').filter(line => line.trim());

      // Validate and parse session file
      const isJSONL = lines.length > 1 || lines.some(line => line.trim().startsWith('{'));
      let sessionData: any[] = [];

      if (isJSONL) {
        // Parse JSONL format
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const parsed = JSON.parse(line);
            sessionData.push(parsed);
          } catch (parseError) {
            return {
              success: false,
              error: new Error(`Invalid JSON on line ${i + 1} in ${filePath}: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
            };
          }
        }
      } else {
        // Try to parse as single JSON
        try {
          const parsed = JSON.parse(trimmedContent);
          sessionData = Array.isArray(parsed) ? parsed : [parsed];
        } catch (parseError) {
          return {
            success: false,
            error: new Error(`Invalid JSON format in ${filePath}: ${parseError instanceof Error ? parseError.message : 'Parse error'}`)
          };
        }
      }

      if (sessionData.length === 0) {
        return {
          success: false,
          error: new Error(`No valid session data found in ${filePath}`)
        };
      }

      // Extract session information
      const messages: SessionMessage[] = [];
      let projectPath: string | null = null;
      let totalTokens = 0;
      let sessionTitle: string | undefined;

      for (const entry of sessionData) {
        // Extract project path from various possible fields
        if (entry.project_path && !projectPath) {
          projectPath = entry.project_path;
        } else if (entry.projectPath && !projectPath) {
          projectPath = entry.projectPath;
        } else if (entry.working_directory && !projectPath) {
          projectPath = entry.working_directory;
        }

        // Extract session title
        if (entry.title && !sessionTitle) {
          sessionTitle = entry.title;
        }

        // Parse messages
        if (entry.type === 'user_message' || entry.type === 'assistant_message') {
          const message: SessionMessage = {
            role: entry.type === 'user_message' ? 'user' : 'assistant',
            content: this.extractMessageContent(entry),
            timestamp: this.extractTimestamp(entry),
            metadata: {}
          };

          // Add metadata if available
          if (entry.message?.model) {
            message.metadata!.model = entry.message.model;
          }
          if (entry.model) {
            message.metadata!.model = entry.model;
          }
          if (entry.message?.tokens) {
            message.metadata!.tokens = entry.message.tokens;
            totalTokens += entry.message.tokens;
          } else if (entry.tokens) {
            message.metadata!.tokens = entry.tokens;
            totalTokens += entry.tokens;
          }
          if (entry.message?.cost) {
            message.metadata!.cost = entry.message.cost;
          }

          messages.push(message);
        }
      }

      // Derive project path if not found in content
      if (!projectPath) {
        projectPath = await this.extractProjectPathFromFile(filePath);
      }

      // Generate session ID from filename
      const sessionId = this.generateSessionId(filePath);

      // Create metadata
      const metadata: SessionMetadata = {
        cliType: 'claude' as CLIType,
        sessionId,
        filePath,
        projectPath: projectPath || path.dirname(filePath),
        createdAt: messages.length > 0 ? messages[0].timestamp : fileStats.mtime,
        updatedAt: messages.length > 0 ? messages[messages.length - 1].timestamp : fileStats.mtime,
        messageCount: messages.length,
        totalTokens: totalTokens > 0 ? totalTokens : undefined,
        title: sessionTitle
      };

      return {
        success: true,
        session: {
          metadata,
          messages
        }
      };

    } catch (error) {
      return {
        success: false,
        error: new Error(`Failed to parse Claude session file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      };
    }
  }

  /**
   * Extract message content from various possible fields
   */
  private extractMessageContent(entry: any): string {
    return entry.message?.content ||
           entry.content ||
           entry.text ||
           entry.prompt ||
           entry.response ||
           '';
  }

  /**
   * Extract timestamp from entry with fallbacks
   */
  private extractTimestamp(entry: any): Date {
    const timestamp = entry.message?.timestamp ||
                     entry.timestamp ||
                     entry.created_at ||
                     entry.time;

    if (timestamp) {
      const parsed = new Date(timestamp);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    return new Date();
  }

  /**
   * Generate session ID from file path
   */
  private generateSessionId(filePath: string): string {
    const basename = path.basename(filePath);
    const nameWithoutExt = basename.replace(/\.(jsonl?|json)$/, '');

    // If it looks like a generated ID, use it as-is
    if (/^[a-f0-9-]{36}$/.test(nameWithoutExt) || /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(nameWithoutExt)) {
      return nameWithoutExt;
    }

    // Otherwise create a hash from the file path
    return Buffer.from(filePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Extract project path from session data
   */
  async extractProjectPath(sessionData: any): Promise<string | null> {
    const possiblePaths = [
      sessionData.project_path,
      sessionData.projectPath,
      sessionData.working_directory,
      sessionData.directory,
      sessionData.path
    ];

    for (const possiblePath of possiblePaths) {
      if (possiblePath && typeof possiblePath === 'string') {
        // Validate that the path exists or could be a valid path
        if (fs.existsSync(possiblePath) || this.isValidPath(possiblePath)) {
          return path.resolve(possiblePath);
        }
      }
    }

    return null;
  }

  /**
   * Check if a string looks like a valid file path
   */
  private isValidPath(pathString: string): boolean {
    // Basic path validation - adjust for OS
    const pathRegex = process.platform === 'win32'
      ? /^[a-zA-Z]:\\|^[\\\/]|\//
      : /^\//;

    return pathRegex.test(pathString);
  }

  /**
   * Get all possible session file paths for Claude CLI
   */
  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');

    return [
      path.join(claudeDir, 'projects'),
      path.join(claudeDir, 'sessions'),
      claudeDir
    ];
  }

  /**
   * Helper method to extract project path from file path
   */
  private async extractProjectPathFromFile(filePath: string): Promise<string | null> {
    try {
      let currentDir = path.dirname(filePath);

      // Search for project indicators
      const projectIndicators = [
        '.git',
        'package.json',
        'Cargo.toml',
        'pyproject.toml',
        'composer.json',
        'Gemfile',
        'go.mod',
        'pom.xml'
      ];

      while (currentDir !== path.dirname(currentDir)) {
        // Check for any project indicator
        for (const indicator of projectIndicators) {
          const indicatorPath = path.join(currentDir, indicator);
          if (fs.existsSync(indicatorPath)) {
            return currentDir;
          }
        }

        // Also check if we're still in a reasonable location (not in system directories)
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir || parentDir === os.homedir()) {
          break;
        }

        currentDir = parentDir;
      }

      // Fallback: return the directory containing the session file
      return path.dirname(filePath);
    } catch (error) {
      return null;
    }
  }
}