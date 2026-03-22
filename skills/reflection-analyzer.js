#!/usr/bin/env node

/**
 * Reflection Analyzer - 反思分析引擎
 *
 * Phase 2 反思集成 - 从收集的反思中提取有价值的信息
 *
 * 核心功能：
 * - 情感分析
 * - 主题提取
 * - 模式识别
 * - 知识提取
 */

const ReflectionCollector = require('./reflection-collector');

class ReflectionAnalyzer {
  constructor() {
    this.collector = new ReflectionCollector();
    this.analysisCache = new Map(); // 分析缓存
  }

  /**
   * 分析skill的所有反思
   */
  async analyzeReflections(skillName) {
    console.log(`\n🔍 分析反思: ${skillName}`);

    // 1. 收集所有反思
    const reflections = await this.collector.getReflectionsBySkill(skillName);

    if (reflections.length === 0) {
      console.log(`   ⚠️  无反思数据`);
      return {
        skillName,
        totalReflections: 0,
        sentiment: null,
        topics: [],
        patterns: [],
        improvements: [],
        successFactors: [],
        overallQuality: 0
      };
    }

    console.log(`   📊 分析 ${reflections.length} 条反思`);

    const analysis = {
      skillName,
      totalReflections: reflections.length,
      timestamp: new Date().toISOString(),

      // 2. 情感分析
      sentiment: await this.analyzeSentiment(reflections),

      // 3. 主题提取
      topics: await this.extractTopics(reflections),

      // 4. 模式识别
      patterns: await this.identifyPatterns(reflections),

      // 5. 改进建议提取
      improvements: await this.extractImprovements(reflections),

      // 6. 成功因素识别
      successFactors: await this.identifySuccessFactors(reflections),

      // 7. 综合质量评分
      overallQuality: 0
    };

    // 计算综合质量
    analysis.overallQuality = this.calculateOverallQuality(analysis);

    // 生成分析报告
    this.generateAnalysisReport(analysis);

    // 缓存分析结果
    this.analysisCache.set(skillName, analysis);

    return analysis;
  }

  /**
   * 情感分析
   */
  async analyzeSentiment(reflections) {
    console.log(`      🔍 情感分析...`);

    const sentiment = {
      overall: 'NEUTRAL',
      score: 0,
      distribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      details: []
    };

    let totalScore = 0;

    reflections.forEach(reflection => {
      // 分析afterUsage的性能评分
      if (reflection.afterUsage && reflection.afterUsage.performance) {
        const perf = reflection.afterUsage.performance;
        const avgPerf = (perf.effectiveness + perf.efficiency + perf.reliability + perf.easeOfUse) / 4;

        totalScore += avgPerf;

        if (avgPerf >= 4) {
          sentiment.distribution.positive++;
        } else if (avgPerf >= 3) {
          sentiment.distribution.neutral++;
        } else {
          sentiment.distribution.negative++;
        }
      }

      // 分析deepReflection的wouldRecommend
      if (reflection.deepReflection && reflection.deepReflection.wouldRecommend) {
        if (reflection.deepReflection.wouldRecommend.wouldRecommend) {
          sentiment.distribution.positive++;
        } else {
          sentiment.distribution.negative++;
        }
      }
    });

    // 计算平均分
    const avgScore = reflections.length > 0 ? totalScore / reflections.length : 0;
    sentiment.score = avgScore;

    // 确定整体情感
    if (avgScore >= 4) {
      sentiment.overall = 'POSITIVE';
    } else if (avgScore >= 3) {
      sentiment.overall = 'NEUTRAL';
    } else {
      sentiment.overall = 'NEGATIVE';
    }

    console.log(`         整体: ${sentiment.overall} (${avgScore.toFixed(2)}/5)`);
    console.log(`         正面: ${sentiment.distribution.positive}, 中性: ${sentiment.distribution.neutral}, 负面: ${sentiment.distribution.negative}`);

    return sentiment;
  }

