#!/usr/bin/env node
/**
 * Superpowers Command Handler
 * Deploys complete Superpowers plugin to all local CLIs
 */

const chalk = require("chalk");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const REPO_URL = "https://github.com/obra/superpowers.git";
const CACHE_DIR = path.join(os.homedir(), ".cache", "stigmergy", "superpowers");

// 非 Agent CLI，不支持插件，应该从部署中排除
const EXCLUDED_CLIS = ["bun", "oh-my-opencode"];

const CLIS = {
  claude: {
    name: "Claude",
    home: ".claude",
    plugin: "plugins/superpowers",
    hooks: "hooks",
  },
  qwen: {
    name: "Qwen",
    home: ".qwen",
    plugin: "extensions/superpowers-qwen",
    hooks: "hooks",
  },
  iflow: {
    name: "iFlow",
    home: ".iflow",
    plugin: "plugins/superpowers",
    hooks: "hooks",
  },
  codebuddy: {
    name: "CodeBuddy",
    home: ".codebuddy",
    plugin: "buddies/superpowers",
    hooks: "hooks",
  },
  opencode: {
    name: "OpenCode",
    home: ".opencode",
    plugin: "plugins/superpowers",
    hooks: "hooks",
  },
  kilocode: {
    name: "KiloCode",
    home: ".kilocode",
    plugin: "plugins/superpowers",
    hooks: "hooks",
  },
  gemini: {
    name: "Gemini",
    home: ".config/gemini",
    plugin: "extensions/superpowers",
    hooks: "extensions",
  },
  codex: {
    name: "Codex",
    home: ".config/codex",
    plugin: "extensions/superpowers",
    hooks: "extensions",
  },
};

async function deployCompleteSuperpowers(options) {
  options = options || {};
  console.log("\n🦸 Superpowers Deployment");
  console.log("=".repeat(50));

  var home = os.homedir();
  var avail = Object.keys(CLIS).filter(function (k) {
    // 排除非 Agent CLI 和不存在的 CLI
    return !EXCLUDED_CLIS.includes(k) && fs.existsSync(path.join(home, CLIS[k].home));
  });

  if (avail.length === 0) {
    console.log("\n⚠️  No CLIs found\n");
    return;
  }

  console.log(
    "\n📋 CLIs: " +
      avail
        .map(function (k) {
          return CLIS[k].name;
        })
        .join(", ") +
      "\n",
  );

  if (!options.deployOnly) {
    console.log("📦 Cloning obra/superpowers...\n");
    cloneRepo();
  }

  if (!options.cloneOnly) {
    console.log("📦 Deploying to CLIs...\n");
    deploy(avail, home);
  }

  console.log("✅ Done!\n");
}

function cloneRepo() {
  var dir = path.join(CACHE_DIR, "repo");

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  if (fs.existsSync(dir)) {
    try {
      execSync("git fetch origin", { cwd: dir, stdio: "ignore" });
      execSync("git merge --ff-only origin/main", {
        cwd: dir,
        stdio: "ignore",
      });
      console.log("  🔄 Updated\n");
    } catch (e) {
      fs.rmSync(dir, { recursive: true });
      execSync("git clone " + REPO_URL + " " + dir, { stdio: "ignore" });
      console.log("  ✅ Re-cloned\n");
    }
  } else {
    execSync("git clone " + REPO_URL + " " + dir, { stdio: "ignore" });
    console.log("  ✅ Cloned\n");
  }
}

function deploy(avail, home) {
  var repoDir = path.join(CACHE_DIR, "repo");

  for (var i = 0; i < avail.length; i++) {
    var cli = avail[i];
    var cfg = CLIS[cli];
    var cliHome = path.join(home, cfg.home);

    var pluginDir = path.join(cliHome, cfg.plugin);
    var hooksDir = path.join(cliHome, cfg.hooks);
    var skillsDir = path.join(cliHome, "skills");

    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.mkdirSync(skillsDir, { recursive: true });

    copy(
      path.join(repoDir, ".claude-plugin"),
      path.join(pluginDir, ".claude-plugin"),
    );
    copy(path.join(repoDir, "skills"), skillsDir);

    // Also copy soul evolution skills from stigmergy
    var projectRoot = path.join(process.cwd());
    var soulSkillsDir = path.join(projectRoot, "skills");
    if (fs.existsSync(soulSkillsDir)) {
      var soulSkills = [
        "two-agent-loop",
        "soul-evolution",
        "soul-reflection",
        "soul-co-evolve",
        "soul-compete",
        "soul",
      ];
      for (var ss of soulSkills) {
        var src = path.join(soulSkillsDir, ss);
        var dst = path.join(skillsDir, ss);
        if (fs.existsSync(src)) {
          copy(src, dst);
        }
      }
      // Also copy soul.md and agents.md to user skills root
      var userSoulSrc = path.join(soulSkillsDir, "soul");
      var userSkillsRoot = path.join(os.homedir(), "skills", "soul");
      if (fs.existsSync(userSoulSrc)) {
        if (!fs.existsSync(userSkillsRoot)) {
          fs.mkdirSync(userSkillsRoot, { recursive: true });
        }
        copy(userSoulSrc, userSkillsRoot);
      }
    }

    var hooksJson = {
      hooks: {
        sessionStart: {
          name: "SessionStart",
          enabled: true,
          priority: 1,
          matchers: ["startup", "resume", "clear"],
        },
      },
    };
    fs.writeFileSync(
      path.join(hooksDir, "hooks.json"),
      JSON.stringify(hooksJson, null, 2),
    );

    var hookFile = cli === "qwen" ? "session-start.ts" : "session-start.js";
    fs.writeFileSync(path.join(hooksDir, hookFile), HOOK_CONTENT);

    var count = fs.readdirSync(skillsDir).filter(function (f) {
      return !f.startsWith(".");
    }).length;
    console.log("  ✅ " + cfg.name + ": " + count + " skills");
  }
}

