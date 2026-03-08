/**
 * Stigmergy Superpowers Session Start Hook
 * 内置版本 - 无需外部网络即可工作
 *
 * 此 Hook 自动注入：
 * 1. Superpowers 元技能
 * 2. Soul 进化上下文
 * 3. 版本检查和自我更新
 */

let fs, path, os;

try {
  fs = require("fs");
  path = require("path");
  os = require("os");
} catch (e) {
  fs = { existsSync: () => false, readFileSync: () => "", mkdirSync: () => {} };
  path = {
    join: (...args) => args.join("/"),
    dirname: (p) => p.split("/").slice(0, -1).join("/"),
  };
  os = { homedir: () => "" };
}

const STIGMERGY_VERSION = "1.3.76";
const SKILL_PATHS = [
  path.join(os.homedir(), "skills"),
  path.join(os.homedir(), ".claude", "skills"),
  path.join(os.homedir(), ".qwen", "skills"),
  path.join(os.homedir(), ".iflow", "skills"),
];

function escapeForJson(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function findSkillPath(skillName) {
  for (const basePath of SKILL_PATHS) {
    const skillPath = path.join(basePath, skillName, "SKILL.md");
    if (fs.existsSync(skillPath)) {
      return skillPath;
    }
    const altPath = path.join(basePath, skillName, "skill.md");
    if (fs.existsSync(altPath)) {
      return altPath;
    }
  }
  return null;
}

function readSkill(skillName) {
  const skillPath = findSkillPath(skillName);
  if (skillPath) {
    try {
      return fs.readFileSync(skillPath, "utf8");
    } catch (e) {
      return null;
    }
  }
  return null;
}

function getVersionStatePath() {
  return path.join(os.homedir(), ".stigmergy", "superpowers-version.json");
}

function checkAndUpdate() {
  try {
    const versionPath = getVersionStatePath();
    const currentVersion = STIGMERGY_VERSION;

    let lastVersion = "0.0.0";
    if (fs.existsSync(versionPath)) {
      try {
        const state = JSON.parse(fs.readFileSync(versionPath, "utf8"));
        lastVersion = state.version || "0.0.0";
      } catch (e) {
        lastVersion = "0.0.0";
      }
    }

    if (lastVersion !== currentVersion) {
      console.log(`🦸 Superpowers: ${lastVersion} → ${currentVersion}`);

      const dir = path.dirname(versionPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        versionPath,
        JSON.stringify(
          {
            version: currentVersion,
            lastUpdate: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    }
  } catch (e) {
    // 静默失败
  }
}

async function sessionStart(context) {
  try {
    checkAndUpdate();

    const ctx = context || {};
    let additionalContext = "<EXTREMELY_IMPORTANT>\n";

    // 1. 注入 Superpowers 元技能
    const usingSuperpowers = readSkill("using-superpowers");
    if (usingSuperpowers) {
      additionalContext +=
        "## Using Superpowers\n" + escapeForJson(usingSuperpowers) + "\n\n";
    }

    // 2. 注入 Soul 进化身份
    const soulContent = readSkill("soul");
    if (soulContent) {
      additionalContext +=
        "## Your Soul (Identity)\n" + escapeForJson(soulContent) + "\n\n";
    }

    // 3. 注入当前目标
    const agentsContent = readSkill("agents");
    if (agentsContent) {
      additionalContext +=
        "## Current Goals\n" + escapeForJson(agentsContent) + "\n\n";
    }

    // 4. 注入进化进度
    try {
      const statePath = path.join(
        os.homedir(),
        ".stigmergy",
        "soul-state",
        "evolution-state.json",
      );
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
        additionalContext += "## Evolution Progress\n";
        additionalContext +=
          "- Total Evolutions: " + (state.totalEvolutions || 0) + "\n";
        additionalContext +=
          "- Skills Learned: " +
          (state.skillsLearned?.join(", ") || "None") +
          "\n";
        additionalContext +=
          "- Last Evolution: " + (state.lastEvolution || "Never") + "\n\n";
      }
    } catch (e) {
      // 静默
    }

    additionalContext += "</EXTREMELY_IMPORTANT>";

    // 兼容不同 CLI 的上下文属性
    if (ctx.additionalContext) {
      ctx.additionalContext += "\n\n" + additionalContext;
    } else if (ctx.context) {
      ctx.context += "\n\n" + additionalContext;
    } else if (ctx.systemPrompt) {
      ctx.systemPrompt += "\n\n" + additionalContext;
    } else {
      ctx.additionalContext = additionalContext;
    }

    console.log("🦸 Superpowers context injected (v" + STIGMERGY_VERSION + ")");
  } catch (error) {
    try {
      console.error("🦸 Superpowers hook error:", error.message);
    } catch (e) {}
  }
  return context;
}

module.exports = { sessionStart };
