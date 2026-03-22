#!/usr/bin/env node

/**
 * Autonomous Skill Recommender
 *
 * 整合反馈收集、协同过滤和安全核验的自主推荐系统
 *
 * 核心使命：可信的skill自主推荐
 */

const SkillFeedbackCollector = require('./skill-feedback-collector');
const CollaborativeFilteringEngine = require('./skill-collaborative-filtering');
const path = require('path');

class AutonomousSkillRecommender {
  constructor() {
    this.feedbackCollector = new SkillFeedbackCollector();
    this.filteringEngine = new CollaborativeFilteringEngine();
    this.securityAuditor = null; // 将延迟加载
  }

  /**
   * 初始化推荐系统
   */
  async initialize() {
    console.log('🚀 初始化自主Skill推荐系统...');

    // 延迟加载security auditor
    try {
      const SecurityAuditor = require('./soul-security-auditor');
      this.securityAuditor = new SecurityAuditor();
      console.log('✅ 安全审计器已加载');
    } catch (error) {
      console.log('⚠️  安全审计器未找到，使用简化安全检查');
    }

    // 加载历史反馈
    const stats = this.feedbackCollector.getStatistics();
    console.log(`📊 已加载 ${stats.total} 条历史反馈`);

    return true;
  }

  /**
   * 为Agent推荐skills（主入口）
   */
  async recommend(agentId, options = {}) {
    console.log(`\n🎯 为Agent ${agentId} 生成自主推荐`);

    await this.initialize();

    const context = {
      domain: options.domain || 'general',
      useCase: options.useCase || 'general',
      minRating: options.minRating || 4.0,
      maxResults: options.maxResults || 10
    };

    // 1. 基于协同过滤推荐
    const recommendations = await this.filteringEngine.recommendSkills(agentId, context);

    // 2. 如果没有足够推荐，尝试跨领域推荐
    if (recommendations.length < 5 && context.domain !== 'general') {
      console.log('   🌐 尝试跨领域推荐...');
      const crossDomainRecs = await this.filteringEngine.getCrossDomainRecommendations(
        agentId,
        'general',
        context.domain
      );
      recommendations.push(...crossDomainRecs);
    }

    // 3. 安全核验
    const safeRecommendations = await this.performSecurityAudit(recommendations);

    // 4. 生成最终推荐列表
    const finalRecommendations = this.generateFinalRecommendations(
      safeRecommendations,
      context
    );

    // 5. 生成推荐报告
    const report = this.generateRecommendationReport(agentId, finalRecommendations, context);

    return report;
  }

  /**
   * 执行安全审计
   */
  async performSecurityAudit(recommendations) {
    console.log(`   🔒 安全核验 ${recommendations.length} 个skills...`);

    const safeRecommendations = [];

    for (const rec of recommendations) {
      let isSafe = true;
      let securityScore = 0;
      let securityDetails = {};

      if (this.securityAuditor) {
        try {
          // 使用完整的安全审计
          const auditResult = await this.securityAuditor.auditSkill(rec.skillName);
          securityScore = auditResult.securityScore;
          securityDetails = auditResult.details;

          // 🔴 Phase 1 安全强化：提高安全阈值到90分
          // 原阈值：60分（40%不安全风险）
          // 新阈值：90分（10%不安全风险）
          const SECURITY_THRESHOLD = 90;
          isSafe = securityScore >= SECURITY_THRESHOLD;

          console.log(`      📊 ${rec.skillName} 安全评分: ${securityScore}/100 (阈值: ${SECURITY_THRESHOLD})`);
        } catch (error) {
          console.log(`      ⚠️  ${rec.skillName} 审计失败: ${error.message}`);
          // 使用简化安全检查
          isSafe = await this.simplifiedSecurityCheck(rec.skillName);
        }
      } else {
        // 简化安全检查
        isSafe = await this.simplifiedSecurityCheck(rec.skillName);
      }

      if (isSafe) {
        safeRecommendations.push({
          ...rec,
          securityScore,
          securityDetails,
          safe: true
        });
        console.log(`      ✅ ${rec.skillName} 安全核验通过 (评分: ${securityScore})`);
      } else {
        console.log(`      ❌ ${rec.skillName} 安全核验未通过 (评分: ${securityScore} < 90)`);
      }
    }

    return safeRecommendations;
  }

  /**
   * 简化安全检查
   */
  async simplifiedSecurityCheck(skillName) {
    // 基于历史反馈的安全检查
    const feedbacks = this.feedbackCollector.getSkillFeedback(skillName);

    if (feedbacks.length === 0) {
      // 无历史反馈，保守策略：不推荐
      return false;
    }

    // 检查是否有安全问题报告
    const hasSecurityIssues = feedbacks.some(f =>
      f.feedback.securityConcerns && f.feedback.securityConcerns.length > 0
    );

    if (hasSecurityIssues) {
      console.log(`      ❌ ${skillName} 存在安全问题报告`);
      return false;
    }

    // 检查平均可靠性评分
    const avgReliability = feedbacks.reduce((sum, f) =>
      sum + f.feedback.reliability, 0
    ) / feedbacks.length;

    // 🔴 Phase 1 安全强化：提高可靠性阈值
    // 原阈值：3.0/5.0 (60%)
    // 新阈值：4.5/5.0 (90%)
    const RELIABILITY_THRESHOLD = 4.5;
    const passesThreshold = avgReliability >= RELIABILITY_THRESHOLD;

    console.log(`      📊 ${skillName} 可靠性评分: ${avgReliability.toFixed(2)}/5.00 (阈值: ${RELIABILITY_THRESHOLD})`);

    return passesThreshold;
  }

