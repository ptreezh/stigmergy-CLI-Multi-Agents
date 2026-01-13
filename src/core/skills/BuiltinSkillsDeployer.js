/**
 * BuiltinSkillsDeployer - Deploy built-in skills to CLI tools
 * Automatically deploys stigmergy built-in skills during installation
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

class BuiltinSkillsDeployer {
  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'builtin-skills.json');
    this.skillsBaseDir = process.cwd();
  }

  /**
   * Load built-in skills configuration
   */
  loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.warn('[BUILTIN_SKILLS] No built-in skills configuration found');
        return null;
      }

      const content = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('[BUILTIN_SKILLS] Failed to load configuration:', error.message);
      return null;
    }
  }

  /**
   * Deploy built-in skills to all CLI tools
   */
  async deployAll() {
    const config = this.loadConfig();
    if (!config) {
      return { success: false, message: 'No built-in skills configuration found' };
    }

    console.log(`[BUILTIN_SKILLS] Found ${config.skills.length} built-in skill(s)`);

    const results = [];
    for (const skill of config.skills) {
      if (skill.deployment && skill.deployment.autoDeploy) {
        const result = await this.deploySkill(skill);
        results.push(result);
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[BUILTIN_SKILLS] Deployed ${successCount}/${results.length} skill(s)`);

    return { success: true, results };
  }

  /**
   * Deploy a single built-in skill to target CLIs
   */
  async deploySkill(skill) {
    const targetCLIs = skill.deployment.targetCLIs || [];
    const results = [];

    for (const cliName of targetCLIs) {
      const result = await this.deployToCLI(skill, cliName);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    return {
      success: successCount === results.length,
      skillName: skill.name,
      targetCLIs: targetCLIs,
      deployedCount: successCount,
      results
    };
  }

  /**
   * Deploy skill to a specific CLI
   */
  async deployToCLI(skill, cliName) {
    try {
      const cliHomeDir = path.join(os.homedir(), `.${cliName}`);

      // Check if CLI exists
      if (!fs.existsSync(cliHomeDir)) {
        console.warn(`[BUILTIN_SKILLS] CLI not found: ${cliName} (${cliHomeDir})`);
        return { success: false, cliName, skillName: skill.name, error: 'CLI not installed' };
      }

      // Ensure skills directory exists
      const cliSkillsRootDir = path.join(cliHomeDir, 'skills');
      if (!fs.existsSync(cliSkillsRootDir)) {
        try {
          fs.mkdirSync(cliSkillsRootDir, { recursive: true });
        } catch (error) {
          console.error(`[BUILTIN_SKILLS] Failed to create skills root directory for ${cliName}:`, error.message);
          return { success: false, cliName, skillName: skill.name, error: error.message };
        }
      }

      const cliSkillsDir = path.join(cliSkillsRootDir, skill.name);

      // Create skills directory
      if (!fs.existsSync(cliSkillsDir)) {
        try {
          fs.mkdirSync(cliSkillsDir, { recursive: true });
        } catch (error) {
          console.error(`[BUILTIN_SKILLS] Failed to create skills directory for ${cliName}:`, error.message);
          return { success: false, cliName, skillName: skill.name, error: error.message };
        }
      }

      // Get actual Stigmergy installation path for placeholder replacement
      const stigmergyPath = process.cwd();

      // Copy skill files
      const files = skill.deployment.files || [];
      for (const file of files) {
        const sourcePath = path.join(this.skillsBaseDir, file.source);
        const destPath = path.join(cliSkillsDir, path.basename(file.destination));

        if (!fs.existsSync(sourcePath)) {
          console.warn(`[BUILTIN_SKILLS] Source file not found: ${sourcePath}`);
          continue;
        }

        try {
          let content = fs.readFileSync(sourcePath, 'utf8');
          // Replace placeholders with actual paths
          content = content.replace(/\{stigmergy_path\}/g, stigmergyPath);
          fs.writeFileSync(destPath, content);
          console.log(`[BUILTIN_SKILLS] Deployed ${file.source} to ${cliName}`);
        } catch (error) {
          console.error(`[BUILTIN_SKILLS] Failed to copy ${file.source} to ${cliName}:`, error.message);
          return { success: false, cliName, skillName: skill.name, error: error.message };
        }
      }

      return { success: true, cliName, skillName: skill.name };
    } catch (error) {
      console.error(`[BUILTIN_SKILLS] Failed to deploy ${skill.name} to ${cliName}:`, error.message);
      return { success: false, cliName, skillName: skill.name, error: error.message };
    }
  }

  /**
   * Check if a skill is deployed to a CLI
   */
  isDeployed(skillName, cliName) {
    const cliSkillsDir = path.join(os.homedir(), `.${cliName}`, 'skills', skillName);
    return fs.existsSync(cliSkillsDir);
  }

  /**
   * Get deployment status for all built-in skills
   */
  getDeploymentStatus() {
    const config = this.loadConfig();
    if (!config) {
      return null;
    }

    const status = [];
    for (const skill of config.skills) {
      const skillStatus = {
        name: skill.name,
        displayName: skill.displayName,
        version: skill.version,
        deployment: {}
      };

      const targetCLIs = skill.deployment.targetCLIs || [];
      for (const cliName of targetCLIs) {
        skillStatus.deployment[cliName] = this.isDeployed(skill.name, cliName);
      }

      status.push(skillStatus);
    }

    return status;
  }
}

export default BuiltinSkillsDeployer;
