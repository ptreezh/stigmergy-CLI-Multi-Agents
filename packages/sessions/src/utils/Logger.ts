/**
 * Production-ready logging utility
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  error?: Error;
  metadata?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setMaxLogEntries(max: number): void {
    this.maxLogEntries = max;
    this.trimLogs();
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }
  }

  private addLog(level: LogLevel, category: string, message: string, error?: Error, metadata?: Record<string, any>): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      error,
      metadata
    };

    this.logs.push(entry);
    this.trimLogs();

    // Also output to console for immediate feedback
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[entry.level].padEnd(5);
    const categoryStr = `[${entry.category}]`.padEnd(15);
    const message = `${timestamp} ${levelStr} ${categoryStr} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        if (entry.metadata) console.debug('  Metadata:', entry.metadata);
        break;
      case LogLevel.INFO:
        console.info(message);
        if (entry.metadata) console.info('  Metadata:', entry.metadata);
        break;
      case LogLevel.WARN:
        console.warn(message);
        if (entry.metadata) console.warn('  Metadata:', entry.metadata);
        break;
      case LogLevel.ERROR:
        console.error(message);
        if (entry.error) {
          console.error('  Error:', entry.error.message);
          console.error('  Stack:', entry.error.stack);
        }
        if (entry.metadata) console.error('  Metadata:', entry.metadata);
        break;
    }
  }

  debug(category: string, message: string, metadata?: Record<string, any>): void {
    this.addLog(LogLevel.DEBUG, category, message, undefined, metadata);
  }

  info(category: string, message: string, metadata?: Record<string, any>): void {
    this.addLog(LogLevel.INFO, category, message, undefined, metadata);
  }

  warn(category: string, message: string, metadata?: Record<string, any>): void {
    this.addLog(LogLevel.WARN, category, message, undefined, metadata);
  }

  error(category: string, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.addLog(LogLevel.ERROR, category, message, error, metadata);
  }

  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Convenience methods for specific categories
  static adapterDebug(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().debug('ADAPTER', message, metadata);
  }

  static adapterInfo(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().info('ADAPTER', message, metadata);
  }

  static adapterWarn(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().warn('ADAPTER', message, metadata);
  }

  static adapterError(message: string, error?: Error, metadata?: Record<string, any>): void {
    Logger.getInstance().error('ADAPTER', message, error, metadata);
  }

  static scannerDebug(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().debug('SCANNER', message, metadata);
  }

  static scannerInfo(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().info('SCANNER', message, metadata);
  }

  static scannerWarn(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().warn('SCANNER', message, metadata);
  }

  static scannerError(message: string, error?: Error, metadata?: Record<string, any>): void {
    Logger.getInstance().error('SCANNER', message, error, metadata);
  }

  static exporterDebug(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().debug('EXPORTER', message, metadata);
  }

  static exporterInfo(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().info('EXPORTER', message, metadata);
  }

  static exporterWarn(message: string, metadata?: Record<string, any>): void {
    Logger.getInstance().warn('EXPORTER', message, metadata);
  }

  static exporterError(message: string, error?: Error, metadata?: Record<string, any>): void {
    Logger.getInstance().error('EXPORTER', message, error, metadata);
  }
}