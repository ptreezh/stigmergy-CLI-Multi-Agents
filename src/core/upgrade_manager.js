/**
 * Stigmergy CLI Upgrade Manager
 * 管理所有AI CLI 工具的升级和依赖更新
 */

const { spawn, spawnSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const chalk = require("chalk");
const semver = require("semver");
const { CLI_TOOLS } = require("./cli_tools");
const { errorHandler } = require("./error_handler");

class UpgradeManager {
  constructor() {
    this.cliTools = CLI_TOOLS;
    this.cacheDir = path.join(os.homedir(), ".stigmergy", "cache");
    this.upgradeLog = path.join(os.homedir(), ".stigmergy", "upgrade.log");
  }

  async initialize() {
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  /**
   * 检查CLI 工具的当前版本和最新版本
   */
  async checkVersions() {
    const versions = {};
    const errors = [];

    for (const [toolName, toolConfig] of Object.entries(this.cliTools)) {
      try {
        console.log(`🔍 Checking ${toolName}...`);

        // 获取当前版本
        const currentVersion = await this.getCurrentVersion(
          toolName,
          toolConfig,
        );

        // 获取最新版本
        let latestVersion;
        try {
          latestVersion = await this.getLatestVersion(toolName, toolConfig);
        } catch (versionError) {
          console.error(
            `Error retrieving latest version for ${toolName}:`,
            versionError.message,
          );
          latestVersion = "Unknown";
        }

        // Only perform semver comparison if both versions are valid semantic versions
        let needsUpgrade = false;
        if (
          currentVersion !== "Not installed" &&
          latestVersion !== "Unknown" &&
          semver.valid(currentVersion) &&
          semver.valid(latestVersion)
        ) {
          needsUpgrade = semver.gt(latestVersion, currentVersion);
        }

        versions[toolName] = {
          current: currentVersion,
          latest: latestVersion,
          needsUpgrade: needsUpgrade,
          config: toolConfig,
        };

        const status = versions[toolName].needsUpgrade ? "UP" : "OK";
        console.log(
          `${status} ${toolName}: ${currentVersion} -> ${latestVersion}`,
        );
      } catch (error) {
        errors.push({ tool: toolName, error: error.message });
        console.log(`❌ ${toolName}: ${error.message}`);
      }
    }

    return { versions, errors };
  }

  /**
   * 获取当前安装的版本
   */
  async getCurrentVersion(toolName, toolConfig) {
    try {
      const result = spawnSync(toolConfig.version, {
        shell: true,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      if (result.error) {
        throw new Error(`Tool not found: ${result.error.message}`);
      }

      if (result.status !== 0) {
        throw new Error(`Version command failed: ${result.stderr}`);
      }

      // 从输出中提取版本
      const versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        return versionMatch[1];
      }

      throw new Error("Could not parse version from output");
    } catch (error) {
      return "Not installed";
    }
  }

  /**
   * 获取最新可用版本
   */
  async getLatestVersion(toolName, toolConfig) {
    try {
      // 从 npm 注册表获取最新版本
      const packageName = this.extractPackageName(toolConfig.install);
      if (!packageName) {
        throw new Error("Could not extract package name");
      }

      const result = spawnSync("npm", ["view", packageName, "version"], {
        shell: true,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      // Check for execution errors
      if (result.error) {
        throw new Error(
          `npm command execution failed: ${result.error.message}`,
        );
      }

      if (result.status !== 0) {
        throw new Error(`npm view failed: ${result.stderr || "Unknown error"}`);
      }

      const latestVersion = result.stdout.trim();
      if (latestVersion) {
        return latestVersion;
      }

      throw new Error("No version information available");
    } catch (error) {
      // Log the actual error for debugging, but return 'Unknown' to prevent crashes
      console.error(
        `Error getting latest version for ${toolName}:`,
        error.message,
      );
      return "Unknown";
    }
  }

  /**
   * 从安装命令中提取包名
   */
  extractPackageName(installCommand) {
    const match = installCommand.match(/npm install -g (.+)/);
    if (match) {
      return match[1];
    }
    return null;
  }

  /**
   * 检查过时的依赖和警告
   */
  async checkDeprecations() {
    const deprecations = [];

    try {
      // 检查npm 警告
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (await this.fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        // 检查各个依赖的版本
        for (const [dep, version] of Object.entries(
          packageJson.dependencies || {},
        )) {
          const issues = await this.checkDependencyIssues(dep, version);
          if (issues.length > 0) {
            deprecations.push({ dependency: dep, version, issues });
          }
        }
      }

      // 检查ImportProcessor 错误
      const importProcessorErrors = await this.checkImportProcessorErrors();
      if (importProcessorErrors.length > 0) {
        deprecations.push({
          type: "ImportProcessor",
          issues: importProcessorErrors,
        });
      }
    } catch (error) {
      deprecations.push({
        type: "General",
        issues: [error.message],
      });
    }

    return deprecations;
  }

  /**
   * 检查特定依赖的问题
   */
  async checkDependencyIssues(dependency, version) {
    const issues = [];

    // 已知的过时包列表
    const deprecatedPackages = {
      inflight: "Use lru-cache instead",
      rimraf: "Use rimraf v4+",
      "glob@7": "Use glob v9+",
      "eslint@8": "Use eslint v9+",
    };

    for (const [deprecated, reason] of Object.entries(deprecatedPackages)) {
      if (
        dependency === deprecated ||
        dependency.startsWith(deprecated + "@")
      ) {
        issues.push(`Deprecated: ${reason}`);
      }
    }

    return issues;
  }

  /**
   * 检查ImportProcessor 相关错误
   */
  async checkImportProcessorErrors() {
    const errors = [];

    try {
      // 检查常见的 ImportProcessor 位置
      const commonPaths = [
        path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules"),
        path.join(os.homedir(), ".npm", "modules"),
        "/usr/local/lib/node_modules",
      ];

      for (const npmPath of commonPaths) {
        try {
          const importProcessorPath = path.join(
            npmPath,
            "**",
            "*ImportProcessor*",
          );
          const result = spawnSync("find", [importProcessorPath], {
            shell: true,
            encoding: "utf8",
          });

          if (result.stdout.trim()) {
            errors.push(`Found ImportProcessor in: ${npmPath}`);
          }
        } catch (error) {
          // 忽略路径不存在的错误
        }
      }
    } catch (error) {
      errors.push(`Error checking ImportProcessor: ${error.message}`);
    }

    return errors;
  }

  /**
   * 生成升级计划
   */
  async generateUpgradePlan(options = {}) {
    const { dryRun = false, force = false } = options;

    console.log("📋 Generating upgrade plan...");

    const { versions, errors } = await this.checkVersions();
    const deprecations = await this.checkDeprecations();

    const plan = {
      timestamp: new Date().toISOString(),
      upgrades: [],
      fixes: [],
      warnings: [],
      errors: [],
    };

    // 添加 CLI 工具升级计划
    for (const [toolName, info] of Object.entries(versions)) {
      if (info.needsUpgrade || force) {
        plan.upgrades.push({
          tool: toolName,
          from: info.current,
          to: info.latest,
          command: info.config.install,
        });
      }
    }

    // 添加修复计划
    for (const deprecation of deprecations) {
      if (deprecation.type === "ImportProcessor") {
        plan.fixes.push({
          type: "ImportProcessor",
          description: "Remove or reinstall affected CLI tools",
          actions: [
            "npm uninstall -g @google/gemini-cli",
            "npm cache clean --force",
            "npm install -g @google/gemini-cli@latest",
          ],
        });
      } else {
        plan.fixes.push({
          type: "Dependency",
          dependency: deprecation.dependency,
          description: deprecation.issues.join(", "),
          actions: [`Update ${deprecation.dependency} to latest version`],
        });
      }
    }

    // 添加警告
    if (errors.length > 0) {
      plan.warnings = errors;
    }

    return plan;
  }

  /**
   * 执行升级
   */
  async executeUpgrade(plan, options = {}) {
    const { dryRun = false, force = false } = options;

    console.log("🚀 Executing upgrade plan...");

    const results = {
      successful: [],
      failed: [],
      skipped: [],
    };

    if (dryRun) {
      console.log("🔍 DRY RUN MODE - No actual changes will be made");
    }

    // 升级 CLI 工具
    for (const upgrade of plan.upgrades) {
      if (!dryRun) {
        try {
          console.log(`⬆️  Upgrading ${upgrade.tool}...`);

          const result = spawnSync(
            "npm",
            ["install", "-g", upgrade.command.split(" ").pop()],
            {
              shell: true,
              stdio: "inherit",
            },
          );

          if (result.status === 0) {
            results.successful.push(upgrade);
            console.log(`✅${upgrade.tool} upgraded successfully`);
          } else {
            results.failed.push({ ...upgrade, error: "Installation failed" });
            console.log(`❌${upgrade.tool} upgrade failed`);
          }
        } catch (error) {
          results.failed.push({ ...upgrade, error: error.message });
          console.log(`❌${upgrade.tool} upgrade failed: ${error.message}`);
        }
      } else {
        console.log(
          `🔍 Would upgrade ${upgrade.tool}: ${upgrade.from} -> ${upgrade.to}`,
        );
        results.successful.push(upgrade);
      }
    }

    // 修复问题
    for (const fix of plan.fixes) {
      if (!dryRun) {
        try {
          console.log(`🔧 Fixing ${fix.type} issues...`);

          if (fix.type === "ImportProcessor" && force) {
            // 执行 ImportProcessor 修复
            for (const action of fix.actions) {
              if (action.includes("npm")) {
                const result = spawnSync(action, {
                  shell: true,
                  stdio: "inherit",
                });
                if (result.status !== 0) {
                  throw new Error(`Failed to execute: ${action}`);
                }
              }
            }
            results.successful.push(fix);
          }
        } catch (error) {
          results.failed.push({ ...fix, error: error.message });
        }
      } else {
        console.log(`🔍 Would fix ${fix.type}: ${fix.description}`);
        results.successful.push(fix);
      }
    }

    return results;
  }

  /**
   * 记录升级日志
   */
  async logUpgrade(plan, results) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      plan,
      results,
    };

    try {
      await fs.appendFile(
        this.upgradeLog,
        JSON.stringify(logEntry, null, 2) + "\n",
      );
    } catch (error) {
      console.warn("Warning: Could not write upgrade log:", error.message);
    }
  }

  /**
   * 辅助方法：检查文件是否存在
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = UpgradeManager;
