#!/usr/bin/env node
/**
 * Independent Session Recovery Tool
 * Find and recover the latest session across all CLIs
 * Does NOT depend on Stigmergy installation
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

class IndependentSessionRecovery {
  constructor() {
    this.projectPath = process.cwd();
    this.cliPaths = this.getAllCLISessionPaths();
  }

  getAllCLISessionPaths() {
    const homeDir = os.homedir();
    return {
      claude: path.join(homeDir, ".claude", "projects"),
      gemini: path.join(homeDir, ".config", "gemini", "tmp"),
      qwen: path.join(homeDir, ".qwen", "projects"),
      iflow: path.join(homeDir, ".iflow", "projects"),
      codebuddy: path.join(homeDir, ".codebuddy"),
      codex: path.join(homeDir, ".config", "codex"),
      qodercli: path.join(homeDir, ".qoder", "projects"),
      kode: path.join(homeDir, ".kode", "projects"),
    };
  }

  getProjectDirName(cliType) {
    return this.projectPath
      .replace(/^([A-Za-z]):\\/, "$1--")
      .replace(/\\/g, "-");
  }

  findLatestSession() {
    let latestSession = null;
    let latestTime = new Date(0);

    for (const [cliType, basePath] of Object.entries(this.cliPaths)) {
      if (!fs.existsSync(basePath)) continue;

      const session = this.findLatestSessionForCLI(cliType, basePath);
      if (session && session.modified > latestTime) {
        latestSession = session;
        latestTime = session.modified;
      }
    }

    return latestSession;
  }

  findLatestSessionForCLI(cliType, basePath) {
    const projectDirName = this.getProjectDirName(cliType);
    let sessionPath = basePath;

    if (
      ["claude", "iflow", "qodercli", "kode"].includes(cliType) &&
      basePath.includes("projects")
    ) {
      sessionPath = path.join(basePath, projectDirName);
    } else if (cliType === "gemini" && basePath.includes("tmp")) {
      try {
        const hashDirs = fs.readdirSync(basePath);
        for (const hashDir of hashDirs) {
          const hashDirPath = path.join(basePath, hashDir);
          const chatsPath = path.join(hashDirPath, "chats");
          if (fs.existsSync(chatsPath)) {
            const session = this.findLatestSessionInDir(
              chatsPath,
              cliType,
              hashDir,
            );
            if (session) return session;
          }
        }
        return null;
      } catch (error) {
        return null;
      }
    } else if (cliType === "qwen" && basePath.includes("projects")) {
      const chatsPath = path.join(basePath, projectDirName, "chats");
      if (fs.existsSync(chatsPath)) {
        return this.findLatestSessionInDir(chatsPath, cliType, projectDirName);
      }
      return null;
    } else if (cliType === "codebuddy") {
      const projectsPath = path.join(basePath, "projects");
      if (fs.existsSync(projectsPath)) {
        const projectPath = path.join(projectsPath, projectDirName);
        if (fs.existsSync(projectPath)) {
          const session = this.findLatestSessionInDir(
            projectPath,
            cliType,
            projectDirName,
          );
          if (session) return session;
        }
      }
      return this.findLatestSessionInDir(basePath, cliType, "root");
    }

    if (!fs.existsSync(sessionPath)) return null;

    return this.findLatestSessionInDir(sessionPath, cliType, projectDirName);
  }

  findLatestSessionInDir(dirPath, cliType, context) {
    try {
      const files = fs.readdirSync(dirPath);

      const sessionFiles = files.filter((file) => {
        if (cliType === "codebuddy" && file === "user-state.json") {
          return false;
        }
        if (cliType === "codex" && file === "slash_commands.json") {
          return false;
        }
        return (
          file.endsWith(".jsonl") ||
          file.endsWith(".json") ||
          file.endsWith(".session")
        );
      });

      if (sessionFiles.length === 0) return null;

      let latestFile = null;
      let latestTime = new Date(0);

      for (const file of sessionFiles) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.mtime > latestTime) {
            latestTime = stats.mtime;
            latestFile = file;
          }
        } catch (error) {
          continue;
        }
      }

      if (!latestFile) return null;

      return {
        cliType,
        file: latestFile,
        path: path.join(dirPath, latestFile),
        modified: latestTime,
        context,
      };
    } catch (error) {
      return null;
    }
  }

  readFullSession(sessionPath) {
    try {
      const content = fs.readFileSync(sessionPath, "utf8");

      if (sessionPath.endsWith(".jsonl")) {
        const lines = content
          .trim()
          .split("\n")
          .filter((line) => line.trim());
        return lines
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter((msg) => msg !== null);
      } else {
        return JSON.parse(content);
      }
    } catch (error) {
      return null;
    }
  }

  extractMessageContent(msg) {
    if (msg.message && typeof msg.message === "object") {
      const content = msg.message.content || msg.message.text || "";
      return this.extractTextFromContent(content);
    }

    const content = msg.content || msg.text || "";
    return this.extractTextFromContent(content);
  }

  extractTextFromContent(content) {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            return item.text || item.content || "";
          }
          return "";
        })
        .filter((text) => text && typeof text === "string")
        .join(" ");
    }

    if (content && typeof content === "object") {
      return content.text || content.content || "";
    }

    return "";
  }

  formatFullSession(session) {
    const messages = this.readFullSession(session.path);
    if (!messages) {
      return null;
    }

    const messageList = Array.isArray(messages)
      ? messages
      : messages.messages && Array.isArray(messages.messages)
        ? messages.messages
        : [];

    if (messageList.length === 0) {
      return null;
    }

    let userMsg = null;
    let assistantMsg = null;

    for (let i = 0; i < messageList.length; i++) {
      const msg = messageList[i];
      const role = msg.type || msg.role || msg.speaker || "";
      const content = this.extractMessageContent(msg);

      if (
        !userMsg &&
        (role === "user" ||
          role === "human" ||
          role === "USER" ||
          role.includes("user"))
      ) {
        userMsg = content;
      }
      if (
        !assistantMsg &&
        (role === "assistant" ||
          role === "ai" ||
          role === "ASSISTANT" ||
          role.includes("assistant"))
      ) {
        assistantMsg = content;
      }
    }

    const dateStr =
      session.modified.getFullYear() +
      "/" +
      (session.modified.getMonth() + 1) +
      "/" +
      session.modified.getDate() +
      " " +
      session.modified.getHours() +
      ":" +
      String(session.modified.getMinutes()).padStart(2, "0");

    const output = [];
    output.push("[" + dateStr + "] " + session.cliType.toUpperCase());
    output.push("👤 " + (userMsg || "N/A").substring(0, 200));
    if (assistantMsg) {
      output.push("🤖 " + assistantMsg.substring(0, 200));
    }

    return output.join("\n");
  }

  execute(options = {}) {
    const { fullRecovery = true, listOnly = false, cliFilter = null } = options;

    if (listOnly) {
      return this.listAllSessions(cliFilter);
    }

    let session;

    if (cliFilter) {
      const basePath = this.cliPaths[cliFilter.toLowerCase()];
      if (basePath && fs.existsSync(basePath)) {
        session = this.findLatestSessionForCLI(
          cliFilter.toLowerCase(),
          basePath,
        );
      }
    } else {
      session = this.findLatestSession();
    }

    if (!session) {
      console.log("No sessions found");
      return 1;
    }

    if (!fullRecovery) {
      this.showSessionSummary(session);
    } else {
      const formatted = this.formatFullSession(session);
      if (formatted) {
        console.log(formatted);
      } else {
        console.log("Cannot parse session content");
        return 1;
      }
    }

    return 0;
  }

  showSessionSummary(session) {
    console.log(
      session.cliType.toUpperCase() +
        " | " +
        session.modified.toLocaleString() +
        " | " +
        session.file,
    );
  }

  listAllSessions(cliFilter = null) {
    const sessions = [];

    for (const [cliType, basePath] of Object.entries(this.cliPaths)) {
      if (cliFilter && cliType.toLowerCase() !== cliFilter.toLowerCase())
        continue;

      if (!fs.existsSync(basePath)) continue;

      const session = this.findLatestSessionForCLI(cliType, basePath);
      if (session) {
        sessions.push(session);
      }
    }

    if (sessions.length === 0) {
      console.log("No sessions found");
      return 1;
    }

    sessions.sort((a, b) => b.modified - a.modified);

    sessions.forEach((session, index) => {
      console.log(
        index +
          1 +
          ". [" +
          session.modified.toLocaleString() +
          "] " +
          session.cliType.toUpperCase(),
      );
    });

    return 0;
  }
}

if (require.main === module) {
  const recovery = new IndependentSessionRecovery();

  const options = {
    fullRecovery: true,
    listOnly: false,
    cliFilter: null,
  };
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--list" || arg === "-l") {
      options.listOnly = true;
    } else if (arg === "--summary" || arg === "-s") {
      options.fullRecovery = false;
    } else if (arg === "--cli" && i + 1 < args.length) {
      options.cliFilter = args[++i];
    }
  }

  const exitCode = recovery.execute(options);
  process.exit(exitCode);
}

module.exports = IndependentSessionRecovery;
