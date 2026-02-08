#!/usr/bin/env node
/**
 * Shared Context Manager
 * Coordinates concurrent access to STIGMERGY.md with file locking
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const FileLock = require("./FileLock");

const STIGMERGY_FILE = "STIGMERGY.md";

class SharedContextManager {
  constructor(options = {}) {
    this.projectDir = options.projectDir || process.cwd();
    this.contextFile = path.join(this.projectDir, STIGMERGY_FILE);
    this.fileLock = new FileLock({ timeout: 3000 });
  }

  _ensureFile() {
    if (!fs.existsSync(this.contextFile)) {
      const template = `# Stigmergy 项目状态

## 任务历史

## 决策记录

## 待办事项

## 共享上下文

`;
      fs.writeFileSync(this.contextFile, template);
    }
  }

  async readContext() {
    return this.fileLock.withLock(this.contextFile, async () => {
      this._ensureFile();
      try {
        return fs.readFileSync(this.contextFile, "utf8");
      } catch (e) {
        return "";
      }
    });
  }

  async appendEntry(cliName, entry) {
    return this.fileLock.withLock(this.contextFile, async () => {
      this._ensureFile();
      const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
      const newEntry = `
## ${cliName} - ${timestamp}
${entry}
`;

      try {
        const content = fs.readFileSync(this.contextFile, "utf8");
        fs.writeFileSync(this.contextFile, content + newEntry);
        return true;
      } catch (e) {
        console.error(`[SharedContext] Write failed: ${e.message}`);
        return false;
      }
    });
  }

  async recordTask(cliName, task, result) {
    const entry = `**任务**: ${task}
**结果**: ${typeof result === "string" ? result : JSON.stringify(result).slice(0, 500)}`;
    return await this.appendEntry(cliName, entry);
  }

  async getTaskHistory(limit = 10) {
    const content = await this.readContext();
    const entries = [];

    const lines = content.split("\n");
    let currentEntry = null;

    for (const line of lines) {
      const match = line.match(
        /^## (\S+) - (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/,
      );
      if (match) {
        if (currentEntry) entries.push(currentEntry);
        currentEntry = { cli: match[1], time: match[2], content: [] };
      } else if (currentEntry && line.trim()) {
        currentEntry.content.push(line.trim());
      }
    }
    if (currentEntry) entries.push(currentEntry);

    return entries.slice(-limit);
  }

  async clearHistory() {
    return this.fileLock.withLock(this.contextFile, async () => {
      fs.writeFileSync(
        this.contextFile,
        `# Stigmergy 项目状态

## 任务历史

## 决策记录

## 待办事项

## 共享上下文

`,
      );
      return true;
    });
  }
}

module.exports = SharedContextManager;
