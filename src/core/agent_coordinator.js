const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { AgentRegistry } = require("./agent_registry");
const { AgentStateCollector } = require("./agent_state_collector");

const CONFIG_PATH = path.join(__dirname, "..", "..", "config", "enhanced-cli-config.json");

const TASK_CONTEXT_PATTERNS = [
  /test/i,
  /spec/i,
  /fix/i,
  /refactor/i,
  /review/i,
  /docs?/i,
  /build/i,
  /deploy/i,
  /analyze/i,
  /security/i,
];

const WORKDIR_INDICATORS = [
  "package.json",
  "tsconfig.json",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "README.md",
];

class AgentCoordinator {
  constructor(options = {}) {
    this.registry = new AgentRegistry(options.registryOptions);
    this.collector = new AgentStateCollector(options.collectorOptions);
    this.agentStates = new Map();
    this.taskHistory = [];
    this.failureCounts = new Map();
    this.maxConsecutiveFailures = options.maxConsecutiveFailures || 3;
    this.config = null;
    this.configPath = options.configPath || CONFIG_PATH;
    this.routingStrategy = options.routingStrategy || null;
    this.agentContextCache = new Map();
    this.autoCoordinationEnabled = options.autoCoordinationEnabled || false;
    this.autoCoordinationInterval = options.autoCoordinationInterval || 4 * 60 * 60 * 1000;
    this.autoCoordinationTimer = null;
    this.lastAutoCoordination = null;
    this.autoCoordinationHistory = [];
  }

  async initialize() {
    await this._loadConfig();
    await this.refreshStates();
  }

  startAutoCoordination(options = {}) {
    if (this.autoCoordinationTimer) {
      clearInterval(this.autoCoordinationTimer);
    }

    this.autoCoordinationEnabled = true;
    const interval = options.interval || this.autoCoordinationInterval;

    this.autoCoordinationTimer = setInterval(async () => {
      try {
        await this.autoCoordinate();
      } catch (error) {
        console.error(`[AutoCoordinator] Cycle failed: ${error.message}`);
      }
    }, interval);

    this.autoCoordinationHistory.push({
      type: "started",
      timestamp: new Date().toISOString(),
      intervalMs: interval,
    });

    return {
      started: true,
      intervalMs: interval,
      nextRunIn: interval,
    };
  }

  stopAutoCoordination() {
    if (this.autoCoordinationTimer) {
      clearInterval(this.autoCoordinationTimer);
      this.autoCoordinationTimer = null;
    }

    this.autoCoordinationEnabled = false;
    this.autoCoordinationHistory.push({
      type: "stopped",
      timestamp: new Date().toISOString(),
    });

    return { stopped: true };
  }

  getAutoCoordinationStatus() {
    return {
      enabled: this.autoCoordinationEnabled,
      intervalMs: this.autoCoordinationInterval,
      lastRun: this.lastAutoCoordination,
      history: this.autoCoordinationHistory.slice(-10),
    };
  }

  async autoCoordinate() {
    await this.refreshStates();
    const result = {
      timestamp: new Date().toISOString(),
      scanned: this.getAllAgentStates().length,
      actions: [],
    };

    const exhausted = this.getTokenExhaustedAgents();
    const idle = this.getIdleAgents();
    const active = this.getActiveAgents();

    if (exhausted.length > 0 && idle.length > 0) {
      const suggestions = await this.suggestTakeover();
      for (const suggestion of suggestions.suggestions) {
        const takeoverResult = await this.takeOver(
          suggestion.fromAgent,
          suggestion.toAgent,
          `auto-takeover: ${suggestion.fromReason || "token exhaustion"}`
        );

        result.actions.push({
          type: "takeover",
          success: takeoverResult.success,
          from: suggestion.fromAgent,
          to: suggestion.toAgent,
          reason: takeoverResult.reason || takeoverResult.error,
        });

        await this.recordTaskResult(
          suggestion.toAgent,
          `auto-takeover:${suggestion.fromAgent}`,
          takeoverResult.success,
          takeoverResult.error || null,
          0
        );
      }
    }

    if (active.length > 0 && idle.length > 0) {
      for (const activeAgent of active) {
        const recentTask = this.taskHistory
          .slice(-10)
          .reverse()
          .find((t) => t.agentId === activeAgent.id && t.success);

        if (recentTask) {
          const taskContext = this._extractTaskContext(recentTask.task);
          const bestIdle = this._findBestIdleAgentForContext(taskContext, idle);

          if (bestIdle && bestIdle.id !== activeAgent.id) {
            const routeResult = await this.routeTask(recentTask.task, {
              agent: bestIdle.id,
              forceAgent: true,
            });

            if (routeResult.agent) {
              result.actions.push({
                type: "context-rebalance",
                success: true,
                from: activeAgent.id,
                to: bestIdle.id,
                context: taskContext,
                reason: routeResult.reason,
              });

              await this.recordTaskResult(
                bestIdle.id,
                `context-rebalance:${recentTask.task}`,
                true,
                null,
                0
              );
            }
          }
        }
      }
    }

    this.lastAutoCoordination = new Date().toISOString();
    this.autoCoordinationHistory.push({
      type: "cycle",
      timestamp: this.lastAutoCoordination,
      ...result,
    });

    if (this.autoCoordinationHistory.length > 100) {
      this.autoCoordinationHistory = this.autoCoordinationHistory.slice(-100);
    }

    return result;
  }

