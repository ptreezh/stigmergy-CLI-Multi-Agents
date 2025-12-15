/**
 * Test script to reproduce the upgrade issue
 */
const { spawnSync } = require('child_process');
const { CLI_TOOLS } = require('./src/core/cli_tools');

console.log('Testing upgrade functionality...\n');

// Test the extractPackageName function
function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

// Test getCurrentVersion function
function getCurrentVersion(toolName, toolConfig) {
  try {
    console.log(`Testing current version for ${toolName} with command: ${toolConfig.version}`);
    
    const result = spawnSync(toolConfig.version, {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`Spawn result for ${toolName}: status=${result.status}, error=${result.error ? result.error.message : 'none'}`);
    
    if (result.error) {
      throw new Error(`Tool not found: ${result.error.message}`);
    }

    if (result.status !== 0) {
      console.log(`Command failed with stderr: ${result.stderr}`);
      throw new Error(`Version command failed: ${result.stderr}`);
    }

    // Extract version from output
    const versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return versionMatch[1];
    }

    console.log(`Could not parse version from stdout: ${result.stdout}`);
    throw new Error('Could not parse version from output');
  } catch (error) {
    console.log(`Error getting current version for ${toolName}: ${error.message}`);
    return 'Not installed';
  }
}

// Test getLatestVersion function
function getLatestVersion(toolName, toolConfig) {
  try {
    // Get package name from install command
    const packageName = extractPackageName(toolConfig.install);
    console.log(`For ${toolName}, package name extracted: ${packageName}`);
    
    if (!packageName) {
      throw new Error('Could not extract package name');
    }

    const result = spawnSync('npm', ['view', packageName, 'version'], {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`NPM view result for ${toolName}: status=${result.status}, stderr length=${result.stderr.length}`);
    console.log(`NPM view stdout for ${toolName}: '${result.stdout.trim()}'`);
    
    if (result.status !== 0) {
      console.log(`NPM view failed with stderr: ${result.stderr}`);
      throw new Error(`npm view failed: ${result.stderr}`);
    }

    const latestVersion = result.stdout.trim();
    console.log(`Latest version retrieved for ${toolName}: ${latestVersion}`);
    
    if (latestVersion) {
      return latestVersion;
    }

    throw new Error('No version information available');
  } catch (error) {
    console.log(`Error getting latest version for ${toolName}: ${error.message}`);
    return 'Unknown';
  }
}

// Test each tool
for (const [toolName, toolConfig] of Object.entries(CLI_TOOLS)) {
  console.log(`\n--- Testing ${toolName} ---`);
  console.log(`Install command: ${toolConfig.install}`);
  console.log(`Version command: ${toolConfig.version}`);
  
  const currentVersion = getCurrentVersion(toolName, toolConfig);
  console.log(`Current version result: ${currentVersion}`);
  
  const latestVersion = getLatestVersion(toolName, toolConfig);
  console.log(`Latest version result: ${latestVersion}`);
  
  console.log(`${toolName} - Current: ${currentVersion}, Latest: ${latestVersion}`);
}