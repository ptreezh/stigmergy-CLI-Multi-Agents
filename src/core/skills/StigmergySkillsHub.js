#!/usr/bin/env node

/**
 * Stigmergy Skills Hub
 * Centralized meta-skill management inspired by skills-hub
 *
 * Concept:
 * - Central Repo: ~/.stigmergy/skills-hub/meta-skills/
 * - One copy of each meta-skill
 * - Sync to multiple CLI tools via copy/symlink
 * - JSON-based registry (simple, no SQLite)
 */

const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const MetaSkillTemplateGenerator = require("./MetaSkillTemplateGenerator");

class StigmergySkillsHub {
  constructor(options = {}) {
    this.centralRepo = path.join(os.homedir(), ".stigmergy", "skills-hub");
    this.metaSkillsDir = path.join(this.centralRepo, "meta-skills");
    this.registryPath = path.join(this.centralRepo, "registry.json");
    this.adaptersPath = path.join(
      os.homedir(),
      ".stigmergy",
      "config",
      "tool-adapters.json",
    );

    this.adapters = [];
    this.registry = {
      version: "1.0.0",
      skills: {},
      tools: {},
      lastSync: null,
    };

    this.verbose = options.verbose !== false;
    this.templateGenerator = new MetaSkillTemplateGenerator();
  }

  log(message, level = "INFO") {
    if (this.verbose) {
      const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
      console.log(`[${timestamp}] [${level}] ${message}`);
    }
  }

  /**
   * Initialize the Skills Hub
   */
  async init() {
    this.log("Initializing Stigmergy Skills Hub...", "INFO");

    try {
      // Create directory structure
      await this.createDirectoryStructure();

      // Load adapters
      await this.loadAdapters();

      // Load or create registry
      await this.loadOrCreateRegistry();

      // Verify meta-skills
      await this.verifyMetaSkills();

      this.log("Skills Hub initialized successfully", "OK");
      return true;
    } catch (error) {
      this.log(`Initialization failed: ${error.message}`, "ERROR");
      throw error;
    }
  }

  /**
   * Create directory structure
   */
  async createDirectoryStructure() {
    this.log("Creating directory structure...", "INFO");

    const dirs = [
      this.centralRepo,
      this.metaSkillsDir,
      path.join(os.homedir(), ".stigmergy", "config"),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      this.log(`Created: ${dir}`, "DEBUG");
    }

    this.log("Directory structure created", "OK");
  }

  /**
   * Load tool adapters
   */
  async loadAdapters() {
    this.log("Loading tool adapters...", "INFO");

    try {
      const content = await fs.readFile(this.adaptersPath, "utf8");
      const config = JSON.parse(content);
      this.adapters = config.tools || [];

      // Get default adapters to check for missing tools
      const defaultAdapters = this.getDefaultAdapters();
      const defaultAdapterIds = new Set(
        defaultAdapters.map((adapter) => adapter.id),
      );
      const currentAdapterIds = new Set(
        this.adapters.map((adapter) => adapter.id),
      );

      // Find missing adapters and add them
      const missingAdapters = defaultAdapters.filter(
        (adapter) => !currentAdapterIds.has(adapter.id),
      );

      if (missingAdapters.length > 0) {
        this.adapters = [...this.adapters, ...missingAdapters];
        this.log(`Added ${missingAdapters.length} missing tool adapters`, "OK");

        // Update the config file with the new adapters
        await fs.writeFile(
          this.adaptersPath,
          JSON.stringify({ tools: this.adapters }, null, 2),
          "utf8",
        );
        this.log(
          `Updated config with ${this.adapters.length} tool adapters`,
          "OK",
        );
      }

      this.log(`Loaded ${this.adapters.length} tool adapters`, "OK");
    } catch (error) {
      // Use default adapters if file doesn't exist
      this.adapters = this.getDefaultAdapters();
      await fs.writeFile(
        this.adaptersPath,
        JSON.stringify({ tools: this.adapters }, null, 2),
        "utf8",
      );
      this.log(
        `Created default adapters (${this.adapters.length} tools)`,
        "OK",
      );
    }
  }

