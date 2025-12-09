// test/nodejs-cli-integration.test.js
const CLIIntegrationManager = require('../../src/core/coordination/nodejs/CLIIntegrationManager.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Node.js CLI Integration Manager', () => {
  let integrationManager;
  const testCLI = 'claude';
  const tempDir = path.join(os.tmpdir(), 'stigmergy-test-integration');

  beforeEach(() => {
    integrationManager = new CLIIntegrationManager();
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('lists supported CLIs', () => {
    const supportedCLIs = integrationManager.supportedCLIs;
    expect(supportedCLIs).toHaveProperty(testCLI);
    expect(Object.keys(supportedCLIs)).toContain(testCLI);
  });

  test('generates Node.js integration script', async () => {
    const script = await integrationManager.getNodeJsIntegrationScript(testCLI);
    expect(script).toContain('Node.js Integration Script for');
    expect(script).toContain(testCLI);
  });

  test('deploys Node.js integration', async () => {
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    const scriptPath = await integrationManager.deployNodeJsIntegration(testCLI, tempDir);
    
    expect(fs.existsSync(scriptPath)).toBe(true);
    expect(scriptPath).toContain(`${testCLI}_nodejs_integration.js`);
  });

  test('gets supported features', async () => {
    const features = await integrationManager.getSupportedFeatures(testCLI);
    expect(features).not.toBeNull();
    expect(features.name).toContain('Claude');
    expect(features.features).toContain('hooks');
  });
});