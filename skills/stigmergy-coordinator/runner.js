#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class StigmergyCoordinator {
  constructor() {
    this.busDir = process.env.STIGMERGY_BUS_DIR || path.join(process.cwd(), "bus");
    this.agentName = process.env.AGENT_NAME || path.basename(process.cwd());
    this.capabilities = (process.env.AGENT_CAPABILITIES || "").split(",").map(s => s.trim()).filter(Boolean);
    this.project = process.env.AGENT_PROJECT || process.cwd();
    this.heartbeatInterval = parseInt(process.env.AGENT_HEARTBEAT || "60", 10);

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
      path.join(this.busDir, "shared")
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
      heartbeat: this.heartbeatInterval
    };

    fs.writeFileSync(this.getRegistryPath(), JSON.stringify(registry, null, 2));
    console.log(`[STIGMERGY] Registered as ${this.agentName}`);
    return registry;
  }

  heartbeat() {
    const registryPath = this.getRegistryPath();
    let registry = {};

    if (fs.existsSync(registryPath)) {
      try {
        registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      } catch {}
    }

    registry.lastUpdate = new Date().toISOString();
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    console.log(`[STIGMERGY] Heartbeat updated for ${this.agentName}`);
    return registry;
  }

  scanHandoffs() {
    const pendingDir = path.join(this.busDir, "handoffs", "pending");
    const handoffs = [];

    if (!fs.existsSync(pendingDir)) return handoffs;

    const files = fs.readdirSync(pendingDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
      try {
        const handoff = JSON.parse(fs.readFileSync(path.join(pendingDir, file), "utf8"));
        handoffs.push(handoff);
      } catch {}
    }

    return handoffs;
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

    console.log(`[STIGMERGY] Completed handoff ${handoffId}`);
    return handoff;
  }

  scanReviews() {
    const pendingDir = path.join(this.busDir, "reviews", "pending");
    const reviews = [];

    if (!fs.existsSync(pendingDir)) return reviews;

    const files = fs.readdirSync(pendingDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
      try {
        const review = JSON.parse(fs.readFileSync(path.join(pendingDir, file), "utf8"));
        reviews.push(review);
      } catch {}
    }

    return reviews;
  }

  completeReview(reviewId, result, comments) {
    const pendingPath = path.join(this.busDir, "reviews", "pending", `${reviewId}.json`);
    const completedPath = path.join(this.busDir, "reviews", "completed", `${reviewId}.json`);

    if (!fs.existsSync(pendingPath)) {
      console.log(`[STIGMERGY] Review ${reviewId} not found in pending`);
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

    setInterval(() => {
      this.heartbeat();
      this.scanHandoffs();
      this.scanReviews();
    }, this.heartbeatInterval * 1000);

    this.runOnce();
  }
}

if (require.main === module) {
  const coordinator = new StigmergyCoordinator();
  const mode = process.argv[2] || "once";

  if (mode === "daemon") {
    coordinator.runDaemon();
  } else {
    coordinator.runOnce();
  }
}

module.exports = StigmergyCoordinator;