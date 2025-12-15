/**
 * More detailed debugging to trace exact point of failure
 */
const { spawnSync } = require('child_process');
const semver = require('semver');

// Mock the extractPackageName function
function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

// Exact copy of the getLatestVersion function from the file
async function getLatestVersion(toolName, toolConfig) {
  console.log(`  getLatestVersion: Starting for ${toolName}`);
  
  try {
    console.log(`  getLatestVersion: Extracting package name from ${toolConfig.install}`);
    const packageName = extractPackageName(toolConfig.install);
    console.log(`  getLatestVersion: Extracted package name: ${packageName}`);
    
    if (!packageName) {
      console.log(`  getLatestVersion: No package name found`);
      throw new Error('Could not extract package name');
    }

    console.log(`  getLatestVersion: Running npm view ${packageName} version`);
    const result = spawnSync('npm', ['view', packageName, 'version'], {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`  getLatestVersion: Spawn result - status: ${result.status}, stdout: "${result.stdout}", stderr: "${result.stderr}"`);
    
    if (result.status !== 0) {
      console.log(`  getLatestVersion: Command failed with stderr: ${result.stderr}`);
      throw new Error(`npm view failed: ${result.stderr}`);
    }

    console.log(`  getLatestVersion: About to assign latestVersion from '${result.stdout.trim()}'`);
    const latestVersion = result.stdout.trim();
    console.log(`  getLatestVersion: Assigned latestVersion: ${latestVersion}`);
    
    if (latestVersion) {
      console.log(`  getLatestVersion: Returning ${latestVersion}`);
      return latestVersion;
    }

    console.log(`  getLatestVersion: No version found, throwing error`);
    throw new Error('No version information available');
  } catch (error) {
    console.log(`  getLatestVersion: Caught error: ${error.message}`);
    console.log(`  getLatestVersion: Error name: ${error.name}`);
    console.log(`  getLatestVersion: Error stack:`, error.stack);
    return 'Unknown';
  }
}

// Mock CLI_TOOLS for testing
const CLI_TOOLS = {
  claude: {
    name: 'Claude CLI',
    version: 'claude --version',
    install: 'npm install -g @anthropic-ai/claude-code',
    hooksDir: 'C:\\Users\\Zhang\\.claude\\hooks',
    config: 'C:\\Users\\Zhang\\.claude\\config.json',
  }
};

async function testGetLatestVersion() {
  console.log('Testing getLatestVersion call directly...');
  
  try {
    console.log('Calling getLatestVersion...');
    const latestVersion = await getLatestVersion('claude', CLI_TOOLS.claude);
    console.log(`Result: ${latestVersion}`);
  } catch (error) {
    console.error(`Error in test: ${error.message}`);
    console.error(`Error stack:`, error.stack);
  }
}

testGetLatestVersion();