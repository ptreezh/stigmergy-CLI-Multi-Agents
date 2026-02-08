/**
 * Command Router - 命令路由器
 * 根据意图路由到对应的执行函数
 */

class CommandRouter {
  constructor(controller) {
    this.controller = controller;
  }

  /**
   * 根据意图路由命令
   * @param {string} intent - 意图类型
   * @param {string} text - 原始文本
   * @returns {Promise<object>} 执行结果
   */
  async route(intent, text) {
    try {
      switch (intent) {
        case "concurrent":
          return await this.executeConcurrent(text);
        case "ask":
          return await this.executeAsk(text);
        case "status":
          return await this.executeStatus();
        case "stop":
          return await this.executeStop();
        case "help":
          return await this.executeHelp();
        case "route":
        default:
          return await this.executeRoute(text);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `命令执行失败: ${error.message}`,
      };
    }
  }

  /**
   * 智能路由 - 选择最佳 CLI 执行
   */
  async executeRoute(text) {
    const task = text;
    console.log(`[Router] 智能路由: "${task.substring(0, 50)}..."`);

    if (this.controller && typeof this.controller.executeRoute === "function") {
      const result = await this.controller.executeRoute(task);
      return {
        success: result.success !== false,
        mode: "route",
        message: result.message || result,
        cli: result.cli || "auto",
        task,
      };
    }

    return {
      success: true,
      mode: "route",
      message: `[路由模式] 已接收任务: ${task}`,
      cli: "auto",
      task,
    };
  }

  /**
   * 并发执行 - 多 CLI 并行分析
   */
  async executeConcurrent(text) {
    const task = text.replace(/^(concurrent|parallel)\s+/i, "").trim();
    console.log(`[Router] 并发执行: "${task.substring(0, 50)}..."`);

    if (
      this.controller &&
      typeof this.controller.executeConcurrent === "function"
    ) {
      const result = await this.controller.executeConcurrent(task);
      return {
        success: result.success !== false,
        mode: "concurrent",
        message: result.message || `[并发模式] 已执行`,
        clis: result.clis || result.results?.map((r) => r.cli) || [],
        task,
        duration: result.duration,
      };
    }

    return {
      success: true,
      mode: "concurrent",
      message: `[并发模式] 已接收任务: ${task}`,
      clis: ["claude", "qwen", "iflow"],
      task,
    };
  }

  /**
   * 指定 CLI 执行
   */
  async executeAsk(text) {
    const match = text.match(/^ask\s+(\w+)\s+(.+)$/i);
    if (!match) {
      return {
        success: false,
        error: "无效的 ask 命令格式",
        message: "请使用: ask <cli> <任务>",
      };
    }

    const cli = match[1].toLowerCase();
    const task = match[2].trim();
    console.log(`[Router] 指定 CLI: ${cli} - "${task.substring(0, 50)}..."`);

    if (this.controller && typeof this.controller.executeAsk === "function") {
      const result = await this.controller.executeAsk(cli, task);
      return {
        success: result.success !== false,
        mode: "ask",
        message: result.message || `[${cli}] 已执行`,
        cli,
        task,
      };
    }

    return {
      success: true,
      mode: "ask",
      message: `[${cli}] 已接收任务: ${task}`,
      cli,
      task,
    };
  }

  /**
   * 查询状态
   */
  async executeStatus() {
    console.log(`[Router] 查询状态`);

    if (this.controller && typeof this.controller.getStatus === "function") {
      const status = await this.controller.getStatus();
      return {
        success: true,
        mode: "status",
        message: "状态查询成功",
        status,
      };
    }

    return {
      success: true,
      mode: "status",
      message: "Stigmergy Gateway 运行中",
      status: {
        running: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 停止执行
   */
  async executeStop() {
    console.log(`[Router] 停止执行`);

    if (
      this.controller &&
      typeof this.controller.stopExecution === "function"
    ) {
      await this.controller.stopExecution();
    }

    return {
      success: true,
      mode: "stop",
      message: "已停止当前执行",
    };
  }

  /**
   * 帮助信息
   */
  async executeHelp() {
    return {
      success: true,
      mode: "help",
      message: `可用命令:
- route <任务> : 智能路由到最佳 CLI
- concurrent <任务> : 多 CLI 并行分析
- ask <cli> <任务> : 指定 CLI 执行
- status : 查询状态
- stop : 停止执行
- help : 显示此帮助`,
      commands: {
        route: "智能路由到最佳 CLI",
        concurrent: "多 CLI 并行分析相同任务",
        ask: "指定 CLI 执行任务",
        status: "查询当前状态",
        stop: "停止当前执行",
        help: "显示帮助信息",
      },
    };
  }
}

module.exports = { CommandRouter };
