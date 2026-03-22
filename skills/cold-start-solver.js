#!/usr/bin/env node

/**
 * Cold Start Solver - 冷启动问题解决方案
 *
 * Phase 3 协同过滤改进 - 处理新agent的skill推荐
 *
 * 验证等级: Level 1 - 代码实现完成
 *
 * 核心功能：
 * - 基于内容的推荐（skill特征匹配）
 * - 利用反思数据（即使无评分）
 * - 渐进式相似度计算
 * - 混合策略（多方法组合）
 *
 * ⚠️ 重要声明：
 * - 本实现为Level 1基本验证
 * - 使用模拟数据进行功能测试
 * - 未在真实生产环境验证
 * - 需要Phase 3完成Level 2+真实环境测试
 */

const path = require('path');
const fs = require('fs');

class ColdStartSolver {
  constructor(config = {}) {
    this.feedbackCollector = null; // 将延迟加载
    this.reflectionCollector = null; // 将延迟加载

    // 策略权重
    this.strategyWeights = {
      contentBased: config.contentBasedWeight || 0.4,    // 基于内容 40%
      popularityBased: config.popularityBasedWeight || 0.3, // 热门度 30%
      reflectionBased: config.reflectionBasedWeight || 0.2, // 反思数据 20%
      random: config.randomWeight || 0.1                  // 随机探索 10%
    };

    // 冷启动阈值
    this.coldStartThreshold = config.coldStartThreshold || 3; // 少于3条反馈视为冷启动

    console.log('❄️  冷启动解决器初始化');
    console.log(`   策略权重: 内容=${this.strategyWeights.contentBased}, ` +
                `热门=${this.strategyWeights.popularityBased}, ` +
                `反思=${this.strategyWeights.reflectionBased}, ` +
                `随机=${this.strategyWeights.random}`);
  }

  /**
   * 初始化依赖
   */
  initialize() {
    try {
      const SkillFeedbackCollector = require('./skill-feedback-collector');
      this.feedbackCollector = new SkillFeedbackCollector({
        enableSharedStorage: true
      });
    } catch (error) {
      console.warn('⚠️  反馈收集器加载失败');
    }

    try {
      const ReflectionCollector = require('./reflection-collector');
      this.reflectionCollector = new ReflectionCollector();
    } catch (error) {
      console.warn('⚠️  反思收集器加载失败');
    }
  }

  /**
   * 判断是否为冷启动agent
   */
  isColdStart(agentId) {
    if (!this.feedbackCollector) {
      this.initialize();
    }

    const feedbacks = this.feedbackCollector.getAgentFeedback(agentId);
    return feedbacks.length < this.coldStartThreshold;
  }

  /**
   * 为主入口：解决冷启动推荐
   */
  async solveColdStart(agentId, context = {}) {
    console.log(`\n❄️  处理冷启动: ${agentId}`);
    console.log(`   上下文:`, JSON.stringify(context, null, 2));

    const recommendations = [];

    // 策略1: 基于内容的推荐
    const contentBased = await this.contentBasedRecommendation(context);
    console.log(`   📄 基于内容: ${contentBased.length} 个推荐`);
    recommendations.push(...contentBased);

    // 策略2: 基于热门度的推荐
    const popularityBased = await this.popularityBasedRecommendation(context);
    console.log(`   🔥 基于热门: ${popularityBased.length} 个推荐`);
    recommendations.push(...popularityBased);

    // 策略3: 基于反思数据的推荐
    const reflectionBased = await this.reflectionBasedRecommendation(context);
    console.log(`   🧠 基于反思: ${reflectionBased.length} 个推荐`);
    recommendations.push(...reflectionBased);

    // 策略4: 随机探索
    const randomBased = await this.randomExploration(context);
    console.log(`   🎲 随机探索: ${randomBased.length} 个推荐`);
    recommendations.push(...randomBased);

    // 聚合和去重
    const aggregated = this.aggregateRecommendations(recommendations);

    // 排序和限制
    const final = this.rankAndLimit(aggregated);

    console.log(`   ✅ 最终推荐: ${final.length} 个skills`);

    return final;
  }

  /**
   * 策略1: 基于内容的推荐
   */
  async contentBasedRecommendation(context) {
    const recommendations = [];

    // 获取所有可用的skills
    const availableSkills = await this.getAvailableSkills();

    for (const skill of availableSkills) {
      const score = this.calculateContentScore(skill, context);
      if (score > 0.05) {  // 降低阈值，允许更多推荐
        recommendations.push({
          skillName: skill.name,
          score: score * this.strategyWeights.contentBased,
          strategy: 'content_based',
          reasons: this.generateContentReasons(skill, context)
        });
      }
    }

    return recommendations;
  }

