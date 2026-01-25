/**
 * Result Aggregator - 聚合多个CLI的结果
 * 实现多种协同策略：投票、质量评分、混合合并等
 */

class ResultAggregator {
  constructor(options = {}) {
    this.strategies = {
      voting: this._votingStrategy.bind(this),
      quality: this._qualityStrategy.bind(this),
      consensus: this._consensusStrategy.bind(this),
      merge: this._mergeStrategy.bind(this),
      firstSuccess: this._firstSuccessStrategy.bind(this),
      allSuccess: this._allSuccessStrategy.bind(this)
    };

    this.cliWeights = options.cliWeights || {
      'claude': 1.2,    // Claude在复杂推理上的权重
      'qwen': 1.0,     // Qwen在中文和代码上的权重
      'gemini': 0.9,   // Gemini在多语言上的权重
      'iflow': 0.95,   // iFlow在代码分析上的权重
      'codebuddy': 0.85,
      'codex': 0.85,
      'copilot': 0.9,
      'qodercli': 0.85
    };
  }

  /**
   * 聚合结果 - 主入口
   */
  aggregate(results, strategy = 'consensus') {
    if (!results || results.length === 0) {
      return {
        success: false,
        error: 'No results to aggregate'
      };
    }

    // 只有一个结果
    if (results.length === 1) {
      return results[0];
    }

    // 全部失败
    const allFailed = results.every(r => !r.success);
    if (allFailed) {
      return {
        success: false,
        error: 'All CLI executions failed',
        details: results.map(r => ({ cli: r.cli, error: r.error }))
      };
    }

    // 选择策略
    const aggregator = this.strategies[strategy] || this.strategies.consensus;
    return aggregator(results);
  }

  /**
   * 策略1: 投票策略 - 多数票胜出
   */
  _votingStrategy(results) {
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      return results[0];  // 全部失败，返回第一个
    }

    if (successful.length === 1) {
      return successful[0];  // 只有一个成功
    }

    // 提取输出的哈希（用于比较相似性）
    const votes = {};
    successful.forEach(r => {
      const output = this._normalizeOutput(r.output);
      votes[output] = (votes[output] || 0) + 1;
    });

    // 找出得票最多的结果
    let maxVotes = 0;
    let winner = null;
    for (const [output, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = successful.find(r => this._normalizeOutput(r.output) === output);
      }
    }

