#!/usr/bin/env node
/**
 * Skill Created Hook - 自动技能创建Hook
 *
 * 当进化产生新技能时，自动处理技能的创建和部署
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const CONFIG = {
  skillOutputDir: path.join(os.homedir(), ".stigmergy", "skills"),
  logFile: path.join(
    os.homedir(),
    ".stigmergy",
    "soul-state",
    "skill-created.log",
  ),
};

class SkillCreatedHook {
  constructor() {
    this.pendingSkills = [];
  }

  /**
   * 当进化创建新技能时调用此Hook
   */
  async onSkillCreated(skillData) {
    console.log("[SkillCreatedHook] 📝 New skill created:", skillData.name);

    try {
      // 1. 验证技能格式
      const validation = this.validateSkill(skillData);
      if (!validation.valid) {
        console.error(
          "[SkillCreatedHook] ❌ Invalid skill:",
          validation.errors,
        );
        return { success: false, errors: validation.errors };
      }

      // 2. 保存技能文件
      await this.saveSkill(skillData);

      // 3. 同步到 AGENTS.md
      await this.syncToAgentsMd(skillData);

      // 4. 记录日志
      this.logSkillCreated(skillData);

      console.log("[SkillCreatedHook] ✅ Skill deployed:", skillData.name);

      return { success: true, skill: skillData };
    } catch (error) {
      console.error(
        "[SkillCreatedHook] ❌ Failed to create skill:",
        error.message,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * 验证技能格式
   */
  validateSkill(skillData) {
    const errors = [];

    if (!skillData.name) {
      errors.push("Missing name");
    }

    if (!skillData.description) {
      errors.push("Missing description");
    }

    // 检查 SKILL.md 格式
    if (!skillData.content || !skillData.content.includes("---")) {
      errors.push("Invalid SKILL.md format (missing frontmatter)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 保存技能文件
   */
  async saveSkill(skillData) {
    const skillDir = path.join(CONFIG.skillOutputDir, skillData.name);

    // 创建目录
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // 写入 SKILL.md
    const skillPath = path.join(skillDir, "SKILL.md");
    fs.writeFileSync(skillPath, skillData.content);

    console.log("[SkillCreatedHook] 📁 Saved:", skillPath);
  }

  /**
   * 同步到 AGENTS.md
   */
  async syncToAgentsMd(skillData) {
    try {
      // 调用 stigmergy skill sync
      execSync("stigmergy skill sync", {
        encoding: "utf8",
        timeout: 30000,
        stdio: "pipe",
      });
      console.log("[SkillCreatedHook] 🔄 Synced to AGENTS.md");
    } catch (e) {
      console.warn("[SkillCreatedHook] ⚠️ Could not sync:", e.message);
    }
  }

  /**
   * 记录技能创建日志
   */
  logSkillCreated(skillData) {
    try {
      const dir = path.dirname(CONFIG.logFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const entry = {
        timestamp: new Date().toISOString(),
        skill: skillData.name,
        description: skillData.description,
      };

      fs.appendFileSync(CONFIG.logFile, JSON.stringify(entry) + "\n");
    } catch (e) {
      console.warn("[SkillCreatedHook] ⚠️ Could not log:", e.message);
    }
  }
}

module.exports = { SkillCreatedHook };

if (require.main === module) {
  const hook = new SkillCreatedHook();

  // 从命令行参数获取技能数据
  const skillData = JSON.parse(process.argv[2] || "{}");

  hook.onSkillCreated(skillData).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
}
