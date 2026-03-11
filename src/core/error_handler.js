/**
 * Centralized Error Handling Utility for Stigmergy CLI
 * Provides consistent error handling, logging, and reporting across the application
 */

const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const chalk = require("chalk");

// Error types enumeration
const ERROR_TYPES = {
  VALIDATION: "VALIDATION_ERROR",
  NETWORK: "NETWORK_ERROR",
  FILE_SYSTEM: "FILE_SYSTEM_ERROR",
  CLI_TOOL: "CLI_TOOL_ERROR",
  CONFIGURATION: "CONFIGURATION_ERROR",
  PERMISSION: "PERMISSION_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

// Log levels enumeration
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class StigmergyError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.UNKNOWN,
    code = null,
    details = null,
  ) {
    super(message);
    this.name = "StigmergyError";
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StigmergyError);
    }
  }
}

class ErrorHandler {
  constructor() {
    this.logFile = path.join(os.homedir(), ".stigmergy", "error.log");
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * Create a standardized Stigmergy error
   * @param {string} message - Error message
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string|null} code - Error code
   * @param {Object|null} details - Additional error details
   * @returns {StigmergyError}
   */
  createError(
    message,
    type = ERROR_TYPES.UNKNOWN,
    code = null,
    details = null,
  ) {
    return new StigmergyError(message, type, code, details);
  }

  /**
   * Log an error to console and file
   * @param {Error|StigmergyError} error - The error to log
   * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
   * @param {string|null} context - Context where error occurred
   */
  async logError(error, level = LOG_LEVELS.ERROR, context = null) {
    try {
      const timestamp = new Date().toISOString();
      const errorType = error.type || ERROR_TYPES.UNKNOWN;
      const errorCode = error.code || "NO_CODE";
      const errorMessage = error.message || "Unknown error";

      // Format log entry
      const logEntry = {
        timestamp,
        level,
        type: errorType,
        code: errorCode,
        message: errorMessage,
        context,
        stack: error.stack || "No stack trace available",
      };

      // Console output with enhanced formatting
      const consoleMessage = `[${timestamp}] [${level}] [${errorType}] ${errorMessage}`;
      const contextMessage = context ? `[CONTEXT] ${context}` : "";

      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(chalk.red.bold(consoleMessage));
          if (contextMessage) console.error(chalk.yellow(contextMessage));
          if (error.stack) console.error(chalk.gray(error.stack));
          break;
        case LOG_LEVELS.WARN:
          console.warn(chalk.yellow.bold(consoleMessage));
          if (contextMessage) console.warn(chalk.yellow(contextMessage));
          break;
        case LOG_LEVELS.INFO:
          console.info(chalk.blue(consoleMessage));
          if (contextMessage) console.info(chalk.gray(contextMessage));
          break;
        case LOG_LEVELS.DEBUG:
          console.debug(chalk.gray(consoleMessage));
          if (contextMessage) console.debug(chalk.gray(contextMessage));
          if (error.stack) console.debug(chalk.gray(error.stack));
          break;
        default:
          console.log(chalk.white(consoleMessage));
          if (contextMessage) console.log(chalk.gray(contextMessage));
      }

      // File logging
      await this.writeToFile(logEntry);
    } catch (logError) {
      console.error("[ERROR_HANDLER] Failed to log error:", logError.message);
    }
  }

  /**
   * Write error to log file
   * @param {Object} logEntry - Formatted log entry
   */
  async writeToFile(logEntry) {
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });

      // Check file size and rotate if necessary
      await this.rotateLogFile();

      // Append to log file
      const logLine = JSON.stringify(logEntry) + "\n";
      await fs.appendFile(this.logFile, logLine, { encoding: "utf8" });
    } catch (error) {
      // Silent fail to prevent infinite loop
    }
  }

  /**
   * Rotate log file if it exceeds max size
   */
  async rotateLogFile() {
    try {
      const stats = await fs.stat(this.logFile);
      if (stats.size > this.maxLogSize) {
        const backupFile = this.logFile + ".old";
        await fs.rename(this.logFile, backupFile);
      }
    } catch (error) {
      // File doesn't exist or other issue, continue
    }
  }

  /**
   * Handle CLI tool execution errors
   * @param {string} toolName - Name of the CLI tool
   * @param {Error} error - Error that occurred
   * @param {string|null} command - Command that failed
   */
  async handleCLIError(toolName, error, command = null) {
    const cliError = new StigmergyError(
      `Failed to execute ${toolName}${command ? ` command: ${command}` : ""}`,
      ERROR_TYPES.CLI_TOOL,
      null,
      {
        tool: toolName,
        command,
        originalError: error.message,
        stack: error.stack,
      },
    );

    await this.logError(cliError, LOG_LEVELS.ERROR, "CLI_EXECUTION");
    return cliError;
  }

  /**
   * Handle file system errors
   * @param {string} operation - File operation that failed
   * @param {string} filePath - Path of file involved
   * @param {Error} error - Original error
   */
  async handleFileError(operation, filePath, error) {
    const fileError = new StigmergyError(
      `Failed to ${operation} file: ${filePath}`,
      ERROR_TYPES.FILE_SYSTEM,
      error.code,
      {
        operation,
        filePath,
        originalError: error.message,
        stack: error.stack,
      },
    );

    await this.logError(fileError, LOG_LEVELS.ERROR, "FILE_SYSTEM");
    return fileError;
  }

  /**
   * Handle network errors
   * @param {string} operation - Network operation that failed
   * @param {string} url - URL involved
   * @param {Error} error - Original error
   */
  async handleNetworkError(operation, url, error) {
    const networkError = new StigmergyError(
      `Network error during ${operation}: ${url}`,
      ERROR_TYPES.NETWORK,
      error.code,
      {
        operation,
        url,
        originalError: error.message,
        stack: error.stack,
      },
    );

    await this.logError(networkError, LOG_LEVELS.ERROR, "NETWORK");
    return networkError;
  }

  /**
   * Handle validation errors
   * @param {string} field - Field that failed validation
   * @param {string} value - Value that failed validation
   * @param {string} reason - Reason for validation failure
   */
  createValidationError(field, value, reason) {
    const validationError = new StigmergyError(
      `Validation failed for ${field}: ${reason}`,
      ERROR_TYPES.VALIDATION,
      "VALIDATION_FAILED",
      {
        field,
        value,
        reason,
      },
    );

    return validationError;
  }

  /**
   * Wrap an async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped function
   */
  wrapAsync(fn, context) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        if (error instanceof StigmergyError) {
          await this.logError(error, LOG_LEVELS.ERROR, context);
          throw error;
        } else {
          const wrappedError = new StigmergyError(
            error.message || "Unknown error occurred",
            ERROR_TYPES.UNKNOWN,
            null,
            { originalError: error.message, stack: error.stack },
          );
          await this.logError(wrappedError, LOG_LEVELS.ERROR, context);
          throw wrappedError;
        }
      }
    };
  }

  /**
   * Get error statistics from log file
   */
  async getErrorStats() {
    try {
      const data = await fs.readFile(this.logFile, "utf8");
      const lines = data.split("\n").filter((line) => line.trim());

      const stats = {
        totalErrors: lines.length,
        byType: {},
        byLevel: {},
      };

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
          stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
        } catch (parseError) {
          // Skip malformed entries
        }
      }

      return stats;
    } catch (error) {
      return { totalErrors: 0, byType: {}, byLevel: {} };
    }
  }

  /**
   * Generate a formatted error report
   * @param {Object} stats - Error statistics from getErrorStats()
   * @returns {string} Formatted error report
   */
  generateErrorReport(stats) {
    let report = "\n=== Stigmergy CLI Error Report ===\n";
    report += `Total Errors: ${stats.totalErrors}\n\n`;

    report += "Errors by Type:\n";
    for (const [type, count] of Object.entries(stats.byType)) {
      report += `  ${type}: ${count}\n`;
    }

    report += "\nErrors by Level:\n";
    for (const [level, count] of Object.entries(stats.byLevel)) {
      report += `  ${level}: ${count}\n`;
    }

    report += "==================================\n";
    return report;
  }

  /**
   * Print error report to console
   */
  async printErrorReport() {
    const stats = await this.getErrorStats();
    const report = this.generateErrorReport(stats);
    console.log(report);
  }
}

