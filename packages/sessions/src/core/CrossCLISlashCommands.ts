import { Session } from '../types/Session';
import { CLIDiscovery } from './CLIDiscovery';
import { SessionScanner } from './SessionScanner';
import { SessionExporter } from './SessionExporter';
import { Logger } from '../utils/Logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface SlashCommandResult {
  success: boolean;
  content: string;
  suggestions?: string[];
  error?: string;
  context?: any;
}

export interface HistoryCommandOptions {
  cli?: string;
  project?: string;
  search?: string;
  limit?: number;
  format?: 'summary' | 'detailed' | 'context';
  export?: boolean;
}

/**
 * Cross-CLI Slash Commands System
 * Enables /history and other slash commands across all CLI tools
 */
export class CrossCLISlashCommands {
  private static instance: CrossCLISlashCommands;
  private cliDiscovery: CLIDiscovery;
  private scanner: SessionScanner;
  private exporter: SessionExporter;

  private constructor() {
    this.cliDiscovery = CLIDiscovery.getInstance();
    const availableAdapters = this.cliDiscovery.getAvailableAdapters();
    this.scanner = new SessionScanner(availableAdapters);
    this.exporter = new SessionExporter();

    Logger.exporterInfo('Cross-CLI Slash Commands System initialized');
  }

  static getInstance(): CrossCLISlashCommands {
    if (!CrossCLISlashCommands.instance) {
      CrossCLISlashCommands.instance = new CrossCLISlashCommands();
    }
    return CrossCLISlashCommands.instance;
  }

  /**
   * Main /history slash command handler
   */
  async handleHistoryCommand(input: string, currentCLI: string): Promise<SlashCommandResult> {
    Logger.exporterDebug(`Handling /history command from ${currentCLI}`, { input });

    try {
      // Parse command options
      const options = this.parseHistoryCommand(input);

      // Discover available CLI tools if needed
      if (this.cliDiscovery.getAllDiscoveredCLIs().length === 0) {
        await this.cliDiscovery.discoverAllCLIs();
      }

      // Execute history query
      const result = await this.executeHistoryQuery(options, currentCLI);

      return {
        success: true,
        content: result.content,
        suggestions: result.suggestions,
        context: {
          command: 'history',
          cli: currentCLI,
          options,
          sessionCount: result.sessionCount
        }
      };

    } catch (error) {
      Logger.exporterError('History command failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
        content: `❌ 历史查询失败: ${(error as Error).message}`
      };
    }
  }

  /**
   * Parse history command options from input
   */
  private parseHistoryCommand(input: string): HistoryCommandOptions {
    const options: HistoryCommandOptions = {
      format: 'summary'
    };

    // Remove /history prefix and split by spaces
    const cleanInput = input.replace(/^\/history\s*/i, '').trim();
    const parts = cleanInput.split(/\s+/).filter(p => p.length > 0);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();

      // CLI filter
      if (part === '--cli' && i + 1 < parts.length) {
        options.cli = parts[++i];
      }
      // Project filter
      else if (part === '--project' && i + 1 < parts.length) {
        options.project = parts[++i];
      }
      // Search term
      else if (part === '--search' && i + 1 < parts.length) {
        options.search = parts[++i];
      }
      // Limit results
      else if (part === '--limit' && i + 1 < parts.length) {
        options.limit = parseInt(parts[++i]);
      }
      // Format
      else if (part === '--format' && i + 1 < parts.length) {
        const format = parts[++i].toLowerCase();
        if (['summary', 'detailed', 'context'].includes(format)) {
          options.format = format as any;
        }
      }
      // Export
      else if (part === '--export') {
        options.export = true;
      }
      // Assume search term if no flag
      else if (!part.startsWith('--') && !options.search) {
        options.search = part;
      }
    }

