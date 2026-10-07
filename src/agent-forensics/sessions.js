const os = require("os");
const path = require("path");
const { readJson, listDir, stat, exists, resolvePath } = require("./platform");

const MAX_TAIL_BYTES = 96 * 1024;

function readTail(filePath, maxBytes = MAX_TAIL_BYTES) {
  try {
    const fs = require("fs");
    const fd = fs.openSync(filePath, "r");
    try {
      const size = fs.fstatSync(fd).size;
      const len = Math.min(size, maxBytes);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, size - len);
      return buf.toString("utf-8");
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return null;
  }
}

function newestInTree(dir, filter, maxDepth = 3) {
  let best = null;
  const walk = (d, depth) => {
    if (depth > maxDepth) return;
    for (const entry of listDir(d)) {
      const full = path.join(d, entry);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) walk(full, depth + 1);
      else if (!filter || filter(entry)) {
        if (!best || s.mtime > best.mtime) best = { path: full, mtime: s.mtime, size: s.size };
      }
    }
  };
  walk(dir, 0);
  return best;
}

function decodeProjectDirName(dirName) {
  const m = dirName.match(/^(-?)([a-zA-Z])-(.*)$/);
  if (!m) return null;
  const [, , drive, body] = m;
  const joined = body.split("-").filter(Boolean).join(path.sep);
  if (!joined) return null;
  return `${drive}:${path.sep}${joined}`;
}

function recentCwdFromEncodedProjects(root, limit = 5) {
  const out = [];
  for (const entry of listDir(root)) {
    const full = path.join(root, entry);
    const s = stat(full);
    if (!s || !s.isDirectory()) continue;
    const decoded = decodeProjectDirName(entry);
    out.push({ path: decoded || full, source: "encoded-project-dir", lastActivity: s.mtime.toISOString() });
  }
  out.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  return out.slice(0, limit);
}

function extractJsonlRecords(filePath, typeFilter) {
  const text = readTail(filePath);
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t[0] !== "{") continue;
    let obj;
    try {
      obj = JSON.parse(t);
    } catch {
      continue;
    }
    if (!obj || typeof obj !== "object") continue;
    if (typeFilter && obj.type && !typeFilter.includes(obj.type)) continue;
    out.push(obj);
  }
  return out;
}

function textFromContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const parts = [];
    for (const c of content) {
      if (typeof c === "string") parts.push(c);
      else if (c && typeof c.text === "string") parts.push(c.text);
    }
    return parts.join("\n");
  }
  if (content && typeof content.text === "string") return content.text;
  return "";
}

function currentTaskFromJsonl(filePath) {
  const recs = extractJsonlRecords(filePath, ["user", "human"]);
  for (let i = recs.length - 1; i >= 0; i--) {
    const r = recs[i];
    const msg = r.message || r;
    const raw = textFromContent(msg.content ?? msg.text);
    if (!raw) continue;
    const text = raw.replace(/\s+/g, " ").trim();
    if (text.startsWith("<") || text.startsWith("[Request interrupted")) continue;
    if (/^Base directory for this skill:/i.test(text)) continue;
    if (/^<command-name>/i.test(text)) continue;
    if (/^<local-command-stdout>/i.test(text)) continue;
    if (/^<skill-name>/i.test(text)) continue;
    if (text.length < 3) continue;
    return { text: text.slice(0, 220), truncated: text.length > 220 };
  }
  return null;
}

function cwdFromJsonl(filePath) {
  const recs = extractJsonlRecords(filePath);
  for (const r of recs) {
    if (typeof r.cwd === "string") return r.cwd;
    if (r.payload && typeof r.payload.cwd === "string") return r.payload.cwd;
  }
  return null;
}

function recentCwdFromJsonl(root, limit = 5) {
  const newest = newestInTree(root, (e) => e.endsWith(".jsonl"), 3);
  if (!newest) return [];
  const cwd = cwdFromJsonl(newest.path);
  if (!cwd) return [];
  return [{ path: cwd, source: "jsonl-cwd", lastActivity: newest.mtime.toISOString(), file: newest.path }];
}

