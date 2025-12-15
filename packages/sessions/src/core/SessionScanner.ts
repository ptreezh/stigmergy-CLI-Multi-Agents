import { CLIAdapter } from '../types/CLIAdapter';
import { Session, CLIType, SessionSearchCriteria } from '../types/Session';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface SessionStatistics {
  totalSessions: number;
  totalMessages: number;
  byCLI: Record<string, number>;
  byProject: Record<string, number>;
  averageMessagesPerSession: number;
  oldestSession?: Date;
  newestSession?: Date;
  totalSizeBytes?: number;
}

export interface ScanOptions {
  maxSessions?: number;
  maxAgeDays?: number;
  includeEmpty?: boolean;
  minMessages?: number;
}

/**
 * Production-ready SessionScanner with proper error handling and performance optimizations
 */
export class SessionScanner {
  private adapters: CLIAdapter[];
  private cache: Map<string, Session[]> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private lastScanTime: number = 0;

  constructor(adapters: CLIAdapter[]) {
    this.adapters = adapters.filter(adapter => adapter != null);

    // Validate adapters
    for (const adapter of this.adapters) {
      if (!adapter.cliType || !adapter.name) {
        throw new Error(`Invalid adapter: missing required properties cliType or name`);
      }
    }
  }

  /**
   * Scan all sessions from all available adapters with caching
   */
  async scanAllSessions(options: ScanOptions = {}): Promise<Session[]> {
    const now = Date.now();

    // Return cached results if available and not expired
    if (now - this.lastScanTime < this.cacheTimeout && this.cache.has('all')) {
      let cachedSessions = this.cache.get('all')!;

      // Apply options filters to cached results
      cachedSessions = this.applyOptionsFilter(cachedSessions, options);

      return cachedSessions;
    }

    const allSessions: Session[] = [];
    const errors: Array<{adapter: string, error: Error}> = [];

    // Scan each adapter concurrently for better performance
    const scanPromises = this.adapters.map(async (adapter) => {
      try {
        const isAvailable = await adapter.isAvailable();
        if (!isAvailable) {
          return { adapter: adapter.cliType, sessions: [] };
        }

        const sessions = await this.scanAdapterSessions(adapter, options);
        return { adapter: adapter.cliType, sessions };
      } catch (error) {
        errors.push({
          adapter: adapter.cliType,
          error: error instanceof Error ? error : new Error(String(error))
        });
        return { adapter: adapter.cliType, sessions: [] };
      }
    });

    const results = await Promise.allSettled(scanPromises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allSessions.push(...result.value.sessions);
      }
    }

    // Log any errors that occurred
    if (errors.length > 0) {
      console.warn(`Scanning completed with ${errors.length} errors:`);
      errors.forEach(({ adapter, error }) => {
        console.warn(`  ${adapter}: ${error.message}`);
      });
    }

    // Sort by last updated time (most recent first) and apply options
    const sortedSessions = allSessions
      .sort((a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime());

    // Cache the results
    this.cache.set('all', sortedSessions);
    this.lastScanTime = now;

    return this.applyOptionsFilter(sortedSessions, options);
  }

  /**
   * Scan sessions from a specific adapter
   */
  async scanAdapterSessions(adapter: CLIAdapter, options: ScanOptions = {}): Promise<Session[]> {
    try {
      const config = await adapter.getCLIConfig();
      const sessions: Session[] = [];
      let totalSizeBytes = 0;

      // Validate config
      if (!config.sessionPaths || !Array.isArray(config.sessionPaths)) {
        console.warn(`Invalid session paths for adapter ${adapter.cliType}`);
        return [];
      }

      // Scan each session path
      for (const sessionPath of config.sessionPaths) {
        try {
          if (!sessionPath || typeof sessionPath !== 'string') {
            continue;
          }

          const sessionFiles = await this.findSessionFiles(sessionPath, options);

          // Process files in batches to prevent memory issues
          const batchSize = 100;
          for (let i = 0; i < sessionFiles.length; i += batchSize) {
            const batch = sessionFiles.slice(i, i + batchSize);

            for (const filePath of batch) {
              try {
                const parseResult = await adapter.parseSession(filePath);

                if (parseResult.success && parseResult.session) {
                  // Apply filters
                  if (!this.shouldIncludeSession(parseResult.session, options)) {
                    continue;
                  }

                  sessions.push(parseResult.session);

                  // Track total size
                  try {
                    const stats = await fs.stat(filePath);
                    totalSizeBytes += stats.size;
                  } catch (statError) {
                    // Ignore stat errors for size calculation
                  }
                }
              } catch (parseError) {
                console.warn(`Failed to parse session file ${filePath}:`, parseError);
                continue;
              }
            }

            // Apply maxSessions limit if specified
            if (options.maxSessions && sessions.length >= options.maxSessions) {
              break;
            }
          }
        } catch (pathError) {
          console.warn(`Failed to scan session path ${sessionPath}:`, pathError);
          continue;
        }
      }

      return sessions;
    } catch (error) {
      console.error(`Failed to scan adapter ${adapter.cliType}:`, error);
      return [];
    }
  }

