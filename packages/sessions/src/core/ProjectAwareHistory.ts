import { Session } from '../types/Session';
import { CLIDiscovery } from './CLIDiscovery';
import { SessionScanner } from './SessionScanner';
import { SessionExporter } from './SessionExporter';
import { Logger } from '../utils/Logger';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';

export interface ProjectHistoryOptions {
  projectPath?: string;
  limit?: number;
  search?: string;
  format?: 'summary' | 'detailed' | 'timeline' | 'context';
  cli?: string;
  includeEmpty?: boolean;
  sortBy?: 'time' | 'relevance' | 'cli';
  timeRange?: 'today' | 'week' | 'month' | 'all';
}

export interface ProjectHistoryResult {
  success: boolean;
  content: string;
  projectPath: string;
  sessionCount: number;
  suggestions?: string[];
  error?: string;
}

/**
 * Project-Aware History Handler
 * Handles /history commands with automatic project detection
 */
export class ProjectAwareHistory {
  private static instance: ProjectAwareHistory;
  private cliDiscovery: CLIDiscovery;
  private scanner: SessionScanner;
  private exporter: SessionExporter;

  private constructor() {
    this.cliDiscovery = CLIDiscovery.getInstance();
    const availableAdapters = this.cliDiscovery.getAvailableAdapters();
    this.scanner = new SessionScanner(availableAdapters);
    this.exporter = new SessionExporter();

    Logger.exporterInfo('Project-Aware History Handler initialized');
  }

  static getInstance(): ProjectAwareHistory {
    if (!ProjectAwareHistory.instance) {
      ProjectAwareHistory.instance = new ProjectAwareHistory();
    }
    return ProjectAwareHistory.instance;
  }

  /**
   * Main handler for /history commands with project awareness
   */
  async handleHistoryCommand(
    input: string,
    currentCLI: string,
    currentWorkingDirectory?: string
  ): Promise<ProjectHistoryResult> {
    Logger.exporterDebug(`Project-Aware History: ${input} from ${currentCLI} at ${currentWorkingDirectory}`);

    try {
      // Parse command options
      const options = this.parseCommand(input);

      // Auto-detect project path
      const projectPath = await this.detectProjectPath(options.projectPath || currentWorkingDirectory);

      // Scan sessions for this project
      const sessions = await this.scanProjectSessions(projectPath, options, currentCLI);

      // Format response
      const content = await this.formatProjectResponse(sessions, projectPath, options, currentCLI);

      const result: ProjectHistoryResult = {
        success: true,
        content,
        projectPath,
        sessionCount: sessions.length,
        suggestions: this.generateProjectSuggestions(sessions, options)
      };

      Logger.exporterInfo(`Project history completed: ${sessions.length} sessions for ${projectPath}`);
      return result;

    } catch (error) {
      Logger.exporterError('Project history command failed', error as Error);
      return {
        success: false,
        content: `❌ 项目历史查询失败: ${(error as Error).message}`,
        projectPath: currentWorkingDirectory || 'unknown',
        sessionCount: 0,
        error: (error as Error).message
      };
    }
  }

  /**
   * Parse history command options
   */
  private parseCommand(input: string): ProjectHistoryOptions {
    const options: ProjectHistoryOptions = {
      limit: 50,
      format: 'summary',
      sortBy: 'time',
      timeRange: 'all'
    };

    const cleanInput = input.replace(/^\/history\s*/i, '').trim();
    const parts = cleanInput.split(/\s+/).filter(p => p.length > 0);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].toLowerCase();

      // Time range filters
      if (part === '--today' || part === '--recent') {
        options.timeRange = 'today';
        options.limit = 20;
      } else if (part === '--week') {
        options.timeRange = 'week';
        options.limit = 50;
      } else if (part === '--month') {
        options.timeRange = 'month';
        options.limit = 100;
      } else if (part === '--all') {
        options.timeRange = 'all';
      }

      // CLI filter
      else if (part === '--cli' && i + 1 < parts.length) {
        options.cli = parts[++i];
      }

