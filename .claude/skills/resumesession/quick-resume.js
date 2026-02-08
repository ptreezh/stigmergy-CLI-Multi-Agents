#!/usr/bin/env node
/**
 * Quick Resume - Simplified session recovery for Claude CLI
 * Usage in Claude: Bash("node ~/.claude/skills/resumesession/quick-resume.js")
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

function getSessionPath() {
  const homeDir = os.homedir();
  const projectPath = process.cwd();
  const projectDir = projectPath
    .replace(/^([A-Za-z]):\\/, "$1--")
    .replace(/\\/g, "-");
  return {
    claude: path.join(homeDir, ".claude", "projects", projectDir),
    gemini: path.join(homeDir, ".config", "gemini", "tmp"),
    qwen: path.join(homeDir, ".qwen", "projects", projectDir, "chats"),
    iflow: path.join(homeDir, ".iflow", "projects", projectDir),
    codebuddy: path.join(homeDir, ".codebuddy", "projects", projectDir),
    codex: path.join(homeDir, ".config", "codex"),
    qodercli: path.join(homeDir, ".qoder", "projects", projectDir),
    kode: path.join(homeDir, ".kode", "projects", projectDir),
  };
}

function findLatestFile(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  const files = fs.readdirSync(dirPath);
  let latestFile = null;
  let latestTime = new Date(0);

  for (const file of files) {
    if (file === "user-state.json" || file === "slash_commands.json") continue;
    const filePath = path.join(dirPath, file);
    try {
      const stats = fs.statSync(filePath);
      if (stats.mtime > latestTime) {
        latestTime = stats.mtime;
        latestFile = { name: file, path: filePath };
      }
    } catch (e) {}
  }

  return latestFile ? { ...latestFile, time: latestTime } : null;
}

function extractContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    const messages = Array.isArray(data) ? data : data.messages || [];

    for (const msg of messages) {
      const role = msg.type || msg.role || msg.speaker || "";
      const text = msg.message?.content || msg.content || msg.text || "";
      if (text && typeof text === "string") {
        const cleanText = text
          .replace(/[#*`\[\]]/g, "")
          .trim()
          .substring(0, 150);
        if (cleanText.length > 5) {
          return {
            role: role.includes("user") ? "USER" : "ASSISTANT",
            text: cleanText,
          };
        }
      }
    }
  } catch (e) {}
  return null;
}

function main() {
  const cliPaths = getSessionPath();
  let latestSession = null;

  for (const [cli, dirPath] of Object.entries(cliPaths)) {
    const file = findLatestFile(dirPath);
    if (file && (!latestSession || file.time > latestSession.time)) {
      latestSession = { ...file, cli };
    }
  }

  if (!latestSession) {
    console.log("No sessions found");
    return 1;
  }

  const content = extractContent(latestSession.path);
  const dateStr =
    latestSession.time.getFullYear() +
    "/" +
    (latestSession.time.getMonth() + 1) +
    "/" +
    latestSession.time.getDate() +
    " " +
    latestSession.time.getHours() +
    ":" +
    String(latestSession.time.getMinutes()).padStart(2, "0");

  console.log("[" + dateStr + "] " + latestSession.cli.toUpperCase());
  if (content) {
    console.log((content.role === "USER" ? "👤" : "🤖") + " " + content.text);
  }

  return 0;
}

process.exit(main());