  /**
   * 主题提取
   */
  async extractTopics(reflections) {
    console.log(`      🔍 主题提取...`);

    const topics = [];
    const topicCounts = new Map();

    reflections.forEach(reflection => {
      // 从lessonsLearned提取主题
      if (reflection.afterUsage && reflection.afterUsage.lessonsLearned) {
        reflection.afterUsage.lessonsLearned.forEach(lesson => {
          const topic = this.extractTopicFromText(lesson);
          if (topic) {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          }
        });
      }

      // 从suggestions提取主题
      if (reflection.afterUsage && reflection.afterUsage.suggestions) {
        reflection.afterUsage.suggestions.forEach(suggestion => {
          const topic = this.extractTopicFromText(suggestion);
          if (topic) {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          }
        });
      }

      // 从deepReflection提取主题
      if (reflection.deepReflection) {
        const whatWentWell = reflection.deepReflection.whatWentWell || [];
        const whatCouldImprove = reflection.deepReflection.whatCouldImprove || [];

        [...whatWentWell, ...whatCouldImprove].forEach(item => {
          const topic = this.extractTopicFromText(item);
          if (topic) {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
          }
        });
      }
    });

    // 转换为数组并排序
    topicCounts.forEach((count, topic) => {
      topics.push({ topic, count, frequency: count / reflections.length });
    });

    topics.sort((a, b) => b.count - a.count);

    console.log(`         提取 ${topics.length} 个主题`);

    return topics;
  }

