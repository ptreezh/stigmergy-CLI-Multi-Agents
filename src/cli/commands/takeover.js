const chalk = require("chalk");
const { AgentCoordinator } = require("../../core/agent_coordinator");

async function handleTakeoverCommand(options = {}) {
  try {
    const coordinator = new AgentCoordinator();
    await coordinator.initialize();

    if (options.suggest) {
      const suggestions = await coordinator.suggestTakeover();
      if (suggestions.suggestions.length === 0) {
        console.log(chalk.green("No takeover suggestions — all agents are healthy."));
        return;
      }

      console.log(chalk.cyan(" Takeover Suggestions "));
      console.log(chalk.gray("=".repeat(50)));
      console.log("");
      for (const s of suggestions.suggestions) {
        console.log(chalk.red(`  ${s.fromAgent}`) + chalk.gray(" (token exhausted) ") + chalk.yellow(`→ ${s.toAgent}`) + chalk.gray(` (${s.toName})`));
      }
      console.log("");
      console.log(chalk.gray(`Exhausted: ${suggestions.exhaustedCount} | Idle available: ${suggestions.idleCount}`));
      return;
    }

    if (options.from && options.to) {
      const task = options.task || "";
      const result = await coordinator.takeOver(options.from, options.to, task);
      if (result.success) {
        console.log(chalk.green(` Takeover executed: ${result.fromAgent} → ${result.routedAgent}`));
        console.log(chalk.gray(`Reason: ${result.reason}`));
      } else {
        console.log(chalk.red(` Takeover failed: ${result.error}`));
        process.exit(1);
      }
      return;
    }

    console.log(chalk.cyan(" Agent Takeover "));
    console.log(chalk.gray("=".repeat(50)));
    console.log("");
    console.log("Usage:");
    console.log("  stigmergy takeover --suggest");
    console.log("  stigmergy takeover --from <agent> --to <agent> [--task <task>]");
    console.log("");
    console.log("Options:");
    console.log("  --suggest              Show takeover suggestions");
    console.log("  --from <agent>         Source agent (token exhausted)");
    console.log("  --to <agent>           Target agent (idle/available)");
    console.log("  --task <task>          Task to route on takeover");
    console.log("  -v, --verbose          Verbose output");
  } catch (error) {
    console.log(chalk.red(` Takeover failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = { handleTakeoverCommand };
