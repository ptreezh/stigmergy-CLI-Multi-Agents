#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const BUS_DIR = process.env.STIGMERGY_BUS_DIR || path.join(process.cwd(), "bus");
const AGENT_NAME = process.env.AGENT_NAME || path.basename(process.cwd());
const AGENT_CAPABILITIES = (process.env.AGENT_CAPABILITIES || "").split(",").map(s => s.trim()).filter(Boolean);
const AGENT_PROJECT = process.env.AGENT_PROJECT || process.cwd();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function registryPath() {
  return path.join(BUS_DIR, "registry", `${AGENT_NAME}.json`);
}

function register() {
  ensureDir(path.join(BUS_DIR, "registry"));
  const data = {
    agent: AGENT_NAME,
    status: "active",
    currentTask: null,
    capabilities: AGENT_CAPABILITIES,
    project: AGENT_PROJECT,
    lastUpdate: new Date().toISOString(),
    heartbeat: 60
  };
  fs.writeFileSync(registryPath(), JSON.stringify(data, null, 2));
  console.log(`[BUS] Registered ${AGENT_NAME}`);
  return data;
}

function heartbeat() {
  const p = registryPath();
  let data = {};
  if (fs.existsSync(p)) {
    try { data = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
  }
  data.lastUpdate = new Date().toISOString();
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`[BUS] Heartbeat ${AGENT_NAME}`);
}

function scanHandoffs() {
  const dir = path.join(BUS_DIR, "handoffs", "pending");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; }
    })
    .filter(Boolean);
}

function acceptHandoff(id) {
  const src = path.join(BUS_DIR, "handoffs", "pending", `${id}.json`);
  const dst = path.join(BUS_DIR, "handoffs", "active", `${id}.json`);
  if (!fs.existsSync(src)) { console.log(`[BUS] Handoff ${id} not found`); return null; }
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  data.status = "active";
  data.acceptedAt = new Date().toISOString();
  data.acceptedBy = AGENT_NAME;
  fs.writeFileSync(dst, JSON.stringify(data, null, 2));
  fs.unlinkSync(src);
  console.log(`[BUS] Accepted ${id}`);
  return data;
}

function completeHandoff(id, result) {
  const src = path.join(BUS_DIR, "handoffs", "active", `${id}.json`);
  const dst = path.join(BUS_DIR, "handoffs", "completed", `${id}.json`);
  if (!fs.existsSync(src)) { console.log(`[BUS] Handoff ${id} not active`); return null; }
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  data.status = "completed";
  data.completedAt = new Date().toISOString();
  data.result = result;
  fs.writeFileSync(dst, JSON.stringify(data, null, 2));
  fs.unlinkSync(src);
  console.log(`[BUS] Completed ${id}`);
  return data;
}

function runOnce() {
  console.log(`[BUS] ${AGENT_NAME} coordinator run`);
  register();
  heartbeat();

  const pending = scanHandoffs();
  console.log(`[BUS] Pending handoffs: ${pending.length}`);

  for (const h of pending) {
    if (h.to === AGENT_NAME || h.to === "*") {
      console.log(`[BUS] Auto-accepting ${h.id}: ${h.title}`);
      acceptHandoff(h.id);
    }
  }
}

const command = process.argv[2] || "once";

switch (command) {
  case "register":
    register();
    break;
  case "heartbeat":
    heartbeat();
    break;
  case "scan":
    console.log(JSON.stringify(scanHandoffs(), null, 2));
    break;
  case "accept":
    acceptHandoff(process.argv[3]);
    break;
  case "complete":
    completeHandoff(process.argv[3], process.argv[4]);
    break;
  case "once":
  default:
    runOnce();
    break;
}