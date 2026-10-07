const os = require("os");
const path = require("path");
const {
  IS_WIN,
  HOME,
  APPDATA,
  LOCALAPPDATA,
  resolvePath,
  exists,
  stat,
  listShortcuts,
  readInstalledApps,
  listProcesses,
  listNpmGlobal,
  listVscodeExtensions,
  listWorkspaceRoots,
} = require("./platform");
const { buildMatcher } = require("./matcher");
const { getSignatures } = require("./signatures");

const UNINSTALL_NOISE = [
  "uninstall",
  "卸载",
  "readme",
  "help",
  "documentation",
  "release notes",
  "user manual",
  "documentation for",
  "windows sdk",
  "sdk and targeting pack",
  "webview2",
  "redistributable",
  "runtime",
  "odbc",
  "app installer",
];

function looksLikeUninstall(name) {
  const n = String(name || "").toLowerCase();
  return UNINSTALL_NOISE.some((k) => n.includes(k));
}

function layerShortcuts(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, skipped: 0, costMs: 0, available: true };

  let shortcuts = [];
  try {
    shortcuts = listShortcuts();
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  stats.scanned = shortcuts.length;

  for (const sc of shortcuts) {
    if (looksLikeUninstall(sc.name)) {
      stats.skipped++;
      continue;
    }
    const sig = matcher.byExactName(sc.name) || matcher.byName(sc.name);
    if (!sig) continue;
    stats.matched++;
    const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
    entry.sources.push({
      layer: "shortcut",
      detail: { shortcutPath: sc.path, shortcutName: sc.name },
    });
    entry.paths.push(sc.path);
    observed.set(sig.id, entry);
  }

  return { observed, stats };
}

function layerRegistry(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, skipped: 0, available: true };

  let apps = [];
  try {
    apps = readInstalledApps();
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  stats.scanned = apps.length;

  for (const app of apps) {
    if (!app.name || looksLikeUninstall(app.name)) {
      stats.skipped++;
      continue;
    }
    const sig = matcher.byExactName(app.name) || matcher.byName(app.name);
    if (!sig) continue;
    stats.matched++;
    const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
    entry.sources.push({
      layer: "registry",
      detail: {
        displayName: app.name,
        version: app.version,
        installLocation: app.installLocation,
        publisher: app.publisher,
      },
    });
    if (app.installLocation) entry.paths.push(app.installLocation);
    if (app.version && !entry.version) entry.version = app.version;
    observed.set(sig.id, entry);
  }

  return { observed, stats };
}

function layerProcesses(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, available: true };

  let procs = [];
  try {
    procs = listProcesses();
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  stats.scanned = procs.length;

  for (const p of procs) {
    const sig = matcher.byProcess(p.name);
    if (!sig) continue;
    stats.matched++;
    const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
    entry.pids = entry.pids || [];
    if (!entry.pids.includes(p.pid)) entry.pids.push(p.pid);
    entry.processSamples = entry.processSamples || [];
    if (entry.processSamples.length < 4) {
      entry.processSamples.push({
        name: p.name,
        pid: p.pid,
        exePath: p.exePath,
        cmdline: p.cmdline ? p.cmdline.slice(0, 400) : null,
      });
    }
    if (p.exePath) entry.paths.push(path.dirname(p.exePath));
    entry.sources.push({
      layer: "process",
      detail: { processName: p.name, pid: p.pid, exePath: p.exePath },
    });
    observed.set(sig.id, entry);
  }

  return { observed, stats };
}

function layerAppData(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, available: true };

  if (!IS_WIN) {
    stats.available = false;
    stats.note = "AppData layer is Windows-specific";
    return { observed, stats };
  }

  const roots = [
    { dir: APPDATA, kind: "roaming" },
    { dir: LOCALAPPDATA, kind: "local" },
  ];

  for (const { dir, kind } of roots) {
    let entries = [];
    try {
      entries = require("./platform").listDir(dir);
      stats.available = true;
    } catch (err) {
      stats.available = false;
      stats.error = err.message;
      continue;
    }
    stats.scanned += entries.length;
    for (const name of entries) {
      if (looksLikeUninstall(name)) continue;
      const sig = matcher.byDirName(name, kind);
      if (!sig) continue;
      stats.matched++;
      const full = path.join(dir, name);
      const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
      entry.appData = entry.appData || {};
      entry.appData[kind] = full;
      entry.paths.push(full);
      const s = stat(full);
      entry.sources.push({
        layer: "appdata",
        detail: { kind, name, path: full, lastModified: s ? s.mtime.toISOString() : null },
      });
      observed.set(sig.id, entry);
    }
  }

  return { observed, stats };
}

