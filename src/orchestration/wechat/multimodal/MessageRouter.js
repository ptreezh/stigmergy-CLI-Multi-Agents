/**
 * MessageRouter - 多模态消息路由器
 * 根据消息类型路由到不同的处理器
 */

const TextMessageHandler = require('./TextMessageHandler');
const VoiceMessageHandler = require('./VoiceMessageHandler');
const ImageMessageHandler = require('./ImageMessageHandler');

class MessageRouter {
  constructor(options = {}) {
    this.handlers = {
      text: new TextMessageHandler(options),
      voice: new VoiceMessageHandler(options),
      image: new ImageMessageHandler(options)
    };

    this.preprocessors = options.preprocessors || [];
    this.postprocessors = options.postprocessors || [];
  }

  /**
   * 路由消息到合适的处理器
   */
  async route(message) {
    try {
      // 1. 检测消息类型
      const messageType = this.detectMessageType(message);

      // 2. 获取处理器
      const handler = this.getHandler(messageType);

      if (!handler) {
        throw new Error(`No handler found for message type: ${messageType}`);
      }

      // 3. 预处理
      const preprocessed = await this.preprocess(message, messageType);

      // 4. 委托给处理器
      const result = await handler.handle(preprocessed);

      // 5. 后处理
      return this.postprocess(result, messageType);

    } catch (error) {
      console.error('Message routing error:', error);
      return this.handleError(error, message);
    }
  }

  /**
   * 检测消息类型
   */
  detectMessageType(message) {
    if (message.voice) {
      return 'voice';
    }
    if (message.image) {
      return 'image';
    }
    if (message.content && typeof message.content === 'string') {
      return 'text';
    }
    return 'unknown';
  }

  /**
   * 获取处理器
   */
  getHandler(messageType) {
    return this.handlers[messageType] || null;
  }

  /**
   * 预处理消息
   */
  async preprocess(message, messageType) {
    let processed = { ...message, messageType };

    // 应用所有预处理器
    for (const preprocessor of this.preprocessors) {
      processed = await preprocessor.process(processed);
    }

    return processed;
  }

  /**
   * 后处理结果
   */
  async postprocess(result, messageType) {
    let processed = { ...result, messageType };

    // 应用所有后处理器
    for (const postprocessor of this.postprocessors) {
      processed = await postprocessor.process(processed);
    }

    return processed;
  }

  /**
   * 错误处理
   */
  async handleError(error, message) {
    console.error('Error in message router:', error);

    return {
      success: false,
      error: error.message,
      type: 'error',
      content: '抱歉，处理消息时出错。请稍后重试。',
      originalMessage: message
    };
  }

  /**
   * 添加预处理器
   */
  addPreprocessor(preprocessor) {
    this.preprocessors.push(preprocessor);
  }

  /**
   * 添加后处理器
   */
  addPostprocessor(postprocessor) {
    this.postprocessors.push(postprocessor);
  }
}

module.exports = MessageRouter;
