#!/usr/bin/env node

/**
 * Community Verification - 社区验证机制
 *
 * Phase 1 安全强化 - 基于多CLI使用反馈的验证系统
 *
 * 核心功能：
 * - 收集所有CLI的使用反馈
 * - 验证反馈一致性
 * - 检测异常报告
 * - 计算信任度
 */

const fs = require('fs');
const path = require('path');

class CommunityVerification {
  constructor() {
    this.feedbackStore = new Map(); // 反馈存储
    this.verificationCache = new Map(); // 验证缓存
    this.cliRegistry = new Set(); // CLI注册表
  }

  /**
   * 初始化社区验证系统
   */
  async initialize() {
    console.log('🌐 初始化社区验证系统...');

    // 1. 加载已知CLI
    await this.loadCLIs();

    // 2. 加载历史反馈
    await this.loadHistoricalFeedbacks();

    // 3. 建立CLI网络
    await this.buildCLINetwork();

    console.log(`✅ 已加载 ${this.cliRegistry.size} 个CLI`);
    console.log(`✅ 已加载 ${this.feedbackStore.size} 条反馈`);
  }

  /**
   * 验证skill安全性
   */
  async verifySkill(skillName) {
    console.log(`\n🌐 社区验证: ${skillName}`);

    // 1. 收集多CLI反馈
    const cliFeedbacks = await this.collectCLIFeedbacks(skillName);
    console.log(`   收集到 ${cliFeedbacks.length} 个CLI的反馈`);

    if (cliFeedbacks.length === 0) {
      return {
        skillName,
        verified: false,
        trustScore: 0,
        reason: '无历史反馈'
      };
    }

    // 2. 验证反馈一致性
    const consistency = await this.checkConsistency(cliFeedbacks);
    console.log(`   反馈一致性: ${(consistency.score * 100).toFixed(1)}%`);

    // 3. 检测异常报告
    const anomalyReports = await this.detectAnomalies(cliFeedbacks);
    console.log(`   异常报告: ${anomalyReports.count} 个`);

    // 4. 计算信任度
    const trustScore = await this.calculateTrustScore({
      cliFeedbacks,
      consistency,
      anomalyReports
    });
    console.log(`   信任度: ${trustScore.toFixed(1)}/100`);

    // 5. 判断是否验证通过
    const verified = trustScore >= 90;
    console.log(`   验证结果: ${verified ? '✅ 通过' : '❌ 未通过'}`);

    const verificationResult = {
      skillName,
      verified,
      trustScore,
      details: {
        cliFeedbacks,
        consistency,
        anomalyReports
      },
      timestamp: new Date().toISOString()
    };

    // 缓存验证结果
    this.verificationCache.set(skillName, verificationResult);

    return verificationResult;
  }

  /**
   * 收集CLI反馈
   */
  async collectCLIFeedbacks(skillName) {
    const feedbacks = [];

    // 遍历所有已知CLI
    for (const cli of this.cliRegistry) {
      try {
        const cliFeedback = await this.collectSingleCLIFeedback(skillName, cli);
        if (cliFeedback) {
          feedbacks.push(cliFeedback);
        }
      } catch (error) {
        console.log(`      ⚠️  ${cli} 反馈收集失败: ${error.message}`);
      }
    }

    return feedbacks;
  }

  /**
   * 收集单个CLI的反馈
   */
  async collectSingleCLIFeedback(skillName, cliName) {
    const feedbackKey = `${skillName}-${cliName}`;

    // 检查缓存
    if (this.feedbackStore.has(feedbackKey)) {
      return this.feedbackStore.get(feedbackKey);
    }

    // 尝试从文件加载反馈
    const feedbackPath = this.findFeedbackFile(skillName, cliName);
    if (feedbackPath && fs.existsSync(feedbackPath)) {
      try {
        const feedbackData = JSON.parse(fs.readFileSync(feedbackPath, 'utf8'));
        const feedback = {
          cliName,
          skillName,
          ...feedbackData,
          timestamp: feedbackData.timestamp || new Date().toISOString()
        };
        this.feedbackStore.set(feedbackKey, feedback);
        return feedback;
      } catch (error) {
        console.log(`      ⚠️  反馈文件损坏: ${feedbackPath}`);
      }
    }

    // 如果没有历史反馈，返回null
    return null;
  }

  /**
   * 查找反馈文件
   */
  findFeedbackFile(skillName, cliName) {
    const possiblePaths = [
      path.join(process.cwd(), '.stigmergy', 'feedbacks', `${cliName}-${skillName}.json`),
      path.join(process.cwd(), '.stigmergy', 'feedbacks', skillName, `${cliName}.json`),
      path.join(process.cwd(), 'data', 'feedbacks', `${cliName}`, `${skillName}.json`)
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return possiblePath;
      }
    }

