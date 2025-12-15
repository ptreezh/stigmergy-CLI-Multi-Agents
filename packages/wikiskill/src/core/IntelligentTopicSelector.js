const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const WikiPathResolver = require('../utils/WikiPathResolver');

/**
 * 智能主题选择器
 */
class IntelligentTopicSelector {
  constructor() {
    this.selectionHistory = [];
  }

  /**
   * 智能分析任务，选择最佳主题
   * @param {string} taskDescription - 任务描述
   */
  async selectOptimalTopic(taskDescription) {
    try {
      // 1. 分析任务内容
      const taskAnalysis = await this.analyzeTask(taskDescription);
      
      // 2. 查找相关主题
      const topicSearch = await this.searchRelevantTopics(taskAnalysis);
      
      // 3. 评估主题适配度
      const topicEvaluation = await this.evaluateTopicFit(taskAnalysis, topicSearch);
      
      // 4. 决定策略
      const strategy = this.determineStrategy(topicEvaluation);
      
      const result = {
        selectedTopic: topicSearch.primaryTopic,
        confidence: topicSearch.confidence,
        strategy,
        alternatives: topicSearch.alternativeTopics,
        reasoning: topicSearch.reasoning,
        evaluation: topicEvaluation
      };

      // 记录选择历史
      this.selectionHistory.push({
        timestamp: new Date(),
        taskDescription,
        result
      });

      return result;
      
    } catch (error) {
      throw new Error(`主题选择失败: ${error.message}`);
    }
  }

  /**
   * 分析任务内容
   */
  async analyzeTask(taskDescription) {
    // 这里应该使用LLM进行分析，但为了演示，使用简单的关键词提取
    const keywords = this.extractKeywords(taskDescription);
    const domain = this.identifyDomain(keywords);
    const complexity = this.assessComplexity(taskDescription);
    const intent = this.identifyIntent(taskDescription);

    return {
      originalTask: taskDescription,
      keywords,
      domain,
      complexity,
      intent,
      entities: this.extractEntities(taskDescription)
    };
  }