function layerPackageManagers(signatures, matcher) {
  const observed = new Map();
  const stats = { npm: 0, matched: 0, available: true };

  let pkgs = [];
  try {
    pkgs = listNpmGlobal();
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  stats.npm = pkgs.length;

  for (const pkg of pkgs) {
    const sig = matcher.byNpmPackage(pkg.name);
    if (!sig) continue;
    stats.matched++;
    const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
    entry.packages = entry.packages || [];
    entry.packages.push({ name: pkg.name, version: pkg.version, manager: "npm" });
    if (pkg.binDir) entry.paths.push(pkg.binDir);
    entry.sources.push({
      layer: "pkg",
      detail: { package: pkg.name, version: pkg.version, manager: "npm" },
    });
    observed.set(sig.id, entry);
  }

  return { observed, stats };
}

function layerHomeDirs(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, available: true };

  let entries = [];
  try {
    entries = require("./platform").listDir(HOME);
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  for (const name of entries) {
    if (!name.startsWith(".")) continue;
    stats.scanned++;
    const sig = matcher.byDirName(name, "home");
    if (!sig) continue;
    stats.matched++;
    const full = path.join(HOME, name);
    const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
    entry.homeDirs = entry.homeDirs || [];
    entry.homeDirs.push(full);
    entry.paths.push(full);
    const s = stat(full);
    entry.sources.push({
      layer: "homedir",
      detail: { name, path: full, lastModified: s ? s.mtime.toISOString() : null },
    });
    observed.set(sig.id, entry);
  }

  return { observed, stats };
}

function layerVscodeExtensions(signatures, matcher) {
  const observed = new Map();
  const stats = { scanned: 0, matched: 0, available: true };

  let exts = [];
  try {
    exts = listVscodeExtensions();
    stats.available = true;
  } catch (err) {
    stats.available = false;
    stats.error = err.message;
    return { observed, stats };
  }

  stats.scanned = exts.length;

  for (const sig of signatures) {
    for (const wanted of sig.vscodeExtensions || []) {
      const hit = exts.find((e) => e.name.toLowerCase() === wanted.toLowerCase());
      if (!hit) continue;
      stats.matched++;
      const entry = observed.get(sig.id) || { name: sig.name, sources: [], paths: [] };
      entry.paths.push(hit.dir);
      entry.sources.push({
        layer: "vscode-ext",
        detail: { extension: hit.name, version: hit.version, dir: hit.dir },
      });
      observed.set(sig.id, entry);
    }
  }

  return { observed, stats };
}

const LAYERS = [
  { id: "shortcut", fn: layerShortcuts, weight: 3 },
  { id: "registry", fn: layerRegistry, weight: 3 },
  { id: "process", fn: layerProcesses, weight: 4 },
  { id: "appdata", fn: layerAppData, weight: 2 },
  { id: "pkg", fn: layerPackageManagers, weight: 2 },
  { id: "homedir", fn: layerHomeDirs, weight: 2 },
  { id: "vscode-ext", fn: layerVscodeExtensions, weight: 1 },
];

function runLayers(layerIds) {
  const signatures = getSignatures();
  const matcher = buildMatcher(signatures);
  const merged = new Map();
  const layerStats = {};

  const enabled = LAYERS.filter((l) => !layerIds || layerIds.length === 0 || layerIds.includes(l.id));

  for (const layer of enabled) {
    let res;
    try {
      res = layer.fn(signatures, matcher);
    } catch (err) {
      layerStats[layer.id] = { available: false, error: err.message, weight: layer.weight };
      continue;
    }
    layerStats[layer.id] = { ...res.stats, weight: layer.weight, degraded: res.stats.available === false };
    for (const [id, entry] of res.observed) {
      const cur = merged.get(id) || { id, name: entry.name, sources: [], paths: [], score: 0, layers: [] };
      cur.name = entry.name;
      cur.sources.push(...entry.sources);
      cur.paths.push(...(entry.paths || []));
      for (const k of ["pids", "processSamples", "appData", "homeDirs", "version", "packages"]) {
        if (entry[k] !== undefined) {
          if (Array.isArray(entry[k]) && Array.isArray(cur[k])) cur[k] = [...new Set([...cur[k], ...entry[k]])];
          else if (cur[k] === undefined) cur[k] = entry[k];
        }
      }
      cur.layers = [...new Set([...cur.layers, layer.id])];
      cur.score += layer.weight;
      merged.set(id, cur);
    }
  }

  return { merged, layerStats };
}

module.exports = {
  LAYERS,
  UNINSTALL_NOISE,
  looksLikeUninstall,
  layerShortcuts,
  layerRegistry,
  layerProcesses,
  layerAppData,
  layerPackageManagers,
  layerHomeDirs,
  layerVscodeExtensions,
  runLayers,
};