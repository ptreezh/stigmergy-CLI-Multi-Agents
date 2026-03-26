/**
 * SkillDependencyEnforcer - 强制技能依赖加载器
 *
 * 核心功能：
 * 1. 加载技能时强制检查并安装依赖
 * 2. 确保 two-agent-loop 作为基础技能被优先加载
 * 3. 递归检查所有依赖
 * 4. 记录依赖树以便追溯
 */

const fs = require("fs");
const path = require("path");

class SkillDependencyEnforcer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.skillReader = options.skillReader || null;
    this.skillManager = options.skillManager || null;

    // 已加载的依赖缓存
    this.loadedDependencies = new Map();

    // 基础技能列表 (必须优先加载)
    this.coreSkills = ["two-agent-loop"];

    // 强制依赖的技能
    this.skillsWithRequiredDeps = new Set([
      "soul-evolution",
      "soul-reflection",
      "soul-compete",
      "soul-co-evolve",
    ]);
  }

  /**
   * 强制加载技能及其所有依赖
   * @param {string} skillName - 技能名称
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 加载结果
   */
  async enforceAndLoad(skillName, options = {}) {
    const { forceReload = false, silent = false } = options;

    if (this.verbose && !silent) {
      console.log(`[DependencyEnforcer] 🔍 强制加载技能: ${skillName}`);
    }

    // 记录加载链
    const loadChain = [];

    // 执行强制依赖加载
    const result = await this._loadWithDependencies(
      skillName,
      loadChain,
      forceReload,
      silent,
    );

    // 如果是 soul 系列技能，额外确保 two-agent-loop 已加载
    if (this.skillsWithRequiredDeps.has(skillName)) {
      await this._ensureCoreSkill("two-agent-loop", silent);
    }

    return result;
  }

  /**
   * 递归加载技能及其依赖
   * @private
   */
  async _loadWithDependencies(skillName, loadChain, forceReload, silent) {
    // 防止循环依赖
    if (loadChain.includes(skillName)) {
      return { success: true, skillName, alreadyLoaded: true };
    }

    loadChain.push(skillName);

    // 检查是否已加载
    if (this.loadedDependencies.has(skillName) && !forceReload) {
      if (this.verbose && !silent) {
        console.log(`[DependencyEnforcer] ✓ 已加载: ${skillName}`);
      }
      return { success: true, skillName, fromCache: true };
    }

    // 获取技能元数据 (包括 requires)
    const metadata = await this._getSkillMetadata(skillName);

    // 检查技能是否存在
    if (!metadata || Object.keys(metadata).length === 0) {
      throw new Error(`技能 '${skillName}' 不存在或无法解析`);
    }

    const requires = metadata.requires || [];

    // 先递归加载所有依赖
    const loadedDeps = [];
    for (const depName of requires) {
      const depResult = await this._loadWithDependencies(
        depName,
        loadChain,
        forceReload,
        silent,
      );
      loadedDeps.push(depResult);
    }

    // 加载技能本身
    const skillData = await this._loadSkillData(skillName, silent);

    // 记录已加载
    this.loadedDependencies.set(skillName, {
      metadata,
      data: skillData,
      dependencies: loadedDeps,
      loadedAt: new Date().toISOString(),
    });

    if (this.verbose && !silent) {
      console.log(
        `[DependencyEnforcer] ✅ 已加载: ${skillName} (依赖: ${requires.join(", ") || "无"})`,
      );
    }

    return {
      success: true,
      skillName,
      metadata,
      dependencies: loadedDeps,
      loadChain: [...loadChain],
    };
  }

  /**
   * 获取技能元数据
   * @private
   */
  async _getSkillMetadata(skillName) {
    // 尝试通过 skillReader 获取
    if (this.skillReader) {
      try {
        const skill = await this.skillReader.findSkill(skillName);
        if (skill) {
          const content = await fs.readFile(skill.path, "utf-8");
          return this.skillReader.parser.parseMetadata(content);
        }
      } catch (e) {
        // 继续尝试其他方式
      }
    }

    // 尝试直接从搜索路径读取
    return this._findAndParseMetadata(skillName);
  }

  /**
   * 查找并解析技能元数据
   * @private
   */
  async _findAndParseMetadata(skillName) {
    const searchPaths = this._getSearchPaths();

    if (this.verbose) {
      console.log(`[DependencyEnforcer] Searching for skill: ${skillName}`);
      console.log(`[DependencyEnforcer] Search paths:`, searchPaths);
    }

    for (const basePath of searchPaths) {
      const skillPath = path.join(basePath, skillName, "SKILL.md");
      if (this.verbose) {
        console.log(`[DependencyEnforcer] Checking: ${skillPath}`);
      }
      try {
        if (fs.existsSync(skillPath)) {
          if (this.verbose) {
            console.log(`[DependencyEnforcer] Found at: ${skillPath}`);
          }
          const content = fs.readFileSync(skillPath, "utf-8");
          const result = this._parseYamlFrontmatter(content);
          if (this.verbose) {
            console.log(`[DependencyEnforcer] Parsed:`, result);
          }
          return result;
        }
      } catch (e) {
        if (this.verbose) {
          console.log(`[DependencyEnforcer] Error: ${e.message}`);
        }
        continue;
      }
    }

    return {};
  }

  /**
   * 解析 YAML frontmatter
   * @private
   */
  _parseYamlFrontmatter(content) {
    // Match YAML frontmatter: --- ... --- (with optional whitespace)
    const match = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (!match) {
      return {};
    }

    const yamlContent = match[1];
    const metadata = {};

    const lines = yamlContent.split("\n");
    let currentKey = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for array item (starts with -)
      if (trimmed.startsWith("-")) {
        const value = trimmed.substring(1).trim();
        if (currentKey) {
          if (!Array.isArray(metadata[currentKey])) {
            metadata[currentKey] = [];
          }
          metadata[currentKey].push(value);
        }
        continue;
      }

      // Check for key: value
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        currentKey = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();

        if (value) {
          // Check if value is a YAML array like [item1, item2]
          if (value.startsWith("[") && value.endsWith("]")) {
            metadata[currentKey] = value
              .slice(1, -1)
              .split(",")
              .map((s) => s.trim());
          } else {
            metadata[currentKey] = value;
          }
        }
      }
    }

    return metadata;
  }

  /**
   * 获取搜索路径
   * @private
   */
  _getSearchPaths() {
    const homedir = require("os").homedir();

    // 解析 superpowers 路径 (处理命令行运行时 __dirname 为 . 的情况)
    let superpowersPath;
    if (__dirname === "." || !__dirname.includes("stigmergy")) {
      superpowersPath = path.join(process.cwd(), "config/superpowers");
    } else {
      superpowersPath = path.join(__dirname, "../../../config/superpowers");
    }

    return [
      path.join(homedir, ".stigmergy", "skills"),
      path.join(homedir, ".claude", "skills"),
      path.join(homedir, ".agent", "skills"),
      path.join(homedir, ".qwen", "skills"),
      path.join(homedir, ".iflow", "skills"),
      path.join(homedir, ".opencode", "skills"),
      superpowersPath,
    ];
  }

  /**
   * 加载技能数据
   * @private
   */
  async _loadSkillData(skillName, silent) {
    if (this.skillReader) {
      try {
        return await this.skillReader.readSkill(skillName);
      } catch (e) {
        // 返回基本信息
        return { name: skillName, content: "" };
      }
    }

    // 直接读取
    const metadata = await this._getSkillMetadata(skillName);
    return { name: skillName, metadata, content: "" };
  }

  /**
   * 确保核心技能已加载
   * @private
   */
  async _ensureCoreSkill(coreSkillName, silent) {
    if (this.loadedDependencies.has(coreSkillName)) {
      return { success: true, alreadyLoaded: true };
    }

    if (this.verbose && !silent) {
      console.log(
        `[DependencyEnforcer] 🔑 确保核心技能已加载: ${coreSkillName}`,
      );
    }

    return this._loadWithDependencies(coreSkillName, [], false, silent);
  }

  /**
   * 检查技能是否有强制依赖
   * @param {string} skillName - 技能名称
   * @returns {Promise<boolean>}
   */
  async hasRequiredDependencies(skillName) {
    const metadata = await this._getSkillMetadata(skillName);
    return (
      metadata.requires &&
      Array.isArray(metadata.requires) &&
      metadata.requires.length > 0
    );
  }

  /**
   * 获取技能的所有依赖树
   * @param {string} skillName - 技能名称
   * @returns {Promise<Object>}
   */
  async getDependencyTree(skillName) {
    const metadata = await this._getSkillMetadata(skillName);
    const requires = metadata.requires || [];

    const tree = {
      name: skillName,
      metadata,
      dependencies: [],
    };

    for (const dep of requires) {
      tree.dependencies.push(await this.getDependencyTree(dep));
    }

    return tree;
  }

  /**
   * 预加载所有 soul 系列技能的依赖
   * @returns {Promise<Object>}
   */
  async preloadSoulDependencies(silent = false) {
    const results = {};

    for (const skillName of this.skillsWithRequiredDeps) {
      results[skillName] = await this.enforceAndLoad(skillName, { silent });
    }

    return results;
  }

  /**
   * 获取已加载的依赖状态
   * @returns {Map}
   */
  getLoadedStatus() {
    return new Map(this.loadedDependencies);
  }
}

module.exports = { SkillDependencyEnforcer };
