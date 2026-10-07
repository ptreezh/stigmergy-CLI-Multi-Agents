#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { globSync } = require("glob");

class StigmergyOrchestrator {
  constructor() {
    this.busDir = path.join(process.cwd(), "bus");
    this.agents = {
      opencode: {
        type: "ide",
        home: path.join(process.env.USERPROFILE || "~", ".local", "share", "opencode"),
        format: "sqlite+git",
        sessionFiles: [
          "storage/directory-readme/*.json",
          "storage/agent-usage-reminder/*.json",
          "storage/rules-injector/*.json",
          "storage/todo/*.json",
          "storage/session_diff/*.json"
        ],
        extractors: [
          { filePattern: "storage/directory-readme/*.json", parser: "json_array", key: "injectedPaths" },
          { filePattern: "storage/todo/*.json", parser: "json", key: "sessionID" }
        ]
      },
      zcode: {
        type: "editor",
        home: path.join(process.env.USERPROFILE || "~", ".zcode"),
        format: "json+sqlite",
        sessionFiles: [
          "v2/bot-state.v2.json",
          "v2/setting.json",
          "v2/logs/*.log"
        ],
        extractors: [
          { filePattern: "v2/bot-state.v2.json", parser: "json_wildcard", key: "bots.*.workspacePath" },
          { filePattern: "v2/setting.json", parser: "json_array", key: "recentProjects" }
        ]
      },
      qoder: {
        type: "cli",
        home: path.join(process.env.USERPROFILE || "~", ".qoder"),
        format: "json+taskdir",
        sessionFiles: [
          "tmp/*/logs.json",
          "tmp/telemetry/active-runs/*.json",
          "state.json"
        ],
        extractors: [
          { filePattern: "tmp/*/logs.json", parser: "json_array_wildcard", key: "sessionId" }
        ]
      },
      doubao: {
        type: "chat",
        home: path.join(process.env.LOCALAPPDATA || "", "Doubao", "User Data"),
        format: "electron",
        sessionFiles: [
          "Profile 1/.doubao/agent_mode/workspace/.sessions/*/board.md",
          "Profile 2/.doubao/agent_mode/workspace/.sessions/*/board.md"
        ],
        extractors: [
          { filePattern: "Profile */.doubao/agent_mode/workspace/.sessions/*/board.md", parser: "markdown_table", key: "board.md" }
        ]
      },
      workbuddy: {
        type: "cli",
        home: path.join(process.env.USERPROFILE || "~", ".workbuddy"),
        format: "sqlite",
        sessionFiles: [
          "workbuddy.db",
          "workbuddy.db-wal",
          "user-state.json",
          "usage-log.json"
        ],
        extractors: []
      },
      marvis: {
        type: "desktop",
        home: path.join(process.env.USERPROFILE || "~", ".marvis"),
        format: "sqlite",
        sessionFiles: [],
        extractors: []
      },
      coze: {
        type: "chat",
        home: path.join(process.env.USERPROFILE || "~", ".coze"),
        format: "filesystem",
        sessionFiles: [
          "runtimes/*/runtime.json",
          "agents/*/config.json"
        ],
        extractors: []
      },
      claude: {
        type: "cli",
        home: path.join(process.env.USERPROFILE || "~", ".claude"),
        format: "json",
        sessionFiles: [],
        extractors: []
      }
    };

    this.evidence = [];
    this.sessions = [];
    this.projects = new Map();
    this.busState = null;
  }

  async run() {
    console.log("[STIGMERGY] Auto-coordinator run...\n");

    this.evidence = await this.collectEvidence();
    this.sessions = this.parseSessions(this.evidence);
    this.projects = this.mapProjects(this.sessions);
    this.busState = await this.readBus();

    const activity = await this.measureActivity();
    const confidence = this.scoreConfidence(activity);
    const coordinationPlan = await this.buildCoordinationPlan(confidence);
    await this.executeCoordinationPlan(coordinationPlan);

    const report = {
      timestamp: new Date().toISOString(),
      methodology: "session-first, project-mapped, evidence-tagged, bus-coordinated",
      evidenceCount: this.evidence.length,
      sessionCount: this.sessions.length,
      projectCount: this.projects.size,
      busState: this.busState,
      agents: confidence,
      coordinationPlan,
      recommendations: this.buildRecommendations(confidence)
    };

    console.log("[STIGMERGY] Final Report:");
    console.log(JSON.stringify(report, null, 2));
    await this.saveReport(report);
    return report;
  }

