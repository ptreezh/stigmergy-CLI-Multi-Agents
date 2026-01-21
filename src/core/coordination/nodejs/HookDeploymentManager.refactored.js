// src/core/coordination/nodejs/HookDeploymentManager.js
// 重构后的简洁版本 - 核心协调功能
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

// Import specialized generators
const { ResumeSessionGenerator, SkillsIntegrationGenerator, CLIAdapterGenerator } = require('./generators');

class HookDeploymentManager {
  constructor() {
    this.deploymentDir = path.join(os.homedir(), '.stigmergy', 'hooks');
    this.supportedCLIs = [
      'claude',
      'gemini',
      'qwen',
      'iflow',
      'qodercli',
      'codebuddy',
      'codex',
      'copilot',
    ];

    // Initialize generators
    this.resumeSessionGenerator = new ResumeSessionGenerator();
    this.skillsIntegrationGenerator = new SkillsIntegrationGenerator();
    this.cliAdapterGenerator = new CLIAdapterGenerator();
  }

  async initialize() {
    console.log('[HOOK_DEPLOYMENT] Initializing hook deployment manager...');
    await this.ensureDeploymentDirectory();
  }

  async ensureDeploymentDirectory() {
    if (!fs.existsSync(this.deploymentDir)) {
      fs.mkdirSync(this.deploymentDir, { recursive: true });
      console.log(
        `[HOOK_DEPLOYMENT] Created deployment directory: ${this.deploymentDir}`,
      );
    }
  }

  async deployHooksForCLI(cliName, options = {}) {
    console.log(`[HOOK_DEPLOYMENT] Deploying hooks for ${cliName}...`);

    if (!this.supportedCLIs.includes(cliName.toLowerCase())) {
      throw new Error(`Unsupported CLI: ${cliName}`);
    }

    try {
      // Create CLI-specific hook directory
      const cliHookDir = path.join(this.deploymentDir, cliName);
      if (!fs.existsSync(cliHookDir)) {
        fs.mkdirSync(cliHookDir, { recursive: true });
      }

      // Deploy Node.js specific hooks and extensions
      await this.deployNodeJsHooks(cliName, cliHookDir, options);

      console.log(
        `[HOOK_DEPLOYMENT] Hooks deployed successfully for ${cliName}`,
      );
      return true;
    } catch (error) {
      console.error(
        `[HOOK_DEPLOYMENT] Failed to deploy hooks for ${cliName}:`,
        error,
      );
      return false;
    }
  }

  async deployNodeJsHooks(cliName, hookDir, options) {
    console.log(`[HOOK_DEPLOYMENT] Deploying Node.js hooks for ${cliName}...`);

    // Deploy ResumeSession extension
    await this.deployResumeSessionExtension(cliName, hookDir);

    // Deploy Skills integration
    await this.deploySkillsIntegration(cliName, hookDir);

    // Deploy CLI adapter
    await this.deployCLIAdapter(cliName, hookDir);

    // Create basic configuration
    await this.createBasicConfiguration(cliName, hookDir);
  }

  async deployResumeSessionExtension(cliName, hookDir) {
    console.log(`[HOOK_DEPLOYMENT] Deploying ResumeSession extension for ${cliName}...`);

    try {
      const extensionContent = this.resumeSessionGenerator.generateForCLI(cliName);
      const fileName = this.resumeSessionGenerator.getFileName(cliName);
      const extensionPath = path.join(hookDir, fileName);

      fs.writeFileSync(extensionPath, extensionContent);
      console.log(`[HOOK_DEPLOYMENT] Created ResumeSession extension: ${extensionPath}`);

      // Make the extension executable
      try {
        fs.chmodSync(extensionPath, 0o755);
        console.log(`[HOOK_DEPLOYMENT] Made extension executable: ${extensionPath}`);
      } catch (error) {
        console.warn(
          `[HOOK_DEPLOYMENT] Failed to make extension executable: ${error.message}`,
        );
      }

      return true;
    } catch (error) {
      console.error(`[HOOK_DEPLOYMENT] Failed to deploy ResumeSession extension for ${cliName}:`, error);
      return false;
    }
  }

  async deploySkillsIntegration(cliName, hookDir) {
    console.log(`[HOOK_DEPLOYMENT] Deploying skills integration for ${cliName}...`);

    try {
      const skillsResult = this.skillsIntegrationGenerator.generateForCLI(cliName);
      const skillsPath = path.join(hookDir, skillsResult.fileName);

      fs.writeFileSync(skillsPath, skillsResult.content);
      console.log(`[HOOK_DEPLOYMENT] Created skills integration: ${skillsPath}`);

      // Make the skills file executable
      try {
        fs.chmodSync(skillsPath, 0o755);
        console.log(`[HOOK_DEPLOYMENT] Made skills integration executable: ${skillsPath}`);
      } catch (error) {
        console.warn(`[HOOK_DEPLOYMENT] Failed to make skills integration executable: ${error.message}`);
      }

      // Create skills configuration
      const skillsConfig = {
        cli: cliName,
        skillsPath: skillsPath,
        skillsDirectory: path.join(os.homedir(), '.stigmergy', 'skills'),
        deploymentTime: new Date().toISOString(),
        version: '1.0.0-skills'
      };

      const configPath = path.join(hookDir, 'skills-config.json');
      fs.writeFileSync(configPath, JSON.stringify(skillsConfig, null, 2));
      console.log(`[HOOK_DEPLOYMENT] Created skills configuration: ${configPath}`);

      return true;
    } catch (error) {
      console.error(`[HOOK_DEPLOYMENT] Failed to deploy skills integration for ${cliName}:`, error);
      return false;
    }
  }

