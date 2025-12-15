#!/usr/bin/env node

/**
 * Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System
 * Unified Entry Point
 * International Version - Pure English & ANSI Only
 * Version: 1.0.94
 */

// Import all components
const MemoryManager = require('./core/memory_manager');
const StigmergyInstaller = require('./core/installer');
const { maxOfTwo, isAuthenticated } = require('./utils/helpers');
const main = require('./cli/router');

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