  /**
   * 生成最终推荐列表
   */
  generateFinalRecommendations(recommendations, context) {
    // 去重
    const seen = new Set();
    const unique = [];

    for (const rec of recommendations) {
      if (!seen.has(rec.skillName)) {
        seen.add(rec.skillName);
        unique.push(rec);
      }
    }

    // 按分数排序
    unique.sort((a, b) => b.score - a.score);

    // 限制数量
    return unique.slice(0, context.maxResults);
  }

  /**
   * 生成推荐报告
   */
  generateRecommendationReport(agentId, recommendations, context) {
    const report = {
      agentId,
      timestamp: new Date().toISOString(),
      context,
      recommendations,
      summary: this.generateSummary(recommendations),
      nextSteps: this.generateNextSteps(recommendations),
      confidence: this.calculateOverallConfidence(recommendations)
    };

    return report;
  }

  /**
   * 生成总结
   */
  generateSummary(recommendations) {
    if (recommendations.length === 0) {
      return {
        total: 0,
        message: '暂无推荐，建议探索更多skills',
        domains: [],
        avgScore: 0
      };
    }

    const domains = new Set();
    let totalScore = 0;

    recommendations.forEach(rec => {
      if (rec.domain) domains.add(rec.domain);
      totalScore += rec.score;
    });

    return {
      total: recommendations.length,
      message: `找到${recommendations.length}个推荐skills`,
      domains: Array.from(domains),
      avgScore: (totalScore / recommendations.length).toFixed(2),
      topRecommendation: recommendations[0]
    };
  }

  /**
   * 生成下一步建议
   */
  generateNextSteps(recommendations) {
    const steps = [];

    if (recommendations.length > 0) {
      steps.push({
        action: 'try_top_recommendation',
        priority: 'high',
        description: `尝试使用推荐排名第1的skill: ${recommendations[0].skillName}`
      });

      steps.push({
        action: 'provide_feedback',
        priority: 'high',
        description: '使用后提供反馈，帮助改进推荐系统'
      });
    }

    if (recommendations.length < 5) {
      steps.push({
        action: 'explore_more_skills',
        priority: 'medium',
        description: '探索更多skills以获得更精准的推荐'
      });
    }

    steps.push({
      action: 'check_security',
      priority: 'high',
      description: '所有推荐skills已通过安全核验'
    });

    return steps;
  }

  /**
   * 计算整体置信度
   */
  calculateOverallConfidence(recommendations) {
    if (recommendations.length === 0) return 0;

    const avgConfidence = recommendations.reduce((sum, rec) =>
      sum + (rec.confidence || 0.5), 0
    ) / recommendations.length;

    const supportBonus = Math.min(1, recommendations.length / 10);

    return Math.min(1, (avgConfidence * 0.7 + supportBonus * 0.3));
  }

  /**
   * 记录使用反馈（便捷方法）
   */
  async recordUsage(skillName, agentId, feedback) {
    console.log(`\n📝 记录 ${skillName} 的使用反馈...`);

    const record = await this.feedbackCollector.recordFeedback(skillName, agentId, feedback);

    console.log('✅ 反馈已记录，将用于优化未来推荐');

    return record;
  }

  /**
   * 获取推荐统计
   */
  getRecommendationStats() {
    const feedbackStats = this.feedbackCollector.getStatistics();

    return {
      feedbackStats,
      systemHealth: {
        totalFeedback: feedbackStats.total,
        skillsRated: Object.keys(feedbackStats.bySkill).length,
        agentsParticipated: Object.keys(feedbackStats.byAgent).length,
        domainsCovered: Object.keys(feedbackStats.byDomain).length
      },
      recommendations: {
        available: Object.keys(feedbackStats.bySkill).length,
        avgQuality: this.calculateAverageQuality(feedbackStats),
        coverage: this.calculateCoverage(feedbackStats)
      }
    };
  }

  /**
   * 计算平均质量
   */
  calculateAverageQuality(stats) {
    let totalRating = 0;
    let count = 0;

    for (const skillName of Object.keys(stats.bySkill)) {
      const rating = this.feedbackCollector.calculateSkillRating(skillName);
      if (rating) {
        totalRating += rating.avgRating;
        count++;
      }
    }

    return count > 0 ? (totalRating / count).toFixed(2) : 'N/A';
  }

  /**
   * 计算覆盖率
   */
  calculateCoverage(stats) {
    const domainCount = Object.keys(stats.byDomain).length;
    return {
      domains: domainCount,
      skills: Object.keys(stats.bySkill).length,
      estimatedCoverage: Math.min(1, domainCount / 10) // 假设10个主要领域
    };
  }
}

module.exports = AutonomousSkillRecommender;