  async routeTaskByContext(task, options = {}) {
    const taskContext = options.taskContext || this._extractTaskContext(task);
    const candidates = options.candidates || this._getCandidateAgents(taskContext);

    const scoredCandidates = await Promise.all(
      candidates.map(async (agentId) => {
        const state = this.getAgentState(agentId);
        if (!state || state.status === "token-exhausted" || state.status === "error" || state.status === "offline") {
          return { agentId, score: -1, state };
        }

        const context = await this._readAgentContext(state);
        const score = this._scoreAgentForTask(state, context, taskContext);

        return { agentId, score, state, context };
      })
    );

    scoredCandidates.sort((a, b) => b.score - a.score);

    const best = scoredCandidates.find((c) => c.score > 0);
    if (!best) {
      const fallback = await this.routeTask(task, { taskType: taskContext });
      return { agent: fallback.agent, reason: `context-fallback:${fallback.reason}`, state: fallback.state, scoredCandidates };
    }

    return {
      agent: best.agentId,
      reason: `context-match:${best.score}`,
      state: best.state,
      scoredCandidates,
    };
  }

  _extractTaskContext(task) {
    if (!task) return "general";
    const text = typeof task === "string" ? task : JSON.stringify(task);

    for (const pattern of TASK_CONTEXT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        return match[0].toLowerCase();
      }
    }

