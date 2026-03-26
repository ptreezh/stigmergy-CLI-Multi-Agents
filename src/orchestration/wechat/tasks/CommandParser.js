/**
 * CommandParser - 命令解析器
 * 解析用户输入的命令并执行
 */

class CommandParser {
  constructor(options = {}) {
    this.options = options;

    // 命令模式定义
    this.patterns = {
      // CLI选择命令
      cliSelect: {
        patterns: [
          /^(?:切换|使用|use|switch)\s+(.+?)\s+(?:cli|CLI)$/i,
          /^(?:去|到|go)\s+(.+?)\s+(?:cli|CLI)$/i
        ],
        handler: this.handleCLISelect.bind(this)
      },

      // 任务执行命令
      taskExecute: {
        patterns: [
          /^(?:执行|运行|run|execute)\s+(.+)$/i,
          /^(?:用|使用|using)\s+(.+?)\s+(?:执行|运行|run|execute)\s+(.+)$/i
        ],
        handler: this.handleTaskExecute.bind(this)
      },

      // 查询命令
      query: {
        patterns: [
          /^(?:查询|搜索|search|query|find)\s+(.+)$/i
        ],
        handler: this.handleQuery.bind(this)
      },

      // 设置命令
      config: {
        patterns: [
          /^(?:设置|配置|config|set)\s+(.+)$/i
        ],
        handler: this.handleConfig.bind(this)
      },

      // 状态命令
      status: {
        patterns: [
          /^(?:状态|status|查看状态|当前状态)$/i
        ],
        handler: this.handleStatus.bind(this)
      },

      // 帮助命令
      help: {
        patterns: [
          /^(?:帮助|help|h|\?)$/i
        ],
        handler: this.handleHelp.bind(this)
      }
    };
  }

  /**
   * 解析命令
   */
  parse(message) {
    // 移除多余空格
    const cleaned = message.trim().replace(/\s+/g, ' ');

    // 遍历所有命令模式
    for (const [commandType, config] of Object.entries(this.patterns)) {
      for (const pattern of config.patterns) {
        const match = cleaned.match(pattern);
        if (match) {
          return {
            type: 'command',
            commandType: commandType,
            params: match.slice(1), // 提取捕获组
            raw: cleaned,
            confidence: 0.95
          };
        }
      }
    }

    // 如果没有匹配到命令模式，返回null
    return {
      type: 'unknown',
      raw: cleaned
    };
  }

  /**
   * 执行命令
   */
  async execute(command, message) {
    const config = this.patterns[command.commandType];

    if (!config || !config.handler) {
      throw new Error(`Unknown command type: ${command.commandType}`);
    }

    return await config.handler(command, message);
  }

  /**
   * 处理CLI选择命令
   */
  async handleCLISelect(command, message) {
    const cliName = command.params[0].trim().toLowerCase();

    // 验证CLI是否可用
    const availableCLIs = this.getAvailableCLIs();
    if (!availableCLIs.includes(cliName)) {
      return {
        success: false,
        message: `不可用的CLI: ${cliName}\n\n可用的CLI: ${availableCLIs.join(', ')}`
      };
    }

    // 切换CLI
    // TODO: 实现CLI切换逻辑
    return {
      success: true,
      message: `已切换到 ${cliName} CLI`,
      data: { selectedCLI: cliName }
    };
  }

  /**
   * 处理任务执行命令
   */
  async handleTaskExecute(command, message) {
    const params = command.params;

    // 如果指定了CLI
    if (params.length === 2) {
      const cliName = params[0].trim().toLowerCase();
      const task = params[1].trim();

      return {
        success: true,
        message: `正在使用 ${cliName} 执行任务: ${task}`,
        data: {
          targetCLI: cliName,
          task: task
        }
      };
    }

    // 如果没有指定CLI，使用智能路由
    const task = params[0].trim();
    return {
      success: true,
      message: `正在执行任务: ${task}`,
      data: {
        task: task,
        smartRouting: true
      }
    };
  }

  /**
   * 处理查询命令
   */
  async handleQuery(command, message) {
    const query = command.params[0].trim();

    return {
      success: true,
      message: `正在查询: ${query}`,
      data: {
        query: query
      }
    };
  }

  /**
   * 处理设置命令
   */
  async handleConfig(command, message) {
    const config = command.params[0].trim();

    // 解析配置项
    const [key, ...valueParts] = config.split(/\s*=\s*/);
    const value = valueParts.join('=');

    if (!key || !value) {
      return {
        success: false,
        message: '配置格式错误。正确格式: 设置 key = value'
      };
    }

    // TODO: 实现配置存储逻辑
    return {
      success: true,
      message: `已设置: ${key} = ${value}`,
      data: { key, value }
    };
  }

  /**
   * 处理状态命令
   */
  async handleStatus(command, message) {
    // TODO: 实现状态查询逻辑
    return {
      success: true,
      message: '系统状态正常',
      data: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };
  }

  /**
   * 处理帮助命令
   */
  async handleHelp(command, message) {
    const helpText = `
📱 WeChat 多CLI集成系统 - 命令帮助

🔧 CLI选择:
  • 切换/使用 [cli名] cli - 切换到指定CLI
  • 例如: 切换 claude cli

📋 任务执行:
  • 执行/运行 [任务描述] - 执行任务（智能选择CLI）
  • 用 [cli名] 执行 [任务] - 使用指定CLI执行任务
  • 例如: 执行 写一个快速排序
  • 例如: 用 claude 执行 分析这个文件

🔍 查询:
  • 查询/搜索 [关键词] - 搜索信息
  • 例如: 查询 最新版本

⚙️  设置:
  • 设置/配置 [key] = [value] - 修改配置
  • 例如: 设置 language = chinese

📊 状态:
  • 状态/查看状态 - 查看系统状态

💡 提示:
  • 支持自然语言输入，系统会智能识别意图
  • 可以直接发送任务描述，无需命令前缀
  • 支持语音和图片输入
`;

    return {
      success: true,
      message: helpText,
      data: { type: 'help' }
    };
  }

  /**
   * 获取可用的CLI列表
   */
  getAvailableCLIs() {
    // TODO: 从配置或扫描获取可用CLI
    return ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy'];
  }
}

module.exports = CommandParser;
