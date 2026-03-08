/**
 * Plugin Deployer - 统一插件部署系统
 * 整合 HookManager 和 ContextInjector，提供完整的插件部署功能
 *
 * 功能：
 * 1. 部署插件到多个 CLI
 * 2. 配置 hooks 和上下文注入
 * 3. 管理插件生命周期
 * 4. 验证部署状态
 */

const HookManager = require("./HookManager");
const ContextInjector = require("./ContextInjector");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

class PluginDeployer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.hookManager = new HookManager(options);
    this.contextInjector = new ContextInjector(options);
  }

  /**
   * 部署 superpowers 插件到指定 CLI
   */
  async deploySuperpowers(cliName, options = {}) {
    console.log(`\n🚀 Deploying superpowers to ${cliName}...`);

    const { skills = [], hooks = {}, contextInjection = true } = options;

    const results = {
      hooks: false,
      context: false,
      skills: false,
    };

    // 1. 部署 hooks
    if (Object.keys(hooks).length > 0) {
      try {
        await this.deployHooks(cliName, hooks);
        results.hooks = true;
      } catch (error) {
        console.log(`  ❌ Failed to deploy hooks: ${error.message}`);
      }
    }

    // 2. 注入上下文
    if (contextInjection) {
      try {
        await this.injectContext(cliName, skills);
        results.context = true;
      } catch (error) {
        console.log(`  ❌ Failed to inject context: ${error.message}`);
      }
    }

    // 3. 部署技能文件
    if (skills.length > 0) {
      try {
        await this.deploySkillFiles(cliName, skills);
        results.skills = true;
      } catch (error) {
        console.log(`  ❌ Failed to deploy skill files: ${error.message}`);
      }
    }

    const allSuccess = results.hooks && results.context && results.skills;

    if (allSuccess) {
      console.log(`✅ Successfully deployed superpowers to ${cliName}\n`);
    } else {
      console.log(`⚠️  Partially deployed to ${cliName}:`, results, "\n");
    }

    return results;
  }

  /**
   * 部署 hooks 到 CLI
   */
  async deployHooks(cliName, hooksConfig) {
    console.log(`  📋 Deploying hooks...`);

    // 创建 hooks 配置
    await this.hookManager.createHooksConfig(cliName, hooksConfig);

    // 创建 hook 实现文件
    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      let hookContent;

      // 根据钩子类型生成实现
      if (hookName === "sessionStart" || hookName === "session-start") {
        hookContent = this.hookManager.generateSessionStartHook(cliName);
      } else {
        // 通用钩子模板
        hookContent = this._generateGenericHook(cliName, hookName, hookConfig);
      }

      await this.hookManager.createHookImplementation(
        cliName,
        hookName,
        hookContent,
      );
    }
  }

  /**
   * 注入上下文到 CLI
   */
  async injectContext(cliName, skills) {
    console.log(`  💉 Injecting context...`);

    // 获取技能列表
    const skillList = await this._getSkillList(cliName, skills);

    // 注入上下文
    await this.contextInjector.injectContext(cliName, skillList, {
      priority: 1,
      title: "Stigmergy Skills",
    });
  }

  /**
   * 部署技能文件到 CLI
   */
  async deploySkillFiles(cliName, skills) {
    console.log(`  📦 Deploying skill files...`);

    const skillsDir = path.join(os.homedir(), `.${cliName}`, "skills");

    // 确保目录存在
    await fs.mkdir(skillsDir, { recursive: true });

    for (const skill of skills) {
      const skillName = typeof skill === "string" ? skill : skill.name;
      const skillDir = path.join(skillsDir, skillName);

      // 创建技能目录
      await fs.mkdir(skillDir, { recursive: true });

      // 检查技能文件是否存在
      const sourceSkillFile = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "skills",
        skillName,
        "skill.md",
      );

      try {
        await fs.access(sourceSkillFile);

        // 读取技能内容
        const skillContent = await fs.readFile(sourceSkillFile, "utf8");

        // 写入目标位置（支持 skill.md 和 SKILL.md）
        const targetSkillFile = path.join(skillDir, "skill.md");
        await fs.writeFile(targetSkillFile, skillContent, "utf8");

        if (this.verbose) {
          console.log(`    ✅ Deployed: ${skillName}`);
        }
      } catch (error) {
        if (this.verbose) {
          console.log(`    ⚠️  Skipped: ${skillName} (${error.message})`);
        }
      }
    }
  }

  /**
   * 从 superpowers 移除部署
   */
  async undeploySuperpowers(cliName) {
    console.log(`\n🗑️  Removing superpowers from ${cliName}...`);

    const results = {
      hooks: false,
      context: false,
      skills: false,
    };

    // 1. 移除 hooks
    try {
      await this.undeployHooks(cliName);
      results.hooks = true;
    } catch (error) {
      console.log(`  ❌ Failed to remove hooks: ${error.message}`);
    }

    // 2. 移除上下文注入
    try {
      await this.contextInjector.removeContext(cliName);
      results.context = true;
    } catch (error) {
      console.log(`  ❌ Failed to remove context: ${error.message}`);
    }

    // 3. 移除技能文件
    try {
      await this.undeploySkillFiles(cliName);
      results.skills = true;
    } catch (error) {
      console.log(`  ❌ Failed to remove skill files: ${error.message}`);
    }

    const allSuccess = results.hooks && results.context && results.skills;

    if (allSuccess) {
      console.log(`✅ Successfully removed superpowers from ${cliName}\n`);
    } else {
      console.log(`⚠️  Partially removed from ${cliName}:`, results, "\n");
    }

    return results;
  }

  /**
   * 移除 hooks
   */
  async undeployHooks(cliName) {
    console.log(`  🗑️  Removing hooks...`);

    // 移除 hooks.json 中的配置
    await this.hookManager.removeHooksConfig(cliName, [
      "sessionStart",
      "session-start",
    ]);

    // 移除 hook 实现文件
    const hooksDir = path.join(os.homedir(), `.${cliName}`, "hooks");

    try {
      const hookFiles = [
        "sessionStart.js",
        "session-start.js",
        "session-start.ts",
      ];

      for (const hookFile of hookFiles) {
        const hookPath = path.join(hooksDir, hookFile);

        try {
          await fs.access(hookPath);
          await fs.rm(hookPath);

          if (this.verbose) {
            console.log(`    ✅ Removed: ${hookFile}`);
          }
        } catch {
          // 文件不存在，跳过
        }
      }
    } catch (error) {
      if (this.verbose) {
        console.log(`    ⚠️  Failed to remove hook files: ${error.message}`);
      }
    }
  }

  /**
   * 移除技能文件
   */
  async undeploySkillFiles(cliName) {
    console.log(`  🗑️  Removing skill files...`);

    const skillsDir = path.join(os.homedir(), `.${cliName}`, "skills");

    try {
      // 读取技能目录
      const skillDirs = await fs.readdir(skillsDir);

      for (const skillDir of skillDirs) {
        // 只移除使用 superpowers 的技能
        const skillPath = path.join(skillsDir, skillDir, "skill.md");

        try {
          const content = await fs.readFile(skillPath, "utf8");

          // 检查是否是 superpowers 技能
          if (
            content.includes("name: using-superpowers") ||
            content.includes("Skill deployed from Stigmergy")
          ) {
            const fullSkillDir = path.join(skillsDir, skillDir);
            await fs.rm(fullSkillDir, { recursive: true });

            if (this.verbose) {
              console.log(`    ✅ Removed: ${skillDir}`);
            }
          }
        } catch {
          // 技能文件不存在或无法读取，跳过
        }
      }
    } catch (error) {
      if (this.verbose) {
        console.log(`    ⚠️  Failed to remove skill files: ${error.message}`);
      }
    }
  }

  /**
   * 验证部署状态
   */
  async verifyDeployment(cliName) {
    console.log(`\n🔍 Verifying superpowers deployment on ${cliName}...`);

    const results = {
      hooks: false,
      context: false,
      skills: [],
    };

    // 1. 验证 hooks
    try {
      const hooksConfig = await this.hookManager.readHooksConfig(cliName);
      results.hooks = Object.keys(hooksConfig.hooks || {}).length > 0;

      if (results.hooks) {
        console.log(`  ✅ Hooks configured`);
      } else {
        console.log(`  ❌ No hooks found`);
      }
    } catch (error) {
      console.log(`  ❌ Hooks verification failed: ${error.message}`);
    }

    // 2. 验证上下文注入
    try {
      const validation = await this.contextInjector.validateInjection(cliName);
      results.context = validation.valid;

      if (results.context) {
        console.log(`  ✅ Context injected`);
      } else {
        console.log(`  ❌ Context injection failed: ${validation.error}`);
      }
    } catch (error) {
      console.log(`  ❌ Context verification failed: ${error.message}`);
    }

    // 3. 验证技能文件
    try {
      const skillsDir = path.join(os.homedir(), `.${cliName}`, "skills");
      const skillDirs = await fs.readdir(skillsDir);

      for (const skillDir of skillDirs) {
        if (skillDir.startsWith(".")) continue;

        const skillPath = path.join(skillsDir, skillDir, "skill.md");
        const altSkillPath = path.join(skillsDir, skillDir, "SKILL.md");

        try {
          await fs.access(skillPath);
          results.skills.push(skillDir);
        } catch {
          try {
            await fs.access(altSkillPath);
            results.skills.push(skillDir);
          } catch {
            // 技能文件不存在
          }
        }
      }

      console.log(`  ✅ Found ${results.skills.length} skill(s)`);
    } catch (error) {
      console.log(`  ❌ Skills verification failed: ${error.message}`);
    }

    const allSuccess =
      results.hooks && results.context && results.skills.length > 0;

    console.log(
      `\n${allSuccess ? "✅" : "⚠️"} Deployment status: ${allSuccess ? "Fully deployed" : "Partially deployed"}\n`,
    );

    return results;
  }

  /**
   * 批量部署到多个 CLI
   */
  async deployToMultiple(clinames, options = {}) {
    console.log("\n🚀 Batch Deployment\n");

    const results = {};

    for (const cliName of clinames) {
      try {
        results[cliName] = await this.deploySuperpowers(cliName, options);
      } catch (error) {
        console.log(`❌ Failed to deploy to ${cliName}: ${error.message}`);
        results[cliName] = {
          error: error.message,
        };
      }
    }

    // 打印摘要
    console.log("\n📊 Deployment Summary:\n");

    for (const [cliName, result] of Object.entries(results)) {
      if (result.error) {
        console.log(`  ❌ ${cliName}: ${result.error}`);
      } else {
        const status =
          result.hooks && result.context && result.skills ? "✅" : "⚠️";
        console.log(
          `  ${status} ${cliName}: hooks=${result.hooks}, context=${result.context}, skills=${result.skills}`,
        );
      }
    }

    console.log();

    return results;
  }

  /**
   * 获取技能列表
   */
  async _getSkillList(cliName, skillsInput) {
    // 如果已经提供了技能列表，直接使用
    if (Array.isArray(skillsInput) && skillsInput.length > 0) {
      return skillsInput;
    }

    // 否则扫描 CLI 的 skills 目录
    const skillsDir = path.join(os.homedir(), `.${cliName}`, "skills");

    try {
      const skillDirs = await fs.readdir(skillsDir);
      return skillDirs.filter((d) => !d.startsWith("."));
    } catch {
      return [];
    }
  }

  /**
   * 生成通用钩子模板
   */
  _generateGenericHook(cliName, hookName, hookConfig) {
    return `
/**
 * ${hookName} Hook
 * 针对 ${cliName} CLI
 */

/**
 * Hook 主函数
 * @param {Object} context - Hook 上下文
 */
async function ${hookName}(context) {
  // TODO: 实现 ${hookName} 钩子逻辑
  console.log('${hookName} hook triggered');

  return context;
}

// 导出
module.exports = { ${hookName} };
`;
  }
}

module.exports = PluginDeployer;
