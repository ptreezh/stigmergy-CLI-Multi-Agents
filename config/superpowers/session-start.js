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

/**
 * 检测项目本地Soul目录
 */
function detectProjectSoul() {
  try {
    const cwd = process.cwd();
    const projectPaths = [
      path.join(cwd, ".stigmergy", "skills"),
      path.join(cwd, ".agent", "skills"),
      path.join(cwd, ".claude", "skills"),
    ];

    for (const skillsPath of projectPaths) {
      if (!fs.existsSync(skillsPath)) continue;

      // 检查是否存在soul.md
      const soulPath = path.join(skillsPath, "soul.md");
      if (fs.existsSync(soulPath)) {
        try {
          const soulContent = fs.readFileSync(soulPath, "utf8");
          return {
            found: true,
            path: soulPath,
            skillsPath: skillsPath,
            content: soulContent,
          };
        } catch (e) {
          continue;
        }
      }

      // 递归检查子目录
      try {
        const entries = fs.readdirSync(skillsPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const subSoulPath = path.join(skillsPath, entry.name, "soul.md");
          if (fs.existsSync(subSoulPath)) {
            try {
              const soulContent = fs.readFileSync(subSoulPath, "utf8");
              return {
                found: true,
                path: subSoulPath,
                skillsPath: path.join(skillsPath, entry.name),
                content: soulContent,
              };
            } catch (e) {
              continue;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    // 静默失败
  }
  return { found: false };
}

/**
 * 初始化项目本地Soul系统状态
 */
function initProjectSoulState(soulInfo) {
  try {
    const stateDir = path.join(
      process.cwd(),
      ".stigmergy",
      "soul-state",
    );

    // 确保目录存在
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    const statePath = path.join(stateDir, "soul-system-state.json");
    let state = { initialized: false, lastActive: null };

    // 加载现有状态
    if (fs.existsSync(statePath)) {
      try {
        state = JSON.parse(fs.readFileSync(statePath, "utf8"));
      } catch (e) {}
    }

    // 更新状态
    state.initialized = true;
    state.lastActive = new Date().toISOString();
    state.soulPath = soulInfo.path;
    state.skillsPath = soulInfo.skillsPath;

    // 保存状态
    fs.writeFileSync(
      statePath,
      JSON.stringify(state, null, 2),
      "utf8"
    );

    return state;
  } catch (e) {
    return null;
  }
}

async function sessionStart(context) {
  try {
    checkAndUpdate();

    const ctx = context || {};
    let additionalContext = "<EXTREMELY_IMPORTANT>\n";

    // 1. 检测并初始化项目本地Soul系统
    const soulInfo = detectProjectSoul();
    if (soulInfo.found) {
      console.log("🧠 Soul detected: " + soulInfo.path);

      // 初始化Soul状态
      const soulState = initProjectSoulState(soulInfo);

      // 注入Soul身份到上下文
      additionalContext += "## Your Soul Identity (Auto-Loaded)\n";
      additionalContext += escapeForJson(soulInfo.content) + "\n\n";

      // 标记上下文包含Soul系统
      ctx._soulSystem = {
        initialized: true,
        path: soulInfo.path,
        skillsPath: soulInfo.skillsPath,
        state: soulState,
      };
    }

    // 2. 注入 Superpowers 元技能
    const usingSuperpowers = readSkill("using-superpowers");
    if (usingSuperpowers) {
      additionalContext +=
        "## Using Superpowers\n" + escapeForJson(usingSuperpowers) + "\n\n";
    }

    // 3. 注入全局 Soul 进化身份（如果存在）
    const soulContent = readSkill("soul");
    if (soulContent && !soulInfo.found) {
      additionalContext +=
        "## Your Soul (Identity)\n" + escapeForJson(soulContent) + "\n\n";
    }

    // 4. 注入当前目标
    const agentsContent = readSkill("agents");
    if (agentsContent) {
      additionalContext +=
        "## Current Goals\n" + escapeForJson(agentsContent) + "\n\n";
    }

    // 5. 注入进化进度
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

    const injectedMsg = "🦸 Superpowers context injected (v" + STIGMERGY_VERSION + ")";
    if (soulInfo.found) {
      console.log(injectedMsg + " | 🧠 Soul auto-initialized");
    } else {
      console.log(injectedMsg);
    }
  } catch (error) {
    try {
      console.error("🦸 Superpowers hook error:", error.message);
    } catch (e) {}
  }
  return context;
}

module.exports = { sessionStart };
