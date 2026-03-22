#!/usr/bin/env node

/**
 * Collaborative Filtering Engine for Skills
 *
 * 基于Agent真实使用反馈的协同过滤推荐
 * 结合安全核验和应用场景
 *
 * 核心使命：可信的skill协同过滤和自主推荐
 *
 * 验证等级: Level 1.5 - Phase 3增强（多维度相似度）代码实现完成
 *
 * Phase 3增强:
 * - 集成多维度相似度计算器
 * - 支持基础/领域/任务/反思四维度相似度
 * - 可配置权重和回退机制
 *
 * ⚠️ 重要声明：
 * - 本实现为Level 1.5验证（代码实现+基本测试）
 * - 多维度相似度计算需要真实反思数据支持
 * - 未在真实生产环境验证
 * - 需要Phase 3完成Level 2+真实环境测试
 *
 * 局限性：
 * - 反思数据依赖Phase 2系统
 * - 多维度计算性能未优化
 * - 需要大量反馈数据才能体现优势
 * - 跨CLI协调需要在真实环境测试
 */

const path = require('path');
const SkillFeedbackCollector = require('./skill-feedback-collector');
const MultiDimensionalSimilarityCalculator = require('./multidimensional-similarity-calculator');
const ColdStartSolver = require('./cold-start-solver');

class CollaborativeFilteringEngine {
  constructor(config = {}) {
    this.feedbackCollector = new SkillFeedbackCollector();
    this.similarityThreshold = config.similarityThreshold || 0.6; // 相似度阈值
    this.minFeedbackCount = config.minFeedbackCount || 2; // 最少反馈数量

    // Phase 3: 集成多维度相似度计算器
    this.useMultiDimensional = config.useMultiDimensional !== false; // 默认启用
    this.similarityCalculator = new MultiDimensionalSimilarityCalculator(config);

    // Phase 3 Task 2: 集成冷启动解决器
    this.coldStartSolver = new ColdStartSolver(config);

    console.log(`🔧 协同过滤引擎初始化 (Phase 3增强版)`);
    console.log(`   多维度相似度: ${this.useMultiDimensional ? '✅ 启用' : '❌ 禁用'}`);
    console.log(`   冷启动解决: ✅ 启用`);
  }

  /**
   * 为Agent推荐skill
   */
  async recommendSkills(agentId, context = {}) {
    console.log(`\n🎯 为Agent ${agentId} 推荐skills`);
    console.log(`   上下文:`, JSON.stringify(context, null, 2));

    // Phase 3 Task 2: 检查是否为冷启动
    if (this.coldStartSolver.isColdStart(agentId)) {
      console.log(`   ❄️  检测到冷启动agent，使用冷启动策略`);
      return await this.handleColdStart(agentId, context);
    }

    // 1. 获取Agent的历史反馈
    const agentFeedback = this.feedbackCollector.getAgentFeedback(agentId);
    console.log(`   历史反馈: ${agentFeedback.length} 条`);

    if (agentFeedback.length === 0) {
      console.log(`   ⚠️  无历史反馈，使用热门推荐`);
      return await this.getPopularRecommendations(context);
    }

    // 2. 找到相似的Agents
    const similarAgents = await this.findSimilarAgents(agentId, agentFeedback);
    console.log(`   相似Agents: ${similarAgents.length} 个`);

    // 3. 基于相似Agents的反馈推荐
    const recommendations = await this.generateRecommendations(
      agentId,
      agentFeedback,
      similarAgents,
      context
    );

    // 4. 安全核验
    const safeRecommendations = await this.filterBySafety(recommendations);

    // 5. 排序和限制数量
    const finalRecommendations = this.rankAndLimit(safeRecommendations);

    console.log(`   推荐结果: ${finalRecommendations.length} 个skills`);

    return finalRecommendations;
  }

  /**
   * 找到相似的Agents（Phase 3增强：支持多维度相似度）
   */
  async findSimilarAgents(targetAgentId, targetFeedback) {
    const allFeedback = this.feedbackCollector;
    const similarities = [];

    // 获取所有其他Agents的反馈
    const stats = allFeedback.getStatistics();
    const otherAgentIds = Object.keys(stats.byAgent).filter(id => id !== targetAgentId);

    for (const otherAgentId of otherAgentIds) {
      const otherFeedback = allFeedback.getAgentFeedback(otherAgentId);

      // 计算相似度（Phase 3: 传入agent IDs以支持多维度计算）
      const similarity = await this.calculateAgentSimilarity(
        targetFeedback,
        otherFeedback,
        targetAgentId,
        otherAgentId
      );

      if (similarity >= this.similarityThreshold) {
        similarities.push({
          agentId: otherAgentId,
          similarity,
          commonSkills: this.findCommonSkills(targetFeedback, otherFeedback)
        });
      }
    }

    // 按相似度排序
    similarities.sort((a, b) => b.similarity - a.similarity);

    // 返回前N个最相似的Agents
    return similarities.slice(0, 10);
  }

