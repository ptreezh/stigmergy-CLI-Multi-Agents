const os = require("os");
const path = require("path");
const { getSignature, normalize } = require("./signatures");
const { runLayers } = require("./detect");
const { summarizeSessionStore } = require("./sessions");
const { cliVersion, resolvePath, exists } = require("./platform");
const {
  AI_MARKERS,
  looksLikeAi,
  reasonFor,
} = require("./heuristics");

function pickInstallPath(entry, sig) {
  const registry = entry.sources.find((s) => s.layer === "registry");
  if (registry?.detail?.installLocation) return registry.detail.installLocation;

  const proc = entry.sources.find((s) => s.layer === "process" && s.detail?.exePath);
  if (proc) return proc.detail.exePath;

  const declared = (sig.installPaths || [])
    .map((p) => resolvePath(p))
    .find((p) => exists(p));
  if (declared) return declared;

  const appdata = entry.sources.find((s) => s.layer === "appdata");
  if (appdata) return appdata.detail.path;

  if (entry.homeDirs?.length) return entry.homeDirs[0];
  if (entry.paths?.length) return entry.paths[0];
  return null;
}

function resolveVersion(entry, sig) {
  const registry = entry.sources.find((s) => s.layer === "registry" && s.detail?.version);
  if (registry) return { version: registry.detail.version, source: "registry" };

  const packages = entry.packages || [];
  if (packages.length) {
    const declared = new Set((sig.npm || []).map((n) => n.toLowerCase()));
    const preferred =
      packages.find((p) => p.name.toLowerCase() === (sig.npm || [])[0]?.toLowerCase()) ||
      packages.find((p) => declared.has(p.name.toLowerCase()));
    const chosen = preferred || packages[0];
    if (chosen?.version) return { version: chosen.version, source: `npm:${chosen.name}` };
  }
  if (sig.cli?.cmd) {
    const v = cliVersion(sig.cli.cmd, sig.cli.args);
    if (v) return { version: v, source: `cli:${sig.cli.cmd}` };
  }
  return { version: null, source: null };
}

function statusOf(entry) {
  const hasProcess = (entry.pids?.length || 0) > 0;
  const hasInstall = !!(entry.paths?.length || entry.homeDirs?.length);
  if (hasProcess) return "active";
  if (hasInstall) return "idle";
  return "unknown";
}

function confidenceOf(entry) {
  const layers = new Set(entry.layers || []);
  if (layers.has("process")) return "high";
  if (layers.has("registry") || layers.has("shortcut")) return "high";
  if (layers.size >= 3) return "medium";
  if (layers.size >= 1) return "low";
  return "none";
}

function toReport(entry) {
  const sig = getSignature(entry.id);
  if (!sig) return null;
  const version = resolveVersion(entry, sig);
  const store = sig.session ? summarizeSessionStore(sig) : null;
  const status = statusOf(entry);

  return {
    id: sig.id,
    name: sig.name,
    vendor: sig.vendor,
    tier: sig.tier,
    category: sig.category,
    status,
    confidence: confidenceOf(entry),
    install: {
      found: !!(entry.paths?.length || entry.homeDirs?.length),
      path: pickInstallPath(entry, sig),
      version: version.version,
      versionSource: version.source,
    },
    sessionStore: store,
    runtime: {
      running: status === "active",
      pids: entry.pids || [],
      processes: entry.processSamples || [],
    },
    recentCwds: store?.recentCwds || [],
    currentTask: store?.currentTask || null,
    detectedBy: entry.layers || [],
    evidence: entry.sources,
    limitation: buildLimitation(sig, store, status),
  };
}

function buildLimitation(sig, store, status) {
  const parts = [];
  if (store?.opaque) parts.push(store.note);
  if (!store && sig.session === null) parts.push("No local session store (cloud-only or platform tool)");
  if (store && !store.exists) parts.push("Session store absent");
  if (status === "idle") parts.push("Not running");
  if (sig.category === "cloud-chat") parts.push("Conversation history lives on vendor servers");
  return parts.length ? parts.join("; ") : null;
}

function unknownBucketFromProcesses(processes, agents = []) {
  const matched = new Set();
  for (const agent of agents) {
    for (const pid of agent.runtime?.pids || []) matched.add(pid);
  }

  const out = new Map();
  for (const p of processes) {
    if (matched.has(p.pid)) continue;
    if (!looksLikeAi(p.name)) continue;
    const key = normalize(p.name);
    if (AI_MARKERS.owned.has(key)) continue;
    const e = out.get(key) || { name: p.name, pids: [], reasons: new Set(), exePaths: [], cmdlines: [] };
    e.pids.push(p.pid);
    e.reasons.add(reasonFor(p.name));
    if (p.exePath && e.exePaths.length < 3) e.exePaths.push(p.exePath);
    if (p.cmdline && e.cmdlines.length < 3) e.cmdlines.push(p.cmdline.slice(0, 240));
    out.set(key, e);
  }
  return Array.from(out.values()).map((e) => ({
    name: e.name,
    pids: e.pids,
    confidence: "low",
    reason: [...e.reasons].join("; "),
    exePaths: e.exePaths,
    cmdlines: e.cmdlines,
  }));
}

function scan(options = {}) {
  const startedAt = Date.now();
  const { layers = null, includeUnknown = true } = options;

  const { merged, layerStats } = runLayers(layers);

  const agents = [];
  for (const entry of merged.values()) {
    const report = toReport(entry);
    if (report) agents.push(report);
  }

  agents.sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : b.status === "active" ? 1 : 0;
    return (b.tier || 0) - (a.tier || 0) || a.name.localeCompare(b.name);
  });

  const unknown = includeUnknown ? unknownBucketFromProcesses(options.processes || [], agents) : [];

  const degradedLayers = Object.entries(layerStats)
    .filter(([, s]) => s.degraded || s.available === false)
    .map(([id, s]) => ({ id, error: s.error || s.note || "unavailable" }));

  return {
    scanTime: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    target: {
      hostname: os.hostname(),
      os: `${os.platform()} ${os.release()}`,
      arch: os.arch(),
      username: os.userInfo().username,
      home: os.homedir(),
    },
    layers: layerStats,
    degradedLayers,
    agents,
    unknownApps: unknown,
    summary: {
      totalFound: agents.length,
      active: agents.filter((a) => a.status === "active").length,
      idle: agents.filter((a) => a.status === "idle").length,
      withVersion: agents.filter((a) => a.install.version).length,
      withTask: agents.filter((a) => a.currentTask).length,
      withCwd: agents.filter((a) => a.recentCwds.length > 0).length,
      unknownApps: unknown.length,
    },
  };
}

module.exports = {
  scan,
  toReport,
  resolveVersion,
  statusOf,
  confidenceOf,
  unknownBucketFromProcesses,
  pickInstallPath,
  buildLimitation,
};