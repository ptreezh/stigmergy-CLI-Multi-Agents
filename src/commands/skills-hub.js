#!/usr/bin/env node

/**
 * Stigmergy Skills Hub CLI Commands
 * Centralized meta-skill management
 */

const StigmergySkillsHub = require("../core/skills/StigmergySkillsHub");

/**
 * Initialize Skills Hub
 */
async function init(options = {}) {
  const hub = new StigmergySkillsHub(options);
  await hub.init();
  console.log("\n✅ Skills Hub initialized successfully!");
  console.log(`   Central Repo: ${hub.centralRepo}`);
  console.log(`   Adapters: ${hub.adapters.length} tools configured`);
}

/**
 * Sync meta-skills to tools
 */
async function sync(options = {}) {
  const hub = new StigmergySkillsHub(options);
  await hub.init();

  if (options.tool) {
    // Sync to specific tool
    const adapter = hub.adapters.find((a) => a.id === options.tool);
    if (!adapter) {
      console.error(`❌ Tool not found: ${options.tool}`);
      console.log(
        `   Available tools: ${hub.adapters.map((a) => a.id).join(", ")}`,
      );
      process.exit(1);
    }

    console.log(`\n🔄 Syncing to ${adapter.displayName}...`);
    const result = await hub.syncToTool(adapter, options);

    if (result.success) {
      console.log(`✅ Synced to ${adapter.displayName}`);
      console.log(`   Target: ${result.targetPath}`);
      console.log(`   Size: ${result.bytesWritten} bytes`);
    } else {
      console.error(`❌ Failed to sync: ${result.error}`);
      process.exit(1);
    }
  } else {
    // Sync to all tools
    console.log("\n🔄 Syncing meta-skills to all tools...\n");
    const result = await hub.syncAll(options);

    console.log("\n📊 Sync Summary:");
    console.log(`   Total: ${result.total}`);
    console.log(`   ✅ Success: ${result.success}`);
    console.log(`   ⏭️  Skipped: ${result.skipped}`);
    console.log(`   ❌ Errors: ${result.errors}`);

    if (result.errors > 0) {
      console.log("\n❌ Some tools failed to sync:");
      result.results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.tool}: ${r.error}`);
        });
      process.exit(1);
    } else {
      console.log("\n✅ All tools synced successfully!");
    }
  }
}

/**
 * Get status of all tools
 */
async function status(options = {}) {
  const hub = new StigmergySkillsHub(options);
  await hub.init();

  console.log("\n📊 Skills Hub Status\n");
  console.log(`Central Repo: ${hub.centralRepo}`);
  console.log(`Last Sync: ${hub.registry.lastSync || "Never"}\n`);

  const toolStatus = await hub.getStatus();

  console.log("Tools:");
  toolStatus.forEach((tool) => {
    const statusIcon = tool.installed ? "✅" : "❌";
    const syncIcon = tool.synced ? "✅" : "⏭️ ";
    const enabledIcon = tool.enabled ? "🟢" : "🔴";

    console.log(`  ${statusIcon} ${tool.displayName}`);
    console.log(`     ${enabledIcon} Enabled: ${tool.enabled}`);
    console.log(
      `     ${syncIcon} Synced: ${tool.synced ? tool.lastSync : "Never"}`,
    );
    console.log(`     Meta-skill: ${tool.metaSkill}`);
    console.log("");
  });
}

/**
 * Update central repo with latest templates
 */
async function update(options = {}) {
  const hub = new StigmergySkillsHub(options);
  await hub.init();

  console.log("\n🔄 Updating central repo with latest templates...\n");

  // Re-verify meta-skills (will copy if newer)
  await hub.verifyMetaSkills();

  console.log("\n✅ Central repo updated!");
  console.log(`   Location: ${hub.metaSkillsDir}`);

  if (options.autoSync) {
    console.log("\n🔄 Auto-syncing to all tools...");
    await sync(options);
  }
}

/**
 * Show help
 */
function help() {
  console.log(`
Stigmergy Skills Hub - Centralized Meta-Skill Management

USAGE:
  stigmergy skills-hub <command> [options]

COMMANDS:
  init                     Initialize Skills Hub
  sync [options]           Sync meta-skills to tools
  status                   Show status of all tools
  update [options]         Update central repo
  help                     Show this help message

OPTIONS:
  --tool <id>              Sync to specific tool (for 'sync' command)
  --force                  Sync even if tool not detected
  --dry-run                Show what would be done without doing it
  --auto-sync              Auto-sync after update (for 'update' command)
  --verbose                Show detailed output
  --quiet                  Suppress output

EXAMPLES:
  # Initialize Skills Hub
  stigmergy skills-hub init

  # Sync to all installed tools
  stigmergy skills-hub sync

  # Sync to specific tool
  stigmergy skills-hub sync --tool iflow

  # Show status
  stigmergy skills-hub status

  # Update central repo and auto-sync
  stigmergy skills-hub update --auto-sync

  # Dry-run sync
  stigmergy skills-hub sync --dry-run

FOR MORE INFORMATION:
  https://github.com/your-repo/stigmergy
`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const options = {
    verbose: !args.includes("--quiet"),
    dryRun: args.includes("--dry-run"),
    force: args.includes("--force"),
    autoSync: args.includes("--auto-sync"),
    tool: args.includes("--tool") ? args[args.indexOf("--tool") + 1] : null,
  };

  try {
    switch (command) {
      case "init":
        await init(options);
        break;
      case "sync":
        await sync(options);
        break;
      case "status":
        await status(options);
        break;
      case "update":
        await update(options);
        break;
      case "help":
      case "--help":
      case "-h":
        help();
        break;
      default:
        if (!command) {
          console.error("❌ Error: No command specified\n");
        } else {
          console.error(`❌ Error: Unknown command "${command}"\n`);
        }
        help();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * CLI handler for router integration
 */
async function handleSkillsHubCommand(action, options = {}) {
  if (!action) {
    console.error("❌ Error: No action specified\n");
    help();
    process.exit(1);
  }

  try {
    switch (action) {
      case "init":
        await init(options);
        break;
      case "sync":
        await sync(options);
        break;
      case "status":
        await status(options);
        break;
      case "update":
        await update(options);
        break;
      default:
        console.error(`❌ Error: Unknown action "${action}"\n`);
        help();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    throw error;
  }
}

if (require.main === module) {
  main();
}

module.exports = { init, sync, status, update, help, handleSkillsHubCommand };