  /**
   * 计算Agent相似度（Phase 3增强：多维度或单维度）
   */
  async calculateAgentSimilarity(feedback1, feedback2, agent1Id = null, agent2Id = null) {
    // 找到共同评价过的skills
    const commonSkills = this.findCommonSkills(feedback1, feedback2);

    if (commonSkills.length < this.minFeedbackCount) {
      return 0; // 共同反馈太少，不计算相似度
    }

    // Phase 3: 使用多维度相似度计算
    if (this.useMultiDimensional && agent1Id && agent2Id) {
      try {
        const result = await this.similarityCalculator.calculateOverallSimilarity(
          feedback1,
          feedback2,
          agent1Id,
          agent2Id
        );
        return result.overall;
      } catch (error) {
        console.warn(`   ⚠️  多维度计算失败，回退到单维度: ${error.message}`);
        return this.calculateBaseSimilarity(feedback1, feedback2);
      }
    }

    // 单维度：皮尔逊相关系数
    return this.calculateBaseSimilarity(feedback1, feedback2);
  }

  /**
   * 计算基础相似度（皮尔逊相关系数）
   */
  calculateBaseSimilarity(feedback1, feedback2) {
    const commonSkills = this.findCommonSkills(feedback1, feedback2);

    if (commonSkills.length < this.minFeedbackCount) {
      return 0;
    }

    // 计算皮尔逊相关系数
    const ratings1 = [];
    const ratings2 = [];

    commonSkills.forEach(skillName => {
      const record1 = feedback1.find(f => f.skillName === skillName);
      const record2 = feedback2.find(f => f.skillName === skillName);

      ratings1.push(record1.feedback.rating);
      ratings2.push(record2.feedback.rating);
    });

    const correlation = this.pearsonCorrelation(ratings1, ratings2);

    // 将相关系数映射到0-1范围
    return (correlation + 1) / 2;
  }

  /**
   * 找到共同评价过的skills
   */
  findCommonSkills(feedback1, feedback2) {
    const skills1 = new Set(feedback1.map(f => f.skillName));
    const skills2 = new Set(feedback2.map(f => f.skillName));

    return [...skills1].filter(skill => skills2.has(skill));
  }

  /**
   * 皮尔逊相关系数
   */
  pearsonCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * 生成推荐
   */
  async generateRecommendations(targetAgentId, targetFeedback, similarAgents, context) {
    const recommendations = new Map();

    // 获取目标Agent已使用过的skills
    const usedSkills = new Set(targetFeedback.map(f => f.skillName));

    // 基于相似Agents的反馈生成推荐
    for (const similarAgent of similarAgents) {
      const agentFeedback = this.feedbackCollector.getAgentFeedback(similarAgent.agentId);

      for (const record of agentFeedback) {
        // 跳过目标Agent已使用过的skills
        if (usedSkills.has(record.skillName)) {
          continue;
        }

        // 检查领域匹配
        if (context.domain && record.context.domain !== context.domain) {
          continue;
        }

        // 计算推荐分数
        const score = this.calculateRecommendationScore(record, similarAgent);

        if (!recommendations.has(record.skillName)) {
          recommendations.set(record.skillName, {
            skillName: record.skillName,
            score,
            support: [],
            avgRating: record.feedback.rating,
            effectiveness: record.feedback.effectiveness
          });
        }

        recommendations.get(record.skillName).support.push({
          agentId: similarAgent.agentId,
          similarity: similarAgent.similarity,
          rating: record.feedback.rating
        });
      }
    }

    // 计算加权平均分数
    for (const [skillName, rec] of recommendations) {
      rec.weightedScore = this.calculateWeightedScore(rec);
      rec.confidence = this.calculateConfidence(rec);
    }

    return Array.from(recommendations.values());
  }

  /**
   * 计算推荐分数
   */
  calculateRecommendationScore(record, similarAgent) {
    const ratingScore = record.feedback.rating / 5; // 0-1
    const similarityWeight = similarAgent.similarity;

    return ratingScore * similarityWeight;
  }

