import { Session } from './SessionScanner';

export interface QueryOptions {
  cli?: string;
  search?: string;
  limit?: number;
  format?: 'summary' | 'timeline' | 'detailed' | 'context';
  timeRange?: 'all' | 'today' | 'week' | 'month';
}

/**
 * Filters and sorts session data based on various criteria
 */
export class SessionFilter {
  /**
   * Filters sessions by CLI type
   */
  filterByCLI(sessions: Session[], cliType?: string): Session[] {
    if (!cliType) return sessions;
    return sessions.filter(session => session.cliType === cliType);
  }

  /**
   * Filters sessions by search term
   */
  filterBySearch(sessions: Session[], searchTerm?: string): Session[] {
    if (!searchTerm) return sessions;

    const lowerSearch = searchTerm.toLowerCase();
    return sessions.filter(session =>
      session.title.toLowerCase().includes(lowerSearch) ||
      session.content.toLowerCase().includes(lowerSearch)
    );
  }

  /**
   * Filters sessions by time range
   */
  filterByDateRange(sessions: Session[], timeRange: 'all' | 'today' | 'week' | 'month' = 'all'): Session[] {
    if (timeRange === 'all') return sessions;

    const now = new Date();
    return sessions.filter(session => {
      const sessionDate = new Date(session.updatedAt);

      switch (timeRange) {
        case 'today':
          return sessionDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  /**
   * Sorts sessions by date (newest first)
   */
  sortByDate(sessions: Session[]): Session[] {
    return [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Filters sessions by project path
   */
  filterByProject(sessions: Session[], projectPath: string): Session[] {
    return sessions.filter(session => session.projectPath === projectPath);
  }

  /**
   * Applies all filters based on query options
   */
  applyFilters(sessions: Session[], options: QueryOptions, projectPath: string): Session[] {
    let filteredSessions = [...sessions];

    // Apply project filter
    filteredSessions = this.filterByProject(filteredSessions, projectPath);

    // Apply CLI filter
    if (options.cli) {
      filteredSessions = this.filterByCLI(filteredSessions, options.cli);
    }

    // Apply search filter
    if (options.search) {
      filteredSessions = this.filterBySearch(filteredSessions, options.search);
    }

    // Apply date range filter
    if (options.timeRange) {
      filteredSessions = this.filterByDateRange(filteredSessions, options.timeRange);
    }

    // Sort by date (newest first)
    filteredSessions = this.sortByDate(filteredSessions);

    // Apply limit
    if (options.limit && options.limit > 0) {
      filteredSessions = filteredSessions.slice(0, options.limit);
    }

    return filteredSessions;
  }
}