/**
 * Logger and Monitoring System for Unified Logging and Performance Monitoring
 * 
 * This system handles logging and monitoring by:
 * - Recording events with different log levels
 * - Collecting performance metrics
 * - Supporting log level filtering
 * - Providing log persistence
 * - Supporting log queries
 * - Generating performance reports
 * 
 * @module Logger
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Log levels
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
};

// Log level priorities (higher = more severe)
const LogLevelPriority = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4
};

class Logger extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      logLevel: options.logLevel || LogLevel.INFO,
      enableConsole: options.enableConsole !== false,
      enableFileLogging: options.enableFileLogging !== false,
      logFilePath: options.logFilePath || './logs/app.log',
      enableMetrics: options.enableMetrics !== false,
      metricsInterval: options.metricsInterval || 60000, // 1 minute
      enableLogRotation: options.enableLogRotation !== false,
      maxLogFileSize: options.maxLogFileSize || 10 * 1024 * 1024, // 10MB
      maxLogFiles: options.maxLogFiles || 5,
      ...options
    };
    
    // Logger state
    this.state = {
      logs: [],
      metrics: {
        totalLogs: 0,
        logsByLevel: {},
        averageLogSize: 0,
        lastLogTime: null,
        performanceMetrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          eventLoopDelay: 0,
          activeConnections: 0,
          requestsPerSecond: 0
        }
      },
      metricsIntervalId: null
    };
    
    // Initialize logger
    this._initialize();
  }

  /**
   * Initialize the logger
   * 
   * @private
   */
  _initialize() {
    // Initialize metrics tracking
    if (this.options.enableMetrics) {
      this._startMetricsCollection();
    }
    
    // Ensure log directory exists
    if (this.options.enableFileLogging) {
      this._ensureLogDirectory();
    }
  }

  /**
   * Ensure log directory exists
   * 
   * @private
   */
  _ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.options.logFilePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error(`[Logger] Error creating log directory: ${error.message}`);
    }
  }

  /**
   * Log an event
   * 
   * @param {string} message - Log message
   * @param {string} level - Log level
   * @param {Object} context - Additional context
   */
  logEvent(message, level = LogLevel.INFO, context = {}) {
    try {
      // Check if log level is enabled
      if (!this._isLogLevelEnabled(level)) {
        return;
      }
      
      // Create log entry
      const logEntry = {
        id: this._generateLogId(),
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        context: context,
        size: JSON.stringify({ message, context }).length
      };
      
      // Update statistics
      this.state.metrics.totalLogs++;
      this.state.metrics.lastLogTime = Date.now();
      
      if (!this.state.metrics.logsByLevel[level]) {
        this.state.metrics.logsByLevel[level] = 0;
      }
      this.state.metrics.logsByLevel[level]++;
      
      // Calculate average log size
      this.state.metrics.averageLogSize = 
        ((this.state.metrics.averageLogSize * (this.state.metrics.totalLogs - 1)) + logEntry.size) / 
        this.state.metrics.totalLogs;
      
      // Add to in-memory logs
      this.state.logs.push(logEntry);
      
      // Keep only last 1000 logs in memory
      if (this.state.logs.length > 1000) {
        this.state.logs = this.state.logs.slice(-1000);
      }
      
      // Output to console
      if (this.options.enableConsole) {
        this._logToConsole(logEntry);
      }
      
      // Write to file
      if (this.options.enableFileLogging) {
        this._logToFile(logEntry);
      }
      
      // Emit log event
      this.emit('log', {
        entry: logEntry,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`[Logger] Error logging event: ${error.message}`);
    }
  }

  /**
   * Log debug message
   * 
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  debug(message, context = {}) {
    this.logEvent(message, LogLevel.DEBUG, context);
  }

  /**
   * Log info message
   * 
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    this.logEvent(message, LogLevel.INFO, context);
  }

  /**
   * Log warning message
   * 
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    this.logEvent(message, LogLevel.WARN, context);
  }

  /**
   * Log error message
   * 
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  error(message, context = {}) {
    this.logEvent(message, LogLevel.ERROR, context);
  }

  /**
   * Log fatal message
   * 
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  fatal(message, context = {}) {
    this.logEvent(message, LogLevel.FATAL, context);
  }

  /**
   * Collect performance metrics
   * 
   * @returns {Object} Performance metrics
   */
  collectMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      ...this.state.metrics.performanceMetrics
    };
    
    return metrics;
  }

  /**
   * Get dashboard data
   * 
   * @returns {Object} Dashboard data
   */
  getDashboardData() {
    const logsByLevel = {};
    for (const level of Object.values(LogLevel)) {
      logsByLevel[level] = this.state.metrics.logsByLevel[level] || 0;
    }
    
    return {
      metrics: this.collectMetrics(),
      logs: {
        total: this.state.metrics.totalLogs,
        byLevel: logsByLevel,
        averageSize: this.state.metrics.averageLogSize,
        lastLogTime: this.state.metrics.lastLogTime
      },
      system: {
        logLevel: this.options.logLevel,
        enableConsole: this.options.enableConsole,
        enableFileLogging: this.options.enableFileLogging,
        enableMetrics: this.options.enableMetrics
      }
    };
  }

  /**
   * Query logs
   * 
   * @param {Object} query - Query parameters
   * @returns {Array<Object>} Filtered logs
   */
  queryLogs(query = {}) {
    let filteredLogs = [...this.state.logs];
    
    // Filter by level
    if (query.level) {
      filteredLogs = filteredLogs.filter(log => log.level === query.level);
    }
    
    // Filter by time range
    if (query.startTime || query.endTime) {
      filteredLogs = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const startTime = query.startTime ? new Date(query.startTime).getTime() : 0;
        const endTime = query.endTime ? new Date(query.endTime).getTime() : Infinity;
        return logTime >= startTime && logTime <= endTime;
      });
    }
    
    // Filter by message pattern
    if (query.messagePattern) {
      const pattern = new RegExp(query.messagePattern, 'i');
      filteredLogs = filteredLogs.filter(log => pattern.test(log.message));
    }
    
    // Filter by context key-value
    if (query.contextKey && query.contextValue) {
      filteredLogs = filteredLogs.filter(log => 
        log.context[query.contextKey] === query.contextValue
      );
    }
    
    // Limit results
    if (query.limit) {
      filteredLogs = filteredLogs.slice(-query.limit);
    }
    
    return filteredLogs;
  }

  /**
   * Get logs by level
   * 
   * @param {string} level - Log level
   * @param {number} limit - Maximum number of logs to return
   * @returns {Array<Object>} Logs of specified level
   */
  getLogsByLevel(level, limit = 100) {
    return this.queryLogs({ level, limit });
  }

  /**
   * Get recent logs
   * 
   * @param {number} limit - Maximum number of logs to return
   * @returns {Array<Object>} Recent logs
   */
  getRecentLogs(limit = 100) {
    return this.state.logs.slice(-limit);
  }

  /**
   * Generate performance report
   * 
   * @param {Object} options - Report options
   * @returns {Object} Performance report
   */
  generatePerformanceReport(options = {}) {
    const reportOptions = {
      includeMetrics: options.includeMetrics !== false,
      includeLogs: options.includeLogs !== false,
      timeRange: options.timeRange || '1h', // 1h, 6h, 24h, 7d
      ...options
    };
    
    const report = {
      generatedAt: new Date().toISOString(),
      timeRange: reportOptions.timeRange,
      summary: {}
    };
    
    // Add metrics if requested
    if (reportOptions.includeMetrics) {
      report.metrics = this.collectMetrics();
    }
    
    // Add logs if requested
    if (reportOptions.includeLogs) {
      const now = Date.now();
      let startTime;
      
      switch (reportOptions.timeRange) {
        case '1h':
          startTime = now - 60 * 60 * 1000;
          break;
        case '6h':
          startTime = now - 6 * 60 * 60 * 1000;
          break;
        case '24h':
          startTime = now - 24 * 60 * 60 * 1000;
          break;
        case '7d':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          startTime = now - 60 * 60 * 1000;
      }
      
      report.logs = this.queryLogs({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(now).toISOString()
      });
      
      report.summary.totalLogs = report.logs.length;
      report.summary.logsByLevel = {};
      
      for (const log of report.logs) {
        if (!report.summary.logsByLevel[log.level]) {
          report.summary.logsByLevel[log.level] = 0;
        }
        report.summary.logsByLevel[log.level]++;
      }
    }
    
    return report;
  }

  /**
   * Set log level
   * 
   * @param {string} level - Log level
   */
  setLogLevel(level) {
    if (Object.values(LogLevel).includes(level)) {
      this.options.logLevel = level;
    } else {
      throw new Error(`Invalid log level: ${level}`);
    }
  }

  /**
   * Get log level
   * 
   * @returns {string} Current log level
   */
  getLogLevel() {
    return this.options.logLevel;
  }

  /**
   * Clear in-memory logs
   */
  clearLogs() {
    this.state.logs = [];
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.state.metrics = {
      totalLogs: 0,
      logsByLevel: {},
      averageLogSize: 0,
      lastLogTime: null,
      performanceMetrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        eventLoopDelay: 0,
        activeConnections: 0,
        requestsPerSecond: 0
      }
    };
  }

  /**
   * Export logs
   * 
   * @param {Object} options - Export options
   * @returns {Object} Exported logs
   */
  exportLogs(options = {}) {
    const exportOptions = {
      format: options.format || 'json',
      includeContext: options.includeContext !== false,
      limit: options.limit || 1000,
      ...options
    };
    
    let logsToExport = [...this.state.logs];
    
    // Apply limit
    if (exportOptions.limit) {
      logsToExport = logsToExport.slice(-exportOptions.limit);
    }
    
    // Format logs
    if (exportOptions.format === 'json') {
      return {
        exportedAt: new Date().toISOString(),
        format: 'json',
        count: logsToExport.length,
        logs: logsToExport.map(log => {
          const exportLog = {
            id: log.id,
            timestamp: log.timestamp,
            level: log.level,
            message: log.message
          };
          
          if (exportOptions.includeContext) {
            exportLog.context = log.context;
          }
          
          return exportLog;
        })
      };
    } else if (exportOptions.format === 'csv') {
      const csvHeader = ['id', 'timestamp', 'level', 'message'];
      
      if (exportOptions.includeContext) {
        csvHeader.push('context');
      }
      
      const csvRows = [csvHeader.join(',')];
      
      for (const log of logsToExport) {
        const row = [
          log.id,
          log.timestamp,
          log.level,
          `"${log.message.replace(/"/g, '""')}"`
        ];
        
        if (exportOptions.includeContext) {
          row.push(`"${JSON.stringify(log.context).replace(/"/g, '""')}"`);
        }
        
        csvRows.push(row.join(','));
      }
      
      return {
        exportedAt: new Date().toISOString(),
        format: 'csv',
        count: logsToExport.length,
        csv: csvRows.join('\n')
      };
    }
    
    throw new Error(`Unsupported export format: ${exportOptions.format}`);
  }

  /**
   * Start metrics collection
   * 
   * @private
   */
  _startMetricsCollection() {
    this.state.metricsIntervalId = setInterval(() => {
      this._collectPerformanceMetrics();
    }, this.options.metricsInterval);
  }

  /**
   * Collect performance metrics
   * 
   * @private
   */
  _collectPerformanceMetrics() {
    // Collect CPU and memory usage
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    
    this.state.metrics.performanceMetrics.cpuUsage = cpuUsage;
    this.state.metrics.performanceMetrics.memoryUsage = memoryUsage;
    
    // Calculate event loop delay
    const start = Date.now();
    setImmediate(() => {
      const delay = Date.now() - start;
      this.state.metrics.performanceMetrics.eventLoopDelay = delay;
    });
    
    // Emit metrics event
    this.emit('metrics', {
      metrics: this.state.metrics.performanceMetrics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check if log level is enabled
   * 
   * @param {string} level - Log level
   * @returns {boolean} True if log level is enabled
   * @private
   */
  _isLogLevelEnabled(level) {
    return LogLevelPriority[level] >= LogLevelPriority[this.options.logLevel];
  }

  /**
   * Log to console
   * 
   * @param {Object} logEntry - Log entry
   * @private
   */
  _logToConsole(logEntry) {
    const consoleMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
      [LogLevel.FATAL]: console.error
    }[logEntry.level] || console.log;
    
    const timestamp = new Date(logEntry.timestamp).toISOString();
    const logMessage = `[${timestamp}] [${logEntry.level.toUpperCase()}] ${logEntry.message}`;
    
    consoleMethod(logMessage);
    
    if (Object.keys(logEntry.context).length > 0) {
      consoleMethod(`  Context: ${JSON.stringify(logEntry.context, null, 2)}`);
    }
  }

  /**
   * Log to file
   * 
   * @param {Object} logEntry - Log entry
   * @private
   */
  _logToFile(logEntry) {
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.options.logFilePath, logLine);
      
      // Check log rotation
      if (this.options.enableLogRotation) {
        this._checkLogRotation();
      }
    } catch (error) {
      console.error(`[Logger] Error writing to log file: ${error.message}`);
    }
  }

  /**
   * Check log rotation
   * 
   * @private
   */
  _checkLogRotation() {
    try {
      const stats = fs.statSync(this.options.logFilePath);
      
      if (stats.size > this.options.maxLogFileSize) {
        this._rotateLog();
      }
    } catch (error) {
      console.error(`[Logger] Error checking log rotation: ${error.message}`);
    }
  }

  /**
   * Rotate log file
   * 
   * @private
   */
  _rotateLog() {
    try {
      const logPath = this.options.logFilePath;
      const logDir = path.dirname(logPath);
      const logName = path.basename(logPath, path.extname(logPath));
      const logExt = path.extname(logPath);
      
      // Rename current log file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedName = `${logName}-${timestamp}${logExt}`;
      const rotatedPath = path.join(logDir, rotatedName);
      
      fs.renameSync(logPath, rotatedPath);
      
      // Clean up old log files
      this._cleanupOldLogs(logDir, logName, logExt);
      
      console.log(`[Logger] Log rotated: ${rotatedName}`);
      
    } catch (error) {
      console.error(`[Logger] Error rotating log file: ${error.message}`);
    }
  }

  /**
   * Clean up old log files
   * 
   * @param {string} logDir - Log directory
   * @param {string} logName - Log file name
   * * @param {string} logExt - Log file extension
   * @private
   */
  _cleanupOldLogs(logDir, logName, logExt) {
    try {
      const files = fs.readdirSync(logDir);
      const logFiles = files
        .filter(file => file.startsWith(logName) && file.endsWith(logExt))
        .map(file => ({
          name: file,
          path: path.join(logDir, file)
        }))
        .sort((a, b) => {
          const aTime = fs.statSync(a.path).mtimeMs;
          const bTime = fs.statSync(b.path).mtimeMs;
          return bTime - aTime;
        });
      
      // Remove excess log files
      while (logFiles.length > this.options.maxLogFiles) {
        const fileToRemove = logFiles.pop();
        fs.unlinkSync(fileToRemove.path);
        console.log(`[Logger] Removed old log file: ${fileToRemove.name}`);
      }
      
    } catch (error) {
      console.error(`[Logger] Error cleaning up old logs: ${error.message}`);
    }
  }

  /**
   * Generate log ID
   * 
   * @returns {string} Unique log ID
   * @private
   */
  _generateLogId() {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the logger
   * 
   * @returns {Promise<void>}
   */
  async shutdown() {
    // Stop metrics collection
    if (this.state.metricsIntervalId) {
      clearInterval(this.state.metricsIntervalId);
      this.state.metricsIntervalId = null;
    }
    
    // Emit shutdown event
    this.emit('shutdown', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update performance metric
   * 
   * @param {string} metricName - Metric name
   * @param {any} value - Metric value
   */
  updatePerformanceMetric(metricName, value) {
    if (this.state.metrics.performanceMetrics.hasOwnProperty(metricName)) {
      this.state.metrics.performanceMetrics[metricName] = value;
    }
  }
}

module.exports = {
  Logger,
  LogLevel
};