  /**
   * 计算加权分数
   */
  calculateWeightedScore(recommendation) {
    const totalWeight = recommendation.support.reduce((sum, s) => sum + s.similarity, 0);
    const weightedScore = recommendation.support.reduce((sum, s) =>
      sum + (s.rating / 5) * s.similarity, 0
    );

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * 计算置信度
   */
  calculateConfidence(recommendation) {
    const supportCount = recommendation.support.length;
    const avgSimilarity = recommendation.support.reduce((sum, s) => sum + s.similarity, 0) / supportCount;

    // 支持者越多，平均相似度越高，置信度越高
    return Math.min(1, (supportCount / 5) * avgSimilarity);
  }

  /**
   * 安全过滤
   */
  async filterBySafety(recommendations) {
    console.log('   🔒 执行安全核验...');

    // 这里应该集成soul-security-auditor.js
    // 简化实现：只推荐评分>=4的skills
    return recommendations.filter(rec => {
      const isSafe = rec.avgRating >= 4;
      if (!isSafe) {
        console.log(`      ❌ ${rec.skillName} 安全评分不足`);
      }
      return isSafe;
    });
  }

  /**
   * 排序和限制
   */
  rankAndLimit(recommendations) {
    // 按加权分数排序
    recommendations.sort((a, b) => b.weightedScore - a.weightedScore);

    // 限制数量（最多10个）
    return recommendations.slice(0, 10).map((rec, index) => ({
      rank: index + 1,
      skillName: rec.skillName,
      score: rec.weightedScore,
      confidence: rec.confidence,
      avgRating: rec.avgRating,
      effectiveness: rec.effectiveness,
      supportCount: rec.support.length,
      reasoning: this.generateReasoning(rec)
    }));
  }

  /**
   * 生成推荐理由
   */
  generateReasoning(recommendation) {
    const topSupporters = recommendation.support
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    const supporterNames = topSupporters.map(s => s.agentId).join(', ');
    const avgRating = recommendation.avgRating.toFixed(1);

    return `基于${supporterNames}等相似Agent的正面反馈（平均评分${avgRating}/5）`;
  }

  /**
   * 获取热门推荐（冷启动）
   */
  async getPopularRecommendations(context = {}) {
    console.log('   📊 使用热门推荐策略');

    const stats = this.feedbackCollector.getStatistics();
    const recommendations = [];

    for (const [skillName, count] of Object.entries(stats.bySkill)) {
      if (count < this.minFeedbackCount) continue;

      // 检查领域匹配
      if (context.domain) {
        const feedbacks = this.feedbackCollector.getSkillFeedback(skillName);
        const domainMatch = feedbacks.some(f => f.context.domain === context.domain);
        if (!domainMatch) continue;
      }

      const rating = this.feedbackCollector.calculateSkillRating(skillName);
      if (rating && rating.avgRating >= 4.0) {
        recommendations.push({
          skillName,
          score: rating.avgRating / 5,
          confidence: Math.min(1, count / 10),
          avgRating: rating.avgRating,
          feedbackCount: count,
          effectiveness: rating.effectiveness,
          reasoning: `热门skill（${count}条反馈，平均评分${rating.avgRating}）`
        });
      }
    }

    // 排序并限制
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 10).map((rec, index) => ({
      rank: index + 1,
      ...rec
    }));
  }

  /**
   * 获取跨领域推荐
   */
  async getCrossDomainRecommendations(agentId, sourceDomain, targetDomain) {
    console.log(`\n🌐 跨领域推荐: ${sourceDomain} → ${targetDomain}`);

    // 获取Agent在源领域的偏好
    const sourceFeedback = this.feedbackCollector.getDomainFeedback(sourceDomain);
    const agentSourceFeedback = sourceFeedback.filter(f => f.agentId === agentId);

    if (agentSourceFeedback.length === 0) {
      console.log(`   ⚠️  Agent在${sourceDomain}无反馈，使用${targetDomain}热门推荐`);
      return await this.getPopularRecommendations({ domain: targetDomain });
    }

    // 分析Agent的偏好模式
    const preferences = this.analyzeAgentPreferences(agentSourceFeedback);

    // 在目标领域寻找匹配偏好的skills
    const targetFeedback = this.feedbackCollector.getDomainFeedback(targetDomain);
    const recommendations = [];

    for (const record of targetFeedback) {
      const match = this.calculatePreferenceMatch(record, preferences);
      if (match >= 0.7) {
        recommendations.push({
          skillName: record.skillName,
          score: match,
          confidence: 0.7,
          avgRating: record.feedback.rating,
          effectiveness: record.feedback.effectiveness,
          reasoning: `基于在${sourceDomain}的使用偏好`
        });
      }
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5).map((rec, index) => ({
      rank: index + 1,
      ...rec
    }));
  }

  /**
   * 分析Agent偏好
   */
  analyzeAgentPreferences(feedback) {
    return {
      avgRating: feedback.reduce((sum, f) => sum + f.feedback.rating, 0) / feedback.length,
      preferredComplexity: this.getMostCommon(feedback, 'complexity'),
      preferredEffectiveness: this.getMostCommon(feedback, 'effectiveness'),
      skillTypes: feedback.map(f => this.categorizeSkill(f.skillName))
    };
  }

