const os = require("os");
const path = require("path");
const fs = require("fs");
const { execFile, execFileSync } = require("child_process");

const HOME = os.homedir();
const PLATFORM = os.platform();
const IS_WIN = PLATFORM === "win32";

const APPDATA = IS_WIN ? path.join(HOME, "AppData", "Roaming") : path.join(HOME, "Library", "Application Support");
const LOCALAPPDATA = IS_WIN ? path.join(HOME, "AppData", "Local") : path.join(HOME, "Library", "Application Support");
const CONFIG_HOME = IS_WIN ? APPDATA : path.join(HOME, ".config");

function resolvePath(p) {
  if (!p) return p;
  let out = p.replace(/~/g, HOME);
  if (IS_WIN) {
    out = out
      .replace(/%LOCALAPPDATA%/gi, LOCALAPPDATA)
      .replace(/%APPDATA%/gi, APPDATA)
      .replace(/%CONFIG%/gi, CONFIG_HOME)
      .replace(/%USERPROFILE%/gi, HOME);
  } else {
    out = out.replace(/%LOCALAPPDATA%/gi, LOCALAPPDATA).replace(/%APPDATA%/gi, APPDATA);
  }
  return out;
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function stat(p) {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

function readFile(p) {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function readJson(p) {
  const raw = readFile(p);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listDir(p) {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

function mtime(p) {
  const s = stat(p);
  return s ? s.mtime : null;
}

function newestFileIn(dir, filter, maxDepth = 3) {
  let best = null;
  const walk = (d, depth) => {
    if (depth > maxDepth) return;
    for (const entry of listDir(d)) {
      if (SKIP_SCAN_DIRS.has(entry)) continue;
      const full = path.join(d, entry);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) {
        walk(full, depth + 1);
      } else if (!filter || filter(entry)) {
        if (!best || s.mtime > best.mtime) best = { path: full, mtime: s.mtime, size: s.size };
      }
    }
  };
  walk(dir, 0);
  return best;
}

const SKIP_SCAN_DIRS = new Set([
  "node_modules", ".git", "Cache", "Code Cache", "GPUCache", "Crashpad",
  "logs", "log", "temp", "tmp", "DawnGraphiteCache", "DawnWebGPUCache",
  "blob_storage", "Service Worker", "Shared Dictionary",
]);

function countFilesRecursive(dir, filter, maxDepth = 3) {
  let count = 0;
  const walk = (d, depth) => {
    if (depth > maxDepth) return;
    for (const entry of listDir(d)) {
      if (SKIP_SCAN_DIRS.has(entry)) continue;
      const full = path.join(d, entry);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) walk(full, depth + 1);
      else if (!filter || filter(entry)) count++;
    }
  };
  walk(dir, 0);
  return count;
}

function psExec(script, timeout = 25000) {
  const res = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    encoding: "utf-8",
    timeout,
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  return res;
}

function psJson(script, timeout = 25000) {
  const out = psExec(script, timeout);
  const trimmed = out.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.search(/[[{]/);
    if (start === -1) return null;
    try {
      return JSON.parse(trimmed.slice(start));
    } catch {
      return null;
    }
  }
}

function listShortcuts() {
  if (!IS_WIN) {
    return [];
  }
  const roots = [
    path.join(APPDATA, "Microsoft", "Windows", "Start Menu", "Programs"),
    path.join(HOME, "Desktop"),
    "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs",
  ];
  const out = [];
  const walk = (dir, depth) => {
    if (depth > 4) return;
    for (const entry of listDir(dir)) {
      const full = path.join(dir, entry);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) walk(full, depth + 1);
      else if (/\.lnk$/i.test(entry)) out.push({ name: entry.replace(/\.lnk$/i, ""), path: full });
    }
  };
  for (const r of roots) walk(r, 0);
  return out;
}

function readInstalledApps() {
  if (!IS_WIN) return [];
  const script = `
$paths = @(
  'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
)
$items = Get-ItemProperty $paths -ErrorAction SilentlyContinue |
  Where-Object { $_.DisplayName -and -not $_.SystemComponent } |
  Select-Object DisplayName, DisplayVersion, InstallLocation, Publisher, UninstallString
$items | Sort-Object DisplayName -Unique | ConvertTo-Json -Compress -Depth 3
`;
  const data = psJson(script, 30000);
  if (!data) return [];
  const list = Array.isArray(data) ? data : [data];
  return list.map((a) => ({
    name: a.DisplayName,
    version: a.DisplayVersion || null,
    installLocation: (a.InstallLocation || "").replace(/^"|"$/g, "") || null,
    publisher: a.Publisher || null,
    uninstallString: a.UninstallString || null,
  }));
}

function listProcesses() {
  if (IS_WIN) {
    const script = `
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Select-Object ProcessId, Name, ExecutablePath, CommandLine |
  ConvertTo-Json -Compress -Depth 3
`;
    const data = psJson(script, 30000);
    if (!data) return [];
    const list = Array.isArray(data) ? data : [data];
    return list
      .filter((p) => p && p.Name)
      .map((p) => ({
        name: String(p.Name),
        pid: p.ProcessId,
        exePath: p.ExecutablePath || null,
        cmdline: p.CommandLine || null,
      }));
  }
  try {
    const out = execFileSync("ps", ["-eo", "pid,lstart,args"], {
      encoding: "utf-8",
      timeout: 15000,
      maxBuffer: 32 * 1024 * 1024,
    });
    return out
      .split("\n")
      .slice(1)
      .map((line) => {
        const m = line.trim().match(/^(\d+)\s+(\w{3}\s+\w+\s+\d+\s+[\d:]+(?:\s+\d{4})?)\s+(.*)$/);
        if (!m) return null;
        const args = m[3];
        const name = args.split(/\s+/)[0].split("/").pop();
        return {
          name,
          pid: Number(m[1]),
          exePath: null,
          cmdline: args,
          startedAt: new Date(m[2]),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function listNpmGlobal() {
  const cacheKey = "npm-global";
  if (npmGlobalCache.has(cacheKey)) return npmGlobalCache.get(cacheKey);
  
  const out = [];
  const run = (args) => {
    try {
      return execFileSync("npm", args, {
        encoding: "utf-8",
        timeout: 25000,
        maxBuffer: 16 * 1024 * 1024,
        shell: IS_WIN,
      });
    } catch (err) {
      return err.stdout || "";
    }
  };
  const json = run(["ls", "-g", "--depth=0", "--json"]);
  try {
    const data = JSON.parse(json);
    const deps = data.dependencies || {};
    for (const [name, meta] of Object.entries(deps)) {
      out.push({ name, version: meta.version || null, manager: "npm", binDir: data.path || null });
    }
  } catch {
    const text = run(["ls", "-g", "--depth=0"]);
    for (const line of text.split("\n")) {
      const m = line.match(/[+\\|-]*\s*(@?[^@\s]+(?:\/[^@\s]+)?)@([\dw.\-+]+)/);
      if (m) out.push({ name: m[1], version: m[2], manager: "npm", binDir: null });
    }
  }
  npmGlobalCache.set(cacheKey, out);
  return out;
}

function clearCache() {
  versionCache.clear();
  npmGlobalCache.clear();
}

function listPipGlobal() {
  if (IS_WIN) return [];
  try {
    const out = execFileSync("pip3", ["list", "--format=json"], { encoding: "utf-8", timeout: 20000 });
    const data = JSON.parse(out);
    return data.map((p) => ({ name: p.name, version: p.version, manager: "pip" }));
  } catch {
    return [];
  }
}

const versionCache = new Map();
const npmGlobalCache = new Map();

function cliVersion(cmd, args = ["--version"]) {
  const key = `${cmd}${args.join(",")}`;
  if (versionCache.has(key)) return versionCache.get(key);
  try {
    const res = execFileSync(cmd, args, {
      encoding: "utf-8",
      timeout: 8000,
      shell: IS_WIN,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const version = res.trim().split(/\r?\n/)[0] || null;
    versionCache.set(key, version);
    return version;
  } catch {
    return null;
  }
}

function listVscodeExtensions() {
  const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[0-9a-f]{3}-[0-9a-f]{12}$/i;
  const dirs = IS_WIN
    ? [path.join(HOME, ".vscode", "extensions")]
    : [path.join(HOME, ".vscode", "extensions"), path.join(HOME, ".vscode-insiders", "extensions")];
  const found = [];
  for (const dir of dirs) {
    for (const entry of listDir(dir)) {
      const full = path.join(dir, entry);
      const s = stat(full);
      if (!s || !s.isDirectory()) continue;
      // Skip GUID-named directories (VS Code extension cache artifacts)
      if (GUID_RE.test(entry)) continue;
      const cut = entry.lastIndexOf("-");
      const name = cut > 0 ? entry.slice(0, cut) : entry;
      const version = cut > 0 ? entry.slice(cut + 1) : null;
      found.push({ name, version, dir: full });
    }
  }
  return found;
}

function listWorkspaceRoots() {
  if (!IS_WIN) return ["C:\\Program Files", "C:\\Program Files (x86)", "/Applications", "/usr/local/bin"];
  return ["C:\\Program Files", "C:\\Program Files (x86)", "D:\\Program Files", "E:\\Program Files"];
}

module.exports = {
  PLATFORM,
  IS_WIN,
  HOME,
  APPDATA,
  LOCALAPPDATA,
  CONFIG_HOME,
  resolvePath,
  exists,
  stat,
  readFile,
  readJson,
  listDir,
  mtime,
  newestFileIn,
  countFilesRecursive,
  psExec,
  psJson,
  listShortcuts,
  readInstalledApps,
  listProcesses,
  listNpmGlobal,
  listPipGlobal,
  cliVersion,
  listVscodeExtensions,
  listWorkspaceRoots,
  SKIP_SCAN_DIRS,
  clearCache,
};