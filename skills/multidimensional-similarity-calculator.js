#!/usr/bin/env node

/**
 * Multi-Dimensional Similarity Calculator
 *
 * Phase 3 协同过滤改进 - 多维度相似度计算
 *
 * 验证等级: Level 1 - 代码实现完成，基本功能验证
 *
 * 核心功能：
 * - 基础相似度（皮尔逊相关系数）
 * - 领域相似度（工作领域重叠）
 * - 任务相似度（任务模式匹配）
 * - 反思风格相似度（反思深度和质量）
 *
 * 维度权重（可配置）：
 * - 基础相似度：40%
 * - 领域相似度：20%
 * - 任务相似度：20%
 * - 反思风格相似度：20%
 *
 * ⚠️ 重要声明：
 * - 本实现为Level 1基本验证
 * - 使用模拟数据进行功能测试
 * - 未在真实生产环境验证
 * - 需要Phase 3完成Level 2+真实环境测试
 *
 * 局限性：
 * - 反思数据收集依赖Phase 2系统
 * - 任务相似度计算基于简单的模式匹配
 * - 需要大量真实反馈数据才能发挥效果
 * - 跨CLI协调需要在真实环境测试
 */

const ReflectionCollector = require('./reflection-collector');
const ReflectionAnalyzer = require('./reflection-analyzer');

class MultiDimensionalSimilarityCalculator {
  constructor(config = {}) {
    this.reflectionCollector = new ReflectionCollector();
    this.reflectionAnalyzer = new ReflectionAnalyzer();

    // 维度权重配置
    this.weights = {
      base: config.baseWeight || 0.4,        // 基础相似度 40%
      domain: config.domainWeight || 0.2,    // 领域相似度 20%
      task: config.taskWeight || 0.2,        // 任务相似度 20%
      reflection: config.reflectionWeight || 0.2  // 反思风格 20%
    };

    // 最小反馈数量
    this.minFeedbackCount = config.minFeedbackCount || 2;

    console.log('🔧 多维度相似度计算器初始化');
    console.log(`   权重配置: 基础=${this.weights.base}, 领域=${this.weights.domain}, 任务=${this.weights.task}, 反思=${this.weights.reflection}`);
  }

  /**
   * 计算总体相似度（多维度加权组合）
   */
  async calculateOverallSimilarity(agent1Feedback, agent2Feedback, agent1Id, agent2Id) {
    console.log(`\n🔍 计算多维度相似度: ${agent1Id} vs ${agent2Id}`);

    // 1. 基础相似度（皮尔逊相关系数）
    const baseSimilarity = this.calculateBaseSimilarity(agent1Feedback, agent2Feedback);
    console.log(`   📊 基础相似度: ${baseSimilarity.toFixed(3)}`);

    // 2. 领域相似度
    const domainSimilarity = this.calculateDomainSimilarity(agent1Feedback, agent2Feedback);
    console.log(`   🌐 领域相似度: ${domainSimilarity.toFixed(3)}`);

    // 3. 任务相似度
    const taskSimilarity = await this.calculateTaskSimilarity(agent1Feedback, agent2Feedback);
    console.log(`   📋 任务相似度: ${taskSimilarity.toFixed(3)}`);

    // 4. 反思风格相似度
    const reflectionSimilarity = await this.calculateReflectionSimilarity(agent1Id, agent2Id);
    console.log(`   🧠 反思风格相似度: ${reflectionSimilarity.toFixed(3)}`);

    // 加权组合
    const overallSimilarity =
      baseSimilarity * this.weights.base +
      domainSimilarity * this.weights.domain +
      taskSimilarity * this.weights.task +
      reflectionSimilarity * this.weights.reflection;

    console.log(`   ✅ 总体相似度: ${overallSimilarity.toFixed(3)} (加权组合)`);

    return {
      overall: overallSimilarity,
      dimensions: {
        base: baseSimilarity,
        domain: domainSimilarity,
        task: taskSimilarity,
        reflection: reflectionSimilarity
      },
      weights: { ...this.weights },
      details: {
        baseContribution: baseSimilarity * this.weights.base,
        domainContribution: domainSimilarity * this.weights.domain,
        taskContribution: taskSimilarity * this.weights.task,
        reflectionContribution: reflectionSimilarity * this.weights.reflection
      }
    };
  }