  /**
   * 计算内容匹配分数
   */
  calculateContentScore(skill, context) {
    let score = 0;
    let factors = 0;

    // 1. 领域匹配
    if (skill.domain && context.domain) {
      if (skill.domain === context.domain) {
        score += 0.4;
        factors++;
      } else if (this.isRelatedDomain(skill.domain, context.domain)) {
        score += 0.2;
        factors++;
      }
    }

    // 2. 任务类型匹配
    if (skill.taskTypes && context.useCase) {
      if (skill.taskTypes.includes(context.useCase)) {
        score += 0.3;
        factors++;
      }
    }

    // 3. 描述关键词匹配
    if (context.keywords && context.keywords.length > 0) {
      const skillText = `${skill.name} ${skill.description || ''}`.toLowerCase();
      const keywordMatches = context.keywords.filter(keyword =>
        skillText.includes(keyword.toLowerCase())
      ).length;
      if (keywordMatches > 0) {
        score += Math.min(keywordMatches * 0.15, 0.3);
        factors++;
      }
    }

    // 4. 复杂度匹配
    if (skill.complexity && context.complexity) {
      if (skill.complexity === context.complexity) {
        score += 0.2;
        factors++;
      } else if (this.isCompatibleComplexity(skill.complexity, context.complexity)) {
        score += 0.1;
        factors++;
      }
    }

    // 如果没有任何因素匹配，给予基础分
    if (factors === 0) {
      return 0.1; // 基础分，确保所有skills都有机会
    }

    return score / factors;
  }

  /**
   * 判断是否为相关领域
   */
  isRelatedDomain(domain1, domain2) {
    const relatedDomains = {
      'security': ['development', 'testing', 'devops'],
      'development': ['security', 'testing', 'documentation'],
      'automation': ['testing', 'development', 'devops'],
      'analysis': ['documentation', 'reporting', 'visualization'],
      'documentation': ['analysis', 'development', 'testing']
    };

    return (relatedDomains[domain1] || []).includes(domain2);
  }

  /**
   * 判断复杂度是否兼容
   */
  isCompatibleComplexity(complexity1, complexity2) {
    const levels = ['low', 'medium', 'high'];
    const idx1 = levels.indexOf(complexity1);
    const idx2 = levels.indexOf(complexity2);

    // 相差不超过1级
    return Math.abs(idx1 - idx2) <= 1;
  }

  /**
   * 生成内容推荐理由
   */
  generateContentReasons(skill, context) {
    const reasons = [];

    if (skill.domain === context.domain) {
      reasons.push(`领域匹配: ${skill.domain}`);
    }

    if (skill.taskTypes && skill.taskTypes.includes(context.useCase)) {
      reasons.push(`适用于${context.useCase}`);
    }

    if (skill.complexity === context.complexity) {
      reasons.push(`复杂度匹配: ${skill.complexity}`);
    }

    return reasons;
  }

  /**
   * 策略2: 基于热门度的推荐
   */
  async popularityBasedRecommendation(context) {
    if (!this.feedbackCollector) {
      this.initialize();
    }

    const recommendations = [];
    const stats = this.feedbackCollector.getStatistics();

    // 按反馈数量排序
    const sortedSkills = Object.entries(stats.bySkill)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);  // 取前10个

    for (const [skillName, count] of sortedSkills) {
      // 计算热门分数
      const rating = this.feedbackCollector.calculateSkillRating(skillName);
      if (!rating) continue;

      const popularityScore = (count / 10) * 0.5 + (rating.avgRating / 5) * 0.5;

      // 检查领域匹配
      const skillFeedbacks = this.feedbackCollector.getSkillFeedback(skillName);
      const domainMatch = skillFeedbacks.some(f => f.context.domain === context.domain);

      const finalScore = domainMatch ? popularityScore : popularityScore * 0.7;

      recommendations.push({
        skillName,
        score: finalScore * this.strategyWeights.popularityBased,
        strategy: 'popularity_based',
        reasons: [
          `热门skill (${count}条反馈)`,
          `平均评分: ${rating.avgRating.toFixed(1)}/5`,
          domainMatch ? `领域匹配: ${context.domain}` : `跨领域推荐`
        ]
      });
    }

