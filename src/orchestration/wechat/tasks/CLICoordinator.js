/**
 * CLICoordinator - CLI协调器
 * 负责CLI能力评估、选择和负载均衡
 */

class CLICoordinator {
  constructor(options = {}) {
    this.options = options;

    // CLI能力定义
    this.cliCapabilities = {
      claude: {
        code: 0.95,
        reasoning: 0.95,
        conversation: 0.90,
        multimodal: 0.85,
        chinese: 0.80,
        available: true
      },
      gemini: {
        multimodal: 0.95,
        conversation: 0.90,
        reasoning: 0.85,
        code: 0.80,
        chinese: 0.85,
        available: true
      },
      qwen: {
        code: 0.85,
        chinese: 0.95,
        conversation: 0.90,
        reasoning: 0.80,
        multimodal: 0.75,
        available: true
      },
      iflow: {
        conversation: 0.85,
        code: 0.80,
        reasoning: 0.75,
        chinese: 0.90,
        multimodal: 0.70,
        available: true
      },
      qodercli: {
        code: 0.85,
        conversation: 0.80,
        reasoning: 0.75,
        chinese: 0.85,
        multimodal: 0.70,
        available: true
      },
      codebuddy: {
        code: 0.90,
        conversation: 0.85,
        reasoning: 0.80,
        chinese: 0.80,
        multimodal: 0.75,
        available: true
      }
    };

    // 负载统计
    this.loadStats = new Map();
  }

  /**
   * 选择最佳CLI
   */
  async selectBestCLI(task) {
    // 分析任务特征
    const features = this.analyzeTaskFeatures(task);

    console.log('Task features:', features);

    // CLI能力匹配
    const candidates = this.matchCLICapabilities(features);

    console.log('Matched CLIs:', candidates);

    // 负载均衡
    const selected = this.loadBalanceSelect(candidates);

    console.log('Selected CLI:', selected);

    return selected;
  }

  /**
   * 分析任务特征
   */
  analyzeTaskFeatures(task) {
    const description = (task.description || '').toLowerCase();

    return {
      requiresCode: this.containsCode(description),
      requiresMultimodal: task.originalFormat === 'image' || task.originalFormat === 'voice',
      requiresChinese: this.isChinese(description),
      requiresReasoning: this.isComplexReasoning(description),
      requiresConversation: this.isConversation(task),
      complexity: this.estimateComplexity(description)
    };
  }

  /**
   * 检测是否包含代码
   */
  containsCode(text) {
    const codePatterns = [
      /\b(function|class|const|let|var|import|export|if|for|while)\b/,
      /\b(写|创建|生成|实现).{0,5}(代码|程序|函数|类|脚本)/,
      /\b(code|function|method|algorithm|implementation)\b/,
      /[{}();]/
    ];

    return codePatterns.some(pattern => pattern.test(text));
  }

  /**
   * 检测是否为中文
   */
  isChinese(text) {
    const chinesePattern = /[\u4e00-\u9fa5]/;
    return chinesePattern.test(text);
  }

  /**
   * 检测是否需要复杂推理
   */
  isComplexReasoning(text) {
    const reasoningKeywords = [
      '分析', '设计', '架构', '优化', '重构',
      'analyze', 'design', 'architecture', 'optimize', 'refactor',
      '为什么', 'how', 'why', 'explain', '原因'
    ];

    return reasoningKeywords.some(kw => text.includes(kw));
  }

  /**
   * 检测是否为对话
   */
  isConversation(task) {
    // 如果是交互式任务，或者描述很短，可能是对话
    return task.interactive || (task.description && task.description.length < 20);
  }

  /**
   * 估算复杂度
   */
  estimateComplexity(text) {
    // 基于长度和关键词估算复杂度
    let complexity = 1;

    if (text.length > 100) complexity += 1;
    if (text.length > 200) complexity += 1;
    if (text.length > 500) complexity += 2;

    const complexKeywords = ['实现', '开发', '设计', '系统', '框架', '架构'];
    const hasComplexKeyword = complexKeywords.some(kw => text.includes(kw));
    if (hasComplexKeyword) complexity += 2;

    return Math.min(complexity, 10);
  }

  /**
   * CLI能力匹配
   */
  matchCLICapabilities(features) {
    const candidates = [];

    for (const [cliName, capabilities] of Object.entries(this.cliCapabilities)) {
      if (!capabilities.available) continue;

      // 计算匹配分数
      let score = 0;

      if (features.requiresCode) score += capabilities.code * 2;
      if (features.requiresMultimodal) score += capabilities.multimodal * 2;
      if (features.requiresChinese) score += capabilities.chinese * 1.5;
      if (features.requiresReasoning) score += capabilities.reasoning * 2;
      if (features.requiresConversation) score += capabilities.conversation;

      // 基础分数
      score += 1;

      // 复杂度加成
      score += capabilities.reasoning * (features.complexity / 10);

      candidates.push({
        name: cliName,
        score: score,
        capabilities: capabilities
      });
    }

    // 按分数排序
    candidates.sort((a, b) => b.score - a.score);

    return candidates;
  }

  /**
   * 负载均衡选择
   */
  loadBalanceSelect(candidates) {
    if (candidates.length === 0) {
      return 'claude'; // 默认使用claude
    }

    // 获取当前负载
    const loads = new Map();
    for (const [cli, count] of this.loadStats.entries()) {
      loads.set(cli, count);
    }

    // 在前3名候选CLI中选择负载最低的
    const topCandidates = candidates.slice(0, 3);

    let selected = topCandidates[0];
    let minLoad = Infinity;

    for (const candidate of topCandidates) {
      const load = loads.get(candidate.name) || 0;
      if (load < minLoad) {
        minLoad = load;
        selected = candidate;
      }
    }

    // 增加选中CLI的负载计数
    this.loadStats.set(selected.name, (this.loadStats.get(selected.name) || 0) + 1);

    return selected.name;
  }

  /**
   * 更新CLI可用性
   */
  updateCLIAvailability(cliName, available) {
    if (this.cliCapabilities[cliName]) {
      this.cliCapabilities[cliName].available = available;
    }
  }

  /**
   * 减少CLI负载计数
   */
  decrementCLILoad(cliName) {
    const currentLoad = this.loadStats.get(cliName) || 0;
    if (currentLoad > 0) {
      this.loadStats.set(cliName, currentLoad - 1);
    }
  }

  /**
   * 获取CLI统计信息
   */
  getCLIStats() {
    const stats = {};

    for (const [cliName, capabilities] of Object.entries(this.cliCapabilities)) {
      stats[cliName] = {
        available: capabilities.available,
        currentLoad: this.loadStats.get(cliName) || 0,
        capabilities: capabilities
      };
    }

    return stats;
  }
}

module.exports = CLICoordinator;
