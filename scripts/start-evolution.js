#!/usr/bin/env node
/**
 * Stigmergy 自主进化启动脚本
 *
 * 功能：启动长时自主进化系统
 * 特点：自动化执行、持续监控、自我增强
 */

const { SoulEngine } = require("../src/core/soul_engine/SoulEngine");
const fs = require("fs");
const path = require("path");

// 颜色输出
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(color, ...args) {
  console.log(color + args.join(" ") + colors.reset);
}

/**
 * 显示欢迎信息
 */
function showWelcome() {
  console.log("");
  log(
    colors.cyan,
    "╔════════════════════════════════════════════════════════════╗",
  );
  log(
    colors.cyan,
    "║" +
      colors.bright +
      "   Stigmergy 自主进化系统启动" +
      colors.reset +
      colors.cyan +
      "                              ║",
  );
  log(
    colors.cyan,
    "║" +
      colors.bright +
      "   Stigmergy Autonomous Evolution System" +
      colors.reset +
      colors.cyan +
      "                    ║",
  );
  log(
    colors.cyan,
    "╚════════════════════════════════════════════════════════════╝",
  );
  console.log("");
}

/**
 * 显示系统状态
 */
async function showSystemStatus() {
  log(colors.blue, "📊 系统状态检查\n");

  const soulStateDir = path.join(
    require("os").homedir(),
    ".stigmergy",
    "soul-state",
  );

  // 检查目录
  const dirs = {
    记忆目录: path.join(soulStateDir, "memory"),
    反思目录: path.join(soulStateDir, "reflections"),
    进化技能目录: path.join(soulStateDir, "evolved-skills"),
    日志目录: path.join(soulStateDir, "evolution"),
  };

  for (const [name, dirPath] of Object.entries(dirs)) {
    const exists = fs.existsSync(dirPath);
    const status = exists ? "✅" : "⏳";
    log(colors.cyan, `  ${status} ${name}: ${exists ? "已创建" : "待创建"}`);
  }

  // 统计现有数据
  const memoryFile = path.join(soulStateDir, "memory", "sessions.jsonl");
  if (fs.existsSync(memoryFile)) {
    const content = fs.readFileSync(memoryFile, "utf-8");
    const sessionCount = content
      .trim()
      .split("\n")
      .filter((l) => l).length;
    log(colors.green, `\n  💾 会话记忆: ${sessionCount} 条`);
  }

  const reflectionDir = path.join(soulStateDir, "reflections");
  if (fs.existsSync(reflectionDir)) {
    const files = fs
      .readdirSync(reflectionDir)
      .filter((f) => f.endsWith(".json"));
    log(colors.green, `  🧠 反思记录: ${files.length} 条`);
  }

  const skillsDir = path.join(soulStateDir, "evolved-skills");
  if (fs.existsSync(skillsDir)) {
    const files = fs.readdirSync(skillsDir).filter((f) => f.endsWith(".json"));
    log(colors.green, `  ⚡ 进化技能: ${files.length} 个`);
  }

  console.log("");
}

/**
 * 显示进化计划
 */
function showEvolutionPlan() {
  log(colors.blue, "📋 进化计划概览\n");

  const phases = [
    {
      stage: "阶段 1",
      name: "双 Agent Loop 基础架构",
      weeks: "2-3 周",
      priority: "🔴 高",
    },
    {
      stage: "阶段 2",
      name: "自我评估系统",
      weeks: "3-4 周",
      priority: "🔴 高",
    },
    {
      stage: "阶段 3",
      name: "闭环进化系统",
      weeks: "4-6 周",
      priority: "🔴 高",
    },
    {
      stage: "阶段 4",
      name: "自主学习系统",
      weeks: "6-8 周",
      priority: "🟡 中",
    },
    {
      stage: "阶段 5",
      name: "长时运行系统",
      weeks: "4-6 周",
      priority: "🟡 中",
    },
    { stage: "阶段 6", name: "社区集成", weeks: "6-8 周", priority: "🟢 低" },
  ];

  console.log("  阶段    名称                    预计时长    优先级");
  console.log("  ────    ────                    ──────     ──────");
  for (const phase of phases) {
    console.log(
      `  ${phase.stage.padEnd(6)} ${phase.name.padEnd(22)} ${phase.weeks.padEnd(9)} ${phase.priority}`,
    );
  }

  console.log("");
  log(colors.yellow, "  💡 提示: 详细计划请查看 docs/planning/task_plan.md\n");
}

/**
 * 显示监控仪表板
 */
function showMonitor() {
  log(colors.blue, "🔍 实时监控\n");
  log(colors.cyan, "  监控指标:");
  log(colors.cyan, "  • Agent 协作状态");
  log(colors.cyan, "  • 进化任务进度");
  log(colors.cyan, "  • 系统资源使用");
  log(colors.cyan, "  • 性能指标变化");
  console.log("");
}

/**
 * 主函数
 */
async function main() {
  showWelcome();

  // 显示系统状态
  await showSystemStatus();

  // 显示进化计划
  showEvolutionPlan();

  // 询问启动模式
  log(colors.yellow, "⚡ 启动模式:\n");
  log(colors.cyan, "  1. 交互模式 - 手动控制进化过程");
  log(colors.cyan, "  2. 自动模式 - 持续自主进化");
  log(colors.cyan, "  3. 监控模式 - 只监控不干预");
  log(colors.cyan, "  4. 规划模式 - 查看详细计划\n");

  // 默认使用自动模式
  const mode = process.env.EVOLUTION_MODE || "auto";

  log(colors.green, `\n🚀 启动模式: ${mode.toUpperCase()}`);

  // 创建引擎
  const engine = new SoulEngine({
    autoEvolve: true,
    heartbeatInterval: 60 * 60 * 1000, // 1小时
    verbose: process.env.DEBUG === "1",
  });

  try {
    // 启动引擎
    await engine.start();

    // 显示监控信息
    showMonitor();

    log(colors.green, "\n✅ 自主进化系统已启动！");
    log(colors.cyan, "\n💡 提示:");
    log(colors.cyan, "  • 系统将每分钟自动执行进化任务");
    log(colors.cyan, "  • 所有进化过程将被记录");
    log(colors.cyan, "  • 使用 Ctrl+C 停止系统");
    log(colors.cyan, "  • 查看日志: ~/.stigmergy/soul-state/\n");

    // 信号处理
    process.on("SIGINT", async () => {
      log(colors.yellow, "\n\n🛑 正在停止自主进化系统...");
      await engine.stop();
      log(colors.green, "✅ 系统已安全停止");
      log(colors.cyan, "\n📊 查看进化进度:");
      log(colors.cyan, "  node src/core/soul_engine/cli.js status\n");
      process.exit(0);
    });

    // 保持运行
    await new Promise(() => {});
  } catch (error) {
    log(colors.red, "\n❌ 启动失败:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main().catch((error) => {
    log(colors.red, "❌ 错误:", error.message);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