    return {
      ...winner,
      aggregationMethod: 'voting',
      votes: maxVotes,
      totalVotes: successful.length,
      consensus: maxVotes / successful.length
    };
  }

  /**
   * 策略2: 质量评分策略 - 根据质量指标选择最佳结果
   */
  _qualityStrategy(results) {
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      return results[0];
    }

    // 为每个结果打分
    const scored = successful.map(r => ({
      ...r,
      qualityScore: this._calculateQualityScore(r)
    }));

    // 按分数排序
    scored.sort((a, b) => b.qualityScore - a.qualityScore);

    const winner = scored[0];
    return {
      ...winner,
      aggregationMethod: 'quality',
      qualityScore: winner.qualityScore,
      allScores: scored.map(s => ({ cli: s.cli, score: s.qualityScore }))
    };
  }

  /**
   * 策略3: 共识策略 - 结合权重和相似性
   */
  _consensusStrategy(results) {
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      return results[0];
    }

    if (successful.length === 1) {
      return successful[0];
    }

    // 计算加权相似度
    const clusters = this._clusterResults(successful);

    // 找出最大的簇
    let maxCluster = clusters[0];
    for (const cluster of clusters) {
      if (cluster.totalWeight > maxCluster.totalWeight) {
        maxCluster = cluster;
      }
    }

    // 返回簇中的最佳结果（权重最高的）
    const bestInCluster = maxCluster.results.reduce((best, current) => {
      const currentWeight = this.cliWeights[current.cli] || 1.0;
      const bestWeight = this.cliWeights[best.cli] || 1.0;
      return currentWeight > bestWeight ? current : best;
    });

    return {
      ...bestInCluster,
      aggregationMethod: 'consensus',
      clusterSize: maxCluster.results.length,
      consensusRatio: maxCluster.totalWeight / successful.reduce((sum, r) => sum + (this.cliWeights[r.cli] || 1.0), 0)
    };
  }

  /**
   * 策略4: 合并策略 - 智能合并所有结果
   */
  _mergeStrategy(results) {
    const successful = results.filter(r => r.success);

    if (successful.length === 0) {
      return results[0];
    }

    // 尝试合并输出
    const merged = this._mergeOutputs(successful);

    return {
      cli: 'merged',
      success: true,
      output: merged,
      aggregationMethod: 'merge',
      sources: successful.map(r => r.cli),
      executionTime: Math.max(...successful.map(r => r.executionTime))
    };
  }

  /**
   * 策略5: 首个成功策略
   */
  _firstSuccessStrategy(results) {
    return results.find(r => r.success) || results[0];
  }

  /**
   * 策略6: 全部成功策略（检查一致性）
   */
  _allSuccessStrategy(results) {
    const successful = results.filter(r => r.success);
    const allSuccessful = successful.length === results.length;

    if (!allSuccessful) {
      return {
        success: false,
        error: 'Not all CLIs succeeded',
        successful: successful.map(r => r.cli),
        failed: results.filter(r => !r.success).map(r => r.cli)
      };
    }

    // 检查结果一致性
    const outputs = successful.map(r => this._normalizeOutput(r.output));
    const allSame = outputs.every(o => o === outputs[0]);

    return {
      ...successful[0],
      aggregationMethod: 'allSuccess',
      consensus: allSame,
      consensusRatio: allSame ? 1.0 : 0
    };
  }

  /**
   * 计算质量分数
   */
  _calculateQualityScore(result) {
    let score = 0;

    const output = result.output || '';

    // 基础分
    score += 50;

    // 输出长度（适中的长度更好）
    const length = output.length;
    if (length > 50 && length < 5000) {
      score += 20;
    } else if (length >= 5000) {
      score += 10;
    }

    // 包含代码块
    if (output.includes('```')) {
      score += 15;
    }

    // 包含解释
    if (output.length > 200) {
      score += 10;
    }

    // CLI权重
    score *= (this.cliWeights[result.cli] || 1.0);

    // 执行时间（更快的更好）
    if (result.executionTime) {
      const timeScore = Math.max(0, 10 - (result.executionTime / 10000));
      score += timeScore;
    }

    return score;
  }

  /**
   * 标准化输出（用于比较）
   */
  _normalizeOutput(output) {
    if (typeof output !== 'string') {
      return JSON.stringify(output);
    }

    // 移除空白和时间戳
    return output
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g, '')
      .toLowerCase();
  }

  /**
   * 聚类相似的结果
   */
  _clusterResults(results) {
    const clusters = [];
    const visited = new Set();

    for (let i = 0; i < results.length; i++) {
      if (visited.has(i)) continue;

      const cluster = {
        results: [results[i]],
        totalWeight: this.cliWeights[results[i].cli] || 1.0
      };
      visited.add(i);

      // 查找相似的结果
      for (let j = i + 1; j < results.length; j++) {
        if (visited.has(j)) continue;

        const similarity = this._calculateSimilarity(results[i].output, results[j].output);
        if (similarity > 0.7) {  // 70%相似度阈值
          cluster.results.push(results[j]);
          cluster.totalWeight += (this.cliWeights[results[j].cli] || 1.0);
          visited.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * 计算两个输出的相似度
   */
  _calculateSimilarity(output1, output2) {
    const str1 = this._normalizeOutput(output1);
    const str2 = this._normalizeOutput(output2);

    if (str1 === str2) return 1.0;

    // 简单的Jaccard相似度
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 合并多个输出
   */
  _mergeOutputs(results) {
    // 如果是代码，尝试选择最好的版本
    const codeBlocks = results.map(r => this._extractCodeBlocks(r.output)).flat();

    if (codeBlocks.length > 0) {
      // 去重并选择最长的代码块
      const unique = Array.from(new Set(codeBlocks));
      unique.sort((a, b) => b.length - a.length);

      return unique[0] || results[0].output;
    }

    // 对于文本，选择最长的输出
    const longest = results.reduce((longest, current) => {
      const currentLen = (current.output || '').length;
      const longestLen = (longest.output || '').length;
      return currentLen > longestLen ? current : longest;
    });

    return longest.output;
  }

  /**
   * 提取代码块
   */
  _extractCodeBlocks(output) {
    if (typeof output !== 'string') return [];

    const matches = output.match(/```[\s\S]*?```/g) || [];
    return matches.map(m => m.trim());
  }
}

module.exports = ResultAggregator;