  /**
   * Scan sessions for a specific project
   */
  async scanSessionsByProject(projectPath: string, options: ScanOptions = {}): Promise<Session[]> {
    if (!projectPath || typeof projectPath !== 'string') {
      throw new Error('Invalid project path provided');
    }

    const allSessions = await this.scanAllSessions(options);
    return this.filterSessionsByProject(allSessions, projectPath);
  }

  /**
   * Scan sessions for specific CLI types
   */
  async scanSessionsByCLI(cliType: CLIType, options: ScanOptions = {}): Promise<Session[]> {
    const allSessions = await this.scanAllSessions(options);
    return allSessions.filter(session => session.metadata.cliType === cliType);
  }

  /**
   * Get statistics about scanned sessions
   */
  async getSessionStatistics(options: ScanOptions = {}): Promise<SessionStatistics> {
    const sessions = await this.scanAllSessions(options);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMessages: 0,
        byCLI: {},
        byProject: {},
        averageMessagesPerSession: 0
      };
    }

    const stats: SessionStatistics = {
      totalSessions: sessions.length,
      totalMessages: 0,
      byCLI: {},
      byProject: {},
      averageMessagesPerSession: 0,
      oldestSession: sessions[0].metadata.createdAt,
      newestSession: sessions[sessions.length - 1].metadata.createdAt
    };

    let totalSizeBytes = 0;

    for (const session of sessions) {
      stats.totalMessages += session.metadata.messageCount;

      // Count by CLI
      const cliType = session.metadata.cliType;
      stats.byCLI[cliType] = (stats.byCLI[cliType] || 0) + 1;

      // Count by project (use relative path for better readability)
      const projectPath = this.getRelativeProjectPath(session.metadata.projectPath);
      stats.byProject[projectPath] = (stats.byProject[projectPath] || 0) + 1;

      // Calculate file size
      try {
        const fileStats = await fs.stat(session.metadata.filePath);
        totalSizeBytes += fileStats.size;
      } catch (error) {
        // Ignore if file doesn't exist or can't be accessed
      }
    }

    stats.totalSizeBytes = totalSizeBytes;
    stats.averageMessagesPerSession = stats.totalMessages / sessions.length;

    return stats;
  }

  /**
   * Search sessions based on criteria with performance optimizations
   */
  async searchSessions(keyword: string, criteria: Partial<SessionSearchCriteria> = {}, options: ScanOptions = {}): Promise<Session[]> {
    let sessions = await this.scanAllSessions(options);

    // Early exit if no sessions
    if (sessions.length === 0) {
      return [];
    }

    // Apply keyword search first (most expensive operation)
    if (keyword && keyword.trim().length > 0) {
      const searchTerm = keyword.toLowerCase().trim();
      sessions = sessions.filter(session => {
        // Search in metadata
        if (session.metadata.title?.toLowerCase().includes(searchTerm) ||
            session.metadata.sessionId.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in message content (limit search to recent sessions for performance)
        const maxMessagesToSearch = 50;
        const messagesToSearch = session.messages.slice(-maxMessagesToSearch);

        return messagesToSearch.some(message =>
          message.content.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by CLI type
    if (criteria.cliType && criteria.cliType.length > 0) {
      sessions = sessions.filter(session => criteria.cliType!.includes(session.metadata.cliType));
    }

    // Filter by date range
    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange;
      sessions = sessions.filter(session => {
        const sessionDate = session.metadata.updatedAt;
        return sessionDate >= start && sessionDate <= end;
      });
    }

    // Filter by project path
    if (criteria.projectPath) {
      sessions = this.filterSessionsByProject(sessions, criteria.projectPath);
    }

    // Filter by message count range
    if (criteria.minMessages !== undefined) {
      sessions = sessions.filter(session => session.metadata.messageCount >= criteria.minMessages!);
    }
    if (criteria.maxMessages !== undefined) {
      sessions = sessions.filter(session => session.metadata.messageCount <= criteria.maxMessages!);
    }

    return sessions;
  }

  /**
   * Clear the scan cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastScanTime = 0;
  }

  /**
   * Find session files in a directory with performance optimizations
   */
  private async findSessionFiles(sessionPath: string, options: ScanOptions = {}): Promise<string[]> {
    try {
      if (!sessionPath || typeof sessionPath !== 'string') {
        return [];
      }

      // Validate path exists and is accessible
      if (!fs.existsSync(sessionPath)) {
        return [];
      }

      const stats = await fs.stat(sessionPath);
      if (!stats.isDirectory()) {
        return [];
      }

      // Read directory contents
      const files = await fs.readdir(sessionPath);
      const sessionFiles: string[] = [];

      for (const file of files) {
        const filePath = path.join(sessionPath, file);

        try {
          const fileStats = await fs.stat(filePath);

          if (fileStats.isFile() && this.isSessionFile(file)) {
            // Apply age filter if specified
            if (options.maxAgeDays) {
              const ageMs = Date.now() - fileStats.mtime.getTime();
              const maxAgeMs = options.maxAgeDays * 24 * 60 * 60 * 1000;

              if (ageMs > maxAgeMs) {
                continue;
              }
            }

            sessionFiles.push(filePath);
          }
        } catch (statError) {
          // Skip files we can't stat
          continue;
        }
      }

      return sessionFiles;
    } catch (error) {
      console.warn(`Error scanning session files in ${sessionPath}:`, error);
      return [];
    }
  }

  /**
   * Check if a file is a session file based on its name and extension
   */
  private isSessionFile(filename: string): boolean {
    const sessionFilePatterns = [
      /\.jsonl?$/i,           // .json, .jsonl
      /^session-/i,           // starts with "session-"
      /-session\./i,          // contains "-session."
      /chat/i,                // contains "chat"
      /conversation/i,        // contains "conversation"
      /^dialog/i              // starts with "dialog"
    ];

    return sessionFilePatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Filter sessions based on options
   */
  private applyOptionsFilter(sessions: Session[], options: ScanOptions): Session[] {
    return this.shouldIncludeSessionBatch(sessions, options);
  }

  /**
   * Check if a session should be included based on options
   */
  private shouldIncludeSession(session: Session, options: ScanOptions): boolean {
    // Check minimum messages requirement
    if (options.minMessages && session.metadata.messageCount < options.minMessages) {
      return false;
    }

    // Check if empty sessions should be included
    if (!options.includeEmpty && session.metadata.messageCount === 0) {
      return false;
    }

    return true;
  }

  /**
   * Filter a batch of sessions based on options
   */
  private shouldIncludeSessionBatch(sessions: Session[], options: ScanOptions): Session[] {
    if (!options.minMessages && !options.includeEmpty && !options.maxSessions) {
      return sessions;
    }

    let filtered = sessions;

    if (options.minMessages) {
      filtered = filtered.filter(session => session.metadata.messageCount >= options.minMessages!);
    }

    if (!options.includeEmpty) {
      filtered = filtered.filter(session => session.metadata.messageCount > 0);
    }

    if (options.maxSessions) {
      filtered = filtered.slice(0, options.maxSessions);
    }

    return filtered;
  }

  /**
   * Filter sessions by project path with fuzzy matching
   */
  private filterSessionsByProject(sessions: Session[], projectPath: string): Session[] {
    const normalizedTarget = path.resolve(projectPath).toLowerCase();

    return sessions.filter(session => {
      const sessionProject = path.resolve(session.metadata.projectPath).toLowerCase();

      // Exact match
      if (sessionProject === normalizedTarget) {
        return true;
      }

      // Parent/child relationship
      return sessionProject.startsWith(normalizedTarget) || normalizedTarget.startsWith(sessionProject);
    });
  }

  /**
   * Get relative project path for better readability
   */
  private getRelativeProjectPath(projectPath: string): string {
    try {
      const homeDir = require('os').homedir();
      if (projectPath.startsWith(homeDir)) {
        return '~' + projectPath.substring(homeDir.length);
      }
      return projectPath;
    } catch (error) {
      return projectPath;
    }
  }
}