  /**
   * Get default tool adapters from CLI_TOOLS configuration
   */
  getDefaultAdapters() {
    const { CLI_TOOLS } = require("../cli_tools");
    const adapters = [];

    for (const [toolId, toolConfig] of Object.entries(CLI_TOOLS)) {
      // Skip resumesession and oh-my-opencode (internal tools)
      if (toolId === "resumesession" || toolId === "oh-my-opencode") {
        continue;
      }

      // Determine config file path for each tool
      let configPath = toolConfig.config;
      if (!configPath) {
        // Fallback to ~/.toolid/config.json
        configPath = path.join(os.homedir(), `.${toolId}`, "config.json");
      }

      // Extract directory from config path for target file
      const configDir = path.dirname(configPath);
      const configFileName = path.basename(configPath, ".json");

      // Convert to uppercase .MD file (e.g., config.json → CONFIG.md)
      const targetFileName = configFileName.toUpperCase() + ".md";
      const targetPath = path.join(configDir, targetFileName);

      // Detect path is the hooks directory or config directory
      const detectPath = toolConfig.hooksDir || configDir;

      // Meta-skill file naming convention
      const metaSkillFile = `using-${toolId}-skills.md`;

      adapters.push({
        id: toolId,
        displayName: toolConfig.name || toolId,
        metaSkillFile,
        targetPath: targetPath.replace(/^~/, "~"), // Ensure ~ is preserved
        detectPath: detectPath.replace(/^~/, "~"),
        injectMode: "prepend",
        enabled: true,
        configPath: configPath.replace(/^~/, "~"),
      });
    }

    return adapters;
  }

  /**
   * Load or create registry
   */
  async loadOrCreateRegistry() {
    this.log("Loading registry...", "INFO");

    try {
      const content = await fs.readFile(this.registryPath, "utf8");
      this.registry = JSON.parse(content);
      this.log("Registry loaded", "OK");
    } catch (error) {
      // Create new registry
      this.registry = {
        version: "1.0.0",
        skills: {},
        tools: {},
        lastSync: null,
      };
      await this.saveRegistry();
      this.log("Registry created", "OK");
    }
  }

  /**
   * Save registry
   */
  async saveRegistry() {
    await fs.writeFile(
      this.registryPath,
      JSON.stringify(this.registry, null, 2),
      "utf8",
    );
  }

