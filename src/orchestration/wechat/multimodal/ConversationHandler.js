/**
 * ConversationHandler - 对话处理器
 * 处理普通对话，提供智能响应
 */

class ConversationHandler {
  constructor(options = {}) {
    this.options = options;

    // 对话模式
    this.patterns = {
      greeting: [
        /^(hi|hello|嗨|你好|您好)\s*[！!。.]*$/,
        /^(早上好|下午好|晚上好)\s*[！!。.]*$/
      ],
      farewell: [
        /^(bye|goodbye|再见|拜拜)\s*[！!。.]*$/
      ],
      thanks: [
        /^(thank|thanks|谢谢|感谢)\s*[！!。.]*$/
      ],
      question: [
        /^(what|how|why|when|where|who|which|是否|什么|怎么|为什么|何时|何地|谁)/
      ],
      help: [
        /^(help|帮助|帮忙)\s*[！!。.]*$/
      ]
    };

    // 响应模板
    this.responses = {
      greeting: [
        '你好！我是Stigmergy多CLI集成助手，有什么可以帮助您的吗？',
        '您好！我可以帮您执行任务、调用不同的AI CLI工具。请问需要什么帮助？',
        '嗨！我可以协助您完成各种开发任务，请告诉我您需要什么。'
      ],
      farewell: [
        '再见！如有需要随时联系我。',
        '拜拜！祝您工作顺利！',
        '再见！期待下次为您服务。'
      ],
      thanks: [
        '不客气！很高兴能帮助到您。',
        '不用谢！如果还有其他问题，随时告诉我。',
        '我的荣幸！还有什么我可以帮忙的吗？'
      ],
      question: [
        '这是个好问题，让我为您查询一下。',
        '我来帮您分析这个问题。',
        '让我思考一下如何回答这个问题。'
      ],
      help: [
        '我可以帮助您：\n• 执行开发任务\n• 调用不同的AI CLI工具\n• 回答技术问题\n• 分析代码\n• 生成文档\n\n请告诉我您需要什么帮助？',
        '我支持多种功能，包括：\n• 代码编写和分析\n• 任务执行和调度\n• 多CLI协作\n• 技术咨询\n\n请描述您的需求，我会尽力协助。'
      ]
    };
  }

  /**
   * 响应对话
   */
  async respond(text, message) {
    try {
      console.log('Processing conversation:', text);

      // 1. 检测对话意图
      const intent = this.detectIntent(text);

      console.log('Detected intent:', intent);

      // 2. 生成响应
      const response = await this.generateResponse(intent, text, message);

      return {
        success: true,
        message: response,
        intent: intent,
        originalText: text
      };

    } catch (error) {
      console.error('Conversation handling error:', error);
      throw error;
    }
  }

  /**
   * 检测对话意图
   */
  detectIntent(text) {
    const cleaned = text.trim().toLowerCase();

    // 遍历所有模式
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(cleaned)) {
          return intent;
        }
      }
    }

    // 如果没有匹配到特定意图，返回通用对话
    return 'general';
  }

  /**
   * 生成响应
   */
  async generateResponse(intent, text, message) {
    // 如果是特定意图，返回预设响应
    if (intent !== 'general' && this.responses[intent]) {
      const responses = this.responses[intent];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // 通用对话，需要智能生成
    return await this.generateIntelligentResponse(text, message);
  }

  /**
   * 生成智能响应
   */
  async generateIntelligentResponse(text, message) {
    // TODO: 集成实际的AI对话系统
    // 目前返回简单响应

    // 检测是否为技术问题
    if (this.isTechnicalQuestion(text)) {
      return `关于"${text}"，这是一个技术问题。我可以帮您：\n• 调用AI CLI工具进行分析\n• 执行相关任务\n• 查找解决方案\n\n请告诉我您希望我做什么？`;
    }

    // 检测是否为任务请求
    if (this.isTaskRequest(text)) {
      return `我理解您想要${text}。我可以帮您执行这个任务。\n\n请告诉我：\n• 是否有特定的CLI偏好？\n• 是否需要特殊配置？`;
    }

    // 默认响应
    return `我收到了您的消息："${text}"。\n\n我可以帮助您：\n• 执行各种开发任务\n• 调用不同的AI CLI工具\n• 回答技术问题\n\n请告诉我您的具体需求？`;
  }

  /**
   * 检测是否为技术问题
   */
  isTechnicalQuestion(text) {
    const techKeywords = [
      '如何', '怎么', '怎样', 'what', 'how', 'why',
      'bug', '错误', 'error', '问题', 'issue',
      '实现', '开发', '编程', '代码', 'code'
    ];

    return techKeywords.some(kw => text.includes(kw));
  }

  /**
   * 检测是否为任务请求
   */
  isTaskRequest(text) {
    const taskPatterns = [
      /^(?:帮我|请|能否|可以|can you|please)/,
      /(?:写|创建|生成|实现|开发|分析|检查)/
    ];

    return taskPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 添加自定义模式
   */
  addPattern(intent, patterns, responses) {
    if (!this.patterns[intent]) {
      this.patterns[intent] = [];
    }
    this.patterns[intent].push(...patterns);

    if (!this.responses[intent]) {
      this.responses[intent] = [];
    }
    this.responses[intent].push(...responses);
  }

  /**
   * 更新响应模板
   */
  updateResponses(intent, responses) {
    this.responses[intent] = responses;
  }
}

module.exports = ConversationHandler;
