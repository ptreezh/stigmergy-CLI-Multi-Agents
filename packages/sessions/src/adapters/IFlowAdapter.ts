import { CLIAdapter, SessionParseResult, CLIConfig } from '../types/CLIAdapter';
import { Session, SessionMessage, SessionMetadata, CLIType } from '../types/Session';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

/**
 * IFlow CLI adapter for parsing IFlow CLI session files
 * Production-ready implementation with proper error handling and validation
 */
export class IFlowAdapter implements CLIAdapter {
  readonly cliType: CLIType = 'iflow';
  readonly name: string = 'IFlow CLI';
  readonly version: string;

  constructor() {
    this.version = this.detectIFlowVersion();
  }

  /**
   * Detect actual IFlow CLI version by checking the installation
   */
  private detectIFlowVersion(): string {
    Logger.adapterDebug('Detecting IFlow CLI version');
    try {
      // Try different possible commands for IFlow CLI
      const commands = [
        'iflow --version',
        'iflow-cli --version',
        'stigmergy --version',
        'if --version'
      ];

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
            Logger.adapterInfo(`IFlow CLI version detected: ${version} using command: ${cmd}`);
            return version;
          }
        } catch (err) {
          // Try next command
        }
      }

      Logger.adapterWarn('IFlow CLI version detection failed - using unknown');
      return 'unknown';
    } catch (error) {
      Logger.adapterWarn('IFlow CLI version detection failed', { error: (error as Error).message });
      return 'unknown';
    }
  }

  /**
   * Get actual IFlow CLI executable path from system
   */
  async getCLIPath(): Promise<string | null> {
    const { spawn } = require('child_process');

    return new Promise((resolve) => {
      // Try different methods to find iflow executable
      const commands = [
        'where iflow', // Windows
        'where iflow-cli', // Windows alternate
        'where stigmergy', // Windows alternate
        'which iflow', // Unix/Mac
        'which iflow-cli', // Unix/Mac alternate
        'which stigmergy', // Unix/Mac alternate
        'command -v iflow', // Unix/Mac fallback
        'command -v iflow-cli', // Unix/Mac alternate fallback
        'command -v stigmergy' // Unix/Mac alternate fallback
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
   * Check if IFlow CLI is properly installed and available
   */
  async isAvailable(): Promise<boolean> {
    Logger.adapterDebug('Checking IFlow CLI availability');
    try {
      // Check 1: Try to run iflow --version (try different commands)
      let cliAvailable = false;
      const commands = [
        'iflow --version',
        'iflow-cli --version',
        'stigmergy --version',
        'if --version'
      ];

      for (const cmd of commands) {
        try {
          execSync(cmd, {
            encoding: 'utf-8',
            timeout: 3000,
            stdio: 'pipe'
          });
          Logger.adapterDebug(`IFlow CLI command execution successful: ${cmd}`);
          cliAvailable = true;
          break;
        } catch (err) {
          // Try next command
        }
      }

      if (!cliAvailable) {
        Logger.adapterWarn('No IFlow CLI command found');
        return false;
      }

      // Check 2: Verify IFlow directory exists and is accessible
      const possibleDirs = [
        path.join(os.homedir(), '.iflow'),
        path.join(os.homedir(), '.iflow-cli'),
        path.join(os.homedir(), '.stigmergy'),
        path.join(os.homedir(), '.config', 'iflow'),
        path.join(os.homedir(), '.config', 'stigmergy')
      ];

      let validDirFound = false;
      for (const iflowDir of possibleDirs) {
        if (fs.existsSync(iflowDir)) {
          const stats = await fs.stat(iflowDir);
          if (stats.isDirectory()) {
            try {
              await fs.readdir(iflowDir);
              Logger.adapterDebug(`Valid IFlow directory found: ${iflowDir}`);
              validDirFound = true;
              break;
            } catch (err) {
              // Try next directory
            }
          }
        }
      }

      if (!validDirFound) {
        Logger.adapterWarn('No valid IFlow directory found');
      }

      Logger.adapterInfo('IFlow CLI availability confirmed');
      return true;
    } catch (error) {
      Logger.adapterError('IFlow CLI availability check failed', error as Error);
      return false;
    }
  }

  /**
   * Get IFlow CLI configuration with proper validation
   */
  async getCLIConfig(): Promise<CLIConfig> {
    Logger.adapterDebug('Getting IFlow CLI configuration');
    const homeDir = os.homedir();
    const sessionPaths: string[] = [];

    try {
      // Check possible session directories
      const possibleDirs = [
        path.join(homeDir, '.iflow'),
        path.join(homeDir, '.iflow-cli'),
        path.join(homeDir, '.stigmergy'),
        path.join(homeDir, '.config', 'iflow'),
        path.join(homeDir, '.config', 'stigmergy')
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

          // Check for workflows directory (IFlow specific)
          const workflowDir = path.join(baseDir, 'workflows');
          if (fs.existsSync(workflowDir)) {
            const stats = await fs.stat(workflowDir);
            if (stats.isDirectory()) {
              sessionPaths.push(workflowDir);
            }
          }

          // Check for flows directory
          const flowsDir = path.join(baseDir, 'flows');
          if (fs.existsSync(flowsDir)) {
            const stats = await fs.stat(flowsDir);
            if (stats.isDirectory()) {
              sessionPaths.push(flowsDir);
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

          // Check for logs directory
          const logsDir = path.join(baseDir, 'logs');
          if (fs.existsSync(logsDir)) {
            const stats = await fs.stat(logsDir);
            if (stats.isDirectory()) {
              sessionPaths.push(logsDir);
            }
          }

          // Check for cache directory
          const cacheDir = path.join(baseDir, 'cache');
          if (fs.existsSync(cacheDir)) {
            const stats = await fs.stat(cacheDir);
            if (stats.isDirectory()) {
              sessionPaths.push(cacheDir);
            }
          }
        }
      }

      // If no session paths found, still return basic config
      if (sessionPaths.length === 0) {
        Logger.adapterWarn('No IFlow session paths found, using defaults');
        // Add default paths anyway - they might be created later
        sessionPaths.push(
          path.join(homeDir, '.iflow', 'sessions'),
          path.join(homeDir, '.iflow', 'workflows')
        );
      }

      Logger.adapterInfo(`IFlow configuration loaded with ${sessionPaths.length} session paths`);

      return {
        homeDir: possibleDirs.find(dir => fs.existsSync(dir)) || path.join(homeDir, '.iflow'),
        sessionPaths,
        version: this.version
      };

    } catch (error) {
      Logger.adapterError('Error getting IFlow CLI config:', error as Error);
      // Return minimal config even if scanning fails
      return {
        homeDir: path.join(homeDir, '.iflow'),
        sessionPaths: [
          path.join(homeDir, '.iflow', 'sessions'),
          path.join(homeDir, '.iflow', 'workflows')
        ],
        version: this.version
      };
    }
  }

  /**
   * Get all possible session paths for IFlow CLI
   */
  getSessionPaths(): string[] {
    const homeDir = os.homedir();
    return [
      // Standard IFlow locations
      path.join(homeDir, '.iflow', 'sessions'),
      path.join(homeDir, '.iflow', 'workflows'),
      path.join(homeDir, '.iflow-cli', 'sessions'),
      path.join(homeDir, '.stigmergy', 'sessions'),

      // Config directories
      path.join(homeDir, '.config', 'iflow', 'sessions'),
      path.join(homeDir, '.config', 'stigmergy', 'sessions'),

      // Alternative locations
      path.join(homeDir, '.iflow', 'flows'),
      path.join(homeDir, '.iflow', 'history'),
      path.join(homeDir, '.iflow', 'logs'),
      path.join(homeDir, '.iflow', 'cache'),

      // Windows-specific locations
      path.join(homeDir, 'AppData', 'Local', 'IFlow', 'sessions'),
      path.join(homeDir, 'AppData', 'Roaming', 'IFlow', 'sessions')
    ].filter(p => !p.includes('undefined'));
  }

  /**
   * Parse a IFlow session file and extract session information
   */
  async parseSession(filePath: string): Promise<SessionParseResult> {
    Logger.adapterDebug(`Parsing IFlow session file: ${filePath}`);

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        return {
          success: false,
          error: 'Path is not a file',
          filePath
        };
      }

      // IFlow CLI might use different file formats
      if (filePath.endsWith('.json') || filePath.endsWith('.jsonl')) {
        return await this.parseJsonSession(filePath, stats);
      } else if (filePath.endsWith('.txt') || filePath.endsWith('.log')) {
        return await this.parseTextSession(filePath, stats);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        return await this.parseYamlSession(filePath, stats);
      } else {
        return await this.parseGenericSession(filePath, stats);
      }

    } catch (error) {
      Logger.adapterError(`Failed to parse IFlow session file: ${filePath}`, error as Error);
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
            const message = this.parseIFlowMessage(data);
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
        const messages = this.extractMessagesFromIFlowJson(data);

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
   * Parse YAML format session files (IFlow specific)
   */
  private async parseYamlSession(filePath: string, stats: fs.Stats): Promise<SessionParseResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Simple YAML parsing for IFlow workflows
      const messages = this.parseYamlContent(content);

      if (messages.length > 0) {
        return this.createSessionResult(filePath, stats, messages);
      }

      return {
        success: false,
        error: 'No valid messages found in YAML session',
        filePath
      };

    } catch (error) {
      return {
        success: false,
        error: `YAML parsing failed: ${(error as Error).message}`,
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
   * Parse a single IFlow message from JSON data
   */
  private parseIFlowMessage(data: any): SessionMessage | null {
    try {
      // IFlow might use different field names
      const role = data.role || data.sender || data.type || 'unknown';
      const content = data.content || data.message || data.text || data.body || data.description || '';
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

      if (!content && typeof content !== 'string') {
        return null;
      }

      return {
        role: role.toLowerCase().includes('user') ? 'user' :
              role.toLowerCase().includes('assistant') || role.toLowerCase().includes('model') || role.toLowerCase().includes('iflow') ? 'assistant' :
              role.toLowerCase().includes('system') ? 'system' : 'user',
        content: String(content),
        timestamp,
        metadata: {
          model: data.model || data.iflowModel || 'iflow-default',
          tokens: data.tokens || data.tokenCount,
          workflowId: data.workflowId || data.flow_id,
          stepId: data.stepId || data.step_id,
          action: data.action,
          ...data.metadata
        }
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Extract messages from IFlow JSON structure
   */
  private extractMessagesFromIFlowJson(data: any): SessionMessage[] {
    const messages: SessionMessage[] = [];

    try {
      // IFlow might store conversations in different structures
      if (Array.isArray(data)) {
        // Array of messages
        for (const item of data) {
          const message = this.parseIFlowMessage(item);
          if (message) {
            messages.push(message);
          }
        }
      } else if (data.conversation || data.messages || data.history || data.workflow) {
        // Object with conversation/messages property
        const conversation = data.conversation || data.messages || data.history;
        if (Array.isArray(conversation)) {
          for (const item of conversation) {
            const message = this.parseIFlowMessage(item);
            if (message) {
              messages.push(message);
            }
          }
        }

        // Also check workflow-specific structure
        if (data.workflow && data.workflow.steps) {
          for (const step of data.workflow.steps) {
            if (step.input) {
              const userMessage = this.parseIFlowMessage({ ...step.input, role: 'user' });
              if (userMessage) {
                messages.push(userMessage);
              }
            }
            if (step.output || step.response) {
              const assistantMessage = this.parseIFlowMessage({ ...(step.output || step.response), role: 'assistant' });
              if (assistantMessage) {
                messages.push(assistantMessage);
              }
            }
          }
        }
      } else if (data.steps || data.actions || data.flows) {
        // Object with steps/actions property
        const steps = data.steps || data.actions || data.flows;
        if (Array.isArray(steps)) {
          for (const step of steps) {
            if (step.prompt || step.input) {
              const userMessage = this.parseIFlowMessage(step.prompt || step.input);
              if (userMessage) {
                messages.push(userMessage);
              }
            }
            if (step.result || step.output || step.response) {
              const assistantMessage = this.parseIFlowMessage(step.result || step.output || step.response);
              if (assistantMessage) {
                messages.push(assistantMessage);
              }
            }
          }
        }
      }

    } catch (error) {
      Logger.adapterWarn('Failed to extract messages from IFlow JSON', { error: (error as Error).message });
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
          trimmedLine.toLowerCase().startsWith('human:') ||
          trimmedLine.toLowerCase().startsWith('input:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: currentTimestamp,
            metadata: {}
          });
        }
        currentRole = 'user';
        currentContent = trimmedLine.replace(/^(user|human|input):/i, '').trim();
        currentTimestamp = new Date();
      } else if (trimmedLine.toLowerCase().startsWith('assistant:') ||
                 trimmedLine.toLowerCase().startsWith('iflow:') ||
                 trimmedLine.toLowerCase().startsWith('output:')) {
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: currentTimestamp,
            metadata: {}
          });
        }
        currentRole = 'assistant';
        currentContent = trimmedLine.replace(/^(assistant|iflow|output):/i, '').trim();
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
   * Parse content from YAML files
   */
  private parseYamlContent(content: string): SessionMessage[] {
    const messages: SessionMessage[] = [];

    // Simple YAML parsing for workflow files
    const lines = content.split('\n');
    let inMessage = false;
    let currentRole: 'user' | 'assistant' | 'system' = 'user';
    let currentContent = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('- role:')) {
        // Start a new message
        if (currentContent) {
          messages.push({
            role: currentRole,
            content: currentContent.trim(),
            timestamp: new Date(),
            metadata: {}
          });
        }
        currentRole = trimmedLine.includes('user') ? 'user' : 'assistant';
        currentContent = '';
        inMessage = false;
      } else if (trimmedLine.startsWith('content:') || trimmedLine.startsWith('message:')) {
        inMessage = true;
        currentContent = trimmedLine.split(':')[1]?.trim() || '';
      } else if (inMessage && trimmedLine.startsWith(' ')) {
        // Continuation of content
        currentContent += '\n' + trimmedLine.trim();
      }
    }

    // Add the last message
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
      title: messages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'IFlow Session'
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
        part === 'projects' || part === 'workspaces' || part === 'workflows' || part === 'repos'
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