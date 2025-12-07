#!/usr/bin/env node

/**
 * Stigmergy CLI - Main Entry Point
 * This file serves as the main entry point for the Stigmergy CLI system
 */

// Import and export the main functionality from main.js
import('./main.js').catch(error => {
    console.error('❌ Error loading main module:', error.message);
    process.exit(1);
});