#!/usr/bin/env node

/**
 * Stigmergy Deployment Script
 * This script deploys hooks and integrations for all available CLI tools
 */

const fs = require("fs").promises;
const path = require("path");
const os = require("os");

// Import the main Stigmergy installer
const { StigmergyInstaller } = require("./main_english.js");

// Set up global error handlers using our error handler module
const { setupGlobalErrorHandlers } = require("./core/error_handler");
setupGlobalErrorHandlers();

async function deploy() {
  console.log("Stigmergy Deployment Script");
  console.log("==========================");

  try {
    // Create installer instance
    const installer = new StigmergyInstaller();

    // Scan for available tools
    console.log("[SCAN] Scanning for available CLI tools...");
    const scanResult = await installer.scanCLI();
    const available = scanResult.available;

    // Deploy hooks for all available tools
    console.log("[DEPLOY] Deploying hooks for all available tools...");
    await installer.deployHooks(available);

    console.log("\n[SUCCESS] Deployment completed successfully!");
    return true;
  } catch (error) {
    console.error("[ERROR] Deployment failed:", error.message);
    return false;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deploy()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("[FATAL ERROR]:", error.message);
      process.exit(1);
    });
}

module.exports = { deploy };
