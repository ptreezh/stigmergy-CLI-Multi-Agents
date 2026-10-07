#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const WIKI_DIR = path.join(process.cwd(), "wiki");
const LATEST_FILE = path.join(WIKI_DIR, "latest.json");
const STATE_FILE = path.join(WIKI_DIR, "state.json");

function verify() {
  console.log("[VERIFY] Wiki Scanner Verification\n");

  if (!fs.existsSync(LATEST_FILE)) {
    console.error("[VERIFY] FAIL: latest.json not found");
    process.exit(1);
  }

  const latest = JSON.parse(fs.readFileSync(LATEST_FILE, "utf8"));
  const agentCount = Object.keys(latest.agents || {}).length;
  const projectCount = Object.keys(latest.projects || {}).length;

  console.log(`[VERIFY] Active agents: ${agentCount}`);
  console.log(`[VERIFY] Projects discovered: ${projectCount}`);

  console.log("\n[VERIFY] Agents:");
  for (const [name, agent] of Object.entries(latest.agents || {})) {
    console.log(`  ${name}: ${agent.type}, lastActivity=${agent.lastActivity}, memoryFiles=${agent.memoryFileCount}`);
  }

  console.log('\n[VERIFY] Projects:');
  for (const [projectPath, project] of Object.entries(latest.projects || {})) {
    console.log(`  ${projectPath}`);
    console.log(`    Agents: ${(project.agents || []).join(", ")}`);
    console.log(`    Last seen: ${project.lastSeen || 'never'}`);
    console.log(`    Recent activity: ${project.summary?.recentActivity || 0} events`);
  }

  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    console.log(`\n[VERIFY] State file exists: ${STATE_FILE}`);
    console.log(`[VERIFY] Last scan: ${state.lastRun || 'never'}`);
    console.log(`[VERIFY] Evidence count: ${state.evidence?.length || 0}`);
  }

  console.log('\n[VERIFY] Verification complete.');
}

verify();
