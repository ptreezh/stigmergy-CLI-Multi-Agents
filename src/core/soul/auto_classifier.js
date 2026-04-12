/**
 * AutoClassifier - 自动分类器
 * 基于内容分析自动判断教训的作用域（全局 vs 项目级）
 */

class AutoClassifier {
  /**
   * 初始化自动分类器
   */
  constructor(options = {}) {
    this.globalThreshold = options.globalThreshold || 0.7;
    this.reviewThreshold = options.reviewThreshold || 0.5;
  }

  /**
   * 分类教训
   * @param {Object} lesson - 教训对象
   * @returns {Promise<Object>} 分类结果 {scope, confidence, signals, needsReview}
   */
  async classify(lesson) {
    // 1. 检测特征信号
    const signals = this.detectSignals(lesson);
    
    // 2. 计算全局分数
    const score = this.calculateGlobalScore(signals);
    
    // 3. 判断作用域
    let scope, needsReview;
    if (score >= this.globalThreshold) {
      scope = 'global';
      needsReview = false;
    } else if (score >= this.reviewThreshold) {
      scope = 'project'; // 倾向项目级但需要审核
      needsReview = true;
    } else {
      scope = 'project';
      needsReview = false;
    }

    return {
      scope,
      confidence: score,
      signals,
      needsReview,
      reason: this._explainClassification(score, signals)
    };
  }

  /**
   * 检测特征信号
   */
  detectSignals(lesson) {
    const text = this._extractText(lesson);
    const textLower = text.toLowerCase();

    return {
      // 全局信号
      hasUniversalPrinciple: this._hasUniversalPrinciple(textLower),
      hasCodePattern: this._hasCodePattern(textLower),
      hasProcessImprovement: this._hasProcessImprovement(textLower),
      
      // 项目级信号
      hasProjectSpecificContext: this._hasProjectSpecificContext(textLower),
      hasTechStackDependency: this._hasTechStackDependency(textLower),
      hasBusinessLogicDependency: this._hasBusinessLogicDependency(textLower)
    };
  }

  /**
   * 计算全局分数 (0-1)
   */
  calculateGlobalScore(signals) {
    let score = 0.5; // 基准分数

    // 全局信号加分
    if (signals.hasUniversalPrinciple) score += 0.2;
    if (signals.hasCodePattern) score += 0.1;
    if (signals.hasProcessImprovement) score += 0.1;

    // 项目级信号减分（更强的权重）
    if (signals.hasProjectSpecificContext) score -= 0.3;
    if (signals.hasTechStackDependency) score -= 0.2;
    if (signals.hasBusinessLogicDependency) score -= 0.2;

    // 限制在0-1范围
    return Math.max(0, Math.min(1, score));
  }

  // 私有方法 - 全局信号检测

  _hasUniversalPrinciple(text) {
    const universalPatterns = [
      /测试|tdd|测试驱动|覆盖率/i,
      /阶段性|交付|提交|code review/i,
      /重构|模块化|解耦|抽象/i,
      /文档|注释|可读性/i,
      /性能|优化|缓存|索引/i,
      /安全|验证|授权|加密/i,
      /错误处理|异常|容错/i,
      /质量.*提升|风险.*可控|可维护/i
    ];

    return universalPatterns.some(pattern => pattern.test(text));
  }

  _hasCodePattern(text) {
    const codePatterns = [
      /函数|方法|类|接口|设计模式/i,
      /算法|数据结构|复杂度/i,
      /api|sdk|库|框架/i,
      /代码.*规范|命名.*规范/i
    ];

    return codePatterns.some(pattern => pattern.test(text));
  }

  _hasProcessImprovement(text) {
    const processPatterns = [
      /流程|工作流|协作|沟通/i,
      /计划|估算|优先级/i,
      /自动化|ci\/cd|部署|发布/i,
      /监控|告警|日志/i
    ];

    return processPatterns.some(pattern => pattern.test(text));
  }

  // 私有方法 - 项目级信号检测

  _hasProjectSpecificContext(text) {
    const projectPatterns = [
      /本项目|当前项目|我们项目|本系统/i,
      /特定|专用于|定制化/i,
      /客户.*需求|业务.*场景|运营.*策略/i,
      /第.*期|v\d+\.\d+|milestone/i
    ];

    return projectPatterns.some(pattern => pattern.test(text));
  }

  _hasTechStackDependency(text) {
    const techPatterns = [
      /react\s*\d+|vue\s*\d+|angular\s*\d+/i,
      /spring\s*boot|django|rails|express/i,
      /mysql|mongodb|redis|postgresql/i,
      /aws|azure|gcp|阿里云|腾讯云/i,
      /kubernetes|docker|jenkins/i,
      /webpack|vite|babel|typescript/i
    ];

    return techPatterns.some(pattern => pattern.test(text));
  }

  _hasBusinessLogicDependency(text) {
    const businessPatterns = [
      /支付|订单|库存|物流|电商/i,
      /用户.*画像|推荐.*算法|广告.*投放/i,
      /风控|反欺诈|合规|审计/i,
      /秒杀|促销|优惠券|会员/i
    ];

    return businessPatterns.some(pattern => pattern.test(text));
  }

  // 辅助方法

  _extractText(lesson) {
    return [
      lesson.title,
      lesson.scene,
      lesson.practice,
      lesson.effect,
      lesson.problem,
      lesson.rootCause,
      lesson.avoid,
      lesson.content
    ].filter(Boolean).join(' ');
  }

  _explainClassification(score, signals) {
    const reasons = [];

    if (signals.hasUniversalPrinciple) {
      reasons.push('包含普适性原则');
    }
    if (signals.hasProjectSpecificContext) {
      reasons.push('包含项目特定上下文');
    }
    if (signals.hasTechStackDependency) {
      reasons.push('依赖特定技术栈');
    }
    if (signals.hasBusinessLogicDependency) {
      reasons.push('依赖业务逻辑');
    }

    return `置信度: ${(score * 100).toFixed(0)}%. ${reasons.join(', ') || '无明显特征'}`;
  }
}

module.exports = AutoClassifier;
