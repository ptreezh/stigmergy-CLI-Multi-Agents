#!/usr/bin/env node
/**
 * Deploy Ralph Hook to CLI
 *
 * 一键部署 universal Ralph loop 到所有已安装的 CLI
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const CLI_HOOKS = {
  claude: {
    dir: ".claude",
    hooksFile: "hooks.json",
    pattern: "slashCommand",
  },
  qwen: {
    dir: ".qwen",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  iflow: {
    dir: ".iflow",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  gemini: {
    dir: ".config/gemini",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  codex: {
    dir: ".config/codex",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  codebuddy: {
    dir: ".codebuddy",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  kilocode: {
    dir: ".kilocode",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  opencode: {
    dir: ".opencode",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  qodercli: {
    dir: ".qoder",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
  copilot: {
    dir: ".copilot",
    hooksFile: "hooks.json",
    pattern: "commands",
  },
};

const RalphCommand = {
  name: "ralph-loop",
  description: "启动 Ralph 循环 - 自主迭代直到任务完成",
  trigger: "/ralph-loop",
  prompt:
    "你正在启动一个 Ralph 循环。\n\n请：\n1. 读取当前目录的 plan.md\n2. 选择一个未完成的任务\n3. 执行任务\n4. 标记完成\n5. 重复直到全部完成\n\n提示：\n- 每次迭代运行质量检查\n- 失败时修复 prompt\n- 记录学习到 progress.txt",
};

function deployToCLI(cliName) {
  const home = os.homedir();
  const cliConfig = CLI_HOOKS[cliName];

  if (!cliConfig) {
    console.log(`  ${cliName}: 不支持的 CLI`);
    return false;
  }

  const cliDir = path.join(home, cliConfig.dir);

  // 检查 CLI 是否安装
  if (!fs.existsSync(cliDir)) {
    console.log(`  ${cliName}: 未安装 (跳过)`);
    return false;
  }

  const hooksFile = path.join(cliDir, cliConfig.hooksFile);

  try {
    let hooks = {};

    // 读取现有 hooks
    if (fs.existsSync(hooksFile)) {
      try {
        hooks = JSON.parse(fs.readFileSync(hooksFile, "utf-8"));
      } catch (e) {
        hooks = {};
      }
    }

    // 添加 ralph-loop 命令
    if (!hooks.commands) {
      hooks.commands = [];
    }

    // 检查是否已存在
    const exists = hooks.commands.some((c) => c.name === "ralph-loop");
    if (!exists) {
      hooks.commands.push(RalphCommand);
      fs.writeFileSync(hooksFile, JSON.stringify(hooks, null, 2), "utf-8");
      console.log(`  ${cliName}: ✅ 已部署`);
    } else {
      console.log(`  ${cliName}: ✅ 已存在`);
    }

    return true;
  } catch (e) {
    console.log(`  ${cliName}: ❌ 失败 - ${e.message}`);
    return false;
  }
}

function main() {
  console.log("\n🚀 部署 Universal Ralph Loop 到所有 CLI\n");

  const args = process.argv.slice(2);
  const targetCLI = args[0];

  let clis = Object.keys(CLI_HOOKS);

  // 如果指定了 CLI
  if (targetCLI) {
    if (CLI_HOOKS[targetCLI]) {
      clis = [targetCLI];
    } else {
      console.log(`错误: 不支持的 CLI: ${targetCLI}`);
      console.log(`支持的 CLI: ${Object.keys(CLI_HOOKS).join(", ")}`);
      process.exit(1);
    }
  }

  let success = 0;
  let skipped = 0;

  for (const cliName of clis) {
    const result = deployToCLI(cliName);
    if (result === true) success++;
    else if (result === false) skipped++;
  }

  console.log(`\n📊 完成: 成功 ${success}, 跳过 ${skipped}\n`);

  console.log("使用方法:");
  console.log("  在各 CLI 中输入: /ralph-loop <任务描述>");
  console.log("");
}

main();
