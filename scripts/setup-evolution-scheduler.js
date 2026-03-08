/**
 * Evolution Scheduler Tasks
 *
 * Sets up scheduled evolution tasks for autonomous learning
 * Run: node scripts/setup-evolution-scheduler.js
 */

const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.join(__dirname, "..");
const STIGMERGY_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".stigmergy",
);
const SCHEDULER_DIR = path.join(STIGMERGY_DIR, "scheduler");

const EVOLUTION_TASKS = [
  {
    id: "soul-quick-reflection",
    name: "Quick Daily Reflection",
    description: "Quick self-reflection on daily tasks",
    cron: "0 * * * *", // Every hour
    type: "cli",
    cli: "claude",
    command: "使用 skill: soul-reflection 进行快速反思",
    enabled: true,
  },
  {
    id: "soul-deep-reflection",
    name: "Deep Weekly Reflection",
    description: "Deep self-reflection every Sunday",
    cron: "0 20 * * 0", // Every Sunday 8pm
    type: "cli",
    cli: "claude",
    command: "使用 skill: soul-reflection 进行深度反思，分析一周的工作",
    enabled: true,
  },
  {
    id: "soul-co-evolve",
    name: "Daily Co-Evolution",
    description: "Collaborative learning with other CLIs",
    cron: "0 22 * * *", // Every day at 10pm
    type: "cli",
    cli: "claude",
    command: "使用 skill: soul-co-evolve 进行协同进化，分享和学习",
    enabled: true,
  },
  {
    id: "soul-compete",
    name: "Weekly Competition",
    description: "Compare approaches and optimize",
    cron: "0 21 * * 6", // Every Saturday 9pm
    type: "cli",
    cli: "claude",
    command: "使用 skill: soul-compete 进行竞争进化，对比优化",
    enabled: true,
  },
  {
    id: "soul-auto-evolve",
    name: "Weekly Auto-Evolution",
    description: "Full evolution cycle every week",
    cron: "0 23 * * 0", // Every Sunday 11pm
    type: "cli",
    cli: "claude",
    command: "使用 skill: soul-evolve 进行自主进化，创建新技能",
    enabled: true,
  },
];

async function setupEvolutionTasks() {
  console.log("🧬 Setting up Evolution Scheduler Tasks...\n");

  // Ensure scheduler directory exists
  if (!fs.existsSync(SCHEDULER_DIR)) {
    fs.mkdirSync(SCHEDULER_DIR, { recursive: true });
  }

  const tasksFile = path.join(SCHEDULER_DIR, "evolution-tasks.json");
  let existingTasks = [];

  if (fs.existsSync(tasksFile)) {
    try {
      existingTasks = JSON.parse(fs.readFileSync(tasksFile, "utf8"));
    } catch (e) {
      existingTasks = [];
    }
  }

  // Merge tasks
  const taskIds = new Set(existingTasks.map((t) => t.id));

  for (const task of EVOLUTION_TASKS) {
    if (!taskIds.has(task.id)) {
      existingTasks.push(task);
      console.log(`  ✅ Added: ${task.name}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${task.name}`);
    }
  }

  // Save
  fs.writeFileSync(tasksFile, JSON.stringify(existingTasks, null, 2));

  console.log(`\n📋 Total evolution tasks: ${existingTasks.length}`);
  console.log("\nTo activate tasks, run:");
  console.log("  stigmergy scheduler add --file <tasks-file>");
  console.log("\nOr manually add each task with:");
  console.log(
    '  stigmergy scheduler add --name "<name>" --cron "<cron>" --cli claude --command "<command>"',
  );
}

if (require.main === module) {
  setupEvolutionTasks().catch(console.error);
}

module.exports = { setupEvolutionTasks, EVOLUTION_TASKS };
