/**
 * SkillSyncManager - Sync skills from Stigmergy to all CLI tools
 *
 * This manager synchronizes skills installed in Stigmergy (~/.stigmergy/skills/)
 * to all AI CLI tools that support skills (~/.cli-name/skills/)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SkillSyncManager {
  constructor(options = {}) {
    this.stigmergySkillsDir = options.stigmergySkillsDir || path.join(os.homedir(), '.stigmergy/skills');

    // All CLI tools that support skills
    this.cliTools = [
      'claude',
      'codex',
      'iflow',
      'qwen',
      'qodercli',
      'codebuddy',
      'opencode'
      // Add more as they become available
    ];
  }

  /**
   * Sync a single skill to all CLI tools
   * @param {string} skillName - Name of the skill to sync
   * @param {Object} options - Sync options
   * @returns {Promise<Object>} Sync result
   */
  async syncSkill(skillName, options = {}) {
    const skillPath = path.join(this.stigmergySkillsDir, skillName);

    // Check if skill exists
    if (!fs.existsSync(skillPath)) {
      throw new Error(`Skill '${skillName}' not found in ${this.stigmergySkillsDir}`);
    }

    console.log(`\n[SYNC] Syncing '${skillName}' to all CLI tools...\n`);

    const results = [];
    let successful = 0;
    let skipped = 0;

    for (const cliName of this.cliTools) {
      // Check if CLI should be excluded
      if (options.exclude && options.exclude.includes(cliName)) {
        console.log(`  ⊘ ${cliName}: skipped (excluded)`);
        skipped++;
        continue;
      }

      // Check if should sync to specific CLIs only
      if (options.clis && !options.clis.includes(cliName)) {
        continue;
      }

      const result = await this.syncSkillToCLI(skillPath, skillName, cliName, options);
      results.push(result);

      if (result.success) {
        successful++;
      }
    }

    console.log(`\n✓ Synced to ${successful}/${this.cliTools.length} CLI tools`);

    if (skipped > 0) {
      console.log(`  ⊘ Skipped ${skipped} CLI tools`);
    }

    return {
      skillName,
      totalCLIs: this.cliTools.length,
      successful,
      skipped,
      results
    };
  }

  /**
   * Sync skill to a specific CLI tool
   * @param {string} skillPath - Path to the skill directory
   * @param {string} skillName - Name of the skill
   * @param {string} cliName - Name of the CLI tool
   * @param {Object} options - Options
   * @returns {Promise<Object>} Result object
   */
  async syncSkillToCLI(skillPath, skillName, cliName, options = {}) {
    const cliHomeDir = path.join(os.homedir(), `.${cliName}`);
    const cliSkillsDir = path.join(cliHomeDir, 'skills');
    const targetPath = path.join(cliSkillsDir, skillName);

    // Dry run mode
    if (options.dryRun) {
      return {
        success: true,
        cliName,
        dryRun: true,
        reason: 'Dry run - would sync'
      };
    }

    // Check if CLI is installed
    if (!fs.existsSync(cliHomeDir)) {
      return {
        success: false,
        cliName,
        reason: 'CLI not installed'
      };
    }

    try {
      // Create skills directory if it doesn't exist
      if (!fs.existsSync(cliSkillsDir)) {
        fs.mkdirSync(cliSkillsDir, { recursive: true });
      }

      // Remove existing skill if force option is enabled
      if (options.force && fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      // Check if skill already exists
      if (fs.existsSync(targetPath) && !options.force) {
        return {
          success: false,
          cliName,
          reason: 'Skill already exists (use --force to overwrite)'
        };
      }

      // Copy skill directory
      this.copyDirectory(skillPath, targetPath);

      return {
        success: true,
        cliName,
        targetPath
      };

    } catch (error) {
      return {
        success: false,
        cliName,
        error: error.message
      };
    }
  }

  /**
   * Sync all installed skills to all CLI tools
   * @param {Object} options - Sync options
   * @returns {Promise<Array>} Array of sync results
   */
  async syncAll(options = {}) {
    const skills = await this.listInstalledSkills();

    if (skills.length === 0) {
      console.log('[SYNC] No skills found to sync');
      console.log('Install skills first: stigmergy skill install <source>');
      return [];
    }

    console.log(`\n[SYNC] Found ${skills.length} skill(s) to sync\n`);

    const results = [];

    for (const skill of skills) {
      console.log(`\n📦 ${skill.name}:`);
      const result = await this.syncSkill(skill.name, options);
      results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Sync Summary');
    console.log('='.repeat(60));

    const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
    const totalPossible = results.reduce((sum, r) => sum + r.totalCLIs, 0);

    console.log(`Total Skills: ${results.length}`);
    console.log(`Successful Syncs: ${totalSuccessful}/${totalPossible}`);
    console.log(`Success Rate: ${((totalSuccessful / totalPossible) * 100).toFixed(1)}%\n`);

    return results;
  }

  /**
   * List all installed skills in Stigmergy
   * @returns {Promise<Array>} Array of skill objects
   */
  async listInstalledSkills() {
    const skills = [];

    if (!fs.existsSync(this.stigmergySkillsDir)) {
      return skills;
    }

    const entries = fs.readdirSync(this.stigmergySkillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(this.stigmergySkillsDir, entry.name);
        const skillMdPath = path.join(skillPath, 'SKILL.md');

        if (fs.existsSync(skillMdPath)) {
          // Try to read metadata
          try {
            const content = fs.readFileSync(skillMdPath, 'utf8');
            const metadata = this.parseMetadata(content);

            skills.push({
              name: entry.name,
              path: skillPath,
              ...metadata
            });
          } catch {
            // If metadata parsing fails, use basic info
            skills.push({
              name: entry.name,
              path: skillPath,
              description: 'No description'
            });
          }
        }
      }
    }

    return skills;
  }

  /**
   * Check deployment status of a skill across all CLI tools
   * @param {string} skillName - Name of the skill
   * @returns {Object} Deployment status
   */
  checkDeploymentStatus(skillName) {
    const status = {};

    for (const cliName of this.cliTools) {
      const cliSkillsDir = path.join(os.homedir(), `.${cliName}`, 'skills');
      const skillPath = path.join(cliSkillsDir, skillName);
      const cliHomeDir = path.join(os.homedir(), `.${cliName}`);

      status[cliName] = {
        deployed: fs.existsSync(skillPath),
        cliInstalled: fs.existsSync(cliHomeDir),
        path: skillPath
      };
    }

    return status;
  }

  /**
   * Get full deployment status report
   * @returns {Promise<Object>} Full report
   */
  async getFullStatusReport() {
    const skills = await this.listInstalledSkills();
    const report = {
      totalSkills: skills.length,
      totalCLIs: this.cliTools.length,
      skills: {}
    };

    for (const skill of skills) {
      report.skills[skill.name] = this.checkDeploymentStatus(skill.name);
    }

    return report;
  }

  /**
   * Parse metadata from SKILL.md
   * @param {string} content - SKILL.md content
   * @returns {Object} Metadata object
   */
  parseMetadata(content) {
    const metadata = {
      name: '',
      description: '',
      version: '1.0.0'
    };

    // Parse title (first # heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.name = titleMatch[1].trim();
    }

    // Parse description (first paragraph after title)
    const descMatch = content.match(/^#\s+.+\n\n(.+?)\n/);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    // Parse version from frontmatter if present
    const versionMatch = content.match(/version:\s*(.+)/i);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }

    return metadata;
  }

  /**
   * Recursively copy directory
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Remove skill from specific CLI tool
   * @param {string} skillName - Name of the skill
   * @param {string} cliName - Name of the CLI tool
   * @returns {boolean} Success status
   */
  removeFromCLI(skillName, cliName) {
    const cliSkillsDir = path.join(os.homedir(), `.${cliName}`, 'skills');
    const skillPath = path.join(cliSkillsDir, skillName);

    if (fs.existsSync(skillPath)) {
      fs.rmSync(skillPath, { recursive: true, force: true });
      console.log(`✓ Removed '${skillName}' from ${cliName}`);
      return true;
    }

    return false;
  }

  /**
   * Remove skill from all CLI tools
   * @param {string} skillName - Name of the skill
   * @returns {Object} Removal results
   */
  removeAll(skillName) {
    console.log(`\n[REMOVE] Removing '${skillName}' from all CLI tools...\n`);

    const results = [];

    for (const cliName of this.cliTools) {
      const removed = this.removeFromCLI(skillName, cliName);
      results.push({
        cliName,
        removed
      });
    }

    const removedCount = results.filter(r => r.removed).length;
    console.log(`\n✓ Removed from ${removedCount}/${this.cliTools.length} CLI tools`);

    return {
      skillName,
      totalCLIs: this.cliTools.length,
      removed: removedCount,
      results
    };
  }
}

module.exports = SkillSyncManager;