  /**
   * 维度1: 基础相似度（皮尔逊相关系数）
   */
  calculateBaseSimilarity(feedback1, feedback2) {
    const commonSkills = this.findCommonSkills(feedback1, feedback2);

    if (commonSkills.length < this.minFeedbackCount) {
      return 0;
    }

    // 提取评分
    const ratings1 = [];
    const ratings2 = [];

    commonSkills.forEach(skillName => {
      const record1 = feedback1.find(f => f.skillName === skillName);
      const record2 = feedback2.find(f => f.skillName === skillName);

      ratings1.push(record1.feedback.rating);
      ratings2.push(record2.feedback.rating);
    });

    // 计算皮尔逊相关系数
    const correlation = this.pearsonCorrelation(ratings1, ratings2);

    // 映射到0-1范围
    return (correlation + 1) / 2;
  }

  /**
   * 维度2: 领域相似度（工作领域重叠）
   */
  calculateDomainSimilarity(feedback1, feedback2) {
    const domains1 = this.extractDomains(feedback1);
    const domains2 = this.extractDomains(feedback2);

    if (domains1.length === 0 && domains2.length === 0) {
      return 0.5; // 两个都没有领域信息，返回中性
    }

    // 计算Jaccard相似度
    const intersection = domains1.filter(d => domains2.includes(d));
    const union = [...new Set([...domains1, ...domains2])];

    if (union.length === 0) {
      return 0.5;
    }

    const jaccard = intersection.length / union.length;

    // 如果完全没有重叠，给予一个基础分（可能在不同领域但工作方式相似）
    if (jaccard === 0) {
      return 0.2;
    }

    return jaccard;
  }

  /**
   * 维度3: 任务相似度（任务模式匹配）
   */
  async calculateTaskSimilarity(feedback1, feedback2) {
    const patterns1 = this.extractTaskPatterns(feedback1);
    const patterns2 = this.extractTaskPatterns(feedback2);

    if (patterns1.length === 0 && patterns2.length === 0) {
      return 0.5;
    }

    // 计算任务模式相似度
    let totalSimilarity = 0;
    let comparisons = 0;

    // 比较任务类型分布
    const typeSimilarity = this.compareDistributions(
      patterns1.types,
      patterns2.types
    );
    totalSimilarity += typeSimilarity;
    comparisons++;

    // 比较复杂度分布
    const complexitySimilarity = this.compareDistributions(
      patterns1.complexities,
      patterns2.complexities
    );
    totalSimilarity += complexitySimilarity;
    comparisons++;

    // 比较紧急度分布
    const urgencySimilarity = this.compareDistributions(
      patterns1.urgencies,
      patterns2.urgencies
    );
    totalSimilarity += urgencySimilarity;
    comparisons++;

    return comparisons > 0 ? totalSimilarity / comparisons : 0.5;
  }

