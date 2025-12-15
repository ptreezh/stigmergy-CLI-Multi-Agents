// test/nodejs-hook-deployment.test.js
const HookDeploymentManager = require('../../src/core/coordination/nodejs/HookDeploymentManager.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Node.js Hook Deployment Manager', () => {
  let deploymentManager;
  const testCLI = 'claude';
  const tempDir = path.join(os.tmpdir(), 'stigmergy-test-hooks');

  beforeEach(() => {
    deploymentManager = new HookDeploymentManager();
    deploymentManager.deploymentDir = tempDir;
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('initializes successfully', async () => {
    await deploymentManager.initialize();
    expect(fs.existsSync(tempDir)).toBe(true);
  });

  test('deploys hooks for CLI', async () => {
    await deploymentManager.initialize();
    
    const result = await deploymentManager.deployHooksForCLI(testCLI);
    expect(result).toBe(true);
    
    // Check that hook files were created
    const cliHookDir = path.join(tempDir, testCLI);
    expect(fs.existsSync(cliHookDir)).toBe(true);
    
    const hookFile = path.join(cliHookDir, `${testCLI}_nodejs_hook.js`);
    expect(fs.existsSync(hookFile)).toBe(true);
    
    const configFile = path.join(cliHookDir, 'config.json');
    expect(fs.existsSync(configFile)).toBe(true);
  });

  test('validates hook deployment', async () => {
    await deploymentManager.initialize();
    await deploymentManager.deployHooksForCLI(testCLI);
    
    const validation = await deploymentManager.validateHookDeployment(testCLI);
    expect(validation.valid).toBe(true);
  });

  test('lists deployed hooks', async () => {
    await deploymentManager.initialize();
    await deploymentManager.deployHooksForCLI(testCLI);
    
    const hooks = await deploymentManager.listDeployedHooks();
    expect(hooks).toHaveLength(1);
    expect(hooks[0].cli).toBe(testCLI);
  });

  test('undeploys hooks for CLI', async () => {
    await deploymentManager.initialize();
    await deploymentManager.deployHooksForCLI(testCLI);
    
    const result = await deploymentManager.undeployHooksForCLI(testCLI);
    expect(result).toBe(true);
    
    // Check that hook directory was removed
    const cliHookDir = path.join(tempDir, testCLI);
    expect(fs.existsSync(cliHookDir)).toBe(false);
  });
});
