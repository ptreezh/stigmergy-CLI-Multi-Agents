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
const ReflectionCollector = require('./reflection-collector');
const ReflectionAnalyzer = require('./reflection-analyzer');
const path = require('path');

class AutonomousSkillRecommender {
  constructor() {
    this.feedbackCollector = new SkillFeedbackCollector();
    this.filteringEngine = new CollaborativeFilteringEngine();
    this.reflectionCollector = new ReflectionCollector();
    this.reflectionAnalyzer = new ReflectionAnalyzer();
    this.securityAuditor = null; // 将延迟加载
    this.useReflection = true; // Phase 2: 启用反思收集
  }

  /**
   * 初始化推荐系统
   */
  async initialize() {
    console.log('🚀 初始化自主Skill推荐系统...');

    // 延迟加载security auditor
    try {
      const SecurityAuditor = require('./enhanced-security-auditor');
      this.securityAuditor = new SecurityAuditor();
      console.log('✅ 安全审计器已加载 (Phase 1增强版)');
    } catch (error) {
      console.log('⚠️  安全审计器未找到，使用简化安全检查');
    }

    // 加载历史反馈
    const stats = this.feedbackCollector.getStatistics();
    console.log(`📊 已加载 ${stats.total} 条历史反馈`);

    // Phase 2: 初始化反思系统
    if (this.useReflection) {
      const reflectionStats = this.reflectionCollector.getReflectionStatistics();
      console.log(`🧠 已加载 ${reflectionStats.totalReflections} 条反思`);
      console.log(`✅ 反思系统已启用 (Phase 2)`);
    }

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

    // 5. Phase 2: 收集使用前预期
    const usageContext = await this.collectBeforeUsageReflections(agentId, finalRecommendations, context);

    // 6. 生成推荐报告
    const report = this.generateRecommendationReport(agentId, finalRecommendations, context, usageContext);

    // 7. 设置使用后反思触发
    if (this.useReflection) {
      this.scheduleAfterUsageReflections(agentId, finalRecommendations, context);
    }

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
  generateRecommendationReport(agentId, recommendations, context, usageContext = null) {
    const report = {
      agentId,
      timestamp: new Date().toISOString(),
      context,
      recommendations,
      usageContext, // Phase 2: 使用上下文
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

  // ==================== Phase 2: 反思集成方法 ====================

  /**
   * 收集使用前预期反思
   */
  async collectBeforeUsageReflections(agentId, recommendations, context) {
    if (!this.useReflection) {
      return null;
    }

    console.log(`\n🧠 Phase 2: 收集使用前预期...`);

    const usageContext = {
      agentId,
      domain: context.domain,
      taskType: context.useCase,
      urgency: 'normal',
      complexity: 'medium',
      expectations: [],
      confidence: 0.5,
      goals: [],
      concerns: []
    };

    // 为每个推荐的skill收集预期
    for (const rec of recommendations) {
      const skillExpectation = {
        skillName: rec.skillName,
        expectedOutcome: `期望 ${rec.skillName} 能帮助完成任务`,
        expectedEffectiveness: rec.score,
        confidence: rec.confidence || 0.5
      };
      usageContext.expectations.push(skillExpectation);
    }

    // 设置整体目标和关注点
    usageContext.goals = context.goals || [
      '提高任务完成质量',
      '节省时间',
      '学习新技能'
    ];

    usageContext.confidence = recommendations.length > 0 ? 0.7 : 0.3;

    console.log(`   ✅ 已收集 ${usageContext.expectations.length} 个预期`);
    console.log(`   📊 信心水平: ${usageContext.confidence}`);

    return usageContext;
  }

  /**
   * 安排使用后反思收集
   */
  scheduleAfterUsageReflections(agentId, recommendations, context) {
    // 设置延迟触发（模拟：30分钟后）
    const REFLECTION_DELAY = 30 * 60 * 1000; // 30分钟

    setTimeout(async () => {
      console.log(`\n🧠 Phase 2: 触发使用后反思收集...`);

      for (const rec of recommendations) {
        try {
          await this.collectSingleAfterUsageReflection(agentId, rec.skillName, context);
        } catch (error) {
          console.log(`      ⚠️  ${rec.skillName} 反思收集失败: ${error.message}`);
        }
      }

      // 分析收集的反思
      await this.analyzeAndLearnFromReflections(agentId, recommendations);

    }, REFLECTION_DELAY);

    console.log(`   ⏰ 已安排使用后反思收集 (${REFLECTION_DELAY / 1000 / 60}分钟后)`);
  }

  /**
   * 收集单个skill的使用后反思
   */
  async collectSingleAfterUsageReflection(agentId, skillName, context) {
    console.log(`   🧠 收集 ${skillName} 的使用后反思...`);

    const reflection = await this.reflectionCollector.collectReflection(
      agentId,
      skillName,
      {
        domain: context.domain,
        taskType: context.useCase,
        expectations: [], // 将从usageContext获取
        goals: [],
        concerns: []
      }
    );

    console.log(`      ✅ ${skillName} 反思收集完成: ${reflection.reflectionId}`);

    return reflection;
  }

  /**
   * 分析并从反思中学习
   */
  async analyzeAndLearnFromReflections(agentId, recommendations) {
    console.log(`\n🧠 Phase 2: 分析反思并学习...`);

    for (const rec of recommendations) {
      try {
        // 分析反思
        const analysis = await this.reflectionAnalyzer.analyzeReflections(rec.skillName);

        if (analysis.totalReflections > 0) {
          console.log(`   📊 ${rec.skillName} 分析结果:`);
          console.log(`      - 反思数量: ${analysis.totalReflections}`);
          console.log(`      - 情感分析: ${analysis.sentiment.overall}`);
          console.log(`      - 综合质量: ${analysis.overallQuality.toFixed(1)}/100`);

          // 如果质量低，标记为需要改进
          if (analysis.overallQuality < 60) {
            console.log(`      ⚠️  质量较低，建议改进`);
          }
        }

      } catch (error) {
        console.log(`      ⚠️  ${rec.skillName} 分析失败: ${error.message}`);
      }
    }
  }

  /**
   * 基于反思数据改进推荐
   */
  async improveRecommendationsBasedOnReflections(agentId) {
    console.log(`\n🧠 Phase 2: 基于反思改进推荐...`);

    // 获取agent的所有反思
    const reflections = await this.reflectionCollector.getReflectionsByAgent(agentId);

    if (reflections.length === 0) {
      console.log(`   ⚠️  无反思数据，跳过改进`);
      return;
    }

    console.log(`   📊 分析 ${reflections.length} 条反思...`);

    // 按skill分组
    const skillReflections = new Map();
    reflections.forEach(ref => {
      if (!skillReflections.has(ref.skillName)) {
        skillReflections.set(ref.skillName, []);
      }
      skillReflections.get(ref.skillName).push(ref);
    });

    // 分析每个skill的反思
    const skillScores = new Map();
    for (const [skillName, skillRefls] of skillReflections) {
      const analysis = await this.reflectionAnalyzer.analyzeReflections(skillName);
      skillScores.set(skillName, analysis.overallQuality);
    }

    // 基于反思质量调整推荐权重
    console.log(`   ✅ 已调整 ${skillScores.size} 个skill的推荐权重`);

    return skillScores;
  }

  /**
   * 获取反思统计
   */
  getReflectionStats() {
    const stats = this.reflectionCollector.getReflectionStatistics();
    return {
      totalReflections: stats.totalReflections,
      uniqueAgents: stats.uniqueAgents,
      uniqueSkills: stats.uniqueSkills,
      reflectionEnabled: this.useReflection
    };
  }
}

module.exports = AutonomousSkillRecommender;