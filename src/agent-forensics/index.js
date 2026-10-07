const { scan } = require("./orchestrator");
const { listProcesses } = require("./platform");

function collectProcesses() {
  try {
    return listProcesses();
  } catch {
    return [];
  }
}

function run(options = {}) {
  const { format = "table", layers = null, showUnknown = true } = options;
  const processes = collectProcesses();
  const report = scan({ layers, includeUnknown: showUnknown, processes });
  const output = formatOutput(report, format);
  if (output) console.log(output);
  return report;
}

function truncate(str, max = 58) {
  const s = String(str || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function formatTable(report) {
  const L = [];
  L.push("");
  L.push("=== AI Agent Inventory ===");
  L.push(`Machine: ${report.target.hostname} (${report.target.os} ${report.target.arch})`);
  L.push(`Scan time: ${report.scanTime}  (${report.durationMs}ms)`);
  L.push("");

  if (report.agents.length === 0) {
    L.push("No AI agents detected.");
    return L.join("\n");
  }

  for (const a of report.agents) {
    const icon = a.status === "active" ? "[ON ]" : a.status === "idle" ? "[IDLE]" : "[?   ]";
    const ver = a.install.version ? ` v${truncate(a.install.version, 24)}` : "";
    L.push(`${icon} ${a.name}${ver}  (${a.vendor}, ${a.category})`);

    L.push(`      install : ${a.install.path || "(unknown)"}`);
    if (a.install.versionSource) L.push(`      version : ${a.install.versionSource}`);

    if (a.runtime.running) {
      L.push(`      running : PIDs ${a.runtime.pids.join(", ")}`);
    }

    if (a.sessionStore) {
      const st = a.sessionStore;
      const bits = [st.type];
      if (st.fileCount) bits.push(`${st.fileCount} file(s)`);
      if (st.lastActivity) bits.push(`last ${st.lastActivity.slice(0, 16).replace("T", " ")}`);
      L.push(`      session : ${bits.join(" / ")} @ ${truncate(st.root, 70)}`);
    } else {
      L.push(`      session : (none tracked)`);
    }

    if (a.recentCwds.length) {
      L.push(`      cwd     : ${a.recentCwds.slice(0, 3).map((c) => truncate(c.path, 46)).join("  |  ")}`);
    }

    if (a.currentTask) {
      L.push(`      task    : ${truncate(a.currentTask.text, 100)}`);
    }

    L.push(`      sources : ${a.detectedBy.join(", ")}  [${a.confidence}]`);
    if (a.limitation) L.push(`      note    : ${truncate(a.limitation, 96)}`);
    L.push("");
  }

  if (report.unknownApps && report.unknownApps.length) {
    L.push("--- Unknown AI-like processes (heuristic) ---");
    for (const u of report.unknownApps.slice(0, 12)) {
      L.push(`  ${u.name} (PID ${u.pids.join(",")}) - ${u.reason}`);
      if (u.exePaths[0]) L.push(`      ${u.exePaths[0]}`);
    }
    L.push("");
  }

  L.push("--- Detection layers ---");
  for (const [id, s] of Object.entries(report.layers)) {
    const flag = s.degraded ? "DEGRADED" : "ok";
    const detail = s.error || s.note || `scanned ${s.scanned ?? s.npm ?? 0} / matched ${s.matched ?? 0}`;
    L.push(`  ${id.padEnd(12)} ${flag.padEnd(9)} ${detail}`);
  }
  if (report.degradedLayers.length) {
    L.push(`  ! degraded: ${report.degradedLayers.map((d) => d.id).join(", ")}`);
  }
  L.push("");

  L.push("--- Summary ---");
  const s = report.summary;
  L.push(`Total ${s.totalFound}  |  active ${s.active}  |  idle ${s.idle}`);
  L.push(`With version ${s.withVersion}  |  with cwd ${s.withCwd}  |  with task ${s.withTask}  |  unknown procs ${s.unknownApps}`);
  L.push("");

  return L.join("\n");
}

function formatJson(report) {
  return JSON.stringify(report, null, 2);
}

function formatOutput(report, format = "table") {
  return format === "json" ? formatJson(report) : formatTable(report);
}

module.exports = {
  run,
  scan,
  formatTable,
  formatJson,
  formatOutput,
};