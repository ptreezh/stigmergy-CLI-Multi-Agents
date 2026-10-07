const chalk = require("chalk");
const inquirer = require("inquirer");
const { run, formatOutput } = require("../../agent-forensics");

const BANNER = `
╔══════════════════════════════════════════════════════════════════════════╗
║                    🔍 AI Agent Forensics Scanner                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Layers: shortcut / registry / process / AppData / package / home dir    ║
║  Reports: install path, version, session store, runtime state,          ║
║           recent working directories, current task                      ║
║                                                                          ║
║  ⚠️  READ-ONLY. No files are modified, nothing is sent anywhere.          ║
║  ⚖️  Only scan machines you own or are authorized to inspect.             ║
╚══════════════════════════════════════════════════════════════════════════╝
`;

async function handleAgentForensicsCommand(options = {}) {
  try {
    console.log(chalk.yellow(BANNER));

    if (!options.yes) {
      const { confirmed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmed",
          message: "Do you have permission to scan this machine?",
          default: false,
        },
      ]);
      if (!confirmed) {
        console.log(chalk.red("Scan aborted."));
        process.exit(1);
      }
    }

    const layers = options.layers
      ? options.layers.split(",").map((l) => l.trim()).filter(Boolean)
      : null;

    const report = run({
      format: options.json ? "json" : "table",
      layers,
      showUnknown: options.unknown !== false,
    });

    if (options.json) {
      console.log(formatOutput(report, "json"));
    }

    if (options.save) {
      const fs = require("fs");
      const outPath = options.save === true ? `agent-forensics-${Date.now()}.json` : options.save;
      fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
      console.log(chalk.green(`\nReport saved to: ${outPath}`));
    }

    if (report.degradedLayers.length) {
      console.log(
        chalk.yellow(
          `Degraded layers: ${report.degradedLayers.map((d) => `${d.id} (${d.error})`).join(", ")}`
        )
      );
    }

    return report;
  } catch (error) {
    console.error(chalk.red("[agent-forensics] Scan failed:"), error.message);
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

module.exports = {
  handleAgentForensicsCommand,
};