  /**
   * 维度4: 反思风格相似度（反思深度和质量）
   */
  async calculateReflectionSimilarity(agent1Id, agent2Id) {
    // 获取两个agent的反思
    const reflections1 = await this.reflectionCollector.getReflectionsByAgent(agent1Id);
    const reflections2 = await this.reflectionCollector.getReflectionsByAgent(agent2Id);

    if (reflections1.length === 0 && reflections2.length === 0) {
      return 0.5; // 两个都没有反思，返回中性
    }

    if (reflections1.length === 0 || reflections2.length === 0) {
      return 0.3; // 只有一个有反思，给予较低分
    }

    // 分析反思风格
    const style1 = this.analyzeReflectionStyle(reflections1);
    const style2 = this.analyzeReflectionStyle(reflections2);

    // 计算风格相似度
    let similarity = 0;
    let factors = 0;

    // 1. 深度相似度
    const depthSimilarity = 1 - Math.abs(style1.avgDepth - style2.avgDepth) / 5;
    similarity += depthSimilarity * 0.3;
    factors++;

    // 2. 详细程度相似度
    const detailSimilarity = 1 - Math.abs(style1.avgDetail - style2.avgDetail) / 100;
    similarity += detailSimilarity * 0.3;
    factors++;

    // 3. 情感倾向相似度
    const sentimentSimilarity = style1.sentiment === style2.sentiment ? 1 : 0.5;
    similarity += sentimentSimilarity * 0.2;
    factors++;

    // 4. 建设性相似度
    const constructiveSimilarity = 1 - Math.abs(style1.constructiveness - style2.constructiveness);
    similarity += constructiveSimilarity * 0.2;
    factors++;

    return factors > 0 ? similarity / factors : 0.5;
  }

  /**
   * 提取领域信息
   */
  extractDomains(feedback) {
    const domains = new Set();
    feedback.forEach(f => {
      if (f.context && f.context.domain) {
        domains.add(f.context.domain);
      }
    });
    return Array.from(domains);
  }

  /**
   * 提取任务模式
   */
  extractTaskPatterns(feedback) {
    const patterns = {
      types: {},
      complexities: {},
      urgencies: {}
    };

    feedback.forEach(f => {
      // 任务类型
      const taskType = f.context?.taskType || 'unknown';
      patterns.types[taskType] = (patterns.types[taskType] || 0) + 1;

      // 复杂度
      const complexity = f.context?.complexity || 'medium';
      patterns.complexities[complexity] = (patterns.complexities[complexity] || 0) + 1;

      // 紧急度
      const urgency = f.context?.urgency || 'normal';
      patterns.urgencies[urgency] = (patterns.urgencies[urgency] || 0) + 1;
    });

    return patterns;
  }

  /**
   * 分析反思风格
   */
  analyzeReflectionStyle(reflections) {
    let totalDepth = 0;
    let totalDetail = 0;
    let positiveCount = 0;
    let constructiveCount = 0;

    reflections.forEach(ref => {
      // 分析深度（基于deepReflection的完整性）
      let depth = 0;
      if (ref.deepReflection) {
        if (ref.deepReflection.whatWentWell?.length > 0) depth++;
        if (ref.deepReflection.whatCouldImprove?.length > 0) depth++;
        if (ref.deepReflection.whatSurprised?.length > 0) depth++;
        if (ref.deepReflection.whatLearned?.length > 0) depth++;
      }
      totalDepth += depth;

      // 分析详细程度（基于lessonsLearned和suggestions的数量）
      const detailCount =
        (ref.afterUsage?.lessonsLearned?.length || 0) +
        (ref.afterUsage?.suggestions?.length || 0);
      totalDetail += Math.min(detailCount, 25) * 4; // 归一化到0-100

      // 分析情感倾向
      if (ref.afterUsage?.performance) {
        const avgPerf =
          (ref.afterUsage.performance.effectiveness +
           ref.afterUsage.performance.efficiency +
           ref.afterUsage.performance.reliability +
           ref.afterUsage.performance.easeOfUse) / 4;
        if (avgPerf >= 4) positiveCount++;
      }

      // 分析建设性（基于改进建议的数量和质量）
      if (ref.afterUsage?.suggestions?.length > 2) {
        constructiveCount++;
      }
    });

    return {
      avgDepth: reflections.length > 0 ? totalDepth / reflections.length : 0,
      avgDetail: reflections.length > 0 ? totalDetail / reflections.length : 0,
      sentiment: positiveCount / reflections.length > 0.5 ? 'positive' : 'neutral',
      constructiveness: reflections.length > 0 ? constructiveCount / reflections.length : 0
    };
  }