    return null;
  }

  /**
   * 检查反馈一致性
   */
  async checkConsistency(cliFeedbacks) {
    if (cliFeedbacks.length === 0) {
      return { score: 0, details: '无反馈' };
    }

    const consistency = {
      score: 0,
      details: {},
      issues: []
    };

    // 1. 评分一致性
    const ratings = cliFeedbacks
      .map(f => f.rating)
      .filter(r => r !== undefined);

    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
      consistency.details.rating = {
        average: avgRating,
        variance: variance,
        count: ratings.length
      };

      // 低方差表示高一致性
      consistency.score += Math.max(0, 1 - variance / 4) * 0.4;
    }

    // 2. 安全性评估一致性
    const securityScores = cliFeedbacks
      .map(f => f.securityScore)
      .filter(s => s !== undefined);

    if (securityScores.length > 0) {
      const avgSecurity = securityScores.reduce((sum, s) => sum + s, 0) / securityScores.length;
      const minSecurity = Math.min(...securityScores);

      consistency.details.security = {
        average: avgSecurity,
        minimum: minSecurity,
        count: securityScores.length
      };

      // 最低分决定安全性
      consistency.score += (minSecurity / 100) * 0.3;
    }

    // 3. 可靠性评估一致性
    const reliabilityScores = cliFeedbacks
      .map(f => f.reliability)
      .filter(r => r !== undefined);

    if (reliabilityScores.length > 0) {
      const avgReliability = reliabilityScores.reduce((sum, r) => sum + r, 0) / reliabilityScores.length;

      consistency.details.reliability = {
        average: avgReliability,
        count: reliabilityScores.length
      };

      consistency.score += (avgReliability / 5) * 0.3;
    }

    // 检测一致性问题
    if (consistency.details.rating && consistency.details.rating.variance > 2) {
      consistency.issues.push({
        type: 'RATING_INCONSISTENCY',
        message: '评分差异过大',
        severity: 'MEDIUM'
      });
    }

    if (consistency.details.security && consistency.details.security.minimum < 70) {
      consistency.issues.push({
        type: 'SECURITY_CONCERN',
        message: '存在低安全评分',
        severity: 'HIGH'
      });
    }

    return consistency;
  }

  /**
   * 检测异常报告
   */
  async detectAnomalies(cliFeedbacks) {
    const anomalies = {
      count: 0,
      details: [],
      issues: []
    };

    cliFeedbacks.forEach(feedback => {
      // 1. 检查安全问题报告
      if (feedback.securityConcerns && feedback.securityConcerns.length > 0) {
        anomalies.count++;
        anomalies.details.push({
          cli: feedback.cliName,
          type: 'SECURITY_CONCERN',
          concerns: feedback.securityConcerns
        });

        anomalies.issues.push({
          type: 'SECURITY_CONCERN',
          cli: feedback.cliName,
          message: `报告安全问题: ${feedback.securityConcerns.join(', ')}`,
          severity: 'HIGH'
        });
      }

      // 2. 检查异常低分
      if (feedback.rating !== undefined && feedback.rating < 2) {
        anomalies.count++;
        anomalies.details.push({
          cli: feedback.cliName,
          type: 'LOW_RATING',
          rating: feedback.rating
        });
      }

      // 3. 检查负面反馈
      if (feedback.negativeFeedback && feedback.negativeFeedback.length > 0) {
        anomalies.count++;
        anomalies.details.push({
          cli: feedback.cliName,
          type: 'NEGATIVE_FEEDBACK',
          feedback: feedback.negativeFeedback
        });
      }
    });

    return anomalies;
  }

  /**
   * 计算信任度
   */
  async calculateTrustScore({ cliFeedbacks, consistency, anomalyReports }) {
    let trustScore = 0;

    // 1. 基于一致性（40%）
    trustScore += consistency.score * 40;

    // 2. 基于CLI数量（20%）
    const cliCount = cliFeedbacks.length;
    const cliScore = Math.min(cliCount / 5, 1) * 20; // 最多5个CLI
    trustScore += cliScore;

    // 3. 基于平均评分（20%）
    const ratings = cliFeedbacks
      .map(f => f.rating)
      .filter(r => r !== undefined);

    if (ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      trustScore += (avgRating / 5) * 20;
    }

    // 4. 基于异常报告（-20%）
    const anomalyPenalty = Math.min(anomalyReports.count * 10, 20);
    trustScore -= anomalyPenalty;

    // 5. 基于时间新鲜度（10%）
    const now = Date.now();
    const recentFeedbacks = cliFeedbacks.filter(f => {
      const feedbackTime = new Date(f.timestamp).getTime();
      const daysSinceFeedback = (now - feedbackTime) / (1000 * 60 * 60 * 24);
      return daysSinceFeedback < 30; // 30天内
    });
    const freshnessScore = (recentFeedbacks.length / cliFeedbacks.length) * 10;
    trustScore += freshnessScore;

    // 确保在0-100范围内
    return Math.max(0, Math.min(100, trustScore));
  }

  /**
   * 加载已知CLI
   */
  async loadCLIs() {
    const knownCLIs = [
      'claude',
      'gemini',
      'qwen',
      'iflow',
      'qodercli',
      'codebuddy',
      'opencode',
      'kilocode'
    ];

    knownCLIs.forEach(cli => this.cliRegistry.add(cli));

    // 还可以从配置文件加载
    const configPath = path.join(process.cwd(), '.stigmergy', 'cli-registry.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.registeredCLIs) {
          config.registeredCLIs.forEach(cli => this.cliRegistry.add(cli));
        }
      } catch (error) {
        console.log(`      ⚠️  CLI配置加载失败: ${error.message}`);
      }
    }
  }

  /**
   * 加载历史反馈
   */
  async loadHistoricalFeedbacks() {
    const feedbackDir = path.join(process.cwd(), '.stigmergy', 'feedbacks');

    if (!fs.existsSync(feedbackDir)) {
      return;
    }

    // 递归扫描反馈文件
    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      files.forEach(file => {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
          scanDirectory(fullPath);
        } else if (file.name.endsWith('.json')) {
          try {
            const feedbackData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            const key = `${feedbackData.skillName}-${feedbackData.cliName}`;
            this.feedbackStore.set(key, feedbackData);
          } catch (error) {
            // 忽略损坏的文件
          }
        }
      });
    };

    scanDirectory(feedbackDir);
  }

  /**
   * 建立CLI网络
   */
  async buildCLINetwork() {
    // 简化实现：记录CLI之间的相似度
    this.cliNetwork = new Map();

    const cliArray = Array.from(this.cliRegistry);
    for (let i = 0; i < cliArray.length; i++) {
      for (let j = i + 1; j < cliArray.length; j++) {
        const cli1 = cliArray[i];
        const cli2 = cliArray[j];
        const similarity = await this.calculateCLISimilarity(cli1, cli2);

        this.cliNetwork.set(`${cli1}-${cli2}`, similarity);
        this.cliNetwork.set(`${cli2}-${cli1}`, similarity);
      }
    }
  }

  /**
   * 计算CLI相似度
   */
  async calculateCLISimilarity(cli1, cli2) {
    // 简化实现：基于反馈重叠度
    let overlap = 0;
    let total = 0;

    this.feedbackStore.forEach((feedback, key) => {
      if (key.includes(cli1) || key.includes(cli2)) {
        total++;
        if (key.includes(cli1) && key.includes(cli2)) {
          overlap++;
        }
      }
    });

    return total > 0 ? overlap / total : 0;
  }

  /**
   * 添加反馈
   */
  async addFeedback(feedback) {
    const key = `${feedback.skillName}-${feedback.cliName}`;

    // 保存到存储
    this.feedbackStore.set(key, {
      ...feedback,
      timestamp: feedback.timestamp || new Date().toISOString()
    });

    // 保存到文件
    const feedbackDir = path.join(process.cwd(), '.stigmergy', 'feedbacks');
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }

    const feedbackFile = path.join(feedbackDir, `${feedback.cliName}-${feedback.skillName}.json`);
    fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));

    // 清除验证缓存
    this.verificationCache.delete(feedback.skillName);
  }

  /**
   * 批量添加反馈
   */
  async addBatchFeedbacks(feedbacks) {
    for (const feedback of feedbacks) {
      await this.addFeedback(feedback);
    }
  }

  /**
   * 获取验证统计
   */
  getVerificationStats() {
    return {
      totalCLIs: this.cliRegistry.size,
      totalFeedbacks: this.feedbackStore.size,
      cachedVerifications: this.verificationCache.size,
      cliNetworkSize: this.cliNetwork.size
    };
  }

  /**
   * 生成验证报告
   */
  generateVerificationReport(skillName) {
    const verification = this.verificationCache.get(skillName);
    const feedbacks = Array.from(this.feedbackStore.values())
      .filter(f => f.skillName === skillName);

    return {
      skillName,
      verification,
      feedbacks,
      stats: {
        totalFeedbacks: feedbacks.length,
        cliCount: new Set(feedbacks.map(f => f.cliName)).size
      }
    };
  }
}

module.exports = CommunityVerification;
