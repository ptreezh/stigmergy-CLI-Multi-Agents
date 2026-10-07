const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");
const { CLI_TOOLS } = require("./cli_tools");
const { AGENT_STATES_DIR, NATIVE_SESSION_DIRS } = require("./agent_registry");

const TOKEN_EXHAUSTION_PATTERNS = [
  /token/i,
  /rate.limit/i,
  /quota/i,
  /context.length/i,
  /maximum.context/i,
  /too.many.tokens/i,
  /token.limit/i,
  /usage.limit/i,
  /insufficient.quota/i,
  /billing/i,
  /plan.limit/i,
];

const PROCESS_CHECK_COMMANDS = {
  win32: (name) => ["tasklist", "/FI", `IMAGENAME eq ${name}.exe`, "/FO", "CSV", "/NH"],
  darwin: (name) => ["ps", "-A", "-o", "comm"],
  linux: (name) => ["ps", "-A", "-o", "comm"],
};

class AgentStateCollector {
  constructor(options = {}) {
    this.agentStatesDir = options.agentStatesDir || AGENT_STATES_DIR;
    this.tokenExhaustionPatterns = options.tokenExhaustionPatterns || TOKEN_EXHAUSTION_PATTERNS;
  }

  async collectAll(registry) {
    const agents = [];

    for (const agent of [...registry.cli, ...registry.desktop, ...registry.evolved]) {
      try {
        const state = await this.collect(agent);
        agents.push(state);
      } catch (error) {
        agents.push({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: "error",
          error: error.message,
          collectedAt: new Date().toISOString(),
        });
      }
    }

    return agents;
  }

  async collect(agent) {
    const state = {
      id: agent.id,
      name: agent.name,
      type: agent.type,
      installed: agent.installed,
      path: agent.path,
      version: agent.version,
      status: "unknown",
      lastHeartbeat: null,
      lastUsed: null,
      conversationDepth: 0,
      sessionCount: 0,
      tokenExhausted: false,
      tokenExhaustionReason: null,
      errorCount: 0,
      lastError: null,
      capabilities: {
        interactive: false,
        oneTime: false,
        autoMode: false,
      },
      collectedAt: new Date().toISOString(),
    };

    if (!state.installed) {
      state.status = "offline";
      return state;
    }

    const evolvedState = await this._readEvolvedState(agent);
    if (evolvedState) {
      state.lastHeartbeat = evolvedState.lastUpdate || evolvedState.lastEvolution?.timestamp || null;
      state.lastUsed = evolvedState.lastUpdate || null;
      state.errorCount = this._countErrors(evolvedState);
      state.lastError = evolvedState.lastEvolution?.error || null;
    }

    const sessionInfo = await this._countSessions(agent);
    state.sessionCount = sessionInfo.count;
    state.lastUsed = state.lastUsed || sessionInfo.lastSession || null;

    const conversationDepth = await this._estimateConversationDepth(agent);
    state.conversationDepth = conversationDepth;

    if (!state.lastError) {
      const sessionError = await this._scanSessionFileForTokenErrors(agent);
      if (sessionError) {
        state.lastError = sessionError;
      }
    }

    state.tokenExhausted = this._detectTokenExhaustion(state);
    if (state.tokenExhausted) {
      state.tokenExhaustionReason = this._getTokenExhaustionReason(state);
    }

    const processRunning = await this._checkProcessRunning(agent);
    state.processRunning = processRunning;

    if (processRunning) {
      state.status = state.tokenExhausted ? "token-exhausted" : "active";
      state.lastHeartbeat = state.lastHeartbeat || new Date().toISOString();
    } else if (state.installed && state.sessionCount > 0) {
      state.status = state.tokenExhausted ? "token-exhausted" : "idle";
    } else if (state.installed) {
      state.status = "idle";
    } else {
      state.status = "offline";
    }

    state.capabilities = this._detectCapabilities(agent);

    return state;
  }

