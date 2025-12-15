import { Session } from '../types/Session';
import { CLIDiscovery } from './CLIDiscovery';
import { SessionScanner } from './SessionScanner';
import { SessionExporter } from './SessionExporter';
import { Logger } from '../utils/Logger';

/**
 * Universal Slash Command Extensions for CLI Tools
 * Provides ready-to-use slash command implementations for different CLI platforms
 */
export class SlashCommandExtensions {
  private static instance: SlashCommandExtensions;
  private cliDiscovery: CLIDiscovery;
  private scanner: SessionScanner;
  private exporter: SessionExporter;

  private constructor() {
    this.cliDiscovery = CLIDiscovery.getInstance();
    const availableAdapters = this.cliDiscovery.getAvailableAdapters();
    this.scanner = new SessionScanner(availableAdapters);
    this.exporter = new SessionExporter();
  }

  static getInstance(): SlashCommandExtensions {
    if (!SlashCommandExtensions.instance) {
      SlashCommandExtensions.instance = new SlashCommandExtensions();
    }
    return SlashCommandExtensions.instance;
  }

  /**
   * Get Claude CLI slash command extension
   */
  getClaudeExtension(): ClaudeSlashExtension {
    return new ClaudeSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
  }

  /**
   * Get Gemini CLI slash command extension
   */
  getGeminiExtension(): GeminiSlashExtension {
    return new GeminiSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
  }

  /**
   * Get Qwen CLI slash command extension
   */
  getQwenExtension(): QwenSlashExtension {
    return new QwenSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
  }

  /**
   * Get IFlow CLI slash command extension
   */
  getIFlowExtension(): IFlowSlashExtension {
    return new IFlowSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
  }

  /**
   * Get generic slash command extension (for any CLI)
   */
  getGenericExtension(cliType: string): GenericSlashExtension {
    return new GenericSlashExtension(cliType, this.cliDiscovery, this.scanner, this.exporter);
  }

  /**
   * Generate installation code for different CLI platforms
   */
  generateInstallationCode(cliType: string): string {
    switch (cliType.toLowerCase()) {
      case 'claude':
        return this.generateClaudeCode();
      case 'gemini':
        return this.generateGeminiCode();
      case 'qwen':
        return this.generateQwenCode();
      case 'iflow':
        return this.generateIFlowCode();
      default:
        return this.generateGenericCode(cliType);
    }
  }
}

/**
 * Claude CLI specific slash command extension
 */
export class ClaudeSlashExtension {
  constructor(
    private cliDiscovery: CLIDiscovery,
    private scanner: SessionScanner,
    private exporter: SessionExporter
  ) {}

  /**
   * Handle /history command for Claude CLI
   */
  async handleHistoryCommand(input: string): Promise<string> {
    Logger.exporterDebug(`Claude /history: ${input}`);

    try {
      // Parse command
      const options = this.parseCommand(input);

      // Execute query
      let sessions: Session[] = [];

      if (options.cli) {
        sessions = await this.scanner.scanSessionsByCLI(options.cli);
      } else if (options.search) {
        sessions = await this.scanner.searchSessions(options.search);
      } else {
        sessions = await this.scanner.scanAllSessions({ maxSessions: options.limit || 10 });
      }

      // Format Claude response
      return await this.formatClaudeResponse(sessions, options);

    } catch (error) {
      Logger.exporterError('Claude /history failed', error as Error);
      return `❌ 历史查询失败: ${(error as Error).message}`;
    }
  }

  private parseCommand(input: string): any {
    const options: any = { limit: 10 };
    const cleanInput = input.replace(/^\/history\s*/i, '').trim();
    const parts = cleanInput.split(/\s+/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();
      if (part === '--cli' && i + 1 < parts.length) {
        options.cli = parts[++i];
      } else if (part === '--search' && i + 1 < parts.length) {
        options.search = parts[++i];
      } else if (part === '--limit' && i + 1 < parts.length) {
        options.limit = parseInt(parts[++i]);
      } else if (part === '--context') {
        options.context = true;
      } else if (!part.startsWith('--') && !options.search) {
        options.search = part;
      }
    }

    return options;
  }

