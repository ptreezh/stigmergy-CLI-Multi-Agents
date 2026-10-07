#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const BUS = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), ".stigmergy", "bus");
const AGENT = process.env.AGENT || "opencode";

function run(agent, cmd, args) {
  const env = {
    ...process.env,
    AGENT_NAME: agent,
    STIGMERGY_BUS_DIR: BUS,
    AGENT_CAPABILITIES: agent === "opencode" ? "coding,review" : agent === "zcode" ? "review,coding" : "review",
    AGENT_PROJECT: agent === "opencode" ? "D:\\socienceAI" : agent === "zcode" ? "D:\\powerSale" : process.cwd()
  };

  const result = execSync(`node ${path.join(process.cwd(), "bus", "coordinator.js")} ${cmd} ${args ? args.join(" ") : ""}`, {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    timeout: 10000
  });
  console.log(`[${agent}] ${cmd}: ${result.trim()}`);
  return result;
}

function createHandoff() {
  const id = `handoff-${Date.now()}`;
  const handoff = {
    id,
    from: "opencode",
    to: "zcode",
    type: "code_review",
    title: "Review socienceAI auth module",
    description: "Please review the auth module changes in D:\\socienceAI",
    priority: "high",
    artifacts: ["D:\\socienceAI\\src\\auth.js"],
    requirements: ["Tests must pass", "Follow style guide"],
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 3600000).toISOString(),
    status: "pending"
  };

  const dir = path.join(BUS, "handoffs", "pending");
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(handoff, null, 2));
  console.log(`[DEMO] Created handoff ${id}`);
  return id;
}

async function runDemo() {
  console.log("=== Stigmergy Coordination Bus Demo ===\n");

  console.log("Step 1: opencode registers");
  run("opencode", "register");
  console.log("");

  console.log("Step 2: ZCode registers");
  run("zcode", "register");
  console.log("");

  console.log("Step 3: opencode creates a handoff");
  const handoffId = createHandoff();
  console.log("");

  console.log("Step 4: ZCode scans for handoffs");
  run("zcode", "scan");
  console.log("");

  console.log("Step 5: ZCode accepts the handoff");
  run("zcode", "accept", [handoffId]);
  console.log("");

  console.log("Step 6: ZCode completes the handoff");
  run("zcode", "complete", [handoffId, "Review completed. Found 2 minor issues, approved with comments."]);
  console.log("");

  console.log("Step 7: Verify bus state");
  const completedDir = path.join(BUS, "handoffs", "completed");
  if (fs.existsSync(completedDir)) {
    const files = fs.readdirSync(completedDir).filter(f => f.endsWith(".json"));
    console.log(`[DEMO] Completed handoffs: ${files.length}`);
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(completedDir, file), "utf8"));
      console.log(`[DEMO] ${data.id}: ${data.title} (${data.status})`);
    }
  }

  console.log("\n=== Demo Complete ===");
  console.log("Coordination bus is working. Agents can:");
  console.log("- Register themselves");
  console.log("- Create handoffs");
  console.log("- Scan and accept handoffs");
  console.log("- Complete handoffs");
  console.log("- All via file-based bus with no central server");
}

runDemo().catch(console.error);