  async _readEvolvedState(agent) {
    const stateFile = path.join(this.agentStatesDir, agent.id, "state.json");
    try {
      const content = await fs.readFile(stateFile, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async _countSessions(agent) {
    const sessionDirs = NATIVE_SESSION_DIRS[agent.id];
    if (!sessionDirs) {
      const agentSessionDir = path.join(this.agentStatesDir, agent.id);
      try {
        const entries = await fs.readdir(agentSessionDir, { withFileTypes: true });
        const fileCount = entries.filter((e) => e.isFile()).length;
        const latestFile = entries
          .filter((e) => e.isFile())
          .sort((a, b) => b.name.localeCompare(a.name))[0];
        return {
          count: fileCount,
          lastSession: latestFile ? this._extractTimestamp(latestFile.name) : null,
        };
      } catch {
        return { count: 0, lastSession: null };
      }
    }

    try {
      await fs.access(sessionDirs);
      const entries = await fs.readdir(sessionDirs, { withFileTypes: true });
      const sessionFiles = entries.filter((f) => {
        const ext = path.extname(f.name).toLowerCase();
        return [".json", ".jsonl", ".session", ".md"].includes(ext);
      });

      let lastSession = null;
      if (sessionFiles.length > 0) {
        const sorted = sessionFiles.sort((a, b) => {
          const ta = this._extractTimestamp(a.name) || "";
          const tb = this._extractTimestamp(b.name) || "";
          return tb.localeCompare(ta);
        });
        lastSession = this._extractTimestamp(sorted[0].name) || null;
      }

      return {
        count: sessionFiles.length,
        lastSession,
      };
    } catch {
      return { count: 0, lastSession: null };
    }
  }

  async _estimateConversationDepth(agent) {
    const sessionDirs = NATIVE_SESSION_DIRS[agent.id];
    if (!sessionDirs) return 0;

    try {
      await fs.access(sessionDirs);
      const entries = await fs.readdir(sessionDirs, { withFileTypes: true });
      const sessionFiles = entries.filter((e) => {
        if (!e.isFile()) return false;
        const ext = path.extname(e.name).toLowerCase();
        return [".json", ".jsonl", ".session"].includes(ext);
      });

      let totalMessages = 0;
      for (const file of sessionFiles.slice(0, 5)) {
        try {
          const fullPath = path.join(sessionDirs, file.name);
          const content = await fs.readFile(fullPath, "utf8");
          const lines = content.split("\n").filter((l) => l.trim());
          totalMessages += lines.length;
        } catch {
          continue;
        }
      }

      const avgDepth = sessionFiles.length > 0 ? Math.round(totalMessages / Math.min(sessionFiles.length, 5)) : 0;
      return Math.min(avgDepth, 200);
    } catch {
      return 0;
    }
  }

  _detectTokenExhaustion(state) {
    if (state.lastError) {
      for (const pattern of this.tokenExhaustionPatterns) {
        if (pattern.test(state.lastError)) {
          return true;
        }
      }
    }

    if (state.conversationDepth > 80) {
      return true;
    }

    return false;
  }

  _getTokenExhaustionReason(state) {
    if (state.lastError) {
      for (const pattern of this.tokenExhaustionPatterns) {
        const match = state.lastError.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }

    if (state.conversationDepth > 80) {
      return `high conversation depth (${state.conversationDepth} messages)`;
    }

    return "unknown";
  }

  async _readEvolvedState(agent) {
    const stateFile = path.join(this.agentStatesDir, agent.id, "state.json");
    try {
      const content = await fs.readFile(stateFile, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async _scanSessionFileForTokenErrors(agent) {
    const sessionDirs = NATIVE_SESSION_DIRS[agent.id];
    if (!sessionDirs) return null;

    try {
      await fs.access(sessionDirs);
      const entries = await fs.readdir(sessionDirs, { withFileTypes: true });
      const sessionFiles = entries.filter((e) => {
        if (!e.isFile()) return false;
        const ext = path.extname(e.name).toLowerCase();
        return [".json", ".jsonl", ".session", ".md"].includes(ext);
      });

      const sorted = sessionFiles.sort((a, b) => b.name.localeCompare(a.name));
      for (const file of sorted.slice(0, 5)) {
        try {
          const fullPath = path.join(sessionDirs, file.name);
          const content = await fs.readFile(fullPath, "utf8");
          for (const pattern of this.tokenExhaustionPatterns) {
            if (pattern.test(content)) {
              return content.match(pattern)?.[0] || null;
            }
          }
        } catch {
          continue;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  _detectTokenExhaustion(state) {
    if (state.lastError) {
      for (const pattern of this.tokenExhaustionPatterns) {
        if (pattern.test(state.lastError)) {
          return true;
        }
      }
    }

    if (state.conversationDepth > 80) {
      return true;
    }

    return false;
  }

  _getTokenExhaustionReason(state) {
    if (state.lastError) {
      for (const pattern of this.tokenExhaustionPatterns) {
        const match = state.lastError.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }

    if (state.conversationDepth > 80) {
      return `high conversation depth (${state.conversationDepth} messages)`;
    }

    return "unknown";
  }

  async _checkProcessRunning(agent) {
    const platform = process.platform;
    const commandBuilder = PROCESS_CHECK_COMMANDS[platform];
    if (!commandBuilder) return false;

    const command = commandBuilder(agent.id);
    try {
      const result = spawnSync(command[0], command.slice(1), {
        encoding: "utf8",
        timeout: 3000,
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      });

      if (result.status !== 0 && result.status !== null) {
        return false;
      }

      const output = (result.stdout || result.stderr || "").toLowerCase();
      const searchName = agent.id.toLowerCase();

      if (platform === "win32") {
        const csvLines = output.split("\n").filter((l) => l.trim());
        for (const line of csvLines) {
          if (line.includes(searchName)) {
            return true;
          }
        }
        return false;
      }

      return output.includes(searchName);
    } catch {
      return false;
    }
  }

  _detectCapabilities(agent) {
    const capabilities = {
      interactive: false,
      oneTime: false,
      autoMode: false,
    };

    if (agent.type === "evolved") {
      capabilities.interactive = true;
      capabilities.oneTime = true;
      capabilities.autoMode = true;
      return capabilities;
    }

    const toolConfig = CLI_TOOLS[agent.id];
    if (!toolConfig) return capabilities;

    const adapterEntry = require("./cli_adapters").CLI_ADAPTERS[agent.id];
    if (adapterEntry) {
      capabilities.interactive = adapterEntry.supportsInteractive || false;
      capabilities.oneTime = adapterEntry.supportsOneTime || false;
      capabilities.autoMode = adapterEntry.supportsAutoMode || false;
    }

    return capabilities;
  }

  _countErrors(evolvedState) {
    let count = 0;
    if (evolvedState.lastEvolution && !evolvedState.lastEvolution.success) {
      count++;
    }
    return count;
  }

  _extractTimestamp(filename) {
    const match = filename.match(/(\d{13})/);
    if (match) {
      const ts = parseInt(match[1], 10);
      if (ts > 1000000000000) {
        return new Date(ts).toISOString();
      }
    }

    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]).toISOString();
    }

    return null;
  }
}

module.exports = { AgentStateCollector, TOKEN_EXHAUSTION_PATTERNS };