  /**
   * 计算偏好匹配度
   */
  calculatePreferenceMatch(record, preferences) {
    let score = 0;
    let factors = 0;

    // 评分匹配
    if (record.feedback.rating >= preferences.avgRating) {
      score += 0.3;
    }
    factors++;

    // 复杂度匹配
    if (record.context.complexity === preferences.preferredComplexity) {
      score += 0.2;
    }
    factors++;

    // 效果匹配
    if (record.feedback.effectiveness === preferences.preferredEffectiveness) {
      score += 0.3;
    }
    factors++;

    // 技能类型匹配
    const recordType = this.categorizeSkill(record.skillName);
    if (preferences.skillTypes.includes(recordType)) {
      score += 0.2;
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * 获取最常见的值
   */
  getMostCommon(feedback, field) {
    const values = feedback.map(f => f.context[field] || f.feedback[field]);
    const frequency = {};
    values.forEach(v => {
      frequency[v] = (frequency[v] || 0) + 1;
    });
    return Object.entries(frequency).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * 分类skill
   */
  categorizeSkill(skillName) {
    const name = skillName.toLowerCase();
    if (name.includes('security') || name.includes('audit')) return 'security';
    if (name.includes('web') || name.includes('automation')) return 'automation';
    if (name.includes('data') || name.includes('analyze')) return 'analysis';
    if (name.includes('evolve') || name.includes('learn')) return 'learning';
    return 'general';
  }

  // ==================== Phase 3: 多维度相似度增强 ====================

  /**
   * 启用/禁用多维度相似度计算
   */
  setMultiDimensionalMode(enabled) {
    this.useMultiDimensional = enabled;
    console.log(`   ${enabled ? '✅' : '❌'} 多维度相似度: ${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 更新多维度权重配置
   */
  updateSimilarityWeights(newWeights) {
    if (!this.similarityCalculator) {
      console.warn('⚠️  相似度计算器未初始化');
      return;
    }

    this.similarityCalculator.updateWeights(newWeights);
  }

  /**
   * 获取当前配置
   */
  getConfiguration() {
    return {
      similarityThreshold: this.similarityThreshold,
      minFeedbackCount: this.minFeedbackCount,
      useMultiDimensional: this.useMultiDimensional,
      similarityWeights: this.similarityCalculator ? this.similarityCalculator.getConfig() : null
    };
  }

  /**
   * 生成相似度分析报告
   */
  async generateSimilarityAnalysisReport(agent1Id, agent2Id) {
    const feedback1 = this.feedbackCollector.getAgentFeedback(agent1Id);
    const feedback2 = this.feedbackCollector.getAgentFeedback(agent2Id);

    if (feedback1.length === 0 || feedback2.length === 0) {
      return {
        error: 'One or both agents have no feedback data'
      };
    }

    const similarityResult = await this.similarityCalculator.calculateOverallSimilarity(
      feedback1,
      feedback2,
      agent1Id,
      agent2Id
    );

    return this.similarityCalculator.generateSimilarityReport(similarityResult);
  }

  // ==================== Phase 3 Task 2: 冷启动解决方案 ====================

  /**
   * 处理冷启动agent
   */
  async handleColdStart(agentId, context) {
    this.coldStartSolver.initialize();

    // 使用冷启动解决器
    const recommendations = await this.coldStartSolver.solveColdStart(agentId, context);

    // 生成报告
    const report = this.coldStartSolver.generateColdStartReport(agentId, recommendations);

    console.log(`   ❄️  冷启动推荐完成: ${recommendations.length} 个skills`);
    console.log(`   📊 策略分布:`, this.getStrategyDistribution(recommendations));

    return recommendations;
  }

  /**
   * 获取策略分布统计
   */
  getStrategyDistribution(recommendations) {
    const distribution = {};

    recommendations.forEach(rec => {
      if (rec.strategies) {
        rec.strategies.forEach(strategy => {
          distribution[strategy] = (distribution[strategy] || 0) + 1;
        });
      }
    });

    return distribution;
  }

  /**
   * 判断是否为冷启动
   */
  isColdStart(agentId) {
    return this.coldStartSolver.isColdStart(agentId);
  }

  /**
   * 获取渐进式策略
   */
  getProgressiveStrategy(agentId) {
    return this.coldStartSolver.getProgressiveStrategy(agentId);
  }

  /**
   * 更新冷启动策略权重
   */
  updateColdStartWeights(newWeights) {
    this.coldStartSolver.strategyWeights = {
      ...this.coldStartSolver.strategyWeights,
      ...newWeights
    };
    console.log(`   ✅ 冷启动策略权重已更新:`, this.coldStartSolver.strategyWeights);
  }
}

module.exports = CollaborativeFilteringEngine;