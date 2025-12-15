const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const CLIToolIntegrator = require('../integrators/CLIToolIntegrator');
const IntelligentTopicSelector = require('./IntelligentTopicSelector');
const MultiTopicWikiManager = require('./MultiTopicWikiManager');
const FeedbackProcessor = require('./FeedbackProcessor');

/**
 * Wiki协同技能核心类
 */
class WikiCollaborativeSkill extends CLIToolIntegrator {
  constructor(cliContext) {
    super(cliContext);
    this.topicSelector = new IntelligentTopicSelector();
    this.wikiManager = new MultiTopicWikiManager(cliContext);
    this.feedbackProcessor = new FeedbackProcessor(cliContext);
  }

  /**
   * 执行Wiki协同任务
   * @param {string} taskDescription - 任务描述
   * @param {Object} options - 选项
   */
  async executeWikiTask(taskDescription, options = {}) {
    try {
      this.cliContext.logger.info('开始执行Wiki协同任务');
      
      // 1. 理解任务
      const taskUnderstanding = await this.understandTask(taskDescription);
      this.cliContext.logger.debug('任务理解完成:', taskUnderstanding.coreObjectives);
      
      // 2. 智能选择主题
      const topicSelection = await this.topicSelector.selectOptimalTopic(taskDescription);
      this.cliContext.logger.info(`选择主题: ${topicSelection.selectedTopic} (置信度: ${topicSelection.confidence})`);
      
      // 3. 处理策略
      let result;
      switch (topicSelection.strategy) {
        case 'create_new':
          result = await this.createNewTopic(taskDescription, taskUnderstanding);
          break;
        case 'direct_edit':
        case 'enhance_existing':
          result = await this.editExistingTopic(topicSelection.selectedTopic, taskUnderstanding, options);
          break;
        default:
          throw new Error(`未知的处理策略: ${topicSelection.strategy}`);
      }
      
      // 4. 启动反馈监控（如果需要）
      if (options.enableFeedbackLoop) {
        await this.startFeedbackLoop(result);
      }
      
      this.cliContext.logger.success('Wiki协同任务完成');
      return result;
      
    } catch (error) {
      this.cliContext.logger.error('Wiki协同任务执行失败:', error.message);
      throw error;
    }
  }

  /**
   * 理解任务
   */
  async understandTask(taskDescription) {
    const understandingPrompt = `
      分析以下Wiki协同任务：
      任务描述：${taskDescription}
      
      请提供JSON格式的分析结果：
      {
        "coreObjectives": ["主要目标1", "主要目标2"],
        "domain": "专业领域",
        "requiredSkills": ["技能1", "技能2"],
        "expectedOutputs": ["输出1", "输出2"],
        "complexity": "simple|medium|complex",
        "urgency": "low|medium|high"
      }
    `;
    
    const understanding = await this.llmInference(understandingPrompt, {
      temperature: 0.3,
      maxTokens: 1000
    });
    
    try {
      const parsed = JSON.parse(understanding.content);
      return {
        originalTask: taskDescription,
        ...parsed
      };
    } catch (error) {
      this.cliContext.logger.warn('任务理解解析失败，使用默认值');
      return {
        originalTask: taskDescription,
        coreObjectives: [taskDescription],
        domain: 'general',
        requiredSkills: ['editing'],
        expectedOutputs: ['wiki_content'],
        complexity: 'medium',
        urgency: 'medium'
      };
    }
  }

