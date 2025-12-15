import { Session } from './SessionScanner';

/**
 * Formats session data for different display formats
 */
export class HistoryFormatter {
  /**
   * Formats sessions as a summary view
   */
  formatSummary(sessions: Session[], context?: any): string {
    if (sessions.length === 0) {
      return `📭 当前项目暂无历史会话\n\n💡 **提示:** 尝试: /history --search <关键词> 查找其他CLI工具的会话`;
    }

    let response = `📁 **项目历史会话**\n\n📊 共找到 ${sessions.length} 个会话\n\n`;

    // Group by CLI
    const byCLI: Record<string, Session[]> = {};
    sessions.forEach(session => {
      if (!byCLI[session.cliType]) byCLI[session.cliType] = [];
      byCLI[session.cliType].push(session);
    });

    Object.entries(byCLI).forEach(([cli, cliSessions]) => {
      const icon = this.getCLIIcon(cli);
      response += `${icon} **${cli.toUpperCase()}** (${cliSessions.length}个)\n`;

      cliSessions.slice(0, 3).forEach((session, i) => {
        const date = this.formatDate(session.updatedAt);
        const title = session.title.substring(0, 50);
        response += `   ${i + 1}. ${title}...\n`;
        response += `      📅 ${date} • 💬 ${session.messageCount}条消息\n`;
      });

      if (cliSessions.length > 3) {
        response += `   ... 还有 ${cliSessions.length - 3} 个会话\n`;
      }
      response += '\n';
    });

    response += `💡 **使用方法:**\n`;
    response += `• \`/history --cli <工具>\` - 查看特定CLI\n`;
    response += `• \`/history --search <关键词>\` - 搜索内容\n`;
    response += `• \`/history --format timeline\` - 时间线视图`;

    return response;
  }

  /**
   * Formats sessions as timeline view
   */
  formatTimeline(sessions: Session[]): string {
    if (sessions.length === 0) {
      return '📭 暂无会话时间线。';
    }

    let response = `⏰ **时间线视图**\n\n`;

    sessions.forEach((session, index) => {
      const date = this.formatDate(session.updatedAt);
      const cliIcon = this.getCLIIcon(session.cliType);

      response += `${index + 1}. ${cliIcon} ${session.title}\n`;
      response += `   📅 ${date} • 💬 ${session.messageCount}条消息\n`;
      response += `   🔑 ${session.cliType}:${session.sessionId}\n\n`;
    });

    return response;
  }

  /**
   * Formats sessions as detailed view
   */
  formatDetailed(sessions: Session[]): string {
    if (sessions.length === 0) {
      return '📭 暂无详细会话信息。';
    }

    let response = `📋 **详细视图**\n\n`;

    sessions.forEach((session, index) => {
      const cliIcon = this.getCLIIcon(session.cliType);
      const date = session.updatedAt.toLocaleString();

      response += `${index + 1}. ${cliIcon} **${session.title}**\n`;
      response += `   📅 ${date}\n`;
      response += `   🔧 CLI: ${session.cliType}\n`;
      response += `   💬 消息数: ${session.messageCount}\n`;
      response += `   🆔 会话ID: \`${session.sessionId}\`\n\n`;
    });

    return response;
  }

  /**
   * Formats a single session as context for recovery
   */
  formatContext(session: Session | null): string {
    if (!session) {
      return `📭 暂无可恢复的上下文。`;
    }

    let response = `🔄 **上下文恢复**\n\n`;
    response += `📅 会话时间: ${session.updatedAt.toLocaleString()}\n`;
    response += `🔧 来源CLI: ${session.cliType}\n`;
    response += `💬 消息数: ${session.messageCount}\n`;
    response += `🆔 会话ID: ${session.sessionId}\n\n`;
    response += `---\n\n`;
    response += `**上次讨论内容:**\n`;
    response += session.content.substring(0, 500);
    if (session.content.length > 500) {
      response += `...`;
    }

    return response;
  }

  /**
   * Gets CLI icon based on CLI type
   */
  private getCLIIcon(cliType: string): string {
    const icons: Record<string, string> = {
      'claude': '🟢',
      'gemini': '🔵',
      'qwen': '🟡',
      'iflow': '🔴',
      'codebuddy': '🟣',
      'codex': '🟪',
      'qodercli': '🟠'
    };
    return icons[cliType] || '🔹';
  }

  /**
   * Formats date in a human-readable way
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
    } else {
      return `${Math.floor(days / 30)}个月前`;
    }
  }
}