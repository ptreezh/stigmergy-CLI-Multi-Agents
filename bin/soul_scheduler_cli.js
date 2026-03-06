#!/usr/bin/env node

/**
 * Soul Scheduler CLI - 独立调度进化CLI
 *
 * 用法:
 *   node soul_scheduler_cli.js start     # 启动调度器
 *   node soul_scheduler_cli.js stop      # 停止调度器
 *   node soul_scheduler_cli.js status    # 查看状态
 *   node soul_scheduler_cli.js trigger <cli>  # 手动触发
 */

const SoulScheduler = require("../src/core/soul_scheduler_v2");

const args = process.argv.slice(2);
const cmd = args[0] || "status";

let scheduler = null;

// 状态文件
const STATE_FILE = require("path").join(
  process.env.HOME || process.env.USERPROFILE,
  ".stigmergy",
  "config",
  "scheduler_state.json",
);

function saveState(state) {
  const dir = require("path").dirname(STATE_FILE);
  const fs = require("fs");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadState() {
  const fs = require("fs");
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    } catch (e) {
      return { isRunning: false };
    }
  }
  return { isRunning: false };
}

async function main() {
  const state = loadState();

  if (cmd === "start") {
    console.log("\n🌀 Starting Soul Scheduler...\n");

    scheduler = new SoulScheduler({
      enabled: true,
      intervalMs: 4 * 60 * 60 * 1000, // 4小时
    });

    scheduler.start();

    // 保存状态
    saveState({ isRunning: true, pid: process.pid });

    console.log("\n✅ Scheduler started!");
    console.log("   Use 'node soul_scheduler_cli.js status' to monitor\n");
  } else if (cmd === "stop") {
    console.log("\n🛑 Stopping scheduler...\n");

    if (scheduler) {
      scheduler.stop();
    }

    saveState({ isRunning: false });
    console.log("✅ Stopped!\n");
  } else if (cmd === "status") {
    const status = state;
    console.log("\n📊 Soul Scheduler Status\n");
    console.log(`   Running: ${status.isRunning ? "✅ Yes" : "❌ No"}`);
    console.log(`   PID: ${status.pid || "N/A"}`);
    console.log("");
  } else if (cmd === "trigger") {
    const cliName = args[1] || "claude";

    scheduler = new SoulScheduler({ enabled: true });
    const result = await scheduler.triggerCLI(cliName);

    console.log("\n✅ Trigger result:");
    console.log(`   CLI: ${result.cli}`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Knowledge: +${result.knowledgeAdded}`);
    console.log("");
  } else if (cmd === "help") {
    console.log(`
🌀 Soul Scheduler CLI

用法:
  node soul_scheduler_cli.js start      # 启动独立调度器
  node soul_scheduler_cli.js stop       # 停止调度器
  node soul_scheduler_cli.js status    # 查看状态
  node soul_scheduler_cli.js trigger <cli>  # 手动触发

原理:
  - 各CLI完全独立进化 (不依赖前序)
  - 时间错开避免并发 (+0min, +3min, +6min...)
  - 夜间30分钟/白天4小时周期
  - 每小时跨CLI验证一致性

配置:
  - 自动检测已安装的CLI
  - 不同用户使用不同CLI组合
`);
  } else {
    console.log(`Unknown command: ${cmd}`);
    console.log("Use: start, stop, status, trigger, help");
  }
}

main().catch(console.error);