  /**
   * 比较两个分布的相似度
   */
  compareDistributions(dist1, dist2) {
    const keys1 = Object.keys(dist1);
    const keys2 = Object.keys(dist2);

    if (keys1.length === 0 && keys2.length === 0) {
      return 0.5;
    }

    if (keys1.length === 0 || keys2.length === 0) {
      return 0.3;
    }

    // 归一化
    const total1 = Object.values(dist1).reduce((a, b) => a + b, 0);
    const total2 = Object.values(dist2).reduce((a, b) => a + b, 0);

    const norm1 = {};
    const norm2 = {};

    keys1.forEach(k => norm1[k] = dist1[k] / total1);
    keys2.forEach(k => norm2[k] = dist2[k] / total2);

    // 计算余弦相似度
    let dotProduct = 0;
    let norm1Sum = 0;
    let norm2Sum = 0;

    const allKeys = new Set([...keys1, ...keys2]);

    allKeys.forEach(k => {
      const v1 = norm1[k] || 0;
      const v2 = norm2[k] || 0;

      dotProduct += v1 * v2;
      norm1Sum += v1 * v1;
      norm2Sum += v2 * v2;
    });

    const magnitude = Math.sqrt(norm1Sum) * Math.sqrt(norm2Sum);

    if (magnitude === 0) {
      return 0.5;
    }

    return dotProduct / magnitude;
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
   * 更新权重配置
   */
  updateWeights(newWeights) {
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);

    if (Math.abs(total - 1.0) > 0.01) {
      console.warn(`⚠️  权重总和应为1.0，当前为${total.toFixed(3)}，将进行归一化`);
    }

    // 归一化
    const normalized = {};
    Object.keys(newWeights).forEach(key => {
      normalized[key] = newWeights[key] / total;
    });

    this.weights = { ...this.weights, ...normalized };

    console.log(`✅ 权重已更新:`, this.weights);
  }

  /**
   * 获取当前配置
   */
  getConfig() {
    return {
      weights: { ...this.weights },
      minFeedbackCount: this.minFeedbackCount
    };
  }

  /**
   * 生成相似度报告
   */
  generateSimilarityReport(similarityResult) {
    const report = {
      overall: similarityResult.overall,
      interpretation: this.interpretSimilarity(similarityResult.overall),
      dimensions: similarityResult.dimensions,
      contributions: similarityResult.details,
      weights: similarityResult.weights,
      dominantDimension: this.findDominantDimension(similarityResult.details),
      recommendations: this.generateRecommendations(similarityResult)
    };

    return report;
  }

  /**
   * 解释相似度分数
   */
  interpretSimilarity(score) {
    if (score >= 0.8) return '高度相似 - 推荐偏好非常一致';
    if (score >= 0.6) return '相似 - 推荐偏好较为一致';
    if (score >= 0.4) return '中等相似 - 有一定参考价值';
    if (score >= 0.2) return '低相似度 - 参考价值有限';
    return '不相似 - 推荐偏好差异较大';
  }

  /**
   * 找到主导维度
   */
  findDominantDimension(contributions) {
    let max = 0;
    let dominant = null;

    Object.keys(contributions).forEach(key => {
      if (contributions[key] > max) {
        max = contributions[key];
        dominant = key.replace('Contribution', '');
      }
    });

    return dominant;
  }

  /**
   * 生成建议
   */
  generateRecommendations(similarityResult) {
    const recommendations = [];

    if (similarityResult.overall < 0.4) {
      recommendations.push('相似度较低，建议谨慎参考推荐结果');
    }

    if (similarityResult.dimensions.reflection < 0.3) {
      recommendations.push('反思风格差异较大，可能需要调整推荐策略');
    }

    if (similarityResult.dimensions.domain < 0.3) {
      recommendations.push('工作领域差异较大，跨领域推荐可能需要调整');
    }

    if (similarityResult.overall >= 0.7) {
      recommendations.push('相似度很高，可以高度信任推荐结果');
    }

    return recommendations;
  }
}

module.exports = MultiDimensionalSimilarityCalculator;
