/**
 * Stigmergy Skill Command Handler (CommonJS版本)
 *
 * 桥接CommonJS主程序和技能系统
 * 直接require CommonJS模块
 */

const path = require("path");

/**
 * 处理skill命令
 * @param {string} action - skill子命令 (install/read/list/sync/remove/validate)
 * @param {Array} args - 命令参数
 * @param {Object} options - 选项
 * @returns {Promise<number>} 退出码
 */
async function handleSkillCommand(action, args = [], options = {}) {
  try {
    // 直接require CommonJS模块
    const { handleEnhancedSkillCommand } = require("./enhanced-skill-manager");

    // Check if it's a predefined skill collection
    const predefinedSkills = {
      anthropics: true,
      vercel: true,
      productivity: true,
      coding: true,
      research: true,
      "list-collections": true,
      collections: true,
      presets: true,
      search: true,
      info: true,
      describe: true,
    };

    if (
      predefinedSkills[action.toLowerCase()] ||
      action.toLowerCase().includes("collection") ||
      action.toLowerCase().includes("search") ||
      action.toLowerCase().includes("info") ||
      action.toLowerCase().includes("describe")
    ) {
      // Use enhanced skill manager for these commands
      await handleEnhancedSkillCommand(action, args, options);
      return 0;
    } else {
      // Fall back to regular skill manager for other commands
      const {
        StigmergySkillManager,
      } = require("../core/skills/StigmergySkillManager");

      const manager = new StigmergySkillManager();

      // Execute corresponding command
      switch (action) {
      case "install":
        if (!args[0]) {
          console.error("❌ Error: source or skill collection name required");
          console.log(
            "\nUsage: stigmergy skill install <skill-collection|github-source>",
          );
          console.log("Example: stigmergy skill install anthropics");
          console.log("Example: stigmergy skill install anthropics/skills");
          console.log(
            '\nUse "stigmergy skill list-collections" to see available collections.',
          );
          return 1;
        }

        // Check if it's a predefined skill collection
        const predefinedCollections = {
          anthropics: { source: "anthropics/skills" },
          vercel: { source: "vercel-labs/agent-skills" },
          productivity: { source: "anthropics/skills" },
          coding: { source: "anthropics/skills" },
          research: { source: "anthropics/skills" },
        };

        if (predefinedCollections[args[0].toLowerCase()]) {
          // Install from predefined collection
          await manager.install(
            predefinedCollections[args[0].toLowerCase()].source,
            options,
          );
        } else {
          // Install from GitHub source
          await manager.install(args[0], options);
        }
        return 0;

      case "read":
        if (!args[0]) {
          console.error("❌ Error: skill name required");
          console.log("\nUsage: stigmergy skill read <skill-name>");
          return 1;
        }
        await manager.read(args[0]);
        return 0;

      case "list":
        await manager.list();
        return 0;

      case "remove":
      case "delete":
        if (!args[0]) {
          console.error("❌ Error: skill name required");
          console.log("\nUsage: stigmergy skill remove <skill-name>");
          return 1;
        }
        await manager.remove(args[0]);
        return 0;

      case "validate":
        if (!args[0]) {
          console.error("❌ Error: skill path or name required");
          console.log("\nUsage: stigmergy skill validate <path-or-name>");
          return 1;
        }
        await manager.validate(args[0]);
        return 0;

      case "sync":
        await manager.sync();
        return 0;

      default:
        console.error(`❌ Unknown action: ${action}`);
        console.log(
          "\nAvailable actions: install, read, list, remove, validate, sync",
        );
        return 1;
      }
    }
  } catch (error) {
    console.error(`[ERROR] Skill command failed: ${error.message}`);
    return 1;
  }
}

module.exports = { handleSkillCommand };
