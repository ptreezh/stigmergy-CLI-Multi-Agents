/**
 * Universal Ralph Hook
 *
 * 部署到各 CLI 后，可以通过 /ralph-loop 命令启动 Ralph 循环
 *
 * 使用方式：
 * /ralph-loop <任务描述>
 * /ralph-loop <任务描述> --max-iterations 10
 * /ralph-loop <任务描述> --completion-promise "COMPLETE"
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

class RalphHook {
  constructor() {
    this.cliName = process.env.STG_CLI_NAME || "unknown";
    this.stigmergyRoot = path.join(os.homedir(), ".stigmergy");
    this.ralphRoot = path.join(this.stigmergyRoot, "ralph", this.cliName);
  }

  /**
   * 执行 ralph-loop 命令
   */
  async execute(args) {
    const prompt = args[0];
    const options = this.parseOptions(args.slice(1));

    if (!prompt) {
      return this.showHelp();
    }

    console.log(`[Ralph Hook] Starting Ralph loop for ${this.cliName}`);
    console.log(`[Ralph Hook] Task: ${prompt}`);

    const maxIterations = options.maxIterations || options.m || 10;
    const completionPromise =
      options.completionPromise || options.complete || null;

    // 创建 plan.md
    this.ensureRalphDir();
    const planFile = path.join(this.ralphRoot, "plan.md");
    const planContent = `# Ralph Plan for ${this.cliName}

## 任务

- [ ] ${prompt}

## 元数据
- maxIterations: ${maxIterations}
- completionPromise: ${completionPromise || "none"}
- startedAt: ${new Date().toISOString()}
`;
    fs.writeFileSync(planFile, planContent, "utf-8");

    // 尝试调用 stigmergy ralph
    try {
      const stigmergyPath = this.findStigmergy();
      if (stigmergyPath) {
        return new Promise((resolve) => {
          const proc = spawn(
            stigmergyPath,
            ["ralph", this.cliName, "start", "--plan", planFile],
            {
              shell: true,
              stdio: "inherit",
            },
          );
          proc.on("close", (code) => resolve(code));
        });
      }
    } catch (e) {
      console.error(`[Ralph Hook] Error: ${e.message}`);
    }

    // 如果没有 stigmergy，直接在当前 CLI 执行循环
    return this.runLocalLoop(prompt, options);
  }

  /**
   * 本地执行循环（当没有 stigmergy 时）
   */
  async runLocalLoop(prompt, options) {
    console.log(`[Ralph Hook] Running local loop for: ${prompt}`);
    console.log(`[Ralph Hook] Max iterations: ${options.maxIterations || 10}`);

    // 这里可以实现简化版的循环
    // 对于不同 CLI，使用其内置的循环机制

    return 0;
  }

  /**
   * 解析选项
   */
  parseOptions(args) {
    const options = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith("--")) {
        const key = arg.slice(2);
        const next = args[i + 1];
        if (next && !next.startsWith("-")) {
          options[key] = next;
          i++;
        } else {
          options[key] = true;
        }
      } else if (arg.startsWith("-") && arg.length > 1) {
        const key = arg.slice(1);
        const next = args[i + 1];
        if (next && !next.startsWith("-")) {
          options[key] = next;
          i++;
        } else {
          options[key] = true;
        }
      }
    }
    return options;
  }

  /**
   * 确保目录存在
   */
  ensureRalphDir() {
    if (!fs.existsSync(this.ralphRoot)) {
      fs.mkdirSync(this.ralphRoot, { recursive: true });
    }
  }

  /**
   * 查找 stigmergy 路径
   */
  findStigmergy() {
    const { execSync } = require("child_process");
    try {
      const result = execSync(
        process.platform === "win32" ? "where stigmergy" : "which stigmergy",
        { encoding: "utf-8", timeout: 5000 },
      );
      return result.trim().split("\n")[0];
    } catch {
      return null;
    }
  }

  /**
   * 显示帮助
   */
  showHelp() {
    console.log(`
Universal Ralph Hook
===================

Usage:
  /ralph-loop <task> [--max-iterations N] [--completion-promise TEXT]

Examples:
  /ralph-loop "修复所有测试"
  /ralph-loop "重构代码" --max-iterations 20
  /ralph-loop "完成功能" --completion-promise "DONE"

Options:
  --max-iterations, -m    最大迭代次数 (默认: 10)
  --completion-promise     完成承诺文本
`);
  }
}

// 主入口
if (require.main === module) {
  const hook = new RalphHook();
  const args = process.argv.slice(2);
  hook.execute(args).then((code) => process.exit(code || 0));
}

module.exports = RalphHook;
