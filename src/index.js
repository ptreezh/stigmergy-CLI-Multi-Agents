#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
 * Unified Entry Point
 * Version: 1.3.1-beta.0
 *
 * Migration Note:
 * - The old monolithic router.js has been archived (2025-12-23)
 * - Now using router-beta.js with modular command handlers
 * - See archived_files/ROUTER_JS_ARCHIVE.md for details
 */

// Import the modular router (router-beta.js)
const main = require('./cli/router-beta');

// Export core components for backward compatibility
const MemoryManager = require('./core/memory_manager');
const StigmergyInstaller = require('./core/installer');
const { maxOfTwo, isAuthenticated } = require('./utils/helpers');

// Run the main application
if (require.main === module) {
  main().catch((error) => {
    console.error('[FATAL] Unhandled error in Stigmergy CLI:', error);
    process.exit(1);
  });
}

module.exports = {
  MemoryManager,
  StigmergyInstaller,
  maxOfTwo,
  isAuthenticated,
  main,
};