    return recommendations;
  }

  /**
   * 策略3: 基于反思数据的推荐
   */
  async reflectionBasedRecommendation(context) {
    if (!this.reflectionCollector) {
      this.initialize();
    }

    const recommendations = [];
    const stats = this.reflectionCollector.getReflectionStatistics();

    if (stats.totalReflections === 0) {
      // 没有反思数据，返回空
      return recommendations;
    }

    // 获取所有有反思的skills
    const allSkills = await this.getSkillsWithReflections();

    for (const skillName of allSkills) {
      const analysis = await this.analyzeSkillReflections(skillName);

      // 计算反思质量分数
      const reflectionScore = this.calculateReflectionScore(analysis, context);

      if (reflectionScore > 0.3) {
        recommendations.push({
          skillName,
          score: reflectionScore * this.strategyWeights.reflectionBased,
          strategy: 'reflection_based',
          reasons: this.generateReflectionReasons(analysis)
        });
      }
    }

    return recommendations;
  }

  /**
   * 获取有反思的skills
   */
  async getSkillsWithReflections() {
    // 简化实现：从反馈中提取
    if (!this.feedbackCollector) {
      this.initialize();
    }

    const stats = this.feedbackCollector.getStatistics();
    return Object.keys(stats.bySkill);
  }

  /**
   * 分析skill的反思
   */
  async analyzeSkillReflections(skillName) {
    if (!this.reflectionCollector) {
      return null;
    }

    try {
      const ReflectionAnalyzer = require('./reflection-analyzer');
      const analyzer = new ReflectionAnalyzer();
      return await analyzer.analyzeReflections(skillName);
    } catch (error) {
      return null;
    }
  }

  /**
   * 计算反思分数
   */
  calculateReflectionScore(analysis, context) {
    if (!analysis || analysis.totalReflections === 0) {
      return 0;
    }

    let score = 0;

    // 1. 综合质量
    score += (analysis.overallQuality / 100) * 0.4;

    // 2. 情感分析
    if (analysis.sentiment.overall === 'POSITIVE') {
      score += 0.3;
    } else if (analysis.sentiment.overall === 'NEUTRAL') {
      score += 0.1;
    }

    // 3. 成功因素数量
    const successFactors = analysis.successFactors.filter(f => f.significance === 'HIGH').length;
    score += Math.min(successFactors * 0.1, 0.3);

    return Math.min(score, 1);
  }

  /**
   * 生成反思推荐理由
   */
  generateReflectionReasons(analysis) {
    const reasons = [];

    if (analysis.overallQuality > 70) {
      reasons.push(`综合质量高: ${analysis.overallQuality.toFixed(0)}/100`);
    }

    if (analysis.sentiment.overall === 'POSITIVE') {
      reasons.push('用户反馈正面');
    }

    const topSuccessFactor = analysis.successFactors[0];
    if (topSuccessFactor && topSuccessFactor.significance === 'HIGH') {
      reasons.push(`成功因素: ${topSuccessFactor.factor}`);
    }

    return reasons;
  }

  /**
   * 策略4: 随机探索
   */
  async randomExploration(context) {
    const recommendations = [];

    // 获取所有可用的skills
    const availableSkills = await this.getAvailableSkills();

    // 随机选择一些skills进行探索
    const explorationCount = Math.min(5, availableSkills.length);
    const shuffled = availableSkills.sort(() => Math.random() - 0.5).slice(0, explorationCount);

    for (const skill of shuffled) {
      recommendations.push({
        skillName: skill.name,
        score: this.strategyWeights.random,  // 固定分数
        strategy: 'random_exploration',
        reasons: ['探索性推荐', '发现新技能']
      });
    }

    return recommendations;
  }

  /**
   * 获取所有可用的skills
   */
  async getAvailableSkills() {
    // 简化实现：从已知的skill列表
    const knownSkills = [
      { name: 'dev-browser', domain: 'automation', taskTypes: ['testing', 'automation'], complexity: 'medium' },
      { name: 'mathematical-statistics', domain: 'analysis', taskTypes: ['analysis', 'statistics'], complexity: 'high' },
      { name: 'scientific-writing-zh', domain: 'documentation', taskTypes: ['writing', 'documentation'], complexity: 'medium' },
      { name: 'literature-search-zh', domain: 'analysis', taskTypes: ['search', 'research'], complexity: 'medium' },
      { name: 'validity-reliability', domain: 'analysis', taskTypes: ['analysis', 'testing'], complexity: 'high' },
      { name: 'field-analysis', domain: 'analysis', taskTypes: ['analysis', 'research'], complexity: 'high' },
      { name: 'grounded-theory-expert', domain: 'analysis', taskTypes: ['analysis', 'research'], complexity: 'high' },
      { name: 'network-computation', domain: 'analysis', taskTypes: ['analysis', 'computation'], complexity: 'high' },
      { name: 'test-skill', domain: 'general', taskTypes: ['testing'], complexity: 'low' },
      { name: 'soul-reflection', domain: 'learning', taskTypes: ['reflection', 'learning'], complexity: 'medium' },
      { name: 'soul-evolution', domain: 'learning', taskTypes: ['learning', 'evolution'], complexity: 'high' },
      { name: 'two-agent-loop', domain: 'learning', taskTypes: ['learning', 'development'], complexity: 'medium' }
    ];

    return knownSkills;
  }

  /**
   * 聚合推荐
   */
  aggregateRecommendations(recommendations) {
    const aggregated = new Map();

    for (const rec of recommendations) {
      const key = rec.skillName;

      if (!aggregated.has(key)) {
        aggregated.set(key, {
          skillName: rec.skillName,
          totalScore: 0,
          strategies: [],
          reasons: [],
          count: 0
        });
      }

      const aggregatedRec = aggregated.get(key);
      aggregatedRec.totalScore += rec.score;
      aggregatedRec.strategies.push(rec.strategy);
      aggregatedRec.reasons.push(...rec.reasons);
      aggregatedRec.count++;
    }

    // 计算平均分数
    for (const [key, rec] of aggregated) {
      rec.avgScore = rec.totalScore / rec.count;
      rec.uniqueStrategies = [...new Set(rec.strategies)];
    }

    return Array.from(aggregated.values());
  }

  /**
   * 排序和限制
   */
  rankAndLimit(aggregated) {
    // 按平均分数排序
    aggregated.sort((a, b) => b.avgScore - a.avgScore);

    // 限制数量
    const limited = aggregated.slice(0, 10);

    // 生成最终推荐格式
    return limited.map((rec, index) => ({
      rank: index + 1,
      skillName: rec.skillName,
      score: rec.avgScore,
      strategies: rec.uniqueStrategies,
      reasoning: rec.reasons.slice(0, 3).join('; '),
      confidence: this.calculateColdStartConfidence(rec)
    }));
  }

  /**
   * 计算冷启动置信度
   */
  calculateColdStartConfidence(rec) {
    // 基于推荐策略数量
    const strategyBonus = Math.min(rec.strategies.length * 0.1, 0.3);

    // 基于分数
    const scoreBonus = rec.avgScore * 0.5;

    return Math.min(1, strategyBonus + scoreBonus + 0.2);
  }

  /**
   * 渐进式学习：随着反馈增加，逐步转向协同过滤
   */
  getProgressiveStrategy(agentId) {
    if (!this.feedbackCollector) {
      this.initialize();
    }

    let feedbackCount = 0;

    try {
      const feedbacks = this.feedbackCollector.getAgentFeedback(agentId);
      feedbackCount = feedbacks.length;
    } catch (error) {
      console.warn('获取反馈数量失败，假设为0');
      feedbackCount = 0;
    }

    // 根据反馈数量调整策略
    if (feedbackCount === 0) {
      // 完全冷启动：主要依赖内容和热门
      return {
        contentBased: 0.5,
        popularityBased: 0.3,
        reflectionBased: 0.1,
        random: 0.1,
        collaborative: 0.0
      };
    } else if (feedbackCount < 3) {
      // 轻微冷启动：开始引入协同过滤
      return {
        contentBased: 0.4,
        popularityBased: 0.2,
        reflectionBased: 0.2,
        random: 0.1,
        collaborative: 0.1
      };
    } else if (feedbackCount < 5) {
      // 过渡期：增加协同过滤权重
      return {
        contentBased: 0.3,
        popularityBased: 0.2,
        reflectionBased: 0.2,
        random: 0.05,
        collaborative: 0.25
      };
    } else {
      // 正常期：主要使用协同过滤
      return {
        contentBased: 0.2,
        popularityBased: 0.1,
        reflectionBased: 0.2,
        random: 0.0,
        collaborative: 0.5
      };
    }
  }

  /**
   * 生成冷启动报告
   */
  generateColdStartReport(agentId, recommendations) {
    return {
      agentId,
      timestamp: new Date().toISOString(),
      isColdStart: this.isColdStart(agentId),
      strategy: this.getProgressiveStrategy(agentId),
      recommendations: recommendations,
      summary: {
        total: recommendations.length,
        avgScore: recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length,
        avgConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
      },
      nextSteps: [
        '使用推荐的skills并反馈',
        '随着使用增加，推荐会更精准',
        '可以探索不同领域的skills'
      ]
    };
  }
}

module.exports = ColdStartSolver;
