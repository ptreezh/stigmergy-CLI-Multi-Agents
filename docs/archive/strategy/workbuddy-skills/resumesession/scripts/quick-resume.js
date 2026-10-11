#!/usr/bin/env node
/**
 * Quick Resume - Smart session recovery with filtering and merging
 * - Filters out invalid sessions (no useful content)
 * - Merges recent sessions for better context
 * - Compact output format
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const MIN_CONTENT_LENGTH = 10;
const MAX_SESSIONS = 5;
const MERGE_HOURS = 24;

function getSessionPaths() {
  const homeDir = os.homedir();
  const projectPath = process.cwd();
  const projectDir = projectPath.replace(/^([A-Za-z]):\\/, "$1--").replace(/\\/g, "-");
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

function isValidMessage(msg) {
  const role = msg.type || msg.role || msg.speaker || "";
  const text = msg.message?.content || msg.content || msg.text || "";

  if (typeof text !== "string" || text.length < MIN_CONTENT_LENGTH) {
    return false;
  }

  const cleanText = text.replace(/[#*`\[\]]/g, "").trim();
  if (cleanText.length < MIN_CONTENT_LENGTH) {
    return false;
  }

  const invalidPatterns = [
    /^[\s\d]*$/,
    /^.{1,5}$/,
    /^(yes|no|ok|好|是)$/i,
  ];

  return !invalidPatterns.some((p) => p.test(cleanText));
}

function extractMessages(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    const messages = Array.isArray(data) ? data : data.messages || [];

    const validMessages = messages.filter(isValidMessage);

    if (validMessages.length === 0) {
      return null;
    }

    const mergedContent = [];

    for (const msg of validMessages) {
      const role = msg.type || msg.role || msg.speaker || "";
      const text = msg.message?.content || msg.content || msg.text || "";
 = text.replace(/[#*`\[\      const cleanText]]/g, "").trim().substring(0, 200);

      if (role.includes("user") || role === "human" || role === "USER") {
        if (mergedContent.length === 0 || mergedContent[mergedContent.length - 1].role !== "user") {
          mergedContent.push({ role: "USER", text: cleanText });
        } else {
          mergedContent[mergedContent.length - 1].text += " " + cleanText;
        }
      } else {
        if (mergedContent.length > 0 && mergedContent[mergedContent.length - 1].role === "USER") {
          mergedContent[mergedContent.length - 1].response = cleanText;
        }
      }
    }

    return mergedContent.filter((m) => m.text && m.text.length >= MIN_CONTENT_LENGTH);
  } catch (e) {
    return null;
  }
}

function findSessions() {
  const cliPaths = getSessionPaths();
  const sessions = [];

  for (const [cli, dirPath] of Object.entries(cliPaths)) {
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file === "user-state.json" || file === "slash_commands.json") continue;

      const filePath = path.join(dirPath, file);
      const messages = extractMessages(filePath);

      if (!messages || messages.length === 0) continue;

      try {
        const stats = fs.statSync(filePath);
        sessions.push({
          cli,
          file,
          path: filePath,
          time: stats.mtime,
          messages,
          messageCount: messages.length,
        });
      } catch (e) {}
    }
  }

  sessions.sort((a, b) => b.time - a.time);
  return sessions.slice(0, MAX_SESSIONS);
}

function formatTime(date) {
  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);

  if (diffHours < 1) {
    return `${Math.floor(diffHours * 60)}分钟前`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}小时前`;
  } else {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
}

function formatSession(session) {
  const output = [];

  for (const msg of session.messages.slice(0, 3)) {
    if (msg.role === "USER") {
      output.push(`👤 ${msg.text.substring(0, 100)}${msg.text.length > 100 ? "..." : ""}`);
      if (msg.response) {
        output.push(`🤖 ${msg.response.substring(0, 100)}${msg.response.length > 100 ? "..." : ""}`);
      }
      output.push("");
    }
  }

  return output.join("\n");
}

function main() {
  const sessions = findSessions();

  if (sessions.length === 0) {
    console.log("未找到有效的会话记录");
    return 1;
  }

  console.log(`📋 最近 ${sessions.length} 个有效会话:\n`);

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    console.log(`--- 会话 ${i + 1} | ${session.cli.toUpperCase()} | ${formatTime(session.time)} ---`);
    console.log(formatSession(session));
  }

  console.log("💡 输入序号继续某个会话，或描述你的需求");

  return 0;
}

process.exit(main());
