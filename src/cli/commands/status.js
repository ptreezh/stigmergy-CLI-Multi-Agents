const chalk = require("chalk");
const { AgentRegistry } = require("../../core/agent_registry");
const { AgentStateCollector } = require("../../core/agent_state_collector");

async function handleStatusCommand(options = {}) {
  try {
    const registry = new AgentRegistry();
    const collector = new AgentStateCollector();

    const registryData = await registry.scanAll();
    const allAgents = [...registryData.cli, ...registryData.desktop, ...registryData.evolved];

    if (options.cli) {
      const agent = allAgents.find((a) => a.id === options.cli || a.name === options.cli);
      if (!agent) {
        console.log(chalk.red(` Unknown CLI tool: ${options.cli}`));
        console.log(chalk.yellow(`Supported tools: ${allAgents.map((a) => a.id).join(", ")}`));
        process.exit(1);
      }

      const state = await collector.collect(agent);

      if (options.json) {
        console.log(JSON.stringify(state, null, 2));
      } else {
        console.log(chalk.cyan(` ${options.cli} Status:`));
        console.log(`  Installed: ${state.installed ? chalk.green("Yes") : chalk.red("No")}`);
        console.log(`  Status: ${state.status}`);
        if (state.path) console.log(`  Path: ${state.path}`);
        if (state.version) console.log(`  Version: ${state.version}`);
        if (state.lastUsed) console.log(`  Last used: ${state.lastUsed}`);
        if (state.lastHeartbeat) console.log(`  Last heartbeat: ${state.lastHeartbeat}`);
        console.log(`  Conversation depth: ${state.conversationDepth}`);
        console.log(`  Sessions: ${state.sessionCount}`);
        if (state.tokenExhausted) {
          console.log(chalk.red(`  Token exhausted: ${state.tokenExhaustionReason}`));
        }
        if (state.lastError) {
          console.log(chalk.red(`  Last error: ${state.lastError}`));
        }
        if (state.processRunning !== undefined) {
          console.log(`  Process running: ${state.processRunning ? "Yes" : "No"}`);
        }
      }
      return;
    }

    console.log(chalk.cyan(" Agent Status Overview:"));

    const states = await collector.collectAll(registryData);
    const installed = states.filter((s) => s.installed);
    const active = states.filter((s) => s.status === "active");
    const idle = states.filter((s) => s.status === "idle");
    const tokenExhausted = states.filter((s) => s.tokenExhausted);
    const error = states.filter((s) => s.status === "error");
    const offline = states.filter((s) => s.status === "offline");

    for (const state of active) {
      console.log(chalk.green(`  [ACTIVE]    ${state.name}`));
    }
    for (const state of idle) {
      console.log(chalk.yellow(`  [IDLE]      ${state.name}`));
    }
    for (const state of tokenExhausted) {
      console.log(chalk.red(`  [TOKEN]     ${state.name} - ${state.tokenExhaustionReason || "exhausted"}`));
    }
    for (const state of error) {
      console.log(chalk.red(`  [ERROR]     ${state.name}`));
    }
    for (const state of offline) {
      console.log(chalk.gray(`  [OFFLINE]   ${state.name}`));
    }

    console.log("");
    console.log(chalk.blue(" Summary:"));
    console.log(`  Total:    ${states.length}`);
    console.log(`  Installed: ${installed.length}`);
    console.log(`  Active:   ${active.length}`);
    console.log(`  Idle:     ${idle.length}`);
    console.log(`  Token exhausted: ${tokenExhausted.length}`);
    console.log(`  Error:    ${error.length}`);
    console.log(`  Offline:  ${offline.length}`);

    if (tokenExhausted.length > 0) {
      console.log(chalk.red("\n Takeover available:"));
      for (const state of tokenExhausted) {
        console.log(chalk.red(`   ${state.name} -> check idle agents with: stigmergy dashboard`));
      }
    }

    if (options.json) {
      console.log("");
      console.log(chalk.blue(" Detailed JSON:"));
      console.log(JSON.stringify(states, null, 2));
    }
  } catch (error) {
    console.log(chalk.red(` Status check failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  handleStatusCommand,
};