  async deployCLIAdapter(cliName, hookDir) {
    console.log(`[HOOK_DEPLOYMENT] Deploying CLI adapter for ${cliName}...`);

    try {
      const adapterContent = this.cliAdapterGenerator.generateForCLI(cliName);
      const fileName = this.cliAdapterGenerator.getFileName(cliName);
      const adapterPath = path.join(hookDir, fileName);

      fs.writeFileSync(adapterPath, adapterContent);
      console.log(`[HOOK_DEPLOYMENT] Created CLI adapter: ${adapterPath}`);

      // Make the adapter executable
      try {
        fs.chmodSync(adapterPath, 0o755);
        console.log(`[HOOK_DEPLOYMENT] Made adapter executable: ${adapterPath}`);
      } catch (error) {
        console.warn(`[HOOK_DEPLOYMENT] Failed to make adapter executable: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error(`[HOOK_DEPLOYMENT] Failed to deploy CLI adapter for ${cliName}:`, error);
      return false;
    }
  }

  async createBasicConfiguration(cliName, hookDir) {
    console.log(`[HOOK_DEPLOYMENT] Creating basic configuration for ${cliName}...`);

    try {
      // Create main configuration file
      const config = {
        cli: cliName,
        hookPath: hookDir,
        deploymentTime: new Date().toISOString(),
        version: '1.0.0-nodejs',
        modules: {
          resumeSession: true,
          skillsIntegration: true,
          cliAdapter: true
        }
      };

      const configPath = path.join(hookDir, 'config.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`[HOOK_DEPLOYMENT] Created configuration: ${configPath}`);

      return true;
    } catch (error) {
      console.error(`[HOOK_DEPLOYMENT] Failed to create configuration for ${cliName}:`, error);
      return false;
    }
  }

  async deployHooksForAllCLIs(options = {}) {
    console.log('[HOOK_DEPLOYMENT] Deploying hooks for all supported CLIs...');

    const results = [];
    for (const cliName of this.supportedCLIs) {
      const success = await this.deployHooksForCLI(cliName, options);
      results.push({ cli: cliName, success });
    }

    const successful = results.filter(r => r.success).length;
    console.log(
      `[HOOK_DEPLOYMENT] Deployment complete: ${successful}/${this.supportedCLIs.length} CLIs configured`,
    );

    return results;
  }

  async getDeployedHooks() {
    try {
      const cliDirs = fs.readdirSync(this.deploymentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      const hooks = [];
      for (const cliName of cliDirs) {
        const configPath = path.join(this.deploymentDir, cliName, 'config.json');
        if (fs.existsSync(configPath)) {
          try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            hooks.push(config);
          } catch (error) {
            console.warn(
              `[HOOK_DEPLOYMENT] Failed to read config for ${cliName}:`,
              error.message,
            );
          }
        }
      }

      return hooks;
    } catch (error) {
      console.error('[HOOK_DEPLOYMENT] Failed to get deployed hooks:', error);
      return [];
    }
  }

  async validateHookDeployment(cliName) {
    console.log(
      `[HOOK_DEPLOYMENT] Validating hook deployment for ${cliName}...`,
    );

    const cliHookDir = path.join(this.deploymentDir, cliName);
    if (!fs.existsSync(cliHookDir)) {
      return { valid: false, error: 'Hook directory not found' };
    }

    const configPath = path.join(cliHookDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return { valid: false, error: 'Configuration file not found' };
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Validate that all expected modules are present
      const expectedModules = ['resumeSession', 'skillsIntegration', 'cliAdapter'];
      if (!config.modules) {
        return { valid: false, error: 'Module configuration not found' };
      }

      for (const module of expectedModules) {
        if (!config.modules[module]) {
          return { valid: false, error: `Module ${module} not configured` };
        }
      }

      return {
        valid: true,
        message: 'Hook deployment is valid',
        modules: config.modules
      };
    } catch (error) {
      return { valid: false, error: `Failed to validate deployment: ${error.message}` };
    }
  }

  async validateAllDeployments() {
    console.log('[HOOK_DEPLOYMENT] Validating all hook deployments...');

    const results = [];
    for (const cliName of this.supportedCLIs) {
      const validation = await this.validateHookDeployment(cliName);
      results.push({ cli: cliName, ...validation });
    }

    const valid = results.filter(r => r.valid).length;
    console.log(
      `[HOOK_DEPLOYMENT] Validation complete: ${valid}/${this.supportedCLIs.length} deployments valid`,
    );

    return results;
  }

  getDeploymentStatus() {
    return {
      deploymentDir: this.deploymentDir,
      supportedCLIs: this.supportedCLIs,
      initialized: fs.existsSync(this.deploymentDir)
    };
  }
}

module.exports = HookDeploymentManager;