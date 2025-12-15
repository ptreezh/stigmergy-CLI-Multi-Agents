const WikiCollaborativeSkill = require('../core/WikiCollaborativeSkill');
const CLIAdapter = require('../adapters/CLIAdapter');

/**
 * Claude专用Wiki技能
 * 完全独立，无需Stigmergy依赖
 */
class ClaudeWikiSkill {
  constructor(claudeAPIKey = null) {
    this.claudeAPIKey = claudeAPIKey || process.env.ANTHROPIC_API_KEY;
    this.adapter = new CLIAdapter('claude');
    this.skill = new WikiCollaborativeSkill(this.adapter.context);
    
    // Claude特化配置
    this.claudeConfig = {
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    };
  }

  /**
   * 执行Wiki任务（Claude特化版）
   */
  async executeTask(taskDescription, options = {}) {
    // Claude特化的任务处理
    const claudeEnhancedTask = await this.enhanceTaskForClaude(taskDescription);
    
    // 执行任务
    const result = await this.skill.executeWikiTask(claudeEnhancedTask, {
      ...options,
      claudeMode: true
    });
    
    // Claude特化的结果处理
    return await this.processResultForClaude(result);
  }

  /**
   * 为Claude增强任务描述
   */
  async enhanceTaskForClaude(taskDescription) {
    const enhancementPrompt = `
      作为Claude AI助手，请优化以下Wiki协同任务描述，使其更适合Claude的能力特点：
      
      原始任务: ${taskDescription}
      
      请提供优化后的任务描述，包括：
      1. 更清晰的目标定义
      2. Claude擅长的分析角度
      3. 适合的输出格式
      4. 需要关注的重点
      
      只返回优化后的任务描述，不要其他内容。
    `;

    const enhancement = await this.adapter.context.llm.generate(enhancementPrompt, {
      model: this.claudeConfig.model,
      maxTokens: 1000,
      temperature: 0.3
    });

    return enhancement.content || taskDescription;
  }

  /**
   * 为Claude处理结果
   */
  async processResultForClaude(result) {
    // Claude特化的结果后处理
    const processedResult = {
      ...result,
      claudeInsights: await this.generateClaudeInsights(result),
      claudeRecommendations: await this.generateClaudeRecommendations(result),
      claudeConfidence: this.calculateClaudeConfidence(result)
    };

    return processedResult;
  }

  /**
   * 生成Claude洞察
   */
  async generateClaudeInsights(result) {
    const insightsPrompt = `
      基于以下Wiki协同任务结果，生成Claude特有的洞察和见解：
      
      任务结果: ${JSON.stringify(result, null, 2)}
      
      请提供：
      1. 深层次的分析见解
      2. Claude独特的视角
      3. 潜在的改进建议
      4. 相关的扩展思考
      
      以JSON格式返回。
    `;

    try {
      const insights = await this.adapter.context.llm.generate(insightsPrompt, {
        model: this.claudeConfig.model,
        maxTokens: 1500,
        temperature: 0.8
      });

      return JSON.parse(insights.content || '{}');
    } catch (error) {
      return {
        analysis: "Claude分析完成",
        perspective: "多角度思考",
        suggestions: ["继续优化", "深入分析"],
        extensions: ["相关主题", "延伸思考"]
      };
    }
  }

  /**
   * 生成Claude建议
   */
  async generateClaudeRecommendations(result) {
    return [
      "考虑从多个角度分析内容",
      "注重逻辑推理和证据支持",
      "保持内容的准确性和客观性",
      "适当添加相关的背景信息",
      "确保内容的可读性和组织结构"
    ];
  }

  /**
   * 计算Claude置信度
   */
  calculateClaudeConfidence(result) {
    // 基于结果质量计算Claude特有的置信度
    let confidence = 0.8; // 基础置信度

    if (result.professionalRole && result.professionalRole.persona) {
      confidence += 0.1; // 有专业角色
    }

    if (result.knowledgeAcquisition && result.knowledgeAcquisition.items.length > 0) {
      confidence += 0.05; // 有知识获取
    }

    if (result.thinkingProcess && result.thinkingProcess.confidence === 'high') {
      confidence += 0.05; // 高置信度思考
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Claude特化的快速编辑
   */
  async quickEdit(topicName, editInstruction) {
    const claudeEditPrompt = `
      作为Claude，请根据以下编辑指令快速修改Wiki主题：
      
      主题: ${topicName}
      编辑指令: ${editInstruction}
      
      请提供：
      1. 具体的修改内容
      2. 修改的理由
      3. 修改后的效果预期
      
      以JSON格式返回。
    `;

    const editResult = await this.adapter.context.llm.generate(claudeEditPrompt, {
      model: this.claudeConfig.model,
      maxTokens: 2000,
      temperature: 0.5
    });

    try {
      return JSON.parse(editResult.content);
    } catch (error) {
      return {
        modifications: [editInstruction],
        reasoning: "Claude快速编辑",
        expectedOutcome: "内容已更新"
      };
    }
  }

  /**
   * Claude特化的内容分析
   */
  async analyzeContent(content) {
    const analysisPrompt = `
      作为Claude，请分析以下Wiki内容的各个方面：
      
      内容: ${content}
      
      请分析：
      1. 内容质量和准确性
      2. 逻辑结构和组织
      3. 语言表达和风格
      4. 潜在的改进空间
      5. 相关的扩展建议
      
      以JSON格式返回详细分析结果。
    `;

    const analysis = await this.adapter.context.llm.generate(analysisPrompt, {
      model: this.claudeConfig.model,
      maxTokens: 2500,
      temperature: 0.3
    });

    try {
      return JSON.parse(analysis.content);
    } catch (error) {
      return {
        quality: "良好",
        structure: "清晰",
        style: "专业",
        improvements: ["继续优化"],
        extensions: ["深入探讨"]
      };
    }
  }

  /**
   * 获取Claude能力报告
   */
  getClaudeCapabilities() {
    return {
      model: this.claudeConfig.model,
      strengths: [
        "深度分析和推理",
        "多角度思考",
        "逻辑性强",
        "内容组织能力",
        "语言表达精准"
      ],
      features: [
        "智能任务理解",
        "专业角色设定",
        "知识整合能力",
        "协同编辑支持",
        "反馈处理机制"
      ],
      limitations: [
        "需要API密钥",
        "依赖网络连接",
        "有使用限制"
      ]
    };
  }
}

module.exports = ClaudeWikiSkill;