/**
 * Test utilities for Stigmergy CLI testing
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Execute CLI command and return result
 */
async function executeCLICommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['src/index.js', command, ...args], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Mock CLI tools for testing
 */
function createMockCLITool(name, version = '1.0.0') {
  const mockPath = path.join(__dirname, '../mocks', name);
  if (!fs.existsSync(path.dirname(mockPath))) {
    fs.mkdirSync(path.dirname(mockPath), { recursive: true });
  }

  const mockScript = `#!/usr/bin/env node
console.log('${name} version ${version}');
`;

  fs.writeFileSync(mockPath, mockScript);
  fs.chmodSync(mockPath, '755');

  return mockPath;
}

/**
 * Clean up mock CLI tools
 */
function cleanupMockCLITools() {
  const mocksDir = path.join(__dirname, '../mocks');
  if (fs.existsSync(mocksDir)) {
    fs.rmSync(mocksDir, { recursive: true, force: true });
  }
}

/**
 * Create temporary config for testing
 */
function createTempConfig(config = {}) {
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const configPath = path.join(tempDir, 'test-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  return configPath;
}

/**
 * Clean up temporary files
 */
function cleanupTempFiles() {
  const tempDir = path.join(__dirname, '../temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

module.exports = {
  executeCLICommand,
  createMockCLITool,
  cleanupMockCLITools,
  createTempConfig,
  cleanupTempFiles
};
