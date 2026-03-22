#!/usr/bin/env node

/**
 * Skill Feedback Collector
 *
 * 收集Agent使用skill后的真实反馈
 * 用于协同过滤和自主推荐
 *
 * 核心使命：基于真实使用经验的可信skill推荐
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SkillFeedbackCollector {
  constructor(config = {}) {
    this.feedbackDB = new Map(); // 反馈数据库
    this.feedbackFile = path.join(__dirname, '..', '.skill-feedback.json');
    this.loadFeedback();

    // Phase 3: 跨CLI共享存储
    this.enableSharedStorage = config.enableSharedStorage !== false;  // 默认启用
    if (this.enableSharedStorage) {
      try {
        const SharedFeedbackStorageAdapter = require('./shared-feedback-storage-adapter');
        this.sharedStorage = new SharedFeedbackStorageAdapter({
          autoSync: config.autoSync !== false
        });
        console.log('✅ 跨CLI共享存储已启用');
      } catch (error) {
        console.warn('⚠️  跨CLI共享存储初始化失败，使用本地存储:', error.message);
        this.sharedStorage = null;
      }
    }
  }

  /**
   * 记录skill使用反馈
   */
  async recordFeedback(skillName, agentId, feedback) {
    console.log(`\n📝 记录skill使用反馈: ${skillName} by ${agentId}`);

    const record = {
      id: this.generateId(),
      skillName,
      agentId,
      timestamp: new Date().toISOString(),
      feedback: this.validateFeedback(feedback),
      context: this.extractContext(feedback)
    };

    // 验证反馈完整性
    if (!this.isFeedbackComplete(record)) {
      console.log('⚠️  反馈不完整，使用默认值补充');
      this.fillMissingFeedback(record);
    }

    // 保存反馈
    this.feedbackDB.set(record.id, record);
    await this.saveFeedback();

    // Phase 3: 同步到共享存储
    if (this.sharedStorage) {
      try {
        // 转换为共享存储格式
        const sharedRecord = {
          feedbackId: record.id,
          agentId: record.agentId,
          skillName: record.skillName,
          timestamp: record.timestamp,
          feedback: record.feedback,
          context: record.context,
          source: process.env.CLI_NAME || 'unknown'
        };

        await this.sharedStorage.sharedStorage.saveFeedback(sharedRecord);
        console.log('   🔄 已同步到共享存储');
      } catch (error) {
        console.warn('   ⚠️  同步到共享存储失败:', error.message);
      }
    }

    console.log('✅ 反馈记录成功');
    console.log(`   评分: ${record.feedback.rating}/5`);
    console.log(`   效果: ${record.feedback.effectiveness}`);
    console.log(`   领域: ${record.context.domain}`);

    return record;
  }

  /**
   * 验证反馈格式
   */
  validateFeedback(feedback) {
    const validated = {
      rating: this.clampRating(feedback.rating || 3),
      effectiveness: feedback.effectiveness || 'unknown',
      easeOfUse: feedback.easeOfUse || 3,
      reliability: feedback.reliability || 3,
      performance: feedback.performance || 3,
      accuracy: feedback.accuracy || 3,
      wouldRecommend: feedback.wouldRecommend || false,
      useCase: feedback.useCase || 'general',
      domain: feedback.domain || 'general',
      pros: feedback.pros || [],
      cons: feedback.consos || [],
      suggestions: feedback.suggestions || '',
      unexpectedBehavior: feedback.unexpectedBehavior || '',
      securityConcerns: feedback.securityConcerns || ''
    };

    return validated;
  }

  /**
   * 提取上下文信息
   */
  extractContext(feedback) {
    return {
      domain: feedback.domain || 'general',
      useCase: feedback.useCase || 'general',
      environment: feedback.environment || 'development',
      complexity: feedback.complexity || 'medium',
      duration: feedback.duration || 'unknown',
      agentType: feedback.agentType || 'unknown'
    };
  }

  /**
   * 检查反馈完整性
   */
  isFeedbackComplete(record) {
    return (
      record.feedback.rating > 0 &&
      record.feedback.effectiveness !== 'unknown' &&
      record.context.domain !== 'general'
    );
  }

  /**
   * 补充缺失的反馈
   */
  fillMissingFeedback(record) {
    if (record.feedback.effectiveness === 'unknown') {
      record.feedback.effectiveness = this.inferEffectiveness(record);
    }
    if (record.context.domain === 'general') {
      record.context.domain = this.inferDomain(record);
    }
  }

  /**
   * 推断效果
   */
  inferEffectiveness(record) {
    if (record.feedback.rating >= 4) return 'highly_effective';
    if (record.feedback.rating >= 3) return 'moderately_effective';
    return 'ineffective';
  }

  /**
   * 推断领域
   */
  inferDomain(record) {
    const skillName = record.skillName.toLowerCase();

    if (skillName.includes('security') || skillName.includes('audit')) {
      return 'security';
    } else if (skillName.includes('web') || skillName.includes('automation')) {
      return 'web_automation';
    } else if (skillName.includes('data') || skillName.includes('analyze')) {
      return 'data_analysis';
    } else if (skillName.includes('evolve') || skillName.includes('learn')) {
      return 'learning';
    }

    return 'general';
  }

  /**
   * 限制评分范围
   */
  clampRating(rating) {
    return Math.max(1, Math.min(5, Math.round(rating)));
  }

  /**
   * 获取skill的所有反馈
   */
  getSkillFeedback(skillName) {
    return Array.from(this.feedbackDB.values())
      .filter(record => record.skillName === skillName);
  }

  /**
   * 获取agent的所有反馈
   */
  getAgentFeedback(agentId, includeShared = true) {
    // 从本地获取反馈
    const localFeedback = Array.from(this.feedbackDB.values())
      .filter(record => record.agentId === agentId);

    // Phase 3: 如果启用共享存储，合并共享存储的数据
    if (includeShared && this.sharedStorage) {
      try {
        const sharedFeedbacks = this.sharedStorage.sharedStorage;
        const allSharedFeedback = sharedFeedback ? sharedFeedback.getAllFeedbacks() : [];

        if (allSharedFeedback && allSharedFeedback.length > 0) {
          // 转换共享存储格式到本地格式
          const sharedInLocalFormat = allSharedFeedback
            .filter(f => f.agentId === agentId)
            .map(f => ({
              id: f.feedbackId,
              skillName: f.skillName,
              agentId: f.agentId,
              timestamp: f.timestamp,
              feedback: f.feedback,
              context: f.context
            }));

          // 合并本地和共享存储的反馈（去重）
          const localIds = new Set(localFeedback.map(f => f.id));
          const uniqueShared = sharedInLocalFormat.filter(f => !localIds.has(f.id));

          return [...localFeedback, ...uniqueShared];
        }
      } catch (error) {
        console.warn('   ⚠️  从共享存储读取反馈失败:', error.message);
      }
    }

    return localFeedback;
  }

  /**
   * 获取领域相关的反馈
   */
  getDomainFeedback(domain) {
    return Array.from(this.feedbackDB.values())
      .filter(record => record.context.domain === domain);
  }

  /**
   * 计算skill的平均评分
   */
  calculateSkillRating(skillName) {
    const feedbacks = this.getSkillFeedback(skillName);
    if (feedbacks.length === 0) return null;

    const avgRating = feedbacks.reduce((sum, f) => sum + f.feedback.rating, 0) / feedbacks.length;

    return {
      skillName,
      avgRating: Math.round(avgRating * 100) / 100,
      feedbackCount: feedbacks.length,
      distribution: this.calculateDistribution(feedbacks),
      effectiveness: this.calculateEffectivenessRate(feedbacks),
      reliability: this.calculateReliabilityRate(feedbacks)
    };
  }

  /**
   * 计算评分分布
   */
  calculateDistribution(feedbacks) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => {
      distribution[f.feedback.rating]++;
    });
    return distribution;
  }

  /**
   * 计算有效率
   */
  calculateEffectivenessRate(feedbacks) {
    const effective = feedbacks.filter(f =>
      f.feedback.effectiveness === 'highly_effective' ||
      f.feedback.effectiveness === 'moderately_effective'
    ).length;
    return (effective / feedbacks.length * 100).toFixed(1) + '%';
  }

  /**
   * 计算可靠率
   */
  calculateReliabilityRate(feedbacks) {
    const avgReliability = feedbacks.reduce((sum, f) =>
      sum + f.feedback.reliability, 0
    ) / feedbacks.length;
    return (avgReliability / 5 * 100).toFixed(1) + '%';
  }

  /**
   * 生成ID
   */
  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 加载反馈数据
   */
  loadFeedback() {
    try {
      if (fs.existsSync(this.feedbackFile)) {
        const data = fs.readFileSync(this.feedbackFile, 'utf8');
        const records = JSON.parse(data);
        records.forEach(record => {
          this.feedbackDB.set(record.id, record);
        });
        console.log(`✅ 已加载 ${this.feedbackDB.size} 条反馈记录`);
      }
    } catch (error) {
      console.log('ℹ️  反馈文件不存在或为空，将创建新文件');
    }
  }

  /**
   * 保存反馈数据
   */
  async saveFeedback() {
    const records = Array.from(this.feedbackDB.values());
    fs.writeFileSync(this.feedbackFile, JSON.stringify(records, null, 2));
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const records = Array.from(this.feedbackDB.values());

    const bySkill = {};
    const byAgent = {};
    const byDomain = {};

    // 统计本地反馈
    records.forEach(record => {
      // 按skill统计
      if (!bySkill[record.skillName]) {
        bySkill[record.skillName] = 0;
      }
      bySkill[record.skillName]++;

      // 按agent统计
      if (!byAgent[record.agentId]) {
        byAgent[record.agentId] = 0;
      }
      byAgent[record.agentId]++;

      // 按领域统计
      if (!byDomain[record.context.domain]) {
        byDomain[record.context.domain] = 0;
      }
      byDomain[record.context.domain]++;
    });

    // Phase 3: 合并共享存储的统计
    if (this.sharedStorage) {
      try {
        const sharedStats = this.sharedStorage.getSharedStats();

        // 合并skill统计
        Object.keys(sharedStats.bySkill || {}).forEach(skillName => {
          bySkill[skillName] = (bySkill[skillName] || 0) + sharedStats.bySkill[skillName];
        });

        // 合并agent统计
        Object.keys(sharedStats.byAgent || {}).forEach(agentId => {
          byAgent[agentId] = (byAgent[agentId] || 0) + sharedStats.byAgent[agentId];
        });

        // 合并domain统计
        Object.keys(sharedStats.byDomain || {}).forEach(domain => {
          byDomain[domain] = (byDomain[domain] || 0) + sharedStats.byDomain[domain];
        });

      } catch (error) {
        console.warn('   ⚠️  获取共享存储统计失败:', error.message);
      }
    }

    return {
      total: Object.values(bySkill).reduce((a, b) => a + b, 0),
      bySkill,
      byAgent,
      byDomain,
      localTotal: records.length,
      sharedStorageEnabled: !!this.sharedStorage
    };
  }
}

module.exports = SkillFeedbackCollector;