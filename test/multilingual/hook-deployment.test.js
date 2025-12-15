// test/multilingual/hook-deployment.test.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const HookDeploymentManager = require('../../src/core/coordination/nodejs/HookDeploymentManager');

describe('HookDeploymentManager Multilingual Support', () => {
  let deploymentManager;
  let tempDir;

  beforeAll(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stigmergy-test-'));
    deploymentManager = new HookDeploymentManager();
    deploymentManager.deploymentDir = tempDir;
  });

  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should initialize deployment manager', async () => {
    await expect(deploymentManager.initialize()).resolves.toBeUndefined();
    expect(fs.existsSync(tempDir)).toBe(true);
  });

  test('should deploy hooks with multilingual support', async () => {
    const cliName = 'claude';
    const result = await deploymentManager.deployHooksForCLI(cliName);
    expect(result).toBe(true);
    
    // Check that the hook file was created
    const hookDir = path.join(tempDir, cliName);
    const hookFile = path.join(hookDir, `${cliName}_nodejs_hook.js`);
    const configFile = path.join(hookDir, 'config.json');
    
    expect(fs.existsSync(hookDir)).toBe(true);
    expect(fs.existsSync(hookFile)).toBe(true);
    expect(fs.existsSync(configFile)).toBe(true);
    
    // Check that the hook file contains multilingual support
    const hookContent = fs.readFileSync(hookFile, 'utf8');
    expect(hookContent).toContain('LanguagePatternManager');
    expect(hookContent).toContain('detectCrossCLIRequest');
    
    // Check that the hook file contains patterns for multiple languages
    expect(hookContent).toContain('请用');
    expect(hookContent).toContain('使って');
    expect(hookContent).toContain('benutze');
    expect(hookContent).toContain('utilise');
    expect(hookContent).toContain('usa');
    expect(hookContent).toContain('usa'); // Italian
    expect(hookContent).toContain('use'); // Portuguese
    expect(hookContent).toContain('используй'); // Russian
    expect(hookContent).toContain('استخدم'); // Arabic
    expect(hookContent).toContain('kullanarak'); // Turkish
    expect(hookContent).toContain('utiliser'); // French
    expect(hookContent).toContain('usar'); // Spanish
    expect(hookContent).toContain('utilizzare'); // Italian
    expect(hookContent).toContain('verwenden'); // German
    expect(hookContent).toContain('使う'); // Japanese
  });

  test('should validate hook deployment', async () => {
    const cliName = 'gemini';
    await deploymentManager.deployHooksForCLI(cliName);
    
    const validationResult = await deploymentManager.validateHookDeployment(cliName);
    expect(validationResult.valid).toBe(true);
    expect(validationResult.message).toBe('Hook deployment is valid');
  });

  test('should list deployed hooks', async () => {
    const hooks = await deploymentManager.listDeployedHooks();
    expect(Array.isArray(hooks)).toBe(true);
    expect(hooks.length).toBeGreaterThanOrEqual(1);
  });

  test('should undeploy hooks', async () => {
    const cliName = 'claude';
    const result = await deploymentManager.undeployHooksForCLI(cliName);
    expect(result).toBe(true);
    
    const hookDir = path.join(tempDir, cliName);
    expect(fs.existsSync(hookDir)).toBe(false);
  });
});