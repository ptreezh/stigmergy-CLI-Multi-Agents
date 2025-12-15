import { Session, SessionScanner } from './SessionScanner';
import { SessionFilter, QueryOptions } from './SessionFilter';
import { HistoryFormatter } from './HistoryFormatter';

/**
 * Main interface for querying session history
 */
export class HistoryQuery {
  private scanner: SessionScanner;
  private filter: SessionFilter;
  private formatter: HistoryFormatter;

  constructor() {
    this.scanner = new SessionScanner();
    this.filter = new SessionFilter();
    this.formatter = new HistoryFormatter();
  }

  /**
   * Queries session history based on options
   */
  queryHistory(options: QueryOptions, projectPath: string): { response: string, suggestions: string[] } {
    try {
      // Scan all CLI sessions
      const allSessions = this.scanner.scanAllCLISessions(projectPath);

      // Apply filters
      const filteredSessions = this.filter.applyFilters(allSessions, options, projectPath);

      // Format response based on format option
      let response: string;
      switch (options.format) {
        case 'timeline':
          response = this.formatter.formatTimeline(filteredSessions);
          break;
        case 'detailed':
          response = this.formatter.formatDetailed(filteredSessions);
          break;
        case 'context':
          response = this.formatter.formatContext(filteredSessions[0] || null);
          break;
        case 'summary':
        default:
          response = this.formatter.formatSummary(filteredSessions);
          break;
      }

      // Generate suggestions
      const suggestions = this.generateSuggestions(filteredSessions, options);

      return {
        response,
        suggestions
      };
    } catch (error) {
      return {
        response: `❌ 历史查询失败: ${(error as Error).message}`,
        suggestions: ['/history --help']
      };
    }
  }

  /**
   * Generates command suggestions for users
   */
  private generateSuggestions(sessions: Session[], query: QueryOptions): string[] {
    const suggestions: string[] = [];

    if (sessions.length > 0) {
      suggestions.push('/history --format context');
      suggestions.push('/history --format timeline');

      if (sessions[0]?.cliType) {
        suggestions.push(`/history --cli ${sessions[0].cliType}`);
      }
    }

    suggestions.push('/history --search "react"');
    suggestions.push('/history --today');

    return suggestions.slice(0, 5);
  }
}