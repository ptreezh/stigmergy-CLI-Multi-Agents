#!/usr/bin/env node

/**
 * Test script for Node.js Hook Deployment Manager
 * This script validates the hook deployment functionality
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

// Import the HookDeploymentManager
const HookDeploymentManager = require('./src/core/coordination/nodejs/HookDeploymentManager');

async function testHookDeployment() {
  console.log('=== Testing Hook Deployment Manager ===\n');
  
  try {
    // Initialize the deployment manager
    const deploymentManager = new HookDeploymentManager();
    await deploymentManager.initialize();
    
    console.log('âœ?HookDeploymentManager initialized successfully\n');
    
    // Test deploying hooks for each supported CLI
    const supportedCLIs = deploymentManager.supportedCLIs;
    
    for (const cliName of supportedCLIs) {
      console.log(`Testing hook deployment for ${cliName}...`);
      
      // Deploy hooks
      const result = await deploymentManager.deployHooksForCLI(cliName);
      
      if (result) {
        console.log(`âœ?Hooks deployed successfully for ${cliName}`);
        
        // Validate deployment
        const validation = await deploymentManager.validateHookDeployment(cliName);
        if (validation.valid) {
          console.log(`âœ?Hook deployment validated for ${cliName}`);
        } else {
          console.log(`âœ?Hook deployment validation failed for ${cliName}: ${validation.error}`);
        }
      } else {
        console.log(`âœ?Failed to deploy hooks for ${cliName}`);
      }
      
      console.log(); // Empty line for readability
    }
    
    // List deployed hooks
    console.log('Listing deployed hooks:');
    const deployedHooks = await deploymentManager.listDeployedHooks();
    console.log(`Found ${deployedHooks.length} deployed hooks:`);
    deployedHooks.forEach(hook => {
      console.log(`  - ${hook.cli}: ${hook.hookPath}`);
    });
    
    console.log('\n=== Testing completed ===');
    
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testHookDeployment();
}