  /**
   * 查找相关主题
   */
  async searchRelevantTopics(taskAnalysis) {
    const wikiPath = await WikiPathResolver.findWikiPath();
    
    if (!wikiPath) {
      // 没有找到Wiki，建议创建新主题
      return {
        primaryTopic: this.generateTopicName(taskAnalysis),
        confidence: 0.9,
        alternativeTopics: [],
        reasoning: '未找到现有Wiki，建议创建新主题',
        isNewWiki: true
      };
    }

    const topicsPath = path.join(wikiPath, 'topics');
    const topicFiles = await fs.readdir(topicsPath);
    const availableTopics = topicFiles
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));

    // 计算相关性评分
    const topicScores = availableTopics.map(topic => ({
      topic,
      score: this.calculateRelevanceScore(topic, taskAnalysis)
    }));

    // 排序并选择最佳主题
    topicScores.sort((a, b) => b.score - a.score);

    const bestMatch = topicScores[0];
    const alternatives = topicScores.slice(1, 3).map(t => t.topic);

    return {
      primaryTopic: bestMatch.topic,
      confidence: bestMatch.score,
      alternativeTopics: alternatives,
      reasoning: `基于关键词匹配和领域相关性选择`,
      availableTopics
    };
  }

  /**
   * 评估主题适配度
   */
  async evaluateTopicFit(taskAnalysis, topicSearch) {
    const evaluation = {
      topicRelevance: topicSearch.confidence,
      contentOverlap: this.calculateContentOverlap(taskAnalysis, topicSearch),
      expertiseMatch: this.evaluateExpertiseMatch(taskAnalysis, topicSearch),
      scalability: this.assessTopicScalability(topicSearch.primaryTopic)
    };

    evaluation.overallScore = this.calculateOverallScore(evaluation);

    return evaluation;
  }

  /**
   * 决定处理策略
   */
  determineStrategy(evaluation) {
    if (evaluation.overallScore > 0.8) {
      return 'direct_edit'; // 直接编辑现有主题
    } else if (evaluation.overallScore > 0.5) {
      return 'enhance_existing'; // 增强现有主题
    } else {
      return 'create_new'; // 创建新主题
    }
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    // 简单的关键词提取逻辑
    const keywords = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 识别领域
   */
  identifyDomain(keywords) {
    const domainMap = {
      '机器学习': ['机器学习', 'ml', 'machine learning', '深度学习', '神经网络'],
      '量子计算': ['量子计算', 'quantum', '量子比特', '纠缠'],
      '人工智能': ['人工智能', 'ai', 'artificial intelligence', '智能'],
      '区块链': ['区块链', 'blockchain', '加密货币', '比特币'],
      '自然语言处理': ['自然语言', 'nlp', 'natural language', '文本处理'],
      '计算机视觉': ['计算机视觉', 'cv', 'computer vision', '图像识别']
    };

    for (const [domain, terms] of Object.entries(domainMap)) {
      if (keywords.some(keyword => 
        terms.some(term => keyword.includes(term) || term.includes(keyword))
      )) {
        return domain;
      }
    }

    return '通用';
  }

  /**
   * 评估复杂度
   */
  assessComplexity(taskDescription) {
    const complexityIndicators = {
      high: ['分析', '设计', '实现', '优化', '架构'],
      medium: ['编辑', '修改', '完善', '整理'],
      low: ['查看', '阅读', '了解']
    };

    const text = taskDescription.toLowerCase();
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return level;
      }
    }

    return 'medium';
  }

  /**
   * 识别意图
   */
  identifyIntent(taskDescription) {
    const intents = {
      'create': ['创建', '新建', '建立', '生成'],
      'edit': ['编辑', '修改', '更新', '完善'],
      'analyze': ['分析', '研究', '评估', '审查'],
      'organize': ['整理', '组织', '归类', '结构化']
    };

    const text = taskDescription.toLowerCase();
    
    for (const [intent, indicators] of Object.entries(intents)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return intent;
      }
    }

    return 'general';
  }

  /**
   * 提取实体
   */
  extractEntities(text) {
    // 简单的实体提取
    const entities = {
      technologies: [],
      concepts: [],
      actions: []
    };

    // 技术词汇
    const techTerms = ['python', 'javascript', 'react', 'vue', 'nodejs', '机器学习', '深度学习'];
    entities.technologies = techTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );

    // 概念词汇
    const conceptTerms = ['算法', '模型', '架构', '设计模式', '性能', '安全'];
    entities.concepts = conceptTerms.filter(term => 
      text.includes(term)
    );

    return entities;
  }

  /**
   * 计算相关性评分
   */
  calculateRelevanceScore(topic, taskAnalysis) {
    let score = 0;
    const topicLower = topic.toLowerCase();

    // 关键词匹配
    taskAnalysis.keywords.forEach(keyword => {
      if (topicLower.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    });

    // 领域匹配
    if (topicLower.includes(taskAnalysis.domain.toLowerCase())) {
      score += 0.4;
    }

    // 实体匹配
    taskAnalysis.entities.technologies.forEach(tech => {
      if (topicLower.includes(tech.toLowerCase())) {
        score += 0.2;
      }
    });

    // 长度匹配（相似长度通常更相关）
    const lengthDiff = Math.abs(topic.length - taskAnalysis.originalTask.length);
    const lengthScore = Math.max(0, 1 - lengthDiff / 50);
    score += lengthScore * 0.1;

    return Math.min(1, score);
  }

  /**
   * 计算内容重叠度
   */
  calculateContentOverlap(taskAnalysis, topicSearch) {
    // 简化的重叠度计算
    const overlapScore = topicSearch.confidence * 0.8;
    return Math.max(0, Math.min(1, overlapScore));
  }

  /**
   * 评估专业知识匹配
   */
  evaluateExpertiseMatch(taskAnalysis, topicSearch) {
    // 基于领域和复杂度评估
    let matchScore = 0.5; // 基础分数

    if (taskAnalysis.domain !== '通用') {
      matchScore += 0.3;
    }

    if (taskAnalysis.complexity === 'high') {
      matchScore += 0.2;
    }

    return Math.min(1, matchScore);
  }

  /**
   * 评估主题可扩展性
   */
  assessTopicScalability(topicName) {
    // 基于主题名称评估可扩展性
    const scalableIndicators = ['guide', 'tutorial', 'reference', 'overview'];
    const topicLower = topicName.toLowerCase();

    const hasScalableIndicator = scalableIndicators.some(indicator =>
      topicLower.includes(indicator)
    );

    return hasScalableIndicator ? 0.8 : 0.6;
  }

  /**
   * 计算总体评分
   */
  calculateOverallScore(evaluation) {
    const weights = {
      topicRelevance: 0.4,
      contentOverlap: 0.3,
      expertiseMatch: 0.2,
      scalability: 0.1
    };

    let totalScore = 0;
    for (const [factor, weight] of Object.entries(weights)) {
      totalScore += (evaluation[factor] || 0) * weight;
    }

    return Math.round(totalScore * 100) / 100;
  }

  /**
   * 生成主题名称
   */
  generateTopicName(taskAnalysis) {
    const baseName = taskAnalysis.domain === '通用' ? 'general' : taskAnalysis.domain;
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${baseName}-${timestamp}`;
  }

  /**
   * 获取选择历史
   */
  getSelectionHistory() {
    return this.selectionHistory;
  }

  /**
   * 清除选择历史
   */
  clearHistory() {
    this.selectionHistory = [];
  }
}

module.exports = IntelligentTopicSelector;