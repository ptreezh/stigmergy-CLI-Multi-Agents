#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

class StigmergyCoordinator {
  constructor() {
    this.busDir = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), ".stigmergy", "bus");
    this.agentName = process.env.AGENT_NAME || path.basename(process.cwd());
    this.capabilities = (process.env.AGENT_CAPABILITIES || "").split(",").map(s => s.trim()).filter(Boolean);
    this.project = process.env.AGENT_PROJECT || process.cwd();
    this.heartbeatInterval = parseInt(process.env.AGENT_HEARTBEAT || "60", 10);
    this.daemonTimer = null;
    this.taskIdCounter = 0;

    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      path.join(this.busDir, "registry"),
      path.join(this.busDir, "handoffs", "pending"),
      path.join(this.busDir, "handoffs", "active"),
      path.join(this.busDir, "handoffs", "completed"),
      path.join(this.busDir, "reviews", "pending"),
      path.join(this.busDir, "reviews", "completed"),
      path.join(this.busDir, "shared"),
      path.join(this.busDir, "tasks")
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  getRegistryPath() {
    return path.join(this.busDir, "registry", `${this.agentName}.json`);
  }

  register() {
    const registry = {
      agent: this.agentName,
      status: "active",
      currentTask: null,
      capabilities: this.capabilities,
      project: this.project,
      lastUpdate: new Date().toISOString(),
      heartbeat: this.heartbeatInterval,
      tasksCompleted: 0,
      tasksStuck: 0
    };

    fs.writeFileSync(this.getRegistryPath(), JSON.stringify(registry, null, 2));
    console.log(`[STIGMERGY] Registered as ${this.agentName}`);
    return registry;
  }

  updateRegistry(updates = {}) {
    const p = this.getRegistryPath();
    let data = {};
    if (fs.existsSync(p)) {
      try { data = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
    }
    Object.assign(data, updates, { lastUpdate: new Date().toISOString() });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    return data;
  }

  heartbeat() {
    this.updateRegistry();
    console.log(`[STIGMERGY] Heartbeat ${this.agentName}`);
  }

  agentIsIdle() {
    const p = this.getRegistryPath();
    if (!fs.existsSync(p)) return true;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      return data.status !== "busy";
    } catch {
      return true;
    }
  }

  matchesMySkills(taskOrHandoff) {
    if (!this.capabilities.length) return false;
    const required = taskOrHandoff.requiredSkills || taskOrHandoff.capabilities || [];
    const requiredLower = required.map(s => String(s).toLowerCase());
    return this.capabilities.some(c => requiredLower.includes(String(c).toLowerCase()));
  }

  scanHandoffs() {
    const pendingDir = path.join(this.busDir, "handoffs", "pending");
    if (!fs.existsSync(pendingDir)) return [];
    return fs.readdirSync(pendingDir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(pendingDir, f), "utf8")); } catch { return null; }
      })
      .filter(Boolean);
  }

  acceptHandoff(handoffId) {
    const pendingPath = path.join(this.busDir, "handoffs", "pending", `${handoffId}.json`);
    const activePath = path.join(this.busDir, "handoffs", "active", `${handoffId}.json`);

    if (!fs.existsSync(pendingPath)) {
      console.log(`[STIGMERGY] Handoff ${handoffId} not found in pending`);
      return null;
    }

    const handoff = JSON.parse(fs.readFileSync(pendingPath, "utf8"));
    handoff.status = "active";
    handoff.acceptedAt = new Date().toISOString();
    handoff.acceptedBy = this.agentName;

    fs.writeFileSync(activePath, JSON.stringify(handoff, null, 2));
    fs.unlinkSync(pendingPath);

    this.updateRegistry({ status: "busy", currentTask: handoff.title });
    console.log(`[STIGMERGY] Accepted handoff ${handoffId}`);
    return handoff;
  }

  completeHandoff(handoffId, result) {
    const activePath = path.join(this.busDir, "handoffs", "active", `${handoffId}.json`);
    const completedPath = path.join(this.busDir, "handoffs", "completed", `${handoffId}.json`);

    if (!fs.existsSync(activePath)) {
      console.log(`[STIGMERGY] Handoff ${handoffId} not found in active`);
      return null;
    }

    const handoff = JSON.parse(fs.readFileSync(activePath, "utf8"));
    handoff.status = "completed";
    handoff.completedAt = new Date().toISOString();
    handoff.result = result;

    fs.writeFileSync(completedPath, JSON.stringify(handoff, null, 2));
    fs.unlinkSync(activePath);

    this.updateRegistry({ status: "idle", currentTask: null });
    console.log(`[STIGMERGY] Completed handoff ${handoffId}`);
    return handoff;
  }

  scanReviews() {
    const pendingDir = path.join(this.busDir, "reviews", "pending");
    if (!fs.existsSync(pendingDir)) return [];
    return fs.readdirSync(pendingDir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(pendingDir, f), "utf8")); } catch { return null; }
      })
      .filter(Boolean);
  }

  completeReview(reviewId, result, comments) {
    const pendingPath = path.join(this.busDir, "reviews", "pending", `${reviewId}.json`);
    const completedPath = path.join(this.busDir, "reviews", "completed", `${reviewId}.json`);

    if (!fs.existsSync(pendingPath)) {
      console.log(`[STIGMERGY] Review ${reviewId} not found`);
      return null;
    }

    const review = JSON.parse(fs.readFileSync(pendingPath, "utf8"));
    review.status = "completed";
    review.reviewedAt = new Date().toISOString();
    review.reviewResult = result;
    review.reviewComments = comments;

    fs.writeFileSync(completedPath, JSON.stringify(review, null, 2));
    fs.unlinkSync(pendingPath);
    console.log(`[STIGMERGY] Completed review ${reviewId}`);
    return review;
  }

  shareKnowledge(content) {
    const knowledgePath = path.join(this.busDir, "shared", "knowledge.md");

    const entry = `\n\n## ${this.agentName} - ${new Date().toISOString()}\n\n${content}\n`;

    fs.appendFileSync(knowledgePath, entry);
    console.log(`[STIGMERGY] Shared knowledge from ${this.agentName}`);
  }

  createTask(title, project, options = {}) {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const task = {
      id,
      title,
      project,
      status: options.status || "pending",
      assignedTo: options.assignedTo || null,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      stuckSince: options.status === "stuck" ? new Date().toISOString() : null,
      stuckReason: options.stuckReason || null,
      priority: options.priority || "medium",
      tags: options.tags || [],
      requiredSkills: options.requiredSkills || [],
      createdBy: options.createdBy || this.agentName
    };

    const tasksDirPath = path.join(this.busDir, "tasks");
    fs.mkdirSync(tasksDirPath, { recursive: true });
    fs.writeFileSync(path.join(tasksDirPath, `${id}.json`), JSON.stringify(task, null, 2));
    console.log(`[STIGMERGY] Created task ${id}: ${title}`);
    return task;
  }

  scanStuckTasks(maxAgeMs = 2 * 60 * 60 * 1000) {
    const tasksDirPath = path.join(this.busDir, "tasks");
    if (!fs.existsSync(tasksDirPath)) return [];

    const now = Date.now();
    return fs.readdirSync(tasksDirPath)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(tasksDirPath, f), "utf8")); } catch { return null; }
      })
      .filter(task => {
        if (task.status !== "stuck" || !task.stuckSince) return false;
        return now - new Date(task.stuckSince).getTime() > maxAgeMs;
      });
  }

  scanRegistry() {
    const dir = path.join(this.busDir, "registry");
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; }
      })
      .filter(data => data.agent !== this.agentName);
  }

  async runOnce() {
    console.log("[STIGMERGY] Running coordinator cycle...\n");

    this.register();
    this.heartbeat();

    const handoffs = this.scanHandoffs();
    console.log(`[STIGMERGY] Found ${handoffs.length} pending handoffs`);

    for (const handoff of handoffs) {
      if (handoff.to === this.agentName || handoff.to === "*") {
        console.log(`[STIGMERGY] Accepting handoff ${handoff.id}: ${handoff.title}`);
        this.acceptHandoff(handoff.id);
      }
    }

    const reviews = this.scanReviews();
    console.log(`[STIGMERGY] Found ${reviews.length} pending reviews`);

    for (const review of reviews) {
      if (review.to === this.agentName || review.to === "*") {
        console.log(`[STIGMERGY] Processing review ${review.id}: ${review.title}`);
      }
    }

    console.log("\n[STIGMERGY] Coordinator cycle completed");
  }

  async runDaemon() {
    console.log(`[STIGMERGY] Starting daemon mode (heartbeat: ${this.heartbeatInterval}s)`);

    this.register();

    this.daemonTimer = setInterval(() => {
      if (!this.agentIsIdle()) {
        console.log(`[STIGMERGY] Agent busy, skipping this cycle`);
        return;
      }

      this.heartbeat();

      const handoffs = this.scanHandoffs();
      const myHandoffs = handoffs.filter(h => this.matchesMySkills(h) && (h.to === this.agentName || h.to === "*"));
      if (myHandoffs.length > 0) {
        console.log(`[STIGMERGY] Accepting handoff: ${myHandoffs[0].title}`);
        this.acceptHandoff(myHandoffs[0].id);
        return;
      }

      const stuckTasks = this.scanStuckTasks();
      const myStuck = stuckTasks.filter(t => this.matchesMySkills(t));
      if (myStuck.length > 0) {
        console.log(`[STIGMERGY] Taking over stuck task: ${myStuck[0].title}`);
        this.updateRegistry({ status: "busy", currentTask: myStuck[0].title });
        return;
      }

      const others = this.scanRegistry();
      console.log(`[STIGMERGY] Active agents: ${others.length}, Status: idle`);

    }, this.heartbeatInterval * 1000);

    this.runOnce();
  }

  stopDaemon() {
    if (this.daemonTimer) {
      clearInterval(this.daemonTimer);
      this.daemonTimer = null;
      console.log(`[STIGMERGY] Daemon stopped`);
    }
  }
}

if (require.main === module) {
  const coordinator = new StigmergyCoordinator();
  const mode = process.argv[2] || "once";

  if (mode === "daemon") {
    coordinator.runDaemon();
  } else if (mode === "stop") {
    coordinator.stopDaemon();
  } else {
    coordinator.runOnce();
  }
}

module.exports = StigmergyCoordinator;