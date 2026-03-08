/**
 * 层级化项目状态看板管理器
 * 支持单一看板和多看板模式
 */

const fs = require("fs").promises;
const path = require("path");
const { ProjectStatusBoard } = require("./ProjectStatusBoard");

class HierarchicalStatusBoard {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.configPath = path.join(
      this.projectRoot,
      ".stigmergy",
      "status",
      "config.json",
    );
    this.boards = {}; // { 'default': StatusBoard, 'backend': StatusBoard }
    this.currentBoard = "default";
    this.config = {
      mode: "single", // 'single' | 'multi'
      subBoards: {}, // { 'backend': { path: './backend', independent: true } }
    };
  }

  /**
   * 初始化层级化状态看板
   */
  async initialize(projectInfo = {}) {
    await this._loadConfig();
    await this._initializeDefaultBoard(projectInfo);

    if (this.config.mode === "multi") {
      await this._initializeSubBoards();
    }

    return this.getCurrentBoard();
  }

  /**
   * 获取当前活跃的看板
   */
  getCurrentBoard() {
    return this.boards[this.currentBoard];
  }

  /**
   * 切换到子看板
   */
  async switchBoard(boardName) {
    if (!this.boards[boardName]) {
      throw new Error(`Board "${boardName}" not found`);
    }

    this.currentBoard = boardName;
    return this.getCurrentBoard();
  }

  /**
   * 为子目录创建独立看板
   */
  async createSubBoard(subDir, boardName, projectInfo = {}) {
    const subDirPath = path.join(this.projectRoot, subDir);
    const subBoard = new ProjectStatusBoard(subDirPath);

    await subBoard.initialize({
      ...projectInfo,
      parentBoard: this.currentBoard,
      subDir: subDir,
    });

    this.boards[boardName] = subBoard;

    // 更新配置
    this.config.subBoards[boardName] = {
      path: subDir,
      independent: true,
      createdAt: new Date().toISOString(),
    };

    await this._saveConfig();

    return subBoard;
  }

  /**
   * 获取所有看板的状态摘要
   */
  async getAllBoardsSummary() {
    const summary = {
      mode: this.config.mode,
      current: this.currentBoard,
      boards: {},
    };

    for (const [name, board] of Object.entries(this.boards)) {
      const status = await board.readStatus();
      summary.boards[name] = {
        path: board.projectRoot,
        projectInfo: status.projectInfo,
        stats: {
          tasks: status.taskQueue?.length || 0,
          findings: status.findings?.length || 0,
          decisions: status.decisions?.length || 0,
          history: status.collaborationHistory?.length || 0,
        },
      };
    }

    return summary;
  }

  /**
   * 记录任务到当前看板
   */
  async recordTask(cliName, task, result = {}) {
    const board = this.getCurrentBoard();
    return await board.recordTask(cliName, task, result);
  }

  /**
   * 获取跨看板的上下文摘要
   */
  async getGlobalContext(options = {}) {
    const { includeSubBoards = true, maxHistory = 5 } = options;

    const sections = [];

    // 当前看板的上下文
    const currentContext = await this.getCurrentBoard().getContextSummary({
      maxHistory,
      includeFindings: true,
      includeDecisions: true,
    });

    sections.push(`## 当前看板 (${this.currentBoard})`);
    sections.push(currentContext);
    sections.push("");

    // 如果是多看板模式，包含其他看板的摘要
    if (includeSubBoards && this.config.mode === "multi") {
      for (const [boardName, board] of Object.entries(this.boards)) {
        if (boardName === this.currentBoard) continue;

        const boardSummary = await board.getContextSummary({
          maxHistory: 2, // 更少的历史
          includeFindings: false,
          includeDecisions: false,
        });

        sections.push(`## 子看板: ${boardName}`);
        sections.push(boardSummary);
        sections.push("");
      }
    }

    return sections.join("\n");
  }

  /**
   * 生成层级化报告
   */
  async generateReport() {
    const summary = await this.getAllBoardsSummary();
    const lines = [];

    lines.push("========================================");
    lines.push("  层级化项目状态看板");
    lines.push("========================================\n");

    lines.push(`📊 模式: ${summary.mode === "single" ? "单一看板" : "多看板"}`);
    lines.push(`🎯 当前看板: ${summary.current}`);
    lines.push(`📋 看板数量: ${Object.keys(summary.boards).length}`);
    lines.push("");

    for (const [name, info] of Object.entries(summary.boards)) {
      const isCurrent = name === summary.current;
      lines.push(`${isCurrent ? "→" : " "} ${name}:`);
      lines.push(`   路径: ${info.path}`);
      lines.push(`   项目: ${info.projectInfo.name || "Unknown"}`);
      lines.push(
        `   统计: ${info.stats.tasks}任务, ${info.stats.findings}发现, ${info.stats.decisions}决策`,
      );
      lines.push("");
    }

    lines.push("========================================");

    return lines.join("\n");
  }

  /**
   * 加载配置
   * @private
   */
  async _loadConfig() {
    try {
      const configContent = await fs.readFile(this.configPath, "utf8");
      this.config = JSON.parse(configContent);
    } catch {
      // 配置文件不存在，使用默认配置
      await this._saveConfig();
    }
  }

  /**
   * 保存配置
   * @private
   */
  async _saveConfig() {
    const configDir = path.dirname(this.configPath);
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
      "utf8",
    );
  }

  /**
   * 初始化默认看板
   * @private
   */
  async _initializeDefaultBoard(projectInfo) {
    const defaultBoard = new ProjectStatusBoard(this.projectRoot);
    await defaultBoard.initialize(projectInfo);
    this.boards["default"] = defaultBoard;
    this.currentBoard = "default";
  }

  /**
   * 初始化子看板
   * @private
   */
  async _initializeSubBoards() {
    for (const [boardName, config] of Object.entries(this.config.subBoards)) {
      if (config.independent && config.path) {
        const subDirPath = path.join(this.projectRoot, config.path);
        const subBoard = new ProjectStatusBoard(subDirPath);

        try {
          await subBoard.initialize({
            name: boardName,
            parentBoard: "default",
          });
          this.boards[boardName] = subBoard;
        } catch (error) {
          console.warn(
            `Failed to initialize sub-board "${boardName}":`,
            error.message,
          );
        }
      }
    }
  }

  /**
   * 代理方法：转发到当前看板
   */
  async readStatus() {
    return await this.getCurrentBoard().readStatus();
  }

  async updateStatus(updates) {
    return await this.getCurrentBoard().updateStatus(updates);
  }

  async recordFinding(cliName, category, content, metadata) {
    return await this.getCurrentBoard().recordFinding(
      cliName,
      category,
      content,
      metadata,
    );
  }

  async recordDecision(cliName, decision, rationale) {
    return await this.getCurrentBoard().recordDecision(
      cliName,
      decision,
      rationale,
    );
  }

  async switchCLI(cliName, context) {
    return await this.getCurrentBoard().switchCLI(cliName, context);
  }

  async addTaskToQueue(task, priority) {
    return await this.getCurrentBoard().addTaskToQueue(task, priority);
  }

  async completeTask(taskId, result) {
    return await this.getCurrentBoard().completeTask(taskId, result);
  }
}

module.exports = { HierarchicalStatusBoard };
