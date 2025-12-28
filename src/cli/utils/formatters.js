/**
 * CLI Formatters Module
 * Contains helper functions for formatting output
 */

/**
 * Format bytes into human readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format CLI tool status for display
 * @param {Object} status - Status object
 * @returns {string} Formatted status
 */
function formatToolStatus(status) {
  if (status.installed) {
    return `${status.tool}: ✅ Installed (v${status.version || 'unknown'})`;
  } else {
    return `${status.tool}: ❌ Not installed`;
  }
}

module.exports = {
  formatBytes,
  formatDuration,
  formatToolStatus
};