  /**
   * 从文本中提取主题
   */
  extractTopicFromText(text) {
    // 简化实现：基于关键词
    const keywords = {
      '性能': ['性能', '速度', '效率', '快', '慢'],
      '文档': ['文档', '说明', '教程', '指南'],
      '易用性': ['易用', '简单', '复杂', '困难'],
      '功能': ['功能', '特性', '能力'],
      '错误': ['错误', 'bug', '问题', '故障'],
      '学习': ['学习', '理解', '掌握', '学会'],
      '配置': ['配置', '设置', '选项', '参数'],
      '输出': ['输出', '结果', '返回'],
      '可靠性': ['可靠', '稳定', '健壮']
    };

    for (const [topic, patterns] of Object.entries(keywords)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          return topic;
        }
      }
    }

    return null;
  }

  /**
   * 模式识别
   */
  async identifyPatterns(reflections) {
    console.log(`      🔍 模式识别...`);

    const patterns = {
      success: [],
      failure: [],
      improvement: [],
      warning: []
    };

    reflections.forEach(reflection => {
      // 成功模式
      if (reflection.deepReflection && reflection.deepReflection.whatWentWell) {
        reflection.deepReflection.whatWentWell.forEach(item => {
          patterns.success.push({
            pattern: item,
            source: reflection.reflectionId,
            type: 'success'
          });
        });
      }

      // 失败/问题模式
      if (reflection.deepReflection && reflection.deepReflection.whatCouldImprove) {
        reflection.deepReflection.whatCouldImprove.forEach(item => {
          patterns.failure.push({
            pattern: item,
            source: reflection.reflectionId,
            type: 'failure'
          });
        });
      }

      // 改进建议模式
      if (reflection.afterUsage && reflection.afterUsage.suggestions) {
        reflection.afterUsage.suggestions.forEach(suggestion => {
          patterns.improvement.push({
            pattern: suggestion,
            source: reflection.reflectionId,
            type: 'improvement'
          });
        });
      }

      // 警告模式
      if (reflection.afterUsage && reflection.afterUsage.actualOutcome) {
        const outcome = reflection.afterUsage.actualOutcome;
        if (outcome.warnings && outcome.warnings.length > 0) {
          outcome.warnings.forEach(warning => {
            patterns.warning.push({
              pattern: warning,
              source: reflection.reflectionId,
              type: 'warning'
            });
          });
        }
      }
    });

    // 聚合相似模式
    const aggregatedPatterns = this.aggregatePatterns(patterns);

    console.log(`         成功: ${aggregatedPatterns.success.length}, 失败: ${aggregatedPatterns.failure.length}, 改进: ${aggregatedPatterns.improvement.length}, 警告: ${aggregatedPatterns.warning.length}`);

    return aggregatedPatterns;
  }

  /**
   * 聚合相似模式
   */
  aggregatePatterns(patterns) {
    const aggregated = {
      success: [],
      failure: [],
      improvement: [],
      warning: []
    };

    // 对每种类型进行聚合
    Object.keys(patterns).forEach(type => {
      const patternMap = new Map();

      patterns[type].forEach(item => {
        const key = item.pattern.toLowerCase();
        if (!patternMap.has(key)) {
          patternMap.set(key, {
            pattern: item.pattern,
            count: 0,
            sources: [],
            type: type
          });
        }
        const aggregated = patternMap.get(key);
        aggregated.count++;
        aggregated.sources.push(item.source);
      });

      // 转换为数组并排序
      aggregated[type] = Array.from(patternMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 只保留前10个
    });

    return aggregated;
  }

  /**
   * 提取改进建议
   */
  async extractImprovements(reflections) {
    console.log(`      🔍 提取改进建议...`);

    const improvements = {
      high: [], // 高优先级
      medium: [], // 中优先级
      low: [] // 低优先级
    };

    const improvementCounts = new Map();

    reflections.forEach(reflection => {
      // 从whatCouldImprove提取
      if (reflection.deepReflection && reflection.deepReflection.whatCouldImprove) {
        reflection.deepReflection.whatCouldImprove.forEach(item => {
          const priority = this.assessImprovementPriority(item);
          improvements[priority].push({
            suggestion: item,
            source: reflection.reflectionId,
            agentId: reflection.agentId
          });

          // 统计
          const key = item.toLowerCase();
          improvementCounts.set(key, (improvementCounts.get(key) || 0) + 1);
        });
      }

      // 从suggestions提取
      if (reflection.afterUsage && reflection.afterUsage.suggestions) {
        reflection.afterUsage.suggestions.forEach(suggestion => {
          const priority = this.assessImprovementPriority(suggestion);
          improvements[priority].push({
            suggestion: suggestion,
            source: reflection.reflectionId,
            agentId: reflection.agentId
          });

          const key = suggestion.toLowerCase();
          improvementCounts.set(key, (improvementCounts.get(key) || 0) + 1);
        });
      }
    });

    // 聚合高频建议
    const topImprovements = Array.from(improvementCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([suggestion, count]) => ({ suggestion, count }));

    console.log(`         高优先级: ${improvements.high.length}, 中优先级: ${improvements.medium.length}, 低优先级: ${improvements.low.length}`);
    console.log(`         高频建议: ${topImprovements.length}个`);

    return {
      byPriority: improvements,
      topSuggestions: topImprovements
    };
  }

  /**
   * 评估改进优先级
   */
  assessImprovementPriority(suggestion) {
    const text = suggestion.toLowerCase();

    // 高优先级关键词
    const highKeywords = ['错误', 'bug', '失败', '崩溃', '安全', '危险'];
    if (highKeywords.some(kw => text.includes(kw))) {
      return 'high';
    }

    // 中优先级关键词
    const mediumKeywords = ['性能', '速度', '效率', '文档', '配置'];
    if (mediumKeywords.some(kw => text.includes(kw))) {
      return 'medium';
    }

    // 低优先级
    return 'low';
  }

  /**
   * 识别成功因素
   */
  async identifySuccessFactors(reflections) {
    console.log(`      🔍 识别成功因素...`);

    const successFactors = [];
    const factorCounts = new Map();

    reflections.forEach(reflection => {
      // 从whatWentWell提取成功因素
      if (reflection.deepReflection && reflection.deepReflection.whatWentWell) {
        reflection.deepReflection.whatWentWell.forEach(item => {
          const factor = this.extractSuccessFactor(item);
          if (factor) {
            factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
          }
        });
      }

      // 从whatLearned提取成功因素
      if (reflection.deepReflection && reflection.deepReflection.whatLearned) {
        reflection.deepReflection.whatLearned.forEach(item => {
          const factor = this.extractSuccessFactor(item);
          if (factor) {
            factorCounts.set(factor, (factorCounts.get(factor) || 0) + 1);
          }
        });
      }

      // 从wouldRecommend提取成功因素
      if (reflection.deepReflection && reflection.deepReflection.wouldRecommend && reflection.deepReflection.wouldRecommend.wouldRecommend) {
        factorCounts.set('推荐使用', (factorCounts.get('推荐使用') || 0) + 1);
      }
    });

    // 转换为数组并排序
    factorCounts.forEach((count, factor) => {
      const frequency = count / reflections.length;
      successFactors.push({
        factor,
        count,
        frequency,
        significance: frequency > 0.5 ? 'HIGH' : frequency > 0.2 ? 'MEDIUM' : 'LOW'
      });
    });

    successFactors.sort((a, b) => b.count - a.count);

    console.log(`         识别 ${successFactors.length} 个成功因素`);

    return successFactors;
  }

  /**
   * 从文本中提取成功因素
   */
  extractSuccessFactor(text) {
    // 简化实现：基于关键词
    const successKeywords = [
      '成功', '完成', '有效', '好', '优秀', '快',
      '简单', '易用', '可靠', '稳定', '准确',
      '有用', '帮助', '学会', '理解', '掌握'
    ];

    for (const keyword of successKeywords) {
      if (text.includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  /**
   * 计算综合质量评分
   */
  calculateOverallQuality(analysis) {
    let quality = 0;

    // 1. 情感评分 (25%)
    if (analysis.sentiment) {
      quality += (analysis.sentiment.score / 5) * 25;
    }

    // 2. 主题数量 (15%)
    const topicScore = Math.min(analysis.topics.length / 10, 1) * 15;
    quality += topicScore;

    // 3. 模式识别 (20%)
    const patternCount =
      analysis.patterns.success.length +
      analysis.patterns.failure.length +
      analysis.patterns.improvement.length +
      analysis.patterns.warning.length;
    const patternScore = Math.min(patternCount / 20, 1) * 20;
    quality += patternScore;

    // 4. 改进建议 (20%)
    const improvementCount =
      analysis.improvements.byPriority.high.length +
      analysis.improvements.byPriority.medium.length +
      analysis.improvements.byPriority.low.length;
    const improvementScore = Math.min(improvementCount / 10, 1) * 20;
    quality += improvementScore;

    // 5. 成功因素 (20%)
    const successScore = Math.min(analysis.successFactors.length / 10, 1) * 20;
    quality += successScore;

    return Math.min(quality, 100);
  }

  /**
   * 生成分析报告
   */
  generateAnalysisReport(analysis) {
    console.log(`\n📋 反思分析报告: ${analysis.skillName}`);
    console.log(`   反思数量: ${analysis.totalReflections}`);
    console.log(`   情感分析: ${analysis.sentiment.overall} (${analysis.sentiment.score.toFixed(2)}/5)`);
    console.log(`   主题数量: ${analysis.topics.length}`);
    console.log(`   模式识别: ${analysis.patterns.success.length + analysis.patterns.failure.length}个`);
    console.log(`   改进建议: ${analysis.improvements.byPriority.high.length + analysis.improvements.byPriority.medium.length + analysis.improvements.byPriority.low.length}个`);
    console.log(`   成功因素: ${analysis.successFactors.length}个`);
    console.log(`   综合质量: ${analysis.overallQuality.toFixed(1)}/100`);
  }

  /**
   * 获取分析摘要
   */
  getAnalysisSummary(skillName) {
    const analysis = this.analysisCache.get(skillName);
    if (!analysis) {
      return null;
    }

    return {
      skillName,
      totalReflections: analysis.totalReflections,
      sentiment: analysis.sentiment.overall,
      topTopics: analysis.topics.slice(0, 5),
      topPatterns: {
        success: analysis.patterns.success.slice(0, 3),
        improvement: analysis.improvements.byPriority.high.slice(0, 3)
      },
      topSuccessFactors: analysis.successFactors.slice(0, 5),
      overallQuality: analysis.overallQuality
    };
  }

  /**
   * 比较两个skill的反思
   */
  compareSkills(skill1, skill2) {
    const analysis1 = this.analysisCache.get(skill1);
    const analysis2 = this.analysisCache.get(skill2);

    if (!analysis1 || !analysis2) {
      return null;
    }

    return {
      skill1,
      skill2,
      sentimentComparison: {
        skill1: analysis1.sentiment.overall,
        skill2: analysis2.sentiment.overall,
        winner: analysis1.sentiment.score > analysis2.sentiment.score ? skill1 : skill2
      },
      qualityComparison: {
        skill1: analysis1.overallQuality,
        skill2: analysis2.overallQuality,
        winner: analysis1.overallQuality > analysis2.overallQuality ? skill1 : skill2
      },
      topicOverlap: this.calculateTopicOverlap(analysis1.topics, analysis2.topics),
      recommendation: this.generateComparisonRecommendation(analysis1, analysis2)
    };
  }

  /**
   * 计算主题重叠度
   */
  calculateTopicOverlap(topics1, topics2) {
    const set1 = new Set(topics1.map(t => t.topic));
    const set2 = new Set(topics2.map(t => t.topic));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return {
      overlap: intersection.size,
      union: union.size,
      similarity: union.size > 0 ? intersection.size / union.size : 0
    };
  }

  /**
   * 生成比较建议
   */
  generateComparisonRecommendation(analysis1, analysis2) {
    if (analysis1.overallQuality > analysis2.overallQuality) {
      return {
        recommended: analysis1.skillName,
        reason: `综合质量更高 (${analysis1.overallQuality.toFixed(1)} vs ${analysis2.overallQuality.toFixed(1)})`,
        confidence: 'medium'
      };
    } else if (analysis2.overallQuality > analysis1.overallQuality) {
      return {
        recommended: analysis2.skillName,
        reason: `综合质量更高 (${analysis2.overallQuality.toFixed(1)} vs ${analysis1.overallQuality.toFixed(1)})`,
        confidence: 'medium'
      };
    } else {
      return {
        recommended: 'either',
        reason: '综合质量相当',
        confidence: 'low'
      };
    }
  }
}

module.exports = ReflectionAnalyzer;
