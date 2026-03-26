/**
 * MultimodalWeChatIntegration - 多模态微信集成系统
 * 整合所有组件，提供统一的多模态对话和任务执行接口
 */

const MessageRouter = require('./multimodal/MessageRouter');
const TaskScheduler = require('./tasks/TaskScheduler');
const CLICoordinator = require('./tasks/CLICoordinator');
// const WeChatClient = require('../ilink/WeChatClient'); // 假设已存在

class MultimodalWeChatIntegration {
  constructor(options = {}) {
    this.options = options;

    // 初始化核心组件
    this.router = new MessageRouter(options);
    this.cliCoordinator = new CLICoordinator(options);

    // WeChat客户端
    this.wechatClient = options.wechatClient || null;

    // 会话管理
    this.sessions = new Map();

    // 性能监控
    this.metrics = {
      totalMessages: 0,
      messageTypeStats: {},
      cliUsageStats: new Map(),
      errorCount: 0,
      successCount: 0
    };

    // 事件监听
    this.setupEventHandlers();
  }

  /**
   * 启动集成系统
   */
  async start() {
    try {
      console.log('Starting Multimodal WeChat Integration...');

      // 连接WeChat
      if (!this.wechatClient) {
        this.wechatClient = new WeChatClient(this.options);
        await this.wechatClient.connect();
      }

      // 监听消息
      this.wechatClient.on('message', (message) => {
        this.handleMessage(message);
      });

      console.log('Multimodal WeChat Integration started successfully');
      return true;

    } catch (error) {
      console.error('Failed to start Multimodal WeChat Integration:', error);
      throw error;
    }
  }

  /**
   * 处理收到的消息
   */
  async handleMessage(message) {
    const messageId = this.generateMessageId();

    try {
      console.log('Handling message:', messageId);

      // 更新统计
      this.metrics.totalMessages++;

      // 获取或创建会话
      const session = await this.getOrCreateSession(message.fromUser);

      // 路由消息
      const result = await this.router.route({
        ...message,
        sessionId: session.id,
        messageId: messageId
      });

      // 发送响应
      if (result && result.content) {
        await this.sendResponse(message.fromUser, result);
      }

      // 更新统计
      if (result.success) {
        this.metrics.successCount++;
      } else {
        this.metrics.errorCount++;
      }

      // 更新消息类型统计
      const messageType = result.type || 'unknown';
      this.metrics.messageTypeStats[messageType] =
        (this.metrics.messageTypeStats[messageType] || 0) + 1;

      return result;

    } catch (error) {
      console.error('Message handling error:', error);
      this.metrics.errorCount++;

      // 发送错误响应
      await this.sendErrorResponse(message.fromUser, error);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 发送响应
   */
  async sendResponse(toUser, result) {
    try {
      // 根据响应类型选择发送方式
      if (result.type === 'voice') {
        // TODO: 实现TTS语音响应
        await this.wechatClient.sendText(toUser, result.content);
      } else if (result.type === 'image') {
        // TODO: 实现图片响应
        await this.wechatClient.sendText(toUser, result.content);
      } else {
        // 默认文本响应
        await this.wechatClient.sendText(toUser, result.content);
      }

      return true;

    } catch (error) {
      console.error('Response sending error:', error);
      throw error;
    }
  }

  /**
   * 发送错误响应
   */
  async sendErrorResponse(toUser, error) {
    const errorMessage = `抱歉，处理您的请求时出错：${error.message}\n\n请稍后重试或联系技术支持。`;
    await this.wechatClient.sendText(toUser, errorMessage);
  }

  /**
   * 获取或创建会话
   */
  async getOrCreateSession(userId) {
    let session = this.sessions.get(userId);

    if (!session || this.isSessionExpired(session)) {
      session = await this.createSession(userId);
    }

    // 更新最后活跃时间
    session.lastActiveAt = Date.now();
    this.sessions.set(userId, session);

    return session;
  }

  /**
   * 创建会话
   */
  async createSession(userId) {
    // 为用户选择最佳CLI
    const preferredCLI = await this.cliCoordinator.selectBestCLI({
      description: '',
      interactive: true
    });

    const session = {
      id: this.generateSessionId(),
      userId: userId,
      preferredCLI: preferredCLI,
      context: {},
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };

    this.sessions.set(userId, session);
    return session;
  }

  /**
   * 检查会话是否过期
   */
  isSessionExpired(session) {
    const timeout = 30 * 60 * 1000; // 30分钟
    return Date.now() - session.lastActiveAt > timeout;
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    // 定期清理过期会话
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 每5分钟

    // 定期输出统计信息
    setInterval(() => {
      this.logMetrics();
    }, 60 * 60 * 1000); // 每小时
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions() {
    let cleaned = 0;

    for (const [userId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * 记录指标
   */
  logMetrics() {
    console.log('=== Multimodal WeChat Integration Metrics ===');
    console.log(`Total Messages: ${this.metrics.totalMessages}`);
    console.log(`Success Rate: ${((this.metrics.successCount / this.metrics.totalMessages) * 100).toFixed(2)}%`);
    console.log(`Message Types:`, this.metrics.messageTypeStats);
    console.log(`Active Sessions: ${this.sessions.size}`);
    console.log('CLI Usage:', this.cliCoordinator.getCLIStats());
    console.log('=============================================');
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      running: true,
      sessions: this.sessions.size,
      metrics: this.metrics,
      cliStats: this.cliCoordinator.getCLIStats(),
      uptime: process.uptime()
    };
  }

  /**
   * 停止集成系统
   */
  async stop() {
    try {
      console.log('Stopping Multimodal WeChat Integration...');

      // 断开WeChat连接
      if (this.wechatClient) {
        await this.wechatClient.disconnect();
      }

      // 输出最终统计
      this.logMetrics();

      console.log('Multimodal WeChat Integration stopped');
      return true;

    } catch (error) {
      console.error('Error stopping Multimodal WeChat Integration:', error);
      throw error;
    }
  }

  /**
   * 生成消息ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = MultimodalWeChatIntegration;
