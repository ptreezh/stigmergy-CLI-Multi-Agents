const chalk = require("chalk");
const { AgentCoordinator } = require("../../core/agent_coordinator");

async function handleAutoCoordinatorCommand(options = {}) {
  try {
    const coordinator = new AgentCoordinator();
    await coordinator.initialize();

    const action = options.action || options._command || "status";

    if (action === "start") {
      const intervalHours = parseFloat(options.interval || options.i || 4);
      const intervalMs = intervalHours * 60 * 60 * 1000;

      const result = coordinator.startAutoCoordination({ interval: intervalMs });
      console.log(chalk.green(" Auto-coordinator started"));
      console.log(chalk.gray(`  Interval: ${intervalHours}h (${intervalMs}ms)`));
      console.log(chalk.gray(`  Next scan in: ${Math.round(intervalMs / 1000)}s`));

      if (options.daemon || options.daemonize) {
        console.log(chalk.yellow("  Running in foreground. Press Ctrl+C to stop."));
        process.on("SIGINT", () => {
          coordinator.stopAutoCoordination();
          console.log(chalk.gray("\n Auto-coordinator stopped"));
          process.exit(0);
        });

        while (coordinator.autoCoordinationEnabled) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return;
    }

    if (action === "stop") {
      const result = coordinator.stopAutoCoordination();
      console.log(chalk.green(" Auto-coordinator stopped"));
      return;
    }

    if (action === "status") {
      const status = coordinator.getAutoCoordinationStatus();
      console.log(chalk.cyan(" Auto-Coordinator Status "));
      console.log(chalk.gray("=".repeat(50)));
      console.log("");
      console.log(`  Enabled:         ${status.enabled ? chalk.green("yes") : chalk.red("no")}`);
      console.log(`  Interval:        ${status.intervalMs}ms (${(status.intervalMs / (1000 * 60 * 60)).toFixed(1)}h)`);
      console.log(`  Last run:        ${status.lastRun || "never"}`);
      console.log(`  History entries: ${status.history.length}`);

      if (status.history.length > 0) {
        console.log("");
        console.log(chalk.blue(" Recent History:"));
        for (const entry of status.history.slice(-5)) {
          const icon = entry.type === "cycle" ? "↻" : entry.type === "started" ? "▶" : "■";
          console.log(`  ${icon} ${entry.type} at ${entry.timestamp}`);
          if (entry.actions) {
            for (const action of entry.actions) {
              console.log(`      ${action.type}: ${action.success ? chalk.green("ok") : chalk.red("failed")} ${action.from || ""} ${action.to ? `→ ${action.to}` : ""}`);
            }
          }
        }
      }

      console.log("");
      return;
    }

    if (action === "run" || action === "exec" || action === "scan") {
      console.log(chalk.blue(" Running auto-coordination cycle..."));
      const result = await coordinator.autoCoordinate();
      console.log(chalk.green(` Scan complete at ${result.timestamp}`));
      console.log(`  Scanned agents: ${result.scanned}`);
      console.log(`  Actions taken:  ${result.actions.length}`);

      if (result.actions.length > 0) {
        console.log("");
        console.log(chalk.blue(" Actions:"));
        for (const action of result.actions) {
          const icon = action.success ? chalk.green("✓") : chalk.red("✗");
          console.log(`  ${icon} ${action.type}: ${action.from} ${action.to ? `→ ${action.to}` : ""} ${action.reason || ""}`);
        }
      }

      return;
    }

    if (action === "route") {
      const task = options.task || options.t || "";
      if (!task) {
        console.log(chalk.red("Please provide a task: --task <task>"));
        return;
      }

      const taskContext = options.context || options.c || null;
      const result = await coordinator.routeTaskByContext(task, { taskContext });

      console.log(chalk.cyan(" Context-Aware Routing "));
      console.log(chalk.gray("=".repeat(50)));
      console.log("");
      console.log(`  Task:      ${task}`);
      console.log(`  Context:   ${taskContext || coordinator._extractTaskContext(task)}`);
      console.log(`  Routed to: ${result.agent || "none"} ${result.reason ? `(${result.reason})` : ""}`);

      if (result.scoredCandidates && result.scoredCandidates.length > 0) {
        console.log("");
        console.log(chalk.blue(" Candidate Scores:"));
        const top = result.scoredCandidates.filter((c) => c.score > 0).slice(0, 5);
        for (const candidate of top) {
          console.log(`  ${candidate.agentId}: ${candidate.score} ${candidate.state ? `[${candidate.state.status}]` : ""}`);
        }
      }

      return;
    }

    console.log(chalk.cyan(" Auto-Coordinator "));
    console.log(chalk.gray("=".repeat(50)));
    console.log("");
    console.log("Usage:");
    console.log("  stigmergy auto-coordinator start   [--interval <hours>] [--daemon]");
    console.log("  stigmergy auto-coordinator stop");
    console.log("  stigmergy auto-coordinator status");
    console.log("  stigmergy auto-coordinator run");
    console.log("  stigmergy auto-coordinator route --task <task> [--context <ctx>]");
    console.log("");
    console.log("Options:");
    console.log("  --interval, -i <hours>   Scan interval in hours (default: 4)");
    console.log("  --daemon                 Run in foreground until Ctrl+C");
    console.log("  --task, -t <task>        Task text for context routing");
    console.log("  --context, -c <ctx>      Override task context");
    console.log("  -v, --verbose            Verbose output");
  } catch (error) {
    console.log(chalk.red(` Auto-coordinator failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = { handleAutoCoordinatorCommand };
