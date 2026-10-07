const chalk = require("chalk");
const { AgentCoordinator } = require("../../core/agent_coordinator");

async function handleDashboardCommand(options = {}) {
  try {
    const coordinator = new AgentCoordinator();
    await coordinator.initialize();

    const dashboard = await coordinator.getDashboard();

    if (options.json) {
      console.log(JSON.stringify(dashboard, null, 2));
      return;
    }

    console.log(chalk.cyan(" Stigmergy Agent Observatory "));
    console.log(chalk.gray("=".repeat(50)));
    console.log("");

    console.log(chalk.blue(" Summary:"));
    console.log(`  Total agents:    ${dashboard.summary.total}`);
    console.log(`  Installed:       ${dashboard.summary.installed}`);
    console.log(`  Active:          ${dashboard.summary.active}`);
    console.log(`  Idle:            ${dashboard.summary.idle}`);
    console.log(`  Token exhausted: ${dashboard.summary.tokenExhausted}`);
    console.log(`  Error:           ${dashboard.summary.error}`);
    console.log(`  Offline:         ${dashboard.summary.offline}`);
    console.log("");

    const exhausted = dashboard.agents.filter((a) => a.tokenExhausted);
    if (exhausted.length > 0) {
      console.log(chalk.red(" Token Exhausted Agents:"));
      for (const agent of exhausted) {
        console.log(chalk.red(`  - ${agent.name}: ${agent.tokenExhaustionReason || "unknown"}`));
      }
      console.log("");
    }

    if (dashboard.takeover && dashboard.takeover.suggestions.length > 0) {
      console.log(chalk.yellow(" Takeover Suggestions:"));
      for (const s of dashboard.takeover.suggestions) {
        console.log(chalk.yellow(`  - ${s.fromAgent} -> ${s.toAgent} (${s.toName})`));
      }
      console.log("");
    }

    console.log(chalk.blue(" Agent Details:"));
    for (const agent of dashboard.agents) {
      const statusColor = agent.status === "active" ? chalk.green : agent.status === "idle" ? chalk.yellow : agent.tokenExhausted ? chalk.red : chalk.gray;
      console.log(`  ${statusColor(agent.status.padEnd(15))} ${agent.name}${agent.tokenExhausted ? chalk.red(" [TOKEN EXHAUSTED]") : ""}`);
      if (options.verbose) {
        console.log(`      Type: ${agent.type}`);
        console.log(`      Installed: ${agent.installed}`);
        console.log(`      Conversation depth: ${agent.conversationDepth}`);
        console.log(`      Sessions: ${agent.sessionCount}`);
        if (agent.lastUsed) console.log(`      Last used: ${agent.lastUsed}`);
        if (agent.lastError) console.log(`      Last error: ${agent.lastError}`);
      }
    }

    if (options.verbose && dashboard.recentTasks.length > 0) {
      console.log("");
      console.log(chalk.blue(" Recent Tasks:"));
      for (const task of dashboard.recentTasks.slice(-5)) {
        console.log(`  [${task.success ? chalk.green("OK") : chalk.red("FAIL")}] ${task.agentId}: ${task.task}`);
      }
    }

    console.log("");
    console.log(chalk.gray(`Generated at: ${dashboard.generatedAt}`));
    console.log(chalk.cyan(" Open dashboard: http://localhost:3000/dashboard.html"));
  } catch (error) {
    console.log(chalk.red(` Failed to load dashboard: ${error.message}`));
    process.exit(1);
  }
}

module.exports = { handleDashboardCommand };
