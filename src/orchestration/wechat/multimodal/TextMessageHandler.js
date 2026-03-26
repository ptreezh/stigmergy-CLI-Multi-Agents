/**
 * TextMessageHandler - 文本消息处理器
 * 处理文本消息，检测命令、任务和普通对话
 */

const CommandParser = require('../tasks/CommandParser');
const TaskScheduler = require('../tasks/TaskScheduler');
const ConversationHandler = require('./ConversationHandler');

class TextMessageHandler {
  constructor(options = {}) {
    this.commandParser = new CommandParser(options);
    this.taskScheduler = new TaskScheduler(options);
    this.conversationHandler = new ConversationHandler(options);

    this.options = options;
  }

  /**
   * 处理文本消息
   */
  async handle(message) {
    try {
      console.log('Processing text message:', message.content);

      // 1. 文本预处理
      const cleaned = this.preprocess(message.content);

      // 2. 命令检测
      const command = this.commandParser.parse(cleaned);
      if (command && command.type === 'command') {
        console.log('Command detected:', command);
        return this.handleCommand(command, message);
      }

      // 3. 任务检测
      const task = this.detectTask(cleaned);
      if (task) {
        console.log('Task detected:', task);
        return this.handleTask(task, message);
      }

      // 4. 普通对话
      console.log('Conversation detected');
      return this.handleConversation(cleaned, message);

    } catch (error) {
      console.error('Text message handling error:', error);
      throw error;
    }
  }

  /**
   * 文本预处理
   */
  preprocess(text) {
    return text
      .trim()
      // 移除多余空格
      .replace(/\s+/g, ' ')
      // 移除特殊字符（保留基本标点）
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\.,;:!?()'"、，。；：！？]/g, '');
  }

  /**
   * 检测是否为命令
   */
  isCommand(text) {
    return this.commandParser.parse(text).type === 'command';
  }

  /**
   * 检测是否为任务
   */
  detectTask(text) {
    // 任务特征检测
    const taskPatterns = [
      /^(?:帮我|请|能否|可以)\s*(.+)$/,
      /^(?:执行|运行|run|execute)\s*(.+)$/,
      /(?:写|创建|生成|实现)\s+(.+?)(?:代码|程序|功能)/,
      /(?:分析|检查|调试|修复)\s+(.+)/
    ];

    for (const pattern of taskPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          type: 'task',
          description: match[1] || text,
          originalText: text
        };
      }
    }

    return null;
  }

  /**
   * 处理命令
   */
  async handleCommand(command, message) {
    try {
      const result = await this.commandParser.execute(command, message);

      return {
        success: true,
        type: 'command',
        command: command.commandType,
        content: result.message || result.content,
        data: result.data
      };

    } catch (error) {
      return {
        success: false,
        type: 'error',
        content: `命令执行失败: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 处理任务
   */
  async handleTask(task, message) {
    try {
      const result = await this.taskScheduler.schedule(task, message);

      return {
        success: true,
        type: 'task',
        task: task.description,
        content: result.message || result.content,
        data: result.data,
        executionTime: result.executionTime
      };

    } catch (error) {
      return {
        success: false,
        type: 'error',
        content: `任务执行失败: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 处理普通对话
   */
  async handleConversation(text, message) {
    try {
      const result = await this.conversationHandler.respond(text, message);

      return {
        success: true,
        type: 'conversation',
        content: result.message || result.content,
        data: result.data
      };

    } catch (error) {
      return {
        success: false,
        type: 'error',
        content: `对话处理失败: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = TextMessageHandler;