  async collectEvidence() {
    const evidence = [];

    for (const [agentName, config] of Object.entries(this.agents)) {
      if (!fs.existsSync(config.home)) {
        evidence.push({
          agent: agentName,
          type: "directory_missing",
          path: config.home,
          confidence: "high"
        });
        continue;
      }

      const homeStat = fs.statSync(config.home);
      evidence.push({
        agent: agentName,
        type: "agent_home",
        path: config.home,
        modified: homeStat.mtime.toISOString(),
        confidence: "high"
      });

      const matchedFiles = this.matchFiles(config.home, config.sessionFiles);
      for (const match of matchedFiles.slice(0, 50)) {
        try {
          const stat = fs.statSync(match);
          evidence.push({
            agent: agentName,
            type: "session_file",
            path: match,
            size: stat.size,
            modified: stat.mtime.toISOString(),
            confidence: "high"
          });
        } catch (e) {
          evidence.push({
            agent: agentName,
            type: "session_file",
            path: match,
            error: e.message,
            confidence: "high"
          });
        }
      }

      const processes = this.checkProcesses(agentName);
      if (processes.length > 0) {
        evidence.push({
          agent: agentName,
          type: "running_processes",
          processes,
          confidence: "medium"
        });
      }
    }

    return evidence;
  }

  parseSessions(evidence) {
    const sessions = [];

    for (const item of evidence) {
      if (item.type !== "session_file") continue;

      const session = {
        agent: item.agent,
        path: item.path,
        modified: item.modified,
        confidence: item.confidence,
        projectPaths: [],
        source: "unknown"
      };

      try {
        const content = fs.readFileSync(item.path, "utf8");

        if (item.path.includes("directory-readme")) {
          const data = JSON.parse(content);
          if (data.injectedPaths) {
            session.projectPaths = Array.isArray(data.injectedPaths) ? data.injectedPaths : [data.injectedPaths];
            session.sessionId = data.sessionID;
            session.source = "directory-readme";
          }
        } else if (item.path.includes("bot-state.v2.json")) {
          const data = JSON.parse(content);
          if (data.bots) {
            for (const [botId, bot] of Object.entries(data.bots)) {
              if (bot.workspacePath) {
                session.projectPaths.push(bot.workspacePath);
                session.botId = botId;
                session.activeTaskId = bot.activeTaskId;
                session.source = "bot-state";
              }
            }
          }
        } else if (item.path.endsWith("board.md")) {
          session.source = "doubao-board";
          session.projectPaths = this.extractPathsFromMarkdown(content);
        } else if (item.path.includes("logs.json")) {
          session.source = "qoder-logs";
          session.projectPaths = this.extractPathsFromQoderLog(content);
        } else if (item.path.includes("setting.json") && item.path.includes(".zcode")) {
          const data = JSON.parse(content);
          if (data.recentProjects) {
            session.projectPaths = data.recentProjects;
            session.source = "zcode-setting";
          }
        }

        sessions.push(session);
      } catch (e) {
        session.parseError = e.message;
        sessions.push(session);
      }
    }

    return sessions;
  }

  extractPathsFromMarkdown(content) {
    const paths = [];
    const matches = content.match(/([A-Z]:\\[^\s|]+)/g);
    if (matches) paths.push(...matches);
    return paths;
  }

