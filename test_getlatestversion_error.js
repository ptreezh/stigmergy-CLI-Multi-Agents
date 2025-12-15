/**
 * Test script to identify the exact error in getLatestVersion method
 */
const { spawnSync } = require('child_process');
const semver = require('semver');
const { CLI_TOOLS } = require('./src/core/cli_tools');

// Replicate the exact getLatestVersion function from UpgradeManager
function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function getLatestVersion(toolName, toolConfig) {
  try {
    console.log(`DEBUG: Getting latest version for ${toolName}, install command: ${toolConfig.install}`);
    
    // Get package name from install command
    const packageName = extractPackageName(toolConfig.install);
    console.log(`DEBUG: Package name extracted: ${packageName}`);
    
    if (!packageName) {
      throw new Error('Could not extract package name');
    }

    const result = spawnSync('npm', ['view', packageName, 'version'], {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`DEBUG: NPM view result for ${toolName}: status=${result.status}`);
    console.log(`DEBUG: NPM view stderr for ${toolName}: ${result.stderr}`);
    console.log(`DEBUG: NPM view stdout for ${toolName}: ${result.stdout}`);
    
    if (result.status !== 0) {
      console.log(`DEBUG: NPM view failed with stderr: ${result.stderr}`);
      throw new Error(`npm view failed: ${result.stderr}`);
    }

    const latestVersion = result.stdout.trim();
    console.log(`DEBUG: Latest version retrieved: ${latestVersion}`);
    
    if (latestVersion) {
      return latestVersion;
    }

    throw new Error('No version information available');
  } catch (error) {
    console.log(`DEBUG: Error getting latest version for ${toolName}: ${error.message}`);
    console.log(`DEBUG: Error object:`, error);
    return 'Unknown';
  }
}

// Test just one tool to see the specific error
console.log('Testing getLatestVersion method with Claude CLI:');
getLatestVersion('claude', CLI_TOOLS.claude)
  .then(result => {
    console.log(`Result: ${result}`);
  })
  .catch(error => {
    console.error(`Caught error: ${error.message}`);
    console.error(`Error object:`, error);
  });