  /**
   * 创建新主题
   */
  async createNewTopic(taskDescription, taskUnderstanding) {
    // 生成主题名称
    const topicName = await this.generateTopicName(taskUnderstanding);
    this.cliContext.logger.info(`创建新主题: ${topicName}`);
    
    // 设置专业角色
    const professionalRole = await this.establishProfessionalRole(
      taskUnderstanding,
      { isNewTopic: true }
    );
    
    // 获取知识
    const knowledgeAcquisition = await this.acquireKnowledge(
      professionalRole,
      { topicName, isNewTopic: true }
    );
    
    // 深度思考
    const thinkingProcess = await this.deepThinking(
      professionalRole,
      knowledgeAcquisition,
      { topicName, isNewTopic: true }
    );
    
    // 生成初始内容
    const initialContent = await this.generateInitialContent(
      thinkingProcess,
      topicName
    );
    
    // 创建主题
    const createResult = await this.wikiManager.createTopic(topicName, {
      content: initialContent,
      role: professionalRole,
      knowledge: knowledgeAcquisition,
      thinking: thinkingProcess
    });
    
    return {
      action: 'created',
      topicName,
      professionalRole,
      knowledgeAcquisition,
      thinkingProcess,
      initialContent,
      createResult
    };
  }

  /**
   * 编辑现有主题
   */
  async editExistingTopic(topicName, taskUnderstanding, options) {
    this.cliContext.logger.info(`编辑现有主题: ${topicName}`);
    
    // 获取主题信息
    const topicInfo = await this.wikiManager.getTopicInfo(topicName);
    
    // 设置专业角色
    const professionalRole = await this.establishProfessionalRole(
      taskUnderstanding,
      topicInfo
    );
    
    // 获取知识
    const knowledgeAcquisition = await this.acquireKnowledge(
      professionalRole,
      topicInfo
    );
    
    // 深度思考
    const thinkingProcess = await this.deepThinking(
      professionalRole,
      knowledgeAcquisition,
      topicInfo
    );
    
    // 生成编辑提案
    const editProposal = await this.generateEditProposal(
      thinkingProcess,
      topicInfo
    );
    
    // 提交编辑
    const editResult = await this.wikiManager.editTopic(topicName, editProposal);
    
    return {
      action: 'edited',
      topicName,
      topicInfo,
      professionalRole,
      knowledgeAcquisition,
      thinkingProcess,
      editProposal,
      editResult
    };
  }