function copy(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  var ents = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < ents.length; i++) {
    var e = ents[i];
    var s = path.join(src, e.name);
    var d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d);
    else
      try {
        fs.copyFileSync(s, d);
      } catch (err) {}
  }
}

var HOOK_CONTENT = [
  "/**",
  " * Superpowers + Soul Session Start Hook",
  " * Auto-generated by Stigmergy",
  " */",
  "const fs = require('fs');",
  "const path = require('path');",
  "const os = require('os');",
  "",
  "const SKILLS_ROOT = path.join(os.homedir(), 'skills');",
  "",
  "function escapeForJson(str) {",
  "  return str.replace(/\\\\\\\\/g, '\\\\\\\\\\\\\\\\').replace(/\"/g, '\\\\\\\\\"').replace(/\\n/g, '\\\\\\\\n');",
  "}",
  "",
  "async function sessionStart(context) {",
  "  try {",
  "    let add = '<EXTREMELY_IMPORTANT>';",
  "",
  "    // 1. Inject Superpowers",
  "    let sp = path.join(SKILLS_ROOT, 'using-superpowers', 'skill.md');",
  "    if (fs.existsSync(sp)) {",
  "      let c = fs.readFileSync(sp, 'utf8');",
  "      add += '\\\\n\\\\n## Superpowers\\\\n' + c;",
  "    }",
  "",
  "    // 2. Inject User Soul (Identity)",
  "    let soulPath = path.join(SKILLS_ROOT, 'soul', 'soul.md');",
  "    if (fs.existsSync(soulPath)) {",
  "      let soul = fs.readFileSync(soulPath, 'utf8');",
  "      add += '\\\\n\\\\n## Your Soul (Identity)\\\\n' + soul;",
  "    }",
  "",
  "    // 3. Inject Current Goals",
  "    let agentsPath = path.join(SKILLS_ROOT, 'soul', 'agents.md');",
  "    if (fs.existsSync(agentsPath)) {",
  "      let goals = fs.readFileSync(agentsPath, 'utf8');",
  "      add += '\\\\n\\\\n## Current Goals\\\\n' + goals;",
  "    }",
  "",
  "    // 4. Inject Evolution State",
  "    let statePath = path.join(os.homedir(), '.stigmergy', 'soul-state', 'evolution-state.json');",
  "    if (fs.existsSync(statePath)) {",
  "      try {",
  "        let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));",
  "        add += '\\\\n\\\\n## Evolution Progress\\\\n';",
  "        add += '- Total Evolutions: ' + (state.totalEvolutions || 0) + '\\\\n';",
  "        add += '- Skills Learned: ' + (state.skillsLearned?.join(', ') || 'None');",
  "      } catch(e) {}",
  "    }",
  "",
  "    add += '</EXTREMELY_IMPORTANT>';",
  "    context.additionalContext = (context.additionalContext || '') + '\\\\n\\\\n' + add;",
  "    console.log('Soul context injected');",
  "  } catch (e) { console.error(e.message); }",
  "  return context;",
  "}",
  "",
  "module.exports = { sessionStart };",
  "",
].join("\\n");

async function verifySuperpowers() {
  console.log("\\n🔍 Verify\\n");
  var home = os.homedir();
  var ok = 0,
    bad = 0;
  for (var k in CLIS) {
    var c = CLIS[k];
    var h = path.join(home, c.home, c.hooks);
    var has =
      fs.existsSync(path.join(h, "hooks.json")) &&
      (fs.existsSync(path.join(h, "session-start.js")) ||
        fs.existsSync(path.join(h, "session-start.ts")));
    console.log("  " + (has ? "✅" : "❌") + " " + c.name);
    if (has) ok++;
    else bad++;
  }
  console.log("\\n" + ok + " OK, " + bad + " missing\\n");
}

async function cleanSuperpowers() {
  console.log("\\n🗑️ Clean\\n");
  var home = os.homedir();
  for (var k in CLIS) {
    var c = CLIS[k];
    var p = path.join(home, c.home, c.plugin);
    var h = path.join(home, c.home, c.hooks);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true });
      console.log("  ✅ " + c.name + " plugin");
    }
    var hf = path.join(h, "hooks.json");
    var sf = path.join(h, "session-start.js");
    var tf = path.join(h, "session-start.ts");
    if (fs.existsSync(hf)) fs.unlinkSync(hf);
    if (fs.existsSync(sf)) fs.unlinkSync(sf);
    if (fs.existsSync(tf)) fs.unlinkSync(tf);
  }
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true });
    console.log("  ✅ Cache");
  }
  console.log("\\n✅ Cleaned\\n");
}

module.exports = {
  deployCompleteSuperpowers: deployCompleteSuperpowers,
  verifySuperpowers: verifySuperpowers,
  cleanSuperpowers: cleanSuperpowers,
};
