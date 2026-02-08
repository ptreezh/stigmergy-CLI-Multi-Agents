#!/usr/bin/env node
/**
 * Slash Command Installer - Unified /resumesession deployment for all CLIs
 *
 * Deploys /resumesession command to:
 * - Claude: Via skills (no native slash command support)
 * - OpenCode: Via hooks/skills
 * - Codex: Via slash_commands.json
 * - Qwen: Via skills
 * - iFlow: Via skills
 * - CodeBuddy: Via skills
 * - QoderCLI: Via skills
 * - Kode: Via skills
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class SlashCommandInstaller {
  constructor() {
    this.homeDir = os.homedir();
    this.skillsBaseDir = path.join(
      __dirname,
      "..",
      "..",
      "skills",
      "resumesession",
    );
  }

  async installAll() {
    console.log("🔧 Installing /resumesession slash command for all CLIs...\n");

    const results = {
      claude: await this.installClaude(),
      opencode: await this.installOpenCode(),
      codex: await this.installCodex(),
      qwen: await this.installQwen(),
      iflow: await this.installIFlow(),
      codebuddy: await this.installCodeBuddy(),
      qodercli: await this.installQoderCLI(),
      kode: await this.installKode(),
    };

    console.log("\n📊 Installation Summary:");
    for (const [cli, result] of Object.entries(results)) {
      console.log(
        `  ${result.success ? "✅" : "❌"} ${cli}: ${result.message || result.error || "OK"}`,
      );
    }

    return results;
  }

  async installClaude() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".claude",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js", "__init__.py"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.claude/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installOpenCode() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".opencode",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js", "__init__.py"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.opencode/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installCodex() {
    try {
      const slashFile = path.join(
        this.homeDir,
        ".config",
        "codex",
        "slash_commands.json",
      );
      const configDir = path.dirname(slashFile);

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let config = {};
      if (fs.existsSync(slashFile)) {
        config = JSON.parse(fs.readFileSync(slashFile, "utf8"));
      }
      if (!config.slash_commands) {
        config.slash_commands = {};
      }

      config.slash_commands.resumesession = {
        command: "resumesession",
        description: "Resume cross-CLI session history",
        enabled: true,
      };

      fs.writeFileSync(slashFile, JSON.stringify(config, null, 2));

      return {
        success: true,
        message: "Slash command added to ~/.config/codex/slash_commands.json",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installQwen() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".qwen",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.qwen/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installIFlow() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".iflow",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.iflow/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installCodeBuddy() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".codebuddy",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.codebuddy/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installQoderCLI() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".qoder",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.qoder/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installKode() {
    try {
      const skillsDir = path.join(
        this.homeDir,
        ".kode",
        "skills",
        "resumesession",
      );
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      const files = ["SKILL.md", "quick-resume.js"];
      for (const file of files) {
        const src = path.join(this.skillsBaseDir, file);
        const dst = path.join(skillsDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
        }
      }

      return {
        success: true,
        message: "Skills deployed to ~/.kode/skills/resumesession",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async installSingle(cliName) {
    const methodName = `install${cliName.charAt(0).toUpperCase() + cliName.slice(1)}`;
    if (typeof this[methodName] === "function") {
      return await this[methodName]();
    }
    return { success: false, error: `Unknown CLI: ${cliName}` };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cliName = args[0];

  const installer = new SlashCommandInstaller();

  if (cliName) {
    const result = await installer.installSingle(cliName);
    console.log(
      `${cliName}: ${result.success ? "✅" : "❌"} ${result.message || result.error}`,
    );
    process.exit(result.success ? 0 : 1);
  } else {
    const results = await installer.installAll();
    const allSuccess = Object.values(results).every((r) => r.success);
    process.exit(allSuccess ? 0 : 1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SlashCommandInstaller;
