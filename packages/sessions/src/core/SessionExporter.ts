import { Session } from '../types/Session';

export type ExportFormat = 'markdown' | 'json' | 'context';

/**
 * SessionExporter handles exporting sessions to different formats
 */
export class SessionExporter {
  /**
   * Export a session to the specified format
   */
  async exportSession(session: Session, format: ExportFormat): Promise<string> {
    switch (format.toLowerCase()) {
      case 'markdown':
        return this.exportToMarkdown(session);
      case 'json':
        return this.exportToJSON(session);
      case 'context':
        return this.exportToContext(session);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export session to Markdown format
   */
  private exportToMarkdown(session: Session): string {
    const { metadata, messages } = session;

    let markdown = `# Session: ${metadata.sessionId}\n\n`;
    markdown += `**CLI:** ${metadata.cliType}\n`;
    markdown += `**Project:** ${metadata.projectPath}\n`;
    markdown += `**Created:** ${metadata.createdAt.toLocaleString()}\n`;
    markdown += `**Updated:** ${metadata.updatedAt.toLocaleString()}\n`;
    markdown += `**Messages:** ${metadata.messageCount}\n\n`;

    if (metadata.totalTokens) {
      markdown += `**Total Tokens:** ${metadata.totalTokens}\n\n`;
    }

    markdown += `---\n\n## Conversation\n\n`;

    messages.forEach((message, index) => {
      const roleIcon = message.role === 'user' ? '👤' : '🤖';
      markdown += `### ${roleIcon} ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}\n\n`;
      markdown += `${message.content}\n\n`;

      if (message.metadata?.model) {
        markdown += `*Model: ${message.metadata.model}*\n\n`;
      }
      if (message.metadata?.tokens) {
        markdown += `*Tokens: ${message.metadata.tokens}*\n\n`;
      }

      markdown += `---\n\n`;
    });

    return markdown;
  }

  /**
   * Export session to JSON format
   */
  private exportToJSON(session: Session): string {
    return JSON.stringify(session, null, 2);
  }

  /**
   * Export session to context format (for AI continuation)
   */
  private exportToContext(session: Session): string {
    const { metadata, messages } = session;

    let context = `# Session Context: ${metadata.sessionId}\n\n`;
    context += `This is a continuation of a previous conversation.\n\n`;
    context += `**Previous Session Details:**\n`;
    context += `- CLI: ${metadata.cliType}\n`;
    context += `- Project: ${metadata.projectPath}\n`;
    context += `- Messages: ${metadata.messageCount}\n`;
    context += `- Last Updated: ${metadata.updatedAt.toLocaleString()}\n\n`;

    if (messages.length > 0) {
      context += `**Last Exchange:**\n\n`;

      // Include last 3 exchanges for context
      const recentMessages = messages.slice(-6);
      recentMessages.forEach(message => {
        context += `**${message.role.toUpperCase()}:** ${message.content}\n\n`;
      });
    }

    context += `---\n\n`;
    context += `Please continue the conversation based on this context.`;

    return context;
  }
}