    return options;
  }

  /**
   * Execute history query based on options
   */
  private async executeHistoryQuery(options: HistoryCommandOptions, currentCLI: string): Promise<{
    content: string;
    suggestions: string[];
    sessionCount: number;
  }> {
    // Get all sessions
    let sessions: Session[] = [];

    if (options.cli) {
      // Get sessions from specific CLI
      sessions = await this.scanner.scanSessionsByCLI(options.cli);
    } else if (options.search) {
      // Search across all CLI tools
      sessions = await this.scanner.searchSessions(options.search, {
        cliType: options.cli ? [options.cli] : undefined,
        projectPath: options.project
      });
    } else if (options.project) {
      // Get sessions from specific project
      sessions = await this.scanner.scanSessionsByProject(options.project);
    } else {
      // Get all sessions
      sessions = await this.scanner.scanAllSessions({ maxSessions: options.limit || 50 });
    }

    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      sessions = sessions.slice(0, options.limit);
    }

    // Generate content based on format
    let content = '';
    let suggestions: string[] = [];

    switch (options.format) {
      case 'detailed':
        content = this.generateDetailedHistory(sessions, currentCLI);
        break;
      case 'context':
        content = await this.generateContextHistory(sessions, currentCLI);
        suggestions = this.generateContextSuggestions(sessions);
        break;
      default:
        content = this.generateSummaryHistory(sessions, currentCLI);
        suggestions = this.generateSuggestions(sessions);
    }

    return { content, suggestions, sessionCount: sessions.length };
  }

  /**
   * Generate summary history format
   */
  private generateSummaryHistory(sessions: Session[], currentCLI: string): string {
    if (sessions.length === 0) {
      return `📭 在所有CLI工具中未找到历史会话。\n\n💡 尝试使用: /history --search <关键词>`;
    }

    let content = `📚 找到 ${sessions.length} 个历史会话:\n\n`;

    // Group by CLI
    const sessionsByCLI: Record<string, Session[]> = {};
    sessions.forEach(session => {
      const cliType = session.metadata.cliType;
      if (!sessionsByCLI[cliType]) {
        sessionsByCLI[cliType] = [];
      }
      sessionsByCLI[cliType].push(session);
    });

    // Display sessions grouped by CLI
    Object.entries(sessionsByCLI).forEach(([cliType, cliSessions]) => {
      const icon = cliType === currentCLI ? '🟢' : '🔵';
      content += `${icon} **${cliType.toUpperCase()}** (${cliSessions.length} 个会话)\n`;

      cliSessions.slice(0, 3).forEach((session, index) => {
        const date = session.metadata.updatedAt.toLocaleDateString();
        const messageCount = session.metadata.messageCount;
        const title = session.metadata.title.substring(0, 60);

        content += `   ${index + 1}. ${title} (${date}, ${messageCount} 条消息)\n`;
        content += `      Session ID: \`${session.metadata.sessionId}\`\n`;
      });

      if (cliSessions.length > 3) {
        content += `   ... 还有 ${cliSessions.length - 3} 个会话\n`;
      }
      content += '\n';
    });

    content += `💡 使用方法:\n`;
    content += `   • /history --cli <工具名> - 查看特定CLI的会话\n`;
    content += `   • /history --search <关键词> - 搜索会话内容\n`;
    content += `   • /history --format detailed - 查看详细信息\n`;
    content += `   • /history --format context - 获取上下文恢复\n`;

    return content;
  }

  /**
   * Generate detailed history format
   */
  private generateDetailedHistory(sessions: Session[], currentCLI: string): string {
    if (sessions.length === 0) {
      return '📭 没有找到历史会话。';
    }

    let content = `📋 详细历史记录 (${sessions.length} 个会话):\n\n`;

    sessions.forEach((session, index) => {
      const isCurrentCLI = session.metadata.cliType === currentCLI;
      const status = isCurrentCLI ? '🟢' : '🔵';
      const date = session.metadata.updatedAt.toLocaleString();

      content += `${index + 1}. ${status} **${session.metadata.cliType.toUpperCase()}** - ${session.metadata.title}\n`;
      content += `   📅 ${date}\n`;
      content += `   📁 ${session.metadata.projectPath}\n`;
      content += `   💬 ${session.metadata.messageCount} 条消息, ${session.metadata.totalTokens} 个tokens\n`;
      content += `   🔑 Session ID: \`${session.metadata.sessionId}\`\n`;

      // Show first message preview
      if (session.messages.length > 0) {
        const firstMessage = session.messages[0];
        const preview = firstMessage.content.substring(0, 150);
        content += `   💭 预览: "${preview}${firstMessage.content.length > 150 ? '...' : ''}"\n`;
      }

      content += '\n';
    });

    return content;
  }

  /**
   * Generate context recovery format
   */
  private async generateContextHistory(sessions: Session[], currentCLI: string): Promise<string> {
    if (sessions.length === 0) {
      return '📭 没有找到可以用于上下文恢复的会话。';
    }

    // Get most recent session
    const latestSession = sessions[0];
    const contextExport = await this.exporter.exportSession(latestSession, 'context');

    let content = `🔄 **上下文恢复 - ${latestSession.metadata.cliType.toUpperCase()}**\n\n`;
    content += `📅 会话时间: ${latestSession.metadata.updatedAt.toLocaleString()}\n`;
    content += `📁 项目路径: ${latestSession.metadata.projectPath}\n\n`;
    content += `---\n\n`;
    content += contextExport;

    return content;
  }

  /**
   * Generate suggestions based on sessions
   */
  private generateSuggestions(sessions: Session[]): string[] {
    const suggestions: string[] = [];

    if (sessions.length > 0) {
      // Extract keywords from session titles and content
      const keywords = new Set<string>();
      sessions.forEach(session => {
        // Add keywords from title
        const titleWords = session.metadata.title.toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
          if (word.length > 3 && !this.isCommonWord(word)) {
            keywords.add(word);
          }
        });

        // Add keywords from first few messages
        session.messages.slice(0, 2).forEach(message => {
          const messageWords = message.content.toLowerCase().split(/\s+/);
          messageWords.forEach(word => {
            if (word.length > 3 && !this.isCommonWord(word)) {
              keywords.add(word);
            }
          });
        });
      });

      // Convert to suggestions
      Array.from(keywords).slice(0, 10).forEach(keyword => {
        suggestions.push(`/history --search ${keyword}`);
      });
    }

    // Add default suggestions
    suggestions.push('/history --format context');
    suggestions.push('/history --cli claude');
    suggestions.push('/history --limit 10');

    return suggestions.slice(0, 8);
  }

  /**
   * Generate context-specific suggestions
   */
  private generateContextSuggestions(sessions: Session[]): string[] {
    const suggestions: string[] = [];

    if (sessions.length > 0) {
      suggestions.push(`继续讨论这个话题`);
      suggestions.push(`基于以上上下文，请帮我...`);
      suggestions.push(`总结上面的对话内容`);
      suggestions.push(`提取关键信息并给出建议`);
    }

    suggestions.push(`/history --search <新关键词>`);
    suggestions.push(`/history --format detailed`);

    return suggestions;
  }

  /**
   * Check if word is common and should be ignored
   */
  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'are', 'with', 'this', 'that', 'from', 'have', 'they', 'been', 'not', 'was', 'were', 'said', 'each', 'which', 'will', 'their', 'about', 'would', 'there', 'could', 'other', 'than', 'first', 'after', 'many', 'only', 'come', 'most', 'over', 'also', 'back', 'through', 'where', 'much', 'your', 'well', 'more', 'even', 'such', 'very', 'when', 'make', 'like', 'time', 'look', 'just', 'help', 'need', 'know', 'take', 'want', 'see', 'good', 'way', 'get', 'could'];
    return commonWords.includes(word);
  }

  /**
   * Export session for continuation
   */
  async exportSessionForContinuation(sessionId: string, format: 'context' | 'markdown' = 'context'): Promise<SlashCommandResult> {
    try {
      // Find the session
      const sessions = await this.scanner.scanAllSessions();
      const session = sessions.find(s => s.metadata.sessionId === sessionId);

      if (!session) {
        return {
          success: false,
          error: `Session ${sessionId} not found`,
          content: `❌ 找不到会话: ${sessionId}`
        };
      }

      // Export session
      const exported = await this.exporter.exportSession(session, format);

      return {
        success: true,
        content: exported,
        context: {
          command: 'export',
          sessionId,
          format,
          cli: session.metadata.cliType
        }
      };

    } catch (error) {
      Logger.exporterError('Session export failed', error as Error);
      return {
        success: false,
        error: (error as Error).message,
        content: `❌ 导出失败: ${(error as Error).message}`
      };
    }
  }

  /**
   * Generate slash command help
   */
  generateHelp(): string {
    return `📚 **Cross-CLI History Commands Help**

**基本命令:**
\`/history\` - 显示所有CLI工具的历史会话摘要
\`/history --format detailed\` - 显示详细信息
\`/history --format context\` - 获取上下文恢复

**过滤选项:**
\`--cli <工具名>\` - 只显示特定CLI的会话
\`--project <项目路径>\` - 只显示特定项目的会话
\`--search <关键词>\` - 搜索会话内容
\`--limit <数量>\` - 限制结果数量

**示例:**
\`/history\` - 显示所有会话
\`/history --cli claude\` - 只显示Claude的会话
\`/history --search "React"\` - 搜索React相关会话
\`/history --limit 5 --format detailed\` - 显示5个会话的详细信息`;
  }
}