  /**
   * 生成主题名称
   */
  async generateTopicName(taskUnderstanding) {
    const namingPrompt = `
      基于以下信息生成合适的Wiki主题名称：
      
      领域: ${taskUnderstanding.domain}
      目标: ${taskUnderstanding.coreObjectives.join(', ')}
      
      要求：
      1. 使用英文
      2. 简洁明了
      3. 使用kebab-case格式
      4. 避免特殊字符
      
      只返回主题名称，不要其他内容。
    `;
    
    const result = await this.llmInference(namingPrompt, {
      temperature: 0.3,
      maxTokens: 50
    });
    
    return result.content.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  /**
   * 建立专业角色
   */
  async establishProfessionalRole(taskUnderstanding, context) {
    const rolePrompt = `
      基于以下信息建立专业角色：
      
      任务理解：${JSON.stringify(taskUnderstanding, null, 2)}
      上下文：${JSON.stringify(context, null, 2)}
      
      请提供JSON格式的角色定义：
      {
        "persona": {
          "name": "角色名称",
          "title": "专业头衔",
          "background": "背景描述"
        },
        "expertise": ["专业领域1", "专业领域2"],
        "perspective": "分析视角",
        "communicationStyle": "沟通风格",
        "biases": ["可能的偏见1", "可能的偏见2"]
      }
    `;
    
    const roleDesign = await this.llmInference(rolePrompt, {
      temperature: 0.5,
      maxTokens: 1000
    });
    
    try {
      return JSON.parse(roleDesign.content);
    } catch (error) {
      this.cliContext.logger.warn('角色解析失败，使用默认角色');
      return {
        persona: {
          name: 'Expert Editor',
          title: 'Professional Wiki Editor',
          background: 'Experienced in collaborative editing and knowledge management'
        },
        expertise: [taskUnderstanding.domain],
        perspective: 'professional',
        communicationStyle: 'formal',
        biases: []
      };
    }
  }

  /**
   * 获取知识
   */
  async acquireKnowledge(professionalRole, context) {
    const searchQueries = this.generateSearchQueries(professionalRole, context);
    
    const acquiredKnowledge = [];
    
    for (const query of searchQueries.slice(0, 3)) { // 限制搜索数量
      try {
        // 搜索相关知识
        const searchResults = await this.enhancedSearch(query, {
          maxResults: 5
        });
        
        // 使用LLM整合知识
        const integrationPrompt = `
          作为${professionalRole.persona.name}，整合以下搜索结果：
          
          查询: ${query}
          结果: ${JSON.stringify(searchResults.slice(0, 3), null, 2)}
          
          请提供：
          1. 核心知识点（3-5个）
          2. 关键数据和证据
          3. 可靠性评估（high/medium/low）
          4. 与目标的关联性
        `;
        
        const integratedKnowledge = await this.llmInference(integrationPrompt);
        
        acquiredKnowledge.push({
          query,
          searchResults,
          integratedKnowledge: integratedKnowledge.content,
          reliability: this.assessReliability(integratedKnowledge.content)
        });
        
      } catch (error) {
        this.cliContext.logger.warn(`知识获取失败 - ${query}:`, error.message);
      }
    }
    
    return {
      items: acquiredKnowledge,
      knowledgeGraph: this.buildKnowledgeGraph(acquiredKnowledge),
      gaps: this.identifyKnowledgeGaps(acquiredKnowledge)
    };
  }

  /**
   * 深度思考
   */
  async deepThinking(professionalRole, knowledgeAcquisition, context) {
    const thinkingPrompt = `
      作为${professionalRole.persona.name}，基于以下信息进行深度思考：
      
      专业角色：${JSON.stringify(professionalRole, null, 2)}
      获取的知识：${JSON.stringify(knowledgeAcquisition.items.map(k => k.integratedKnowledge), null, 2)}
      上下文：${JSON.stringify(context, null, 2)}
      
      请提供：
      1. 多角度分析（技术、实践、理论等）
      2. 识别的知识空白和改进机会
      3. 专业观点和建议
      4. 具体的编辑方向
    `;
    
    const thinkingResult = await this.llmInference(thinkingPrompt, {
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return {
      process: thinkingResult.content,
      analysis: this.extractAnalysis(thinkingResult.content),
      viewpoints: this.extractViewpoints(thinkingResult.content),
      recommendations: this.extractRecommendations(thinkingResult.content),
      confidence: this.assessThinkingConfidence(thinkingResult.content)
    };
  }

  /**
   * 生成编辑提案
   */
  async generateEditProposal(thinkingProcess, topicInfo) {
    const proposalPrompt = `
      基于深度思考结果，生成Wiki词条编辑提案：
      
      思考结果：${JSON.stringify(thinkingProcess, null, 2)}
      主题信息：${JSON.stringify(topicInfo, null, 2)}
      
      请提供详细的编辑提案：
      1. 具体的编辑内容
      2. 编辑理由和依据
      3. 预期的改进效果
      4. 参考资料和证据
    `;
    
    const proposal = await this.llmInference(proposalPrompt, {
      temperature: 0.4,
      maxTokens: 2000
    });
    
    return {
      content: proposal.content,
      actions: this.extractEditActions(proposal.content),
      rationale: this.extractRationale(proposal.content),
      expectedImpact: this.extractExpectedImpact(proposal.content),
      references: this.extractReferences(proposal.content)
    };
  }

  /**
   * 生成初始内容
   */
  async generateInitialContent(thinkingProcess, topicName) {
    const contentPrompt = `
      基于深度思考结果，为新主题"${topicName}"生成初始内容：
      
      思考结果：${JSON.stringify(thinkingProcess, null, 2)}
      
      请生成完整的Wiki词条内容，包括：
      1. 标题和简介
      2. 主要内容章节
      3. 关键概念解释
      4. 参考资料
    `;
    
    const content = await this.llmInference(contentPrompt, {
      temperature: 0.5,
      maxTokens: 2500
    });
    
    return content.content;
  }

  /**
   * 启动反馈监控
   */
  async startFeedbackLoop(result) {
    if (result.action === 'created') {
      // 新创建的主题，监控后续反馈
      await this.feedbackProcessor.monitorTopic(result.topicName);
    } else if (result.action === 'edited') {
      // 编辑的主题，处理现有反馈
      await this.feedbackProcessor.processExistingFeedback(result.topicName);
    }
  }

  // 辅助方法
  generateSearchQueries(professionalRole, context) {
    const baseQueries = [
      `${professionalRole.expertise[0]} best practices`,
      `${context.topicName || context.domain} recent developments`,
      `${professionalRole.expertise[0]} challenges and solutions`
    ];
    
    return baseQueries;
  }

  assessReliability(content) {
    // 简单的可靠性评估逻辑
    if (content.includes('research') || content.includes('study') || content.includes('data')) {
      return 'high';
    } else if (content.includes('generally') || content.includes('typically')) {
      return 'medium';
    }
    return 'low';
  }

  buildKnowledgeGraph(knowledgeItems) {
    // 构建简单的知识图谱
    const graph = {
      nodes: [],
      edges: []
    };
    
    knowledgeItems.forEach((item, index) => {
      graph.nodes.push({
        id: `node_${index}`,
        label: item.query,
        type: 'knowledge'
      });
    });
    
    return graph;
  }

  identifyKnowledgeGaps(knowledgeItems) {
    // 识别知识空白
    const gaps = [];
    
    if (knowledgeItems.length < 3) {
      gaps.push('需要更多相关资料');
    }
    
    const hasReliableData = knowledgeItems.some(item => item.reliability === 'high');
    if (!hasReliableData) {
      gaps.push('缺乏高可靠性数据源');
    }
    
    return gaps;
  }

  extractAnalysis(content) {
    // 从思考内容中提取分析部分
    const analysisMatch = content.match(/分析[:：](.*?)(?=\n|$)/s);
    return analysisMatch ? analysisMatch[1].trim() : '';
  }

  extractViewpoints(content) {
    // 提取观点
    const viewpointMatches = content.match(/观点[:：](.*?)(?=\n|$)/gs);
    return viewpointMatches || [];
  }

  extractRecommendations(content) {
    // 提取建议
    const recommendationMatches = content.match(/建议[:：](.*?)(?=\n|$)/gs);
    return recommendationMatches || [];
  }

  assessThinkingConfidence(content) {
    // 评估思考置信度
    const confidenceIndicators = ['明确', '确定', '肯定', '无疑'];
    const uncertaintyIndicators = ['可能', '或许', '大概', '可能'];
    
    const confidenceCount = confidenceIndicators.reduce((count, indicator) => 
      count + (content.split(indicator).length - 1), 0);
    const uncertaintyCount = uncertaintyIndicators.reduce((count, indicator) => 
      count + (content.split(indicator).length - 1), 0);
    
    if (confidenceCount > uncertaintyCount) {
      return 'high';
    } else if (confidenceCount === uncertaintyCount) {
      return 'medium';
    }
    return 'low';
  }

  extractEditActions(content) {
    // 提取编辑操作
    const actionMatches = content.match(/编辑[:：](.*?)(?=\n|$)/s);
    return actionMatches ? actionMatches[1].trim().split('\n').filter(line => line.trim()) : [];
  }

  extractRationale(content) {
    // 提取理由
    const rationaleMatch = content.match(/理由[:：](.*?)(?=\n|$)/s);
    return rationaleMatch ? rationaleMatch[1].trim() : '';
  }

  extractExpectedImpact(content) {
    // 提取预期影响
    const impactMatch = content.match(/影响[:：](.*?)(?=\n|$)/s);
    return impactMatch ? impactMatch[1].trim() : '';
  }

  extractReferences(content) {
    // 提取参考资料
    const referenceMatches = content.match(/参考[:：](.*?)(?=\n|$)/s);
    return referenceMatches ? referenceMatches[1].trim().split('\n').filter(line => line.trim()) : [];
  }
}

module.exports = WikiCollaborativeSkill;