function fileUriToPath(uri) {
  try {
    const decoded = decodeURIComponent(String(uri));
    if (/^file:\/\/\//i.test(decoded)) {
      let p = decoded.replace(/^file:\/\/\//i, "");
      p = p.replace(/^\/([a-zA-Z]:)/, "$1");
      return decodeURIComponent(p).replace(/\//g, path.sep);
    }
  } catch {
    return null;
  }
  return null;
}

function recentCwdFromVscdbProfile(root, limit = 5) {
  const storageJson = path.join(root, "globalStorage", "storage.json");
  const data = readJson(storageJson);
  if (!data) return [];
  const groups = [];
  const assoc = data.profileAssociations?.workspaces;
  if (assoc && typeof assoc === "object") groups.push(...Object.keys(assoc));
  const backup = data.backupWorkspaces?.workspaces;
  if (Array.isArray(backup)) groups.push(...backup.map((w) => w?.folder).filter(Boolean));
  const recentlyOpened = data["windowsx"]?.[0]?.[2];
  if (Array.isArray(recentlyOpened?.openedPathsList)) {
    for (const entry of recentlyOpened.openedPathsList) {
      if (entry?.folderUri) groups.push(entry.folderUri);
    }
  }
  const out = [];
  for (const uri of groups) {
    const p = fileUriToPath(uri);
    if (p) out.push({ path: p, source: "vscdb-profile-workspaces" });
  }
  return out.slice(0, limit);
}

function recentCwdFromOpencodeStorage(root, limit = 5) {
  const out = [];
  for (const dirName of listDir(root)) {
    const dir = path.join(root, dirName);
    for (const f of listDir(dir)) {
      if (!f.endsWith(".json")) continue;
      const full = path.join(dir, f);
      const s = stat(full);
      const data = readJson(full);
      if (!data || !data.directory) continue;
      out.push({ path: data.directory, source: "opencode-directory", lastActivity: (s ? s.mtime : new Date()).toISOString() });
    }
  }
  out.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  return out.slice(0, limit);
}

function summarizeSessionStore(sig) {
  const conf = sig.session;
  if (!conf) return null;
  const root = resolvePath(conf.root);
  const result = {
    type: conf.type,
    root,
    exists: exists(root),
    fileCount: 0,
    lastActivity: null,
    recentCwds: [],
    currentTask: null,
    encrypted: false,
    note: null,
  };
  if (!result.exists) {
    result.note = "Session store not present";
    return result;
  }

  if (conf.type === "jsonl") {
    const newest = newestInTree(root, (e) => e.endsWith(".jsonl"), 3);
    if (newest) {
      result.fileCount = countJsonl(root);
      result.lastActivity = newest.mtime.toISOString();
      result.lastFile = newest.path;
      if (conf.recentCwd === "encoded-project-dir") {
        result.recentCwds = recentCwdFromEncodedProjects(root);
      } else if (conf.recentCwd === "jsonl-cwd" && newest.path) {
        const cwd = cwdFromJsonl(newest.path);
        if (cwd) result.recentCwds = [{ path: cwd, source: "jsonl-cwd", lastActivity: newest.mtime.toISOString() }];
      }
      if (conf.currentTask === "last-user-message") {
        result.currentTask = currentTaskFromJsonl(newest.path);
      }
    } else {
      result.note = "No session files found";
    }
  } else if (conf.type === "opencode-storage") {
    result.recentCwds = recentCwdFromOpencodeStorage(root);
    result.currentTask = currentTaskFromOpencodeTask(root);
    result.fileCount = countJson(root, (e) => e.endsWith(".json"));
    const newest = newestInTree(root, (e) => e.endsWith(".json"), 2);
    if (newest) result.lastActivity = newest.mtime.toISOString();
  } else if (conf.type === "vscdb") {
    result.recentCwds = recentCwdFromVscdbProfile(root);
    const newest = newestInTree(path.join(root, "workspaceStorage"), null, 1);
    if (newest) result.lastActivity = newest.mtime.toISOString();
    const globalDb = path.join(root, "globalStorage", "state.vscdb");
    result.fileCount = exists(globalDb) ? 1 : 0;
    if (result.lastActivity && result.recentCwds.length === 0) {
      result.note = "Workspace paths unavailable; see VS Code profile storage";
    }
    result.encrypted = false;
  } else if (conf.type === "electron") {
    result.fileCount = countEntries(root);
    const dirs = ["Partitions", "Local Storage", "IndexedDB", "Session Storage", "Network", "logs"];
    let latest = null;
    for (const d of dirs) {
      const s = stat(path.join(root, d));
      if (s && (!latest || s.mtime > latest.mtime)) latest = s;
    }
    if (latest) result.lastActivity = latest.mtime.toISOString();
    result.note = "Electron store; conversation history is app-internal (LevelDB/IndexedDB)";
    result.opaque = true;
  }

  return result;
}

function currentTaskFromOpencodeTask(root) {
  const files = [];
  for (const dirName of listDir(root)) {
    const dir = path.join(root, dirName);
    for (const f of listDir(dir)) {
      if (!f.endsWith(".json")) continue;
      const s = stat(path.join(dir, f));
      if (s) files.push({ path: path.join(dir, f), mtime: s.mtime });
    }
  }
  files.sort((a, b) => b.mtime - a.mtime);
  for (const f of files) {
    const data = readJson(f.path);
    if (data?.title) {
      return {
        text: String(data.title).slice(0, 220),
        sessionId: data.id,
        updated: data.time?.updated ? new Date(data.time.updated).toISOString() : f.mtime.toISOString(),
      };
    }
  }
  return null;
}

function countJsonl(dir) {
  let n = 0;
  const walk = (d, depth) => {
    if (depth > 3) return;
    for (const e of listDir(d)) {
      const full = path.join(d, e);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) walk(full, depth + 1);
      else if (e.endsWith(".jsonl")) n++;
    }
  };
  walk(dir, 0);
  return n;
}

function countJson(dir) {
  let n = 0;
  const walk = (d, depth) => {
    if (depth > 3) return;
    for (const e of listDir(d)) {
      const full = path.join(d, e);
      const s = stat(full);
      if (!s) continue;
      if (s.isDirectory()) walk(full, depth + 1);
      else if (e.endsWith(".json")) n++;
    }
  };
  walk(dir, 0);
  return n;
}

function countEntries(dir) {
  return listDir(dir).length;
}

module.exports = {
  readTail,
  newestInTree,
  decodeProjectDirName,
  recentCwdFromEncodedProjects,
  extractJsonlRecords,
  textFromContent,
  currentTaskFromJsonl,
  cwdFromJsonl,
  recentCwdFromJsonl,
  fileUriToPath,
  recentCwdFromVscdbProfile,
  recentCwdFromOpencodeStorage,
  currentTaskFromOpencodeTask,
  summarizeSessionStore,
};