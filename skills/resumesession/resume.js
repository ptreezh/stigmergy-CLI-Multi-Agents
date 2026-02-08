#!/usr/bin/env node
/**
 * ResumeSession - 跨 CLI 会话恢复工具
 *
 * 使用方式：
 *   node resume.js              # 恢复当前项目最新会话
 *   node resume.js 5            # 显示当前项目最近 5 个会话
 *   node resume.js --all        # 显示当前项目所有 CLI 的会话
 *   node resume.js --complete   # 显示所有 CLI 所有项目的会话
 *   node resume.js --help       # 显示帮助信息
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const MIN_LENGTH = 10;
const MAX_SESSIONS = 10;
const MERGE_HOURS = 24;

const CLI_CONFIG = {
  claude: {
    name: "Claude",
    base: path.join(os.homedir(), ".claude", "projects"),
  },
  gemini: {
    name: "Gemini",
    base: path.join(os.homedir(), ".config", "gemini", "tmp"),
  },
  qwen: { name: "Qwen", base: path.join(os.homedir(), ".qwen", "projects") },
  iflow: { name: "iFlow", base: path.join(os.homedir(), ".iflow", "projects") },
  codebuddy: { name: "CodeBuddy", base: path.join(os.homedir(), ".codebuddy") },
  codex: { name: "Codex", base: path.join(os.homedir(), ".config", "codex") },
  qodercli: {
    name: "QoderCLI",
    base: path.join(os.homedir(), ".qoder", "projects"),
  },
  kode: { name: "Kode", base: path.join(os.homedir(), ".kode", "projects") },
};

function normalizeProjectDir(cwd) {
  return cwd.replace(/^([A-Za-z]):/, "$1--").replace(/\\/g, "-");
}

function getProjectDir(cwd) {
  return normalizeProjectDir(cwd);
}

function findSessionFiles(cli, config) {
  const files = [];
  const projectDir = getProjectDir(process.cwd());

  if (!fs.existsSync(config.base)) return files;

  let searchPath = config.base;
  if (["claude", "qwen", "iflow", "qodercli", "kode"].includes(cli)) {
    searchPath = path.join(config.base, projectDir);
    if (!fs.existsSync(searchPath)) return files;
  } else if (cli === "gemini") {
    try {
      const subdirs = fs.readdirSync(searchPath);
      for (const sub of subdirs) {
        const chatsPath = path.join(searchPath, sub, "chats");
        if (fs.existsSync(chatsPath)) {
          searchPath = chatsPath;
          break;
        }
      }
    } catch (e) {
      return files;
    }
  }

  try {
    const items = fs.readdirSync(searchPath);
    for (const item of items) {
      if (["user-state.json", "slash_commands.json"].includes(item)) continue;
      const fullPath = path.join(searchPath, item);
      try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const subFiles = fs.readdirSync(fullPath);
          for (const subFile of subFiles) {
            if (subFile.endsWith(".json") || subFile.endsWith(".jsonl")) {
              files.push({
                cli,
                name: config.name,
                path: path.join(fullPath, subFile),
                time: stats.mtime,
              });
            }
          }
        } else if (item.endsWith(".json") || item.endsWith(".jsonl")) {
          files.push({
            cli,
            name: config.name,
            path: fullPath,
            time: stats.mtime,
          });
        }
      } catch (e) {}
    }
  } catch (e) {}

  return files;
}

function isValid(text) {
  if (!text || typeof text !== "string") return false;
  const clean = text.replace(/[#*`\[\]]/g, "").trim();
  if (clean.length < MIN_LENGTH) return false;
  if (/^[\s\d]*$/.test(clean)) return false;
  if (/^(yes|no|ok|好|是)$/i.test(clean)) return false;
  return true;
}

function extractMessages(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    const msgs = Array.isArray(data)
      ? data
      : data.messages || data.conversation || [];

    const result = [];
    for (const m of msgs) {
      const role = m.type || m.role || m.speaker || "";
      const text = m.message?.content || m.content || m.text || "";
      if (isValid(text)) {
        result.push({
          role: role.toLowerCase(),
          text: text
            .replace(/[#*`\[\]]/g, "")
            .trim()
            .substring(0, 300),
        });
      }
    }
    return result.length > 0 ? result : null;
  } catch (e) {
    return null;
  }
}

function findAllSessions() {
  const sessions = [];
  for (const [cli, config] of Object.entries(CLI_CONFIG)) {
    const files = findSessionFiles(cli, config);
    for (const f of files) {
      const msgs = extractMessages(f.path);
      if (msgs) {
        sessions.push({ ...f, messages: msgs, count: msgs.length });
      }
    }
  }
  return sessions.sort((a, b) => b.time - a.time);
}

function relativeTime(date) {
  const diff = (Date.now() - date.getTime()) / 1000 / 60;
  if (diff < 1) return "刚刚";
  if (diff < 60) return Math.floor(diff) + "分钟前";
  if (diff < 1440) return Math.floor(diff / 60) + "小时前";
  return Math.floor(diff / 1440) + "天前";
}

function showHelp() {
  console.log(`
ResumeSession - 跨 CLI 会话恢复工具
===================================

用法: node resume.js [参数]

参数:
  无参数      恢复当前项目最新会话
  [数字]      显示最近 N 个会话
  --all       显示当前项目所有会话
  --complete  显示所有项目所有会话
  --help      显示此帮助

示例:
  node resume.js
  node resume.js 5
  node resume.js --all

支持: Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode
`);
}

function formatSession(session, index) {
  const out = [];
  out.push(
    "--- " +
      (index + 1) +
      ". " +
      session.name +
      " | " +
      relativeTime(session.time) +
      " ---",
  );
  for (const m of session.messages.slice(0, 4)) {
    const prefix = m.role.includes("user") ? "👤" : "🤖";
    const text =
      m.text.length > 100 ? m.text.substring(0, 100) + "..." : m.text;
    out.push(prefix + " " + text);
  }
  return out.join("\n");
}

function mergeSessions(sessions) {
  const merged = [];
  const now = Date.now();

  for (const s of sessions) {
    const ageHours = (now - s.time.getTime()) / 1000 / 60 / 60;

    if (merged.length === 0) {
      merged.push(s);
    } else {
      const last = merged[merged.length - 1];
      const lastAge = (now - last.time.getTime()) / 1000 / 60 / 60;

      if (
        ageHours < MERGE_HOURS &&
        lastAge < MERGE_HOURS &&
        s.cli === last.cli
      ) {
        last.messages = last.messages.concat(s.messages);
        last.count += s.count;
      } else if (merged.length < MAX_SESSIONS) {
        merged.push(s);
      }
    }
  }

  return merged;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  const sessions = findAllSessions();

  if (sessions.length === 0) {
    console.log("未找到会话");
    return;
  }

  const firstArg = args[0];

  if (firstArg === "--complete") {
    console.log("\n所有会话 (" + sessions.length + "个):\n");
    sessions.forEach(function (s, i) {
      console.log(formatSession(s, i));
    });
    return;
  }

  if (firstArg === "--all") {
    const merged = mergeSessions(sessions);
    console.log("\n当前项目会话 (" + merged.length + "个):\n");
    merged.forEach(function (s, i) {
      console.log(formatSession(s, i));
    });
    return;
  }

  if (firstArg && /^\d+$/.test(firstArg)) {
    const limit = Math.min(parseInt(firstArg), MAX_SESSIONS);
    console.log("\n最近 " + limit + " 个会话:\n");
    sessions.slice(0, limit).forEach(function (s, i) {
      console.log(formatSession(s, i));
    });
    return;
  }

  const merged = mergeSessions(sessions);
  const latest = merged[0];
  console.log(
    "\n最新会话: " + latest.name + " | " + relativeTime(latest.time) + "\n",
  );
  latest.messages.forEach(function (m) {
    const prefix = m.role.includes("user") ? "👤" : "🤖";
    const text =
      m.text.length > 200 ? m.text.substring(0, 200) + "..." : m.text;
    console.log(prefix + " " + text);
  });
}

main();