  /**
   * Verify meta-skills exist or generate them
   */
  async verifyMetaSkills() {
    this.log("Verifying meta-skills...", "INFO");

    const templateDir = path.join(process.cwd(), "templates");
    const missing = [];
    const generated = [];

    // First, ensure all templates exist (generate if missing)
    const genResults = await this.templateGenerator.generateMissingTemplates(
      this.adapters,
    );

    for (const result of genResults) {
      if (result.template === "generic" && result.created) {
        generated.push(result.tool);
        this.log(`Generated generic template for: ${result.tool}`, "DEBUG");
      }
    }

    if (generated.length > 0) {
      this.log(`Generated ${generated.length} generic templates`, "INFO");
    }

    // Then copy/update all templates to central repo
    for (const adapter of this.adapters) {
      const sourcePath = path.join(templateDir, adapter.metaSkillFile);
      const targetPath = path.join(this.metaSkillsDir, adapter.metaSkillFile);

      try {
        // Check if template exists
        await fs.access(sourcePath);

        // Copy to central repo if not exists or newer
        const needCopy = await this.shouldCopyToCentral(sourcePath, targetPath);
        if (needCopy) {
          await fs.copyFile(sourcePath, targetPath);
          this.log(`Copied: ${adapter.metaSkillFile}`, "DEBUG");

          // Update registry
          const content = await fs.readFile(sourcePath, "utf8");
          const hash = this.hashContent(content);

          this.registry.skills[adapter.metaSkillFile] = {
            hash,
            size: content.length,
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (error) {
        missing.push(adapter.metaSkillFile);
      }
    }

    await this.saveRegistry();

    if (missing.length > 0) {
      this.log(`Missing meta-skills: ${missing.join(", ")}`, "WARN");
    } else {
      this.log(
        `All meta-skills verified (${this.adapters.length} tools)`,
        "OK",
      );
    }
  }

  /**
   * Check if file should be copied to central repo
   */
  async shouldCopyToCentral(source, target) {
    try {
      const sourceStat = await fs.stat(source);
      const targetStat = await fs.stat(target);

      // Copy if source is newer
      return sourceStat.mtime > targetStat.mtime;
    } catch (error) {
      // Target doesn't exist, need to copy
      return true;
    }
  }

  /**
   * Sync meta-skills to all installed tools
   */
  async syncAll(options = {}) {
    this.log("Starting sync to all tools...", "INFO");

    const results = [];
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const adapter of this.adapters) {
      if (!adapter.enabled) {
        this.log(`Skipping disabled tool: ${adapter.id}`, "DEBUG");
        skipCount++;
        continue;
      }

      if (options.force !== true && !(await this.isToolInstalled(adapter))) {
        this.log(`Tool not installed: ${adapter.displayName}`, "WARN");
        skipCount++;
        continue;
      }

      try {
        const result = await this.syncToTool(adapter, options);
        results.push(result);
        if (result.success) {
          successCount++;
          this.log(`✅ Synced to ${adapter.displayName}`, "OK");
        } else {
          errorCount++;
          this.log(
            `❌ Failed to sync to ${adapter.displayName}: ${result.error}`,
            "ERROR",
          );
        }
      } catch (error) {
        errorCount++;
        this.log(
          `❌ Error syncing to ${adapter.displayName}: ${error.message}`,
          "ERROR",
        );
        results.push({
          tool: adapter.id,
          success: false,
          error: error.message,
        });
      }
    }

    this.registry.lastSync = new Date().toISOString();
    await this.saveRegistry();

    this.log(
      `Sync complete: ${successCount} success, ${skipCount} skipped, ${errorCount} errors`,
      "INFO",
    );

    return {
      total: this.adapters.length,
      success: successCount,
      skipped: skipCount,
      errors: errorCount,
      results,
    };
  }

  /**
   * Sync to a specific tool
   */
  async syncToTool(adapter, options = {}) {
    const sourcePath = path.join(this.metaSkillsDir, adapter.metaSkillFile);
    const targetPath = this.expandPath(adapter.targetPath);

    this.log(`Syncing to ${adapter.displayName}...`, "DEBUG");

    try {
      // Read source meta-skill
      const metaSkillContent = await fs.readFile(sourcePath, "utf8");

      // Read target file (or create empty)
      let targetContent = "";
      try {
        targetContent = await fs.readFile(targetPath, "utf8");
      } catch (e) {
        // File doesn't exist, create directory first
        const targetDir = path.dirname(targetPath);
        await fs.mkdir(targetDir, { recursive: true });
      }

      // Remove existing META_SKILL section
      targetContent = targetContent.replace(
        /<!-- META_SKILL_START -->[\s\S]*?<!-- META_SKILL_END -->\n?/g,
        "",
      );

      // Inject new META_SKILL
      const injectedContent = metaSkillContent + "\n\n---\n\n" + targetContent;

      // Write to target
      if (options.dryRun !== true) {
        await fs.writeFile(targetPath, injectedContent, "utf8");
      }

      // Update registry
      const hash = this.hashContent(metaSkillContent);
      this.registry.tools[adapter.id] = {
        metaSkill: adapter.metaSkillFile,
        syncedAt: new Date().toISOString(),
        sourceHash: hash,
      };

      return {
        tool: adapter.id,
        success: true,
        targetPath,
        bytesWritten: injectedContent.length,
      };
    } catch (error) {
      return {
        tool: adapter.id,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if tool is installed
   */
  async isToolInstalled(adapter) {
    const detectPath = this.expandPath(adapter.detectPath);
    try {
      await fs.access(detectPath);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get status of all tools
   */
  async getStatus() {
    this.log("Getting status...", "INFO");

    const status = [];

    for (const adapter of this.adapters) {
      const installed = await this.isToolInstalled(adapter);
      const syncInfo = this.registry.tools[adapter.id];

      status.push({
        id: adapter.id,
        displayName: adapter.displayName,
        enabled: adapter.enabled,
        installed,
        synced: !!syncInfo,
        lastSync: syncInfo?.syncedAt || null,
        metaSkill: adapter.metaSkillFile,
      });
    }

    return status;
  }

  /**
   * Expand ~ in path
   */
  expandPath(p) {
    return p.replace(/^~/, os.homedir());
  }

  /**
   * Calculate content hash
   */
  hashContent(content) {
    return crypto.createHash("md5").update(content).digest("hex");
  }
}

module.exports = StigmergySkillsHub;
