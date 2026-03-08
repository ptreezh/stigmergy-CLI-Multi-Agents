/**
 * Interactive Mode Controller
 * Controls the interactive dialogue mode for Stigmergy CLI
 */

const readline = require("readline");
const path = require("path");
const { EventEmitter } = require("events");
// 🔒 使用带文件锁保护的编排器
const {
  CentralOrchestrator,
} = require("../../dist/orchestration/core/CentralOrchestrator");
const CLIPathDetector = require("../core/cli_path_detector");
const { CLI_ADAPTERS } = require("../core/cli_adapters");
// 🔥 新增：持久进程池
const { PersistentCLIPool } = require("./PersistentCLIPool");
// 🔥 新增：项目全局状态看板
const { ProjectStatusBoard } = require("../core/ProjectStatusBoard");

function getCLIAdapter(cliName) {
  return CLI_ADAPTERS[cliName];
}

class InteractiveModeController extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      maxHistory: options.maxHistory || 100,
      autoSave: options.autoSave !== false,
      saveInterval: options.saveInterval || 60000,
      autoEnterLoop: options.autoEnterLoop !== false, // 默认自动进入命令循环
      cliTimeout: options.cliTimeout || 0, // CLI执行超时时间，默认0（无超时限制）
      concurrency: options.concurrency || 3, // 并发CLI数量
      ...options,
    };

    // Initialize orchestration system components
    this.orchestrator = new CentralOrchestrator({
      concurrency: options.concurrency || 3,
      workDir: process.cwd(),
    });

    // Controller state
    this.isActive = false;
    this.readlineInterface = null;
    this.saveIntervalId = null;
    this.currentCLI = options.defaultCLI || "qwen"; // 默认使用 qwen

    // Initialize CLI path detector
    this.cliPathDetector = new CLIPathDetector();

    // CLI registry for concurrent execution (will be updated by scanning)
    this.cliRegistry = {};

    // 🔥 新增：跨 CLI 上下文管理
    this.cliContexts = {}; // { qwen: [{role, content, timestamp}], iflow: [...], ... }
    this.sharedContext = {
      sessionId: this._generateSessionId(),
      startTime: Date.now(),
      projectContext: {},
      taskHistory: [],
      crossCLIRefs: [],
    };

    // 🔥 新增：持久进程池（实现真正的持续交互）
    this.cliPool = new PersistentCLIPool({
      autoRestart: true,
      healthCheckInterval: 30000,
      maxIdleTime: 300000, // 5 分钟无活动后关闭
    });

    // 🔥 新增：项目全局状态看板（实现跨会话间接协同）
    this.statusBoard = new ProjectStatusBoard();

    // Initialize components
    this.commandParser = new CommandParser();
    this.sessionManager = new SessionManager(this.options);
    this.contextManager = new ContextManager();
    this.taskOrchestrator = null; // Will be initialized later
  }

  /**
   * Get running state
   */
  get isRunning() {
    return this.isActive;
  }

  /**
   * Start interactive mode
   */
  async start() {
    if (this.isActive) {
      console.warn("Interactive mode is already active");
      return;
    }

    this.isActive = true;

    // 🔥 初始化项目状态看板
    await this.statusBoard.initialize({
      name: path.basename(process.cwd()),
      sessionId: this.sharedContext.sessionId,
      phase: "active",
    });

    // Scan for installed CLI tools
    await this._scanInstalledCLITools();

    // Create session
    this.sessionManager.createSession();

    // Display welcome message
    this._displayWelcome();

    // Start auto-save if enabled
    if (this.options.autoSave) {
      this._startAutoSave();
    }

    // Enter command loop only if autoEnterLoop is enabled
    if (this.options.autoEnterLoop) {
      await this._enterCommandLoop();
    }
  }

  /**
   * Stop interactive mode
   */
  async stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    // Close readline interface
    if (this.readlineInterface) {
      this.readlineInterface.close();
      this.readlineInterface = null;
    }

    // Stop auto-save
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
      this.saveIntervalId = null;
    }

    // 🔥 新增：关闭所有持久 CLI 进程
    console.log("\n[POOL] Shutting down persistent CLI processes...");
    await this.cliPool.shutdownAll();

    // Save session
    if (this.options.autoSave) {
      await this.sessionManager.saveSession();
    }

    // Display goodbye message
    this._displayGoodbye();

    this.emit("stopped");
  }

  /**
   * Execute a command
   */
  async executeCommand(command) {
    try {
      // Update context
      this.contextManager.updateContext({
        lastCommand: command,
        lastCommandTime: Date.now(),
      });

      // Execute based on command type
      let result;
      switch (command.type) {
      case "task":
        result = await this._executeTask(command);
        break;
      case "exit":
        result = await this._executeExit();
        break;
      case "help":
        result = await this._executeHelp();
        break;
      case "terminal":
        result = await this._executeTerminalCommand(command);
        break;
      case "status":
        result = await this._executeStatus();
        break;
      case "context": // 🔥 新增：查看上下文状态
        result = await this._executeContextStatus();
        break;
      case "clear": // 🔥 新增：清除上下文
        result = await this._executeClearContext(command);
        break;
      case "delegate":
        result = await this._executeDelegate(command);
        break;
      case "use":
        result = await this._executeUse(command);
        break;
      case "ask":
        result = await this._executeAsk(command);
        break;
      case "route":
        result = await this._executeRoute(command);
        break;
      case "parallel":
      case "concurrent":
        result = await this._executeConcurrent(command);
        break;
      case "empty":
        result = { success: true, message: "No command" };
        break;
      case "error":
        result = { success: false, error: command.error };
        break;
      default:
        result = {
          success: false,
          error: `Unknown command type: ${command.type}`,
        };
      }

      // Add to session history
      this.sessionManager.addToHistory({
        command,
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      this.emit("error", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    return this.sessionManager.getCurrentSession();
  }

  /**
   * Get context
   */
  getContext() {
    return this.contextManager.getContext();
  }

  /**
   * Display welcome message
   */
  _displayWelcome() {
    const availableCLIs = Object.keys(this.cliRegistry)
      .filter((cli) => this.cliRegistry[cli].available)
      .join(", ");

    console.log("========================================");
    console.log("  Stigmergy Interactive Mode");
    console.log("========================================");
    console.log("");
    console.log("Welcome to Stigmergy Interactive Mode!");
    console.log("");
    console.log(`Current CLI: ${this.currentCLI}`);
    console.log(`Session ID: ${this.sharedContext.sessionId}`);
    console.log("");
    console.log("Available CLI Tools:");
    console.log(`  ${availableCLIs || "No CLI tools detected"}`);
    console.log("");
    console.log("Available commands:");
    console.log(
      "  <your message>       - Send message to current CLI (with context)",
    );
    console.log(
      "  use <cli>            - Switch to specific CLI (e.g., use iflow, use buddy, use qoder)",
    );
    console.log(
      "  ask <cli> <message>  - Ask specific CLI (e.g., ask qwen hello)",
    );
    console.log(
      "  route <message>      - Smart routing to best CLI (e.g., route analyze this code)",
    );
    console.log(
      "  r <message>          - Shortcut for route (e.g., r analyze this code)",
    );
    console.log(
      "  parallel <message>   - Execute with multiple CLIs concurrently",
    );
    console.log("  concurrent <message> - Same as parallel");
    console.log(
      "  status              - Show project status board (tasks, findings, decisions)",
    );
    console.log("  context / ctx        - Show cross-CLI context status");
    console.log("  clear [cli]          - Clear context (specific CLI or all)");
    console.log("  resume [cli] [limit] - Resume session from CLI history");
    console.log(
      "  skill <cmd> [args]   - Skills management (install/list/read/validate/remove)",
    );
    console.log("  skill-i <source>     - Install a skill");
    console.log("  skill-l              - List installed skills");
    console.log("  skill-r <name>       - Read a skill");
    console.log("  skill-v <path/name>  - Validate/read a skill");
    console.log("  skill-d <name>       - Remove a skill");
    console.log("  help                - Show this help");
    console.log("  exit                - Exit interactive mode");
    console.log("");
    console.log("📊 Status Board Features:");
    console.log(
      "  - Project status board: .stigmergy/status/PROJECT_STATUS.md",
    );
    console.log("  - Cross-session collaboration through shared state");
    console.log("  - Automatic context injection into each task");
    console.log("  - Each project directory has independent status board");
    console.log("");
    console.log("🔥 Context Features:");
    console.log("  - Conversation history is maintained per CLI");
    console.log("  - Context is automatically injected into each task");
    console.log("  - Switch CLIs seamlessly without losing context");
    console.log("");
    console.log('Type your message or "exit" to quit.');
    console.log("========================================");
    console.log("");
  }

  /**
   * Scan for installed CLI tools and update registry
   */
  async _scanInstalledCLITools() {
    try {
      console.log("[SCANNING] Detecting installed CLI tools...");
      const detectedPaths = await this.cliPathDetector.detectAllCLIPaths();

      // Update CLI registry based on detection results
      this.cliRegistry = {};
      const availableTools = [];

      for (const [toolName, pathInfo] of Object.entries(detectedPaths)) {
        const isAvailable = pathInfo !== null && pathInfo !== undefined;
        this.cliRegistry[toolName] = {
          name: toolName,
          available: isAvailable,
          path: pathInfo,
        };
        if (isAvailable) {
          availableTools.push(toolName);
        }
      }

      // If no tools detected, show warning
      if (availableTools.length === 0) {
        console.log(
          '[WARNING] No CLI tools detected. Run "stigmergy install" to install CLI tools.',
        );
      } else {
        console.log(
          `[SCANNING] Found ${availableTools.length} CLI tool(s): ${availableTools.join(", ")}`,
        );
      }

      // Set default CLI to first available tool if current CLI is not available
      if (
        !this.cliRegistry[this.currentCLI]?.available &&
        availableTools.length > 0
      ) {
        this.currentCLI = availableTools[0];
        console.log(`[INFO] Default CLI set to: ${this.currentCLI}`);
      }
    } catch (error) {
      console.error("[ERROR] Failed to scan CLI tools:", error.message);
      // Fallback to default registry
      this.cliRegistry = {
        qwen: { name: "qwen", available: false },
        iflow: { name: "iflow", available: false },
        claude: { name: "claude", available: false },
        gemini: { name: "gemini", available: false },
        codebuddy: { name: "codebuddy", available: false },
        codex: { name: "codex", available: false },
        qodercli: { name: "qodercli", available: false },
        copilot: { name: "copilot", available: false },
        opencode: { name: "opencode", available: false },
        kode: { name: "kode", available: false },
        kilocode: { name: "kilocode", available: false },
      };
    }
  }

  /**
   * Display goodbye message
   */
  _displayGoodbye() {
    console.log("");
    console.log("========================================");
    console.log("  Goodbye!");
    console.log("========================================");
  }

  /**
   * Create readline interface
   */
  _createReadlineInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Enter command loop
   */
  async _enterCommandLoop() {
    // Create readline interface
    this.readlineInterface = this._createReadlineInterface();

    // Question loop
    while (this.isActive) {
      try {
        const input = await this._readInput();

        if (!input || input.trim() === "") {
          continue;
        }

        const command = this.commandParser.parse(input);
        const result = await this.executeCommand(command);

        this._displayResult(result);

        // Check if should exit
        if (command.type === "exit") {
          break;
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  }
  /**
   * Read input from user
   */
  _readInput() {
    return new Promise((resolve, reject) => {
      this.readlineInterface.question(`${this.currentCLI}> `, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Execute task command
   */
  async _executeTask(command) {
    const task = command.task || "";

    // 使用当前选择的 CLI
    return await this._executeWithCLI(this.currentCLI, task);
  }

  /**
   * Normalize CLI alias to official name
   */
  _normalizeCLI(alias) {
    const aliases = {
      buddy: "codebuddy",
      qoder: "qodercli",
      kilo: "kilocode",
    };
    return aliases[alias] || alias;
  }

  /**
   * Execute use command - switch to specific CLI
   */
  async _executeUse(command) {
    const cli = command.cli;
    this.currentCLI = cli;

    return {
      success: true,
      message: `Switched to ${cli} CLI`,
    };
  }

  /**
   * Public: Execute route command - smart routing to best CLI
   */
  async executeRoute(task) {
    return await this._executeRoute({ task });
  }

  /**
   * Public: Execute ask command - ask specific CLI
   */
  async executeAsk(cli, task) {
    return await this._executeAsk({ cli, task });
  }

  /**
   * Public: Execute concurrent command - multiple CLIs in parallel
   */
  async executeConcurrent(task) {
    return await this._executeConcurrent({ task });
  }

  /**
   * Public: Get current status
   */
  async getStatus() {
    const info = await this.getSessionInfo();
    return {
      running: this.isRunning,
      cli: this.currentCLI,
      sessionId: this.sessionId,
      contextCount: info?.contextCount || 0,
    };
  }

  /**
   * Public: Stop current execution
   */
  async stopExecution() {
    await this._stop();
    return { success: true, message: "Execution stopped" };
  }

  /**
   * Execute ask command - ask specific CLI
   */
  async _executeAsk(command) {
    const cli = command.cli;
    const task = command.task;

    return await this._executeWithCLI(cli, task);
  }

  /**
   * Execute route command - smart routing to best CLI
   */
  async _executeRoute(command) {
    const task = command.task;

    // 智能选择最合适的 CLI
    const bestCLI = this._selectBestCLI(task);

    console.log(`\n🎯 Smart routing: Selected "${bestCLI}" for this task`);

    // 切换到选中的 CLI
    const previousCLI = this.currentCLI;
    this.currentCLI = bestCLI;

    console.log(`🔄 Switched from "${previousCLI}" to "${bestCLI}" CLI`);

    // 恢复跨CLI的上下文
    await this._restoreCrossCLIContext(bestCLI);

    // 执行任务
    const result = await this._executeWithCLI(bestCLI, task);

    // 保存当前CLI的上下文
    await this._saveCurrentCLIContext();

    return result;
  }

  /**
   * 恢复跨CLI的上下文
   */
  async _restoreCrossCLIContext(cliName) {
    try {
      // 调用resumesession技能来恢复上下文
      const { spawn } = require("child_process");

      console.log(`📋 Restoring cross-CLI context for ${cliName}...`);

      return new Promise((resolve) => {
        const process = spawn("stigmergy", ["resume", cliName, "10"], {
          stdio: ["ignore", "pipe", "pipe"],
          shell: true,
        });

        let output = "";

        process.stdout.on("data", (data) => {
          output += data.toString();
        });

        process.on("close", (code) => {
          if (code === 0 && output.trim()) {
            console.log(`✅ Context restored for ${cliName}`);
          }
          resolve();
        });

        // 10秒超时
        setTimeout(() => {
          resolve();
        }, 10000);
      });
    } catch (error) {
      // 如果恢复失败，继续执行
      console.log(
        `⚠️  Context restore failed for ${cliName}: ${error.message}`,
      );
    }
  }

  /**
   * 保存当前CLI的上下文
   */
  async _saveCurrentCLIContext() {
    try {
      // 保存当前CLI的会话历史
      const sessionData = {
        cli: this.currentCLI,
        timestamp: Date.now(),
        history: this.sessionManager.getHistory().slice(-5), // 保存最近5条记录
      };

      // 这里可以保存到文件或内存中
      this.contextManager.updateContext({
        currentCLI: this.currentCLI,
        lastContextSave: Date.now(),
      });
    } catch (error) {
      console.log(`⚠️  Failed to save context: ${error.message}`);
    }
  }

  /**
   * 🔥 新增：管理 CLI 上下文 - 添加消息
   */
  _addToCLIContext(cliName, role, content) {
    if (!this.cliContexts[cliName]) {
      this.cliContexts[cliName] = [];
    }

    this.cliContexts[cliName].push({
      role,
      content,
      timestamp: Date.now(),
    });

    // 限制历史记录数量（最多保留 20 条）
    if (this.cliContexts[cliName].length > 20) {
      this.cliContexts[cliName] = this.cliContexts[cliName].slice(-20);
    }

    // 添加到共享上下文
    this.sharedContext.taskHistory.push({
      cli: cliName,
      role,
      content: content.substring(0, 200), // 摘要
      timestamp: Date.now(),
    });
  }

  /**
   * 🔥 新增：获取 CLI 的上下文历史
   */
  _getCLIContext(cliName, maxItems = 5) {
    const context = this.cliContexts[cliName] || [];
    return context.slice(-maxItems);
  }

  /**
   * 🔥 新增：构建包含上下文的增强任务（优先使用状态看板）
   */
  async _buildContextualTask(cliName, task) {
    // 🔥 优先使用项目状态看板的上下文（跨会话持久化）
    const statusContext = await this.statusBoard.getContextSummary({
      maxHistory: 10,
      includeFindings: true,
      includeDecisions: true,
    });

    // 获取本地 CLI 上下文（最近 3 条对话）
    const localContext = this._getCLIContext(cliName, 3);

    // 构建完整的上下文
    let fullContext = "";

    // 1. 项目全局上下文（来自状态看板）
    if (statusContext && statusContext.trim().length > 0) {
      fullContext += `# Project Status Board (Cross-Session Context):\n${statusContext}\n\n`;
    }

    // 2. 本地 CLI 上下文（最近对话）
    if (localContext.length > 0) {
      const localContextStr = localContext
        .map((msg) => `[${msg.role}]: ${msg.content}`)
        .join("\n");

      fullContext += `# Recent Conversation (${cliName}):\n${localContextStr}\n\n`;
    }

    // 如果没有上下文，直接返回原任务
    if (!fullContext.trim()) {
      return task;
    }

    // 返回增强的任务
    return `
${fullContext}
# Current Task (${cliName}):
${task}
    `.trim();
  }

  /**
   * Select the best CLI for a given task
   */
  _selectBestCLI(task) {
    const taskLower = task.toLowerCase();

    // CLI 特长规则（按优先级排序）
    const cliRules = [
      {
        cli: "claude",
        keywords: [
          "分析",
          "审查",
          "文档",
          "推理",
          "解释",
          "复杂",
          "理解",
          "总结",
          "review",
          "analyze",
          "document",
          "reasoning",
        ],
        priority: 10,
      },
      {
        cli: "qwen",
        keywords: [
          "中文",
          "对话",
          "生成",
          "代码",
          "函数",
          "python",
          "javascript",
          "react",
          "node",
          "chinese",
          "code",
          "function",
        ],
        priority: 8,
      },
      {
        cli: "gemini",
        keywords: [
          "多语言",
          "翻译",
          "创意",
          "写作",
          "设计",
          "翻译",
          "translate",
          "creative",
          "writing",
          "design",
          "multilingual",
        ],
        priority: 7,
      },
      {
        cli: "codebuddy",
        keywords: [
          "补全",
          "重构",
          "优化",
          "代码质量",
          "补全",
          "complete",
          "refactor",
          "optimize",
          "quality",
        ],
        priority: 6,
      },
      {
        cli: "codex",
        keywords: [
          "调试",
          "bug",
          "错误",
          "修复",
          "debug",
          "fix",
          "error",
          "bug",
        ],
        priority: 5,
      },
      {
        cli: "copilot",
        keywords: [
          "最佳实践",
          "建议",
          "模式",
          "架构",
          "best practice",
          "suggestion",
          "pattern",
          "architecture",
        ],
        priority: 4,
      },
      {
        cli: "iflow",
        keywords: ["交互", "iflow", "interactive"],
        priority: 3,
      },
      {
        cli: "qodercli",
        keywords: ["qodercli"],
        priority: 2,
      },
    ];

    // 计算每个 CLI 的得分
    const scores = cliRules.map((rule) => {
      let score = 0;
      let matchedKeywords = [];

      rule.keywords.forEach((keyword) => {
        if (taskLower.includes(keyword.toLowerCase())) {
          score += rule.priority;
          matchedKeywords.push(keyword);
        }
      });

      return {
        cli: rule.cli,
        score: score,
        matchedKeywords: matchedKeywords,
      };
    });

    // 按得分排序
    scores.sort((a, b) => b.score - a.score);

    // 返回得分最高的 CLI
    const bestCLI = scores[0];

    if (bestCLI.score > 0) {
      console.log(`   Matched keywords: ${bestCLI.matchedKeywords.join(", ")}`);
      return bestCLI.cli;
    }

    // 如果没有匹配，返回默认 CLI
    return "qwen";
  }

  /**
   * Execute task using one-shot mode (spawn new process)
   * 🔥 用于 qwen 等不支持持久 stdin 的 CLI
   * @private
   */
  async _executeOneShot(cliName, task) {
    const { spawn } = require("child_process");
    const adapter = getCLIAdapter(cliName);

    return new Promise((resolve, reject) => {
      const args = adapter.interactive ? adapter.interactive(task) : [task];
      const proc = spawn(cliName, args, {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
      });

      let stdout = "";
      let stderr = "";
      const startTime = Date.now();
      let timeoutHandle;

      // Set timeout based on CLI (qwen needs 20s, others 30s)
      const timeout = cliName === "qwen" ? 20000 : 30000;

      timeoutHandle = setTimeout(() => {
        proc.kill();
      }, timeout);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        clearTimeout(timeoutHandle);
        const executionTime = Date.now() - startTime;

        // 过滤 qwen 的启动警告
        const filteredStderr = stderr
          .split("\n")
          .filter(
            (line) =>
              !line.includes("ImportProcessor") &&
              !line.includes("extension") &&
              !line.includes("Skipping extension"),
          )
          .join("\n");

        resolve({
          success: true, // Consider success if we got any output
          cli: cliName,
          output: stdout,
          error: filteredStderr,
          executionTime: Math.round(executionTime),
          exitCode: code,
        });
      });

      proc.on("error", (error) => {
        clearTimeout(timeoutHandle);
        reject(new Error(`Failed to spawn ${cliName}: ${error.message}`));
      });
    });
  }

  /**
   * Execute task with specific CLI
   * 🔥 重写：混合策略 - qwen 用 one-shot，其他用持久池
   */
  async _executeWithCLI(cliName, task) {
    const startTime = Date.now();

    try {
      console.log(`\n[${cliName}] Executing task...`);
      console.log(`Task: ${task}`);
      console.log("");

      // 🔥 记录到项目状态看板
      await this.statusBoard.recordTask(cliName, task);

      // 🔥 记录用户输入到上下文
      this._addToCLIContext(cliName, "user", task);

      // 🔥 构建包含上下文的增强任务（优先使用状态看板的上下文）
      const contextualTask = await this._buildContextualTask(cliName, task);
      const finalTask = contextualTask !== task ? contextualTask : task;

      if (process.env.DEBUG === "true" && contextualTask !== task) {
        console.log("[DEBUG] Using contextual task with conversation history");
      }

      let result;

      // 🔥 混合策略：qwen 使用 spawn (one-shot)，其他 CLI 使用持久池
      if (cliName === "qwen") {
        // qwen 不支持持久 stdin，使用 one-shot 模式
        result = await this._executeOneShot(cliName, finalTask);
      } else {
        // 其他 CLI 使用持久进程池
        result = await this.cliPool.executeTask(cliName, finalTask, {
          timeout: this.options.cliTimeout || 30000,
          verbose: process.env.DEBUG === "true",
        });
      }

      // 🔥 记录 CLI 响应到上下文
      if (result.output && result.output.trim()) {
        this._addToCLIContext(cliName, "assistant", result.output.trim());
      }

      // 🔥 记录结果到状态看板
      await this.statusBoard.recordTask(cliName, task, result);

      // 显示执行结果
      console.log("");
      console.log(
        `[${cliName}] Response received in ${result.executionTime}ms`,
      );

      // 显示上下文状态
      const contextCount = this.cliContexts[cliName]?.length || 0;
      if (contextCount > 2) {
        console.log(
          `[${cliName}] Context: ${contextCount} messages maintained`,
        );
      }

      return {
        ...result,
        task: task,
        hasContext: contextCount > 1,
      };
    } catch (error) {
      console.error(`\n[${cliName}] Execution failed:`, error.message);

      // 🔥 记录失败到状态看板
      await this.statusBoard.recordTask(cliName, task, {
        success: false,
        error: error.message,
      });

      // 🔥 改进：如果 CLI 失败，尝试其他 CLI
      if (cliName === "qwen") {
        console.log(`[${cliName}] Trying fallback to iflow...`);

        try {
          const fallbackResult = await this.cliPool.executeTask("iflow", task, {
            timeout: this.options.cliTimeout || 30000,
          });

          // 记录到 iflow 的上下文
          this._addToCLIContext("iflow", "user", task);
          if (fallbackResult.output) {
            this._addToCLIContext(
              "iflow",
              "assistant",
              fallbackResult.output.trim(),
            );
          }

          console.log("\n[iflow] Fallback successful!");

          return {
            ...fallbackResult,
            task: task,
            fallback: true,
            originalCLI: cliName,
          };
        } catch (fallbackError) {
          console.error("[iflow] Fallback also failed:", fallbackError.message);
        }
      }

      throw error;
    }
  }

  /**
   * Execute exit command
   */
  async _executeExit() {
    await this.stop();
    return {
      success: true,
      message: "Exiting interactive mode",
    };
  }

  /**
   * Execute help command
   */
  async _executeHelp() {
    console.log("");
    console.log("Available commands:");
    console.log(
      "  <your message>       - Send message to current CLI (with context)",
    );
    console.log(
      "  use <cli>            - Switch to specific CLI (e.g., use iflow)",
    );
    console.log(
      "  ask <cli> <message>  - Ask specific CLI (e.g., ask qwen hello)",
    );
    console.log(
      "  route <message>      - Smart routing to best CLI (e.g., route analyze this code)",
    );
    console.log(
      "  r <message>          - Shortcut for route (e.g., r analyze this code)",
    );
    console.log(
      "  parallel <message>   - Execute with multiple CLIs concurrently (e.g., parallel analyze this code)",
    );
    console.log(
      "  concurrent <message> - Same as parallel (e.g., concurrent refactor this project)",
    );
    console.log("  context / ctx        - Show cross-CLI context status");
    console.log(
      "  clear [cli]          - Clear context for specific CLI or all",
    );
    console.log("  help                - Show this help");
    console.log("  status              - Show current status");
    console.log("  exit                - Exit interactive mode");
    console.log("");
    console.log("CLI Tools:");
    console.log(
      "  qwen, iflow, claude, gemini, codebuddy (buddy), codex, qodercli (qoder), kilo/kilocode, kode, opencode, copilot",
    );
    console.log("");
    console.log("🔥 Context Features:");
    console.log("  - Each CLI maintains its own conversation history");
    console.log("  - History is automatically included in tasks");
    console.log("  - Switch between CLIs seamlessly");
    console.log('  - Use "context" to view status');
    console.log('  - Use "clear" to reset history');
    console.log("");

    return {
      success: true,
      message: "Help displayed",
    };
  }

  /**
   * Execute concurrent command - execute with multiple CLIs concurrently using full orchestration system
   */
  async _executeConcurrent(command) {
    const task = command.task;

    try {
      console.log(
        "\n🚀 Starting concurrent execution with CentralOrchestrator...",
      );
      console.log(`📊 Concurrency level: ${this.options.concurrency || 3}`);
      console.log(`📋 Task: ${task.substring(0, 100)}...`);

      // 临时关闭 readline 接口以避免冲突
      const readlineWasOpen = this.readlineInterface !== null;
      if (readlineWasOpen) {
        console.log("\n⏸️  Temporarily pausing input interface...");
        this.readlineInterface.pause();
        this.readlineInterface.close();
        this.readlineInterface = null;
      }

      try {
        // 使用 CentralOrchestrator 并发执行
        const result = await this.orchestrator.executeConcurrent(task, {
          mode: "parallel",
          concurrencyLimit: this.options.concurrency || 3,
          timeout: this.options.cliTimeout || 0,
        });

        // 显示结果
        console.log("\n📊 Execution Summary:");
        console.log(`  Total: ${result.totalResults} CLIs`);
        console.log(`  Success: ${result.successCount}`);
        console.log(`  Failed: ${result.failedCount}`);
        console.log(`  Total Time: ${result.totalTime}ms`);

        // 显示每个 CLI 的结果
        console.log("\n📝 Detailed Results:");
        result.results.forEach((r, i) => {
          console.log(`\n  [${i + 1}] ${r.cli}:`);
          console.log(
            `      Status: ${r.success ? "✅ Success" : "❌ Failed"}`,
          );
          if (r.error) {
            console.log(`      Error: ${r.error}`);
          }
          if (r.output) {
            const outputStr =
              typeof r.output === "string"
                ? r.output
                : JSON.stringify(r.output);
            console.log(
              `      Output: ${outputStr.substring(0, 200)}${outputStr.length > 200 ? "..." : ""}`,
            );
          }
        });

        return {
          success: true,
          result: result,
        };
      } finally {
        // 重新创建 readline 接口
        if (readlineWasOpen && this.isActive) {
          console.log("\n▶️  Resuming input interface...");
          this.readlineInterface = this._createReadlineInterface();
        }
      }
    } catch (error) {
      console.error("\n❌ Concurrent execution failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute terminal command
   */
  async _executeTerminalCommand(command) {
    // Will be implemented with TerminalManager
    return {
      success: true,
      message: "Terminal command executed",
      terminals: [],
    };
  }

  /**
   * Execute status command
   * 🔥 显示项目全局状态看板
   */
  async _executeStatus() {
    const report = await this.statusBoard.generateReport();
    console.log("\n" + report);

    return {
      success: true,
      message: "Status displayed",
    };
  }

  /**
   * Execute delegate command
   */
  async _executeDelegate(command) {
    // Will be implemented with DelegationManager
    return {
      success: true,
      message: "Delegation command executed",
    };
  }

  /**
   * 🔥 查看上下文状态（显示项目状态看板）
   */
  async _executeContextStatus() {
    console.log("");
    console.log("========================================");
    console.log("  项目全局状态看板");
    console.log("========================================\n");

    // 1. 显示会话信息
    console.log("📋 会话信息:");
    console.log(`  Session ID: ${this.sharedContext.sessionId}`);
    console.log(
      `  开始时间: ${new Date(this.sharedContext.startTime).toLocaleString("zh-CN")}`,
    );
    console.log(`  当前CLI: ${this.currentCLI}`);
    console.log("");

    // 2. 显示状态看板路径
    console.log("📁 状态文件:");
    console.log(`  ${this.statusBoard.statusFilePath}`);
    console.log("");

    // 3. 显示本地上下文（内存中）
    console.log("💾 本地上下文 (内存中):");
    let totalMessages = 0;
    for (const [cliName, messages] of Object.entries(this.cliContexts)) {
      const count = messages?.length || 0;
      totalMessages += count;
      console.log(`  ${cliName}: ${count} 条消息`);
    }
    console.log(`  总计: ${totalMessages} 条消息`);
    console.log("");

    // 4. 显示项目状态看板摘要
    const statusSummary = await this.statusBoard.getContextSummary({
      maxHistory: 5,
      includeFindings: true,
      includeDecisions: true,
    });

    if (statusSummary && statusSummary.trim().length > 0) {
      console.log("📊 状态看板摘要 (持久化):");
      console.log("─".repeat(50));
      console.log(statusSummary);
      console.log("─".repeat(50));
      console.log("");
    }

    console.log("💡 提示:");
    console.log("  - 所有 CLI 会话共享同一个状态看板");
    console.log("  - 状态文件会自动保存，下次会话可恢复");
    console.log('  - 使用 "status" 查看完整报告');
    console.log("");

    console.log("Shared Context:");
    console.log(
      `  Task History: ${this.sharedContext.taskHistory.length} items`,
    );
    console.log(
      `  Cross-CLI References: ${this.sharedContext.crossCLIRefs.length} items`,
    );
    console.log("========================================");
    console.log("");

    return {
      success: true,
      message: "Context status displayed",
    };
  }

  /**
   * 🔥 新增：清除 CLI 上下文
   */
  async _executeClearContext(command) {
    const cliName = command.cli;

    if (cliName) {
      // 清除特定 CLI 的上下文
      if (this.cliContexts[cliName]) {
        const count = this.cliContexts[cliName].length;
        delete this.cliContexts[cliName];
        console.log(
          `✓ Cleared context for ${cliName} (${count} messages removed)`,
        );
      } else {
        console.log(`ℹ  No context found for ${cliName}`);
      }
    } else {
      // 清除所有上下文
      let totalMessages = 0;
      for (const [cliName, messages] of Object.entries(this.cliContexts)) {
        totalMessages += messages?.length || 0;
      }
      this.cliContexts = {};
      this.sharedContext = {
        sessionId: this._generateSessionId(),
        startTime: Date.now(),
        projectContext: {},
        taskHistory: [],
        crossCLIRefs: [],
      };
      console.log(`✓ Cleared all context (${totalMessages} messages removed)`);
      console.log(`✓ New session started: ${this.sharedContext.sessionId}`);
    }

    return {
      success: true,
      message: "Context cleared",
    };
  }

  /**
   * 🔥 新增：生成会话 ID
   */
  _generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Display result
   */
  _displayResult(result) {
    if (result.success) {
      // 如果是CLI执行结果，显示详细信息
      if (result.cli) {
        console.log("");
        console.log("========================================");
        console.log("  Execution Result");
        console.log("========================================");
        console.log(`CLI: ${result.cli}`);
        console.log(`Task: ${result.task}`);
        console.log(`Execution Time: ${result.executionTime}ms`);
        console.log(`Exit Code: ${result.exitCode}`);

        // 🔥 新增：显示上下文信息
        const contextCount = this.cliContexts[result.cli]?.length || 0;
        if (contextCount > 2) {
          console.log(
            `Context: ${contextCount} messages (conversation history maintained)`,
          );
        }

        console.log("");

        if (result.output) {
          console.log("Response:");
          console.log("----------------------------------------");
          console.log(result.output);
          console.log("----------------------------------------");
        }

        console.log("========================================");
        console.log("");
      } else if (result.message) {
        console.log("✓", result.message);
      }
      if (result.data) {
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.error("✗ Error:", result.error);
    }
  }

  /**
   * Start auto-save
   */
  _startAutoSave() {
    this.saveIntervalId = setInterval(async () => {
      try {
        await this.sessionManager.saveSession();
      } catch (error) {
        console.error("Auto-save failed:", error.message);
      }
    }, this.options.saveInterval);
  }
}

class CommandParser {
  constructor() {
    this.commandPatterns = [
      { type: "exit", pattern: /^(exit|quit|bye)$/i },
      { type: "help", pattern: /^(help|\?|h)$/i },
      { type: "status", pattern: /^status$/i },
      { type: "context", pattern: /^(context|ctx)$/i }, // 🔥 新增：查看上下文
      {
        type: "clear",
        pattern:
          /^clear(\s+(qwen|iflow|claude|gemini|codebuddy|buddy|codex|qodercli|qoder|kilocode|kode|opencode|copilot))?$/i,
      }, // 🔥 新增：清除上下文
      { type: "terminal", pattern: /^terminal/i },
      { type: "delegate", pattern: /^delegate/i },
      {
        type: "use",
        pattern:
          /^use\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot|kilocode|kode|opencode)$/i,
      },
      {
        type: "ask",
        pattern:
          /^ask\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot|kilocode|kode|opencode)\s+(.+)$/s,
      },
      { type: "route", pattern: /^(route|r)\s+(.+)$/s },
      { type: "parallel", pattern: /^parallel\s+(.+)$/s },
      { type: "concurrent", pattern: /^concurrent\s+(.+)$/s },
      { type: "task", pattern: /.*/s }, // 匹配所有非空输入
    ];
  }

  /**
   * Normalize CLI alias to official name
   */
  _normalizeCLI(alias) {
    const aliases = {
      buddy: "codebuddy",
      qoder: "qodercli",
      kilo: "kilocode",
    };
    return aliases[alias] || alias;
  }

  parse(input) {
    if (input === null || input === undefined || typeof input !== "string") {
      return {
        type: "error",
        error: "Invalid input",
      };
    }

    const trimmedInput = input.trim();

    if (trimmedInput === "") {
      return {
        type: "empty",
      };
    }

    // 尝试匹配特定命令模式
    for (const pattern of this.commandPatterns) {
      if (pattern.pattern.test(trimmedInput)) {
        if (pattern.type === "task") {
          return {
            type: "task",
            task: trimmedInput,
          };
        } else if (pattern.type === "use") {
          const match = trimmedInput.match(
            /^use\s+(qwen|iflow|claude|gemini|codebuddy|buddy|codex|qodercli|qoder|kilo|kilocode|kode|opencode|copilot)$/i,
          );
          return {
            type: "use",
            cli: this._normalizeCLI(match[1].toLowerCase()),
          };
        } else if (pattern.type === "ask") {
          const match = trimmedInput.match(
            /^ask\s+(qwen|iflow|claude|gemini|codebuddy|buddy|codex|qodercli|qoder|kilo|kilocode|kode|opencode|copilot)\s+(.+)$/s,
          );
          return {
            type: "ask",
            cli: this._normalizeCLI(match[1].toLowerCase()),
            task: match[2],
          };
        } else if (pattern.type === "route") {
          const match = trimmedInput.match(/^(route|r)\s+(.+)$/s);
          return {
            type: "route",
            task: match[2],
          };
        } else if (
          pattern.type === "parallel" ||
          pattern.type === "concurrent"
        ) {
          const match = trimmedInput.match(/^(parallel|concurrent)\s+(.+)$/s);
          return {
            type: "concurrent",
            task: match[2],
          };
        } else if (pattern.type === "clear") {
          // 🔥 新增：处理 clear 命令
          const match = trimmedInput.match(
            /^clear(\s+(qwen|iflow|claude|gemini|codebuddy|codex|qodercli|copilot))?$/i,
          );
          return {
            type: "clear",
            cli: match[2] ? match[2].toLowerCase() : null,
          };
        } else {
          return {
            type: pattern.type,
          };
        }
      }
    }

    // 默认作为task处理
    return {
      type: "task",
      task: trimmedInput,
    };
  }
}

class SessionManager {
  constructor(options = {}) {
    this.options = options;
    this.currentSession = null;
    this.sessionHistory = [];
  }

  createSession() {
    this.currentSession = {
      id: this._generateSessionId(),
      startTime: Date.now(),
      status: "active",
      commands: [],
      context: {},
    };
  }

  getCurrentSession() {
    return this.currentSession;
  }

  addToHistory(entry) {
    if (this.currentSession) {
      this.currentSession.commands.push(entry);
    }
  }

  getHistory() {
    return this.currentSession ? this.currentSession.commands : [];
  }

  async saveSession() {
    // Save session to file
    // Implementation pending
  }

  _generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class ContextManager {
  constructor() {
    this.context = {
      lastCommand: null,
      lastCommandTime: null,
      lastTask: null,
      lastTaskTime: null,
      variables: {},
    };
  }

  updateContext(updates) {
    Object.assign(this.context, updates);
  }

  getContext() {
    return { ...this.context };
  }

  setVariable(name, value) {
    this.context.variables[name] = value;
  }

  getVariable(name) {
    return this.context.variables[name];
  }
}

module.exports = {
  InteractiveModeController,
  CommandParser,
  SessionManager,
  ContextManager,
};
