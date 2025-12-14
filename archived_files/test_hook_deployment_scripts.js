#!/usr/bin/env node

/**
 * Test script to validate hook deployment script functionality
 * This tests if the HookDeploymentManager can correctly deploy hooks for each CLI
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

// Import the HookDeploymentManager
const HookDeploymentManager = require('./src/core/coordination/nodejs/HookDeploymentManager');

async function testHookDeploymentScripts() {
  console.log('=== Testing Hook Deployment Script Functionality ===\n');
  
  try {
    // Initialize the deployment manager
    const deploymentManager = new HookDeploymentManager();
    await deploymentManager.initialize();
    
    console.log('âœ?HookDeploymentManager initialized successfully\n');
    
    // Test deploying hooks for each supported CLI individually
    const supportedCLIs = deploymentManager.supportedCLIs;
    
    for (const cliName of supportedCLIs) {
      console.log(`--- Testing hook deployment for ${cliName} ---`);
      
      // Deploy hooks
      const result = await deploymentManager.deployHooksForCLI(cliName);
      
      if (result) {
        console.log(`âœ?Hooks deployment initiated successfully for ${cliName}`);
        
        // Check if deployment files were created
        const cliHookDir = path.join(deploymentManager.deploymentDir, cliName);
        const hookScriptPath = path.join(cliHookDir, `${cliName}_nodejs_hook.js`);
        const configPath = path.join(cliHookDir, 'config.json');
        
        if (fs.existsSync(hookScriptPath)) {
          console.log(`âœ?Hook script created for ${cliName}: ${hookScriptPath}`);
        } else {
          console.log(`âœ?Hook script NOT created for ${cliName}`);
        }
        
        if (fs.existsSync(configPath)) {
          console.log(`âœ?Config file created for ${cliName}: ${configPath}`);
        } else {
          console.log(`âœ?Config file NOT created for ${cliName}`);
        }
        
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
    
    // List all deployed hooks
    console.log('--- Summary of deployed hooks ---');
    const deployedHooks = await deploymentManager.listDeployedHooks();
    console.log(`Total deployed hooks: ${deployedHooks.length}`);
    deployedHooks.forEach(hook => {
      console.log(`  - ${hook.cli}: ${hook.hookPath}`);
    });
    
    console.log('\n=== Hook deployment script functionality test completed ===');
    
  } catch (error) {
    console.error('Hook deployment script test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testHookDeploymentScripts();
}
