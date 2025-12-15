/**
 * Test script to reproduce the exact UpgradeManager functionality
 */
const { spawnSync } = require('child_process');
const semver = require('semver');
const { CLI_TOOLS } = require('./src/core/cli_tools');

// Replicate the exact functions in UpgradeManager
function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function getCurrentVersion(toolName, toolConfig) {
  try {
    console.log(`DEBUG: Getting current version for ${toolName} with command: ${toolConfig.version}`);
    
    // The problem might be in how we're calling the version command
    // Let's split it and use it properly
    const [cmd, ...args] = toolConfig.version.split(' ');
    
    const result = spawnSync(cmd, args, {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`DEBUG: Spawn result for ${toolName}: status=${result.status}, error=${result.error ? result.error.message : 'none'}`);
    
    if (result.error) {
      console.log(`DEBUG: Spawn error: ${result.error.message}`);
      throw new Error(`Tool not found: ${result.error.message}`);
    }

    if (result.status !== 0) {
      console.log(`DEBUG: Command failed with stderr: ${result.stderr}`);
      throw new Error(`Version command failed: ${result.stderr}`);
    }

    console.log(`DEBUG: Command succeeded, stdout: ${result.stdout}`);
    
    // Extract version from output
    const versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      console.log(`DEBUG: Version match found: ${versionMatch[1]}`);
      return versionMatch[1];
    }

    console.log(`DEBUG: No version match in output: ${result.stdout}`);
    throw new Error('Could not parse version from output');
  } catch (error) {
    console.log(`DEBUG: Error getting current version for ${toolName}: ${error.message}`);
    return 'Not installed';
  }
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

    console.log(`DEBUG: NPM view result for ${toolName}: status=${result.status}, stderr: ${result.stderr}, stdout: ${result.stdout}`);
    
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
    return 'Unknown';
  }
}

// Test the checkVersions functionality
async function checkVersions() {
  const versions = {};
  const errors = [];

  for (const [toolName, toolConfig] of Object.entries(CLI_TOOLS)) {
    try {
      console.log(`\\n🔍 Checking ${toolName}...`);

      // Get current version
      const currentVersion = await getCurrentVersion(
        toolName,
        toolConfig,
      );

      // Get latest version
      const latestVersion = await getLatestVersion(toolName, toolConfig);

      console.log(`DEBUG: Processing ${toolName} - current: ${currentVersion}, latest: ${latestVersion}`);

      versions[toolName] = {
        current: currentVersion,
        latest: latestVersion,
        needsUpgrade: semver.gt(latestVersion, currentVersion),
        config: toolConfig,
      };

      const status = versions[toolName].needsUpgrade ? 'UP' : 'OK';
      console.log(
        `${status} ${toolName}: ${currentVersion} -> ${latestVersion}`,
      );
    } catch (error) {
      console.log(`ERROR in checkVersions for ${toolName}: ${error.message}`);
      errors.push({ tool: toolName, error: error.message });
      console.log(`❌ ${toolName}: ${error.message}`);
    }
  }

  return { versions, errors };
}

// Run the test
console.log('Testing the checkVersions functionality with async methods...');
checkVersions().then(result => {
  console.log('\\nFinal result:');
  console.log('Versions:', result.versions);
  console.log('Errors:', result.errors);
}).catch(error => {
  console.error('Critical error:', error);
});