// Set up global error handlers within the error handler module
function setupGlobalErrorHandlers() {
  // Only set up handlers if they haven't been set up already
  if (!process.listenerCount("unhandledRejection")) {
    process.on("unhandledRejection", async (reason, promise) => {
      console.error(
        "[FATAL] Global Unhandled Rejection at:",
        promise,
        "reason:",
        reason,
      );

      // Log the error using our error handler
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      await errorHandler.logError(
        error,
        LOG_LEVELS.ERROR,
        "global_unhandledRejection",
      );

      // Exit gracefully after a short delay to allow logging
      setTimeout(() => process.exit(1), 100);
    });
  }

  if (!process.listenerCount("uncaughtException")) {
    process.on("uncaughtException", async (error) => {
      console.error("[FATAL] Global Uncaught Exception:", error);

      // Log the error using our error handler
      await errorHandler.logError(
        error,
        LOG_LEVELS.ERROR,
        "global_uncaughtException",
      );

      // Exit gracefully after a short delay to allow logging
      setTimeout(() => process.exit(1), 100);
    });
  }
}

// Set up global handlers by default
setupGlobalErrorHandlers();

// Export singleton instance
const errorHandler = new ErrorHandler();

module.exports = {
  ErrorHandler,
  errorHandler,
  StigmergyError,
  ERROR_TYPES,
  LOG_LEVELS,
  setupGlobalErrorHandlers,
};