    return "general";
  }

  async _readAgentContext(agent) {
    if (this.agentContextCache.has(agent.id)) {
      return this.agentContextCache.get(agent.id);
    }

    const context = {
      workingDir: null,
      recentFiles: [],
      keywords: [],
      taskTypes: [],
    };

    try {
      if (agent.path && await fs.access(agent.path).then(() => true).catch(() => false)) {
        context.workingDir = agent.path;

        try {
          const entries = await fs.readdir(agent.path, { withFileTypes: true });
          const files = entries
            .filter((e) => e.isFile())
            .map((e) => e.name)
            .slice(0, 20);

          context.recentFiles = files;

          for (const file of files) {
            for (const indicator of WORKDIR_INDICATORS) {
              if (file.toLowerCase() === indicator.toLowerCase()) {
                context.taskTypes.push("project-root");
                break;
              }
            }

            const lower = file.toLowerCase();
            if (lower.includes("test")) context.taskTypes.push("test");
            else if (lower.includes("doc")) context.taskTypes.push("docs");
            else if (lower.includes("build") || lower.includes("makefile")) context.taskTypes.push("build");
            else if (lower.includes("deploy") || lower.includes("docker")) context.taskTypes.push("deploy");
            else if (lower.includes("analyze") || lower.includes("lint")) context.taskTypes.push("analyze");
          }
        } catch {
          context.recentFiles = [];
        }
      }
    } catch {
      context.workingDir = null;
    }

    this.agentContextCache.set(agent.id, context);
    return context;
  }

  _scoreAgentForTask(agentState, agentContext, taskContext) {
    if (!taskContext || taskContext === "general") return 1;

    let score = 0;

    if (agentContext.taskTypes && agentContext.taskTypes.includes(taskContext)) {
      score += 10;
    }

    const keywords = agentContext.keywords || [];
    for (const keyword of keywords) {
      if (keyword.toLowerCase().includes(taskContext.toLowerCase())) {
        score += 5;
      }
    }

    if (agentState.status === "idle") score += 3;
    else if (agentState.status === "active") score += 1;

    if (agentState.lastUsed) {
      const idleMinutes = (Date.now() - new Date(agentState.lastUsed).getTime()) / (1000 * 60);
      if (idleMinutes > 60) score += 2;
    }

    return score;
  }

  async _findBestIdleAgentForContext(taskContext, idleAgents) {
    const scored = await Promise.all(
      idleAgents.map(async (agent) => {
        const context = await this._readAgentContext(agent);
        const score = this._scoreAgentForTask(agent, context, taskContext);
        return { agent, score, context };
      })
    );

    scored.sort((a, b) => b.score - a.score);
    const best = scored.find((s) => s.score > 0);
    return best ? best.agent : null;
  }

  async refreshStates() {
    const registry = await this.registry.scanAll();
    const states = await this.collector.collectAll(registry);
    for (const state of states) {
      this.agentStates.set(state.id, state);
    }
    return states;
  }

  getAgentState(agentId) {
    return this.agentStates.get(agentId) || null;
  }

  getAllAgentStates() {
    return Array.from(this.agentStates.values());
  }

  getAvailableAgents() {
    return this.getAllAgentStates().filter((s) => s.installed && s.status !== "offline");
  }

  getIdleAgents() {
    return this.getAllAgentStates().filter((s) => s.status === "idle");
  }

  getActiveAgents() {
    return this.getAllAgentStates().filter((s) => s.status === "active");
  }

  getTokenExhaustedAgents() {
    return this.getAllAgentStates().filter((s) => s.tokenExhausted);
  }

  getFailedAgents() {
    return this.getAllAgentStates().filter((s) => s.status === "error");
  }

  async routeTask(task, options = {}) {
    const preferredAgent = options.agent || null;
    const taskType = options.taskType || "general";
    const forceAgent = options.forceAgent || false;

    if (preferredAgent && forceAgent) {
      const state = this.getAgentState(preferredAgent);
      if (state && state.installed) {
        return { agent: preferredAgent, reason: "forced", state };
      }
    }

    await this.refreshStates();

    if (preferredAgent) {
      const state = this.getAgentState(preferredAgent);
      if (state && state.installed && state.status !== "token-exhausted" && state.status !== "error") {
        return { agent: preferredAgent, reason: "preferred-available", state };
      }

      if (state && state.tokenExhausted) {
        const fallback = this._findFallback(preferredAgent, taskType);
        if (fallback) {
          return { agent: fallback, reason: `preferred-token-exhausted-fallback`, originalAgent: preferredAgent, state: this.getAgentState(fallback) };
        }
      }
    }

    const candidates = this._getCandidateAgents(taskType);
    for (const candidate of candidates) {
      const state = this.getAgentState(candidate);
      if (state && state.status !== "token-exhausted" && state.status !== "error" && state.status !== "offline") {
        return { agent: candidate, reason: "best-available", state };
      }
    }

    const idleCandidates = candidates.filter((c) => {
      const state = this.getAgentState(c);
      return state && state.status === "idle";
    });

    if (idleCandidates.length > 0) {
      return { agent: idleCandidates[0], reason: "idle-fallback", state: this.getAgentState(idleCandidates[0]) };
    }

    return { agent: null, reason: "no-available-agent", state: null };
  }

  async recordTaskResult(agentId, task, success, error = null, duration = 0) {
    const entry = {
      agentId,
      task: typeof task === "string" ? task : JSON.stringify(task),
      success,
      error,
      duration,
      timestamp: new Date().toISOString(),
    };

    this.taskHistory.push(entry);

    if (!success) {
      const current = this.failureCounts.get(agentId) || 0;
      this.failureCounts.set(agentId, current + 1);

      const state = this.getAgentState(agentId);
      if (state) {
        state.lastError = error;
        state.errorCount = (state.errorCount || 0) + 1;
        state.lastHeartbeat = new Date().toISOString();
      }
    } else {
      this.failureCounts.set(agentId, 0);
      const state = this.getAgentState(agentId);
      if (state) {
        state.lastHeartbeat = new Date().toISOString();
        state.lastUsed = new Date().toISOString();
      }
    }

    const historyPath = path.join(os.homedir(), ".stigmergy", "agent-coordination-history.jsonl");
    try {
      await fs.mkdir(path.dirname(historyPath), { recursive: true });
      await fs.appendFile(historyPath, JSON.stringify(entry) + "\n", "utf8");
    } catch {
      // best effort
    }
  }

  async takeOver(fromAgentId, toAgentId, task) {
    const fromState = this.getAgentState(fromAgentId);
    const toState = this.getAgentState(toAgentId);

    if (!fromState || !fromState.tokenExhausted) {
      return { success: false, error: "Source agent is not token exhausted" };
    }

    if (!toState || !toState.installed) {
      return { success: false, error: "Target agent is not available" };
    }

    const result = await this.routeTask(task, { agent: toAgentId, forceAgent: true });

    return {
      success: true,
      fromAgent: fromAgentId,
      toAgent: toAgentId,
      reason: fromState.tokenExhaustionReason || "token exhaustion",
      routedAgent: result.agent,
      routedState: result.state,
    };
  }

  async suggestTakeover() {
    const exhausted = this.getTokenExhaustedAgents();
    const idle = this.getIdleAgents();

    if (exhausted.length === 0) {
      return { suggestions: [], exhaustedCount: 0, idleCount: idle.length, message: "No token-exhausted agents found" };
    }

    const suggestions = [];
    for (const exhaustedAgent of exhausted) {
      const candidates = idle.filter((idleAgent) => idleAgent.id !== exhaustedAgent.id);
      if (candidates.length > 0) {
        suggestions.push({
          fromAgent: exhaustedAgent.id,
          fromReason: exhaustedAgent.tokenExhaustionReason,
          toAgent: candidates[0].id,
          toName: candidates[0].name,
          toStatus: candidates[0].status,
        });
      }
    }

    return {
      suggestions,
      exhaustedCount: exhausted.length,
      idleCount: idle.length,
    };
  }

  async getDashboard() {
    await this.refreshStates();
    const states = this.getAllAgentStates();

    const summary = {
      total: states.length,
      installed: states.filter((s) => s.installed).length,
      offline: states.filter((s) => s.status === "offline").length,
      active: states.filter((s) => s.status === "active").length,
      idle: states.filter((s) => s.status === "idle").length,
      tokenExhausted: states.filter((s) => s.tokenExhausted).length,
      error: states.filter((s) => s.status === "error").length,
    };

    const recentTasks = this.taskHistory.slice(-20);

    const takeover = await this.suggestTakeover();

    return {
      summary,
      agents: states,
      recentTasks,
      takeover,
      generatedAt: new Date().toISOString(),
    };
  }

  _getCandidateAgents(taskType) {
    const priorityOrder = this.routingStrategy?.priority_order || ["claude", "kode", "iflow", "qwen", "codebuddy", "gemini", "copilot", "qodercli"];

    const available = this.getAvailableAgents().map((s) => s.id);
    const candidates = priorityOrder.filter((id) => available.includes(id));

    return candidates;
  }

  _findFallback(agentId, taskType) {
    const priorityOrder = this.routingStrategy?.priority_order || ["claude", "kode", "iflow", "qwen", "codebuddy", "gemini", "copilot", "qodercli"];
    const idx = priorityOrder.indexOf(agentId);
    const available = this.getAvailableAgents().map((s) => s.id);

    for (let i = idx + 1; i < priorityOrder.length; i++) {
      const candidate = priorityOrder[i];
      if (available.includes(candidate)) {
        const state = this.getAgentState(candidate);
        if (state && state.status !== "token-exhausted" && state.status !== "error") {
          return candidate;
        }
      }
    }

    for (let i = 0; i < idx; i++) {
      const candidate = priorityOrder[i];
      if (available.includes(candidate)) {
        const state = this.getAgentState(candidate);
        if (state && state.status !== "token-exhausted" && state.status !== "error") {
          return candidate;
        }
      }
    }

    return null;
  }

  async _loadConfig() {
    try {
      const content = await fs.readFile(this.configPath, "utf8");
      const config = JSON.parse(content);
      this.config = config;
      this.routingStrategy = config?.enhanced_cli_config?.routing_strategy || null;
    } catch {
      this.config = null;
      this.routingStrategy = null;
    }
  }

  async loadSelfReports() {
    const reports = [];
    const busDir = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), ".stigmergy", "bus");

    const reportDirs = [
      { type: "onetime", dir: path.join(busDir, "onetime") },
      { type: "daily", dir: path.join(busDir, "daily") },
      { type: "session", dir: path.join(busDir, "sessions") },
    ];

    for (const { type, dir } of reportDirs) {
      if (!fsSync.existsSync(dir)) continue;

      if (type === "daily" || type === "session") {
        for (const agentDir of fsSync.readdirSync(dir).filter((f) => !f.startsWith("."))) {
          const agentPath = path.join(dir, agentDir);
          if (!fsSync.statSync(agentPath).isDirectory()) continue;

          for (const file of fsSync.readdirSync(agentPath).filter((f) => f.endsWith(".json"))) {
            try {
              const content = fsSync.readFileSync(path.join(agentPath, file), "utf8");
              const data = JSON.parse(content);
              reports.push({
                agent: agentDir,
                file: path.join(agentPath, file),
                modified: data.timestamp || fsSync.statSync(path.join(agentPath, file)).mtime.toISOString(),
                summary: data,
                reportType: type,
              });
            } catch (e) {
              console.warn(`[COORDINATOR] Failed to parse self-report: ${path.join(agentPath, file)}: ${e.message}`);
            }
          }
        }
      } else {
        for (const file of fsSync.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
          try {
            const content = fsSync.readFileSync(path.join(dir, file), "utf8");
            const data = JSON.parse(content);
            const agentName = path.basename(file, ".json");
            reports.push({
              agent: agentName,
              file: path.join(dir, file),
              modified: data.timestamp || fsSync.statSync(path.join(dir, file)).mtime.toISOString(),
              summary: data,
              reportType: type,
            });
          } catch (e) {
            console.warn(`[COORDINATOR] Failed to parse self-report: ${path.join(dir, file)}: ${e.message}`);
          }
        }
      }
    }

    return reports;
  }

  async createAutoHandoffs() {
    const busDir = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), ".stigmergy", "bus");
    const reports = await this.loadSelfReports();
    const projects = new Map();

    for (const report of reports) {
      const paths = [];
      if (report.summary.injectedPaths) {
        paths.push(...(Array.isArray(report.summary.injectedPaths) ? report.summary.injectedPaths : [report.summary.injectedPaths]));
      }
      if (report.summary.recentProjects) {
        paths.push(...(Array.isArray(report.summary.recentProjects) ? report.summary.recentProjects : [report.summary.recentProjects]));
      }
      if (report.summary.bots) {
        for (const bot of Object.values(report.summary.bots)) {
          if (bot.workspacePath) paths.push(bot.workspacePath);
        }
      }
      if (report.summary.projectPaths) {
        paths.push(...(Array.isArray(report.summary.projectPaths) ? report.summary.projectPaths : [report.summary.projectPaths]));
      }
      if (report.summary.directory) {
        paths.push(report.summary.directory);
      }

      for (const p of paths) {
        const normalized = path.resolve(p).toLowerCase();
        if (!projects.has(normalized)) projects.set(normalized, []);
        projects.get(normalized).push({ agent: report.agent, type: report.reportType, modified: report.modified });
      }
    }

    const handoffs = [];
    for (const [project, agents] of projects) {
      const uniqueAgents = Array.from(new Map(agents.map((a) => [a.agent, a])).values());
      if (uniqueAgents.length >= 2) {
        const handoff = {
          id: `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          project,
          agents: uniqueAgents.map((a) => a.agent),
          status: "pending",
          createdAt: new Date().toISOString(),
          reason: `Multiple agents detected on same project: ${uniqueAgents.map((a) => a.agent).join(", ")}`,
        };
        const handoffsDir = path.join(busDir, "handoffs", "pending");
        fsSync.mkdirSync(handoffsDir, { recursive: true });
        fsSync.writeFileSync(path.join(handoffsDir, `${handoff.id}.json`), JSON.stringify(handoff, null, 2));
        handoffs.push(handoff);
      }
    }

    return handoffs;
  }
}

module.exports = { AgentCoordinator };