  private async formatClaudeResponse(sessions: Session[], options: any): Promise<string> {
    if (sessions.length === 0) {
      return '📭 未找到历史会话。使用 `/history --search <关键词>` 搜索会话。';
    }

    if (options.context && sessions.length > 0) {
      const latestSession = sessions[0];
      const context = await this.exporter.exportSession(latestSession, 'context');
      return `🔄 **上下文恢复 - ${latestSession.metadata.cliType}**\n\n${context}`;
    }

    let response = `📚 找到 ${sessions.length} 个历史会话:\n\n`;

    // Group by CLI
    const byCLI: Record<string, Session[]> = {};
    sessions.forEach(session => {
      if (!byCLI[session.metadata.cliType]) byCLI[session.metadata.cliType] = [];
      byCLI[session.metadata.cliType].push(session);
    });

    Object.entries(byCLI).forEach(([cli, cliSessions]) => {
      response += `🔵 **${cli.toUpperCase()}** (${cliSessions.length}个)\n`;
      cliSessions.slice(0, 3).forEach((session, i) => {
        const date = session.metadata.updatedAt.toLocaleDateString();
        const title = session.metadata.title || 'Untitled';
        response += `   ${i + 1}. ${title.substring(0, 50)}... (${date})\n`;
        response += `      📝 会话ID: \`${session.metadata.sessionId}\`\n`;
      });
      response += '\n';
    });

    response += `💡 **使用方法:**\n`;
    response += `• \`/history --cli <工具名>\` - 查看特定CLI\n`;
    response += `• \`/history --search <关键词>\` - 搜索内容\n`;
    response += `• \`/history --context\` - 获取上下文恢复\n`;

    return response;
  }
}

/**
 * Gemini CLI specific slash command extension
 */
export class GeminiSlashExtension {
  constructor(
    private cliDiscovery: CLIDiscovery,
    private scanner: SessionScanner,
    private exporter: SessionExporter
  ) {}

  /**
   * Handle /history command for Gemini CLI
   */
  async handleHistoryCommand(input: string): Promise<string> {
    Logger.exporterDebug(`Gemini /history: ${input}`);

    try {
      // Similar implementation to Claude but adapted for Gemini
      const claudeExtension = new ClaudeSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
      const response = await claudeExtension.handleHistoryCommand(input);

      // Adapt response for Gemini
      return this.adaptForGemini(response);

    } catch (error) {
      Logger.exporterError('Gemini /history failed', error as Error);
      return `❌ History query failed: ${(error as Error).message}`;
    }
  }

  private adaptForGemini(response: string): string {
    // Replace Claude-specific formatting with Gemini-friendly format
    return response.replace(/🔵/g, '🟢')
                  .replace(/\*\*(.*?)\*\*/g, '**$1**'); // Keep bold formatting
  }
}

/**
 * Qwen CLI specific slash command extension
 */
export class QwenSlashExtension {
  constructor(
    private cliDiscovery: CLIDiscovery,
    private scanner: SessionScanner,
    private exporter: SessionExporter
  ) {}

  async handleHistoryCommand(input: string): Promise<string> {
    Logger.exporterDebug(`Qwen /history: ${input}`);

    try {
      const claudeExtension = new ClaudeSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
      const response = await claudeExtension.handleHistoryCommand(input);

      return this.adaptForQwen(response);

    } catch (error) {
      Logger.exporterError('Qwen /history failed', error as Error);
      return `❌ 历史查询失败: ${(error as Error).message}`;
    }
  }

  private adaptForQwen(response: string): string {
    return response.replace(/🔵/g, '🟡')
                  .replace(/\*\*(.*?)\*\*/g, '**$1**');
  }
}

/**
 * IFlow CLI specific slash command extension
 */
export class IFlowSlashExtension {
  constructor(
    private cliDiscovery: CLIDiscovery,
    private scanner: SessionScanner,
    private exporter: SessionExporter
  ) {}

  async handleHistoryCommand(input: string): Promise<string> {
    Logger.exporterDebug(`IFlow /history: ${input}`);

    try {
      const claudeExtension = new ClaudeSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
      const response = await claudeExtension.handleHistoryCommand(input);

      return this.adaptForIFlow(response);

    } catch (error) {
      Logger.exporterError('IFlow /history failed', error as Error);
      return `❌ History query failed: ${(error as Error).message}`;
    }
  }

  private adaptForIFlow(response: string): string {
    return response.replace(/🔵/g, '🔴')
                  .replace(/\*\*(.*?)\*\*/g, '**$1**');
  }
}

/**
 * Generic slash command extension for any CLI
 */
export class GenericSlashExtension {
  constructor(
    private cliType: string,
    private cliDiscovery: CLIDiscovery,
    private scanner: SessionScanner,
    private exporter: SessionExporter
  ) {}

  async handleHistoryCommand(input: string): Promise<string> {
    Logger.exporterDebug(`${this.cliType} /history: ${input}`);

    try {
      const claudeExtension = new ClaudeSlashExtension(this.cliDiscovery, this.scanner, this.exporter);
      const response = await claudeExtension.handleHistoryCommand(input);

      return this.adaptForGeneric(response);

    } catch (error) {
      Logger.exporterError(`${this.cliType} /history failed`, error as Error);
      return `❌ History query failed: ${(error as Error).message}`;
    }
  }

  private adaptForGeneric(response: string): string {
    return response.replace(/🔵/g, '🟦')
                  .replace(/\*\*(.*?)\*\*/g, '**$1**');
  }
}