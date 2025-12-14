// Update main coordination layer to include Node.js components
// src/core/coordination/index.js

// Existing content would be here...

// Add Node.js coordination layer exports
const NodeJsCoordinationLayer = require('./nodejs');
const HookDeploymentManager = require('./nodejs/HookDeploymentManager');
const CLIIntegrationManager = require('./nodejs/CLIIntegrationManager');

module.exports = {
  // Existing exports...
  NodeJsCoordinationLayer,
  HookDeploymentManager,
  CLIIntegrationManager
};
