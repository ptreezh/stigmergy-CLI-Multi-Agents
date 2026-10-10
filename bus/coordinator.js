#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const BUS_DIR = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), ".stigmergy", "bus");
const AGENT_NAME = process.env.AGENT_NAME || path.basename(process.cwd());
const AGENT_CAPABILITIES = (process.env.AGENT_CAPABILITIES || "").split(",").map(s => s.trim()).filter(Boolean);
const AGENT_PROJECT = process.env.AGENT_PROJECT || process.cwd();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function registryPath() {
  return path.join(BUS_DIR, "registry", `${AGENT_NAME}.json`);
}

function tasksDir() {
  return path.join(BUS_DIR, "tasks");
}

function taskPath(taskId) {
  return path.join(tasksDir(), `${taskId}.json`);
}

function register() {
  ensureDir(path.join(BUS_DIR, "registry"));
  ensureDir(tasksDir());
  const data = {
    agent: AGENT_NAME,
    status: "active",
    currentTask: null,
    capabilities: AGENT_CAPABILITIES,
    project: AGENT_PROJECT,
    lastUpdate: new Date().toISOString(),
    heartbeat: 60,
    tasksCompleted: 0,
    tasksStuck: 0
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

function createTask(title, project, options = {}) {
  ensureDir(tasksDir());
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
    createdBy: options.createdBy || AGENT_NAME
  };

  fs.writeFileSync(taskPath(id), JSON.stringify(task, null, 2));
  console.log(`[BUS] Created task ${id}: ${title}`);
  return task;
}

function updateTaskStatus(taskId, status, opts = {}) {
  const p = taskPath(taskId);
  if (!fs.existsSync(p)) {
    console.log(`[BUS] Task ${taskId} not found`);
    return null;
  }

  const task = JSON.parse(fs.readFileSync(p, "utf8"));
  task.status = status;
  task.lastUpdate = new Date().toISOString();

  if (status === "active" && opts.assignedTo) {
    task.assignedTo = opts.assignedTo;
  }
  if (status === "stuck") {
    task.stuckSince = new Date().toISOString();
    task.stuckReason = opts.stuckReason || null;
  }
  if (status === "completed") {
    task.completedAt = new Date().toISOString();
    task.completedBy = opts.completedBy || AGENT_NAME;
  }

  fs.writeFileSync(p, JSON.stringify(task, null, 2));
  console.log(`[BUS] Updated task ${taskId} → ${status}`);
  return task;
}

function scanTasks(statusFilter) {
  const dir = tasksDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
  const tasks = files.map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; }
  }).filter(Boolean);

  if (statusFilter) {
    return tasks.filter(t => t.status === statusFilter);
  }
  return tasks;
}

function scanStuckTasks(maxAgeMs = 2 * 60 * 60 * 1000) {
  const now = Date.now();
  return scanTasks("stuck").filter(task => {
    if (!task.stuckSince) return false;
    const stuckAge = now - new Date(task.stuckSince).getTime();
    return stuckAge > maxAgeMs;
  });
}

function scanRegistry() {
  const dir = path.join(BUS_DIR, "registry");
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; }
    })
    .filter(Boolean);
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

function createTask(title, project, opts) {
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const task = {
    id,
    title,
    project,
    status: opts?.status || 'pending',
    assignedTo: opts?.assignedTo || null,
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    stuckSince: opts?.status === 'stuck' ? new Date().toISOString() : null,
    stuckReason: opts?.stuckReason || null,
    priority: opts?.priority || 'medium',
    tags: opts?.tags || [],
    requiredSkills: opts?.requiredSkills || [],
    createdBy: AGENT_NAME
  };
  const dir = path.join(BUS_DIR, 'tasks');
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(task, null, 2));
  console.log(`[BUS] Created task ${id}`);
  return task;
}

function updateTaskStatus(taskId, status, opts) {
  const p = path.join(BUS_DIR, 'tasks', `${taskId}.json`);
  if (!fs.existsSync(p)) { console.log(`[BUS] Task ${taskId} not found`); return null; }
  const task = JSON.parse(fs.readFileSync(p, 'utf8'));
  task.status = status;
  task.lastUpdate = new Date().toISOString();
  if (status === 'active' && opts?.assignedTo) task.assignedTo = opts.assignedTo;
  if (status === 'stuck') { task.stuckSince = new Date().toISOString(); task.stuckReason = opts?.stuckReason || null; }
  if (status === 'completed') { task.completedAt = new Date().toISOString(); task.completedBy = AGENT_NAME; }
  fs.writeFileSync(p, JSON.stringify(task, null, 2));
  console.log(`[BUS] Task ${taskId} → ${status}`);
  return task;
}

function scanTasks(statusFilter) {
  const dir = path.join(BUS_DIR, 'tasks');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const tasks = files.map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } }).filter(Boolean);
  if (statusFilter) return tasks.filter(t => t.status === statusFilter);
  return tasks;
}

function scanStuckTasks(maxAgeMs) {
  const now = Date.now();
  return scanTasks('stuck').filter(task => {
    if (!task.stuckSince) return false;
    return now - new Date(task.stuckSince).getTime() > (maxAgeMs || 2 * 60 * 60 * 1000);
  });
}

function scanRegistry() {
  const dir = path.join(BUS_DIR, 'registry');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
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
  case "create-task":
    createTask(process.argv[3], process.argv[4], JSON.parse(process.argv[5] || '{}'));
    break;
  case "update-task":
    updateTaskStatus(process.argv[3], process.argv[4], JSON.parse(process.argv[5] || '{}'));
    break;
  case "scan-tasks":
    console.log(JSON.stringify(scanTasks(process.argv[3]), null, 2));
    break;
  case "scan-stuck":
    console.log(JSON.stringify(scanStuckTasks(parseInt(process.argv[3]) || 0), null, 2));
    break;
  case "scan-registry":
    console.log(JSON.stringify(scanRegistry(), null, 2));
    break;
  case "once":
  default:
    runOnce();
    break;
}