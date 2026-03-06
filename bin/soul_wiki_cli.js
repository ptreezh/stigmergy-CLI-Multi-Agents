#!/usr/bin/env node

/**
 * Soul Wiki CLI - Wiki风格的顺序进化命令行工具
 *
 * 用法:
 *   node soul_wiki_cli.js status      # 查看状态
 *   node soul_wiki_cli.js trigger     # 触发单轮进化
 *   node soul_wiki_cli.js verify      # 验证知识一致性
 */

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const HOME = process.env.HOME || process.env.USERPROFILE;
const BASE_PATH = path.join(HOME, ".stigmergy", "skills");
const WIKI_PATH = path.join(BASE_PATH, ".soul_wiki");

const CLI_LIST = [
  "claude",
  "qwen",
  "opencode",
  "gemini",
  "iflow",
  "qoder",
  "codex",
];

class SoulWikiCLI {
  constructor() {
    this.stateFile = path.join(WIKI_PATH, "state.json");
    this.historyFile = path.join(WIKI_PATH, "history.json");
    this.state = this._loadState();
  }

  _loadState() {
    if (fs.existsSync(this.stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFile, "utf-8"));
      } catch (e) {
        return { currentIndex: 0, isRunning: false };
      }
    }
    return { currentIndex: 0, isRunning: false };
  }

  _saveState() {
    if (!fs.existsSync(WIKI_PATH)) {
      fs.mkdirSync(WIKI_PATH, { recursive: true });
    }
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  async status() {
    console.log("\n📊 Soul Wiki Status\n");
    console.log(`   Mode: Sequential (伪并发)`);
    console.log(`   Current CLI: ${CLI_LIST[this.state.currentIndex]}`);
    console.log(`   Order: ${CLI_LIST.join(" → ")}`);
    console.log(`   Running: ${this.state.isRunning ? "✅ Yes" : "❌ No"}`);

    // 检查各CLI知识库
    console.log("\n📚 Knowledge Bases:\n");
    for (const cli of CLI_LIST) {
      const kbPath = path.join(BASE_PATH, ".soul_kb", `${cli}_kb.json`);
      let entries = 0;
      if (fs.existsSync(kbPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(kbPath, "utf-8"));
          entries = data.entries?.length || 0;
        } catch (e) {}
      }
      console.log(`   ${entries > 0 ? "✅" : "⚪"} ${cli}: ${entries} entries`);
    }
    console.log("");
  }

  async trigger() {
    const cliName = CLI_LIST[this.state.currentIndex];
    console.log(`\n⚡ Evolving: ${cliName}\n`);

    // 执行进化
    const result = await this._evolveCLI(cliName);

    // 记录历史
    this._recordHistory(cliName, result);

    // 轮转索引
    this.state.currentIndex = (this.state.currentIndex + 1) % CLI_LIST.length;
    this._saveState();

    console.log(
      `\n✅ Complete: ${cliName} - ${result.knowledgeAdded} knowledge added\n`,
    );
  }

  _evolveCLI(cliName) {
    return new Promise((resolve) => {
      const proc = spawn("stigmergy", ["soul", "evolve", cliName], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      proc.stdout.on("data", (d) => (output += d.toString()));
      proc.stderr.on("data", (d) => (output += d.toString()));

      proc.on("close", (code) => {
        const match = output.match(/Knowledge added:\s*(\d+)/);
        resolve({
          cli: cliName,
          success: code === 0,
          knowledgeAdded: match ? parseInt(match[1]) : 0,
          timestamp: new Date().toISOString(),
        });
      });

      setTimeout(() => {
        proc.kill();
        resolve({ cli: cliName, success: false, knowledgeAdded: 0 });
      }, 60000);
    });
  }

  _recordHistory(cliName, result) {
    let history = [];
    if (fs.existsSync(this.historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(this.historyFile, "utf-8"));
      } catch (e) {}
    }

    history.push({
      cli: cliName,
      timestamp: result.timestamp,
      knowledgeAdded: result.knowledgeAdded,
      success: result.success,
    });

    // 只保留最近50条
    if (history.length > 50) history = history.slice(-50);

    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
  }

  async verify() {
    console.log("\n🔍 Verifying Knowledge Consistency\n");

    const kbPath = path.join(BASE_PATH, ".soul_kb");
    const entries = {};

    // 加载所有KB
    for (const cli of CLI_LIST) {
      const file = path.join(kbPath, `${cli}_kb.json`);
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, "utf-8"));
          entries[cli] = data.entries || [];
        } catch (e) {
          entries[cli] = [];
        }
      } else {
        entries[cli] = [];
      }
    }

    // 统计
    console.log("📊 By CLI:\n");
    for (const cli of CLI_LIST) {
      console.log(`   ${cli}: ${entries[cli].length} entries`);
    }

    // 检查是否有共同知识
    console.log("\n🔗 Common Knowledge:\n");
    const allKeywords = new Map();

    for (const cli of CLI_LIST) {
      for (const entry of entries[cli]) {
        for (const kw of entry.keywords || []) {
          if (!allKeywords.has(kw)) {
            allKeywords.set(kw, new Set());
          }
          allKeywords.get(kw).add(cli);
        }
      }
    }

    // 找出多CLI共享的知识
    let sharedCount = 0;
    for (const [kw, clis] of allKeywords) {
      if (clis.size > 1) {
        sharedCount++;
      }
    }

    console.log(`   Shared keywords: ${sharedCount}`);
    console.log("");
  }
}

// 主入口
const args = process.argv.slice(2);
const cmd = args[0] || "status";

const wiki = new SoulWikiCLI();

if (cmd === "status") {
  wiki.status();
} else if (cmd === "trigger") {
  wiki.trigger().then(() => process.exit(0));
} else if (cmd === "verify") {
  wiki.verify();
} else if (cmd === "help") {
  console.log(`
🌀 Soul Wiki CLI - Wiki风格顺序进化

用法:
  node soul_wiki_cli.js status    # 查看状态
  node soul_wiki_cli.js trigger  # 触发单轮进化
  node soul_wiki_cli.js verify   # 验证知识一致性

原理:
  - 时间完全错开: 每次只进化一个CLI
  - 相互核查: 进化后验证其他CLI知识
  - 共识裁决: 冲突时majority vote
`);
} else {
  console.log(`Unknown command: ${cmd}`);
  console.log("Use: status, trigger, verify, help");
}