      // Project path
      else if (part === '--project' && i + 1 < parts.length) {
        options.projectPath = parts[++i];
      }

      // Search
      else if (part === '--search' && i + 1 < parts.length) {
        options.search = parts[++i];
      }

      // Limit
      else if (part === '--limit' && i + 1 < parts.length) {
        options.limit = parseInt(parts[++i]);
      }

      // Format
      else if (part === '--format') {
        const format = parts[++1]?.toLowerCase();
        if (['summary', 'detailed', 'timeline', 'context'].includes(format)) {
          options.format = format as any;
        }
      }

      // Sort by
      else if (part === '--sort') {
        const sortBy = parts[++1]?.toLowerCase();
        if (['time', 'relevance', 'cli'].includes(sortBy)) {
          options.sortBy = sortBy as any;
        }
      }

      // Include empty sessions
      else if (part === '--include-empty') {
        options.includeEmpty = true;
      }

      // Assume search term if no flag
      else if (!part.startsWith('--') && !options.search) {
        options.search = part;
      }
    }

    return options;
  }

  /**
   * Auto-detect project path
   */
  private async detectProjectPath(providedPath?: string): Promise<string> {
    if (providedPath) {
      // Validate provided path
      if (await fs.pathExists(providedPath)) {
        const stats = await fs.stat(providedPath);
        if (stats.isDirectory()) {
          return path.resolve(providedPath);
        }
      }
    }

    // Try current working directory
    const cwd = process.cwd();
    if (await this.isProjectDirectory(cwd)) {
      return cwd;
    }

    // Look for project markers in current directory
    const projectPath = await this.findProjectInDirectory(cwd);
    if (projectPath) {
      return projectPath;
    }

    // Fallback to working directory
    return cwd;
  }

  /**
   * Check if directory is a project directory
   */
  private async isProjectDirectory(dirPath: string): Promise<boolean> {
    const projectMarkers = [
      'package.json',
      'requirements.txt',
      'setup.py',
      'Cargo.toml',
      'pom.xml',
      'go.mod',
      '.git',
      'src/',
      'lib/',
      'app/',
      'components/',
      'pages/',
      'services/',
      'utils/',
      'config/',
      '.vscode/',
      'README.md',
      'Dockerfile',
      'docker-compose.yml'
    ];

    for (const marker of projectMarkers) {
      try {
        const markerPath = path.join(dirPath, marker);
        if (await fs.pathExists(markerPath)) {
          const stats = await fs.stat(markerPath);
          if (stats.isDirectory() || markerPath.includes('/')) {
            return true;
          }
        }
      } catch (error) {
        // Continue checking other markers
      }
    }

    return false;
  }

  /**
   * Find project directory in current directory or parent
   */
  private async findProjectInDirectory(startPath: string): Promise<string | null> {
    let currentPath = path.resolve(startPath);

    // Check up to 5 levels up
    for (let level = 0; level < 5; level++) {
      if (await this.isProjectDirectory(currentPath)) {
        return currentPath;
      }

      const parent = path.dirname(currentPath);
      if (parent === currentPath) break; // Reached root
      currentPath = parent;
    }

    return null;
  }

  /**
   * Scan sessions for specific project
   */
  private async scanProjectSessions(
    projectPath: string,
    options: ProjectHistoryOptions,
    currentCLI: string
  ): Promise<Session[]> {
    Logger.exporterDebug(`Scanning project sessions: ${projectPath}`);

    // Get all sessions
    let sessions = await this.scanner.scanAllSessions();

    // Filter sessions for this project
    sessions = sessions.filter(session => {
      const sessionProjectPath = session.metadata.projectPath || '';

      // Check if session belongs to this project (exact match or subdirectory)
      const isInProject = sessionProjectPath === projectPath ||
                          sessionProjectPath.startsWith(projectPath + path.sep) ||
                          projectPath.startsWith(sessionProjectPath + path.sep);

      // Apply search filter
      if (options.search && !this.sessionMatchesSearch(session, options.search)) {
        return false;
      }

      // Apply CLI filter
      if (options.cli && session.metadata.cliType !== options.cli) {
        return false;
      }

      // Apply time range filter
      if (!this.sessionInTimeRange(session, options.timeRange)) {
        return false;
      }

      // Apply empty session filter
      if (!options.includeEmpty && session.metadata.messageCount === 0) {
        return false;
      }

      return isInProject;
    });

    // Sort sessions
    sessions = this.sortSessions(sessions, options);

    // Apply limit
    if (options.limit && options.limit > 0) {
      sessions = sessions.slice(0, options.limit);
    }

    return sessions;
  }

  /**
   * Check if session matches search term
   */
  private sessionMatchesSearch(session: Session, searchTerm: string): boolean {
    const searchLower = searchTerm.toLowerCase();

    // Search in title
    if (session.metadata.title?.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in messages content
    return session.messages.some(message =>
      message.content.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Check if session is within time range
   */
  private sessionInTimeRange(session: Session, timeRange: string): boolean {
    const sessionDate = session.metadata.updatedAt;
    const now = new Date();

    switch (timeRange) {
      case 'today':
        return sessionDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      case 'all':
        return true;
      default:
        return true;
    }
  }

  /**
   * Sort sessions based on options
   */
  private sortSessions(sessions: Session[], options: ProjectHistoryOptions): Session[] {
    switch (options.sortBy) {
      case 'time':
        return sessions.sort((a, b) =>
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        );
      case 'cli':
        return sessions.sort((a, b) =>
          a.metadata.cliType.localeCompare(b.metadata.cliType)
        );
      case 'relevance':
        // Sort by recency and message count (relevance)
        return sessions.sort((a, b) => {
          const aTime = new Date(a.metadata.updatedAt).getTime();
          const bTime = new Date(b.metadata.updatedAt).getTime();
          const aMessages = a.metadata.messageCount || 0;
          const bMessages = b.metadata.messageCount || 0;

          // Calculate relevance score
          const aScore = aTime + (aMessages * 1000000); // 1 message = 1 day of recency
          const bScore = bTime + (bMessages * 1000000);

          return bScore - aScore;
        });
      default:
        return sessions.sort((a, b) =>
          new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
        );
    }
  }

  /**
   * Format project history response
   */
  private async formatProjectResponse(
    sessions: Session[],
    projectPath: string,
    options: ProjectHistoryOptions,
    currentCLI: string
  ): Promise<string> {
    const projectName = path.basename(projectPath);
    const relativePath = path.relative(process.cwd(), projectPath);

    if (sessions.length === 0) {
      return `📭 **${projectName}** 项目暂无历史会话

💡 **提示:**
• 确保您的项目有会话文件
• 尝试: /history --project <其他路径>
• 使用: /history --search <关键词>`;
    }

    switch (options.format) {
      case 'timeline':
        return this.formatTimelineResponse(sessions, projectPath, options);
      case 'detailed':
        return this.formatDetailedResponse(sessions, projectPath, options);
      case 'context':
        return this.formatContextResponse(sessions, projectPath, options);
      default:
        return this.formatSummaryResponse(sessions, projectPath, options, currentCLI);
    }
  }

  /**
   * Format summary response
   */
  private formatSummaryResponse(
    sessions: Session[],
    projectPath: string,
    options: ProjectHistoryOptions,
    currentCLI: string
  ): string {
    const projectName = path.basename(projectPath);
    const relativePath = path.relative(process.cwd(), projectPath);

    let response = `📁 **${projectName}** 项目历史会话\n`;

    if (relativePath !== '.') {
      response += `📍 路径: ${relativePath}\n`;
    }
    response += `📊 共找到 ${sessions.length} 个会话`;

    // Time range indicator
    if (options.timeRange !== 'all') {
      const timeRangeText = {
        'today': '今天',
        'week': '最近7天',
        'month': '最近30天'
      };
      response += ` (${timeRangeText[options.timeRange]})`;
    }

    response += '\n\n';

    // Group by CLI and date
    const timeGroups = this.groupSessionsByTime(sessions);

    Object.entries(timeGroups).forEach(([timeGroup, groupSessions]) => {
      response += `📅 **${timeGroup}**\n`;

      // Group by CLI within each time group
      const cliGroups: Record<string, Session[]> = {};
      groupSessions.forEach(session => {
        if (!cliGroups[session.metadata.cliType]) {
          cliGroups[session.metadata.cliType] = [];
        }
        cliGroups[session.metadata.cliType].push(session);
      });

      Object.entries(cliGroups).forEach(([cli, cliSessions]) => {
        const icon = cli === currentCLI ? '🟢' : '🔵';
        response += `${icon} **${cli.toUpperCase()}** (${cliSessions.length}个会话)\n`;

        cliSessions.slice(0, 3).forEach((session, i) => {
          const date = this.formatDate(session.metadata.updatedAt);
          const title = session.metadata.title || '未命名会话';
          const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

          response += `   ${i + 1}. ${truncatedTitle}\n`;
          response += `      📅 ${date} • 💬 ${session.metadata.messageCount}条消息\n`;
          response += `      🔑 ${session.metadata.sessionId}\n`;
        });

        if (cliSessions.length > 3) {
          response += `   ... 还有 ${cliSessions.length - 3} 个会话\n`;
        }
        response += '\n';
      });
    });

    // Usage help
    response += `💡 **使用方法:**\n`;
    response += `• \`/history\` - 显示所有会话\n`;
    response += `• \`/history --recent\` - 今天的会话\n`;
    response += `• \`/history --week\` - 最近7天\n`;
    response += `• \`/history --cli <工具>\` - 筛选特定CLI\n`;
    response += `• \`/history --search <关键词>\` - 搜索会话内容\n`;
    response += `• \`/history --format timeline\` - 时间线视图`;

    return response;
  }

  /**
   * Format timeline response
   */
  private formatTimelineResponse(
    sessions: Session[],
    projectPath: string,
    options: ProjectHistoryOptions
  ): string {
    const projectName = path.basename(projectPath);
    let response = `⏰ **${projectName}** - 时间线视图\n\n`;

    sessions.forEach((session, index) => {
      const date = this.formatDate(session.metadata.updatedAt);
      const timeAgo = this.getTimeAgo(session.metadata.updatedAt);
      const cliIcon = this.getCLIIcon(session.metadata.cliType);

      response += `${index + 1}. ${cliIcon} ${session.metadata.title || '未命名会话'}\n`;
      response += `   📅 ${date} (${timeAgo}) • 💬 ${session.metadata.messageCount}条消息\n`;
      response += `   🔑 ${session.metadata.cliType}:${session.metadata.sessionId}\n`;

      // Preview first message
      if (session.messages.length > 0) {
        const preview = session.messages[0].content.substring(0, 100);
        response += `   💭 "${preview}${session.messages[0].content.length > 100 ? '...' : ''}"\n`;
      }

      response += '\n';
    });

    return response;
  }

  /**
   * Format detailed response
   */
  private formatDetailedResponse(
    sessions: Session[],
    projectPath: string,
    options: ProjectHistoryOptions
  ): string {
    const projectName = path.basename(projectPath);
    let response = `📋 **${projectName}** - 详细视图\n\n`;

    sessions.forEach((session, index) => {
      const cliIcon = this.getCLIIcon(session.metadata.cliType);
      const date = session.metadata.updatedAt.toLocaleString();

      response += `${index + 1}. ${cliIcon} **${session.metadata.title || '未命名会话'}**\n`;
      response += `   📅 ${date}\n`;
      response += `   🔧 CLI: ${session.metadata.cliType}\n`;
      response += `   💬 消息数: ${session.metadata.messageCount}\n`;
      response += `   🆔 会话ID: \`${session.metadata.sessionId}\`\n`;

      if (session.metadata.totalTokens) {
        response +=   `   📊 Tokens: ${session.metadata.totalTokens}\n`;
      }

      response += '\n';
    });

    return response;
  }

  /**
   * Format context response
   */
  private async formatContextResponse(
    sessions: Session[],
    projectPath: string,
    options: ProjectHistoryOptions
  ): Promise<string> {
    if (sessions.length === 0) {
      return `📭 项目 "${path.basename(projectPath)}" 暂无可恢复的上下文。`;
    }

    // Get most recent session for context
    const latestSession = sessions[0];
    const contextExport = await this.exporter.exportSession(latestSession, 'context');

    let response = `🔄 **上下文恢复** - ${path.basename(projectPath)} 项目\n\n`;
    response += `📅 会话时间: ${latestSession.metadata.updatedAt.toLocaleString()}\n`;
    response += `🔧 来源CLI: ${latestSession.metadata.cliType}\n`;
    response += `💬 消息数: ${latestSession.metadata.messageCount}\n`;
    response += `🆔 会话ID: ${latestSession.metadata.sessionId}\n\n`;
    response += `---\n\n`;
    response += contextExport;

    return response;
  }

  /**
   * Group sessions by time
   */
  private groupSessionsByTime(sessions: Session[]): Record<string, Session[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: Record<string, Session[]> = {
      '今天': [],
      '最近7天': [],
      '最近30天': [],
      '更早': []
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.metadata.updatedAt);

      if (sessionDate >= today) {
        groups['今天'].push(session);
      } else if (sessionDate >= weekAgo) {
        groups['最近7天'].push(session);
      } else if (sessionDate >= monthAgo) {
        groups['最近30天'].push(session);
      } else {
        groups['更早'].push(session);
      }
    });

    return groups;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) {
      return date.toLocaleTimeString();
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else if (days < 30) {
      return `${Math.floor(days / 7)}周前`;
    } else if (days < 365) {
      return `${Math.floor(days / 30)}个月前`;
    } else {
      return `${Math.floor(days / 365)}年前`;
    }
  }

  /**
   * Get time ago description
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else if (days < 30) {
      return `${Math.floor(days / 7)}周前`;
    } else {
      return `${Math.floor(days / 30)}个月前`;
    }
  }

  /**
   * Get CLI icon
   */
  private getCLIIcon(cliType: string): string {
    const icons: Record<string, string> = {
      'claude': '🟢',
      'gemini': '🔵',
      'qwen': '🟡',
      'iflow': '🔴',
      'codebuddy': '🟣',
      'codex': '🟪',
      'qodercli': '🟠',
      'default': '🔹'
    };
    return icons[cliType] || icons['default'];
  }

  /**
   * Generate project-specific suggestions
   */
  private generateProjectSuggestions(sessions: Session[], options: ProjectHistoryOptions): string[] {
    const suggestions: string[] = [];

    if (sessions.length > 0) {
      // Extract keywords from session titles
      const keywords = new Set<string>();
      sessions.forEach(session => {
        if (session.metadata.title) {
          const words = session.metadata.title.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 3 && !this.isCommonWord(word)) {
              keywords.add(word);
            }
          }
        }
      });

      // Generate search suggestions
      Array.from(keywords).slice(0, 5).forEach(keyword => {
        suggestions.push(`/history --search "${keyword}"`);
      });

      // Suggest continue conversation
      if (sessions.length > 0) {
        suggestions.push(`/history --format context`);
        suggestions.push(`/export-session ${sessions[0].metadata.sessionId}`);
      }
    }

    // Add utility suggestions
    suggestions.push(`/history --recent`);
    suggestions.push(`/history --format timeline`);

    return suggestions.slice(0, 8);
  }

  /**
   * Check if word is common
   */
  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'for', 'are', 'with', 'this', 'that', 'from', 'have', 'they', 'been', 'not', 'was', 'were', 'said', 'each', 'which', 'will', 'their', 'about', 'would', 'there', 'could', 'other', 'than', 'first', 'after', 'many', 'only', 'come', 'most', 'over', 'also', 'back', 'through', 'where', 'much', 'your', 'well', 'more', 'even', 'such', 'very', 'when', 'make', 'like', 'time', 'look', 'just', 'help', 'need', 'know', 'take', 'want', 'see', 'good', 'way', 'get', 'could'];
    return commonWords.includes(word);
  }
}