  extractPathsFromQoderLog(content) {
    const paths = new Set();
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        for (const entry of data) {
          if (entry.message) {
            const matches = entry.message.match(/([A-Z]:\\[^\s"]+)/g);
            if (matches) matches.forEach(p => paths.add(p));
          }
        }
      }
    } catch {
      const matches = content.match(/([A-Z]:\\[^\s"]+)/g);
      if (matches) matches.forEach(p => paths.add(p));
    }
    return Array.from(paths);
  }

  mapProjects(sessions) {
    const projects = new Map();

    for (const session of sessions) {
      for (const projectPath of session.projectPaths) {
        if (!projectPath || projectPath.length < 3) continue;
        if (!projects.has(projectPath)) {
          projects.set(projectPath, {
            path: projectPath,
            agents: new Set(),
            sessions: [],
            lastSessionUpdate: null
          });
        }
        const project = projects.get(projectPath);
        project.agents.add(session.agent);
        project.sessions.push(session);
        if (!project.lastSessionUpdate || new Date(session.modified) > new Date(project.lastSessionUpdate)) {
          project.lastSessionUpdate = session.modified;
        }
      }
    }

    return projects;
  }

  async measureActivity() {
    const activity = new Map();

    const projectPaths = Array.from(this.projects.keys()).slice(0, 10);
    for (const projectPath of projectPaths) {
      const project = this.projects.get(projectPath);

      if (!fs.existsSync(projectPath)) {
        activity.set(projectPath, {
          path: projectPath,
          exists: false,
          totalFiles: 0,
          recentFiles: 0,
          lastModified: null,
          agents: Array.from(project.agents),
          confidence: "low"
        });
        continue;
      }

      try {
        const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

        const recentCount = await Promise.race([
          this.countRecentFilesPowerShell(projectPath, 2),
          timeout(15000)
        ]).catch(() => 0);

        const totalCount = await Promise.race([
          this.countFilesPowerShell(projectPath),
          timeout(15000)
        ]).catch(() => 0);

        const lastModified = await Promise.race([
          this.getLastModifiedPowerShell(projectPath),
          timeout(15000)
        ]).catch(() => null);

        activity.set(projectPath, {
          path: projectPath,
          exists: true,
          totalFiles: totalCount || 0,
          recentFiles: recentCount || 0,
          lastModified,
          agents: Array.from(project.agents),
          confidence: (recentCount || 0) > 0 ? "high" : "medium"
        });
      } catch (e) {
        activity.set(projectPath, {
          path: projectPath,
          exists: true,
          totalFiles: 0,
          recentFiles: 0,
          lastModified: null,
          agents: Array.from(project.agents),
          confidence: "low",
          error: e.message
        });
      }
    }

    return activity;
  }

  scoreConfidence(activity) {
    const confidence = {};

    for (const [agentName, config] of Object.entries(this.agents)) {
      const agentSessions = this.sessions.filter(s => s.agent === agentName);
      const agentProjects = Array.from(this.projects.values()).filter(p => p.agents.has(agentName));
      const agentActivity = Array.from(activity.values()).filter(a => a.agents.includes(agentName));
      const hasProcess = this.checkProcesses(agentName).length > 0;

      const hasSession = agentSessions.length > 0;
      const hasProjectPath = agentProjects.length > 0;
      const hasRecentActivity = agentActivity.some(a => a.recentFiles > 0);

      let score = 0;
      let factors = [];

      if (hasSession) { score += 40; factors.push("session_history"); }
      if (hasProjectPath) { score += 30; factors.push("project_path_mapped"); }
      if (hasRecentActivity) { score += 20; factors.push("recent_file_activity"); }
      if (hasProcess) { score += 10; factors.push("running_process"); }

      let level = "very_low";
      if (score >= 80) level = "high";
      else if (score >= 60) level = "medium";
      else if (score >= 40) level = "low";

      confidence[agentName] = {
        score,
        level,
        factors,
        hasSession,
        hasProjectPath,
        hasRecentActivity,
        hasProcess,
        projectPaths: agentProjects.map(p => p.path),
        recentActivity: agentActivity.map(a => ({
          path: a.path,
          recentFiles: a.recentFiles,
          lastModified: a.lastModified
        }))
      };
    }

    return confidence;
  }

  async readBus() {
    const registryDir = path.join(this.busDir, "registry");
    const state = {
      agents: {},
      handoffs: { pending: 0, active: 0, completed: 0 },
      reviews: { pending: 0, active: 0, completed: 0 }
    };

    if (!fs.existsSync(registryDir)) return state;

    const registryFiles = fs.readdirSync(registryDir).filter(f => f.endsWith(".json"));
    for (const file of registryFiles) {
      try {
        const agent = JSON.parse(fs.readFileSync(path.join(registryDir, file), "utf8"));
        state.agents[agent.agent] = agent;
      } catch {}
    }

    for (const [subdir, key] of [
      ["handoffs/pending", "pending"],
      ["handoffs/active", "active"],
      ["handoffs/completed", "completed"],
      ["reviews/pending", "pending"],
      ["reviews/active", "active"],
      ["reviews/completed", "completed"]
    ]) {
      const dir = path.join(this.busDir, subdir);
      if (fs.existsSync(dir)) {
        const category = subdir.startsWith("handoffs") ? "handoffs" : "reviews";
        state[category][key] = fs.readdirSync(dir).filter(f => f.endsWith(".json")).length;
      }
    }

    return state;
  }

  async buildCoordinationPlan(confidence) {
    const plan = { handoffs: [], reviews: [], knowledge: [] };

    const highAgents = Object.entries(confidence).filter(([, c]) => c.level === "high");
    const mediumAgents = Object.entries(confidence).filter(([, c]) => c.level === "medium");

    if (highAgents.length >= 2) {
      for (let i = 0; i < highAgents.length; i++) {
        for (let j = i + 1; j < highAgents.length; j++) {
          const [fromName, fromData] = highAgents[i];
          const [toName, toData] = highAgents[j];

          if (fromData.projectPaths[0] && toData.projectPaths[0]) {
            plan.handoffs.push({
              id: `handoff-${fromName}-${toName}-${Date.now()}`,
              from: fromName,
              to: toName,
              type: "project_sync",
              title: `Sync project context: ${path.basename(fromData.projectPaths[0])} → ${path.basename(toData.projectPaths[0])}`,
              description: "Share latest project status and artifacts",
              priority: "medium",
              status: "pending"
            });
          }
        }
      }
    }

    const projectGroups = new Map();
    for (const [agentName, data] of Object.entries(confidence)) {
      for (const projectPath of data.projectPaths) {
        if (!projectGroups.has(projectPath)) projectGroups.set(projectPath, []);
        projectGroups.get(projectPath).push(agentName);
      }
    }

    for (const [projectPath, agents] of projectGroups.entries()) {
      if (agents.length >= 2) {
        plan.reviews.push({
          id: `review-${path.basename(projectPath)}-${Date.now()}`,
          from: "orchestrator",
          to: agents.join(","),
          type: "project_review",
          title: `Cross-review: ${path.basename(projectPath)}`,
          description: `Multiple agents working on ${projectPath}. Review for conflicts.`,
          status: "pending"
        });
      }
    }

    return plan;
  }

  async executeCoordinationPlan(plan) {
    const pendingDir = path.join(this.busDir, "handoffs", "pending");

    if (!fs.existsSync(pendingDir)) return;

    for (const handoff of plan.handoffs) {
      const filePath = path.join(pendingDir, `${handoff.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(handoff, null, 2));
      console.log(`[STIGMERGY] Created handoff: ${handoff.id}`);
    }
  }

  buildRecommendations(confidence) {
    const recommendations = [];
    const highAgents = Object.entries(confidence).filter(([, c]) => c.level === "high");
    const mediumAgents = Object.entries(confidence).filter(([, c]) => c.level === "medium");

    if (highAgents.length >= 2) {
      recommendations.push({
        type: "parallel_processing",
        agents: highAgents.map(([name]) => name),
        reason: "Multiple agents with high confidence active status",
        action: "Enable parallel execution for independent tasks"
      });
    }

    const projectAgents = new Map();
    for (const [agentName, data] of Object.entries(confidence)) {
      for (const projectPath of data.projectPaths) {
        if (!projectAgents.has(projectPath)) projectAgents.set(projectPath, []);
        projectAgents.get(projectPath).push(agentName);
      }
    }

    for (const [projectPath, agents] of projectAgents.entries()) {
      if (agents.length >= 2) {
        recommendations.push({
          type: "project_coordination",
          project: projectPath,
          agents,
          reason: "Multiple agents working on same project",
          action: "Implement project-level coordination and conflict resolution"
        });
      }
    }

    return recommendations;
  }

  checkProcesses(agentName) {
    const patterns = {
      opencode: ["opencode"],
      zcode: ["ZCode"],
      qoder: ["Qoder"],
      doubao: ["Doubao"],
      workbuddy: ["WorkBuddy"],
      marvis: ["Marvis", "MarvisAgent", "MarvisHost", "MarvisNode", "MarvisKnowledgebase"],
      coze: ["Coze"],
      claude: ["claude"],
      kilocode: ["kilo", "kilocode"],
      poe: ["Poe"]
    };

    const names = patterns[agentName.toLowerCase()] || [agentName];
    const found = [];

    for (const name of names) {
      try {
        const result = execSync(
          `tasklist /FI "IMAGENAME eq ${name}*" 2>NUL`,
          { encoding: "utf8", timeout: 5000 }
        );
        if (result.includes(name)) {
          const lines = result.split("\n").filter(l => l.includes(name));
          found.push(...lines.map(l => l.trim()).filter(Boolean));
        }
      } catch {}
    }

    return found;
  }

  matchFiles(root, patterns) {
    const results = [];
    const rootUnix = root.replace(/\\/g, "/");
    for (const pattern of patterns) {
      try {
        const fullPattern = path.join(rootUnix, pattern).replace(/\\/g, "/");
        const matches = globSync(fullPattern, { absolute: true, dot: true, onlyFiles: true });
        results.push(...matches);
      } catch {}
    }
    return results;
  }

  async countRecentFilesPowerShell(dir, days) {
    try {
      const psCmd = `$ErrorActionPreference='SilentlyContinue'; $cutoff=(Get-Date).AddDays(-${days}); (Get-ChildItem -LiteralPath '${dir}' -Recurse -File -Force -ErrorAction SilentlyContinue | Where-Object {$_.LastWriteTime -gt $cutoff}).Count`;
      const result = execSync(`powershell -Command "${psCmd.replace(/"/g, '\\"')}"`, {
        encoding: "utf8",
        timeout: 30000
      });
      return parseInt(result.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async countFilesPowerShell(dir) {
    try {
      const psCmd = `$ErrorActionPreference='SilentlyContinue'; (Get-ChildItem -LiteralPath '${dir}' -Recurse -File -Force -ErrorAction SilentlyContinue).Count`;
      const result = execSync(`powershell -Command "${psCmd.replace(/"/g, '\\"')}"`, {
        encoding: "utf8",
        timeout: 60000
      });
      return parseInt(result.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async getLastModifiedPowerShell(dir) {
    try {
      const psCmd = `$ErrorActionPreference='SilentlyContinue'; Get-ChildItem -LiteralPath '${dir}' -Recurse -File -Force -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Select-Object -ExpandProperty LastWriteTime`;
      const result = execSync(`powershell -Command "${psCmd.replace(/"/g, '\\"')}"`, {
        encoding: "utf8",
        timeout: 60000
      });
      return result.trim();
    } catch {
      return null;
    }
  }

  async saveReport(report) {
    const reportPath = path.join(process.cwd(), "evidence-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log("\n[STIGMERGY] Report saved to:", reportPath);
  }
}

if (require.main === module) {
  const orchestrator = new StigmergyOrchestrator();
  orchestrator.run().catch(console.error);
}

module.exports = StigmergyOrchestrator;